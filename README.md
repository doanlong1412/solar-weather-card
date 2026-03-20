# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.1.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)

Custom card cho Home Assistant hiển thị toàn bộ hệ thống năng lượng mặt trời — Solar, Battery, Grid, tiêu thụ điện gia đình — kèm thời tiết và đồng hồ.

> **Không cần cài thêm bất kỳ plugin nào.** Hoạt động độc lập, cấu hình entity hoàn toàn qua giao diện kéo thả.

---

## ✨ Tính năng

- 🕐 **Đồng hồ & Ngày** theo giờ Việt Nam, tự cập nhật mỗi 30 giây
- 🌤️ **Thời tiết** hiện tại + dự báo ngày mai (nhiệt độ cao/thấp)
- 🌅 **Cung mặt trời / mặt trăng** động theo giờ thực tế
- ⚡ **Luồng điện animated** (Solar → Inverter → Battery / Grid / Home)
- 🔋 **Pin**: % sạc, chiều sạc/xả, ETA đầy pin hoặc thời gian sử dụng còn lại
- 📊 **Thống kê hôm nay**: Solar kWh, tiêu thụ, tiết kiệm điện (tính theo bậc thang EVN)
- ⚙️ **System status**: trạng thái inverter, nhiệt độ inverter & BMS
- 🎛️ **Visual Config Editor** — chọn entity qua UI, không cần sửa YAML

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng)

1. Mở HACS → **Frontend**
2. Nhấn ⋮ → **Custom repositories**
3. Nhập URL repo → Category: **Frontend** → **Add**
4. Tìm **Solar Weather Card** → **Install**
5. Reload trình duyệt

### Cách 2 — Thủ công

1. Tải file `solar-weather-card.js`
2. Copy vào `/config/www/solar-weather-card.js`
3. Vào **Settings → Dashboards → Resources** → **Add resource**:
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Reload trình duyệt

---

## ⚙️ Cấu hình

### Thêm card vào Dashboard

```yaml
type: custom:solar-weather-card
```

Sau khi thêm card, nhấn **✏️ Edit** → form cấu hình sẽ hiện ra để bạn điền entity.

### Các entity cần cấu hình

| Field trong Editor | Mô tả | Bắt buộc |
|--------------------|-------|:---------:|
| 🌤️ Weather entity | Entity thời tiết (weather.xxx) | ✅ |
| 🌡️ Nhiệt độ ngoài trời | sensor nhiệt độ (°C) | ✅ |
| 💧 Độ ẩm ngoài trời | sensor độ ẩm (%) | ✅ |
| 🌬️ Áp suất khí quyển | sensor áp suất (hPa) | |
| ☀️ Chỉ số UV | sensor UV index | |
| 🌧️ Dự báo mưa | sensor dự báo mưa | |
| ⚡ Solar Array 1 (W) | Công suất solar dãy 1 | ✅ |
| ⚡ Solar Array 2 (W) | Công suất solar dãy 2 | |
| 🔋 Pin % (SOC) | % sạc của pin | ✅ |
| 🔋 Luồng pin (W) | Dương = sạc, Âm = xả | ✅ |
| 🔋 Điện áp pin (V DC) | Điện áp pin | |
| 🔋 Dung lượng pin (Wh) | Tổng dung lượng pin | |
| 🔌 Luồng lưới điện (W) | Dương = xuất lưới, Âm = lấy lưới | ✅ |
| 🔌 Điện áp lưới (V AC) | Điện áp AC | |
| 🏠 Tiêu thụ nhà (W) | Tổng tiêu thụ điện nhà | ✅ |
| 📊 Solar hôm nay (kWh) | Tổng sản lượng solar trong ngày | |
| 📊 Tiêu thụ hôm nay (kWh) | Tổng tiêu thụ trong ngày | |
| ⚙️ Trạng thái inverter | sensor trạng thái (Normal/online...) | |
| 🌡️ Nhiệt độ inverter (°C) | Nhiệt độ bên trong inverter | |
| 🌡️ Nhiệt độ BMS (°C) | Nhiệt độ BMS của pin | |

### Ví dụ YAML đầy đủ (LuxPower + Seplos BMS)

```yaml
type: custom:solar-weather-card
weather_entity: weather.forecast_nha
temperature_entity: sensor.outdoor_temperature_aht20
humidity_entity: sensor.outdoor_humidity_aht20
pressure_entity: sensor.outdoor_pressure
uv_entity: sensor.thoi_tiet_viet_yen_chi_so_uv
rain_entity: sensor.thoi_tiet_viet_yen_du_bao_mua
solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
battery_soc_entity: sensor.lux_battery
battery_flow_entity: sensor.lux_battery_flow_live
battery_voltage_entity: sensor.lux_battery_voltage_live
battery_capacity_entity: sensor.lux_battery_capacity
grid_flow_entity: sensor.lux_grid_flow_live
grid_voltage_entity: sensor.lux_grid_voltage_live
home_consumption_entity: sensor.lux_home_consumption_live
solar_today_entity: sensor.tong_tai_tu_solar_hom_nay
consumption_today_entity: sensor.combined_energy
inverter_status_entity: sensor.luxpower
inverter_temp_entity: sensor.lux_internal_temperature_live
battery_temp_entity: sensor.seplos_seplos_bms_v3_ble_pack_0_temperature_1
```

---

## 🖥️ Tương thích

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Giao diện | Lovelace (default & custom) |
| Thiết bị | Mobile & Desktop |
| Dependencies | Không cần cài thêm gì |

---

## 🔋 Tính năng tính tiết kiệm điện

Card tự động tính tiết kiệm điện theo **biểu giá bậc thang EVN** (2024):

| Bậc | Từ | Đến | Đơn giá |
|-----|-----|-----|---------|
| 1 | 0 | 50 kWh | 1.984 đ/kWh |
| 2 | 51 | 100 kWh | 2.050 đ/kWh |
| 3 | 101 | 200 kWh | 2.380 đ/kWh |
| 4 | 201 | 300 kWh | 2.998 đ/kWh |
| 5 | 301 | 400 kWh | 3.350 đ/kWh |
| 6 | 400+ | | 3.460 đ/kWh |

---

## 📄 License

MIT License — tự do sử dụng, chỉnh sửa, phân phối.  
Nếu thấy hữu ích, ⭐ **star repo** để ủng hộ nhé!

---

## 🙏 Credits

Thiết kế và phát triển bởi chủ repo.  
Được hỗ trợ chuyển đổi bởi [Claude AI](https://claude.ai).
