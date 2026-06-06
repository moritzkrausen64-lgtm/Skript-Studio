// Lungen — frontale Ansicht, beide Lungen mit Bronchialbaum
// ViewBox 0 0 300 340

export function LungSVG({ highlightPart = null, strokeColor = "#ccff00", breathProgress = 0 }) {
  const hl = (p) => highlightPart === p;
  const pc = (p, base, hi) => hl(p) ? hi : base;

  // Atemskalierung (0=ausgeatemmt, 1=eingeatmet)
  const scaleY = 1 + breathProgress * 0.06;
  const scaleX = 1 + breathProgress * 0.04;

  return (
    <g>
      {/* === TRACHEA === */}
      <rect x="136" y="2" width="28" height="60" rx="14"
        fill={pc("trachea", "#1a1d23", "#2a2d33")}
        stroke={pc("trachea", "#3a4050", strokeColor)} strokeWidth={hl("trachea") ? 3 : 1.5}
      />
      {/* Trachealringe */}
      {[12, 20, 28, 36, 44, 52].map((y) => (
        <path key={y} d={`M 136,${y} Q 150,${y+3} 164,${y}`} fill="none"
          stroke={pc("trachea", "#3a4050", strokeColor)} strokeWidth="1" opacity="0.6" />
      ))}
      {/* Trachea-Lumen */}
      <rect x="141" y="4" width="18" height="58" rx="9" fill={pc("trachea", "#0a3a5a", "#1a5a8a")} />

      {/* === HAUPTBRONCHIEN (Bifurkation) === */}
      {/* Rechter Hauptbronchus (Bild links) */}
      <path d="M 148,62 C 140,68 118,72 95,80" fill="none"
        stroke={pc("bronchi", "#3a4050", strokeColor)} strokeWidth="8" strokeLinecap="round" />
      <path d="M 148,62 C 140,68 118,72 95,80" fill="none"
        stroke={pc("bronchi", "#0a3a5a", "#1a5a8a")} strokeWidth="4" strokeLinecap="round" />
      {/* Linker Hauptbronchus (Bild rechts) */}
      <path d="M 152,62 C 160,68 182,72 205,80" fill="none"
        stroke={pc("bronchi", "#3a4050", strokeColor)} strokeWidth="8" strokeLinecap="round" />
      <path d="M 152,62 C 160,68 182,72 205,80" fill="none"
        stroke={pc("bronchi", "#0a3a5a", "#1a5a8a")} strokeWidth="4" strokeLinecap="round" />

      {/* === RECHTE LUNGE (Bild links, 3 Lappen) === */}
      <g transform={`scale(${scaleX},${scaleY}) translate(${150*(1-scaleX)}, ${170*(1-scaleY)})`}>
        <path
          d="M 95,78 C 58,84 28,100 14,130 C 4,152 6,180 14,208 C 24,240 48,268 72,284 C 92,298 115,304 130,298 C 145,292 152,278 152,262 L 152,120 C 135,88 112,76 95,78 Z"
          fill={pc("right-lung", "#2a1520", "#3a2030")}
          stroke={pc("right-lung", "#4a3040", strokeColor)} strokeWidth={hl("right-lung") ? 3 : 1.5}
        />
        {/* Fissura horizontalis */}
        <path d="M 95,160 C 110,155 135,153 152,152" fill="none"
          stroke={pc("right-lung", "#6a4555", strokeColor)} strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Fissura obliqua rechts */}
        <path d="M 22,200 C 50,175 90,165 152,162" fill="none"
          stroke={pc("right-lung", "#6a4555", strokeColor)} strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Sekundäre Bronchien rechts */}
        <path d="M 95,80 C 82,95 70,115 62,140" fill="none" stroke={pc("bronchi", "#2a4060", "#3a5a80")} strokeWidth="4" strokeLinecap="round" />
        <path d="M 95,80 C 98,100 100,125 98,155" fill="none" stroke={pc("bronchi", "#2a4060", "#3a5a80")} strokeWidth="3" strokeLinecap="round" />
        <path d="M 95,80 C 110,95 125,112 135,140" fill="none" stroke={pc("bronchi", "#2a4060", "#3a5a80")} strokeWidth="3" strokeLinecap="round" />
        {/* Tertiäre Bronchien */}
        <path d="M 62,140 C 48,155 38,175 30,200" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        <path d="M 62,140 C 52,165 50,190 54,215" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        <path d="M 98,155 C 88,175 82,200 80,225" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        <path d="M 135,140 C 138,165 138,188 132,212" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        {/* Alveolen (Cluster) */}
        {[
          [28,208],[48,228],[55,248],[78,262],[100,268],[120,260],[135,240],
          [30,185],[55,215],[85,235],[72,278],[105,278],[128,268],
        ].map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="7" fill={pc("alveoli", "#1a3545", "#2a4f60")} stroke={pc("alveoli", "#2a5060", strokeColor)} strokeWidth="0.8" />
            <circle cx={x-2} cy={y-2} r="2.5" fill="none" stroke={pc("alveoli", "#3a7090", strokeColor)} strokeWidth="0.5" />
            <circle cx={x+2} cy={y+1} r="2" fill="none" stroke={pc("alveoli", "#3a7090", strokeColor)} strokeWidth="0.5" />
          </g>
        ))}
      </g>

      {/* === LINKE LUNGE (Bild rechts, 2 Lappen, etwas kleiner wegen Herz) === */}
      <g transform={`scale(${scaleX},${scaleY}) translate(${150*(1-scaleX)}, ${170*(1-scaleY)})`}>
        <path
          d="M 205,78 C 242,84 268,105 280,135 C 290,160 288,192 278,220 C 266,252 242,278 218,292 C 200,302 180,306 168,298 C 155,290 152,276 152,260 L 152,120 C 168,88 188,76 205,78 Z"
          fill={pc("left-lung", "#2a1520", "#3a2030")}
          stroke={pc("left-lung", "#4a3040", strokeColor)} strokeWidth={hl("left-lung") ? 3 : 1.5}
        />
        {/* Herzeinbuchtung (cardiac notch) */}
        <path d="M 152,195 C 158,188 168,185 178,186" fill="none"
          stroke="#1a1d23" strokeWidth="3" strokeLinecap="round" />
        {/* Fissura obliqua links */}
        <path d="M 278,204 C 248,185 210,172 152,170" fill="none"
          stroke={pc("left-lung", "#6a4555", strokeColor)} strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Sekundäre Bronchien links */}
        <path d="M 205,80 C 220,96 232,118 238,145" fill="none" stroke={pc("bronchi", "#2a4060", "#3a5a80")} strokeWidth="4" strokeLinecap="round" />
        <path d="M 205,80 C 200,105 198,130 200,160" fill="none" stroke={pc("bronchi", "#2a4060", "#3a5a80")} strokeWidth="3" strokeLinecap="round" />
        {/* Tertiäre Bronchien */}
        <path d="M 238,145 C 252,162 262,185 268,210" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        <path d="M 238,145 C 245,168 248,192 244,218" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        <path d="M 200,160 C 192,182 188,206 190,230" fill="none" stroke="#1a3050" strokeWidth="2" strokeLinecap="round" />
        {/* Alveolen */}
        {[
          [270,218],[255,240],[240,258],[218,272],[195,278],[172,270],
          [268,190],[252,212],[230,228],[205,242],[180,248],[165,258],
        ].map(([x,y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="7" fill={pc("alveoli", "#1a3545", "#2a4f60")} stroke={pc("alveoli", "#2a5060", strokeColor)} strokeWidth="0.8" />
            <circle cx={x-2} cy={y-2} r="2.5" fill="none" stroke={pc("alveoli", "#3a7090", strokeColor)} strokeWidth="0.5" />
            <circle cx={x+2} cy={y+1} r="2" fill="none" stroke={pc("alveoli", "#3a7090", strokeColor)} strokeWidth="0.5" />
          </g>
        ))}
      </g>
    </g>
  );
}
