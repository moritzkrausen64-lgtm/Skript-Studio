// ===========================================================================
//  Skript-Studio – lokaler Backend-Server (Express)
//  Aufgaben:
//   1. Recherche-Ordner von der Festplatte lesen (.txt/.md/.docx/.pdf)
//   2. Anthropic-API aufrufen (Key NUR hier, aus .env – nie im Frontend)
//   3. Lokale JSON-Speicherung (Themen, Markenstimmen, Hooks, Projekte)
// ===========================================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import mammoth from "mammoth";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

// pdf-parse ist CommonJS; per createRequire direkt die Lib laden
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const DATA_DIR = path.join(__dirname, "..", "data");

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";
const PORT = process.env.PORT || 8787;
const apiKey = process.env.ANTHROPIC_API_KEY;

const anthropic =
  apiKey && !apiKey.includes("DEIN-KEY") ? new Anthropic({ apiKey }) : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

await fs.mkdir(DATA_DIR, { recursive: true });

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
//  Healthcheck
// ---------------------------------------------------------------------------
app.get("/api/health", (req, res) =>
  res.json({ ok: true, model: MODEL, hasKey: !!anthropic })
);

app.listen(PORT, () => {
  console.log(`\n  Skript-Studio-Server laeuft auf http://localhost:${PORT}`);
  console.log(`  Modell:  ${MODEL}`);
  console.log(`  API-Key: ${anthropic ? "gefunden" : "FEHLT – bitte .env ausfuellen"}\n`);
});
