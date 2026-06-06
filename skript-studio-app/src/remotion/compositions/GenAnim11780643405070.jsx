import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

export function GenAnim11780643405070({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---------- Scene 1: Hook (0-60) ----------
  const hookScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const hookHeadlineOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Scene 2: Erklärung (60-150) ----------
  const s2 = frame - 60;
  const s2Expand = spring({
    frame: s2,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const label1Opacity = interpolate(s2, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const label2Opacity = interpolate(s2, [19, 31], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const coreOpacity = interpolate(s2, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Scene 3: Vertiefung (150-240) ----------
  const s3 = frame - 150;
  const s3Zoom = interpolate(s3, [0, 40], [1, 1.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const s3Opacity = interpolate(s3, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pulse = 1 + 0.05 * Math.sin(s3 / 5);

  // ---------- Scene 4: Outro (240-300) ----------
  const s4 = frame - 240;
  const s4Zoom = interpolate(s4, [0, 30], [1.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const take1 = interpolate(s4, [5, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const take2 = interpolate(s4, [17, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const take3 = interpolate(s4, [29, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [288, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Global knee bend animation (slow)
  const bend = Math.sin(frame / 22) * 14;

  const KneeSVG = ({ glow = false }) => (
    <svg
      width="520"
      height="520"
      viewBox="0 0 520 520"
      style={{ overflow: "visible" }}
    >
      {/* Oberschenkelknochen */}
      <g transform={`rotate(${-bend} 260 250)`}>
        <rect
          x="230"
          y="40"
          width="60"
          height="220"
          rx="30"
          fill="#E8E8F0"
          stroke="#000"
          strokeWidth="4"
        />
      </g>
      {/* Gelenkkapsel / Knie */}
      <circle
        cx="260"
        cy="260"
        r="58"
        fill="#F2F2FA"
        stroke="#000"
        strokeWidth="4"
      />
      {/* Meniskus (animiert) */}
      <ellipse
        cx="260"
        cy="278"
        rx={48 * (glow ? pulse : 1)}
        ry={18 * (glow ? pulse : 1)}
        fill="#FF5A6E"
        stroke="#000"
        strokeWidth="4"
      />
      {glow && (
        <ellipse
          cx="260"
          cy="278"
          rx={48 * pulse + 14}
          ry={18 * pulse + 8}
          fill="none"
          stroke="#FF5A6E"
          strokeWidth="3"
          opacity="0.4"
        />
      )}
      {/* Unterschenkelknochen */}
      <g transform={`rotate(${bend} 260 290)`}>
        <rect
          x="230"
          y="290"
          width="60"
          height="220"
          rx="30"
          fill="#E8E8F0"
          stroke="#000"
          strokeWidth="4"
        />
      </g>
    </svg>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A2E" }}>
      {/* ---------------- BG layer ---------------- */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #25254A 0%, #1A1A2E 70%)",
          zIndex: 0,
          opacity: fadeOut,
        }}
      />

      {/* ---------------- Scene 1 ---------------- */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              transform: `scale(${hookScale})`,
            }}
          >
            <KneeSVG />
          </div>
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            zIndex: 2,
            paddingTop: "260px",
          }}
        >
          <div
            style={{
              opacity: hookHeadlineOpacity,
              fontSize: "72px",
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: "0 3px 12px rgba(0,0,0,1)",
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
            }}
          >
            Meniskus-Test
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ---------------- Scene 2 ---------------- */}
      <Sequence from={60} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ transform: `scale(${0.85 + s2Expand * 0.15})` }}>
            <KneeSVG glow />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ zIndex: 2 }}>
          <div
            style={{
              position: "absolute",
              top: "300px",
              left: "120px",
              opacity: label1Opacity,
              background: "rgba(0,0,0,0.55)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "48px",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Knie beugen
          </div>
          <div
            style={{
              position: "absolute",
              top: "1180px",
              right: "120px",
              opacity: label2Opacity,
              background: "rgba(0,0,0,0.55)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "48px",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Meniskus prüfen
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "260px",
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: coreOpacity,
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,0.55)",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "60px",
                fontWeight: 800,
                color: "#FFFFFF",
                fontFamily: "Arial, sans-serif",
              }}
            >
              Meniskus mobilisieren
            </span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ---------------- Scene 3 ---------------- */}
      <Sequence from={150} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ transform: `scale(${s3Zoom})`, opacity: s3Opacity }}>
            <KneeSVG glow />
          </div>
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            justifyContent: "flex-start",
            alignItems: "center",
            zIndex: 2,
            paddingTop: "180px",
          }}
        >
          <div
            style={{
              opacity: s3Opacity,
              fontSize: "60px",
              fontWeight: 800,
              color: "#FFFFFF",
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            Spürst du Schmerz?
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ---------------- Scene 4 ---------------- */}
      <Sequence from={240} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <div style={{ transform: `scale(${s4Zoom})` }}>
            <KneeSVG />
          </div>
        </AbsoluteFill>
        <AbsoluteFill
          style={{
            zIndex: 2,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: "200px",
            gap: "24px",
          }}
        >
          <div
            style={{
              opacity: take1,
              background: "rgba(0,0,0,0.55)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "52px",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Langsam testen
          </div>
          <div
            style={{
              opacity: take2,
              background: "rgba(0,0,0,0.55)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "52px",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Meniskus mobilisieren
          </div>
          <div
            style={{
              opacity: take3,
              background: "rgba(0,0,0,0.55)",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "52px",
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Bei Schmerz: Arzt
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}