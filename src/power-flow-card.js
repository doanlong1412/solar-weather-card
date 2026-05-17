import { LitElement, html, css, svg, nothing } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { detectEnergyEntities } from './utils/entity-detector.js';
import { fromState, getUnit, toWatts, formatPower } from './utils/unit-helpers.js';
import {
  getBatteryStatus, getGridStatus, getFlowStatus,
  BATTERY_COLORS, GRID_COLORS, BATTERY_LABELS, GRID_LABELS,
  BatteryStatus, GridStatus, FlowStatus,
} from './utils/state-machine.js';
import './editor.js';

// ── SVG layout constants ─────────────────────────────────────────────────────

const VB = { W: 500, H: 500 };

const NODES = {
  solar:   { x: 250, y:  72, r: 52, defaultColor: '#fdd835', label: 'Solar'   },
  grid:    { x:  72, y: 225, r: 52, defaultColor: '#42a5f5', label: 'Grid'    },
  house:   { x: 250, y: 282, r: 52, defaultColor: '#ff9800', label: 'House'   },
  battery: { x: 428, y: 225, r: 52, defaultColor: '#66bb6a', label: 'Battery' },
};

// Bezier paths connecting node edges (computed from NODES geometry)
function pathSolarHouse() {
  const s = NODES.solar, h = NODES.house;
  return `M ${s.x},${s.y + s.r} C ${s.x},${s.y + 155} ${h.x},${h.y - 155} ${h.x},${h.y - h.r}`;
}
function pathGridHouse() {
  const g = NODES.grid, h = NODES.house;
  return `M ${g.x + g.r},${g.y} C ${168},${g.y} ${h.x - 90},${h.y} ${h.x - h.r},${h.y}`;
}
function pathBatteryHouse() {
  const b = NODES.battery, h = NODES.house;
  return `M ${b.x - b.r},${b.y} C ${332},${b.y} ${h.x + 90},${h.y} ${h.x + h.r},${h.y}`;
}
function pathHouseCustom(tx, ty) {
  const h = NODES.house;
  return `M ${h.x},${h.y + h.r} C ${h.x},${h.y + 105} ${tx},${ty - 55} ${tx},${ty}`;
}

// Row of custom sensor node positions
function customNodePositions(count) {
  const y  = 430;
  const spacing = Math.min(130, 420 / Math.max(count, 1));
  const totalW  = (count - 1) * spacing;
  const startX  = VB.W / 2 - totalW / 2;
  return Array.from({ length: count }, (_, i) => ({ x: startX + i * spacing, y }));
}

// ── CSS animations for flow lines ────────────────────────────────────────────

const FLOW_DASH = '14 46';
const FLOW_TOTAL = 60; // dashLen + gapLen

// ── Main card class ──────────────────────────────────────────────────────────

class PowerFlowCard extends LitElement {
  static properties = {
    hass:              { attribute: false },
    _config:           { state: true },
    _detectedEntities: { state: true },
  };

  static styles = css`
    :host { display: block; }

    ha-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      padding: 14px 16px 0;
      font-size: 1.05em;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .svg-wrap {
      flex: 1;
      padding: 10px 12px 12px;
    }

    svg.flow-svg {
      display: block;
      width: 100%;
      height: auto;
    }

    .diagnostics {
      margin: 0 12px 12px;
      padding: 8px 10px;
      font-size: 0.72em;
      line-height: 1.5;
      font-family: monospace;
      color: var(--secondary-text-color);
      background: var(--secondary-background-color, #1e1e2e);
      border-radius: 6px;
    }

    @keyframes flow-fwd {
      from { stroke-dashoffset: ${FLOW_TOTAL}; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes flow-rev {
      from { stroke-dashoffset: -${FLOW_TOTAL}; }
      to   { stroke-dashoffset: 0; }
    }
  `;

  // ── HA card protocol ────────────────────────────────────────────────────────

  static getConfigElement() {
    return document.createElement('power-flow-card-editor');
  }

  static getStubConfig() {
    return {
      auto_detect:          true,
      low_power_threshold:  5,
      solar_invert:         false,
      grid_invert:          false,
      battery_invert:       false,
    };
  }

  static getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 5, min_rows: 4 };
  }

  getCardSize() { return 5; }

  // ── Config ─────────────────────────────────────────────────────────────────

  setConfig(config) {
    this._config           = { ...config };
    this._detectedEntities = null; // invalidate on config change
  }

  // ── Entity resolution ───────────────────────────────────────────────────────

  /** Returns the entity ID for a given role, preferring explicit config over auto-detection. */
  _entityId(role) {
    const cfg = this._config;
    const explicit = {
      solar:         cfg.solar_entity,
      grid:          cfg.grid_entity,
      battery_power: cfg.battery_power_entity,
      battery_level: cfg.battery_level_entity,
      house:         cfg.house_entity,
    }[role];
    if (explicit) return explicit;
    if (cfg.auto_detect !== false && this._detectedEntities) {
      return this._detectedEntities[role] ?? null;
    }
    return null;
  }

  /** Reads and converts a power sensor to Watts (null if unavailable). */
  _readW(role) {
    const id = this._entityId(role);
    if (!id || !this.hass) return null;
    const state  = this.hass.states[id];
    const raw    = fromState(state);
    if (raw === null) return null;
    const watts  = toWatts(raw, getUnit(state));
    const invert = this._config[`${role}_invert`];
    return invert ? -(watts ?? 0) : (watts ?? 0);
  }

  /** Reads a level sensor (e.g. battery %) as a raw float. */
  _readLevel(role) {
    const id = this._entityId(role);
    if (!id || !this.hass) return null;
    return fromState(this.hass.states[id]);
  }

  /**
   * House consumption: use configured/detected sensor if available,
   * otherwise calculate from the energy balance equation:
   *   house = solar + grid(import) - battery(charging)
   */
  _houseW(solarW, gridW, battW) {
    const direct = this._readW('house');
    if (direct !== null) return direct;
    return Math.max(0, (solarW ?? 0) + (gridW ?? 0) - Math.min(0, battW ?? 0) * -1);
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  updated(changed) {
    if (changed.has('hass') && this.hass && !this._detectedEntities) {
      if (this._config?.auto_detect !== false) {
        this._detectedEntities = detectEnergyEntities(this.hass);
      }
    }
  }

  // ── More-info dispatch ──────────────────────────────────────────────────────

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } }),
    );
  }

  // ── SVG helpers ─────────────────────────────────────────────────────────────

  /**
   * Renders a bezier flow line between two nodes.
   * - Inactive (below threshold): faint dashed grey line
   * - Active: animated colour stroke; speed and width scale with wattage
   *
   * @param {string}  pathD     - SVG path data
   * @param {boolean} active    - whether flow is active
   * @param {string}  color     - stroke colour
   * @param {number}  watts     - current power (absolute, used for scaling)
   * @param {boolean} [reverse] - animate in reverse direction (e.g. exporting)
   */
  _flowLine(pathD, active, color, watts, reverse = false) {
    const threshold = this._config.low_power_threshold ?? 5;
    const absW = Math.abs(watts ?? 0);

    if (!active || absW < threshold) {
      return svg`
        <path d=${pathD}
          fill="none" stroke="#333a4a" stroke-width="2"
          stroke-dasharray="4 8" opacity="0.45"/>
      `;
    }

    // Speed: slower at low wattage, faster at high — clamp between 0.5s and 3s
    const speed = Math.max(0.5, Math.min(3, 3500 / absW)).toFixed(2);
    // Width: thin at low wattage, up to 4px at high
    const width = Math.min(4, 1.5 + absW / 2500).toFixed(1);
    const anim  = reverse ? 'flow-rev' : 'flow-fwd';

    return svg`
      <!-- glow halo -->
      <path d=${pathD}
        fill="none"
        stroke=${color}
        stroke-width=${parseFloat(width) + 5}
        stroke-linecap="round"
        opacity="0.15"/>
      <!-- animated dash -->
      <path d=${pathD}
        fill="none"
        stroke=${color}
        stroke-width=${width}
        stroke-dasharray=${FLOW_DASH}
        stroke-linecap="round"
        style=${styleMap({
          animationName:            anim,
          animationDuration:        `${speed}s`,
          animationTimingFunction:  'linear',
          animationIterationCount:  'infinite',
        })}/>
    `;
  }

  /**
   * Renders a standard circular node.
   *
   * @param {'solar'|'grid'|'house'|'battery'} role
   * @param {string}      label
   * @param {string}      value       - formatted text (e.g. "1.4 kW")
   * @param {string}      color       - accent colour
   * @param {boolean}     missing     - true if entity not configured/detected
   * @param {string|null} entityId    - for click-to-more-info
   * @param {*}           [extra]     - additional SVG to render inside circle (e.g. SOC arc)
   */
  _node(role, label, value, color, missing, entityId, extra = nothing) {
    const { x, y, r } = NODES[role];
    const stroke = missing ? '#404858' : color;
    const textFill = missing ? '#525a6a' : '#ffffff';

    return svg`
      <g style="cursor: ${entityId ? 'pointer' : 'default'}"
         @click=${() => this._moreInfo(entityId)}>
        <!-- outer glow -->
        <circle cx=${x} cy=${y} r=${r + 8}
          fill=${stroke} opacity="0.08"
          filter="url(#pfc-glow)"/>
        <!-- background disc -->
        <circle cx=${x} cy=${y} r=${r}
          fill="#0d1117" stroke=${stroke} stroke-width="2.5"/>
        ${extra}
        <!-- value text -->
        <text x=${x} y=${y - 9}
          text-anchor="middle" dominant-baseline="auto"
          fill=${textFill} font-size="15" font-weight="700"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${missing ? '—' : value}
        </text>
        <!-- label text -->
        <text x=${x} y=${y + 11}
          text-anchor="middle" dominant-baseline="auto"
          fill=${missing ? '#414a5a' : stroke}
          font-size="11.5"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${missing ? 'Not set' : label}
        </text>
      </g>
    `;
  }

  /** Battery node with SOC arc fill indicator. */
  _batteryNode(battW, battLevel, battEntityId) {
    const status = getBatteryStatus(battW, this._config.low_power_threshold ?? 5);
    const color  = BATTERY_COLORS[status];
    const { x, y, r } = NODES.battery;

    // Arc representing state-of-charge
    const arcR       = r - 8;
    const circumf    = 2 * Math.PI * arcR;
    const pct        = Math.max(0, Math.min(100, battLevel ?? 0));
    const filled     = (circumf * pct / 100).toFixed(1);
    const remaining  = (circumf - parseFloat(filled)).toFixed(1);

    const arcColor = pct > 50 ? '#4caf50' : pct > 20 ? '#ff9800' : '#ef5350';

    const socArc = svg`
      <!-- track -->
      <circle cx=${x} cy=${y} r=${arcR}
        fill="none" stroke="#1e2535" stroke-width="5.5"/>
      <!-- fill -->
      <circle cx=${x} cy=${y} r=${arcR}
        fill="none" stroke=${arcColor} stroke-width="5.5"
        stroke-dasharray="${filled} ${remaining}"
        stroke-dashoffset="${(circumf * 0.25).toFixed(1)}"
        transform="rotate(-90 ${x} ${y})"
        style="transition: stroke-dasharray 0.6s ease, stroke 0.6s ease"/>
    `;

    const valueStr = battLevel !== null ? `${Math.round(pct)}%` : '—';

    return svg`
      <g style="cursor: ${battEntityId ? 'pointer' : 'default'}"
         @click=${() => this._moreInfo(battEntityId)}>
        <circle cx=${x} cy=${y} r=${r + 8} fill=${color} opacity="0.08" filter="url(#pfc-glow)"/>
        <circle cx=${x} cy=${y} r=${r}     fill="#0d1117" stroke=${color} stroke-width="2.5"/>
        ${socArc}
        <!-- SOC % -->
        <text x=${x} y=${y - 7}
          text-anchor="middle"
          fill="#ffffff" font-size="16" font-weight="800"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${valueStr}
        </text>
        <!-- status label -->
        <text x=${x} y=${y + 10}
          text-anchor="middle"
          fill=${color} font-size="10.5"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${BATTERY_LABELS[status]}
        </text>
        <!-- power below status -->
        <text x=${x} y=${y + 23}
          text-anchor="middle"
          fill="rgba(255,255,255,0.55)" font-size="10"
          font-family="var(--primary-font-family, system-ui, sans-serif)">
          ${battW !== null ? formatPower(Math.abs(battW)) : ''}
        </text>
      </g>
    `;
  }

  /** Custom sensor nodes + their flow paths from the house node. */
  _customNodes() {
    const sensors = this._config.custom_sensors;
    if (!sensors?.length) return nothing;

    const positions = customNodePositions(sensors.length);
    const threshold = this._config.low_power_threshold ?? 5;

    return sensors.map((sensor, i) => {
      const pos      = positions[i];
      const entityId = sensor.entity;
      const state    = entityId && this.hass?.states[entityId];
      const raw      = fromState(state);
      const w        = raw !== null ? toWatts(raw, getUnit(state)) : null;
      const absW     = Math.abs(w ?? 0);
      const active   = w !== null && absW >= threshold;
      const color    = sensor.color ?? '#ab47bc';
      const pathD    = pathHouseCustom(pos.x, pos.y);
      const r        = 36;

      return svg`
        ${this._flowLine(pathD, active, color, w ?? 0)}
        <g style="cursor: ${entityId ? 'pointer' : 'default'}"
           @click=${() => this._moreInfo(entityId)}>
          <circle cx=${pos.x} cy=${pos.y} r=${r}
            fill="#0d1117" stroke=${color} stroke-width="2"/>
          <text x=${pos.x} y=${pos.y - 6}
            text-anchor="middle"
            fill="#ffffff" font-size="11.5" font-weight="700"
            font-family="var(--primary-font-family, system-ui, sans-serif)">
            ${w !== null ? formatPower(w) : '—'}
          </text>
          <text x=${pos.x} y=${pos.y + 9}
            text-anchor="middle"
            fill=${color} font-size="10"
            font-family="var(--primary-font-family, system-ui, sans-serif)">
            ${sensor.name ?? entityId ?? '?'}
          </text>
        </g>
      `;
    });
  }

  // ── Diagnostics panel ───────────────────────────────────────────────────────

  _diagnosticsPanel(solarW, gridW, battW, houseW) {
    const d = this._detectedEntities ?? {};
    const cfg = this._config;
    const rows = [
      ['Role',    'Detected',             'Config override',            'Value (W)'],
      ['Solar',   d.solar  ?? '—',        cfg.solar_entity   ?? '—',   solarW   ?? '—'],
      ['Grid',    d.grid   ?? '—',        cfg.grid_entity    ?? '—',   gridW    ?? '—'],
      ['Battery', d.battery_power ?? '—', cfg.battery_power_entity ?? '—', battW ?? '—'],
      ['House',   d.house  ?? '—',        cfg.house_entity   ?? '—',   houseW  ?? '—'],
    ];
    return html`
      <div class="diagnostics">
        ${rows.map((r, i) => html`
          <div style="display:grid;grid-template-columns:60px 1fr 1fr 55px;gap:4px;
                      opacity:${i === 0 ? '0.55' : '1'};
                      font-weight:${i === 0 ? '600' : '400'}">
            ${r.map(c => html`<span>${c}</span>`)}
          </div>
        `)}
      </div>
    `;
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  render() {
    if (!this._config) return html`<ha-card>No configuration.</ha-card>`;

    const threshold = this._config.low_power_threshold ?? 5;

    // --- Read all power values ---
    const solarW   = this._readW('solar');
    const gridW    = this._readW('grid');
    const battW    = this._readW('battery_power');
    const battLvl  = this._readLevel('battery_level');
    const houseW   = this._houseW(solarW, gridW, battW);

    // --- State detection ---
    const gridStatus  = getGridStatus(gridW, threshold);
    const battStatus  = getBatteryStatus(battW, threshold);
    const solarActive = getFlowStatus(solarW, threshold) === FlowStatus.ACTIVE;
    const gridActive  = gridStatus !== GridStatus.IDLE;
    const battActive  = battStatus !== BatteryStatus.IDLE && battStatus !== BatteryStatus.UNKNOWN;

    const gridColor = GRID_COLORS[gridStatus];
    const battColor = BATTERY_COLORS[battStatus];
    const solarColor = NODES.solar.defaultColor;
    const houseColor = NODES.house.defaultColor;

    // Grid: reverse direction when exporting
    const gridReverse = gridStatus === GridStatus.EXPORTING;
    // Battery: reverse direction when charging
    const battReverse = battStatus === BatteryStatus.CHARGING;

    // --- Entity IDs (for click-to-more-info) ---
    const solarId   = this._entityId('solar');
    const gridId    = this._entityId('grid');
    const battId    = this._entityId('battery_power') ?? this._entityId('battery_level');
    const hasBatt   = !!(battId || this._entityId('battery_level'));

    // --- VB height: extend if custom sensors present ---
    const customSensors = this._config.custom_sensors ?? [];
    const vbH = customSensors.length > 0 ? 480 : 380;

    return html`
      <ha-card>
        ${this._config.title
          ? html`<div class="card-header">${this._config.title}</div>`
          : nothing}

        <div class="svg-wrap">
          <svg class="flow-svg"
            viewBox="0 0 ${VB.W} ${vbH}"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Energy flow diagram">

            <!-- Shared defs -->
            <defs>
              <filter id="pfc-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Background -->
            <rect width=${VB.W} height=${vbH} fill="#0d1117" rx="14"/>

            <!-- ── Flow lines (behind nodes) ── -->
            ${this._flowLine(pathSolarHouse(),   solarActive, solarColor, solarW ?? 0, false)}
            ${this._flowLine(pathGridHouse(),    gridActive,  gridColor,  gridW  ?? 0, gridReverse)}
            ${this._flowLine(pathBatteryHouse(), battActive,  battColor,  battW  ?? 0, battReverse)}
            ${this._customNodes()}

            <!-- ── Nodes ── -->

            <!-- Solar -->
            ${this._node(
              'solar',
              'Solar',
              formatPower(solarW ?? 0),
              solarColor,
              !solarId,
              solarId,
            )}

            <!-- Grid -->
            ${this._node(
              'grid',
              GRID_LABELS[gridStatus],
              formatPower(Math.abs(gridW ?? 0)),
              gridColor,
              !gridId,
              gridId,
            )}

            <!-- House (no entity click — shows calculated value) -->
            ${this._node(
              'house',
              'House',
              formatPower(houseW),
              houseColor,
              false,
              this._entityId('house'),
            )}

            <!-- Battery -->
            ${hasBatt
              ? this._batteryNode(battW, battLvl, battId)
              : this._node('battery', 'Battery', '—', NODES.battery.defaultColor, true, null)}

          </svg>
        </div>

        ${this._config.show_diagnostics
          ? this._diagnosticsPanel(solarW, gridW, battW, houseW)
          : nothing}
      </ha-card>
    `;
  }
}

customElements.define('power-flow-card', PowerFlowCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'power-flow-card',
  name:             'Power Flow Card',
  description:      'Animated energy flow — Solar, Grid, Battery, House — with auto-detection, custom sensors, and battery SOC arc.',
  preview:          true,
  documentationURL: 'https://github.com/ajit-thapa/solar-weather-card',
});
