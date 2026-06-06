import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassPanel, COLORS, PANEL_DIMS } from "../utils/layout";

function ATPDot({ angle, r, frame, delay = 0 }) {
  const orbit = ((frame - delay) * 2 + angle) % 360;
  const rad = (orbit * Math.PI) / 180;
  const x = Math.cos(rad) * r;
  const y = Math.sin(rad) * (r * 0.45);
  const pulse = 0.75 + 0.25 * Math.abs(Math.sin((frame - delay) * 0.12 + angle));
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={7 * pulse} fill={COLORS.volt} opacity={0.9} />
      <circle r={12 * pulse} fill={COLORS.volt} opacity={0.15} />
      <text textAnchor="middle" y="3.5" fontFamily="'Space Mono',monospace" fontSize="7" fill="#0a0b0d" fontWeight="bold">ATP</text>
    </g>
  );
}

export function Mitochondria({
  label = "MITOCHONDRIEN",
  format = "9:16",
  position = "bottom",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });
  const breathe = 1 + 0.04 * Math.sin(frame * 0.08);
  const pulsePhase = (frame % 45) / 45;
  const glowR = 18 + pulsePhase * 24;
  const glowOp = Math.max(0, 0.85 - pulsePhase * 0.85);
  const energyVal = Math.round(70 + 28 * (1 - Math.exp(-frame / 40)));

  const dims = PANEL_DIMS[format]?.[position] || PANEL_DIMS["9:16"].bottom;
  const panelW = dims.w;
  const panelH = dims.h;

  const mitW = panelH * 0.95;
  const dataX = mitW + 24;
  const cx = mitW / 2;
  const cy = panelH / 2;
  const rx = mitW * 0.36 * breathe;
  const ry = panelH * 0.34 * breathe;

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent", position: "relative" }}>
      <GlassPanel format={format} position={position} accentColor={COLORS.volt} tint="rgba(0,60,20,0.05)">
        <svg width={panelW - 20} height={panelH} viewBox={`0 0 ${panelW - 20} ${panelH}`} style={{ display: "block" }}>

          {/* Mitochondrium */}
          <g transform={`translate(${cx}, ${cy}) scale(${appear})`}>
            {/* Energie-Glow */}
            <ellipse rx={glowR * rx / 18} ry={glowR * ry / 18}
              fill={COLORS.volt} opacity={glowOp * 0.08}
              style={{ filter: "blur(8px)" }} />
            {/* Äußere Membran */}
            <ellipse rx={rx} ry={ry} fill={COLORS.panel2} stroke={COLORS.volt} strokeWidth="3.5" />
            {/* Innere Membran (gestrichelt) */}
            <ellipse rx={rx * 0.82} ry={ry * 0.8}
              fill="none" stroke={`${COLORS.volt}44`} strokeWidth="1.5" strokeDasharray="8 6" />
            {/* Cristae-Falten */}
            {[-ry * 0.3, 0, ry * 0.3].map((yOff, i) => (
              <polyline key={i}
                points={Array.from({ length: 9 }, (_, j) => {
                  const px = -rx * 0.6 + j * rx * 0.15;
                  const py = yOff + (j % 2 === 0 ? -ry * 0.1 : ry * 0.1);
                  return `${px},${py}`;
                }).join(" ")}
                fill="none" stroke={`${COLORS.volt}50`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            ))}
            {/* ATP-Partikel */}
            {[0, 72, 144, 216, 288].map((a, i) => (
              <ATPDot key={i} angle={a} r={rx * 1.3} frame={frame} delay={i * 6} />
            ))}
            {/* Zentrum */}
            <circle r="8" fill={COLORS.volt} opacity={0.25 + glowOp * 0.2} />
          </g>

          {/* Daten rechts */}
          <g transform={`translate(${dataX}, 14)`} opacity={appear}>
            <text y="38" fontFamily="'Space Mono','Courier New',monospace" fontSize="36" fontWeight="700"
              fill={COLORS.volt} letterSpacing="0.1em">◆ {label}</text>

            {/* Energie-Zahl */}
            <text y={panelH * 0.54} fontFamily="'Anton',Impact,sans-serif" fontSize="120" fontWeight="900"
              fill={COLORS.volt}>{energyVal * 38}</text>

            <text y={panelH * 0.54 + 44} fontFamily="'Space Mono','Courier New',monospace" fontSize="34" fontWeight="600"
              fill={COLORS.muted} letterSpacing="0.08em">ATP/SEK</text>

            {/* Energie-Balken */}
            <g transform={`translate(0, ${panelH - 58})`}>
              <rect x="0" y="0" width={panelW - dataX - 24} height="20" rx="10" fill={COLORS.panel2} />
              <rect x="0" y="0" width={(panelW - dataX - 24) * energyVal / 100} height="20" rx="10"
                fill={COLORS.volt} opacity="0.85" />
              <text x="8" y="14" fontFamily="'Space Mono',monospace" fontSize="18" fontWeight="700" fill="#0a0b0d">
                {energyVal}% KAPAZITÄT
              </text>
            </g>
          </g>
        </svg>
      </GlassPanel>
    </div>
  );
}
