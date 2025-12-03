"""Constants for the Energy Monitor Backend integration."""

DOMAIN = "energy_monitor_backend"
NAME = "Energy Monitor Backend"
VERSION = "1.0.0"

# API endpoints
API_BASE_PATH = "/api/energy_monitor"
ENDPOINT_ENTITIES = f"{API_BASE_PATH}/entities"
ENDPOINT_STATE = f"{API_BASE_PATH}/state"
ENDPOINT_HISTORY = f"{API_BASE_PATH}/history"

# Default values
DEFAULT_DAYS_HISTORY = 7
MAX_DAYS_HISTORY = 90

# Invalid state values
INVALID_STATES = ["unavailable", "unknown", "none", ""]
