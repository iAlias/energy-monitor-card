"""Energy Monitor Backend Integration for Home Assistant."""
import logging

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform

from .views import (
    EnergyMonitorEntitiesView,
    EnergyMonitorStateView,
    EnergyMonitorHistoryView,
)

_LOGGER = logging.getLogger(__name__)

DOMAIN = "energy_monitor_backend"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Energy Monitor Backend component."""
    _LOGGER.info("Setting up Energy Monitor Backend")
    
    # Register HTTP views
    hass.http.register_view(EnergyMonitorEntitiesView)
    hass.http.register_view(EnergyMonitorStateView)
    hass.http.register_view(EnergyMonitorHistoryView)
    
    _LOGGER.info("Energy Monitor Backend HTTP views registered")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Energy Monitor Backend from a config entry."""
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    return True
