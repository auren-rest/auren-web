import type { MetadataRoute } from "next";
import { AUREN_URL } from "@/lib/config";

/**
 * Canonical, indexable URLs only. /privacy and /terms are placeholders marked
 * noindex, so they are intentionally omitted until real content ships.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: AUREN_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
