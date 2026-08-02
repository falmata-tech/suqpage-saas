import { NextResponse } from "next/server";
import { readPublishedMedia } from "@/lib/media";

export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{filename:string}>}){
  const filename=(await params).filename;
  const media=await readPublishedMedia(filename);
  if(!media)return new NextResponse("Not found",{status:404});
  return new NextResponse(new Uint8Array(media.bytes),{headers:{"Content-Type":media.contentType,"Content-Length":String(media.contentLength),"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
}
