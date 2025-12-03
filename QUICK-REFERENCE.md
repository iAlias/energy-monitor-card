# Energy Monitor Card - Quick Reference

## Installation (Complete Solution)

### 1. Install Backend Integration

```bash
# Copy backend to Home Assistant
cp -r custom_components/energy_monitor_backend /config/custom_components/
```

Add to `configuration.yaml`:
```yaml
energy_monitor_backend:
```

Restart Home Assistant.

### 2. Install Frontend Card

**Via HACS:**
1. HACS → Frontend → Custom repositories
2. Add: `https://github.com/iAlias/energy-monitor-card`
3. Download → Restart

**Manual:**
```bash
mkdir -p /config/www/community/energy-monitor-card/dist
cp dist/*.js /config/www/community/energy-monitor-card/dist/
```

Add resource: `/local/community/energy-monitor-card/dist/energy-monitor-card.js`

### 3. Add Card to Dashboard

```yaml
type: custom:energy-monitor-card
title: "Energy Monitor"
price_per_kwh: 0.25
show_comparison: true
show_costs: true
auto_detect: true
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/energy_monitor/entities` | List all energy sensors |
| `/api/energy_monitor/state?entity_id=X` | Get current state |
| `/api/energy_monitor/history?entity_id=X&start=Y&end=Z` | Get history + statistics |

## Verification

**Backend working:**
- Browser console shows: `✓ Backend API found X energy sensors`
- Navigate to: `/api/energy_monitor/entities` (returns JSON)

**Backend not working:**
- Console shows: `🔄 Falling back to direct history API`
- Card still works but uses direct API

## Troubleshooting

**No entities found:**
- Check sensors have `device_class: energy` or `unit_of_measurement: kWh`
- Look in logs for validation messages

**404 errors:**
- Verify backend integration loaded
- Check `configuration.yaml` has `energy_monitor_backend:`
- Restart Home Assistant

**No historical data:**
- Ensure recorder integration enabled
- Check sensors have data in History panel

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Energy Monitor" | Card title |
| `price_per_kwh` | number | 0.25 | Price per kWh |
| `show_comparison` | boolean | true | Show comparisons |
| `show_costs` | boolean | true | Show costs |
| `auto_detect` | boolean | true | Auto-detect sensors |
| `entities` | array | [] | Manual sensor list |

## Example Configuration

```yaml
type: custom:energy-monitor-card
title: "Home Energy"
price_per_kwh: 0.27
show_comparison: true
show_costs: true
auto_detect: true
entities:
  - entity_id: sensor.water_heater_energy
    name: "Water Heater"
    icon: "mdi:water-heater"
  - entity_id: sensor.ac_energy
    name: "Air Conditioner"
    icon: "mdi:air-conditioner"
```

## Debug Logging

```yaml
# configuration.yaml
logger:
  logs:
    custom_components.energy_monitor_backend: debug
```

## Documentation

- **Installation Guide**: See INSTALLATION-GUIDE.md
- **Architecture**: See ARCHITECTURE.md
- **Implementation**: See IMPLEMENTATION-SUMMARY.md
- **Backend Docs**: See custom_components/energy_monitor_backend/README.md

## Support

- Issues: https://github.com/iAlias/energy-monitor-card/issues
- Discussions: https://github.com/iAlias/energy-monitor-card/discussions

---

**Quick Start:** Copy backend → Add to config.yaml → Restart → Install frontend → Add card → Done! 🚀
