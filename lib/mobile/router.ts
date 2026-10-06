import { saveNativeBusiness } from "./business";
import { nativeSupportAttachment, nativeSupportReply } from "./support-attachments";
import { revalidatePath } from "next/cache";
import {
  MobileError,
  mobileParse,
  nativeIdentity,
  nativeOwner,
  jsonBody,
  numericId,
  type NativeIdentityPort,
} from "./http";
import { marketDto, mapShopDto, shopDto } from "./projections";
import { ownerHome, allowFields, saveNativeProduct } from "./owner";
import {
  getMarketplaceDiscoveryView,
  getFeaturedShowroomsView,
  getSponsoredShowrooms,
} from "../discovery";
import { featuredProgramTimeLabel } from "../featured-program";
import { runtimeCatalogByHandle } from "../catalog-runtime";
import { initialBusinessProfile } from "../business-profile";
import {
  runtimePublishedPage,
  pagePublicationPort,
} from "../owner-page-publication-runtime";
import { findPlaceSuggestions } from "../place-catalog";
import { BUSINESS_CATEGORY_OPTIONS } from "../business-categories";
import { parseBusinessHandle } from "../business-handle";
import { parseAccountPhone } from "../account-contacts";
import { getHandleAvailability } from "../handle-availability";
import { createPublicInquiry, InquiryError } from "../inquiries";
import { hashPrivateValue, requestIpFromHeaders } from "../security";
import { consumeRuntimeRateLimit } from "../rate-limit-runtime";
import { createPublicClientWorkspace, SignupError } from "../signup";
import {
  readOwnerBusiness,
  saveOwnerBusiness,
} from "../owner-business-runtime";
import {
  readHandleSettings,
  changeBusinessHandle,
} from "../business-handle-runtime";
import { saveOwnerPageAndPublication } from "../owner-page-save-runtime";
import { changePagePublication } from "../owner-page-publication";
import { ownerPagePort } from "../owner-page-runtime";
import { OwnerPageError } from "../owner-page-domain";
import { ProductUpkeepError } from "../product-upkeep-domain";
import { accountContactPort } from "../account-contact-runtime";
import { saveAccountPhone } from "../account-contacts";
import { listInquiriesPage } from "../scalable-queries";
import { updateInquiryStatus } from "../inquiry-status-runtime";
import { createVideoRequest } from "../support-video-requests";
import { channelConversation } from "../public-support-channel";
import {
  createPublicSupportConversation,
  postPublicSupportMessage,
  closePublicSupportConversation,
  listSupportConversations,
  getSupportConversation,
  postSupportMessage,
  createSupportConversation,
  closeSupportConversation,
  reopenSupportConversation,
  SupportError,
} from "../support";
import {
  readCoverUpload,
  uploadOwnerPageImage,
  readOwnerPageImage,
} from "../owner-page-media";
import { readTenantProductImage } from "../tenant-product-media";
import { getMediaObjectStore } from "../media-storage";
function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function nativeCors(origin: string | null) {
  return (
    process.env.NODE_ENV !== "production" &&
    !!origin &&
    /^http:\/\/(localhost|127\.0\.0\.1):8082$/.test(origin)
  );
}
async function dispatch(
  request: Request,
  path: string[],
  identityPort?: NativeIdentityPort,
) {
  const method = request.method,
    url = new URL(request.url),
    key = path.join("/"),
    q = url.searchParams;
  const ip = hashPrivateValue(requestIpFromHeaders(request.headers));
  const rate = await consumeRuntimeRateLimit(
    `mobile:${method === "GET" ? "read" : "write"}:${ip}`,
    method === "GET" ? 240 : 50,
    60000,
  );
  if (!rate.allowed)
    throw new MobileError(
      "Please wait a moment and try again.",
      429,
      "rate_limited",
    );
  if (method === "GET" && key === "market") {
    if ((q.get("q") || "").length > 120 || url.search.length > 2500)
      throw new MobileError("Search is too long.");
    return marketDto(
      await getMarketplaceDiscoveryView({
        industry: q.getAll("category"),
        q: q.get("q") || "",
        place: q.getAll("place"),
        page: q.get("page") || "1",
        type: "products", // Businesses are discovered on the map, not in result pages.
      }),
    );
  }
  if (method === "GET" && key === "featured") {
    const v = await getFeaturedShowroomsView({
      featuredDay: q.get("day") || undefined,
    });
    return {
      title: v.featured.title,
      broadcastLabel:
        featuredProgramTimeLabel(
          v.featured.programPolicy.startMinute,
          v.featured.programPolicy.endMinute,
        ) + " EAT",
      sponsors: (await getSponsoredShowrooms()).map((s) => ({
        id: s.id,
        name: s.name,
        details: s.details,
        imagePath: s.imagePath,
        href: s.href,
      })),
      date: v.featured.dateLabel,
      slots: v.featured.booths.map((b) => ({
        slot: b.slot,
        revealed: b.revealed,
        shop: b.showroom ? mapShopDto(b.showroom) : null,
      })),
      schedule: v.featured.schedule,
      policy: v.featured.programPolicy,
      nowBusinessId: v.featuredNowBusinessId,
    };
  }
  if (method === "GET" && path[0] === "shops" && path.length === 2) {
    if (!/^@?[a-z0-9-]{3,80}$/.test(path[1]))
      throw new MobileError("Business not found.", 404);
    const c = await runtimeCatalogByHandle(path[1].replace(/^@/, ""));
    if (!c || c.business.status !== "active")
      throw new MobileError("Business not found.", 404);
    return shopDto(
      c,
      (await runtimePublishedPage(c.business.id)) || initialBusinessProfile(c),
    );
  }
  if (method === "GET" && key === "places") {
    const query = q.get("q") || "";
    if (query.length > 80) throw new MobileError("Use a shorter place name.");
    return { places: findPlaceSuggestions(query) };
  }
  if (method === "GET" && key === "categories")
    return { categories: BUSINESS_CATEGORY_OPTIONS };
  if (method === "GET" && key === "handles")
    return getHandleAvailability(
      mobileParse(() => parseBusinessHandle(q.get("handle"))),
    );
  if (method === "POST" && key === "inquiries")
    return createPublicInquiry(await jsonBody(request), ip);
  if ((path[0] === "buying" || path[0] === "transport") && path.length === 1) {
    const channel = path[0] === "transport" ? "transport" : "buying";
    const token = request.headers.get("X-Suqpage-Buying-Session") || "";
    if (token && !/^[A-Za-z0-9_-]{32,200}$/.test(token))
      throw new MobileError("Chat session expired.", 401);
    if (method === "GET")
      return {
        conversation: token ? await channelConversation(token, channel) : null,
      };
    if (method === "POST") {
      const b = await jsonBody(request);
      allowFields(b, [
        "action",
        "name",
        "phone",
        "origin",
        "destination",
        "message",
        "idempotencyKey",
        "publicRef",
      ]);
      if (b.action === "start") {
        const created = await createPublicSupportConversation(
          {
            category: channel === "transport" ? "shipment_observation" : "buying_assistance",
            origin: b.origin,
            destination: b.destination,
            name: b.name,
            phone: b.phone,
            message: b.message,
            idempotencyKey: b.idempotencyKey,
          },
          ip,
          Date.now(),
          token || undefined,
        );
        return {
          token: created.token,
          conversation: await channelConversation(created.token, channel),
        };
      }
      const current = await channelConversation(token, channel);
      if (b.publicRef !== current.publicRef)
        throw new MobileError("This chat changed. Please refresh.", 409);
      if (b.action === "close") await closePublicSupportConversation(token);
      else if (b.action === "message")
        await postPublicSupportMessage(
          token,
          { message: b.message, idempotencyKey: b.idempotencyKey },
          ip,
        );
      else throw new MobileError("Invalid chat action.");
      return { conversation: await channelConversation(token, channel) };
    }
  }
  if (key === "session" && method === "GET") {
    const { identity, user } = await nativeIdentity(request, identityPort);
    if (user && user.access_role !== "client")
      throw new MobileError(
        "Staff management is available on the website.",
        403,
        "owner_only",
      );
    return { email: identity.email, setupRequired: !user };
  }
  if (key === "signup" && method === "POST") {
    const { identity, user } = await nativeIdentity(request, identityPort);
    if (user) throw new MobileError("This account is already set up.", 409);
    const b = await jsonBody(request);
    allowFields(b, [
      "name",
      "phone",
      "businessName",
      "businessCategory",
      "accentColor",
      "handle",
      "consent",
      "idempotencyKey",
    ]);
    const limit = await consumeRuntimeRateLimit(
      `mobile:signup:${hashPrivateValue(identity.id)}`,
      3,
      3600000,
    );
    if (!limit.allowed) throw new MobileError("Please try again later.", 429);
    return createPublicClientWorkspace(b, {
      providerUserId: identity.id,
      email: identity.email,
    });
  }
  if (path[0] !== "owner") throw new MobileError("Not found.", 404);
  const actor = await nativeOwner(request, identityPort),
    bid = actor.business_id,
    route = path.slice(1).join("/");
  if (method === "GET" && route === "home") return ownerHome(actor);
  if (method === "GET" && route === "business")
    return readOwnerBusiness(actor, bid);
  if (method === "GET" && route === "handle")
    return readHandleSettings(actor, bid);
  if (method === "GET" && route === "inquiries") {
    const p = await listInquiriesPage(bid, {
      page: q.get("page"),
      status: q.get("status"),
      q: q.get("q"),
    });
    return {
      items: p.items.map((i) => ({
        id: i.id,
        customerName: i.customer_name,
        contact: i.contact,
        contactMethod: i.contact_method,
        note: i.note,
        status: i.status,
        items: i.items.map((p) => ({
          name: p.product_name_snapshot,
          quantity: p.quantity_intent || String(p.quantity || ""),
          options: JSON.parse(p.options_json || "{}"),
        })),
      })),
      page: p.page,
      pages: p.totalPages,
      total: p.totalItems,
    };
  }
  if (method === "GET" && route === "support") {
    const p = await listSupportConversations(actor, {
      page: q.get("page"),
      status: q.get("status"),
    });
    return {
      items: p.items.map((c) => ({
        id: c.id,
        subject: c.subject,
        status: c.status,
        publicRef: c.publicRef,
        lastMessageAt: c.lastMessageAt,
      })),
      page: p.page,
      pages: p.totalPages,
      total: p.totalItems,
    };
  }
  if (method === "GET" && path[1] === "support" && path.length === 3) {
    const c = await getSupportConversation(actor, numericId(path[2]));
    return {
      conversation: {
        id: c.conversation.id,
        subject: c.conversation.subject,
        status: c.conversation.status,
      },
      messages: c.messages.map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderName: m.senderName,
        attachment: m.attachment,
      })),
    };
  }
  if (path[1] === "support" && path[3] === "attachments") {
    if(method === "GET" && path.length === 5) return nativeSupportAttachment(actor,numericId(path[2]),numericId(path[4]));
    if(method === "POST" && path.length === 4) return nativeSupportReply(request,actor,numericId(path[2]));
    throw new MobileError("Method not allowed.",405);
  }
  if (method === "GET" && route === "media") {
    const ref = q.get("ref") || "";
    const image = ref.startsWith("/api/page-drafts/")
      ? await readOwnerPageImage(
          ownerPagePort,
          getMediaObjectStore(),
          actor,
          bid,
          ref,
        )
      : /^\/media\/product-private-[0-9]+-[a-f0-9-]+\.(jpg|png|webp)$/.test(ref)
        ? await readTenantProductImage(ref.slice("/media/".length), actor)
        : null;
    if (!image) throw new MobileError("Image not found.", 404);
    return new Response(new Uint8Array(image.bytes), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (method !== "POST") throw new MobileError("Method not allowed.", 405);
  if (route === "cover") {
    const file = await readCoverUpload(request);
    return {
      ref: await uploadOwnerPageImage(
        ownerPagePort,
        getMediaObjectStore(),
        actor,
        bid,
        {
          bytes: Buffer.from(await file.arrayBuffer()),
          claimedType: file.type,
        },
      ),
    };
  }
  if (path[1] === "products" && path.length <= 3)
    return saveNativeProduct(
      request,
      actor,
      path[2] ? numericId(path[2]) : null,
    );
  if(route === "business" && request.headers.get("content-type")?.startsWith("multipart/form-data;")) return saveNativeBusiness(request,actor);
  const b = await jsonBody(request);
  if (route === "business") return saveOwnerBusiness(actor, bid, b);
  if (route === "handle") {
    allowFields(b, ["handle", "expectedVersion"]);
    const handle = mobileParse(() => parseBusinessHandle(b.handle));
    const current = await readHandleSettings(actor, bid);
    if (handle !== current.handle && current.nextChangeAt > Date.now())
      throw new MobileError(
        "You can change your handle once every 30 days. Contact support for help.",
      );
    if (Number(b.expectedVersion) !== current.contentVersion)
      throw new MobileError(
        "Business details changed. Reload before saving.",
        409,
      );
    if (
      handle !== current.handle &&
      !(await getHandleAvailability(handle)).available
    )
      throw new MobileError("This handle is already taken. Choose another.");
    return changeBusinessHandle(actor, bid, {
      handle,
      expectedVersion: b.expectedVersion,
    });
  }
  if (route === "page") {
    allowFields(b, ["action", "version", "content"]);
    if (b.action !== "start" && b.action !== "save")
      throw new MobileError("Invalid page action.");
    return saveOwnerPageAndPublication(actor, bid, {
      action: b.action,
      version: b.version,
      content: b.content,
    });
  }
  if (route === "publish") {
    allowFields(b, ["version", "revision"]);
    return changePagePublication(
      ownerPagePort,
      pagePublicationPort,
      actor,
      bid,
      { action: "publish", version: b.version, revision: b.revision },
    );
  }
  if (route === "account") {
    allowFields(b, ["phone"]);
    await saveAccountPhone(
      accountContactPort,
      actor,
      mobileParse(() => parseAccountPhone(b.phone)),
    );
    return { saved: true };
  }
  if (route === "video") {
    allowFields(b, [
      "target",
      "productId",
      "sourceUrl",
      "note",
      "idempotencyKey",
    ]);
    return createVideoRequest(actor, {
      target: b.target,
      productId: b.productId,
      sourceUrl: b.sourceUrl,
      note: b.note,
      idempotencyKey: b.idempotencyKey,
    });
  }
  if (path[1] === "inquiries" && path.length === 3) {
    allowFields(b, ["status"]);
    return updateInquiryStatus(actor, {
      businessId: bid,
      inquiryId: numericId(path[2]),
      status: String(b.status),
    });
  }
  if (route === "support") {
    allowFields(b, ["subject", "message", "idempotencyKey"]);
    return createSupportConversation(actor, {
      subject: b.subject,
      message: b.message,
      idempotencyKey: b.idempotencyKey,
    });
  }
  if (path[1] === "support" && path.length === 3) {
    allowFields(b, ["action", "message", "idempotencyKey"]);
    const id = numericId(path[2]);
    if (b.action === "close") return closeSupportConversation(actor, id);
    if (b.action === "reopen") return reopenSupportConversation(actor, id);
    if (b.action === "message")
      return postSupportMessage(actor, id, {
        message: b.message,
        idempotencyKey: b.idempotencyKey,
      });
    throw new MobileError("Invalid action.");
  }
  throw new MobileError("Not found.", 404);
}
export async function handleMobileRequest(
  request: Request,
  path: string[],
  dependencies?: { identity?: NativeIdentityPort; invalidate?: () => void },
) {
  let response: Response;
  const origin = request.headers.get("origin");
  const cors = nativeCors(origin);
  try {
    if (origin && origin !== new URL(request.url).origin && !cors)
      throw new MobileError("Origin not allowed.", 403);
    if (request.method === "OPTIONS") {
      if (!cors) throw new MobileError("Origin not allowed.", 403);
      response = new Response(null, { status: 204 });
    } else {
      const value = await dispatch(request, path, dependencies?.identity);
      response =
        value instanceof Response ? value : json(value ?? { saved: true });
      if (
        request.method === "POST" &&
        path[0] === "owner" &&
        ["page", "publish", "business", "handle", "products"].includes(path[1])
      )
        (dependencies?.invalidate || (() => revalidatePath("/", "layout")))();
    }
  } catch (e) {
    const known =
      e instanceof MobileError ||
      e instanceof OwnerPageError ||
      e instanceof ProductUpkeepError ||
      e instanceof InquiryError ||
      e instanceof SignupError;
    const status = known
      ? e.status
      : e instanceof SupportError
        ? e.code === "forbidden"
          ? 403
          : e.code === "not_found"
            ? 404
            : e.code === "rate_limited"
              ? 429
              : 400
        : 500;
    response = json(
      {
        error:
          known || e instanceof SupportError
            ? e.message
            : "Could not complete this request. Please try again.",
        code: e instanceof MobileError ? e.code : undefined,
      },
      status,
    );
  }
  if (cors) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Suqpage-Buying-Session",
    );
  }
  return response;
}
