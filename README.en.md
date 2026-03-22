# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.4.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.md](README.md)

A custom Home Assistant card that displays your complete solar energy system — Solar, Battery, Grid, home consumption — alongside an animated weather display, real-time clock, and a live sun/moon arc.

**No extra plugins required. Works standalone, fully configurable through the built-in UI editor.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Features (v1.4.0)

### 🎨 Display & Interface
- 🕐 **Live clock & date**, auto-updates every 30 seconds
- 🌤️ **Animated CSS weather icons** — rotating sun, falling rain, lightning flash, drifting fog, blowing wind
- 🌍 **Today's weather + tomorrow's forecast** with a miniature animated icon
- 🌅 **Sun / moon arc** that moves in real time based on sunrise/sunset
- ☀️ **Sun heartbeat animation** — pulsing speed and glow scale with solar output
- 🌈 **Dynamic sky aura** — colour shifts from cool dawn blues through warm midday yellows to deep dusk oranges

### ⚡ Energy Flow
- **Particle Bubble mode** — bubbles travel along Bézier curves with multi-layer glow and white highlight sparkles
- **Animated Line mode** — dashed stroke animation along the same paths
- Particle density and speed automatically scale with power level

### 🔋 Battery
- Detailed battery icon with SOC % displayed inside and a lightning bolt when charging
- Colour-coded bar: 🟢 green (>20%) → 🟡 amber (10–20%) → 🔴 red (≤10%)
- **Charge / discharge ETA** — supports Ah sensors (LuxPower) multiplied by live voltage to derive Wh

### 🏗️ Node Cards (Inverter, Battery, Grid, Home)
- Heartbeat border pulse when energy is flowing
- Detailed 3D icons: inverter with spinning fan + animated sine wave + blinking LEDs, power pole with ceramic insulators, 3D house with tiled roof
- Bottom bar shows: V BAT, V PV, V AC readings

### 📊 Stats & System
- 5-cell stats bar: Solar / From Grid / Consume / Saving / System
- Savings calculated using **Vietnam EVN tiered pricing**
- Scrolling ticker with weather commentary and battery status
- Inverter status: ❤️ ON / OFF with colour indicator, inverter & BMS temperatures

### 🎛️ Customisation
- **Flow style**: Particle bubble or Animated line
- **Language**: 🇻🇳 Vietnamese or 🇬🇧 English
- **Background opacity**: slider from 0–100%
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

1. Download [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest) from the Releases page
2. Copy it to `/config/www/solar-weather-card.js`
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
| 🌡️ Inverter temperature (°C) | Inverter internal temp | |
| 🌡️ BMS temperature (°C) | Battery BMS temperature | |

---

### Display options

| Config key | Values | Default | Description |
|---|---|---|---|
| `flow_style` | `particle` / `line` | `particle` | Energy flow animation style |
| `language` | `vi` / `en` | `vi` | Display language |
| `background_opacity` | `0` – `100` | `45` | Card background opacity (%) |

---

### Full YAML example (LuxPower + Seplos BMS)

```yaml
type: custom:solar-weather-card
flow_style: particle
language: en
background_opacity: 45

weather_entity: weather.forecast_home
temperature_entity: sensor.outdoor_temperature
humidity_entity: sensor.outdoor_humidity
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
inverter_temp_entity: sensor.lux_internal_temperature_live
battery_temp_entity: sensor.bms_temperature
```

---

## 🔋 EVN Tiered Electricity Pricing

The card calculates daily savings using **Vietnam EVN tiered pricing** (2024):

| Tier | Range | Rate |
|------|-------|------|
| 1 | 0 – 50 kWh | 1,984 ₫/kWh |
| 2 | 51 – 100 kWh | 2,050 ₫/kWh |
| 3 | 101 – 200 kWh | 2,380 ₫/kWh |
| 4 | 201 – 300 kWh | 2,998 ₫/kWh |
| 5 | 301 – 400 kWh | 3,350 ₫/kWh |
| 6 | 400+ kWh | 3,460 ₫/kWh |

The saving shown is the estimated value of solar energy generated today, had it been purchased from the grid at tiered rates.

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

### v1.4.0
- ✨ Completely new node cards: heartbeat border, hex grid background, detailed 3D icons
- ☀️ Sun heartbeat animation scales with solar power output
- 🌈 Dynamic sky aura changes colour throughout the day
- ✦ Improved particle system: white highlight layer + separate glow layer
- 📜 Scrolling ticker with weather commentary and battery status
- 📊 5-cell stats bar: Solar / From Grid / Consume / Saving / System
- 🔋 Battery bar colour-codes by charge level (red / amber / green)
- 🌐 Language toggle: Vietnamese 🇻🇳 / English 🇬🇧
- 🪟 Background opacity slider (0–100%)
- 🔌 Added `grid_today_entity` for grid import tracking

### v1.3.1
- 🐛 Fixed ETA calculation: LuxPower returns Ah — multiply by live voltage to get Wh
- ✏️ Added manual Wh capacity input for systems without a capacity sensor

### v1.3.0
- ✦ Added Particle Bubble flow mode
- ⚡ Added PV voltage readout in inverter node

### v1.2.0
- 🌤️ Animated CSS weather icons
- 🌍 Vietnamese weather condition labels

### v1.1.0
- 🎛️ Visual Config Editor
- 📡 All entities configurable through the UI

### v1.0.0
- 🚀 Initial release

---

## 📄 License

MIT License — free to use, modify, and distribute.
If you find this useful, please ⭐ **star the repo**!

---

## 🙏 Credits

Designed and developed by **[@doanlong1412](https://github.com/doanlong1412)**.
