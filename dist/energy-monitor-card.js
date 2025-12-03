import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0?module';

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
    this._isLoadingData = false;
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

    Object.keys(this.hass.states).forEach((entityId) => {
      const state = this.hass.states[entityId];

      // SKIP sensori _cost, _power, cerchiamo solo _energy puri
      if (entityId.includes('_cost') || entityId.includes('_price')) {
        return;
      }

      if (
        entityId.startsWith('sensor.') &&
        (
          state.attributes.unit_of_measurement === 'kWh' ||
          state.attributes.device_class === 'energy' ||
          (entityId.includes('energy') && !entityId.includes('power'))
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
          type: 'energy'
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
                type: 'energy'
              }
            ]
          };
        }
      });
    }

    this._devices = Object.values(detectedDevices);
    console.log('✓ Dispositivi rilevati:', this._devices);
  }

  async _loadConsumptionData() {
    if (this._isLoadingData) {
      console.log('⏭ Caricamento già in corso, skip');
      return;
    }

    if (!this.hass || !this._devices || !this._devices.length) {
      console.log('⚠ Nessun dispositivo o hass non pronto');
      return;
    }

    this._isLoadingData = true;
    this._loading = true;
    this.requestUpdate();

    this._consumptionData = {};
    this._costData = {};

    try {
      console.log(`📊 Carico dati per ${this._devices.length} dispositivi`);

      for (const device of this._devices) {
        for (const entity of device.entities) {
          console.log(`📈 Carico: ${entity.entity_id}`);

          const currentData = await this._getHistoryData(
            entity.entity_id,
            this._startDate,
            this._endDate
          );

          const comparisonData = this.config.show_comparison
            ? await this._getHistoryData(
                entity.entity_id,
                this._comparisonStartDate,
                this._comparisonEndDate
              )
            : null;

          this._consumptionData[device.id] = {
            current: currentData,
            comparison: comparisonData,
            device: device.name
          };

          if (this.config.show_costs) {
            const kwh = this._calculateTotalConsumption(currentData);
            const comparisonKwh = comparisonData
              ? this._calculateTotalCons
