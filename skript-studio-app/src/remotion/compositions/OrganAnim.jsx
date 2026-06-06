import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { HeartSVG } from "../assets/medizin/HeartSVG";
import { LungSVG } from "../assets/medizin/LungSVG";
import { MuscleSVG } from "../assets/medizin/MuscleSVG";
import { GlassPanel, COLORS, PANEL_DIMS } from "../utils/layout";

const C = COLORS;
const MONO = "'Space Mono','Courier New',monospace";
const ANTON = "'Anton',Impact,sans-serif";

const ASSET_MAP = {
  heart: { component: HeartSVG, viewBox: "0 0 300 310", label: "HERZ" },
  lung: { component: LungSVG, viewBox: "0 0 300 340", label: "LUNGE" },
  muscle: { component: MuscleSVG, viewBox: "0 0 400 280", label: "MUSKELFASER" },
};

// Scan-Linie die über das Organ fährt
function ScanLine({ frame, height }) {
  const scanY = interpolate(frame, [10, 55], [0, height], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const opacity = frame < 10 ? 0 : frame > 60 ? 0 : 0.9;
  return (
    <g opacity={opacity}>
      <line x1="0" y1={scanY} x2="900" y2={scanY} stroke={C.volt} strokeWidth="1.5" />
      <rect x="0" y={Math.max(0, scanY - 25)} width="900" height="25" fill={`${C.volt}08`} />
    </g>
  );
}

// Daten-Overlay oben
function DataBar({ frame, fps, organ }) {
  const prog = spring({ frame: frame - 5, fps, config: { damping: 22, stiffness: 80 } });
  const dataLines = {
    heart: ["SYSTOLE · DIASTOLE", "EJEKTIONSFRAKTION  55–70%"],
    lung: ["VITALKAPAZITÄT  3.5–6.0 L", "DIFFUSIONSKAPAZITÄT ↑ MIT TRAINING"],
    muscle: ["SARKOMERLÄNGE  2.0–2.4 μm", "MYOSIN-KÖPFE AKTIV  ↑"],
  };
  const lines = dataLines[organ] || [];
  return (
    <g opacity={prog} transform="translate(60, 60)">
      <rect x="0" y="0" width="960" height="52" rx="12" fill={`${C.panel}cc`} stroke={C.border} />
      {lines.map((l, i) => (
        <text key={i} x="20" y={18 + i * 20} fontFamily={MONO} fontSize="14" fill={i === 0 ? C.volt : C.muted} letterSpacing="2">{l}</text>
      ))}
      <text x="920" y="18" textAnchor="end" fontFamily={MONO} fontSize="12" fill={`${C.volt}66`}>
        {`REC ● ${String(Math.floor(frame / 30)).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`}
      </text>
    </g>
  );
}

export function OrganAnim({
  organ = "heart",
  label = "",
  highlightSequence = [],
  kicker = "ANATOMIE",
  format = "9:16",
  position = "bottom",
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const asset = ASSET_MAP[organ] || ASSET_MAP.heart;
  const AssetComponent = asset.component;

  const activePart = highlightSequence.find((h) => frame >= h.startFrame && frame < h.endFrame);
  const highlightPart = activePart?.part || null;
  const caption = activePart?.caption || "";
  const appear = spring({ frame, fps, config: { damping: 18, stiffness: 80 } });

  const breathProgress = organ === "lung" ? Math.abs(Math.sin(frame * 0.04)) : 0;
  const contractionProgress = organ === "muscle" ? Math.abs(Math.sin(frame * 0.06)) : 0;
  const hlGlow = highlightPart ? 0.5 + 0.5 * Math.sin(frame * 0.2) : 0;

  const dims = PANEL_DIMS[format]?.[position] || PANEL_DIMS["9:16"].bottom;
  const panelW = dims.w;
  const panelH = dims.h;

  // SVG-Illustration links (~40% Breite), Text rechts
  const illW = panelH * 0.95;  // Quadrat
  const illH = panelH;
  const dataX = illW + 20;
  const dataW = panelW - illW - 44;

  // Skalierung der Asset-SVG in den verfügbaren Bereich
  const ASSET_VIEWBOXES = {
    heart:  { w: 300, h: 310 },
    lung:   { w: 300, h: 340 },
    muscle: { w: 400, h: 280 },
  };
  const vb = ASSET_VIEWBOXES[organ] || ASSET_VIEWBOXES.heart;
  const scaleX = illW / vb.w * 0.88;
  const scaleY = illH / vb.h * 0.88;
  const assetScale = Math.min(scaleX, scaleY);

  const scanY = interpolate(frame, [10, 55], [0, illH], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const scanOp = frame < 10 ? 0 : frame > 60 ? 0 : 0.85;

  const dataLines = {
    heart:  ["EJEKTIONSFRAKTION  55–70%", "CARDIAC OUTPUT  ~5 L/min"],
    lung:   ["VITALKAPAZITÄT  3.5–6.0 L", "DIFFUSION  ↑ MIT TRAINING"],
    muscle: ["SARKOMERLÄNGE  2.0–2.4 μm", "KONTRAKTIONSKRAFT  ↑"],
  };

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent", position: "relative" }}>
      <GlassPanel format={format} position={position} accentColor={C.volt} tint="rgba(0,0,0,0)">
        <svg width={panelW - 20} height={panelH} viewBox={`0 0 ${panelW - 20} ${panelH}`} style={{ display: "block" }}>

          {/* SVG-Illustration links */}
          <g opacity={appear}>
            {/* Illustration-Hintergrund */}
            <rect x="4" y="4" width={illW - 8} height={illH - 8} rx="16"
              fill="rgba(0,0,0,0.3)" stroke={`${C.volt}22`} strokeWidth="1" />

            {/* SVG-Asset */}
            <g transform={`translate(${illW / 2 - vb.w * assetScale / 2}, ${illH / 2 - vb.h * assetScale / 2}) scale(${assetScale})`}>
              <AssetComponent
                highlightPart={highlightPart}
                strokeColor={C.volt}
                breathProgress={breathProgress}
                contractionProgress={contractionProgress}
                showLabels={false}
              />
            </g>

            {/* Scan-Linie */}
            <g opacity={scanOp}>
              <line x1="4" y1={scanY} x2={illW - 4} y2={scanY} stroke={C.volt} strokeWidth="1.5" />
              <rect x="4" y={Math.max(4, scanY - 18)} width={illW - 8} height="18" fill={`${C.volt}08`} />
            </g>

            {/* Corner Marker */}
            <g stroke={`${C.volt}55`} strokeWidth="2" fill="none">
              <path d={`M 4,20 L 4,4 L 20,4`} />
              <path d={`M ${illW - 20},4 L ${illW - 4},4 L ${illW - 4},20`} />
              <path d={`M 4,${illH - 20} L 4,${illH - 4} L 20,${illH - 4}`} />
              <path d={`M ${illW - 20},${illH - 4} L ${illW - 4},${illH - 4} L ${illW - 4},${illH - 20}`} />
            </g>

            {/* Highlight-Label */}
            {caption && (
              <g transform={`translate(4, ${illH - 36})`}
                opacity={spring({ frame: frame - (activePart?.startFrame || 0), fps, config: { damping: 22, stiffness: 100 } })}>
                <rect x="0" y="0" width={illW - 8} height="30" rx="6" fill={`${C.volt}22`} stroke={C.volt} strokeWidth="1" />
                <text x="8" y="20" fontFamily={MONO} fontSize="16" fill={C.volt} fontWeight="700">▶ {caption}</text>
              </g>
            )}
          </g>

          {/* Daten rechts */}
          <g transform={`translate(${dataX}, 12)`} opacity={appear}>
            {/* Kicker */}
            <text y="36" fontFamily={MONO} fontSize="34" fontWeight="700"
              fill={C.volt} letterSpacing="0.1em">◆ {kicker}</text>

            {/* Organ-Name */}
            <text y={panelH * 0.42} fontFamily={ANTON} fontSize={Math.min(72, dataW * 0.5)} fontWeight="900"
              fill={C.ink} letterSpacing="2">
              {label || asset.label}
            </text>

            {/* Art */}
            <text y={panelH * 0.42 + 36} fontFamily={MONO} fontSize="28" fontWeight="600"
              fill={C.muted} letterSpacing="0.08em">
              {organ === "heart" && "QUERSCHNITT · FRONTAL"}
              {organ === "lung"  && "BRONCHIALBAUM · FRONTAL"}
              {organ === "muscle" && "LÄNGSSCHNITT · SARKOMER"}
            </text>

            {/* Daten-Zeilen */}
            {(dataLines[organ] || []).map((line, i) => (
              <g key={i} transform={`translate(0, ${panelH * 0.6 + i * 44})`}>
                <text fontFamily={MONO} fontSize="30" fontWeight="600" fill={C.muted}>{line}</text>
              </g>
            ))}
          </g>
        </svg>
      </GlassPanel>
    </div>
  );
}
