import { useState, useEffect } from "react";
import { Loader2, X, Plus, Save, Sparkles, FolderPlus } from "lucide-react";
import { callClaude } from "../lib/claude.js";

function metaPrompt(out, folders) {
  const hooks = (out.hooks || []).map((h) => h.gesprochen).filter(Boolean).join(" / ");
  const body = (out.body || []).map((b) => b.text).filter(Boolean).join(" ");
  return `Analysiere dieses Short-Form-Video-Skript (Nische Sport & Gesundheit, Deutsch) und erzeuge Speicher-Metadaten, damit man es später per Suche gut wiederfindet.

HOOKS: ${hooks || "—"}
INHALT (Beats): ${(body || "—").slice(0, 1500)}
CTA: ${out.cta || "—"}

BESTEHENDE ORDNER: ${folders.length ? folders.join(", ") : "(noch keine)"}

Erzeuge:
- "name": kurzer, prägnanter Projektname (max 6 Wörter)
- "description": 1-2 Sätze, worum es geht (für die spätere Suche)
- "tags": 4-8 treffende Keywords/Tags (je 1-2 Wörter, frei formuliert)
- "folder": der am besten passende ORDNER — bevorzugt aus den bestehenden Ordnern, sonst ein sinnvoller neuer Ordnername (Thema/Kategorie)

Antworte AUSSCHLIESSLICH als reines JSON (keine Fences):
{"name":"…","description":"…","tags":["…"],"folder":"…"}`;
}

export function SaveProjectModal({ open, out, folders, defaultName, onCreateFolder, onConfirm, onClose }) {
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("Unsortiert");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Beim Öffnen: Claude schlägt Name, Beschreibung, Tags und Ordner vor
  useEffect(() => {
    if (!open || !out) return;
    setName(defaultName || ""); setFolder("Unsortiert"); setDescription(""); setTags([]); setErr(""); setAddingFolder(false); setNewFolder("");
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const a = await callClaude(metaPrompt(out, folders), 700);
        if (cancelled) return;
        if (a.name) setName(a.name);
        if (a.description) setDescription(a.description);
        if (Array.isArray(a.tags)) setTags(a.tags.map((t) => String(t).trim()).filter(Boolean));
        if (a.folder) {
          const sugg = String(a.folder).trim();
          // neuen Ordner-Vorschlag direkt anlegen, falls noch nicht vorhanden
          if (sugg && !folders.includes(sugg)) onCreateFolder(sugg);
          setFolder(sugg || "Unsortiert");
        }
      } catch (e) {
        if (!cancelled) setErr("Auto-Vorschlag fehlgeschlagen — bitte manuell ausfüllen. " + e.message);
      } finally { if (!cancelled) setBusy(false); }
    })();
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  function addTag() { const t = tagInput.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(""); }
  function removeTag(t) { setTags(tags.filter((x) => x !== t)); }
  function createFolder() {
    const n = newFolder.trim();
    if (!n) return;
    onCreateFolder(n);
    setFolder(n); setNewFolder(""); setAddingFolder(false);
  }
  function confirm() {
    if (!name.trim()) { setErr("Bitte einen Projektnamen vergeben."); return; }
    onConfirm({ name: name.trim(), folder: folder || "Unsortiert", description: description.trim(), tags });
  }

  const allFolders = folders.includes(folder) || !folder ? folders : [folder, ...folders];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 1000, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="vs-panel" style={{ padding: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "auto" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="section-head" style={{ margin: 0 }}><Save size={15} /> Projekt speichern</div>
          <button className="vs-ghost" onClick={onClose} style={{ padding: "6px 8px" }}><X size={15} /></button>
        </div>

        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--volt)", fontFamily: "Space Mono", marginBottom: 14 }}>
            <Loader2 size={14} className="animate-spin" /> Claude erzeugt Name, Beschreibung, Tags & Ordner-Vorschlag…
          </div>
        )}

        <span className="mono-label">Projektname</span>
        <input className="vs-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. VO2max in 30s erklärt" style={{ marginBottom: 14 }} />

        <span className="mono-label">Ordner</span>
        <div className="flex gap-2" style={{ marginBottom: addingFolder ? 8 : 14 }}>
          <select value={folder} onChange={(e) => setFolder(e.target.value)} className="vs-input">
            {allFolders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button className="vs-ghost" onClick={() => setAddingFolder((a) => !a)} title="Neuen Ordner anlegen" style={{ flexShrink: 0 }}><FolderPlus size={15} /></button>
        </div>
        {addingFolder && (
          <div className="flex gap-2" style={{ marginBottom: 14 }}>
            <input className="vs-input" value={newFolder} onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createFolder(); }} placeholder="Neuer Ordnername…" autoFocus />
            <button className="vs-btn" onClick={createFolder} style={{ padding: "0 16px", fontSize: 13 }}><Plus size={14} /> Anlegen</button>
          </div>
        )}

        <span className="mono-label">Beschreibung (für die Suche)</span>
        <textarea className="vs-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Worum geht es? 1-2 Sätze." style={{ marginBottom: 14 }} />

        <span className="mono-label">Tags</span>
        <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
          {tags.map((t) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8, background: "rgba(204,255,0,0.1)", border: "1px solid rgba(204,255,0,0.3)", color: "var(--volt)", fontSize: 12, fontFamily: "Space Mono" }}>
              {t}<X size={12} style={{ cursor: "pointer" }} onClick={() => removeTag(t)} />
            </span>
          ))}
          {tags.length === 0 && !busy && <span style={{ fontSize: 12, color: "var(--muted)" }}>— noch keine —</span>}
        </div>
        <input className="vs-input" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder="Tag hinzufügen + Enter" style={{ fontSize: 13, marginBottom: 18 }} />

        {err && <p style={{ color: "var(--signal)", fontSize: 12, marginBottom: 12 }}>{err}</p>}

        <div className="flex justify-end gap-2">
          <button className="vs-ghost" onClick={onClose} disabled={busy}>Abbrechen</button>
          <button className="vs-btn" onClick={confirm} disabled={busy} style={{ padding: "11px 18px" }}>
            <Save size={15} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
