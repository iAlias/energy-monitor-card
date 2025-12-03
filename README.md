# Energy Monitor Card - Complete Solution

A complete Home Assistant solution for monitoring energy consumption, featuring a secure Python backend integration and a lightweight frontend card.

## 🎯 Key Features

### Backend Integration (NEW!)
✅ **Secure REST API** - Safe, validated sensor data access  
✅ **Entity Validation** - Filters invalid and unavailable states  
✅ **No More 404 Errors** - Proper error handling and validation  
✅ **No False Zeros** - Validates numeric data before returning  
✅ **Recorder Integration** - Seamless historical data access  

### Frontend Card
✅ **Real-time Monitoring** - Display current energy consumption  
✅ **Time Comparisons** - Compare with previous periods  
✅ **Cost Calculation** - Automatic cost calculation based on kWh rate  
✅ **Auto-detection** - Automatically discovers energy sensors  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  
✅ **Light/Dark Theme** - Automatic theme support  

## 📦 Installation

### Step 1: Install Backend Integration

The backend integration provides secure API endpoints for the frontend card.

#### Manual Installation

1. Copy the backend integration to your Home Assistant:
   ```bash
   cp -r custom_components/energy_monitor_backend /config/custom_components/
   ```

2. Add to your `configuration.yaml`:
   ```yaml
   energy_monitor_backend:
   ```

3. Restart Home Assistant

See [BACKEND-README.md](BACKEND-README.md) for detailed backend documentation.

### Step 2: Install Frontend Card

#### Via HACS (Recommended)

1. Open **Home Assistant** → **HACS** → **Frontend**
2. Click **Explore & Download Repositories**
3. Search for **"Energy Monitor Card"**
4. Click **Install**
5. Restart Home Assistant

#### Manual Installation

1. Copy the frontend files:
   ```bash
   mkdir -p /config/www/community/energy-monitor-card/dist/
   cp dist/*.js /config/www/community/energy-monitor-card/dist/
   ```

2. Add the resource in your dashboard:
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **Add Resource**
   - URL: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`
   - Resource type: **JavaScript Module**

3. Restart Home Assistant

## ⚙️ Configuration

### Basic Configuration

```yaml
type: custom:energy-monitor-card
title: "Energy Monitor"
price_per_kwh: 0.25
show_comparison: true
show_costs: true
auto_detect: true
```

### With Specific Devices

```yaml
type: custom:energy-monitor-card
title: "Home Energy Monitor"
price_per_kwh: 0.30
show_comparison: true
show_costs: true
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
| `entities` | array | [] | List of entities to monitor |

## 🏗️ Architecture

This solution consists of two components:

### 1. Backend Integration (`custom_components/energy_monitor_backend`)

A Python custom integration that:
- Validates sensor entities before returning data
- Exposes safe REST API endpoints
- Filters invalid states (unavailable, unknown, none)
- Validates numeric data
- Handles errors gracefully

**API Endpoints:**
- `GET /api/energy_monitor/entities` - List all sensors
- `GET /api/energy_monitor/state?entity_id=...` - Get entity state
- `GET /api/energy_monitor/history?entity_id=...&start_time=...&end_time=...` - Get history

### 2. Frontend Card (`dist/energy-monitor-card.js`)

A lightweight Lit-based custom card that:
- Consumes the backend API endpoints
- Displays energy consumption data
- Calculates costs and comparisons
- Provides a responsive user interface

## 🔍 How It Works

### Traditional Approach (Problems)
```
Frontend Card → /api/history/period → 404 errors, false zeros
```

### New Approach (Solution)
```
Frontend Card → Backend API → Validated Data → No errors, accurate data
```

The backend integration:
1. Validates entity exists and is a sensor
2. Checks state is not "unavailable", "unknown", or "none"
3. Validates numeric values for history data
4. Returns clean, validated data to the frontend

## 🐛 Troubleshooting

### Backend integration not loading

Check Home Assistant logs:
```bash
tail -f /config/home-assistant.log | grep energy_monitor
```

### Frontend card not appearing

1. Clear browser cache (Ctrl+Shift+Del)
2. Verify resource is added to dashboard
3. Check browser console for errors (F12)

### No historical data

1. Verify recorder is configured:
   ```yaml
   recorder:
     purge_keep_days: 30
     include:
       domains:
         - sensor
   ```

2. Check entity has historical data in **History** panel

### 404 Errors (Should not happen with new backend!)

If you still see 404 errors:
1. Verify backend integration is loaded
2. Check entity exists: Developer Tools → States
3. Ensure recorder includes the entity

## 📋 Requirements

- Home Assistant 2023.12.0 or later
- Recorder integration enabled
- Python 3.11 or later (included with Home Assistant)
- Modern browser with JavaScript enabled

## 🔒 Security

The backend integration provides several security features:

- **Entity Type Validation** - Only sensor entities allowed
- **State Validation** - Filters invalid states
- **Numeric Validation** - Ensures data integrity
- **Error Handling** - No sensitive data in error messages
- **Parameter Validation** - Validates all API parameters

## 📁 Repository Structure

```
energy-monitor-card/
├── custom_components/
│   └── energy_monitor_backend/     # Backend integration
│       ├── __init__.py
│       ├── const.py
│       └── manifest.json
├── dist/                           # Frontend compiled files
│   ├── energy-monitor-card.js
│   └── energy-monitor-editor.js
├── src/                            # Frontend source
│   └── EnergyMonitorCard.ts
├── BACKEND-README.md               # Backend documentation
├── README.md                       # This file
└── LICENSE
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 💬 Support

- **Issues**: https://github.com/iAlias/energy-monitor-card/issues
- **Discussions**: https://github.com/iAlias/energy-monitor-card/discussions
- **Backend Docs**: [BACKEND-README.md](BACKEND-README.md)
- **Community**: https://community.home-assistant.io/

## ✨ What's New

### Version 1.0.0 - Backend Integration Release

- ✅ **NEW: Backend Python Integration** - Secure REST API for validated sensor data
- ✅ **FIXED: 404 Errors** - Proper entity validation before data fetch
- ✅ **FIXED: False Zero Values** - Numeric validation ensures accurate data
- ✅ **NEW: Enhanced Error Handling** - Clear error messages and logging
- ✅ **NEW: State Validation** - Filters unavailable/unknown states
- ✅ Comprehensive API documentation
- ✅ Security improvements
- ✅ Better error messages

---

**Enjoy reliable energy monitoring with the complete backend + frontend solution! 🚀**
