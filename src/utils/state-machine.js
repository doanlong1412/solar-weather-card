/**
 * State machine constants and detectors for energy flow states.
 *
 * Sign conventions (default — can be inverted per entity via config):
 *   Grid:    positive = importing from grid,  negative = exporting to grid
 *   Battery: positive = discharging,          negative = charging
 *   Solar:   always positive (production)
 */

export const BatteryStatus = /** @type {const} */ ({
  UNKNOWN:     'unknown',
  IDLE:        'idle',
  CHARGING:    'charging',
  DISCHARGING: 'discharging',
});

export const GridStatus = /** @type {const} */ ({
  IDLE:      'idle',
  IMPORTING: 'importing',
  EXPORTING: 'exporting',
});

export const FlowStatus = /** @type {const} */ ({
  IDLE:   'idle',
  ACTIVE: 'active',
});

/**
 * @param {number|null} powerW
 * @param {number} [threshold=5]
 * @returns {keyof typeof BatteryStatus}
 */
export function getBatteryStatus(powerW, threshold = 5) {
  if (powerW === null) return BatteryStatus.UNKNOWN;
  if (powerW >  threshold) return BatteryStatus.DISCHARGING;
  if (powerW < -threshold) return BatteryStatus.CHARGING;
  return BatteryStatus.IDLE;
}

/**
 * @param {number|null} powerW - positive = importing
 * @param {number} [threshold=5]
 * @returns {keyof typeof GridStatus}
 */
export function getGridStatus(powerW, threshold = 5) {
  if (powerW === null || Math.abs(powerW) < threshold) return GridStatus.IDLE;
  return powerW > 0 ? GridStatus.IMPORTING : GridStatus.EXPORTING;
}

/**
 * @param {number|null} powerW
 * @param {number} [threshold=5]
 * @returns {keyof typeof FlowStatus}
 */
export function getFlowStatus(powerW, threshold = 5) {
  if (powerW === null || Math.abs(powerW) < threshold) return FlowStatus.IDLE;
  return FlowStatus.ACTIVE;
}

/** Node accent colors keyed by state */
export const BATTERY_COLORS = {
  [BatteryStatus.UNKNOWN]:     '#888888',
  [BatteryStatus.IDLE]:        '#90a4ae',
  [BatteryStatus.CHARGING]:    '#ff9800',
  [BatteryStatus.DISCHARGING]: '#4caf50',
};

export const GRID_COLORS = {
  [GridStatus.IDLE]:      '#546e7a',
  [GridStatus.IMPORTING]: '#ef5350',
  [GridStatus.EXPORTING]: '#26a69a',
};

/** Human-readable status labels */
export const BATTERY_LABELS = {
  [BatteryStatus.UNKNOWN]:     '?',
  [BatteryStatus.IDLE]:        'Idle',
  [BatteryStatus.CHARGING]:    'Charging',
  [BatteryStatus.DISCHARGING]: 'Discharging',
};

export const GRID_LABELS = {
  [GridStatus.IDLE]:      'Grid',
  [GridStatus.IMPORTING]: 'Importing',
  [GridStatus.EXPORTING]: 'Exporting',
};
