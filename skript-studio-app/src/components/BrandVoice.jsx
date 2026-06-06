import { useState, useEffect } from "react";
import { User, Check } from "lucide-react";
import { store } from "../lib/store.js";

export function BrandVoice({ brandVoice, setBrandVoice }) {
  const [val, setVal] = useState(brandVoice);
  const [saved, setSaved] = useState(false);
  useEffect(() => setVal(brandVoice), [brandVoice]);
  async function save() { setBrandVoice(val); await store.set("vsg:brandvoice", val); setSaved(true); setTimeout(() => setSaved(false), 1500); }
  return (
    <div className="vs-panel" style={{ padding: 24, maxWidth: 760 }}>
      <div className="section-head"><User size={15} /> Deine Markenstimme</div>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
        Füge 2–5 deiner besten eigenen Skripte/Posts ein. Das Tool übernimmt daraus Tonfall, Satzlänge, Lieblingsformulierungen – so klingt jedes Skript nach dir, nicht generisch.
      </p>
      <textarea className="vs-input" rows={12} value={val} onChange={(e) => setVal(e.target.value)} placeholder="Beispiel-Skripte hier einfügen…" />
      <button className="vs-btn" onClick={save} style={{ marginTop: 12 }}>{saved ? <><Check size={15} /> Gespeichert</> : "Speichern"}</button>
    </div>
  );
}
