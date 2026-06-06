import React, { useState, useEffect, useRef } from "react";
import { Zap, Film, Mic, Eye, Type, Library, User, History, Plus, Trash2, Loader2, Sparkles, TrendingUp, AlertTriangle, Copy, Check, FlaskConical, RefreshCw, Wand2, Image, Download } from "lucide-react";

// ---------- Persistenz-Helfer (window.storage mit In-Memory-Fallback) ----------
const mem = {};
const store = {
  async get(key) {
    try {
      if (window.storage) { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    } catch (e) { /* key existiert nicht */ }
    return mem[key] ?? null;
  },
  async set(key, value) {
    mem[key] = value;
    try { if (window.storage) await window.storage.set(key, JSON.stringify(value), false); } catch (e) {}
  },
};

// ---------- Optionen ----------
const VIDEO_TYPEN = ["Talking Head", "Voiceover + B-Roll", "POV", "Reaction / Stitch", "Tutorial / How-to", "Listicle", "Story / Narrativ", "Skit / Comedy", "Green-Screen-Kommentar", "Text-on-Screen", "Before / After", "Day-in-the-Life"];
const HOOK_EBENEN = [{ k: "Visuell stark", icon: Eye }, { k: "Akustisch stark", icon: Mic }, { k: "Textlich stark", icon: Type }, { k: "Sprachlich stark", icon: Zap }];
const HOOK_ARCHETYPEN = ["Automatisch wählen", "Neugier-Lücke", "Warnung / Negativität", "Social Proof", "Kontroverse", "Relatability", "Transformation", "FOMO"];
const FRAMEWORKS = ["Pain – Problem – Solution", "PAS (Problem-Agitate-Solve)", "AIDA", "Hook – Retain – Reward", "Mythbusting", "3-Tipps-Listicle", "Story-Bogen"];
const LAENGEN = ["7 s", "15 s", "30 s", "60 s", "90 s"];
const TON = ["Edukativ-ruhig", "Locker-relatable", "Autoritär-Experte", "Energetisch-hype", "Provokant-frech"];
const CTA_ZIELE = ["Follow", "Kommentar provozieren", "Save", "Share", "Link in Bio"];
const CLAIM_STUFEN = ["Vorsichtig / wissenschaftlich", "Ausgewogen", "Zugespitzt", "Provokant"];
const PLATTFORM = ["TikTok", "Instagram Reels", "Beide"];
const DETAIL_OPTS = ["Anfänger", "Medium", "Experten"];
const BILD_OPTS = ["Ohne Bildsprache", "Dezente Bildsprache", "Viel Bildsprache / Analogien"];
const DETAIL_HINT = {
  "Anfänger": "einfache Alltagserklärungen, kaum bis keine Fachbegriffe, alles sofort verständlich",
  "Medium": "ausgewogen: ein paar Fachbegriffe, aber jeweils kurz erklärt",
  "Experten": "fachlich tief, rein in Physiologie/Mechanismen, Fachsprache erlaubt und erwünscht",
};
const BILD_HINT = {
  "Ohne Bildsprache": "keine Metaphern, sachlich-direkt",
  "Dezente Bildsprache": "vereinzelt eine treffende Analogie zur Veranschaulichung",
  "Viel Bildsprache / Analogien": "komplexe Inhalte konsequent über Metaphern/Analogien greifbar machen",
};
const BILD_RULE = {
  "Ohne Bildsprache": "Verzichte bewusst auf Metaphern und Vergleiche. Bleib sachlich und direkt.",
  "Dezente Bildsprache": "Baue mindestens EINE treffende, konkrete Analogie ins Skript ein (z.B. ein Körpervorgang als Alltagsbild). Setze sie gezielt dort, wo es am meisten hilft.",
  "Viel Bildsprache / Analogien": "PFLICHT: Erkläre die zentralen komplexen Punkte durchgehend mit konkreten, anschaulichen Metaphern/Analogien aus dem Alltag (z.B. Mitochondrien als Kraftwerke, Sehne als Sprungfeder). In der Mehrzahl der Beats MUSS ein konkretes Bild vorkommen. Vermeide rein abstrakte, sachliche Formulierungen überall dort, wo ein anschauliches Bild möglich ist.",
};

// ---------- API ----------
async function callClaude(prompt, maxTokens = 3000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("");
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

// ---------- Kleine UI-Bausteine ----------
function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="mono-label">{label}</span>
      {children}
    </label>
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="vs-input">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ---------- Reichweiten-Rating ----------
const SCORE_LABELS = {
  audience_breite: "Audience-Breite", pain_intensitaet: "Pain-Intensität", shareability: "Shareability",
  saveability: "Saveability", kommentar_potenzial: "Kommentar-Potenzial", hook_staerke: "Hook-Stärke",
  suchbarkeit: "Suchbarkeit / Evergreen", saettigung: "Sättigung (niedrig = gut)",
};
function Rating({ rating }) {
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

// ---------- Skript-Ausgabe ----------
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="vs-ghost" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1200); }}>
      {done ? <Check size={13} /> : <Copy size={13} />} {done ? "Kopiert" : "Kopieren"}
    </button>
  );
}
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

function ScriptOutput({ s, onRegenBeat, onOptimize }) {
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

// ---------- Haupt-App ----------
export default function App() {
  const [tab, setTab] = useState("gen");
  const [topics, setTopics] = useState([]);
  const [brandVoice, setBrandVoice] = useState("");
  const [viral, setViral] = useState([]);
  const [usedHooks, setUsedHooks] = useState([]);
  const [lastScript, setLastScript] = useState(null);

  useEffect(() => {
    (async () => {
      setTopics((await store.get("vsg:topics")) || []);
      setBrandVoice((await store.get("vsg:brandvoice")) || "");
      setViral((await store.get("vsg:viral")) || []);
      setUsedHooks((await store.get("vsg:usedhooks")) || []);
    })();
  }, []);

  return (
    <div className="vs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Schibsted+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .vs-root{--bg:#0a0b0d;--panel:#131519;--panel-2:#1a1d23;--line:#262a32;--ink:#f2f4f3;--muted:#8a9099;--volt:#ccff00;--signal:#ff5a3c;
          background:var(--bg);color:var(--ink);font-family:'Schibsted Grotesk',sans-serif;min-height:100vh;
          background-image:radial-gradient(circle at 85% -10%, rgba(204,255,0,0.07), transparent 45%);}
        .vs-root *{box-sizing:border-box;}
        .mono-label{display:block;font-family:'Space Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
        .vs-input{width:100%;background:var(--panel-2);border:1px solid var(--line);color:var(--ink);border-radius:8px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none;}
        .vs-input:focus{border-color:var(--volt);}
        textarea.vs-input{resize:vertical;line-height:1.5;}
        .vs-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;}
        .section-head{display:flex;align-items:center;gap:8px;font-family:'Anton';font-size:15px;letter-spacing:0.04em;text-transform:uppercase;color:var(--ink);margin-bottom:12px;}
        .section-head svg{color:var(--volt);}
        .meta-row{font-size:13px;color:var(--muted);line-height:1.45;margin:2px 0;}
        .meta-row b{color:var(--ink);font-weight:600;}
        .beat-row{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--line);}
        .beat-tag{font-family:'Space Mono';font-size:10px;text-transform:uppercase;color:var(--bg);background:var(--volt);padding:3px 7px;border-radius:5px;height:fit-content;white-space:nowrap;}
        .vs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--volt);color:var(--bg);font-weight:700;border:none;border-radius:10px;padding:13px 20px;cursor:pointer;font-family:'Anton';letter-spacing:0.04em;text-transform:uppercase;font-size:15px;transition:transform .1s;}
        .vs-btn:hover{transform:translateY(-1px);} .vs-btn:disabled{opacity:.5;cursor:wait;transform:none;}
        .vs-ghost{display:inline-flex;align-items:center;gap:6px;background:var(--panel-2);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;font-family:'Space Mono';}
        .vs-ghost:hover{border-color:var(--volt);}
        .pill{padding:8px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel-2);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;}
        .pill.on{border-color:var(--volt);background:rgba(204,255,0,0.1);color:var(--volt);}
        .tab{font-family:'Space Mono';font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 4px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;display:flex;align-items:center;gap:7px;}
        .tab.on{color:var(--ink);border-color:var(--volt);}
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div style={{ width: 38, height: 38, background: "var(--volt)", borderRadius: 9, display: "grid", placeItems: "center" }}><FlaskConical size={22} color="#0a0b0d" /></div>
          <h1 style={{ fontFamily: "Anton", fontSize: 30, letterSpacing: "0.02em", margin: 0 }}>SKRIPT-STUDIO</h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24, fontFamily: "Space Mono" }}>Recherche → schnittfertiges Short-Form-Skript · Sport & Gesundheit</p>

        {/* Tabs */}
        <div className="flex gap-7 mb-7" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className={`tab ${tab === "gen" ? "on" : ""}`} onClick={() => setTab("gen")}><Sparkles size={14} />Generator</div>
          <div className={`tab ${tab === "voice" ? "on" : ""}`} onClick={() => setTab("voice")}><User size={14} />Markenstimme</div>
          <div className={`tab ${tab === "viral" ? "on" : ""}`} onClick={() => setTab("viral")}><Library size={14} />Virale Bibliothek</div>
          <div className={`tab ${tab === "grafik" ? "on" : ""}`} onClick={() => setTab("grafik")}><Image size={14} />Grafiken</div>
        </div>

        {tab === "gen" && <Generator topics={topics} setTopics={setTopics} brandVoice={brandVoice} viral={viral} usedHooks={usedHooks} setUsedHooks={setUsedHooks} setLastScript={setLastScript} />}
        {tab === "voice" && <BrandVoice brandVoice={brandVoice} setBrandVoice={setBrandVoice} />}
        {tab === "viral" && <Viral viral={viral} setViral={setViral} />}
        {tab === "grafik" && <Grafiken script={lastScript} />}
      </div>
    </div>
  );
}

// ---------- Tab: Generator ----------
function Generator({ topics, setTopics, brandVoice, viral, usedHooks, setUsedHooks, setLastScript }) {
  const [sel, setSel] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [cfg, setCfg] = useState({
    plattform: "Beide", typ: VIDEO_TYPEN[0], ebenen: ["Visuell stark"], archetyp: HOOK_ARCHETYPEN[0],
    framework: FRAMEWORKS[0], laenge: "30 s", ton: TON[0], cta: CTA_ZIELE[0], claim: CLAIM_STUFEN[1], loop: true,
    detail: "Medium", bild: "Dezente Bildsprache",
  });
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { if (setLastScript) setLastScript(out); }, [out]);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const toggleEbene = (k) => set("ebenen", cfg.ebenen.includes(k) ? cfg.ebenen.filter((x) => x !== k) : [...cfg.ebenen, k]);

  async function addTopic() {
    if (!newName.trim() || !newText.trim()) return;
    const next = [...topics, { id: Date.now(), name: newName.trim(), text: newText.trim() }];
    setTopics(next); await store.set("vsg:topics", next);
    setSel(String(next[next.length - 1].id)); setNewName(""); setNewText(""); setAdding(false);
  }

  async function generate() {
    const topic = topics.find((t) => String(t.id) === sel);
    if (!topic) { setErr("Bitte zuerst ein Thema wählen oder anlegen."); return; }
    setBusy(true); setErr(""); setOut(null);
    const prompt = `Du bist Experte für virales Short-Form-Video (TikTok/Reels) in der Nische Sport & Gesundheit (Laufen, Krafttraining, Supplemente, Hybridathletik). Der Creator ist Physiotherapeut und Sportler. Sprache: ausschließlich Deutsch, Du-Form.

RECHERCHE-GRUNDLAGE (Thema "${topic.name}"):
${topic.text}

${brandVoice ? `MARKENSTIMME (schreibe genau in diesem Stil/Ton):\n${brandVoice}\n` : ""}
${usedHooks.length ? `BEREITS GENUTZTE HOOK-MUSTER (bewusst vermeiden, neu variieren):\n${usedHooks.slice(-12).join(" | ")}\n` : ""}

PARAMETER:
- Plattform: ${cfg.plattform}
- Video-Typ: ${cfg.typ}
- Hook-Ebene(n) betonen: ${cfg.ebenen.join(", ") || "frei"}
- Hook-Archetyp: ${cfg.archetyp}
- Framework: ${cfg.framework}
- Detailtiefe: ${cfg.detail} → ${DETAIL_HINT[cfg.detail]}
- Bildsprache: ${cfg.bild} → ${BILD_HINT[cfg.bild]}
- Länge: ${cfg.laenge}
- Loop am Ende: ${cfg.loop ? "ja" : "nein"}
- Tonalität: ${cfg.ton}
- CTA-Ziel: ${cfg.cta}
- Claim-Intensität: ${cfg.claim} (steuert NUR wie pointiert die belegte Aussage verpackt wird, niemals Erfundenes)

>>> BILDSPRACHE (zwingend beachten): ${BILD_RULE[cfg.bild]}

Antworte AUSSCHLIESSLICH mit reinem JSON (keine Markdown-Fences, kein Text drumherum) in exakt dieser Struktur:
{
 "hooks":[{"ebene":"...","gesprochen":"erster gesprochener Satz","overlay":"eingeblendeter Text","visuell":"visuelle Umsetzung","sound":"Sound-Idee"}, ...genau 3],
 "body":[{"beat":"z.B. Problem","text":"Voiceover/Skript-Text","einblendung":"Was eingeblendet wird","shot":"Kameraeinstellung/B-Roll"}, ...3-5 Beats},
 "cta":"konkreter CTA passend zum Ziel",
 "cover":{"frame":"welcher Moment als Cover","text":"Text aufs Cover"},
 "caption":"Caption-Text","hashtags":["...5-8 ohne #"],
 "rating":{"gesamt":0-100,"confidence":"niedrig|mittel|hoch","scores":{"audience_breite":0-100,"pain_intensitaet":0-100,"shareability":0-100,"saveability":0-100,"kommentar_potenzial":0-100,"hook_staerke":0-100,"suchbarkeit":0-100,"saettigung":0-100},"reframe":"NUR falls gesamt<60: konkreter Vorschlag für breiteren Einstieg, sonst leerer String"},
 "hook_formel":"die wiederverwendbare Formel des stärksten Hooks in einem Satz"
}`;
    try {
      const s = await callClaude(prompt);
      setOut(s);
      if (s.hook_formel) {
        const nu = [...usedHooks, s.hook_formel];
        setUsedHooks(nu); await store.set("vsg:usedhooks", nu);
      }
    } catch (e) { setErr("Generierung fehlgeschlagen. Bitte erneut versuchen."); }
    setBusy(false);
  }

  const FOCUS_HINT = {
    "Nur neu (Variante)": "frische Variante, gleiche Richtung",
    "Provokanter": "zugespitzter, mutiger, mehr Reibung – aber sachlich korrekt",
    "Wissenschaftlicher": "mehr Mechanismus/Evidenz, präziser, sachlicher Ton",
    "Emotionaler": "stärkerer emotionaler bzw. Identitäts-Trigger",
    "Konkreter (Beispiel)": "mit konkretem Beispiel, Zahl oder Alltagsszenario",
    "Einfacher erklärt": "simpler, alltagsnah, weniger Fachbegriffe",
  };
  const LEN_HINT = {
    "Länge gleich": "ungefähr gleiche Länge wie bisher",
    "Kürzer": "deutlich knapper, weniger Worte, auf den Punkt",
    "Länger": "etwas ausführlicher, ein konkretes Detail mehr",
  };

  async function regenerateBeat(index, focus, len, hint) {
    if (!out) return;
    const topic = topics.find((t) => String(t.id) === sel);
    const beat = out.body[index];
    const prompt = `Du überarbeitest EINEN Beat eines bestehenden Short-Form-Skripts (Nische Sport & Gesundheit, Deutsch, Du-Form). Der Creator ist Physiotherapeut und Sportler. Halte Kohärenz und roten Faden zum restlichen Skript.

${brandVoice ? `MARKENSTIMME (in diesem Stil bleiben):\n${brandVoice}\n` : ""}${topic ? `RECHERCHE-GRUNDLAGE:\n${topic.text.slice(0, 4000)}\n` : ""}
GESAMTES AKTUELLES SKRIPT (Beats als Kontext):
${JSON.stringify(out.body)}

ZU ÜBERARBEITENDER BEAT (Position ${index + 1}, Label "${beat.beat}"):
${JSON.stringify(beat)}

STIL/FOKUS: ${focus} → ${FOCUS_HINT[focus]}
LÄNGE: ${len} → ${LEN_HINT[len]}
DETAILTIEFE (beibehalten): ${cfg.detail} → ${DETAIL_HINT[cfg.detail]}
BILDSPRACHE (zwingend beachten): ${BILD_RULE[cfg.bild]}
${hint && hint.trim() ? `ZUSÄTZLICHE ANWEISUNG DES CREATORS (hat Priorität, unbedingt umsetzen): "${hint.trim()}"\n` : ""}Claim-Intensität bleibt: ${cfg.claim}. Behalte das Label "${beat.beat}". Schreibe NUR diesen einen Beat neu, passend zwischen die Nachbar-Beats.

Antworte AUSSCHLIESSLICH als reines JSON (keine Fences):
{"beat":"${beat.beat}","text":"...","einblendung":"...","shot":"..."}`;
    try {
      const nb = await callClaude(prompt, 1200);
      setOut((prev) => {
        const body = [...prev.body];
        body[index] = { beat: beat.beat, ...nb };
        return { ...prev, body };
      });
    } catch (e) { setErr("Abschnitt konnte nicht neu generiert werden."); }
  }

  async function optimizeScript(ground) {
    if (!out) return;
    setErr("");
    const topic = topics.find((t) => String(t.id) === sel);
    const groundBlock = ground ? `
VERANKERUNG (zwingend, gilt NUR für die inhaltlichen Aussagen im Body – NICHT für die Hook):
- Verankere jede inhaltliche Kernaussage im Body an einem konkreten Satz/Fakt aus der RECHERCHE-GRUNDLAGE.
- Eine Aussage, die die Recherche NICHT hergibt, NICHT erfinden, NICHT mit Belegen ausschmücken und auch NICHT heimlich weichspülen/verwässern. Lass sie inhaltlich stehen und markiere sie im Feld "faktencheck" als "unbelegt", damit der Creator selbst entscheidet.
- Korrigiere nur Aussagen, die der Recherche klar WIDERSPRECHEN.
` : "";
    const hookRule = `
WICHTIG ZUR HOOK: Die Hook darf bewusst zuspitzen und übertreiben. Schwäche sie NICHT ab und unterwirf sie NICHT dem Faktencheck. Lass ihre Schärfe erhalten.`;
    const fcField = ground ? `,
 "faktencheck":[{"aussage":"Kernaussage aus dem Body","status":"belegt|unbelegt","beleg":"sinngemäßer Satz aus der Recherche, der das stützt – leerer String wenn unbelegt"}]` : "";
    const prompt = `Du bist ein erfahrener Editor für virale Short-Form-Video-Skripte (Nische Sport & Gesundheit, Deutsch, Du-Form). Prüfe das folgende Skript streng und verbessere es als GANZES.

PRÜFE UND KORRIGIERE:
- Sinnhaftigkeit & roter Faden: Passen die Beats logisch zusammen? Sind die Übergänge fließend?
- Reihenfolge: Ist die Beat-Abfolge dramaturgisch optimal? Ordne um, wenn es klar besser wirkt.
- Inhaltliche Korrektheit: Stimmt jede Aussage mit der Recherche-Grundlage überein? Korrigiere falsche/widersprüchliche Aussagen. Erfinde NICHTS dazu.
- Verständlichkeit: Ist der Text klar und flüssig? Straffe Umständliches, kläre Schwammiges.
- Metaphern/Bildsprache: Ergeben die Bilder Sinn und treffen sie inhaltlich? Ersetze schiefe, falsche oder generische Analogien durch präzise.
- CTA: Wo möglich stärker und konkreter machen.
${hookRule}
${groundBlock}
RAHMEN UNBEDINGT BEIBEHALTEN: Detailtiefe ${cfg.detail} (${DETAIL_HINT[cfg.detail]}), Bildsprache ${cfg.bild} (${BILD_RULE[cfg.bild]}), Claim-Intensität ${cfg.claim}, Framework ${cfg.framework}, Länge ${cfg.laenge}.

${brandVoice ? `MARKENSTIMME (Ton beibehalten):\n${brandVoice}\n` : ""}${topic ? `RECHERCHE-GRUNDLAGE (Faktencheck strikt dagegen):\n${topic.text.slice(0, 5000)}\n` : ""}
AKTUELLES SKRIPT:
${JSON.stringify({ hooks: out.hooks, body: out.body, cta: out.cta, cover: out.cover, caption: out.caption, hashtags: out.hashtags })}

Gib das VERBESSERTE Skript zurück, AUSSCHLIESSLICH als reines JSON (keine Fences) in exakt dieser Struktur:
{
 "hooks":[{"ebene":"...","gesprochen":"...","overlay":"...","visuell":"...","sound":"..."}, ...genau 3],
 "body":[{"beat":"...","text":"...","einblendung":"...","shot":"..."}, ...],
 "cta":"...","cover":{"frame":"...","text":"..."},"caption":"...","hashtags":["...5-8 ohne #"],
 "rating":{"gesamt":0-100,"confidence":"niedrig|mittel|hoch","scores":{"audience_breite":0-100,"pain_intensitaet":0-100,"shareability":0-100,"saveability":0-100,"kommentar_potenzial":0-100,"hook_staerke":0-100,"suchbarkeit":0-100,"saettigung":0-100},"reframe":"nur falls gesamt<60, sonst leerer String"},
 "hook_formel":"...",
 "aenderungen":["3-6 kurze Stichpunkte: WAS du verbessert hast und WARUM"]${fcField}
}`;
    try {
      const improved = await callClaude(prompt, 3800);
      setOut(improved);
    } catch (e) { setErr("Optimierung fehlgeschlagen. Bitte erneut versuchen."); }
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-7">
      {/* Steuerung */}
      <div className="vs-panel" style={{ padding: 22, alignSelf: "start" }}>
        <div className="section-head">Parameter</div>

        <Field label="Thema (aus deiner Wissensdatenbank)">
          <div className="flex gap-2">
            <select value={sel} onChange={(e) => setSel(e.target.value)} className="vs-input">
              <option value="">— wählen —</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="vs-ghost" onClick={() => setAdding((a) => !a)} style={{ flexShrink: 0 }}><Plus size={14} /></button>
          </div>
        </Field>
        {adding && (
          <div style={{ marginBottom: 16, padding: 12, background: "var(--panel-2)", borderRadius: 10 }}>
            <input className="vs-input" placeholder="Themen-Name (z.B. VO2 max)" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ marginBottom: 8 }} />
            <textarea className="vs-input" rows={5} placeholder="Recherche / Studien / Wissensdatenbank hier einfügen…" value={newText} onChange={(e) => setNewText(e.target.value)} />
            <button className="vs-btn" onClick={addTopic} style={{ width: "100%", marginTop: 8, fontSize: 13, padding: "10px" }}>Speichern</button>
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontFamily: "Space Mono" }}>In der lokalen App ersetzt das Lesen aus deinen Ordnern dieses Feld.</p>
          </div>
        )}

        <Field label="Plattform"><Select value={cfg.plattform} onChange={(v) => set("plattform", v)} options={PLATTFORM} /></Field>
        <Field label="Video-Typ"><Select value={cfg.typ} onChange={(v) => set("typ", v)} options={VIDEO_TYPEN} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Detailtiefe"><Select value={cfg.detail} onChange={(v) => set("detail", v)} options={DETAIL_OPTS} /></Field>
          <Field label="Bildsprache"><Select value={cfg.bild} onChange={(v) => set("bild", v)} options={BILD_OPTS} /></Field>
        </div>

        <Field label="Hook-Ebene (Mehrfachauswahl)">
          <div className="flex flex-wrap gap-2">
            {HOOK_EBENEN.map(({ k, icon: Ic }) => (
              <div key={k} className={`pill ${cfg.ebenen.includes(k) ? "on" : ""}`} onClick={() => toggleEbene(k)}><Ic size={13} />{k.replace(" stark", "")}</div>
            ))}
          </div>
        </Field>

        <Field label="Hook-Archetyp"><Select value={cfg.archetyp} onChange={(v) => set("archetyp", v)} options={HOOK_ARCHETYPEN} /></Field>
        <Field label="Framework"><Select value={cfg.framework} onChange={(v) => set("framework", v)} options={FRAMEWORKS} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Länge"><Select value={cfg.laenge} onChange={(v) => set("laenge", v)} options={LAENGEN} /></Field>
          <Field label="Tonalität"><Select value={cfg.ton} onChange={(v) => set("ton", v)} options={TON} /></Field>
        </div>
        <Field label="CTA-Ziel"><Select value={cfg.cta} onChange={(v) => set("cta", v)} options={CTA_ZIELE} /></Field>
        <Field label="Claim-Intensität"><Select value={cfg.claim} onChange={(v) => set("claim", v)} options={CLAIM_STUFEN} /></Field>

        <label className="flex items-center gap-2" style={{ fontSize: 13, marginBottom: 18, cursor: "pointer" }}>
          <input type="checkbox" checked={cfg.loop} onChange={(e) => set("loop", e.target.checked)} /> Loop am Ende (Ende → Anfang)
        </label>

        <button className="vs-btn" style={{ width: "100%" }} onClick={generate} disabled={busy}>
          {busy ? <><Loader2 size={16} className="animate-spin" /> Generiere…</> : <><Sparkles size={16} /> Skript erzeugen</>}
        </button>
        {err && <p style={{ color: "var(--signal)", fontSize: 12, marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}><AlertTriangle size={13} />{err}</p>}
      </div>

      {/* Ausgabe */}
      <div>
        {!out && !busy && (
          <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <FlaskConical size={40} style={{ margin: "0 auto 14px", color: "var(--line)" }} />
            <p style={{ fontFamily: "Anton", fontSize: 20, color: "var(--ink)", letterSpacing: ".03em" }}>NOCH KEIN SKRIPT</p>
            <p style={{ fontSize: 13 }}>Thema wählen, Parameter setzen, „Skript erzeugen" klicken.</p>
          </div>
        )}
        {busy && <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}><Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--volt)" }} /><p>Verdichte Recherche zu Skript…</p></div>}
        <ScriptOutput s={out} onRegenBeat={regenerateBeat} onOptimize={optimizeScript} />
      </div>
    </div>
  );
}

// ---------- Tab: Markenstimme ----------
function BrandVoice({ brandVoice, setBrandVoice }) {
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

// ---------- Tab: Virale Bibliothek ----------
function Viral({ viral, setViral }) {
  const [link, setLink] = useState("");
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function analyze() {
    if (!transcript.trim()) { setErr("Bitte Transkript oder Beschreibung des Videos einfügen."); return; }
    setBusy(true); setErr("");
    const prompt = `Analysiere dieses virale Short-Form-Video (Nische Sport/Gesundheit). Sprache: Deutsch.
LINK: ${link || "—"}
TRANSKRIPT/BESCHREIBUNG:
${transcript}

Antworte AUSSCHLIESSLICH als reines JSON:
{"hook_ebene":"welche Ebene trug den Hook (visuell/akustisch/textlich/sprachlich)","framework":"erkanntes Skript-Framework","retention_tricks":["...2-4 konkrete Tricks"],"warum_funktioniert":"2 Sätze warum es viral ging","formel":"die wiederverwendbare Hook-Formel in einem Satz"}`;
    try {
      const a = await callClaude(prompt, 1500);
      const next = [{ id: Date.now(), link, ...a }, ...viral];
      setViral(next); await store.set("vsg:viral", next);
      setLink(""); setTranscript("");
    } catch (e) { setErr("Analyse fehlgeschlagen. Bitte erneut versuchen."); }
    setBusy(false);
  }
  async function del(id) { const next = viral.filter((v) => v.id !== id); setViral(next); await store.set("vsg:viral", next); }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-7">
      <div className="vs-panel" style={{ padding: 22, alignSelf: "start" }}>
        <div className="section-head"><Plus size={15} /> Video analysieren</div>
        <Field label="Video-Link (optional)"><input className="vs-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" /></Field>
        <Field label="Transkript / Beschreibung"><textarea className="vs-input" rows={7} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Was wird gesagt/gezeigt? (TikTok/IG lassen sich nicht auto-transkribieren)" /></Field>
        <button className="vs-btn" style={{ width: "100%" }} onClick={analyze} disabled={busy}>{busy ? <><Loader2 size={15} className="animate-spin" /> Analysiere…</> : "Analysieren & speichern"}</button>
        {err && <p style={{ color: "var(--signal)", fontSize: 12, marginTop: 10 }}>{err}</p>}
      </div>
      <div className="space-y-4">
        {viral.length === 0 && <div className="vs-panel" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><Library size={34} style={{ margin: "0 auto 10px", color: "var(--line)" }} /><p>Deine Swipe-File ist noch leer. Analysiere dein erstes virales Video.</p></div>}
        {viral.map((v) => (
          <div key={v.id} className="vs-panel" style={{ padding: 18 }}>
            <div className="flex justify-between items-start">
              <div className="mono-label" style={{ color: "var(--volt)" }}>{v.framework}</div>
              <button className="vs-ghost" onClick={() => del(v.id)} style={{ padding: "4px 8px" }}><Trash2 size={12} /></button>
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 10px" }}>{v.formel}</p>
            <div className="meta-row"><b>Hook-Ebene:</b> {v.hook_ebene}</div>
            <div className="meta-row"><b>Warum es lief:</b> {v.warum_funktioniert}</div>
            <div style={{ marginTop: 8 }} className="meta-row"><b>Retention-Tricks:</b></div>
            <ul style={{ margin: "2px 0 0 16px", padding: 0 }}>{(v.retention_tricks || []).map((t, i) => <li key={i} style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>{t}</li>)}</ul>
            {v.link && <a href={v.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--volt)", marginTop: 8, display: "inline-block" }}>↗ Original ansehen</a>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Grafik-Templates (animiertes SVG, transparenter Hintergrund, 9:16-Region) ----------
// Jede liefert ein in sich stehendes <svg> mit CSS-Keyframes. viewBox 1080x1920 (9:16).
function svgWrap(inner, extraCss = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
<defs>
<style>
@import url('https://fonts.googleapis.com/css2?family=Anton&amp;family=Schibsted+Grotesk:wght@600;700&amp;family=Space+Mono:wght@700&amp;display=swap');
.an{font-family:'Anton',sans-serif;} .gr{font-family:'Schibsted Grotesk',sans-serif;} .mo{font-family:'Space Mono',monospace;}
@keyframes pop{0%{opacity:0;transform:translateY(30px) scale(.92);}100%{opacity:1;transform:translateY(0) scale(1);}}
@keyframes slide{0%{opacity:0;transform:translateX(-60px);}100%{opacity:1;transform:translateX(0);}}
@keyframes count{0%{opacity:0;}100%{opacity:1;}}
@keyframes grow{0%{transform:scaleX(0);}100%{transform:scaleX(1);}}
@keyframes pulse{0%,100%{opacity:.55;}50%{opacity:1;}}
@keyframes dash{0%{stroke-dashoffset:var(--len);}100%{stroke-dashoffset:0;}}
${extraCss}
</style>
</defs>
${inner}
</svg>`;
}

// Text-Karte (Hook-Text / Untertitel / Zitat)
function tplText({ kicker, headline, sub }) {
  const k = kicker || "EINBLENDUNG";
  return svgWrap(`
<g transform="translate(90,760)" style="animation:pop .6s cubic-bezier(.2,.8,.2,1) both;">
  <rect x="0" y="0" width="900" height="${sub ? 420 : 320}" rx="28" fill="#131519" stroke="#262a32" stroke-width="2"/>
  <rect x="0" y="0" width="14" height="${sub ? 420 : 320}" rx="7" fill="#ccff00"/>
  <text x="60" y="92" class="mo" font-size="30" letter-spacing="6" fill="#ccff00">${esc(k)}</text>
  <foreignObject x="58" y="118" width="800" height="240">
    <div xmlns="http://www.w3.org/1999/xhtml" class="an" style="color:#f2f4f3;font-size:72px;line-height:1.04;letter-spacing:.01em;">${esc(headline)}</div>
  </foreignObject>
  ${sub ? `<foreignObject x="60" y="300" width="790" height="100"><div xmlns="http://www.w3.org/1999/xhtml" class="gr" style="color:#8a9099;font-size:32px;line-height:1.25;">${esc(sub)}</div></foreignObject>` : ""}
</g>`);
}

// Stat-Box (Zahl / Prozent / Vorher-Nachher-Balken)
function tplStat({ kicker, value, unit, label, bars }) {
  const barRows = (bars || []).slice(0, 2).map((b, i) => {
    const y = 250 + i * 130;
    const w = Math.max(4, Math.min(100, Number(b.pct) || 0)) * 7.4;
    return `
    <text x="60" y="${y}" class="gr" font-size="30" fill="#8a9099">${esc(b.label)}</text>
    <rect x="60" y="${y + 22}" width="740" height="46" rx="23" fill="#1a1d23"/>
    <rect x="60" y="${y + 22}" width="${w}" height="46" rx="23" fill="${i === 0 ? "#ccff00" : "#ff5a3c"}" style="transform-origin:60px center;animation:grow .9s cubic-bezier(.2,.8,.2,1) ${0.3 + i * 0.2}s both;"/>
    <text x="${60 + w + 18}" y="${y + 55}" class="mo" font-size="30" fill="#f2f4f3" style="animation:count .4s ${0.9 + i * 0.2}s both;">${esc(String(b.pct))}%</text>`;
  }).join("");
  return svgWrap(`
<g transform="translate(90,640)" style="animation:pop .6s cubic-bezier(.2,.8,.2,1) both;">
  <rect x="0" y="0" width="900" height="${bars && bars.length ? 540 : 380}" rx="28" fill="#131519" stroke="#262a32" stroke-width="2"/>
  <text x="60" y="92" class="mo" font-size="30" letter-spacing="6" fill="#ccff00">${esc(kicker || "FAKT")}</text>
  ${!bars || !bars.length ? `
  <text x="60" y="250" class="an" font-size="200" fill="#ccff00" style="animation:count .5s .2s both;">${esc(String(value || ""))}<tspan class="an" font-size="80" fill="#f2f4f3" dx="10">${esc(unit || "")}</tspan></text>
  <foreignObject x="60" y="280" width="790" height="90"><div xmlns="http://www.w3.org/1999/xhtml" class="gr" style="color:#8a9099;font-size:34px;">${esc(label || "")}</div></foreignObject>` : barRows}
</g>`);
}

// Icon/Anatomie mit Pfeil auf Region
function tplIcon({ kicker, label, region }) {
  // einfache, lizenzfreie Körper-Silhouette (stilisiert), Pfeil auf gewählte Region
  const regions = { Knie: [540, 1180], Hüfte: [540, 980], Schulter: [540, 640], Rücken: [620, 820], Wade: [540, 1340], Oberschenkel: [540, 1060], Herz: [600, 720], Sehne: [540, 1260] };
  const [rx, ry] = regions[region] || [540, 1180];
  return svgWrap(`
<g style="animation:pop .6s both;">
  <!-- stilisierte Silhouette -->
  <g fill="#1a1d23" stroke="#2f343d" stroke-width="3">
    <circle cx="540" cy="430" r="80"/>
    <rect x="455" y="520" width="170" height="380" rx="60"/>
    <rect x="470" y="880" width="68" height="420" rx="30"/>
    <rect x="542" y="880" width="68" height="420" rx="30"/>
    <rect x="475" y="1280" width="58" height="320" rx="26"/>
    <rect x="547" y="1280" width="58" height="320" rx="26"/>
    <rect x="395" y="540" width="56" height="330" rx="26"/>
    <rect x="629" y="540" width="56" height="330" rx="26"/>
  </g>
  <!-- Marker auf Region -->
  <circle cx="${rx}" cy="${ry}" r="46" fill="none" stroke="#ccff00" stroke-width="6" style="transform-origin:${rx}px ${ry}px;animation:pulse 1.4s ease-in-out infinite;"/>
  <circle cx="${rx}" cy="${ry}" r="14" fill="#ccff00"/>
  <!-- Pfeil + Label -->
  <line x1="${rx + 250}" y1="${ry - 120}" x2="${rx + 70}" y2="${ry - 20}" stroke="#ccff00" stroke-width="6" stroke-linecap="round" stroke-dasharray="320" style="--len:320;animation:dash .7s ease-out .3s both;"/>
  <g transform="translate(${rx + 230},${ry - 230})" style="animation:slide .6s .5s both;">
    <rect x="0" y="0" width="320" height="120" rx="16" fill="#131519" stroke="#ccff00" stroke-width="2"/>
    <text x="28" y="50" class="mo" font-size="24" letter-spacing="4" fill="#ccff00">${esc(kicker || region || "")}</text>
    <foreignObject x="26" y="58" width="280" height="56"><div xmlns="http://www.w3.org/1999/xhtml" class="an" style="color:#f2f4f3;font-size:40px;line-height:1;">${esc(label || region || "")}</div></foreignObject>
  </g>
</g>`);
}

function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function buildSvg(spec) {
  if (spec.typ === "stat") return tplStat(spec);
  if (spec.typ === "icon") return tplIcon(spec);
  return tplText(spec);
}

// SVG → PNG (transparent) Download
async function downloadPng(svgString, name) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new window.Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 1080, 1920);
  URL.revokeObjectURL(url);
  canvas.toBlob((b) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = (name || "overlay") + ".png"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }, "image/png");
}
function downloadSvg(svgString, name) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = (name || "overlay") + ".svg"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- Tab: Grafiken ----------
function Grafiken({ script }) {
  const [specs, setSpecs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const einblendungen = (script?.body || []).map((b) => ({ beat: b.beat, text: b.einblendung })).filter((e) => e.text);

  async function buildAll() {
    if (!einblendungen.length) return;
    setBusy(true); setErr("");
    const prompt = `Du gestaltest On-Screen-Overlays für ein Short-Form-Video (Sport/Gesundheit, Deutsch). Für jede Einblendung wähle den besten Overlay-Typ und fülle die Felder knapp & wirksam (kurze Texte, große Wirkung).

EINBLENDUNGEN:
${einblendungen.map((e, i) => `${i + 1}. [${e.beat}] ${e.text}`).join("\n")}

Antworte AUSSCHLIESSLICH als reines JSON-Array (keine Fences), ein Objekt pro Einblendung, je nach Typ:
- Text: {"typ":"text","kicker":"kurzes Label (1-2 Worte, GROSS)","headline":"max 6 Worte, knackig","sub":"optional 1 kurzer Satz oder leer"}
- Stat: {"typ":"stat","kicker":"...","value":"Zahl ohne Einheit","unit":"% oder x o.ä.","label":"worauf bezieht sich die Zahl","bars":[{"label":"...","pct":Zahl0-100},{"label":"...","pct":Zahl0-100}] (bars NUR bei Vergleich, sonst weglassen)}
- Icon: {"typ":"icon","kicker":"kurzes Label","label":"1-3 Worte","region":"eine von: Knie,Hüfte,Schulter,Rücken,Wade,Oberschenkel,Herz,Sehne"}
Wähle Icon nur wenn es klar um eine Körperregion geht, Stat bei Zahlen/Vergleichen, sonst Text.`;
    try {
      const arr = await callClaude(prompt, 2500);
      setSpecs(Array.isArray(arr) ? arr.map((s, i) => ({ ...s, beat: einblendungen[i]?.beat })) : []);
    } catch (e) { setErr("Konnte Grafiken nicht erzeugen. Bitte erneut versuchen."); }
    setBusy(false);
  }

  function updateSpec(i, patch) { setSpecs((p) => p.map((s, j) => (j === i ? { ...s, ...patch } : s))); }

  if (!script) {
    return <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
      <Image size={40} style={{ margin: "0 auto 14px", color: "var(--line)" }} />
      <p style={{ fontFamily: "Anton", fontSize: 20, color: "var(--ink)", letterSpacing: ".03em" }}>KEIN SKRIPT GELADEN</p>
      <p style={{ fontSize: 13 }}>Erzeuge zuerst im Generator ein Skript – die Einblendungen erscheinen dann hier als Grafiken.</p>
    </div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <p style={{ color: "var(--muted)", fontSize: 13, margin: 0, maxWidth: 560 }}>
          {einblendungen.length} Einblendung(en) aus deinem Skript. Erzeuge animierte Overlays (transparenter Hintergrund) und lade sie als PNG oder SVG für den Schnitt.
        </p>
        <button className="vs-btn" onClick={buildAll} disabled={busy || !einblendungen.length}>
          {busy ? <><Loader2 size={16} className="animate-spin" /> Erzeuge…</> : <><Sparkles size={16} /> Grafiken erzeugen</>}
        </button>
      </div>
      {err && <p style={{ color: "var(--signal)", fontSize: 12, marginBottom: 12 }}>{err}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {specs.map((spec, i) => {
          const svg = buildSvg(spec);
          return (
            <div key={i} className="vs-panel" style={{ padding: 16 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="mono-label" style={{ marginBottom: 0, color: "var(--volt)" }}>{spec.beat || `Overlay ${i + 1}`} · {spec.typ}</div>
                <div className="flex gap-2">
                  <button className="vs-ghost" onClick={() => downloadPng(svg, `overlay-${i + 1}`)}><Download size={12} /> PNG</button>
                  <button className="vs-ghost" onClick={() => downloadSvg(svg, `overlay-${i + 1}`)}><Download size={12} /> SVG</button>
                </div>
              </div>
              <div style={{ background: "repeating-conic-gradient(#16181d 0% 25%, #1c1f25 0% 50%) 50% / 28px 28px", borderRadius: 10, overflow: "hidden", aspectRatio: "9/16", maxHeight: 440, margin: "0 auto", width: "fit-content" }}>
                <div style={{ height: "100%", aspectRatio: "9/16" }} dangerouslySetInnerHTML={{ __html: svg.replace('width="1080" height="1920"', 'width="100%" height="100%"') }} />
              </div>
              <div className="mt-3 space-y-2">
                {"headline" in spec && <input className="vs-input" value={spec.headline || ""} onChange={(e) => updateSpec(i, { headline: e.target.value })} placeholder="Headline" />}
                {"value" in spec && <div className="flex gap-2"><input className="vs-input" value={spec.value || ""} onChange={(e) => updateSpec(i, { value: e.target.value })} placeholder="Wert" /><input className="vs-input" value={spec.unit || ""} onChange={(e) => updateSpec(i, { unit: e.target.value })} placeholder="Einheit" style={{ maxWidth: 90 }} /></div>}
                {spec.typ === "icon" && (
                  <select className="vs-input" value={spec.region || "Knie"} onChange={(e) => updateSpec(i, { region: e.target.value })}>
                    {["Knie", "Hüfte", "Schulter", "Rücken", "Wade", "Oberschenkel", "Herz", "Sehne"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {specs.length > 0 && (
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 18, fontFamily: "Space Mono", lineHeight: 1.5 }}>
          Hinweis: PNG-Export ist ein statisches Standbild mit Transparenz. Die Animation siehst du in der Vorschau; echte bewegte Videodateien (MP4/WebM mit Alpha) rendert die spätere lokale App.
        </p>
      )}
    </div>
  );
}
