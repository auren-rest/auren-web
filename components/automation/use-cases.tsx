import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui";

const CASES: Array<{ title: string; flow: string[] }> = [
  { title: "E-commerce order processing", flow: ["Order webhook", "Validate", "Fulfil", "Confirm"] },
  { title: "Inventory synchronization", flow: ["Store", "Map SKUs", "Warehouse DB"] },
  { title: "Automated invoice generation", flow: ["Order paid", "Build PDF", "Email invoice"] },
  { title: "Email & customer notifications", flow: ["Event", "Template", "Send"] },
  { title: "Daily business reports", flow: ["Schedule", "Query data", "Summarise", "Deliver"] },
  { title: "Lead collection & follow-up", flow: ["Form", "Enrich", "CRM", "Follow-up"] },
  { title: "AI-powered document processing", flow: ["Upload", "AI extract", "Review", "File away"] },
  { title: "Scheduled data collection", flow: ["Cron", "Call API", "Store", "Report"] },
];

function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-gray-300">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className="rounded border border-line px-2 py-1">{s}</span>
          {i < steps.length - 1 && <ArrowRight aria-hidden="true" className="size-3 text-gray-400" strokeWidth={1.5} />}
        </li>
      ))}
    </ol>
  );
}

export function UseCases() {
  return (
    <>
      <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {CASES.map((c, i) => (
          <li key={c.title} className="bg-ink">
            <Reveal delay={(i % 4) * 0.06} className="h-full">
              <div className="h-full p-6 transition-colors duration-300 hover:bg-charcoal">
                <span className="font-mono text-[0.625rem] tracking-[0.18em] text-gray-400">0{i + 1}</span>
                <h3 className="mt-4 font-medium tracking-[-0.01em]">{c.title}</h3>
                <Flow steps={c.flow} />
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* How n8n sits between software and the physical world */}
      <div className="mt-16 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {[
          ["Connected software", "Online store · payment provider · inventory database · CRM · email · AI models"],
          ["n8n coordinates", "Triggers, branching, retries and data mapping between every step of the workflow"],
          ["Actions happen", "External services send, update and notify. Compatible hardware can act only through its own controller and safety systems."],
        ].flatMap(([t, b], i, arr) => [
          <div key={t} className={`rounded-xl border p-6 ${i === 1 ? "border-white bg-charcoal" : "border-line bg-panel"}`}>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">{t}</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">{b}</p>
          </div>,
          ...(i < arr.length - 1 ? [<ArrowRight key={`a${i}`} aria-hidden="true" className="mx-auto size-5 rotate-90 self-center text-gray-400 lg:rotate-0" strokeWidth={1.5} />] : []),
        ])}
      </div>

      {/* Illustrative interface preview */}
      <figure className="mt-10 overflow-hidden rounded-xl border border-line bg-panel">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">
          <span className="size-2 rounded-full bg-line" /> <span className="size-2 rounded-full bg-line" /> <span className="size-2 rounded-full bg-line" />
          <span className="ml-3">Workflow canvas · illustrative preview</span>
        </div>
        <div className="grid md:grid-cols-5">
          <div className="border-b border-line p-5 md:col-span-3 md:border-b-0 md:border-r">
            <ol className="flex flex-wrap items-center gap-2 text-xs">
              {["Webhook", "Validate", "Payment", "Inventory", "IF approved", "Robot sim", "Notify"].map((n, i, a) => (
                <li key={n} className="flex items-center gap-2">
                  <span className="rounded-md border border-line bg-ink px-3 py-2">{n}</span>
                  {i < a.length - 1 && <span aria-hidden="true" className="h-px w-4 bg-gray-400" />}
                </li>
              ))}
            </ol>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[0.6875rem] leading-relaxed text-gray-400 md:col-span-2" aria-label="Example execution log">
{`# example log (simulated)
webhook   received  SIM-1042
validate  ok        12 ms
payment   ok        340 ms
inventory ok        95 ms
decision  approved  rule: stock>0
robot     simulated
notify    queued`}
          </pre>
        </div>
        <figcaption className="border-t border-line px-4 py-2.5 text-xs text-gray-400">
          A mock-up for illustration. It is not a screenshot of a running n8n instance.
        </figcaption>
      </figure>
    </>
  );
}
