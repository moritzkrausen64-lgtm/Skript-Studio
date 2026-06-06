# Setup auf dem Mac

## Voraussetzungen installieren

### 1. Node.js (via nvm empfohlen)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### 2. Python + faster-whisper
```bash
pip3 install faster-whisper
```

### 3. ffmpeg
```bash
brew install ffmpeg
```
*(Homebrew installieren falls nötig: https://brew.sh)*

---

## App einrichten

```bash
cd skript-studio-app

# Abhängigkeiten installieren
npm install

# .env anlegen
cp .env.example .env
# → .env öffnen und ANTHROPIC_API_KEY eintragen
```

---

## Whisper-Modell herunterladen

Beim ersten Transkribieren lädt faster-whisper das Modell automatisch herunter (~1,5 GB).
Alternativ manuell:
```bash
python3 -c "from faster_whisper import WhisperModel; WhisperModel('medium')"
```

Das Modell landet in `~/.cache/huggingface/hub/` (Mac Standard-Cache).

**Wichtig:** In `whisper/transcribe.py` den Cache-Pfad prüfen — Windows nutzt `whisper/models/`,
Mac nutzt den Standard-Huggingface-Cache. Ggf. anpassen:
```python
# In transcribe.py — diese Zeile ggf. entfernen/anpassen:
model = WhisperModel(model_size, device="cpu", compute_type="int8",
                     download_root="whisper/models")  # ← auf Mac weglassen oder Pfad anpassen
```

---

## App starten

```bash
npm run dev
```

Öffnet automatisch http://localhost:5173

---

## Windows → Mac: Was nicht übertragen wird

- `.env` → muss manuell erstellt werden (API-Key)
- `videos/` → Videodateien per USB/Cloud übertragen
- `whisper/models/` → wird automatisch neu heruntergeladen
- `data/` → lokale Projektdaten (optional per USB übertragen)
