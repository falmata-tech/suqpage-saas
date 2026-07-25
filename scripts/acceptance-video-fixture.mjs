import { DatabaseSync } from "node:sqlite";

const [, , databasePath, handle = "alhayabrand"] = process.argv;
if (!databasePath) {
  console.error("Usage: acceptance-video-fixture.mjs <database> [handle]");
  process.exit(2);
}

const database = new DatabaseSync(databasePath);
try {
  const row = database
    .prepare("SELECT id,design_manifest_json,content_blocks_json FROM businesses WHERE handle=?")
    .get(handle);
  if (!row) throw new Error(`Business ${handle} not found.`);
  const design = JSON.parse(row.design_manifest_json);
  const content = JSON.parse(row.content_blocks_json);
  if (!content.blocks.some((block) => block.key === "controlled-video-browser")) {
    content.blocks.push({
      key: "controlled-video-browser",
      type: "video",
      kicker: "Controlled film",
      title: "Approved process film",
      body: "A reviewed video chapter rendered from a managed provider reference.",
      media: [{
        slotKey: "video",
        assetKeys: ["youtube:dQw4w9WgXcQ"],
        altText: "Approved process film",
        caption: "",
      }],
      transcript: "Browser fixture transcript for controlled provider rendering.",
    });
  }
  if (!design.sections.some((section) => section.key === "content-video-browser")) {
    const catalogIndex = design.sections.findIndex((section) => section.key.startsWith("catalog"));
    const section = {
      key: "content-video-browser",
      component: "content.controlled-film@1",
      contentBlockKey: "controlled-video-browser",
      properties: {
        motion_intensity: "quiet",
        decorative_depth: "clean",
        reveal_style: "fade-rise",
        interaction_style: "quiet-lift",
        alignment: "start",
      },
      bindings: {
        title: "business.name",
        body: "business.description",
      },
    };
    if (catalogIndex === -1) design.sections.push(section);
    else design.sections.splice(catalogIndex, 0, section);
  }
  database
    .prepare("UPDATE businesses SET design_manifest_json=?,content_blocks_json=? WHERE id=?")
    .run(JSON.stringify(design), JSON.stringify(content), row.id);
  process.stdout.write(JSON.stringify({ handle, updated: true }));
} finally {
  database.close();
}
