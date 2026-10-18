"use client";

import { Check, CircleDashed, Minus, Pause, X } from "lucide-react";
import { cx } from "@/components/ui";
import { STEPS, stepStatus, systemLines, type ScenarioId, type Seg, type StepStatus } from "./sim";

type Props = { segs: Seg[]; seg: number; scenario: ScenarioId; playing: boolean };

const ICON: Record<StepStatus, typeof Check> = {
  pending: CircleDashed,
  active: CircleDashed,
  done: Check,
  fail: X,
  hold: Pause,
  skipped: Minus,
};

/** Technical "machine thinking" panel. Everything shown is simulated demo data. */
export function OrderPanel({ segs, seg, scenario, playing }: Props) {
  const cur = segs[Math.min(seg, segs.length - 1)]!;
  const status = (id: (typeof STEPS)[number]["id"]) => stepStatus(segs, seg, id);
  const lines = systemLines(cur, scenario);
  const failed = cur.kind === "fail" || cur.kind === "stopped";
  const thinkingStep = STEPS.find((s) => s.id === cur.step);
  const thinking =
    cur.id === "approved" ? "Preparing robotic action..." : cur.id === "hold" ? "Waiting for operator decision..." : thinkingStep?.thinking;
  const payment = status("payment");
  const inventory = status("inventory");
  const paymentTxt = scenario === "payment-failed" && (payment === "fail") ? "DECLINED" : payment === "done" ? "PAID" : "PENDING";
  const stockTxt = scenario === "out-of-stock" && inventory === "fail" ? "0 AVAILABLE" : inventory === "done" ? "14 AVAILABLE" : "—";

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-line bg-panel p-4 font-mono text-[0.6875rem] uppercase tracking-[0.1em] md:p-5">
      <div className="flex items-center justify-between gap-2 text-gray-400">
        <span>Automation workflow · simulated</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className={cx("size-1.5 rounded-full", playing ? "bg-white" : "bg-gray-400")} />
          {playing ? "Running" : "Idle"}
        </span>
      </div>

      <dl className="space-y-1.5">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-gray-400">{k}</dt>
            <dd className={cx("text-right", failed ? "text-danger" : cur.kind === "hold" ? "text-warn" : "text-white")}>{v}</dd>
          </div>
        ))}
      </dl>

      <div
        role="status"
        className={cx(
          "min-h-[2.75rem] rounded-md border px-3 py-2 text-[0.6875rem] leading-snug",
          cur.id === "approved" ? "border-white bg-white text-ink" : failed ? "border-danger/60 text-danger" : cur.kind === "hold" ? "border-warn/60 text-warn" : "border-line text-gray-400",
        )}
      >
        {cur.id === "approved"
          ? "ORDER VERIFIED — EXECUTION APPROVED"
          : cur.id === "stopped" || cur.kind === "fail"
            ? scenario === "payment-failed" ? "WORKFLOW STOPPED — PAYMENT NOT CONFIRMED. NO ROBOTIC ACTION." : "WORKFLOW STOPPED — ITEM OUT OF STOCK. NO ROBOTIC ACTION."
            : cur.kind === "hold"
              ? "MANUAL APPROVAL REQUIRED — SIMULATED OPERATOR"
              : cur.id === "completed"
                ? "ORDER COMPLETED"
                : thinking ?? "Awaiting next order..."}
      </div>

      <div className="h-px overflow-hidden bg-line" aria-hidden="true">
        {thinking && cur.kind === "run" && playing && (
          <div key={`${scenario}-${seg}`} className="h-px bg-white" style={{ animation: `bar ${cur.ms}ms linear forwards` }} />
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {[
          ["Order", "SIM-1042"],
          ["Items", "2 × SKU-4471"],
          ["Payment", paymentTxt],
          ["Stock", stockTxt],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-gray-400">{k}</dt>
            <dd className={v === "DECLINED" || v === "0 AVAILABLE" ? "text-danger" : "text-white"}>{v}</dd>
          </div>
        ))}
      </dl>

      <ol className="space-y-1">
        {STEPS.map((s) => {
          const st = status(s.id);
          const Icon = ICON[st];
          const ms = segs.filter((x) => x.step === s.id).reduce((a, x) => a + x.ms, 0);
          return (
            <li
              key={s.id}
              className={cx(
                "flex items-center gap-2.5",
                st === "active" ? "text-white" : st === "done" ? "text-gray-300" : st === "fail" ? "text-danger" : st === "hold" ? "text-warn" : "text-gray-400/70",
              )}
            >
              <Icon aria-hidden="true" className={cx("size-3.5 shrink-0", st === "active" && "animate-spin")} strokeWidth={1.75} />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-gray-400">{st === "done" || st === "fail" ? `${(ms / 1000).toFixed(1)}s` : st === "skipped" ? "skipped" : ""}</span>
              <span className="sr-only">{st}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-auto text-[0.625rem] normal-case tracking-normal text-gray-400">
        Simulated demonstration. No real order, payment, stock record or robot is involved.
      </p>
    </div>
  );
}
