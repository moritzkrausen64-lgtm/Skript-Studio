# Skript-Studio (lokale App)

Erzeugt aus deinen Recherche-Dokumenten deutsche Short-Form-Video-Skripte
(TikTok/Reels) für Sport & Gesundheit. Läuft komplett lokal.

## Aufbau
- **Frontend** (Vite + React): das UI aus dem Prototyp – Ordner `src/`
- **Backend** (Express, Node): liest Ordner, ruft die Anthropic-API auf, speichert JSON – `server/index.js`
- **Daten**: lokale JSON-Dateien im Ordner `data/` (entsteht automatisch)

## 1. API-Key eintragen (einmalig)
1. Key holen unter https://console.anthropic.com (beginnt mit `sk-ant-`).
2. Datei `.env` öffnen und `sk-ant-DEIN-KEY-HIER` durch deinen echten Key ersetzen.
3. Speichern. Der Key bleibt nur lokal im Server – nie im Browser.

## 2. App starten
Im Projektordner ein Terminal öffnen und:

```
npm run dev
```

Das startet Server (Port 8787) **und** Frontend (Port 5173) zusammen.
Der Browser öffnet automatisch http://localhost:5173 .
Zum Beenden im Terminal `Strg + C`.

## 3. Benutzen
1. Links unter **„Recherche-Ordner einlesen"** den Pfad zu deinem Ordner mit
   Recherche-Dateien (.txt/.md/.docx/.pdf) eintragen und auf den Ordner-Button klicken.
   Jede Datei wird ein wählbares **Thema**. (Alternativ über „+" manuell einfügen.)
2. Thema wählen, Parameter einstellen, **„Skript erzeugen"**.
3. Einzelne Beats neu generieren, **„Prüfen & optimieren"** (mit Recherche-Verankerung),
   und im Tab **Grafiken** Overlays als PNG/SVG exportieren.

## 4. Videos lokal transkribieren (virale Bibliothek)
Die Tonspur eigener Videos lässt sich **lokal und ohne API-Kosten** in Text wandeln
(faster-whisper, läuft offline auf der CPU).

**Einmaliges Setup** (installiert eine isolierte Python-Umgebung `.venv`):
1. Doppelklick auf `whisper-setup.bat` – installiert faster-whisper inkl. allem Nötigen
   (auch ffmpeg-Ersatz via PyAV; ein separates ffmpeg ist **nicht** nötig).
2. Voraussetzung: Python ist installiert (`py --version`). Sonst von python.org installieren.

**Benutzen:**
1. Videodateien (`.mp4`/`.mov` u.a.) in den Ordner `videos/` legen.
2. Tab **Virale Bibliothek** → Dropdown „Lokal transkribieren" → Datei wählen
   (🔄 aktualisiert die Liste) → **„Transkribieren"**. Das Ergebnis landet automatisch
   im Transkript-Feld.
3. Im Feld **„Visuelle Elemente"** kurz Einblendungen/Schnitte beschreiben (deckt die
   Tonspur nicht ab) → **„Analysieren & speichern"**.

- Beim **ersten** Transkribieren lädt das Sprachmodell einmalig herunter
  (nach `whisper/models/`). Größe je nach `WHISPER_MODEL` in der `.env`
  (`tiny`/`base`/`small`/`medium`/`large-v3`). Aktuell: `large-v3` (höchste Genauigkeit,
  auf reiner CPU langsamer – mehrere Minuten pro Video möglich).

## Hinweise
- Jede Generierung ist ein API-Aufruf und kostet ein paar Cent (Modell: Opus 4.8).
  Modell änderbar in `.env` (`CLAUDE_MODEL`).
- Transkription läuft lokal und kostet nichts. Modellgröße/Sprache in `.env`
  (`WHISPER_MODEL`, `WHISPER_LANG`).
- Daten/Key liegen nur auf deinem PC. `.env`, `data/`, `.venv`, `videos/` und
  `whisper/models/` sind in `.gitignore`.
