import { useState, useRef } from "react";
import type { PointerEvent } from "react";
import { T } from "./tokens";
import { Nav, Panel } from "./shared";

interface DrawGoalProps {
  drawn: boolean;
  setDrawn: (d: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  cta: string;
}

interface Pt {
  x: number;
  y: number;
}

/* The signature interaction: sketch your trajectory if you do nothing.
   Pointer events cover mouse and touch; touchAction none stops scrolling
   from eating the gesture. */
export default function DrawGoal({ drawn, setDrawn, onNext, onBack, cta }: DrawGoalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pts, setPts] = useState<Pt[]>([]);
  const dragging = useRef(false);
  const W = 320, H = 210, PAD = 10;

  const toPoint = (e: PointerEvent<SVGSVGElement>): Pt => {
    const rect = svgRef.current!.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    return {
      x: Math.max(PAD, Math.min(W - PAD, cx)),
      y: Math.max(PAD, Math.min(H - PAD, cy)),
    };
  };
  const start = (e: PointerEvent<SVGSVGElement>) => { dragging.current = true; setPts([toPoint(e)]); };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = toPoint(e);
    setPts((prev) => (prev.length && p.x <= prev[prev.length - 1].x ? prev : [...prev, p]));
  };
  const end = () => {
    if (dragging.current && pts.length > 4) setDrawn(true);
    dragging.current = false;
  };
  const clear = () => { setPts([]); setDrawn(false); };
  const path = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
        The next 3 months — if <span style={{ color: T.emBright, fontStyle: "italic" }}>you</span> do nothing
      </h2>
      <p style={{ color: T.mute, fontSize: 15, margin: "0 0 16px" }}>
        Sketch how you think you'll be feeling.
      </p>
      <Panel>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>How it feels</span>
          <span style={{ color: T.faint, fontSize: 13 }}>today → 3 months</span>
        </div>
        <div style={{ position: "relative" }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            data-testid="draw-canvas"
            style={{ width: "100%", height: "auto", touchAction: "none", display: "block", borderRadius: 12, background: "rgba(10,8,22,0.55)", cursor: "crosshair" }}
            onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end}
          >
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} stroke={T.lineSoft} strokeWidth="1" />
            ))}
            <text x={PAD + 2} y={22} fill={T.faint} fontSize="11">Light</text>
            <text x={PAD + 2} y={H - 10} fill={T.faint} fontSize="11">Heavy</text>
            {pts.length > 1 && (
              <polyline
                points={path} fill="none" stroke={T.emBright} strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 6px ${T.emLine})` }}
              />
            )}
          </svg>
          {pts.length === 0 && (
            <div
              style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center",
                justifyContent: "center", pointerEvents: "none", color: T.faint, fontSize: 14,
              }}
            >
              draw your line ✍️
            </div>
          )}
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 8, minHeight: 20 }}>
          {drawn ? (
            <span style={{ color: T.vio, fontSize: 13, animation: "rise .3s ease both" }}>
              A trajectory, not a verdict. Patterns bend once they're seen.
            </span>
          ) : <span />}
          <button
            onClick={clear}
            data-testid="button-clear-draw"
            style={{ background: "none", border: "none", color: T.faint, fontSize: 13, cursor: "pointer" }}
          >
            clear
          </button>
        </div>
      </Panel>
      <Nav onBack={onBack} onNext={onNext} label={drawn ? `${cta} →` : "Skip the sketch →"} ghost={!drawn} />
    </div>
  );
}
