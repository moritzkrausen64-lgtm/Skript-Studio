@echo off
title Skript-Studio
cd /d "%~dp0"

echo ============================================
echo   SKRIPT-STUDIO startet...
echo   Der Browser oeffnet sich gleich automatisch.
echo   Dieses Fenster bitte offen lassen.
echo   Zum Beenden: dieses Fenster schliessen oder STRG+C.
echo ============================================
echo.

:: Alten Prozess auf Port 8787 beenden (falls noch aktiv)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8787 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
:: Alten Prozess auf Port 5173 beenden (falls noch aktiv)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 /nobreak >nul

call npm run dev
echo.
echo Server beendet. Taste druecken zum Schliessen.
pause >nul
