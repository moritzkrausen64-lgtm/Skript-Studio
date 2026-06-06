# Skript-Studio — Architektur & Merge-Plan

**Stand:** 2026-06-06 · nach Cleanup (Branch `cleanup/standalone-generator`)

Diese App ist der **Skript-Generator-Baustein**. Sie läuft eigenständig und wird
später in **VideoCut Studio** (`C:\Users\morit\Desktop\Claude Projekt\Claude Video Cut + Anaimation`)
eingegliedert. VideoCut bleibt strukturell die Basis; Skript-Studio wird angepasst.

---

## 1. Aktuelle Struktur (modular, nach Cleanup)

```
src/
├── main.jsx                 Entry — rendert <App/>
├── App.jsx                  Thin Shell: Tabs + geteilter State + Persistenz-Wiring
├── lib/
│   ├── store.js             store.get/set → /api/store/:key (JSON-Dateien im /data)
│   ├── claude.js            callClaude(prompt, maxTokens) → /api/claude (Key serverseitig)
│   └── options.js           Domänen-Konstanten (Video-Typen, Frameworks, Hook-Archetypen, Hints)
└── components/
    ├── Generator.jsx        Tab 1 — Recherche-Ordner → Skript (+ Beat-Regen, Optimieren)
    ├── BrandVoice.jsx       Tab 2 — Markenstimme (fließt in Generator-Prompt)
    ├── Projekte.jsx         Tab 3 — gespeicherte Skripte laden/löschen
    ├── ScriptOutput.jsx     Skript-Rendering (Hooks/Beats/CTA/Rating/Faktencheck)
    ├── ui.jsx               Geteilte Primitive: Field, Select, Rating, CopyBtn
    └── GlobalStyles.jsx     <style> mit allen CSS-Variablen & Klassen
```

**Entfernt** (gehörten zum Whisper/Remotion-Stack, der im Gesamtprojekt durch
VideoCuts ElevenLabs+Hyperframes ersetzt wird): Tabs *Virale Bibliothek*,
*Grafiken*, *Animationen*, *Schnitt*. Die Remotion-Dateien unter
`src/remotion/` sind verwaist (nicht mehr importiert) und können später gelöscht werden.

---

## 2. Daten-Schnittstellen (für den Merge entscheidend)

### Persistenz-Keys (`store`, JSON im `/data`-Ordner)
| Key | Inhalt |
|-----|--------|
| `vsg:topics` | `[{ id, name, text, file? }]` — Recherche-Themen |
| `vsg:brandvoice` | `string` — Markenstimme-Beispiele |
| `vsg:usedhooks` | `string[]` — genutzte Hook-Formeln (Anti-Wiederholung) |
| `vsg:projects` | `[{ id, savedAt, topicName, sel, cfg, out }]` — gespeicherte Skripte |

### Generator-Props (Eingang/Ausgang)
```
Generator({ topics, setTopics, brandVoice, usedHooks, setUsedHooks,
            onSaveProject, projectToLoad, onProjectLoaded })
```

### Skript-Objekt (`out`, von Claude erzeugt) — Schema
```jsonc
{
  "hooks":  [{ "ebene","gesprochen","overlay","visuell","sound" }],  // genau 3
  "body":   [{ "beat","text","einblendung","shot" }],                // 3–5
  "cta":    "…",
  "cover":  { "frame","text" },
  "caption":"…", "hashtags":["…"],
  "rating": { "gesamt":0-100,"confidence","scores":{…8…},"reframe" },
  "hook_formel":"…",
  // optional nach Optimieren:
  "aenderungen":["…"], "faktencheck":[{ "aussage","status","beleg" }]
}
```

### Server-Endpunkte (von dieser App genutzt)
- `GET/POST /api/store/:key` — Persistenz
- `POST /api/claude` — Claude-Aufruf (Key serverseitig)
- `GET /api/folder?path=` und `POST /api/extract-file` — Recherche-Ordner einlesen (.txt/.md/.docx/.pdf)

---

## 3. Merge-Plan → VideoCut Studio

**Entscheidungen (2026-06-06):**
1. **VideoCut ist die Basis-Hülle.** Skript-Studio wird dort eingepasst, nicht umgekehrt.
2. **VideoCuts datengetriebener Generator** (`ui/api/generate.js`) wird kanonisch.
   Skript-Studios Stärken wandern dort hinein:
   - **Recherche-Ordner-Einlesen** (`/api/folder`, `/api/extract-file`) → als Themen-Quelle.
   - **Markenstimme** (`brandVoice`) → zusätzlicher Prompt-Block neben dem Swipe-File.
   - **Beat-weise Regeneration** + **Skript-Optimierung/Faktencheck** → fehlt in VideoCut, klarer Mehrwert.
3. **Engine-Stack:** ElevenLabs Scribe + Hyperframes (VideoCut). Whisper/Remotion entfällt.

**Konkrete Angleichungen bei der Fusion:**
- Skript-Persistenz: VideoCut speichert Skripte als Dateien in `scripts/*.json`
  (Schema mit `hooks/body/cta/cover/caption/hashtags/rating`). Skript-Studios
  `out`-Schema ist nah dran → Feld-Mapping nötig (z.B. `gesamt`→`overall`,
  `ebene`→`archetype`-Kontext). **Dieses Mapping ist die Hauptarbeit.**
- UI: VideoCut nutzt Vanilla-JS (`ui/public/app.js`), Skript-Studio React.
  Beim Port wird der Generator-Tab in VideoCuts Shell nachgebaut **oder** VideoCut
  bekommt einen eingebetteten React-Mount nur für den Generator. (Offen — bei der Fusion entscheiden.)
- Claude-Call: beide rufen die Anthropic-API serverseitig. VideoCut liest `CLAUDE_MODEL`
  aus `.env` (Default `claude-sonnet-4-6`). Skript-Studio sollte denselben Mechanismus übernehmen.

**Originale bleiben erhalten** — beide Projekte werden nicht zerstört, die Fusion
entsteht als erweiterte VideoCut-Variante.
