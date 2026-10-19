import type { MetadataRoute } from "next";
import { AUREN_URL } from "@/lib/config";

/** Everything public is crawlable (incl. search and AI crawlers); only /api is excluded. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${AUREN_URL}/sitemap.xml`,
  };
}
