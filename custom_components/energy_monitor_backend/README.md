# Energy Monitor Backend - Custom Integration

This is a Home Assistant custom integration that provides a safe REST API for the Energy Monitor Card.

## Purpose

The Energy Monitor Backend integration solves common issues with the frontend card:
- **404 errors** when calling `/api/history` directly
- **Unreliable zero values** due to missing data validation
- **Better sensor validation** to detect energy/power sensors correctly

## Features

- ✅ **Safe REST API** - Validates sensors before returning data
- ✅ **Entity Discovery** - Automatically finds energy/power sensors
- ✅ **Historical Data** - Retrieves data from Home Assistant recorder
- ✅ **State Validation** - Filters out invalid states (unavailable, unknown)
- ✅ **Statistics** - Calculates min, max, average, and total consumption

## Installation

### Option 1: Manual Installation

1. Copy the `custom_components/energy_monitor_backend` folder to your Home Assistant `custom_components` directory:
   ```
   config/
   └── custom_components/
       └── energy_monitor_backend/
           ├── __init__.py
           ├── manifest.json
           ├── views.py
           └── validation.py
   ```

2. Add to your `configuration.yaml`:
   ```yaml
   energy_monitor_backend:
   ```

3. Restart Home Assistant

### Option 2: Via HACS (Future)

This integration will be available through HACS in the future.

## API Endpoints

### GET /api/energy_monitor/entities

Returns a list of all energy/power sensor entities.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "entities": [
    {
      "entity_id": "sensor.scaldabagno_energy",
      "friendly_name": "Scaldabagno Energy",
      "state": "123.45",
      "unit_of_measurement": "kWh",
      "device_class": "energy",
      "last_updated": "2025-01-15T10:30:00+00:00"
    }
  ]
}
```

### GET /api/energy_monitor/state?entity_id=<entity_id>

Returns the current state of a specific entity.

**Parameters:**
- `entity_id` (required): The entity ID to query

**Response:**
```json
{
  "success": true,
  "entity_id": "sensor.scaldabagno_energy",
  "state": "123.45",
  "is_valid": true,
  "unit_of_measurement": "kWh",
  "device_class": "energy",
  "friendly_name": "Scaldabagno Energy",
  "last_updated": "2025-01-15T10:30:00+00:00"
}
```

### GET /api/energy_monitor/history?entity_id=<entity_id>&start=<date>&end=<date>

Returns historical data for an entity.

**Parameters:**
- `entity_id` (required): The entity ID to query
- `start` (optional): Start date/time (ISO 8601 format or YYYY-MM-DD). Default: 24 hours ago
- `end` (optional): End date/time (ISO 8601 format or YYYY-MM-DD). Default: now

**Response:**
```json
{
  "success": true,
  "entity_id": "sensor.scaldabagno_energy",
  "start_time": "2025-01-14T00:00:00+00:00",
  "end_time": "2025-01-15T00:00:00+00:00",
  "data_points": 48,
  "history": [
    {
      "state": "120.0",
      "last_changed": "2025-01-14T00:00:00+00:00",
      "last_updated": "2025-01-14T00:00:00+00:00"
    }
  ],
  "statistics": {
    "min": 120.0,
    "max": 125.5,
    "average": 122.3,
    "total_consumption": 5.5,
    "valid_points": 48
  }
}
```

## Sensor Validation

The backend validates sensors using multiple criteria:

1. **Device Class**: `energy` or `power`
2. **Unit of Measurement**: `kWh`, `Wh`, `MWh`, `W`, `kW`, `MW`
3. **Entity ID Pattern**: Contains "energy" (but not "power")
4. **Exclusions**: Automatically excludes sensors with "_cost" or "_price" in the name

## Error Handling

All endpoints return error responses with appropriate HTTP status codes:

- `400 Bad Request`: Missing or invalid parameters
- `404 Not Found`: Entity not found
- `500 Internal Server Error`: Unexpected errors

**Error Response:**
```json
{
  "success": false,
  "error": "Entity sensor.invalid not found"
}
```

## Logging

The integration logs important events to help with debugging:

- Entity discovery and validation
- API requests and responses
- Errors and warnings

Check your Home Assistant logs for messages from `custom_components.energy_monitor_backend`.

## Requirements

- Home Assistant 2023.12.0 or later
- Recorder integration enabled (for historical data)

## Troubleshooting

### No entities found

- Verify you have energy/power sensors configured
- Check that sensors have valid `device_class` or `unit_of_measurement`
- Enable debug logging to see validation details

### 404 errors

- Ensure the integration is properly installed
- Restart Home Assistant after installation
- Check that the integration is loaded in `Settings > Integrations`

### No historical data

- Verify the recorder integration is enabled
- Check that your sensors have historical data
- Adjust the recorder retention period if needed

## License

MIT License - See the main repository for details.
