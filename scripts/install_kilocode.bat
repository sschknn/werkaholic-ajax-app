@echo off

:: Kilocode CLI Installationsskript
:: Dieses Skript automatisiert die Installation des Kilocode CLI gemäß der README.md

echo Starte die Installation des Kilocode CLI...

:: Schritt 1: Klone das Kilocode-Repository
echo Klone das Kilocode-Repository...
"C:\Program Files\Git\cmd\git.exe" clone https://github.com/kilocode/kilocode-cli.git

:: Überprüfe, ob das Klonen erfolgreich war
if %ERRORLEVEL% neq 0 (
    echo Fehler: Das Klonen des Repositories ist fehlgeschlagen.
    exit /b 1
)

:: Schritt 2: Navigiere in das Projektverzeichnis
echo Navigiere in das Projektverzeichnis...
cd kilocode-cli

:: Schritt 3: Installiere die Abhängigkeiten
echo Installiere die Abhängigkeiten...
npm install

:: Überprüfe, ob die Installation der Abhängigkeiten erfolgreich war
if %ERRORLEVEL% neq 0 (
    echo Fehler: Die Installation der Abhängigkeiten ist fehlgeschlagen.
    exit /b 1
)

:: Schritt 4: Installiere das CLI global
echo Installiere das CLI global...
npm install -g

:: Überprüfe, ob die globale Installation erfolgreich war
if %ERRORLEVEL% neq 0 (
    echo Fehler: Die globale Installation des CLI ist fehlgeschlagen.
    exit /b 1
)

:: Schritt 5: Überprüfe die Installation
echo Überprüfe die Installation...
kilocode --version

if %ERRORLEVEL% equ 0 (
    echo Die Installation des Kilocode CLI war erfolgreich!
) else (
    echo Fehler: Die Installation des Kilocode CLI ist fehlgeschlagen.
    exit /b 1
)