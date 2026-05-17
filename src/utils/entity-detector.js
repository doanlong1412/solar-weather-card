/**
 * Heuristic entity auto-detection for common energy setups.
 *
 * Scans hass.states for sensors that match known keywords and device classes,
 * scores each candidate, and returns the highest-scoring match per role.
 *
 * This is entirely frontend-based — no filesystem or backend access.
 * Users can override any detected entity via explicit config.
 */

const KEYWORDS = {
  solar:         ['solar', 'pv', 'photovoltaic', 'panel', 'array'],
  grid:          ['grid', 'mains', 'utility', 'meter', 'import', 'export', 'network', 'feed'],
  battery_power: ['battery', 'batt', 'storage', 'accumulator'],
  battery_level: ['battery', 'batt', 'soc', 'state_of_charge', 'level'],
  house:         ['house', 'home', 'consumption', 'load', 'household', 'demand'],
};

const POWER_UNITS  = new Set(['W', 'kW', 'watt', 'kilowatt']);
const BATTERY_UNITS = new Set(['%']);

function score(entityId, friendlyName = '', keywords) {
  const text = `${entityId} ${friendlyName}`.toLowerCase();
  return keywords.reduce((n, kw) => n + (text.includes(kw) ? 1 : 0), 0);
}

function best(candidates) {
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.score - a.score)[0].entityId;
}

/**
 * Scans hass.states and returns the best-guess entity IDs for each energy role.
 *
 * @param {import('../types').Hass} hass
 * @returns {{ solar, grid, battery_power, battery_level, house }}
 */
export function detectEnergyEntities(hass) {
  const buckets = {
    solar:         [],
    grid:          [],
    battery_power: [],
    battery_level: [],
    house:         [],
  };

  for (const [entityId, state] of Object.entries(hass.states)) {
    if (!entityId.startsWith('sensor.')) continue;

    const attrs       = state.attributes ?? {};
    const dc          = attrs.device_class ?? '';
    const unit        = (attrs.unit_of_measurement ?? '').trim();
    const friendlyName = attrs.friendly_name ?? '';

    const isPower   = dc === 'power'   || POWER_UNITS.has(unit);
    const isBattery = dc === 'battery' || BATTERY_UNITS.has(unit);

    if (isPower) {
      for (const role of ['solar', 'grid', 'battery_power', 'house']) {
        const s = score(entityId, friendlyName, KEYWORDS[role]);
        if (s > 0) buckets[role].push({ entityId, score: s });
      }
    }

    if (isBattery) {
      const s = score(entityId, friendlyName, KEYWORDS.battery_level);
      if (s > 0) buckets.battery_level.push({ entityId, score: s });
    }
  }

  return {
    solar:         best(buckets.solar),
    grid:          best(buckets.grid),
    battery_power: best(buckets.battery_power),
    battery_level: best(buckets.battery_level),
    house:         best(buckets.house),
  };
}
