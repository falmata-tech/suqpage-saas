import { handleMobileRequest } from '@/lib/mobile/router';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request,context:{params:Promise<{path:string[]}>}){return handleMobileRequest(request,(await context.params).path);}
export const POST=GET;
export const PATCH=GET;
export const DELETE=GET;
export const OPTIONS=GET;
