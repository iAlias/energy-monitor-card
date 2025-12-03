"""Validation utilities for Energy Monitor Backend."""
import logging
from typing import Dict, List, Optional, Tuple

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

VALID_ENERGY_UNITS = ["kWh", "Wh", "MWh", "GWh"]
VALID_POWER_UNITS = ["W", "kW", "MW", "GW"]
VALID_DEVICE_CLASSES = ["energy", "power"]
INVALID_STATE_VALUES = ["unavailable", "unknown", "none", ""]


def is_valid_energy_sensor(entity_id: str, state_obj) -> Tuple[bool, Optional[str]]:
    """
    Validate if an entity is a valid energy sensor.
    
    Returns:
        Tuple of (is_valid, reason)
    """
    if not state_obj:
        return False, "Entity not found"
    
    # Skip cost/price sensors
    if "_cost" in entity_id or "_price" in entity_id:
        return False, "Cost/price sensor (excluded)"
    
    attributes = state_obj.attributes
    device_class = attributes.get("device_class")
    unit = attributes.get("unit_of_measurement")
    
    # Check device class
    if device_class in VALID_DEVICE_CLASSES:
        return True, f"Valid device_class: {device_class}"
    
    # Check unit of measurement
    if unit in VALID_ENERGY_UNITS or unit in VALID_POWER_UNITS:
        return True, f"Valid unit: {unit}"
    
    # Check entity_id pattern
    if "energy" in entity_id and "power" not in entity_id:
        return True, "Entity ID contains 'energy'"
    
    return False, f"Not an energy sensor (device_class={device_class}, unit={unit})"


def is_valid_state_value(state_value: str) -> bool:
    """Check if a state value is valid (not unavailable, unknown, etc)."""
    if state_value is None or state_value == "":
        return False
    
    if str(state_value).lower() in INVALID_STATE_VALUES:
        return False
    
    try:
        float(state_value)
        return True
    except (ValueError, TypeError):
        return False


def validate_sensors(hass: HomeAssistant, entity_ids: List[str]) -> Dict[str, Dict]:
    """
    Validate multiple sensors and return validation results.
    
    Args:
        hass: Home Assistant instance
        entity_ids: List of entity IDs to validate
    
    Returns:
        Dict mapping entity_id to validation result
    """
    results = {}
    
    for entity_id in entity_ids:
        state_obj = hass.states.get(entity_id)
        is_valid, reason = is_valid_energy_sensor(entity_id, state_obj)
        
        state_valid = False
        state_value = None
        
        if state_obj:
            state_value = state_obj.state
            state_valid = is_valid_state_value(state_value)
        
        results[entity_id] = {
            "exists": state_obj is not None,
            "is_energy_sensor": is_valid,
            "validation_reason": reason,
            "state": state_value,
            "state_valid": state_valid,
            "unit": state_obj.attributes.get("unit_of_measurement") if state_obj else None,
            "device_class": state_obj.attributes.get("device_class") if state_obj else None,
        }
    
    return results


def get_all_energy_sensors(hass: HomeAssistant) -> List[Dict]:
    """
    Get all valid energy sensors from Home Assistant.
    
    Returns:
        List of sensor info dictionaries
    """
    sensors = []
    
    for entity_id, state in hass.states.async_all():
        if not entity_id.startswith("sensor."):
            continue
        
        is_valid, reason = is_valid_energy_sensor(entity_id, state)
        if is_valid:
            sensors.append({
                "entity_id": entity_id,
                "friendly_name": state.attributes.get("friendly_name", entity_id),
                "state": state.state,
                "unit_of_measurement": state.attributes.get("unit_of_measurement"),
                "device_class": state.attributes.get("device_class"),
                "validation_reason": reason,
                "state_valid": is_valid_state_value(state.state),
            })
    
    return sensors
