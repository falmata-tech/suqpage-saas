import { countPublicSeoEntries, listPublicSeoEntries } from "@/lib/public-seo-runtime";
import { publicSeoEntryPath, sitemapPageCount, sitemapPageWindow, sitemapUrlsetXml } from "@/lib/public-seo";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ page: string }> }): Promise<Response> {
  const rawPage = (await params).page;
  if (!/^(0|[1-9]\d{0,4})$/.test(rawPage)) return new Response("Not found", { status: 404 });
  const page = Number(rawPage);
  const count = await countPublicSeoEntries();
  if (page >= sitemapPageCount(count)) return new Response("Not found", { status: 404 });
  const window = sitemapPageWindow(page);
  const rows = await listPublicSeoEntries(window.limit, window.offset);
  const xml = sitemapUrlsetXml([...window.staticPaths, ...rows.map(publicSeoEntryPath)]);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
