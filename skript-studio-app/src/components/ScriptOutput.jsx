import { useState } from "react";
import { Loader2, RefreshCw, Wand2, AlertTriangle, Zap, Film, Eye, Type } from "lucide-react";
import { Rating, CopyBtn } from "./ui.jsx";

const FOCUS_OPTS = ["Nur neu (Variante)", "Provokanter", "Wissenschaftlicher", "Emotionaler", "Konkreter (Beispiel)", "Einfacher erklärt"];
const LEN_OPTS = ["Länge gleich", "Kürzer", "Länger"];

function BeatRow({ b, i, onRegen }) {
  const [focus, setFocus] = useState(FOCUS_OPTS[0]);
  const [len, setLen] = useState(LEN_OPTS[0]);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  async function go() { setBusy(true); await onRegen(i, focus, len, hint); setBusy(false); }
  const selStyle = { background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontFamily: "Space Mono", outline: "none" };
  const inputStyle = { ...selStyle, flex: 1, minWidth: 160, color: "var(--ink)" };
  return (
    <div className="beat-row" style={{ opacity: busy ? 0.5 : 1 }}>
      <div className="beat-tag">{b.beat}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, margin: 0 }}>{b.text}</p>
        {b.einblendung && <div className="meta-row" style={{ marginTop: 4 }}><b>Einblendung:</b> {b.einblendung}</div>}
        {b.shot && <div className="meta-row"><b>Shot:</b> {b.shot}</div>}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 8 }}>
          <select value={focus} onChange={(e) => setFocus(e.target.value)} disabled={busy} style={selStyle}>
            {FOCUS_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={len} onChange={(e) => setLen(e.target.value)} disabled={busy} style={selStyle}>
            {LEN_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={hint} onChange={(e) => setHint(e.target.value)} disabled={busy}
            onKeyDown={(e) => { if (e.key === "Enter") go(); }}
            placeholder="Fokus / Keyword (optional)…" style={inputStyle} />
          <button className="vs-ghost" onClick={go} disabled={busy} style={{ padding: "5px 10px" }}>
            {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Abschnitt neu
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScriptOutput({ s, onRegenBeat, onOptimize }) {
  const [busy, setBusy] = useState(false);
  const [ground, setGround] = useState(true);
  if (!s) return null;
  const full = JSON.stringify(s, null, 2);
  async function runOpt() { setBusy(true); await onOptimize(ground); setBusy(false); }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ paddingBottom: 2 }}>
        <label className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={ground} onChange={(e) => setGround(e.target.checked)} />
          An Recherche verankern (Unbelegtes markieren, Hook ausgenommen)
        </label>
        <button className="vs-btn" style={{ padding: "10px 16px", fontSize: 13 }} onClick={runOpt} disabled={busy}>
          {busy ? <><Loader2 size={15} className="animate-spin" /> Prüfe & optimiere…</> : <><Wand2 size={15} /> Skript prüfen & optimieren</>}
        </button>
      </div>

      {Array.isArray(s.aenderungen) && s.aenderungen.length > 0 && (
        <div className="vs-panel" style={{ padding: 18, borderColor: "var(--volt)" }}>
          <div className="section-head"><Wand2 size={15} /> Was optimiert wurde</div>
          <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
            {s.aenderungen.map((a, i) => <li key={i} style={{ fontSize: 13, color: "var(--ink)", marginBottom: 4, lineHeight: 1.45 }}>{a}</li>)}
          </ul>
        </div>
      )}

      {Array.isArray(s.faktencheck) && s.faktencheck.length > 0 && (
        <div className="vs-panel" style={{ padding: 18 }}>
          <div className="section-head"><AlertTriangle size={15} /> Faktencheck (Body, ohne Hook)</div>
          {s.faktencheck.map((f, i) => {
            const ok = f.status === "belegt";
            return (
              <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none", paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0 }}>
                <div className="flex items-start gap-2">
                  <span style={{ flexShrink: 0, marginTop: 2, color: ok ? "var(--volt)" : "var(--signal)", fontFamily: "Space Mono", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                    {ok ? "● belegt" : "▲ unbelegt"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14 }}>{f.aussage}</div>
                    {ok && f.beleg ? <div className="meta-row" style={{ marginTop: 2 }}><b>Beleg:</b> {f.beleg}</div>
                      : !ok ? <div className="meta-row" style={{ marginTop: 2, color: "var(--signal)" }}>Kein Beleg in der Recherche – selbst prüfen.</div> : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Rating rating={s.rating} />

      <div className="vs-panel" style={{ padding: 20 }}>
        <div className="section-head"><Zap size={15} /> Hook-Varianten</div>
        {(s.hooks || []).map((h, i) => (
          <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none", paddingTop: i ? 14 : 0, marginTop: i ? 14 : 8 }}>
            <div className="mono-label" style={{ color: "var(--volt)" }}>Variante {i + 1} · {h.ebene}</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: "4px 0 8px" }}>„{h.gesprochen}"</p>
            <div className="meta-row"><b>Overlay-Text:</b> {h.overlay}</div>
            <div className="meta-row"><b>Visuell:</b> {h.visuell}</div>
            <div className="meta-row"><b>Sound:</b> {h.sound}</div>
          </div>
        ))}
      </div>

      <div className="vs-panel" style={{ padding: 20 }}>
        <div className="section-head"><Film size={15} /> Drehbuch / Beats</div>
        {(s.body || []).map((b, i) => (
          <BeatRow key={i} b={b} i={i} onRegen={onRegenBeat} />
        ))}
        {s.cta && <div style={{ marginTop: 12, padding: 10, background: "var(--panel-2)", borderRadius: 8, fontSize: 14 }}><b style={{ color: "var(--volt)" }}>CTA:</b> {s.cta}</div>}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="vs-panel" style={{ padding: 20 }}>
          <div className="section-head"><Eye size={15} /> Cover-Frame</div>
          <div className="meta-row"><b>Moment:</b> {s.cover?.frame}</div>
          <div className="meta-row"><b>Cover-Text:</b> „{s.cover?.text}"</div>
        </div>
        <div className="vs-panel" style={{ padding: 20 }}>
          <div className="section-head"><Type size={15} /> Caption & Hashtags</div>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}>{s.caption}</p>
          <div style={{ marginTop: 8, fontFamily: "Space Mono", fontSize: 12, color: "var(--volt)" }}>{(s.hashtags || []).map((h) => (h.startsWith("#") ? h : "#" + h)).join(" ")}</div>
        </div>
      </div>

      <div className="flex justify-end"><CopyBtn text={full} /></div>
    </div>
  );
}
