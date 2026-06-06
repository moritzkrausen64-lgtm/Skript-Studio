import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

export function GenAnim01780643248054({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Global scene zoom logic
  const scene3Zoom = interpolate(frame, [150, 180], [1, 1.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scene4ZoomBack = interpolate(frame, [240, 270], [1.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalZoom = frame < 240 ? scene3Zoom : scene4ZoomBack;

  // Final fade
  const finalFade = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A2E" }}>
      {/* BG Layer */}
      <AbsoluteFill style={{ zIndex: 0, backgroundColor: "#1A1A2E" }} />

      {/* GRAFIK Layer */}
      <AbsoluteFill
        style={{
          zIndex: 1,
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${globalZoom})`,
          opacity: finalFade,
        }}
      >
        <KneeGraphic frame={frame} fps={fps} />
      </AbsoluteFill>

      {/* TEXT Layer */}
      <AbsoluteFill style={{ zIndex: 2, opacity: finalFade }}>
        {/* Scene 1 - Hook */}
        <Sequence from={0} durationInFrames={60}>
          <Scene1 frame={frame} fps={fps} />
        </Sequence>

        {/* Scene 2 - Erklärung */}
        <Sequence from={60} durationInFrames={90}>
          <Scene2 frame={frame - 60} fps={fps} />
        </Sequence>

        {/* Scene 3 - Vertiefung */}
        <Sequence from={150} durationInFrames={90}>
          <Scene3 frame={frame - 150} fps={fps} />
        </Sequence>

        {/* Scene 4 - Outro */}
        <Sequence from={240} durationInFrames={60}>
          <Scene4 frame={frame - 240} fps={fps} />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function KneeGraphic({ frame, fps }) {
  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Pulse only on graphic
  const pulse = 1 + Math.sin(frame / 8) * 0.03;

  // Pain indicators
  const painOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        transform: `scale(${scaleIn})`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        width="700"
        height="700"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Upper leg bone (femur) */}
        <rect
          x="160"
          y="40"
          width="80"
          height="150"
          rx="40"
          fill="#F5F0E1"
          stroke="#000000"
          strokeWidth="4"
        />
        {/* Knee joint */}
        <circle
          cx="200"
          cy="200"
          r="55"
          fill="#FF6B6B"
          stroke="#000000"
          strokeWidth="4"
          style={{ transform: `scale(${pulse})`, transformOrigin: "200px 200px" }}
        />
        {/* Kneecap (patella) */}
        <ellipse
          cx="200"
          cy="195"
          rx="28"
          ry="34"
          fill="#FFD93D"
          stroke="#000000"
          strokeWidth="4"
        />
        {/* Lower leg bone (tibia) */}
        <rect
          x="160"
          y="215"
          width="80"
          height="150"
          rx="40"
          fill="#F5F0E1"
          stroke="#000000"
          strokeWidth="4"
        />

        {/* Pain radiating lines */}
        <g opacity={painOpacity}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const inner = 65;
            const outer = 90 + Math.sin(frame / 6 + i) * 8;
            const x1 = 200 + Math.cos(rad) * inner;
            const y1 = 200 + Math.sin(rad) * inner;
            const x2 = 200 + Math.cos(rad) * outer;
            const y2 = 200 + Math.sin(rad) * outer;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FF3B3B"
                strokeWidth="6"
                strokeLinecap="round"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function Scene1({ frame, fps }) {
  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 220,
      }}
    >
      <div
        style={{
          opacity,
          color: "#FFFFFF",
          fontSize: 72,
          fontWeight: 800,
          textAlign: "center",
          textShadow: "0 3px 12px rgba(0,0,0,1)",
          WebkitTextStroke: "2px #000000",
          maxWidth: 900,
          lineHeight: 1.1,
        }}
      >
        Knieschmerz Intro
      </div>
    </AbsoluteFill>
  );
}

function Scene2({ frame, fps }) {
  const labels = [
    { text: "Lauftraining", delay: 0 },
    { text: "Krafttraining", delay: 9 },
  ];

  const coreOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Top labels */}
      <div
        style={{
          position: "absolute",
          top: 160,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        {labels.map((l, i) => {
          const op = interpolate(
            frame,
            [l.delay, l.delay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                opacity: op,
                color: "#FFFFFF",
                fontSize: 48,
                fontWeight: 700,
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </div>

      {/* Core message overlay bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 240,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: coreOpacity,
            color: "#FFFFFF",
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
            background: "rgba(0,0,0,0.55)",
            borderRadius: 8,
            padding: "12px 24px",
            maxWidth: 920,
            lineHeight: 1.1,
          }}
        >
          Schmerzen im Kniegelenk
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Scene3({ frame, fps }) {
  const opacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 240,
      }}
    >
      <div
        style={{
          opacity,
          color: "#FFFFFF",
          fontSize: 60,
          fontWeight: 800,
          textAlign: "center",
          background: "rgba(0,0,0,0.55)",
          borderRadius: 8,
          padding: "12px 24px",
          maxWidth: 920,
          lineHeight: 1.1,
        }}
      >
        Das Kniegelenk im Fokus
      </div>
    </AbsoluteFill>
  );
}

function Scene4({ frame, fps }) {
  const takeaways = [
    { text: "Knie früh entlasten", delay: 0 },
    { text: "Auf Warnsignale achten", delay: 12 },
    { text: "Gezielt vorbeugen", delay: 24 },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          alignItems: "center",
        }}
      >
        {takeaways.map((t, i) => {
          const op = interpolate(
            frame,
            [t.delay, t.delay + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                opacity: op,
                color: "#FFFFFF",
                fontSize: 52,
                fontWeight: 700,
                textAlign: "center",
                background: "rgba(0,0,0,0.55)",
                borderRadius: 8,
                padding: "10px 20px",
              }}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}