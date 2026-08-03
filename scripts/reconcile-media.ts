import { DatabaseSync } from "node:sqlite";
import { databasePath, mediaRoot, requestAttachmentRoot } from "../lib/config";
import {
  buildMediaReferenceManifest,
  listLocalMediaObjects,
  reconcileLocalMedia,
} from "../lib/media-manifest";

function main() {
  const db = new DatabaseSync(databasePath(), { readOnly: true });
  try {
    const manifest = buildMediaReferenceManifest(db);
    const result = reconcileLocalMedia(
      manifest,
      listLocalMediaObjects(mediaRoot(), requestAttachmentRoot()),
    );
    console.log(JSON.stringify({
      provider: "filesystem",
      ...result,
      sourceDeleted: false,
      databaseChanged: false,
    }));
    if (
      result.missing ||
      result.invalidReferences ||
      result.malformedDocuments
    ) {
      process.exitCode = 1;
    }
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Media reconciliation failed.",
  );
  process.exit(1);
}
