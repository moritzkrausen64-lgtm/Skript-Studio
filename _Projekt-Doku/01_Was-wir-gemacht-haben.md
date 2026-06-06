# Was wir gemacht haben — Fortschrittsstand

**Stand:** 4. Juni 2026 · letzte Sitzung: **4. Juni 2026 (Schnitt-Pipeline + Architektur-Cleanup)**

---

## 1. Projekt-Grundstruktur
- **Frontend:** Vite + React (`src/App.jsx`)
- **Backend:** Express-Server (`server/index.js`, Port 8787)
- **Start:** `npm run dev` (concurrently) — killt alte Ports automatisch
- **Vite-Proxy:** `/api`-Aufrufe → Server; API-Key nie im Browser
- **Netzwerkzugriff:** Handy/Tablet via `http://<PC-IP>:5173`

---

## 2. Tabs & Funktionen

| Tab | Status | Beschreibung |
|---|---|---|
| Generator | ✅ stabil | Script-Erstellung mit allen Parametern, Beat-Editor, Prüfen+Optimieren, Datei-Dialog |
| Markenstimme | ✅ stabil | Eigene Beispielskripte → App schreibt im eigenen Ton |
| Virale Bibliothek | ✅ stabil | Video-Analyse, lokale Whisper-Transkription |
| Grafiken | ✅ stabil | Remotion-Overlays, Format/Position, MOV+WebM Export; Transcript-Modus wenn Video transkribiert |
| Projekte | ✅ stabil | Skripte speichern, laden, löschen |
| Animationen | ✅ stabil | Bibliothek mit Suche, Preview-Player, Download |
| Schnitt | ⚠ in Arbeit | Grundstruktur funktioniert, Animation-Step noch fehlerhaft |

**Tab-State:** Alle Tabs bleiben gemountet (CSS `display:none`) — kein State-Verlust beim Wechsel.

---

## 3. Generator
- Alle Parameter: Plattform, Video-Typ, Detailtiefe, Bildsprache, Hook-Ebenen, Archetyp, Framework, Länge, Loop, Tonalität, CTA, Claim-Intensität
- Ausgabe: 3 Hooks, Body-Beats (text/einblendung/shot), CTA, Cover, Caption, Hashtags, Reichweiten-Rating
- Pro Beat neu generieren + „Prüfen & optimieren" mit Recherche-Verankerung
- Anti-Wiederholung: genutzte Hook-Formeln werden gemerkt

---

## 4. Remotion-Animations-System

### Skript-Overlays
| Komposition | Beschreibung |
|---|---|
| `TextCard` | Textkarte, Spring-Intro, Word-by-Word, Accent-Glow |
| `StatCard` | Daten-Viz, Count-Up, animierte Balken |
| `BodyMarker` | Anatomie-Figur, Scan-Effekt, Pulse-Marker, Callout |

### Animations-Bibliothek (panel-basiert, nie Vollbild)
| Komposition | Beschreibung |
|---|---|
| `HeartPump` | Pulsierendes Herz + EKG + BPM — Glass-Panel |
| `Mitochondria` | Mitochondrium + ATP-Partikel + Energie-Counter — Glass-Panel |
| `KneeJoint` | Knie beugt/streckt + Winkelanzeige — Glass-Panel |
| `OrganAnim` | Universeller Wrapper für detaillierte SVG-Assets |

### Detaillierte SVG-Assets (`src/remotion/assets/medizin/`)
- `HeartSVG` — Herzquerschnitt (LV, RV, LA, RA, Septum, Aorta, Klappen)
- `LungSVG` — Beide Lungen (Trachea, Bronchien, Alveolen, animierter Atemzyklus)
- `MuscleSVG` — Muskelfaser (Sarkolemma, Myofibrillen, A-Band, I-Band, Z-Linie, Kontraktion)

### Katalog (`src/remotion/library.js`)
- 6 Einträge mit Tags + Kategorien
- `searchLibrary(query)`, `matchToLibrary(text)` — Auto-Match in Grafiken-Tab

### Layout-System (`src/remotion/utils/layout.jsx`)
- `GlassPanel`: Panel im unteren/oberen Drittel, 80px Safe-Zones, `backdrop-filter: blur(24px)`
- Animationen **nie Vollbild** — immer im Panel
- Typografie-Mindestgröße: 34px (≈12px auf Mobilscreen)

---

## 5. Video-Export (Animations-Tab / Grafiken-Tab)

**Standalone-Export (Animationen-Tab, Grafiken-Tab):**
```
renderFrames() → PNG-Frames (Magenta-Hintergrund)
ffmpeg chromakey → ProRes 4444 (.mov) ODER VP9 (.webm)
```
- MOV in Premiere ✅ getestet
- Alpha-Fringing an Kanten (Sidequest F) — Workaround aktiv

---

## 6. Schnitt-Pipeline — Architektur (Stand nach Refactor)

**Geteilter App-State:**
```js
timedAnimations[]  // ← single source of truth
lastTranscript     // Whisper-Output
videoFormat        // "9:16" | "16:9"
videoPosition      // "bottom" | "top"
```

**Pipeline-Schritte:**
```
① Upload Video (videos/-Ordner oder neu hochladen)
② Transkribieren (Whisper, Wort-Timestamps)
③ Schnitt-Review (Claude schlägt Cuts vor → User ✓/✗)
④ Animations-Review (Claude schlägt Animationen vor → User ✓/✗)
   ↑ NEU: funktioniert MIT und OHNE Script
⑤ Rendern → geschnittenes Video + Animations-Overlays → MP4 Download
```

**Animations-Vorschlag (zwei Quellen):**
- Mit Script: `match-beats` matcht Script-Beats auf Transcript-Timestamps
- Ohne Script: `suggest-animations` analysiert Transcript direkt (fehlt noch, in Arbeit)

**Server-Endpunkte Schnitt:**
- `POST /api/upload-video` — Video in `videos/` speichern (multer)
- `POST /api/transcribe` — Whisper mit Wort-Timestamps
- `POST /api/analyze-cuts` — Claude → Versprecher-Vorschläge
- `POST /api/match-beats` — Script-Beats auf Transcript-Timestamps mappen
- `POST /api/suggest-animations` — **[in Arbeit]** Transcript → Animations-Vorschläge ohne Script
- `POST /api/compose-video` — Video schneiden + Animationen drüberlegen → MP4

**Bekannte Bugs (in Arbeit):**
- Ohne geladenes Script: keine Animationen (suggest-animations fehlt noch)
- Double-State (`beatTimings` lokal vs `timedAnimations` App) → in Cleanup

---

## 7. Konfiguration
- `ANTHROPIC_API_KEY`, `CLAUDE_MODEL=claude-opus-4-8`, `PORT=8787`
- `WHISPER_MODEL=medium`, `WHISPER_LANG=de`

---

## 8. Wichtige Bugfixes (historisch)

| Problem | Fix |
|---|---|
| API-Key nicht geladen | `dotenv.config({ override: true })` |
| Datei-Dialog keine Dateien | accept-Attribut entfernt, Browser-Upload |
| Port already in use | .bat killt alte Ports beim Start |
| Tabs verlieren State | CSS `display:none` statt unmount |
| Animations-Player leer | `position:relative` + `initialFrame` ~55% |
| Kein Ton im Export-Video | Re-encode statt `-c copy`, explizites `-map 0:a` |

---

## 9. Pfade
| Zweck | Pfad |
|---|---|
| Frontend | `skript-studio-app/src/App.jsx` |
| Backend | `skript-studio-app/server/index.js` |
| Remotion-Kompositionen | `skript-studio-app/src/remotion/compositions/` |
| SVG-Assets | `skript-studio-app/src/remotion/assets/medizin/` |
| Library-Katalog | `skript-studio-app/src/remotion/library.js` |
| Layout-System | `skript-studio-app/src/remotion/utils/layout.jsx` |
| Recherche-Dokumente | `Skripte/` |
