import { CONTACT_EMAIL, CONTACT_MAILTO, ZENT_URL } from "@/lib/config";
import {
  AurenLogo,
  SiteFooter,
  SiteHeader,
  SmartLink,
  ZentLogo,
} from "@/components/ui";

export function Header() {
  return (
    <SiteHeader
      brand={
        <SmartLink href="/" aria-label="Auren — home">
          <AurenLogo />
        </SmartLink>
      }
      links={[
        { label: "Use cases", href: "/#automations" },
        { label: "Workflow explorer", href: "/#explorer" },
        { label: "Products", href: "/#products" },
        { label: "Philosophy", href: "/#philosophy" },
        { label: "Contact", href: "/#contact" },
      ]}
      actions={[
        { label: "Zent — Explore the Platform", href: ZENT_URL, variant: "secondary" },
        { label: "Explore the workflow", href: "/#explorer", variant: "glow" },
      ]}
    />
  );
}

export function Footer() {
  return (
    <SiteFooter
      brand={<AurenLogo size={26} />}
      blurb={
        <>
          <p>
            An independent software company building reliable products for
            developers and modern digital businesses.
          </p>
          <p className="mt-5 flex items-center gap-3 text-white">
            <ZentLogo size={18} className="[&>span]:text-sm" />
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-gray-500">
              A product by Auren
            </span>
          </p>
        </>
      }
      columns={[
        {
          title: "Company",
          links: [
            { label: "About", href: "/#about" },
            { label: "Products", href: "/#products" },
            { label: "Contact", href: "/#contact" },
          ],
        },
        {
          title: "Products",
          links: [{ label: "Zent — Server Monitoring", href: ZENT_URL }],
        },
        {
          title: "Legal",
          links: [
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
          ],
        },
      ]}
      legal={
        <>
          <p>© {new Date().getFullYear()} Auren. All rights reserved.</p>
          <p>
            Zent is a product by Auren ·{" "}
            <a className="underline underline-offset-4 hover:text-white" href={`mailto:${CONTACT_MAILTO}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </>
      }
    />
  );
}
