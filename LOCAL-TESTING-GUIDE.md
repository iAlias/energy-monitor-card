# 🧪 GUIDA TEST LOCALE - Testare la Card Prima di Pubblicare

Segui questa guida per testare la Energy Monitor Card localmente su Home Assistant prima di pubblicarla su GitHub.

## ⚙️ PREREQUISITI

- ✅ Home Assistant installato e funzionante
- ✅ Accesso ai file di configurazione (`/config`)
- ✅ Almeno un sensore di energia configurato
- ✅ Editor di testo (VS Code, Sublime, ecc.)

## 📁 STEP 1: Preparare i File

### 1.1 Creare la Struttura

Nel tuo Home Assistant, crea questa cartella:

```
/config/www/community/energy-monitor-card/
├── dist/
│   ├── energy-monitor-card.js
│   └── energy-monitor-editor.js
└── manifest.json
```

### 1.2 Copiare i File

1. Copia `energy-monitor-card.js` in `dist/energy-monitor-card.js`
2. Copia `energy-monitor-editor.js` in `dist/energy-monitor-editor.js`
3. Copia `manifest.json` nella root (`energy-monitor-card/manifest.json`)

### 1.3 Verificare la Struttura

```bash
# Da SSH in Home Assistant
ls -R /config/www/community/energy-monitor-card/

# Dovresti vedere:
# dist/
#   energy-monitor-card.js
#   energy-monitor-editor.js
# manifest.json
```

## 🔌 STEP 2: Configurare Home Assistant

### 2.1 Aggiungere il Resource

1. Home Assistant → **Impostazioni** → **Dashboard** → **Risorse**
2. Clicca **Crea risorsa**
3. **URL**: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`
4. **Tipo**: Risorsa JavaScript
5. Clicca **Crea**

### 2.2 Riavviare Home Assistant

```bash
# Riavvia da SSH o da UI:
# Impostazioni → Sistema → Riavvia
```

Oppure dal terminale:
```bash
ha core restart
```

## 📊 STEP 3: Creare Sensori di Test (Opzionale)

Se non hai sensori di energia, crea dei sensori template:

### 3.1 Aggiungere Template Sensors

In `configuration.yaml`:

```yaml
template:
  - sensor:
      - name: "Scaldabagno Consumo"
        unit_of_measurement: "kWh"
        device_class: energy
        state_class: total_increasing
        state: >
          {% set hours = now().hour + (now().minute / 60) %}
          {{ (hours * 0.5) | round(2) }}

      - name: "Climatizzatore Consumo"
        unit_of_measurement: "kWh"
        device_class: energy
        state_class: total_increasing
        state: >
          {{ range(0, 24) | random | float | round(2) }}

      - name: "Lavastoviglie Consumo"
        unit_of_measurement: "kWh"
        device_class: energy
        state_class: total_increasing
        state: >
          {{ [0, 2.5, 5.0, 7.5] | random | round(2) }}
```

### 3.2 Riavviare Home Assistant

Applica i template aggiungendo i sensori.

## 🎨 STEP 4: Testare la Card

### 4.1 Creare una Nuova Dashboard

1. Home Assistant → **Dashboard**
2. Clicca **Crea nuovo tab**
3. Nome: "Test Energy Monitor"
4. Clicca **Crea**

### 4.2 Aggiungere la Custom Card

1. Clicca **Aggiungi card**
2. Scorri fino a trovare **Custom Card**
3. Digitare: `energy-monitor-card`
4. Clicca su **Energy Monitor Card** dai risultati

### 4.3 Configurazione di Base

Nel YAML editor:

```yaml
type: custom:energy-monitor-card
title: "Energy Monitor Test"
price_per_kwh: 0.25
show_comparison: true
show_costs: true
auto_detect: true
```

Clicca **Salva**

### 4.4 Verificare il Rendering

Dovresti vedere:
- ✅ Titolo "Energy Monitor Test"
- ✅ Selettori periodo (Oggi, Settimana, Mese, Anno)
- ✅ Schede dispositivi con consumi
- ✅ Grafici a barre
- ✅ Riepilogo totale in blu

## 🧪 STEP 5: Test Funzionalità

### 5.1 Test Periodi

1. Seleziona **Oggi** - Mostra dati di oggi
2. Seleziona **Settimana** - Mostra data inizio/fine
3. Seleziona **Mese** - Mostra data inizio/fine
4. Seleziona **Anno** - Mostra data inizio/fine
5. Seleziona **Custom** - Mostra date picker

### 5.2 Test Confronti

1. Seleziona **Giorno Precedente** - Compara con ieri
2. Seleziona **Settimana Precedente** - Compara con scorsa settimana
3. Cambia le date - I dati si aggiornano? ✅

### 5.3 Test Calcolo Costi

1. Modifica `price_per_kwh` in YAML
   ```yaml
   price_per_kwh: 0.30
   ```
2. I costi si aggiornano? ✅
3. Formula corretta: kWh × Prezzo = Euro ✅

### 5.4 Test Dispositivi

1. Nella card, dovresti vedere automaticamente i tuoi sensori
2. Se vuoi specificarli:
   ```yaml
   entities:
     - entity_id: sensor.scaldabagno_energy
       name: "Scaldabagno"
       icon: "mdi:water-heater"
     - entity_id: sensor.clima_energy
       name: "Clima"
       icon: "mdi:air-conditioner"
   ```
3. Salva e verifica che appaiano ✅

## 🔍 STEP 6: Debugging

### 6.1 Aprire la Console del Browser

1. Premi **F12** o **Ctrl+Shift+I**
2. Vai al tab **Console**
3. Cerca errori in rosso

### 6.2 Errori Comuni

**"Errore: custom-cards non definito"**
- Soluzione: Ricarica la pagina (Ctrl+Shift+R)

**"Energy Monitor Card non trovato"**
- Soluzione: Verifica il path del resource
- Verifica che manifest.json sia valido

**"Nessun dispositivo trovato"**
- Soluzione: Crea i sensori di test (vedi STEP 3)
- Oppure verifica i tuoi sensori siano `sensor.xxx_energy`

**"Errore nel caricamento dati"**
- Soluzione: Apri Console (F12)
- Cerca l'errore specifico
- Verifica l'API di Home Assistant

### 6.3 Monitorare i Log

Da SSH:

```bash
# Guarda i log in tempo reale
tail -f /config/home-assistant.log | grep -i "energy"
```

## ✅ STEP 7: Checklist Test

Prima di pubblicare, verifica:

- [ ] La card appare nel dashboard
- [ ] I dispositivi vengono rilevati automaticamente
- [ ] I consumi mostrano valori corretti
- [ ] I periodi cambiano correttamente
- [ ] I confronti si aggiornano quando cambiano le date
- [ ] I costi vengono calcolati (kWh × prezzo/kWh)
- [ ] Il design è responsive (prova da mobile)
- [ ] Nessun errore in console (F12)
- [ ] Le icone vengono visualizzate
- [ ] I colori sono corretti (tema chiaro/scuro)
- [ ] Il riepilogo totale è accurato
- [ ] La configurazione può essere modificata
- [ ] Funziona sia in YAML che nell'editor UI

## 🔧 STEP 8: Miglioramenti Locali

Se noti problemi, puoi correggerli direttamente:

### 8.1 Editare il File JS

1. Apri `/config/www/community/energy-monitor-card/dist/energy-monitor-card.js`
2. Modifica il codice (vedi le sezioni con // MODIFICA)
3. Salva il file
4. Ricarica Home Assistant (Impostazioni → Sistema → Riavvia)

### 8.2 Testare di Nuovo

Dopo ogni modifica:
1. Salva il file
2. Riavvia Home Assistant (o ricarica la pagina con Ctrl+Shift+R)
3. Verifica il cambio

### 8.3 Aggiornare Costi di Calcolo

Per cambiar il calcolo dei costi, modifica nel file JS:

```javascript
// Cerca questa riga:
this._costData[device.id] = {
  current: kwh * this.config.price_per_kwh,
  // Qui avviene il calcolo
};
```

## 📱 STEP 9: Test Responsive

### 9.1 Desktop (1920x1080)

- Verifica che i dispositivi siano in griglia
- Controlla che i grafici siano visibili

### 9.2 Tablet (768-1024px)

Premi **F12** → **Riga dispositivo** → Seleziona "iPad"

- Verifica che i dispositivi siano organizzati
- Prova lo scroll

### 9.3 Mobile (320-480px)

Premi **F12** → **Riga dispositivo** → Seleziona "iPhone"

- Verifica che non ci sia scroll orizzontale
- Prova i selettori periodo

## 🎬 STEP 10: Registrare un Video Test

Facoltativo ma utile per GitHub/HACS:

1. Apri una sessione OBS o Schermate
2. Registra:
   - Vista generale della card
   - Cambio periodi
   - Cambio date
   - Calcolo costi
3. Salva il video come `demo.mp4`
4. Caricalo nel repository GitHub

## 📝 STEP 11: Documentare i Problemi

Se trovi bug:

1. **Traccia il problema**:
   - Device (Desktop/Mobile)
   - Browser (Chrome/Firefox)
   - Versione Home Assistant
   - Passaggi per riprodurlo

2. **Esempio**:
   ```
   BUG: I costi non si aggiornano quando cambio la data
   
   Device: Desktop (Chrome)
   HA version: 2024.1.0
   
   Steps to reproduce:
   1. Apri la card
   2. Cambia la data custom
   3. I consumi si aggiornano ma i costi no
   
   Expected: I costi dovrebbero aggiornarsi
   Actual: I costi rimangono uguali
   ```

3. **Correggi il bug** nel codice

## ✨ Sei Pronto!

Quando tutto funziona perfettamente:

1. ✅ Tutti i test passano
2. ✅ Nessun errore in console
3. ✅ Responsive design OK
4. ✅ Configurazione funziona
5. ✅ Documenti completi

**Procedi al caricamento su GitHub!**

---

## 🆘 Supporto

Se hai problemi:

1. Controlla i log (Impostazioni → Sistema → Registri)
2. Apri Console (F12) e cerca errori
3. Verifica che i tuoi sensori siano corretti
4. Riavvia Home Assistant completamente
5. Ricarica il browser (Ctrl+Shift+R)

**Enjoy testing! 🚀**
