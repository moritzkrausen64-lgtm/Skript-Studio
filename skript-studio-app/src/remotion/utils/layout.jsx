// ============================================================
//  Layout-System für Skript-Studio Animationen
//
//  Grundsätze:
//  - Animationen NIEMALS Vollbild — immer im Panel
//  - Safe Zone: 80px rundum, niemals an Bildschirmränder
//  - Person/Gesicht mittig → Panel oben oder unten
//  - Glassmorphismus NUR auf Panel-Hintergrund, Inhalt crisp
//  - Mindest-Schriftgröße: 40px (≈ 14px auf 375px Mobilscreen)
// ============================================================

// Ausgabeformate
export const FORMATS = {
  "9:16": { w: 1080, h: 1920, name: "TikTok / Reels" },
  "16:9": { w: 1920, h: 1080, name: "YouTube / Horizontal" },
};

// Safe-Zone: Abstand zum Bildrand
const SAFE = 80;

// Panel-Dimensionen pro Format und Position
export const PANEL_DIMS = {
  "9:16": {
    bottom: { x: SAFE, y: 1490, w: 1080 - SAFE * 2, h: 350 },
    top:    { x: SAFE, y: SAFE, w: 1080 - SAFE * 2, h: 350 },
  },
  "16:9": {
    bottom: { x: SAFE, y: 720,  w: 1920 - SAFE * 2, h: 300 },
    top:    { x: SAFE, y: SAFE, w: 1920 - SAFE * 2, h: 300 },
  },
};

// Typografie-Skala (Pixel im Kompositions-Koordinatensystem)
// Skalierung auf Mobilscreen (375px breit, 9:16):
// 1080px → 375px = Faktor 0.347
// 40px * 0.347 = 13.9px ✓ (lesbar)
// 60px * 0.347 = 20.8px ✓ (gut)
// 120px * 0.347 = 41.6px ✓ (sehr gut für Zahlen)
export const TYPE = {
  kicker:   { size: 40,  weight: 700, letterSpacing: "0.14em", font: "mono" },
  label:    { size: 52,  weight: 700, letterSpacing: "0.06em", font: "grotesk" },
  headline: { size: 68,  weight: 800, font: "anton" },
  value:    { size: 130, weight: 900, font: "anton" },   // große Zahlen
  unit:     { size: 58,  weight: 700, font: "mono" },
  sub:      { size: 38,  weight: 400, font: "grotesk" },
  tiny:     { size: 34,  weight: 600, letterSpacing: "0.1em", font: "mono" },
};

const FONTS = {
  mono:    "'Space Mono','Courier New',monospace",
  grotesk: "'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif",
  anton:   "'Anton',Impact,sans-serif",
};

// CSS-Farben
export const COLORS = {
  volt:    "#ccff00",
  bg:      "#0a0b0d",
  panel:   "#131519",
  panel2:  "#1a1d23",
  border:  "#262a32",
  muted:   "#8a9099",
  ink:     "#f2f4f3",
  signal:  "#ff5a3c",
};

// ─────────────────────────────────────────────────────────────
//  GlassPanel — das Kern-Layoutelement
//  Glasmorphismus NUR im Hintergrund, Kinder sind voll opak
// ─────────────────────────────────────────────────────────────
export function GlassPanel({
  format = "9:16",
  position = "bottom",
  tint = "rgba(0,0,0,0)",         // optionaler Farbtönung-Overlay
  accentColor = COLORS.volt,       // Farbe für Rand/Akzente
  children,
  style = {},
}) {
  const dims = PANEL_DIMS[format]?.[position] || PANEL_DIMS["9:16"].bottom;

  return (
    <div style={{
      position: "absolute",
      left: dims.x,
      top: dims.y,
      width: dims.w,
      height: dims.h,
      // Glasmorphismus
      background: "rgba(8, 9, 11, 0.82)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      // Rahmen & Tiefe
      borderRadius: 24,
      border: `1px solid rgba(255,255,255,0.07)`,
      boxShadow: `0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${accentColor}18`,
      overflow: "hidden",
      ...style,
    }}>
      {/* Farbiger Tint-Overlay (optional, sehr dezent) */}
      {tint && tint !== "rgba(0,0,0,0)" && (
        <div style={{ position: "absolute", inset: 0, background: tint, pointerEvents: "none", zIndex: 0 }} />
      )}
      {/* Linker Akzent-Streifen */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 5,
        background: accentColor, zIndex: 1,
        boxShadow: `0 0 16px ${accentColor}88`,
      }} />
      {/* Inhalt */}
      <div style={{ position: "relative", zIndex: 2, height: "100%", paddingLeft: 20 }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Text-Helfer: vordefinierte Stile
// ─────────────────────────────────────────────────────────────
export function T({ variant = "sub", color, style = {}, children, ...rest }) {
  const t = TYPE[variant] || TYPE.sub;
  return (
    <span style={{
      fontFamily: FONTS[t.font] || FONTS.grotesk,
      fontSize: t.size,
      fontWeight: t.weight,
      letterSpacing: t.letterSpacing || "normal",
      color: color || COLORS.ink,
      display: "block",
      lineHeight: 1.1,
      ...style,
    }} {...rest}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  Hilfsfunktion: Composition-Dimensionen
// ─────────────────────────────────────────────────────────────
export function getFormatDims(format = "9:16") {
  return FORMATS[format] || FORMATS["9:16"];
}
