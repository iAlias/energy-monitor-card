# Energy Monitor Card - HACS Plugin

Plugin per Home Assistant che monitora i consumi energetici dei dispositivi con confronto temporale e calcolo costi.

## 🚀 Installazione

### Via HACS
1. Apri HACS in Home Assistant
2. Clicca su "Frontend"
3. Cerca "Energy Monitor Card"
4. Installa e riavvia

### Manuale
1. Clona il repository
2. Copia la cartella in `www/community/energy-monitor-card`
3. Aggiungi il resource nel dashboard
4. Riavvia Home Assistant

## 📋 Configurazione

### Nel YAML
```yaml
type: custom:energy-monitor-card
price_per_kwh: 0.25
default_period: 'day'
comparison_enabled: true
title: 'Energy Monitor'
```

### Tramite UI
1. Aggiungi card
2. Seleziona "Energy Monitor Card"
3. Configura i dispositivi tramite l'editor visuale
4. Imposta il prezzo al kWh
5. Scegli il periodo di confronto

## 📊 Funzionalità

- ✅ Monitoraggio tempo reale
- ✅ Selettore periodo (giorno, settimana, mese, anno, custom)
- ✅ Confronto con periodi precedenti
- ✅ Calcolo automatico costi
- ✅ Grafico consumi per dispositivo
- ✅ Esportazione dati
- ✅ Tema chiaro/scuro

## 🔧 Dispositivi Supportati

- Sensori energia (kWh)
- Sensori potenza (W)
- Smart plug
- Inverter
- Contatori

Tutti i sensori con entità `sensor.*_energy` o `sensor.*_power`
