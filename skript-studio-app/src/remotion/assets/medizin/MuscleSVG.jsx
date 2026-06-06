// Muskelfaser — Längsschnitt mit Sarkomer-Detail
// ViewBox 0 0 400 280

export function MuscleSVG({ highlightPart = null, strokeColor = "#ccff00", contractionProgress = 0 }) {
  const hl = (p) => highlightPart === p;
  const pc = (p, base, hi) => hl(p) ? hi : base;

  // Kontraktion: I-Band wird schmaler, H-Zone verschwindet
  const iBandW = 55 - contractionProgress * 30; // 55 → 25
  const hZoneW = 40 - contractionProgress * 38;  // 40 → 2
  const sarcW = 200 + iBandW * 2;               // Gesamtbreite des Sarkomers

  // 2 vollständige Sarkomer-Einheiten
  const sarcomereOffset = (400 - sarcW * 2) / 2;

  return (
    <g>
      {/* === SARKOLEMMA (äußere Zellmembran) === */}
      <rect x="2" y="30" width="396" height="220" rx="24"
        fill={pc("sarkolemma", "#1a1d23", "#22262e")}
        stroke={pc("sarkolemma", "#2e3440", strokeColor)} strokeWidth={hl("sarkolemma") ? 3 : 2}
      />
      {/* Membran-Doppelschicht */}
      <rect x="6" y="34" width="388" height="212" rx="21"
        fill="none" stroke={pc("sarkolemma", "#3a4050", strokeColor)} strokeWidth="1" strokeDasharray="6 4" opacity="0.5"
      />

      {/* === TRANSVERSE TUBULI (T-Tubuli) === */}
      {[80, 180, 280, 380].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="250"
          stroke={pc("ttubuli", "#2a3a50", strokeColor)} strokeWidth={hl("ttubuli") ? 2 : 1}
          strokeDasharray="3 3" opacity="0.6"
        />
      ))}

      {/* === MYOFIBRILLEN (mehrere Reihen) === */}
      {[70, 100, 130, 160, 190].map((y, rowIdx) => {
        const sarco1Start = sarcomereOffset;
        const sarco2Start = sarcomereOffset + sarcW;

        return (
          <g key={rowIdx}>
            {/* Myofibrille Hintergrund */}
            <rect x="10" y={y} width="380" height="18" rx="4" fill="#1e2228" />

            {/* 2 Sarkomer-Einheiten */}
            {[sarco1Start, sarco2Start].map((startX, sIdx) => (
              <g key={sIdx}>
                {/* I-Band links (nur Aktin, hell) */}
                <rect x={startX} y={y+1} width={iBandW} height="16" rx="3"
                  fill={pc("iband", "#2a3540", "#3a4f60")}
                  stroke={pc("iband", "#3a5060", strokeColor)} strokeWidth={hl("iband") ? 1.5 : 0.5}
                />
                {/* A-Band (Aktin + Myosin, dunkler) */}
                <rect x={startX + iBandW} y={y+1} width={sarcW - iBandW * 2} height="16" rx="3"
                  fill={pc("aband", "#3d2030", "#5d3050")}
                  stroke={pc("aband", "#5d3050", strokeColor)} strokeWidth={hl("aband") ? 1.5 : 0.5}
                />
                {/* I-Band rechts */}
                <rect x={startX + sarcW - iBandW} y={y+1} width={iBandW} height="16" rx="3"
                  fill={pc("iband", "#2a3540", "#3a4f60")}
                  stroke={pc("iband", "#3a5060", strokeColor)} strokeWidth={hl("iband") ? 1.5 : 0.5}
                />
                {/* H-Zone (nur Myosin, Mitte A-Band) */}
                {hZoneW > 2 && (
                  <rect x={startX + iBandW + (sarcW - iBandW * 2 - hZoneW) / 2} y={y+1} width={hZoneW} height="16" rx="2"
                    fill={pc("hzone", "#2a1520", "#3a2535")}
                    stroke={pc("hzone", "#4a2535", strokeColor)} strokeWidth={hl("hzone") ? 1.5 : 0.5}
                  />
                )}
                {/* Z-Linie links */}
                <rect x={startX - 2} y={y} width="4" height="18" rx="2"
                  fill={pc("zline", "#ccff00", "#eeff44")} opacity={hl("zline") ? 1 : 0.8}
                />
                {/* M-Linie (Mitte) */}
                <rect x={startX + sarcW/2 - 1} y={y+3} width="2" height="12" rx="1"
                  fill={pc("mline", "#8a9099", strokeColor)} opacity="0.6"
                />
              </g>
            ))}

            {/* Aktin-Filamente (dünne Linien im A-Band) */}
            {Array.from({ length: 6 }, (_, i) => {
              const actinY = y + 4 + i * 2.5;
              return (
                <g key={i}>
                  <line x1={sarcomereOffset + iBandW} y1={actinY} x2={sarcomereOffset + iBandW * 2.2} y2={actinY}
                    stroke={pc("aktin", "#4a6080", strokeColor)} strokeWidth="0.8" opacity="0.7" />
                  <line x1={sarcomereOffset + sarcW - iBandW * 2.2} y1={actinY} x2={sarcomereOffset + sarcW - iBandW} y2={actinY}
                    stroke={pc("aktin", "#4a6080", strokeColor)} strokeWidth="0.8" opacity="0.7" />
                  {/* 2. Sarkomer */}
                  <line x1={sarcomereOffset + sarcW + iBandW} y1={actinY} x2={sarcomereOffset + sarcW + iBandW * 2.2} y2={actinY}
                    stroke={pc("aktin", "#4a6080", strokeColor)} strokeWidth="0.8" opacity="0.7" />
                  <line x1={sarcomereOffset + sarcW * 2 - iBandW * 2.2} y1={actinY} x2={sarcomereOffset + sarcW * 2 - iBandW} y2={actinY}
                    stroke={pc("aktin", "#4a6080", strokeColor)} strokeWidth="0.8" opacity="0.7" />
                </g>
              );
            })}

            {/* Myosin-Filamente (dicke Linien im A-Band) */}
            {Array.from({ length: 3 }, (_, i) => {
              const myosinY = y + 5 + i * 4;
              return (
                <g key={i}>
                  <line x1={sarcomereOffset + iBandW + 8} y1={myosinY} x2={sarcomereOffset + sarcW - iBandW - 8} y2={myosinY}
                    stroke={pc("myosin", "#8b2020", "#cc3030")} strokeWidth="2" opacity="0.8"
                    strokeLinecap="round"
                  />
                  <line x1={sarcomereOffset + sarcW + iBandW + 8} y1={myosinY} x2={sarcomereOffset + sarcW * 2 - iBandW - 8} y2={myosinY}
                    stroke={pc("myosin", "#8b2020", "#cc3030")} strokeWidth="2" opacity="0.8"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* === Z-LINIE AM ENDE === */}
      <rect x={sarcomereOffset + sarcW * 2 - 2} y="70" width="4" height="18" rx="2"
        fill={pc("zline", "#ccff00", "#eeff44")} opacity={hl("zline") ? 1 : 0.8}
      />

      {/* === MITOCHONDRIEN (zwischen Myofibrillen) === */}
      {[[20, 80], [20, 145], [20, 210], [360, 80], [360, 145], [360, 210]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x + 8} cy={y + 9} rx="12" ry="8"
            fill={pc("mitochondria", "#1e2835", "#2a3a50")}
            stroke={pc("mitochondria", "#3a5070", strokeColor)} strokeWidth={hl("mitochondria") ? 2 : 1}
          />
          {/* Innenmembran-Andeutung */}
          <path d={`M ${x+2},${y+9} Q ${x+8},${y+6} ${x+14},${y+9}`} fill="none"
            stroke={pc("mitochondria", "#2a4060", strokeColor)} strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}
