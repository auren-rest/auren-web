import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO, ZENT_URL } from "@/lib/config";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Reveal,
  Section,
  Tag,
  TextLink,
  ZentLogo,
} from "@/components/ui";
import { SITE_DESCRIPTION, SITE_NAME, TAGLINE, ORG_ID, WEBSITE_ID, jsonLdString } from "@/lib/seo";
import { AUREN_URL } from "@/lib/config";
import { HeroCell } from "@/components/automation/hero-cell";
import { Explorer } from "@/components/automation/explorer";
import { UseCases } from "@/components/automation/use-cases";
import { MiniDashboard } from "@/components/mini-dashboard";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

const faqs = [
  {
    q: "What is Auren?",
    a: "Auren is an independent software company that builds reliable products for developers and modern digital businesses. Its first product is Zent, a server-monitoring product.",
  },
  {
    q: "What is Zent?",
    a: "Zent is Auren’s server-monitoring product, designed to help teams know when something breaks, understand why, and keep their services running. Its planned scope includes uptime checks, response-time tracking, resource monitoring, incident history and alerts.",
  },
  {
    q: "Is Zent available today?",
    a: "The capabilities listed on this page describe Zent’s intended scope. Individual capabilities are labelled as their availability is confirmed. Visit the Zent website for current status.",
  },
  {
    q: "What is workflow automation?",
    a: "Workflow automation connects apps, APIs and AI models so routine tasks such as emails, reports, notifications and data syncing can run automatically.",
  },
  {
    q: "Is the robot demo on this page real?",
    a: "No. The robotic fulfilment cell is a 3D simulation of an automated order-processing workflow (new order, validation, payment check, inventory check, approval, pick and place, order update, confirmation). No real order, payment, stock record, live workflow engine or robot hardware is connected.",
  },
  {
    q: "What happens when an order fails a check?",
    a: "In the demonstration, a declined payment or an out-of-stock item stops the workflow and the robot never receives the order. An order needing review is held until a person approves it.",
  },
  {
    q: "How can I contact Auren?",
    a: `Email ${CONTACT_EMAIL}.`,
  },
];

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${AUREN_URL}/#webpage`,
  url: AUREN_URL,
  name: `${SITE_NAME} — ${TAGLINE}`,
  description: SITE_DESCRIPTION,
  isPartOf: { "@id": WEBSITE_ID },
  about: [
    { "@id": ORG_ID },
    { "@type": "Thing", name: "Workflow automation", description: "Connecting applications, APIs, AI models and databases to automate repetitive business tasks such as order processing, notifications and reporting." },
  ],
  mentions: [
    {
      "@type": "SoftwareApplication",
      name: "Zent",
      url: ZENT_URL,
      applicationCategory: "DeveloperApplication",
      description: "Server-monitoring product by Auren.",
      publisher: { "@id": ORG_ID },
    },
  ],
  inLanguage: "en",
};

const principles = [
  {
    title: "Reliability first",
    body: "Build products people can depend on.",
  },
  {
    title: "Clarity over complexity",
    body: "Make powerful technology easier to understand and use.",
  },
  {
    title: "Thoughtful engineering",
    body: "Prioritize quality, performance, and long-term maintainability.",
  },
];

const capabilities = [
  "Server health monitoring",
  "Website and API uptime checks",
  "Response-time tracking",
  "Resource utilization monitoring",
  "Incident history",
  "Configurable alerts",
  "Service status overview",
];

export default function Home() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(webPageLd) }}
      />
      {/* Hero */}
      <section aria-labelledby="hero-title" data-tone="inverted" className="relative bg-ink text-white">
        <Container className="pb-16 pt-10 md:pb-24 md:pt-14">
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <Eyebrow>Workflow automation · simulated demonstration</Eyebrow>
              </Reveal>
              <Reveal delay={0.08}>
                <h1
                  id="hero-title"
                  className="mt-5 text-[clamp(2.5rem,6.4vw,5.5rem)] font-medium leading-[0.96] tracking-display"
                >
                  From Order to Execution. Automatically.
                </h1>
              </Reveal>
            </div>
            <div className="lg:col-span-4">
              <Reveal delay={0.16}>
                <p className="leading-relaxed text-gray-300">
                  Watch connected workflows validate orders, coordinate systems,
                  and drive automated fulfillment through intelligent process
                  orchestration.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href="#explorer" variant="glow">
                    Explore the workflow
                  </ButtonLink>
                  <ButtonLink href={ZENT_URL} variant="secondary">
                    View Zent
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
          <Reveal delay={0.24} className="mt-10">
            <HeroCell />
          </Reveal>
        </Container>
        <div className="border-t border-line">
          <Container className="grid divide-line text-sm md:grid-cols-3 md:divide-x">
            {[
              ["Company", "Auren"],
              ["Flagship product", "Zent — Server Monitoring"],
              ["Focus", "Reliable software & workflow automation"],
            ].map(([k, v]) => (
              <div key={k} className="py-6 md:px-8 md:first:pl-0 md:last:pr-0">
                <div className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-gray-400">
                  {k}
                </div>
                <div className="mt-1.5 font-medium tracking-[-0.01em]">{v}</div>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* Automations */}
      <Section id="automations" index="01" label="Intelligent automation" tone="dark" labelledBy="automations-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <h2 id="automations-title" className="text-4xl font-medium leading-[1] tracking-display md:text-6xl">
              From Digital Workflows to Real-World Actions.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-gray-300">
              Automated workflows connect applications, APIs, AI models, databases and
              business processes, so repetitive work runs on its own and
              people focus on what needs judgement.
            </p>
          </Reveal>
        </div>
        <div className="mt-16">
          <UseCases />
        </div>
      </Section>

      {/* Explorer */}
      <Section id="explorer" index="02" label="Workflow explorer" tone="dark" labelledBy="explorer-title">
        <Reveal>
          <h2 id="explorer-title" className="max-w-3xl text-4xl font-medium leading-[1] tracking-display md:text-6xl">
            Follow an order from webhook to dispatch.
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-gray-300">
            Hover or click a node to see its role. Switch scenarios to see how
            failed payments, missing stock and manual approvals stop the
            workflow before any robotic action. All data here is simulated.
          </p>
        </Reveal>
        <div className="mt-12">
          <Explorer />
        </div>
      </Section>

      {/* Philosophy */}
      <Section id="philosophy" index="03" tone="dark" label="Philosophy" labelledBy="philosophy-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2
              id="philosophy-title"
              className="text-4xl font-medium leading-[1] tracking-display md:text-6xl lg:text-7xl"
            >
              Built with intention. Designed to last.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-relaxed text-gray-300">
              We believe great software should be useful, dependable, and
              beautifully simple. At Auren, we focus on solving real problems
              through carefully designed technology.
            </p>
          </Reveal>
        </div>
        <ol className="mt-20 grid border-t border-line md:mt-28 md:grid-cols-3 md:divide-x md:divide-line">
          {principles.map((p, i) => (
            <li
              key={p.title}
              className="border-b border-line py-10 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <Reveal delay={i * 0.08}>
                <span className="font-mono text-[0.6875rem] tracking-[0.18em] text-gray-400">
                  0{i + 1}
                </span>
                <h3 className="mt-8 text-2xl font-medium tracking-[-0.03em]">
                  {p.title}
                </h3>
                <p className="mt-3 max-w-xs leading-relaxed text-gray-300">
                  {p.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* Products */}
      <Section
        id="products"
        index="04"
        label="Products"
        tone="dark"
        labelledBy="products-title"
      >
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h2
              id="products-title"
              className="text-4xl font-medium leading-[1] tracking-display md:text-6xl lg:text-7xl"
            >
              Products by Auren.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="text-lg leading-relaxed text-gray-400">
              Purpose-built software designed to make modern digital
              infrastructure easier to manage.
            </p>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-14 border border-line p-6 md:p-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-4">
              <ZentLogo size={30} className="[&>span]:text-3xl" />
              <Tag className="text-gray-400">A product by Auren</Tag>
            </div>
            <p className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gray-400">
              Zent — Server Monitoring
            </p>
            <p className="mt-4 text-2xl font-medium leading-snug tracking-[-0.03em] md:text-3xl">
              Know when something breaks. Understand why. Keep your services
              running.
            </p>

            <h3 className="mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-gray-400">
              Intended capabilities
            </h3>
            <ul className="mt-4 divide-y divide-line border-y border-line text-sm">
              {capabilities.map((c) => (
                <li key={c} className="py-3">
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">
              These describe Zent&rsquo;s intended scope. Capabilities are
              labelled individually as availability is confirmed.
            </p>

            <div className="mt-10">
              <TextLink href={ZENT_URL}>Explore Zent</TextLink>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-7">
            <MiniDashboard />
            <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">
              Illustration · demo data, not live product data
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Zent in the automation ecosystem */}
      <section aria-labelledby="zent-eco-title" data-tone="inverted" className="border-t border-line bg-ink text-white">
        <Container className="py-16 md:py-24">
          <Reveal>
            <a
              href={ZENT_URL}
              className="group relative block overflow-hidden rounded-xl border border-line bg-panel p-8 transition-colors duration-300 hover:border-white hover:bg-charcoal md:p-12"
            >
                            <div className="relative grid items-center gap-8 md:grid-cols-12">
                <div className="md:col-span-8">
                  <div className="flex flex-wrap items-center gap-4">
                    <ZentLogo size={28} className="[&>span]:text-2xl" />
                    <Tag className="text-gray-400">zent.auren.rest</Tag>
                  </div>
                  <h2 id="zent-eco-title" className="mt-6 text-3xl font-medium tracking-display md:text-4xl">
                    Zent — Explore the Platform
                  </h2>
                  <p className="mt-4 max-w-2xl leading-relaxed text-gray-300">
                    Zent watches your servers and services. Automation tools like
                    Automated workflows can act on signals such as alerts and incidents, so the
                    systems that run your workflows stay visible and dependable.
                  </p>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <span className="inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-medium">
                    Visit Zent
                    <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.5} />
                  </span>
                </div>
              </div>
            </a>
          </Reveal>
        </Container>
      </section>

      {/* Story */}
      <Section id="about" index="05" label="About Auren" tone="dark" labelledBy="about-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <h2
              id="about-title"
              className="text-4xl font-medium leading-[1] tracking-display md:text-6xl lg:text-8xl"
            >
              Small details. Serious software.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <p className="text-xl leading-relaxed text-gray-300 md:text-2xl md:leading-relaxed">
              Auren exists to build focused software products that solve
              meaningful problems. We value clear interfaces, dependable
              systems, and technology that earns trust through its quality.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-title"
        data-tone="inverted"
        className="border-t border-line bg-ink text-white"
      >
        <Container className="grid gap-12 py-20 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Questions</Eyebrow>
            <h2
              id="faq-title"
              className="mt-4 text-3xl font-medium tracking-display md:text-5xl"
            >
              About Auren and Zent.
            </h2>
          </div>
          <dl className="divide-y divide-line border-y border-line lg:col-span-7">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-lg font-medium tracking-[-0.02em]">{f.q}</dt>
                <dd className="mt-2 max-w-xl leading-relaxed text-gray-300">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Final CTA */}
      <Section tone="dark" labelledBy="cta-title">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <h2
              id="cta-title"
              className="text-4xl font-medium leading-[1] tracking-display md:text-6xl lg:text-8xl"
            >
              Discover what we&rsquo;re building.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-gray-400">
              Explore Zent, our server-monitoring product built to help teams
              understand and maintain their infrastructure.
            </p>
            <div className="mt-10">
              <ButtonLink href={ZENT_URL}>Explore Zent</ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Contact */}
      <section
        id="contact"
        aria-labelledby="contact-title"
        data-tone="inverted"
        className="border-t border-line bg-ink text-white"
      >
        <Container className="grid items-center gap-8 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-6">
            <Eyebrow>Contact</Eyebrow>
            <h2
              id="contact-title"
              className="mt-4 text-3xl font-medium tracking-display md:text-4xl"
            >
              Say hello.
            </h2>
          </div>
          <div className="md:col-span-6 md:text-right">
            <a
              href={`mailto:${CONTACT_MAILTO}`}
              className="inline-block border-b border-white pb-1 text-xl tracking-[-0.02em] md:text-2xl"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
