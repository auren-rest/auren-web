"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ROBOT_SPEED, type Live } from "./sim";

/**
 * @react-three/fiber 9.x still constructs THREE.Clock internally, which three
 * now warns about. Drop only that one known message until fiber updates.
 */
if (typeof window !== "undefined") {
  const w = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) return;
    w(...args);
  };
}

/* ---------- geometry constants (scene units ≈ metres) ---------- */
const L1 = 1.7; // upper arm
const L2 = 1.5; // forearm
const G = 0.64; // wrist pivot → fingertip
const SHOULDER_Y = 1.0;
const BOX = { x: 0.8, y: 0.45, z: 0.55 };
const BELT_Z = 1.9;
const BELT_TOP = 0.5;
const PICK_X = -1.3;
const PLACE = { x: 2.3, z: 0.5 };
const BIN_X = 4.4;

type Pose = { yaw: number; r: number; y: number };
const cyl = (x: number, z: number, y: number): Pose => ({ yaw: Math.atan2(x, z), r: Math.hypot(x, z), y });
const HOME: Pose = { yaw: 0.45, r: 1.5, y: 2.6 };
const PICK_H = cyl(PICK_X, BELT_Z, 1.75);
const PICK = cyl(PICK_X, BELT_Z, 0.96);
const PLACE_H = cyl(PLACE.x, PLACE.z, 1.75);
const PLACE_P = cyl(PLACE.x, PLACE.z, 0.96);

/** Pose + gripper opening (1 open, 0 closed on the box) over the 8.2 s robot segment. */
const S = (ms: number) => ms / ROBOT_SPEED;
const KF: Array<{ t: number; p: Pose; g: number }> = [
  { t: S(0), p: HOME, g: 1 },
  { t: S(1100), p: PICK_H, g: 1 },
  { t: S(2100), p: PICK, g: 1 },
  { t: S(2700), p: PICK, g: 0 },
  { t: S(3500), p: PICK_H, g: 0 },
  { t: S(5200), p: PLACE_H, g: 0 },
  { t: S(6000), p: PLACE_P, g: 0 },
  { t: S(6600), p: PLACE_P, g: 1 },
  { t: S(7100), p: PLACE_H, g: 1 },
  { t: S(8200), p: HOME, g: 1 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function sample(t: number): { p: Pose; g: number } {
  if (t <= 0) return { p: HOME, g: 1 };
  for (let i = 0; i < KF.length - 1; i++) {
    const a = KF[i]!;
    const b = KF[i + 1]!;
    if (t < b.t) {
      const e = ease((t - a.t) / (b.t - a.t));
      return {
        p: { yaw: lerp(a.p.yaw, b.p.yaw, e), r: lerp(a.p.r, b.p.r, e), y: lerp(a.p.y, b.p.y, e) },
        g: lerp(a.g, b.g, e),
      };
    }
  }
  return { p: HOME, g: 1 };
}

/** Two-link planar IK with the gripper held vertical. Returns joint angles. */
function solve(p: Pose) {
  const wy = p.y + G - SHOULDER_Y;
  const d = Math.min(Math.hypot(p.r, wy), L1 + L2 - 0.01);
  const cosA = (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2);
  const elbow = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosA)));
  const beta = Math.atan2(L2 * Math.sin(elbow), L1 + L2 * Math.cos(elbow));
  const shoulder = Math.atan2(p.r, wy) - beta;
  return { yaw: p.yaw, shoulder, elbow, wrist: Math.PI - shoulder - elbow, roll: p.yaw - Math.PI / 2 };
}

/* ---------- materials ---------- */
function useMaterials() {
  return useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ color: "#d4d4d4", metalness: 0.85, roughness: 0.34 });
    const dark = new THREE.MeshStandardMaterial({ color: "#1a1a1a", metalness: 0.9, roughness: 0.42 });
    const steel = new THREE.MeshStandardMaterial({ color: "#8c8c8c", metalness: 1, roughness: 0.24 });
    const rubber = new THREE.MeshStandardMaterial({ color: "#0b0b0b", metalness: 0, roughness: 0.92 });
    const cardboard = new THREE.MeshStandardMaterial({ color: "#c9c9c9", metalness: 0, roughness: 0.82 });
    const tape = new THREE.MeshStandardMaterial({ color: "#e8e8e8", metalness: 0, roughness: 0.5 });
    const floor = new THREE.MeshStandardMaterial({ color: "#0c0c0c", metalness: 0.35, roughness: 0.55 });
    const frame = new THREE.MeshStandardMaterial({ color: "#222", metalness: 0.8, roughness: 0.5 });
    return { body, dark, steel, rubber, cardboard, tape, floor, frame };
  }, []);
}

function beltTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0e0e0e";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#1d1d1d";
  g.fillRect(0, 0, 6, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(30, 1);
  t.anisotropy = 4;
  return t;
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const tex = pm.fromScene(room, 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Bolts({ r, n, y = 0, size = 0.045 }: { r: number; n: number; y?: number; size?: number }) {
  const m = useMaterials();
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} material={m.steel} castShadow>
            <cylinderGeometry args={[size, size, size * 1.1, 6]} />
          </mesh>
        );
      })}
    </>
  );
}

/* ---------- the cell ---------- */
function Cell({ live }: { live: MutableRefObject<Live> }) {
  const m = useMaterials();
  const yawRef = useRef<THREE.Group>(null);
  const shoulderRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const wristRef = useRef<THREE.Group>(null);
  const gripRef = useRef<THREE.Group>(null);
  const fingerL = useRef<THREE.Mesh>(null);
  const fingerR = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Group>(null);
  const beltRef = useRef<THREE.Mesh>(null);
  const lampRef = useRef<THREE.MeshBasicMaterial>(null);
  const tex = useMemo(beltTexture, []);
  const beltS = useRef(0);
  const lastBoxX = useRef(-8);
  const joints = useRef({ yaw: HOME.yaw, shoulder: 0, elbow: 0, wrist: 0, roll: 0, g: 1 });

  useFrame((state, dt) => {
    const lv = live.current;
    const t = performance.now() - lv.start;
    const time = state.clock.elapsedTime;

    /* robot pose from the workflow segment */
    let pose = HOME;
    let g = 1;
    if (lv.segId === "robot") {
      const s = sample(t);
      pose = s.p;
      g = s.g;
    }
    if (lv.segId === "standby" || lv.segId === "completed") {
      pose = { ...HOME, y: HOME.y + Math.sin(time * 0.9) * 0.012, yaw: HOME.yaw + Math.sin(time * 0.35) * 0.012 };
    }
    const target = solve(pose);
    const j = joints.current;
    const k = 1 - Math.pow(0.0005, dt); // light damping on top of eased keyframes
    j.yaw = lerp(j.yaw, target.yaw, k);
    j.shoulder = lerp(j.shoulder, target.shoulder, k);
    j.elbow = lerp(j.elbow, target.elbow, k);
    j.wrist = lerp(j.wrist, target.wrist, k);
    j.roll = lerp(j.roll, target.roll, k);
    j.g = lerp(j.g, g, 1 - Math.pow(0.0002, dt));
    if (yawRef.current) yawRef.current.rotation.y = j.yaw;
    if (shoulderRef.current) shoulderRef.current.rotation.x = j.shoulder;
    if (elbowRef.current) elbowRef.current.rotation.x = j.elbow;
    if (wristRef.current) wristRef.current.rotation.x = j.wrist;
    if (gripRef.current) gripRef.current.rotation.y = j.roll;
    const half = lerp(BOX.z / 2 + 0.035, 0.46, j.g);
    if (fingerL.current) fingerL.current.position.x = -half;
    if (fingerR.current) fingerR.current.position.x = half;

    /* box */
    const box = boxRef.current;
    if (box) {
      const fail = lv.scenario === "out-of-stock" || lv.scenario === "payment-failed";
      let vis = true;
      let x = PICK_X;
      let y = BELT_TOP + BOX.y / 2;
      let z = BELT_Z;
      let onBelt = false;
      const id = lv.segId;
      if (id === "standby") vis = false;
      else if (id === "order") {
        x = lerp(-8, PICK_X, easeOut(clamp01(t / 2200)));
        onBelt = true;
      } else if (id === "stopped" && fail) {
        x = lerp(PICK_X, BIN_X, ease(clamp01(t / 3200)));
        onBelt = true;
      } else if (id === "robot") {
        if (t >= S(2100) && t < S(6000)) {
          const tipPose = sample(t).p;
          x = Math.sin(tipPose.yaw) * tipPose.r;
          z = Math.cos(tipPose.yaw) * tipPose.r;
          y = tipPose.y - BOX.y / 2 + 0.02;
        } else if (t >= S(6000)) {
          x = PLACE.x;
          z = PLACE.z;
        }
      } else if (id === "update" || id === "notify" || id === "completed") {
        x = PLACE.x;
        z = PLACE.z;
      }
      box.visible = vis;
      box.position.set(x, y, z);
      if (onBelt) beltS.current += x - lastBoxX.current;
      lastBoxX.current = x;
    }
    if (lv.segId === "robot" && t > S(2700) && t < S(5200)) beltS.current += dt * 0.7;
    tex.offset.x = (-beltS.current * 30) / 13;

    /* stack light */
    if (lampRef.current) {
      const c = lv.kind === "fail" || lv.kind === "stopped" ? "#ef4444" : lv.kind === "hold" ? "#f5a524" : lv.kind === "idle" ? "#3a3a3a" : "#ffffff";
      lampRef.current.color.set(c);
    }

    /* slow cinematic camera drift */
    const cam = state.camera;
    cam.position.set(5.4 + Math.sin(time * 0.12) * 0.35, 3.5 + Math.sin(time * 0.17) * 0.12, 7.4 + Math.cos(time * 0.1) * 0.25);
    cam.lookAt(0.3, 1.25, 0.9);
  });

  return (
    <>
      {/* floor + cell markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={m.floor}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      {[
        [0, 0.003, 4.3, 12, 0.03],
        [0, 0.003, -2.2, 12, 0.03],
      ].map(([x, y, z, w, d], i) => (
        <mesh key={i} position={[x!, y!, z!]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w!, d!]} />
          <meshBasicMaterial color="#5a5a5a" />
        </mesh>
      ))}

      {/* robot base */}
      <mesh position={[0, 0.06, 0]} material={m.dark} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.12, 48]} />
      </mesh>
      <Bolts r={0.66} n={8} y={0.14} size={0.05} />
      <mesh position={[0, 0.31, 0]} material={m.dark} castShadow>
        <cylinderGeometry args={[0.5, 0.56, 0.38, 40]} />
      </mesh>

      <group ref={yawRef} position={[0, 0.5, 0]}>
        <mesh position={[0, 0.18, 0]} material={m.body} castShadow>
          <cylinderGeometry args={[0.42, 0.46, 0.36, 40]} />
        </mesh>
        <mesh position={[0, 0.36, 0]} material={m.dark}>
          <cylinderGeometry args={[0.43, 0.43, 0.03, 40]} />
        </mesh>
        <mesh position={[0, 0.7, -0.05]} material={m.body} castShadow>
          <boxGeometry args={[0.62, 0.62, 0.55]} />
        </mesh>
        <mesh position={[0.37, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} material={m.dark} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 36]} />
        </mesh>
        <mesh position={[-0.37, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} material={m.dark} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 36]} />
        </mesh>

        {/* shoulder → upper arm */}
        <group ref={shoulderRef} position={[0, 0.5, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={m.steel} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.9, 24]} />
          </mesh>
          <mesh position={[0, L1 / 2, 0]} material={m.body} castShadow receiveShadow>
            <boxGeometry args={[0.46, L1, 0.4]} />
          </mesh>
          <mesh position={[0, L1 * 0.55, 0.22]} material={m.dark} castShadow>
            <boxGeometry args={[0.28, L1 * 0.7, 0.05]} />
          </mesh>
          {/* umbilical cable */}
          <mesh castShadow material={m.rubber}>
            <tubeGeometry
              args={[
                new THREE.CatmullRomCurve3([
                  new THREE.Vector3(0.12, 0.1, -0.28),
                  new THREE.Vector3(0.12, L1 * 0.45, -0.34),
                  new THREE.Vector3(0.1, L1 * 0.85, -0.3),
                  new THREE.Vector3(0.05, L1, -0.22),
                ]),
                24,
                0.035,
                8,
                false,
              ]}
            />
          </mesh>

          {/* elbow → forearm */}
          <group ref={elbowRef} position={[0, L1, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} material={m.dark} castShadow>
              <cylinderGeometry args={[0.27, 0.27, 0.6, 32]} />
            </mesh>
            <mesh position={[0.31, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={m.steel}>
              <cylinderGeometry args={[0.14, 0.14, 0.03, 24]} />
            </mesh>
            <Bolts r={0.2} n={6} y={0} size={0.03} />
            <mesh position={[0, L2 / 2, 0]} material={m.body} castShadow receiveShadow>
              <boxGeometry args={[0.34, L2, 0.32]} />
            </mesh>
            <mesh position={[0, L2 * 0.5, 0.17]} material={m.dark}>
              <boxGeometry args={[0.2, L2 * 0.6, 0.04]} />
            </mesh>

            {/* wrist → gripper */}
            <group ref={wristRef} position={[0, L2, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]} material={m.dark} castShadow>
                <cylinderGeometry args={[0.17, 0.17, 0.42, 28]} />
              </mesh>
              <mesh position={[0, 0.14, 0]} material={m.steel} castShadow>
                <cylinderGeometry args={[0.13, 0.15, 0.12, 24]} />
              </mesh>
              <group ref={gripRef} position={[0, 0.2, 0]}>
                <mesh position={[0, 0.07, 0]} material={m.dark} castShadow>
                  <boxGeometry args={[0.46, 0.14, 0.22]} />
                </mesh>
                <mesh position={[0, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} material={m.steel}>
                  <cylinderGeometry args={[0.025, 0.025, 1.0, 10]} />
                </mesh>
                <mesh ref={fingerL} position={[-0.46, 0.27, 0]} material={m.steel} castShadow>
                  <boxGeometry args={[0.07, 0.3, 0.16]} />
                </mesh>
                <mesh ref={fingerR} position={[0.46, 0.27, 0]} material={m.steel} castShadow>
                  <boxGeometry args={[0.07, 0.3, 0.16]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* conveyor */}
      <group position={[-1.5, 0, BELT_Z]}>
        <mesh ref={beltRef} position={[0, BELT_TOP - 0.035, 0]} receiveShadow>
          <boxGeometry args={[13, 0.07, 1.0]} />
          <meshStandardMaterial map={tex} roughness={0.9} metalness={0.1} />
        </mesh>
        {[-0.56, 0.56].map((z) => (
          <mesh key={z} position={[0, BELT_TOP - 0.1, z]} material={m.frame} castShadow>
            <boxGeometry args={[13, 0.2, 0.08]} />
          </mesh>
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <group key={i} position={[-6 + i * 2, 0, 0]}>
            {[-0.5, 0.5].map((z) => (
              <mesh key={z} position={[0, 0.2, z]} material={m.frame} castShadow>
                <boxGeometry args={[0.1, 0.4, 0.1]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* dispatch table + reject bin */}
      <mesh position={[PLACE.x, 0.25, PLACE.z]} material={m.frame} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.5, 1.2]} />
      </mesh>
      <mesh position={[PLACE.x, 0.505, PLACE.z]} material={m.dark} receiveShadow>
        <boxGeometry args={[1.4, 0.015, 1.1]} />
      </mesh>
      <mesh position={[BIN_X + 0.9, 0.3, BELT_Z]} material={m.frame} castShadow>
        <boxGeometry args={[1.0, 0.6, 1.1]} />
      </mesh>

      {/* product box */}
      <group ref={boxRef} visible={false}>
        <mesh material={m.cardboard} castShadow receiveShadow>
          <boxGeometry args={[BOX.x, BOX.y, BOX.z]} />
        </mesh>
        <mesh position={[0, BOX.y / 2 + 0.001, 0]} material={m.tape}>
          <boxGeometry args={[0.1, 0.004, BOX.z + 0.002]} />
        </mesh>
        <mesh position={[0.2, BOX.y / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 0.14]} />
          <meshBasicMaterial color="#f2f2f2" />
        </mesh>
      </group>

      {/* stack light */}
      <group position={[-3.2, 0, 2.7]}>
        <mesh position={[0, 0.7, 0]} material={m.dark} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 1.4, 10]} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.2, 20]} />
          <meshBasicMaterial ref={lampRef} color="#3a3a3a" />
        </mesh>
      </group>

      {/* background racking */}
      {[-5.5, -1.5, 2.5].map((x) => (
        <group key={x} position={[x, 0, -5.2]}>
          {[-1.3, 1.3].map((px) =>
            [0, 0.8].map((pz) => (
              <mesh key={`${px}${pz}`} position={[px, 1.6, pz]} material={m.frame} castShadow>
                <boxGeometry args={[0.08, 3.2, 0.08]} />
              </mesh>
            )),
          )}
          {[0.5, 1.5, 2.5].map((y) => (
            <group key={y}>
              <mesh position={[0, y, 0.4]} material={m.frame} castShadow receiveShadow>
                <boxGeometry args={[2.7, 0.05, 0.9]} />
              </mesh>
              {[-0.8, 0, 0.8].map((bx, i) => (
                <mesh key={bx} position={[bx, y + 0.25, 0.4]} material={m.cardboard} castShadow>
                  <boxGeometry args={[0.6 + (i % 2) * 0.1, 0.45, 0.55]} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </>
  );
}

export default function RobotCell({ live }: { live: MutableRefObject<Live> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="size-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [5.4, 3.5, 7.4], fov: 36, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        aria-hidden="true"
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#050505");
          scene.fog = new THREE.Fog("#050505", 11, 26);
        }}
      >
        <Env />
        <ambientLight intensity={0.12} />
        <spotLight
          position={[3.5, 8, 5]}
          angle={0.55}
          penumbra={0.9}
          intensity={260}
          decay={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
        />
        <directionalLight position={[-6, 4, -3]} intensity={1.4} />
        <pointLight position={[0, 3.2, 2.2]} intensity={14} distance={9} />
        <Cell live={live} />
      </Canvas>
    </div>
  );
}
