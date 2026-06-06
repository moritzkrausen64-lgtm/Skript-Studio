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
*Grafiken*, *Animationen*, *Schnitt*. Inzwischen vollständig gelöscht:
`src/remotion/`, `whisper/`, `whisper-setup.bat`, die `@remotion/*`-Deps und
alle toten Server-Routen (Server von 957 → 183 Zeilen, nur noch
`/api/claude`, `/api/folder`, `/api/extract-file`, `/api/store/:key`, `/api/health`).

---

## 2. Daten-Schnittstellen (für den Merge entscheidend)

### Persistenz-Keys (`store`, JSON im `/data`-Ordner)
| Key | Inhalt |
|-----|--------|
| `vsg:topics` | `[{ id, name, text, file? }]` — Recherche-Themen |
| `vsg:brandvoices` | `[{ id, name, text, tags[], profile, createdAt, updatedAt }]` — Markenstimmen-Bibliothek |
| `vsg:activeBrandVoice` | `id` — aktive Markenstimme (Generator-Default) |
| `vsg:brandvoice` | *(alt, string)* — wird einmalig nach `vsg:brandvoices` migriert |
| `vsg:usedhooks` | `string[]` — genutzte Hook-Formeln (Anti-Wiederholung) |
| `vsg:projectfolders` | `string[]` — Projekt-Ordner (inkl. "Unsortiert") |
| `vsg:projects` | `[{ id, savedAt, name, folder, description, tags[], topicName, brandVoiceName, sel, cfg, out }]` |

### Generator-Props (Eingang/Ausgang)
```
Generator({ topics, setTopics, brandVoices, activeBrandVoiceId, usedHooks, setUsedHooks,
            projectFolders, onCreateFolder, onSaveProject, projectToLoad, onProjectLoaded })
```

### Skript-Objekt (`out`, von Claude erzeugt) — Schema
**Hooks und Beats teilen dasselbe strukturierte Feldmodell `overlay/visuell/sound`** —
das ist der **Hyperframes-Übergabe-Vertrag** (was eingeblendet wird, was visuell passiert,
welcher Sound). Jedes Feld ist im UI einzeln editier- und neu-generierbar.
```jsonc
{
  "hooks":  [{ "ebene","gesprochen","overlay","visuell","sound" }],   // genau 3
  "body":   [{ "beat","text","overlay","visuell","sound" }],          // 3–5
  "cta":    "…",
  "cover":  { "frame","text" },
  "caption":"…", "hashtags":["…"],
  "rating": { "gesamt":0-100,"confidence","scores":{…8…},"reframe" },
  "hook_formel":"…",
  // optional nach Optimieren:
  "aenderungen":["…"], "faktencheck":[{ "aussage","status","beleg" }]
}
```
> Alt-Schema `body: { einblendung, shot }` wird beim Laden via `normalizeOut()`
> auf `overlay/visuell/sound` gehoben (einblendung→overlay, shot→visuell).

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

---

## 4. Geteilter Overlay-Engine (Architektur-Entscheidung 2026-06-06)

**Problem:** Beide Wege erzeugen dieselben Overlay-/Visuell-/Sound-Specs —
nur zu unterschiedlichen Zeitpunkten:
- **Script-first (Generator):** Inhalt vorher bekannt → Spec **ohne** Timing.
- **Video-first (VideoCut):** Transkript nachher → Spec **mit** Wort-Timestamps.

Es ist **dasselbe Spec-Objekt in zwei Reifestadien**, nicht zwei Funktionen.
→ Die Design-Logik wird **gekoppelt** (ein „Gehirn"), die zwei Eingänge/Flows
bleiben getrennt.

### Der Engine als wiederverwendbare Schicht
```
Text [+ optional Timing]  →  overlay / visuell / sound [+ Timing]
```
- **Generator** füttert ihn mit **Script-Beats** (Inhalt bekannt, kein Timing).
- **VideoCut** füttert ihn mit **Transkript-Segmenten** (Wort + Timestamps),
  **nach** der Transkription, **vor** Hyperframes.

### Harte Regel: Transkript bleibt unangetastet
Der Engine ist **read-only** auf dem Transkript. Das Transkript bleibt die
Wahrheit für *Wort + Zeit*. Der Engine **liest** es und legt nur eine
**zusätzliche, additive Spur** (overlay/visuell/sound an die Timestamps gekoppelt)
oben drauf. VideoCuts Transkription + Schnitt bleiben unverändert; der Engine
sitzt nur dort, wo bisher „Hyperframes denkt sich Einblendungen aus".

### Trainierbar an genau einer Stelle
Die Overlay-Logik = drei Teile, die zentral angelernt werden:
1. **Prompt/Anweisung** — wie ein Overlay gestaltet wird.
2. **Style-Guide / Overlay-CI** — Farben, Typo, Animations-Vokabular, Timing-Regeln.
3. **Beispiel-Bibliothek** (Few-Shot) — konkrete gute Overlays als Vorbild.

Eine Wissensbasis → **beide** Wege werden besser. Idealerweise gespeist aus
VideoCuts **Performance-Archiv** (echte View-Metriken): die besten realen Videos
werden automatisch die Lehrbeispiele für „perfekte Einblendungen".

### Nuance: Kontext-Tiefe
- **Script-Weg** kennt die **Absicht** (geplanter Beat) → reichere, gezieltere Overlays.
- **Transkript-Weg** kennt nur das **Gesagte** → Overlays werden daraus abgeleitet.
- **Match-Pfad:** Stammt ein hochgeladenes Video aus einem generierten Script,
  wird das Transkript auf die **bereits geschriebenen** Overlays gematcht
  (Timestamps draufsetzen) statt neu zu erfinden → Konsistenz, keine Doppelarbeit.

### Status & Verortung
- Heute schon vorbereitet: Generator emittiert `overlay/visuell/sound` im
  einheitlichen Schema (= der gemeinsame Vertrag, siehe Abschnitt 2).
- Beim Merge: Engine lebt in **VideoCut** (Host, serverseitig — Hyperframes sitzt dort).
  Der portierte Generator ruft denselben Engine auf.
