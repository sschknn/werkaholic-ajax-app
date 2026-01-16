# Empfohlene Erweiterungen und Einstellungen

## Erweiterungen für Visual Studio Code

### 1. ESLint
- **Beschreibung**: Identifiziert und behebt Probleme in JavaScript-Code.
- **Installation**:
  ```bash
  ext install dbaeumer.vscode-eslint
  ```
- **Konfiguration**:
  - Erstellen Sie eine `.eslintrc.json`-Datei im Projektverzeichnis.
  - Beispielkonfiguration:
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

### 2. Prettier
- **Beschreibung**: Code-Formatierung für konsistente Stile.
- **Installation**:
  ```bash
  ext install esbenp.prettier-vscode
  ```
- **Konfiguration**:
  - Erstellen Sie eine `.prettierrc`-Datei im Projektverzeichnis.
  - Beispielkonfiguration:
    ```json
    {
      "printWidth": 80,
      "tabWidth": 2,
      "useTabs": false,
      "semi": true,
      "singleQuote": false
    }
    ```

### 3. GitLens
- **Beschreibung**: Erweitert die Git-Funktionalität in VSCode.
- **Installation**:
  ```bash
  ext install eamodio.gitlens
  ```
- **Konfiguration**:
  - Aktivieren Sie die GitLens-Funktionen in den VSCode-Einstellungen.

### 4. Debugger for Chrome/Firefox
- **Beschreibung**: Debugging für Webanwendungen.
- **Installation**:
  ```bash
  ext install msjsdiag.debugger-for-chrome
  ext install firefox-devtools.vscode-firefox-debug
  ```
- **Konfiguration**:
  - Erstellen Sie eine `launch.json`-Datei für die Debugging-Konfiguration.

### 5. Live Server
- **Beschreibung**: Startet einen lokalen Entwicklungsserver.
- **Installation**:
  ```bash
  ext install ritwickdey.LiveServer
  ```
- **Konfiguration**:
  - Starten Sie den Server mit einem Klick auf "Go Live" in der Statusleiste.

## Einstellungen für Visual Studio Code

### 1. Editor-Einstellungen
- **Einstellungen**:
  ```json
  {
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
  ```

### 2. Terminal-Einstellungen
- **Einstellungen**:
  ```json
  {
    "terminal.integrated.shell.windows": "C:\\Windows\\system32\\cmd.exe",
    "terminal.integrated.fontSize": 14
  }
  ```

### 3. Git-Einstellungen
- **Einstellungen**:
  ```json
  {
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "git.confirmSync": false
  }
  ```

## Zusammenfassung

Die empfohlenen Erweiterungen und Einstellungen sind nun vollständig aufgelistet. Diese können installiert und konfiguriert werden, um die Entwicklungsumgebung optimal zu unterstützen.