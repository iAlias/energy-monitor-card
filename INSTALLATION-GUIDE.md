# Energy Monitor Card - Installation Guide

Complete installation guide for the Energy Monitor Card with Backend Integration.

## Overview

The Energy Monitor Card consists of two components:

1. **Frontend Card** - The visual card that displays energy data in your dashboard
2. **Backend Integration** (Optional but Recommended) - A custom integration that provides a safe REST API for better reliability and data validation

## Why Use the Backend Integration?

The backend integration solves common issues:
- ✅ **Fixes 404 errors** when calling `/api/history` directly
- ✅ **Validates sensor data** to filter out invalid states (unavailable, unknown)
- ✅ **Better sensor detection** with multiple validation criteria
- ✅ **Provides statistics** (min, max, average, total consumption)
- ✅ **Safer API** with proper error handling

**Note:** The frontend card works without the backend but will fall back to direct API calls which may be less reliable.

---

## Installation Options

### Option 1: Complete Installation (Frontend + Backend) - Recommended

#### Step 1: Install the Backend Integration

1. **Copy the backend integration to your Home Assistant:**
   ```bash
   # From the repository root
   cp -r custom_components/energy_monitor_backend /config/custom_components/
   ```

   Your directory structure should be:
   ```
   /config/
   └── custom_components/
       └── energy_monitor_backend/
           ├── __init__.py
           ├── manifest.json
           ├── views.py
           ├── validation.py
           └── README.md
   ```

2. **Add to configuration.yaml:**
   ```yaml
   energy_monitor_backend:
   ```

3. **Restart Home Assistant**

4. **Verify installation:**
   - Check logs for: `Energy Monitor Backend HTTP views registered`
   - Test the API: Navigate to `/api/energy_monitor/entities` (should return JSON)

#### Step 2: Install the Frontend Card

##### Via HACS (Recommended):

1. Open **Home Assistant** → **HACS** → **Frontend**
2. Click **⋮** (three dots) → **Custom repositories**
3. Add repository:
   - **URL**: `https://github.com/iAlias/energy-monitor-card`
   - **Category**: `Lovelace`
4. Click **Energy Monitor Card** → **Download**
5. Restart Home Assistant

##### Manual Installation:

1. **Copy the frontend files:**
   ```bash
   # Create directory
   mkdir -p /config/www/community/energy-monitor-card/dist

   # Copy files
   cp dist/energy-monitor-card.js /config/www/community/energy-monitor-card/dist/
   cp dist/energy-monitor-editor.js /config/www/community/energy-monitor-card/dist/
   ```

2. **Add resource in Lovelace:**
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **+ Add Resource**
   - **URL**: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`
   - **Type**: JavaScript Module
   - Click **Create**

3. **Restart Home Assistant**

#### Step 3: Configure the Card

1. **Add card to dashboard:**
   - Edit dashboard
   - Click **+ Add Card**
   - Search for **Energy Monitor Card**
   - Click to add

2. **Configure via UI or YAML:**

   **YAML Configuration:**
   ```yaml
   type: custom:energy-monitor-card
   title: "Energy Monitor"
   price_per_kwh: 0.25
   show_comparison: true
   show_costs: true
   auto_detect: true
   entities:
     - entity_id: sensor.scaldabagno_energy
       name: "Water Heater"
       icon: "mdi:water-heater"
     - entity_id: sensor.climate_energy
       name: "Air Conditioner"
       icon: "mdi:air-conditioner"
   ```

---

### Option 2: Frontend Only (Without Backend)

If you prefer not to install the backend integration, the frontend will work but will use direct API calls.

Follow **Step 2** from Option 1 above to install only the frontend card.

**Note:** You may experience:
- Occasional 404 errors
- Unreliable zero values
- Less robust sensor validation

---

## Verification

### Backend Integration

1. **Check logs:**
   ```
   Settings → System → Logs
   ```
   Look for: `Energy Monitor Backend HTTP views registered`

2. **Test API endpoints:**
   - Open browser developer tools (F12)
   - Navigate to: `http://your-ha-ip:8123/api/energy_monitor/entities`
   - Should return JSON with your energy sensors

3. **Check card behavior:**
   - Open browser console (F12)
   - Look for: `✓ Backend API found X energy sensors`
   - Should see: `🔌 Backend API Request: ...`

### Frontend Card

1. **Verify card appears** in available cards when adding
2. **Check console** for errors (F12)
3. **Verify data loads** in the card

---

## Configuration

### Backend Integration Configuration

The backend requires minimal configuration:

```yaml
# configuration.yaml
energy_monitor_backend:
```

No additional options needed. The backend will:
- Automatically register HTTP endpoints
- Validate sensors using multiple criteria
- Provide statistics for historical data

### Frontend Card Configuration

#### Basic Configuration:
```yaml
type: custom:energy-monitor-card
title: "Energy Monitor"
price_per_kwh: 0.25
```

#### Full Configuration:
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
```

#### Configuration Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Energy Monitor" | Card title |
| `price_per_kwh` | number | 0.25 | Price per kWh in your currency |
| `show_comparison` | boolean | true | Show temporal comparisons |
| `show_costs` | boolean | true | Calculate and show costs |
| `auto_detect` | boolean | true | Auto-detect energy sensors |
| `entities` | array | [] | Manual entity list |

---

## Troubleshooting

### Backend Issues

**Problem: Backend not loading**
- Check `custom_components/energy_monitor_backend/` exists
- Verify `configuration.yaml` has `energy_monitor_backend:`
- Restart Home Assistant
- Check logs for errors

**Problem: 404 on API endpoints**
- Ensure backend integration is loaded
- Check `Settings` → `Integrations` for any errors
- Verify Home Assistant version ≥ 2023.12.0

**Problem: No entities returned**
- Verify you have energy/power sensors
- Check sensor `device_class` or `unit_of_measurement`
- Test with a manual entity configuration

### Frontend Issues

**Problem: Card not found**
- Clear browser cache (Ctrl+Shift+Delete)
- Verify resource URL is correct
- Check browser console for errors

**Problem: Data not loading**
- Check if backend is installed and working
- Look for fallback messages in console
- Verify entities exist in Home Assistant

**Problem: Fallback to direct API**
```
🔄 Falling back to direct history API
```
- This means backend is not available
- Frontend will work but may be less reliable
- Install backend integration to resolve

### Common Solutions

1. **Clear cache and restart:**
   ```bash
   # Clear browser cache (Ctrl+Shift+Delete)
   # Restart Home Assistant
   ```

2. **Enable debug logging:**
   ```yaml
   # configuration.yaml
   logger:
     default: info
     logs:
       custom_components.energy_monitor_backend: debug
   ```

3. **Check recorder:**
   ```yaml
   # Ensure recorder is enabled for historical data
   recorder:
     purge_keep_days: 30
     include:
       domains:
         - sensor
   ```

---

## Upgrading

### Backend Integration

1. Copy new files to `custom_components/energy_monitor_backend/`
2. Restart Home Assistant
3. Check logs for successful loading

### Frontend Card

#### Via HACS:
1. Go to **HACS** → **Frontend**
2. Find **Energy Monitor Card**
3. Click **Update**
4. Clear browser cache
5. Refresh dashboard

#### Manual:
1. Copy new files to `/config/www/community/energy-monitor-card/dist/`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Refresh dashboard

---

## Requirements

- Home Assistant 2023.12.0 or later
- Recorder integration enabled (for historical data)
- Energy/power sensors configured

---

## Support

- **Issues**: https://github.com/iAlias/energy-monitor-card/issues
- **Discussions**: https://github.com/iAlias/energy-monitor-card/discussions
- **Documentation**: See README files in repository

---

## Next Steps

After installation:
1. Configure your sensors
2. Test the card with different periods
3. Customize the appearance
4. Set up automations based on energy data

Enjoy monitoring your energy consumption! 🚀
