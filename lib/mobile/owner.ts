import {runtimeCategoryExampleVideo} from "../category-starter-runtime";
import {getShowroomInsights} from "../account-health";
import {getDashboardAttention} from "../dashboard-attention";
import type { SessionUser } from "../types";
import { runtimeCatalogByBusinessId } from "../catalog-runtime";
import { initialBusinessProfile } from "../business-profile";
import { readOwnerPage } from "../owner-page-service";
import { ownerPagePort } from "../owner-page-runtime";
import { pagePublicationPort } from "../owner-page-publication-runtime";
import { firstPublicationIssues } from "../publication-readiness-runtime";
import { accountContactPort } from "../account-contact-runtime";
import { shopDto } from "./projections";
import { MobileError, boundedBody } from "./http";
import { executeBasicProductUpkeep } from "../product-upkeep";
import { runtimeProductUpkeepPort } from "../product-upkeep-runtime";
import { stageTenantProductImage } from "../tenant-product-media";
import {
  MAX_PRODUCT_UPLOAD_BYTES,
  parseProductMedia,
  productMedia,
} from "../product-media";
import type { StagedImage } from "../media";
import {isPublicProduct} from '../offerings';
export async function ownerHome(actor: SessionUser & { business_id: number }) {
  const [catalog, draft, publication, contacts] = await Promise.all([
    runtimeCatalogByBusinessId(actor.business_id, true),
    readOwnerPage(ownerPagePort, actor, actor.business_id),
    pagePublicationPort.latest(actor.business_id),
    accountContactPort.read(actor.id),
  ]);
  if (!catalog) throw new MobileError("Business not found.", 404);
  const content = draft?.content || initialBusinessProfile(catalog);
  const [insights,attention]=await Promise.all([getShowroomInsights(actor,actor.business_id),getDashboardAttention(actor,actor.business_id)]);
  return {
    user: {
      name: actor.name,
      email: actor.email,
      phone: contacts?.account_phone || "",
    },
    shop: shopDto(catalog, content, true),
    exampleVideoRef: await runtimeCategoryExampleVideo(actor.business_id),
    activity:{visitsTotal:insights.totalVisitors,visits30Days:insights.last30Days,newInquiries:Number(attention.customerInquiries||0),products:catalog.products.filter(p=>Boolean(p.is_published)&&isPublicProduct(p)).length},
    draft: draft ? { version: draft.version, content, assistanceEnabled: draft.assistanceEnabled } : null,
    publicationRevision: publication?.revision || 0,
    issues:
      catalog.business.status === "active"
        ? []
        : await firstPublicationIssues(actor.business_id, content),
  };
}
export function allowFields(body: Record<string, unknown>, fields: string[]) {
  if (Object.keys(body).some((k) => !fields.includes(k)))
    throw new MobileError("Unsupported fields.");
}
export async function saveNativeProduct(
  request: Request,
  actor: SessionUser & { business_id: number },
  id: number | null,
) {
  const type = request.headers.get("content-type") || "";
  if (!type.startsWith("multipart/form-data;"))
    throw new MobileError("Choose product details and photos.", 415);
  const form = await new Response(
    await boundedBody(request, MAX_PRODUCT_UPLOAD_BYTES + 32000),
    { headers: { "Content-Type": type } },
  ).formData();
  if ([...form.keys()].some((k) => !["details", "images"].includes(k)))
    throw new MobileError("Unsupported fields.");
  let b: Record<string, unknown>;
  try {
    b = JSON.parse(String(form.get("details")));
    if (!b || Array.isArray(b) || typeof b !== "object") throw Error();
  } catch {
    throw new MobileError("Invalid product details.");
  }
  allowFields(b, [
    "name",
    "description",
    "priceMinor",
    "offeringKind",
    "availability",
    "expectedContentVersion",
    "idempotencyKey",
    "isPublished",
    "media",
  ]);
  const catalog = await runtimeCatalogByBusinessId(actor.business_id, true);
  if (!catalog) throw new MobileError("Business not found.", 404);
  const old = id ? catalog.products.find((p) => p.id === id) : undefined;
  if (id && !old) throw new MobileError("Product not found.", 404);
  const uploads: StagedImage[] = [];
  try {
    const files = form.getAll("images");
    if (files.length > 8) throw new MobileError("Use up to 8 photos.");
    for (const file of files) {
      const image = await stageTenantProductImage(
        actor,
        actor.business_id,
        file,
      );
      if (!image) throw new MobileError("Choose a valid photo.");
      uploads.push(image);
    }
    const media = parseProductMedia([
      ...(Array.isArray(b.media) ? b.media : old ? productMedia(old) : []),
      ...uploads.map((s) => ({ kind: "image", ref: s.imageRef })),
    ]);
    return await executeBasicProductUpkeep(
      runtimeProductUpkeepPort(),
      actor,
      {
        kind: id ? "update" : "create",
        businessId: actor.business_id,
        productId: id,
        expectedContentVersion: b.expectedContentVersion,
        idempotencyKey: b.idempotencyKey,
        name: b.name,
        description: b.description,
        priceMinor: b.priceMinor,
        offeringKind: b.offeringKind,
        availability: b.availability || "available",
        isPublished: b.isPublished,
        media,
        preserveMetadata: true,
        updateListingState: true,
        quantityMode: old?.quantity_mode || "optional",
        capacitySummary: old?.capacity_summary || "",
        minimumOrderSummary: old?.minimum_order_summary || "",
        leadTimeSummary: old?.lead_time_summary || "",
        quantityUnit: old?.quantity_unit || "",
        highlights: [],
        videoRef: old?.video_ref || "",
        categoryId: old?.category_id || null,
        imageAction: "keep",
        serviceNote: "",
      },
      null,
      uploads,
    );
  } catch (error) {
    await Promise.all(uploads.map((u) => u.discard()));
    throw error;
  }
}
