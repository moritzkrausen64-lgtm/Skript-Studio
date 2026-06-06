// ===========================================================================
//  Skript-Studio – lokaler Backend-Server (Express)
//  Aufgaben:
//   1. Recherche-Ordner von der Festplatte lesen (.txt/.md/.docx/.pdf)
//   2. Anthropic-API aufrufen (Key NUR hier, aus .env – nie im Frontend)
//   3. Lokale JSON-Speicherung (Markenstimme, virale Bibliothek, Hooks, Themen)
// ===========================================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import fssync from "fs";
import { exec } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { spawn } from "child_process";
import mammoth from "mammoth";
import Anthropic from "@anthropic-ai/sdk";
import { createRequire as _cr2 } from "module";
const _multerRequire = _cr2(import.meta.url);
const multer = _multerRequire("multer");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

// pdf-parse ist ein CommonJS-Modul; per createRequire direkt die Lib laden
// (umgeht den Debug-Block der index.js, der sonst beim Import eine Testdatei sucht).
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const DATA_DIR = path.join(__dirname, "..", "data");
const VIDEO_DIR = path.join(__dirname, "..", "videos");
const WHISPER_SCRIPT = path.join(__dirname, "..", "whisper", "transcribe.py");
const WHISPER_MODELS_DIR = path.join(__dirname, "..", "whisper", "models");
const VENV_PYTHON = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";
const PORT = process.env.PORT || 8787;
const apiKey = process.env.ANTHROPIC_API_KEY;
const WHISPER_MODEL = process.env.WHISPER_MODEL || "small";
const WHISPER_LANG = process.env.WHISPER_LANG || "de";
const VIDEO_EXT = [".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"];

const anthropic =
  apiKey && !apiKey.includes("DEIN-KEY") ? new Anthropic({ apiKey }) : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.mkdir(VIDEO_DIR, { recursive: true });

// Multer für Video-Uploads (speichert direkt in videos/)
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, VIDEO_DIR),
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, safe);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2 GB max
});

app.post("/api/upload-video", videoUpload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei empfangen." });
  console.log("[Upload] Video gespeichert:", req.file.filename);
  res.json({ filename: req.file.filename, size: req.file.size });
});

// ---------------------------------------------------------------------------
//  1. Claude-Proxy  – das Frontend ruft NUR diesen Endpunkt, nie Anthropic direkt
// ---------------------------------------------------------------------------
app.post("/api/claude", async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({
      error:
        "Kein gueltiger API-Key. Trage ANTHROPIC_API_KEY in die .env-Datei ein und starte den Server neu.",
    });
  }
  const { prompt, maxTokens = 3000 } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Kein Prompt uebergeben." });
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const text = (msg.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    res.json({ text });
  } catch (e) {
    console.error("Claude-Fehler:", e.message);
    res.status(500).json({ error: e.message || "API-Aufruf fehlgeschlagen." });
  }
});

// ---------------------------------------------------------------------------
//  2. Ordner einlesen  – gemischte Formate -> Klartext
// ---------------------------------------------------------------------------
const SUPPORTED = [".txt", ".md", ".docx", ".pdf"];

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt" || ext === ".md") return await fs.readFile(filePath, "utf8");
  if (ext === ".docx") {
    const r = await mammoth.extractRawText({ path: filePath });
    return r.value;
  }
  if (ext === ".pdf") {
    const buf = await fs.readFile(filePath);
    const r = await pdfParse(buf);
    return r.text;
  }
  return "";
}

app.get("/api/folder", async (req, res) => {
  const folder = req.query.path;
  if (!folder) return res.status(400).json({ error: "Kein Ordnerpfad angegeben." });
  try {
    const stat = await fs.stat(folder);
    if (!stat.isDirectory())
      return res.status(400).json({ error: "Der Pfad ist kein Ordner." });

    const entries = await fs.readdir(folder, { withFileTypes: true });
    const docs = [];
    const skipped = [];
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = path.extname(e.name).toLowerCase();
      if (!SUPPORTED.includes(ext)) {
        if (ext) skipped.push(e.name);
        continue;
      }
      try {
        const text = (await extractText(path.join(folder, e.name))).trim();
        if (text) docs.push({ name: path.basename(e.name, ext), file: e.name, text });
      } catch (err) {
        console.warn("Konnte nicht lesen:", e.name, "-", err.message);
        skipped.push(e.name);
      }
    }
    res.json({ docs, count: docs.length, skipped });
  } catch (e) {
    res
      .status(400)
      .json({ error: "Ordner nicht gefunden oder nicht lesbar: " + e.message });
  }
});

// ---------------------------------------------------------------------------
//  2b. Einzelne Datei extrahieren (Browser schickt Bytes, Server gibt Text zurück)
// ---------------------------------------------------------------------------
app.post("/api/extract-file", express.raw({ type: "*/*", limit: "50mb" }), async (req, res) => {
  const filename = decodeURIComponent(req.headers["x-filename"] || "file");
  const ext = path.extname(filename).toLowerCase();
  if (!SUPPORTED.includes(ext)) {
    return res.status(400).json({ error: `Nicht unterstütztes Format: ${ext}` });
  }
  try {
    let text = "";
    if (ext === ".txt" || ext === ".md") {
      text = req.body.toString("utf8");
    } else if (ext === ".docx") {
      const r = await mammoth.extractRawText({ buffer: req.body });
      text = r.value;
    } else if (ext === ".pdf") {
      const r = await pdfParse(req.body);
      text = r.text;
    }
    res.json({ text: text.trim() });
  } catch (e) {
    res.status(500).json({ error: "Konnte Datei nicht lesen: " + e.message });
  }
});

// ---------------------------------------------------------------------------
//  3. Lokale JSON-Speicherung (Key/Value)
// ---------------------------------------------------------------------------
function safeKey(key) {
  return key.replace(/[^a-zA-Z0-9_:-]/g, "_");
}

app.get("/api/store/:key", async (req, res) => {
  const f = path.join(DATA_DIR, safeKey(req.params.key) + ".json");
  try {
    const raw = await fs.readFile(f, "utf8");
    res.json({ value: JSON.parse(raw) });
  } catch {
    res.json({ value: null });
  }
});

app.post("/api/store/:key", async (req, res) => {
  const f = path.join(DATA_DIR, safeKey(req.params.key) + ".json");
  try {
    await fs.writeFile(f, JSON.stringify(req.body.value ?? null, null, 2), "utf8");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  4. Lokale Transkription (faster-whisper, laeuft offline ohne API-Kosten)
// ---------------------------------------------------------------------------

// Liste der Videodateien im videos-Ordner
app.get("/api/videos", async (req, res) => {
  try {
    const entries = await fs.readdir(VIDEO_DIR, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile() && VIDEO_EXT.includes(path.extname(e.name).toLowerCase()))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, "de"));
    res.json({ files, dir: VIDEO_DIR });
  } catch (e) {
    res.status(500).json({ error: "videos-Ordner nicht lesbar: " + e.message });
  }
});

// Eine gewaehlte Videodatei transkribieren
app.post("/api/transcribe", async (req, res) => {
  const { file } = req.body || {};
  if (!file) return res.status(400).json({ error: "Keine Videodatei gewaehlt." });

  // Schutz vor Pfad-Traversal: nur Dateiname, immer aus dem videos-Ordner
  const safe = path.basename(file);
  const full = path.join(VIDEO_DIR, safe);
  try {
    await fs.access(full);
  } catch {
    return res.status(404).json({ error: "Datei nicht im videos-Ordner gefunden." });
  }

  // Python aus der lokalen .venv verwenden (vom Setup angelegt)
  try {
    await fs.access(VENV_PYTHON);
  } catch {
    return res.status(500).json({
      error:
        "Transkriptions-Umgebung fehlt. Bitte einmalig 'whisper-setup.bat' ausfuehren und den Server neu starten.",
    });
  }

  const args = [
    WHISPER_SCRIPT,
    "--file", full,
    "--language", WHISPER_LANG,
    "--model", WHISPER_MODEL,
    "--models-dir", WHISPER_MODELS_DIR,
  ];

  console.log(`Transkribiere: ${safe} (Modell ${WHISPER_MODEL}, ${WHISPER_LANG}) ...`);
  const child = spawn(VENV_PYTHON, args, { windowsHide: true });

  let out = "";
  let errOut = "";
  child.stdout.on("data", (d) => (out += d.toString()));
  child.stderr.on("data", (d) => {
    const s = d.toString();
    errOut += s;
    process.stdout.write(s.startsWith("[whisper]") ? s : "[whisper] " + s);
  });
  child.on("error", (e) => {
    if (!res.headersSent)
      res.status(500).json({ error: "Python konnte nicht gestartet werden: " + e.message });
  });
  child.on("close", () => {
    if (res.headersSent) return;
    // Nur die letzte nicht-leere stdout-Zeile ist die JSON-Antwort
    const line = out.trim().split(/\r?\n/).filter(Boolean).pop() || "";
    let parsed = null;
    try {
      parsed = JSON.parse(line);
    } catch {}
    if (parsed && typeof parsed.text === "string") return res.json(parsed);
    if (parsed && parsed.error) return res.status(500).json({ error: parsed.error });
    res.status(500).json({
      error: "Transkription fehlgeschlagen. " + (errOut.slice(-400).trim() || "Unbekannter Fehler."),
    });
  });
});

// ---------------------------------------------------------------------------
//  5. Schnitt-Pipeline
// ---------------------------------------------------------------------------

const CUTS_TMP = path.join(os.tmpdir(), "skript-studio-cuts");
fs.mkdir(CUTS_TMP, { recursive: true }).catch(() => {});

// ── 5a. Blooper-Analyse: Transkript → Cut-Vorschläge via Claude ──────────────
app.post("/api/analyze-cuts", async (req, res) => {
  const { segments, words, duration, scriptBeats } = req.body || {};
  if (!segments || !segments.length)
    return res.status(400).json({ error: "Keine Transkript-Segmente übergeben." });
  if (!anthropic)
    return res.status(500).json({ error: "Kein API-Key gesetzt." });

  // Transkript mit Zeitstempeln als lesbaren String aufbereiten
  const transcriptText = segments
    .map((s) => `[${s.start.toFixed(1)}s–${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const scriptContext = scriptBeats?.length
    ? `\nSKRIPT-BEATS (was der Creator sagen wollte):\n${scriptBeats.map((b) => `- [${b.beat}] ${b.text}`).join("\n")}`
    : "";

  const prompt = `Du analysierst das Transkript einer Video-Aufnahme auf Deutsch.
Deine Aufgabe: Finde Stellen, die herausgeschnitten werden sollten (Versprecher, Wiederholungen, Fülllaute, abgebrochene Sätze, lange ungewollte Pausen, falsch gestartete Sätze).
${scriptContext}

TRANSKRIPT (mit Zeitstempeln):
${transcriptText}

Gesamtlänge: ${duration}s

Antworte NUR als reines JSON-Array (keine Fences), ein Objekt pro vorgeschlagenem Cut:
[
  {
    "start": 12.3,
    "end": 15.7,
    "reason": "Kurze Erklärung warum dieser Teil raus soll",
    "type": "versprecher|wiederholung|pause|abgebrochen|fuellwort",
    "confidence": "hoch|mittel|niedrig"
  }
]
Gib nur Cuts zurück, die klar problematisch sind. Lieber zu wenig als zu viel.
Leeres Array [] wenn nichts zu schneiden ist.`;

  try {
    const text = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = text.content[0].text.replace(/```json|```/g, "").trim();
    // Robuster Parser: sucht JSON-Array auch wenn Claude Text voranstellt
    const match = raw.match(/\[[\s\S]*\]/);
    const cuts = match ? JSON.parse(match[0]) : [];
    console.log(`[Cuts] ${cuts.length} Vorschläge gefunden.`);
    res.json({ cuts, segments });
  } catch (e) {
    console.error("[Cuts] Fehler:", e.message);
    // Fehler bei Parse → leere Cuts zurückgeben statt 500
    res.json({ cuts: [], segments });
  }
});

// ── 5b-0. Animations aus Transkript vorschlagen ──────────────────────────────
// Claude analysiert den Transkript-Inhalt, entscheidet welche Animationen passen
// und generiert pro Animation konkrete Props (Label, BPM etc.) aus dem gesprochenen Inhalt.
app.post("/api/suggest-animations", async (req, res) => {
  const { segments, words, keepSegments, duration } = req.body || {};
  if (!segments?.length) return res.status(400).json({ error: "Keine Segmente." });
  if (!anthropic) return res.status(500).json({ error: "Kein API-Key." });

  // Transkript-Segmente mit Timestamps aufbereiten
  const transcriptText = segments.map((s) => `[${s.start.toFixed(1)}s] ${s.text}`).join("\n");

  // Verfügbare Animationen + ihre anpassbaren Props
  const libraryHint = [
    {
      id: "heart-pump",
      wann: "Herzfrequenz, BPM, Puls, Kreislauf, Ausdauer, VO2max, Herzschlag",
      props: 'bpm (Zahl, z.B. 155 wenn im Text genannt, sonst 72), label (1-3 Wörter CAPS, z.B. "HERZFREQUENZ" oder "155 BPM")',
    },
    {
      id: "mitochondria",
      wann: "Mitochondrien, ATP, Energie, Biogenese, Stoffwechsel, aerob",
      props: 'label (1-3 Wörter CAPS, z.B. "MITOCHONDRIEN" oder "ATP-PRODUKTION")',
    },
    {
      id: "knee-joint",
      wann: "Knie, Kniegelenk, Knorpel, Meniskus, Knieschmerz, Flexion, Laufen",
      props: 'label (1-3 Wörter CAPS, z.B. "KNIEGELENK" oder "KNIESCHMERZ"), speed (0.5=langsam, 1=normal, 1.5=schnell)',
    },
    {
      id: "organ-heart",
      wann: "Herzanatomie, Kammern, Ventrikel, Aorta, Klappe, Herzquerschnitt",
      props: 'label (1-2 Wörter CAPS, z.B. "HERZ"), kicker (1-2 Wörter CAPS, z.B. "ANATOMIE")',
    },
    {
      id: "organ-lung",
      wann: "Lunge, Alveolen, Bronchien, Atemwege, Gasaustausch, Atmung",
      props: 'label (1-2 Wörter CAPS, z.B. "LUNGE"), kicker (1-2 Wörter CAPS, z.B. "ANATOMIE")',
    },
    {
      id: "organ-muscle",
      wann: "Muskelfaser, Sarkomer, Myosin, Aktin, Kontraktion, Hypertrophie, Muskelaufbau",
      props: 'label (1-2 Wörter CAPS, z.B. "MUSKELFASER"), kicker (1-2 Wörter CAPS, z.B. "ANATOMIE")',
    },
  ].map((e) => `- ${e.id}\n  WANN: ${e.wann}\n  PROPS: ${e.props}`).join("\n");

  const prompt = `Du bist Experte für Sport-Content (Physiotherapie, Sport & Gesundheit, Deutsch, Du-Form).
Analysiere dieses Video-Transkript und wähle 2–4 Stellen, an denen eine Animation die Aussage visuell verstärkt.

VERFÜGBARE ANIMATIONEN:
${libraryHint}

TRANSKRIPT (mit Zeitstempeln in Sekunden):
${transcriptText}

AUFGABE:
1. Lies das Transkript und identifiziere Stellen, wo ein Körper-/Organ-Thema konkret erwähnt wird.
2. Wähle die passendste Animation aus der Liste oben (nur wenn Keywords wirklich zum Text passen).
3. Generiere für jede Animation konkrete Props aus dem Transkript-Inhalt:
   - Wenn eine konkrete Zahl genannt wird (z.B. "155 BPM") → nutze sie im label/bpm-Prop
   - Labels: kurz, prägnant, ALL CAPS, max 3 Wörter, Deutsch
   - einblendung: was der Zuschauer liest — knapp, max 5 Wörter, direkt aus dem Transkript-Inhalt
4. Starte jede Animation kurz BEVOR das Thema im Text erwähnt wird (0.5–1s früher als der Timestamp).

Antworte NUR als reines JSON-Array (keine Erklärungen, keine Code-Fences):
[
  {
    "startTime": 8.4,
    "beat": "kurzer Beat-Name (1-3 Wörter)",
    "einblendung": "was der Zuschauer liest (max 5 Wörter, Deutsch, aus Transkript-Inhalt)",
    "libraryId": "eine der IDs oben",
    "props": { "label": "BEISPIEL LABEL", "bpm": 155 },
    "reason": "1 Satz: warum genau hier und diese Animation",
    "matched": true
  }
]
Leeres Array [] wenn kein Thema aus der Liste im Transkript vorkommt.`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL, max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = msg.content[0].text.replace(/```json|```/g, "").trim();
    const match = raw.match(/\[[\s\S]*\]/);
    const suggestions = match ? JSON.parse(match[0]) : [];
    console.log(`[Suggest] ${suggestions.length} Animations-Vorschläge generiert.`);
    res.json({ beatTimings: suggestions });
  } catch (e) {
    console.error("[Suggest] Fehler:", e.message);
    res.json({ beatTimings: [] });
  }
});

// ── 5b-1. Remotion-Animations-Komponente generieren ─────────────────────────
// Claude schreibt eine komplette Remotion JSX-Komponente aus dem Spec-Prompt.
// Speichert die Datei in src/remotion/compositions/ und aktualisiert Root.jsx.
app.post("/api/generate-animation", async (req, res) => {
  const { spec, componentName } = req.body || {};
  if (!spec || !componentName) return res.status(400).json({ error: "spec und componentName erforderlich." });
  if (!anthropic) return res.status(500).json({ error: "Kein API-Key." });

  // Sicherer Komponentenname (nur Buchstaben/Zahlen, beginnt mit Großbuchstabe)
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, "").replace(/^[^A-Z]/, "G");

  const codePrompt = `Du generierst eine vollständige Remotion React Animations-Komponente für ein deutsches Sport/Gesundheits-Video.

TECHNISCHE PFLICHT-ANFORDERUNGEN:
- Named export: export function ${safeName}({ format = "9:16", position = "bottom" }) { ... }
- Imports NUR aus "remotion": useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence
- Kein Import externer Bibliotheken oder Assets — alle SVGs inline als JSX
- Kein TypeScript, reines JSX (.jsx)
- Gültig für Remotion 4.x

ANIMATION-SPEC:
${spec}

Antworte AUSSCHLIESSLICH mit dem vollständigen JSX-Code, eingeschlossen in \`\`\`jsx ... \`\`\` Fences. Kein Text davor oder danach.`;

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 6000,
      messages: [{ role: "user", content: codePrompt }],
    });

    const raw = msg.content[0].text;
    const match = raw.match(/```(?:jsx?|javascript)?\n([\s\S]*?)```/);
    if (!match) return res.status(500).json({ error: "Claude hat keinen Code in Fences geliefert." });

    const code = match[1].trim();
    if (!code.includes(`export function ${safeName}`)) {
      return res.status(500).json({ error: `Generierter Code enthält nicht 'export function ${safeName}'.` });
    }

    // Komponenten-Datei speichern
    const compDir = path.resolve(__dirname, "..", "src", "remotion", "compositions");
    const compPath = path.join(compDir, `${safeName}.jsx`);
    await fs.writeFile(compPath, code, "utf8");
    console.log(`[GenAnim] Gespeichert: ${compPath}`);

    // Dauer aus Spec extrahieren (z.B. "10 seconds" oder "10s")
    const durMatch = spec.match(/(\d+)\s*s(?:ec(?:onds?)?)?/i);
    const durationSec = durMatch ? parseInt(durMatch[1]) : 10;
    const durationFrames = durationSec * 30;

    // Root.jsx aktualisieren
    const rootPath = path.resolve(__dirname, "..", "src", "remotion", "Root.jsx");
    let rootContent = await fs.readFile(rootPath, "utf8");

    const importLine = `import { ${safeName} } from "./compositions/${safeName}";`;
    if (!rootContent.includes(importLine)) {
      rootContent = rootContent.replace(
        /^(import \{ Composition \} from "remotion";)/m,
        `$1\n${importLine}`
      );
    }

    const compositionEntry = `\n      <Composition id="${safeName}" component={${safeName}} durationInFrames={${durationFrames}} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />`;
    if (!rootContent.includes(`id="${safeName}"`)) {
      rootContent = rootContent.replace(/(\s*<\/>\s*\);\s*\})/, `${compositionEntry}$1`);
    }

    await fs.writeFile(rootPath, rootContent, "utf8");
    console.log(`[GenAnim] Root.jsx aktualisiert.`);

    // Bundle-Cache invalidieren → nächster Render löst Neubundle aus
    bundleUrl = null;
    bundleStatus = "idle";

    res.json({ componentName: safeName, durationFrames, success: true });
  } catch (e) {
    console.error("[GenAnim] Fehler:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── 5b. Beat-Timestamp-Matching: Script-Beats → Zeitstempel nach Schnitt ────
app.post("/api/match-beats", async (req, res) => {
  const { segments, words, scriptBeats, keepSegments } = req.body || {};
  if (!scriptBeats?.length) return res.status(400).json({ error: "Keine Script-Beats." });
  if (!anthropic) return res.status(500).json({ error: "Kein API-Key." });

  // Effektive Timestamps nach dem Schnitt berechnen
  // keepSegments = [{start, end}] — was übrig bleibt
  function mapToNewTime(originalTime, keeps) {
    if (!keeps?.length) return originalTime;
    let offset = 0;
    for (const seg of keeps) {
      if (originalTime >= seg.start && originalTime <= seg.end) {
        return originalTime - seg.start + offset;
      }
      if (originalTime > seg.end) {
        offset += seg.end - seg.start;
      }
    }
    return null; // liegt in einem geschnittenen Bereich
  }

  // Transkript nach dem Schnitt aufbereiten
  const cutSegments = segments.filter((s) => {
    if (!keepSegments?.length) return true;
    return keepSegments.some((k) => s.start >= k.start && s.end <= k.end);
  });

  const transcriptText = cutSegments
    .map((s) => {
      const newStart = keepSegments ? mapToNewTime(s.start, keepSegments) : s.start;
      return `[${(newStart ?? s.start).toFixed(1)}s] ${s.text}`;
    })
    .join("\n");

  const prompt = `Du ordnest Script-Beats einem Video-Transkript zu (Deutsch).
Für jeden Beat findest du den passenden Zeitstempel im Transkript, wo dieser Inhalt gesagt wird.

SCRIPT-BEATS (aus dem Script):
${scriptBeats.map((b, i) => `${i + 1}. [${b.beat}] Einblendung: "${b.einblendung}" | Inhalt: "${b.text?.slice(0, 120)}"`).join("\n")}

TRANSKRIPT NACH SCHNITT (mit neuen Zeitstempeln):
${transcriptText}

Antworte NUR als reines JSON-Array, ein Objekt pro Beat:
[
  {
    "beatIndex": 0,
    "beat": "...",
    "einblendung": "...",
    "startTime": 8.4,
    "confidence": "hoch|mittel|niedrig",
    "matched": true
  }
]
"matched": false wenn kein passender Inhalt im Transkript gefunden wurde.
"startTime": Sekunde, ab der die Animation erscheinen soll (0.5s vor dem gesagten Inhalt als Vorlauf).`;

  try {
    const text = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = text.content[0].text.replace(/```json|```/g, "").trim();
    const match = raw.match(/\[[\s\S]*\]/);
    const beatTimings = match ? JSON.parse(match[0]) : [];
    console.log(`[Match-Beats] ${beatTimings.length} Beats gematched.`);
    res.json({ beatTimings });
  } catch (e) {
    res.status(500).json({ error: "Matching fehlgeschlagen: " + e.message });
  }
});

// ── 5c. Video schneiden + Animationen drüberlegen → fertige MP4 ──────────────
app.post("/api/compose-video", async (req, res) => {
  const { videoFile, keepSegments, beatTimings, format = "9:16", position = "bottom" } = req.body || {};
  if (!videoFile) return res.status(400).json({ error: "videoFile fehlt." });

  const safe = path.basename(videoFile);
  const srcVideo = path.join(VIDEO_DIR, safe);
  try { await fs.access(srcVideo); }
  catch { return res.status(404).json({ error: "Video nicht gefunden." }); }

  const stamp = Date.now();
  const cutVideo = path.join(CUTS_TMP, `cut-${stamp}.mp4`);
  const finalVideo = path.join(CUTS_TMP, `final-${stamp}.mp4`);

  try {
    // ── Pass 1: Video schneiden ──────────────────────────────────────────────
    if (keepSegments?.length) {
      console.log("[Schnitt] Schneide Video:", keepSegments.length, "Segmente behalten");

      // ffmpeg concat: nur die keep-Segmente
      const listFile = path.join(CUTS_TMP, `list-${stamp}.txt`);
      const segFiles = [];

      for (let i = 0; i < keepSegments.length; i++) {
        const seg = keepSegments[i];
        const segFile = path.join(CUTS_TMP, `seg-${stamp}-${i}.mp4`);
        await new Promise((resolve, reject) => {
          spawn(ffmpegPath, [
            "-y",
            "-ss", String(seg.start),   // seek VOR -i = schnell + Frame-genau
            "-to", String(seg.end),
            "-i", srcVideo,
            // Re-encode um saubere Audio-Timestamps sicherzustellen
            "-c:v", "libx264", "-preset", "fast", "-crf", "18",
            "-c:a", "aac", "-ar", "48000",
            "-avoid_negative_ts", "make_zero",  // Audio-Timestamp-Korrektheit
            segFile,
          ], { windowsHide: true })
            .on("close", (c) => c === 0 ? resolve() : reject(new Error(`Segment ${i} fehlgeschlagen`)));
        });
        segFiles.push(segFile);
      }

      // Concat-Liste schreiben
      await fs.writeFile(listFile, segFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));

      await new Promise((resolve, reject) => {
        spawn(ffmpegPath, [
          "-y", "-f", "concat", "-safe", "0", "-i", listFile,
          "-c", "copy", cutVideo,
        ], { windowsHide: true })
          .on("close", (c) => c === 0 ? resolve() : reject(new Error("Concat fehlgeschlagen")));
      });

      // Temp-Segmente aufräumen
      for (const f of segFiles) fssync.unlink(f, () => {});
      fssync.unlink(listFile, () => {});
    } else {
      // Kein Schnitt — Original weiterverwenden
      await fs.copyFile(srcVideo, cutVideo);
    }
    console.log("[Schnitt] Video geschnitten:", cutVideo);

    // ── Pass 2: Animationen drüberlegen ─────────────────────────────────────
    // Animationen als farbige Panels (kein Alpha nötig) overlay-en
    // Panel-Position aus PANEL_DIMS
    const PANEL_POS = {
      "9:16": { bottom: { x: 80, y: 1490, w: 920, h: 350 }, top: { x: 80, y: 80, w: 920, h: 350 } },
      "16:9": { bottom: { x: 80, y: 720, w: 1760, h: 300 }, top: { x: 80, y: 80, w: 1760, h: 300 } },
    };
    const panelPos = PANEL_POS[format]?.[position] || PANEL_POS["9:16"].bottom;

    // Nur Beats mit hohem Confidence und gematchtem Inhalt
    const validBeats = (beatTimings || []).filter((b) => b.matched && b.startTime != null);

    if (!validBeats.length) {
      // Kein Overlay — geschnittenes Video direkt als Ergebnis
      await fs.rename(cutVideo, finalVideo);
    } else {
      // Für jeden Beat eine Animation rendern und drüberlegen
      // (vereinfacht: alle Animationen übereinander in einem ffmpeg-Befehl)
      const serveUrl = await ensureBundle().catch(() => null);

      let currentInput = cutVideo;
      for (let i = 0; i < validBeats.length; i++) {
        const beat = validBeats[i];
        const animFile = path.join(CUTS_TMP, `anim-${stamp}-${i}.mov`);
        const overlaidFile = path.join(CUTS_TMP, `overlaid-${stamp}-${i}.mp4`);
        const compId = beat.libraryId
          ? { "heart-pump": "HeartPump", "organ-heart": "OrganHeart", "knee-joint": "KneeJoint",
              "mitochondria": "Mitochondria", "organ-lung": "OrganLung", "organ-muscle": "OrganMuscle" }[beat.libraryId] || "TextCard"
          : "TextCard";
        const animDuration = 90; // Standard 3s

        // Animation rendern (wenn Bundle vorhanden)
        if (serveUrl) {
          const { renderFrames } = await import("@remotion/renderer");
          const { selectComposition, ensureBrowser } = await import("@remotion/renderer");
          await ensureBrowser();
          const composition = await selectComposition({
            serveUrl, id: compId,
            inputProps: { kicker: beat.beat || "INFO", headline: beat.einblendung || "", format, position },
            timeoutInMilliseconds: 30000,
          }).catch(() => null);

          if (composition) {
            const framesDir = path.join(CUTS_TMP, `frames-${stamp}-${i}`);
            await fs.mkdir(framesDir, { recursive: true });
            await renderFrames({
              composition: { ...composition, durationInFrames: animDuration },
              serveUrl, outputDir: framesDir, imageFormat: "png",
              inputProps: { kicker: beat.beat || "INFO", headline: beat.einblendung || "", format, position },
              chromiumOptions: { disableWebSecurity: true },
            });
            const inputPattern = path.join(framesDir, "element-%02d.png");
            await ffmpegSpawn([
              "-y", "-framerate", "30", "-i", inputPattern,
              "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", animFile,
            ]);
            fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});
          }
        }

        // Animation als Overlay (Solid Panel, kein Alpha)
        const startT = beat.startTime;
        const endT = startT + animDuration / 30;
        const animExists = await fs.access(animFile).then(() => true).catch(() => false);

        if (animExists) {
          // ffmpeg overlay: Animation im Panel-Bereich drüberlegen
          await new Promise((resolve, reject) => {
            spawn(ffmpegPath, [
              "-y",
              "-i", currentInput,
              "-i", animFile,
              "-filter_complex",
              `[1:v]scale=${panelPos.w}:${panelPos.h}[anim];` +
              `[0:v][anim]overlay=x=${panelPos.x}:y=${panelPos.y}:enable='between(t,${startT},${endT})'[v]`,
              "-map", "[v]", "-map", "0:a",  // explizit, kein ? — Audio muss da sein
              "-c:v", "libx264", "-preset", "fast",
              "-c:a", "aac", "-ar", "48000",
              overlaidFile,
            ], { windowsHide: true })
              .on("close", (c) => {
                if (c === 0) {
                  if (i > 0) fssync.unlink(currentInput, () => {});
                  currentInput = overlaidFile;
                  resolve();
                } else reject(new Error("Overlay fehlgeschlagen"));
              });
          });
          fssync.unlink(animFile, () => {});
        }
      }
      await fs.rename(currentInput, finalVideo).catch(async () => {
        await fs.copyFile(currentInput, finalVideo);
      });
    }

    console.log("[Compose] Fertig:", finalVideo);
    res.download(finalVideo, `video-final-${stamp}.mp4`, () => {
      fssync.unlink(finalVideo, () => {});
      fssync.unlink(cutVideo, () => {});
    });
  } catch (e) {
    console.error("[Compose] Fehler:", e.message);
    // Aufräumen
    [cutVideo, finalVideo].forEach((f) => fssync.unlink(f, () => {}));
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
//  Remotion Video-Rendering (WebM mit Alpha-Kanal)
// ---------------------------------------------------------------------------
const require2 = createRequire(import.meta.url);
const ffmpegPath = require2("ffmpeg-static");

const REMOTION_ENTRY = path.resolve(__dirname, "..", "src", "remotion", "index.jsx");
const RENDER_TMP = path.join(os.tmpdir(), "skript-studio-renders");

// Bundle wird einmal erstellt und gecacht
let bundleUrl = null;
let bundleStatus = "idle"; // idle | building | ready | error
let bundleError = null;

async function ensureBundle() {
  if (bundleUrl) return bundleUrl;
  if (bundleStatus === "building") {
    // Warten bis Bundle fertig
    await new Promise((res) => {
      const iv = setInterval(() => {
        if (bundleStatus !== "building") { clearInterval(iv); res(); }
      }, 500);
    });
    if (bundleStatus === "error") throw new Error(bundleError);
    return bundleUrl;
  }
  bundleStatus = "building";
  console.log("[Remotion] Bundling Kompositionen...");
  try {
    const { bundle } = await import("@remotion/bundler");
    bundleUrl = await bundle({ entryPoint: REMOTION_ENTRY });
    bundleStatus = "ready";
    console.log("[Remotion] Bundle fertig:", bundleUrl);
    return bundleUrl;
  } catch (e) {
    bundleStatus = "error";
    bundleError = e.message;
    throw e;
  }
}

// Bundle beim Start im Hintergrund vorbereiten
fs.mkdir(RENDER_TMP, { recursive: true }).then(() => ensureBundle().catch(() => {}));

app.get("/api/render-status", (req, res) => {
  res.json({ status: bundleStatus, error: bundleError });
});

const COMPOSITION_DURATION = { TextCard: 90, StatCard: 90, BodyMarker: 120 };

// Debug: einzelne Frames als PNG extrahieren und Alpha prüfen
app.get("/api/render-debug", async (req, res) => {
  try {
    const serveUrl = await ensureBundle();
    const { selectComposition, renderFrames, ensureBrowser } = await import("@remotion/renderer");
    await ensureBrowser();
    const composition = await selectComposition({ serveUrl, id: "TextCard", inputProps: { kicker: "DEBUG", headline: "Alpha Test" } });
    const framesDir = path.join(RENDER_TMP, "frames-debug");
    await fs.mkdir(framesDir, { recursive: true });
    await renderFrames({
      composition: { ...composition, durationInFrames: 5 },
      serveUrl,
      outputDir: framesDir,
      imageFormat: "png",
      inputProps: { kicker: "DEBUG", headline: "Alpha Test" },
    });
    res.json({ ok: true, dir: framesDir });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function ffmpegSpawn(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { windowsHide: true });
    let stderr = "";
    proc.stderr.on("data", (d) => { stderr += d; process.stdout.write("."); });
    proc.on("close", (code) => {
      if (code === 0) { console.log(" ✓"); resolve(); }
      else { console.error("\nFehler code", code); reject(new Error(stderr.slice(-400) || "ffmpeg failed")); }
    });
  });
}

app.post("/api/render", async (req, res) => {
  // format: "prores" (Premiere/DaVinci, default) | "webm" (CapCut/Browser)
  const { compositionId, inputProps, format = "prores" } = req.body || {};
  if (!compositionId) return res.status(400).json({ error: "compositionId fehlt." });

  try {
    const serveUrl = await ensureBundle();
    const { selectComposition, renderFrames, ensureBrowser } = await import("@remotion/renderer");
    await ensureBrowser();

    const durationInFrames = COMPOSITION_DURATION[compositionId] || 90;
    const composition = await selectComposition({ serveUrl, id: compositionId, inputProps: inputProps || {}, timeoutInMilliseconds: 30000 });

    const stamp = Date.now();
    const framesDir = path.join(RENDER_TMP, `frames-${compositionId}-${stamp}`);
    await fs.mkdir(framesDir, { recursive: true });
    console.log(`[Remotion] Rendere ${compositionId} (${durationInFrames} Frames, Format: ${format})...`);

    // Pass 1: PNG-Frames mit Magenta-Hintergrund
    await renderFrames({
      composition: { ...composition, durationInFrames },
      serveUrl,
      outputDir: framesDir,
      imageFormat: "png",
      inputProps: inputProps || {},
      chromiumOptions: { disableWebSecurity: true },
      timeoutInMilliseconds: 180000,
      onFrameUpdate: (f) => { process.stdout.write(`\r[Remotion] Frame ${f}/${durationInFrames}`); },
    });
    console.log(`\n[Remotion] Frames fertig. Encode...`);

    const inputPattern = path.join(framesDir, "element-%02d.png");

    // Prüfe ob PNGs echtes Alpha haben (erstes Frame analysieren)
    const firstFrame = path.join(framesDir, "element-00.png");
    const { default: sizeOf } = await import("image-size");
    let hasAlpha = false;
    try {
      const info = sizeOf(firstFrame);
      // PNG mit Alpha hat type "png" und Farbtyp RGBA (6) oder RGBA+Palette
      // Einfachere Prüfung: Pixel (0,0) auslesen via sharp oder raw Buffer
      const raw = await fs.readFile(firstFrame);
      // PNG-Farbtyp steht bei Byte 25: 0=Grau, 2=RGB, 3=Palette, 4=GrauA, 6=RGBA
      const colorType = raw[25];
      hasAlpha = colorType === 4 || colorType === 6;
    } catch (_) {}
    console.log(`[Alpha] PNG-Farbtyp erkannt: ${hasAlpha ? "RGBA ✓ direktes Alpha" : "RGB → Chromakey-Fallback"}`);

    // Chromakey: entfernt Magenta-Hintergrund (#FF00FF).
    // similarity=0.25 konservativ (dunkle Graus haben YCbCr-Abstand ~0.377 zu Magenta).
    // blend=0.10 für sanften Übergang. Leichtes Fringing an Kanten — bekanntes Problem,
    // siehe Sidequest D in der Projekt-Doku.
    const CHROMAKEY_VF = "chromakey=0xFF00FF:0.25:0.10";

    if (format === "webm") {
      const outFile = path.join(RENDER_TMP, `${compositionId}-${stamp}.webm`);
      const vf = hasAlpha ? "format=yuva420p" : CHROMAKEY_VF;
      await ffmpegSpawn([
        "-y", "-framerate", "30", "-i", inputPattern,
        "-vf", vf,
        "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
        "-b:v", "0", "-crf", "20", "-auto-alt-ref", "0",
        outFile,
      ]);
      fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});
      res.download(outFile, `${compositionId}.webm`, () => { fssync.unlink(outFile, () => {}); });
    } else {
      const outFile = path.join(RENDER_TMP, `${compositionId}-${stamp}.mov`);
      const vf = hasAlpha
        ? "format=yuva444p10le"
        : `${CHROMAKEY_VF},format=yuva444p10le`;
      await ffmpegSpawn([
        "-y", "-framerate", "30", "-i", inputPattern,
        "-vf", vf,
        "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le",
        outFile,
      ]);
      fs.rm(framesDir, { recursive: true, force: true }).catch(() => {});
      res.download(outFile, `${compositionId}.mov`, () => { fssync.unlink(outFile, () => {}); });
    }
  } catch (e) {
    console.error("[Remotion] Fehler:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
app.get("/api/health", (req, res) =>
  res.json({ ok: true, model: MODEL, hasKey: !!anthropic, whisperModel: WHISPER_MODEL, renderStatus: bundleStatus })
);

app.listen(PORT, () => {
  console.log(`\n  Skript-Studio-Server laeuft auf http://localhost:${PORT}`);
  console.log(`  Modell:  ${MODEL}`);
  console.log(`  API-Key: ${anthropic ? "gefunden" : "FEHLT – bitte .env ausfuellen"}\n`);
});
