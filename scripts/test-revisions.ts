import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
const revisionEditorSource = fs.readFileSync(path.join(process.cwd(), "components/RevisionEditor.tsx"), "utf8");
const revisionPreviewSource = fs.readFileSync(path.join(process.cwd(), "app/dashboard/requests/[id]/revisions/[revisionId]/preview/page.tsx"), "utf8");
assert.match(revisionEditorSource, /Review saved draft/);
assert.doesNotMatch(revisionEditorSource, /submitRevisionAction/, "the mutable editor cannot submit a potentially stale saved snapshot");
assert.match(revisionPreviewSource, /submitRevisionAction/, "the exact saved preview owns review submission");
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mirtpage-revisions-"));
    process.env.MIRTPAGE_MEDIA_ROOT = path.join(root, "media");
    try {
        const { getDb, getUserById, closeDbForTests, getCatalogByBusinessId } = await import("./testing/postgres-fixture");
        const { FileRequestAttachmentStore } = await import("../lib/request-media");
        const { createDraftRevision, saveDraftRevision, submitRevisionForReview, decideRevision, publishApprovedRevision, rollbackCatalogVersion, getContentRevision } = await import("../lib/revision-service");
        const { RevisionError } = await import("../lib/revision-domain");
        const { requireRevisionSnapshotV4 } = await import("../lib/revision-v4-domain");
        const { SHOWROOM_COMPONENT_BANK_LATEST } = await import("../lib/showroom-bank-release");
        const parseRevisionSnapshot = (input: unknown) => requireRevisionSnapshotV4(input, SHOWROOM_COMPONENT_BANK_LATEST);
        const setHero = (snapshot: ReturnType<typeof parseRevisionSnapshot>, title: string, imageRef?: string) => {
            const hero = snapshot.contentBlocks.blocks.find((block) => block.type === "hero");
            assert.ok(hero);
            hero.title = title;
            if (imageRef !== undefined) {
                const media = hero.media.find((item) => item.slotKey === "hero_image");
                if (media)
                    media.assetKeys = imageRef ? [imageRef] : [];
                else if (imageRef)
                    hero.media.push({ slotKey: "hero_image", assetKeys: [imageRef], altText: title, caption: "" });
            }
            return parseRevisionSnapshot(snapshot);
        };
        const businessId = Number((await (await getDb()).prepare("INSERT INTO businesses(handle,name,design_key,hero_title,status) VALUES('revision-market','Revision Market','novatech','Original live hero','active')").run()).insertedId);
        const collectionId = Number((await (await getDb()).prepare("INSERT INTO collections(business_id,name,slug) VALUES(?,'Original collection','original')").run(businessId)).insertedId);
        await (await getDb()).prepare("INSERT INTO products(business_id,collection_id,name,slug,description,is_published) VALUES(?,?,'Original product','original-product','Live description',1)").run(businessId, collectionId);
        const clientId = Number((await (await getDb()).prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('revision-client@test.local','unused','Revision Client','owner',?)").run(businessId)).insertedId);
        await (await getDb()).prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(clientId);
        const managerId = Number((await (await getDb()).prepare("INSERT INTO users(email,password_hash,name,role) VALUES('revision-manager@test.local','unused','Revision Manager','admin')").run()).insertedId);
        await (await getDb()).prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'operations_manager')").run(managerId);
        const teamId = Number((await (await getDb()).prepare("INSERT INTO users(email,password_hash,name,role) VALUES('revision-team@test.local','unused','Revision Team','admin')").run()).insertedId);
        await (await getDb()).prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'team_member')").run(teamId);
        const outsiderId = Number((await (await getDb()).prepare("INSERT INTO users(email,password_hash,name,role) VALUES('revision-outsider@test.local','unused','Other Team','admin')").run()).insertedId);
        await (await getDb()).prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'team_member')").run(outsiderId);
        const requestId = Number((await (await getDb()).prepare("INSERT INTO service_requests(public_ref,business_id,represented_client_user_id,request_type,status,contact_name,contact_value,business_name,request_text,submitter_kind,submitted_by_user_id) VALUES('REQ-REVISION001',?,?,'change','in_progress','Revision Client','revision-client@test.local','Revision Market','Change the private hero and catalog.','client',?)").run(businessId, clientId, clientId)).insertedId);
        await (await getDb()).prepare("UPDATE service_requests SET assigned_user_id=? WHERE id=?").run(teamId, requestId);
        await (await getDb()).prepare("INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)").run(teamId, businessId, managerId);
        const png = await sharp({ create: { width: 4, height: 3, channels: 4, background: { r: 20, g: 70, b: 120, alpha: 1 } } }).png().toBuffer();
        const stored = await new FileRequestAttachmentStore().save({ originalName: "client-hero.png", claimedType: "image/png", bytes: png });
        const attachmentId = Number((await (await getDb()).prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)").run(requestId, stored.storageKey, stored.originalName, stored.mime, stored.buffer.byteLength, stored.width, stored.height)).insertedId);
        const client = (await getUserById(clientId))!, manager = (await getUserById(managerId))!, team = (await getUserById(teamId))!, outsider = (await getUserById(outsiderId))!;
        const draft = await createDraftRevision(team, requestId);
        assert.equal(draft.revision_number, 1);
        assert.equal(draft.base_content_version, 1);
        assert.equal(parseRevisionSnapshot(draft.snapshot_json).schemaVersion, 4);
        await assert.rejects(() => createDraftRevision(outsider, requestId), (error: unknown) => error instanceof RevisionError && error.status === 404);
        const snapshot = setHero(parseRevisionSnapshot(draft.snapshot_json), "Private revised hero", `request-attachment:${attachmentId}`);
        snapshot.products[0].name = "Approved exact product";
        await saveDraftRevision(team, draft.id, snapshot, "Updated hero and product name");
        await submitRevisionForReview(team, draft.id);
        await assert.rejects(() => saveDraftRevision(team, draft.id, snapshot, "tamper"), (error: unknown) => error instanceof RevisionError && error.status === 409);
        assert.equal((await getCatalogByBusinessId(businessId, true))!.business.hero_title, "Original live hero");
        await assert.rejects(() => decideRevision(manager, draft.id, "approve", ""), (error: unknown) => error instanceof RevisionError && error.status === 403);
        await decideRevision(client, draft.id, "reject", "Please use a warmer hero treatment.");
        assert.equal((await getContentRevision(draft.id))!.status, "rejected");
        assert.equal((await getCatalogByBusinessId(businessId, true))!.products[0].name, "Original product");
        const second = await createDraftRevision(team, requestId);
        assert.equal(second.revision_number, 2);
        const secondSnapshot = setHero(parseRevisionSnapshot(second.snapshot_json), "Approved private hero");
        await saveDraftRevision(team, second.id, secondSnapshot, "Warmer approved treatment");
        await submitRevisionForReview(team, second.id);
        await decideRevision(client, second.id, "approve", "Looks ready.");
        await (await getDb()).prepare("UPDATE businesses SET content_version=2 WHERE id=?").run(businessId);
        await assert.rejects(() => publishApprovedRevision(manager, second.id), (error: unknown) => error instanceof RevisionError && error.status === 409);
        assert.equal((await getContentRevision(second.id))!.status, "approved");
        const third = await createDraftRevision(team, requestId);
        const thirdSnapshot = setHero(parseRevisionSnapshot(third.snapshot_json), "Published approved hero");
        thirdSnapshot.products[0].name = "Published exact product";
        await saveDraftRevision(team, third.id, thirdSnapshot, "Final approved treatment");
        await submitRevisionForReview(team, third.id);
        await decideRevision(client, third.id, "approve", "");
        await (await getDb()).prepare("UPDATE businesses SET name='Current Settings Name',logo_path='/media/current-logo.webp',contact_email='current@settings.test',whatsapp='251911111111',telegram='current_settings',tiktok='current_settings',is_live=1,live_platform='youtube',live_url='https://youtube.com/@current-settings',site_title='Current settings title',site_description='Current settings description',favicon_path='/media/current-icon.webp' WHERE id=?").run(businessId);
        const published = await publishApprovedRevision(manager, third.id);
        assert.equal(published.contentVersion, 3);
        const live = (await getCatalogByBusinessId(businessId, true))!;
        assert.equal(live.business.hero_title, "Published approved hero");
        assert.equal(live.products[0].name, "Published exact product");
        assert.equal(live.business.name, "Current Settings Name");
        assert.equal(live.business.logo_path, "/media/current-logo.webp");
        assert.equal(live.business.contact_email, "current@settings.test");
        assert.equal(live.business.is_live, 1);
        assert.equal(live.business.site_title, "Current settings title");
        assert.match(live.business.hero_image_path, /^\/media\/revision-[0-9a-f-]{36}\.png$/);
        assert.equal(fs.existsSync(path.join(root, "media", path.basename(live.business.hero_image_path))), true);
        assert.equal((await (await getDb()).prepare("SELECT COUNT(*) count FROM published_catalog_versions WHERE business_id=?").get(businessId) as {
            count: number;
        }).count, 2);
        await (await getDb()).prepare("UPDATE businesses SET name='Settings After Publication',contact_email='after@settings.test' WHERE id=?").run(businessId);
        const rolledBack = await rollbackCatalogVersion(manager, businessId, 2);
        assert.equal(rolledBack.contentVersion, 4);
        const restored = (await getCatalogByBusinessId(businessId, true))!;
        assert.equal(restored.business.hero_title, "Original live hero");
        assert.equal(restored.business.name, "Settings After Publication");
        assert.equal(restored.business.contact_email, "after@settings.test");
        assert.equal(restored.business.logo_path, "/media/current-logo.webp");
        assert.equal(restored.business.design_key, "composition");
        assert.doesNotThrow(() => JSON.parse(restored.business.design_manifest_json));
        assert.doesNotThrow(() => JSON.parse(restored.business.content_blocks_json));
        assert.equal(restored.business.content_version, 4);
        assert.equal((await (await getDb()).prepare("SELECT COUNT(*) count FROM published_catalog_versions WHERE (snapshot_json::jsonb->>'schemaVersion')::int<>4").get() as {
            count: number;
        }).count, 0);
        assert.equal((await (await getDb()).prepare("SELECT COUNT(*) count FROM content_revisions WHERE snapshot_schema_version<>(snapshot_json::jsonb->>'schemaVersion')::int").get() as {
            count: number;
        }).count, 0);
        assert.deepEqual((await (await getDb()).prepare("SELECT version FROM schema_migrations ORDER BY version").all() as Array<{
            version: number;
        }>).map((item) => item.version), Array.from({ length: 43 }, (_, index) => index + 1));
        console.log("Schema-v4 revision approval, settings preservation, publication conflict, atomic composition replacement, and rollback tests passed.");
        await closeDbForTests();
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch((error) => { console.error(error); process.exit(1); });
