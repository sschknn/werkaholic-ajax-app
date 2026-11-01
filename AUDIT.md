# Repository Audit — werkaholic-ajax-app

**Datum:** 2026-10-27
**Pfad:** /mnt/windows/Users/frank/werkaholic-ajax-app (NAS-Pfad `/mnt/fritz-nas/.../werkaholic-ajax-app` enthält nur `node_modules`)

## Tech-Stack
- Frontend: React 19, Vite 7, TypeScript ~5.8, Tailwind CSS 4
- Hosting/Backend: Firebase (Hosting, Data Connect, Auth), Stripe (Payments)
- KI: @google/genai (Gemini)
- Weitere: @zxing (QR/Barcode), jspdf/html2canvas/jszip, recharts, lucide-react
- DB/Services: Supabase-Ordner vorhanden, Firebase Data Connect (Postgres/PGlite)

## Abhängigkeiten
Siehe `package.json` / `package-lock.json`. Install: `npm install` (node_modules vorhanden).

## Start-/Test-/Build-Kommandos
- Dev: `npm run dev` (Vite Dev-Server)
- Build: `npm run build` (vite build → `dist/`)
- Preview: `npm run preview`
- Firebase Deploy: `firebase deploy` (hosting public = `dist`)
- Firebase Emulators: `firebase emulators:start` (dataconnect)
- Keine Test-Skripte in package.json (kein jest/vitest konfiguriert).

## Datei-Inventar (ohne node_modules)
- ~263 Dateien; Hauptkomponenten in `components/`, `contexts/`, `services/`, `src/`
- `backup/` enthält ältere Kopien
- `plans/`, `supabase/`, `dataconnect/` vorhanden

## Status / Risiken
- Git-Working-Tree dirty (viele modifizierte Dateien, keine saubere Baseline)
- Keine automatisierten Tests → Regressionsrisiko
- `.env` nicht committet; `.env.example` vorhanden (Firebase/Stripe/AdSense/Gemini)
- README Tech-Stack-Angaben (Next.js/MongoDB) stimmen nicht mit tatsächlicher Vite/Firebase-Stack überein
- Backup-Zip ~100 MB im Repo-Root

## Nächste Schritte
1. Tests einführen (Vitest + React Testing Library)
2. README auf tatsächlichen Stack aktualisieren
3. Working-Tree aufräumen / Commits strukturieren
4. CI (lint + build) einrichten
5. Secrets-Rotation prüfen (env-values.txt vorhanden)
