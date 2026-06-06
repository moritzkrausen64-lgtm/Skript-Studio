import { BookMarked, RefreshCw, Trash2 } from "lucide-react";

export function Projekte({ savedProjects, onLoad, onDelete }) {
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
