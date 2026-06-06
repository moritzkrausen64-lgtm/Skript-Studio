import { useState } from "react";
import { BookMarked, RefreshCw, Trash2, Search, FolderPlus, Plus, Folder } from "lucide-react";

export function Projekte({ savedProjects, folders = [], onLoad, onDelete, onSetFolder, onCreateFolder }) {
  const [q, setQ] = useState("");
  const [activeFolder, setActiveFolder] = useState("Alle");
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolder, setNewFolder] = useState("");

  const folderOf = (p) => p.folder || "Unsortiert";
  const allFolders = Array.from(new Set(["Unsortiert", ...folders, ...savedProjects.map(folderOf)]));
  const countIn = (f) => savedProjects.filter((p) => folderOf(p) === f).length;

  const filtered = savedProjects.filter((p) => {
    if (activeFolder !== "Alle" && folderOf(p) !== activeFolder) return false;
    if (!q.trim()) return true;
    const hay = `${p.name || ""} ${p.topicName || ""} ${p.description || ""} ${(p.tags || []).join(" ")} ${p.out?.hooks?.[0]?.gesprochen || ""}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every((term) => hay.includes(term));
  });

  function createFolder() {
    const n = newFolder.trim();
    if (!n) return;
    onCreateFolder?.(n);
    setActiveFolder(n); setNewFolder(""); setAddingFolder(false);
  }

  if (savedProjects.length === 0) {
    return (
      <div className="vs-panel" style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
        <BookMarked size={40} style={{ margin: "0 auto 14px", color: "var(--line)" }} />
        <p style={{ fontFamily: "Anton", fontSize: 20, color: "var(--ink)", letterSpacing: ".03em" }}>NOCH KEINE PROJEKTE</p>
        <p style={{ fontSize: 13 }}>Generiere ein Skript im Generator und klicke „Skript speichern".</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[230px_1fr] gap-7">
      {/* ── Ordner-Spalte ── */}
      <div style={{ alignSelf: "start" }}>
        <div className="mono-label" style={{ marginBottom: 10 }}>Ordner</div>
        <div className="space-y-2">
          <FolderItem label="Alle" count={savedProjects.length} active={activeFolder === "Alle"} onClick={() => setActiveFolder("Alle")} all />
          {allFolders.map((f) => (
            <FolderItem key={f} label={f} count={countIn(f)} active={activeFolder === f} onClick={() => setActiveFolder(f)} />
          ))}
        </div>
        {addingFolder ? (
          <div className="flex gap-2" style={{ marginTop: 10 }}>
            <input className="vs-input" value={newFolder} onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createFolder(); }} placeholder="Name…" autoFocus style={{ fontSize: 13 }} />
            <button className="vs-btn" onClick={createFolder} style={{ padding: "0 12px", fontSize: 12 }}><Plus size={13} /></button>
          </div>
        ) : (
          <button className="vs-ghost" onClick={() => setAddingFolder(true)} style={{ marginTop: 10, width: "100%", justifyContent: "center" }}>
            <FolderPlus size={14} /> Neuer Ordner
          </button>
        )}
      </div>

      {/* ── Projekte ── */}
      <div>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input className="vs-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Projekte durchsuchen (Name, Tags, Beschreibung, Hook)…" style={{ paddingLeft: 36 }} />
        </div>

        {filtered.length === 0 ? (
          <div className="vs-panel" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Keine Projekte {q ? `für „${q}"` : `im Ordner „${activeFolder}"`}.
          </div>
        ) : (
          <div className="space-y-4">
            <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Space Mono" }}>{filtered.length} Projekt(e){activeFolder !== "Alle" ? ` · ${activeFolder}` : ""}</p>
            {filtered.map((p) => (
              <div key={p.id} className="vs-panel" style={{ padding: 20 }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                      <span style={{ fontFamily: "Anton", fontSize: 17, letterSpacing: ".03em" }}>{p.name || p.topicName}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "Space Mono", fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)" }}>
                        <Folder size={10} /> {folderOf(p)}
                      </span>
                    </div>
                    <div style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
                      {p.savedAt} · {p.cfg?.plattform} · {p.cfg?.typ} · {p.cfg?.laenge}{p.brandVoiceName ? ` · 🎙 ${p.brandVoiceName}` : ""}
                    </div>
                    {p.description && <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>}
                    {(p.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-2" style={{ marginBottom: 8 }}>
                        {p.tags.map((t) => (
                          <span key={t} onClick={() => setQ(t)} title="Nach diesem Tag filtern"
                            style={{ padding: "3px 8px", borderRadius: 8, background: "var(--panel-2)", border: "1px solid var(--line)", color: "var(--muted)", fontSize: 11, fontFamily: "Space Mono", cursor: "pointer" }}>#{t}</span>
                        ))}
                      </div>
                    )}
                    {p.out?.hooks?.[0] && (
                      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
                        <span style={{ color: "var(--volt)", fontWeight: 700 }}>Hook: </span>„{p.out.hooks[0].gesprochen}"
                      </div>
                    )}
                    {p.out?.rating?.gesamt != null && (
                      <div style={{ marginTop: 8, fontFamily: "Space Mono", fontSize: 11, color: p.out.rating.gesamt >= 70 ? "var(--volt)" : p.out.rating.gesamt >= 45 ? "#ffd84d" : "var(--signal)" }}>
                        Reichweiten-Score: {p.out.rating.gesamt}/100
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2" style={{ flexShrink: 0, alignItems: "stretch" }}>
                    <button className="vs-btn" style={{ fontSize: 12, padding: "8px 14px" }} onClick={() => onLoad(p)}>
                      <RefreshCw size={13} /> Laden
                    </button>
                    <select value={folderOf(p)} onChange={(e) => onSetFolder?.(p.id, e.target.value)} className="vs-input"
                      title="In Ordner verschieben" style={{ fontSize: 12, padding: "6px 8px" }}>
                      {allFolders.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <button className="vs-ghost" style={{ color: "var(--signal)", borderColor: "var(--signal)", justifyContent: "center" }} onClick={() => onDelete(p.id)}>
                      <Trash2 size={13} /> Löschen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FolderItem({ label, count, active, onClick, all }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between"
      style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13,
        background: active ? "rgba(204,255,0,0.1)" : "var(--panel)", border: `1px solid ${active ? "var(--volt)" : "var(--line)"}`,
        color: active ? "var(--volt)" : "var(--ink)" }}>
      <span className="flex items-center gap-2" style={{ minWidth: 0 }}>
        {!all && <Folder size={13} style={{ flexShrink: 0 }} />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      </span>
      <span style={{ fontFamily: "Space Mono", fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{count}</span>
    </div>
  );
}
