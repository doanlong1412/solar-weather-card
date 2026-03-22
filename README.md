# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.4.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇬🇧 **English version:** [README.en.md](README.en.md)

Card tùy chỉnh cho Home Assistant — hiển thị toàn bộ hệ thống năng lượng mặt trời: Solar, Battery, Grid, tiêu thụ điện gia đình, thời tiết động, đồng hồ thực và cung mặt trời/mặt trăng.

**Không cần cài thêm bất kỳ plugin nào. Hoạt động độc lập, cấu hình entity hoàn toàn qua giao diện.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Tính năng nổi bật (v1.4.0)

### 🎨 Hiển thị & Giao diện
- 🕐 **Đồng hồ & Ngày** tiếng Việt, tự cập nhật mỗi 30 giây
- 🌤️ **Icon thời tiết CSS animation động** — nắng quay, mưa rơi, sét chớp, sương mù trôi, gió thổi
- 🌍 **Thời tiết hôm nay + dự báo ngày mai** có icon thu nhỏ
- 🌅 **Cung mặt trời + mặt trăng** di chuyển theo giờ thực tế
- ☀️ **Mặt trời đập nhịp tim** theo công suất solar thực tế
- 🌈 **Bầu trời đổi màu** theo thời điểm trong ngày (rạng đông → trưa → hoàng hôn → đêm)

### ⚡ Luồng điện
- **Chế độ Particle Bubble** — bong bóng chạy dọc đường cong Bezier với glow + sparkle + highlight trắng nhỏ
- **Chế độ Animated Line** — đường kẻ dash animation
- Tốc độ và mật độ hạt tự động tăng theo công suất

### 🔋 Pin
- Icon pin chi tiết với % hiển thị bên trong, tia sét khi đang sạc
- Thanh pin đổi màu: 🟢 xanh (>20%) → 🟡 vàng (10–20%) → 🔴 đỏ (≤10%)
- **ETA đầy pin / thời gian sử dụng còn lại** — hỗ trợ sensor Ah (LuxPower) × voltage thực tế

### 🏗️ Node Cards (Inverter, Battery, Grid, Home)
- Border nhấp nháy nhịp tim khi có luồng điện
- Icon 3D chi tiết: inverter có quạt quay + sóng sine chạy + LED nhấp nháy, cột điện với sứ cách điện, ngôi nhà 3D với mái ngói
- Hiển thị thêm thông tin trong thanh dưới: V BAT, V PV, V AC

### 📊 Thống kê & System
- Stats bar 5 ô: Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / Hệ thống
- Tính tiết kiệm theo **biểu giá bậc thang EVN**
- Ticker thông tin thời tiết + trạng thái pin chạy cuối card
- Trạng thái inverter: ❤️ ON / OFF với màu sắc tương ứng, nhiệt độ inverter & BMS

### 🎛️ Tùy chỉnh
- **Flow style**: Particle bubble hoặc Animated line
- **Ngôn ngữ**: 🇻🇳 Tiếng Việt hoặc 🇬🇧 English
- **Background opacity**: kéo thanh 0–100%
- Visual Config Editor — không cần sửa YAML

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng)

**Bước 1:** Thêm repo vào HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=frontend)

> Nếu nút không hoạt động, làm thủ công:
> **HACS → Frontend → ⋮ → Custom repositories**
> → URL: `https://github.com/doanlong1412/solar-weather-card` → Category: **Frontend** → Add

**Bước 2:** Tìm **Solar Weather Card** → **Install**

**Bước 3:** Hard reload trình duyệt (Ctrl+Shift+R)

---

### Cách 2 — Thủ công

1. Tải file [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest) từ trang Releases
2. Copy vào `/config/www/solar-weather-card.js`
3. Vào **Settings → Dashboards → Resources** → **Add resource**:
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Hard reload trình duyệt (Ctrl+Shift+R)

---

## ⚙️ Cấu hình

### Thêm card vào Dashboard

```yaml
type: custom:solar-weather-card
```

Sau khi thêm card, nhấn **✏️ Edit** — form sẽ hiện ra để điền entity ID. Không cần sửa YAML thủ công.

---

### Các entity có thể cấu hình

#### Thời tiết & Môi trường

| Field | Mô tả | Bắt buộc |
|-------|-------|:---:|
| 🌤️ Weather entity | `weather.xxx` | ✅ |
| 🌡️ Nhiệt độ ngoài trời | Sensor °C | ✅ |
| 💧 Độ ẩm ngoài trời | Sensor % | ✅ |
| 🌬️ Áp suất khí quyển | Sensor hPa | |
| ☀️ Chỉ số UV | Sensor UV index | |
| 🌧️ Dự báo mưa | Sensor văn bản | |

#### Solar

| Field | Mô tả | Bắt buộc |
|-------|-------|:---:|
| ⚡ Solar Array 1 (W) | Công suất dãy pin 1 | ✅ |
| ⚡ Solar Array 2 (W) | Công suất dãy pin 2 | |
| ⚡ Solar Array 1 Voltage (V) | Điện áp DC dãy 1 | |
| ⚡ Solar Array 2 Voltage (V) | Điện áp DC dãy 2 | |

#### Pin (Battery)

| Field | Mô tả | Bắt buộc |
|-------|-------|:---:|
| 🔋 Battery SOC (%) | Phần trăm sạc pin | ✅ |
| 🔋 Battery flow (W) | Dương = sạc, Âm = xả | ✅ |
| 🔋 Battery voltage (V DC) | Điện áp DC thực tế | |
| 🔋 Capacity sensor (Ah) | LuxPower trả về Ah — card tự nhân voltage ra Wh | |
| 🔋 Capacity manual (Wh) | Nhập tay nếu không có sensor — ví dụ: `26880` | |

> 💡 **Ưu tiên tính ETA:** Nhập tay Wh → Sensor Ah × Voltage → Mặc định 560Ah × 48V

#### Lưới điện & Nhà

| Field | Mô tả | Bắt buộc |
|-------|-------|:---:|
| 🔌 Grid flow (W) | Dương = xuất lưới, Âm = lấy lưới | ✅ |
| 🔌 Grid voltage (V AC) | Điện áp AC | |
| 🔌 Grid import today (kWh) | Lượng điện lấy từ lưới hôm nay | |
| 🏠 Home consumption (W) | Tổng tiêu thụ điện nhà | ✅ |

#### Thống kê & Hệ thống

| Field | Mô tả | Bắt buộc |
|-------|-------|:---:|
| 📊 Solar today (kWh) | Tổng sản lượng solar hôm nay | |
| 📊 Consumption today (kWh) | Tổng tiêu thụ hôm nay | |
| ⚙️ Inverter status | Trạng thái: Normal / online / OFF | |
| 🌡️ Inverter temperature (°C) | Nhiệt độ inverter | |
| 🌡️ BMS temperature (°C) | Nhiệt độ pin BMS | |

---

### Tùy chọn hiển thị

| Config key | Giá trị | Mặc định | Mô tả |
|---|---|---|---|
| `flow_style` | `particle` / `line` | `particle` | Kiểu luồng điện |
| `language` | `vi` / `en` | `vi` | Ngôn ngữ hiển thị |
| `background_opacity` | `0` – `100` | `45` | Độ trong suốt nền (%) |

---

### Ví dụ YAML đầy đủ (LuxPower + Seplos BMS)

```yaml
type: custom:solar-weather-card
flow_style: particle
language: vi
background_opacity: 45

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
battery_capacity_entity: sensor.lux_battery_capacity  # LuxPower trả về Ah

grid_flow_entity: sensor.lux_grid_flow_live
grid_voltage_entity: sensor.lux_grid_voltage_live
grid_today_entity: sensor.lux_power_from_grid_daily

home_consumption_entity: sensor.lux_home_consumption_live
solar_today_entity: sensor.tong_tai_tu_solar_hom_nay
consumption_today_entity: sensor.combined_energy

inverter_status_entity: sensor.luxpower
inverter_temp_entity: sensor.lux_internal_temperature_live
battery_temp_entity: sensor.seplos_seplos_bms_v3_ble_pack_0_temperature_1
```

---

## 🔋 Bảng tính tiết kiệm điện EVN

Card tự động tính theo **biểu giá bậc thang EVN** (2024):

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

### v1.4.0
- ✨ Node cards hoàn toàn mới: border nhịp tim, hex grid, icon 3D chi tiết
- ☀️ Mặt trời đập nhịp tim theo công suất solar
- 🌈 Bầu trời đổi màu theo thời điểm trong ngày
- ✦ Particle system cải tiến: highlight trắng nhỏ + glow layer riêng
- 📜 Ticker thông tin thời tiết + trạng thái pin chạy cuối card
- 📊 Stats bar 5 ô: Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / Hệ thống
- 🔋 Pin bar đổi màu đỏ/cam/xanh theo %
- 🌐 Tùy chọn ngôn ngữ: Tiếng Việt 🇻🇳 / English 🇬🇧
- 🪟 Tùy chọn độ trong suốt nền (0–100%)
- 🔌 Thêm sensor lấy lưới hôm nay (grid_today_entity)

### v1.3.1
- 🐛 Fix tính ETA: LuxPower trả Ah → nhân voltage thực tế ra Wh
- ✏️ Thêm ô nhập tay dung lượng Wh nếu không có sensor

### v1.3.0
- ✦ Thêm chế độ Particle Bubble flow
- ⚡ Hiển thị thêm điện áp PV trong inverter box

### v1.2.0
- 🌤️ Icon thời tiết CSS animation động
- 🌍 Bản đồ thời tiết tiếng Việt

### v1.1.0
- 🎛️ Visual Config Editor
- 📡 Tất cả entity cấu hình qua UI

### v1.0.0
- 🚀 Phiên bản đầu tiên

---

## 📄 License

MIT License — tự do sử dụng, chỉnh sửa, phân phối.
Nếu thấy hữu ích, hãy ⭐ **star repo** để ủng hộ!

---

## 🙏 Credits

Thiết kế và phát triển bởi **[@doanlong1412](https://github.com/doanlong1412)**.
