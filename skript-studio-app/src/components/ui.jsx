import { useState } from "react";
import { TrendingUp, Copy, Check } from "lucide-react";

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="mono-label">{label}</span>
      {children}
    </label>
  );
}
export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="vs-input">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export const SCORE_LABELS = {
  audience_breite: "Audience-Breite", pain_intensitaet: "Pain-Intensität", shareability: "Shareability",
  saveability: "Saveability", kommentar_potenzial: "Kommentar-Potenzial", hook_staerke: "Hook-Stärke",
  suchbarkeit: "Suchbarkeit / Evergreen", saettigung: "Sättigung (niedrig = gut)",
};
export function Rating({ rating }) {
  if (!rating) return null;
  const g = rating.gesamt ?? 0;
  const color = g >= 70 ? "var(--volt)" : g >= 45 ? "#ffd84d" : "var(--signal)";
  return (
    <div className="vs-panel" style={{ padding: 20 }}>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="mono-label">Reichweiten-Potenzial</div>
          <div style={{ fontFamily: "Anton", fontSize: 52, lineHeight: 1, color }}>{g}<span style={{ fontSize: 22, color: "var(--muted)" }}>/100</span></div>
        </div>
        <div className="text-right">
          <div className="mono-label">Confidence</div>
          <div style={{ fontFamily: "Space Mono", fontSize: 13, color: "var(--ink)" }}>{rating.confidence}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 mb-3">
        {Object.entries(rating.scores || {}).map(([k, v]) => (
          <div key={k}>
            <div className="flex justify-between" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3 }}>
              <span>{SCORE_LABELS[k] || k}</span><span style={{ fontFamily: "Space Mono" }}>{v}</span>
            </div>
            <div style={{ height: 4, background: "var(--line)", borderRadius: 4 }}>
              <div style={{ width: `${v}%`, height: "100%", background: "var(--volt)", borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
      {rating.reframe && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "rgba(255,90,60,0.08)", border: "1px solid rgba(255,90,60,0.25)" }}>
          <div className="flex items-center gap-2" style={{ color: "var(--signal)", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
            <TrendingUp size={13} /> REFRAME FÜR MEHR REICHWEITE
          </div>
          <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{rating.reframe}</div>
        </div>
      )}
    </div>
  );
}

export function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="vs-ghost" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); }}>
      {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Kopiert" : "Kopieren"}
    </button>
  );
}
