import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { createOnBehalfRequest } from "@/lib/on-behalf-request-service";
import { RequestError } from "@/lib/request-domain";
import { assertSameOrigin } from "@/lib/security";

export const runtime = "nodejs";
const MAX_MULTIPART_BYTES = 51 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await apiUser();
  if (!user) return NextResponse.json({error:"Authentication required."},{status:401});
  try {
    try { assertSameOrigin(request); } catch { throw new RequestError("Invalid request origin.",403); }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) throw new RequestError("Send a multipart request.",415);
    const length = Number(request.headers.get("content-length") || 0);
    if (!Number.isFinite(length) || length <= 0) throw new RequestError("A bounded content length is required.",411);
    if (length > MAX_MULTIPART_BYTES) throw new RequestError("The request is too large.",413);
    const result = await createOnBehalfRequest(user,await request.formData());
    return NextResponse.json({reference:result.publicRef,id:result.id,duplicate:result.duplicate},{status:result.duplicate?200:201,headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    if (error instanceof RequestError) return NextResponse.json({error:error.message},{status:error.status,headers:{"Cache-Control":"no-store"}});
    return NextResponse.json({error:"The on-behalf request could not be saved."},{status:500,headers:{"Cache-Control":"no-store"}});
  }
}
