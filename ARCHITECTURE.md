# Energy Monitor Card - Architecture Documentation

## Overview

The Energy Monitor Card is a complete solution for monitoring energy consumption in Home Assistant, consisting of a **frontend card** and an optional **backend integration**.

```
┌─────────────────────────────────────────────────────────┐
│                    Home Assistant                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Frontend (Lovelace Card)               │    │
│  │  - energy-monitor-card.js                      │    │
│  │  - Displays energy data                        │    │
│  │  - Handles user interactions                   │    │
│  │  - Calculates costs                            │    │
│  └─────────────┬──────────────────────────────────┘    │
│                │                                         │
│                │ API Calls                               │
│                ↓                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │   Backend Integration (Optional)               │    │
│  │   custom_components/energy_monitor_backend     │    │
│  │                                                 │    │
│  │   ┌─────────────────────────────────────┐     │    │
│  │   │  HTTP Views (views.py)              │     │    │
│  │   │  - /api/energy_monitor/entities     │     │    │
│  │   │  - /api/energy_monitor/state        │     │    │
│  │   │  - /api/energy_monitor/history      │     │    │
│  │   └────────┬────────────────────────────┘     │    │
│  │            │                                   │    │
│  │            ↓                                   │    │
│  │   ┌─────────────────────────────────────┐     │    │
│  │   │  Validation (validation.py)         │     │    │
│  │   │  - Sensor validation                │     │    │
│  │   │  - State validation                 │     │    │
│  │   └────────┬────────────────────────────┘     │    │
│  │            │                                   │    │
│  │            ↓                                   │    │
│  └────────────┼───────────────────────────────────┘    │
│               │                                         │
│               ↓                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │      Home Assistant Core                       │    │
│  │      - States                                  │    │
│  │      - Recorder (History)                      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Frontend Card

**Location:** `dist/energy-monitor-card.js`

**Purpose:** Display energy consumption data with comparisons and cost calculations.

**Key Features:**
- Auto-detects energy sensors (with backend or locally)
- Fetches historical data from backend or direct API
- Calculates energy consumption and costs
- Displays data in intuitive UI with comparisons
- Handles period selection (day, week, month, year)

**Technology:**
- LitElement (Web Components)
- ES6 JavaScript modules
- Home Assistant Custom Card API

**Data Flow:**

1. **Initialization**
   ```javascript
   setConfig(config) → firstUpdated() → _detectDevices()
   ```

2. **Device Detection (with backend)**
   ```javascript
   _detectDevices()
   → Call /api/energy_monitor/entities
   → Parse response
   → Populate _devices array
   → Fallback to local detection if backend unavailable
   ```

3. **Data Loading**
   ```javascript
   _loadConsumptionData()
   → For each device:
     → Call /api/energy_monitor/history (current period)
     → Call /api/energy_monitor/history (comparison period)
     → Use backend statistics or calculate locally
     → Calculate costs
   → Update UI
   ```

4. **Rendering**
   ```javascript
   render()
   → Display period selector
   → For each device:
     → Show current consumption
     → Show comparison
     → Show costs
   → Display totals
   ```

---

### 2. Backend Integration

**Location:** `custom_components/energy_monitor_backend/`

**Purpose:** Provide a safe, validated REST API for energy data.

#### 2.1 Component Structure

```
custom_components/energy_monitor_backend/
├── __init__.py          # Integration setup and HTTP view registration
├── manifest.json        # Integration metadata
├── views.py             # HTTP view handlers (API endpoints)
├── validation.py        # Sensor and state validation utilities
└── README.md            # Integration documentation
```

#### 2.2 Initialization (`__init__.py`)

**Purpose:** Register the integration and HTTP views.

```python
async def async_setup(hass, config):
    # Register HTTP views for API endpoints
    hass.http.register_view(EnergyMonitorEntitiesView)
    hass.http.register_view(EnergyMonitorStateView)
    hass.http.register_view(EnergyMonitorHistoryView)
    return True
```

**When it runs:**
- On Home Assistant startup
- When integration is added/reloaded

#### 2.3 HTTP Views (`views.py`)

**Purpose:** Handle API requests and return validated data.

##### Endpoint 1: `/api/energy_monitor/entities`

**Purpose:** List all energy/power sensors.

**Process:**
1. Iterate through all Home Assistant states
2. Filter for sensor entities
3. Validate using multiple criteria:
   - Device class (energy, power)
   - Unit of measurement (kWh, W, etc.)
   - Entity ID pattern (contains "energy")
4. Exclude cost/price sensors
5. Return validated list with metadata

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

##### Endpoint 2: `/api/energy_monitor/state`

**Purpose:** Get current state of a specific entity.

**Parameters:**
- `entity_id` (required): Entity to query

**Process:**
1. Validate entity_id parameter
2. Check entity exists
3. Validate state value (not unavailable/unknown)
4. Return state with metadata

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

##### Endpoint 3: `/api/energy_monitor/history`

**Purpose:** Get historical data with statistics.

**Parameters:**
- `entity_id` (required): Entity to query
- `start` (optional): Start date (ISO 8601 or YYYY-MM-DD)
- `end` (optional): End date (ISO 8601 or YYYY-MM-DD)

**Process:**
1. Validate parameters
2. Parse dates (default: 24 hours)
3. Fetch data from recorder using `get_significant_states`
4. Filter out invalid states
5. Calculate statistics:
   - Min/max values
   - Average
   - Total consumption (difference between last and first)
   - Valid data point count
6. Return history + statistics

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

#### 2.4 Validation (`validation.py`)

**Purpose:** Validate sensors and states.

**Key Functions:**

1. **`is_valid_energy_sensor(entity_id, state_obj)`**
   - Checks if entity is a valid energy sensor
   - Returns (bool, reason) tuple
   - Validation criteria:
     - Device class: energy or power
     - Unit: kWh, W, Wh, MWh, kW, MW, GW
     - Entity ID pattern: contains "energy"
     - Excludes: _cost, _price sensors

2. **`is_valid_state_value(state_value)`**
   - Checks if state is valid
   - Rejects: unavailable, unknown, none, ""
   - Validates numeric conversion

3. **`validate_sensors(hass, entity_ids)`**
   - Validates multiple sensors at once
   - Returns detailed validation results

4. **`get_all_energy_sensors(hass)`**
   - Returns all valid energy sensors
   - Used by entities endpoint

---

## API Communication Flow

### Successful Backend Request

```
Frontend                    Backend                      HA Core
   │                          │                            │
   │  GET /api/energy_monitor/history?entity_id=X&start=Y&end=Z
   ├─────────────────────────>│                            │
   │                          │                            │
   │                          │  Validate entity_id        │
   │                          │  Parse dates               │
   │                          │                            │
   │                          │  get_significant_states()  │
   │                          ├───────────────────────────>│
   │                          │                            │
   │                          │<───────────────────────────┤
   │                          │  history data              │
   │                          │                            │
   │                          │  Filter invalid states     │
   │                          │  Calculate statistics      │
   │                          │                            │
   │<─────────────────────────┤                            │
   │  {success: true,         │                            │
   │   history: [...],        │                            │
   │   statistics: {...}}     │                            │
   │                          │                            │
   │  Use statistics.total_consumption                     │
   │  Display data            │                            │
```

### Fallback to Direct API

```
Frontend                    Backend                      HA Core
   │                          │                            │
   │  GET /api/energy_monitor/history?entity_id=X
   ├─────────────────────────>│                            │
   │                          X  (Backend not available)   │
   │<─────────────────────────┤                            │
   │  Error                   │                            │
   │                          │                            │
   │  GET /api/history/period/...                          │
   ├──────────────────────────────────────────────────────>│
   │                          │                            │
   │<───────────────────────────────────────────────────────┤
   │  Raw history data        │                            │
   │                          │                            │
   │  Calculate consumption locally                        │
   │  Display data            │                            │
```

---

## Data Processing

### Energy Consumption Calculation

**Backend Approach (Preferred):**
```python
# For cumulative sensors (most energy sensors)
total_consumption = last_value - first_value
```

**Frontend Fallback:**
```javascript
// For incremental calculation
for (let i = 0; i < historyData.length - 1; i++) {
  const current = parseFloat(historyData[i].state);
  const next = parseFloat(historyData[i + 1].state);
  if (next >= current && !isNaN(current) && !isNaN(next)) {
    total += next - current;
  }
}
```

### Cost Calculation

```javascript
cost = consumption_kwh * price_per_kwh
```

Always done in frontend to allow user customization.

---

## Error Handling

### Backend Errors

1. **Missing entity_id**: 400 Bad Request
2. **Entity not found**: 404 Not Found
3. **Invalid date format**: 400 Bad Request
4. **Internal errors**: 500 Internal Server Error

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Frontend Error Handling

1. **Backend unavailable**: Fall back to direct API
2. **No data**: Display user-friendly message
3. **Invalid state**: Skip data point
4. **API errors**: Log to console, show error in UI

---

## Performance Considerations

### Backend Optimizations

1. **Efficient queries**: Uses `get_significant_states` with filters
2. **State filtering**: Removes invalid states early
3. **Async operations**: All I/O is async
4. **Minimal response**: Only returns necessary data

### Frontend Optimizations

1. **Loading states**: Prevents duplicate requests
2. **Caching**: Uses backend statistics when available
3. **Lazy loading**: Only loads data when needed
4. **Fallback**: Graceful degradation without backend

---

## Security

### Backend Security

1. **Uses Home Assistant auth**: All requests require valid session
2. **Input validation**: All parameters validated
3. **Entity verification**: Checks entity exists before querying
4. **Error sanitization**: Doesn't expose internal details

### Frontend Security

1. **Uses hass.callApi**: Includes authentication automatically
2. **No direct database access**: Always goes through API
3. **XSS protection**: LitElement auto-escapes HTML

---

## Future Enhancements

Potential improvements:

1. **Caching layer**: Cache frequent queries in backend
2. **WebSocket support**: Real-time updates
3. **Advanced statistics**: More statistical calculations
4. **Data export**: Export energy data to CSV/JSON
5. **Alerts**: Threshold-based notifications
6. **Predictions**: ML-based consumption predictions

---

## Debugging

### Enable Debug Logging

```yaml
# configuration.yaml
logger:
  default: info
  logs:
    custom_components.energy_monitor_backend: debug
```

### Frontend Console Logging

Open browser console (F12) to see:
- `✓ Backend API found X energy sensors` - Backend working
- `🔄 Falling back to direct history API` - Backend unavailable
- `📊 Statistics: {...}` - Backend statistics
- `❌ Backend API Error` - Backend error

### Check API Directly

Navigate to:
- `http://YOUR_HA_IP:8123/api/energy_monitor/entities`
- Should return JSON if backend is working

---

## License

MIT License - See LICENSE file for details.
