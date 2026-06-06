# Skript-Studio — Projekt-Dokumentation

> Diese Doku ist der **Gedächtnis-Anker** für das Projekt. Hier steht, was gebaut wurde,
> wie es aufgebaut ist und was noch offen ist. Bei jeder Sitzung zuerst hier reinschauen.

**Letzte Aktualisierung:** 4. Juni 2026 · Sitzung 5-Ende

## Wo weitermachen
→ `02_Was-wir-noch-vorhaben.md` ganz oben: **„NÄCHSTE SESSION: HIER WEITERMACHEN"**
Kurzfassung: Step④ im Schnitt-Tab braucht Player-Previews + editierbare Felder + Transcript-Snippet. Ein Bug-Fix in `resolveComposition` (format/position für Library-Typen) löst auch den leeren Grafiken-Tab.
**Projektordner:** `C:\Users\morit\Desktop\Claude`

---

## Was ist Skript-Studio?
Eine **lokale App** (läuft nur auf deinem PC, nur für dich), die aus deinen
Recherche-Dokumenten deutsche **Short-Form-Video-Skripte** (TikTok / Instagram Reels)
für die Nische **Sport & Gesundheit** erzeugt. Zielgruppe/Autor: Physiotherapeut &
Sportler. Ausgabe immer **Deutsch, Du-Form**.

## Aktueller Stand in einem Satz
Die App ist **fertig gebaut und lauffähig** (Frontend + Backend + lokale Transkription).
Alle Kernfunktionen aus der Bauanleitung sind umgesetzt. Es geht jetzt um **Nutzung,
Feinschliff und die geplanten Erweiterungen**.

## Dateien in dieser Doku
- **00_Uebersicht.md** — diese Datei (Schnellorientierung)
- **01_Was-wir-gemacht-haben.md** — vollständiger Bau- & Fortschrittsstand
- **02_Was-wir-noch-vorhaben.md** — offene Punkte & Roadmap

## App starten (Kurzfassung)
```
cd C:\Users\morit\Desktop\Claude\skript-studio-app
npm run dev
```
Startet Server (Port 8787) + Frontend (Port 5173); Browser öffnet automatisch.
Beenden mit `Strg + C`.

## Wichtigste Pfade
| Zweck | Pfad |
|---|---|
| Die App | `skript-studio-app\` |
| Frontend-UI (alles) | `skript-studio-app\src\App.jsx` |
| Backend-Server | `skript-studio-app\server\index.js` |
| Konfiguration / API-Key | `skript-studio-app\.env` |
| Recherche-Dokumente | `Skripte\` (z. B. `VO2 MAx.docx`) |
| Videos für Transkription | `skript-studio-app\videos\` |
| Lokale Daten (JSON) | `skript-studio-app\data\` |
| Ursprünglicher Prototyp | `skript-studio.jsx` |
| Konzept / Bauanleitung | `SKRIPT-STUDIO_Bauanleitung.md` |

## ⚠️ Sicherheits-Hinweis
Im Hauptordner liegt `API.txt` mit einem API-Key im Klartext. Der gehört nur in die
`.env`. Wenn der Ordner je geteilt/synchronisiert wird, ist der Key sichtbar →
am besten `API.txt` löschen, sobald der Key in der `.env` steht (ist er bereits).
