import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

export function GenAnim01780642977134({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global fade to BG at the very end
  const outroFade = interpolate(frame, [285, 300], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A2E" }}>
      {/* ============ SCENE 1 | 0:00 - 2:00 | HOOK ============ */}
      <Sequence from={0} durationInFrames={60}>
        <Scene1 />
      </Sequence>

      {/* ============ SCENE 2 | 2:00 - 5:00 | ERKLÄRUNG ============ */}
      <Sequence from={60} durationInFrames={90}>
        <Scene2 />
      </Sequence>

      {/* ============ SCENE 3 | 5:00 - 8:00 | VERTIEFUNG ============ */}
      <Sequence from={150} durationInFrames={90}>
        <Scene3 />
      </Sequence>

      {/* ============ SCENE 4 | 8:00 - 10:00 | OUTRO ============ */}
      <Sequence from={240} durationInFrames={60}>
        <Scene4 />
      </Sequence>

      {/* Final fade to BG */}
      <AbsoluteFill
        style={{
          backgroundColor: "#1A1A2E",
          opacity: outroFade,
          zIndex: 50,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}

/* ============================================================ */
/* KNEE SVG — reusable inline illustration                       */
/* ============================================================ */
function KneeIllustration({ pulse = 0, painGlow = 0 }) {
  return (
    <svg
      width="520"
      height="620"
      viewBox="0 0 520 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Upper leg bone (femur) */}
      <rect
        x="200"
        y="40"
        width="120"
        height="240"
        rx="60"
        fill="#E8E2D0"
        stroke="#C9C2A8"
        strokeWidth="6"
      />
      {/* Lower leg bone (tibia) */}
      <rect
        x="210"
        y="340"
        width="100"
        height="240"
        rx="50"
        fill="#E8E2D0"
        stroke="#C9C2A8"
        strokeWidth="6"
      />
      {/* Pain glow behind joint */}
      <circle
        cx="260"
        cy="310"
        r={120 + pulse * 16}
        fill="#FF4D6D"
        opacity={0.18 + painGlow * 0.22}
      />
      {/* Cartilage / joint cushion */}
      <ellipse
        cx="260"
        cy="305"
        rx="90"
        ry="40"
        fill="#7FD8C8"
        stroke="#4FB8A6"
        strokeWidth="5"
      />
      {/* Kneecap (patella) */}
      <ellipse
        cx="260"
        cy="300"
        rx="70"
        ry="65"
        fill="#F2ECDC"
        stroke="#C9C2A8"
        strokeWidth="6"
      />
      {/* Pain spark lines */}
      <g opacity={0.4 + painGlow * 0.6}>
        <line x1="120" y1="250" x2="170" y2="290" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
        <line x1="110" y1="320" x2="165" y2="320" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
        <line x1="120" y1="390" x2="170" y2="350" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
        <line x1="400" y1="250" x2="350" y2="290" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
        <line x1="410" y1="320" x2="355" y2="320" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
        <line x1="400" y1="390" x2="350" y2="350" stroke="#FF4D6D" strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ============================================================ */
/* SCENE 1 — HOOK                                                 */
/* ============================================================ */
function Scene1() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const scale = interpolate(scaleSpring, [0, 1], [0.3, 1]);

  const pulse = Math.sin(frame / 6) * 0.5 + 0.5;

  const headlineOpacity = interpolate(frame, [12, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Graphic layer */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
          transform: `scale(${scale})`,
        }}
      >
        <KneeIllustration pulse={pulse} painGlow={0.4} />
      </AbsoluteFill>

      {/* Text layer */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          zIndex: 2,
          paddingTop: 220,
        }}
      >
        <div
          style={{
            opacity: headlineOpacity,
            color: "#FFFFFF",
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            textShadow: "0 3px 12px rgba(0,0,0,1)",
            maxWidth: 920,
            lineHeight: 1.1,
          }}
        >
          Knieschmerz Intro
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ============================================================ */
/* SCENE 2 — ERKLÄRUNG                                            */
/* ============================================================ */
function Scene2() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame / 6) * 0.5 + 0.5;

  const labels = [
    { text: "Oberschenkelknochen", top: 240, delay: 6 },
    { text: "Gelenkknorpel", top: 760, delay: 15 },
    { text: "Kniescheibe", top: 1300, delay: 24 },
  ];

  const overlayOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Graphic layer */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <KneeIllustration pulse={pulse} painGlow={0.5} />
      </AbsoluteFill>

      {/* Sequential labels with pill backgrounds */}
      <AbsoluteFill style={{ zIndex: 2 }}>
        {labels.map((l, i) => {
          const op = interpolate(frame, [l.delay, l.delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: l.top,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                opacity: op,
              }}
            >
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 48,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  textAlign: "center",
                }}
              >
                {l.text}
              </div>
            </div>
          );
        })}

        {/* Kernbotschaft overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 260,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            opacity: overlayOpacity,
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 60,
              fontWeight: 800,
              fontFamily: "Arial, sans-serif",
              textAlign: "center",
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              maxWidth: 920,
              lineHeight: 1.15,
            }}
          >
            Schmerzen im Kniegelenk
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ============================================================ */
/* SCENE 3 — VERTIEFUNG (Zoom-In)                                 */
/* ============================================================ */
function Scene3() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoomSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const scale = interpolate(zoomSpring, [0, 1], [1, 1.7]);

  const pulse = Math.sin(frame / 5) * 0.5 + 0.5;
  const painGlow = interpolate(pulse, [0, 1], [0.4, 0.9]);

  const headlineOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Graphic zoom */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
          transform: `scale(${scale}) translateY(-20px)`,
        }}
      >
        <KneeIllustration pulse={pulse} painGlow={painGlow} />
      </AbsoluteFill>

      {/* Text layer */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          zIndex: 2,
          paddingBottom: 240,
        }}
      >
        <div
          style={{
            opacity: headlineOpacity,
            color: "#FFFFFF",
            fontSize: 60,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
            textShadow: "0 3px 10px rgba(0,0,0,0.9)",
            maxWidth: 920,
            lineHeight: 1.15,
          }}
        >
          Belastung trifft das Gelenk
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/* ============================================================ */
/* SCENE 4 — OUTRO                                                */
/* ============================================================ */
function Scene4() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoomSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const scale = interpolate(zoomSpring, [0, 1], [1.7, 1]);

  const pulse = Math.sin(frame / 7) * 0.5 + 0.5;

  const takeaways = [
    { text: "Schmerz nach dem Training", delay: 6 },
    { text: "Das Kniegelenk belastet", delay: 18 },
    { text: "Wir zeigen dir Lösungen", delay: 30 },
  ];

  return (
    <AbsoluteFill>
      {/* Graphic zoom back */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
          transform: `scale(${scale})`,
          opacity: 0.85,
        }}
      >
        <KneeIllustration pulse={pulse} painGlow={0.4} />
      </AbsoluteFill>

      {/* Key takeaways */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
          flexDirection: "column",
          gap: 28,
        }}
      >
        {takeaways.map((t, i) => {
          const op = interpolate(frame, [t.delay, t.delay + 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                opacity: op,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 50,
                  fontWeight: 700,
                  fontFamily: "Arial, sans-serif",
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  textAlign: "center",
                  maxWidth: 920,
                }}
              >
                {t.text}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}