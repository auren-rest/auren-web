"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

/**
 * Simulated order-fulfilment run. Everything here is a demonstration: no real
 * order, payment, inventory record, live workflow execution or robot is involved.
 */
/** Robot playback speed multiplier (1 = original). */
export const ROBOT_SPEED = 1.4;

export type StepId = "order" | "validate" | "payment" | "inventory" | "approve" | "robot" | "update" | "notify";
export type ScenarioId = "success" | "out-of-stock" | "payment-failed" | "manual-approval";
export type SegKind = "idle" | "run" | "hold" | "banner" | "fail" | "stopped" | "done";
export type Seg = { id: string; step?: StepId; ms: number; kind: SegKind };
export type StepStatus = "pending" | "active" | "done" | "fail" | "hold" | "skipped";

export const STEPS: Array<{
  id: StepId;
  label: string;
  node: string;
  role: string;
  thinking: string;
}> = [
  { id: "order", label: "New Order", node: "Webhook trigger", role: "An online store sends the new order to an automation webhook. This is what starts the workflow.", thinking: "Receiving order payload..." },
  { id: "validate", label: "Validate Order", node: "Order validation", role: "Checks required fields, quantities, addresses and SKUs. Malformed orders stop here.", thinking: "Validating order details..." },
  { id: "payment", label: "Verify Payment", node: "Payment service", role: "Asks the payment provider for the order's payment status. A failed or pending payment stops the workflow.", thinking: "Confirming payment status..." },
  { id: "inventory", label: "Check Inventory", node: "Inventory database", role: "Reads stock levels for each SKU. If an item is out of stock the order is diverted instead of fulfilled.", thinking: "Checking inventory..." },
  { id: "approve", label: "Approve Fulfillment", node: "AI / business-rule decision", role: "Applies business rules (and optionally an AI model) to decide: proceed, stop, or ask a person to approve.", thinking: "Selecting fulfillment workflow..." },
  { id: "robot", label: "Robotic Pick & Place", node: "Robot simulation", role: "Only an approved order reaches this step. Here it drives a 3D simulation; a real cell would need compatible controllers and safety systems.", thinking: "Preparing robotic action..." },
  { id: "update", label: "Update Order", node: "Fulfillment system", role: "Marks the order as packed and decrements stock in the fulfilment and inventory systems.", thinking: "Writing order and stock updates..." },
  { id: "notify", label: "Send Confirmation", node: "Customer notification", role: "Sends the customer a confirmation or dispatch email or message.", thinking: "Queuing customer notification..." },
];

export const SCENARIOS: Record<ScenarioId, { label: string; blurb: string }> = {
  success: { label: "Approved order", blurb: "Every check passes; the robot simulation fulfils the order." },
  "out-of-stock": { label: "Out of stock", blurb: "Inventory check fails: the workflow stops and the box is diverted." },
  "payment-failed": { label: "Failed payment", blurb: "Payment is declined: the workflow stops before inventory or robot." },
  "manual-approval": { label: "Manual approval", blurb: "The order is held until an operator approves it (simulated)." },
};

export function buildSegments(scenario: ScenarioId, standby = true, speed = 1): Seg[] {
  return rawSegments(scenario, standby).map((s) => ({ ...s, ms: Math.round(s.ms / speed) }));
}

function rawSegments(scenario: ScenarioId, standby: boolean): Seg[] {
  const segs: Seg[] = [];
  if (standby) segs.push({ id: "standby", ms: 1800, kind: "idle" });
  segs.push({ id: "order", step: "order", ms: 2200, kind: "run" });
  segs.push({ id: "validate", step: "validate", ms: 1100, kind: "run" });
  if (scenario === "payment-failed") {
    segs.push({ id: "payment", step: "payment", ms: 1500, kind: "fail" });
    segs.push({ id: "stopped", ms: 3400, kind: "stopped" });
    return segs;
  }
  segs.push({ id: "payment", step: "payment", ms: 1100, kind: "run" });
  if (scenario === "out-of-stock") {
    segs.push({ id: "inventory", step: "inventory", ms: 1500, kind: "fail" });
    segs.push({ id: "stopped", ms: 3400, kind: "stopped" });
    return segs;
  }
  segs.push({ id: "inventory", step: "inventory", ms: 1100, kind: "run" });
  segs.push({ id: "approve", step: "approve", ms: 1300, kind: "run" });
  if (scenario === "manual-approval") segs.push({ id: "hold", step: "approve", ms: 2800, kind: "hold" });
  segs.push({ id: "approved", step: "approve", ms: 1100, kind: "banner" });
  segs.push({ id: "robot", step: "robot", ms: Math.round(8200 / ROBOT_SPEED), kind: "run" });
  segs.push({ id: "update", step: "update", ms: 1000, kind: "run" });
  segs.push({ id: "notify", step: "notify", ms: 1000, kind: "run" });
  segs.push({ id: "completed", ms: 3000, kind: "done" });
  return segs;
}

export function stepStatus(segs: Seg[], seg: number, step: StepId): StepStatus {
  const idx = segs.map((s, i) => (s.step === step ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return segs.some((s) => s.kind === "fail") ? "skipped" : "pending";
  const first = idx[0]!;
  const last = idx[idx.length - 1]!;
  if (seg < first) return "pending";
  const cur = segs[Math.min(seg, segs.length - 1)]!;
  if (seg <= last) return cur.kind === "fail" ? "fail" : cur.kind === "hold" ? "hold" : "active";
  return segs[last]!.kind === "fail" ? "fail" : "done";
}

/** Mutable snapshot read by the 3D scene every frame (no React re-render). */
export type Live = { segId: string; kind: SegKind; scenario: ScenarioId; start: number; running: boolean };

export const CYCLE: ScenarioId[] = ["success", "success", "out-of-stock", "success", "manual-approval", "payment-failed"];

export function useSimulation({
  auto,
  cycle = CYCLE,
  initial = "success",
  speed = 1,
}: {
  auto: boolean;
  cycle?: ScenarioId[];
  initial?: ScenarioId;
  speed?: number;
}) {
  const [scenario, setScenario] = useState<ScenarioId>(initial);
  const [seg, setSeg] = useState(0);
  const [playing, setPlaying] = useState(auto);
  const [runKey, setRunKey] = useState(0);
  const cycleIdx = useRef(0);
  const segs = buildSegments(scenario, true, speed);
  const live = useRef<Live>({ segId: "standby", kind: "idle", scenario, start: 0, running: false });

  useEffect(() => setPlaying(auto), [auto]);

  const cur = segs[Math.min(seg, segs.length - 1)]!;
  useEffect(() => {
    live.current = { segId: cur.id, kind: cur.kind, scenario, start: performance.now(), running: playing };
    if (!playing) return;
    const t = setTimeout(() => {
      if (seg < segs.length - 1) setSeg(seg + 1);
      else if (cycle.length && auto) {
        cycleIdx.current = (cycleIdx.current + 1) % cycle.length;
        setScenario(cycle[cycleIdx.current]!);
        setSeg(0);
        setRunKey((k) => k + 1);
      } else setPlaying(false);
    }, cur.ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg, scenario, playing, runKey]);

  /** Restart from the beginning, optionally with another scenario. */
  const replay = useCallback((next?: ScenarioId) => {
    if (next) {
      setScenario(next);
      const i = cycle.indexOf(next);
      if (i >= 0) cycleIdx.current = i;
    }
    setSeg(0);
    setRunKey((k) => k + 1);
    setPlaying(true);
  }, [cycle]);

  return { scenario, segs, seg, cur, playing, replay, live: live as MutableRefObject<Live> };
}

/** Wording for the system panel, per segment. */
export function systemLines(cur: Seg, scenario: ScenarioId): Array<[string, string]> {
  const failReason = scenario === "payment-failed" ? "PAYMENT DECLINED" : "OUT OF STOCK";
  switch (cur.id) {
    case "standby": return [["SYSTEM STATUS", "STANDBY"], ["ORDER QUEUE", "WAITING"], ["AUTOMATION", "READY"]];
    case "order": return [["SYSTEM STATUS", "ORDER RECEIVED"], ["ORDER QUEUE", "1 INCOMING"], ["AUTOMATION", "TRIGGERED"]];
    case "hold": return [["SYSTEM STATUS", "AWAITING OPERATOR"], ["ORDER QUEUE", "1 ON HOLD"], ["AUTOMATION", "PAUSED"]];
    case "approved": return [["SYSTEM STATUS", "APPROVED"], ["ORDER QUEUE", "1 READY"], ["AUTOMATION", "EXECUTING NEXT"]];
    case "robot": return [["SYSTEM STATUS", "EXECUTING"], ["ROBOTIC ACTION", "IN PROGRESS"], ["AUTOMATION", "RUNNING"]];
    case "completed": return [["ORDER STATUS", "COMPLETED"], ["ROBOTIC ACTION", "SUCCESS"], ["WORKFLOW", "FINISHED"]];
    case "stopped": return [["ORDER STATUS", `REJECTED — ${failReason}`], ["ROBOTIC ACTION", "NOT EXECUTED"], ["WORKFLOW", "STOPPED"]];
    default:
      if (cur.kind === "fail") return [["SYSTEM STATUS", `FAULT — ${failReason}`], ["ORDER QUEUE", "1 BLOCKED"], ["AUTOMATION", "STOPPING"]];
      return [["SYSTEM STATUS", "PROCESSING"], ["ORDER QUEUE", "1 IN REVIEW"], ["AUTOMATION", "EVALUATING"]];
  }
}
