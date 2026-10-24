import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
async function main() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-upkeep-"));
    process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
    process.env.SUQPAGE_BACKUP_ROOT = path.join(root, "backups");
    process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "1";
    try {
        const { closeDbForTests, getCatalogByBusinessId, getDb, getUserById } = await import("./testing/postgres-fixture");
        const { catalogToRevisionSnapshot } = await import("../lib/revision-domain");
        const { curatedManifestForLegacyDesign } = await import("../lib/showroom-manifests");
        const { executeBasicProductUpkeep: executeWithPort } = await import("../lib/product-upkeep");
        const { postgresProductUpkeepPort } = await import("../lib/product-upkeep-postgres");
        const { parseBasicProductCommand, ProductUpkeepError } = await import("../lib/product-upkeep-domain");
        const {offeringDto} = await import("../lib/mobile/projections");
        const { stageUploadedImage } = await import("../lib/media");
        const executeBasicProductUpkeep = (user: Parameters<typeof executeWithPort>[1], command: Parameters<typeof executeWithPort>[2], stagedImage: Parameters<typeof executeWithPort>[3]) => executeWithPort(postgresProductUpkeepPort, user, command, stagedImage);
        const db = await getDb();
        const createBusiness = async (handle: string, name: string) => {
            const businessId = Number((await db
                .prepare("INSERT INTO businesses(handle,name,design_key,design_manifest_json,status) VALUES(?,?,'composition',?,'active')")
                .run(handle, name, JSON.stringify(curatedManifestForLegacyDesign("novatech")))).insertedId);
            const collectionId = Number((await db
                .prepare("INSERT INTO collections(business_id,name,slug) VALUES(?,'Main','main')")
                .run(businessId)).insertedId);
            const categoryId = Number((await db
                .prepare("INSERT INTO categories(business_id,collection_id,name,slug) VALUES(?,?,'Featured','featured')")
                .run(businessId, collectionId)).insertedId);
            const productId = Number((await db
                .prepare(`INSERT INTO products(
              business_id,collection_id,category_id,name,slug,eyebrow,
              description,image_path,availability,is_published,sort_order
            ) VALUES(?,?,?,'Original product','stable-product','Protected label',
              'Original description','','available',1,7)`)
                .run(businessId, collectionId, categoryId)).insertedId);
            const groupId = Number((await db
                .prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,'Color',0)")
                .run(productId)).insertedId);
            await db.prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,'Blue')").run(groupId);
            const snapshot = catalogToRevisionSnapshot((await getCatalogByBusinessId(businessId, true))!);
            await db.prepare("INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind) VALUES(?,1,?,'baseline')").run(businessId, JSON.stringify(snapshot));
            return { businessId, collectionId, categoryId, productId };
        };
        const tenantA = await createBusiness("upkeep-a", "Upkeep A");
        const tenantB = await createBusiness("upkeep-b", "Upkeep B");
        assert.equal((await db
            .prepare("SELECT COUNT(*) count FROM published_catalog_versions WHERE content_version=1")
            .get())?.count, 2);
        assert.equal((await db
            .prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=10")
            .get())?.count, 1);
        const createUser = async (email: string, accessRole: "client" | "team_member" | "operations_manager" | "platform_admin", businessId: number | null = null) => {
            const userId = Number((await db
                .prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,?,?)")
                .run(email, email, accessRole === "client" ? "owner" : "admin", businessId)).insertedId);
            await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)").run(userId, accessRole);
            return (await getUserById(userId))!;
        };
        const clientA = await createUser("client-a@example.test", "client", tenantA.businessId);
        const clientB = await createUser("client-b@example.test", "client", tenantB.businessId);
        const assignedTeam = await createUser("team-a@example.test", "team_member");
        const unassignedTeam = await createUser("team-b@example.test", "team_member");
        const manager = await createUser("manager@example.test", "operations_manager");
        const admin = await createUser("admin@example.test", "platform_admin");
        for(const staff of [assignedTeam,manager])await db.prepare("INSERT INTO staff_business_grants(user_id,enabled,version,updated_at) VALUES(?,1,1,1)").run(staff.id);
        await db.prepare("INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1),(?,?,?,1)").run(assignedTeam.id, tenantA.businessId, manager.id,unassignedTeam.id,tenantA.businessId,manager.id);
        const command = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
            kind: "create",
            businessId: tenantA.businessId,
            productId: null,
            expectedContentVersion: 1,
            idempotencyKey: "upkeep_create_000001",
            name: "New client product",
            description: "A client-created product description.",
            availability: "limited",
            offeringKind: "made_to_order",
            quantityMode: "optional",
            orderScope: "both",
            capacitySummary: "Up to 500 assemblies per month",
            minimumOrderSummary: "Prototype or 25-unit production run",
            leadTimeSummary: "Prototype in 10 working days",
            priceMinor: 125000,
            quantityUnit: "per assembly",
            highlights: ["Custom dimensions", "Documented material options"],
            videoRef: "youtube:M7lc1UVf-VE",
            categoryId: tenantA.categoryId,
            imageAction: "keep",
            serviceNote: "",
            ...overrides,
        });
        const throwsCode = (code: string) => (error: unknown) => error instanceof ProductUpkeepError && error.code === code;
        let invalidImageDiscarded = false;
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ name: "", imageAction: "replace" }), {
            imageRef: "/media/uncommitted-invalid.png",
            digest: "invalid-upload-digest",
            discard: async () => {
                invalidImageDiscarded = true;
            },
        }), /Product name is required/);
        assert.equal(invalidImageDiscarded, true);
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ offeringKind: "unknown_kind" }), null), /Choose Ready to ship or Made to order/);
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ quantityMode: "inventory" }), null), /desired-quantity policy/);
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ orderScope: "wholesale_verified" }), null), /valid order size/);
        assert.equal(parseBasicProductCommand(command({ quantityMode: "required" }))
            .quantityMode, "optional");
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ capacitySummary: "x".repeat(181) }), null), /Capacity is too long/);
        assert.throws(() => parseBasicProductCommand(command({ priceMinor: -1 })), (error: unknown) => error instanceof ProductUpkeepError);
        assert.throws(() => parseBasicProductCommand(command({ highlights: Array.from({ length: 7 }, (_, index) => `Highlight ${index}`) })), /no more than six/);
        const created = await executeBasicProductUpkeep(clientA, command(), null);
        assert.deepEqual({ version: created.contentVersion, duplicate: created.duplicate }, { version: 2, duplicate: false });
        const createdProduct = await db
            .prepare("SELECT business_id,collection_id,category_id,is_published,availability,offering_kind,quantity_mode,order_scope,capacity_summary,minimum_order_summary,lead_time_summary,price_minor,currency,quantity_unit,highlights_json,video_ref FROM products WHERE id=?")
            .get(created.productId) as Record<string, unknown>;
        assert.deepEqual({ ...createdProduct }, {
            business_id: tenantA.businessId,
            collection_id: null,
            category_id: tenantA.categoryId,
            is_published: 1,
            availability: "limited",
            offering_kind: "made_to_order",
            quantity_mode: "optional",
            order_scope: "both",
            capacity_summary: "Up to 500 assemblies per month",
            minimum_order_summary: "Prototype or 25-unit production run",
            lead_time_summary: "Prototype in 10 working days",
            price_minor: 125000,
            currency: "ETB",
            quantity_unit: "per assembly",
            highlights_json: JSON.stringify([
                "Custom dimensions",
                "Documented material options",
            ]),
            video_ref: "youtube:M7lc1UVf-VE",
        });
        assert.equal((await db
            .prepare("SELECT change_kind FROM published_catalog_versions WHERE business_id=? AND content_version=2")
            .get(tenantA.businessId))?.change_kind, "product_upkeep");
        const retry = await executeBasicProductUpkeep(clientA, command(), null);
        assert.deepEqual({ id: retry.productId, duplicate: retry.duplicate }, { id: created.productId, duplicate: true });
        assert.equal((await db.prepare("SELECT content_version FROM businesses WHERE id=?").get(tenantA.businessId))?.content_version, 2);
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({ name: "Conflicting reuse" }), null), throwsCode("idempotency_conflict"));
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({
            idempotencyKey: "upkeep_stale_000001",
            expectedContentVersion: 1,
        }), null), throwsCode("stale_version"));
        await assert.rejects(() => executeBasicProductUpkeep(clientB, command({
            idempotencyKey: "upkeep_cross_000001",
            expectedContentVersion: 2,
        }), null), (error: unknown) => error instanceof ProductUpkeepError && error.status === 403);
        await assert.rejects(() => executeBasicProductUpkeep(unassignedTeam, command({
            idempotencyKey: "upkeep_unassigned_1",
            expectedContentVersion: 2,
            serviceNote: "Client support request.",
        }), null), (error: unknown) => error instanceof ProductUpkeepError && error.status === 403);
        await assert.rejects(() => executeBasicProductUpkeep(assignedTeam, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_note_000001",
            expectedContentVersion: 2,
        }), null), throwsCode("service_note_required"));
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({
            idempotencyKey: "upkeep_collection_01",
            expectedContentVersion: 2,
            collectionId: tenantA.collectionId,
        }), null), throwsCode("unsupported_fields"));
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_structure_01",
            expectedContentVersion: 2,
            categoryId: tenantB.categoryId,
        }), null), throwsCode("structure_not_found"));
        const teamUpdate = await executeBasicProductUpkeep(assignedTeam, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_team_000001",
            expectedContentVersion: 2,
            name: "Team-assisted name",
            description: "Updated on behalf of the client.",
            availability: "coming_soon",
            serviceNote: "Client requested this update by phone.",
        }), null);
        assert.equal(teamUpdate.contentVersion, 3);
        await db.prepare('UPDATE staff_business_grants SET enabled=0,version=version+1 WHERE user_id=?').run(assignedTeam.id);
        await assert.rejects(() => executeBasicProductUpkeep(assignedTeam, command({
            kind: 'update',productId:tenantA.productId,idempotencyKey:'upkeep_revoked_0001',expectedContentVersion:3,
            serviceNote:'Attempt after administrator revoked business management.',
        }), null), throwsCode('forbidden'));
        assert.deepEqual({
            ...(await db
                .prepare("SELECT collection_id,category_id,slug,eyebrow,is_published,sort_order FROM products WHERE id=?")
                .get(tenantA.productId) as Record<string, unknown>),
        }, {
            collection_id: null,
            category_id: tenantA.categoryId,
            slug: "stable-product",
            eyebrow: "Protected label",
            is_published: 1,
            sort_order: 7,
        });
        assert.equal((await db
            .prepare("SELECT COUNT(*) count FROM option_values v JOIN option_groups g ON g.id=v.option_group_id WHERE g.product_id=? AND g.name='Color' AND v.value='Blue'")
            .get(tenantA.productId))?.count, 1);
        const imageBytes = await sharp({
            create: {
                width: 8,
                height: 8,
                channels: 4,
                background: { r: 90, g: 40, b: 180, alpha: 1 },
            },
        })
            .png()
            .toBuffer();
        const replacement = await stageUploadedImage(new File([imageBytes], "product.png", { type: "image/png" }), "product");
        assert.ok(replacement);
        const managerUpdate = await executeBasicProductUpkeep(manager, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_manager_0001",
            expectedContentVersion: 3,
            name: "Manager-assisted name",
            description: "Manager supplied the verified image.",
            availability: "available",
            imageAction: "replace",
            serviceNote: "Image supplied during managed onboarding.",
        }), replacement);
        assert.equal(managerUpdate.contentVersion, 4);
        const retainedImageRef = String((await db.prepare("SELECT image_path FROM products WHERE id=?").get(tenantA.productId))?.image_path);
        const retainedImageFile = path.join(process.env.SUQPAGE_MEDIA_ROOT, path.basename(retainedImageRef));
        assert.match(retainedImageRef, /^\/media\/product-/);
        assert.equal(fs.existsSync(retainedImageFile), true);
        const staleImage = await stageUploadedImage(new File([imageBytes], "stale.png", { type: "image/png" }), "product");
        assert.ok(staleImage);
        const staleFile = path.join(process.env.SUQPAGE_MEDIA_ROOT, path.basename(staleImage.imageRef));
        await assert.rejects(() => executeBasicProductUpkeep(admin, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_admin_stale1",
            expectedContentVersion: 3,
            imageAction: "replace",
            serviceNote: "Attempted stale support update.",
        }), staleImage), throwsCode("stale_version"));
        assert.equal(fs.existsSync(staleFile), false);
        const removed = await executeBasicProductUpkeep(admin, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_admin_remove1",
            expectedContentVersion: 4,
            name: "Admin-assisted name",
            description: "Image removed while preserving retained history.",
            imageAction: "remove",
            serviceNote: "Client asked an administrator to remove the image.",
        }), null);
        assert.equal(removed.contentVersion, 5);
        assert.equal((await db.prepare("SELECT image_path FROM products WHERE id=?").get(tenantA.productId))?.image_path, "");
        assert.equal(fs.existsSync(retainedImageFile), true);
        assert.equal(String((await db
            .prepare("SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=4")
            .get(tenantA.businessId))?.snapshot_json).includes(retainedImageRef), true);
        process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "0";
        await assert.rejects(() => executeBasicProductUpkeep(clientA, command({
            kind: "update",
            productId: tenantA.productId,
            idempotencyKey: "upkeep_disabled_001",
            expectedContentVersion: 5,
        }), null), throwsCode("feature_disabled"));
        process.env.SUQPAGE_PRODUCT_UPKEEP_ENABLED = "1";
        assert.equal((await db.prepare("SELECT COUNT(*) total FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND NOT convalidated").get()).total, 0);
        assert.equal((await db
            .prepare("SELECT COUNT(*) count FROM audit_logs WHERE action='product.basic_upkeep_published'")
            .get())?.count, 4);
        const simple = await createBusiness("simple-owner", "Simple owner");
        const simpleUser = await createUser("simple@example.test", "client", simple.businessId);
        await db.prepare("UPDATE products SET offering_kind='manufacturing_capability',availability='limited',is_published=0,quantity_unit='piece',highlights_json='[\"Experienced team\"]',order_scope='bulk' WHERE id=?").run(simple.productId);
        const before = await db.prepare("SELECT * FROM products WHERE id=?").get(simple.productId);
        const simpleCommand = command({kind:"update",businessId:simple.businessId,productId:simple.productId,
          expectedContentVersion:1,idempotencyKey:"simple_owner_save_001",preserveMetadata:true,
          categoryId:tenantB.categoryId,offeringKind:undefined,optionGroups:[],isPublished:true});
        await executeBasicProductUpkeep(simpleUser, simpleCommand, null);
        const after = await db.prepare("SELECT * FROM products WHERE id=?").get(simple.productId);
        for (const key of ["offering_kind","availability","is_published","quantity_unit","highlights_json","category_id","collection_id","capacity_summary","minimum_order_summary","lead_time_summary","order_scope"]) assert.deepEqual(after[key],before[key],key);
        assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM option_groups WHERE product_id=?").get(simple.productId)).total,1);
        assert.equal(after.name,"New client product");
        assert.equal((await executeBasicProductUpkeep(simpleUser,simpleCommand,null)).duplicate,true);
        await assert.rejects(()=>executeBasicProductUpkeep(clientB,{...simpleCommand,idempotencyKey:"simple_foreign_001"},null),throwsCode("forbidden"));
        await assert.rejects(()=>executeBasicProductUpkeep(simpleUser,{...simpleCommand,idempotencyKey:"simple_stale_0001"},null),throwsCode("stale_version"));
        const listingCommand={...simpleCommand,expectedContentVersion:2,idempotencyKey:'simple_listing_state_001',updateListingState:true,availability:'unavailable',isPublished:true};
        const listingResult=await executeBasicProductUpkeep(simpleUser,listingCommand,null);
        const listed=await db.prepare('SELECT * FROM products WHERE id=?').get(simple.productId);
        assert.equal(listed.availability,'unavailable');assert.equal(listed.is_published,1);
        for(const key of ['offering_kind','quantity_mode','quantity_unit','highlights_json','category_id','collection_id','capacity_summary','minimum_order_summary','lead_time_summary','order_scope'])assert.deepEqual(listed[key],after[key],key);
        assert.equal((await db.prepare('SELECT COUNT(*) total FROM option_groups WHERE product_id=?').get(simple.productId)).total,1);
        assert.equal((await executeBasicProductUpkeep(simpleUser,listingCommand,null)).duplicate,true);
        await assert.rejects(()=>executeBasicProductUpkeep(clientB,{...listingCommand,idempotencyKey:'foreign_listing_state_001'},null),throwsCode('forbidden'));
        await assert.rejects(()=>executeBasicProductUpkeep(simpleUser,{...listingCommand,idempotencyKey:'stale_listing_state_001'},null),throwsCode('stale_version'));
        assert.equal((await db.prepare('SELECT content_version FROM businesses WHERE id=?').get(simple.businessId)).content_version,listingResult.contentVersion);
        const factsCommand={...simpleCommand,expectedContentVersion:3,idempotencyKey:'simple_facts_000001',updateSellingFacts:true,
          orderScope:'both',quantityUnit:'box',highlights:['Locally milled'],capacitySummary:'200 boxes each week',minimumOrderSummary:'One box',leadTimeSummary:'Ready in two days'};
        await assert.rejects(()=>executeBasicProductUpkeep(clientB,{...factsCommand,idempotencyKey:'foreign_facts_000001'},null),throwsCode('forbidden'));
        const savedFacts=await executeBasicProductUpkeep(simpleUser,factsCommand,null);
        const factRow=await db.prepare('SELECT * FROM products WHERE id=?').get(simple.productId);
        assert.deepEqual([factRow.order_scope,factRow.quantity_unit,factRow.highlights_json,factRow.minimum_order_summary,factRow.lead_time_summary,factRow.capacity_summary],
          ['both','box','["Locally milled"]','One box','Ready in two days','200 boxes each week']);
        const publicOffering=offeringDto((await getCatalogByBusinessId(simple.businessId,true))!.products.find(product=>product.id===simple.productId)!);
        assert.deepEqual([publicOffering.orderScope,publicOffering.quantityUnit,publicOffering.highlights,publicOffering.minimumOrderSummary],['both','box',['Locally milled'],'One box']);
        const published=await db.prepare('SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=?').get(simple.businessId,savedFacts.contentVersion);
        assert.equal(JSON.parse(published.snapshot_json).products.find((product:{key:string})=>product.key===`product-${simple.productId}`).orderScope,'both');
        assert.equal((await db.prepare('SELECT COUNT(*) total FROM schema_migrations WHERE version=80').get()).total,1);
        await assert.rejects(()=>db.prepare("UPDATE products SET order_scope='unsupported' WHERE id=?").run(simple.productId));
        console.log("Product upkeep role scope, protected fields, versions, idempotency, media cleanup, retention, and disable control passed.");
        await closeDbForTests();
    }
    finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
