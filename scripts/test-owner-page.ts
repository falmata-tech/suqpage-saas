import { legacyPublicContacts, publicContactLinks } from "../lib/business-profile-contacts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { canEditOwnerPage, OwnerPageError, parseShopPageContent, readSavedPageContent, type OwnerPageDraft, type ShopPageContent } from "../lib/owner-page-domain";
import { readOwnerPage, saveOwnerPage, setOwnerPageAssistance, startOwnerPage, type OwnerPagePort } from "../lib/owner-page-service";
import { businessProfileDescription, initialBusinessProfile } from "../lib/business-profile";
import type { Catalog, SessionUser } from "../lib/types";
import sharp from "sharp";
import { ownerPageImageKey, readCoverUpload, readOwnerPageImage, uploadOwnerPageImage } from "../lib/owner-page-media";
import type { MediaObjectStore, StoredMediaObject } from "../lib/media-storage";
import { MAX_IMAGE_BYTES } from "../lib/media";
import { changePagePublication, type PagePublication, type PagePublicationPort } from "../lib/owner-page-publication";

const owner: SessionUser = { id: 10, email: "owner@example.test", name: "Shop owner", role: "owner", access_role: "client", business_id: 1, must_change_password: 0 };
const staff: SessionUser = { ...owner, id: 20, business_id: null, role: "admin", access_role: "team_member" };
const admin: SessionUser = { ...staff, id: 30, access_role: "platform_admin" };
const content: ShopPageContent = { template: "profile-v1", coverStyle: "blended", introduction: "Local collections", about: "", heroImage: "", videoUrl: "" };
const catalog: Catalog = { collections: [], categories: [], products: [], business: {
  id: 1, handle: "test-shop", name: "Test shop", design_key: "alhaya", design_manifest_json: "", content_blocks_json: "", tagline: "", description: "",
  logo_path: "", hero_title: "", hero_subtitle: "", hero_image_path: "/uploads/seed/test.jpg", contact_email: "shop@example.test", whatsapp: "", telegram: "", tiktok: "",
  process_video_ref: "", is_live: 0, live_platform: "", live_url: "", status: "draft", site_title: "", site_description: "", favicon_path: "", content_version: 1,
} };

function fake() {
  let current: OwnerPageDraft | null = null;
  let assigned = true;
  const events: string[] = [];
  const port: OwnerPagePort = {
    read: async () => current ? structuredClone(current) : null,
    assigned: async () => assigned,
    hasImage: async (_businessId, ref) => ref === "/uploads/seed/test.jpg",
    create: async (businessId, updatedBy, value) => current ||= { businessId, version: 1, content: value, assistanceEnabled: false, updatedBy, updatedAt: 1 },
    commit: async (actor, before, change) => {
      if (!current || current.version !== before.version || !canEditOwnerPage(actor, before.businessId, current.assistanceEnabled, assigned)) return null;
      current = { ...current, version: current.version + 1, updatedBy: actor.id,
        ...(change.kind === "content" ? { content: change.content } : { assistanceEnabled: change.enabled }) };
      events.push(change.kind); return structuredClone(current);
    },
  };
  return { port, events, unassign: () => { assigned = false; } };
}
const denied = (status: number) => (error: unknown) => error instanceof OwnerPageError && error.status === status;

function fakePublications() {
  const history: PagePublication[] = [];
  let active = true;
  const port: PagePublicationPort = {
    latest: async () => history.at(-1) || null,
    previous: async (_businessId, revision) => history.findLast((entry) => entry.revision < revision) || null,
    active: async () => active,
    commit: async (actor, draft, revision, selected, action) => {
      if (revision !== history.length) return null;
      const published = { businessId: draft.businessId, revision: revision + 1,
        draftVersion: draft.version, content: structuredClone(selected), action,
        publishedBy: actor.id, publishedAt: 1 };
      history.push(published); return published;
    },
  };
  return { port, history, deactivate: () => { active = false; } };
}

test("publication uses saved content; staff edits remain private until the owner publishes", async () => {
  const { port } = fake(); const publications = fakePublications();
  await startOwnerPage(port, owner, 1, content);
  const published = await changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 1, revision: 0 });
  assert.deepEqual(published.content, content);
  const consent = await setOwnerPageAssistance(port, owner, 1, 1, true);
  const edited = await saveOwnerPage(port, staff, 1, consent.version, { ...content, about: "Staff changes" });
  assert.equal(publications.history[0].content?.about, "");
  const next = await changePagePublication(port, publications.port, owner, 1, { action: "publish", version: edited.version, revision: 1 });
  assert.equal(next.content?.about, "Staff changes");
  assert.equal(next.publishedBy, owner.id);
});

test("publication and restore deny nonowners, invalid versions and inactive businesses", async () => {
  const { port } = fake(); const publications = fakePublications();
  await startOwnerPage(port, owner, 1, content);
  for (const action of ["publish", "restore"] as const) {
    for (const actor of [staff, admin, { ...owner, business_id: 2 }]) {
      await assert.rejects(changePagePublication(port, publications.port, actor, 1, { action, version: 1, revision: 0 }), denied(403));
    }
    for (const revision of [-1, 1.5, "0", null]) await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action, version: 1, revision }), denied(409));
  }
  publications.deactivate();
  await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 1, revision: 0 }), denied(403));
  assert.equal(publications.history.length, 0);
});

test("stale draft and publication versions cannot publish or restore", async () => {
  const { port } = fake(); const publications = fakePublications();
  await startOwnerPage(port, owner, 1, content);
  await saveOwnerPage(port, owner, 1, 1, { ...content, about: "New saved content" });
  await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 1, revision: 0 }), denied(409));
  await changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 2, revision: 0 });
  for (const action of ["publish", "restore"] as const) await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action, version: 2, revision: 0 }), denied(409));
  publications.port.commit = async () => null;
  await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action: "restore", version: 2, revision: 1 }), denied(409));
  assert.equal(publications.history.length, 1);
});

test("restore appends a previous snapshot or original-page selection without altering the draft", async () => {
  const { port } = fake(); const publications = fakePublications();
  await startOwnerPage(port, owner, 1, content);
  await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action: "restore", version: 1, revision: 0 }), denied(409));
  await changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 1, revision: 0 });
  const restored = await changePagePublication(port, publications.port, owner, 1, { action: "restore", version: 1, revision: 1 });
  assert.equal(restored.content, null);
  assert.equal((await port.read(1))?.content.introduction, content.introduction);
  const previousProfile = await changePagePublication(port, publications.port, owner, 1, { action: "restore", version: 1, revision: 2 });
  assert.deepEqual(previousProfile.content, content);
  assert.equal(publications.history.length, 3);
});

test("publication requires an available owned cover", async () => {
  const { port } = fake(); const publications = fakePublications();
  await startOwnerPage(port, owner, 1, { ...content, heroImage: "/uploads/seed/test.jpg" });
  port.hasImage = async () => false;
  await assert.rejects(changePagePublication(port, publications.port, owner, 1, { action: "publish", version: 1, revision: 0 }), denied(400));
  assert.equal(publications.history.length, 0);
});

function fakeMedia() {
  const objects = new Map<string, StoredMediaObject>();
  let reads = 0;
  const store: MediaObjectStore = {
    provider: "filesystem",
    put: async (namespace, key, bytes, contentType) => { assert.equal(namespace, "pages"); objects.set(key, { bytes, contentType, contentLength: bytes.length }); },
    read: async (namespace, key) => { assert.equal(namespace, "pages"); reads++; return objects.get(key) || null; },
    remove: async (_namespace, keys) => { keys.forEach((key) => objects.delete(key)); },
  };
  return { store, objects, reads: () => reads };
}
const uploadImage = () => sharp({ create: { width: 24, height: 16, channels: 3, background: "#b93604" } }).png().toBuffer();

test("private cover upload sanitizes bytes, stays tenant-bound and supports owners before first draft save", async () => {
  const { port } = fake();
  const { store, objects, reads } = fakeMedia();
  const ref = await uploadOwnerPageImage(port, store, owner, 1, { bytes: await uploadImage(), claimedType: "image/png" });
  const key = ownerPageImageKey(1, ref);
  assert.ok(key);
  assert.ok(objects.has(key));
  assert.equal(ownerPageImageKey(2, ref), null);
  for (const invalid of [ref + "?download=true", ref.replace(".png", ".svg"), `/api/page-drafts/1/media/../${key}`, ref.replace("page-1-", "page-2-")]) assert.equal(ownerPageImageKey(1, invalid), null);
  const stored = await readOwnerPageImage(port, store, owner, 1, ref);
  assert.equal((await sharp(stored.bytes).metadata()).width, 24);
  const beforeDenied = reads();
  await assert.rejects(readOwnerPageImage(port, store, { ...owner, business_id: 2 }, 1, ref), denied(403));
  await assert.rejects(readOwnerPageImage(port, store, staff, 1, ref), denied(403));
  assert.equal(reads(), beforeDenied, "Unauthorized reads do not reach storage");
  await assert.rejects(readOwnerPageImage(port, store, owner, 1, ref.replace(key, `page-1-00000000-0000-4000-8000-000000000000.png`)), denied(404));
});
test("invalid images and excessive sizes never enter private storage", async () => {
  const { port } = fake();
  const { store, objects } = fakeMedia();
  const png = await uploadImage();
  for (const input of [{ bytes: Buffer.from("<svg>not an image</svg>"), claimedType: "image/png" }, { bytes: png, claimedType: "image/jpeg" }, { bytes: Buffer.alloc(MAX_IMAGE_BYTES + 1), claimedType: "image/png" }]) {
    await assert.rejects(uploadOwnerPageImage(port, store, owner, 1, input), denied(400));
  }
  assert.equal(objects.size, 0);
});
test("revocation during upload discards staged bytes; later reads recheck staff permission", async () => {
  const { port } = fake();
  const { store, objects } = fakeMedia();
  await startOwnerPage(port, owner, 1, content);
  await setOwnerPageAssistance(port, owner, 1, 1, true);
  const ref = await uploadOwnerPageImage(port, store, staff, 1, { bytes: await uploadImage(), claimedType: "image/png" });
  await setOwnerPageAssistance(port, owner, 1, 2, false);
  await assert.rejects(readOwnerPageImage(port, store, staff, 1, ref), denied(403));
  await setOwnerPageAssistance(port, owner, 1, 3, true);
  const put = store.put;
  store.put = async (...args) => { await put(...args); await setOwnerPageAssistance(port, owner, 1, 4, false); };
  await assert.rejects(uploadOwnerPageImage(port, store, staff, 1, { bytes: await uploadImage(), claimedType: "image/png" }), denied(403));
  assert.equal(objects.size, 1, "Only the earlier owner's retained image remains");
});
test("multipart input is bounded even without an honest content length", async () => {
  const form = new FormData(); form.set("file", new File([new Uint8Array(await uploadImage())], "cover.png", { type: "image/png" }));
  const input = new Request("http://localhost/upload", { method: "POST", body: form });
  const file = await readCoverUpload(input);
  assert.equal(file.type, "image/png");
  const extra = new FormData(); extra.set("file", file); extra.set("businessId", "2");
  await assert.rejects(readCoverUpload(new Request("http://localhost/upload", { method: "POST", body: extra })), denied(400));
  await assert.rejects(readCoverUpload(new Request("http://localhost/upload", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=x", "Content-Length": "1" }, body: new Uint8Array(MAX_IMAGE_BYTES + 32_001) })), denied(413));
  await assert.rejects(readCoverUpload(new Request("http://localhost/upload", { method: "POST", body: "not multipart" })), denied(415));
});

test("strict bounded profile fields and safe cover choices", () => {
  assert.deepEqual(parseShopPageContent(content), content);
  for (const invalid of [{ ...content, coverStyle: "html" }, { ...content, title: "Different business" }, { ...content, assistanceEnabled: true }, { ...content, introduction: "<script>bad</script>" }, { ...content, introduction: "x".repeat(601) }]) {
    assert.throws(() => parseShopPageContent(invalid), OwnerPageError);
  }
});
test("all staff roles need consent, team also needs assignment, clients remain tenant-bound", () => {
  assert.equal(canEditOwnerPage(owner, 1, false, false), true);
  assert.equal(canEditOwnerPage(owner, 2, true, true), false);
  for (const actor of [staff, admin, { ...admin, access_role: "operations_manager" as const }]) {
    assert.equal(canEditOwnerPage(actor, 1, false, true), false);
    assert.equal(canEditOwnerPage(actor, 1, true, true), true);
  }
  assert.equal(canEditOwnerPage(staff, 1, true, false), false);
});
test("owner starts one private draft; no read leaks or staff self-grants", async () => {
  const { port } = fake();
  await assert.rejects(startOwnerPage(port, admin, 1, content), denied(403));
  const first = await startOwnerPage(port, owner, 1, content);
  assert.equal(first.assistanceEnabled, false);
  assert.deepEqual(await startOwnerPage(port, owner, 1, content), first);
  await assert.rejects(startOwnerPage(port, owner, 1, { ...content, introduction: "Replacement" }), denied(409));
  await assert.rejects(startOwnerPage(port, owner, 1, { ...content, heroImage: "/media/foreign.jpg" }), denied(400));
  await assert.rejects(readOwnerPage(port, owner, 2), denied(403));
  await assert.rejects(readOwnerPage(port, staff, 1), denied(403));
  await assert.rejects(setOwnerPageAssistance(port, admin, 1, 1, true), denied(403));
});
test("foreign clients and unassigned staff are denied before a draft query", async () => {
  const { port, unassign } = fake();
  let reads = 0;
  port.read = async () => { reads++; return null; };
  await assert.rejects(readOwnerPage(port, owner, 2), denied(403));
  unassign();
  await assert.rejects(readOwnerPage(port, staff, 1), denied(403));
  assert.equal(reads, 0);
});
test("competing first saves do not overwrite an unseen draft", async () => {
  const { port } = fake();
  const create = port.create;
  port.create = async (businessId, actorId, value) => {
    await create(businessId, actorId, { ...value, introduction: "Saved in another tab" });
    return create(businessId, actorId, value);
  };
  await assert.rejects(startOwnerPage(port, owner, 1, content), denied(409));
  assert.equal((await readOwnerPage(port, owner, 1))?.content.introduction, "Saved in another tab");
});
test("consent, attributed staff saves, stale versions, media scope and immediate revocation", async () => {
  const { port, events, unassign } = fake();
  await startOwnerPage(port, owner, 1, content);
  const allowed = await setOwnerPageAssistance(port, owner, 1, 1, true);
  const edited = await saveOwnerPage(port, staff, 1, allowed.version, { ...content, about: "Our shop" });
  assert.equal(edited.updatedBy, staff.id);
  await assert.rejects(saveOwnerPage(port, owner, 1, allowed.version, content), denied(409));
  await assert.rejects(saveOwnerPage(port, owner, 1, edited.version, { ...content, heroImage: "/media/another-tenant.jpg" }), denied(400));
  unassign();
  await assert.rejects(readOwnerPage(port, staff, 1), denied(403));
  const revoked = await setOwnerPageAssistance(port, owner, 1, edited.version, false);
  assert.equal(revoked.content.about, "Our shop");
  await assert.rejects(saveOwnerPage(port, admin, 1, edited.version, content), denied(403));
  assert.deepEqual(events, ["consent", "content", "consent"]);
});
test("an in-flight save cannot bypass a later consent or version change", async () => {
  const { port } = fake();
  await startOwnerPage(port, owner, 1, content);
  await setOwnerPageAssistance(port, owner, 1, 1, true);
  const originalHasImage = port.hasImage;
  port.hasImage = async () => {
    await setOwnerPageAssistance(port, owner, 1, 2, false);
    return originalHasImage(1, "/uploads/seed/test.jpg");
  };
  await assert.rejects(saveOwnerPage(port, admin, 1, 2, { ...content, heroImage: "/uploads/seed/test.jpg" }), denied(409));
  assert.equal((await readOwnerPage(port, owner, 1))?.assistanceEnabled, false);
});
test("one business profile reads existing information without generating designs or changing canonical data", () => {
  const before = JSON.stringify(catalog);
  assert.equal(initialBusinessProfile(catalog).introduction, "");
  for (const coverStyle of ["blended", "overlay"] as const) for (const heroImage of ["", catalog.business.hero_image_path]) for (const about of ["", "We stock everyday essentials."]) {
    const result = parseShopPageContent({ ...content, coverStyle, heroImage, about });
    assert.equal(result.about, about);
    assert.equal(result.template, "profile-v1");
  }
  assert.equal(JSON.stringify(catalog), before);
});
test("YouTube links are optional, normalized, and limited to the controlled provider", () => {
  assert.equal(parseShopPageContent({ ...content, videoUrl: "https://youtu.be/abcdefghijk" }).videoUrl, "https://www.youtube.com/watch?v=abcdefghijk");
  for (const videoUrl of [undefined, null, "javascript:alert(1)", "https://youtube.com.evil.test/watch?v=abcdefghijk", "https://me:secret@youtube.com/watch?v=abcdefghijk", "https://youtube.com/watch?v=abcdefghijk&list=x", "http://youtu.be/abcdefghijk", "x".repeat(501)]) {
    assert.throws(() => parseShopPageContent({ ...content, videoUrl }), OwnerPageError);
  }
  assert.equal(initialBusinessProfile({ ...catalog, business: { ...catalog.business, process_video_ref: "youtube:abcdefghijk", description: "A shop, not a factory." } }).videoUrl, "https://www.youtube.com/watch?v=abcdefghijk");
});
test("local saved Shop drafts are readable but legacy layout fields cannot enter new writes", () => {
  for (const layout of ["catalog", "editorial"]) {
    const old = { template: "shop-v1", layout, title: "Old custom heading", introduction: "Keep intro", about: "Keep story", heroImage: "/uploads/seed/test.jpg" };
    const updated = readSavedPageContent(old);
    assert.equal(updated.coverStyle, layout === "catalog" ? "blended" : "overlay");
    assert.equal(updated.introduction, old.introduction);
    assert.equal(updated.about, old.about);
    assert.equal(updated.heroImage, old.heroImage);
    assert.equal("title" in updated, false);
    assert.throws(() => parseShopPageContent(old), OwnerPageError);
    assert.throws(() => readSavedPageContent({ ...old, unsafe: true }), OwnerPageError);
  }
});

test("one description prefers About and preserves intro-only compatibility", () => {
  assert.equal(businessProfileDescription({ about: "Shop story", introduction: "Old introduction" }), "Shop story");
  assert.equal(businessProfileDescription({ about: "", introduction: "Old introduction" }), "Old introduction");
  assert.equal(businessProfileDescription({ about: "", introduction: "" }), "");
  assert.equal(businessProfileDescription({ about: "Typing a ", introduction: "Old" }), "Typing a ", "Do not remove spaces while typing");
});
test("public contact validation rejects unsafe destinations and never infers notification email", () => {
  assert.deepEqual(legacyPublicContacts(catalog.business), { whatsapp: "", telegram: "", tiktok: "" });
  assert.deepEqual(publicContactLinks({}), []);
  for (const contacts of [{ email: "x@example.com\r\nBcc:other@example.com" }, { email: "a@example.com?subject=x" }, { website: "javascript:alert(1)" }, { website: "https://user:secret@example.com" }, { website: "http://example.com" }, { tiktok: "https://evil.example" }, { phone: "123?x=y" }, { privateEmail: "x@example.com" }]) {
    assert.throws(() => parseShopPageContent({ ...content, contacts }), OwnerPageError);
  }
  const parsed = parseShopPageContent({ ...content, contacts: { phone: "+251 911 234 567", website: "https://example.com", email: "shop@example.com", tiktok: "@shop" } });
  assert.equal(parsed.contacts?.phone, "+251911234567");
  assert.deepEqual(publicContactLinks(parsed.contacts || {}).map(({ href }) => href), ["tel:+251911234567", "mailto:shop%40example.com", "https://example.com/", "https://www.tiktok.com/@shop"]);
  assert.ok(!("contacts" in parseShopPageContent(content)), "Old snapshots keep their compatible shape");
});
test("contact edits remain private until exact owner publication", async () => {
  const { port } = fake();
  const { port: publications, history } = fakePublications();
  const saved = await startOwnerPage(port, owner, 1, { ...content, contacts: { email: "public@example.com" } });
  assert.equal(history.length, 0);
  await changePagePublication(port, publications, owner, 1, { action: "publish", version: saved.version, revision: 0 });
  assert.equal(history.at(-1)?.content?.contacts?.email, "public@example.com");
  await saveOwnerPage(port, owner, 1, saved.version, { ...saved.content, contacts: { email: "later@example.com" } });
  assert.equal(history.at(-1)?.content?.contacts?.email, "public@example.com");
});
