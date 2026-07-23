import { useState, useEffect } from "react";
import { T } from "./tokens";

interface LoadingStepProps {
  onDone: () => void;
}

const MSGS = [
  "Reading your answers…",
  "Locating the contradiction that returns…",
  "Measuring the wanting–doing gap…",
  "Naming your pattern…",
];

export default function LoadingStep({ onDone }: LoadingStepProps) {
  const [m, setM] = useState(0);
  useEffect(() => {
    if (m >= MSGS.length - 1) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setM((x) => x + 1), 850);
    return () => clearTimeout(t);
  }, [m, onDone]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
      <div
        style={{
          width: 54, height: 54, borderRadius: "50%", marginBottom: 22,
          border: `3px solid ${T.lineSoft}`, borderTopColor: T.emBright,
          animation: "spin 1s linear infinite",
        }}
      />
      <p key={m} style={{ color: T.mute, fontSize: 16, animation: "rise .3s ease both" }}>{MSGS[m]}</p>
    </div>
  );
}
