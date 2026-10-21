import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import manifest from "../supabase/templates/manifest.json";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../supabase/templates");

/** Exact repository-owned branding fields; no provider or notification enablement. */
export function suqpageEmailBrandingPatch(): Record<string, string> {
  const patch: Record<string, string> = { smtp_sender_name: "MirtPage" };
  for (const entry of manifest) {
    patch[`mailer_subjects_${entry.key}`] = entry.subject;
    patch[`mailer_templates_${entry.key}_content`] = fs.readFileSync(path.join(directory, entry.file), "utf8");
  }
  return patch;
}
