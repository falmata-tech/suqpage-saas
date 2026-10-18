import { productMedia } from "./product-media";
import { normalizeQuantityMode } from "./offerings";
import { parseOfferingHighlightsJson } from "./offering-presentation";
import type { PostgresTransactionRunner } from "./postgres-runtime";
import type {
  Business,
  Catalog,
  Category,
  Collection,
  OptionGroup,
  OptionValue,
  Product,
  SessionUser,
} from "./types";

type InquiryRow = Record<string, unknown> & { items?: Record<string, unknown>[] };

export class PostgresCatalogRepository {
  constructor(private readonly runner: PostgresTransactionRunner) {}

  async getBusinessByHandle(handle: string): Promise<Business | undefined> {
    const found = await this.runner.query<Business>(`
      SELECT b.* FROM businesses b
      WHERE b.id=(SELECT business_id FROM business_handles WHERE handle=lower(?)) AND b.status='active'
    `, [handle.replace(/^@/, "")]);
    return found.rows[0];
  }

  async getBusinessByHandleAny(handle: string): Promise<Business | undefined> {
    const found = await this.runner.query<Business>(
      "SELECT * FROM businesses WHERE id=(SELECT business_id FROM business_handles WHERE handle=lower(?))",
      [handle.replace(/^@/, "")],
    );
    return found.rows[0];
  }

  async getBusinessById(id: number): Promise<Business | undefined> {
    const found = await this.runner.query<Business>("SELECT * FROM businesses WHERE id=?", [id]);
    return found.rows[0];
  }

  async hasRetainedPublication(businessId: number) {
    const found = await this.runner.query(
      "SELECT 1 FROM published_catalog_versions WHERE business_id=? LIMIT 1",
      [businessId],
    );
    return found.rows.length > 0;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return (await this.runner.query<Business>("SELECT * FROM businesses ORDER BY name")).rows;
  }

  async getCatalogByBusinessId(
    businessId: number,
    includeDrafts = false,
    knownBusiness?: Business,
  ): Promise<Catalog | undefined> {
    const business = knownBusiness || await this.getBusinessById(businessId);
    if (!business) return undefined;

    const activeClause = includeDrafts ? "" : "AND is_active=1";
    const publishedClause = includeDrafts ? "" : "AND p.is_published=1 AND p.offering_kind<>'service'";
    // Retire service-only navigation metadata without discarding deliberately
    // empty showroom sections or anything from authorized private management.
    const productSection = (column: "collection_id" | "category_id", alias: string) => includeDrafts ? "" : `AND NOT (
      EXISTS(SELECT 1 FROM products retired WHERE retired.business_id=${alias}.business_id
        AND retired.${column}=${alias}.id AND retired.is_published=1 AND retired.offering_kind='service')
      AND NOT EXISTS(SELECT 1 FROM products physical WHERE physical.business_id=${alias}.business_id
        AND physical.${column}=${alias}.id AND physical.is_published=1 AND physical.offering_kind<>'service')
    )`;
    const [collections, categories, products] = await Promise.all([
      this.runner.query<Collection>(
        `SELECT collection.* FROM collections collection WHERE collection.business_id=? ${activeClause} ${productSection("collection_id", "collection")} ORDER BY sort_order,name`,
        [businessId],
      ),
      this.runner.query<Category>(
        `SELECT category.* FROM categories category WHERE category.business_id=? ${activeClause} ${productSection("category_id", "category")} ORDER BY sort_order,name`,
        [businessId],
      ),
      this.runner.query<Product>(`
        SELECT p.*, c.name collection_name, cat.name category_name
        FROM products p
        LEFT JOIN collections c ON c.id=p.collection_id
        LEFT JOIN categories cat ON cat.id=p.category_id
        WHERE p.business_id=? ${publishedClause}
        ORDER BY p.sort_order,p.name
      `, [businessId]),
    ]);

    const productIds = products.rows.map((product) => product.id);
    const groups = productIds.length
      ? (await this.runner.query<OptionGroup>(
        `SELECT * FROM option_groups WHERE product_id IN (${productIds.map(() => "?").join(",")}) ORDER BY product_id,position,id`,
        productIds,
      )).rows
      : [];
    const groupIds = groups.map((group) => group.id);
    const values = groupIds.length
      ? (await this.runner.query<OptionValue>(
        `SELECT * FROM option_values WHERE option_group_id IN (${groupIds.map(() => "?").join(",")}) ORDER BY option_group_id,id`,
        groupIds,
      )).rows
      : [];
    const valuesByGroup = new Map<number, OptionValue[]>();
    for (const value of values) {
      const existing = valuesByGroup.get(value.option_group_id);
      if (existing) existing.push(value);
      else valuesByGroup.set(value.option_group_id, [value]);
    }
    const groupsByProduct = new Map<number, OptionGroup[]>();
    for (const group of groups) {
      const hydratedGroup = { ...group, values: valuesByGroup.get(group.id) || [] };
      const existing = groupsByProduct.get(group.product_id);
      if (existing) existing.push(hydratedGroup);
      else groupsByProduct.set(group.product_id, [hydratedGroup]);
    }
    const hydratedProducts = products.rows.map((product) => {
      product.media = productMedia(product);
      product.quantity_mode = normalizeQuantityMode(product.quantity_mode);
      product.highlights = parseOfferingHighlightsJson(product.highlights_json);
      product.option_groups = groupsByProduct.get(product.id) || [];
      return product;
    });
    return {
      business,
      collections: collections.rows,
      categories: categories.rows,
      products: hydratedProducts,
    };
  }

  async getCatalogByHandle(handle: string): Promise<Catalog | undefined> {
    const business = await this.getBusinessByHandle(handle);
    return business ? this.getCatalogByBusinessId(business.id, false, business) : undefined;
  }

  async getUserByEmail(
    email: string,
  ): Promise<(SessionUser & { password_hash: string }) | undefined> {
    const found = await this.runner.query<SessionUser & { password_hash: string }>(`
      SELECT u.id,u.email,u.name,u.role,u.business_id,u.password_hash,u.must_change_password,
        agent.queue_scope staff_queue_scope,
        p.access_role
      FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      LEFT JOIN support_agent_settings agent ON agent.user_id=u.id
      WHERE lower(u.email)=lower(?)
    `, [email]);
    return found.rows[0];
  }

  async getUserById(id: number): Promise<SessionUser | undefined> {
    const found = await this.runner.query<SessionUser>(`
      SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,
        agent.queue_scope staff_queue_scope,
        p.access_role
      FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      LEFT JOIN support_agent_settings agent ON agent.user_id=u.id WHERE u.id=?
    `, [id]);
    return found.rows[0];
  }

  async listInquiries(businessId: number): Promise<InquiryRow[]> {
    return (await this.runner.query<InquiryRow>(
      "SELECT i.*,COUNT(ii.id)::int item_count FROM inquiries i LEFT JOIN inquiry_items ii ON ii.inquiry_id=i.id WHERE i.business_id=? GROUP BY i.id ORDER BY i.created_at DESC",
      [businessId],
    )).rows;
  }

  async getInquiry(id: number, businessId: number): Promise<InquiryRow | undefined> {
    const inquiry = (await this.runner.query<InquiryRow>(
      "SELECT * FROM inquiries WHERE id=? AND business_id=?",
      [id, businessId],
    )).rows[0];
    if (!inquiry) return undefined;
    inquiry.items = (await this.runner.query<Record<string, unknown>>(
      "SELECT * FROM inquiry_items WHERE inquiry_id=? ORDER BY id",
      [id],
    )).rows;
    return inquiry;
  }
}
