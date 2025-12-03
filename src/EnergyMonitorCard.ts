import { LitElement, html, css } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';

interface EntityInfo {
  entity_id: string;
  name: string;
  device_class?: string;
}

const STORAGE_KEY = "energy_monitor_selected_entities";

export class EnergyMonitorCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
    selectedEntities: { type: Array }
  };

  hass!: HomeAssistant;
  config: any;
  selectedEntities: string[] = [];

  constructor() {
    super();
    this.selectedEntities = this._loadSelectedEntities();
  }

  // Carica la selezione dal localStorage
  _loadSelectedEntities(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  // Salva la selezione nel localStorage
  _saveSelectedEntities(entities: string[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  }

  // Rileva automaticamente sensori di energia/potenza
  get availableEnergyEntities(): EntityInfo[] {
    const result: EntityInfo[] = [];
    if (!this.hass?.states) return result;
    Object.entries(this.hass.states).forEach(([entity_id, entity]) => {
      if (
        entity_id.startsWith('sensor.') &&
        (entity.attributes.device_class === 'energy' ||
          entity.attributes.device_class === 'power')
      ) {
        result.push({
          entity_id,
          name: entity.attributes.friendly_name || entity_id,
          device_class: entity.attributes.device_class
        });
      }
    });
    return result;
  }

  // Visualizza impostazioni con dropdown di selezione sensori
  renderSettingsPanel() {
    const entities = this.availableEnergyEntities;
    if (!entities.length) {
      return html`<span>Nessun sensore di energia/potenza rilevato.</span>`;
    }
    return html`
      <label for="entities-menu">Seleziona i sensori da monitorare:</label>
      <select id="entities-menu" multiple @change="${this._onEntitySelect}">
        ${entities.map(
          (entity) => html`
            <option
              value="${entity.entity_id}"
              ?selected="${this.selectedEntities.includes(entity.entity_id)}"
            >
              ${entity.name}
              (${entity.device_class})
            </option>
          ``
        )}
      </select>
    `;
  }

  _onEntitySelect(e: Event) {
    const select = e.target as HTMLSelectElement;
    const selected = Array.from(select.selectedOptions).map((o) => o.value);
    this.selectedEntities = selected;
    this._saveSelectedEntities(selected);
    this.requestUpdate();
  }

  // Mostra i dati dei sensori selezionati
  renderEntitiesData() {
    if (!this.selectedEntities.length) {
      return html`
        <div>Seleziona almeno un sensore di energia/potenza dalle impostazioni.</div>
      `;
    }
    return html`
      <div>
        ${this.selectedEntities.map(
          (entity_id) => {
            const stateObj = this.hass.states[entity_id];
            if (!stateObj) {
              return html`
                <div class="entity-data">
                  <strong>${entity_id}</strong>
                  <div style="color:red;">Sensore non trovato</div>
                </div>
              `;
            }
            return html`
              <div class="entity-data">
                <strong>${stateObj.attributes.friendly_name || entity_id}</strong>
                <div>Valore attuale: ${stateObj.state} ${stateObj.attributes.unit_of_measurement || ''}</div>
              </div>
            `;
          }
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="energy-monitor-card">
        <h2>Energy Monitor</h2>
        <div class="settings-panel">${this.renderSettingsPanel()}</div>
        <div class="entities-data">${this.renderEntitiesData()}</div>
      </div>
    `;
  }

  static styles = css`
    .energy-monitor-card {
      padding: 1em;
    }
    .settings-panel {
      margin-bottom: 2em;
    }
    .entity-data {
      margin: 0.5em 0;
      padding: 0.5em;
      background: #f6f6f6;
      border-radius: 4px;
    }
  `;
}

customElements.define('energy-monitor-card', EnergyMonitorCard);