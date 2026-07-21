import fs from "node:fs";
import path from "node:path";

for (const directory of ["specs/frontend", "specs/backend", "specs/deployment", "docs/adr"]) {
  for (const name of fs.readdirSync(directory).filter((file) => file.endsWith(".md")).sort()) {
    const text = fs.readFileSync(path.join(directory, name), "utf8");
    const id = text.match(/^id:\s*(.+)$/m)?.[1];
    const title = text.match(/^title:\s*(.+)$/m)?.[1];
    const status = text.match(/^status:\s*(.+)$/m)?.[1];
    console.log(`${id}\t${status}\t${title}\t${directory}/${name}`);
  }
}
