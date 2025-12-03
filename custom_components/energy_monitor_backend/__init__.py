"""Energy Monitor Backend integration for Home Assistant."""
import logging
from datetime import datetime, timedelta
from typing import Any

from aiohttp import web
import voluptuous as vol

from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.components.recorder.history import get_significant_states
from homeassistant.components.recorder import get_instance
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    ENDPOINT_ENTITIES,
    ENDPOINT_STATE,
    ENDPOINT_HISTORY,
    DEFAULT_DAYS_HISTORY,
    MAX_DAYS_HISTORY,
    INVALID_STATES,
)

_LOGGER = logging.getLogger(__name__)

# Empty config schema allows integration without configuration.yaml entry
CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Energy Monitor Backend integration from YAML.
    
    This integration auto-loads when installed via HACS.
    A configuration.yaml entry enables the integration:
    
    energy_monitor_backend:
    
    Alternatively, it can be set up via the UI (Configuration > Integrations).
    """
    if DOMAIN not in config:
        return True
    
    _LOGGER.info("Setting up Energy Monitor Backend integration from YAML")
    
    # Register HTTP views
    hass.http.register_view(EntitiesView)
    hass.http.register_view(StateView)
    hass.http.register_view(HistoryView)
    
    _LOGGER.info("Energy Monitor Backend integration setup complete")
    _LOGGER.info("API endpoints available at /api/energy_monitor/*")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Energy Monitor Backend from a config entry (UI setup)."""
    _LOGGER.info("Setting up Energy Monitor Backend integration from config entry")
    
    # Register HTTP views
    hass.http.register_view(EntitiesView)
    hass.http.register_view(StateView)
    hass.http.register_view(HistoryView)
    
    _LOGGER.info("Energy Monitor Backend integration setup complete")
    _LOGGER.info("API endpoints available at /api/energy_monitor/*")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Energy Monitor Backend integration")
    return True


class EntitiesView(HomeAssistantView):
    """View to return all sensor entities with metadata."""
    
    url = ENDPOINT_ENTITIES
    name = "api:energy_monitor:entities"
    
    async def get(self, request: web.Request) -> web.Response:
        """Return list of all sensor entities."""
        hass = request.app["hass"]
        
        try:
            entities = []
            
            # Get all sensor entities
            for entity_id, state in hass.states.async_all():
                if entity_id.startswith("sensor."):
                    entities.append({
                        "entity_id": entity_id,
                        "friendly_name": state.attributes.get("friendly_name", entity_id),
                        "state": state.state if state.state not in INVALID_STATES else None,
                        "unit_of_measurement": state.attributes.get("unit_of_measurement"),
                        "device_class": state.attributes.get("device_class"),
                        "last_updated": state.last_updated.isoformat() if state.last_updated else None,
                        "last_changed": state.last_changed.isoformat() if state.last_changed else None,
                    })
            
            _LOGGER.debug(f"Returning {len(entities)} sensor entities")
            return self.json(entities)
            
        except Exception as ex:
            _LOGGER.error(f"Error getting entities: {ex}")
            return self.json_message(
                f"Error getting entities: {str(ex)}",
                status_code=500
            )


class StateView(HomeAssistantView):
    """View to return current state for a specific entity."""
    
    url = ENDPOINT_STATE
    name = "api:energy_monitor:state"
    
    async def get(self, request: web.Request) -> web.Response:
        """Return current state for an entity."""
        hass = request.app["hass"]
        
        try:
            entity_id = request.query.get("entity_id")
            
            if not entity_id:
                return self.json_message(
                    "Missing required parameter: entity_id",
                    status_code=400
                )
            
            # Validate entity_id format
            if not entity_id.startswith("sensor."):
                return self.json_message(
                    "Only sensor entities are supported",
                    status_code=400
                )
            
            # Get entity state
            state = hass.states.get(entity_id)
            
            if not state:
                return self.json_message(
                    f"Entity not found: {entity_id}",
                    status_code=404
                )
            
            # Check if state is valid
            state_value = state.state if state.state not in INVALID_STATES else None
            
            result = {
                "entity_id": entity_id,
                "friendly_name": state.attributes.get("friendly_name", entity_id),
                "state": state_value,
                "unit_of_measurement": state.attributes.get("unit_of_measurement"),
                "device_class": state.attributes.get("device_class"),
                "last_updated": state.last_updated.isoformat() if state.last_updated else None,
                "last_changed": state.last_changed.isoformat() if state.last_changed else None,
                "attributes": dict(state.attributes),
            }
            
            _LOGGER.debug(f"Returning state for {entity_id}: {state_value}")
            return self.json(result)
            
        except Exception as ex:
            _LOGGER.error(f"Error getting state: {ex}")
            return self.json_message(
                f"Error getting state: {str(ex)}",
                status_code=500
            )


class HistoryView(HomeAssistantView):
    """View to return historical data for entities with validation."""
    
    url = ENDPOINT_HISTORY
    name = "api:energy_monitor:history"
    
    async def get(self, request: web.Request) -> web.Response:
        """Return historical data for entities."""
        hass = request.app["hass"]
        
        try:
            # Parse query parameters
            entity_ids_str = request.query.get("entity_id", "")
            start_time_str = request.query.get("start_time")
            end_time_str = request.query.get("end_time")
            days = request.query.get("days", str(DEFAULT_DAYS_HISTORY))
            
            # Validate entity_ids
            if not entity_ids_str:
                return self.json_message(
                    "Missing required parameter: entity_id",
                    status_code=400
                )
            
            entity_ids = [e.strip() for e in entity_ids_str.split(",")]
            
            # Validate all are sensor entities
            for entity_id in entity_ids:
                if not entity_id.startswith("sensor."):
                    return self.json_message(
                        f"Only sensor entities are supported: {entity_id}",
                        status_code=400
                    )
                
                # Check entity exists
                if not hass.states.get(entity_id):
                    return self.json_message(
                        f"Entity not found: {entity_id}",
                        status_code=404
                    )
            
            # Parse time parameters
            end_time = dt_util.utcnow()
            if end_time_str:
                try:
                    end_time = dt_util.parse_datetime(end_time_str)
                    if not end_time:
                        return self.json_message(
                            "Invalid end_time format",
                            status_code=400
                        )
                except Exception:
                    return self.json_message(
                        "Invalid end_time format",
                        status_code=400
                    )
            
            if start_time_str:
                try:
                    start_time = dt_util.parse_datetime(start_time_str)
                    if not start_time:
                        return self.json_message(
                            "Invalid start_time format",
                            status_code=400
                        )
                except Exception:
                    return self.json_message(
                        "Invalid start_time format",
                        status_code=400
                    )
            else:
                # Use days parameter
                try:
                    days_int = int(days)
                    if days_int < 1 or days_int > MAX_DAYS_HISTORY:
                        return self.json_message(
                            f"days must be between 1 and {MAX_DAYS_HISTORY}",
                            status_code=400
                        )
                    start_time = end_time - timedelta(days=days_int)
                except ValueError:
                    return self.json_message(
                        "Invalid days parameter",
                        status_code=400
                    )
            
            # Get historical data
            _LOGGER.debug(
                f"Fetching history for {entity_ids} from {start_time} to {end_time}"
            )
            
            # Check if recorder is available
            recorder = get_instance(hass)
            if not recorder:
                return self.json_message(
                    "Recorder integration is not available",
                    status_code=503
                )
            
            # Get significant states
            history_data = await hass.async_add_executor_job(
                get_significant_states,
                hass,
                start_time,
                end_time,
                entity_ids,
                None,  # filters
                True,  # include_start_time_state
                True,  # significant_changes_only
                None,  # minimal_response
                False  # no_attributes
            )
            
            # Process and validate history data
            result = {}
            for entity_id in entity_ids:
                entity_history = history_data.get(entity_id, [])
                validated_history = []
                
                for state in entity_history:
                    # Skip invalid or None states
                    if state.state is None or state.state in INVALID_STATES:
                        continue
                    
                    # Try to parse as number for validation
                    try:
                        value = float(state.state)
                        validated_history.append({
                            "state": value,
                            "last_changed": state.last_changed.isoformat(),
                            "last_updated": state.last_updated.isoformat(),
                            "attributes": {
                                "unit_of_measurement": state.attributes.get("unit_of_measurement"),
                                "device_class": state.attributes.get("device_class"),
                            }
                        })
                    except (ValueError, TypeError):
                        # Skip non-numeric states
                        _LOGGER.debug(
                            f"Skipping non-numeric state for {entity_id}: {state.state}"
                        )
                        continue
                
                result[entity_id] = validated_history
            
            _LOGGER.debug(
                f"Returning history for {len(entity_ids)} entities with total "
                f"{sum(len(h) for h in result.values())} data points"
            )
            
            return self.json({
                "entity_ids": entity_ids,
                "start_time": start_time.isoformat(),
                "end_time": end_time.isoformat(),
                "data": result,
            })
            
        except Exception as ex:
            _LOGGER.error(f"Error getting history: {ex}", exc_info=True)
            return self.json_message(
                f"Error getting history: {str(ex)}",
                status_code=500
            )
