import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0?module';

class EnergyMonitorCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      lovelace: { type: Object },
      config: { type: Object },
      _devices: { type: Array }
    };
  }

  constructor() {
    super();
    this._devices = [];
  }

  setConfig(config) {
    this.config = {
      title: 'Energy Monitor',
      price_per_kwh: 0.25,
      show_comparison: true,
      show_costs: true,
      auto_detect: true,
      entities: [],
      ...config
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadDevices();
  }

  _loadDevices() {
    if (!this.hass) return;

    const energyDevices = [];
    const seenDevices = new Set();

    Object.keys(this.hass.states).forEach(entityId => {
      const state = this.hass.states[entityId];
      
      if (entityId.startsWith('sensor.') && 
          (state.attributes.unit_of_measurement === 'kWh' ||
           state.attributes.unit_of_measurement === 'W' ||
           state.attributes.device_class === 'energy' ||
           state.attributes.device_class === 'power' ||
           entityId.includes('energy') ||
           entityId.includes('power') ||
           entityId.includes('consumption'))) {
        
        const deviceId = state.attributes.device_id || entityId;
        const deviceName = state.attributes.friendly_name || entityId;

        if (!seenDevices.has(deviceId)) {
          seenDevices.add(deviceId);
          energyDevices.push({
            entity_id: entityId,
            name: deviceName,
            icon: 'mdi:lightning-bolt'
          });
        }
      }
    });

    this._devices = energyDevices;
  }

  _updateConfig(key, value) {
    const newConfig = { ...this.config, [key]: value };
    this._fireConfigChanged(newConfig);
  }

  _updateEntity(index, field, value) {
    const entities = [...(this.config.entities || [])];
    entities[index] = { ...entities[index], [field]: value };
    this._updateConfig('entities', entities);
  }

  _addEntity() {
    const entities = [...(this.config.entities || [])];
    entities.push({ entity_id: '', name: '', icon: 'mdi:lightning-bolt' });
    this._updateConfig('entities', entities);
  }

  _removeEntity(index) {
    const entities = (this.config.entities || []).filter((_, i) => i !== index);
    this._updateConfig('entities', entities);
  }

  _fireConfigChanged(config) {
    const event = new CustomEvent('config-changed', {
      detail: { config },
      composed: true
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="editor">
        <ha-textfield
          label="Titolo Card"
          .value="${this.config.title}"
          @change="${(e) => this._updateConfig('title', e.target.value)}"
        ></ha-textfield>

        <ha-textfield
          label="Prezzo al kWh (€)"
          type="number"
          step="0.01"
          .value="${this.config.price_per_kwh}"
          @change="${(e) => this._updateConfig('price_per_kwh', parseFloat(e.target.value))}"
        ></ha-textfield>

        <ha-formfield label="Mostra Confronti Temporali">
          <ha-checkbox
            .checked="${this.config.show_comparison}"
            @change="${(e) => this._updateConfig('show_comparison', e.target.checked)}"
          ></ha-checkbox>
        </ha-formfield>

        <ha-formfield label="Mostra Costi">
          <ha-checkbox
            .checked="${this.config.show_costs}"
            @change="${(e) => this._updateConfig('show_costs', e.target.checked)}"
          ></ha-checkbox>
        </ha-formfield>

        <ha-formfield label="Rileva Automaticamente Dispositivi">
          <ha-checkbox
            .checked="${this.config.auto_detect}"
            @change="${(e) => this._updateConfig('auto_detect', e.target.checked)}"
          ></ha-checkbox>
        </ha-formfield>

        <div class="section">
          <h3>Dispositivi Configurati</h3>
          
          ${this.config.entities && this.config.entities.length > 0 ? html`
            <div class="entities-list">
              ${this.config.entities.map((entity, index) => html`
                <div class="entity-item">
                  <ha-textfield
                    label="ID Entità (entity_id)"
                    .value="${entity.entity_id || ''}"
                    @change="${(e) => this._updateEntity(index, 'entity_id', e.target.value)}"
                    list="entities-list"
                  ></ha-textfield>
                  <datalist id="entities-list">
                    ${this._devices.map(d => html`
                      <option value="${d.entity_id}">${d.name}</option>
                    `)}
                  </datalist>

                  <ha-textfield
                    label="Nome Dispositivo (opzionale)"
                    .value="${entity.name || ''}"
                    @change="${(e) => this._updateEntity(index, 'name', e.target.value)}"
                  ></ha-textfield>

                  <button @click="${() => this._removeEntity(index)}" class="remove-btn">
                    Rimuovi
                  </button>
                </div>
              `)}
            </div>
          ` : ''}

          <button @click="${() => this._addEntity()}" class="add-btn">
            + Aggiungi Dispositivo
          </button>
        </div>

        <div class="section">
          <h3>Dispositivi Rilevati Automaticamente</h3>
          <p class="hint">Se "Rileva Automaticamente" è abilitato, verranno inclusi anche questi:</p>
          <div class="devices-list">
            ${this._devices.map(device => html`
              <div class="device-item">
                <span class="device-name">${device.name}</span>
                <span class="device-id">${device.entity_id}</span>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      ha-textfield,
      ha-formfield {
        display: block;
        margin-bottom: 15px;
        width: 100%;
      }

      ha-textfield::part(container) {
        width: 100%;
      }

      .section {
        margin: 20px 0;
        padding: 15px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
      }

      .section h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .hint {
        margin: 0 0 10px 0;
        font-size: 12px;
        color: #666;
      }

      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 15px;
      }

      .entity-item {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 10px;
        padding: 10px;
        background: white;
        border-radius: 6px;
        border: 1px solid #ccc;
        align-items: center;
      }

      .remove-btn {
        padding: 8px 12px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: background 0.3s ease;
      }

      .remove-btn:hover {
        background: #d32f2f;
      }

      .add-btn {
        width: 100%;
        padding: 12px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: background 0.3s ease;
      }

      .add-btn:hover {
        background: #1976D2;
      }

      .devices-list {
        display: grid;
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
      }

      .device-item {
        padding: 10px;
        background: white;
        border-radius: 6px;
        border-left: 3px solid #2196F3;
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }

      .device-name {
        font-weight: 600;
        color: #212121;
      }

      .device-id {
        font-size: 12px;
        color: #999;
        font-family: monospace;
      }
    `;
  }
}

customElements.define('energy-monitor-card-editor', EnergyMonitorCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-monitor-card',
  name: 'Energy Monitor Card',
  description: 'Monitor energy consumption with comparisons and cost tracking',
  preview: true,
  documentationURL: 'https://github.com/yourusername/energy-monitor-card',
  configurable: true
});
