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
  const [brandVoices, setBrandVoices] = useState([]);
  const [activeBrandVoiceId, setActiveBrandVoiceId] = useState(null);
  const [usedHooks, setUsedHooks] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [projectFolders, setProjectFolders] = useState(["Unsortiert"]);
  const [projectToLoad, setProjectToLoad] = useState(null);

  useEffect(() => {
    (async () => {
      setTopics((await store.get("vsg:topics")) || []);
      setUsedHooks((await store.get("vsg:usedhooks")) || []);
      const projs = (await store.get("vsg:projects")) || [];
      setSavedProjects(projs);

      // Ordner laden (+ Ordner aus bestehenden Projekten ergänzen, "Unsortiert" immer dabei)
      let folders = (await store.get("vsg:projectfolders")) || [];
      const fromProjects = projs.map((p) => p.folder).filter(Boolean);
      folders = Array.from(new Set(["Unsortiert", ...folders, ...fromProjects]));
      setProjectFolders(folders);
      await store.set("vsg:projectfolders", folders);

      // Markenstimmen laden (+ Migration der alten Einzel-Markenstimme)
      let bvs = (await store.get("vsg:brandvoices")) || [];
      let active = await store.get("vsg:activeBrandVoice");
      if (bvs.length === 0) {
        const old = await store.get("vsg:brandvoice");
        if (old && old.trim()) {
          const now = Date.now();
          const entry = { id: now, name: "Meine Markenstimme", text: old, tags: [], profile: "", createdAt: now, updatedAt: now };
          bvs = [entry]; active = now;
          await store.set("vsg:brandvoices", bvs);
          await store.set("vsg:activeBrandVoice", active);
        }
      }
      setBrandVoices(bvs);
      setActiveBrandVoiceId(active || bvs[0]?.id || null);
    })();
  }, []);

  async function saveBrandVoice(entry) {
    const exists = brandVoices.some((b) => b.id === entry.id);
    const next = exists ? brandVoices.map((b) => (b.id === entry.id ? entry : b)) : [entry, ...brandVoices];
    setBrandVoices(next);
    await store.set("vsg:brandvoices", next);
    if (!activeBrandVoiceId) { setActiveBrandVoiceId(entry.id); await store.set("vsg:activeBrandVoice", entry.id); }
  }

  async function deleteBrandVoice(id) {
    const next = brandVoices.filter((b) => b.id !== id);
    setBrandVoices(next);
    await store.set("vsg:brandvoices", next);
    if (activeBrandVoiceId === id) {
      const na = next[0]?.id || null;
      setActiveBrandVoiceId(na);
      await store.set("vsg:activeBrandVoice", na);
    }
  }

  async function setActiveBrandVoice(id) {
    setActiveBrandVoiceId(id);
    await store.set("vsg:activeBrandVoice", id);
  }

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

  async function createProjectFolder(name) {
    const n = String(name || "").trim();
    if (!n || projectFolders.includes(n)) return;
    const next = [...projectFolders, n];
    setProjectFolders(next);
    await store.set("vsg:projectfolders", next);
  }

  async function setProjectFolder(id, folder) {
    const next = savedProjects.map((p) => (p.id === id ? { ...p, folder } : p));
    setSavedProjects(next);
    await store.set("vsg:projects", next);
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
          <Generator topics={topics} setTopics={setTopics} brandVoices={brandVoices} activeBrandVoiceId={activeBrandVoiceId} usedHooks={usedHooks} setUsedHooks={setUsedHooks} projectFolders={projectFolders} onCreateFolder={createProjectFolder} onSaveProject={saveProject} projectToLoad={projectToLoad} onProjectLoaded={() => setProjectToLoad(null)} />
        </div>
        <div style={{ display: tab === "voice" ? "" : "none" }}>
          <BrandVoice brandVoices={brandVoices} onSave={saveBrandVoice} onDelete={deleteBrandVoice} activeBrandVoiceId={activeBrandVoiceId} onSetActive={setActiveBrandVoice} />
        </div>
        <div style={{ display: tab === "projekte" ? "" : "none" }}>
          <Projekte savedProjects={savedProjects} folders={projectFolders} onLoad={loadProject} onDelete={deleteProject} onSetFolder={setProjectFolder} onCreateFolder={createProjectFolder} />
        </div>
      </div>
    </div>
  );
}
