"""Config flow for Energy Monitor Backend integration."""
import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class EnergyMonitorBackendConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Energy Monitor Backend."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        # Only allow a single instance
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            return self.async_create_entry(
                title="Energy Monitor Backend",
                data={},
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders={
                "documentation": "https://github.com/iAlias/energy-monitor-card"
            },
        )

    async def async_step_import(self, import_data: dict[str, Any] | None = None) -> FlowResult:
        """Handle import from configuration.yaml."""
        return await self.async_step_user(import_data)
