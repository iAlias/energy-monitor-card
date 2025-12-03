"""HTTP Views for Energy Monitor Backend."""
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util
from homeassistant.components import recorder
from homeassistant.components.recorder.history import get_significant_states

_LOGGER = logging.getLogger(__name__)


class EnergyMonitorEntitiesView(HomeAssistantView):
    """View to get all energy sensor entities."""

    url = "/api/energy_monitor/entities"
    name = "api:energy_monitor:entities"

    async def get(self, request: web.Request) -> web.Response:
        """Get list of sensor entities with energy/power measurements."""
        hass: HomeAssistant = request.app["hass"]
        
        try:
            entities = []
            
            # Get all sensor entities
            for entity_id, state in hass.states.async_all():
                # Filter for sensor entities
                if not entity_id.startswith("sensor."):
                    continue
                
                # Skip cost/price sensors
                if "_cost" in entity_id or "_price" in entity_id:
                    continue
                
                attributes = state.attributes
                device_class = attributes.get("device_class")
                unit = attributes.get("unit_of_measurement")
                
                # Check if it's an energy or power sensor
                is_energy_sensor = (
                    device_class in ["energy", "power"] or
                    unit in ["kWh", "W", "Wh", "MWh"] or
                    ("energy" in entity_id and "power" not in entity_id)
                )
                
                if is_energy_sensor:
                    entity_info = {
                        "entity_id": entity_id,
                        "friendly_name": attributes.get("friendly_name", entity_id),
                        "state": state.state,
                        "unit_of_measurement": unit,
                        "device_class": device_class,
                        "last_updated": state.last_updated.isoformat() if state.last_updated else None,
                        "last_changed": state.last_changed.isoformat() if state.last_changed else None,
                    }
                    entities.append(entity_info)
            
            _LOGGER.debug(f"Found {len(entities)} energy/power sensors")
            
            return self.json({
                "success": True,
                "count": len(entities),
                "entities": entities
            })
            
        except Exception as e:
            _LOGGER.error(f"Error getting entities: {e}", exc_info=True)
            return self.json({
                "success": False,
                "error": str(e)
            }, status_code=500)


class EnergyMonitorStateView(HomeAssistantView):
    """View to get current state of an entity."""

    url = "/api/energy_monitor/state"
    name = "api:energy_monitor:state"

    async def get(self, request: web.Request) -> web.Response:
        """Get current state of an entity."""
        hass: HomeAssistant = request.app["hass"]
        
        try:
            entity_id = request.query.get("entity_id")
            
            if not entity_id:
                return self.json({
                    "success": False,
                    "error": "entity_id parameter is required"
                }, status_code=400)
            
            # Validate entity exists
            state = hass.states.get(entity_id)
            if not state:
                return self.json({
                    "success": False,
                    "error": f"Entity {entity_id} not found"
                }, status_code=404)
            
            # Check if state is valid
            state_value = state.state
            is_valid = self._is_valid_state(state_value)
            
            attributes = state.attributes
            
            result = {
                "success": True,
                "entity_id": entity_id,
                "state": state_value,
                "is_valid": is_valid,
                "unit_of_measurement": attributes.get("unit_of_measurement"),
                "device_class": attributes.get("device_class"),
                "friendly_name": attributes.get("friendly_name", entity_id),
                "last_updated": state.last_updated.isoformat() if state.last_updated else None,
                "last_changed": state.last_changed.isoformat() if state.last_changed else None,
                "attributes": {
                    k: v for k, v in attributes.items()
                    if k not in ["friendly_name", "unit_of_measurement", "device_class"]
                }
            }
            
            return self.json(result)
            
        except Exception as e:
            _LOGGER.error(f"Error getting state: {e}", exc_info=True)
            return self.json({
                "success": False,
                "error": str(e)
            }, status_code=500)
    
    def _is_valid_state(self, state_value: str) -> bool:
        """Check if state value is valid (not unavailable, unknown, etc)."""
        if state_value is None or state_value == "":
            return False
        
        invalid_states = ["unavailable", "unknown", "none", ""]
        return state_value.lower() not in invalid_states


class EnergyMonitorHistoryView(HomeAssistantView):
    """View to get historical data for an entity."""

    url = "/api/energy_monitor/history"
    name = "api:energy_monitor:history"

    async def get(self, request: web.Request) -> web.Response:
        """Get historical data for an entity."""
        hass: HomeAssistant = request.app["hass"]
        
        try:
            entity_id = request.query.get("entity_id")
            start_time = request.query.get("start")
            end_time = request.query.get("end")
            
            # Validate required parameters
            if not entity_id:
                return self.json({
                    "success": False,
                    "error": "entity_id parameter is required"
                }, status_code=400)
            
            # Validate entity exists
            state = hass.states.get(entity_id)
            if not state:
                return self.json({
                    "success": False,
                    "error": f"Entity {entity_id} not found"
                }, status_code=404)
            
            # Parse dates
            try:
                if start_time:
                    start_dt = dt_util.parse_datetime(start_time)
                    if not start_dt:
                        # Try parsing as date only
                        start_dt = datetime.fromisoformat(f"{start_time}T00:00:00")
                        start_dt = dt_util.as_utc(start_dt)
                else:
                    # Default to 24 hours ago
                    start_dt = dt_util.utcnow() - timedelta(days=1)
                
                if end_time:
                    end_dt = dt_util.parse_datetime(end_time)
                    if not end_dt:
                        # Try parsing as date only
                        end_dt = datetime.fromisoformat(f"{end_time}T23:59:59")
                        end_dt = dt_util.as_utc(end_dt)
                else:
                    # Default to now
                    end_dt = dt_util.utcnow()
                
            except (ValueError, TypeError) as e:
                return self.json({
                    "success": False,
                    "error": f"Invalid date format: {e}"
                }, status_code=400)
            
            # Get historical data
            history_data = await self._get_history_data(
                hass, entity_id, start_dt, end_dt
            )
            
            # Calculate statistics
            stats = self._calculate_statistics(history_data)
            
            result = {
                "success": True,
                "entity_id": entity_id,
                "start_time": start_dt.isoformat(),
                "end_time": end_dt.isoformat(),
                "data_points": len(history_data),
                "history": history_data,
                "statistics": stats
            }
            
            return self.json(result)
            
        except Exception as e:
            _LOGGER.error(f"Error getting history: {e}", exc_info=True)
            return self.json({
                "success": False,
                "error": str(e)
            }, status_code=500)
    
    async def _get_history_data(
        self, hass: HomeAssistant, entity_id: str, start_time: datetime, end_time: datetime
    ) -> List[Dict[str, Any]]:
        """Get historical data from recorder."""
        try:
            # Use recorder's history component
            history = await hass.async_add_executor_job(
                get_significant_states,
                hass,
                start_time,
                end_time,
                [entity_id],
                None,  # filters
                True,  # include_start_time_state
                True,  # significant_changes_only
                0.0,   # minimal_response
                False  # no_attributes
            )
            
            if not history or entity_id not in history:
                _LOGGER.debug(f"No history data found for {entity_id}")
                return []
            
            # Convert history states to simple dict format
            result = []
            for state in history[entity_id]:
                # Skip invalid states
                if state.state in ["unavailable", "unknown", "none", ""]:
                    continue
                
                try:
                    # Try to convert to number to validate
                    float(state.state)
                    
                    result.append({
                        "state": state.state,
                        "last_changed": state.last_changed.isoformat(),
                        "last_updated": state.last_updated.isoformat(),
                    })
                except (ValueError, TypeError):
                    # Skip non-numeric states
                    continue
            
            return result
            
        except Exception as e:
            _LOGGER.error(f"Error fetching history data: {e}", exc_info=True)
            return []
    
    def _calculate_statistics(self, history_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate statistics from history data."""
        if not history_data:
            return {
                "min": None,
                "max": None,
                "average": None,
                "total_consumption": None,
                "valid_points": 0
            }
        
        try:
            values = []
            for point in history_data:
                try:
                    values.append(float(point["state"]))
                except (ValueError, TypeError, KeyError):
                    continue
            
            if not values:
                return {
                    "min": None,
                    "max": None,
                    "average": None,
                    "total_consumption": None,
                    "valid_points": 0
                }
            
            # For cumulative sensors (like energy), consumption is the difference
            # between last and first reading
            total_consumption = values[-1] - values[0] if len(values) > 1 else 0
            
            return {
                "min": min(values),
                "max": max(values),
                "average": sum(values) / len(values),
                "total_consumption": total_consumption,
                "valid_points": len(values)
            }
            
        except Exception as e:
            _LOGGER.error(f"Error calculating statistics: {e}")
            return {
                "min": None,
                "max": None,
                "average": None,
                "total_consumption": None,
                "valid_points": 0
            }
