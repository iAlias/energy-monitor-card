# Energy Monitor Backend Integration

This custom Home Assistant integration provides a secure REST API backend for the Energy Monitor Card, replacing direct `/api/history` calls with validated sensor data access.

## Features

- ✅ **Entity Validation** - Validates all sensor entities before returning data
- ✅ **Safe REST API** - Exposes controlled endpoints instead of raw history access
- ✅ **Invalid State Filtering** - Automatically filters out "unavailable", "unknown", "none" states
- ✅ **Numeric Validation** - Ensures only valid numeric sensor data is returned
- ✅ **Error Handling** - Comprehensive error messages for debugging
- ✅ **Recorder Integration** - Works seamlessly with Home Assistant's recorder component

## Installation

### Via HACS (Recommended)

1. Install via HACS (see main [README.md](README.md))
2. Enable the integration via:
   - **UI**: Settings → Devices & Services → Add Integration → "Energy Monitor Backend"
   - **YAML**: Add `energy_monitor_backend:` to configuration.yaml
3. Restart Home Assistant

### Manual Installation

1. Copy the `custom_components/energy_monitor_backend` directory to your Home Assistant's `custom_components` folder:
   ```bash
   cp -r custom_components/energy_monitor_backend /config/custom_components/
   ```

2. Enable the integration via:
   - **UI**: Settings → Devices & Services → Add Integration → "Energy Monitor Backend"
   - **YAML**: Add `energy_monitor_backend:` to configuration.yaml

3. Restart Home Assistant

## API Endpoints

### GET /api/energy_monitor/entities

Returns a list of all sensor entities with their metadata.

**Response:**
```json
[
  {
    "entity_id": "sensor.power_meter",
    "friendly_name": "Power Meter",
    "state": "125.5",
    "unit_of_measurement": "W",
    "device_class": "power",
    "last_updated": "2025-12-03T16:30:00.000000+00:00",
    "last_changed": "2025-12-03T16:25:00.000000+00:00"
  }
]
```

### GET /api/energy_monitor/state

Returns the current state for a specific entity.

**Parameters:**
- `entity_id` (required) - The entity ID to query (e.g., `sensor.power_meter`)

**Example:**
```
GET /api/energy_monitor/state?entity_id=sensor.power_meter
```

**Response:**
```json
{
  "entity_id": "sensor.power_meter",
  "friendly_name": "Power Meter",
  "state": "125.5",
  "unit_of_measurement": "W",
  "device_class": "power",
  "last_updated": "2025-12-03T16:30:00.000000+00:00",
  "last_changed": "2025-12-03T16:25:00.000000+00:00",
  "attributes": {
    "friendly_name": "Power Meter",
    "unit_of_measurement": "W",
    "device_class": "power"
  }
}
```

### GET /api/energy_monitor/history

Returns historical data for one or more entities with validation.

**Parameters:**
- `entity_id` (required) - Comma-separated list of entity IDs
- `start_time` (optional) - ISO 8601 timestamp for start time
- `end_time` (optional) - ISO 8601 timestamp for end time
- `days` (optional) - Number of days to look back (default: 7, max: 90)

**Example:**
```
GET /api/energy_monitor/history?entity_id=sensor.power_meter&start_time=2025-12-01T00:00:00Z&end_time=2025-12-03T23:59:59Z
```

**Response:**
```json
{
  "entity_ids": ["sensor.power_meter"],
  "start_time": "2025-12-01T00:00:00+00:00",
  "end_time": "2025-12-03T23:59:59+00:00",
  "data": {
    "sensor.power_meter": [
      {
        "state": 125.5,
        "last_changed": "2025-12-01T00:00:00+00:00",
        "last_updated": "2025-12-01T00:00:00+00:00",
        "attributes": {
          "unit_of_measurement": "W",
          "device_class": "power"
        }
      }
    ]
  }
}
```

## Security Features

1. **Entity Type Validation** - Only `sensor.*` entities are allowed
2. **State Validation** - Invalid states ("unavailable", "unknown", etc.) are filtered out
3. **Numeric Validation** - Non-numeric states are excluded from history data
4. **Entity Existence Check** - Returns 404 if entity doesn't exist
5. **Recorder Availability** - Returns 503 if recorder is not available
6. **Parameter Validation** - All query parameters are validated before processing

## Error Responses

- **400 Bad Request** - Missing or invalid parameters
- **404 Not Found** - Entity not found
- **500 Internal Server Error** - Server error during processing
- **503 Service Unavailable** - Recorder integration not available

## Frontend Integration

The Energy Monitor Card automatically uses these backend endpoints:

- Uses `/api/energy_monitor/state` to validate entities before fetching history
- Uses `/api/energy_monitor/history` instead of `/api/history/period`
- Handles errors gracefully with user-friendly messages

## Configuration

No additional configuration is required. Simply add to `configuration.yaml`:

```yaml
energy_monitor_backend:
```

## Troubleshooting

### Integration not loading

1. Check Home Assistant logs for errors:
   ```bash
   tail -f /config/home-assistant.log | grep energy_monitor
   ```

2. Verify the integration is in the correct location:
   ```bash
   ls /config/custom_components/energy_monitor_backend/
   ```

### API endpoints not responding

1. Ensure the integration is loaded:
   - Go to Configuration → Integrations
   - Look for "Energy Monitor Backend"

2. Check if recorder is enabled:
   ```yaml
   recorder:
     purge_keep_days: 30
   ```

### No historical data returned

1. Verify the sensor has historical data:
   - Developer Tools → States → Check sensor
   - History → Verify data exists for the time period

2. Check recorder configuration includes the sensor:
   ```yaml
   recorder:
     include:
       domains:
         - sensor
   ```

## Development

### File Structure

```
custom_components/energy_monitor_backend/
├── __init__.py         # Main integration code with HTTP views
├── const.py           # Constants and configuration
└── manifest.json      # Integration metadata
```

### Logging

Enable debug logging in `configuration.yaml`:

```yaml
logger:
  default: info
  logs:
    custom_components.energy_monitor_backend: debug
```

## License

MIT License - See LICENSE file for details

## Support

- **Issues**: https://github.com/iAlias/energy-monitor-card/issues
- **Discussions**: https://github.com/iAlias/energy-monitor-card/discussions
- **Community**: https://community.home-assistant.io/
