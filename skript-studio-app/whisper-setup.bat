@echo off
REM ==========================================================================
REM  Einmaliges Setup fuer die lokale Transkription (faster-whisper).
REM  Legt eine isolierte Python-Umgebung (.venv) an und installiert dort
REM  faster-whisper inkl. aller Abhaengigkeiten (auch ffmpeg via PyAV).
REM  Beim ersten echten Transkribieren wird zusaetzlich das Sprachmodell
REM  geladen (Groesse je nach WHISPER_MODEL in der .env).
REM ==========================================================================
cd /d "%~dp0"

echo.
echo === [1/3] Erstelle Python-Umgebung (.venv) ...
py -m venv .venv
if errorlevel 1 (
  echo FEHLER: Konnte .venv nicht erstellen. Ist Python installiert? ^(py --version^)
  pause
  exit /b 1
)

echo.
echo === [2/3] Aktualisiere pip ...
".venv\Scripts\python.exe" -m pip install --upgrade pip

echo.
echo === [3/3] Installiere faster-whisper (grosser Download, einige Minuten) ...
".venv\Scripts\python.exe" -m pip install -r whisper\requirements.txt
if errorlevel 1 (
  echo FEHLER: Installation fehlgeschlagen. Siehe Meldungen oben.
  pause
  exit /b 1
)

echo.
echo === FERTIG. Du kannst die App jetzt starten und transkribieren. ===
pause
