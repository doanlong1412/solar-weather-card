/**
 * Returns null if the state is missing, unavailable, or non-numeric.
 * Otherwise returns the raw numeric value.
 */
export function fromState(state) {
  if (!state || state.state === 'unavailable' || state.state === 'unknown') return null;
  const v = parseFloat(state.state);
  return isNaN(v) ? null : v;
}

/**
 * Returns the unit_of_measurement attribute, or '' if absent.
 */
export function getUnit(state) {
  return (state?.attributes?.unit_of_measurement ?? '').trim();
}

/**
 * Converts a sensor reading to Watts for internal calculations.
 * Handles both auto-detection from sensor attributes and explicit overrides.
 *
 * @param {number|null} value - Raw sensor value
 * @param {string} unit - unit_of_measurement from sensor attributes
 * @param {'auto'|'W'|'kW'} [unitOverride='auto'] - User-configured unit override
 */
export function toWatts(value, unit, unitOverride = 'auto') {
  if (value === null || value === undefined) return null;

  const isKw = unit === 'kW' || unit === 'kilowatt';
  const isW  = unit === 'W'  || unit === 'watt' || unit === '';

  if (unitOverride === 'kW') {
    // User says sensor is in kW regardless of attribute
    return value * 1000;
  }
  if (unitOverride === 'W') {
    // User says sensor is in W regardless of attribute
    return value;
  }
  // auto: trust the unit_of_measurement attribute
  if (isKw) return value * 1000;
  return value; // W or unknown — treat as W
}

/**
 * Formats a wattage for display.
 * Under 1000W → "123 W", over → "1.2 kW".
 *
 * @param {number|null} watts
 */
export function formatPower(watts) {
  if (watts === null || watts === undefined) return '—';
  const abs = Math.abs(watts);
  if (abs >= 1000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${Math.round(watts)} W`;
}

/**
 * Formats an energy value (kWh) for display.
 *
 * @param {number|null} kwh
 */
export function formatEnergy(kwh) {
  if (kwh === null || kwh === undefined) return '—';
  if (kwh >= 100) return `${Math.round(kwh)} kWh`;
  return `${kwh.toFixed(1)} kWh`;
}
