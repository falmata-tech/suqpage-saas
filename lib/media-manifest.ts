import { runtimeAll } from "./runtime-sql";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { mediaMime } from "./media";
import {
  assertMediaObjectKey,
  type MediaNamespace,
} from "./media-storage";

export type MediaManifestReference = {
  namespace: MediaNamespace;
  key: string;
  contentType: string;
  sources: string[];
};

export type MediaReferenceManifest = {
  references: MediaManifestReference[];
  invalidReferenceCount: number;
  malformedDocumentCount: number;
};

export type LocalMediaObject = {
  namespace: MediaNamespace;
  key: string;
  fullPath: string;
  contentType: string;
  contentLength: number;
  sha256: string;
};

type ColumnSource = {
  table: string;
  column: string;
};

const DIRECT_PUBLIC_COLUMNS: ColumnSource[] = [
  { table: "businesses", column: "logo_path" },
  { table: "businesses", column: "hero_image_path" },
  { table: "businesses", column: "favicon_path" },
  { table: "products", column: "image_path" },
  { table: "business_discovery_profiles", column: "booth_image_path" },
  { table: "bazaar_booth_profiles", column: "booth_image_path" },
];

const JSON_DOCUMENT_COLUMNS: ColumnSource[] = [
  { table: "products", column: "media_json" },
  { table: "businesses", column: "content_blocks_json" },
  { table: "businesses", column: "design_manifest_json" },
  { table: "content_revisions", column: "snapshot_json" },
  { table: "content_revisions", column: "recipe_metadata_json" },
  { table: "published_catalog_versions", column: "snapshot_json" },
  { table: "owner_page_drafts", column: "content_json" },
  { table: "owner_page_publications", column: "content_json" },
];

const PUBLIC_MEDIA_PREFIX = "/media/";
const digest = (bytes: Buffer) =>
  crypto.createHash("sha256").update(bytes).digest("hex");
const identity = (namespace: MediaNamespace, key: string) => `${namespace}:${key}`;



function addReference(
  references: Map<string, MediaManifestReference>,
  namespace: MediaNamespace,
  key: string,
  contentType: string,
  source: string,
) {
  const id = identity(namespace, key);
  const existing = references.get(id);
  if (existing) {
    if (!existing.sources.includes(source)) existing.sources.push(source);
    return;
  }
  references.set(id, { namespace, key, contentType, sources: [source] });
}

function visitJsonStrings(value: unknown, visit: (value: string) => void) {
  if (typeof value === "string") {
    visit(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => visitJsonStrings(item, visit));
    return;
  }
  if (!value || typeof value !== "object") return;
  Object.values(value).forEach((item) => visitJsonStrings(item, visit));
}

type DocumentSource = ColumnSource & { rows: Array<{value:string|null}> };
type AttachmentSource = { table:string; namespace:MediaNamespace; rows:Array<{storage_key:string;mime_type:string}> };

function collectManifest(direct:DocumentSource[], documents:DocumentSource[], attachments:AttachmentSource[]):MediaReferenceManifest {
 const references=new Map<string,MediaManifestReference>();let invalidReferenceCount=0,malformedDocumentCount=0;
 const visit=(value:string,source:string)=>{
  let namespace:MediaNamespace='public',key='';
  if(value.startsWith('/media/')){key=value.slice(7);if(/^product-private-[1-9]\d*-/.test(key))namespace='pages';}
  else if(value.startsWith('/api/page-drafts/')||value.startsWith('/api/page-media/')){
   const match=/^\/api\/(?:page-drafts\/([1-9]\d*)\/media|page-media\/([1-9]\d*))\/(page-([1-9]\d*)-[a-f0-9-]+\.(?:png|jpg|webp))$/.exec(value);
   if(!match||String(match[1]||match[2])!==match[4]){invalidReferenceCount++;return;}key=match[3];namespace='pages';
  }else return;
  try{assertMediaObjectKey(key);addReference(references,namespace,key,mediaMime(key),source);}catch{invalidReferenceCount++;}
 };
 for(const source of direct)for(const row of source.rows)if(row.value)visit(row.value,`${source.table}.${source.column}`);
 for(const source of documents)for(const row of source.rows){
  if(!row.value)continue;let doc:unknown;try{doc=JSON.parse(row.value);}catch{malformedDocumentCount++;continue;}
  visitJsonStrings(doc,value=>visit(value,`${source.table}.${source.column}`));
 }
 for(const source of attachments)for(const row of source.rows){try{assertMediaObjectKey(row.storage_key);addReference(references,source.namespace,row.storage_key,row.mime_type,`${source.table}.storage_key`);}catch{invalidReferenceCount++;}}
 return {references:[...references.values()].map(ref=>({...ref,sources:ref.sources.sort()})).sort((a,b)=>identity(a.namespace,a.key).localeCompare(identity(b.namespace,b.key))),invalidReferenceCount,malformedDocumentCount};
}
const attachmentSources:Array<{table:string;namespace:MediaNamespace}>=[{table:'request_attachments',namespace:'requests'},{table:'support_attachments',namespace:'support'}];
export async function buildRuntimeMediaReferenceManifest():Promise<MediaReferenceManifest>{
 // Identifiers come only from the fixed source lists; returned private data is never logged.
 const columns=await runtimeAll<{table_name:string;column_name:string}>("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=current_schema()");
 const has=(table:string,column:string)=>columns.some(row=>row.table_name===table&&row.column_name===column);
 const read=async(sources:ColumnSource[])=>Promise.all(sources.filter(source=>has(source.table,source.column)).map(async source=>({...source,rows:await runtimeAll<{value:string|null}>(`SELECT ${source.column} value FROM ${source.table}`)})));
 const [direct,documents,attachments]=await Promise.all([read(DIRECT_PUBLIC_COLUMNS),read(JSON_DOCUMENT_COLUMNS),Promise.all(attachmentSources.filter(source=>has(source.table,'storage_key')).map(async source=>({...source,rows:await runtimeAll<{storage_key:string;mime_type:string}>(`SELECT storage_key,mime_type FROM ${source.table}`)})))]);
 return collectManifest(direct,documents,attachments);
}

export function listLocalMediaObjects(
  publicRoot: string,
  requestRoot: string,
  supportRoot: string,
  pagesRoot = path.join(requestRoot, "pages"),
): LocalMediaObject[] {
  const roots: Array<{ namespace: MediaNamespace; root: string }> = [
    { namespace: "public", root: publicRoot },
    { namespace: "requests", root: requestRoot },
    { namespace: "support", root: supportRoot },
    { namespace: "pages", root: pagesRoot },
  ];
  const objects: LocalMediaObject[] = [];
  for (const { namespace, root } of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      try {
        assertMediaObjectKey(entry.name);
      } catch {
        continue;
      }
      const fullPath = path.join(root, entry.name);
      const bytes = fs.readFileSync(fullPath);
      objects.push({
        namespace,
        key: entry.name,
        fullPath,
        contentType: mediaMime(entry.name),
        contentLength: bytes.byteLength,
        sha256: digest(bytes),
      });
    }
  }
  return objects.sort((left, right) =>
    identity(left.namespace, left.key).localeCompare(
      identity(right.namespace, right.key),
    ),
  );
}

export function reconcileLocalMedia(
  manifest: MediaReferenceManifest,
  localObjects: LocalMediaObject[],
) {
  const expected = new Set(
    manifest.references.map((reference) =>
      identity(reference.namespace, reference.key),
    ),
  );
  const present = new Set(
    localObjects.map((object) => identity(object.namespace, object.key)),
  );
  return {
    referenced: expected.size,
    present: present.size,
    missing: [...expected].filter((key) => !present.has(key)).length,
    unreferenced: [...present].filter((key) => !expected.has(key)).length,
    invalidReferences: manifest.invalidReferenceCount,
    malformedDocuments: manifest.malformedDocumentCount,
    bytesChecked: localObjects.reduce(
      (total, object) => total + object.contentLength,
      0,
    ),
  };
}

export function mediaObjectIdentity(namespace: MediaNamespace, key: string) {
  return identity(namespace, key);
}
