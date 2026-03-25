# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.6.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.md](README.md)

A custom Home Assistant card that displays your complete solar energy system — Solar, Battery, Grid, home consumption — alongside animated weather, a real-time clock, and a live sun/moon arc.

**No extra plugins required. Works standalone, fully configurable through the built-in UI editor.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Features (v1.6.0)

### 🎨 Display & Interface
- 🕐 **Live clock & date**, auto-updates every 30 seconds — weather icon always visible even when info panel is hidden
- 🌤️ **Animated CSS weather icons** — rotating sun, falling rain, lightning flash, drifting fog, blowing wind
- 🌍 **Today's weather + tomorrow's forecast** (each toggleable independently)
- 🌅 **Sun / moon arc** moves in real time based on sunrise/sunset
- ☀️ **Sun heartbeat** — pulse speed and glow scale with solar output
- 🌈 **Dynamic sky aura** — colour shifts from dawn through midday to dusk

### ⚡ Energy Flow (3 styles)
- **✦ Particle** — bubbles travel along Bézier curves with glow and highlight sparkles
- **〰️ Wave** — sine wave + dust particles + bright dots
- **── Line** — animated dashed stroke

### 🏗️ Node Cards (Battery, Inverter, Grid, Home)
- Heartbeat border pulse when energy flows (toggleable)
- Detailed 3D icons: battery, inverter with spinning fan, lattice tower + transformer, 3D house

### 🔋 Battery
- Colour-coded bar: 🟢 green (>20%) → 🟡 amber (10–20%) → 🔴 red (≤10%)
- **Charge / discharge ETA** — supports Ah sensors (LuxPower) × live voltage

### 📊 Solar Forecast Chart *(New v1.6)*
- 🟡 **Yellow line** — actual solar output recorded hour by hour throughout the day
- 🟢 **Green line** — detailed Solcast hourly forecast (if Solcast is installed)
- 🔵 **Blue line** — formula-based forecast using sun position + cloud coverage (auto-fallback)
- **Today / tomorrow totals** shown directly on the chart
- Fully **toggleable** in the Visual Editor (`show_forecast_chart`) — positioned just below the Node glow effect toggle

### 🎨 Colour Customisation *(New v1.6)*
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

### 🎛️ Config Editor
- **Accordion sections** — entities grouped by category, expand/collapse each section
- **ha-entity-picker** — native HA dropdown, auto-filtered by entity domain
- **5 languages**: 🇻🇳 Tiếng Việt / 🇬🇧 English / 🇩🇪 Deutsch / 🇮🇹 Italiano / 🇫🇷 Français

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
| 🎨 **Display Options** | Flow style, language, opacity, display toggles |
| ☁️ **Weather & Environment** | Weather entity, temperature, humidity, UV, pressure, rain forecast |
| ⚡ **Solar** | Array power and voltage sensors |
| 🔋 **Battery** | SOC, charge/discharge flow, voltage, capacity |
| 🔌 **Grid & Home** | Grid flow, AC voltage, home consumption |
| ⚙️ **System & Stats** | Inverter status, temperatures |
| 💰 **Pricing & Currency** | Electricity pricing tiers, currency symbol |

> 💡 **Badge numbers** (e.g. `6/6`) on each section show how many entities are configured.

---

### Display options

| Config key | Values | Default | Description |
|---|---|---|---|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Energy flow animation style |
| `language` | `vi` / `en` / `de` / `it` / `fr` | `vi` | Display language |
| `background_opacity` | `0` – `100` | `45` | Card background opacity (%) |
| `show_weather_info` | `true` / `false` | `true` | Show/hide full weather info panel |
| `show_tomorrow` | `true` / `false` | `true` | Show/hide tomorrow's forecast |
| `show_node_glow` | `true` / `false` | `true` | Enable/disable node glow effect |
| `show_forecast_chart` | `true` / `false` | `true` | Show/hide solar forecast chart *(New v1.6)* |
| `currency` | any symbol | `đ` | Currency symbol for savings display |
| `pricing_tiers` | see below | Vietnam EVN | Custom electricity pricing tiers |

---

### Colour options *(New v1.6)*

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

## 📊 Solar Forecast Chart Setup Guide *(New v1.6)*

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
| `solcast_detail_entity` | `sensor.solcast_pv_forecast_forecast_today` | Hourly detail forecast (via attributes) |

> 💡 The card reads the `detailedForecast` or `forecast` attribute (a list of hourly values) and draws the green curve automatically.

---

### Option 2 — Use a formula sensor (no Solcast needed)

If you haven't installed Solcast, you can create a calculated sensor based on sun position and cloud coverage as a forecast fallback.

#### Step 1 — Create an `input_text` to store hourly real data

**Option A — Via UI (easiest):**

Go to **Settings → Devices & Services → Helpers → Add Helper → Text** and name it `solar_live_curve`.

**Option B — Via YAML:**

Add to `configuration.yaml`:

```yaml
input_text:
  solar_live_curve:
    name: "Solar Live Curve"
    max: 255
    mode: text
```

Then restart Home Assistant.

---

#### Step 2 — Create the forecast sensor and recording automation

Add to `configuration.yaml`:

```yaml
template:
  - sensor:
      - name: "Solar Forecast Now"
        unique_id: solar_forecast_now
        unit_of_measurement: "W"
        state_class: measurement
        device_class: power
        state: >
          {% set h = now().hour + now().minute / 60 %}
          {% set cloud = state_attr('weather.YOUR_WEATHER_ENTITY', 'cloud_coverage') | float(50) %}
          {% set sun = [0, (3.14159 * (h - 5.5) / 13) | sin] | max %}
          {{ (sun * 8000 * (1 - cloud / 100) * 0.85) | round(0) | int }}

automation:
  - alias: "Solar Live Curve - Record actual output hourly"
    trigger:
      - platform: time_pattern
        hours: "/1"
        minutes: "0"
      - platform: homeassistant
        event: start
    action:
      - variables:
          live_w: "{{ states('sensor.YOUR_SOLAR_ENTITY') | float(0) | round(0) | int }}"
          live_h: "{{ now().hour }}"
          old_curve: "{{ states('input_text.solar_live_curve') }}"
      - variables:
          new_point: "{{ live_h }}:{{ live_w }}"
          new_curve: >
            {% set is_morning = live_h | int == 6 %}
            {% set is_empty = old_curve in ['unknown','unavailable',''] %}
            {% if is_morning %}
              {{ new_point }}
            {% elif is_empty %}
              {{ new_point }}
            {% else %}
              {{ old_curve }},{{ new_point }}
            {% endif %}
      - service: input_text.set_value
        target:
          entity_id: input_text.solar_live_curve
        data:
          value: "{{ new_curve }}"
    sensor:
      - name: "Solar Live Dummy"
        unique_id: solar_live_dummy
        state: "OK"
```

> ⚠️ **Replace before using:**
> - `weather.YOUR_WEATHER_ENTITY` → your weather entity (e.g. `weather.forecast_home`)
> - `sensor.YOUR_SOLAR_ENTITY` → your actual solar power sensor (e.g. `sensor.lux_solar_output_live`)
> - `8000` → your system's peak output in W (e.g. 10 kWp system → `10000`)

---

#### Step 3 — Add the entity to your card

```yaml
solcast_detail_entity: sensor.solar_forecast_now
```

The card will detect this as a formula sensor and draw the appropriate forecast curve.

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
| `rain_entity` | Rain forecast text sensor | |

### ⚡ Solar

| Config key | Description | Required |
|---|---|:---:|
| `solar_pv1_entity` | Array 1 output power (W) | ✅ |
| `solar_pv2_entity` | Array 2 output power (W) | |
| `solar_pv1_voltage_entity` | Array 1 DC voltage (V) | |
| `solar_pv2_voltage_entity` | Array 2 DC voltage (V) | |
| `solar_today_entity` | Solar generation today (kWh) | |
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
| `consumption_today_entity` | Total consumption today (kWh) | |
| `inverter_switch_entity` | Inverter switch entity (grid-direct mode) | |
| `grid_direct_entity` | Grid-direct power when inverter is off (W) | |

### ⚙️ System & Stats

| Config key | Description | Required |
|---|---|:---:|
| `inverter_status_entity` | Status: Normal / online / OFF | |
| `inverter_temp_entity` | Inverter temperature (°C) | |

---

## Full YAML example (LuxPower + Seplos BMS + Solcast)

```yaml
type: custom:solar-weather-card
flow_style: wave
language: en
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
rain_entity: sensor.rain_forecast

solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
solar_pv1_voltage_entity: sensor.lux_solar_voltage_array_1_live
solar_pv2_voltage_entity: sensor.lux_solar_voltage_array_2_live
solar_today_entity: sensor.solar_today_kwh

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
