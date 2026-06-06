# Zielbild: Das fusionierte Gesamt-Tool (Skript-Studio × VideoCut)

**Stand:** 2026-06-06 · Visuelle Variante: `ZIEL-Gesamttool.html` (im Browser öffnen)

Dieses Dokument prüft **alle bestehenden Prozesse** beider Tools und zeigt, wie sie im
fusionierten Gesamt-Tool zu **einer Oberfläche mit einem durchgängigen Workflow** werden.

---

## 1. Prozess-Check — was existiert heute schon? (geprüft im Code)

### VideoCut Studio (Express, Port 3001, Vanilla-JS-UI, Hyperframes)
| Prozess | Endpunkt / Datei | Status |
|---|---|---|
| **Upload** (Drag&Drop) | `/api/upload` → `raw/` | ✅ vorhanden |
| **Transkription** (ElevenLabs Scribe, Wort-Timestamps) | `/api/transcribe` (SSE) → `transcripts/master.json` | ✅ vorhanden |
| **Phrasen/Pausen-Gruppierung** (Cut-Vorbereitung) | `pack_transcripts.py` | ✅ vorhanden |
| **Schnitt** (Versprecher/Pausen → edited.mp4) | `video-use/helpers/render.py` + `edl.json` | ✅ (Skill-Flow) |
| **Overlay-Engine** (Transkript → Callout-Cards + Subtitles) | `/api/compose` → `compositions/index.html` | ✅ **Kernstück** |
| **Beats aus Composition extrahieren** | `/api/compose/beats` | ✅ vorhanden |
| **Beat einzeln per Prompt patchen** (Preview/Confirm/Discard) | `/api/compose/patch-beat` | ✅ vorhanden |
| **Frame-Vorschau** (PNG mitten im Beat) | `/api/compose/frame` (hyperframes inspect) | ✅ vorhanden |
| **Hyperframes Studio / Preview** | `/api/preview` → localhost:3002 | ✅ vorhanden |
| **Final-Render** (1080p/4K) | `hyperframes render` → `renders/` | ✅ vorhanden |
| **Archiv** (Tags, Transkript, Herkunft) | `archive/.index.json` | ✅ vorhanden |
| **Struktur-Analyse** (Hook/Body/CTA/Archetyp/Framework) | `/api/library/analyze` | ✅ *„Taxonomie 1:1 aus Skript-Studio"* |
| **Effekt-Analyse** (Schnitte + Vision + SFX) | `/api/library/analyze-effects` | ✅ vorhanden |
| **Metriken + Virality-Score** (Views/Likes → Score) | `/api/library/metrics`, `computeScore()` | ✅ vorhanden |
| **Datengetriebener Skript-Generator** (lernt aus Top-Hooks) | `/api/generate` (`buildInsights`) | ✅ vorhanden |
| **Style-Guide / Motion-CI** (Easings, Fonts, Subtitle-Stil) | `docs/motion-philosophy.md`, `brand-guidelines/` | ✅ vorhanden |

### Skript-Studio (Vite/React, Express 8787) — heutiger Stand
| Prozess | Status |
|---|---|
| **Recherche-Ordner einlesen** (.txt/.md/.docx/.pdf) | ✅ einzigartig |
| **Markenstimmen-Bibliothek** (Auto-Tags, aktiv/umschaltbar) | ✅ einzigartig |
| **Generator** → Skript mit Hooks/Beats | ✅ |
| **`overlay/visuell/sound` pro Hook & Beat** (editierbar, pro Feld neu) | ✅ **= der Overlay-Vertrag** |
| **Skript-Optimierung + Faktencheck** (Recherche-Verankerung) | ✅ einzigartig |
| **Projekt-Ordner + Auto-Metadaten + Suche** | ✅ |

> **Befund:** Die beiden Tools überschneiden sich genau an drei Stellen, und es sind
> jeweils *dieselbe* Sache: (1) Skript-Generator, (2) Analyse-Taxonomie Hook/Body/CTA,
> (3) Overlay-Erzeugung + Beat-Editing. → Genau diese drei werden im Merge **zusammengeführt**,
> nicht doppelt gepflegt.

---

## 2. Die drei geteilten „Gehirne" (zentral, trainierbar)

Im Gesamt-Tool gibt es **drei** zentrale Logik-Bausteine, die von beiden Wegen genutzt werden:

1. **Skript-/Hook-Gehirn** — VideoCuts `generate.js` (datengetrieben aus echten Views)
   + Skript-Studios Recherche-Ordner, Markenstimme, Optimierung/Faktencheck.
2. **Overlay-Gehirn** — VideoCuts `compose.js` (Transkript → Callouts) als geteilter Layer
   `Text [+Timing] → overlay/visuell/sound [+Timing]`, gespeist von `motion-philosophy` + `brand-guidelines`.
3. **Analyse-Taxonomie** — `analyze.js` (Hook/Body/CTA/Archetyp/Framework) als **gemeinsames Vokabular**,
   das Generator, Overlay-Engine und Archiv verbindet.

Alle drei werden durch **eine Wissensbasis** besser: das **Performance-Archiv** (echte View-Metriken).

---

## 3. Die zwei Wege, die im Gesamt-Tool zusammenlaufen

### Weg A — Skript-first (geplant)
```
Recherche/Thema → Generator (Skript MIT overlay/visuell/sound)
   ├─ A1: Higgsfield-Avatar erzeugt das Video aus dem Skript
   └─ A2: Du nimmst dich selbst auf (sprichst das Skript)
→ Video → Transkription → [Overlays sind schon geplant → MATCHEN statt neu erfinden]
→ Hyperframes-Composition → Beats prüfen/patchen → Render → Archiv + Metriken
```

### Weg B — Video-first (VideoCut heute)
```
Video-Upload → Transkription → Schnitt (Versprecher/Pausen)
→ Overlay-Engine erfindet Overlays aus dem Transkript (read-only!)
→ Hyperframes-Composition → Beats prüfen/patchen → Render → Archiv + Metriken
```

**Der einzige Unterschied:** Weg A kennt die Overlays **vorab** (aus dem Skript) →
sie werden ans Transkript *gematcht*. Weg B leitet sie **nachträglich** aus dem Transkript ab.
Beide nutzen **denselben Overlay-Engine**.

### Die Lernschleife (schließt beide Wege)
```
Archiv (gerenderte Videos) + reale Metriken → Virality-Score
   ├─ Top-Hooks  → Skript-/Hook-Gehirn (Swipe-File)
   └─ Top-Overlays/Callouts → Overlay-Gehirn (Beispiel-Bibliothek + Style-Guide)
→ beide Wege werden mit jedem Video besser
```

---

## 4. Vorgeschlagene Oberfläche (eine App, VideoCut als Hülle)

| Tab | Inhalt | Quelle |
|---|---|---|
| **① Recherche & Skript** | Recherche-Ordner, Markenstimmen, Generator → Skript mit overlay/visuell/sound, Optimierung/Faktencheck | Skript-Studio + VideoCut `generate.js` |
| **② Aufnahme** | Higgsfield-Avatar **oder** Selbstaufnahme-Upload **oder** freier Video-Upload | neu (A1) + VideoCut Upload |
| **③ Transkript & Schnitt** | ElevenLabs Scribe, Versprecher/Pausen-Cut | VideoCut |
| **④ Overlays & Animation** | Overlay-Engine (Match bei Weg A / Auto bei Weg B), Beats bearbeiten/patchen, Frame-Vorschau | VideoCut `compose.js` (+ Skript-Overlays) |
| **⑤ Vorschau & Render** | Hyperframes Studio, final.mp4 / 4K | VideoCut |
| **⑥ Archiv & Performance** | Tags + Suche, Link + Metriken, Virality-Score, **Lernschleife** | VideoCut Bibliothek |

---

## 5. Was für den Merge konkret zu bauen ist

1. **Generatoren zusammenführen:** VideoCuts `generate.js` wird Basis; Skript-Studios
   Recherche-Ordner, Markenstimme, Optimierung/Faktencheck wandern hinein.
   **Schema-Mapping** `out` ↔ VideoCut `scripts/*.json` (Hauptarbeit).
2. **Overlay-Engine als geteilten Layer herausziehen:** `compose.js`-Logik so kapseln,
   dass sie sowohl aus dem Transkript (Weg B) als auch aus den Skript-Overlays (Weg A, Match) gespeist wird.
3. **Match-Funktion** Skript-Overlays ↔ Transkript-Timestamps (neu, für Weg A).
4. **Higgsfield-Anbindung** (A1) — Skript → Avatar-Video (neue Integration).
5. **UI-Vereinheitlichung (entschieden 2026-06-06): Vanilla-JS erweitern.**
   VideoCut **hat den Generator-Tab schon** (`app.js`) — Skript-Studios einzigartige
   Features (Recherche-Ordner, Markenstimme, Per-Feld-Editing, Optimierung/Faktencheck)
   werden in den bestehenden Vanilla-Tab ergänzt. **Kein React-Mount** (würde den
   durchgängigen Flow + die Overlay-/Lernschleifen-Kopplung an einer Framework-Grenze
   zerschneiden und ein zweites Persistenz-Modell mitschleppen). Skript-Studio bleibt Referenz/Spec.
6. **Style-/Beispiel-Bibliothek** des Overlay-Gehirns an die Lernschleife koppeln.

---

## 6. Hinweis zum „Testcheck"
Die VideoCut-Prozesse wurden hier **im Code geprüft** (Endpunkte, Datenfluss, Abhängigkeiten,
siehe Tabelle Abschnitt 1). Ein **echter End-to-End-Lauf** (Upload → Render) braucht
ElevenLabs-Key, ffmpeg, `hyperframes`, `uv`/Python und ein Testvideo — das kann ich auf
Wunsch separat als Live-Durchlauf machen. Der Code-Pfad selbst ist durchgängig und konsistent.
