# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.5.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇬🇧 **English version:** [README.en.md](README.en.md)

Card tùy chỉnh cho Home Assistant — hiển thị toàn bộ hệ thống năng lượng mặt trời: Solar, Battery, Grid, tiêu thụ điện gia đình, thời tiết động, đồng hồ thực và cung mặt trời/mặt trăng.

**Không cần cài thêm bất kỳ plugin nào. Hoạt động độc lập, cấu hình entity hoàn toàn qua giao diện.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Tính năng nổi bật (v1.5.1)

### 🎨 Hiển thị & Giao diện
- 🕐 **Đồng hồ & Ngày** tự cập nhật mỗi 30 giây — hiển thị icon thời tiết ngay cả khi tắt info panel
- 🌤️ **Icon thời tiết CSS animation động** — nắng quay, mưa rơi, sét chớp, sương mù trôi, gió thổi
- 🌍 **Thời tiết hôm nay + dự báo ngày mai** (có thể bật/tắt riêng)
- 🌅 **Cung mặt trời + mặt trăng** di chuyển theo giờ thực tế
- ☀️ **Mặt trời đập nhịp tim** theo công suất solar thực tế
- 🌈 **Bầu trời đổi màu** theo thời điểm trong ngày

### ⚡ Luồng điện (3 kiểu)
- **✦ Particle** — bong bóng chạy dọc đường cong Bezier với glow + highlight
- **〰️ Wave** — sóng sin + dust particles + bright dots (hiệu ứng mới)
- **── Line** — đường kẻ dash animation

### 🏗️ Node Cards (Battery, Inverter, Grid, Home)
- Border nhấp nháy nhịp tim khi có luồng điện (có thể tắt)
- Icon 3D chi tiết: pin, inverter với quạt quay, cột điện lattice + transformer, ngôi nhà 3D

### 🔋 Pin
- Thanh pin đổi màu: 🟢 xanh (>20%) → 🟡 vàng (10–20%) → 🔴 đỏ (≤10%)
- **ETA đầy pin / thời gian sử dụng còn lại** — hỗ trợ sensor Ah (LuxPower) × voltage

### 📊 Thống kê & System
- Stats bar 5 ô: Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / Hệ thống
- **Thang giá tùy chỉnh** + **đơn vị tiền tệ** tùy chỉnh
- Ticker thông tin thời tiết + trạng thái pin

### 🎛️ Config Editor
- **Accordion sections** — chia nhóm entity gọn gàng, ấn để mở/đóng
- **ha-entity-picker** — dropdown chọn entity như HA native, tự lọc theo domain
- **5 ngôn ngữ**: 🇻🇳 Tiếng Việt / 🇬🇧 English / 🇩🇪 Deutsch / 🇮🇹 Italiano / 🇫🇷 Français

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng)

**Bước 1:** Thêm Custom Repository vào HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=dashboard)

> Nếu nút không hoạt động, thêm thủ công:
> **HACS → Frontend → ⋮ → Custom repositories**
> → URL: `https://github.com/doanlong1412/solar-weather-card` → Category: **Frontend** → Add

**Bước 2:** Tìm **Solar Weather Card** → **Install**

**Bước 3:** Hard reload trình duyệt (Ctrl+Shift+R)

---

### Cách 2 — Thủ công

1. Tải file [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest)
2. Copy vào `/config/www/solar-weather-card.js`
3. Vào **Settings → Dashboards → Resources** → **Add resource**:
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Hard reload trình duyệt (Ctrl+Shift+R)

---

## ⚙️ Cấu hình card

### Bước 1 — Thêm card vào Dashboard

```yaml
type: custom:solar-weather-card
```

Sau khi thêm card, nhấn **✏️ Edit** để mở Config Editor.

### Bước 2 — Giao diện Config Editor

![Config Editor](assets/editor-preview.png)

Config Editor chia thành các **accordion section** — ấn vào header để mở rộng từng nhóm:

| Section | Nội dung |
|---------|---------|
| 🎨 **Display Options** | Flow style, ngôn ngữ, opacity, bật/tắt các tùy chọn hiển thị |
| ☁️ **Weather & Environment** | Weather entity, nhiệt độ, độ ẩm, UV, áp suất, dự báo mưa |
| ⚡ **Solar** | Công suất và điện áp các dãy pin |
| 🔋 **Battery** | SOC, luồng sạc/xả, điện áp, dung lượng |
| 🔌 **Grid & Home** | Luồng lưới, điện áp AC, tiêu thụ nhà |
| ⚙️ **System & Stats** | Inverter status, nhiệt độ |
| 💰 **Pricing & Currency** | Thang giá điện, đơn vị tiền tệ |

> 💡 **Badge số** (ví dụ `6/6`) hiện trên mỗi section cho biết bao nhiêu entity đã được cấu hình.

---

### Tùy chọn hiển thị

| Config key | Giá trị | Mặc định | Mô tả |
|---|---|---|---|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Kiểu luồng điện |
| `language` | `vi` / `en` / `de` / `it` / `fr` | `vi` | Ngôn ngữ |
| `background_opacity` | `0` – `100` | `45` | Độ trong suốt nền (%) |
| `show_weather_info` | `true` / `false` | `true` | Hiện/ẩn panel thời tiết đầy đủ |
| `show_tomorrow` | `true` / `false` | `true` | Hiện/ẩn dự báo ngày mai |
| `show_node_glow` | `true` / `false` | `true` | Bật/tắt hiệu ứng glow quanh node |
| `currency` | ký hiệu bất kỳ | `đ` | Đơn vị tiền tệ |
| `pricing_tiers` | xem bên dưới | EVN VNĐ | Thang giá điện tùy chỉnh |

---

### Thang giá điện tùy chỉnh

Để trống `pricing_tiers` → dùng biểu giá bậc thang **EVN Việt Nam** mặc định.

Format: `giới_hạn_kWh:giá` cách nhau bằng dấu phẩy. Dùng `∞` cho bậc cuối.

```
# Ví dụ giá điện Đức (€/kWh):
50:0.25,100:0.28,∞:0.32
```

---

### Các entity có thể cấu hình

#### ☁️ Weather & Environment

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `weather_entity` | `weather.xxx` | ✅ |
| `temperature_entity` | Sensor nhiệt độ ngoài trời (°C) | ✅ |
| `humidity_entity` | Sensor độ ẩm (%) | ✅ |
| `pressure_entity` | Sensor áp suất (hPa) | |
| `uv_entity` | Sensor UV index | |
| `rain_entity` | Sensor dự báo mưa | |

#### ⚡ Solar

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `solar_pv1_entity` | Công suất dãy 1 (W) | ✅ |
| `solar_pv2_entity` | Công suất dãy 2 (W) | |
| `solar_pv1_voltage_entity` | Điện áp DC dãy 1 (V) | |
| `solar_pv2_voltage_entity` | Điện áp DC dãy 2 (V) | |
| `solar_today_entity` | Tổng sản lượng hôm nay (kWh) | |

#### 🔋 Battery

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `battery_soc_entity` | % sạc (SOC) | ✅ |
| `battery_flow_entity` | Luồng sạc/xả (W, + sạc / - xả) | ✅ |
| `battery_voltage_entity` | Điện áp DC (V) | |
| `battery_capacity_entity` | Dung lượng sensor (Ah) — LuxPower | |
| `battery_capacity_wh` | Dung lượng thủ công (Wh) — vd: `26880` | |
| `battery_temp_entity` | Nhiệt độ BMS (°C) | |

> 💡 **Ưu tiên tính ETA:** Nhập tay Wh → Sensor Ah × Voltage → Mặc định 560Ah × 48V

#### 🔌 Grid & Home

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `grid_flow_entity` | Luồng lưới (W, + xuất / - nhập) | ✅ |
| `home_consumption_entity` | Tiêu thụ điện nhà (W) | ✅ |
| `grid_voltage_entity` | Điện áp AC (V) | |
| `grid_today_entity` | Điện lấy từ lưới hôm nay (kWh) | |
| `consumption_today_entity` | Tiêu thụ hôm nay (kWh) | |
| `inverter_switch_entity` | Switch inverter (grid-direct mode) | |
| `grid_direct_entity` | Công suất lấy lưới thẳng khi inverter tắt (W) | |

#### ⚙️ System & Stats

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `inverter_status_entity` | Trạng thái: Normal / online / OFF | |
| `inverter_temp_entity` | Nhiệt độ inverter (°C) | |

---

### Ví dụ YAML đầy đủ (LuxPower + Seplos BMS)

```yaml
type: custom:solar-weather-card
flow_style: wave
language: vi
background_opacity: 45
show_weather_info: true
show_tomorrow: true
show_node_glow: true
currency: đ

weather_entity: weather.forecast_nha
temperature_entity: sensor.outdoor_temperature_aht20
humidity_entity: sensor.outdoor_humidity_aht20
pressure_entity: sensor.outdoor_pressure
uv_entity: sensor.thoi_tiet_viet_yen_chi_so_uv
rain_entity: sensor.thoi_tiet_viet_yen_du_bao_mua

solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
solar_pv1_voltage_entity: sensor.lux_solar_voltage_array_1_live
solar_pv2_voltage_entity: sensor.lux_solar_voltage_array_2_live

battery_soc_entity: sensor.lux_battery
battery_flow_entity: sensor.lux_battery_flow_live
battery_voltage_entity: sensor.lux_battery_voltage_live
battery_capacity_entity: sensor.lux_battery_capacity

grid_flow_entity: sensor.lux_grid_flow_live
grid_voltage_entity: sensor.lux_grid_voltage_live
grid_today_entity: sensor.lux_power_from_grid_daily

home_consumption_entity: sensor.lux_home_consumption_live
solar_today_entity: sensor.tong_tai_tu_solar_hom_nay
consumption_today_entity: sensor.combined_energy

inverter_status_entity: sensor.luxpower
inverter_switch_entity: switch.inverter_lux_inverter
grid_direct_entity: sensor.cong_suat_power_grid
inverter_temp_entity: sensor.lux_internal_temperature_live
battery_temp_entity: sensor.seplos_seplos_bms_v3_ble_pack_0_temperature_1
```

---

## 🔋 Biểu giá EVN mặc định (2024)

| Bậc | Khoảng | Đơn giá |
|-----|--------|---------|
| 1 | 0 – 50 kWh | 1.984 đ/kWh |
| 2 | 51 – 100 kWh | 2.050 đ/kWh |
| 3 | 101 – 200 kWh | 2.380 đ/kWh |
| 4 | 201 – 300 kWh | 2.998 đ/kWh |
| 5 | 301 – 400 kWh | 3.350 đ/kWh |
| 6 | 400+ kWh | 3.460 đ/kWh |

---

## 🖥️ Tương thích

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboard |
| Thiết bị | Mobile & Desktop |
| Dependencies | Không cần cài thêm |
| Trình duyệt | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.5.1
- 🌤️ Khi tắt `show_weather_info` vẫn giữ icon thời tiết bên cạnh đồng hồ
- 🌡️ Fix đọc nhiệt độ/độ ẩm từ sensor thực tế
- 📅 Dự báo ngày mai ưu tiên `sensor.tomorrow_raw_hourly` (Tomorrow.io), fallback về `wfc[1]`
- 🌡️ Fix forecast hi/lo hôm nay từ `wfc[0]` đúng như YAML gốc

### v1.5.0
- 〰️ Flow style thứ 3: **Wave** — sóng sin + dust particles + bright dots
- ✨ Tùy chọn bật/tắt node glow (`show_node_glow`)
- 🏷️ Xóa label công suất cạnh flow
- 🔽 **ha-entity-picker** — chọn entity bằng dropdown native HA, lọc theo domain
- 📁 **Accordion sections** trong Config Editor — chia nhóm entity gọn gàng
- 🌐 Thêm 🇫🇷 Français — tổng 5 ngôn ngữ
- 🏳️ Icon cờ quốc gia thật trong bộ chọn ngôn ngữ

### v1.4.1
- 🗼 Cột điện mới: lattice tower + transformer chi tiết
- ⚡ FlowLevel có type riêng (solar/battery/grid/home)
- 💰 Thang giá điện tùy chỉnh + đơn vị tiền tệ
- 🌤️ Toggle bật/tắt dự báo ngày mai

### v1.4.0
- ✨ Node cards hoàn toàn mới: border nhịp tim, hex grid, icon 3D
- ☀️ Mặt trời đập nhịp tim theo công suất solar
- 🌈 Bầu trời đổi màu theo thời điểm trong ngày
- 📊 Stats bar 5 ô + ticker thông tin

### v1.0.0 – v1.3.x
- Phiên bản nền tảng: standalone card, Visual Config Editor, particle flow, weather icons

---

## 📄 License

MIT License — tự do sử dụng, chỉnh sửa, phân phối.
Nếu thấy hữu ích, hãy ⭐ **star repo** để ủng hộ!

---

## 🙏 Credits

Thiết kế và phát triển bởi **[@doanlong1412](https://github.com/doanlong1412)** từ 🇻🇳 Việt Nam.
