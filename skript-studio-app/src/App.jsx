import React, { useState, useEffect } from "react";
import { FlaskConical, Sparkles, User, BookMarked } from "lucide-react";
import { store } from "./lib/store.js";
import { GlobalStyles } from "./components/GlobalStyles.jsx";
import { Generator } from "./components/Generator.jsx";
import { BrandVoice } from "./components/BrandVoice.jsx";
import { Projekte } from "./components/Projekte.jsx";

export default function App() {
  const [tab, setTab] = useState("gen");
  const [topics, setTopics] = useState([]);
  const [brandVoice, setBrandVoice] = useState("");
  const [usedHooks, setUsedHooks] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [projectToLoad, setProjectToLoad] = useState(null);

  useEffect(() => {
    (async () => {
      setTopics((await store.get("vsg:topics")) || []);
      setBrandVoice((await store.get("vsg:brandvoice")) || "");
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
      <GlobalStyles />

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
          <div className={`tab ${tab === "projekte" ? "on" : ""}`} onClick={() => setTab("projekte")}><BookMarked size={14} />Projekte{savedProjects.length > 0 && <span style={{ marginLeft: 4, background: "var(--volt)", color: "var(--bg)", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontFamily: "Space Mono" }}>{savedProjects.length}</span>}</div>
        </div>

        {/* Alle Tabs bleiben gemountet – nur per CSS ein-/ausgeblendet, so bleibt der State erhalten */}
        <div style={{ display: tab === "gen" ? "" : "none" }}>
          <Generator topics={topics} setTopics={setTopics} brandVoice={brandVoice} usedHooks={usedHooks} setUsedHooks={setUsedHooks} onSaveProject={saveProject} projectToLoad={projectToLoad} onProjectLoaded={() => setProjectToLoad(null)} />
        </div>
        <div style={{ display: tab === "voice" ? "" : "none" }}>
          <BrandVoice brandVoice={brandVoice} setBrandVoice={setBrandVoice} />
        </div>
        <div style={{ display: tab === "projekte" ? "" : "none" }}>
          <Projekte savedProjects={savedProjects} onLoad={loadProject} onDelete={deleteProject} />
        </div>
      </div>
    </div>
  );
}
