import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

async function main() {
  process.env.SUQPAGE_RECIPE_STUDIO_ENABLED = "1";
  process.env.SUQPAGE_YOUTUBE_ADMISSION_ENABLED = "1";
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-recipe-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "recipe.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  try {
    const { closeDbForTests, getDb, getUserById } = await import("../lib/db");
    const { createDraftRevision, getContentRevision } = await import(
      "../lib/revision-service"
    );
    const {
      admitRecipeImage,
      admitRecipeYouTube,
      buildShowroomRecipeBrief,
      importShowroomRecipe,
      SHOWROOM_RECIPE_BRIEF_CONTRACTS,
    } = await import("../lib/showroom-recipe-service");
    const { ShowroomRecipeError } = await import(
      "../lib/showroom-recipe-domain"
    );
    const db = getDb();
    const businessId = Number(
      db.prepare(
        "INSERT INTO businesses(handle,name,design_key,hero_title,status) VALUES('recipe-test','Recipe Test','novatech','Original hero','active')",
      ).run().lastInsertRowid,
    );
    const collectionId = Number(
      db.prepare(
        "INSERT INTO collections(business_id,name,slug) VALUES(?,'Original','original')",
      ).run(businessId).lastInsertRowid,
    );
    db.prepare(
      "INSERT INTO products(business_id,collection_id,name,slug,description,availability,is_published) VALUES(?,?,'Original product','original-product','Original supplied description','available',1)",
    ).run(businessId, collectionId);
    const user = (
      email: string,
      role: "client" | "operations_manager" | "team_member",
      ownedBusiness: number | null = null,
    ) => {
      const id = Number(
        db.prepare(
          "INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)",
        ).run(email, email, ownedBusiness).lastInsertRowid,
      );
      db.prepare(
        "INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)",
      ).run(id, role);
      return getUserById(id)!;
    };
    const client = user("recipe-client@test.local", "client", businessId);
    const manager = user("recipe-manager@test.local", "operations_manager");
    const team = user("recipe-team@test.local", "team_member");
    const outsider = user("recipe-outsider@test.local", "team_member");
    const requestId = Number(
      db.prepare(
        `INSERT INTO service_requests(
          public_ref,business_id,represented_client_user_id,request_type,status,
          contact_name,contact_value,business_name,request_text,submitter_kind,
          submitted_by_user_id,assigned_user_id
        ) VALUES(
          'REQ-RECIPE0001',?,?,'change','in_progress','Recipe Client',
          'recipe-client@test.local','Recipe Test',
          'Make the showroom warmer and keep the supplied product facts.',
          'client',?,?
        )`,
      ).run(businessId, client.id, client.id, team.id).lastInsertRowid,
    );
    db.prepare(
      "INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active) VALUES(?,?,?,1)",
    ).run(team.id, businessId, manager.id);

    const draft = createDraftRevision(team, requestId);
    const wideImage = await sharp({
      create: {
        width: 1200,
        height: 600,
        channels: 4,
        background: { r: 80, g: 50, b: 20, alpha: 1 },
      },
    }).png().toBuffer();
    await assert.rejects(
      () =>
        admitRecipeImage(
          team,
          draft.id,
          new File([wideImage], "wide.png", { type: "image/png" }),
          "Wide approved hero",
          false,
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.path === "$.media.rights",
    );
    const admitted = await admitRecipeImage(
      team,
      draft.id,
      new File([wideImage], "wide.png", { type: "image/png" }),
      "Wide approved hero",
      true,
    );
    assert.match(admitted.assetKey, /^asset_[a-f0-9]{20}$/);
    assert.throws(
      () =>
        admitRecipeYouTube(
          team,
          draft.id,
          "https://youtube.example/watch?v=dQw4w9WgXcQ",
          "Approved process film",
          true,
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.path === "$.media.url",
    );
    assert.throws(
      () =>
        admitRecipeYouTube(
          team,
          draft.id,
          "https://youtu.be/dQw4w9WgXcQ",
          "Approved process film",
          false,
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.path === "$.media.rights",
    );
    assert.throws(
      () =>
        admitRecipeYouTube(
          outsider,
          draft.id,
          "https://youtu.be/dQw4w9WgXcQ",
          "Approved process film",
          true,
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError && error.status === 404,
    );
    const video = admitRecipeYouTube(
      team,
      draft.id,
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=12",
      "Approved process film",
      true,
    );
    assert.match(video.assetKey, /^asset_[a-f0-9]{20}$/);
    assert.equal(video.duplicate, false);
    assert.deepEqual(
      admitRecipeYouTube(
        team,
        draft.id,
        "https://youtu.be/dQw4w9WgXcQ?si=discarded",
        "Duplicate process film",
        true,
      ),
      { ...video, duplicate: true },
    );
    const exported = buildShowroomRecipeBrief(team, draft.id);
    const serializedBrief = JSON.stringify(exported.brief);
    assert.equal(serializedBrief.includes("password_hash"), false);
    assert.equal(serializedBrief.includes("session"), false);
    assert.equal(exported.brief.mediaManifest.length, 2);
    assert.equal(
      exported.brief.mediaManifest.some(
        (entry) =>
          entry.kind === "video" &&
          entry.source === "controlled_youtube" &&
          entry.key === video.assetKey,
      ),
      true,
    );
    assert.equal(serializedBrief.includes("dQw4w9WgXcQ"), false);
    assert.deepEqual(
      exported.brief.contractManifest,
      SHOWROOM_RECIPE_BRIEF_CONTRACTS,
    );
    assert.deepEqual(exported.brief.contractManifest, {
      brief: "suqpage.recipe-brief@1",
      recipe: "suqpage.showroom-recipe@1",
      content: "suqpage.showroom-content@1",
      contentBlocks: "suqpage.showroom-content-blocks@1",
      design: "suqpage.showroom-design@2",
      componentBankSchema: "suqpage.component-bank@2",
      componentBankRelease: "showroom-bank@1.2.0",
      designSystems: "suqpage.showroom-design-systems@2",
    });
    assert.equal(exported.brief.requiredRecipeSchemaVersion, 1);
    assert.equal(exported.brief.requiredContentSchemaVersion, 1);
    assert.equal(exported.brief.requiredContentBlocksSchemaVersion, 1);
    assert.equal(exported.brief.requiredDesignSchemaVersion, 2);
    assert.equal(exported.brief.requiredComponentBankSchemaVersion, 2);
    assert.equal(
      exported.brief.schemas.design.properties.schemaVersion.const,
      2,
    );
    assert.equal(
      exported.brief.schemas.componentBank.properties.schemaVersion.const,
      2,
    );
    assert.equal(
      exported.brief.schemas.contentBlocks.properties.schemaVersion.const,
      1,
    );
    assert.ok(
      exported.brief.schemas.content.required.includes("contentBlocks"),
    );
    assert.equal(
      exported.brief.schemas.recipe.properties.design.$ref,
      "showroom-proposal-v2.schema.json",
    );
    assert.ok(
      exported.brief.schemas.recipe.$defs.mediaPlanSlot.allOf.some(
        (condition) =>
          condition.then?.properties?.slotKey?.const === "product_image",
      ),
    );
    assert.match(exported.brief.instructions[0], /do not normalize/i);
    assert.ok(
      exported.brief.instructions.some((instruction) =>
        /Choose mediaIntegration from compositionGuidance\.mediaTreatments/.test(instruction),
      ),
    );
    assert.ok(
      exported.brief.instructions.some((instruction) =>
        /Product images always use slotKey product_image/.test(instruction),
      ),
    );
    assert.equal(exported.brief.examplePolicy.importable, false);
    assert.match(exported.brief.instructions[1], /synthetic structural reference/i);
    assert.equal(
      exported.brief.instructions.some((instruction) =>
        instruction.includes("surfaceRole"),
      ),
      true,
    );
    assert.equal(
      exported.brief.instructions.some((instruction) =>
        instruction.includes("surface_role"),
      ),
      false,
    );
    assert.equal(
      exported.brief.completeExample.content.business.name,
      "Reference Goods Studio",
    );
    assert.equal(
      JSON.stringify(exported.brief.completeExample).includes("Recipe Test"),
      false,
    );
    assert.equal(
      exported.brief.blockAssignmentChecklist.length,
      exported.brief.currentContent.contentBlocks.blocks.length,
    );
    assert.ok(
      exported.brief.blockAssignmentChecklist.every(
        (entry) => entry.compatibleComponents.length > 0,
      ),
    );
    const productDestination = exported.brief.allowedMediaDestinations.find(
      (entry) => entry.ownerType === "product",
    );
    assert.ok(productDestination);
    assert.equal(productDestination.slotKey, "product_image");
    assert.equal(exported.brief.completeExample.schemaVersion, 1);
    assert.equal(exported.brief.completeExample.content.schemaVersion, 1);
    assert.equal(exported.brief.completeExample.content.contentBlocks.schemaVersion, 1);
    assert.equal(exported.brief.completeExample.design.schemaVersion, 2);
    assert.equal(exported.brief.completeExample.content.collections.length, 1);
    assert.equal(exported.brief.completeExample.content.categories.length, 2);
    assert.equal(exported.brief.completeExample.content.products.length, 2);
    assert.equal(
      exported.brief.completeExample.content.products[0].optionGroups[0].values.length,
      2,
    );
    assert.equal(exported.brief.completeExample.mediaPlan.length, 2);
    assert.equal(exported.brief.completeExample.mediaPlan[0].slotKey, "product_image");
    assert.notEqual(exported.brief.completeExample.mediaPlan[0].ownerKey, productDestination.ownerKey);
    assert.ok(
      exported.brief.completeExample.design.sections
        .filter((section) =>
          ["hero-main", "brand-story"].includes(section.contentBlockKey || ""),
        )
        .every((section) => section.mediaIntegration),
    );
    assert.equal(exported.brief.designSystems.length, 18);
    assert.equal(exported.brief.compositionGuidance.templates.length, 8);
    assert.equal(
      exported.brief.compositionGuidance.designProcess.decisionOrder[2],
      "page_template",
    );
    assert.equal(
      exported.brief.compositionGuidance.mediaTreatments.surface_blend
        .visualWeight,
      "signature",
    );
    assert.equal(
      exported.brief.compositionGuidance.mediaTreatments.ambient_overlay.status,
      "legacy",
    );
    assert.ok(
      exported.brief.compositionGuidance.templates.every(
        (template) =>
          !("tokenPack" in template) &&
          !("components" in template) &&
          template.sectionPlan.length >= 6,
      ),
    );
    assert.equal(
      exported.brief.compositionGuidance.selectionPolicy
        .identifiersAreSuitabilitySignals,
      false,
    );
    assert.deepEqual(
      exported.brief.compositionGuidance.selectionPolicy.prohibitedSignals,
      ["industry", "business_archetype"],
    );
    assert.equal(
      Object.keys(exported.brief.compositionGuidance.components).length,
      67,
    );
    assert.equal(
      exported.brief.schemas.designSystem.items.properties.shape.properties.radius.maximum,
      8,
    );
    assert.equal(
      "archetypes" in
        exported.brief.schemas.designSystem.items.properties.guidance.properties,
      false,
    );
    assert.ok(
      exported.brief.designSystems.every(
        (system) => !("archetypes" in system.guidance),
      ),
    );
    assert.ok(
      Object.values(exported.brief.compositionGuidance.components).every(
        (guidance) =>
          !("businessArchetypes" in guidance) &&
          guidance.visualDescription.length > 40 &&
          guidance.avoidWhen.length > 0 &&
          guidance.renderedAnatomy.regions.length > 0,
      ),
    );
    assert.equal(
      exported.brief.schemas.designSystem.items.properties.media.properties
        .allowedHeroIntegrations.minItems,
      2,
    );
    const heroIntegrations = new Set(
      Object.entries(exported.brief.compositionGuidance.components)
        .filter(([id]) => id.startsWith("hero."))
        .flatMap(([, guidance]) => guidance.compatibleMediaIntegrations),
    );
    assert.ok(heroIntegrations.size >= 6);
    assert.equal(heroIntegrations.has("surface_blend"), true);
    assert.equal(
      JSON.stringify(exported.brief.mediaManifest).includes("storage_key"),
      false,
    );
    assert.throws(
      () =>
        importShowroomRecipe(
          team,
          draft.id,
          structuredClone(exported.brief.completeExample),
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        ["provenance", "tenant_asset"].includes(error.issues[0]?.category),
    );
    const recipe = structuredClone(exported.brief.completeExample);
    const {
      schemaVersion: _snapshotSchemaVersion,
      designManifest,
      ...currentContent
    } = exported.brief.currentContent;
    recipe.content = { schemaVersion: 1, ...currentContent };
    recipe.design = designManifest;
    const currentSource = exported.brief.sourceFacts.find(
      (source) => source.kind === "current_showroom",
    );
    assert.ok(currentSource);
    recipe.provenance = [
      "$.content.business.name",
      "$.content.products[0].name",
      "$.content.products[0].description",
      "$.content.products[0].availability",
    ].map((path) => ({
      path,
      sourceKey: currentSource.key,
      kind: "source_fact" as const,
    }));
    recipe.mediaPlan = [
      {
        key: "media-client-product",
        ownerType: "product" as const,
        ownerKey: productDestination.ownerKey,
        slotKey: "product_image",
        label: "Original product photography",
        purpose: "Add authorized factual product photography.",
        required: false,
        aspectRatio: "landscape" as const,
        altText: "Original product",
        classification: "factual" as const,
      },
    ];
    recipe.summary = "Validated imported showroom recipe.";
    recipe.content.business.heroTitle = "Recipe-approved public hero";
    recipe.content.business.heroImageRef = admitted.assetKey;
    recipe.design.sections[1].component = "hero.room-scene@1";
    const imported = importShowroomRecipe(team, draft.id, recipe);
    assert.equal(imported.difference.products.after, 1);
    assert.equal(imported.difference.designSections.after, 8);
    assert.equal(imported.recipe.mediaPlan[0].slotKey, "product_image");
    assert.equal(
      imported.recipe.mediaPlan[0].ownerKey,
      imported.snapshot.products[0].key,
    );
    assert.notEqual(
      imported.recipe.mediaPlan[0].ownerKey,
      productDestination.ownerKey,
    );
    assert.equal(
      getContentRevision(draft.id)?.summary,
      "Validated imported showroom recipe.",
    );
    assert.equal(
      JSON.parse(getContentRevision(draft.id)!.snapshot_json).contentBlocks.blocks
        .find((block: { key: string }) => block.key === "hero-main").title,
      "Recipe-approved public hero",
    );
    assert.match(getContentRevision(draft.id)?.recipe_import_hash || "", /^[a-f0-9]{64}$/);
    assert.equal(importShowroomRecipe(team, draft.id, recipe).duplicate, true);

    const withInventory = structuredClone(recipe) as unknown as {
      content: { products: Array<Record<string, unknown>> };
    };
    withInventory.content.products[0].stock = 9;
    assert.throws(
      () => importShowroomRecipe(team, draft.id, withInventory),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.category === "content",
    );
    const silentRemoval = structuredClone(recipe);
    silentRemoval.content.products = [];
    silentRemoval.mediaPlan = [];
    silentRemoval.provenance = silentRemoval.provenance.filter(
      (entry) => !entry.path.startsWith("$.content.products"),
    );
    assert.throws(
      () => importShowroomRecipe(team, draft.id, silentRemoval),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.category === "provenance",
    );
    const unresolved = structuredClone(recipe) as unknown as Record<
      string,
      unknown
    > & { questions: string[] };
    unresolved.questions = ["Which certification is authorized?"];
    assert.throws(
      () => importShowroomRecipe(team, draft.id, unresolved),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.path === "$.questions",
    );
    const unknownComponent = structuredClone(recipe);
    unknownComponent.design.sections[0].component = "hero.unknown@1";
    assert.throws(
      () => importShowroomRecipe(team, draft.id, unknownComponent),
      (error: unknown) =>
        error instanceof ShowroomRecipeError &&
        error.issues[0]?.category === "design",
    );
    assert.throws(
      () => buildShowroomRecipeBrief(client, draft.id),
      (error: unknown) =>
        error instanceof ShowroomRecipeError && error.status === 404,
    );
    assert.throws(
      () => importShowroomRecipe(outsider, draft.id, recipe),
      (error: unknown) =>
        error instanceof ShowroomRecipeError && error.status === 404,
    );
    process.env.SUQPAGE_RECIPE_STUDIO_ENABLED = "0";
    assert.throws(
      () => buildShowroomRecipeBrief(manager, draft.id),
      (error: unknown) =>
        error instanceof ShowroomRecipeError && error.status === 404,
    );
    process.env.SUQPAGE_RECIPE_STUDIO_ENABLED = "1";
    process.env.SUQPAGE_YOUTUBE_ADMISSION_ENABLED = "0";
    assert.throws(
      () =>
        admitRecipeYouTube(
          team,
          draft.id,
          "https://youtu.be/dQw4w9WgXcQ",
          "Approved process film",
          true,
        ),
      (error: unknown) =>
        error instanceof ShowroomRecipeError && error.status === 404,
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) count FROM content_revisions").get()?.count,
      1,
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=11").get()?.count,
      1,
    );
    assert.equal(
      db.prepare("SELECT COUNT(*) count FROM schema_migrations WHERE version=12").get()?.count,
      1,
    );
    console.log(
      "Recipe brief privacy, strict stockless import, design validation, reconciliation, scope, and private draft save passed.",
    );
    closeDbForTests();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
