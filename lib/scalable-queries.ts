import { runtimeAll, runtimeGet } from "./runtime-sql";
import {
  likePattern,
  normalizePageRequest,
  pageResult,
  pageWindow,
  PUBLIC_PAGE_SIZE,
  WORKSPACE_PAGE_SIZE,
  type PageResult,
} from "./pagination";
import type { Business, Product } from "./types";

type PageInput = {
  page?: unknown;
  q?: unknown;
};

type QueryValue = string | number | null;
const ADMIN_DIRECTORY_PAGE_SIZE = 6;

async function total(sql: string, params: QueryValue[]) {
  return Number((await runtimeGet<{ total: number }>(sql, params))?.total || 0);
}

async function pageRows<T>(
  countSql: string,
  rowsSql: string,
  params: QueryValue[],
  input: PageInput,
  pageSize = WORKSPACE_PAGE_SIZE,
): Promise<PageResult<T>> {
  const request = normalizePageRequest(
    { page: input.page, search: input.q, pageSize },
    pageSize,
  );
  const totalItems = await total(countSql, params);
  const window = pageWindow(totalItems, request);
  const items = await runtimeAll<T>(rowsSql, [...params, window.limit, window.offset]);
  return pageResult(items, totalItems, request);
}

function searchClause(
  search: string,
  columns: string[],
  params: QueryValue[],
  extra: string[] = [],
) {
  if (!search) return "";
  const pattern = likePattern(search);
  const clauses = columns.map((column) => `lower(COALESCE(${column},'')) LIKE ? ESCAPE '\\'`);
  for (let index = 0; index < clauses.length + extra.length; index += 1) {
    params.push(pattern);
  }
  return ` AND (${[...clauses, ...extra].join(" OR ")})`;
}

export type PublicShowroomRow = {
  id: number;
  handle: string;
  name: string;
  tagline: string;
  imageUrl: string;
  industryKey: string;
  industry: string;
  featured: boolean;
};

export async function listPublicIndustries() {
  const rows = await runtimeAll<{ industry_key: string; label: string }>(`
    SELECT industry.key industry_key,industry.label
    FROM discovery_industries industry
    WHERE industry.active=1 AND EXISTS(
      SELECT 1
      FROM business_industries membership
      JOIN businesses b ON b.id=membership.business_id
      JOIN business_discovery_profiles profile ON profile.business_id=b.id
      WHERE membership.industry_key=industry.key
        AND b.status='active'
        AND profile.is_excluded=0
        AND profile.approved_at>0
    )
    ORDER BY industry.position,industry.key
  `);
  return rows.map(({ industry_key: key, label }) => ({
    key,
    label,
  }));
}

export async function listPublicShowrooms(input: PageInput & {
  industry?: unknown;
  sort?: unknown;
}) {
  const request = normalizePageRequest(
    { page: input.page, search: input.q, pageSize: PUBLIC_PAGE_SIZE },
    PUBLIC_PAGE_SIZE,
  );
  const industry = String(input.industry ?? "").trim();
  const sort = input.sort === "handle" ? "handle" : "name";
  const industryExpression = `COALESCE((
    SELECT membership.industry_key
    FROM business_industries membership
    JOIN discovery_industries industry ON industry.key=membership.industry_key
    WHERE membership.business_id=b.id AND industry.active=1
    ORDER BY industry.position,industry.key
    LIMIT 1
  ),'all')`;
  const industryLabelExpression = `COALESCE((
    SELECT industry.label
    FROM business_industries membership
    JOIN discovery_industries industry ON industry.key=membership.industry_key
    WHERE membership.business_id=b.id AND industry.active=1
    ORDER BY industry.position,industry.key
    LIMIT 1
  ),'All industries')`;
  const params: QueryValue[] = [];
  let where = " WHERE b.status='active' AND p.is_excluded=0 AND p.approved_at>0";
  if (industry && industry !== "all") {
    where += ` AND ${industryExpression}=?`;
    params.push(industry);
  }
  where += searchClause(
    request.search,
    ["b.name", "b.handle", "b.tagline", "b.description", "b.hero_title", "b.hero_subtitle"],
    params,
    [
      `EXISTS(
        SELECT 1 FROM categories c
        WHERE c.business_id=b.id AND c.is_active=1
          AND lower(c.name) LIKE ? ESCAPE '\\'
      )`,
      `EXISTS(
        SELECT 1 FROM products product
        LEFT JOIN categories pc ON pc.id=product.category_id
        WHERE product.business_id=b.id AND product.is_published=1
          AND lower(
            product.name || ' ' || product.description || ' ' ||
            product.eyebrow || ' ' || COALESCE(pc.name,'') || ' ' ||
            product.capacity_summary || ' ' || product.minimum_order_summary ||
            ' ' || product.lead_time_summary
          ) LIKE ? ESCAPE '\\'
      )`,
    ],
  );
  const totalItems = await total(
    `SELECT COUNT(*) total
     FROM businesses b
     JOIN business_discovery_profiles p ON p.business_id=b.id${where}`,
    params,
  );
  const window = pageWindow(totalItems, request);
  const order = sort === "handle" ? "lower(b.handle),b.id" : "lower(b.name),b.id";
  const rows = await runtimeAll<{
    id: number;
    handle: string;
    name: string;
    tagline: string;
    image_url: string;
    industry_key: string;
    industry_label: string;
    featured: number;
  }>(`
    SELECT b.id,b.handle,b.name,b.tagline,
      COALESCE(NULLIF(b.hero_image_path,''),b.logo_path,'') image_url,
      ${industryExpression} industry_key,
      ${industryLabelExpression} industry_label,
      COALESCE(s.active,0) featured
    FROM businesses b
    JOIN business_discovery_profiles p ON p.business_id=b.id
    LEFT JOIN discovery_sponsorships s ON s.business_id=b.id AND s.active=1
    ${where}
    ORDER BY COALESCE(s.active,0) DESC,${order}
    LIMIT ? OFFSET ?
  `, [...params, window.limit, window.offset]);
  return pageResult<PublicShowroomRow>(
    rows.map((item) => ({
      id: item.id,
      handle: item.handle,
      name: item.name,
      tagline: item.tagline,
      imageUrl: item.image_url,
      industryKey: item.industry_key,
      industry: item.industry_label,
      featured: Boolean(item.featured),
    })),
    totalItems,
    request,
  );
}

export type AdminBusinessRow = Business & {
  client_id: number | null;
  client_name: string | null;
  client_email: string | null;
  client_count: number;
  request_count: number;
  marketplace_city: string | null;
  marketplace_region: string | null;
  marketplace_approved_at: number | null;
  marketplace_excluded: number;
  marketplace_sponsored: number;
};

export async function listBusinessesPage(input: PageInput & { status?: unknown }) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const status = ["active", "draft", "suspended"].includes(String(input.status))
    ? String(input.status)
    : "";
  const params: QueryValue[] = [];
  let where = " WHERE 1=1";
  if (status) {
    where += " AND b.status=?";
    params.push(status);
  }
  where += searchClause(request.search, ["b.name", "b.handle"], params, [
    `EXISTS(
      SELECT 1 FROM users su
      JOIN user_access_profiles sp ON sp.user_id=su.id
      WHERE su.business_id=b.id AND sp.access_role='client'
        AND lower(su.email) LIKE ? ESCAPE '\\'
    )`,
    `EXISTS(
      SELECT 1 FROM users su
      JOIN user_access_profiles sp ON sp.user_id=su.id
      WHERE su.business_id=b.id AND sp.access_role='client'
        AND lower(su.name) LIKE ? ESCAPE '\\'
    )`,
    `EXISTS(
      SELECT 1 FROM business_discovery_profiles location
      WHERE location.business_id=b.id AND lower(COALESCE(location.city,'')) LIKE ? ESCAPE '\\'
    )`,
    `EXISTS(
      SELECT 1 FROM business_discovery_profiles location
      WHERE location.business_id=b.id AND lower(COALESCE(location.zone,'')) LIKE ? ESCAPE '\\'
    )`,
    `EXISTS(
      SELECT 1 FROM business_discovery_profiles location
      WHERE location.business_id=b.id AND lower(COALESCE(location.region,'')) LIKE ? ESCAPE '\\'
    )`,
  ]);
  return pageRows<AdminBusinessRow>(
    `SELECT COUNT(*) total FROM businesses b${where}`,
    `SELECT b.*,
      (
        SELECT u.id FROM users u
        JOIN user_access_profiles profile ON profile.user_id=u.id
        WHERE u.business_id=b.id AND profile.access_role='client'
        ORDER BY u.id LIMIT 1
      ) client_id,
      (
        SELECT u.name FROM users u
        JOIN user_access_profiles profile ON profile.user_id=u.id
        WHERE u.business_id=b.id AND profile.access_role='client'
        ORDER BY u.id LIMIT 1
      ) client_name,
      (
        SELECT u.email FROM users u
        JOIN user_access_profiles profile ON profile.user_id=u.id
        WHERE u.business_id=b.id AND profile.access_role='client'
        ORDER BY u.id LIMIT 1
      ) client_email,
      (SELECT COUNT(*) FROM users u JOIN user_access_profiles profile ON profile.user_id=u.id WHERE u.business_id=b.id AND profile.access_role='client') client_count,
      (SELECT COUNT(*) FROM service_requests r WHERE r.business_id=b.id) request_count,
      (SELECT city FROM business_discovery_profiles location WHERE location.business_id=b.id) marketplace_city,
      (SELECT region FROM business_discovery_profiles location WHERE location.business_id=b.id) marketplace_region,
      (SELECT approved_at FROM business_discovery_profiles location WHERE location.business_id=b.id) marketplace_approved_at,
      COALESCE((SELECT is_excluded FROM business_discovery_profiles location WHERE location.business_id=b.id),0) marketplace_excluded,
      COALESCE((SELECT active FROM discovery_sponsorships sponsor WHERE sponsor.business_id=b.id),0) marketplace_sponsored
     FROM businesses b${where}
     ORDER BY CASE b.status WHEN 'draft' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
       lower(b.name),b.id
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
    ADMIN_DIRECTORY_PAGE_SIZE,
  );
}

export async function listBusinessClientAccess(businessId: number) {
  if (!Number.isInteger(businessId) || businessId < 1) return [];
  return runtimeAll<{
    id: number;
    name: string;
    email: string;
    must_change_password: number;
  }>(`
    SELECT u.id,u.name,u.email,u.must_change_password
    FROM users u
    JOIN user_access_profiles profile ON profile.user_id=u.id
    WHERE u.business_id=? AND profile.access_role='client'
    ORDER BY lower(u.name),u.id
    LIMIT 20
  `, [businessId]);
}

export type ManagedClientRow = {
  id: number;
  email: string;
  name: string;
  business_id: number;
  business_name: string;
  business_status: string;
  request_type: "onboarding" | "change";
};

export async function listManagedClientsPage(input: PageInput) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const params: QueryValue[] = [];
  const search = searchClause(
    request.search,
    ["u.name", "u.email", "b.name", "b.handle"],
    params,
  );
  const from = `
    FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    JOIN businesses b ON b.id=u.business_id
    WHERE p.access_role='client'${search}`;
  return pageRows<ManagedClientRow>(
    `SELECT COUNT(*) total ${from}`,
    `SELECT u.id,u.email,u.name,u.business_id,b.name business_name,
      b.status business_status,
      CASE WHEN b.status='draft' AND b.content_version=1
        AND NOT EXISTS(
          SELECT 1 FROM published_catalog_versions v WHERE v.business_id=b.id
        )
        THEN 'onboarding' ELSE 'change' END request_type
     ${from}
     ORDER BY lower(b.name),lower(u.name),u.id
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
    ADMIN_DIRECTORY_PAGE_SIZE,
  );
}

export async function getManagedClient(userId: number) {
  const client = await runtimeGet<ManagedClientRow>(`
    SELECT u.id,u.email,u.name,u.business_id,b.name business_name,
      b.status business_status,
      CASE WHEN b.status='draft' AND b.content_version=1
        AND NOT EXISTS(
          SELECT 1 FROM published_catalog_versions v WHERE v.business_id=b.id
        )
        THEN 'onboarding' ELSE 'change' END request_type
    FROM users u
    JOIN user_access_profiles p ON p.user_id=u.id
    JOIN businesses b ON b.id=u.business_id
    WHERE u.id=? AND p.access_role='client'
  `, [userId]);
  return client ? { ...client } : undefined;
}

export type StaffRow = {
  id: number;
  email: string;
  name: string;
  access_role: "team_member" | "operations_manager";
  must_change_password: number;
  active_assignments: number;
  open_requests: number;
};

export async function listStaffPage(input: PageInput & { role?: unknown }) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const role = ["team_member", "operations_manager"].includes(String(input.role))
    ? String(input.role)
    : "";
  const params: QueryValue[] = [];
  let where = " WHERE p.access_role IN ('team_member','operations_manager')";
  if (role) {
    where += " AND p.access_role=?";
    params.push(role);
  }
  where += searchClause(request.search, ["u.name", "u.email"], params);
  const from = `FROM users u JOIN user_access_profiles p ON p.user_id=u.id${where}`;
  return pageRows<StaffRow>(
    `SELECT COUNT(*) total ${from}`,
    `SELECT u.id,u.email,u.name,u.must_change_password,p.access_role,
      (
        SELECT COUNT(*) FROM staff_business_assignments a
        WHERE a.user_id=u.id AND a.active=1
      ) active_assignments,
      (
        SELECT COUNT(*) FROM service_requests r
        WHERE r.assigned_user_id=u.id
          AND r.status NOT IN ('completed','rejected','cancelled')
      ) open_requests
     ${from}
     ORDER BY p.access_role,lower(u.name),u.id
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
    ADMIN_DIRECTORY_PAGE_SIZE,
  );
}

export async function listTeamMemberChoices(search: unknown, selectedId?: number | null) {
  const value = normalizePageRequest({ search }).search;
  const params: QueryValue[] = [];
  const choices: string[] = [];
  if (value) {
    const pattern = likePattern(value);
    choices.push(
      "lower(u.name) LIKE ? ESCAPE '\\'",
      "lower(u.email) LIKE ? ESCAPE '\\'",
    );
    params.push(pattern, pattern);
  }
  if (selectedId) {
    choices.push("u.id=?");
    params.push(selectedId);
  }
  const where = `WHERE p.access_role='team_member'${
    choices.length ? ` AND (${choices.join(" OR ")})` : ""
  }`;
  return runtimeAll<{
    id: number;
    email: string;
    name: string;
    must_change_password: number;
    access_role: "team_member";
  }>(`
    SELECT u.id,u.email,u.name,u.must_change_password,p.access_role
    FROM users u JOIN user_access_profiles p ON p.user_id=u.id
    ${where}
    ORDER BY u.id=? DESC,lower(u.name),u.id
    LIMIT 20
  `, [...params, selectedId || 0]);
}

export async function listAssignedBusinessesPage(userId: number, input: PageInput) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const params: QueryValue[] = [userId];
  const search = searchClause(request.search, ["b.name", "b.handle"], params);
  const from = `
    FROM businesses b
    JOIN staff_business_assignments a ON a.business_id=b.id
    WHERE a.user_id=? AND a.active=1${search}`;
  return pageRows<Business>(
    `SELECT COUNT(*) total ${from}`,
    `SELECT b.* ${from}
     ORDER BY lower(b.name),b.id
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
  );
}

export async function listProductsPage(
  businessId: number,
  input: PageInput,
  includeDrafts = true,
) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const params: QueryValue[] = [businessId];
  let where = " WHERE p.business_id=?";
  if (!includeDrafts) where += " AND p.is_published=1";
  where += searchClause(
    request.search,
    [
      "p.name",
      "p.description",
      "p.eyebrow",
      "category.name",
      "p.availability",
      "p.offering_kind",
      "p.capacity_summary",
    ],
    params,
  );
  const from = `
    FROM products p
    LEFT JOIN categories category ON category.id=p.category_id${where}`;
  return pageRows<Product>(
    `SELECT COUNT(*) total ${from}`,
    `SELECT p.*,category.name category_name ${from}
     ORDER BY p.sort_order,lower(p.name),p.id
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
  );
}

export type InquiryListItem = {
  id: number;
  product_name_snapshot: string;
  quantity: number | null;
  quantity_intent: string;
  options_json: string;
};

export type InquiryListRow = {
  id: number;
  business_id: number;
  customer_name: string;
  contact_method: string;
  contact: string;
  note: string;
  status: string;
  created_at: string;
  item_count: number;
  items: InquiryListItem[];
};

export async function listInquiriesPage(
  businessId: number,
  input: PageInput & { status?: unknown },
) {
  const request = normalizePageRequest({ page: input.page, search: input.q });
  const statuses = ["new", "contacted", "confirmed", "closed", "cancelled"];
  const status = statuses.includes(String(input.status)) ? String(input.status) : "";
  const params: QueryValue[] = [businessId];
  let where = " WHERE i.business_id=?";
  if (status) {
    where += " AND i.status=?";
    params.push(status);
  }
  where += searchClause(
    request.search,
    ["i.customer_name", "i.contact", "i.note"],
    params,
    [
      `EXISTS(
        SELECT 1 FROM inquiry_items search_item
        WHERE search_item.inquiry_id=i.id
          AND lower(search_item.product_name_snapshot) LIKE ? ESCAPE '\\'
      )`,
    ],
  );
  const result = await pageRows<Omit<InquiryListRow, "items">>(
    `SELECT COUNT(*) total FROM inquiries i${where}`,
    `SELECT i.*,
      (SELECT COUNT(*) FROM inquiry_items count_item WHERE count_item.inquiry_id=i.id) item_count
     FROM inquiries i${where}
     ORDER BY i.created_at DESC,i.id DESC
     LIMIT ? OFFSET ?`,
    params,
    { page: request.page, q: request.search },
  );
  const ids = result.items.map((row) => row.id);
  const itemRows = ids.length
    ? await runtimeAll<InquiryListItem & { inquiry_id: number }>(
        `SELECT inquiry_id,id,product_name_snapshot,quantity,quantity_intent,options_json
         FROM inquiry_items WHERE inquiry_id IN (${ids.map(() => "?").join(",")})
         ORDER BY id`,
        ids,
      )
    : [];
  const itemsByInquiry = new Map<number, InquiryListItem[]>();
  for (const { inquiry_id: inquiryId, ...item } of itemRows) {
    const items = itemsByInquiry.get(inquiryId) || [];
    items.push(item);
    itemsByInquiry.set(inquiryId, items);
  }
  return {
    ...result,
    items: result.items.map((row) => ({ ...row, items: itemsByInquiry.get(row.id) || [] })),
  } satisfies PageResult<InquiryListRow>;
}

export async function getBusinessActivityCounts(businessId: number) {
  return runtimeGet<{
    inquiries: number;
    offerings: number;
    requests: number;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM inquiries WHERE business_id=?) inquiries,
      (SELECT COUNT(*) FROM products WHERE business_id=?) offerings,
      (SELECT COUNT(*) FROM service_requests WHERE business_id=?) requests
  `, [businessId, businessId, businessId]) as Promise<{
    inquiries: number;
    offerings: number;
    requests: number;
  }>;
}

export async function getPlatformCounts() {
  return runtimeGet<{
    businesses: number;
    clients: number;
    staff: number;
    open_requests: number;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM businesses) businesses,
      (SELECT COUNT(*) FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='client') clients,
      (SELECT COUNT(*) FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role IN ('team_member','operations_manager')) staff,
      (SELECT COUNT(*) FROM service_requests WHERE status NOT IN ('completed','rejected','cancelled')) open_requests
  `) as Promise<{
    businesses: number;
    clients: number;
    staff: number;
    open_requests: number;
  }>;
}
