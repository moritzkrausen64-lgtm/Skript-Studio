import React, { useState, useEffect } from "react";
import { Loader2, FolderOpen, Zap, Plus, Sparkles, AlertTriangle, FlaskConical, Check, Save } from "lucide-react";
import { store } from "../lib/store.js";
import { callClaude } from "../lib/claude.js";
import { VIDEO_TYPEN, HOOK_EBENEN, HOOK_ARCHETYPEN, FRAMEWORKS, LAENGEN, TON, CTA_ZIELE, CLAIM_STUFEN, PLATTFORM, DETAIL_OPTS, BILD_OPTS, DETAIL_HINT, BILD_HINT, BILD_RULE } from "../lib/options.js";
import { Field, Select } from "./ui.jsx";
import { ScriptOutput } from "./ScriptOutput.jsx";

export function Generator({ topics, setTopics, brandVoices = [], activeBrandVoiceId, usedHooks, setUsedHooks, onSaveProject, projectToLoad, onProjectLoaded }) {
  const [sel, setSel] = useState("");
  const [selBV, setSelBV] = useState(activeBrandVoiceId || "");
  // Default folgt der aktiven Markenstimme, bleibt aber pro Skript umschaltbar
  useEffect(() => { setSelBV(activeBrandVoiceId || ""); }, [activeBrandVoiceId]);
  const brandVoiceText = brandVoices.find((b) => b.id === selBV)?.text || "";
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
      brandVoiceName: brandVoices.find((b) => b.id === selBV)?.name || null,
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
    // Geladenes Dokument automatisch als Thema wählen (Schritt "Thema wählen" entfällt)
    if (docs.length) {
      const first = merged.find((t) => t.name === docs[0].name);
      if (first) setSel(String(first.id));
    }
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
      // Geladenes Dokument automatisch als Thema wählen (Schritt "Thema wählen" entfällt)
      if (docs.length) {
        const first = merged.find((t) => t.name === docs[0].name);
        if (first) setSel(String(first.id));
      }
      setFolderInfo(
        docs.length
          ? `${docs.length} Dokument(e) eingelesen.` + (data.skipped?.length ? ` (${data.skipped.length} ignoriert)` : "")
          : "Keine lesbaren Dokumente (.txt/.md/.docx/.pdf) im Ordner gefunden."
      );
    } catch (e) { setErr(e.message); }
    setLoadingFolder(false);
  }

  async function generate() {
    // Fallback: kein Thema gewählt, aber genau eines vorhanden → dieses nutzen
    const topic = topics.find((t) => String(t.id) === sel) || (topics.length === 1 ? topics[0] : null);
    if (!topic) { setErr("Bitte einen Recherche-Ordner einlesen oder ein Thema wählen."); return; }
    setBusy(true); setErr(""); setOut(null);
    const prompt = `Du bist Experte für virales Short-Form-Video (TikTok/Reels) in der Nische Sport & Gesundheit (Laufen, Krafttraining, Supplemente, Hybridathletik). Der Creator ist Physiotherapeut und Sportler. Sprache: ausschließlich Deutsch, Du-Form.

RECHERCHE-GRUNDLAGE (Thema "${topic.name}"):
${topic.text}

${brandVoiceText ? `MARKENSTIMME (schreibe genau in diesem Stil/Ton):\n${brandVoiceText}\n` : ""}
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

${brandVoiceText ? `MARKENSTIMME (in diesem Stil bleiben):\n${brandVoiceText}\n` : ""}${topic ? `RECHERCHE-GRUNDLAGE:\n${topic.text.slice(0, 4000)}\n` : ""}
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

${brandVoiceText ? `MARKENSTIMME (Ton beibehalten):\n${brandVoiceText}\n` : ""}${topic ? `RECHERCHE-GRUNDLAGE (Faktencheck strikt dagegen):\n${topic.text.slice(0, 5000)}\n` : ""}
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

        <Field label="Markenstimme">
          <select value={selBV} onChange={(e) => setSelBV(e.target.value)} className="vs-input">
            <option value="">— keine —</option>
            {brandVoices.map((b) => (
              <option key={b.id} value={b.id}>{b.name}{b.id === activeBrandVoiceId ? " (aktiv)" : ""}</option>
            ))}
          </select>
        </Field>

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
