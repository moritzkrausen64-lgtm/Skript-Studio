import { useState } from "react";
import { User, Trash2, Search, X, Loader2, Star, Pencil, Sparkles } from "lucide-react";
import { callClaude } from "../lib/claude.js";

const TAG_PROMPT = (text) => `Analysiere die folgende Markenstimme — das sind Beispiel-Skripte/Texte eines Short-Form-Video-Creators in der Nische Sport & Gesundheit (Physiotherapeut & Sportler, Deutsch, Du-Form).

Erzeuge:
- "name": einen kurzen, prägnanten Namen für diese Stimme (max 4 Wörter)
- "tags": 3-6 treffende, sinnvolle Tags (z.B. Tonfall, Nische, Format, Zielgruppe — wähle die aussagekräftigsten, frei formuliert, je 1-2 Wörter)
- "profile": ein Stilprofil in EINEM Satz (Tonfall, Satzlänge, typisches Vokabular)

Antworte AUSSCHLIESSLICH als reines JSON (keine Fences):
{"name":"…","tags":["…"],"profile":"…"}

MARKENSTIMME:
${text}`;

export function BrandVoice({ brandVoices, onSave, onDelete, activeBrandVoiceId, onSetActive }) {
  const [editing, setEditing] = useState(null); // id des bearbeiteten Eintrags, oder null
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [profile, setProfile] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  function resetForm() { setEditing(null); setName(""); setText(""); setTags([]); setProfile(""); setTagInput(""); setErr(""); }
  function startEdit(b) {
    setEditing(b.id); setName(b.name || ""); setText(b.text || ""); setTags(b.tags || []); setProfile(b.profile || ""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addTag() { const t = tagInput.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(""); }
  function removeTag(t) { setTags(tags.filter((x) => x !== t)); }

  // Claude: Name, Tags & Stilprofil aus dem Text ableiten
  async function autoFill() {
    if (!text.trim()) { setErr("Bitte zuerst den Text der Markenstimme einfügen."); return; }
    setBusy(true); setErr("");
    try {
      const a = await callClaude(TAG_PROMPT(text), 600);
      if (a.name) setName(a.name);
      if (Array.isArray(a.tags)) setTags(a.tags.map((t) => String(t).trim()).filter(Boolean));
      if (a.profile) setProfile(a.profile);
    } catch (e) { setErr("Auto-Tagging fehlgeschlagen: " + e.message); }
    setBusy(false);
  }

  async function save() {
    if (!text.trim()) { setErr("Bitte einen Text für die Markenstimme einfügen."); return; }
    setBusy(true); setErr("");
    let finalName = name.trim(), finalTags = tags, finalProfile = profile;
    // Name oder Tags fehlen → Claude ergänzt automatisch
    if (!finalName || finalTags.length === 0) {
      try {
        const a = await callClaude(TAG_PROMPT(text), 600);
        if (!finalName) finalName = a.name || "Markenstimme";
        if (finalTags.length === 0) finalTags = Array.isArray(a.tags) ? a.tags.map((t) => String(t).trim()).filter(Boolean) : [];
        if (!finalProfile && a.profile) finalProfile = a.profile;
      } catch (e) {
        if (!finalName) finalName = "Markenstimme";
        setErr("Auto-Tagging fehlgeschlagen — gespeichert ohne Tags. " + e.message);
      }
    }
    const now = Date.now();
    const orig = editing ? brandVoices.find((b) => b.id === editing) : null;
    const entry = {
      id: editing || now,
      name: finalName,
      text: text.trim(),
      tags: finalTags,
      profile: finalProfile,
      createdAt: orig?.createdAt || now,
      updatedAt: now,
    };
    await onSave(entry);
    setBusy(false);
    resetForm();
  }

  const filtered = brandVoices.filter((b) => {
    if (!q.trim()) return true;
    const hay = `${b.name} ${(b.tags || []).join(" ")} ${b.profile || ""} ${b.text}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every((term) => hay.includes(term));
  });

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-7">
      {/* ── Editor ── */}
      <div className="vs-panel" style={{ padding: 22, alignSelf: "start" }}>
        <div className="section-head"><User size={15} /> {editing ? "Markenstimme bearbeiten" : "Neue Markenstimme"}</div>
        <p style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 14, lineHeight: 1.5 }}>
          Füge 2–5 deiner besten eigenen Skripte/Posts ein. Beim Speichern vergibt Claude automatisch Name, Tags und ein Stilprofil — alles überschreibbar.
        </p>

        <span className="mono-label">Name (optional — Claude schlägt vor)</span>
        <input className="vs-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Locker-Physio" style={{ marginBottom: 14 }} />

        <span className="mono-label">Markenstimme (Beispiel-Texte)</span>
        <textarea className="vs-input" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Beispiel-Skripte hier einfügen…" />
        <div style={{ fontFamily: "Space Mono", fontSize: 10, color: "var(--muted)", textAlign: "right", marginTop: 4 }}>
          {text.trim() ? `${text.trim().split(/\s+/).length} Wörter · ${text.length} Zeichen` : "leer"}
        </div>

        <span className="mono-label" style={{ marginTop: 12 }}>Tags</span>
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
          {tags.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8, background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", color: "var(--volt)", fontSize: 12, fontFamily: "Space Mono" }}>
              {t}<X size={12} style={{ cursor: "pointer" }} onClick={() => removeTag(t)} />
            </span>
          ))}
          {tags.length === 0 && <span style={{ fontSize: 12, color: "var(--muted)" }}>— noch keine —</span>}
        </div>
        <div className="flex gap-2">
          <input className="vs-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Tag hinzufügen + Enter" style={{ fontSize: 13 }} />
          <button className="vs-ghost" onClick={autoFill} disabled={busy} title="Name, Tags & Profil von Claude erzeugen" style={{ flexShrink: 0 }}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
        </div>

        {profile && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "var(--panel-2)", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--ink)" }}>Stilprofil:</b> {profile}
          </div>
        )}

        <div className="flex gap-2" style={{ marginTop: 16 }}>
          <button className="vs-btn" onClick={save} disabled={busy} style={{ flex: 1 }}>
            {busy ? <><Loader2 size={15} className="animate-spin" /> Speichere…</> : (editing ? "Änderungen speichern" : "Markenstimme speichern")}
          </button>
          {editing && <button className="vs-ghost" onClick={resetForm} disabled={busy}>Abbrechen</button>}
        </div>
        {err && <p style={{ color: "var(--signal)", fontSize: 12, marginTop: 10 }}>{err}</p>}
      </div>

      {/* ── Bibliothek ── */}
      <div>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input className="vs-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Markenstimmen durchsuchen (Name, Tags, Inhalt)…" style={{ paddingLeft: 36 }} />
        </div>

        {brandVoices.length === 0 ? (
          <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
            <User size={40} style={{ margin: "0 auto 14px", color: "var(--line)" }} />
            <p style={{ fontFamily: "Anton", fontSize: 20, color: "var(--ink)", letterSpacing: ".03em" }}>NOCH KEINE MARKENSTIMME</p>
            <p style={{ fontSize: 13 }}>Lege links deine erste Markenstimme an — sie steuert Ton & Stil im Generator.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="vs-panel" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Keine Treffer für „{q}".</div>
        ) : (
          <div className="space-y-4">
            <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Space Mono" }}>{filtered.length} von {brandVoices.length} Markenstimme(n)</p>
            {filtered.map((b) => {
              const active = b.id === activeBrandVoiceId;
              return (
                <div key={b.id} className="vs-panel" style={{ padding: 18, borderColor: active ? "var(--volt)" : "var(--line)" }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                        <span style={{ fontFamily: "Anton", fontSize: 17, letterSpacing: ".03em" }}>{b.name}</span>
                        {active && <span style={{ fontFamily: "Space Mono", fontSize: 9, padding: "2px 7px", borderRadius: 8, background: "var(--volt)", color: "var(--bg)", letterSpacing: "0.08em" }}>AKTIV</span>}
                      </div>
                      {b.profile && <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, marginBottom: 8 }}>{b.profile}</div>}
                      <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
                        {(b.tags || []).map((t) => (
                          <span key={t} style={{ padding: "3px 8px", borderRadius: 8, background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontFamily: "Space Mono", cursor: "pointer" }}
                            onClick={() => setQ(t)} title="Nach diesem Tag filtern">#{t}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, maxHeight: 42, overflow: "hidden" }}>{b.text}</div>
                    </div>
                    <div className="flex gap-2" style={{ flexShrink: 0 }}>
                      <button className="vs-ghost" onClick={() => onSetActive(b.id)} title={active ? "Aktiv" : "Als aktiv setzen"} style={{ padding: "7px 9px", color: active ? "var(--volt)" : "var(--muted)" }}>
                        <Star size={14} fill={active ? "var(--volt)" : "none"} />
                      </button>
                      <button className="vs-ghost" onClick={() => startEdit(b)} title="Bearbeiten" style={{ padding: "7px 9px" }}><Pencil size={14} /></button>
                      <button className="vs-ghost" onClick={() => onDelete(b.id)} title="Löschen" style={{ padding: "7px 9px", color: "var(--signal)", borderColor: "var(--signal)" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
