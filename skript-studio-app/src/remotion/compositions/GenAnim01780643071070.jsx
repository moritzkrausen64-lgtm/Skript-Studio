import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

export function GenAnim01780643071070({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ===== SCENE TIMINGS (frames @30fps) =====
  // Scene 1: 0-60, Scene 2: 60-150, Scene 3: 150-240, Scene 4: 240-300

  // ===== SCENE 1 — HOOK =====
  const s1Scale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const s1HeadOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s1Out = interpolate(frame, [55, 62], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== SCENE 2 — ERKLÄRUNG =====
  const s2Frame = frame - 60;
  const s2In = interpolate(s2Frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s2Out = interpolate(frame, [142, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelOpacity = (delayFrames) =>
    interpolate(s2Frame, [delayFrames, delayFrames + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const coreOverlay = interpolate(s2Frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== SCENE 3 — VERTIEFUNG =====
  const s3Frame = frame - 150;
  const s3In = interpolate(s3Frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s3Out = interpolate(frame, [232, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoomScale = interpolate(s3Frame, [0, 60], [1, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== SCENE 4 — OUTRO =====
  const s4Frame = frame - 240;
  const s4In = interpolate(s4Frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const takeaway = (delayFrames) =>
    interpolate(s4Frame, [delayFrames, delayFrames + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const fadeOut = interpolate(frame, [288, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ===== PULSE für Grafik =====
  const pulse = 1 + 0.04 * Math.sin(frame / 5);
  const painPulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 6));

  // ===== KNIE SVG (inline) =====
  const KneeSVG = ({ painActive = false }) => (
    <svg
      width="460"
      height="620"
      viewBox="0 0 460 620"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Oberschenkelknochen */}
      <rect x="180" y="20" width="100" height="240" rx="48" fill="#F2E9D8" stroke="#000" strokeWidth="4" />
      {/* Unterschenkelknochen */}
      <rect x="185" y="360" width="90" height="240" rx="44" fill="#F2E9D8" stroke="#000" strokeWidth="4" />
      {/* Kniescheibe */}
      <ellipse cx="230" cy="310" rx="78" ry="92" fill="#FFFFFF" stroke="#000" strokeWidth="4" />
      {/* Knorpelflächen */}
      <path d="M180 260 Q230 300 280 260" fill="none" stroke="#4ECDC4" strokeWidth="10" strokeLinecap="round" />
      <path d="M185 360 Q230 320 275 360" fill="none" stroke="#4ECDC4" strokeWidth="10" strokeLinecap="round" />
      {/* Schmerzpunkt */}
      <circle
        cx="230"
        cy="310"
        r={painActive ? 30 * painPulse + 14 : 0}
        fill="#FF4757"
        opacity={painActive ? 0.5 : 0}
      />
      {painActive && (
        <>
          <line x1="320" y1="240" x2="370" y2="190" stroke="#FF4757" strokeWidth="8" strokeLinecap="round" />
          <line x1="330" y1="310" x2="392" y2="310" stroke="#FF4757" strokeWidth="8" strokeLinecap="round" />
          <line x1="320" y1="380" x2="370" y2="430" stroke="#FF4757" strokeWidth="8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );

  const centerX = width / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A2E", opacity: fadeOut }}>
      {/* ===================== SCENE 1 ===================== */}
      <Sequence from={0} durationInFrames={62}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: s1Out,
          }}
        >
          {/* Grafik Layer */}
          <div
            style={{
              zIndex: 1,
              transform: `scale(${s1Scale * pulse})`,
              marginBottom: 60,
            }}
          >
            <KneeSVG painActive={false} />
          </div>
          {/* Text Layer */}
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 360,
              width: "100%",
              textAlign: "center",
              opacity: s1HeadOpacity,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 72,
                fontWeight: 800,
                fontFamily: "Arial, sans-serif",
                textShadow: "0 3px 12px rgba(0,0,0,1)",
              }}
            >
              Knieschmerz Intro
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===================== SCENE 2 ===================== */}
      <Sequence from={60} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: Math.min(s2In, s2Out),
          }}
        >
          {/* Grafik */}
          <div
            style={{
              zIndex: 1,
              transform: `scale(${1 + 0.15 * s2In})`,
              marginTop: -120,
            }}
          >
            <KneeSVG painActive={true} />
          </div>

          {/* Labels mit Pill */}
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 880,
              opacity: labelOpacity(15),
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "Arial, sans-serif",
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              Kniescheibe
            </span>
          </div>
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 960,
              opacity: labelOpacity(24),
            }}
          >
            <span
              style={{
                color: "#4ECDC4",
                fontSize: 48,
                fontWeight: 700,
                fontFamily: "Arial, sans-serif",
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              Knorpel im Gelenk
            </span>
          </div>

          {/* Kernbotschaft Overlay */}
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 1140,
              width: "100%",
              textAlign: "center",
              opacity: coreOverlay,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 60,
                fontWeight: 800,
                fontFamily: "Arial, sans-serif",
                textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              }}
            >
              Schmerzen im Kniegelenk
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===================== SCENE 3 ===================== */}
      <Sequence from={150} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: Math.min(s3In, s3Out),
          }}
        >
          {/* Zoom Grafik */}
          <div
            style={{
              zIndex: 1,
              transform: `scale(${zoomScale})`,
              marginTop: -80,
            }}
          >
            <KneeSVG painActive={true} />
          </div>

          {/* Detail Text */}
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 1080,
              width: "90%",
              textAlign: "center",
              opacity: s3In,
            }}
          >
            <span
              style={{
                color: "#FFFFFF",
                fontSize: 56,
                fontWeight: 800,
                fontFamily: "Arial, sans-serif",
                textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              Belastung trifft den Knorpel
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ===================== SCENE 4 ===================== */}
      <Sequence from={240} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            opacity: s4In,
          }}
        >
          {/* Gesamtansicht zurück */}
          <div
            style={{
              zIndex: 1,
              transform: `scale(${interpolate(s4Frame, [0, 30], [1.4, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
              marginTop: -260,
            }}
          >
            <KneeSVG painActive={false} />
          </div>

          {/* Key Takeaways */}
          <div
            style={{
              zIndex: 2,
              position: "absolute",
              top: 980,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ opacity: takeaway(5), marginBottom: 26 }}>
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: 50,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8,
                  padding: "6px 14px",
                }}
              >
                Schmerzen ernst nehmen
              </span>
            </div>
            <div style={{ opacity: takeaway(17), marginBottom: 26 }}>
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: 50,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8,
                  padding: "6px 14px",
                }}
              >
                Gelenk gezielt entlasten
              </span>
            </div>
            <div style={{ opacity: takeaway(29) }}>
              <span
                style={{
                  color: "#4ECDC4",
                  fontSize: 50,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8,
                  padding: "6px 14px",
                }}
              >
                Richtig trainieren hilft
              </span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}