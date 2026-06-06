// Herzquerschnitt (anatomisch, frontal)
// ViewBox 0 0 300 310 — Apex unten, Basis oben
// Gruppen: outer, lv, rv, la, ra, septum, aorta, pulmonary, svc, valves

const C = {
  bone: "#d4c5a9",
  wallDark: "#1a1d23",
  wallMid: "#23272f",
  wallLight: "#2e3440",
  myocardium: "#3d2830",
  endocardium: "#2a1e22",
  bloodDark: "#5c1a1a",
  bloodOxy: "#8b1a1a",
  vessel: "#2a1520",
  volt: "#ccff00",
  blue: "#3a6ea8",   // deoxygenated blood (blue)
  red: "#8b2020",    // oxygenated blood (red)
};

export function HeartSVG({ highlightPart = null, strokeColor = "#ccff00", showLabels = false }) {
  const hl = (part) => highlightPart === part;
  const partColor = (part, base, highlight) => hl(part) ? highlight : base;

  return (
    <g>
      {/* === ÄUSSERE HERZSILHOUETTE === */}
      {/* Perikard (Herzbeutel) — äußerster Ring */}
      <path
        d="M 150,298 C 28,232 4,160 4,96 C 4,30 52,0 102,6 C 122,9 140,22 150,40 C 160,22 178,9 198,6 C 248,0 296,30 296,96 C 296,160 272,232 150,298 Z"
        fill="none" stroke={partColor("outer", "#262a32", strokeColor)} strokeWidth="3" opacity="0.6"
      />

      {/* Epikard / Myokard-Außenwand */}
      <path
        d="M 150,290 C 35,226 10,158 10,96 C 10,36 56,6 104,12 C 123,15 140,27 150,44 C 160,27 177,15 196,12 C 244,6 290,36 290,96 C 290,158 265,226 150,290 Z"
        fill={C.myocardium} stroke={partColor("outer", "#3d2830", strokeColor)} strokeWidth={hl("outer") ? 3 : 1.5}
      />

      {/* === RECHTER VORHOF (RA) — links oben === */}
      <path
        d="M 62,108 C 45,92 28,78 18,60 C 12,45 18,22 38,14 C 52,8 72,12 88,22 C 100,30 108,44 108,60 C 108,80 90,100 62,108 Z"
        fill={partColor("ra", C.bloodDark, "#4a2020")}
        stroke={partColor("ra", "#3d2020", strokeColor)} strokeWidth={hl("ra") ? 3 : 1}
      />

      {/* === LINKER VORHOF (LA) — rechts oben === */}
      <path
        d="M 238,108 C 255,92 272,78 282,60 C 288,45 282,22 262,14 C 248,8 228,12 212,22 C 200,30 192,44 192,60 C 192,80 210,100 238,108 Z"
        fill={partColor("la", "#4a1818", "#6b2020")}
        stroke={partColor("la", "#3d2020", strokeColor)} strokeWidth={hl("la") ? 3 : 1}
      />

      {/* === RECHTER VENTRIKEL (RV) — links, dünne Wand === */}
      <path
        d="M 62,108 C 40,120 22,145 18,175 C 14,205 22,235 46,258 C 60,268 80,275 98,270 C 115,265 130,252 140,238 L 140,80 C 120,70 90,82 62,108 Z"
        fill={partColor("rv", C.bloodDark, "#4a2020")}
        stroke={partColor("rv", "#3d2020", strokeColor)} strokeWidth={hl("rv") ? 2.5 : 1}
      />
      {/* RV Myokard (dünne Wand) */}
      <path
        d="M 58,112 C 36,126 18,152 14,182 C 10,212 20,244 46,264"
        fill="none" stroke={partColor("rv", "#2e3440", strokeColor)} strokeWidth={hl("rv") ? 3 : 2}
        strokeLinecap="round"
      />

      {/* === LINKER VENTRIKEL (LV) — rechts, dicke Muskelwand === */}
      <path
        d="M 238,108 C 260,120 278,145 282,175 C 286,205 278,235 254,258 C 240,268 220,275 202,270 C 185,265 170,252 160,238 L 160,80 C 180,70 210,82 238,108 Z"
        fill={partColor("lv", "#5c1a1a", "#7a2020")}
        stroke={partColor("lv", "#6b2020", strokeColor)} strokeWidth={hl("lv") ? 2.5 : 1}
      />
      {/* LV Myokard (dicke Wand — charakteristisch) */}
      <path
        d="M 244,112 C 266,128 284,155 288,186 C 292,216 280,248 252,266"
        fill="none" stroke={partColor("lv", "#3d2830", strokeColor)} strokeWidth={hl("lv") ? 6 : 5}
        strokeLinecap="round"
      />
      <path
        d="M 238,114 C 258,130 274,157 278,188 C 282,216 270,246 246,262"
        fill="none" stroke={partColor("lv", "#4d3040", strokeColor)} strokeWidth="3"
        strokeLinecap="round"
      />

      {/* === INTERVENTRIKULÄRES SEPTUM === */}
      <path
        d="M 150,44 C 148,100 146,180 144,270"
        fill="none" stroke={partColor("septum", "#5d3040", strokeColor)} strokeWidth={hl("septum") ? 4 : 3}
        strokeLinecap="round"
      />
      {/* Septum-Füllung */}
      <path
        d="M 140,238 C 142,190 143,130 143,80 L 157,80 C 157,130 158,190 160,238 C 154,248 146,248 140,238 Z"
        fill={partColor("septum", "#3d2830", "#5d3040")}
        stroke="none"
      />

      {/* === AORTA (aufsteigend aus LV) === */}
      <path
        d="M 200,22 C 218,8 244,6 258,20 C 272,34 272,58 260,72 C 250,84 234,88 220,84 L 210,70 C 220,74 232,72 240,62 C 248,52 248,36 238,26 C 228,18 212,18 202,28 Z"
        fill={partColor("aorta", "#3a2535", "#5a3555")}
        stroke={partColor("aorta", "#5a3555", strokeColor)} strokeWidth={hl("aorta") ? 3 : 1.5}
      />
      {/* Aorta Lumen */}
      <path
        d="M 205,25 C 218,14 236,12 246,24 C 256,36 254,54 244,65"
        fill="none" stroke={partColor("aorta", "#8b2020", "#cc4444")} strokeWidth="4" strokeLinecap="round"
      />

      {/* === TRUNCUS PULMONALIS (aus RV) === */}
      <path
        d="M 100,22 C 82,8 56,6 42,20 C 28,34 28,58 40,72 C 50,84 66,88 80,84 L 90,70 C 80,74 68,72 60,62 C 52,52 52,36 62,26 C 72,18 88,18 98,28 Z"
        fill={partColor("pulmonary", "#1e3050", "#2a4570")}
        stroke={partColor("pulmonary", "#2a4570", strokeColor)} strokeWidth={hl("pulmonary") ? 3 : 1.5}
      />
      {/* Pulmonary Lumen (deoxygeniert = blau) */}
      <path
        d="M 95,25 C 82,14 64,12 54,24 C 44,36 46,54 56,65"
        fill="none" stroke={partColor("pulmonary", "#3a6ea8", "#5588cc")} strokeWidth="4" strokeLinecap="round"
      />

      {/* === VENA CAVA SUPERIOR === */}
      <rect x="264" y="6" width="22" height="50" rx="11"
        fill={partColor("svc", "#1e3050", "#2a4570")}
        stroke={partColor("svc", "#2a4570", strokeColor)} strokeWidth={hl("svc") ? 2 : 1}
      />

      {/* === HERZKLAPPEN (vereinfacht) === */}
      {/* Mitralklappe (LV/LA) */}
      <g opacity={hl("valves") ? 1 : 0.7}>
        <path d="M 192,62 C 185,58 175,58 168,62" fill="none"
          stroke={partColor("valves", "#ccff0088", strokeColor)} strokeWidth="3" strokeLinecap="round" />
        {/* Segelklappen */}
        <path d="M 192,62 C 190,72 185,78 180,80" fill="none" stroke={partColor("valves", "#ccff0066", strokeColor)} strokeWidth="1.5" />
        <path d="M 168,62 C 170,72 175,78 180,80" fill="none" stroke={partColor("valves", "#ccff0066", strokeColor)} strokeWidth="1.5" />
      </g>
      {/* Trikuspidalklappe (RV/RA) */}
      <g opacity={hl("valves") ? 1 : 0.7}>
        <path d="M 108,62 C 115,58 125,58 132,62" fill="none"
          stroke={partColor("valves", "#ccff0088", strokeColor)} strokeWidth="3" strokeLinecap="round" />
        <path d="M 108,62 C 112,72 118,78 120,80" fill="none" stroke={partColor("valves", "#ccff0066", strokeColor)} strokeWidth="1.5" />
        <path d="M 132,62 C 128,72 122,78 120,80" fill="none" stroke={partColor("valves", "#ccff0066", strokeColor)} strokeWidth="1.5" />
      </g>

      {/* === BLUTFLUSS-PFEILE (optional via showLabels) === */}
      {showLabels && (
        <g fontFamily="'Space Mono',monospace" fontSize="11" fill={strokeColor}>
          <text x="30" y="165" textAnchor="middle">RV</text>
          <text x="270" y="165" textAnchor="middle">LV</text>
          <text x="45" y="65" textAnchor="middle" fontSize="9">RA</text>
          <text x="252" y="65" textAnchor="middle" fontSize="9">LA</text>
        </g>
      )}
    </g>
  );
}
