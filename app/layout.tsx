import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AUREN_URL } from "@/lib/config";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  TAGLINE,
  jsonLdString,
  organizationNode,
  websiteNode,
} from "@/lib/seo";
import { Footer, Header } from "@/components/chrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(AUREN_URL),
  title: {
    default: `${SITE_NAME} — ${TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [organizationNode, websiteNode],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-ink text-white antialiased">
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      </body>
    </html>
  );
}
