import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

async function main() {
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
      buildShowroomRecipeBrief,
      importShowroomRecipe,
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
    const exported = buildShowroomRecipeBrief(team, draft.id);
    const serializedBrief = JSON.stringify(exported.brief);
    assert.equal(serializedBrief.includes("password_hash"), false);
    assert.equal(serializedBrief.includes("session"), false);
    assert.equal(exported.brief.mediaManifest.length, 1);
    assert.equal(
      JSON.stringify(exported.brief.mediaManifest).includes("storage_key"),
      false,
    );
    const recipe = structuredClone(exported.brief.completeExample);
    recipe.summary = "Validated imported showroom recipe.";
    recipe.content.business.heroImageRef = admitted.assetKey;
    recipe.design.sections[1].component = "hero.material-detail@1";
    const imported = importShowroomRecipe(team, draft.id, recipe);
    assert.equal(imported.difference.products.after, 1);
    assert.equal(imported.difference.designSections.after, 8);
    assert.equal(
      getContentRevision(draft.id)?.summary,
      "Validated imported showroom recipe.",
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
