# Skript-Studio – Bauanleitung für die lokale App

Dieses Dokument bringt dich vom Prototyp zur fertigen lokalen App auf deinem PC.
Es ist so geschrieben, dass du Teil 3 (den Start-Prompt) direkt in **Claude Code** einfügen kannst.

---

## Teil 1 – Was die App können soll (Konzept)

Eine lokale Desktop-/Browser-App, die aus deinen Recherche-Dokumenten schnittfertige
Short-Form-Video-Skripte (TikTok/Reels) für die Nische **Sport & Gesundheit** erzeugt.
Der Nutzer ist Physiotherapeut & Sportler. Sprache der Ausgabe: **immer Deutsch, Du-Form.**

### Kernablauf
1. App liest Recherche-Dokumente aus frei wählbaren **Ordnern** auf dem PC (gemischte Formate).
2. Nutzer wählt ein Thema (= ein Dokument/Ordner) per Dropdown.
3. Nutzer stellt Parameter ein (siehe unten).
4. App erzeugt ein vollständiges Skript-„Drehbuch".
5. Nutzer kann einzelne Abschnitte gezielt neu generieren, das Ganze prüfen/optimieren
   und Overlay-Grafiken für die Einblendungen erzeugen.

### Einstellbare Parameter (Generator)
- **Thema** – aus eingelesenem Ordner/Dokument
- **Plattform** – TikTok / Instagram Reels / Beide
- **Video-Typ** – Talking Head, Voiceover+B-Roll, POV, Reaction/Stitch, Tutorial, Listicle,
  Story, Skit, Green-Screen-Kommentar, Text-on-Screen, Before/After, Day-in-the-Life
- **Detailtiefe** – Anfänger / Medium / Experten (Anfänger = einfache Alltagserklärungen;
  Experten = rein in Physiologie/Mechanismen, Fachsprache erlaubt)
- **Bildsprache** – Ohne / Dezent / Viel (Metaphern & Analogien, verbindliche Regel im Prompt)
- **Hook-Ebene** (Mehrfachauswahl) – Visuell / Akustisch / Textlich / Sprachlich stark
- **Hook-Archetyp** – Auto / Neugier-Lücke / Warnung / Social Proof / Kontroverse /
  Relatability / Transformation / FOMO
- **Framework** – Pain-Problem-Solution / PAS / AIDA / Hook-Retain-Reward / Mythbusting /
  3-Tipps-Listicle / Story-Bogen
- **Länge** – 7 / 15 / 30 / 60 / 90 s, plus **Loop**-Option (Ende → Anfang)
- **Tonalität** – Edukativ-ruhig / Locker-relatable / Autoritär-Experte / Energetisch-hype /
  Provokant-frech
- **CTA-Ziel** – Follow / Kommentar / Save / Share / Link in Bio
- **Claim-Intensität** – Vorsichtig / Ausgewogen / Zugespitzt / Provokant
  (steuert NUR wie pointiert eine belegte Aussage verpackt wird, niemals Erfundenes)

### Skript-Ausgabe (Drehbuch)
- **3 Hook-Varianten**: gesprochener Satz + Overlay-Text + visueller Hinweis + Sound-Idee
- **Body** nach gewähltem Framework: pro Beat Text + Einblendung + Shot/Kameraeinstellung
- **CTA**
- **Cover-Frame** + Cover-Text
- **Caption** + Hashtags
- **Reichweiten-Potenzial-Rating** (siehe unten)

### Reichweiten-Potenzial-Rating
Gesamtwert 0–100 + Confidence (niedrig/mittel/hoch), zusammengesetzt aus Teil-Scores:
Audience-Breite, Pain-Intensität, Shareability, Saveability, Kommentar-Potenzial,
Hook-Stärke, Suchbarkeit/Evergreen, Sättigung.
Wichtig: Es ist **Potenzial**, keine View-Vorhersage. Bei niedrigem Score (<60) gibt die App
einen **Reframe-Vorschlag** für einen breiteren Einstieg (nischig ≠ wenig Reichweite).

### Abschnittsweise Überarbeitung
Pro Beat:
- **Stil-Dropdown**: Nur neu / Provokanter / Wissenschaftlicher / Emotionaler /
  Konkreter (Beispiel) / Einfacher erklärt
- **Längen-Dropdown**: Länge gleich / Kürzer / Länger
- **Freitextfeld**: eigenes Keyword/Anweisung (hat Priorität)
- Der restliche Skriptkontext geht mit, damit der rote Faden bleibt. Detailtiefe & Bildsprache
  bleiben erhalten.

### Prüfen & Optimieren (eigener Button)
Liest das ganze Skript erneut und verbessert es: roter Faden, Übergänge, Reihenfolge,
Verständlichkeit, Metaphern-Stimmigkeit, inhaltliche Korrektheit gegen die Recherche.
Gibt zusätzlich eine Liste „Was optimiert wurde" aus.

**Verankerungs-Option (zuschaltbar, Standard an):**
- Jede inhaltliche Kernaussage im **Body** wird an einen konkreten Satz/Fakt aus der Recherche
  gebunden.
- Aussagen ohne Beleg werden **markiert** (Faktencheck-Liste: belegt/unbelegt), NICHT erfunden,
  NICHT ausgeschmückt und NICHT heimlich weichgespült. Nur klare Widersprüche werden korrigiert.
- **Die Hook ist ausgenommen** – sie darf bewusst zuspitzen/übertreiben und wird nicht dem
  Faktencheck unterworfen.

### Zusatz-Module
- **Markenstimme**: Nutzer hinterlegt eigene Beispielskripte → App schreibt in seinem Ton.
- **Virale Bibliothek**: Link + Transkript/Beschreibung rein → App analysiert Hook-Ebene,
  Framework, Retention-Tricks, „warum es lief", abgeleitete Hook-Formel. Wächst zur Swipe-File.
- **Anti-Wiederholung**: genutzte Hook-Formeln werden gemerkt und bewusst variiert.
- **Grafiken**: pro Einblendung ein animiertes Overlay (Dark/Neon-Look, transparenter
  Hintergrund). Drei Typen: Text-Karte, Stat-Box (Zahl/Vergleichsbalken), Icon/Anatomie mit
  Pfeil auf Körperregion. Export als PNG (transparent) und SVG. **Später**: echtes Rendern zu
  MP4/WebM mit Alphakanal (z. B. via Remotion oder ffmpeg) für bewegte Overlays.
- **Performance-Loop** (optional, später): echte View/Like-Zahlen zurückfüttern, um das Rating
  an den eigenen Account zu kalibrieren.

---

## Teil 2 – Empfohlene Architektur (lokal, nur für dich)

Da die App lokal läuft und gemischte Dateiformate lesen soll:

- **Stack**: Ein kleiner lokaler Server (Node.js) + Web-Oberfläche im Browser.
  Empfehlung: **Vite + React** fürs Frontend, **Express** (Node) als lokaler Backend-Server.
  Grund: Das Frontend kann nicht selbst auf die Festplatte zugreifen – der lokale
  Node-Server liest die Ordner und reicht den Text ans Frontend weiter.
- **Dokumente einlesen** (gemischt):
  - `.txt` / `.md` → direkt lesen
  - `.docx` → mit `mammoth` Text extrahieren
  - `.pdf` → mit `pdf-parse` Text extrahieren
  - `.doc` (alt) → vorab konvertieren oder ignorieren
- **API-Aufrufe**: Der Node-Server ruft die Anthropic-API mit dem API-Key auf. Der Key liegt in
  einer lokalen `.env`-Datei und wird **nie** ins Frontend gegeben.
- **Speicherung**: lokale JSON-Dateien (oder SQLite) für Markenstimme, virale Bibliothek,
  genutzte Hook-Formeln, gespeicherte Skripte.
- **Modell**: `claude-sonnet-4-20250514` ist ein guter Standard für Preis/Qualität;
  in Claude Code nach dem aktuell besten verfügbaren Modell fragen.

### Kostenhinweis
Jede Generierung ist ein API-Aufruf und kostet je nach Modell und Textmenge ein paar Cent.
Das ist getrennt vom Chat-Abo. Für den Eigengebrauch in der Regel gering, aber gut zu wissen.

---

## Teil 3 – Start-Prompt für Claude Code

> Installiere zuerst Claude Code (Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`,
> Mac/Linux: `curl -fsSL https://claude.ai/install.sh | bash`).
> Erstelle einen leeren Projektordner, öffne dort ein Terminal, starte `claude` und füge den
> folgenden Text als erste Nachricht ein. Leg den Prototyp (`skript-studio.jsx`) mit in den
> Ordner – er dient als visuelle und funktionale Vorlage.

```
Ich möchte eine LOKALE App auf meinem PC bauen ("Skript-Studio"), die aus meinen Recherche-
Dokumenten deutsche Short-Form-Video-Skripte (TikTok/Reels) für die Nische Sport & Gesundheit
erzeugt. Sie läuft nur lokal, nur für mich.

Im Ordner liegt eine Datei skript-studio.jsx – das ist ein funktionierender Prototyp, der das
gesamte Verhalten, alle Parameter, die Prompts und das Design zeigt. Nutze ihn als verbindliche
Vorlage für Funktionsumfang, UI-Look (dunkel + Neon-Grün, athletisch) und die Prompt-Logik.

Bitte baue daraus eine echte lokale App mit dieser Architektur:
- Frontend: Vite + React (das UI aus dem Prototyp übernehmen/anpassen).
- Backend: lokaler Express-Server (Node) für Dateizugriff und API-Aufrufe.
- Der Server liest Recherche-Dokumente aus einem Ordner, den ich in der App auswählen/eintragen
  kann. Formate gemischt: .txt/.md direkt, .docx via mammoth, .pdf via pdf-parse.
- Die Anthropic-API wird NUR vom Server aufgerufen. Der API-Key kommt aus einer .env-Datei und
  darf nie im Frontend landen.
- Speicherung lokal als JSON-Dateien: Markenstimme, virale Bibliothek, genutzte Hook-Formeln,
  gespeicherte Skripte.

Funktionen (alle aus dem Prototyp übernehmen):
1. Generator mit allen Parametern (Plattform, Video-Typ, Detailtiefe, Bildsprache, Hook-Ebenen,
   Hook-Archetyp, Framework, Länge+Loop, Tonalität, CTA, Claim-Intensität).
2. Skript-Ausgabe: 3 Hooks, Body mit Beats (Text/Einblendung/Shot), CTA, Cover, Caption,
   Hashtags, Reichweiten-Rating mit Teil-Scores + Reframe.
3. Pro Beat: Neu-generieren mit Stil-Dropdown, Längen-Dropdown und Freitext-Anweisung.
4. "Prüfen & optimieren"-Button inkl. zuschaltbarer Recherche-Verankerung: Body-Aussagen an
   Recherchebelege binden, Unbelegtes als Faktencheck markieren (nicht erfinden, nicht glätten),
   die Hook ausdrücklich vom Faktencheck ausnehmen (Hook darf übertreiben).
5. Markenstimme, virale Bibliothek, Anti-Wiederholung.
6. Grafik-Tab: pro Einblendung animiertes SVG-Overlay (Text-Karte, Stat-Box, Icon/Anatomie mit
   Pfeil), Dark/Neon-Look, Export als PNG (transparent) und SVG.

Bitte richte das Projekt Schritt für Schritt ein, erkläre mir kurz was du tust, und sage mir
genau, wie ich die .env mit meinem API-Key anlege und wie ich die App starte. Frage nach dem
aktuell besten verfügbaren Claude-Modell, statt einen festen Namen anzunehmen.

Späteres Ziel (noch nicht jetzt bauen, nur im Hinterkopf behalten): echtes Rendern der Overlays
zu MP4/WebM mit Alphakanal, z. B. mit Remotion oder ffmpeg.
```

---

## Teil 4 – Deine Schritte von null bis laufende App

1. **Claude Code installieren** (Befehl oben). Bei Windows ggf. PowerShell als Admin öffnen.
2. **API-Key holen**: unter console.anthropic.com einen Key erstellen. (Nicht im Chat posten –
   du trägst ihn selbst lokal in die `.env` ein, sobald Claude Code dir sagt wie.)
3. **Projektordner anlegen**, den Prototyp `skript-studio.jsx` hineinkopieren.
4. **Terminal im Ordner öffnen**, `claude` starten, den Start-Prompt aus Teil 3 einfügen.
5. Claude Code durch die Einrichtung folgen lassen; es sagt dir, wann du den API-Key einträgst
   und mit welchem Befehl du die App startest (meist `npm run dev`).
6. **Recherche-Ordner eintragen**, ein Thema wählen, erstes Skript erzeugen.

### Hinweis zu Sicherheit
- Der API-Key gehört ausschließlich in die lokale `.env`-Datei, niemals ins Frontend, in einen
  Chat oder in geteilte Dateien.
- Lege die App-Konten/Keys selbst an – gib Passwörter und Keys nicht aus der Hand.

---

## Teil 5 – Sinnvolle Erweiterungen (für später)
- Echte bewegte Overlays (MP4/WebM mit Alpha) via Remotion/ffmpeg.
- Batch-Modus: ein Thema → mehrere Winkel/Skripte auf einmal.
- Performance-Loop: echte Zahlen zurückfüttern, Rating kalibrieren.
- Analogie-Bibliothek für „Viel Bildsprache".
- Verankerung mit Verweis auf die konkrete Quelldatei/Fundstelle statt nur eingefügtem Text.
```
