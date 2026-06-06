import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";

const COLORS = { volt: "#ccff00", bg: "#0a0b0d", panel: "#131519", panel2: "#1a1d23", border: "#262a32", muted: "#8a9099", ink: "#f2f4f3", signal: "#ff5a3c" };
const FONT_STACK = { anton: "'Anton', Impact, sans-serif", grotesk: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif", mono: "'Space Mono', 'Courier New', monospace" };

function CountUp({ from = 0, to, delay = 0, suffix = "" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 40, stiffness: 60, mass: 1.2 } });
  const val = Math.round(interpolate(prog, [0, 1], [from, to]));
  const op = interpolate(Math.max(0, frame - delay), [0, 4], [0, 1]);
  return <span style={{ opacity: op }}>{val}{suffix}</span>;
}

function Bar({ label, pct, color, delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const labelProg = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 80 } });
  const barProg = spring({ frame: frame - delay - 6, fps, config: { damping: 30, stiffness: 55, mass: 1.1 } });
  const width = interpolate(barProg, [0, 1], [0, Math.max(2, Math.min(100, pct))]);
  const countVal = Math.round(interpolate(barProg, [0, 1], [0, pct]));
  return (
    <div style={{ marginBottom: 28, opacity: labelProg }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_STACK.mono, fontSize: 22, color: COLORS.muted, marginBottom: 10 }}>
        <span>{label}</span>
        <span style={{ color }}>{countVal}%</span>
      </div>
      <div style={{ position: "relative", height: 36, background: COLORS.panel2, borderRadius: 18 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${width}%`, borderRadius: 18, background: color, boxShadow: `0 0 20px ${color}66` }} />
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${width}%`, borderRadius: 18, background: `linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.12))` }} />
      </div>
    </div>
  );
}

function GridLines() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24, pointerEvents: "none" }}>
      {[0, 25, 50, 75, 100].map(x => (
        <div key={x} style={{ position: "absolute", left: `${x}%`, top: 0, bottom: 0, width: 1, background: `${COLORS.border}66` }} />
      ))}
    </div>
  );
}

export function StatCard({ kicker = "FAKT", value = "70", unit = "%", label = "", bars = [] }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hasBars = bars && bars.length > 0;
  const panelProg = spring({ frame, fps, config: { damping: 18, stiffness: 110, mass: 0.9 } });
  const panelY = interpolate(panelProg, [0, 1], [80, 0]);
  const numVal = parseFloat(value) || 0;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div style={{ position: "absolute", bottom: "10%", left: 60, right: 60, transform: `translateY(${panelY}px)`, opacity: panelProg }}>
        <div style={{ position: "relative", background: COLORS.panel, borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: "40px 52px", overflow: "hidden", boxShadow: `0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)` }}>
          {/* Scanline effect */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 39px, ${COLORS.border}22 39px, ${COLORS.border}22 40px)`, pointerEvents: "none", borderRadius: 24 }} />
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: FONT_STACK.mono, fontSize: 22, letterSpacing: "0.16em", color: COLORS.volt, textTransform: "uppercase" }}>◆ {kicker}</div>
            <div style={{ fontFamily: FONT_STACK.mono, fontSize: 12, color: `${COLORS.volt}55`, letterSpacing: "0.1em" }}>{`DATA/${String(frame).padStart(4, "0")}`}</div>
          </div>

          {hasBars ? (
            <>
              <GridLines />
              {bars.slice(0, 3).map((b, i) => (
                <Bar key={i} label={b.label} pct={Number(b.pct) || 0} color={i === 0 ? COLORS.volt : i === 1 ? COLORS.signal : "#7EB3FF"} delay={10 + i * 12} />
              ))}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontFamily: FONT_STACK.anton, fontSize: 180, color: COLORS.volt, lineHeight: 1, letterSpacing: "-0.02em", textShadow: `0 0 60px ${COLORS.volt}55` }}>
                <CountUp to={numVal} delay={8} suffix="" />
                {unit && <span style={{ fontSize: 80, color: COLORS.ink, marginLeft: 8 }}>{unit}</span>}
              </div>
              {label && (
                <div style={{ fontFamily: FONT_STACK.grotesk, fontSize: 30, color: COLORS.muted, marginTop: 12, lineHeight: 1.4 }}>{label}</div>
              )}
            </div>
          )}
          {/* Bottom line */}
          <div style={{ marginTop: 24, height: 2, background: `linear-gradient(90deg, ${COLORS.volt}, ${COLORS.volt}00)`, opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}
