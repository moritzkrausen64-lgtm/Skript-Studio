import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";

const COLORS = { volt: "#ccff00", bg: "#0a0b0d", panel: "#131519", border: "#262a32", muted: "#8a9099", ink: "#f2f4f3" };
const FONT_STACK = { anton: "'Anton', Impact, sans-serif", grotesk: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif", mono: "'Space Mono', 'Courier New', monospace" };

function SpringIn({ children, from, delay = 0, style }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } });
  const ty = interpolate(prog, [0, 1], [from, 0]);
  const op = interpolate(prog, [0, 1], [0, 1]);
  return <div style={{ transform: `translateY(${ty}px)`, opacity: op, ...style }}>{children}</div>;
}

function FadeIn({ children, delay = 0, style }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 90 } });
  return <div style={{ opacity: prog, ...style }}>{children}</div>;
}

function AccentLine({ delay = 0, height }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 100 } });
  const scaleY = interpolate(prog, [0, 1], [0, 1], { easing: Easing.out(Easing.cubic) });
  const glowOpacity = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.06));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 8, height, background: COLORS.volt, borderRadius: 4, transformOrigin: "top", transform: `scaleY(${scaleY})`, boxShadow: `0 0 ${16 * glowOpacity}px ${8 * glowOpacity}px ${COLORS.volt}44` }} />
  );
}

function ScanLine({ delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 60 } });
  const opacity = interpolate(prog, [0, 0.2, 0.8, 1], [0, 0.6, 0.6, 0]);
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${COLORS.volt}88, transparent)`, opacity, transform: `translateY(${interpolate(prog, [0, 1], [0, 200])}px)` }} />
  );
}

function Kicker({ text, delay = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: frame - delay, fps, config: { damping: 25, stiffness: 80 } });
  return (
    <div style={{ opacity: prog, fontFamily: FONT_STACK.mono, fontSize: 26, letterSpacing: "0.18em", color: COLORS.volt, textTransform: "uppercase", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 20, height: 2, background: COLORS.volt, boxShadow: `0 0 8px ${COLORS.volt}` }} />
      {text}
    </div>
  );
}

function WordByWord({ text, startDelay = 0, style }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text || "").split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 12px", ...style }}>
      {words.map((w, i) => {
        const prog = spring({ frame: frame - startDelay - i * 4, fps, config: { damping: 16, stiffness: 130, mass: 0.6 } });
        const ty = interpolate(prog, [0, 1], [28, 0]);
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${ty}px)`, opacity: prog }}>{w}</span>
        );
      })}
    </div>
  );
}

export function TextCard({ kicker = "EINBLENDUNG", headline = "Headline Text", sub = "" }) {
  const frame = useCurrentFrame();
  const boxH = sub ? 380 : 280;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div style={{ position: "absolute", bottom: "12%", left: 60, right: 60 }}>
        <SpringIn from={60} delay={0}>
          <div style={{ position: "relative", background: COLORS.panel, borderRadius: 24, border: `1px solid ${COLORS.border}`, padding: "44px 56px 44px 72px", overflow: "hidden", minHeight: boxH, boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(204,255,0,0.08)` }}>
            <AccentLine delay={6} height={boxH + 88} />
            <ScanLine delay={4} />
            {/* Corner decoration */}
            <div style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderTop: `2px solid ${COLORS.volt}44`, borderRight: `2px solid ${COLORS.volt}44` }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, width: 32, height: 32, borderBottom: `2px solid ${COLORS.volt}44`, borderLeft: `2px solid ${COLORS.volt}44` }} />
            {/* Data decoration */}
            <div style={{ position: "absolute", top: 20, right: 60, fontFamily: FONT_STACK.mono, fontSize: 11, color: `${COLORS.volt}55`, letterSpacing: "0.1em" }}>
              {`REC ●  ${String(Math.floor(frame / 30)).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`}
            </div>
            <Kicker text={kicker} delay={8} />
            <WordByWord text={headline} startDelay={16} style={{ fontFamily: FONT_STACK.anton, fontSize: 72, color: COLORS.ink, lineHeight: 1.05, letterSpacing: "0.01em", marginBottom: sub ? 24 : 0 }} />
            {sub && (
              <FadeIn delay={40}>
                <div style={{ fontFamily: FONT_STACK.grotesk, fontSize: 30, color: COLORS.muted, lineHeight: 1.45, marginTop: 16, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>{sub}</div>
              </FadeIn>
            )}
          </div>
        </SpringIn>
      </div>
    </div>
  );
}
