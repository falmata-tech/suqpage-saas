import { closePostgresRuntimeForTests } from "../lib/postgres-runtime-services";
import { getMediaObjectStore } from "../lib/media-storage";
import { buildRuntimeMediaReferenceManifest } from "../lib/media-manifest";
async function main() {
    try {
      const manifest=await buildRuntimeMediaReferenceManifest();
      const store=getMediaObjectStore();let missing=0,failed=0;
      if(!process.argv.includes("--references-only")){
        for(const reference of manifest.references){try{if(!await store.read(reference.namespace,reference.key,reference.contentType))missing++;}catch{failed++;}}
      }
      console.log(JSON.stringify({provider:store.provider,referenced:manifest.references.length,byNamespace:manifest.references.reduce<Record<string,number>>((counts,ref)=>{counts[ref.namespace]=(counts[ref.namespace]||0)+1;return counts;},{}),objectsChecked:!process.argv.includes("--references-only"),missing,failed,invalidReferences:manifest.invalidReferenceCount,malformedDocuments:manifest.malformedDocumentCount,sourceDeleted:false,databaseChanged:false}));
      if(missing||failed||manifest.invalidReferenceCount||manifest.malformedDocumentCount)process.exitCode=1;
    } finally {await closePostgresRuntimeForTests();}

}
main().catch(() => { console.error("Media reconciliation failed; no data was changed."); process.exitCode=1; });
