import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0?module';

// Registra la card in Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-monitor-card',
  name: 'Energy Monitor Card',
  description: 'Monitor energy consumption with time comparison and cost calculation',
  preview: true,
  documentationURL: 'https://github.com/iAlias/energy-monitor-card'
});

class EnergyMonitorCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _devices: { type: Array },
      _selectedPeriod: { type: String },
      _comparisonPeriod: { type: String },
      _startDate: { type: String },
      _endDate: { type: String },
      _comparisonStartDate: { type: String },
      _comparisonEndDate: { type: String },
      _consumptionData: { type: Object },
      _costData: { type: Object },
      _loading: { type: Boolean }
    };
  }

  constructor() {
   super();
    this._devices = [];
    this._selectedPeriod = 'day';
    this._comparisonPeriod = 'previous_day';
    this._consumptionData = {};
    this._costData = {};
    this._loading = false;
    this._isLoadingData = false; // ← AGGIUNGI QUESTO
    this._initializeDates();
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

  async firstUpdated() {
    await this._detectDevices();
    this._initializeDates();
    await this._loadConsumptionData();
  }

  async updated(changedProperties) {
  }

  _initializeDates() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    this._startDate = this._formatDate(today);
    this._endDate = this._formatDate(today);
    this._comparisonStartDate = this._formatDate(yesterday);
    this._comparisonEndDate = this._formatDate(yesterday);
  }

  _formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  async _detectDevices() {
    if (!this.hass) return;

    const detectedDevices = {};

    // Rilevamento automatico sensori di energia/potenza
    Object.keys(this.hass.states).forEach((entityId) => {
      const state = this.hass.states[entityId];

      if (
        entityId.startsWith('sensor.') &&
        (
          state.attributes.unit_of_measurement === 'kWh' ||
          state.attributes.unit_of_measurement === 'W' ||
          state.attributes.device_class === 'energy' ||
          state.attributes.device_class === 'power' ||
          entityId.includes('energy') ||
          entityId.includes('power') ||
          entityId.includes('consumption')
        )
      ) {
        const deviceId = state.attributes.device_id || entityId;
        const deviceName = state.attributes.friendly_name || entityId;

        if (!detectedDevices[deviceId]) {
          detectedDevices[deviceId] = {
            id: deviceId,
            name: deviceName,
            entities: [],
            icon: 'mdi:lightning-bolt'
          };
        }

        detectedDevices[deviceId].entities.push({
          entity_id: entityId,
          unit: state.attributes.unit_of_measurement,
          type: state.attributes.unit_of_measurement === 'kWh' ? 'energy' : 'power'
        });
      }
    });

    // Entità configurate manualmente
    if (this.config.entities && Array.isArray(this.config.entities)) {
      this.config.entities.forEach((entity) => {
        if (this.hass.states[entity.entity_id]) {
          const state = this.hass.states[entity.entity_id];
          const deviceName = entity.name || state.attributes.friendly_name || entity.entity_id;

          detectedDevices[entity.entity_id] = {
            id: entity.entity_id,
            name: deviceName,
            icon: entity.icon || 'mdi:lightning-bolt',
            entities: [
              {
                entity_id: entity.entity_id,
                unit: state.attributes.unit_of_measurement,
                type: state.attributes.unit_of_measurement === 'kWh' ? 'energy' : 'power'
              }
            ]
          };
        }
      });
    }

    this._devices = Object.values(detectedDevices);

    // Alla fine di _detectDevices(), prima di "this._devices = Object.values(detectedDevices);"
    // Converti sensori power (W) in energy (kWh) se non ci sono sensori energy
    Object.values(detectedDevices).forEach(device => {
      const hasEnergy = device.entities.some(e => e.type === 'energy');
      if (!hasEnergy) {
        // Se ha solo power, convertiamo il tipo per tentare comunque
        device.entities.forEach(e => {
          if (e.type === 'power') {
            console.log(`Conversione ${e.entity_id} da power a energy (approssimazione)`);
            e.type = 'energy'; // Prova comunque a caricare history
          }
        });
      }
    });
    
    this._devices = Object.values(detectedDevices);
    console.log('Dispositivi rilevati:', this._devices);

  }

  // -------- CARICAMENTO DATI STORICI --------

  async _loadConsumptionData() {
  // Previeni chiamate multiple simultanee
  if (this._isLoadingData) {
    console.log('Caricamento già in corso, salto questa chiamata');
    return;
  }

  if (!this.hass || !this._devices || !this._devices.length) {
    console.log('Nessun dispositivo trovato o hass non pronto');
    return;
  }

  this._isLoadingData = true;
  this._loading = true;
  this.requestUpdate();

  this._consumptionData = {};
  this._costData = {};

  try {
    console.log(`Carico dati per ${this._devices.length} dispositivi`);
    
    for (const device of this._devices) {
      for (const entity of device.entities) {
        if (entity.type !== 'energy') {
          console.log(`Salto ${entity.entity_id} - tipo ${entity.type}`);
          continue;
        }

        console.log(`Carico history per ${entity.entity_id}`);

        const currentData = await this._getHistoryData(
          entity.entity_id,
          this._startDate,
          this._endDate
        );

        console.log(`  → Ricevuti ${currentData.length} punti per periodo corrente`);

        const comparisonData = this.config.show_comparison
          ? await this._getHistoryData(
              entity.entity_id,
              this._comparisonStartDate,
              this._comparisonEndDate
            )
          : null;

        if (comparisonData) {
          console.log(`  → Ricevuti ${comparisonData.length} punti per confronto`);
        }

        this._consumptionData[device.id] = {
          current: currentData,
          comparison: comparisonData,
          device: device.name
        };

        if (this.config.show_costs) {
          const kwh = this._calculateTotalConsumption(currentData);
          const comparisonKwh = comparisonData
            ? this._calculateTotalConsumption(comparisonData)
            : 0;

          console.log(`  → Consumo: ${kwh} kWh, Confronto: ${comparisonKwh} kWh`);

          this._costData[device.id] = {
            current: kwh * this.config.price_per_kwh,
            comparison: comparisonKwh * this.config.price_per_kwh,
            kwh,
            comparisonKwh
          };
        }
      }
    }

    console.log('Caricamento dati completato');
  } catch (err) {
    console.error('Errore nel caricamento dati energetici:', err);
  } finally {
    this._loading = false;
    this._isLoadingData = false;
    this.requestUpdate();
  }
}

 async _getHistoryData(entityId, startDate, endDate) {
  try {
    const start = `${startDate}T00:00:00`;
    const end = `${endDate}T23:59:59`;

    console.log(`API call: api/history/period/${start}?end_time=${end}&filter_entity_id=${entityId}`);

    const response = await this.hass.callApi(
      'get',
      `api/history/period/${start}?end_time=${end}&filter_entity_id=${entityId}`
    );

    console.log(`Risposta API per ${entityId}:`, response);

    if (Array.isArray(response) && response.length > 0 && Array.isArray(response[0])) {
      return response[0];
    }
    
    console.warn(`Nessun dato history per ${entityId}`);
    return [];
  } catch (error) {
    console.error(`Errore chiamata API per ${entityId}:`, error);
    return [];
  }
}


  _calculateTotalConsumption(historyData) {
    if (!Array.isArray(historyData) || historyData.length === 0) return 0;

    let total = 0;
    for (let i = 0; i < historyData.length - 1; i++) {
      const current = parseFloat(historyData[i].state) || 0;
      const next = parseFloat(historyData[i + 1].state) || 0;
      if (next >= current) {
        total += next - current;
      }
    }
    return Math.round(total * 100) / 100;
  }

  // -------- GESTIONE PERIODI --------

  _handlePeriodChange(e) {
    this._selectedPeriod = e.target.value;
    this._updateDatesForPeriod();
    this._loadConsumptionData();
  }

  _handleComparisonChange(e) {
    this._comparisonPeriod = e.target.value;
    this._updateComparisonDates();
    this._loadConsumptionData();
  }

  _updateDatesForPeriod() {
    const today = new Date();

    switch (this._selectedPeriod) {
      case 'day': {
        this._startDate = this._formatDate(today);
        this._endDate = this._formatDate(today);
        break;
      }
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        this._startDate = this._formatDate(weekStart);
        this._endDate = this._formatDate(today);
        break;
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this._startDate = this._formatDate(monthStart);
        this._endDate = this._formatDate(today);
        break;
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this._startDate = this._formatDate(yearStart);
        this._endDate = this._formatDate(today);
        break;
      }
      case 'custom':
      default:
        break;
    }
  }

  _updateComparisonDates() {
    const today = new Date();

    switch (this._comparisonPeriod) {
      case 'previous_day': {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        this._comparisonStartDate = this._formatDate(y);
        this._comparisonEndDate = this._formatDate(y);
        break;
      }
      case 'previous_week': {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        this._comparisonStartDate = this._formatDate(lastWeek);
        this._comparisonEndDate = this._formatDate(today);
        break;
      }
      case 'previous_month': {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const mStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const mEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        this._comparisonStartDate = this._formatDate(mStart);
        this._comparisonEndDate = this._formatDate(mEnd);
        break;
      }
      case 'custom':
      default:
        break;
    }
  }

  _handleCustomDate(field, e) {
    const value = e.target.value;
    if (field === 'start') this._startDate = value;
    if (field === 'end') this._endDate = value;
    if (field === 'comparisonStart') this._comparisonStartDate = value;
    if (field === 'comparisonEnd') this._comparisonEndDate = value;
    this._loadConsumptionData();
  }

  _getComparison(currentValue, comparisonValue) {
    if (!comparisonValue) return 0;
    const diff = ((currentValue - comparisonValue) / comparisonValue) * 100;
    return Math.round(diff * 10) / 10;
  }

  _formatCurrency(value) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  // -------- RENDER --------

  render() {
    return html`
      <ha-card>
        <div class="card-header">
          <h1 class="card-title">${this.config.title}</h1>
        </div>

        <div class="card-content">
          ${this._renderPeriodSelector()}
          ${this._loading ? this._renderLoading() : ''}
          <div class="devices-grid">
            ${this._devices.map((device) => this._renderDeviceCard(device))}
          </div>
          ${this._renderSummary()}
        </div>
      </ha-card>
    `;
  }

  _renderPeriodSelector() {
    return html`
      <div class="period-selector">
        <div class="period-row">
          <div class="period-group">
            <label>Periodo:</label>
            <select @change=${this._handlePeriodChange} .value=${this._selectedPeriod}>
              <option value="day">Oggi</option>
              <option value="week">Questa settimana</option>
              <option value="month">Questo mese</option>
              <option value="year">Quest'anno</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          ${this._selectedPeriod === 'custom'
            ? html`
                <div class="period-group">
                  <label>Da:</label>
                  <input
                    type="date"
                    .value=${this._startDate}
                    @change=${(e) => this._handleCustomDate('start', e)}
                  />
                </div>
                <div class="period-group">
                  <label>A:</label>
                  <input
                    type="date"
                    .value=${this._endDate}
                    @change=${(e) => this._handleCustomDate('end', e)}
                  />
                </div>
              `
            : ''}
        </div>

        ${this.config.show_comparison
          ? html`
              <div class="period-row">
                <div class="period-group">
                  <label>Confronta con:</label>
                  <select
                    @change=${this._handleComparisonChange}
                    .value=${this._comparisonPeriod}
                  >
                    <option value="previous_day">Giorno precedente</option>
                    <option value="previous_week">Settimana precedente</option>
                    <option value="previous_month">Mese precedente</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                ${this._comparisonPeriod === 'custom'
                  ? html`
                      <div class="period-group">
                        <label>Da:</label>
                        <input
                          type="date"
                          .value=${this._comparisonStartDate}
                          @change=${(e) =>
                            this._handleCustomDate('comparisonStart', e)}
                        />
                      </div>
                      <div class="period-group">
                        <label>A:</label>
                        <input
                          type="date"
                          .value=${this._comparisonEndDate}
                          @change=${(e) =>
                            this._handleCustomDate('comparisonEnd', e)}
                        />
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="loading">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <span>Caricamento dati...</span>
      </div>
    `;
  }

  _renderDeviceCard(device) {
    const consumption = this._consumptionData[device.id];
    const cost = this._costData[device.id];

    if (!consumption) return '';

    const currentKwh = consumption.current
      ? this._calculateTotalConsumption(consumption.current)
      : 0;
    const comparisonKwh = consumption.comparison
      ? this._calculateTotalConsumption(consumption.comparison)
      : 0;
    const percentageDiff = this._getComparison(currentKwh, comparisonKwh);

    return html`
      <div class="device-card">
        <div class="device-header">
          <ha-icon icon="${device.icon}"></ha-icon>
          <h3>${device.name}</h3>
        </div>

        <div class="device-stats">
          <div class="stat">
            <span class="stat-label">Consumo attuale</span>
            <span class="stat-value">${currentKwh.toFixed(2)} kWh</span>
            ${this.config.show_costs && cost
              ? html`<span class="stat-cost"
                  >${this._formatCurrency(cost.current)}</span
                >`
              : ''}
          </div>

          ${this.config.show_comparison && consumption.comparison
            ? html`
                <div class="stat">
                  <span class="stat-label">Periodo precedente</span>
                  <span class="stat-value">${comparisonKwh.toFixed(2)} kWh</span>
                  ${this.config.show_costs && cost
                    ? html`<span class="stat-cost"
                        >${this._formatCurrency(cost.comparison)}</span
                      >`
                    : ''}
                </div>

                <div class="stat comparison">
                  <span class="stat-label">Variazione</span>
                  <span
                    class="stat-value ${percentageDiff > 0
                      ? 'increase'
                      : 'decrease'}"
                  >
                    ${percentageDiff > 0 ? '+' : ''}${percentageDiff}%
                  </span>
                </div>
              `
            : ''}
        </div>

        <div class="device-chart">
          ${this._renderChart(device.id, currentKwh, comparisonKwh)}
        </div>
      </div>
    `;
  }

  _renderChart(deviceId, current, comparison) {
    const maxValue = Math.max(current, comparison, 1);
    const currentHeight = (current / maxValue) * 100;
    const comparisonHeight = (comparison / maxValue) * 100;

    return html`
      <div class="chart">
        <div class="chart-bar current" style="height: ${currentHeight}%">
          <span>${current.toFixed(1)}</span>
        </div>
        ${this.config.show_comparison
          ? html`
              <div
                class="chart-bar comparison"
                style="height: ${comparisonHeight}%"
              >
                <span>${comparison.toFixed(1)}</span>
              </div>
            `
          : ''}
      </div>
    `;
  }

  _renderSummary() {
    const totalCurrent = Object.values(this._consumptionData).reduce(
      (sum, d) => {
        const kwh = d.current ? this._calculateTotalConsumption(d.current) : 0;
        return sum + kwh;
      },
      0
    );

    const totalComparison = Object.values(this._consumptionData).reduce(
      (sum, d) => {
        const kwh = d.comparison
          ? this._calculateTotalConsumption(d.comparison)
          : 0;
        return sum + kwh;
      },
      0
    );

    const totalCost = totalCurrent * this.config.price_per_kwh;
    const comparisonCost = totalComparison * this.config.price_per_kwh;
    const percentageDiff = this._getComparison(totalCurrent, totalComparison);

    return html`
      <div class="summary">
        <h2>Riepilogo totale</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Consumo totale</span>
            <span class="summary-value">${totalCurrent.toFixed(2)} kWh</span>
            ${this.config.show_costs
              ? html`<span class="summary-cost"
                  >${this._formatCurrency(totalCost)}</span
                >`
              : ''}
          </div>

          ${this.config.show_comparison
            ? html`
                <div class="summary-item">
                  <span class="summary-label">Periodo precedente</span>
                  <span class="summary-value"
                    >${totalComparison.toFixed(2)} kWh</span
                  >
                  ${this.config.show_costs
                    ? html`<span class="summary-cost"
                        >${this._formatCurrency(comparisonCost)}</span
                      >`
                    : ''}
                </div>

                <div class="summary-item comparison">
                  <span class="summary-label">Variazione</span>
                  <span
                    class="summary-value ${percentageDiff > 0
                      ? 'increase'
                      : 'decrease'}"
                  >
                    ${percentageDiff > 0 ? '+' : ''}${percentageDiff}%
                  </span>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        --primary-color: #2196f3;
        --success-color: #4caf50;
        --warning-color: #ff9800;
        --error-color: #f44336;
        --text-primary: #212121;
        --text-secondary: #757575;
        --bg-primary: #fafafa;
        --bg-secondary: #ffffff;
        --border-color: #e0e0e0;
      }

      ha-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-radius: 12px;
        overflow: hidden;
      }

      .card-header {
        background: linear-gradient(135deg, var(--primary-color), #1976d2);
        color: white;
        padding: 20px;
      }

      .card-title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }

      .card-content {
        padding: 20px;
        background: var(--bg-primary);
      }

      .period-selector {
        background: var(--bg-secondary);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid var(--border-color);
      }

      .period-row {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
        flex-wrap: wrap;
        align-items: flex-end;
      }

      .period-row:last-child {
        margin-bottom: 0;
      }

      .period-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .period-group label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
      }

      .period-group select,
      .period-group input {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 14px;
        background: var(--bg-primary);
        color: var(--text-primary);
        cursor: pointer;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 30px;
        color: var(--text-secondary);
      }

      .devices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .device-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px;
      }

      .device-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 10px;
      }

      .device-header ha-icon {
        color: var(--primary-color);
        width: 24px;
        height: 24px;
      }

      .device-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .device-stats {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        margin-bottom: 15px;
      }

      .stat {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 10px;
        background: var(--bg-primary);
        border-radius: 6px;
        border-left: 3px solid var(--primary-color);
      }

      .stat.comparison {
        border-left-color: var(--warning-color);
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .stat-value.increase {
        color: var(--error-color);
      }

      .stat-value.decrease {
        color: var(--success-color);
      }

      .stat-cost {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .device-chart {
        height: 150px;
        background: var(--bg-primary);
        border-radius: 6px;
        padding: 10px;
      }

      .chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 100%;
        gap: 10px;
      }

      .chart-bar {
        flex: 1;
        background: linear-gradient(180deg, var(--primary-color), #1976d2);
        border-radius: 6px 6px 0 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 5px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        min-height: 20px;
      }

      .chart-bar.comparison {
        background: linear-gradient(180deg, var(--warning-color), #f57c00);
        opacity: 0.7;
      }

      .summary {
        background: linear-gradient(135deg, var(--primary-color), #1976d2);
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
      }

      .summary h2 {
        margin: 0 0 15px 0;
        font-size: 18px;
        font-weight: 600;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 5px;
        background: rgba(255, 255, 255, 0.15);
        padding: 15px;
        border-radius: 6px;
        border-left: 3px solid rgba(255, 255, 255, 0.5);
      }

      .summary-item.comparison {
        border-left-color: var(--warning-color);
      }

      .summary-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        opacity: 0.9;
      }

      .summary-value {
        font-size: 20px;
        font-weight: 700;
      }

      .summary-value.increase {
        color: var(--error-color);
      }

      .summary-value.decrease {
        color: var(--success-color);
      }

      .summary-cost {
        font-size: 12px;
        font-weight: 600;
        opacity: 0.9;
      }

      @media (max-width: 768px) {
        .devices-grid {
          grid-template-columns: 1fr;
        }

        .device-stats {
          grid-template-columns: 1fr;
        }

        .period-row {
          flex-direction: column;
          align-items: stretch;
        }

        .period-group select,
        .period-group input {
          width: 100%;
        }

        .summary-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-color-scheme: dark) {
        :host {
          --text-primary: #ffffff;
          --text-secondary: #bdbdbd;
          --bg-primary: #121212;
          --bg-secondary: #1e1e1e;
          --border-color: #333333;
        }

        .period-group select,
        .period-group input {
          background: #2a2a2a;
          color: #ffffff;
          border-color: #404040;
        }
      }
    `;
  }
}

customElements.define('energy-monitor-card', EnergyMonitorCard);
