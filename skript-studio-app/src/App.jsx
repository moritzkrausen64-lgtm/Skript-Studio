import React, { useState, useEffect, useRef } from "react";
import { Zap, Film, Mic, Eye, Type, Library, User, Plus, Trash2, Loader2, Sparkles, TrendingUp, AlertTriangle, Copy, Check, FlaskConical, RefreshCw, Wand2, Image, Download, FolderOpen, BookMarked, Save, Play, Pause, SkipBack, Search, Layers, Scissors, CheckCircle, XCircle, Clock } from "lucide-react";
import { Player } from "@remotion/player";
import { TextCard } from "./remotion/compositions/TextCard";
import { StatCard } from "./remotion/compositions/StatCard";
import { BodyMarker } from "./remotion/compositions/BodyMarker";
import { HeartPump } from "./remotion/compositions/HeartPump";
import { Mitochondria } from "./remotion/compositions/Mitochondria";
import { KneeJoint } from "./remotion/compositions/KneeJoint";
import { OrganAnim } from "./remotion/compositions/OrganAnim";
import { LIBRARY, CATEGORIES, searchLibrary, matchToLibrary } from "./remotion/library";

// ---------- Persistenz: lokaler Server (JSON-Dateien im /data-Ordner) ----------
const store = {
  async get(key) {
    try {
      const res = await fetch(`/api/store/${encodeURIComponent(key)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.value ?? null;
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      await fetch(`/api/store/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
    } catch (e) {}
  },
};

// ---------- API: laeuft ueber den lokalen Server (Key bleibt serverseitig) ----------
async function callClaude(prompt, maxTokens = 3000) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "API-Aufruf fehlgeschlagen.");
  }
  const data = await res.json();
  const text = data.text || "";
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

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

// ---------- Tab: Gespeicherte Projekte ----------
function Projekte({ savedProjects, onLoad, onDelete }) {
  if (savedProjects.length === 0) {
    return (
      <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
        <BookMarked size={40} style={{ margin: "0 auto 14px", color: "var(--line)" }} />
        <p style={{ fontFamily: "Anton", fontSize: 20, color: "var(--ink)", letterSpacing: ".03em" }}>NOCH KEINE PROJEKTE</p>
        <p style={{ fontSize: 13 }}>Generiere ein Skript im Generator und klicke „Als Projekt speichern".</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <p style={{ fontSize: 13, color: "var(--muted)", fontFamily: "Space Mono" }}>{savedProjects.length} gespeicherte{savedProjects.length === 1 ? "s" : ""} Projekt{savedProjects.length !== 1 ? "e" : ""}</p>
      {savedProjects.map((p) => (
        <div key={p.id} className="vs-panel" style={{ padding: 20 }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "Anton", fontSize: 17, letterSpacing: ".03em", marginBottom: 4 }}>{p.topicName}</div>
              <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
                {p.savedAt} · {p.cfg?.plattform} · {p.cfg?.typ} · {p.cfg?.laenge}
              </div>
              {p.out?.hooks?.[0] && (
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
                  <span style={{ color: "var(--volt)", fontWeight: 700 }}>Hook: </span>
                  „{p.out.hooks[0].gesprochen}"
                </div>
              )}
              {p.out?.rating?.gesamt != null && (
                <div style={{ marginTop: 8, fontFamily: "Space Mono", fontSize: 11, color: p.out.rating.gesamt >= 70 ? "var(--volt)" : p.out.rating.gesamt >= 45 ? "#ffd84d" : "var(--signal)" }}>
                  Reichweiten-Score: {p.out.rating.gesamt}/100
                </div>
              )}
            </div>
            <div className="flex gap-2" style={{ flexShrink: 0 }}>
              <button className="vs-btn" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => onLoad(p)}>
                <RefreshCw size={13} /> Laden
              </button>
              <button className="vs-ghost" style={{ color: "var(--signal)", borderColor: "var(--signal)" }} onClick={() => onDelete(p.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Tab: Schnitt ----------
function Schnitt({ lastScript, onTimedAnimations, onTranscript, timedAnimations = [], onSwitchTab }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [step, setStep] = useState("upload");   // upload | transcribe | animations | compose | done
  const [transcript, setTranscript] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [err, setErr] = useState("");
  const [format, setFormat] = useState("9:16");
  const [position, setPosition] = useState("bottom");
  const fileInputRef = useRef(null);

  // State für generierte Animationen (pro Index)
  const [animSpecs, setAnimSpecs] = useState({});       // { [i]: specText }
  const [animGenerating, setAnimGenerating] = useState({}); // { [i]: bool }
  const [animGenerated, setAnimGenerated] = useState({});   // { [i]: { componentName, component, durationFrames } }
  const [specOpen, setSpecOpen] = useState({});         // { [i]: bool } — Spec-Accordion

  // ── LocalStorage-Persistenz ───────────────────────────────────────────────
  const LS_KEY = "schnitt-state-v1";

  // Beim Mounten: gespeicherten State laden
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (saved.selectedVideo) setSelectedVideo(saved.selectedVideo);
      if (saved.format) setFormat(saved.format);
      if (saved.position) setPosition(saved.position);
      if (saved.animSpecs) setAnimSpecs(saved.animSpecs);
      if (saved.transcript) {
        setTranscript(saved.transcript);
        onTranscript?.(saved.transcript);
      }
      if (saved.step && saved.step !== "upload") setStep(saved.step);
      if (saved.timedAnimations?.length) {
        onTimedAnimations?.(saved.timedAnimations, saved.format || "9:16", saved.position || "bottom");
      }
      // Generierte Komponenten neu importieren
      if (saved.generatedNames) {
        Object.entries(saved.generatedNames).forEach(async ([idx, { componentName, durationFrames }]) => {
          try {
            const mod = await import(/* @vite-ignore */ `/src/remotion/compositions/${componentName}.jsx?t=${Date.now()}`);
            const comp = mod[componentName] || mod.default;
            if (comp) {
              setAnimGenerated(p => ({ ...p, [idx]: { componentName, component: comp, durationFrames } }));
            }
          } catch (e) { /* Datei nicht mehr vorhanden */ }
        });
      }
    } catch (e) { /* Ignore parse errors */ }
  }, []);

  // Speichern wenn relevanter State sich ändert
  useEffect(() => {
    if (!selectedVideo && !transcript) return; // Nichts zu speichern
    try {
      const generatedNames = {};
      Object.entries(animGenerated).forEach(([idx, v]) => {
        if (v?.componentName) generatedNames[idx] = { componentName: v.componentName, durationFrames: v.durationFrames };
      });
      localStorage.setItem(LS_KEY, JSON.stringify({
        selectedVideo, step, format, position, animSpecs,
        transcript, timedAnimations, generatedNames,
      }));
    } catch (e) { /* Ignore */ }
  }, [selectedVideo, step, format, position, animSpecs, transcript, timedAnimations, animGenerated]);

  // Spec-Template: vorausgefüllter Prompt aus Animations-Daten + Transkript-Kontext
  function buildAnimSpec(anim, snippetText) {
    const w = format === "9:16" ? 1080 : 1920;
    const h = format === "9:16" ? 1920 : 1080;
    const dur = 10;
    const compName = `GenAnim_${(anim.beat || "Custom").replace(/[^a-zA-Z0-9]/g, "")}`;
    return `Create a Remotion React animation (${w}x${h}px, ${format}, 30fps, ${dur} seconds)
explaining ${anim.beat} — educational + social media style, 2D flat illustration.

---

PFLICHT-STYLEVORGABEN (nicht verhandelbar)

SCHRIFT
- Haupttext (Headlines): min. 60px, font-weight 800
- Sekundärtext (Labels): min. 48px, font-weight 700
- Kein font-weight unter 600
- Max. 6 Wörter pro Zeile, max. 2 Zeilen gleichzeitig sichtbar

KONTRAST & LESBARKEIT
- Jeder Text benötigt EINES:
    a) textShadow: "0 3px 10px rgba(0,0,0,0.9)"   ← Standard für freistehenden Text
    b) Pill-Hintergrund: background rgba(0,0,0,0.55), borderRadius 8px, padding 6px 14px
    c) WebkitTextStroke "2px #000000"   ← nur für große Headlines
- Weißer Text (#FFFFFF) Standard — kein Grau auf dunklem BG

SAFE ZONE
- Kein Element innerhalb 54px vom Rand
- YouTube-Bereiche freihalten: oben 80px, unten 200px

ANIMATION
- Alle Einblendungen: opacity 0→1 über min. 10 Frames (kein hartes Einblenden)
- Kein Text unter 1,5s (45 Frames) sichtbar
- Vibration/Pulse NUR auf grafischen Elementen, nie auf Text

---

THEMA: ${anim.beat}
KERNBOTSCHAFT: ${anim.einblendung || ""}
VIDEO-KONTEXT: "${snippetText}"
${anim.reason ? `ANIMATIONS-BEGRÜNDUNG: ${anim.reason}` : ""}

---

ANIMATIONS-AUFBAU (${dur}s, ${format}):

Scene 1 | 0:00–2:00 | Hook
- Hintergrund #1A1A2E (dunkles Navy)
- Haupt-Visual blendet aus Mitte ein: scale spring({ damping: 14, stiffness: 120 })
- Headline: "${anim.beat}" — 72px, font-weight 800, textShadow "0 3px 12px rgba(0,0,0,1)"

Scene 2 | 2:00–5:00 | Erklärung
- Visuelles Detail expandiert / zeigt Mechanismus
- Labels erscheinen sequenziell (+0.3s je Label) mit Pill-Hintergrund
- Kernbotschaft als Overlay: "${anim.einblendung || anim.beat}"

Scene 3 | 5:00–8:00 | Vertiefung
- Zoom-In auf den relevanten Bereich / Mechanismus
- Animierte Grafik (SVG inline) zeigt das Thema in Detail

Scene 4 | 8:00–10:00 | Outro
- Zoom zurück zur Gesamtansicht
- 2–3 Key-Takeaways blenden nacheinander ein (je +0.4s)
- Fade to #1A1A2E

---

REMOTION TECHNISCHE UMSETZUNG
- useCurrentFrame() + interpolate() für alle Übergänge
- spring({ frame, fps, config: { damping: 14, stiffness: 120 } }) für Reveals
- <AbsoluteFill> mit z-index-Layering: BG (0) → Grafik (1) → Text (2)
- Alle SVG-Elemente inline als JSX — keine externen Bild-Imports
- Named Export: export function ${compName}({ format = "${format}", position = "bottom" })`;
  }

  // Videos aus dem videos/-Ordner laden
  useEffect(() => {
    fetch("/api/videos").then((r) => r.json()).then((d) => setVideos(d.files || [])).catch(() => {});
  }, []);

  // Video hochladen
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(""); setProgress("Lade hoch…");
    const form = new FormData();
    form.append("video", file);
    try {
      const r = await fetch("/api/upload-video", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSelectedVideo(d.filename);
      setVideos((v) => [...new Set([...v, d.filename])]);
      setProgress("");
      setStep("transcribe");
    } catch (e) { setErr(e.message); setProgress(""); }
  }

  // Transkribieren → direkt Animations-Vorschläge generieren
  async function handleTranscribe() {
    if (!selectedVideo) return;
    setBusy(true); setErr("");
    try {
      // Schritt 1: Transkription
      setProgress("Transkribiere… (kann 5–15 Min. dauern)");
      const r = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedVideo }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setTranscript(d);
      onTranscript?.(d);

      // Schritt 2: Claude analysiert Transkript und schlägt Animationen vor
      setProgress("Analysiere Transkript und wähle passende Animationen…");
      const keepSegments = [{ start: 0, end: d.duration }]; // ganzes Video, kein Schnitt
      const r2 = await fetch("/api/suggest-animations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments: d.segments, words: d.words, keepSegments, duration: d.duration }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error);

      // Library-Fallback: falls kein libraryId von Claude, lokal matchen
      const enriched = (d2.beatTimings || []).map((bt) => {
        const libMatch = !bt.libraryId ? matchToLibrary((bt.einblendung || "") + " " + (bt.beat || "")) : null;
        return { ...bt, libraryId: bt.libraryId || libMatch?.id || null };
      });
      onTimedAnimations?.(enriched, format, position);
      setStep("animations");
    } catch (e) { setErr(e.message); }
    setBusy(false); setProgress("");
  }

  // Finales Video rendern — ganzes Video, kein Schnitt
  async function handleCompose() {
    setBusy(true); setErr(""); setProgress("Rendere Video… (kann mehrere Minuten dauern)");
    try {
      const keepSegments = [{ start: 0, end: transcript.duration }];
      const r = await fetch("/api/compose-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoFile: selectedVideo, keepSegments, beatTimings: timedAnimations.filter(a => a.matched !== false), format, position }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      setProgress("Download…");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "video-final.mp4";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStep("done");
    } catch (e) { setErr(e.message); }
    setBusy(false); setProgress("");
  }

  // ── Schritt-Anzeige ────────────────────────────────────────────────────────
  const STEPS = ["upload", "transcribe", "animations", "compose", "done"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div>
      {/* Fortschritts-Leiste */}
      <div className="flex gap-3 mb-7 flex-wrap">
        {[["upload","① Upload"],["transcribe","② Transkription"],["animations","③ Animationen"],["compose","④ Render"],["done","✓ Fertig"]].map(([s, lbl], i) => (
          <div key={s} style={{ fontFamily: "Space Mono", fontSize: 11, padding: "6px 14px", borderRadius: 20,
            background: s === step ? "var(--volt)" : i < stepIdx ? "var(--panel-2)" : "var(--panel)",
            color: s === step ? "var(--bg)" : i < stepIdx ? "var(--volt)" : "var(--muted)",
            border: `1px solid ${s === step ? "var(--volt)" : i < stepIdx ? "var(--volt)44" : "var(--line)"}`,
          }}>{lbl}</div>
        ))}
      </div>

      {err && <p style={{ color: "var(--signal)", fontSize: 12, marginBottom: 16, fontFamily: "Space Mono" }}>⚠ {err}</p>}
      {progress && <p style={{ color: "var(--volt)", fontSize: 12, marginBottom: 16, fontFamily: "Space Mono" }}>⏳ {progress}</p>}

      {/* ── SCHRITT 1: Upload ────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="vs-panel" style={{ padding: 32, maxWidth: 640 }}>
          <div className="section-head"><Scissors size={15} /> Video hochladen</div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>
            Lade dein Video hoch. Es wird lokal transkribiert — Claude schlägt dann passende Animationen vor.
          </p>

          {/* Vorhandene Videos */}
          {videos.length > 0 && (
            <div className="mb-4">
              <span className="mono-label">Oder vorhandenes Video wählen</span>
              <div className="flex gap-2 flex-wrap">
                {videos.map((v) => (
                  <button key={v} className="vs-ghost" onClick={() => { setSelectedVideo(v); setStep("transcribe"); }}
                    style={{ fontSize: 11 }}>{v}</button>
                ))}
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleUpload} />
          <button className="vs-btn" onClick={() => fileInputRef.current?.click()} disabled={busy}>
            <Download size={16} /> Video auswählen & hochladen
          </button>

          {/* Format */}
          <div className="mt-3 flex gap-2">
            {["9:16", "16:9"].map((f) => (
              <button key={f} onClick={() => setFormat(f)} style={{
                fontFamily: "Space Mono", fontSize: 11, padding: "5px 12px", borderRadius: 16,
                border: `1px solid ${format === f ? "var(--volt)" : "var(--line)"}`,
                background: format === f ? "var(--volt)" : "var(--panel-2)",
                color: format === f ? "var(--bg)" : "var(--muted)", cursor: "pointer",
              }}>{f}</button>
            ))}
            {["bottom", "top"].map((p) => (
              <button key={p} onClick={() => setPosition(p)} style={{
                fontFamily: "Space Mono", fontSize: 11, padding: "5px 12px", borderRadius: 16,
                border: `1px solid ${position === p ? "var(--volt)" : "var(--line)"}`,
                background: position === p ? "var(--volt)" : "var(--panel-2)",
                color: position === p ? "var(--bg)" : "var(--muted)", cursor: "pointer",
              }}>{p === "bottom" ? "↓ Unten" : "↑ Oben"}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── SCHRITT 2: Transkription ─────────────────────────────────────── */}
      {step === "transcribe" && (
        <div className="vs-panel" style={{ padding: 32, maxWidth: 640 }}>
          <div className="section-head"><Mic size={15} /> Transkription + Animations-Analyse</div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            Video: <b style={{ color: "var(--ink)" }}>{selectedVideo}</b>
          </p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 16, fontFamily: "Space Mono" }}>
            Whisper transkribiert dein Video lokal → Claude analysiert den Inhalt und schlägt passende Animationen vor.
          </p>
          <button className="vs-btn" onClick={handleTranscribe} disabled={busy}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> Läuft…</> : <><Mic size={16} /> Starten</>}
          </button>
          <button className="vs-ghost" onClick={() => setStep("upload")} style={{ marginLeft: 12, fontSize: 12 }}>
            ← Anderes Video
          </button>
        </div>
      )}

      {/* ── SCHRITT 3: Animations-Review & Edit ──────────────────────────── */}
      {step === "animations" && (() => {
        // Hilfsfunktion: einzelne Animation updaten und in App-State schreiben
        function updateAnim(i, patch) {
          onTimedAnimations?.(timedAnimations.map((a, j) => j === i ? { ...a, ...patch } : a), format, position);
        }
        function updateAnimProps(i, propsPatch) {
          onTimedAnimations?.(timedAnimations.map((a, j) => j === i ? { ...a, props: { ...(a.props || {}), ...propsPatch } } : a), format, position);
        }
        // Transkript-Kontext um einen Zeitstempel herum (±3s)
        function transcriptSnippet(startTime) {
          if (!transcript?.segments) return "";
          return transcript.segments
            .filter((s) => s.start >= (startTime - 3) && s.end <= (startTime + 5))
            .map((s) => s.text).join(" ").trim();
        }
        // Props-Felder je nach Animations-Typ
        function PropsFields({ anim, i }) {
          const id = anim.libraryId || "";
          const p = anim.props || {};
          return (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {/* Label — für alle Animationen */}
              <label style={{ flex: "1 1 160px" }}>
                <span className="mono-label" style={{ marginBottom: 4 }}>Label (in Animation)</span>
                <input className="vs-input" value={p.label || ""} style={{ fontSize: 12 }}
                  placeholder="LABEL CAPS"
                  onChange={(e) => updateAnimProps(i, { label: e.target.value.toUpperCase() })} />
              </label>
              {/* BPM — nur heart-pump */}
              {id === "heart-pump" && (
                <label style={{ flex: "0 1 100px" }}>
                  <span className="mono-label" style={{ marginBottom: 4 }}>BPM</span>
                  <input className="vs-input" type="number" min={40} max={220} value={p.bpm ?? 72} style={{ fontSize: 12 }}
                    onChange={(e) => updateAnimProps(i, { bpm: Number(e.target.value) })} />
                </label>
              )}
              {/* Speed — nur knee-joint */}
              {id === "knee-joint" && (
                <label style={{ flex: "0 1 110px" }}>
                  <span className="mono-label" style={{ marginBottom: 4 }}>Speed (0.5–2)</span>
                  <input className="vs-input" type="number" min={0.5} max={2} step={0.1} value={p.speed ?? 1} style={{ fontSize: 12 }}
                    onChange={(e) => updateAnimProps(i, { speed: Number(e.target.value) })} />
                </label>
              )}
              {/* Kicker — organ-* */}
              {id.startsWith("organ-") && (
                <label style={{ flex: "0 1 140px" }}>
                  <span className="mono-label" style={{ marginBottom: 4 }}>Kicker</span>
                  <input className="vs-input" value={p.kicker || ""} style={{ fontSize: 12 }}
                    placeholder="ANATOMIE"
                    onChange={(e) => updateAnimProps(i, { kicker: e.target.value.toUpperCase() })} />
                </label>
              )}
            </div>
          );
        }

        const freigegebene = timedAnimations.filter(a => a.matched !== false).length;

        return (
          <div>
            {/* Header-Leiste */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <p style={{ fontFamily: "Anton", fontSize: 20, marginBottom: 4 }}>
                  {timedAnimations.length === 0 ? "Keine Animationen gefunden" : `${timedAnimations.length} Animations-Vorschläge — bearbeiten & freigeben`}
                </p>
                <p style={{ color: "var(--muted)", fontSize: 12, fontFamily: "Space Mono" }}>
                  {freigegebene} freigegeben · {timedAnimations.length - freigegebene} verworfen
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="vs-ghost" style={{ fontSize: 11 }}
                  onClick={() => onTimedAnimations?.(timedAnimations.map(a => ({ ...a, matched: true })), format, position)}>
                  Alle freigeben
                </button>
                <button className="vs-btn" onClick={() => setStep("compose")} style={{ fontSize: 13, padding: "10px 18px" }}>
                  Weiter zum Rendern →
                </button>
              </div>
            </div>

            {/* Transkript kompakt (scrollbar) */}
            <div className="vs-panel" style={{ padding: 14, marginBottom: 20 }}>
              <div className="flex items-center gap-3 mb-2">
                <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--volt)", letterSpacing: "0.1em" }}>TRANSKRIPT</span>
                <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--muted)" }}>
                  {transcript?.duration?.toFixed(1)}s · {transcript?.words?.length} Wörter
                </span>
              </div>
              <div style={{ maxHeight: 80, overflowY: "auto", fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
                {transcript?.segments?.map((s, si) => (
                  <span key={si}>
                    <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "rgba(204,255,0,0.5)", marginRight: 3 }}>
                      [{s.start.toFixed(1)}s]
                    </span>
                    {s.text}{" "}
                  </span>
                ))}
              </div>
            </div>

            {/* Keine Animationen */}
            {timedAnimations.length === 0 && (
              <div className="vs-panel" style={{ padding: 32, textAlign: "center" }}>
                <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
                  Claude hat keine passenden Animationen im Transkript gefunden.
                </p>
                <button className="vs-btn" onClick={() => setStep("compose")} style={{ fontSize: 12, padding: "8px 16px" }}>
                  Ohne Animationen weiter →
                </button>
              </div>
            )}

            {/* Karten */}
            <div className="space-y-4">
              {timedAnimations.map((anim, i) => {
                const isFreigegeben = anim.matched !== false;
                const snippet = transcriptSnippet(anim.startTime ?? 0);
                return (
                  <div key={i} className="vs-panel" style={{
                    padding: 20,
                    borderColor: isFreigegeben ? "var(--volt)" : "var(--line)",
                    opacity: isFreigegeben ? 1 : 0.5,
                  }}>
                    {/* Card-Header */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: "Space Mono", fontSize: 13, color: "var(--volt)", fontWeight: 700 }}>
                          @{(anim.startTime ?? 0).toFixed(1)}s
                        </span>
                        <span style={{ fontFamily: "Space Mono", fontSize: 9, padding: "3px 9px", borderRadius: 8,
                          background: "rgba(204,255,0,0.12)", border: "1px solid rgba(204,255,0,0.3)", color: "var(--volt)" }}>
                          {anim.libraryId || "kein Typ"}
                        </span>
                        {anim.confidence && (
                          <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "var(--muted)" }}>
                            {anim.confidence} Konfidenz
                          </span>
                        )}
                      </div>
                      {/* Freigeben / Verwerfen */}
                      <div className="flex gap-2">
                        <button onClick={() => updateAnim(i, { matched: false })}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "none",
                            border: `2px solid ${!isFreigegeben ? "var(--signal)" : "var(--line)"}`,
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                            color: !isFreigegeben ? "var(--signal)" : "var(--muted)",
                            fontFamily: "Space Mono", fontSize: 11 }}>
                          <XCircle size={13} /> Verwerfen
                        </button>
                        <button onClick={() => updateAnim(i, { matched: true })}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "none",
                            border: `2px solid ${isFreigegeben ? "var(--volt)" : "var(--line)"}`,
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                            color: isFreigegeben ? "var(--volt)" : "var(--muted)",
                            fontFamily: "Space Mono", fontSize: 11 }}>
                          <CheckCircle size={13} /> Freigeben
                        </button>
                      </div>
                    </div>

                    {/* Transkript-Kontext */}
                    {snippet && (
                      <div style={{ padding: "8px 12px", background: "var(--panel-2)", borderRadius: 8,
                        marginBottom: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6,
                        borderLeft: "3px solid rgba(204,255,0,0.4)" }}>
                        <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "var(--volt)", display: "block", marginBottom: 4 }}>
                          TRANSKRIPT UM {(anim.startTime ?? 0).toFixed(1)}s
                        </span>
                        „{snippet}"
                      </div>
                    )}

                    {/* Grund von Claude */}
                    {anim.reason && (
                      <p style={{ fontSize: 11, color: "var(--muted)", fontFamily: "Space Mono",
                        marginBottom: 14, padding: "6px 10px", background: "var(--panel-2)",
                        borderRadius: 6, opacity: 0.8 }}>
                        ↳ {anim.reason}
                      </p>
                    )}

                    {/* Spec / Prompt — Accordion */}
                    <div style={{ marginBottom: 14 }}>
                      <button
                        onClick={() => {
                          const open = !specOpen[i];
                          setSpecOpen(p => ({ ...p, [i]: open }));
                          // Spec beim ersten Öffnen vorausfüllen
                          if (open && !animSpecs[i]) {
                            const snippet = transcriptSnippet(anim.startTime ?? 0);
                            setAnimSpecs(p => ({ ...p, [i]: buildAnimSpec(anim, snippet) }));
                          }
                        }}
                        style={{ fontFamily: "Space Mono", fontSize: 10, padding: "5px 12px", borderRadius: 8,
                          background: specOpen[i] ? "rgba(204,255,0,0.12)" : "var(--panel-2)",
                          border: `1px solid ${specOpen[i] ? "rgba(204,255,0,0.4)" : "var(--line)"}`,
                          color: specOpen[i] ? "var(--volt)" : "var(--muted)", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                        {specOpen[i] ? "▼" : "▶"} ANIMATIONS-PROMPT bearbeiten & generieren
                      </button>

                      {specOpen[i] && (
                        <div style={{ marginTop: 10 }}>
                          <textarea
                            value={animSpecs[i] || ""}
                            onChange={(e) => setAnimSpecs(p => ({ ...p, [i]: e.target.value }))}
                            style={{ width: "100%", minHeight: 340, background: "var(--panel-2)",
                              border: "1px solid var(--line)", borderRadius: 8, padding: 12,
                              color: "var(--ink)", fontFamily: "Space Mono", fontSize: 11,
                              lineHeight: 1.6, resize: "vertical", outline: "none" }}
                            placeholder="Spec wird beim ersten Öffnen vorausgefüllt…"
                          />
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <button
                              className="vs-btn"
                              disabled={animGenerating[i] || !animSpecs[i]}
                              onClick={async () => {
                                setAnimGenerating(p => ({ ...p, [i]: true }));
                                try {
                                  const compName = `GenAnim${i}_${Date.now()}`;
                                  const r = await fetch("/api/generate-animation", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ spec: animSpecs[i], componentName: compName }),
                                  });
                                  const d = await r.json();
                                  if (!r.ok) throw new Error(d.error);
                                  // Dynamisch importieren (Vite HMR)
                                  const mod = await import(/* @vite-ignore */ `/src/remotion/compositions/${d.componentName}.jsx?t=${Date.now()}`);
                                  const comp = mod[d.componentName] || mod.default;
                                  setAnimGenerated(p => ({ ...p, [i]: { componentName: d.componentName, component: comp, durationFrames: d.durationFrames } }));
                                  // timedAnimation mit neuem Typ aktualisieren
                                  updateAnim(i, { generatedComponentName: d.componentName });
                                } catch (e) {
                                  alert("Fehler bei Generierung: " + e.message);
                                }
                                setAnimGenerating(p => ({ ...p, [i]: false }));
                              }}
                              style={{ fontSize: 13, padding: "10px 18px" }}>
                              {animGenerating[i]
                                ? <><Loader2 size={14} className="animate-spin" /> Generiert…</>
                                : <><Sparkles size={14} /> Animation generieren</>}
                            </button>
                            {animGenerated[i] && (
                              <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--volt)" }}>
                                ✓ {animGenerated[i].componentName} generiert
                              </span>
                            )}
                          </div>

                          {/* Mini-Player nach Generierung */}
                          {animGenerated[i]?.component && (
                            <div style={{ marginTop: 14, borderRadius: 10, overflow: "hidden",
                              border: "1px solid rgba(204,255,0,0.3)", maxWidth: 160 }}>
                              <Player
                                component={animGenerated[i].component}
                                durationInFrames={animGenerated[i].durationFrames}
                                compositionWidth={1080}
                                compositionHeight={1920}
                                fps={30}
                                inputProps={{ format, position }}
                                initialFrame={Math.floor(animGenerated[i].durationFrames * 0.2)}
                                style={{ width: 160, height: 284, display: "block" }}
                                loop
                                controls
                                acknowledgeRemotionLicense
                              />
                              <div style={{ padding: "6px 10px", background: "rgba(204,255,0,0.08)",
                                fontFamily: "Space Mono", fontSize: 9, color: "var(--volt)" }}>
                                ◆ PREVIEW — {animGenerated[i].durationFrames / 30}s
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Editierbare Felder */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {/* Beat */}
                      <label style={{ flex: "1 1 160px" }}>
                        <span className="mono-label" style={{ marginBottom: 4 }}>Beat / Titel</span>
                        <input className="vs-input" value={anim.beat || ""} style={{ fontSize: 12 }}
                          placeholder="Beat-Name"
                          onChange={(e) => updateAnim(i, { beat: e.target.value })} />
                      </label>
                      {/* Einblendung */}
                      <label style={{ flex: "2 1 220px" }}>
                        <span className="mono-label" style={{ marginBottom: 4 }}>Einblendung (sieht der Zuschauer)</span>
                        <input className="vs-input" value={anim.einblendung || ""} style={{ fontSize: 12 }}
                          placeholder="max. 5 Wörter"
                          onChange={(e) => updateAnim(i, { einblendung: e.target.value })} />
                      </label>
                      {/* Timestamp */}
                      <label style={{ flex: "0 1 90px" }}>
                        <span className="mono-label" style={{ marginBottom: 4 }}>Zeit (s)</span>
                        <input className="vs-input" type="number" min={0} step={0.1}
                          value={anim.startTime ?? 0} style={{ fontSize: 12 }}
                          onChange={(e) => updateAnim(i, { startTime: Number(e.target.value) })} />
                      </label>
                      {/* Animation-Typ */}
                      <label style={{ flex: "1 1 160px" }}>
                        <span className="mono-label" style={{ marginBottom: 4 }}>Animation</span>
                        <select className="vs-input" value={anim.libraryId || ""} style={{ fontSize: 12 }}
                          onChange={(e) => updateAnim(i, { libraryId: e.target.value || null })}>
                          <option value="">— kein Typ —</option>
                          {LIBRARY.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </label>
                    </div>

                    {/* Props je nach Animations-Typ */}
                    {anim.libraryId && <PropsFields anim={anim} i={i} />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── SCHRITT 5: Compose ───────────────────────────────────────────── */}
      {step === "compose" && (
        <div style={{ maxWidth: 860 }}>

          {/* ── Transkript ─────────────────────────────────────────────────── */}
          <div className="vs-panel" style={{ padding: 20, marginBottom: 16 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--volt)", letterSpacing: "0.1em" }}>◆ TRANSKRIPT</span>
              <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--muted)" }}>
                {transcript?.duration?.toFixed(1)}s · {transcript?.words?.length} Wörter · ungekürzt
              </span>
            </div>
            <div style={{ maxHeight: 120, overflowY: "auto", fontSize: 13, color: "var(--muted)", lineHeight: 1.6,
              padding: "8px 12px", background: "var(--panel-2)", borderRadius: 8, fontFamily: "inherit" }}>
              {transcript?.segments?.map((s, i) => (
                <span key={i}>
                  <span style={{ fontFamily: "Space Mono", fontSize: 10, color: "rgba(204,255,0,0.44)", marginRight: 4 }}>
                    [{s.start.toFixed(1)}s]
                  </span>
                  {s.text}{" "}
                </span>
              ))}
            </div>
          </div>

          {/* ── Animationen ───────────────────────────────────────────────── */}
          <div className="vs-panel" style={{ padding: 20, marginBottom: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--volt)", letterSpacing: "0.1em" }}>◆ ANIMATIONEN</span>
              <button onClick={() => onSwitchTab?.("grafik")} style={{ fontFamily: "Space Mono", fontSize: 10,
                padding: "4px 12px", borderRadius: 10, background: "rgba(204,255,0,0.1)",
                border: "1px solid rgba(204,255,0,0.3)", color: "var(--volt)", cursor: "pointer" }}>
                → In Grafiken ansehen & anpassen
              </button>
            </div>

            {/* Die aktuellen timedAnimations aus App-State */}
            {timedAnimations.filter(b => b.matched).length === 0 ? (
              <div>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                  {lastScript ? "Keine Animationen konnten gematched werden." : "Kein Skript geladen — keine Animationen."}
                </p>
                {lastScript && (
                  <button onClick={() => onSwitchTab?.("grafik")} className="vs-ghost" style={{ fontSize: 12 }}>
                    → Grafiken manuell erstellen
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {timedAnimations.filter(b => b.matched).map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    background: "var(--panel-2)", borderRadius: 8 }}>
                    <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--volt)", minWidth: 52 }}>
                      @{b.startTime?.toFixed(1)}s
                    </span>
                    <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>
                      <b>{b.beat}</b> — {b.einblendung}
                    </span>
                    {b.libraryId && (
                      <span style={{ fontFamily: "Space Mono", fontSize: 9, padding: "2px 7px", borderRadius: 8,
                        background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.2)", color: "var(--volt)" }}>
                        {b.libraryId}
                      </span>
                    )}
                    <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "var(--muted)", opacity: 0.6 }}>
                      {b.confidence}
                    </span>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: "var(--muted)", fontFamily: "Space Mono", marginTop: 8 }}>
                  → Im Grafiken-Tab kannst du Animation-Typen ändern, Timestamps anpassen und eine Vorschau sehen.
                </p>
              </div>
            )}
          </div>

          <button className="vs-btn" onClick={handleCompose} disabled={busy} style={{ width: "100%" }}>
            {busy
              ? <><Loader2 size={16} className="animate-spin" /> {progress || "Rendert…"}</>
              : <><Film size={16} /> Finales Video erstellen & herunterladen</>}
          </button>
        </div>
      )}

      {/* ── SCHRITT 4: Done ──────────────────────────────────────────────── */}
      {step === "done" && (
        <div className="vs-panel" style={{ padding: 48, textAlign: "center" }}>
          <CheckCircle size={48} style={{ margin: "0 auto 16px", color: "var(--volt)" }} />
          <p style={{ fontFamily: "Anton", fontSize: 24, letterSpacing: ".03em", marginBottom: 8 }}>VIDEO FERTIG</p>
          <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>
            Das fertige Video wurde heruntergeladen.
          </p>
          <button className="vs-ghost" onClick={() => {
            setStep("upload"); setTranscript(null); setSelectedVideo("");
            setAnimSpecs({}); setAnimGenerated({}); setSpecOpen({});
            onTimedAnimations?.([], format, position);
            localStorage.removeItem(LS_KEY);
          }}>
            Neues Video
          </button>
        </div>
      )}
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
  const [savedProjects, setSavedProjects] = useState([]);
  const [projectToLoad, setProjectToLoad] = useState(null);

  // ── Geteilter State: Video-Transkript + Timed Animations ──────────────────
  // Wird von Schnitt-Tab gesetzt, von Grafiken-Tab gelesen.
  // timedAnimations = [{ beat, einblendung, startTime, confidence, matched, libraryId }]
  const [timedAnimations, setTimedAnimations] = useState([]);
  const [lastTranscript, setLastTranscript] = useState(null);   // { text, segments, words, duration }
  const [videoFormat, setVideoFormat] = useState("9:16");
  const [videoPosition, setVideoPosition] = useState("bottom");

  function handleTimedAnimations(anims, fmt, pos) {
    setTimedAnimations(anims);
    if (fmt) setVideoFormat(fmt);
    if (pos) setVideoPosition(pos);
  }

  useEffect(() => {
    (async () => {
      setTopics((await store.get("vsg:topics")) || []);
      setBrandVoice((await store.get("vsg:brandvoice")) || "");
      setViral((await store.get("vsg:viral")) || []);
      setUsedHooks((await store.get("vsg:usedhooks")) || []);
      setSavedProjects((await store.get("vsg:projects")) || []);
    })();
  }, []);

  async function saveProject(projectData) {
    const next = [projectData, ...savedProjects];
    setSavedProjects(next);
    await store.set("vsg:projects", next);
  }

  async function deleteProject(id) {
    const next = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(next);
    await store.set("vsg:projects", next);
  }

  function loadProject(project) {
    setProjectToLoad(project);
    setTab("gen");
  }

  return (
    <div className="vs-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Schibsted+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        .vs-root{--bg:#0a0b0d;--panel:#131519;--panel-2:#1a1d23;--line:#262a32;--ink:#f2f4f3;--muted:#8a9099;--volt:#ccff00;--signal:#ff5a3c;
          background:var(--bg);color:var(--ink);font-family:'Schibsted Grotesk',sans-serif;min-height:100vh;
          background-image:radial-gradient(circle at 85% -10%, rgba(204,255,0,0.07), transparent 45%);}
        .vs-root *{box-sizing:border-box;}
        .block{display:block;} .mb-1{margin-bottom:4px;} .mb-3{margin-bottom:12px;} .mb-4{margin-bottom:16px;}
        .mb-5{margin-bottom:20px;} .mb-7{margin-bottom:28px;} .mt-3{margin-top:12px;}
        .flex{display:flex;} .grid{display:grid;} .items-center{align-items:center;} .items-end{align-items:flex-end;}
        .items-start{align-items:flex-start;} .justify-between{justify-content:space-between;} .justify-end{justify-content:flex-end;}
        .flex-wrap{flex-wrap:wrap;} .text-right{text-align:right;} .text-center{text-align:center;}
        .gap-2{gap:8px;} .gap-3{gap:12px;} .gap-5{gap:20px;} .gap-7{gap:28px;}
        .grid-cols-2{grid-template-columns:repeat(2,1fr);} .gap-x-5{column-gap:20px;} .gap-y-2{row-gap:8px;}
        .space-y-4 > * + *{margin-top:16px;} .space-y-5 > * + *{margin-top:20px;} .space-y-2 > * + *{margin-top:8px;}
        @media(min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,1fr);}}
        @media(min-width:1024px){.lg\\:grid-cols-\\[380px_1fr\\]{grid-template-columns:380px 1fr;}}
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
        .animate-spin{animation:spin 1s linear infinite;} @keyframes spin{to{transform:rotate(360deg);}}
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
          <div className={`tab ${tab === "projekte" ? "on" : ""}`} onClick={() => setTab("projekte")}><BookMarked size={14} />Projekte{savedProjects.length > 0 && <span style={{ marginLeft: 4, background: "var(--volt)", color: "var(--bg)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontFamily: "Space Mono" }}>{savedProjects.length}</span>}</div>
          <div className={`tab ${tab === "animlib" ? "on" : ""}`} onClick={() => setTab("animlib")}><Layers size={14} />Animationen<span style={{ marginLeft: 4, background: "var(--panel-2)", color: "var(--muted)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontFamily: "Space Mono" }}>{LIBRARY.length}</span></div>
          <div className={`tab ${tab === "schnitt" ? "on" : ""}`} onClick={() => setTab("schnitt")}><Scissors size={14} />Schnitt</div>
        </div>

        {/* Alle Tabs bleiben gemountet – nur per CSS ein-/ausgeblendet, so bleibt der State erhalten */}
        <div style={{ display: tab === "gen" ? "" : "none" }}>
          <Generator topics={topics} setTopics={setTopics} brandVoice={brandVoice} viral={viral} usedHooks={usedHooks} setUsedHooks={setUsedHooks} setLastScript={setLastScript} onSaveProject={saveProject} projectToLoad={projectToLoad} onProjectLoaded={() => setProjectToLoad(null)} />
        </div>
        <div style={{ display: tab === "voice" ? "" : "none" }}>
          <BrandVoice brandVoice={brandVoice} setBrandVoice={setBrandVoice} />
        </div>
        <div style={{ display: tab === "viral" ? "" : "none" }}>
          <Viral viral={viral} setViral={setViral} />
        </div>
        <div style={{ display: tab === "grafik" ? "" : "none" }}>
          <Grafiken script={lastScript} timedAnimations={timedAnimations} videoFormat={videoFormat} videoPosition={videoPosition} />
        </div>
        <div style={{ display: tab === "projekte" ? "" : "none" }}>
          <Projekte savedProjects={savedProjects} onLoad={loadProject} onDelete={deleteProject} />
        </div>
        <div style={{ display: tab === "animlib" ? "" : "none" }}>
          <AnimBibliothek />
        </div>
        <div style={{ display: tab === "schnitt" ? "" : "none" }}>
          <Schnitt lastScript={lastScript} onTimedAnimations={handleTimedAnimations} onTranscript={setLastTranscript} timedAnimations={timedAnimations} onSwitchTab={setTab} />
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Generator ----------
function Generator({ topics, setTopics, brandVoice, viral, usedHooks, setUsedHooks, setLastScript, onSaveProject, projectToLoad, onProjectLoaded }) {
  const [sel, setSel] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [loadingFolder, setLoadingFolder] = useState(false);
  const [folderInfo, setFolderInfo] = useState("");
  const [cfg, setCfg] = useState({
    plattform: "Beide", typ: VIDEO_TYPEN[0], ebenen: ["Visuell stark"], archetyp: HOOK_ARCHETYPEN[0],
    framework: FRAMEWORKS[0], laenge: "30 s", ton: TON[0], cta: CTA_ZIELE[0], claim: CLAIM_STUFEN[1], loop: true,
    detail: "Medium", bild: "Dezente Bildsprache",
  });
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);
  const folderInputRef = React.useRef(null);
  useEffect(() => { if (setLastScript) setLastScript(out); }, [out]);

  // Projekt laden: State aus gespeichertem Projekt wiederherstellen
  useEffect(() => {
    if (!projectToLoad) return;
    setSel(projectToLoad.sel);
    setCfg(projectToLoad.cfg);
    setOut(projectToLoad.out);
    setSaved(false);
    onProjectLoaded();
  }, [projectToLoad]);

  async function handleSaveProject() {
    const topic = topics.find((t) => String(t.id) === sel);
    const project = {
      id: Date.now(),
      savedAt: new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      topicName: topic?.name || "Unbekanntes Thema",
      sel,
      cfg: { ...cfg },
      out: { ...out },
    };
    await onSaveProject(project);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const toggleEbene = (k) => set("ebenen", cfg.ebenen.includes(k) ? cfg.ebenen.filter((x) => x !== k) : [...cfg.ebenen, k]);

  async function addTopic() {
    if (!newName.trim() || !newText.trim()) return;
    const next = [...topics, { id: Date.now(), name: newName.trim(), text: newText.trim() }];
    setTopics(next); await store.set("vsg:topics", next);
    setSel(String(next[next.length - 1].id)); setNewName(""); setNewText(""); setAdding(false);
  }

  // Ordner-Dialog: Datei-Input triggern
  function handleOpenFolderDialog() {
    folderInputRef.current?.click();
  }

  // Wenn Benutzer Ordner im Dialog wählt, Dateien direkt lesen und extrahieren
  async function handleFolderSelected(e) {
    const allFiles = Array.from(e.target.files || []);
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (allFiles.length === 0) return;

    const supported = [".txt", ".md", ".docx", ".pdf"];
    const readable = allFiles.filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      return supported.includes(ext);
    });

    if (readable.length === 0) {
      setFolderInfo("Keine lesbaren Dokumente (.txt/.md/.docx/.pdf) im Ordner gefunden.");
      return;
    }

    // Ordnername für das Pfad-Feld anzeigen
    if (readable[0].webkitRelativePath) {
      setFolderPath(readable[0].webkitRelativePath.split("/")[0]);
    }

    setLoadingFolder(true);
    setErr("");
    setFolderInfo(`Lese ${readable.length} Datei(en)…`);

    const docs = [];
    const skipped = [];
    for (const file of readable) {
      try {
        const buf = await file.arrayBuffer();
        const res = await fetch("/api/extract-file", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream", "X-Filename": encodeURIComponent(file.name) },
          body: buf,
        });
        const data = await res.json();
        if (!res.ok || !data.text) { skipped.push(file.name); continue; }
        const ext = file.name.slice(file.name.lastIndexOf("."));
        const name = file.name.slice(0, -ext.length);
        docs.push({ name, text: data.text, file: file.name });
      } catch {
        skipped.push(file.name);
      }
    }

    const merged = [...topics];
    docs.forEach((d, idx) => {
      const pos = merged.findIndex((t) => t.name === d.name);
      const entry = { id: pos >= 0 ? merged[pos].id : Date.now() + idx, name: d.name, text: d.text, file: d.file };
      if (pos >= 0) merged[pos] = entry; else merged.push(entry);
    });
    setTopics(merged);
    await store.set("vsg:topics", merged);
    setFolderInfo(
      docs.length
        ? `${docs.length} Dokument(e) eingelesen.` + (skipped.length ? ` (${skipped.length} ignoriert)` : "")
        : "Keine Dokumente konnten gelesen werden."
    );
    setLoadingFolder(false);
  }

  // Ordner von der Festplatte einlesen (Server extrahiert .txt/.md/.docx/.pdf)
  async function loadFolder() {
    if (!folderPath.trim()) { setErr("Bitte einen Ordnerpfad eintragen."); return; }
    setLoadingFolder(true); setErr(""); setFolderInfo("");
    try {
      const res = await fetch(`/api/folder?path=${encodeURIComponent(folderPath.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ordner konnte nicht gelesen werden.");
      const docs = data.docs || [];
      // In Themen einsortieren – gleiche Namen werden aktualisiert
      const merged = [...topics];
      docs.forEach((d, idx) => {
        const pos = merged.findIndex((t) => t.name === d.name);
        const entry = { id: pos >= 0 ? merged[pos].id : Date.now() + idx, name: d.name, text: d.text, file: d.file };
        if (pos >= 0) merged[pos] = entry; else merged.push(entry);
      });
      setTopics(merged); await store.set("vsg:topics", merged);
      setFolderInfo(
        docs.length
          ? `${docs.length} Dokument(e) eingelesen.` + (data.skipped?.length ? ` (${data.skipped.length} ignoriert)` : "")
          : "Keine lesbaren Dokumente (.txt/.md/.docx/.pdf) im Ordner gefunden."
      );
    } catch (e) { setErr(e.message); }
    setLoadingFolder(false);
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
 "body":[{"beat":"z.B. Problem","text":"Voiceover/Skript-Text","einblendung":"Was eingeblendet wird","shot":"Kameraeinstellung/B-Roll"}, ...3-5 Beats],
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
    } catch (e) { setErr("Generierung fehlgeschlagen: " + e.message); }
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
    } catch (e) { setErr("Abschnitt konnte nicht neu generiert werden: " + e.message); }
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
    } catch (e) { setErr("Optimierung fehlgeschlagen: " + e.message); }
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-7">
      {/* Steuerung */}
      <div className="vs-panel" style={{ padding: 22, alignSelf: "start" }}>
        <div className="section-head">Parameter</div>

        <Field label="Recherche-Ordner einlesen">
          <div className="flex gap-2">
            <input className="vs-input" value={folderPath} onChange={(e) => setFolderPath(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") loadFolder(); }}
              placeholder="z.B. C:\\Users\\…\\Recherche" />
            <button className="vs-ghost" onClick={handleOpenFolderDialog} disabled={loadingFolder} style={{ flexShrink: 0 }} title="Ordner auswählen">
              {loadingFolder ? <Loader2 size={14} className="animate-spin" /> : <FolderOpen size={14} />}
            </button>
            <button className="vs-ghost" onClick={loadFolder} disabled={loadingFolder || !folderPath.trim()} style={{ flexShrink: 0 }} title="Ordner laden">
              <Zap size={14} />
            </button>
          </div>
          <input ref={folderInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFolderSelected} />
          {folderInfo && <p style={{ fontSize: 11, color: "var(--volt)", marginTop: 6, fontFamily: "Space Mono" }}>{folderInfo}</p>}
        </Field>

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
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontFamily: "Space Mono" }}>Alternativ oben einen Ordner einlesen – jede Datei wird ein Thema.</p>
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
            <p style={{ fontSize: 13 }}>Ordner einlesen oder Thema wählen, Parameter setzen, „Skript erzeugen" klicken.</p>
          </div>
        )}
        {busy && <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}><Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--volt)" }} /><p>Verdichte Recherche zu Skript…</p></div>}
        <ScriptOutput s={out} onRegenBeat={regenerateBeat} onOptimize={optimizeScript} />
        {out && onSaveProject && (
          <div className="flex justify-end" style={{ marginTop: 12 }}>
            <button className="vs-ghost" onClick={handleSaveProject}>
              {saved ? <><Check size={13} /> Gespeichert!</> : <><Save size={13} /> Als Projekt speichern</>}
            </button>
          </div>
        )}
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
  const [visuals, setVisuals] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // --- Lokale Transkription (faster-whisper über den Server) ---
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [transcribing, setTranscribing] = useState(false);

  async function loadVideos() {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      const files = data.files || [];
      setVideos(files);
      // Auswahl beibehalten, sonst erste Datei vorwählen
      setSelectedVideo((cur) => (cur && files.includes(cur) ? cur : files[0] || ""));
    } catch {
      setVideos([]);
    }
  }
  useEffect(() => { loadVideos(); }, []);

  async function transcribe() {
    if (!selectedVideo) { setErr("Bitte zuerst eine Videodatei wählen (oder in den videos-Ordner legen)."); return; }
    setTranscribing(true); setErr("");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedVideo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transkription fehlgeschlagen.");
      const t = (data.text || "").trim();
      if (!t) throw new Error("Es wurde kein Text erkannt (war Sprache im Video?).");
      // Ergebnis automatisch ins Transkript-Feld (bestehenden Text nicht überschreiben, sondern anhängen)
      setTranscript((cur) => (cur.trim() ? cur.trim() + "\n\n" + t : t));
    } catch (e) {
      setErr("Transkription fehlgeschlagen: " + e.message);
    }
    setTranscribing(false);
  }

  async function analyze() {
    if (!transcript.trim() && !visuals.trim()) { setErr("Bitte Transkript und/oder eine Beschreibung der visuellen Elemente einfügen."); return; }
    setBusy(true); setErr("");
    const prompt = `Analysiere dieses virale Short-Form-Video (Nische Sport/Gesundheit). Sprache: Deutsch.
LINK: ${link || "—"}
TRANSKRIPT (Tonspur):
${transcript || "—"}

VISUELLE ELEMENTE (Einblendungen, Schnitte, was gezeigt wird – deckt die Tonspur nicht ab):
${visuals || "—"}

Antworte AUSSCHLIESSLICH als reines JSON:
{"hook_ebene":"welche Ebene trug den Hook (visuell/akustisch/textlich/sprachlich)","framework":"erkanntes Skript-Framework","retention_tricks":["...2-4 konkrete Tricks"],"warum_funktioniert":"2 Sätze warum es viral ging","formel":"die wiederverwendbare Hook-Formel in einem Satz"}`;
    try {
      const a = await callClaude(prompt, 1500);
      const next = [{ id: Date.now(), link, ...a }, ...viral];
      setViral(next); await store.set("vsg:viral", next);
      setLink(""); setTranscript(""); setVisuals("");
    } catch (e) { setErr("Analyse fehlgeschlagen: " + e.message); }
    setBusy(false);
  }
  async function del(id) { const next = viral.filter((v) => v.id !== id); setViral(next); await store.set("vsg:viral", next); }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-7">
      <div className="vs-panel" style={{ padding: 22, alignSelf: "start" }}>
        <div className="section-head"><Plus size={15} /> Video analysieren</div>
        <Field label="Video-Link (optional)"><input className="vs-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" /></Field>

        <Field label="Lokal transkribieren (aus videos-Ordner)">
          <div style={{ display: "flex", gap: 6 }}>
            <select className="vs-input" style={{ flex: 1 }} value={selectedVideo} onChange={(e) => setSelectedVideo(e.target.value)}>
              {videos.length === 0 && <option value="">— keine Videos gefunden —</option>}
              {videos.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <button className="vs-ghost" title="Liste aktualisieren" onClick={loadVideos} style={{ padding: "0 10px" }}><RefreshCw size={14} /></button>
          </div>
          <button className="vs-btn" style={{ width: "100%", marginTop: 8 }} onClick={transcribe} disabled={transcribing || !selectedVideo}>
            {transcribing ? <><Loader2 size={15} className="animate-spin" /> Transkribiere… (kann dauern)</> : <><Mic size={15} /> Transkribieren</>}
          </button>
        </Field>

        <Field label="Transkript (Tonspur)"><textarea className="vs-input" rows={7} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Erscheint hier automatisch nach dem Transkribieren – oder manuell einfügen." /></Field>
        <Field label="Visuelle Elemente (Einblendungen, Schnitte)"><textarea className="vs-input" rows={4} value={visuals} onChange={(e) => setVisuals(e.target.value)} placeholder="z.B. Text-Einblendung „3 Fehler“, harter Schnitt bei Sek. 2, Vorher/Nachher-Split, Zoom aufs Gesicht …" /></Field>
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
// Zeilenumbruch für SVG-Text ohne foreignObject (Illustrator-kompatibel)
function svgLines(text, x, y, maxW, size, cls, fill, lh = 1.12) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const cpl = Math.max(4, Math.floor(maxW / (size * 0.58)));
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (cur && test.length > cpl) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return {
    el: lines.map((l, i) =>
      `<text x="${x}" y="${y + i * size * lh}" class="${cls}" font-size="${size}" fill="${fill}">${esc(l)}</text>`
    ).join(""),
    h: lines.length * size * lh,
  };
}

// Kein @import: Fonts bereits per Seiten-CSS geladen (Browser-Cache);
// Illustrator nutzt system-installierte Fonts oder Fallbacks.
function svgWrap(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
<defs><style>
.an{font-family:'Anton',Impact,sans-serif;}
.gr{font-family:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif;}
.mo{font-family:'Space Mono','Courier New',monospace;}
@keyframes pop{0%{opacity:0;transform:translateY(30px) scale(.92);}100%{opacity:1;transform:translateY(0) scale(1);}}
@keyframes slide{0%{opacity:0;transform:translateX(-60px);}100%{opacity:1;transform:translateX(0);}}
@keyframes count{0%{opacity:0;}100%{opacity:1;}}
@keyframes grow{0%{transform:scaleX(0);}100%{transform:scaleX(1);}}
@keyframes pulse{0%,100%{opacity:.55;}50%{opacity:1;}}
@keyframes dash{0%{stroke-dashoffset:var(--len);}100%{stroke-dashoffset:0;}}
</style></defs>
${inner}
</svg>`;
}

function tplText({ kicker, headline, sub }) {
  const k = kicker || "EINBLENDUNG";
  const head = svgLines(headline || "", 60, 175, 800, 72, "an", "#f2f4f3", 1.08);
  const subR = sub ? svgLines(sub, 60, 175 + head.h + 28, 790, 32, "gr", "#8a9099", 1.3) : { el: "", h: 0 };
  const boxH = Math.round(120 + head.h + (sub ? 28 + subR.h + 20 : 20));
  return svgWrap(`
<g transform="translate(90,760)" style="animation:pop .6s cubic-bezier(.2,.8,.2,1) both;">
  <rect x="0" y="0" width="900" height="${boxH}" rx="28" fill="#131519" stroke="#262a32" stroke-width="2"/>
  <rect x="0" y="0" width="14" height="${boxH}" rx="7" fill="#ccff00"/>
  <text x="60" y="85" class="mo" font-size="30" letter-spacing="6" fill="#ccff00">${esc(k)}</text>
  ${head.el}
  ${subR.el}
</g>`);
}

function tplStat({ kicker, value, unit, label, bars }) {
  const hasBars = bars && bars.length > 0;
  const barRows = (bars || []).slice(0, 2).map((b, i) => {
    const y = 250 + i * 130;
    const w = Math.max(4, Math.min(100, Number(b.pct) || 0)) * 7.4;
    return `
<text x="60" y="${y}" class="gr" font-size="30" fill="#8a9099">${esc(b.label)}</text>
<rect x="60" y="${y + 22}" width="740" height="46" rx="23" fill="#1a1d23"/>
<rect x="60" y="${y + 22}" width="${w}" height="46" rx="23" fill="${i === 0 ? "#ccff00" : "#ff5a3c"}" style="transform-origin:60px center;animation:grow .9s cubic-bezier(.2,.8,.2,1) ${0.3 + i * 0.2}s both;"/>
<text x="${60 + w + 18}" y="${y + 55}" class="mo" font-size="30" fill="#f2f4f3" style="animation:count .4s ${0.9 + i * 0.2}s both;">${esc(String(b.pct))}%</text>`;
  }).join("");
  const lbl = !hasBars ? svgLines(label || "", 60, 302, 790, 34, "gr", "#8a9099", 1.3) : { el: "", h: 0 };
  const boxH = hasBars ? 540 : Math.round(300 + lbl.h + 30);
  return svgWrap(`
<g transform="translate(90,640)" style="animation:pop .6s cubic-bezier(.2,.8,.2,1) both;">
  <rect x="0" y="0" width="900" height="${boxH}" rx="28" fill="#131519" stroke="#262a32" stroke-width="2"/>
  <text x="60" y="92" class="mo" font-size="30" letter-spacing="6" fill="#ccff00">${esc(kicker || "FAKT")}</text>
  ${hasBars ? barRows : `<text x="60" y="258" class="an" font-size="200" fill="#ccff00" style="animation:count .5s .2s both;">${esc(String(value || ""))}<tspan class="an" font-size="80" fill="#f2f4f3" dx="10">${esc(unit || "")}</tspan></text>${lbl.el}`}
</g>`);
}

function tplIcon({ kicker, label, region }) {
  const regions = { Knie: [540, 1180], Hüfte: [540, 980], Schulter: [540, 640], Rücken: [620, 820], Wade: [540, 1340], Oberschenkel: [540, 1060], Herz: [600, 720], Sehne: [540, 1260] };
  const [rx, ry] = regions[region] || [540, 1180];
  const lbl = svgLines(label || region || "", 26, 76, 278, 38, "an", "#f2f4f3", 1.05);
  const boxH = Math.max(120, 58 + lbl.h + 18);
  return svgWrap(`
<g style="animation:pop .6s both;">
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
  <circle cx="${rx}" cy="${ry}" r="46" fill="none" stroke="#ccff00" stroke-width="6" style="transform-origin:${rx}px ${ry}px;animation:pulse 1.4s ease-in-out infinite;"/>
  <circle cx="${rx}" cy="${ry}" r="14" fill="#ccff00"/>
  <line x1="${rx + 250}" y1="${ry - 120}" x2="${rx + 70}" y2="${ry - 20}" stroke="#ccff00" stroke-width="6" stroke-linecap="round" stroke-dasharray="320" style="--len:320;animation:dash .7s ease-out .3s both;"/>
  <g transform="translate(${rx + 230},${ry - 230})" style="animation:slide .6s .5s both;">
    <rect x="0" y="0" width="320" height="${boxH}" rx="16" fill="#131519" stroke="#ccff00" stroke-width="2"/>
    <text x="28" y="46" class="mo" font-size="24" letter-spacing="4" fill="#ccff00">${esc(kicker || region || "")}</text>
    ${lbl.el}
  </g>
</g>`);
}

function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function buildSvg(spec) {
  if (spec.typ === "stat") return tplStat(spec);
  if (spec.typ === "icon") return tplIcon(spec);
  return tplText(spec);
}

async function downloadPng(svgString, name) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new window.Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1920;
    canvas.getContext("2d").drawImage(img, 0, 0, 1080, 1920);
    await new Promise((res) => canvas.toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = (name || "overlay") + ".png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      res();
    }, "image/png"));
  } catch (e) {
    alert("PNG-Export fehlgeschlagen: " + e.message);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadSvg(svgString, name) {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (name || "overlay") + ".svg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- Remotion-Komposition auflösen ----------
const COMP_MAP = { HeartPump, Mitochondria, KneeJoint };

function resolveComposition(spec) {
  // Bibliotheks-Animation?
  if (spec.typ === "library" && spec.libraryId) {
    const entry = LIBRARY.find((e) => e.id === spec.libraryId);
    if (entry) return { component: entry.component, duration: entry.duration, props: { ...entry.defaultProps, ...(spec.props || {}), format: spec.format || "9:16", position: spec.position || "bottom" } };
  }
  if (spec.typ === "stat") return { component: StatCard, duration: 90, props: { kicker: spec.kicker, value: spec.value, unit: spec.unit, label: spec.label, bars: spec.bars } };
  if (spec.typ === "icon") return { component: BodyMarker, duration: 120, props: { kicker: spec.kicker, label: spec.label, region: spec.region } };
  return { component: TextCard, duration: 90, props: { kicker: spec.kicker, headline: spec.headline, sub: spec.sub } };
}

// ---------- Einzelne Bibliotheks-Karte mit eigenem Player-Ref ----------
function LibCard({ entry }) {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderErr, setRenderErr] = useState("");

  const { component, duration, props } = resolveComposition({ typ: "library", libraryId: entry.id });
  // Compositions-ID für den Server (library.js id → Root.jsx Composition id)
  const compIdMap = {
    "heart-pump": "HeartPump", "mitochondria": "Mitochondria", "knee-joint": "KneeJoint",
    "organ-heart": "OrganHeart", "organ-lung": "OrganLung", "organ-muscle": "OrganMuscle",
  };
  const compId = compIdMap[entry.id] || entry.id;

  function togglePlay() {
    if (!playerRef.current) return;
    if (playing) { playerRef.current.pause(); setPlaying(false); }
    else { playerRef.current.play(); setPlaying(true); }
  }

  async function handleDownload(format) {
    setRendering(true); setRenderErr("");
    try {
      await renderVideo(compId, props, format, () => {});
    } catch (e) { setRenderErr(e.message); }
    setRendering(false);
  }

  return (
    <div className="vs-panel" style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Player — feste Größe, initialFrame mitten in der Animation */}
        <div style={{ flexShrink: 0, width: 180, borderRadius: 12, overflow: "hidden", background: "#0a0b0d", border: "1px solid var(--line)" }}>
          <Player
            ref={playerRef}
            component={component}
            durationInFrames={duration}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            inputProps={props}
            initialFrame={Math.floor(duration * 0.55)}
            style={{ width: 180, height: 320, display: "block" }}
            loop
            acknowledgeRemotionLicense
          />
        </div>

        {/* Info rechts */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "Anton", fontSize: 22, letterSpacing: "0.03em", marginBottom: 4 }}>{entry.name}</div>
          <div style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--volt)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>{entry.category}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 14 }}>{entry.description}</div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {entry.tags.slice(0, 8).map((t) => (
              <span key={t} style={{ fontFamily: "Space Mono", fontSize: 9, padding: "2px 8px", borderRadius: 8, background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--line)" }}>{t}</span>
            ))}
            {entry.tags.length > 8 && <span style={{ fontFamily: "Space Mono", fontSize: 9, color: "var(--muted)" }}>+{entry.tags.length - 8}</span>}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button className="vs-ghost" onClick={togglePlay} style={{ fontSize: 12 }}>
              {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
            </button>
            <button className="vs-ghost" onClick={() => handleDownload("prores")} disabled={rendering} title="ProRes 4444 — Premiere/DaVinci" style={{ fontSize: 12, color: "var(--volt)", borderColor: "var(--volt)" }}>
              {rendering ? <Loader2 size={13} className="animate-spin" /> : <><Film size={13} /> MOV</>}
            </button>
            <button className="vs-ghost" onClick={() => handleDownload("webm")} disabled={rendering} title="WebM VP9 — CapCut" style={{ fontSize: 12, color: "var(--volt)", borderColor: "var(--volt)" }}>
              {rendering ? <Loader2 size={13} className="animate-spin" /> : <><Film size={13} /> WebM</>}
            </button>
          </div>
          {renderErr && <p style={{ fontSize: 11, color: "var(--signal)", marginTop: 6, fontFamily: "Space Mono" }}>{renderErr}</p>}

          <div style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--line)", marginTop: 12 }}>
            {duration / 30}s · {entry.fps}fps · ID: {entry.id}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Tab: Animations-Bibliothek ----------
function AnimBibliothek() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Alle");
  const [preview, setPreview] = useState(null); // id des geöffneten Previews

  const results = searchLibrary(query).filter((e) => cat === "Alle" || e.category === cat);

  return (
    <div>
      {/* Suche + Filter */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{ fontFamily: "Space Mono", fontSize: 11, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, border: `1px solid ${cat === c ? "var(--volt)" : "var(--line)"}`, background: cat === c ? "var(--volt)" : "var(--panel-2)", color: cat === c ? "var(--bg)" : "var(--muted)", cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input className="vs-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen: Herz, Knie, ATP, Ausdauer…"
              style={{ paddingLeft: 32, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--muted)" }}>{results.length} Animation{results.length !== 1 ? "en" : ""}</div>
      </div>

      {results.length === 0 && (
        <div className="vs-panel" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <Layers size={32} style={{ margin: "0 auto 12px", color: "var(--line)" }} />
          <p style={{ fontFamily: "Anton", fontSize: 18, color: "var(--ink)" }}>KEINE TREFFER</p>
          <p style={{ fontSize: 13 }}>Versuche einen anderen Suchbegriff.</p>
        </div>
      )}

      <div className="space-y-5">
        {results.map((entry) => <LibCard key={entry.id} entry={entry} />)}
      </div>
    </div>
  );
}

// ---------- WebM-Render via Server ----------
async function renderVideo(compositionId, inputProps, format, setProgress) {
  setProgress("Warte auf Bundle…");
  for (let i = 0; i < 60; i++) {
    const s = await fetch("/api/render-status").then((r) => r.json());
    if (s.status === "ready") break;
    if (s.status === "error") throw new Error("Bundle-Fehler: " + s.error);
    setProgress(`Bundle vorbereiten… (${i * 2}s)`);
    await new Promise((r) => setTimeout(r, 2000));
  }
  setProgress("Rendere Frames…");
  const res = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compositionId, inputProps, format }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Render fehlgeschlagen");
  }
  setProgress("Download…");
  const blob = await res.blob();
  const ext = format === "webm" ? "webm" : "mov";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${compositionId}.${ext}`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Einzelner Overlay-Player ----------
function OverlayCard({ spec, index, onUpdate, format = "9:16", position = "bottom" }) {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [renderFormat, setRenderFormat] = useState("");
  const [renderProgress, setRenderProgress] = useState("");
  const [renderErr, setRenderErr] = useState("");
  // format+position an alle Kompositionen weitergeben
  const specWithLayout = { ...spec, format, position };
  const { component, duration, props } = resolveComposition(specWithLayout);
  const svg = buildSvg(spec);

  // Composition-ID aus typ ableiten
  const compId = spec.typ === "stat" ? "StatCard" : spec.typ === "icon" ? "BodyMarker" : "TextCard";

  function togglePlay() {
    if (!playerRef.current) return;
    if (playing) { playerRef.current.pause(); setPlaying(false); }
    else { playerRef.current.play(); setPlaying(true); }
  }
  function restart() {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0); playerRef.current.play(); setPlaying(true);
  }

  async function handleRender(format) {
    setRendering(true); setRenderFormat(format); setRenderErr("");
    try {
      await renderVideo(compId, props, format, setRenderProgress);
    } catch (e) {
      setRenderErr(e.message);
    }
    setRendering(false); setRenderFormat(""); setRenderProgress("");
  }

  return (
    <div className="vs-panel" style={{ padding: 16 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2" style={{ marginBottom: 0 }}>
          <span className="mono-label" style={{ marginBottom: 0, color: "var(--volt)" }}>{spec.beat || `Overlay ${index + 1}`} · {spec.typ}</span>
          {spec.startTime != null && (
            <span style={{ fontFamily: "Space Mono", fontSize: 9, padding: "2px 8px", borderRadius: 8,
              background: "rgba(204,255,0,0.12)", border: "1px solid rgba(204,255,0,0.3)", color: "var(--volt)" }}>
              @{spec.startTime.toFixed(1)}s
            </span>
          )}
          {spec.confidence && (
            <span style={{ fontFamily: "Space Mono", fontSize: 9, padding: "2px 7px", borderRadius: 8,
              background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)" }}>
              {spec.confidence}
            </span>
          )}
        </div>
        <div className="flex gap-2" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="vs-ghost" onClick={() => downloadPng(svg, `overlay-${index + 1}`)} title="Standbild PNG" style={{ fontSize: 11 }}><Download size={11} /> PNG</button>
          <button className="vs-ghost" onClick={() => downloadSvg(svg, `overlay-${index + 1}`)} title="SVG (Illustrator)" style={{ fontSize: 11 }}><Download size={11} /> SVG</button>
          <button className="vs-ghost" onClick={() => handleRender("prores")} disabled={rendering} title="ProRes 4444 MOV — Premiere / DaVinci Resolve / Final Cut" style={{ fontSize: 11, color: rendering && renderFormat === "prores" ? "var(--muted)" : "var(--volt)", borderColor: rendering && renderFormat === "prores" ? "var(--line)" : "var(--volt)" }}>
            {rendering && renderFormat === "prores" ? <><Loader2 size={11} className="animate-spin" /> {renderProgress || "…"}</> : <><Film size={11} /> MOV</>}
          </button>
          <button className="vs-ghost" onClick={() => handleRender("webm")} disabled={rendering} title="WebM VP9 — CapCut / Browser / DaVinci" style={{ fontSize: 11, color: rendering && renderFormat === "webm" ? "var(--muted)" : "var(--volt)", borderColor: rendering && renderFormat === "webm" ? "var(--line)" : "var(--volt)" }}>
            {rendering && renderFormat === "webm" ? <><Loader2 size={11} className="animate-spin" /> {renderProgress || "…"}</> : <><Film size={11} /> WebM</>}
          </button>
        </div>
      </div>
      {renderErr && <p style={{ fontSize: 11, color: "var(--signal)", marginBottom: 8, fontFamily: "Space Mono" }}>{renderErr}</p>}

      {/* Remotion Player — Format-adaptiv */}
      <div style={{ background: "repeating-conic-gradient(#16181d 0% 25%, #1c1f25 0% 50%) 50% / 20px 20px", borderRadius: 12, overflow: "hidden", position: "relative" }}>
        <Player
          ref={playerRef}
          component={component}
          durationInFrames={duration}
          compositionWidth={format === "16:9" ? 1920 : 1080}
          compositionHeight={format === "16:9" ? 1080 : 1920}
          fps={30}
          inputProps={props}
          style={{ width: "100%", aspectRatio: format === "16:9" ? "16/9" : "9/16", display: "block" }}
          acknowledgeRemotionLicense
        />
        {/* Playback controls */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={restart} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "2px 6px" }}><SkipBack size={14} /></button>
          <button onClick={togglePlay} style={{ background: "none", border: "none", color: "var(--volt)", cursor: "pointer", padding: "2px 6px" }}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Edit fields */}
      <div className="mt-3 space-y-2">
        {"kicker" in spec && <input className="vs-input" value={spec.kicker || ""} onChange={(e) => onUpdate(index, { kicker: e.target.value })} placeholder="Kicker (Label oben)" style={{ fontSize: 12 }} />}
        {"headline" in spec && <input className="vs-input" value={spec.headline || ""} onChange={(e) => onUpdate(index, { headline: e.target.value })} placeholder="Headline" />}
        {"sub" in spec && <input className="vs-input" value={spec.sub || ""} onChange={(e) => onUpdate(index, { sub: e.target.value })} placeholder="Sub-Zeile (optional)" style={{ fontSize: 12 }} />}
        {"value" in spec && (
          <div className="flex gap-2">
            <input className="vs-input" value={spec.value || ""} onChange={(e) => onUpdate(index, { value: e.target.value })} placeholder="Wert (Zahl)" />
            <input className="vs-input" value={spec.unit || ""} onChange={(e) => onUpdate(index, { unit: e.target.value })} placeholder="Einheit" style={{ maxWidth: 90 }} />
          </div>
        )}
        {"label" in spec && spec.typ !== "icon" && <input className="vs-input" value={spec.label || ""} onChange={(e) => onUpdate(index, { label: e.target.value })} placeholder="Beschriftung" style={{ fontSize: 12 }} />}
        {spec.typ === "icon" && (
          <div className="flex gap-2">
            <input className="vs-input" value={spec.label || ""} onChange={(e) => onUpdate(index, { label: e.target.value })} placeholder="Label im Callout" />
            <select className="vs-input" value={spec.region || "Herz"} onChange={(e) => onUpdate(index, { region: e.target.value })} style={{ maxWidth: 160 }}>
              {["Knie", "Hüfte", "Schulter", "Rücken", "Wade", "Oberschenkel", "Herz", "Sehne"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Tab: Grafiken ----------
function Grafiken({ script, timedAnimations = [], videoFormat = "9:16", videoPosition = "bottom" }) {
  const [specs, setSpecs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [format, setFormat] = useState(videoFormat);
  const [position, setPosition] = useState(videoPosition);

  // Modus: "transcript" wenn timedAnimations vorhanden, sonst "script"
  const mode = timedAnimations.length > 0 ? "transcript" : "script";

  // Wenn sich timedAnimations ändert (neues Video transkribiert):
  // Specs automatisch aus TimedAnimations befüllen
  useEffect(() => {
    if (timedAnimations.length === 0) return;
    setFormat(videoFormat);
    setPosition(videoPosition);
    const newSpecs = timedAnimations.filter((t) => t.matched).map((t) => {
      const base = { beat: t.beat, startTime: t.startTime, confidence: t.confidence };
      if (t.libraryId) {
        return { ...base, typ: "library", libraryId: t.libraryId, props: t.props || {} };
      }
      // Kein Library-Match → TextCard aus Einblendungs-Text
      return { ...base, typ: "text", kicker: (t.beat || "").toUpperCase(), headline: t.einblendung || "", sub: "" };
    });
    setSpecs(newSpecs);
  }, [timedAnimations]);

  const einblendungen = (script?.body || []).map((b) => ({ beat: b.beat, text: b.einblendung })).filter((e) => e.text);

  async function buildAll() {
    if (!einblendungen.length) return;
    setBusy(true); setErr("");

    // 1. Auto-Match: Bibliothek zuerst prüfen
    const preMatched = einblendungen.map((e) => {
      const match = matchToLibrary(e.text + " " + e.beat);
      return match ? { typ: "library", libraryId: match.id, beat: e.beat, _libName: match.name } : null;
    });
    const needsClaude = preMatched.some((m) => m === null);

    // 2. Nur ungematchte Einblendungen an Claude schicken
    const unmatched = einblendungen.filter((_, i) => preMatched[i] === null);
    let claudeResults = [];
    if (needsClaude && unmatched.length > 0) {
      const libHint = LIBRARY.map((e) => `- library:${e.id} (${e.name}) → Tags: ${e.tags.slice(0,5).join(", ")}`).join("\n");
      const prompt = `Du gestaltest On-Screen-Overlays für ein Short-Form-Video (Sport/Gesundheit, Deutsch). Für jede Einblendung wähle den besten Overlay-Typ.

VERFÜGBARE ANIMATIONS-BIBLIOTHEK (bevorzuge diese wenn passend):
${libHint}

EINBLENDUNGEN:
${unmatched.map((e, i) => `${i + 1}. [${e.beat}] ${e.text}`).join("\n")}

Antworte AUSSCHLIESSLICH als reines JSON-Array (keine Fences), ein Objekt pro Einblendung:
- Bibliotheks-Animation: {"typ":"library","libraryId":"heart-pump|mitochondria|knee-joint","beat":"..."}
- Text: {"typ":"text","kicker":"kurzes Label (1-2 Worte, GROSS)","headline":"max 6 Worte","sub":"optional"}
- Stat: {"typ":"stat","kicker":"...","value":"Zahl","unit":"...","label":"...","bars":[...] (nur bei Vergleich)}
- Icon: {"typ":"icon","kicker":"...","label":"1-3 Worte","region":"Knie|Hüfte|Schulter|Rücken|Wade|Oberschenkel|Herz|Sehne"}
Bibliotheks-Animationen haben Vorrang vor Icon wenn das Thema passt.`;
      try {
        claudeResults = await callClaude(prompt, 2500);
        if (!Array.isArray(claudeResults)) claudeResults = [];
      } catch (e) { setErr("Konnte Grafiken nicht erzeugen: " + e.message); setBusy(false); return; }
    }

    // 3. Ergebnisse zusammenführen
    let claudeIdx = 0;
    const merged = einblendungen.map((e, i) => {
      if (preMatched[i]) return { ...preMatched[i] };
      const r = claudeResults[claudeIdx++] || { typ: "text", kicker: e.beat, headline: e.text, sub: "" };
      return { ...r, beat: e.beat };
    });
    setSpecs(merged);
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
      {/* Modus-Banner */}
      {mode === "transcript" ? (
        <div style={{ padding: "10px 16px", background: "rgba(204,255,0,0.07)", border: "1px solid rgba(204,255,0,0.2)", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--volt)", letterSpacing: "0.08em" }}>◆ TRANSCRIPT-MODUS</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Animationen sind auf dein transkribiertes Video abgestimmt — Zeitstempel automatisch gesetzt.</span>
          <button onClick={() => { setSpecs([]); }} style={{ marginLeft: "auto", fontFamily: "Space Mono", fontSize: 10, padding: "3px 10px", borderRadius: 10, background: "none", border: "1px solid var(--line)", color: "var(--muted)", cursor: "pointer" }}>
            Script-Modus
          </button>
        </div>
      ) : (
        <div style={{ padding: "10px 16px", background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>○ SCRIPT-MODUS</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Basiert auf Skript-Beats. Transkribiere ein Video im Schnitt-Tab für automatische Timestamps.</span>
        </div>
      )}

      {/* Format + Position + Generate */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex gap-3 flex-wrap items-center">
          <div style={{ display: "flex", gap: 6 }}>
            {["9:16", "16:9"].map((f) => (
              <button key={f} onClick={() => setFormat(f)} style={{
                fontFamily: "Space Mono", fontSize: 11, padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${format === f ? "var(--volt)" : "var(--line)"}`,
                background: format === f ? "var(--volt)" : "var(--panel-2)",
                color: format === f ? "var(--bg)" : "var(--muted)", cursor: "pointer", letterSpacing: "0.06em",
              }}>{f} {f === "9:16" ? "TikTok/Reels" : "YouTube"}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["bottom", "↓ Unten"], ["top", "↑ Oben"]].map(([p, lbl]) => (
              <button key={p} onClick={() => setPosition(p)} style={{
                fontFamily: "Space Mono", fontSize: 11, padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${position === p ? "var(--volt)" : "var(--line)"}`,
                background: position === p ? "var(--volt)" : "var(--panel-2)",
                color: position === p ? "var(--bg)" : "var(--muted)", cursor: "pointer",
              }}>{lbl}</button>
            ))}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 12, margin: 0 }}>
            {mode === "transcript" ? `${specs.length} Animation(en) aus Transkript` : `${einblendungen.length} Einblendung(en) aus Skript`}
          </p>
        </div>
        {mode === "script" && (
          <button className="vs-btn" onClick={buildAll} disabled={busy || !einblendungen.length}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> Erzeuge…</> : <><Sparkles size={16} /> Grafiken erzeugen</>}
          </button>
        )}
      </div>
      {err && <p style={{ color: "var(--signal)", fontSize: 12, marginBottom: 12 }}>{err}</p>}

      <div className="grid md:grid-cols-2 gap-6" style={{ gap: 24 }}>
        {specs.map((spec, i) => (
          <OverlayCard key={i} spec={spec} index={i} onUpdate={updateSpec} format={format} position={position} />
        ))}
      </div>
    </div>
  );
}
