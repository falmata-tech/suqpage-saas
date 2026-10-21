import { countPublicSeoEntries } from "@/lib/public-seo-runtime";
import { sitemapIndexXml, sitemapPageCount } from "@/lib/public-seo";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const count = await countPublicSeoEntries();
  return new Response(sitemapIndexXml(sitemapPageCount(count)), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
