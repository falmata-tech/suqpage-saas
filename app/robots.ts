import type { MetadataRoute } from "next";
import { publicSeoUrl } from "@/lib/public-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/page-media/"],
      disallow: [
        "/api/", "/auth", "/auth/", "/dashboard", "/dashboard/", "/preview/",
        "/request", "/login",
        "/invite/", "/contact-success", "/account-deletion", "/offline", "/blocked-businesses",
      ],
    },
    sitemap: publicSeoUrl("/sitemap.xml"),
  };
}
