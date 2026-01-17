# Stripe Setup Guide

## Überblick
Das Zahlungssystem ist mit Stripe integriert. Benutzer können auf ein Pro-Abo upgraden, um unbegrenzte Scans und Premium-Features zu erhalten.

## Konfiguration

### 1. Stripe Account erstellen
- Gehe zu https://stripe.com
- Erstelle ein neues Konto
- Wechsle zum Test-Modus
- Kopiere deinen Publishable Key

### 2. Umgebungsvariablen setzen
```bash
# In .env oder .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### 3. Payment Link erstellen
- Gehe zu https://dashboard.stripe.com/products
- Erstelle ein neues Produkt für "Pro Account"
- Preis: 4,99 EUR/Monat
- Erstelle einen Payment Link
- Aktualisiere `STRIPE_PAYMENT_LINK` in `stripe.ts`

## Features

### PaymentModal Component
- Zeigt Pro-Plan Features
- Öffnet Stripe Payment Link
- Aktualisiert User-Subscription Status nach erfolgreichem Payment

### GoogleAds Component
- Zeigt AdSense Anzeigen für Free-Plan Nutzer
- Blendet Anzeigen für Pro Nutzer aus
- Verschiedene Slots für unterschiedliche Positionen

## Test-Daten

Für Test-Zahlungen in Stripe Test-Modus:
- Kartennummer: 4242 4242 4242 4242
- Ablaufdatum: Beliebig (zukünftig)
- CVC: Beliebig

## Webhook Setup (für Produktion)

1. Erstelle einen Webhook in Stripe Dashboard
2. Wähle Events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Implementiere Webhook Handler in deinem Backend
4. Aktualisiere den Pro-Status des Benutzers basierend auf Webhook Events

## Getestete Verben

✅ Payment Modal anzeigen
✅ Stripe Payment Link öffnen
✅ Pro-Status in Firestore speichern
✅ Google Ads je nach Pro-Status anzeigen/verbergen
