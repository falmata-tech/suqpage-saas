import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { readTenantProductImage, tenantProductMediaBusiness } from "@/lib/tenant-product-media";
import { readPublishedMedia } from "@/lib/media";

export const runtime="nodejs";
export async function GET(_:Request,{params}:{params:Promise<{filename:string}>}){
  const filename=(await params).filename;
  if(tenantProductMediaBusiness(filename)) {
    const media=await readTenantProductImage(filename,await apiUser());
    if(!media)return new NextResponse("Not found",{status:404,headers:{"Cache-Control":"no-store"}});
    return new NextResponse(new Uint8Array(media.bytes),{headers:{"Content-Type":media.contentType,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  }
  const media=await readPublishedMedia(filename);
  if(!media)return new NextResponse("Not found",{status:404});
  return new NextResponse(new Uint8Array(media.bytes),{headers:{"Content-Type":media.contentType,"Content-Length":String(media.contentLength),"Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
}
