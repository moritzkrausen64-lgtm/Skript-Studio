# Was wir noch vorhaben — offene Punkte & Roadmap

**Stand:** 5. Juni 2026 · Chat-Ende nach Sitzung 6

---

## ══ NÄCHSTE SESSION: HIER WEITERMACHEN ══

### Generierte Animationen testen + ggf. verfeinern

**Aktueller Zustand (neu in Sitzung 6):**
- Step ③ (Animationen) hat editierbare Karten: Transkript-Kontext, Beat, Einblendung, Timestamp, Typ-Dropdown, Props
- Animations-Prompt (Spec) ist pro Karte aufklappbar, vorausgefüllt, editierbar
- "Animation generieren"-Button ruft Claude → generiert Remotion JSX → speichert Datei → updated Root.jsx → Bundle-Cache wird invalidiert
- Nach Generierung: Mini-Player in der Karte (Vite HMR dynamic import)
- `resolveComposition`-Bug gefixt (format/position für Library-Typen)
- Grafiken-Tab zeigt jetzt echte Previews (props aus timedAnimations)
- Cuts-Schritt entfernt — Flow: Upload → Transkription → Animationen → Rendern → Fertig
- `/api/suggest-animations` upgraded: Claude generiert Animations-Props (label, bpm etc.) aus Transkript-Inhalt

**Was als nächstes getestet/verfeinert werden sollte:**
- Generierung einer echten Animation testen (Claude-Code-Qualität prüfen)
- Evtl. Prompt-Template anpassen wenn Claude-Code nicht gut genug
- Export (MOV/WebM) für generierte Animationen — Bundle wird beim nächsten Render neu gebaut

**2. Editierbare Felder pro Karte** (client-seitig, kein Server)
- `einblendung` als Freitext-Input
- `beat` als Freitext-Input  
- `libraryId` als Dropdown (aus LIBRARY-Katalog)
- Änderung → update `timedAnimations[i]` via `onTimedAnimations` → Player re-rendert automatisch

**3. Remotion Player Thumbnail pro Karte** (client-seitig, kein Server)
- Kleiner Player (~140px breit) direkt in der Karte
- Zeigt die aktuelle Animation live
- Kein separater "Neu generieren"-Server-Call nötig — State-Update genügt

**4. Bug fix: `resolveComposition` für Library-Typ**
- Aktuell: `format` und `position` werden NICHT an Library-Kompositions-Props weitergegeben
- Fix: In `resolveComposition`, wenn `typ === "library"`, Props um `format` und `position` aus dem Spec ergänzen
- Das behebt auch den Grafiken-Tab ("keine Grafiken erstellt") — sobald Props korrekt übergeben werden, funktioniert der Player

```js
// In resolveComposition (App.jsx), library-Zweig:
if (spec.typ === "library" && spec.libraryId) {
  const entry = LIBRARY.find((e) => e.id === spec.libraryId);
  if (entry) return {
    component: entry.component,
    duration: entry.duration,
    props: {
      ...entry.defaultProps,
      ...(spec.props || {}),
      format: spec.format || "9:16",       // ← fehlt aktuell
      position: spec.position || "bottom",  // ← fehlt aktuell
    }
  };
}
```

**5. Entscheidung dokumentiert: "Nur diese neu erstellen" = lokal only**
- Änderungen in Step ④ sind rein client-seitig (React State + Remotion Player)
- MOV/WebM wird ERST in Step ⑤ (Render) erzeugt
- Kein Server-Call aus Step ④ nötig außer beim finalen Rendern

**Ziel-Design einer Karte in Step ④:**
```
┌──────────────────────────────────────────────────────────┐
│ @0.0s  KNIESCHMERZEN INTRO                               │
│ Transkript: "...Schmerzen im Kniegelenk nach dem..."     │
│                                                          │
│ Einblendung: [Schmerzen im Kniegelenk        ] (edit)   │
│ Typ: [knee-joint ▼]  Zeit: [0.0  s] (edit)             │
│                                                          │
│ [Kleiner Remotion Player 140x249px]  [✓ Bestätigt]      │
│                                      [✗ Verwerfen]       │
└──────────────────────────────────────────────────────────┘
```

---

## A. Schnitt-Pipeline — offene Punkte

### A1. Step ④ (siehe oben, PRIORITÄT 1)

### A2. Step ⑤ Render — Qualität
- [ ] Fortschritts-Anzeige während Render (aktuell schwarze Box, keine Info)
- [ ] Fehler-Handling wenn ffmpeg-Overlay-Schritt versagt
- [ ] Timeout für zu lange Render-Jobs (aktuell kann hängen)
- [ ] Animations-Render parallel statt sequenziell

### A3. Compose-Pipeline: Format-Dimensionen prüfen
- Video könnte andere Auflösung haben als 1080x1920 (9:16) oder 1920x1080 (16:9)
- ffmpeg overlay-Koordinaten (x/y/w/h) müssen zur tatsächlichen Video-Auflösung skaliert werden
- Aktuell: feste Pixel-Werte aus PANEL_DIMS — könnte bei anderen Auflösungen falsch sitzen

---

## B. Animations-Bibliothek erweitern
- [ ] Weitere Organe: Schulter, Hüfte, Sehne, Wirbelsäule, Gehirn
- [ ] Kategorie "Sport": Laufzyklus, Sprung-Mechanik
- **Wie hinzufügen:** SVG-Asset → Composition → library.js → Root.jsx

---

## C. Geplante Erweiterungen
- [ ] **ElevenLabs-Timing:** Word-Timestamps aus TTS als `startTime` nutzen (Architektur vorbereitet)
- [ ] **Avatar + KI-Stimme:** Script → AI-Video → gleiche Compose-Pipeline
- [ ] **Batch-Modus:** 1 Thema → mehrere Script-Varianten
- [ ] **Performance-Loop:** View-/Like-Zahlen → Reichweiten-Rating kalibrieren
- [ ] **Script-Export** als .txt/.md/PDF

---

## D. Bekannte offene Probleme (Sidequests)

### D1. Alpha-Export (Magenta-Fringing)
MOV in Premiere ✅. Leichter rosa Rand durch Chromakey-Toleranz (~0.377 Abstand Dunkelgrau zu Magenta). Workaround: similarity=0.25. Echte Lösung: RGBA aus Chrome (Remotion-intern).

### D2. Canva
Grundsätzliche Plattform-Limitation — Canva unterstützt kein Video-Alpha.

---

## E. Mögliche Verbesserungen
- [ ] Whisper-Modell in UI umschaltbar
- [ ] Bibliothek: Highlight-Sequenzen per UI konfigurieren
- [ ] `API.txt` löschen (Key liegt in .env, Datei ist Sicherheitsrisiko)

---

## Architektur-Prinzipien (dauerhaft gültig)

### Single Source of Truth
```
timedAnimations[] in App-State
  = was animated wird, wann, mit welchem Typ
  = befüllt von: match-beats (mit Script) ODER suggest-animations (ohne Script)
  = gelesen von: Grafiken-Tab (Vorschau), Schnitt-Tab Step④+⑤
  = Änderungen in Step④: direkt in timedAnimations schreiben (kein Server)
```

### Pipeline-Datenfluss
```
Script (optional) + Transcript → timedAnimations[] → [Step④ review] → Compose → MP4
```

### Animationen: Client vs. Server
```
Client (sofort, kein Server):
  - Remotion Player Preview (in Grafiken-Tab und Step④)
  - Änderungen an einblendung/beat/libraryId/startTime
  - ✓/✗ für einzelne Animationen

Server (nur beim finalen Render, Step⑤):
  - renderFrames() → PNG-Frames
  - ffmpeg → Schnitt + Overlay → MP4
```

### Format & Positionierung
- 9:16: Panel unten y=1490, Breite 920px | Panel oben y=80
- 16:9: Panel unten y=720, Breite 1760px
- 80px Safe-Zone rundum, Person mittig angenommen

### Zukunfts-Offenheit (ElevenLabs, Avatar)
- `format`, `position`, `startTime`, `endTime` in timedAnimations → externe Timestamps direkt einsetzbar
- Compose-Pipeline ist unabhängig davon WIE die timedAnimations befüllt wurden

---

## Notizen / Entscheidungen

- **2026-06-04 S1:** API-Key-Bug, Datei-Dialog, Port-Cleanup
- **2026-06-04 S2:** Remotion + MOV-Export (✅ Premiere)
- **2026-06-04 S3:** Animations-Bibliothek, Layout-System, Glass-Panel
- **2026-06-04 S4:** Schnitt-Tab Grundstruktur, Audio-Fix, timedAnimations App-State
- **2026-06-04 S5:** Architektur-Cleanup: Double-State entfernt, suggest-animations ohne Script, JSON-Parse robust gemacht, Step④ neu strukturiert
- **2026-06-04 S5 Ende:** Step④ zeigt noch keine Player-Previews und keine editierbaren Felder. Nächste Session: resolveComposition-Bug fixen + Step④ redesign (siehe oben).
