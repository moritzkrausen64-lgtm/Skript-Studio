import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";

export function GenAnim21780643410350({ format = "9:16", position = "bottom" }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const cx = width / 2;

  // ---------- Scene timing ----------
  // Scene 1: 0-60, Scene 2: 60-150, Scene 3: 150-240, Scene 4: 240-300

  // ---------- Global fade out ----------
  const globalFade = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- Knee SVG component ----------
  const KneeIllustration = ({ scale = 1, patellaPulse = 0, zoom = 1 }) => {
    return (
      <svg
        width={520}
        height={520}
        viewBox="0 0 200 200"
        style={{
          transform: `scale(${scale * zoom})`,
        }}
      >
        {/* Upper bone (femur) */}
        <rect x="78" y="10" width="44" height="70" rx="22" fill="#E8E2D0" stroke="#1A1A2E" strokeWidth="3" />
        {/* Lower bone (tibia) */}
        <rect x="80" y="120" width="40" height="75" rx="20" fill="#E8E2D0" stroke="#1A1A2E" strokeWidth="3" />
        {/* Joint cartilage */}
        <ellipse cx="100" cy="100" rx="40" ry="26" fill="#9AD6C4" stroke="#1A1A2E" strokeWidth="3" />
        {/* Patella (kneecap) - highlighted */}
        <g
          style={{
            transform: `translate(${cx ? 0 : 0}px, 0px) scale(${1 + patellaPulse * 0.08})`,
            transformOrigin: "100px 92px",
          }}
        >
          <ellipse
            cx="100"
            cy="92"
            rx="22"
            ry="28"
            fill="#FF5C5C"
            stroke="#FFFFFF"
            strokeWidth="3"
            opacity={0.95}
          />
          <ellipse cx="100" cy="92" rx="11" ry="14" fill="#FF8A8A" opacity={0.7} />
        </g>
        {/* Pain ripple */}
        {patellaPulse > 0 && (
          <circle
            cx="100"
            cy="92"
            r={28 + patellaPulse * 18}
            fill="none"
            stroke="#FF5C5C"
            strokeWidth="2.5"
            opacity={Math.max(0, 1 - patellaPulse)}
          />
        )}
      </svg>
    );
  };

  // ---------- Pill text helper ----------
  const Pill = ({ children, top, fontSize = 48, opacity = 1, fontWeight = 700 }) => (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.55)",
          borderRadius: 8,
          padding: "6px 14px",
          color: "#FFFFFF",
          fontSize,
          fontWeight,
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          maxWidth: width - 108,
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#1A1A2E", opacity: globalFade }}>
      {/* ================= SCENE 1 : HOOK ================= */}
      <Sequence from={0} durationInFrames={60}>
        <Scene1 frame={frame} fps={fps} width={width} height={height} KneeIllustration={KneeIllustration} />
      </Sequence>

      {/* ================= SCENE 2 : ERKLÄRUNG ================= */}
      <Sequence from={60} durationInFrames={90}>
        <Scene2
          frame={frame - 60}
          fps={fps}
          width={width}
          height={height}
          KneeIllustration={KneeIllustration}
          Pill={Pill}
        />
      </Sequence>

      {/* ================= SCENE 3 : VERTIEFUNG ================= */}
      <Sequence from={150} durationInFrames={90}>
        <Scene3
          frame={frame - 150}
          fps={fps}
          width={width}
          height={height}
          KneeIllustration={KneeIllustration}
          Pill={Pill}
        />
      </Sequence>

      {/* ================= SCENE 4 : OUTRO ================= */}
      <Sequence from={240} durationInFrames={60}>
        <Scene4
          frame={frame - 240}
          fps={fps}
          width={width}
          height={height}
          KneeIllustration={KneeIllustration}
          Pill={Pill}
        />
      </Sequence>
    </AbsoluteFill>
  );

  // ---------- Scene 1 ----------
  function Scene1({ frame, fps, width, height, KneeIllustration }) {
    const sc = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const titleOpacity = interpolate(frame, [12, 28], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: height / 2 - 320,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <KneeIllustration scale={sc} />
        </div>
        <div
          style={{
            position: "absolute",
            top: height / 2 + 230,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 2,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 72,
              fontWeight: 800,
              fontFamily: "Arial, sans-serif",
              textShadow: "0 3px 12px rgba(0,0,0,1)",
              textAlign: "center",
            }}
          >
            Patella betroffen
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ---------- Scene 2 ----------
  function Scene2({ frame, fps, width, height, KneeIllustration, Pill }) {
    const sc = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
    const pulse = (Math.sin(frame / 8) + 1) / 2 * 0.5;

    const label1 = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const label2 = interpolate(frame, [19, 31], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const overlay = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: height / 2 - 360,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <KneeIllustration scale={0.95 + sc * 0.05} patellaPulse={pulse} />
        </div>

        <Pill top={height / 2 + 180} opacity={label1}>
          Kniescheibe = Patella
        </Pill>
        <Pill top={height / 2 + 270} opacity={label2}>
          Sitzt vorne am Knie
        </Pill>

        <div
          style={{
            position: "absolute",
            top: 200,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 2,
            opacity: overlay,
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 60,
              fontWeight: 800,
              fontFamily: "Arial, sans-serif",
              textShadow: "0 3px 10px rgba(0,0,0,0.9)",
              textAlign: "center",
              maxWidth: width - 108,
            }}
          >
            Ist die Patella betroffen?
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ---------- Scene 3 ----------
  function Scene3({ frame, fps, width, height, KneeIllustration, Pill }) {
    const zoom = interpolate(frame, [0, 40], [1, 1.5], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const pulse = (Math.sin(frame / 6) + 1) / 2;

    const label1 = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const label2 = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: height / 2 - 340,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <KneeIllustration scale={1} zoom={zoom} patellaPulse={pulse} />
        </div>

        <Pill top={250} opacity={label1} fontSize={56} fontWeight={800}>
          Einfacher Test
        </Pill>
        <Pill top={height / 2 + 300} opacity={label2}>
          Druck auf die Patella
        </Pill>
      </AbsoluteFill>
    );
  }

  // ---------- Scene 4 ----------
  function Scene4({ frame, fps, width, height, KneeIllustration, Pill }) {
    const zoom = interpolate(frame, [0, 30], [1.5, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const t1 = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const t2 = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const t3 = interpolate(frame, [32, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    return (
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            top: height / 2 - 380,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <KneeIllustration scale={1} zoom={zoom} />
        </div>

        <Pill top={height / 2 + 120} opacity={t1} fontSize={50} fontWeight={800}>
          Schmerz lokalisieren
        </Pill>
        <Pill top={height / 2 + 210} opacity={t2} fontSize={50} fontWeight={800}>
          Patella gezielt prüfen
        </Pill>
        <Pill top={height / 2 + 300} opacity={t3} fontSize={50} fontWeight={800}>
          Ursache erkennen
        </Pill>
      </AbsoluteFill>
    );
  }
}