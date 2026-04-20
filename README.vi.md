# ☀️ Solar Weather Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![version](https://img.shields.io/badge/version-1.8.0-blue)
![HA](https://img.shields.io/badge/Home%20Assistant-2023.1+-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

> 🇬🇧 **English version (main):** [README.md](README.md)

**Dashboard năng lượng mặt trời — nhưng sống động thật sự.** Các hạt sáng chạy dọc theo đường dây điện theo thời gian thực. Mặt trời di chuyển đúng theo lịch mọc/lặn của bạn. Pin đập nhịp. Từng phòng trong nhà hiện công suất tức thời — và bạn có thể kéo chúng đi đâu tùy thích trên màn hình.

Một card. Không cần cài thêm gì. Chạy thẳng vào Home Assistant.

---

## 📸 Preview

![Solar Weather Card Preview](assets/preview.png)

---

## ✨ Điểm khác biệt

Hầu hết các energy card chỉ hiển thị con số. Card này cho bạn thấy **chuyện gì đang xảy ra** — solar đổ vào inverter, dòng điện chảy xuống pin, từng phòng kéo phần của mình từ node nhà. Bạn biết hệ thống đang khỏe hay đang vất vả trước khi đọc bất kỳ số nào.

Và trong **v1.8**, mỗi phòng trong nhà là một công dân hạng nhất trên card — tile riêng, luồng điện riêng, và toàn quyền điều chỉnh vị trí để layout vừa đúng màn hình của bạn.

---

## 🚀 Tính năng

### ⚡ Luồng điện — 3 kiểu, không giật *(v1.8 viết lại)*

Engine flow được viết lại hoàn toàn trong v1.8. Particles không còn reset hay giật khi data sensor cập nhật — chúng cứ chạy mãi.

| Kiểu | Mô tả |
|------|-------|
| **✦ Spark** | Particles kiểu YAML `stroke-dasharray` — nhẹ, mượt, mặc định mới |
| **〰️ Wave** | Sóng sin + dust particles + chấm sáng |
| **── Line** | Đường dash animation |

Tốc độ, kích thước và số lượng hạt tự động scale theo công suất thực tế.

---

### 🏠 Phòng & Thiết bị *(Mới v1.8 — tính năng chính)*

Tối đa **6 tile phòng/thiết bị** hiển thị bên dưới sơ đồ năng lượng, mỗi phòng được nối với node nhà bằng luồng điện riêng. Cấu hình từ 2 đến 6 phòng qua editor.

**Mỗi tile hiển thị:**
- Tên phòng và icon (MDI-style SVG tích hợp, hoặc emoji tùy chọn)
- Công suất tức thời, to và rõ ràng
- Thanh năng lượng hiển thị tỉ lệ công suất hiện tại
- Tile tự mờ đi khi thiết bị tắt (công suất = 0)

**Điều chỉnh vị trí từng phòng** — mỗi tile có slider X và Y riêng trong editor. Kéo tile phòng sang trái, phải, lên, hoặc thậm chí *lên trên* node nhà nếu phù hợp với màn hình. Đường branch flow tự tính lại để đến đúng chỗ bạn đặt.

```yaml
rooms:
  - name: Phòng khách
    entity: sensor.pzem_nhachinh_power
  - name: Phòng bếp
    entity: sensor.pzem_nhabep_power
  - name: Bếp từ
    icon: "🔥"
    entity: sensor.bep_tu_power
  - name: Office
    entity: sensor.cong_suat_power_office
  - name: Phòng ngủ
    icon: "🛏️"
    entity: sensor.dieu_hoa_power
  - name: Giặt ủi
    icon: "🧺"
    entity: sensor.may_giat_power

room_count: 6   # 2–6 tile
```

> Offset vị trí từng phòng được chỉnh trực tiếp bằng slider trong **📐 Node Layout** của editor — không cần sửa YAML.

---

### 🔋 Pin — mọi trạng thái đều có animation

Icon pin cho bạn biết đang xảy ra chuyện gì mà không cần đọc số:

| Trạng thái | Hiệu ứng |
|-----------|----------|
| Đang sạc | ⚡ Tia sét nhấp nháy |
| Đang xả | 3 mũi tên chạy xuống liên tục |
| Yếu (≤ 20%) | Dấu `!` đỏ nháy nhanh |
| Bình thường / standby | Dấu ✓ xanh nhấp nháy chậm |

Thanh màu: 🟢 xanh (> 50%) → 🟡 vàng (20–50%) → 🔴 đỏ (≤ 20%)

**ETA đầy pin / thời gian còn lại** tính theo thời gian thực, hiện ngay bên dưới thanh. Hỗ trợ sensor Ah (LuxPower) × voltage, nhập tay Wh, hoặc giá trị mặc định.

---

### 🌤️ Thời tiết — sống động và tự động

- Icon thời tiết CSS animation: mặt trời quay ☀️, mưa rơi 🌧️, sét chớp ⚡, sương mù trôi 🌫️, gió thổi 💨
- Icon ban đêm tự động — trời quang sau 18h hoặc trước 6h → 🌙 thay vì ☀️
- Thời tiết hôm nay + dự báo ngày mai (bật/tắt độc lập)
- Nhiệt độ ngoài trời, độ ẩm, chỉ số UV, áp suất khí quyển
- Strip dự báo theo giờ (cần sensor Tomorrow.io)
- Đồng hồ 12h / 24h, tự cập nhật mỗi 30 giây

---

### ☀️ Cung mặt trời & bầu trời động

Mặt trời di chuyển trên đường cong bezier theo đúng giờ mọc/lặn thực tế tại vị trí của bạn. Màu nền thay đổi từ xanh bình minh → vàng trưa → cam hoàng hôn. Sau khi lặn, mặt trăng xuất hiện và đi theo cung của nó trong bầu trời đêm.

Mặt trời **đập nhanh hơn và sáng hơn** khi công suất solar tăng — bạn có thể thấy hệ thống đang làm việc chăm chỉ lúc giữa trưa.

---

### 🗼 Node cards

Bốn node chính — Pin, Inverter, Lưới điện, Nhà — mỗi node có:
- Icon SVG 3D chi tiết (pin với 4 cell + terminal, inverter với quạt quay, cột điện lattice + transformer, ngôi nhà 3D với gara)
- Border đập nhịp tim khi có luồng điện (tắt được)
- Công suất tức thời + nhãn chiều
- Float animation nhẹ nhàng

**Tua bin gió** quay bên cạnh node nhà — trang trí thêm phần sinh động.

---

### 📊 Biểu đồ dự báo Solar

Biểu đồ compact đặt cạnh node nhà hiển thị:
- 🟡 Sản lượng thực tế ghi từng giờ (qua automation `input_text`)
- 🟢 Dự báo Solcast chi tiết nếu đã cài [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar)
- Dự báo tính toán từ vị trí mặt trời × độ mây (auto-fallback)
- Đường marker thời gian hiện tại

---

### 📊 Biểu đồ cột kWh

Ba cột — Thực tế hôm nay / Dự báo hôm nay / Dự báo ngày mai — kèm nhãn % so với dự báo hôm nay (100% là mốc chuẩn), màu sắc xanh/đỏ/trắng.

---

### 🎨 Tùy chỉnh màu sắc đầy đủ

Mọi màu đều chỉnh được qua editor:
- Màu viền/glow từng node (Pin, Lưới, Inverter, Nhà)
- Màu hạt/sóng flow từng đường (Solar, Lưới, Pin, Nhà)
- Màu biểu đồ (đường dự báo và đường thực tế độc lập)
- Màu chữ chính
- Gradient nền — 7 preset sẵn có hoặc tùy chỉnh hoàn toàn với 2 color picker

Nút **Reset về mặc định** khôi phục tất cả chỉ một cú click.

---

### 📈 Thanh thống kê

Năm vòng tròn ở cuối: **Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / System** — nhiệt độ Inverter và BMS hiển thị trong vòng System.

Thang giá điện và đơn vị tiền tệ tùy chỉnh (mặc định EVN Việt Nam 2024).

---

### 🎛️ Visual Config Editor

Không cần chạm vào YAML. Editor dùng **accordion section** gọn gàng:

| Section | Nội dung |
|---------|----------|
| 🎨 **Display Options** | Kiểu flow, ngôn ngữ, giờ, opacity, bật/tắt |
| ☁️ **Weather & Environment** | Thời tiết, nhiệt độ, độ ẩm, UV, áp suất, dự báo giờ |
| ⚡ **Solar** | Công suất và điện áp các dãy PV |
| 🔋 **Battery** | SOC, sạc/xả, điện áp, dung lượng |
| 🔌 **Grid & Home** | Luồng lưới, điện áp, tiêu thụ nhà, xuất lưới |
| ⚙️ **System & Stats** | Trạng thái inverter, nhiệt độ |
| 🏠 **Rooms** | Tên, icon, entity, offset X/Y từng phòng |
| 💰 **Pricing & Currency** | Thang giá điện, đơn vị tiền tệ |
| 📐 **Node Layout** | Pin X, Lưới X, Inverter Y, Nhà Y, tỉ lệ node, mật độ hạt |
| 🎨 **Color Theme** | Toàn bộ color picker + reset |

Badge đếm trên từng section (ví dụ `5/6`) cho biết bao nhiêu entity đã điền.

**9 ngôn ngữ** — toàn bộ nhãn editor tự dịch khi đổi:
🇻🇳 VI · 🇬🇧 EN · 🇩🇪 DE · 🇮🇹 IT · 🇫🇷 FR · 🇳🇱 NL · 🇵🇱 PL · 🇸🇪 SV · 🇭🇺 HU

---

## 📦 Cài đặt

### Cách 1 — HACS (khuyên dùng, 30 giây)

**Bước 1** — Thêm repo vào HACS:

[![Open HACS Repository](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=doanlong1412&repository=solar-weather-card&category=plugin)

> Nếu nút không hoạt động, thêm thủ công:
> **HACS → Frontend → ⋮ → Custom repositories**
> URL: `https://github.com/doanlong1412/solar-weather-card` → Type: **Dashboard** → Add

**Bước 2** — Tìm **Solar Weather Card** → **Install**

**Bước 3** — Hard reload trình duyệt (`Ctrl+Shift+R`)

---

### Cách 2 — Thủ công

1. Tải file [`solar-weather-card.js`](https://github.com/doanlong1412/solar-weather-card/releases/latest)
2. Copy vào `/config/www/solar-weather-card.js`
3. **Settings → Dashboards → Resources → Add resource:**
   ```
   URL:  /local/solar-weather-card.js
   Type: JavaScript module
   ```
4. Hard reload (`Ctrl+Shift+R`)

---

## ⚙️ Cấu hình

Thêm card vào dashboard:

```yaml
type: custom:solar-weather-card
```

Rồi nhấn **✏️ Edit** — visual editor lo hết phần còn lại.

---

### Tùy chọn hiển thị

| Key | Giá trị | Mặc định | Mô tả |
|-----|---------|----------|-------|
| `flow_style` | `particle` / `wave` / `line` | `particle` | Kiểu luồng điện |
| `language` | `vi` / `en` / `de` / `it` / `fr` / `nl` / `pl` / `sv` / `hu` | `vi` | Ngôn ngữ |
| `time_format` | `24h` / `12h` | `24h` | Định dạng giờ |
| `background_opacity` | `0`–`100` | `45` | Độ trong suốt nền (%) |
| `show_weather_info` | `true` / `false` | `true` | Panel thời tiết đầy đủ |
| `show_tomorrow` | `true` / `false` | `true` | Dự báo ngày mai |
| `show_node_glow` | `true` / `false` | `true` | Glow nhịp tim node |
| `show_forecast_chart` | `true` / `false` | `true` | Biểu đồ dự báo Solar |
| `show_hourly_forecast` | `true` / `false` | `true` | Strip dự báo theo giờ |
| `currency` | ký hiệu bất kỳ | `đ` | Đơn vị tiền tệ |
| `pricing_tiers` | `50:1984,100:2050,...` | EVN VNĐ | Thang giá điện tùy chỉnh |

---

### Cấu hình phòng *(v1.8)*

| Key | Mô tả |
|-----|-------|
| `room_count` | Số tile phòng: `2`–`6` (mặc định `4`) |
| `rooms` | Mảng cấu hình từng phòng (xem bên dưới) |
| `room_offsets` | Mảng `{x, y}` offset từng phòng — chỉnh qua slider editor |

Mỗi phòng:

| Trường | Mô tả |
|--------|-------|
| `name` | Tên hiển thị dưới tile |
| `icon` | Emoji — để trống = dùng icon MDI-style SVG tích hợp |
| `entity` | Sensor công suất W hoặc kW — tự nhận diện đơn vị |

**Offset vị trí** áp dụng theo tọa độ SVG thực tế. X dương = sang phải, X âm = sang trái. Y âm = lên trên — bạn có thể đặt phòng *cạnh* hoặc *trên* node nhà. Đường branch flow tự tính lại.

---

### Layout node

| Key | Mặc định | Mô tả |
|-----|----------|-------|
| `node_bat_x` | `-40` | Vị trí X node Pin |
| `node_grd_x` | `295` | Vị trí X node Lưới |
| `node_inv_y` | `220` | Vị trí Y node Inverter |
| `node_hom_y` | `400` | Vị trí Y node Nhà |
| `node_scale` | `1.0` | Tỉ lệ đồng đều 4 node chính (0.5–1.2) |
| `particle_mult` | `1.0` | Hệ số mật độ hạt (0.2–1.0) |

---

### Tham chiếu sensor

#### ☁️ Thời tiết & Môi trường

| Key | Mô tả | Bắt buộc |
|-----|-------|:--------:|
| `weather_entity` | Entity thời tiết HA | ✅ |
| `temperature_entity` | Nhiệt độ ngoài trời (°C) | |
| `humidity_entity` | Độ ẩm ngoài trời (%) | |
| `pressure_entity` | Áp suất khí quyển (hPa) | |
| `uv_entity` | Chỉ số UV | |
| `hourly_forecast_entity` | Sensor Tomorrow.io raw hourly | |

#### ⚡ Solar

| Key | Mô tả | Bắt buộc |
|-----|-------|:--------:|
| `solar_pv1_entity` | Công suất dãy PV 1 (W) | ✅ |
| `solar_pv2_entity` | Công suất dãy PV 2 (W) | |
| `solar_pv1_voltage_entity` | Điện áp dãy PV 1 (V) | |
| `solar_pv2_voltage_entity` | Điện áp dãy PV 2 (V) | |
| `solar_today_entity` | Tổng solar hôm nay (kWh) | |
| `solar_dailyuse_entity` | Solar nhà dùng hôm nay (kWh) | |
| `solar_live_entity` | Công suất solar tức thời (W) | |
| `solar_live_curve_entity` | `input_text` ghi giờ cho biểu đồ | |
| `solcast_today_entity` | Dự báo Solcast hôm nay (kWh) | |
| `solcast_tomorrow_entity` | Dự báo Solcast ngày mai (kWh) | |
| `solcast_detail_entity` | Dự báo Solcast chi tiết theo giờ | |

#### 🔋 Pin

| Key | Mô tả | Bắt buộc |
|-----|-------|:--------:|
| `battery_soc_entity` | % sạc (SOC) | ✅ |
| `battery_flow_entity` | Luồng sạc/xả (W, + sạc / − xả) | ✅ |
| `battery_voltage_entity` | Điện áp DC (V) | |
| `battery_capacity_entity` | Sensor dung lượng (Ah) | |
| `battery_capacity_wh` | Dung lượng thủ công (Wh), vd: `26880` | |
| `battery_temp_entity` | Nhiệt độ BMS (°C) | |

> **Ưu tiên ETA:** Nhập tay Wh → Sensor Ah × Voltage → Mặc định 560 Ah × 48 V

#### 🔌 Grid & Home

| Key | Mô tả | Bắt buộc |
|-----|-------|:--------:|
| `grid_flow_entity` | Luồng lưới (W, + xuất / − nhập) | ✅ |
| `home_consumption_entity` | Tiêu thụ điện nhà (W) | ✅ |
| `grid_voltage_entity` | Điện áp AC (V) | |
| `grid_today_entity` | Điện lấy lưới hôm nay (kWh) | |
| `grid_export_today_entity` | Điện xuất lưới hôm nay (kWh) | |
| `consumption_today_entity` | Tiêu thụ hôm nay (kWh) | |
| `inverter_switch_entity` | Switch inverter (grid-direct mode) | |
| `grid_direct_entity` | Công suất lưới thẳng khi inverter tắt (W) | |

#### ⚙️ System & Stats

| Key | Mô tả | Bắt buộc |
|-----|-------|:--------:|
| `inverter_status_entity` | Trạng thái: Normal / online / OFF | |
| `inverter_temp_entity` | Nhiệt độ inverter (°C) | |
| `battery_temp_entity` | Nhiệt độ BMS (°C) | |

---

## 🗂️ Ví dụ YAML đầy đủ (LuxPower + Seplos BMS + Solcast)

```yaml
type: custom:solar-weather-card
flow_style: particle
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

# Cấu hình phòng — tối đa 6 tile, vị trí chỉnh qua editor
room_count: 4
rooms:
  - name: Phòng khách
    entity: sensor.pzem_nhachinh_power
  - name: Phòng bếp
    entity: sensor.pzem_nhabep_power
  - name: Bếp từ
    icon: "🔥"
    entity: sensor.bep_tu_power
  - name: Office
    entity: sensor.cong_suat_power_office
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

Ví dụ tùy chỉnh: `50:1984,100:2050,200:2380,300:2998,400:3350,inf:3460`

---

## 🖥️ Tương thích

| | |
|---|---|
| Home Assistant | 2023.1+ |
| Lovelace | Default & custom dashboard |
| Thiết bị | Mobile & Desktop |
| Dependencies | **Không cần cài thêm** |
| Trình duyệt | Chrome, Firefox, Safari, Edge |

---

## 📋 Changelog

### v1.8.0
- 🏠 **Phòng & Thiết bị** — tối đa 6 tile phòng bên dưới sơ đồ, mỗi tile có tên, icon, entity, luồng điện từ Home, và thanh năng lượng
- 📐 **Điều chỉnh vị trí từng phòng** — slider X/Y riêng cho từng tile; đường branch flow tự tính lại với mọi vị trí, kể cả cạnh hoặc trên node nhà
- 🔢 **Số lượng phòng tùy chỉnh** — 2 đến 6 tile, chỉnh qua slider editor
- 🔋 **Battery icon nâng cấp hoàn toàn** — ⚡ tia sét nháy khi sạc, 3 mũi tên động khi xả, `!` đỏ nháy nhanh ≤ 20%, ✓ xanh nhấp nháy chậm khi standby; 4 cell, terminal dương, % to dễ đọc
- 🌬️ **Tua bin gió** bên cạnh ngôi nhà — 3 cánh SVG quay `animateTransform rotate`
- ✦ **Flow engine Spark viết lại** — `stroke-dasharray animate` thay `animateMotion`; không còn giật hay reset vị trí giữa các lần render
- ✦ **Fix animation liên tục** — particles không còn bị gián đoạn khi sensor cập nhật (two-layer DOM: SVG animation sống độc lập với data layer)

### v1.7.1
- 🌐 4 ngôn ngữ mới — 🇳🇱 Hà Lan, 🇵🇱 Ba Lan, 🇸🇪 Thụy Điển, 🇭🇺 Hungary (tổng 9)
- 🌍 Visual Editor tự dịch khi đổi ngôn ngữ
- 🕐 Chọn định dạng 12h / 24h
- ⚡ Badge Grid Export Today dưới node Lưới

### v1.7.0
- 🌙 Icon ban đêm tự động
- 📊 Biểu đồ cột % vs dự báo, nhãn màu

### v1.6.0
- 📊 Biểu đồ dự báo Solar — thực tế + Solcast + tính toán
- 🎨 Color Theme — tùy chỉnh đầy đủ với Reset

### v1.5.0
- 〰️ Flow style Wave
- ✨ Toggle node glow
- 🔽 ha-entity-picker native HA
- 📁 Accordion sections trong editor
- 🇫🇷 Thêm Français

### v1.4.x
- ✨ Node cards 3D mới, border nhịp tim
- 🗼 Cột điện lattice + transformer
- 💰 Thang giá tùy chỉnh

### v1.0.0 – v1.3.x
- Phiên bản nền tảng: standalone card, Visual Editor, particle flow, weather icons

---

## 📄 License

MIT — tự do sử dụng, chỉnh sửa, phân phối.
Nếu card này giúp ích cho bạn, hãy ⭐ **star repo** để ủng hộ!

---

## 🙏 Credits

Thiết kế và phát triển bởi **[@doanlong1412](https://github.com/doanlong1412)** từ 🇻🇳 Việt Nam.

Tích hợp dự báo Solcast sử dụng [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) của **[@BJReplay](https://github.com/BJReplay)**.
