import type { Metadata } from "next";
import { AUREN_URL } from "@/lib/config";

export const SITE_NAME = "Auren";
export const TAGLINE = "Workflow automation and reliable software.";
export const SITE_DESCRIPTION =
  "Auren is an independent software company. Explore how workflow automation connects apps, APIs and AI to automate order processing, reporting and notifications, and discover Zent, our server-monitoring product.";

/** Stable entity identifiers shared across JSON-LD nodes. */
export const ORG_ID = `${AUREN_URL}/#organization`;
export const WEBSITE_ID = `${AUREN_URL}/#website`;

/** Per-page metadata with a self-referencing canonical and matching Open Graph. */
export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
  };
}

/** Serialise JSON-LD safely for inline <script> (prevents `</script>` breakout). */
export const jsonLdString = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

export const organizationNode = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: AUREN_URL,
  description: SITE_DESCRIPTION,
  email: "hello@auren.rest",
  knowsAbout: ["workflow automation", "business process automation", "AI-powered workflows", "API integration", "server monitoring"],
};

export const websiteNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: AUREN_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
};

export function breadcrumbNode(name: string, path: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: AUREN_URL },
      { "@type": "ListItem", position: 2, name, item: `${AUREN_URL}${path}` },
    ],
  };
}
