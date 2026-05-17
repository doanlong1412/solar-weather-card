# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New **Power Flow Card** architecture built from scratch
- **Lit 3** reactive web component — zero manual DOM manipulation
- **SVG rendering engine** with bezier flow paths between nodes
- **Entity auto-detection** via `hass.states` — heuristic keyword + device_class matching
- **ha-form config editor** with entity pickers and grouped sections
- **State machine** for grid (importing/exporting/idle) and battery (charging/discharging/idle/unknown)
- **Battery SOC arc** — circular fill indicator colour-coded green/amber/red
- **Animated flow lines** — CSS keyframe `stroke-dashoffset` driven by `animation-duration` scaled to wattage
- **Reverse-direction animation** for grid export and battery charging flows
- **Sign convention toggles** per entity (invert solar/grid/battery)
- **House consumption fallback** — calculated from `solar + grid − battery_charge` when sensor absent
- **Clickable nodes** → dispatches `hass-more-info` for the linked entity
- **Custom sensors array** — up to N additional nodes connected to house with configurable colour
- **Diagnostics panel** — shows detected vs configured entity IDs and live values (opt-in)
- **Low-power threshold** — hides flow lines below configurable wattage
- **esbuild bundling** with `npm run build` → `dist/power-flow-card.js`
- **GitHub Actions CI/CD** — auto-builds on push; creates GitHub release with dist artifact on tag
- **HACS packaging** — `hacs.json` pointing to `dist/power-flow-card.js`
- `getGridOptions()` for HA 2025+ sections view grid layout

### Changed
- Card type renamed from `solar-weather-card` to `power-flow-card`
- HACS filename changed from root `solar-weather-card.js` to `dist/power-flow-card.js`

### Architecture decisions
- **No filesystem access** — auto-detection uses only `hass.states` (frontend-safe)
- **All power values converted to Watts internally** — display formatting handled at render time
- **Animation layer never detached** — SVG stays in DOM; state persists across data updates via CSS animations (no requestAnimationFrame loop required)
- **Shadow DOM** provides full style isolation from the HA dashboard

---

## Legacy

See `solar-weather-card.js` (v1.8.0) for the original single-file implementation.
