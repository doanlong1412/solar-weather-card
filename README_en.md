# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.7.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.md](README.md)

A custom Home Assistant card that displays your complete solar energy system — Solar, Battery, Grid, home consumption — alongside animated weather, a real-time clock, and a live sun/moon arc.

**No extra plugins required. Works standalone, fully configurable through the built-in UI editor.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Features (v1.7.1)

### 🎨 Display & Interface
- 🕐 **Live clock & date**, auto-updates every 30 seconds — weather icon always visible even when info panel is hidden
- 🌤️ **Animated CSS weather icons** — rotating sun, falling rain, lightning flash, drifting fog, blowing wind
- 🌙 **Automatic night icons** — after 18:00 or before 06:00, clear/sunny conditions display 🌙 instead of ☀️ *(New v1.7)*
- 🌍 **Today's weather + tomorrow's forecast** (each toggleable independently)
- 🌅 **Sun / moon arc** moves in real time based on sunrise/sunset
- ☀️ **Sun heartbeat** — pulse speed and glow scale with solar output
- 🌈 **Dynamic sky aura** — colour shifts from dawn through midday to dusk
- 🕐 **12h / 24h clock format** — selectable in Display Options, label translates with the active language *(New v1.7.1)*

### ⚡ Energy Flow (3 styles)
- **✦ Particle** — bubbles travel along Bézier curves with glow and highlight sparkles
- **〰️ Wave** — sine wave + dust particles + bright dots
- **── Line** — animated dashed stroke

### 🏗️ Node Cards (Battery, Inverter, Grid, Home)
- Heartbeat border pulse when energy flows (toggleable)
- Detailed 3D icons: battery, inverter with spinning fan, lattice tower + transformer, 3D house
- ⚡ **Grid export badge** — shows today's exported kWh directly below the Grid node *(New v1.7.1)*

### 🔋 Battery
- Colour-coded bar: 🟢 green (>20%) → 🟡 amber (10–20%) → 🔴 red (≤10%)
- **Charge / discharge ETA** — supports Ah sensors (LuxPower) × live voltage

### 📊 Solar Forecast Chart
- 🟡 **Yellow line** — actual solar output recorded hour by hour throughout the day
- 🟢 **Green line** — detailed Solcast hourly forecast (if Solcast is installed)
- 🔵 **Blue line** — formula-based forecast using sun position + cloud coverage (auto-fallback)
- **Today / tomorrow totals** shown directly on the chart
- Fully **toggleable** in the Visual Editor (`show_forecast_chart`)

### 📊 kWh Bar Chart *(Upgraded v1.7)*
- **3 bars**: Actual today / Forecast today / Forecast tomorrow
- **% comparison labels** shown below each bar — today's forecast = 100% baseline
  - `> 100%` → green (above forecast)
  - `< 100%` → red (below forecast)
  - `= 100%` → white

### 🎨 Colour Customisation
- **Node border / glow colour** for each node: Battery, Grid, Inverter, Home
- **Flow / particle colour** per path: Solar, Grid, Battery, Home
- **Chart line colours**: forecast curve and live/actual curve independently
- **Primary text colour** across the entire card
- **Reset to defaults** button — restores all colours to their original values in one click
- All settings available in the **🎨 Color Theme** accordion in the Visual Editor

### 📊 Stats & System
- 5-cell stats bar: Solar / From Grid / Consume / Saving / System
- **Custom electricity pricing** + **custom currency symbol**
- Scrolling ticker with weather commentary and battery status

### 🎛️ Config Editor *(Upgraded v1.7.1)*
- **Accordion sections** — entities grouped by category, expand/collapse each section
- **ha-entity-picker** — native HA dropdown, auto-filtered by entity domain
- **9 languages**: 🇻🇳 VI / 🇬🇧 EN / 🇩🇪 DE / 🇮🇹 IT / 🇫🇷 FR / 🇳🇱 NL / 🇵🇱 PL / 🇸🇪 SV / 🇭🇺 HU
- **Editor labels auto-translate** when switching language — Display Options, toggles, Layout, Pricing, Color Theme, Solar/Grid/Battery options all update instantly

---

## 📦 Installation

### Option 1 — HACS (recommended)

**Step 1:** Add Custom Repository to HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=plugin)

> If the button doesn't work, add manually:
> **HACS → Frontend → ⋮ → Custom repositories**
> → URL: `https://github.com/doanlong1412/solar-weather-card` → Type: **Dashboard** → Add

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

## ⚙️ Card Configuration

### Step 1 — Add the card to your dashboard

```yaml
type: custom:solar-weather-card
```

After adding the card, click **✏️ Edit** to open the Config Editor.

### Step 2 — Config Editor overview

![Config Editor](assets/editor-preview.png)

The Config Editor is divided into **accordion sections** — click any header to expand/collapse:

| Section | Contents |
|---------|---------|
| 🎨 **Display Options** | Flow style, language, clock format, opacity, display toggles |
| ☁️ **Weather & Environment** | Weather entity, temperature, humidity, UV, pressure, hourly forecast |
| ⚡ **Solar** | Array power and voltage sensors |
| 🔋 **Battery** | SOC, charge/discharge flow, voltage, capacity |
| 🔌 **Grid & Home** | Grid flow, AC voltage, home consumption, grid export today |
| ⚙️ **System & Stats** | Inverter status, temperatures |
| 💰 **Pricing & Currency** | Electricity pricing tiers, currency symbol |

> 💡 **Badge numbers** (e.g. `6/6`) on each section show how many entities are configured.

---

### Display options

| Config key | Values | Default | Description |
|---|---|---|---|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Energy flow animation style |
| `language` | `vi` / `en` / `de` / `it` / `fr` / `nl` / `pl` / `sv` / `hu` | `vi` | Display language |
| `time_format` | `24h` / `12h` | `24h` | Clock format *(New v1.7.1)* |
| `background_opacity` | `0` – `100` | `45` | Card background opacity (%) |
| `show_weather_info` | `true` / `false` | `true` | Show/hide full weather info panel |
| `show_tomorrow` | `true` / `false` | `true` | Show/hide tomorrow's forecast |
| `show_node_glow` | `true` / `false` | `true` | Enable/disable node glow effect |
| `show_forecast_chart` | `true` / `false` | `true` | Show/hide solar forecast chart |
| `currency` | any symbol | `đ` | Currency symbol for savings display |
| `pricing_tiers` | see below | Vietnam EVN | Custom electricity pricing tiers |

---

### Colour options

All colour options are available via the **🎨 Color Theme** accordion in the Visual Editor using visual colour pickers. You can also set them directly in YAML:

| Config key | Default | Description |
|---|---|---|
| `color_node_bat` | `#28e6a0` | Battery node border colour |
| `color_node_grd` | `#00d7ff` | Grid node border colour |
| `color_node_inv` | `#b991ff` | Inverter node border colour |
| `color_node_hom` | `#ffb228` | Home node border colour |
| `color_flow_solar` | `#ffe83c` | Solar flow particle/wave colour |
| `color_flow_grid` | `#50beff` | Grid flow particle/wave colour |
| `color_flow_batt` | `#3ce878` | Battery flow particle/wave colour |
| `color_flow_home` | `#ff941d` | Home flow particle/wave colour |
| `color_chart_fc` | `#f5a623` | Forecast line colour on the chart |
| `color_chart_live` | `#7ed321` | Live/actual line colour on the chart |
| `color_text_primary` | `#ffffff` | Primary text colour across the card |

---

### Custom electricity pricing

Leave `pricing_tiers` empty to use the built-in **Vietnam EVN tiered pricing**.

Format: `limit_kWh:rate` comma-separated. Use `∞` or `inf` for the final tier.

```
# Example — German electricity (€/kWh):
50:0.25,100:0.28,∞:0.32

# Example — flat rate ($/kWh):
∞:0.15
```

---

## 📊 Solar Forecast Chart Setup Guide

The chart appears directly below the energy flow node area and shows:

- 🟡 **Yellow line** — actual solar output recorded each hour of the day
- 🟢 **Green line** — detailed Solcast hourly forecast (if Solcast is installed)
- 🔵 **Blue line** — formula-based prediction using sun position + cloud coverage (auto-fallback)

> The chart **automatically selects the best available data source** — Solcast is not required.
> Toggle it on/off with `📊 Show solar forecast chart` in the **Display Options** section of the Visual Editor.

---

### Option 1 — Use Solcast (recommended — most accurate forecast)

**Solcast** is a free integration that provides hourly solar production forecasts based on your geographic location and system parameters.

📦 **Install from:** [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) — by **[@BJReplay](https://github.com/BJReplay)**

After installing and configuring Solcast, add these entities to your card:

| Config key | Solcast entity | Description |
|---|---|---|
| `solcast_today_entity` | `sensor.solcast_pv_forecast_forecast_today` | Today's total forecast (kWh) |
| `solcast_tomorrow_entity` | `sensor.solcast_pv_forecast_forecast_tomorrow` | Tomorrow's total forecast (kWh) |
| `solcast_detail_entity` | `sensor.solcast_pv_forecast_forecast_today` | Detailed hourly forecast (via attributes) |

> 💡 The card reads the `detailedForecast` or `forecast` attribute as an hourly list and draws the green forecast curve.

---

### Option 2 — Formula sensor (no Solcast required)

If Solcast is not installed, you can create a template sensor based on sun position and cloud coverage to provide the fallback forecast curve. See the v1.6 README for the full automation to record `input_text.solar_live_curve`.

---

### Setup summary

| Scenario | What to do |
|---|---|
| Just want a basic chart | Enable `show_forecast_chart: true` — card draws using available data |
| Want weather-accurate forecast | Create `sensor.solar_forecast_now` + add to `solcast_detail_entity` |
| Best accuracy + hourly actuals | Install Solcast + create the `input_text.solar_live_curve` automation |

---

## Available entities

### ☁️ Weather & Environment

| Config key | Description | Required |
|---|---|:---:|
| `weather_entity` | `weather.xxx` | ✅ |
| `temperature_entity` | Outdoor temperature sensor (°C) | ✅ |
| `humidity_entity` | Outdoor humidity sensor (%) | ✅ |
| `pressure_entity` | Atmospheric pressure sensor (hPa) | |
| `uv_entity` | UV index sensor | |
| `hourly_forecast_entity` | Hourly forecast sensor (e.g. Tomorrow.io) | |

### ⚡ Solar

| Config key | Description | Required |
|---|---|:---:|
| `solar_pv1_entity` | Array 1 output power (W) | ✅ |
| `solar_pv2_entity` | Array 2 output power (W) | |
| `solar_pv1_voltage_entity` | Array 1 DC voltage (V) | |
| `solar_pv2_voltage_entity` | Array 2 DC voltage (V) | |
| `solar_today_entity` | Solar generation today (kWh) | |
| `solar_dailyuse_entity` | Solar used by home today (kWh) | |
| `solar_live_entity` | Total solar live power (W) | |
| `solar_live_curve_entity` | Actual hourly curve (`input_text`) | |
| `solcast_today_entity` | Solcast forecast today (kWh) | |
| `solcast_tomorrow_entity` | Solcast forecast tomorrow (kWh) | |
| `solcast_detail_entity` | Solcast hourly detail or formula sensor | |

### 🔋 Battery

| Config key | Description | Required |
|---|---|:---:|
| `battery_soc_entity` | State of charge (%) | ✅ |
| `battery_flow_entity` | Charge/discharge flow (W, + charge / − discharge) | ✅ |
| `battery_voltage_entity` | DC voltage (V) | |
| `battery_capacity_entity` | Capacity sensor (Ah) — LuxPower returns Ah | |
| `battery_capacity_wh` | Manual capacity (Wh) — e.g. `26880` | |
| `battery_temp_entity` | BMS temperature (°C) | |

> 💡 **ETA priority:** Manual Wh → Sensor Ah × Voltage → Default 560 Ah × 48 V

### 🔌 Grid & Home

| Config key | Description | Required |
|---|---|:---:|
| `grid_flow_entity` | Grid flow (W, + export / − import) | ✅ |
| `home_consumption_entity` | Total household load (W) | ✅ |
| `grid_voltage_entity` | AC voltage (V) | |
| `grid_today_entity` | Grid energy imported today (kWh) | |
| `grid_export_today_entity` | Grid energy exported today (kWh) *(New v1.7.1)* | |
| `consumption_today_entity` | Total consumption today (kWh) | |
| `inverter_switch_entity` | Inverter switch entity (grid-direct mode) | |
| `grid_direct_entity` | Grid-direct power when inverter is off (W) | |

### ⚙️ System & Stats

| Config key | Description | Required |
|---|---|:---:|
| `inverter_status_entity` | Status: Normal / online / OFF | |
| `inverter_temp_entity` | Inverter temperature (°C) | |
| `battery_temp_entity` | BMS temperature (°C) | |

---

## Full YAML example (LuxPower + Seplos BMS + Solcast)

```yaml
type: custom:solar-weather-card
flow_style: wave
language: en
time_format: 24h
background_opacity: 45
show_weather_info: true
show_tomorrow: true
show_node_glow: true
show_forecast_chart: true
currency: đ

weather_entity: weather.forecast_home
temperature_entity: sensor.outdoor_temperature
humidity_entity: sensor.outdoor_humidity
pressure_entity: sensor.outdoor_pressure
uv_entity: sensor.uv_index
hourly_forecast_entity: sensor.tomorrow_raw_hourly

solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
solar_pv1_voltage_entity: sensor.lux_solar_voltage_array_1_live
solar_pv2_voltage_entity: sensor.lux_solar_voltage_array_2_live
solar_today_entity: sensor.solar_today_kwh
solar_dailyuse_entity: sensor.solar_used_by_home_today
solar_live_entity: sensor.lux_solar_total_live
solar_live_curve_entity: input_text.solar_live_curve

solcast_today_entity: sensor.solcast_pv_forecast_forecast_today
solcast_tomorrow_entity: sensor.solcast_pv_forecast_forecast_tomorrow
solcast_detail_entity: sensor.solcast_pv_forecast_forecast_today

battery_soc_entity: sensor.lux_battery
battery_flow_entity: sensor.lux_battery_flow_live
battery_voltage_entity: sensor.lux_battery_voltage_live
battery_capacity_entity: sensor.lux_battery_capacity

grid_flow_entity: sensor.lux_grid_flow_live
grid_voltage_entity: sensor.lux_grid_voltage_live
grid_today_entity: sensor.lux_power_from_grid_daily
grid_export_today_entity: sensor.lux_energy_to_grid_daily

home_consumption_entity: sensor.lux_home_consumption_live
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

### v1.7.1
- 🌐 **4 new languages** — 🇳🇱 Dutch (`nl`), 🇵🇱 Polish (`pl`), 🇸🇪 Swedish (`sv`), 🇭🇺 Hungarian (`hu`) — 9 languages total, with full day/month names, weather conditions, node labels, and ticker
- 🌍 **Editor auto-translates on language switch** — all labels in Display Options, toggles, Layout, Pricing, Color Theme, Solar/Grid/Battery options update instantly
- 🕐 **12h / 24h clock format** — selectable in Display Options; label translates with the active language
- ⚡ **Grid Export Today** — new `grid_export_today_entity` field; displays a `⚡ X.XX kWh` badge below the Grid node; auto-hidden when value ≤ 0.005 kWh

### v1.7.0
- 🌙 **Automatic night icons** — hourly forecast slots after 18:00 or before 06:00 with clear conditions (weather code `1000`, `1100`) display 🌙 instead of ☀️/🌤️; cloudy/rainy/thunder conditions keep their own emoji
- 📊 **Bar chart % vs today's forecast** — percentage label below each bar; today's forecast = 100% baseline; green above / red below / white at par
- 🌍 **Visual Editor translated labels** — editor labels show native language names in parentheses at smaller font size; update with the active language

### v1.6.0
- 📊 **Solar Forecast Chart** — actual hourly line + Solcast/formula forecast curve
- 🔌 **Solcast integration** — reads detailed hourly forecast from [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) by **@BJReplay**
- 🧮 **Formula sensor fallback** — forecast based on sun arc + cloud coverage when Solcast is unavailable
- 📝 **Hourly recording automation** — logs real solar output each hour into `input_text.solar_live_curve`
- 🎛️ **Chart visibility toggle** — `show_forecast_chart` in the Visual Editor, positioned below Node glow effect
- ⚡ **Solar design capacity** (`solar_design_wp`) — enter your system's Wp so the chart Y-axis scales accurately to your installation
- 🎨 **Color Theme** — customise node borders, flow/particle colours, chart line colours, and primary text colour; one-click Reset to defaults

### v1.5.1
- 🌤️ Weather icon always visible alongside clock even when `show_weather_info` is off
- 🌡️ Fixed outdoor temperature/humidity reading from sensor entities
- 📅 Tomorrow forecast now prioritises `sensor.tomorrow_raw_hourly` (Tomorrow.io), falls back to `wfc[1]`
- 🌡️ Fixed today's forecast hi/lo reading from `wfc[0]`

### v1.5.0
- 〰️ New flow style: **Wave** — sine wave + dust particles + bright dots
- ✨ Toggle to enable/disable node glow effect (`show_node_glow`)
- 🏷️ Removed power labels alongside flow paths
- 🔽 **ha-entity-picker** — native HA entity dropdown, filtered by domain
- 📁 **Accordion sections** in Config Editor
- 🇫🇷 Added Français — 5 languages total
- 🏳️ Real country flag images in language selector

### v1.4.1
- 🗼 New grid icon: lattice tower + separate transformer
- ⚡ Type-based flowLevel for solar/battery/grid/home
- 💰 Custom pricing tiers + currency symbol
- 🌤️ Toggle for tomorrow forecast

### v1.4.0
- ✨ Completely new node cards: heartbeat border, hex grid, detailed 3D icons
- ☀️ Sun heartbeat scales with solar output
- 🌈 Dynamic sky aura throughout the day
- 📊 5-cell stats bar + scrolling ticker

### v1.0.0 – v1.3.x
- Foundation: standalone card, Visual Config Editor, particle flow, animated weather icons

---

## 📄 License

MIT License — free to use, modify, and distribute.
If you find this useful, please ⭐ **star the repo**!

---

## 🙏 Credits

Designed and developed by **[@doanlong1412](https://github.com/doanlong1412)** from 🇻🇳 Vietnam.

Solcast forecast integration powered by [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) — by **[@BJReplay](https://github.com/BJReplay)**.
