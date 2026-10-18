"use client";

import dynamic from "next/dynamic";
import { OrderPanel } from "./order-panel";
import { useSimulation } from "./sim";
import { useCapabilities } from "./use-can3d";

const RobotCell = dynamic(() => import("./robot-cell"), { ssr: false });

/** Simplified static schematic for phones, reduced motion and no-WebGL browsers. */
function Schematic({ working }: { working: boolean }) {
  return (
    <svg viewBox="0 0 600 300" className="size-full" role="img" aria-label="Schematic of a robotic fulfilment cell: a conveyor, a six-axis arm and a dispatch table.">
      <rect width="600" height="300" fill="#050505" />
      <line x1="0" y1="250" x2="600" y2="250" stroke="#303030" />
      <rect x="30" y="222" width="260" height="16" fill="#181818" stroke="#303030" />
      <rect x="440" y="210" width="110" height="40" fill="#181818" stroke="#303030" />
      <rect x={working ? 380 : 90} y="190" width="46" height="32" fill="#cfcfcf" />
      <circle cx="350" cy="236" r="30" fill="#111" stroke="#606060" />
      <path d={working ? "M350 220 L360 110 L450 90 L452 150" : "M350 220 L345 110 L420 70 L430 130"} fill="none" stroke="#d4d4d4" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="360" cy="110" r="10" fill="#111" stroke="#fff" />
      <circle cx={working ? 450 : 420} cy={working ? 90 : 70} r="9" fill="#111" stroke="#fff" />
      <text x="300" y="285" fill="#a0a0a0" fontSize="11" textAnchor="middle" fontFamily="monospace">SIMPLIFIED VIEW · 3D SIMULATION DISABLED ON THIS DEVICE</text>
    </svg>
  );
}

export function HeroCell() {
  const { can3D } = useCapabilities();
  const sim = useSimulation({ auto: true });
  const working = sim.cur.id === "robot";
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="relative overflow-hidden rounded-xl border border-line bg-ink lg:col-span-8">
        <div className="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-[560px]">
          {can3D ? <RobotCell live={sim.live} /> : <Schematic working={working} />}
        </div>
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-line bg-ink/80 px-2.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-gray-300 backdrop-blur">
          Simulated fulfilment cell · not live
        </div>
      </div>
      <div className="lg:col-span-4">
        <OrderPanel segs={sim.segs} seg={sim.seg} scenario={sim.scenario} playing={sim.playing} />
      </div>
    </div>
  );
}
