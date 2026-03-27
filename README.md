# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.7.1-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇬🇧 **English version:** [README.en.md](README.en.md)

Card tùy chỉnh cho Home Assistant — hiển thị toàn bộ hệ thống năng lượng mặt trời: Solar, Battery, Grid, tiêu thụ điện gia đình, thời tiết động, đồng hồ thực và cung mặt trời/mặt trăng.

**Không cần cài thêm bất kỳ plugin nào. Hoạt động độc lập, cấu hình entity hoàn toàn qua giao diện.**

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Tính năng nổi bật (v1.7.1)

### 🎨 Hiển thị & Giao diện
- 🕐 **Đồng hồ & Ngày** tự cập nhật mỗi 30 giây — hiển thị icon thời tiết ngay cả khi tắt info panel
- 🌤️ **Icon thời tiết CSS animation động** — nắng quay, mưa rơi, sét chớp, sương mù trôi, gió thổi
- 🌙 **Icon ban đêm tự động** — sau 18h hoặc trước 6h sáng, thời tiết quang đãng → hiển thị 🌙 thay vì ☀️ *(Mới v1.7)*
- 🌍 **Thời tiết hôm nay + dự báo ngày mai** (có thể bật/tắt riêng)
- 🌅 **Cung mặt trời + mặt trăng** di chuyển theo giờ thực tế
- ☀️ **Mặt trời đập nhịp tim** theo công suất solar thực tế
- 🌈 **Bầu trời đổi màu** theo thời điểm trong ngày
- 🕐 **Định dạng giờ 12h / 24h** — tùy chọn trong Display Options, nhãn dịch theo ngôn ngữ *(Mới v1.7.1)*

### ⚡ Luồng điện (3 kiểu)
- **✦ Particle** — bong bóng chạy dọc đường cong Bezier với glow + highlight
- **〰️ Wave** — sóng sin + dust particles + bright dots
- **── Line** — đường kẻ dash animation

### 🏗️ Node Cards (Battery, Inverter, Grid, Home)
- Border nhấp nháy nhịp tim khi có luồng điện (có thể tắt)
- Icon 3D chi tiết: pin, inverter với quạt quay, cột điện lattice + transformer, ngôi nhà 3D
- ⚡ **Badge bán điện** — hiển thị kWh xuất lưới ngay bên dưới node Grid *(Mới v1.7.1)*

### 🔋 Pin
- Thanh pin đổi màu: 🟢 xanh (>20%) → 🟡 vàng (10–20%) → 🔴 đỏ (≤10%)
- **ETA đầy pin / thời gian sử dụng còn lại** — hỗ trợ sensor Ah (LuxPower) × voltage

### 📊 Biểu đồ dự báo sản lượng Solar
- **Đường vàng** — sản lượng thực tế từng giờ trong ngày (ghi lại tự động)
- **Đường xanh lá** — dự báo Solcast chi tiết từng giờ (nếu đã cài Solcast)
- **Đường xanh nhạt** — dự báo tính toán từ công thức (fallback tự động)
- **Tổng hôm nay / ngày mai** hiển thị trực tiếp trên biểu đồ
- Có thể **bật/tắt hoàn toàn** trong Visual Editor (`show_forecast_chart`)

### 📊 Biểu đồ cột kWh *(Nâng cấp v1.7)*
- **3 cột**: Thực tế hôm nay / Dự báo hôm nay / Dự báo ngày mai
- **Nhãn % so sánh** ngay dưới mỗi cột — dự báo hôm nay = 100% là mốc chuẩn
  - `> 100%` → màu xanh (vượt dự báo)
  - `< 100%` → màu đỏ (dưới dự báo)
  - `= 100%` → màu trắng

### 🎨 Tùy chỉnh màu sắc
- **Màu viền/glow** của từng node: Battery, Grid, Inverter, Home
- **Màu hạt/sóng/đường chảy** (flow): Solar, Grid, Battery, Home
- **Màu biểu đồ**: đường dự báo và đường thực tế độc lập
- **Màu chữ chính** toàn bộ card
- Nút **Reset về mặc định** — khôi phục tất cả màu về bản gốc
- Thay đổi qua accordion **🎨 Color Theme** trong Visual Editor

### 📊 Thống kê & System
- Stats bar 5 ô: Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / Hệ thống
- **Thang giá tùy chỉnh** + **đơn vị tiền tệ** tùy chỉnh
- Ticker thông tin thời tiết + trạng thái pin

### 🎛️ Config Editor *(Nâng cấp v1.7.1)*
- **Accordion sections** — chia nhóm entity gọn gàng, ấn để mở/đóng
- **ha-entity-picker** — dropdown chọn entity như HA native, tự lọc theo domain
- **9 ngôn ngữ**: 🇻🇳 VI / 🇬🇧 EN / 🇩🇪 DE / 🇮🇹 IT / 🇫🇷 FR / 🇳🇱 NL / 🇵🇱 PL / 🇸🇪 SV / 🇭🇺 HU
- **Toàn bộ nhãn editor tự dịch** khi đổi ngôn ngữ — Display Options, toggles, Layout, Pricing, Color Theme, Solar/Grid/Battery options

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng)

**Bước 1:** Thêm Custom Repository vào HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=plugin)

> Nếu nút không hoạt động, thêm thủ công:
> **HACS → Frontend → ⋮ → Custom repositories**
> → URL: `https://github.com/doanlong1412/solar-weather-card` → Type: **Dashboard** → Add

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
| 🎨 **Display Options** | Flow style, ngôn ngữ, định dạng giờ, opacity, bật/tắt các tùy chọn hiển thị |
| ☁️ **Weather & Environment** | Weather entity, nhiệt độ, độ ẩm, UV, áp suất, dự báo mưa |
| ⚡ **Solar** | Công suất và điện áp các dãy pin |
| 🔋 **Battery** | SOC, luồng sạc/xả, điện áp, dung lượng |
| 🔌 **Grid & Home** | Luồng lưới, điện áp AC, tiêu thụ nhà, xuất lưới hôm nay |
| ⚙️ **System & Stats** | Inverter status, nhiệt độ |
| 💰 **Pricing & Currency** | Thang giá điện, đơn vị tiền tệ |

> 💡 **Badge số** (ví dụ `6/6`) hiện trên mỗi section cho biết bao nhiêu entity đã được cấu hình.

---

### Tùy chọn hiển thị

| Config key | Giá trị | Mặc định | Mô tả |
|---|---|---|---|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Kiểu luồng điện |
| `language` | `vi` / `en` / `de` / `it` / `fr` / `nl` / `pl` / `sv` / `hu` | `vi` | Ngôn ngữ |
| `time_format` | `24h` / `12h` | `24h` | Định dạng giờ *(Mới v1.7.1)* |
| `background_opacity` | `0` – `100` | `45` | Độ trong suốt nền (%) |
| `show_weather_info` | `true` / `false` | `true` | Hiện/ẩn panel thời tiết đầy đủ |
| `show_tomorrow` | `true` / `false` | `true` | Hiện/ẩn dự báo ngày mai |
| `show_node_glow` | `true` / `false` | `true` | Bật/tắt hiệu ứng glow quanh node |
| `show_forecast_chart` | `true` / `false` | `true` | Bật/tắt biểu đồ dự báo sản lượng solar |
| `currency` | ký hiệu bất kỳ | `đ` | Đơn vị tiền tệ |
| `pricing_tiers` | xem bên dưới | EVN VNĐ | Thang giá điện tùy chỉnh |

---

### Tùy chọn màu sắc

Tất cả tùy chọn màu đều có thể chỉnh qua accordion **🎨 Color Theme** trong Visual Editor (color picker trực quan). Hoặc thêm thẳng vào YAML:

| Config key | Mặc định | Mô tả |
|---|---|---|
| `color_node_bat` | `#28e6a0` | Màu viền node Battery |
| `color_node_grd` | `#00d7ff` | Màu viền node Grid |
| `color_node_inv` | `#b991ff` | Màu viền node Inverter |
| `color_node_hom` | `#ffb228` | Màu viền node Home |
| `color_flow_solar` | `#ffe83c` | Màu hạt/sóng luồng Solar |
| `color_flow_grid` | `#50beff` | Màu hạt/sóng luồng Grid |
| `color_flow_batt` | `#3ce878` | Màu hạt/sóng luồng Battery |
| `color_flow_home` | `#ff941d` | Màu hạt/sóng luồng Home |
| `color_chart_fc` | `#f5a623` | Màu đường dự báo trên biểu đồ |
| `color_chart_live` | `#7ed321` | Màu đường thực tế trên biểu đồ |
| `color_text_primary` | `#ffffff` | Màu chữ chính toàn bộ card |

---

### Thang giá điện tùy chỉnh

Để trống `pricing_tiers` → dùng biểu giá bậc thang **EVN Việt Nam** mặc định.

Format: `giới_hạn_kWh:giá` cách nhau bằng dấu phẩy. Dùng `∞` cho bậc cuối.

```
# Ví dụ giá điện Đức (€/kWh):
50:0.25,100:0.28,∞:0.32
```

---

## 📊 Hướng dẫn cài đặt Biểu đồ dự báo Solar

Biểu đồ hiển thị ngay dưới vùng node luồng điện, gồm:

- 🟡 **Đường vàng** — sản lượng thực tế từng giờ (ghi tự động mỗi giờ)
- 🟢 **Đường xanh lá** — dự báo Solcast chi tiết theo giờ (nếu đã cài Solcast)
- 🔵 **Đường xanh nhạt** — dự báo tính toán theo công thức mặt trời + mây (fallback)

> Biểu đồ **tự động chọn nguồn tốt nhất** — không bắt buộc phải cài Solcast.
> Bật/tắt bằng toggle `📊 Show solar forecast chart` trong **Display Options** của Visual Editor.

---

### Cách 1 — Dùng Solcast (khuyên dùng — dự báo chính xác nhất)

**Solcast** là integration miễn phí cung cấp dự báo sản lượng solar theo từng giờ, được tính dựa trên vị trí địa lý và thông số hệ thống của bạn.

📦 **Cài đặt tại:** [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) — tác giả **[@BJReplay](https://github.com/BJReplay)**

Sau khi cài Solcast và cấu hình xong hệ thống, thêm các entity sau vào card:

| Config key | Entity Solcast | Mô tả |
|---|---|---|
| `solcast_today_entity` | `sensor.solcast_pv_forecast_forecast_today` | Tổng dự báo hôm nay (kWh) |
| `solcast_tomorrow_entity` | `sensor.solcast_pv_forecast_forecast_tomorrow` | Tổng dự báo ngày mai (kWh) |
| `solcast_detail_entity` | `sensor.solcast_pv_forecast_forecast_today` | Dự báo chi tiết từng giờ (attributes) |

> 💡 Card tự đọc attribute `detailedForecast` hoặc `forecast` dạng list theo giờ và vẽ đường cong xanh lá.

---

### Cách 2 — Dùng sensor tính toán (không cần Solcast)

Nếu chưa cài Solcast, bạn tạo sensor tính toán dựa trên vị trí mặt trời và độ che phủ mây để làm đường dự báo fallback. Tham khảo README v1.6 để xem hướng dẫn tạo automation ghi `input_text.solar_live_curve`.

---

### Tóm tắt lựa chọn setup biểu đồ

| Trường hợp | Cần làm |
|---|---|
| Chỉ muốn xem biểu đồ đơn giản | Chỉ cần bật `show_forecast_chart: true` — card vẽ dự báo từ dữ liệu sẵn có |
| Muốn dự báo chính xác theo thời tiết thực | Tạo `sensor.solar_forecast_now` + thêm vào `solcast_detail_entity` |
| Muốn chính xác nhất + thực tế từng giờ | Cài Solcast + tạo automation ghi `input_text.solar_live_curve` |

---

## 📋 Các entity có thể cấu hình

### ☁️ Weather & Environment

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `weather_entity` | `weather.xxx` | ✅ |
| `temperature_entity` | Sensor nhiệt độ ngoài trời (°C) | ✅ |
| `humidity_entity` | Sensor độ ẩm (%) | ✅ |
| `pressure_entity` | Sensor áp suất (hPa) | |
| `uv_entity` | Sensor UV index | |
| `hourly_forecast_entity` | Sensor dự báo theo giờ (ví dụ: Tomorrow.io) | |

### ⚡ Solar

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `solar_pv1_entity` | Công suất dãy 1 (W) | ✅ |
| `solar_pv2_entity` | Công suất dãy 2 (W) | |
| `solar_pv1_voltage_entity` | Điện áp DC dãy 1 (V) | |
| `solar_pv2_voltage_entity` | Điện áp DC dãy 2 (V) | |
| `solar_today_entity` | Tổng sản lượng hôm nay (kWh) | |
| `solar_dailyuse_entity` | Solar nhà dùng hôm nay (kWh) | |
| `solar_live_entity` | Tổng công suất solar live (W) | |
| `solar_live_curve_entity` | Đường cong thực tế (`input_text`) | |
| `solcast_today_entity` | Dự báo Solcast hôm nay (kWh) | |
| `solcast_tomorrow_entity` | Dự báo Solcast ngày mai (kWh) | |
| `solcast_detail_entity` | Dự báo chi tiết Solcast hoặc sensor tính toán | |

### 🔋 Battery

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `battery_soc_entity` | % sạc (SOC) | ✅ |
| `battery_flow_entity` | Luồng sạc/xả (W, + sạc / - xả) | ✅ |
| `battery_voltage_entity` | Điện áp DC (V) | |
| `battery_capacity_entity` | Dung lượng sensor (Ah) — LuxPower | |
| `battery_capacity_wh` | Dung lượng thủ công (Wh) — vd: `26880` | |
| `battery_temp_entity` | Nhiệt độ BMS (°C) | |

> 💡 **Ưu tiên tính ETA:** Nhập tay Wh → Sensor Ah × Voltage → Mặc định 560Ah × 48V

### 🔌 Grid & Home

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `grid_flow_entity` | Luồng lưới (W, + xuất / - nhập) | ✅ |
| `home_consumption_entity` | Tiêu thụ điện nhà (W) | ✅ |
| `grid_voltage_entity` | Điện áp AC (V) | |
| `grid_today_entity` | Điện lấy từ lưới hôm nay (kWh) | |
| `grid_export_today_entity` | Điện xuất lên lưới hôm nay (kWh) *(Mới v1.7.1)* | |
| `consumption_today_entity` | Tiêu thụ hôm nay (kWh) | |
| `inverter_switch_entity` | Switch inverter (grid-direct mode) | |
| `grid_direct_entity` | Công suất lấy lưới thẳng khi inverter tắt (W) | |

### ⚙️ System & Stats

| Config key | Mô tả | Bắt buộc |
|---|---|:---:|
| `inverter_status_entity` | Trạng thái: Normal / online / OFF | |
| `inverter_temp_entity` | Nhiệt độ inverter (°C) | |
| `battery_temp_entity` | Nhiệt độ BMS (°C) | |

---

## 🗂️ Ví dụ YAML đầy đủ (LuxPower + Seplos BMS + Solcast)

```yaml
type: custom:solar-weather-card
flow_style: wave
language: vi
time_format: 24h
background_opacity: 45
show_weather_info: true
show_tomorrow: true
show_node_glow: true
show_forecast_chart: true
currency: đ

weather_entity: weather.forecast_nha
temperature_entity: sensor.outdoor_temperature_aht20
humidity_entity: sensor.outdoor_humidity_aht20
pressure_entity: sensor.outdoor_pressure
uv_entity: sensor.thoi_tiet_viet_yen_chi_so_uv
hourly_forecast_entity: sensor.tomorrow_raw_hourly

solar_pv1_entity: sensor.lux_solar_output_array_1_live
solar_pv2_entity: sensor.lux_solar_output_array_2_live
solar_pv1_voltage_entity: sensor.lux_solar_voltage_array_1_live
solar_pv2_voltage_entity: sensor.lux_solar_voltage_array_2_live
solar_today_entity: sensor.tong_tai_tu_solar_hom_nay
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

### v1.7.1
- 🌐 **4 ngôn ngữ mới** — 🇳🇱 Hà Lan (`nl`), 🇵🇱 Ba Lan (`pl`), 🇸🇪 Thụy Điển (`sv`), 🇭🇺 Hungary (`hu`) — tổng 9 ngôn ngữ, đầy đủ tên ngày/tháng, điều kiện thời tiết, nhãn node, ticker
- 🌍 **Visual Editor tự dịch theo ngôn ngữ** — toàn bộ nhãn Display Options, toggles, Layout, Pricing, Color Theme, Solar/Grid/Battery options đổi ngay khi click chọn ngôn ngữ
- 🕐 **Định dạng giờ 12h / 24h** — tùy chọn trong Display Options; nhãn dịch theo ngôn ngữ đang chọn
- ⚡ **Grid Export Today** — thêm field `grid_export_today_entity`; hiển thị badge `⚡ X.XX kWh` bên dưới node Grid; ẩn tự động khi ≤ 0.005 kWh

### v1.7.0
- 🌙 **Icon ban đêm tự động** — slot sau 18h hoặc trước 6h sáng, thời tiết quang đãng (code `1000`, `1100`) → hiển thị 🌙 thay vì ☀️/🌤️; điều kiện có mây/mưa/sấm giữ nguyên emoji
- 📊 **Biểu đồ cột — % so với dự báo hôm nay** — nhãn % ngay dưới mỗi cột; dự báo hôm nay = 100%; màu xanh/đỏ/trắng theo mức
- 🌍 **Visual Editor — nhãn tiếng Việt** — các nhãn trong editor hiển thị tên tiếng Việt trong ngoặc đơn kèm font nhỏ hơn; thay đổi theo ngôn ngữ đang chọn

### v1.6.0
- 📊 **Biểu đồ dự báo sản lượng Solar** — đường thực tế theo giờ + đường dự báo Solcast/tính toán
- 🔌 **Tích hợp Solcast** — đọc dự báo chi tiết từng giờ từ [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) của **@BJReplay**
- 🧮 **Sensor tính toán fallback** — dự báo dựa trên vị trí mặt trời + độ che phủ mây khi không có Solcast
- 📝 **Automation ghi thực tế** — lưu sản lượng thực mỗi giờ vào `input_text.solar_live_curve`
- 🎛️ **Toggle ẩn/hiện biểu đồ** — `show_forecast_chart` trong Visual Editor
- ⚡ **Công suất thiết kế solar** (`solar_design_wp`) — nhập Wp hệ thống để biểu đồ tự co giãn trục Y chính xác theo thực tế
- 🎨 **Color Theme** — tùy chỉnh màu sắc toàn bộ card: node border, flow/particle, biểu đồ, màu chữ; nút Reset về mặc định

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

Tích hợp dự báo Solcast sử dụng [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) — tác giả **[@BJReplay](https://github.com/BJReplay)**.
