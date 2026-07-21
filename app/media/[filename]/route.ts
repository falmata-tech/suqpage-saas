import fs from "node:fs";
import { NextResponse } from "next/server";
import { mediaMime, resolveMediaFile } from "@/lib/media";

export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{filename:string}>}){
  const filename=(await params).filename;
  const full=resolveMediaFile(filename);
  if(!full||!fs.existsSync(full))return new NextResponse("Not found",{status:404});
  const stat=fs.statSync(full);
  return new NextResponse(fs.readFileSync(full),{headers:{"Content-Type":mediaMime(filename),"Content-Length":String(stat.size),"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
}
