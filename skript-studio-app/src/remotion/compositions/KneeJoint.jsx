import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { GlassPanel, COLORS, PANEL_DIMS } from "../utils/layout";

function Femur({ h }) {
  return (
    <g>
      <rect x="-28" y={-h} width="56" height={h * 0.75} rx="26" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <ellipse cx="-32" cy="-28" rx="36" ry="30" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <ellipse cx="32" cy="-28" rx="36" ry="30" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <rect x="-16" y={-h + 2} width="32" height={h * 0.65} rx="14" fill="#c4b599" opacity="0.5" />
    </g>
  );
}

function Tibia({ h }) {
  return (
    <g>
      <ellipse cx="-26" cy="0" rx="32" ry="20" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <ellipse cx="26" cy="0" rx="32" ry="20" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <rect x="-24" y="14" width="48" height={h * 0.7} rx="22" fill="#d4c5a9" stroke="#b8a890" strokeWidth="2.5" />
      <rect x="-12" y="18" width="24" height={h * 0.6} rx="10" fill="#c4b599" opacity="0.5" />
    </g>
  );
}

export function KneeJoint({
  label = "KNIEGELENK",
  speed = 1,
  format = "9:16",
  position = "bottom",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  const period = Math.round(90 / speed);
  const cycleProgress = (frame % period) / period;
  const bendAngle = interpolate(
    cycleProgress,
    [0, 0.4, 0.55, 0.9, 1],
    [0, 90, 90, 0, 0],
    { easing: Easing.inOut(Easing.quad) }
  );

  const cartilageGap = interpolate(bendAngle, [0, 90], [12, 7]);
  const stressOp = interpolate(bendAngle, [0, 45, 90], [0, 0.4, 0.9]);
  const displayAngle = Math.round(bendAngle);

  const dims = PANEL_DIMS[format]?.[position] || PANEL_DIMS["9:16"].bottom;
  const panelW = dims.w;
  const panelH = dims.h;

  // Knie-Illustration links, Daten rechts
  const kneeAreaW = panelH * 0.95;
  const dataX = kneeAreaW + 24;
  const boneH = panelH * 0.32;
  const jointCy = panelH * 0.5;

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent", position: "relative" }}>
      <GlassPanel format={format} position={position} accentColor={COLORS.volt} tint="rgba(0,30,60,0.04)">
        <svg width={panelW - 20} height={panelH} viewBox={`0 0 ${panelW - 20} ${panelH}`} style={{ display: "block" }}>

          {/* Knie-Illustration */}
          <g transform={`translate(${kneeAreaW / 2}, ${jointCy}) scale(${appear})`}>
            {/* Femur (oben, statisch) */}
            <g transform={`translate(0, ${-cartilageGap - boneH * 0.5})`}>
              <Femur h={boneH} />
            </g>

            {/* Knorpel oben */}
            <ellipse cx="0" cy={-cartilageGap / 2 - 2} rx={60} ry={cartilageGap}
              fill="#7ab8c8" opacity="0.75" />

            {/* Stress bei Belastung */}
            {stressOp > 0.1 && (
              <ellipse cx="0" cy="0" rx="65" ry="16" fill={COLORS.signal} opacity={stressOp * 0.25}
                style={{ filter: "blur(6px)" }} />
            )}

            {/* Knorpel unten */}
            <ellipse cx="0" cy={cartilageGap / 2 + 2} rx={55} ry={cartilageGap - 2}
              fill="#7ab8c8" opacity="0.75" />

            {/* Tibia (unten, rotiert) */}
            <g transform={`rotate(${bendAngle}, 0, 0)`}>
              <g transform={`translate(0, ${cartilageGap + 14})`}>
                <Tibia h={boneH} />
              </g>
              {/* Fibula */}
              <g transform={`translate(52, ${cartilageGap + 24})`}>
                <rect x="-9" y="0" width="18" height={boneH * 0.65} rx="9" fill="#d4c5a9" stroke="#b8a890" strokeWidth="1.5" opacity="0.7" />
              </g>
            </g>

            {/* Patella */}
            <g transform={`translate(${interpolate(bendAngle, [0, 90], [0, 10])}, ${interpolate(bendAngle, [0, 90], [-55, -40])})`}>
              <ellipse rx="22" ry="18" fill="#d4c5a9" stroke={COLORS.volt} strokeWidth="2.5" />
            </g>

            {/* Gelenk-Punkt */}
            <circle r="10" fill={COLORS.volt} />
            <circle r="5" fill={COLORS.bg} />

            {/* Winkel-Bogen */}
            {bendAngle > 5 && (
              <path
                d={`M 0,-44 A 44,44 0 0,1 ${Math.sin(bendAngle * Math.PI / 180) * 44},${-Math.cos(bendAngle * Math.PI / 180) * 44}`}
                fill="none" stroke={COLORS.volt} strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
              />
            )}
          </g>

          {/* Daten rechts */}
          <g transform={`translate(${dataX}, 14)`} opacity={appear}>
            {/* Kicker */}
            <text y="38" fontFamily="'Space Mono','Courier New',monospace" fontSize="36" fontWeight="700"
              fill={COLORS.volt} letterSpacing="0.1em">◆ {label}</text>

            {/* Winkel groß */}
            <text y={panelH * 0.55} fontFamily="'Anton',Impact,sans-serif" fontSize="120" fontWeight="900"
              fill={COLORS.volt}>
              {displayAngle}°
            </text>

            {/* Label */}
            <text y={panelH * 0.55 + 44} fontFamily="'Space Mono','Courier New',monospace" fontSize="38" fontWeight="600"
              fill={COLORS.muted} letterSpacing="0.08em">FLEXION</text>

            {/* Status */}
            <g transform={`translate(0, ${panelH - 44})`}>
              <rect x="0" y="0" width={panelW - dataX - 24} height="36" rx="8"
                fill={stressOp > 0.5 ? "rgba(255,90,60,0.15)" : "rgba(204,255,0,0.08)"}
                stroke={stressOp > 0.5 ? COLORS.signal : COLORS.volt} strokeWidth="1" />
              <text x="12" y="24" fontFamily="'Space Mono','Courier New',monospace" fontSize="22" fontWeight="600"
                fill={stressOp > 0.5 ? COLORS.signal : COLORS.volt}>
                {stressOp > 0.5 ? "▲ BELASTUNG HOCH" : "● ENTLASTET"}
              </text>
            </g>
          </g>
        </svg>
      </GlassPanel>
    </div>
  );
}
