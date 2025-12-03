# Installation Guide - Energy Monitor Backend

This guide walks you through installing both the backend integration and frontend card for a complete energy monitoring solution.

## Prerequisites

- Home Assistant 2023.12.0 or later
- Recorder integration enabled
- SSH access to Home Assistant (for manual installation)
- OR HACS installed (for easier installation)

## Installation Methods

### Method 1: Complete Manual Installation (Recommended for Testing)

This method installs both components manually and is best for testing or development.

#### Step 1: Install Backend Integration

1. **Access Home Assistant**
   
   Connect to your Home Assistant via SSH or File Editor add-on.

2. **Create the custom components directory** (if it doesn't exist)
   ```bash
   mkdir -p /config/custom_components
   ```

3. **Copy the backend integration**
   ```bash
   # From repository root
   cp -r custom_components/energy_monitor_backend /config/custom_components/
   ```

4. **Verify the files**
   ```bash
   ls -la /config/custom_components/energy_monitor_backend/
   # Should show: __init__.py, const.py, manifest.json
   ```

5. **Configure the integration**
   
   Add to `/config/configuration.yaml`:
   ```yaml
   # Enable Energy Monitor Backend
   energy_monitor_backend:
   ```

6. **Verify recorder is enabled**
   
   Ensure this is in your `configuration.yaml`:
   ```yaml
   recorder:
     purge_keep_days: 30
     include:
       domains:
         - sensor
   ```

7. **Restart Home Assistant**
   
   Configuration → Settings → Server Controls → Restart

8. **Verify installation**
   
   Check logs for successful startup:
   ```bash
   tail -f /config/home-assistant.log | grep energy_monitor
   ```
   
   You should see:
   ```
   Setting up Energy Monitor Backend integration
   Energy Monitor Backend integration setup complete
   ```

#### Step 2: Install Frontend Card

1. **Create the www directory structure**
   ```bash
   mkdir -p /config/www/community/energy-monitor-card/dist
   ```

2. **Copy the frontend files**
   ```bash
   # From repository root
   cp dist/*.js /config/www/community/energy-monitor-card/dist/
   ```

3. **Verify the files**
   ```bash
   ls -la /config/www/community/energy-monitor-card/dist/
   # Should show: energy-monitor-card.js, energy-monitor-editor.js
   ```

4. **Add the resource to Home Assistant**
   
   - Go to **Settings** → **Dashboards** → **Resources**
   - Click **+ Add Resource**
   - URL: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`
   - Resource type: **JavaScript Module**
   - Click **Create**

5. **Clear browser cache**
   
   Press `Ctrl+Shift+Delete` and clear cache, or do a hard refresh with `Ctrl+F5`

6. **Restart Home Assistant**
   
   Configuration → Settings → Server Controls → Restart

#### Step 3: Add the Card to Dashboard

1. **Edit your dashboard**
   
   - Go to any dashboard
   - Click **Edit Dashboard** (three dots menu)
   - Click **+ Add Card**

2. **Add the custom card**
   
   - Scroll down and click **Custom: Energy Monitor Card**
   - OR manually add YAML:
     ```yaml
     type: custom:energy-monitor-card
     title: "Energy Monitor"
     price_per_kwh: 0.25
     show_comparison: true
     show_costs: true
     auto_detect: true
     ```

3. **Save and test**

### Method 2: Via HACS (Future)

HACS installation will be available in a future release.

## Configuration

### Basic Configuration

Minimal configuration in your dashboard:

```yaml
type: custom:energy-monitor-card
title: "Energy Monitor"
price_per_kwh: 0.25
```

### Advanced Configuration

With specific devices and custom settings:

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
    name: "HVAC System"
    icon: "mdi:air-conditioner"
  - entity_id: sensor.dishwasher_energy
    name: "Dishwasher"
    icon: "mdi:dishwasher"
```

### Recommended Home Assistant Configuration

For optimal performance, add this to `/config/configuration.yaml`:

```yaml
# Energy Monitor Backend
energy_monitor_backend:

# Recorder with energy sensor history
recorder:
  purge_keep_days: 30
  include:
    domains:
      - sensor
    entity_globs:
      - sensor.*_energy
      - sensor.*_power
      - sensor.*_consumption

# Optional: Debug logging
logger:
  default: info
  logs:
    custom_components.energy_monitor_backend: debug
```

## Verification Steps

### 1. Verify Backend API is Working

Test the API endpoints:

```bash
# Get all sensor entities
curl http://homeassistant.local:8123/api/energy_monitor/entities \
  -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN"

# Get specific entity state
curl "http://homeassistant.local:8123/api/energy_monitor/state?entity_id=sensor.power_meter" \
  -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN"

# Get history
curl "http://homeassistant.local:8123/api/energy_monitor/history?entity_id=sensor.power_meter&days=1" \
  -H "Authorization: Bearer YOUR_LONG_LIVED_TOKEN"
```

**How to get a long-lived token:**
1. Profile (bottom left) → Long-Lived Access Tokens
2. Create Token
3. Copy and save it securely

### 2. Verify Frontend Card is Loaded

1. Open browser developer console (F12)
2. Look for console messages like:
   ```
   ✓ Dispositivi rilevati: [...]
   📊 Carico dati per X dispositivi
   🔌 Backend API Request: /api/energy_monitor/history?...
   ```

### 3. Check for Errors

If something isn't working:

1. **Check Home Assistant logs:**
   ```bash
   tail -f /config/home-assistant.log | grep -E "energy_monitor|error"
   ```

2. **Check browser console:**
   - Press F12
   - Go to Console tab
   - Look for red errors

3. **Verify recorder has data:**
   - Go to History panel
   - Search for your sensor
   - Verify data exists for the time period

## Troubleshooting

### Backend not loading

**Symptom:** API endpoints return 404

**Solutions:**
1. Check integration is in correct location:
   ```bash
   ls /config/custom_components/energy_monitor_backend/
   ```

2. Verify `configuration.yaml` includes:
   ```yaml
   energy_monitor_backend:
   ```

3. Check logs for errors:
   ```bash
   grep energy_monitor /config/home-assistant.log
   ```

### Frontend card not showing

**Symptom:** Card shows "Custom element doesn't exist: energy-monitor-card"

**Solutions:**
1. Verify resource is added in Settings → Dashboards → Resources

2. Clear browser cache completely

3. Check browser console (F12) for JavaScript errors

4. Verify files exist:
   ```bash
   ls /config/www/community/energy-monitor-card/dist/
   ```

### No data showing

**Symptom:** Card loads but shows "No data available"

**Solutions:**
1. Verify entities exist in Developer Tools → States

2. Check recorder is recording the entities:
   ```yaml
   recorder:
     include:
       domains:
         - sensor
   ```

3. Verify entities have historical data in History panel

4. Check entity IDs are correct (they are case-sensitive)

### API returns 503

**Symptom:** "Recorder integration is not available"

**Solutions:**
1. Enable recorder in `configuration.yaml`:
   ```yaml
   recorder:
   ```

2. Check recorder status in Configuration → Integrations

3. Verify database is not corrupted

## Updating

### Update Backend Integration

1. Copy new files:
   ```bash
   cp -r custom_components/energy_monitor_backend /config/custom_components/
   ```

2. Restart Home Assistant

### Update Frontend Card

1. Copy new files:
   ```bash
   cp dist/*.js /config/www/community/energy-monitor-card/dist/
   ```

2. Clear browser cache

3. Refresh the page (Ctrl+F5)

## Uninstallation

### Remove Backend Integration

1. Remove from `configuration.yaml`:
   ```yaml
   # energy_monitor_backend:  # Comment out or delete
   ```

2. Delete files:
   ```bash
   rm -rf /config/custom_components/energy_monitor_backend
   ```

3. Restart Home Assistant

### Remove Frontend Card

1. Remove resource from Settings → Dashboards → Resources

2. Delete files:
   ```bash
   rm -rf /config/www/community/energy-monitor-card
   ```

3. Remove cards from dashboards

## Support

- **Backend Documentation:** [BACKEND-README.md](BACKEND-README.md)
- **Issues:** https://github.com/iAlias/energy-monitor-card/issues
- **Discussions:** https://github.com/iAlias/energy-monitor-card/discussions

## Next Steps

After installation:

1. Add energy sensors to your Home Assistant
2. Configure the card with your entities
3. Set your electricity price per kWh
4. Enjoy monitoring your energy consumption!

See [README.md](README.md) for usage examples and configuration options.
