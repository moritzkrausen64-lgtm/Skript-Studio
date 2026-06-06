import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";

const COLORS = { volt: "#ccff00", bg: "#0a0b0d", panel: "#131519", panel2: "#1a1d23", border: "#262a32", muted: "#8a9099", ink: "#f2f4f3", bodyFill: "#1c2028", bodyStroke: "#2e3540" };
const FONT_STACK = { anton: "'Anton', Impact, sans-serif", grotesk: "'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif", mono: "'Space Mono', 'Courier New', monospace" };

// Body part positions (x, y) in 1080x1920 coord space
const REGIONS = {
  Knie:         { x: 540, y: 1220, bx: 720, by: 1050 },
  Hüfte:        { x: 540, y: 1000, bx: 820, by: 860  },
  Schulter:     { x: 540, y: 640,  bx: 820, by: 500  },
  Rücken:       { x: 580, y: 830,  bx: 820, by: 680  },
  Wade:         { x: 520, y: 1380, bx: 780, by: 1240 },
  Oberschenkel: { x: 530, y: 1100, bx: 800, by: 960  },
  Herz:         { x: 570, y: 730,  bx: 820, by: 590  },
  Sehne:        { x: 540, y: 1300, bx: 760, by: 1160 },
};

function Body({ progress }) {
  const parts = [
    // Head
    { el: <circle key="head" cx="540" cy="390" r="90" />, delay: 0 },
    // Neck
    { el: <rect key="neck" x="510" y="470" width="60" height="60" rx="20" />, delay: 1 },
    // Torso
    { el: <rect key="torso" x="430" y="528" width="220" height="380" rx="70" />, delay: 2 },
    // Left upper arm
    { el: <rect key="lua" x="352" y="545" width="72" height="240" rx="34" />, delay: 3 },
    // Right upper arm
    { el: <rect key="rua" x="656" y="545" width="72" height="240" rx="34" />, delay: 3 },
    // Left forearm
    { el: <rect key="lfa" x="355" y="792" width="64" height="200" rx="30" />, delay: 4 },
    // Right forearm
    { el: <rect key="rfa" x="661" y="792" width="64" height="200" rx="30" />, delay: 4 },
    // Left thigh
    { el: <rect key="lt" x="454" y="900" width="80" height="290" rx="38" />, delay: 5 },
    // Right thigh
    { el: <rect key="rt" x="546" y="900" width="80" height="290" rx="38" />, delay: 5 },
    // Left shin
    { el: <rect key="ls" x="458" y="1195" width="72" height="310" rx="34" />, delay: 6 },
    // Right shin
    { el: <rect key="rs" x="550" y="1195" width="72" height="310" rx="34" />, delay: 6 },
    // Left foot
    { el: <ellipse key="lf" cx="490" cy="1535" rx="55" ry="28" />, delay: 7 },
    // Right foot
    { el: <ellipse key="rf" cx="588" cy="1535" rx="55" ry="28" />, delay: 7 },
  ];

  return (
    <g>
      {parts.map(({ el, delay }) => {
        const partProgress = Math.min(1, Math.max(0, (progress - delay * 0.07)));
        return (
          <g key={el.key} style={{ opacity: partProgress }} fill={COLORS.bodyFill} stroke={COLORS.bodyStroke} strokeWidth="3">
            {el}
          </g>
        );
      })}
      {/* Muscle definition lines */}
      {progress > 0.7 && (
        <g stroke={COLORS.bodyStroke} strokeWidth="1.5" fill="none" opacity={Math.min(1, (progress - 0.7) * 3.3)}>
          <line x1="530" y1="545" x2="530" y2="900" />
          <line x1="550" y1="545" x2="550" y2="900" />
          <path d="M 455 640 Q 540 680 625 640" />
          <path d="M 455 700 Q 540 740 625 700" />
        </g>
      )}
    </g>
  );
}

function ScanEffect({ frame }) {
  const scanY = interpolate(frame, [20, 80], [300, 1600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = frame < 20 ? 0 : frame > 80 ? 0 : 0.8;
  return (
    <g opacity={opacity}>
      <line x1="200" y1={scanY} x2="880" y2={scanY} stroke={COLORS.volt} strokeWidth="1.5" />
      <line x1="200" y1={scanY - 2} x2="880" y2={scanY - 2} stroke={COLORS.volt} strokeWidth="0.5" opacity="0.3" />
      <rect x="200" y={scanY - 30} width="680" height="30" fill={`${COLORS.volt}08`} />
    </g>
  );
}

function PulseMarker({ x, y, frame, startFrame }) {
  const localFrame = Math.max(0, frame - startFrame);
  const { fps } = useVideoConfig();
  const appear = spring({ frame: localFrame, fps, config: { damping: 15, stiffness: 150 } });
  const pulseScale = 1 + 0.25 * Math.abs(Math.sin(localFrame * 0.12));
  const pulseOpacity = 0.6 + 0.4 * Math.abs(Math.sin(localFrame * 0.12));
  if (localFrame < 0) return null;
  return (
    <g opacity={appear}>
      {/* Outer ring pulse */}
      <circle cx={x} cy={y} r={52 * pulseScale} fill="none" stroke={COLORS.volt} strokeWidth="2" opacity={pulseOpacity * 0.4} />
      {/* Middle ring */}
      <circle cx={x} cy={y} r={44} fill="none" stroke={COLORS.volt} strokeWidth="3" opacity={0.7} />
      {/* Inner filled */}
      <circle cx={x} cy={y} r={16} fill={COLORS.volt} />
      {/* Center dot */}
      <circle cx={x} cy={y} r={5} fill={COLORS.bg} />
      {/* Cross-hair lines */}
      <line x1={x - 70} y1={y} x2={x - 52} y2={y} stroke={COLORS.volt} strokeWidth="2" opacity="0.6" />
      <line x1={x + 52} y1={y} x2={x + 70} y2={y} stroke={COLORS.volt} strokeWidth="2" opacity="0.6" />
      <line x1={x} y1={y - 70} x2={x} y2={y - 52} stroke={COLORS.volt} strokeWidth="2" opacity="0.6" />
      <line x1={x} y1={y + 52} x2={x} y2={y + 70} stroke={COLORS.volt} strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function Callout({ rx, ry, bx, by, kicker, label, frame, startFrame }) {
  const localFrame = Math.max(0, frame - startFrame);
  const { fps } = useVideoConfig();
  const appear = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 100 } });
  const lineProgress = spring({ frame: localFrame - 4, fps, config: { damping: 30, stiffness: 80 } });
  const boxW = 340;
  const boxH = 110;
  const lx1 = rx + (bx > rx ? 55 : -55);
  const ly1 = ry + (by > ry ? 30 : -30);

  return (
    <g>
      {/* Connector line with draw-on effect */}
      <line
        x1={lx1} y1={ly1} x2={bx} y2={by}
        stroke={COLORS.volt} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="300"
        strokeDashoffset={interpolate(lineProgress, [0, 1], [300, 0])}
        opacity={0.9}
      />
      {/* Callout box */}
      <g opacity={spring({ frame: localFrame - 8, fps, config: { damping: 18, stiffness: 110 } })}>
        <rect x={bx - (bx > rx ? 0 : boxW)} y={by - boxH / 2} width={boxW} height={boxH} rx="14"
          fill={COLORS.panel} stroke={COLORS.volt} strokeWidth="1.5"
        />
        {/* Top accent */}
        <rect x={bx - (bx > rx ? 0 : boxW)} y={by - boxH / 2} width={boxW} height={3} rx="14" fill={COLORS.volt} />
        <text x={bx - (bx > rx ? -20 : boxW - 20)} y={by - 18}
          fontFamily={FONT_STACK.mono} fontSize="20" letterSpacing="0.12em" fill={COLORS.volt}>
          {(kicker || "").toUpperCase()}
        </text>
        <text x={bx - (bx > rx ? -20 : boxW - 20)} y={by + 22}
          fontFamily={FONT_STACK.anton} fontSize="36" fill={COLORS.ink}>
          {label || ""}
        </text>
      </g>
    </g>
  );
}

export function BodyMarker({ kicker = "REGION", label = "Herz", region = "Herz" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reg = REGIONS[region] || REGIONS["Herz"];
  const { x: rx, y: ry, bx, by } = reg;

  const bodyProgress = interpolate(frame, [0, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });

  const headerProg = spring({ frame: frame - 5, fps, config: { damping: 22, stiffness: 80 } });

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent", position: "relative" }}>
      {/* Header bar */}
      <div style={{ position: "absolute", top: 60, left: 60, right: 60, opacity: headerProg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: `${COLORS.panel}cc`, borderRadius: 14, border: `1px solid ${COLORS.border}`, backdropFilter: "blur(8px)" }}>
          <div style={{ fontFamily: FONT_STACK.mono, fontSize: 18, letterSpacing: "0.12em", color: COLORS.volt, textTransform: "uppercase" }}>◆ ANATOMIE SCAN</div>
          <div style={{ fontFamily: FONT_STACK.mono, fontSize: 13, color: COLORS.muted }}>{region.toUpperCase()}</div>
          <div style={{ fontFamily: FONT_STACK.mono, fontSize: 13, color: `${COLORS.volt}99` }}>
            {frame < 80 ? `SCANNING…` : "◉ MARKIERT"}
          </div>
        </div>
      </div>

      {/* SVG body + marker */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <Body progress={bodyProgress} />
        <ScanEffect frame={frame} />
        {frame >= 72 && <PulseMarker x={rx} y={ry} frame={frame} startFrame={72} />}
        {frame >= 85 && <Callout rx={rx} ry={ry} bx={bx} by={by} kicker={kicker} label={label} frame={frame} startFrame={85} />}

        {/* Grid overlay (subtle technical feel) */}
        <g opacity="0.04">
          {Array.from({ length: 20 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 100} x2="1080" y2={i * 100} stroke={COLORS.volt} strokeWidth="1" />)}
          {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={i * 108} y1="0" x2={i * 108} y2="1920" stroke={COLORS.volt} strokeWidth="1" />)}
        </g>
      </svg>
    </div>
  );
}
