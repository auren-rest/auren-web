"use client";

import { Check, Pause, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui";
import { CYCLE, ROBOT_SPEED, SCENARIOS, STEPS, stepStatus, useSimulation, type ScenarioId, type StepId, type StepStatus } from "./sim";

const EXPLORER_SPEED = 2;
const CYCLE_ORDER = CYCLE;

const BRANCH: Partial<Record<StepId, { label: string; scenario: ScenarioId; tone: "danger" | "warn" }>> = {
  payment: { label: "Declined → stop workflow, notify customer", scenario: "payment-failed", tone: "danger" },
  inventory: { label: "Out of stock → stop, divert item", scenario: "out-of-stock", tone: "danger" },
  approve: { label: "Needs review → hold for operator", scenario: "manual-approval", tone: "warn" },
};

const ROBOT_PHASES: Array<[number, string]> = [
  [1100, "Moving the gripper above the box"],
  [2100, "Lowering the gripper onto the box"],
  [2700, "Closing the gripper to grasp the box"],
  [3500, "Lifting the box clear of the conveyor"],
  [5200, "Rotating to the dispatch table"],
  [6000, "Lowering the box into place"],
  [6600, "Opening the gripper to release"],
  [8200, "Returning to the standby position"],
];

function why(segId: string, elapsed: number, scenario: ScenarioId): string {
  switch (segId) {
    case "standby": return "The robot rests at its home position and waits for an approved order.";
    case "order": return "The conveyor delivers the product. The robot stays still because nothing is approved yet.";
    case "validate": case "payment": case "inventory": case "approve":
      return "The robot waits. It only acts once the workflow has approved the order.";
    case "hold": return "The workflow is paused for a person to decide. The robot will not move until then.";
    case "approved": return "Approval received. The robot is cleared to execute.";
    case "robot": return ROBOT_PHASES.find(([t]) => elapsed * ROBOT_SPEED * EXPLORER_SPEED < t)?.[1] ?? "Returning to the standby position";
    case "update": return "Physical work done. The workflow now records it in the order and stock systems.";
    case "notify": return "The customer is told their order is on its way.";
    case "completed": return "Order completed. The robot is back in standby for the next one.";
    case "stopped":
      return scenario === "payment-failed"
        ? "Payment failed, so the workflow stopped. The robot never receives an unapproved order."
        : "Out of stock, so the workflow stopped. The robot never receives an unapproved order.";
    default: return "";
  }
}

const NODE_STYLE: Record<StepStatus, string> = {
  pending: "border-line text-gray-400",
  active: "border-white bg-white text-ink",
  done: "border-gray-400 text-white",
  fail: "border-danger text-danger",
  hold: "border-warn text-warn",
  skipped: "border-dashed border-line text-gray-400/50",
};

export function Explorer() {
    const sim = useSimulation({ auto: true, initial: "success", speed: EXPLORER_SPEED, cycle: CYCLE_ORDER });
  const [pinned, setPinned] = useState<StepId | null>(null);
  const [hover, setHover] = useState<StepId | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (sim.cur.id !== "robot" || !sim.playing) return;
    const id = setInterval(() => setElapsed(performance.now() - sim.live.current.start), 150);
    return () => clearInterval(id);
  }, [sim.cur.id, sim.playing, sim.live]);

  const activeStep = (sim.cur.step ?? (sim.cur.id === "completed" ? "notify" : "order")) as StepId;
  const shown = hover ?? pinned ?? activeStep;
  const info = STEPS.find((s) => s.id === shown)!;
  const infoStatus = stepStatus(sim.segs, sim.seg, shown);
  const total = sim.segs.reduce((a, s) => a + s.ms, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Scenario" className="flex flex-wrap gap-2">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={sim.scenario === id}
              onClick={() => sim.replay(id)}
              className={cx(
                "h-9 rounded-md border px-3 text-xs font-medium transition-colors",
                sim.scenario === id ? "border-white bg-white text-ink" : "border-line hover:border-white",
              )}
            >
              {SCENARIOS[id].label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-400">{SCENARIOS[sim.scenario].blurb}</p>

      <ol className="mt-8 flex flex-col lg:flex-row lg:items-start" aria-label="Order workflow">
        {STEPS.map((s, i) => {
          const st = stepStatus(sim.segs, sim.seg, s.id);
          const br = BRANCH[s.id];
          const Icon = st === "done" ? Check : st === "fail" ? X : st === "hold" ? Pause : null;
          return (
            <li key={s.id} className="flex flex-col lg:flex-1 lg:flex-row lg:items-start">
              <div className="flex flex-row items-start gap-3 lg:w-full lg:max-w-[7.5rem] lg:flex-col lg:items-center lg:gap-2 lg:text-center">
                <button
                  type="button"
                  aria-pressed={pinned === s.id}
                  aria-label={`${s.node}: ${st}`}
                  onClick={() => setPinned(pinned === s.id ? null : s.id)}
                  onMouseEnter={() => setHover(s.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(s.id)}
                  onBlur={() => setHover(null)}
                  className={cx("flex size-11 shrink-0 items-center justify-center rounded-lg border font-mono text-xs transition-colors duration-300", NODE_STYLE[st])}
                >
                  {Icon ? <Icon className="size-4" strokeWidth={2} aria-hidden="true" /> : i + 1}
                </button>
                <div className="pt-1 lg:pt-0">
                  <div className="text-sm font-medium leading-tight">{s.label}</div>
                  <div className="mt-0.5 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-gray-400">{s.node}</div>
                  {br && (
                    <button
                      type="button"
                      onClick={() => sim.replay(br.scenario)}
                      className={cx(
                        "mt-2 rounded border border-dashed px-2 py-1 text-left text-[0.625rem] leading-snug transition-colors hover:bg-white/10",
                        br.tone === "danger" ? "border-danger/60 text-danger" : "border-warn/60 text-warn",
                      )}
                    >
                      {br.label}
                    </button>
                  )}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="relative ml-[1.3rem] block h-6 w-px bg-line lg:ml-0 lg:mt-[1.35rem] lg:h-px lg:min-w-3 lg:flex-1 lg:w-auto">
                  {["done", "fail", "hold"].includes(st) && <span className={cx("absolute inset-0", st === "done" ? "bg-white" : st === "fail" ? "bg-danger" : "bg-warn")} />}
                  {st === "active" && <span className="flow-packet hidden bg-white lg:block" />}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-6 rounded-xl border border-line bg-panel p-5 md:grid-cols-12 md:p-6">
        <div className="md:col-span-6" aria-live="polite">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">
            {info.node} · {infoStatus}
          </p>
          <h3 className="mt-2 text-xl font-medium tracking-[-0.02em]">{info.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">{info.role}</p>
        </div>
        <div className="md:col-span-6">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">What the robot is doing, and why</p>
          <p className="mt-2 text-sm leading-relaxed text-white">{why(sim.cur.id, elapsed, sim.scenario)}</p>
        </div>
      </div>

      <div className="mt-6" aria-hidden="true">
        <div className="flex h-1.5 gap-px">
          {sim.segs.map((s, i) => (
            <div
              key={s.id + i}
              style={{ flexGrow: s.ms / total }}
              className={cx("rounded-sm", i < sim.seg ? "bg-white" : i === sim.seg ? "bg-gray-300" : "bg-line", s.kind === "fail" && i <= sim.seg && "!bg-danger", s.kind === "hold" && i <= sim.seg && "!bg-warn")}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-400">
          Timeline · simulated run · {(total / 1000).toFixed(1)}s
        </p>
      </div>
    </div>
  );
}
