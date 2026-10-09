import { saveOwnerPageAndPublication } from "@/lib/owner-page-save-runtime";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { apiUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { OwnerPageError, ownerPageRecord } from "@/lib/owner-page-domain";
import { ownerPageEditorEnabled, ownerPagePort } from "@/lib/owner-page-runtime";
import { readOwnerPage, setOwnerPageAssistance } from "@/lib/owner-page-service";
import { changePagePublication } from "@/lib/owner-page-publication";
import { pagePublicationPort } from "@/lib/owner-page-publication-runtime";

export const runtime = "nodejs";
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });

async function readBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new OwnerPageError("Send a JSON page form.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new OwnerPageError("The page form is empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) { await reader.cancel(); throw new OwnerPageError("The page form is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new OwnerPageError("The page form is invalid."); }
}

export async function POST(request: Request, context: { params: Promise<{ businessId: string }> }) {
  if (!ownerPageEditorEnabled()) return json({ error: "Not found." }, 404);
  const user = await apiUser();
  if (!user) return json({ error: "Sign in to edit your page." }, 401);
  try {
    try { assertSameOrigin(request); } catch { throw new OwnerPageError("Invalid request origin.", 403); }
    const businessId = Number((await context.params).businessId);
    await readOwnerPage(ownerPagePort, user, businessId);
    const body = ownerPageRecord(await readBody(request), ["action", "version", "content", "enabled", "revision"]);
    if (body.action === "publish" || body.action === "restore") {
      ownerPageRecord(body, ["action", "version", "revision"]);
      const publication = await changePagePublication(ownerPagePort, pagePublicationPort, user, businessId,
        { action: body.action, version: body.version, revision: body.revision });
      revalidateTag("public-marketplace", { expire: 0 });
      revalidateTag("public-featured", { expire: 0 });
      revalidatePath("/");
      revalidatePath("/featured");
      return json(publication);
    }
    if (body.action === "submit-review") return json({ error: "Page reviews are retired. Publish your saved page directly." }, 410);
    if (body.action === "start" || body.action === "save") {
      ownerPageRecord(body, body.action === "start" ? ["action", "content"] : ["action", "version", "content"]);
      const saved = await saveOwnerPageAndPublication(user, businessId, {action: body.action, version: body.version, content: body.content});
      revalidateTag("public-marketplace", { expire: 0 });
      revalidateTag("public-featured", { expire: 0 });
      revalidatePath("/"); revalidatePath("/dashboard"); revalidatePath("/dashboard/profile");
      return json(saved);
    }
    if (body.action === "assistance") {
      ownerPageRecord(body, ["action", "version", "enabled"]);
      return json(await setOwnerPageAssistance(ownerPagePort, user, businessId, body.version, body.enabled));
    }
    throw new OwnerPageError("Choose an available page action.");
  } catch (error) {
    return error instanceof OwnerPageError ? json({ error: error.message }, error.status) : json({ error: "The page action could not be confirmed. Reload before trying again." }, 500);
  }
}
