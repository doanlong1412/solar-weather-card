# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.4.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.md](README.md)

A custom Home Assistant card that displays your complete solar energy system — Solar, Battery, Grid, home consumption — alongside animated weather, a real-time clock, and a live sun/moon arc.

**No extra plugins required. Works standalone, fully configurable through the built-in UI editor.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Features (v1.4.1)

### 🎨 Display & Interface
- 🕐 **Live clock & date**, auto-updates every 30 seconds
- 🌤️ **Animated CSS weather icons** — rotating sun, falling rain, lightning flash, drifting fog, blowing wind
- 🌍 **Today's weather + tomorrow's forecast** (toggleable)
- 🌅 **Sun / moon arc** moves in real time based on sunrise/sunset
- ☀️ **Sun heartbeat** — pulse speed and glow scale with solar output
- 🌈 **Dynamic sky aura** — colour shifts from dawn blues through midday yellows to dusk oranges

### ⚡ Energy Flow
- **Particle Bubble** — bubbles travel along Bézier curves with multi-layer glow and white highlight sparkles
- **Animated Line** — dashed stroke animation along the same paths
- Speed and density auto-scale with power level; **each flow type has its own optimised scale** (solar / battery / grid / home)

### 🏗️ Node Cards
- Heartbeat border pulse when energy is flowing
- **New grid icon**: detailed lattice tower + separate transformer + sagging wires + ceramic insulators
- **Inverter icon**: spinning fan + animated sine wave + blinking LEDs
- **House icon**: 3D tiled roof + glowing windows + antenna
- **Battery icon**: fill bar with colour coding + lightning bolt while charging

### 🔋 Battery
- Colour-coded bar: 🟢 green (>20%) → 🟡 amber (10–20%) → 🔴 red (≤10%)
- **Charge / discharge ETA** — supports Ah sensors (LuxPower) multiplied by live voltage to derive Wh

### 📊 Stats & System
- 5-cell stats bar: Solar / From Grid / Consume / Saving / System
- **Custom electricity pricing** — enter your own tiers or use the Vietnam EVN default
- **Custom currency symbol** — đ / € / $ / £ / ฿ ...
- Scrolling ticker with weather commentary and battery status

### 🎛️ Customisation
- **Flow style**: Particle bubble or Animated line
- **Language**: 🇻🇳 Tiếng Việt / 🇬🇧 English / 🇩🇪 Deutsch / 🇮🇹 Italiano
- **Tomorrow forecast**: show / hide toggle
- **Background opacity**: slider 0–100%
- **Electricity pricing + currency**: fully customisable
- Visual Config Editor — no YAML editing needed

---

## 📦 Installation

### Option 1 — HACS (recommended)

**Step 1:** Add this repository to HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=frontend)

> If the button doesn't work, add manually:
> **HACS → Frontend → ⋮ → Custom repositories**
> → URL: `https://github.com/doanlong1412/solar-weather-card` → Category: **Frontend** → Add

**Step 2:** Search for **Solar Weather Card** → **Install**

**Step 3:** Hard-reload your browser (Ctrl+Shift+R)

---

### Option 2 — Manual

1. Download [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest)
2. Copy to `/config/www/solar-weather-card.js`
3. Go to **Settings → Dashboards → Resources** → **Add resource**:
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Hard-reload your browser (Ctrl+Shift+R)

---

## ⚙️ Configuration

### Add the card to your dashboard

```yaml
type: custom:solar-weather-card
```

After adding the card, click **✏️ Edit** — the configuration form will appear so you can enter entity IDs. No manual YAML editing required.

---

### Display options

| Config key | Values | Default | Description |
|---|---|---|---|
| `flow_style` | `particle` / `line` | `particle` | Energy flow animation style |
| `language` | `vi` / `en` / `de` / `it` | `vi` | Display language |
| `background_opacity` | `0` – `100` | `45` | Card background opacity (%) |
| `show_tomorrow` | `true` / `false` | `true` | Show / hide tomorrow's forecast |
| `currency` | any symbol | `đ` | Currency symbol for savings display |
| `pricing_tiers` | see below | Vietnam EVN | Custom electricity pricing tiers |

---

### Custom electricity pricing

Leave `pricing_tiers` empty to use the built-in **Vietnam EVN tiered pricing**.

To enter your own rates, use the format: `limit_kWh:rate` separated by commas.
Use `∞` or `inf` for the final (unlimited) tier.

**Example — German electricity (€/kWh):**
```
50:0.25,100:0.28,∞:0.32
```

**Example — Italian electricity (€/kWh):**
```
100:0.18,300:0.24,∞:0.30
```

**Example — flat rate (e.g. USD $0.15/kWh):**
```
∞:0.15
```

---

### Available entities

#### Weather & Environment

| Field | Description | Required |
|-------|-------------|:---:|
| 🌤️ Weather entity | `weather.xxx` | ✅ |
| 🌡️ Outdoor temperature | Sensor in °C | ✅ |
| 💧 Outdoor humidity | Sensor in % | ✅ |
| 🌬️ Atmospheric pressure | Sensor in hPa | |
| ☀️ UV index | UV index sensor | |
| 🌧️ Rain forecast | Text sensor | |

#### Solar

| Field | Description | Required |
|-------|-------------|:---:|
| ⚡ Solar Array 1 (W) | Array 1 output power | ✅ |
| ⚡ Solar Array 2 (W) | Array 2 output power | |
| ⚡ Solar Array 1 Voltage (V) | Array 1 DC voltage | |
| ⚡ Solar Array 2 Voltage (V) | Array 2 DC voltage | |

#### Battery

| Field | Description | Required |
|-------|-------------|:---:|
| 🔋 Battery SOC (%) | State of charge | ✅ |
| 🔋 Battery flow (W) | Positive = charging, negative = discharging | ✅ |
| 🔋 Battery voltage (V DC) | Live DC voltage | |
| 🔋 Capacity sensor (Ah) | LuxPower returns Ah — card multiplies by voltage to get Wh | |
| 🔋 Capacity manual (Wh) | Enter manually if no sensor — e.g. `26880` | |

> 💡 **ETA priority:** Manual Wh → Sensor Ah × Voltage → Default 560 Ah × 48 V

#### Grid & Home

| Field | Description | Required |
|-------|-------------|:---:|
| 🔌 Grid flow (W) | Positive = export, negative = import | ✅ |
| 🔌 Grid voltage (V AC) | AC voltage | |
| 🔌 Grid import today (kWh) | Grid energy consumed today | |
| 🏠 Home consumption (W) | Total household load | ✅ |

#### Stats & System

| Field | Description | Required |
|-------|-------------|:---:|
| 📊 Solar today (kWh) | Solar generation today | |
| 📊 Consumption today (kWh) | Total consumption today | |
| ⚙️ Inverter status | State: Normal / online / OFF | |
| 🔘 Inverter switch | Switch entity for grid-direct mode detection | |
| 🔌 Grid-direct power (W) | Power drawn directly from grid when inverter is off | |
| 🌡️ Inverter temperature (°C) | Inverter internal temp | |
| 🌡️ BMS temperature (°C) | Battery BMS temperature | |

---

### Full YAML example (LuxPower + Seplos BMS)

```yaml
type: custom:solar-weather-card
flow_style: particle
language: en
background_opacity: 45
show_tomorrow: true
currency: đ
# pricing_tiers: ""  # leave empty = use Vietnam EVN default

weather_entity: weather.forecast_home
temperature_entity: sensor.outdoor_temperature_aht20
humidity_entity: sensor.outdoor_humidity_aht20
pressure_entity: sensor.outdoor_pressure
uv_entity: sensor.uv_index
rain_entity: sensor.rain_forecast

solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
solar_pv1_voltage_entity: sensor.lux_solar_voltage_array_1_live
solar_pv2_voltage_entity: sensor.lux_solar_voltage_array_2_live

battery_soc_entity: sensor.lux_battery
battery_flow_entity: sensor.lux_battery_flow_live
battery_voltage_entity: sensor.lux_battery_voltage_live
battery_capacity_entity: sensor.lux_battery_capacity  # LuxPower returns Ah

grid_flow_entity: sensor.lux_grid_flow_live
grid_voltage_entity: sensor.lux_grid_voltage_live
grid_today_entity: sensor.lux_power_from_grid_daily

home_consumption_entity: sensor.lux_home_consumption_live
solar_today_entity: sensor.solar_today_kwh
consumption_today_entity: sensor.consumption_today_kwh

inverter_status_entity: sensor.luxpower
inverter_switch_entity: switch.inverter_lux_inverter
grid_direct_entity: sensor.grid_direct_power
inverter_temp_entity: sensor.lux_internal_temperature_live
battery_temp_entity: sensor.bms_temperature
```

---

## 🔋 Default Vietnam EVN Pricing (2024)

| Tier | Range | Rate |
|------|-------|------|
| 1 | 0 – 50 kWh | 1,984 ₫/kWh |
| 2 | 51 – 100 kWh | 2,050 ₫/kWh |
| 3 | 101 – 200 kWh | 2,380 ₫/kWh |
| 4 | 201 – 300 kWh | 2,998 ₫/kWh |
| 5 | 301 – 400 kWh | 3,350 ₫/kWh |
| 6 | 400+ kWh | 3,460 ₫/kWh |

The saving figure is the estimated value of today's solar generation had it been purchased from the grid at tiered rates.

---

## 🖥️ Compatibility

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboards |
| Devices | Mobile & Desktop |
| Dependencies | None |
| Browsers | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.4.1
- 🗼 New grid icon: detailed lattice tower + separate transformer + sagging wires + ceramic insulators
- ⚡ Type-based flowLevel — separate optimised scale for solar / battery / grid / home flows
- 🌐 Added 🇩🇪 Deutsch and 🇮🇹 Italiano — language selector is now a dropdown
- 🌤️ Toggle to show/hide tomorrow's forecast (`show_tomorrow`)
- 💰 Custom electricity pricing tiers (`pricing_tiers`) + custom currency symbol (`currency`)
- 🔘 Support for inverter switch entity + grid-direct flow path when inverter is off

### v1.4.0
- ✨ Completely new node cards: heartbeat border, hex grid, detailed 3D icons
- ☀️ Sun heartbeat animation scales with solar power output
- 🌈 Dynamic sky aura changes colour throughout the day
- ✦ Improved particle system: white highlight layer + separate glow layer
- 📜 Scrolling ticker with weather commentary and battery status
- 📊 5-cell stats bar: Solar / From Grid / Consume / Saving / System
- 🔋 Battery bar colour-codes by charge level
- 🌐 Language toggle: VI / EN
- 🪟 Background opacity slider

### v1.3.1
- 🐛 Fixed ETA calculation: LuxPower returns Ah — multiply by live voltage to get Wh
- ✏️ Added manual Wh capacity input for systems without a capacity sensor

### v1.3.0
- ✦ Added Particle Bubble flow mode
- ⚡ Added PV voltage readout in inverter node

### v1.2.0
- 🌤️ Animated CSS weather icons

### v1.1.0
- 🎛️ Visual Config Editor

### v1.0.0
- 🚀 Initial release

---

## 📄 License

MIT License — free to use, modify, and distribute.
If you find this useful, please ⭐ **star the repo**!

---

## 🙏 Credits

Designed and developed by **[@doanlong1412](https://github.com/doanlong1412)**.
