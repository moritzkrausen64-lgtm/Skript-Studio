import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from "remotion";

export function GenAnim01780643331302({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---------- Scene 1: Hook (0:00–2:00) ----------
  const s1Spring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const s1Scale = interpolate(s1Spring, [0, 1], [0.3, 1]);
  const s1HeadlineOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s1Out = interpolate(frame, [55, 65], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---------- Scene 2: Erklärung (2:00–5:00) = frame 60–150 ----------
  const s2Local = frame - 60;
  const s2Spring = spring({ frame: s2Local, fps, config: { damping: 14, stiffness: 120 } });
  const s2Scale = interpolate(s2Spring, [0, 1], [0.7, 1]);
  const labelOpacity = (delayFrames) =>
    interpolate(s2Local, [delayFrames, delayFrames + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s2CoreOpacity = interpolate(s2Local, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---------- Scene 3: Vertiefung (5:00–8:00) = frame 150–240 ----------
  const s3Local = frame - 150;
  const s3Spring = spring({ frame: s3Local, fps, config: { damping: 14, stiffness: 120 } });
  const s3Zoom = interpolate(s3Spring, [0, 1], [1, 1.5]);
  const s3Opacity = interpolate(s3Local, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ---------- Scene 4: Outro (8:00–10:00) = frame 240–300 ----------
  const s4Local = frame - 240;
  const s4Zoom = interpolate(s4Local, [0, 20], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const takeaway = (delayFrames) =>
    interpolate(s4Local, [delayFrames, delayFrames + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(s4Local, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // graphical pulse (only on graphics)
  const pulse = 1 + 0.05 * Math.sin(frame / 6);

  const BG = "#1A1A2E";

  // ---------- Reusable Knie SVG ----------
  const KneeSVG = ({ size = 480, painPulse = 1 }) => (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Oberschenkelknochen */}
      <rect x="78" y="10" width="44" height="80" rx="22" fill="#F0EDE5" stroke="#000" strokeWidth="3" />
      {/* Unterschenkelknochen */}
      <rect x="80" y="110" width="40" height="80" rx="20" fill="#F0EDE5" stroke="#000" strokeWidth="3" />
      {/* Kniescheibe */}
      <ellipse cx="100" cy="100" rx="30" ry="26" fill="#FFE0B2" stroke="#000" strokeWidth="3" />
      {/* Knorpel / Gelenkspalt */}
      <rect x="76" y="90" width="48" height="6" rx="3" fill="#7EC8E3" />
      <rect x="76" y="104" width="48" height="6" rx="3" fill="#7EC8E3" />
      {/* Schmerz-Indikator */}
      <g transform={`translate(140,80) scale(${painPulse})`} style={{ transformOrigin: "center" }}>
        <circle cx="0" cy="0" r="16" fill="#FF3B5C" stroke="#000" strokeWidth="3" />
        <line x1="-22" y1="-22" x2="-12" y2="-12" stroke="#FF3B5C" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="-22" x2="12" y2="-12" stroke="#FF3B5C" strokeWidth="4" strokeLinecap="round" />
        <line x1="-22" y1="22" x2="-12" y2="12" stroke="#FF3B5C" strokeWidth="4" strokeLinecap="round" />
        <line x1="22" y1="22" x2="12" y2="12" stroke="#FF3B5C" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );

  const pillStyle = {
    background: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    padding: "6px 14px",
    color: "#FFFFFF",
    display: "inline-block",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* ===== Scene 1: Hook ===== */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ zIndex: 1, justifyContent: "center", alignItems: "center", opacity: s1Out }}>
          <div style={{ transform: `scale(${s1Scale * pulse})` }}>
            <KneeSVG size={520} painPulse={pulse} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-start", alignItems: "center", paddingTop: 320 }}>
          <div
            style={{
              opacity: s1HeadlineOpacity * s1Out,
              fontSize: 72,
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: "0 3px 12px rgba(0,0,0,1)",
              textAlign: "center",
              maxWidth: 900,
              padding: "0 54px",
            }}
          >
            Knieschmerz Intro
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== Scene 2: Erklärung ===== */}
      <Sequence from={60} durationInFrames={90}>
        <AbsoluteFill style={{ zIndex: 1, justifyContent: "center", alignItems: "center" }}>
          <div style={{ transform: `scale(${s2Scale})` }}>
            <KneeSVG size={460} painPulse={pulse} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-start", alignItems: "center", paddingTop: 180 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            <div style={{ ...pillStyle, opacity: labelOpacity(0), fontSize: 48, fontWeight: 700 }}>
              Kniescheibe
            </div>
            <div style={{ ...pillStyle, opacity: labelOpacity(9), fontSize: 48, fontWeight: 700 }}>
              Knorpel & Gelenk
            </div>
            <div style={{ ...pillStyle, opacity: labelOpacity(18), fontSize: 48, fontWeight: 700 }}>
              Belastung beim Laufen
            </div>
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-end", alignItems: "center", paddingBottom: 280 }}>
          <div
            style={{
              opacity: s2CoreOpacity,
              fontSize: 60,
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              textAlign: "center",
              maxWidth: 900,
              padding: "0 54px",
            }}
          >
            Schmerzen im Kniegelenk
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== Scene 3: Vertiefung ===== */}
      <Sequence from={150} durationInFrames={90}>
        <AbsoluteFill style={{ zIndex: 1, justifyContent: "center", alignItems: "center", opacity: s3Opacity }}>
          <div style={{ transform: `scale(${s3Zoom})` }}>
            <KneeSVG size={500} painPulse={pulse} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-start", alignItems: "center", paddingTop: 200 }}>
          <div
            style={{
              opacity: s3Opacity,
              ...pillStyle,
              fontSize: 56,
              fontWeight: 800,
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Reizung im Gelenk
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}>
          <div
            style={{
              opacity: s3Opacity,
              fontSize: 48,
              fontWeight: 700,
              color: "#FFFFFF",
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              textAlign: "center",
              maxWidth: 900,
              padding: "0 54px",
            }}
          >
            Nach dem Training spürbar
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===== Scene 4: Outro ===== */}
      <Sequence from={240} durationInFrames={60}>
        <AbsoluteFill style={{ zIndex: 1, justifyContent: "center", alignItems: "center" }}>
          <div style={{ transform: `scale(${s4Zoom})` }}>
            <KneeSVG size={420} painPulse={pulse} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2, justifyContent: "flex-start", alignItems: "center", paddingTop: 180 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            <div style={{ ...pillStyle, opacity: takeaway(0), fontSize: 50, fontWeight: 700 }}>
              Knie ernst nehmen
            </div>
            <div style={{ ...pillStyle, opacity: takeaway(12), fontSize: 50, fontWeight: 700 }}>
              Ursachen verstehen
            </div>
            <div style={{ ...pillStyle, opacity: takeaway(24), fontSize: 50, fontWeight: 700 }}>
              Gezielt entlasten
            </div>
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 3, backgroundColor: BG, opacity: fadeOut }} />
      </Sequence>
    </AbsoluteFill>
  );
}