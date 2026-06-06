import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel, T, COLORS, PANEL_DIMS } from "../utils/layout";

// EKG-Linie (kompakt für Panel-Breite)
function EkgLine({ frame, panelW }) {
  const period = 30;
  const beat = frame % period;
  const ox = (beat / period) * (panelW - 20);

  const path = `M 0,0 L ${ox - 50},0 L ${ox - 42},-8 L ${ox - 35},32 L ${ox - 28},-60 L ${ox - 20},44 L ${ox - 14},-14 L ${ox - 8},0 L ${panelW},0`;

  return (
    <g transform={`translate(0, 0)`}>
      <clipPath id="ekg-clip-h">
        <rect x="0" y="-80" width={panelW} height="160" />
      </clipPath>
      <g clipPath="url(#ekg-clip-h)">
        <path d={path} fill="none" stroke={COLORS.volt} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        <path d={path} fill="none" stroke={COLORS.volt} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
      </g>
    </g>
  );
}

// Kleines Herz-Icon für das Panel
function HeartIcon({ scale = 1, glow = 0 }) {
  const d = "M 0,-45 C 0,-90 -75,-90 -75,-45 C -75,0 0,60 0,90 C 0,60 75,0 75,-45 C 75,-90 0,-90 0,-45 Z";
  return (
    <g transform={`scale(${scale})`}>
      <path d={d} fill={COLORS.panel2} stroke={COLORS.volt} strokeWidth="4"
        style={{ filter: glow > 0.3 ? `drop-shadow(0 0 ${glow * 16}px ${COLORS.volt})` : "none" }} />
      <path d="M 0,-15 C 0,15 -22,38 0,68" fill="none" stroke={COLORS.volt} strokeWidth="2" opacity="0.35" />
      {/* Aorta */}
      <rect x="-14" y="-88" width="28" height="38" rx="14" fill={COLORS.panel2} stroke={COLORS.volt} strokeWidth="2.5" />
    </g>
  );
}

export function HeartPump({
  bpm = 72,
  label = "HERZFREQUENZ",
  format = "9:16",
  position = "bottom",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const framesPerBeat = Math.round((60 / bpm) * fps);
  const beatPhase = frame % framesPerBeat;
  const beatProgress = beatPhase / framesPerBeat;
  const isSystole = beatProgress < 0.3;
  const systProg = isSystole ? beatProgress / 0.3 : 0;

  const heartScale = isSystole
    ? 1 + systProg * 0.1 - systProg * systProg * 0.1
    : 1 - (beatProgress - 0.3) * 0.05;
  const glow = isSystole ? systProg * (1 - systProg) * 4 : 0;

  const appear = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const displayBpm = Math.round(bpm + Math.sin(frame * 0.15) * 2);

  const dims = PANEL_DIMS[format]?.[position] || PANEL_DIMS["9:16"].bottom;
  const panelW = dims.w;
  const panelH = dims.h;

  // Layout: Herz links, Daten rechts
  const heartAreaW = panelH;  // quadratischer Bereich für das Herz
  const dataAreaX = heartAreaW + 20;
  const dataAreaW = panelW - heartAreaW - 20;
  const ekgY = panelH - 64;

  const fmt = format === "9:16" ? { w: 1080, h: 1920 } : { w: 1920, h: 1080 };

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent", position: "relative" }}>
      {/* Kein Vollbild-Hintergrund — nur das Panel */}

      <GlassPanel format={format} position={position} accentColor={COLORS.volt} tint="rgba(80,0,0,0.06)">
        <svg width={panelW - 20} height={panelH} viewBox={`0 0 ${panelW - 20} ${panelH}`} style={{ display: "block" }}>

          {/* Herz — links */}
          <g transform={`translate(${heartAreaW / 2}, ${panelH / 2 - 10}) scale(${appear * heartScale})`}>
            <HeartIcon scale={panelH / 250} glow={glow} />
          </g>

          {/* EKG-Linie — läuft über die volle Breite unten */}
          <g transform={`translate(0, ${ekgY + 24})`} opacity={appear}>
            <rect x="0" y="-18" width={panelW - 20} height="40" rx="8" fill="rgba(0,0,0,0.3)" />
            <EkgLine frame={frame} panelW={panelW - 20} />
          </g>

          {/* Daten — rechts */}
          <g transform={`translate(${dataAreaX}, 14)`} opacity={appear}>
            {/* Kicker */}
            <text y="38" fontFamily="'Space Mono','Courier New',monospace" fontSize="36" fontWeight="700"
              fill={COLORS.volt} letterSpacing="0.1em">◆ {label}</text>

            {/* Großer BPM-Wert */}
            <text y={panelH * 0.55} fontFamily="'Anton',Impact,sans-serif" fontSize="120" fontWeight="900"
              fill={COLORS.volt}
              style={{ filter: glow > 0.3 ? `drop-shadow(0 0 ${glow * 20}px ${COLORS.volt})` : "none" }}>
              {displayBpm}
            </text>

            {/* Einheit */}
            <text y={panelH * 0.55 + 44} fontFamily="'Space Mono','Courier New',monospace" fontSize="40" fontWeight="600"
              fill={COLORS.muted} letterSpacing="0.1em">BPM</text>

            {/* Sekundärinfo */}
            <text y={panelH - 24} fontFamily="'Space Mono','Courier New',monospace" fontSize="32"
              fill={COLORS.muted} opacity="0.7">
              {`CARDIAC OUT · ${(displayBpm * 0.07).toFixed(1)} L/min`}
            </text>
          </g>

          {/* Puls-Ringe am Herz */}
          {glow > 0.5 && (
            <g transform={`translate(${heartAreaW / 2}, ${panelH / 2 - 10})`} opacity={glow}>
              <circle r={panelH * 0.45 * heartScale * 1.15} fill="none" stroke={COLORS.volt} strokeWidth="2" opacity="0.3" />
              <circle r={panelH * 0.45 * heartScale * 1.3} fill="none" stroke={COLORS.volt} strokeWidth="1" opacity="0.15" />
            </g>
          )}
        </svg>
      </GlassPanel>
    </div>
  );
}
