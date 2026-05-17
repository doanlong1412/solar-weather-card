import { LitElement, html, css } from 'lit';

/**
 * ha-form schema for the visual config editor.
 * Uses HA's built-in form system (available in HA 2022.6+).
 */
const SCHEMA = [
  {
    name: 'title',
    selector: { text: {} },
    label: 'Card title',
  },
  {
    name: 'auto_detect',
    selector: { boolean: {} },
    label: 'Auto-detect entities from sensor names',
    description: 'Falls back to auto-detection when an entity is not explicitly set below.',
  },
  {
    name: '',
    type: 'expandable',
    title: 'Entities',
    schema: [
      {
        name: 'solar_entity',
        selector: { entity: { domain: 'sensor', device_class: 'power' } },
        label: 'Solar / PV power',
      },
      {
        name: 'grid_entity',
        selector: { entity: { domain: 'sensor', device_class: 'power' } },
        label: 'Grid power (positive = importing)',
      },
      {
        name: 'battery_power_entity',
        selector: { entity: { domain: 'sensor', device_class: 'power' } },
        label: 'Battery power (positive = discharging)',
      },
      {
        name: 'battery_level_entity',
        selector: { entity: { domain: 'sensor', device_class: 'battery' } },
        label: 'Battery level (%)',
      },
      {
        name: 'house_entity',
        selector: { entity: { domain: 'sensor', device_class: 'power' } },
        label: 'House consumption (calculated if omitted)',
      },
    ],
  },
  {
    name: '',
    type: 'expandable',
    title: 'Sign convention',
    schema: [
      {
        name: 'solar_invert',
        selector: { boolean: {} },
        label: 'Invert solar sign',
      },
      {
        name: 'grid_invert',
        selector: { boolean: {} },
        label: 'Invert grid sign (positive = exporting)',
      },
      {
        name: 'battery_invert',
        selector: { boolean: {} },
        label: 'Invert battery sign (positive = charging)',
      },
    ],
  },
  {
    name: '',
    type: 'expandable',
    title: 'Display',
    schema: [
      {
        name: 'low_power_threshold',
        selector: {
          number: { min: 0, max: 500, step: 5, unit_of_measurement: 'W', mode: 'slider' },
        },
        label: 'Low-power threshold — flow line hidden below this',
      },
      {
        name: 'show_diagnostics',
        selector: { boolean: {} },
        label: 'Show diagnostics panel (debug)',
      },
    ],
  },
];

class PowerFlowCardEditor extends LitElement {
  static properties = {
    hass:    { attribute: false },
    _config: { state: true },
  };

  static styles = css`
    :host { display: block; }
  `;

  setConfig(config) {
    this._config = { ...config };
  }

  _valueChanged(ev) {
    ev.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('config-changed', { detail: { config: ev.detail.value } }),
    );
  }

  render() {
    if (!this._config || !this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${(s) => s.label ?? s.name}
        .computeHelper=${(s) => s.description ?? ''}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}

customElements.define('power-flow-card-editor', PowerFlowCardEditor);
