# Anleitung zur Konfiguration der Entwicklungsumgebung

## Schritt 1: Installation der Tools

### 1.1 Git installieren
- **Windows**:
  - Lade Git für Windows von [git-scm.com](https://git-scm.com/download/win) herunter und installiere es.
  - Führe die folgenden Befehle aus, um Git zu konfigurieren:
    ```bash
    git config --global user.name "Dein Name"
    git config --global user.email "deine@email.com"
    ```

- **Unix/Linux/macOS**:
  - Installiere Git mit dem folgenden Befehl:
    ```bash
    sudo apt-get install git
    ```
  - Führe die folgenden Befehle aus, um Git zu konfigurieren:
    ```bash
    git config --global user.name "Dein Name"
    git config --global user.email "deine@email.com"
    ```

### 1.2 Node.js und npm installieren
- **Windows**:
  - Lade Node.js von [nodejs.org](https://nodejs.org/) herunter und installiere es.
  - Überprüfe die Installation mit:
    ```bash
    node --version
    npm --version
    ```

- **Unix/Linux/macOS**:
  - Installiere Node.js und npm mit dem folgenden Befehl:
    ```bash
    sudo apt-get install nodejs npm
    ```
  - Überprüfe die Installation mit:
    ```bash
    node --version
    npm --version
    ```

### 1.3 Visual Studio Code installieren
- Lade VSCode von [code.visualstudio.com](https://code.visualstudio.com/) herunter und installiere es.

### 1.4 Docker installieren (optional)
- **Windows**:
  - Lade Docker Desktop von [docker.com](https://www.docker.com/products/docker-desktop) herunter und installiere es.
  - Überprüfe die Installation mit:
    ```bash
    docker --version
    ```

- **Unix/Linux/macOS**:
  - Installiere Docker mit dem folgenden Befehl:
    ```bash
    sudo apt-get install docker-ce
    ```
  - Überprüfe die Installation mit:
    ```bash
    docker --version
    ```

## Schritt 2: Installation des Kilocode CLI

### 2.1 Kilocode CLI installieren
- **Windows**:
  - Führe das Installationsskript aus:
    ```bash
    .\scripts\install_kilocode.bat
    ```

- **Unix/Linux/macOS**:
  - Führe das Installationsskript aus:
    ```bash
    ./scripts/install_kilocode.sh
    ```

### 2.2 Installation überprüfen
- Überprüfe die Installation des Kilocode CLI mit:
  ```bash
  kilocode --version
  ```

## Schritt 3: Konfiguration von Visual Studio Code

### 3.1 Erweiterungen installieren
- Öffne VSCode und installiere die folgenden Erweiterungen:
  - ESLint
  - Prettier
  - GitLens
  - Debugger for Chrome/Firefox
  - Live Server

### 3.2 Einstellungen konfigurieren
- Öffne die VSCode-Einstellungen (`Strg + ,`) und füge die folgenden Einstellungen hinzu:
  ```json
  {
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "terminal.integrated.shell.windows": "C:\\Windows\\system32\\cmd.exe",
    "terminal.integrated.fontSize": 14,
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "git.confirmSync": false
  }
  ```

### 3.3 ESLint und Prettier konfigurieren
- Erstelle eine `.eslintrc.json`-Datei im Projektverzeichnis:
  ```json
  {
    "extends": "eslint:recommended",
    "rules": {
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["error", "always"]
    }
  }
  ```

- Erstelle eine `.prettierrc`-Datei im Projektverzeichnis:
  ```json
  {
    "printWidth": 80,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": false
  }
  ```

## Schritt 4: Überprüfung der Einrichtung

### 4.1 Tools überprüfen
- Überprüfe, ob alle Tools korrekt installiert sind:
  ```bash
  git --version
  node --version
  npm --version
  kilocode --version
  docker --version (optional)
  ```

### 4.2 VSCode-Einstellungen überprüfen
- Öffne VSCode und überprüfe, ob alle Erweiterungen installiert sind.
- Überprüfe die Einstellungen in der `settings.json`-Datei.

### 4.3 Projektstruktur überprüfen
- Überprüfe die Projektstruktur im Verzeichnis `c:/coding`:
  ```bash
  dir c:/coding
  ```

## Zusammenfassung

Die Entwicklungsumgebung ist nun vollständig konfiguriert. Alle Tools und Erweiterungen sind installiert und bereit für die Nutzung. Überprüfe die Einrichtung und beginne mit der Entwicklung.