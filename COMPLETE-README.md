# Energy Monitor Card - Home Assistant Custom Card

Una custom card per Home Assistant che monitora i consumi energetici dei tuoi dispositivi con confronti temporali e calcolo automatico dei costi.

## 🎯 Funzionalità Principali

✅ **Monitoraggio in Tempo Reale** - Visualizza i consumi energetici attuali di tutti i dispositivi  
✅ **Confronti Temporali** - Confronta il consumo con periodi precedenti (ieri, settimana scorsa, mese scorso)  
✅ **Calcolo Automatico Costi** - Converte i kWh in euro secondo il prezzo configurato  
✅ **Rilevamento Automatico** - Scopre automaticamente tutti i sensori di energia presenti  
✅ **Editor Configurazione** - Interfaccia visuale drag-and-drop per configurare i dispositivi  
✅ **Grafico Comparativo** - Visualizza i dati in grafici a barre intuitivi  
✅ **Riepilogo Totale** - Mostra il consumo e il costo totali di tutti i dispositivi  
✅ **Tema Chiaro/Scuro** - Supporto automatico per le preferenze di sistema  
✅ **Responsive Design** - Funziona perfettamente su desktop, tablet e mobile  

## 📦 Installazione

### Opzione 1: Via HACS (Consigliato)

1. Apri **Home Assistant** → **HACS** → **Frontend**
2. Clicca su **Esplora e scarica repository**
3. Cerca **"Energy Monitor Card"**
4. Clicca **Installa**
5. Riavvia Home Assistant

### Opzione 2: Manuale

1. Clona il repository:
   ```bash
   git clone https://github.com/yourusername/energy-monitor-card.git
   ```

2. Copia i file in Home Assistant:
   ```bash
   cp -r energy-monitor-card/ /path/to/homeassistant/www/community/
   ```

3. Aggiungi il resource nel dashboard:
   - Vai a **Impostazioni** → **Dashboard** → **Risorse**
   - Clicca su **Crea risorsa**
   - Seleziona **Risorsa JavaScript**
   - URL: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`
   - Clicca **Crea**

4. Riavvia Home Assistant

## ⚙️ Configurazione

### Via YAML (Configuration.yaml)

```yaml
type: custom:energy-monitor-card
title: "Monitoraggio Energetico"
price_per_kwh: 0.25
show_comparison: true
show_costs: true
auto_detect: true
entities:
  - entity_id: sensor.scaldabagno_energy
    name: "Scaldabagno"
    icon: "mdi:water-heater"
  - entity_id: sensor.clima_energy
    name: "Climatizzatore"
    icon: "mdi:air-conditioner"
  - entity_id: sensor.lavastoviglie_energy
    name: "Lavastoviglie"
    icon: "mdi:dishwasher"
```

### Via Editor Grafico (Consigliato per Principianti)

1. Aggiungi una **Custom Card** nel tuo dashboard
2. Seleziona **Energy Monitor Card**
3. Usa l'editor grafico per:
   - Impostare il titolo
   - Configurare il prezzo al kWh
   - Aggiungere/rimuovere dispositivi
   - Attivare/disattivare confronti e costi

## 📋 Opzioni di Configurazione

| Opzione | Tipo | Default | Descrizione |
|---------|------|---------|-------------|
| `title` | string | "Energy Monitor" | Titolo della card |
| `price_per_kwh` | number | 0.25 | Prezzo al kWh in euro |
| `show_comparison` | boolean | true | Mostra confronti temporali |
| `show_costs` | boolean | true | Calcola e mostra i costi |
| `auto_detect` | boolean | true | Rileva automaticamente i sensori |
| `entities` | array | [] | Lista di entità da monitorare |

### Configurazione Dispositivi (entities)

Ogni dispositivo può avere le seguenti opzioni:

```yaml
- entity_id: sensor.device_energy      # ID dell'entità (obbligatorio)
  name: "Nome Dispositivo"             # Nome personalizzato (opzionale)
  icon: "mdi:lightning-bolt"           # Icona Material Design (opzionale)
```

## 🔍 Dispositivi Supportati

La card funziona con qualsiasi sensore di energia presente in Home Assistant:

- **Smart Plug** (TP-Link, Shelly, Tasmota, ecc.)
- **Sensori di Energia** (sensor.xxx_energy con unit_of_measurement: "kWh")
- **Sensori di Potenza** (sensor.xxx_power con unit_of_measurement: "W")
- **Inverter** (Fronius, SMA, ecc.)
- **Contatori Digitali** (via MQTT, REST, ecc.)

### Ricerca Automatica

Se `auto_detect` è abilitato, la card cerca automaticamente le entità con:
- `device_class: "energy"` o `"power"`
- `unit_of_measurement: "kWh"` o `"W"`
- Nome dell'entità contiene: "energy", "power", "consumption"

## 📊 Periodi di Confronto

La card supporta i seguenti periodi:

- **Oggi** vs Ieri
- **Questa Settimana** vs Settimana Precedente
- **Questo Mese** vs Mese Precedente
- **Questo Anno** vs Anno Precedente
- **Custom** - Seleziona date specifiche

## 💰 Calcolo Costi

I costi vengono calcolati automaticamente moltiplicando:
- **Consumo (kWh)** × **Prezzo al kWh (€)**

Esempio:
- Consumo: 15 kWh
- Prezzo: 0,25 €/kWh
- Costo: 15 × 0,25 = **3,75 €**

## 🎨 Temi Supportati

- ✅ Tema Chiaro (Light)
- ✅ Tema Scuro (Dark)
- ✅ Adattamento Automatico alle Preferenze di Sistema

## 📱 Responsive Design

La card si adatta automaticamente a:
- Desktop (1920x1080 e superiori)
- Tablet (768-1024px)
- Mobile (fino a 768px)

## 🐛 Risoluzione Problemi

### La card non appare nel dashboard

1. Verifica che il path del resource sia corretto
2. Apri la console del browser (F12) e cerca errori
3. Svuota la cache del browser (Ctrl+Shift+Canc)
4. Riavvia Home Assistant

### I dati non si aggiornano

1. Verifica che i sensori di energia siano correttamente configurati
2. Controlla il recorder per i dati storici:
   - Impostazioni → Dispositivi e servizi → Sistema → Registro

### I costi non vengono calcolati

1. Verifica che `show_costs: true` sia impostato
2. Controlla il prezzo al kWh: `price_per_kwh: 0.25`
3. Verifica che i sensori abbiano `unit_of_measurement: "kWh"`

## 🔧 Sviluppo

### Clona il Repository

```bash
git clone https://github.com/yourusername/energy-monitor-card.git
cd energy-monitor-card
```

### Struttura del Progetto

```
energy-monitor-card/
├── energy-monitor-card.js       # Componente principale della card
├── energy-monitor-editor.js     # Editor di configurazione
├── manifest.json                # Metadata del plugin
├── package.json                 # Configurazione npm
├── README.md                    # Questo file
├── LICENSE                      # Licenza MIT
└── dist/                        # File compilati (generati)
    ├── energy-monitor-card.js
    └── energy-monitor-editor.js
```

### Build Locale

```bash
# Il build è automatico, i file sono già pronti
# Per verificare:
bash build.sh
```

### Test Locale

1. Copia la cartella in `/config/www/community/energy-monitor-card`
2. Aggiungi il resource nel dashboard
3. Crea una card di test

## 📝 Configurazione Home Assistant

Per un funzionamento ottimale, assicurati che il `recorder` sia configurato:

```yaml
recorder:
  purge_keep_days: 30
  include:
    domains:
      - sensor
    entity_globs:
      - sensor.*_energy
      - sensor.*_power
      - sensor.*_consumption
```

## 📖 Esempi di Utilizzo

### Esempio 1: Monitoraggio Semplice

```yaml
type: custom:energy-monitor-card
price_per_kwh: 0.25
```

### Esempio 2: Con Dispositivi Specifici

```yaml
type: custom:energy-monitor-card
title: "Consumo Domestico"
price_per_kwh: 0.30
entities:
  - entity_id: sensor.boiler_energy
    name: "Boiler"
    icon: "mdi:water-heater"
  - entity_id: sensor.fridge_energy
    name: "Frigo"
    icon: "mdi:refrigerator"
```

### Esempio 3: Completo

```yaml
type: custom:energy-monitor-card
title: "Monitoraggio Energetico Completo"
price_per_kwh: 0.27
show_comparison: true
show_costs: true
auto_detect: true
entities:
  - entity_id: sensor.scaldabagno_energy
    name: "Scaldabagno"
    icon: "mdi:water-heater"
  - entity_id: sensor.condizionatore_energy
    name: "Aria Condizionata"
    icon: "mdi:air-conditioner"
  - entity_id: sensor.lavastoviglie_energy
    name: "Lavastoviglie"
    icon: "mdi:dishwasher"
  - entity_id: sensor.lavatrice_energy
    name: "Lavatrice"
    icon: "mdi:washing-machine"
```

## 🎓 Tutorial Video

[Link ai tutorial video disponibili su YouTube]

## 🤝 Contribuire

Le contribuzioni sono benvenute! Per miglioramenti:

1. Fork del repository
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto la licenza MIT. Vedi il file `LICENSE` per dettagli.

## 💬 Support

- **Issue**: https://github.com/yourusername/energy-monitor-card/issues
- **Discussioni**: https://github.com/yourusername/energy-monitor-card/discussions
- **Community HA**: https://community.home-assistant.io/

## ✨ Changelog

### v1.0.0 (2025-01-XX)

- ✅ Rilascio iniziale
- ✅ Monitoraggio energy consumption
- ✅ Confronti temporali
- ✅ Calcolo costi
- ✅ Rilevamento automatico dispositivi
- ✅ Editor di configurazione
- ✅ Supporto tema chiaro/scuro
- ✅ Design responsive

## 📞 Contatti

**Autore**: Your Name  
**GitHub**: @yourusername  
**Email**: your.email@example.com

---

**Goditi il monitoraggio energetico con Energy Monitor Card! 🚀**
