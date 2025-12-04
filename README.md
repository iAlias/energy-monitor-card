# Energy Monitor Card - Fast Installation

A complete Home Assistant solution for monitoring energy consumption with **zero manual configuration**. Install via HACS, restart, and you're done!

## ✨ Features

- 🚀 **Super-Fast Installation** - Install via HACS, restart, add card (3 steps!)
- 🔌 **Auto-Detection** - Automatically discovers your energy sensors
- 📊 **Real-time Monitoring** - Display current energy consumption
- 🔄 **Time Comparisons** - Compare with previous periods
- 💰 **Cost Calculation** - Automatic cost calculation based on kWh rate
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Theme Support** - Automatic light/dark theme adaptation
- 🔒 **Secure Backend** - Python integration with validated REST API

## 📦 Quick Start (3 Steps!)

### Step 1: Install via HACS

1. Open **HACS** in Home Assistant
2. Click **+ Explore & Download Repositories**
3. Search for **"Energy Monitor Card"**
4. Click **Download**

### Step 2: Enable the Backend Integration

**Option A: Via UI (Recommended - Zero YAML!)**

1. Go to **Settings** → **Devices & Services** → **Integrations**
2. Click **+ Add Integration**
3. Search for **"Energy Monitor Backend"**
4. Click to add it (no configuration needed!)

**Option B: Via configuration.yaml**

Add this single line to your `configuration.yaml`:
```yaml
energy_monitor_backend:
```

Then restart Home Assistant.

### Step 3: Add the Card

1. Edit your dashboard
2. Click **+ Add Card**
3. Search for **"Energy Monitor Card"** and add it

**That's it!** The card will automatically:
- ✅ Detect all your energy sensors
- ✅ Load historical data
- ✅ Calculate costs and comparisons

## ⚙️ Configuration (Optional)

The card works with **zero configuration**, but you can customize it:

### Basic Configuration

```yaml
type: custom:energy-monitor-card
title: "Energy Monitor"
price_per_kwh: 0.25
show_comparison: true
show_costs: true
auto_detect: true
```

### Manual Sensor Selection

If you want to select specific sensors instead of auto-detection:

```yaml
type: custom:energy-monitor-card
title: "Home Energy Monitor"
price_per_kwh: 0.30
show_comparison: true
show_costs: true
auto_detect: false
entities:
  - entity_id: sensor.water_heater_energy
    name: "Water Heater"
    icon: "mdi:water-heater"
  - entity_id: sensor.hvac_energy
    name: "HVAC"
    icon: "mdi:air-conditioner"
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Energy Monitor" | Card title |
| `price_per_kwh` | number | 0.25 | Price per kWh in your currency |
| `show_comparison` | boolean | true | Show period comparisons |
| `show_costs` | boolean | true | Calculate and show costs |
| `auto_detect` | boolean | true | Auto-detect energy sensors |
| `entities` | array | [] | List of entities (when auto_detect is false) |

## 🏗️ How It Works

### Automatic Integration

When you install this via HACS, two components are automatically set up:

1. **Backend Integration** (`custom_components/energy_monitor_backend`)
   - Auto-loads on startup (no config.yaml needed!)
   - Provides secure REST API endpoints
   - Validates all sensor data
   - Filters invalid states (unavailable, unknown, none)

2. **Frontend Card** (`www/community/energy-monitor-card`)
   - Auto-registered as a resource (no manual setup!)
   - Automatically detects energy sensors
   - Consumes backend API for validated data
   - Displays real-time energy monitoring

### Architecture

```
┌─────────────────┐
│  Frontend Card  │ ← Auto-detects sensors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │ ← Validates & filters data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HA Recorder    │ ← Historical data
└─────────────────┘
```

## ❓ FAQ

### Do I need to add anything to configuration.yaml?

**No!** You can set up the backend integration via the UI (Settings → Integrations). 

Alternatively, you can add a single line to configuration.yaml if you prefer YAML:
```yaml
energy_monitor_backend:
```

### Do I need to manually register resources?

**No!** HACS automatically registers the frontend resources.

### How does auto-detection work?

The card automatically finds sensors with:
- `device_class: energy`
- `unit_of_measurement: kWh`
- Entity ID containing "energy" (excluding "power", "cost", "price")

### Can I disable auto-detection?

Yes! Set `auto_detect: false` and specify `entities:` manually.

### Does it work without the backend integration?

No, the backend integration is required. It's automatically installed with HACS.

### Where is the historical data stored?

In your Home Assistant Recorder database (same as all other sensors).

## 🐛 Troubleshooting

### Card not appearing after install

1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh the page (Ctrl+F5)
3. Restart Home Assistant

### No data showing

1. Verify you have energy sensors in Developer Tools → States
2. Ensure Recorder integration is enabled
3. Check sensors have the `kWh` unit or `energy` device class

### Backend integration not loading

Check Home Assistant logs:
```bash
tail -f /config/home-assistant.log | grep energy_monitor
```

Should see:
```
Setting up Energy Monitor Backend integration
Energy Monitor Backend integration setup complete
```

## 📋 Requirements

- Home Assistant 2023.12.0 or later
- HACS installed
- Recorder integration enabled (default in HA)
- Energy sensors with `kWh` unit or `energy` device class

## 🔒 Security

The backend integration provides:
- ✅ Entity type validation (sensors only)
- ✅ State validation (filters invalid states)
- ✅ Numeric validation (ensures data integrity)
- ✅ Error handling (no sensitive data in errors)
- ✅ Parameter validation (validates all API params)

## 📁 What Gets Installed

```
config/
├── custom_components/
│   └── energy_monitor_backend/    # Backend integration (auto-loads)
│       ├── __init__.py
│       ├── const.py
│       ├── manifest.json
│       └── hacs.json
└── www/
    └── community/
        └── energy-monitor-card/   # Frontend card (auto-registered)
            └── energy-monitor-card.js
```

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 💬 Support

- **Issues**: https://github.com/iAlias/energy-monitor-card/issues
- **Discussions**: https://github.com/iAlias/energy-monitor-card/discussions
- **Community**: https://community.home-assistant.io/

---

**Enjoy effortless energy monitoring! 🚀**

