import { useState } from "react";
import { Loader2, RefreshCw, Wand2, AlertTriangle, Zap, Film, Eye, Type, Pencil, Check } from "lucide-react";
import { Rating, CopyBtn } from "./ui.jsx";

const FOCUS_OPTS = ["Nur neu (Variante)", "Provokanter", "Wissenschaftlicher", "Emotionaler", "Konkreter (Beispiel)", "Einfacher erklärt"];
const LEN_OPTS = ["Länge gleich", "Kürzer", "Länger"];

const fieldBox = { background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--ink)", borderRadius: 6, padding: "6px 8px", fontSize: 12.5, fontFamily: "inherit", outline: "none" };
const selStyle = { background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)", borderRadius: 6, padding: "5px 8px", fontSize: 11, fontFamily: "Space Mono", outline: "none" };
const fieldLabel = { fontFamily: "Space Mono", fontSize: 10, color: "var(--muted)", width: 60, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.04em" };

function EditToggle({ editing, onClick }) {
  return (
    <button className="vs-ghost" onClick={onClick} style={{ padding: "4px 10px", fontSize: 11 }}>
      {editing ? <><Check size={12} /> Fertig</> : <><Pencil size={12} /> Bearbeiten</>}
    </button>
  );
}

// Ein strukturiertes Feld (Overlay/Visuell/Sound): gesperrt bis "Bearbeiten"
function SpecField({ label, value, locked, onChange, onRegen }) {
  const [kw, setKw] = useState("");
  const [busy, setBusy] = useState(false);
  async function go() { setBusy(true); await onRegen(kw); setBusy(false); setKw(""); }

  if (locked) {
    return (
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <span style={{ ...fieldLabel, paddingTop: 1 }}>{label}</span>
        <span style={{ fontSize: 13, color: value ? "var(--ink)" : "var(--muted)", lineHeight: 1.45, flex: 1, minWidth: 0 }}>{value || "—"}</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginTop: 6, opacity: busy ? 0.55 : 1 }}>
      <span style={{ ...fieldLabel, paddingTop: 8 }}>{label}</span>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={1}
        style={{ ...fieldBox, flex: 1, resize: "vertical", lineHeight: 1.4, minWidth: 0 }} />
      <input value={kw} onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go(); }}
        placeholder="Keyword…" disabled={busy} style={{ ...fieldBox, width: 104, flexShrink: 0, fontFamily: "Space Mono", fontSize: 11 }} />
      <button className="vs-ghost" onClick={go} disabled={busy} title="Dieses Feld neu generieren" style={{ padding: "6px 9px", flexShrink: 0 }}>
        {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
      </button>
    </div>
  );
}

// Hook-Variante: gesperrt bis "Bearbeiten"
function HookCard({ h, i, onEdit, onRegenField }) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ borderTop: i ? "1px solid var(--line)" : "none", paddingTop: i ? 14 : 0, marginTop: i ? 14 : 8 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
        <div className="mono-label" style={{ color: "var(--volt)", margin: 0 }}>Variante {i + 1} · {h.ebene}</div>
        <EditToggle editing={editing} onClick={() => setEditing((e) => !e)} />
      </div>
      {editing ? (
        <textarea value={h.gesprochen || ""} onChange={(e) => onEdit(i, "gesprochen", e.target.value)} rows={2}
          style={{ width: "100%", background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--ink)", borderRadius: 8, padding: "8px 10px", fontSize: 15, fontWeight: 600, fontFamily: "inherit", outline: "none", resize: "vertical", margin: "5px 0 2px", lineHeight: 1.4 }} />
      ) : (
        <p style={{ fontSize: 16, fontWeight: 600, margin: "4px 0 6px" }}>„{h.gesprochen}"</p>
      )}
      <SpecField label="Overlay" value={h.overlay} locked={!editing} onChange={(v) => onEdit(i, "overlay", v)} onRegen={(kw) => onRegenField(i, "overlay", kw)} />
      <SpecField label="Visuell" value={h.visuell} locked={!editing} onChange={(v) => onEdit(i, "visuell", v)} onRegen={(kw) => onRegenField(i, "visuell", kw)} />
      <SpecField label="Sound" value={h.sound} locked={!editing} onChange={(v) => onEdit(i, "sound", v)} onRegen={(kw) => onRegenField(i, "sound", kw)} />
    </div>
  );
}

// Drehbuch-Beat: gesperrt bis "Bearbeiten"
function BeatCard({ b, i, onEdit, onRegenField, onRegenSpoken }) {
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState(FOCUS_OPTS[0]);
  const [len, setLen] = useState(LEN_OPTS[0]);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  async function goSpoken() { setBusy(true); await onRegenSpoken(i, focus, len, hint); setBusy(false); setHint(""); }
  return (
    <div className="beat-row" style={{ display: "block", opacity: busy ? 0.55 : 1 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <div className="beat-tag" style={{ display: "inline-block" }}>{b.beat}</div>
        <EditToggle editing={editing} onClick={() => setEditing((e) => !e)} />
      </div>
      {editing ? (
        <>
          <textarea value={b.text || ""} onChange={(e) => onEdit(i, "text", e.target.value)} rows={2}
            style={{ width: "100%", ...fieldBox, fontSize: 14, resize: "vertical", lineHeight: 1.45 }} />
          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
            <select value={focus} onChange={(e) => setFocus(e.target.value)} disabled={busy} style={selStyle}>
              {FOCUS_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={len} onChange={(e) => setLen(e.target.value)} disabled={busy} style={selStyle}>
              {LEN_OPTS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <input value={hint} onChange={(e) => setHint(e.target.value)} disabled={busy}
              onKeyDown={(e) => { if (e.key === "Enter") goSpoken(); }}
              placeholder="Fokus / Keyword (optional)…" style={{ ...selStyle, flex: 1, minWidth: 150, color: "var(--ink)" }} />
            <button className="vs-ghost" onClick={goSpoken} disabled={busy} style={{ padding: "5px 10px" }}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Text neu
            </button>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 14, margin: 0 }}>{b.text}</p>
      )}
      <SpecField label="Overlay" value={b.overlay} locked={!editing} onChange={(v) => onEdit(i, "overlay", v)} onRegen={(kw) => onRegenField(i, "overlay", kw)} />
      <SpecField label="Visuell" value={b.visuell} locked={!editing} onChange={(v) => onEdit(i, "visuell", v)} onRegen={(kw) => onRegenField(i, "visuell", kw)} />
      <SpecField label="Sound" value={b.sound} locked={!editing} onChange={(v) => onEdit(i, "sound", v)} onRegen={(kw) => onRegenField(i, "sound", kw)} />
    </div>
  );
}

export function ScriptOutput({ s, onRegenBeat, onRegenBeatField, onEditBeat, onRegenHookField, onEditHook, onOptimize }) {
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
          <HookCard key={i} h={h} i={i} onEdit={onEditHook} onRegenField={onRegenHookField} />
        ))}
      </div>

      <div className="vs-panel" style={{ padding: 20 }}>
        <div className="section-head"><Film size={15} /> Drehbuch / Beats</div>
        {(s.body || []).map((b, i) => (
          <BeatCard key={i} b={b} i={i} onEdit={onEditBeat} onRegenField={onRegenBeatField} onRegenSpoken={onRegenBeat} />
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
