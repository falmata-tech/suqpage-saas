import {trackingHttpHandler} from '@/lib/tracking-http-runtime';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const handler=trackingHttpHandler('web');
export async function GET(request:Request,context:{params:Promise<{path:string[]}>}){return handler(request,(await context.params).path);}
export const POST=GET;
export const HEAD=GET;
export const PUT=GET;
export const PATCH=GET;
export const DELETE=GET;
