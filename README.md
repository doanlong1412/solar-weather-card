# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.8.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇻🇳 **Phiên bản tiếng Việt:** [README.vi.md](README.vi.md)

**Your solar dashboard, finally alive.** Particles flow through your energy paths in real time. The sun arcs across the sky at the right pace. Your battery pulses. Your rooms breathe with every watt they draw. And it all updates itself — no refresh, no fuss.

One card. Zero dependencies. Drops straight into Home Assistant.

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ What makes this different

Most energy cards show you numbers. This one shows you **what's happening** — solar pouring into the inverter, charge flowing down into the battery, each room pulling its share from the home node. You can see at a glance whether your system is thriving or struggling, long before you read a single value.

And in **v1.8**, every room in your home is now a first-class citizen on the card — with individual power tiles, animated branch flows, and full position control so the layout fits your screen perfectly.

---

## 🚀 Features

### ⚡ Energy Flow — 3 styles, zero flicker *(v1.8 rebuilt)*

The flow engine was rewritten from scratch in v1.8. Particles no longer reset or stutter when sensor data updates — they just keep flowing.

| Style | Description |
|-------|-------------|
| **✦ Spark** | YAML-style `stroke-dasharray` particles — lightweight, smooth, the new default |
| **〰️ Wave** | Sine wave + drifting dust + bright dots |
| **── Line** | Crisp animated dashed stroke |

Particle speed, size, and count all scale automatically with live power output.

---

### 🏠 Rooms & Devices *(New in v1.8 — the headline feature)*

Up to **6 room / device tiles** live below the energy diagram, each connected to the Home node by a live branch flow. Configure between 2 and 6 rooms from the editor.

**What each tile shows:**
- Room name and icon (MDI-style SVG built-in, or any emoji you choose)
- Live wattage, large and readable
- Power bar that fills proportionally to current draw
- Tile fades automatically when the device is off

**Full position control per room** — every tile has its own X and Y offset slider in the editor. Drag a room tile left, right, up, or even *above* the Home node if that's where it makes sense on your screen. Branch flow paths recalculate automatically to reach wherever you put it.

```yaml
rooms:
  - name: Living Room
    entity: sensor.living_room_power
  - name: Kitchen
    entity: sensor.kitchen_power
  - name: Induction
    icon: "🔥"
    entity: sensor.induction_power
  - name: Office
    entity: sensor.office_power
  - name: Bedroom
    icon: "🛏️"
    entity: sensor.bedroom_ac_power
  - name: Laundry
    icon: "🧺"
    entity: sensor.washing_machine_power

room_count: 6   # 2–6 tiles
```

> Room offsets are set visually in the **📐 Node Layout** section of the editor — no YAML required.

---

### 🔋 Battery — every state animated

The battery icon tells you exactly what's happening without reading a number:

| State | Indicator |
|-------|-----------|
| Charging | ⚡ Lightning bolt blinks |
| Discharging | 3 downward arrows animate continuously |
| Low (≤ 20%) | Red `!` blinks rapidly |
| Healthy / idle | Green ✓ pulses slowly |

Colour-coded bar: 🟢 green (> 50%) → 🟡 amber (20–50%) → 🔴 red (≤ 20%)

**Charge / discharge ETA** is calculated live and shown below the bar. Supports Ah sensors (e.g. LuxPower) multiplied by live voltage, manual Wh entry, or a sensible default.

---

### 🌤️ Weather — animated, alive, automatic

- Animated CSS weather icons: rotating sun ☀️, falling rain 🌧️, lightning flash ⚡, drifting fog 🌫️, blowing wind 💨
- Auto night icons — clear sky after 18:00 or before 06:00 shows 🌙 instead of ☀️
- Today's conditions + tomorrow's forecast (each independently toggleable)
- Outdoor temperature, humidity, UV index, air pressure
- Hourly forecast strip (requires Tomorrow.io sensor)
- 12h / 24h clock, updates every 30 seconds

---

### ☀️ Sun arc & dynamic sky

The sun travels across a real bezier arc based on your actual sunrise and sunset times. The background aura shifts colour from cool dawn blue through midday amber to dusk orange. After sunset, the moon takes over and traces its own arc through the night sky.

The sun itself **pulses faster and glows brighter** as solar output increases — you can literally see the system working harder at noon.

---

### 🗼 Node cards

Four main nodes — Battery, Inverter, Grid, Home — each with:
- Detailed 3D SVG icon (battery with 4 cells + terminal, inverter with spinning fan, lattice tower + transformer, 3D house with garage)
- Heartbeat border that pulses when energy is flowing (toggleable)
- Live wattage + direction label
- Gentle float animation

A **wind turbine** spins beside the Home node — its blade speed is purely decorative, but it looks great.

---

### 📊 Solar Forecast Chart

A compact chart sits beside the Home node showing:
- 🟡 Actual solar output recorded hour by hour (via `input_text` automation)
- 🟢 Detailed Solcast forecast if [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) is installed
- Auto-fallback formula forecast using sun position × cloud coverage
- Current-time marker line

---

### 📊 kWh Bar Chart

Three bars — Actual today / Forecast today / Forecast tomorrow — with colour-coded percentage labels against today's forecast as 100% baseline.

---

### 🎨 Full colour customisation

Every colour is configurable from the visual editor:
- Node border / glow colour per node (Battery, Grid, Inverter, Home)
- Flow / particle colour per path (Solar, Grid, Battery, Home)
- Chart line colours (forecast curve and live curve independently)
- Primary text colour
- Background gradient — 7 built-in presets or fully custom with 2-stop colour picker

One-click **Reset to defaults** restores everything.

---

### 📈 Stats bar

Five circles at the bottom: **Solar produced / Grid import / Total consumption / Saving / System status** — with Inverter temperature and BMS temperature shown in the System circle.

Custom electricity pricing tiers and currency symbol (defaults to Vietnam EVN 2024 rates).

---

### 🎛️ Visual Config Editor

Everything is configurable without touching YAML. The editor uses **accordion sections** so it stays compact:

| Section | Contents |
|---------|----------|
| 🎨 **Display Options** | Flow style, language, clock format, opacity, feature toggles |
| ☁️ **Weather & Environment** | Weather, temperature, humidity, UV, pressure, hourly forecast |
| ⚡ **Solar** | PV array power and voltage sensors |
| 🔋 **Battery** | SOC, charge/discharge, voltage, capacity |
| 🔌 **Grid & Home** | Grid flow, voltage, home consumption, export today |
| ⚙️ **System & Stats** | Inverter status and temperatures |
| 🏠 **Rooms** | Name, icon, entity, X/Y offset for each room tile |
| 💰 **Pricing & Currency** | Electricity tiers, currency symbol |
| 📐 **Node Layout** | Battery X, Grid X, Inverter Y, Home Y, node scale, particle density |
| 🎨 **Color Theme** | All colour pickers + reset |

Badge counters on each section (e.g. `5/6`) tell you how many entities are filled in.

**9 languages** — all editor labels auto-translate when you switch:
🇻🇳 VI · 🇬🇧 EN · 🇩🇪 DE · 🇮🇹 IT · 🇫🇷 FR · 🇳🇱 NL · 🇵🇱 PL · 🇸🇪 SV · 🇭🇺 HU

---

## 📦 Installation

### Option 1 — HACS (recommended, 30 seconds)

**Step 1** — Add this repository to HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=plugin)

> If the button doesn't work, add manually:
> **HACS → Frontend → ⋮ → Custom repositories**
> URL: `https://github.com/doanlong1412/solar-weather-card` → Type: **Dashboard** → Add

**Step 2** — Search **Solar Weather Card** → **Install**

**Step 3** — Hard-reload your browser (`Ctrl+Shift+R`)

---

### Option 2 — Manual

1. Download [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest)
2. Copy to `/config/www/solar-weather-card.js`
3. **Settings → Dashboards → Resources → Add resource:**
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Hard-reload (`Ctrl+Shift+R`)

---

## ⚙️ Configuration

Add the card to any dashboard:

```yaml
type: custom:solar-weather-card
```

Then click **✏️ Edit** — the visual editor handles everything from there.

---

### Display options

| Key | Values | Default | Description |
|-----|--------|---------|-------------|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Flow animation style |
| `language` | `vi` / `en` / `de` / `it` / `fr` / `nl` / `pl` / `sv` / `hu` | `vi` | Display language |
| `time_format` | `24h` / `12h` | `24h` | Clock format |
| `background_opacity` | `0`–`100` | `45` | Card background opacity (%) |
| `show_weather_info` | `true` / `false` | `true` | Full weather panel |
| `show_tomorrow` | `true` / `false` | `true` | Tomorrow's forecast row |
| `show_node_glow` | `true` / `false` | `true` | Node heartbeat glow |
| `show_forecast_chart` | `true` / `false` | `true` | Solar forecast chart |
| `show_hourly_forecast` | `true` / `false` | `true` | Hourly forecast strip |
| `currency` | any symbol | `đ` | Currency symbol |
| `pricing_tiers` | `50:1984,100:2050,...` | Vietnam EVN | Custom pricing tiers |

---

### Room configuration *(v1.8)*

| Key | Description |
|-----|-------------|
| `room_count` | Number of room tiles: `2`–`6` (default `4`) |
| `rooms` | Array of room objects (see below) |
| `room_offsets` | Array of `{x, y}` offsets per room — set via editor sliders |

Each room object:

| Field | Description |
|-------|-------------|
| `name` | Label shown below the tile |
| `icon` | Emoji — leave blank for the built-in MDI-style SVG icon |
| `entity` | W or kW power sensor — unit auto-detected |

**Room position offsets** are applied in true SVG screen coordinates. Positive X moves right, negative X moves left. Negative Y moves a tile upward — you can place a room *beside* or even *above* the Home node if needed. The branch flow path recalculates automatically.

---

### Node layout

| Key | Default | Description |
|-----|---------|-------------|
| `node_bat_x` | `-40` | Battery node X position |
| `node_grd_x` | `295` | Grid node X position |
| `node_inv_y` | `220` | Inverter node Y position |
| `node_hom_y` | `400` | Home node Y position |
| `node_scale` | `1.0` | Uniform scale for all 4 main nodes (0.5–1.2) |
| `particle_mult` | `1.0` | Particle density multiplier (0.2–1.0) |

---

### Sensor reference

#### ☁️ Weather & Environment

| Key | Description | Required |
|-----|-------------|:--------:|
| `weather_entity` | HA weather entity | ✅ |
| `temperature_entity` | Outdoor temperature (°C) | |
| `humidity_entity` | Outdoor humidity (%) | |
| `pressure_entity` | Air pressure (hPa) | |
| `uv_entity` | UV index | |
| `hourly_forecast_entity` | Tomorrow.io raw hourly sensor | |

#### ⚡ Solar

| Key | Description | Required |
|-----|-------------|:--------:|
| `solar_pv1_entity` | PV array 1 power (W) | ✅ |
| `solar_pv2_entity` | PV array 2 power (W) | |
| `solar_pv1_voltage_entity` | PV array 1 voltage (V) | |
| `solar_pv2_voltage_entity` | PV array 2 voltage (V) | |
| `solar_today_entity` | Total solar produced today (kWh) | |
| `solar_dailyuse_entity` | Solar consumed by home today (kWh) | |
| `solar_live_entity` | Live solar output (W) | |
| `solar_live_curve_entity` | `input_text` hourly log for chart | |
| `solcast_today_entity` | Solcast forecast today (kWh) | |
| `solcast_tomorrow_entity` | Solcast forecast tomorrow (kWh) | |
| `solcast_detail_entity` | Solcast detailed hourly forecast | |

#### 🔋 Battery

| Key | Description | Required |
|-----|-------------|:--------:|
| `battery_soc_entity` | State of charge (%) | ✅ |
| `battery_flow_entity` | Charge/discharge flow (W, + charge / − discharge) | ✅ |
| `battery_voltage_entity` | DC voltage (V) | |
| `battery_capacity_entity` | Capacity sensor (Ah) | |
| `battery_capacity_wh` | Manual capacity (Wh), e.g. `26880` | |
| `battery_temp_entity` | BMS temperature (°C) | |

> **ETA priority:** Manual Wh → Sensor Ah × Voltage → Default 560 Ah × 48 V

#### 🔌 Grid & Home

| Key | Description | Required |
|-----|-------------|:--------:|
| `grid_flow_entity` | Grid flow (W, + export / − import) | ✅ |
| `home_consumption_entity` | Total home load (W) | ✅ |
| `grid_voltage_entity` | AC voltage (V) | |
| `grid_today_entity` | Grid imported today (kWh) | |
| `grid_export_today_entity` | Grid exported today (kWh) | |
| `consumption_today_entity` | Total consumption today (kWh) | |
| `inverter_switch_entity` | Inverter switch (grid-direct mode) | |
| `grid_direct_entity` | Grid-direct power when inverter is off (W) | |

#### ⚙️ System & Stats

| Key | Description | Required |
|-----|-------------|:--------:|
| `inverter_status_entity` | Status: Normal / online / OFF | |
| `inverter_temp_entity` | Inverter temperature (°C) | |
| `battery_temp_entity` | BMS temperature (°C) | |

---

## 📋 Full YAML example (LuxPower + Seplos BMS + Solcast)

```yaml
type: custom:solar-weather-card
flow_style: particle
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

# Rooms — up to 6 tiles, positions set via editor
room_count: 4
rooms:
  - name: Living Room
    entity: sensor.living_room_power
  - name: Kitchen
    entity: sensor.kitchen_power
  - name: Induction
    icon: "🔥"
    entity: sensor.induction_power
  - name: Office
    entity: sensor.office_power
```

---

## 🔋 Default pricing — Vietnam EVN 2024

| Tier | Range | Rate |
|------|-------|------|
| 1 | 0 – 50 kWh | 1,984 ₫/kWh |
| 2 | 51 – 100 kWh | 2,050 ₫/kWh |
| 3 | 101 – 200 kWh | 2,380 ₫/kWh |
| 4 | 201 – 300 kWh | 2,998 ₫/kWh |
| 5 | 301 – 400 kWh | 3,350 ₫/kWh |
| 6 | 400+ kWh | 3,460 ₫/kWh |

Custom pricing example: `50:1984,100:2050,200:2380,300:2998,400:3350,inf:3460`

---

## 🖥️ Compatibility

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboards |
| Devices | Mobile & Desktop |
| Dependencies | **None** |
| Browsers | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.8.0
- 🏠 **Rooms & Devices** — up to 6 configurable room tiles below the energy diagram, each with name, icon, power entity, animated branch flow from Home, and a live power bar
- 📐 **Per-room position control** — independent X/Y offset sliders per tile; branch flow paths auto-adapt to any position, including beside or above the Home node
- 🔢 **Configurable room count** — 2 to 6 tiles, set via a slider in the editor
- 🔋 **Battery icon fully overhauled** — ⚡ lightning bolt blinks when charging, 3 animated downward arrows when discharging, red `!` blinks fast when ≤ 20%, green ✓ pulses slowly at standby; 4-cell body, positive terminal, large % readout
- 🌬️ **Wind turbine** beside the Home node — 3-blade SVG with `animateTransform rotate`
- ✦ **Spark flow engine rewritten** — `stroke-dasharray animate` instead of `animateMotion`; no more flicker or position reset between re-renders
- ✦ **Animation continuity fix** — flow particles no longer stutter when sensor data updates (two-layer DOM: animation SVG lives independently of the data layer)

### v1.7.1
- 🌐 4 new languages — 🇳🇱 Dutch, 🇵🇱 Polish, 🇸🇪 Swedish, 🇭🇺 Hungarian (9 total)
- 🌍 Editor auto-translates on language switch
- 🕐 12h / 24h clock format selector
- ⚡ Grid Export Today badge below Grid node

### v1.7.0
- 🌙 Automatic night icons
- 📊 Bar chart % vs forecast, colour-coded labels

### v1.6.0
- 📊 Solar Forecast Chart — actual + Solcast + formula fallback
- 🎨 Color Theme — full customisation with Reset

### v1.5.0
- 〰️ Wave flow style
- ✨ Node glow toggle
- 🔽 Native ha-entity-picker
- 📁 Accordion config editor sections
- 🇫🇷 Français added

### v1.4.x
- ✨ New 3D node cards, heartbeat borders
- 🗼 Lattice tower + transformer grid icon
- 💰 Custom pricing tiers

### v1.0.0 – v1.3.x
- Foundation: standalone card, Visual Editor, particle flow, animated weather icons

---

## 📄 License

MIT — free to use, modify, and distribute.
If this card makes your dashboard better, please ⭐ **star the repo** — it genuinely helps.

---

## 🙏 Credits

Built by **[@doanlong1412](https://github.com/doanlong1412)** from 🇻🇳 Vietnam.

Solcast forecast integration powered by [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) by **[@BJReplay](https://github.com/BJReplay)**.
