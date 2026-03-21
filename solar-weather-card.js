/**
 * Solar Weather Card v1.2.0
 * Custom Home Assistant card — Solar + Battery + Weather dashboard
 * Hỗ trợ Visual Config Editor — chọn entity qua UI
 * Thiết kế và phát triển bởi **[@doanlong1412](https://github.com/doanlong1412)**.
 *
 * Changelog v1.2.0:
 *   - Icon thời tiết CSS animation động (nắng, mưa, sấm, sương...)
 *   - Điều kiện thời tiết tiếng Việt
 *   - Icon ngày mai thu nhỏ có animatio
 *
 * Changelog v1.3.0:
 *   - Thêm tùy chọn flow_style: "line" (mặc định) hoặc "particle" (bong bóng)
 *   - Particle mode: bong bóng chạy dọc đường cong Bezier, có glow + sparkle
 *   - Layout node particle mode rộng hơn, đường cong mềm mại hơn
 *   - pvDC hiển thị điện áp PV trong inverter box (particle mode)
 * Changelog v1.3.1:
 *   - Fix tính ETA sạc/xả: LuxPower trả Ah → nhân voltage thực tế ra Wh
 *   - Thêm ô nhập tay Wh nếu không có sensor
 *   - Mặc định 560Ah × 48V = 26880 Wh
 * Solar Weather Card v1.4.0
 * Changelog v1.4.0:
 *   - Node cards hoàn toàn mới: border nhịp tim, hex grid, icon 3D chi tiết
 *     (pin chi tiết, inverter quạt quay + sóng sine, cột điện, ngôi nhà)
 *   - Mặt trời đập nhịp tim theo công suất solar, cung hạ thấp hơn
 *   - Particle system cải tiến: highlight trắng nhỏ + glow layer
 *   - Ticker thông tin thời tiết + trạng thái pin chạy cuối card
 *   - Stats bar 5 ô: Solar / Lấy lưới / Tiêu thụ / Tiết kiệm / Hệ thống
 *   - Pin bar đổi màu đỏ/cam/xanh theo %
 *   - Tùy chọn flow_style: "line" hoặc "particle"
 *   - Tùy chọn language: "vi" (mặc định) hoặc "en"
 *   - Tùy chọn background_opacity: 0-100 (mặc định 45)
 */

// ═══════════════════════════════════════════════════════════════
// I18N
// ═══════════════════════════════════════════════════════════════
const I18N = {
  vi: {
    tomorrow: 'Ngày mai', sunrise: 'Mọc', sunset: 'Lặn', dayPct: 'qua ngày',
    daytime: 'Ban ngày', nighttime: 'Ban đêm',
    charging: '🔋⚡ Sạc', discharging: '🔋🔁 Xả', standby: '⏳ Stanby',
    exportGrid: 'Xuất lưới', importGrid: 'Lưới điện',
    homeConsume: 'Tiêu thụ', battLabel: '🔋 Pin',
    etaFull: '⚡ Thời gian dự kiến đầy pin: ', etaLeft: '🔁 Thời gian sử dụng dự kiến còn: ',
    slowCharge: '⚡ Sạc rất chậm, chưa ước được thời gian đầy pin',
    slowDisch: '🔁 Xả rất chậm, chưa ước được thời gian hết pin',
    solarToday: 'Solar', gridToday: 'Lấy lưới', consume: 'Tiêu thụ',
    saving: 'Tiết kiệm', system: '⚙️ HỆ THỐNG',
    condMap: {
      'sunny':'☀️ Nắng','clear-night':'🌙 Trời quang','partlycloudy':'⛅ Ít mây',
      'cloudy':'☁️ Nhiều mây','rainy':'🌧️ Có mưa','pouring':'⛈️ Mưa to',
      'lightning':'⚡ Dông sét','fog':'🌫️ Sương mù','windy':'💨 Có gió'
    },
    days: ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
    months: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
             'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    ticker: function(wstate, daily, savFmt, bPct, isCharge, isDisch, battSoc) {
      let msg = '';
      const kw = parseFloat(daily);
      if (wstate==='rainy'||wstate==='pouring') msg=`🌧️ Hôm nay trời mưa, sản lượng solar không tốt${kw>0?' — thu được '+daily+' kWh':''}.`;
      else if (wstate==='lightning') msg='⛈️ Thời tiết xấu, hệ thống solar tạm dừng bảo vệ thiết bị.';
      else if (wstate==='cloudy') msg=`☁️ Trời nhiều mây, solar hoạt động cầm chừng${kw>0?' — '+daily+' kWh':''}.`;
      else if (wstate==='partlycloudy') msg=`⛅ Ít mây, solar hoạt động khá tốt — ${daily} kWh hôm nay.`;
      else if (wstate==='sunny') {
        if(kw>15) msg=`☀️ Nắng đẹp, hệ thống solar xuất sắc — ${daily} kWh!`;
        else if(kw>8) msg=`☀️ Trời nắng tốt, solar thu được ${daily} kWh.`;
        else msg=`☀️ Trời nắng nhưng sản lượng còn thấp — ${daily} kWh.`;
      } else if (wstate==='fog') msg='🌫️ Sương mù dày, ánh sáng yếu — solar kém hiệu quả.';
      else if (wstate==='windy') msg=`💨 Trời có gió, solar hoạt động bình thường — ${daily} kWh.`;
      else msg=`🌤️ Solar thu được ${daily} kWh — tiết kiệm ${savFmt}đ.`;
      if (battSoc===100) msg+=' ✅ Pin đã đầy!';
      else if (isCharge&&battSoc>80) msg+=` 🔋 Pin đang sạc và gần đầy (${bPct}%).`;
      else if (isDisch&&battSoc<20) msg+=` ⚠️ Pin đang cạn (${bPct}%), cần chú ý!`;
      return msg;
    }
  },
  en: {
    tomorrow: 'Tomorrow', sunrise: 'Rise', sunset: 'Set', dayPct: 'of day',
    daytime: 'Daytime', nighttime: 'Nighttime',
    charging: '🔋⚡ Charging', discharging: '🔋🔁 Discharging', standby: '⏳ Standby',
    exportGrid: 'Export', importGrid: 'Grid',
    homeConsume: 'Consuming', battLabel: '🔋 Battery',
    etaFull: '⚡ Estimated full in: ', etaLeft: '🔁 Estimated remaining: ',
    slowCharge: '⚡ Charging very slowly, cannot estimate',
    slowDisch: '🔁 Discharging very slowly, cannot estimate',
    solarToday: 'Solar', gridToday: 'From Grid', consume: 'Consume',
    saving: 'Saving', system: '⚙️ SYSTEM',
    condMap: {
      'sunny':'☀️ Sunny','clear-night':'🌙 Clear Night','partlycloudy':'⛅ Partly Cloudy',
      'cloudy':'☁️ Cloudy','rainy':'🌧️ Rainy','pouring':'⛈️ Pouring',
      'lightning':'⚡ Thunder','fog':'🌫️ Foggy','windy':'💨 Windy'
    },
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    ticker: function(wstate, daily, savFmt, bPct, isCharge, isDisch, battSoc) {
      let msg = '';
      const kw = parseFloat(daily);
      if (wstate==='rainy'||wstate==='pouring') msg=`🌧️ Rainy day, solar output limited${kw>0?' — '+daily+' kWh collected':''}.`;
      else if (wstate==='lightning') msg='⛈️ Bad weather, solar system paused for protection.';
      else if (wstate==='cloudy') msg=`☁️ Cloudy, solar running at reduced output${kw>0?' — '+daily+' kWh':''}.`;
      else if (wstate==='partlycloudy') msg=`⛅ Partly cloudy, solar performing well — ${daily} kWh today.`;
      else if (wstate==='sunny') {
        if(kw>15) msg=`☀️ Great sunshine, solar performing excellent — ${daily} kWh!`;
        else if(kw>8) msg=`☀️ Good sunshine, solar collected ${daily} kWh today.`;
        else msg=`☀️ Sunny but output still low — ${daily} kWh.`;
      } else if (wstate==='fog') msg='🌫️ Dense fog, low light — poor solar performance today.';
      else if (wstate==='windy') msg=`💨 Windy day, solar running normally — ${daily} kWh.`;
      else msg=`🌤️ Solar collected ${daily} kWh — saved ${savFmt}₫ on electricity.`;
      if (battSoc===100) msg+=' ✅ Battery full!';
      else if (isCharge&&battSoc>80) msg+=` 🔋 Battery charging, nearly full (${bPct}%).`;
      else if (isDisch&&battSoc<20) msg+=` ⚠️ Battery low (${bPct}%), attention needed!`;
      return msg;
    }
  }
};


// ═══════════════════════════════════════════════════════════════
// EDITOR
// ═══════════════════════════════════════════════════════════════
class SolarWeatherCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode:'open' }); this._config={}; }
  set hass(h) { this._hass = h; }
  setConfig(config) { this._config={...config}; this._render(); }

  static get FIELDS() {
    return [
      { key:'weather_entity',           label:'🌤️ Weather entity',                        required:true  },
      { key:'temperature_entity',       label:'🌡️ Outdoor temperature',                   required:true  },
      { key:'humidity_entity',          label:'💧 Outdoor humidity',                       required:true  },
      { key:'pressure_entity',          label:'🌬️ Atmospheric pressure',                  required:false },
      { key:'uv_entity',                label:'☀️ UV index',                              required:false },
      { key:'rain_entity',              label:'🌧️ Rain forecast',                          required:false },
      { key:'solar_pv1_entity',         label:'⚡ Solar Array 1 (W)',                     required:true  },
      { key:'solar_pv2_entity',         label:'⚡ Solar Array 2 (W)',                     required:false },
      { key:'solar_pv1_voltage_entity', label:'⚡ Solar Array 1 Voltage (V)',             required:false },
      { key:'solar_pv2_voltage_entity', label:'⚡ Solar Array 2 Voltage (V)',             required:false },
      { key:'battery_soc_entity',       label:'🔋 Battery % (SOC)',                       required:true  },
      { key:'battery_flow_entity',      label:'🔋 Battery flow (W, +charge / -discharge)',required:true  },
      { key:'battery_voltage_entity',   label:'🔋 Battery voltage (V DC)',                required:false },
      { key:'battery_capacity_entity',  label:'🔋 Battery capacity sensor (Ah) — LuxPower: lux_battery_capacity', required:false },
      { key:'battery_capacity_wh',      label:'🔋 Battery capacity (Wh) — manual input if no sensor, e.g. 26880', required:false },
      { key:'grid_flow_entity',         label:'🔌 Grid flow (W)',                          required:true  },
      { key:'grid_voltage_entity',      label:'🔌 Grid voltage (V AC)',                    required:false },
      { key:'grid_today_entity',        label:'🔌 Grid import today (kWh)',                required:false },
      { key:'home_consumption_entity',  label:'🏠 Home consumption (W)',                  required:true  },
      { key:'solar_today_entity',       label:'📊 Solar today (kWh)',                     required:false },
      { key:'consumption_today_entity', label:'📊 Consumption today (kWh)',               required:false },
      { key:'inverter_status_entity',   label:'⚙️ Inverter status',                       required:false },
      { key:'inverter_temp_entity',     label:'🌡️ Inverter temperature (°C)',              required:false },
      { key:'battery_temp_entity',      label:'🌡️ BMS temperature (°C)',                  required:false },
    ];
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));
  }

  _render() {
    const fs = this._config.flow_style || 'particle';
    const lang = this._config.language || 'vi';
    const opacity = this._config.background_opacity ?? 45;
    const rows = SolarWeatherCardEditor.FIELDS.map(f=>`
      <div class="row">
        <label>${f.label}${f.required?' <span class="req">*</span>':''}</label>
        <input type="text" data-key="${f.key}"
          placeholder="${f.key.startsWith('weather')?'weather.your_entity':'sensor.your_entity'}"
          value="${this._config[f.key]||''}"/>
      </div>`).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;padding:4px 0}
        .note{font-size:12px;color:var(--secondary-text-color);background:var(--secondary-background-color);
          border-radius:8px;padding:10px 12px;margin-bottom:14px;border-left:3px solid var(--primary-color)}
        .section{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;
          color:var(--secondary-text-color);margin:16px 0 8px;padding-bottom:4px;
          border-bottom:1px solid var(--divider-color)}
        .opt-row{display:flex;flex-direction:column;margin-bottom:14px}
        .opt-row label{font-size:13px;font-weight:600;color:var(--primary-text-color);margin-bottom:8px}
        .btn-group{display:flex;gap:8px}
        .opt-btn{flex:1;padding:9px 8px;border-radius:8px;border:1.5px solid var(--divider-color);
          background:var(--secondary-background-color);cursor:pointer;text-align:center;
          font-size:13px;color:var(--primary-text-color);transition:all .2s}
        .opt-btn.active{border-color:var(--primary-color);background:rgba(3,169,244,.12);
          color:var(--primary-color);font-weight:700}
        .slider-row{display:flex;align-items:center;gap:10px;margin-bottom:14px}
        .slider-row label{font-size:13px;font-weight:600;color:var(--primary-text-color);min-width:120px}
        .slider-row input[type=range]{flex:1}
        .slider-val{font-size:13px;font-weight:700;color:var(--primary-color);min-width:40px;text-align:right}
        .row{display:flex;flex-direction:column;margin-bottom:10px}
        label{font-size:13px;color:var(--primary-text-color);margin-bottom:4px;font-weight:500}
        .req{color:var(--error-color);font-weight:700}
        input[type=text]{background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color,#e0e0e0);
          border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);
          font-family:monospace;width:100%;box-sizing:border-box;transition:border-color .2s}
        input[type=text]:focus{outline:none;border-color:var(--primary-color)}
        input[type=text]::placeholder{color:var(--disabled-text-color);font-style:italic}
      </style>
      <div class="note">💡 Fill in <strong>entity IDs</strong>. Fields marked <span class="req">*</span> are required.</div>

      <div class="section">🎨 Display Options</div>

      <div class="opt-row">
        <label>🌊 Flow style</label>
        <div class="btn-group">
          <div class="opt-btn ${fs==='particle'?'active':''}" data-type="flow_style" data-val="particle">✦ Particle bubble</div>
          <div class="opt-btn ${fs==='line'?'active':''}" data-type="flow_style" data-val="line">── Animated line</div>
        </div>
      </div>

      <div class="opt-row">
        <label>🌐 Language / Ngôn ngữ</label>
        <div class="btn-group">
          <div class="opt-btn ${lang==='vi'?'active':''}" data-type="language" data-val="vi">🇻🇳 Tiếng Việt</div>
          <div class="opt-btn ${lang==='en'?'active':''}" data-type="language" data-val="en">🇬🇧 English</div>
        </div>
      </div>

      <div class="slider-row">
        <label>🪟 Background opacity</label>
        <input type="range" id="opSlider" min="0" max="100" value="${opacity}" step="5"/>
        <span class="slider-val" id="opVal">${opacity}%</span>
      </div>

      <div class="section">📡 Entities</div>
      ${rows}`;

    // Option buttons
    this.shadowRoot.querySelectorAll('.opt-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const {type, val} = e.currentTarget.dataset;
        this._config = {...this._config, [type]: val};
        this._fire(); this._render();
      });
    });

    // Opacity slider
    const slider = this.shadowRoot.getElementById('opSlider');
    const opVal  = this.shadowRoot.getElementById('opVal');
    slider.addEventListener('input', e => {
      opVal.textContent = e.target.value + '%';
    });
    slider.addEventListener('change', e => {
      this._config = {...this._config, background_opacity: parseInt(e.target.value)};
      this._fire();
    });

    // Entity inputs
    this.shadowRoot.querySelectorAll('input[type=text]').forEach(inp => {
      inp.addEventListener('change', e => {
        const k=e.target.dataset.key, v=e.target.value.trim();
        const c={...this._config};
        if(v) c[k]=v; else delete c[k];
        this._config=c; this._fire();
      });
    });
  }
}
customElements.define('solar-weather-card-editor', SolarWeatherCardEditor);


// ═══════════════════════════════════════════════════════════════
// WEATHER ICONS (animated CSS)
// ═══════════════════════════════════════════════════════════════
function makeWeatherIcon(ws) {
  const css = `<style>
    .wi{width:70px;height:70px;position:relative;display:flex;align-items:center;justify-content:center}
    .sn-c{width:26px;height:26px;background:#FFE135;border-radius:50%;box-shadow:0 0 14px 5px rgba(255,220,60,.55);animation:snP 2.5s ease-in-out infinite;position:relative;z-index:1}
    @keyframes snP{0%,100%{box-shadow:0 0 14px 5px rgba(255,220,60,.5)}50%{box-shadow:0 0 22px 9px rgba(255,220,60,.78)}}
    .sn-r{position:absolute;inset:0;animation:snS 8s linear infinite}
    @keyframes snS{to{transform:rotate(360deg)}}
    .sn-ray{position:absolute;width:4px;height:11px;background:linear-gradient(to bottom,rgba(255,235,80,.9),rgba(255,220,60,.1));border-radius:2px;left:50%;transform-origin:50% 200%}
    .mn{width:30px;height:30px;background:#C8D8F8;border-radius:50%;box-shadow:-7px 2px 0 0 rgba(0,20,50,.92),0 0 16px 5px rgba(160,195,255,.4);animation:mnG 3s ease-in-out infinite}
    @keyframes mnG{0%,100%{box-shadow:-7px 2px 0 0 rgba(0,20,50,.92),0 0 16px 5px rgba(160,195,255,.38)}50%{box-shadow:-7px 2px 0 0 rgba(0,20,50,.92),0 0 24px 9px rgba(160,195,255,.58)}}
    .mst{position:absolute;background:rgba(255,255,255,.9);border-radius:50%;animation:mstT 1.8s ease-in-out infinite}
    @keyframes mstT{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.25;transform:scale(.55)}}
    .cl{border-radius:10px;position:absolute;bottom:12px;left:10px}
    .cl::before{content:"";position:absolute;width:24px;height:24px;border-radius:50%;top:-12px;left:8px}
    .cl::after{content:"";position:absolute;width:18px;height:18px;border-radius:50%;top:-8px;left:22px}
    .cl-w{width:44px;height:20px;background:rgba(200,215,235,.88)}.cl-w::before,.cl-w::after{background:rgba(210,225,245,.9)}
    .cl-g{width:44px;height:20px;background:rgba(150,170,200,.88)}.cl-g::before,.cl-g::after{background:rgba(155,175,205,.88)}
    .cl-dk{width:46px;height:20px;background:rgba(100,120,155,.9)}.cl-dk::before,.cl-dk::after{background:rgba(105,125,160,.9)}
    .cl-f{animation:clF 3s ease-in-out infinite}
    @keyframes clF{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
    .cl-abs{position:absolute;bottom:auto;left:50%;transform:translateX(-50%)}
    .pc-sn{position:absolute;top:8px;right:6px;width:22px;height:22px;background:#FFE135;border-radius:50%;box-shadow:0 0 9px rgba(255,215,50,.55);animation:snP 2.5s ease-in-out infinite}
    .dp{width:2.5px;border-radius:2px;background:rgba(140,190,255,.9);animation:dpF .9s ease-in infinite}
    @keyframes dpF{0%{opacity:0;transform:translateY(-4px)}30%{opacity:1}100%{opacity:0;transform:translateY(9px)}}
    .dps{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
    .bl-w{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);animation:blF 2.2s ease-in-out infinite}
    @keyframes blF{0%,85%,100%{opacity:0}88%{opacity:1}91%{opacity:.3}94%{opacity:1}97%{opacity:0}}
    .fg-l{height:6px;border-radius:3px;background:rgba(200,210,225,.65)}
    .fg-w{display:flex;flex-direction:column;gap:8px;animation:fgD 3s ease-in-out infinite}
    @keyframes fgD{0%,100%{opacity:.65;transform:translateX(0)}50%{opacity:.88;transform:translateX(5px)}}
    .wd-l{height:5px;border-radius:3px;background:rgba(180,210,250,.75);animation:wdB 1.4s ease-in-out infinite}
    @keyframes wdB{0%{opacity:.35;transform:scaleX(.65) translateX(-5px)}50%{opacity:.9;transform:scaleX(1) translateX(0)}100%{opacity:.35;transform:scaleX(.65) translateX(-5px)}}
  </style>`;
  const rays = Array.from({length:8},(_,i)=>`<div class="sn-ray" style="transform:translateX(-50%) rotate(${i*45}deg)"></div>`).join('');
  const sun = `${css}<div class="wi"><div class="sn-r">${rays}</div><div class="sn-c"></div></div>`;
  if(ws==='sunny') return sun;
  if(ws==='clear-night') return `${css}<div class="wi"><div class="mn"></div><div class="mst" style="width:4px;height:4px;top:10px;right:8px"></div><div class="mst" style="width:3px;height:3px;top:18px;right:18px;animation-delay:.6s"></div><div class="mst" style="width:2px;height:2px;top:11px;right:22px;animation-delay:1.2s"></div></div>`;
  if(ws==='partlycloudy') return `${css}<div class="wi"><div class="pc-sn"></div><div class="cl cl-w cl-f" style="width:40px;height:18px;bottom:10px;left:4px;"></div></div>`;
  if(ws==='cloudy') return `${css}<div class="wi"><div class="cl cl-w cl-f"></div></div>`;
  if(ws==='rainy'){const d=[{h:'10px',d:'0s'},{h:'12px',d:'.2s'},{h:'9px',d:'.4s'},{h:'11px',d:'.15s'},{h:'10px',d:'.35s'}].map(a=>`<div class="dp" style="height:${a.h};animation-delay:${a.d}"></div>`).join('');return `${css}<div class="wi"><div class="cl cl-g cl-abs" style="top:8px;width:44px;height:20px;"></div><div class="dps">${d}</div></div>`;}
  if(ws==='pouring'){const d=[{h:'14px',d:'0s'},{h:'12px',d:'.1s'},{h:'15px',d:'.05s'},{h:'13px',d:'.15s'},{h:'14px',d:'.08s'},{h:'11px',d:'.2s'}].map(a=>`<div class="dp" style="height:${a.h};animation-delay:${a.d};animation-duration:.55s;width:3px"></div>`).join('');return `${css}<div class="wi"><div class="cl cl-dk cl-abs" style="top:5px;width:46px;height:20px;"></div><div class="dps" style="gap:4px;bottom:2px;">${d}</div></div>`;}
  if(ws==='lightning') return `${css}<div class="wi"><div class="cl cl-dk cl-abs" style="top:4px;width:46px;height:20px;"></div><div class="bl-w"><svg width="16" height="22" viewBox="0 0 16 22"><polygon points="9,0 1,13 7,13 5,22 15,9 9,9" fill="#FFE040" stroke="rgba(255,235,80,.5)" stroke-width="1"/></svg></div></div>`;
  if(ws==='fog') return `${css}<div class="wi"><div class="fg-w"><div class="fg-l" style="width:50px"></div><div class="fg-l" style="width:36px;margin-left:8px"></div><div class="fg-l" style="width:44px"></div></div></div>`;
  if(ws==='windy') return `${css}<div class="wi"><div style="display:flex;flex-direction:column;gap:9px"><div class="wd-l" style="width:50px"></div><div class="wd-l" style="width:38px;animation-delay:.18s"></div><div class="wd-l" style="width:46px;animation-delay:.36s"></div></div></div>`;
  return sun;
}


// ═══════════════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════════════
class SolarWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this._hass=null; this._config={}; this._interval=null;
  }

  static getConfigElement() { return document.createElement('solar-weather-card-editor'); }
  static getStubConfig() {
    return {
      flow_style:'particle', language:'vi', background_opacity:45,
      weather_entity:'', temperature_entity:'', humidity_entity:'',
      pressure_entity:'', uv_entity:'', rain_entity:'',
      solar_pv1_entity:'', solar_pv2_entity:'',
      solar_pv1_voltage_entity:'', solar_pv2_voltage_entity:'',
      battery_soc_entity:'', battery_flow_entity:'',
      battery_voltage_entity:'', battery_capacity_entity:'', battery_capacity_wh:'',
      grid_flow_entity:'', grid_voltage_entity:'', grid_today_entity:'',
      home_consumption_entity:'', solar_today_entity:'', consumption_today_entity:'',
      inverter_status_entity:'', inverter_temp_entity:'', battery_temp_entity:'',
    };
  }

  setConfig(c) { this._config=c||{}; if(this._hass) this._render(); }
  set hass(h) { this._hass=h; this._render(); }
  connectedCallback() { this._interval=setInterval(()=>this._render(),30000); this._render(); }
  disconnectedCallback() { if(this._interval) clearInterval(this._interval); }
  getCardSize() { return 14; }

  _g(k,def='--') {
    const id=this._config[k]; if(!id||!this._hass) return def;
    const s=this._hass.states[id];
    if(!s||s.state==='unavailable'||s.state==='unknown') return def;
    return s.state;
  }
  _gf(k,def=0){ return parseFloat(this._g(k,def))||def; }

  _calcEvn(kwh) {
    const tiers=[{l:50,r:1984},{l:100,r:2050},{l:200,r:2380},{l:300,r:2998},{l:400,r:3350},{l:Infinity,r:3460}];
    let cost=0,prev=0;
    for(const t of tiers){if(kwh<=prev)break;cost+=(Math.min(kwh,t.l)-prev)*t.r;prev=t.l;}
    return Math.round(cost);
  }

  // ── Particle flow ────────────────────────────────────────────
  _particleLevel(w) {
    if(w<300) return {dur:2.2,count:5,size:2.6};
    if(w<800) return {dur:1.7,count:8,size:3.0};
    if(w<2000) return {dur:1.1,count:12,size:3.5};
    if(w<4000) return {dur:0.65,count:18,size:4.0};
    return {dur:0.30,count:25,size:4.5};
  }

  _makeParticles(pathD, pid, color, glowColor, fl) {
    let html='';
    html+=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="4,18" opacity="0.15" stroke-linecap="round"/>`;
    // glow layer
    for(let j=0;j<Math.ceil(fl.count/3);j++){
      const gd=(j/Math.ceil(fl.count/3)*fl.dur).toFixed(3);
      html+=`<circle r="${(fl.size*2.6).toFixed(2)}" fill="${glowColor}" opacity="0.18" filter="url(#pBlur)"><animateMotion dur="${fl.dur}s" begin="-${gd}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`;
    }
    // main particles
    for(let i=0;i<fl.count;i++){
      const delay=(i/fl.count*fl.dur).toFixed(3);
      const sz=(fl.size*(0.5+Math.random()*1.0)).toFixed(2);
      const op=(0.6+Math.random()*0.4).toFixed(2);
      html+=`<circle r="${sz}" fill="${color}" opacity="${op}"><animateMotion dur="${fl.dur}s" begin="-${delay}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`;
    }
    // white highlight core
    const hc=Math.ceil(fl.count*0.4);
    for(let h=0;h<hc;h++){
      const hd=(h/hc*fl.dur).toFixed(3);
      html+=`<circle r="${(fl.size*0.45).toFixed(2)}" fill="rgba(255,255,255,.92)" opacity="0.85" filter="url(#pBlurSm)"><animateMotion dur="${fl.dur}s" begin="-${hd}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`;
    }
    // sparkle
    const sk=Math.ceil(fl.count*0.55);
    for(let k=0;k<sk;k++){
      const sd=(Math.random()*fl.dur).toFixed(3);
      const ox=(Math.random()*12-6).toFixed(1), oy=(Math.random()*12-6).toFixed(1);
      html+=`<g transform="translate(${ox},${oy})"><circle r="${(0.9+Math.random()*1.8).toFixed(2)}" fill="${color}" opacity="${(0.22+Math.random()*0.45).toFixed(2)}"><animateMotion dur="${fl.dur}s" begin="-${sd}s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion></circle></g>`;
    }
    return html;
  }

  // ── Line flow ────────────────────────────────────────────────
  _sf(w,maxW,minV,maxV){ return (minV+Math.max(0,Math.min(1,w/maxW))*(maxV-minV)).toFixed(2); }
  _lineFlow(path,w,maxW,cCore,cGlow,cFade){
    const dur=this._sf(w,maxW,1.5,0.4), w1=this._sf(w,maxW,1.0,2.5), w2=this._sf(w,maxW,1.5,4.0), w3=this._sf(w,maxW,2.5,6.0);
    return `
      <path d="${path}" fill="none" stroke="${cFade.replace('X','0.12')}" stroke-width="${w3}" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${cCore.replace('X','0.92')}" stroke-width="${w1}" stroke-dasharray="28,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="148" to="0" dur="${dur}s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${cGlow.replace('X','0.85')}" stroke-width="${w2}" stroke-dasharray="12,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="132" to="0" dur="${dur}s" begin="0.3s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${cFade.replace('X','0.5')}" stroke-width="${w3}" stroke-dasharray="6,120" stroke-linecap="round" filter="url(#sf)"><animate attributeName="stroke-dashoffset" from="126" to="0" dur="${dur}s" begin="0.15s" repeatCount="indefinite"/></path>`;
  }

  // ── SVG Card node ────────────────────────────────────────────
  _svgCard(x,y,w,h,cc,glow,cbg,icoFn,val,dir,sub,active){
    const barH=56, topH=h-barH, cx=x+w/2, cid=`c${(x*100+y*10+w+h)|0}`;
    let s='';
    s+=`<defs><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13"/></clipPath></defs>`;
    // outer glow / border pulse
    if(active){
      s+=`<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="15" fill="none" stroke="${glow}" stroke-width="12" filter="url(#pBlur)"><animate attributeName="opacity" values="0;0;.8;0;0;.6;0" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`;
      s+=`<rect x="${x-1}" y="${y-1}" width="${w+2}" height="${h+2}" rx="14" fill="none" stroke="${cc}" stroke-width="2" filter="url(#pBlurSm)"><animate attributeName="opacity" values="0;0;.9;0;0;.5;0" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`;
    } else {
      s+=`<rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="14" fill="none" stroke="${glow}" stroke-width="6" filter="url(#pBlur)" opacity=".12"/>`;
    }
    // clipped content
    s+=`<g clip-path="url(#${cid})">`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cbg}"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${topH}" fill="none" stroke="${cc}" stroke-width=".35" stroke-dasharray="2,16" opacity=".07"/>`;
    s+=`<ellipse cx="${cx}" cy="${y+topH}" rx="${w*.42}" ry="${topH*.28}" fill="${glow}" opacity=".15" filter="url(#pBlur)"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="20" fill="rgba(255,255,255,.06)"/>`;
    s+=`</g>`;
    // border
    if(active){
      s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.8"><animate attributeName="stroke-opacity" values=".2;.2;1;.2;.2;.7;.2" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`;
    } else {
      s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.2" opacity=".35"/>`;
    }
    s+=`<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="12" fill="none" stroke="${glow}" stroke-width="3" filter="url(#pBlurSm)"><animate attributeName="opacity" values=".2;.5;.2" dur="2.5s" repeatCount="indefinite"/></rect>`;
    // corner brackets
    const cs=10,cw=2;
    s+=`<path d="M${x},${y+topH-cs} L${x},${y+topH} L${x+cs},${y+topH}" fill="none" stroke="${cc}" stroke-width="${cw}" stroke-linecap="round" opacity=".85"/>`;
    s+=`<path d="M${x+w},${y+topH-cs} L${x+w},${y+topH} L${x+w-cs},${y+topH}" fill="none" stroke="${cc}" stroke-width="${cw}" stroke-linecap="round" opacity=".85"/>`;
    // icon
    s+=icoFn(cx, y+8, w, topH-10);
    // bar
    s+=`<rect x="${x}" y="${y+topH}" width="${w}" height="${barH}" fill="rgba(0,5,14,.97)" clip-path="url(#${cid})"/>`;
    s+=`<rect x="${x}" y="${y+topH}" width="${w}" height="4" fill="rgba(0,5,14,.97)"/>`;
    s+=`<line x1="${x}" y1="${y+topH}" x2="${x+w}" y2="${y+topH}" stroke="${cc}" stroke-width="1" opacity=".65"/>`;
    s+=`<line x1="${cx-w*.28}" y1="${y+topH}" x2="${cx+w*.28}" y2="${y+topH}" stroke="${cc}" stroke-width="2" opacity=".85"/>`;
    s+=`<text x="${cx}" y="${y+topH+23}" text-anchor="middle" fill="${cc}" font-size="21" font-weight="900" font-family="Inter,-apple-system,sans-serif" filter="url(#tf)">${val}</text>`;
    s+=`<text x="${cx}" y="${y+topH+37}" text-anchor="middle" fill="${cc}" font-size="10" font-weight="700" font-family="Inter,-apple-system,sans-serif" opacity=".9">${dir}</text>`;
    s+=`<text x="${cx}" y="${y+topH+50}" text-anchor="middle" fill="rgba(200,230,255,.48)" font-size="9" font-family="Inter,-apple-system,sans-serif">${sub}</text>`;
    s+=`<circle cx="${x+w-7}" cy="${y+topH+14}" r="2" fill="${cc}"/>`;
    s+=`<circle cx="${x+w-7}" cy="${y+topH+21}" r="2" fill="${cc}" opacity=".5"/>`;
    s+=`<circle cx="${x+w-7}" cy="${y+topH+28}" r="2" fill="${cc}" opacity=".25"/>`;
    return s;
  }

  _renderUnconfigured() {
    this.shadowRoot.innerHTML=`<style>:host{display:block}</style>
      <ha-card style="padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">☀️🔋</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:8px;">Solar Weather Card</div>
        <div style="font-size:13px;color:var(--secondary-text-color);line-height:1.6;">
          Click <strong>✏️ Edit</strong> to configure entities.
        </div>
      </ha-card>`;
  }

  _render() {
    if(!this._hass) return;
    const cfg=this._config;
    if(!Object.values(cfg).some(v=>v&&String(v).trim()&&!['particle','line','vi','en'].includes(v)&&isNaN(v))){
      this._renderUnconfigured(); return;
    }

    const lang = cfg.language||'vi';
    const t18  = I18N[lang]||I18N.vi;
    const flowStyle = cfg.flow_style||'particle';
    const isParticle = flowStyle==='particle';
    const bgOpacity = (cfg.background_opacity??45)/100;

    // ── Sensors ──────────────────────────────────────────────
    const temp   = this._gf('temperature_entity',0).toFixed(1);
    const humid  = this._gf('humidity_entity',0).toFixed(0);
    const uv     = this._gf('uv_entity',0).toFixed(1);
    const rain   = this._g('rain_entity','');
    const press  = this._gf('pressure_entity',1012).toFixed(0);

    const wId    = cfg.weather_entity;
    const wState = (wId&&this._hass.states[wId]?.state)||'cloudy';
    const cond   = t18.condMap[wState]||'🌤️ '+wState;
    const wfc    = wId&&this._hass.states[wId]?.attributes?.forecast;
    const tempHi = wfc?Math.round(wfc[0].temperature):'--';
    const tempLo = wfc?Math.round(wfc[0].templow):'--';
    const condHTML  = makeWeatherIcon(wState);
    const tmrWstate = wfc&&wfc[1]?wfc[1].condition:wState;
    const tmrW      = t18.condMap[tmrWstate]||'🌤️ '+tmrWstate;
    const tmrHi     = wfc&&wfc[1]?Math.round(wfc[1].temperature):tempHi;
    const tmrLo     = wfc&&wfc[1]?Math.round(wfc[1].templow):tempLo;
    const tmrHTML   = makeWeatherIcon(tmrWstate);

    // Solar
    const pv1W   = this._gf('solar_pv1_entity',0);
    const pv2W   = this._gf('solar_pv2_entity',0);
    const solarW = pv1W+pv2W;
    const hasSolar=solarW>10;
    const pv1V   = this._gf('solar_pv1_voltage_entity',0);
    const pv2V   = this._gf('solar_pv2_voltage_entity',0);
    const pvDC   = ((pv1V+pv2V)/2).toFixed(0);

    // Battery
    const battSoc  = this._gf('battery_soc_entity',0);
    const battFlW  = this._gf('battery_flow_entity',0);
    const isCharge = battFlW>10, isDisch=battFlW<-10;
    const battW    = Math.abs(battFlW).toFixed(0);
    const battDir  = isCharge?t18.charging:(isDisch?t18.discharging:t18.standby);
    const bVolt    = parseFloat(this._gf('battery_voltage_entity',48));
    const bPct     = Math.round(battSoc);
    const manualWh = parseFloat(cfg.battery_capacity_wh||0);
    const sensorAh = this._gf('battery_capacity_entity',0);
    const voltForCap = bVolt>10?bVolt:48;
    let battCapWh;
    if(manualWh>0) battCapWh=manualWh;
    else if(sensorAh>0) battCapWh=sensorAh*voltForCap;
    else battCapWh=560*48;

    let battETA='';
    if(battCapWh>0){
      if(isCharge&&battFlW>0){
        const eta=Math.round((100-battSoc)/100*battCapWh/battFlW*60);
        if(eta>0){
          if(eta>=72000) battETA=t18.slowCharge;
          else battETA=t18.etaFull+(eta>=60?Math.floor(eta/60)+'h ':'')+eta%60+'m';
        }
      } else if(isDisch&&Math.abs(battFlW)>0){
        const eta2=Math.round(battSoc/100*battCapWh/Math.abs(battFlW)*60);
        if(eta2>0){
          if(eta2>=72000) battETA=t18.slowDisch;
          else battETA=t18.etaLeft+(eta2>=60?Math.floor(eta2/60)+'h ':'')+eta2%60+'m';
        }
      }
    }

    // Grid / Home / Stats
    const gridFlW = this._gf('grid_flow_entity',0);
    const hasGrid = Math.abs(gridFlW)>10;
    const gridW   = Math.abs(gridFlW).toFixed(0);
    const gridDir = gridFlW>10?t18.exportGrid:t18.importGrid;
    const gridV   = this._gf('grid_voltage_entity',220).toFixed(0);
    const homeFlW = this._gf('home_consumption_entity',0);
    const homeW   = homeFlW.toFixed(0);
    const hasHome = homeFlW>10;
    const daily       = this._gf('solar_today_entity',0).toFixed(1);
    const gridDaily   = this._gf('grid_today_entity',0).toFixed(1);
    const combinedFmt = this._gf('consumption_today_entity',0).toFixed(1);
    const saving      = this._calcEvn(parseFloat(daily));
    const savFmt      = saving>=1000000?(saving/1000000).toFixed(2)+'M':saving>=1000?Math.round(saving/1000)+'k':String(saving);

    // System
    const luxState = this._g('inverter_status_entity','--');
    const invTemp  = this._gf('inverter_temp_entity',0).toFixed(1);
    const batTemp  = this._gf('battery_temp_entity',0).toFixed(1);
    const isOff    = ['--','unavailable','unknown','Unavailable'].includes(luxState);
    const isNormal = ['Normal','normal','online','Online','ONLINE'].includes(luxState);
    const stColor  = isNormal?'rgba(74,222,128,1)':isOff?'rgba(255,80,80,1)':'rgba(255,200,60,1)';
    const stLabel  = isOff?'OFF':(isNormal?'ON':luxState);

    // Clock
    const now=new Date();
    const H=now.getHours(),M=now.getMinutes();
    const ap=H>=12?'PM':'AM', hh=String(H%12||12).padStart(2,'0'), mm=String(M).padStart(2,'0');
    const dateStr=`${t18.days[now.getDay()]}, ${now.getDate()} ${t18.months[now.getMonth()]} ${now.getFullYear()}`;

    // Sun arc
    const sunA=this._hass.states['sun.sun']?.attributes||{};
    const toMin=s=>{try{const p=s.split(':').map(Number);return p[0]*60+p[1];}catch(e){return 0;}};
    const riseStr=sunA.next_rising?new Date(sunA.next_rising).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}):'05:38';
    const setStr=sunA.next_setting?new Date(sunA.next_setting).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}):'18:12';
    const RISE=toMin(riseStr),SET=toMin(setStr),nowM=H*60+M;
    const t=Math.max(0,Math.min(1,(nowM-RISE)/(SET-RISE)));
    const bell=1-Math.pow(Math.abs(2*t-1),1.5);
    const pct=Math.round(t*100);
    const dayMin=SET-RISE,nightMin=1440-dayMin;
    const fmtDur=mn=>`${Math.floor(mn/60)}h ${mn%60}m`;

    // Sun position — cung hạ thấp theo YAML mới
    const bx=(1-t)*(1-t)*14+2*(1-t)*t*173+t*t*332;
    const by=(1-t)*(1-t)*65+2*(1-t)*t*(-45)+t*t*65;
    const lbw=88;
    const lbx=t<0.5?bx-lbw-10:bx+14;
    const lby=by-20;

    // Moon
    const isNight=nowM<RISE||nowM>SET;
    let tMoon=nowM>SET?(nowM-SET)/nightMin:(nowM+1440-SET)/nightMin;
    tMoon=Math.max(0,Math.min(1,tMoon));
    const mx2=(1-tMoon)*(1-tMoon)*332+2*(1-tMoon)*tMoon*173+tMoon*tMoon*14;
    const my2=(1-tMoon)*(1-tMoon)*65+2*(1-tMoon)*tMoon*145+tMoon*tMoon*65;

    // Layout constants (same for both modes — uses new YAML layout)
    const BAT_X=-40,BAT_Y=100,BAT_W=92,BAT_H=126;
    const GRD_X=295,GRD_Y=100,GRD_W=92,GRD_H=126;
    const INV_X=120,INV_Y=220,INV_W=106,INV_H=130;
    const HOM_X=120,HOM_Y=400,HOM_W=106,HOM_H=124;
    const BAT_CX=BAT_X+BAT_W/2,BAT_CY=BAT_Y+BAT_H/2,BAT_R=BAT_X+BAT_W,BAT_BOT=BAT_Y+BAT_H;
    const GRD_CX=GRD_X+GRD_W/2,GRD_CY=GRD_Y+GRD_H/2,GRD_L=GRD_X;
    const INV_CX=INV_X+INV_W/2,INV_L=INV_X,INV_TOP=INV_Y,INV_BOT=INV_Y+INV_H;
    const HOM_CX=HOM_X+HOM_W/2,HOM_TOP=HOM_Y;

    // ── Build flows ──────────────────────────────────────────
    let FL='', fpDefs='', fpIdx=0;

    if(isParticle) {
      const add=(pathD,color,glow,w)=>{
        const id=`fp-${fpIdx++}`;
        fpDefs+=`<path id="${id}" d="${pathD}"/>`;
        FL+=this._makeParticles(pathD,id,color,glow,this._particleLevel(w));
      };
      if(hasSolar) add(`M ${bx.toFixed(1)},${(by+7).toFixed(1)} C ${bx.toFixed(1)},${INV_TOP-70} ${INV_CX},${INV_TOP-150} ${INV_CX},${INV_TOP}`,'rgba(255,232,60,.95)','rgba(255,190,20,.55)',solarW);
      if(isCharge){
        add(`M${INV_L+30},${INV_BOT} C ${INV_L},${INV_BOT+90} ${BAT_CX},${BAT_BOT+180} ${BAT_CX},${BAT_BOT}`,'rgba(60,232,120,.95)','rgba(20,160,70,.55)',battFlW);
        FL+=`<text x="${INV_L-8}" y="${INV_BOT+45}" text-anchor="end" fill="rgba(100,255,160,.95)" font-size="9.5" font-weight="700" font-family="Inter">${battW}W</text>`;
      }
      if(isDisch){
        add(`M${BAT_R},${BAT_CY} C ${BAT_R},${BAT_CY+40} ${INV_CX},${INV_TOP-90} ${INV_CX-10},${INV_TOP}`,'rgba(255,205,40,.95)','rgba(200,140,10,.55)',Math.abs(battFlW));
        FL+=`<text x="${BAT_R+30}" y="${BAT_CY-30}" text-anchor="middle" fill="rgba(255,220,100,.95)" font-size="9.5" font-weight="700" font-family="Inter">${battW}W</text>`;
      }
      if(hasGrid){
        const gp=gridFlW>10?`M${INV_CX},${INV_TOP} C ${INV_CX},${INV_TOP-60} ${GRD_L},${GRD_CY+60} ${GRD_L},${GRD_CY}`:`M${GRD_L},${GRD_CY} C ${GRD_L},${GRD_CY+40} ${INV_CX+10},${INV_TOP-90} ${INV_CX+10},${INV_TOP}`;
        add(gp,'rgba(80,190,255,.95)','rgba(30,130,230,.55)',Math.abs(gridFlW));
        FL+=`<text x="${GRD_L-5}" y="${GRD_CY-10}" text-anchor="end" fill="rgba(140,210,255,.95)" font-size="9.5" font-weight="700" font-family="Inter">${gridW}W</text>`;
      }
      if(hasHome){
        add(`M${INV_CX},${INV_BOT+2} C ${INV_CX},${INV_BOT+20} ${HOM_CX},${HOM_TOP-20} ${HOM_CX},${HOM_TOP-2}`,'rgba(255,148,45,.95)','rgba(200,90,10,.55)',homeFlW);
        FL+=`<text x="${INV_CX+8}" y="${INV_BOT+22}" fill="rgba(255,185,100,.95)" font-size="9.5" font-weight="700" font-family="Inter">${homeW}W</text>`;
      }
    } else {
      // LINE mode — same bezier paths as particle but drawn as animated dashes
      if(hasSolar){
        const sp=`M ${bx.toFixed(1)},${(by+7).toFixed(1)} C ${bx.toFixed(1)},${INV_TOP-70} ${INV_CX},${INV_TOP-150} ${INV_CX},${INV_TOP}`;
        FL+=this._lineFlow(sp,solarW,5000,'rgba(255,250,200,X)','rgba(255,215,55,X)','rgba(255,235,120,X)');
      }
      if(isCharge){
        const p=`M${INV_L+30},${INV_BOT} C ${INV_L},${INV_BOT+90} ${BAT_CX},${BAT_BOT+180} ${BAT_CX},${BAT_BOT}`;
        FL+=this._lineFlow(p,battFlW,3000,'rgba(200,255,220,X)','rgba(80,220,120,X)','rgba(160,240,180,X)');
        FL+=`<text x="${INV_L-8}" y="${INV_BOT+45}" text-anchor="end" fill="rgba(100,255,160,.95)" font-size="9.5" font-weight="700" font-family="Inter">${battW}W</text>`;
      }
      if(isDisch){
        const p=`M${BAT_R},${BAT_CY} C ${BAT_R},${BAT_CY+40} ${INV_CX},${INV_TOP-90} ${INV_CX-10},${INV_TOP}`;
        FL+=this._lineFlow(p,Math.abs(battFlW),3000,'rgba(255,245,180,X)','rgba(255,200,60,X)','rgba(255,230,130,X)');
        FL+=`<text x="${BAT_R+30}" y="${BAT_CY-30}" text-anchor="middle" fill="rgba(255,220,100,.95)" font-size="9.5" font-weight="700" font-family="Inter">${battW}W</text>`;
      }
      if(hasGrid){
        const gp=gridFlW>10?`M${INV_CX},${INV_TOP} C ${INV_CX},${INV_TOP-60} ${GRD_L},${GRD_CY+60} ${GRD_L},${GRD_CY}`:`M${GRD_L},${GRD_CY} C ${GRD_L},${GRD_CY+40} ${INV_CX+10},${INV_TOP-90} ${INV_CX+10},${INV_TOP}`;
        FL+=this._lineFlow(gp,Math.abs(gridFlW),5000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
        FL+=`<text x="${GRD_L-5}" y="${GRD_CY-10}" text-anchor="end" fill="rgba(140,210,255,.95)" font-size="9.5" font-weight="700" font-family="Inter">${gridW}W</text>`;
      }
      if(hasHome){
        const p=`M${INV_CX},${INV_BOT+2} C ${INV_CX},${INV_BOT+20} ${HOM_CX},${HOM_TOP-20} ${HOM_CX},${HOM_TOP-2}`;
        FL+=this._lineFlow(p,homeFlW,5000,'rgba(255,230,180,X)','rgba(255,148,55,X)','rgba(255,190,100,X)');
        FL+=`<text x="${INV_CX+8}" y="${INV_BOT+22}" fill="rgba(255,185,100,.95)" font-size="9.5" font-weight="700" font-family="Inter">${homeW}W</text>`;
      }
    }

    // ── Icon functions ────────────────────────────────────────
    const battFillC=battSoc>50?'rgba(60,220,110,.95)':battSoc>20?'rgba(255,200,50,.95)':'rgba(255,70,70,.95)';

    const batIcoFn=(cx2,iy,aw,ah)=>{
      const bw=58,bh=26,bx0=cx2-bw/2,by0=iy+(ah-bh)/2-2;
      const fw=Math.max(2,Math.round((bw-8)*battSoc/100));
      let s='<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>';
      s+=`<ellipse cx="${cx2}" cy="${by0+bh+6}" rx="25" ry="4" fill="rgba(40,230,120,.22)" filter="url(#pBlur)"/>`;
      s+=`<rect x="${bx0-1}" y="${by0-1}" width="${bw+9}" height="${bh+2}" rx="7" fill="none" stroke="rgba(40,230,160,.35)" stroke-width="7" filter="url(#pBlur)"/>`;
      s+=`<rect x="${bx0}" y="${by0}" width="${bw}" height="${bh}" rx="6" fill="rgba(0,22,14,.96)" stroke="rgba(40,230,160,.92)" stroke-width="1.5"/>`;
      s+=`<rect x="${bx0+bw}" y="${by0+bh/2-5}" width="7" height="10" rx="3" fill="rgba(30,180,110,.4)" stroke="rgba(40,230,160,.8)" stroke-width="1.1"/>`;
      s+=`<rect x="${bx0+bw+1.5}" y="${by0+bh/2-3}" width="3.5" height="6" rx="1.5" fill="rgba(40,230,140,.6)"/>`;
      s+=`<rect x="${bx0+4}" y="${by0+4}" width="${fw}" height="${bh-8}" rx="3" fill="${battFillC}"/>`;
      s+=`<rect x="${bx0+4}" y="${by0+4}" width="${fw}" height="5" rx="3" fill="rgba(255,255,255,.2)"/>`;
      s+=`<rect x="${bx0+fw+4}" y="${by0+4}" width="${bw-fw-8}" height="${bh-8}" rx="3" fill="rgba(40,230,120,.06)"/>`;
      s+=`<line x1="${bx0+bw/3}" y1="${by0+3}" x2="${bx0+bw/3}" y2="${by0+bh-3}" stroke="rgba(0,18,10,.92)" stroke-width="1.6"/>`;
      s+=`<line x1="${bx0+bw*2/3}" y1="${by0+3}" x2="${bx0+bw*2/3}" y2="${by0+bh-3}" stroke="rgba(0,18,10,.92)" stroke-width="1.6"/>`;
      s+=`<text x="${cx2}" y="${by0+bh/2+4.5}" text-anchor="middle" fill="rgba(255,255,255,.97)" font-size="10" font-weight="800" font-family="-apple-system,sans-serif">${bPct}%</text>`;
      if(isCharge){
        const boltCX=Math.min(bx0+fw*0.6+4,bx0+bw-14);
        const bt=by0+4,bb=by0+bh-4,bmid=(bt+bb)/2;
        s+=`<polygon points="${boltCX+3},${bt} ${boltCX},${bmid} ${boltCX+2.5},${bmid} ${boltCX-1},${bb} ${boltCX+5},${bmid} ${boltCX+2.5},${bmid}" fill="rgba(255,255,220,.95)"/>`;
      }
      s+='</g>';
      return s;
    };

    const invIcoFn=(cx2,iy,aw,ah)=>{
      const iw=54,ih=46,ix=cx2-iw/2,iy0=iy+(ah-ih)/2-2;
      let s='<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.3s" begin=".55s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>';
      s+=`<ellipse cx="${cx2}" cy="${iy0+ih+6}" rx="22" ry="3.5" fill="rgba(140,90,255,.2)" filter="url(#pBlur)"/>`;
      s+=`<rect x="${ix}" y="${iy0}" width="${iw}" height="${ih}" rx="4" fill="none" stroke="rgba(185,145,255,.28)" stroke-width="7" filter="url(#pBlur)"/>`;
      s+=`<polygon points="${ix},${iy0} ${ix+iw},${iy0} ${ix+iw+6},${iy0-5} ${ix+6},${iy0-5}" fill="rgba(34,18,78,.92)" stroke="rgba(205,175,255,.5)" stroke-width=".9"/>`;
      s+=`<polygon points="${ix+iw},${iy0} ${ix+iw+6},${iy0-5} ${ix+iw+6},${iy0+ih-5} ${ix+iw},${iy0+ih}" fill="rgba(10,5,26,.92)" stroke="rgba(155,112,232,.42)" stroke-width=".9"/>`;
      s+=`<rect x="${ix}" y="${iy0}" width="${iw}" height="${ih}" rx="3" fill="rgba(14,7,42,.98)" stroke="rgba(185,145,255,.88)" stroke-width="1.2"/>`;
      s+=`<rect x="${ix+3}" y="${iy0+3}" width="${iw-6}" height="8.5" rx="1.5" fill="rgba(18,8,48,.9)" stroke="rgba(165,122,255,.4)" stroke-width=".65"/>`;
      s+=`<rect x="${ix+5}" y="${iy0+4.5}" width="${iw*.52}" height="5.5" rx="1" fill="rgba(3,1,14,.96)" stroke="rgba(165,122,255,.52)" stroke-width=".6"/>`;
      const wp=ix+6,ws=((iw*.52)-4)/9;
      const wpts=`${wp},${iy0+7} ${wp+ws},${iy0+4.5} ${wp+ws*2},${iy0+9.5} ${wp+ws*3},${iy0+4.5} ${wp+ws*4},${iy0+9.5} ${wp+ws*5},${iy0+4.5} ${wp+ws*6},${iy0+7}`;
      s+=`<polyline points="${wpts}" fill="none" stroke="rgba(205,175,255,.9)" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 3"><animate attributeName="stroke-dashoffset" from="0" to="-18" dur=".7s" repeatCount="indefinite" calcMode="linear"/></polyline>`;
      s+=`<polyline points="${wpts}" fill="none" stroke="rgba(205,175,255,.4)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 3" filter="url(#pBlurSm)"><animate attributeName="stroke-dashoffset" from="0" to="-18" dur=".7s" repeatCount="indefinite" calcMode="linear"/></polyline>`;
      s+=`<circle cx="${ix+iw-13}" cy="${iy0+7}" r="1.8" fill="rgba(40,232,142,.95)"><animate attributeName="opacity" values="1;.2;1" dur="1.8s" repeatCount="indefinite"/></circle>`;
      s+=`<circle cx="${ix+iw-8}" cy="${iy0+7}" r="1.8" fill="rgba(255,215,52,.7)"><animate attributeName="opacity" values="1;.2;1" dur="2.5s" begin=".4s" repeatCount="indefinite"/></circle>`;
      s+=`<circle cx="${ix+iw-3}" cy="${iy0+7}" r="1.8" fill="rgba(185,145,255,.55)"/>`;
      s+=`<rect x="${ix+3}" y="${iy0+14}" width="${iw-6}" height="8" rx="1.5" fill="rgba(18,8,48,.9)" stroke="rgba(165,122,255,.32)" stroke-width=".65"/>`;
      const pw2=Math.floor((iw-10)/3);
      ['AC','DC','PV'].forEach((lbl,li)=>{
        const px2=ix+4+li*(pw2+1);
        s+=`<rect x="${px2}" y="${iy0+15}" width="${pw2}" height="5.5" rx="1" fill="rgba(3,1,14,.92)" stroke="rgba(165,122,255,.35)" stroke-width=".55"/>`;
        s+=`<text x="${px2+pw2/2}" y="${iy0+19.5}" text-anchor="middle" fill="rgba(205,175,255,${li===0?'.7':li===1?'.55':'.42'})" font-size="3.5" font-weight="700" font-family="-apple-system,sans-serif">${lbl}</text>`;
      });
      s+=`<rect x="${ix+3}" y="${iy0+24}" width="${iw-6}" height="10" rx="1.5" fill="rgba(18,8,48,.9)" stroke="rgba(165,122,255,.25)" stroke-width=".65"/>`;
      for(let vi=0;vi<5;vi++) s+=`<line x1="${ix+5+vi*3}" y1="${iy0+25.5}" x2="${ix+5+vi*3}" y2="${iy0+33}" stroke="rgba(165,122,255,${0.4-vi*0.05})" stroke-width=".85"/>`;
      const fcx=ix+iw-13,fcy=iy0+29,fr=6.5;
      s+=`<circle cx="${fcx}" cy="${fcy}" r="${fr+2}" fill="rgba(185,145,255,.15)" filter="url(#pBlur)"/>`;
      s+=`<circle cx="${fcx}" cy="${fcy}" r="${fr}" fill="rgba(8,4,24,.92)" stroke="rgba(185,145,255,.55)" stroke-width="1.2"/>`;
      s+=`<g><animateTransform attributeName="transform" type="rotate" from="0 ${fcx} ${fcy}" to="360 ${fcx} ${fcy}" dur="1.5s" repeatCount="indefinite" calcMode="linear"/>`;
      s+=`<path d="M${fcx},${fcy-1.2} Q${fcx+fr*.55},${fcy-fr*.7} ${fcx+fr*.72},${fcy-fr*.42} Q${fcx+fr*.35},${fcy-fr*.05} ${fcx},${fcy-1.2}Z" fill="rgba(185,145,255,.8)"/>`;
      s+=`<path d="M${fcx+1.04},${fcy+.6} Q${fcx+fr*.1},${fcy+fr*.88} ${fcx-fr*.28},${fcy+fr*.83} Q${fcx-fr*.25},${fcy+fr*.25} ${fcx+1.04},${fcy+.6}Z" fill="rgba(185,145,255,.7)"/>`;
      s+=`<path d="M${fcx-1.04},${fcy+.6} Q${fcx-fr*.65},${fcy-fr*.18} ${fcx-fr*.44},${fcy-fr*.41} Q${fcx-fr*.1},${fcy+fr*.13} ${fcx-1.04},${fcy+.6}Z" fill="rgba(185,145,255,.75)"/></g>`;
      s+=`<circle cx="${fcx}" cy="${fcy}" r="2" fill="rgba(220,200,255,.95)" stroke="rgba(185,145,255,.6)" stroke-width=".8"/>`;
      s+=`<circle cx="${fcx}" cy="${fcy}" r="${fr}" fill="none" stroke="rgba(185,145,255,.35)" stroke-width="1.5" filter="url(#pBlurSm)"><animate attributeName="opacity" values=".2;.8;.2" dur="1.5s" repeatCount="indefinite"/></circle>`;
      s+=`<rect x="${ix+3}" y="${iy0+34}" width="${iw-6}" height="6" rx="1.5" fill="rgba(18,8,48,.9)" stroke="rgba(165,122,255,.18)" stroke-width=".6"/>`;
      s+=`<text x="${cx2}" y="${iy0+38.5}" text-anchor="middle" fill="rgba(180,150,255,.42)" font-size="3.8" font-weight="700" font-family="-apple-system,sans-serif" letter-spacing=".7">LUX POWER</text>`;
      s+=`<polygon points="${ix},${iy0} ${ix+iw},${iy0} ${ix+iw+6},${iy0-5} ${ix+6},${iy0-5}" fill="rgba(255,255,255,.04)"/>`;
      s+='</g>';
      return s;
    };

    const grdIcoFn=(cx2,iy,aw,ah)=>{
      const oy=iy+(ah-62)/2;
      const lc=(dx1,dy1,dx2,dy2,c,w)=>`<line x1="${cx2+dx1}" y1="${oy+dy1}" x2="${cx2+dx2}" y2="${oy+dy2}" stroke="${c}" stroke-width="${w||1.1}" stroke-linecap="round"/>`;
      let s='<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="2.9s" begin="1.1s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>';
      s+=`<ellipse cx="${cx2}" cy="${oy+66}" rx="26" ry="3" fill="rgba(0,175,255,.14)" filter="url(#pBlur)"/>`;
      s+=lc(0,52,-14,62,'rgba(0,210,255,.78)',2.2)+lc(0,52,14,62,'rgba(0,210,255,.78)',2.2)+lc(-14,62,14,62,'rgba(0,185,255,.5)',1.9)+lc(-7,57,7,57,'rgba(0,200,255,.55)',1.0);
      s+=lc(-6,4,-11,52,'rgba(0,215,255,.9)',2.0)+lc(-1,4,-5,52,'rgba(0,210,255,.7)',1.4)+lc(1,4,5,52,'rgba(0,210,255,.7)',1.4)+lc(6,4,11,52,'rgba(0,215,255,.9)',2.0);
      s+=lc(-6,4,6,4,'rgba(0,225,255,.95)',2.0);
      s+=lc(-5,13,5,13,'rgba(0,210,255,.72)',1.1)+lc(-7,24,7,24,'rgba(0,205,255,.68)',1.1)+lc(-9,36,9,36,'rgba(0,200,255,.62)',1.1)+lc(-10,47,10,47,'rgba(0,195,255,.58)',1.1);
      s+=lc(-6,4,5,13,'rgba(0,200,255,.48)',0.9)+lc(6,4,-5,13,'rgba(0,200,255,.48)',0.9)+lc(-5,13,7,24,'rgba(0,195,255,.44)',0.9)+lc(5,13,-7,24,'rgba(0,195,255,.44)',0.9);
      s+=lc(-7,24,9,36,'rgba(0,190,255,.40)',0.9)+lc(7,24,-9,36,'rgba(0,190,255,.40)',0.9)+lc(-9,36,10,47,'rgba(0,185,255,.36)',0.9)+lc(9,36,-10,47,'rgba(0,185,255,.36)',0.9);
      s+=lc(-5,13,-22,13,'rgba(0,218,255,.85)',1.9)+lc(5,13,22,13,'rgba(0,218,255,.85)',1.9)+lc(-5,13,-18,7,'rgba(0,205,255,.55)',1.0)+lc(5,13,18,7,'rgba(0,205,255,.55)',1.0);
      s+=lc(-9,36,-24,36,'rgba(0,215,255,.82)',2.0)+lc(9,36,24,36,'rgba(0,215,255,.82)',2.0)+lc(-9,36,-20,30,'rgba(0,200,255,.50)',1.0)+lc(9,36,20,30,'rgba(0,200,255,.50)',1.0);
      const ins=(dx,dy)=>{const ax=cx2+dx,ay=oy+dy;return `<rect x="${ax-2.5}" y="${ay-4}" width="5" height="8" rx="2" fill="rgba(2,14,28,.96)" stroke="rgba(0,228,255,.88)" stroke-width="1"/><circle cx="${ax}" cy="${ay-4}" r="2" fill="rgba(0,235,255,1)" filter="url(#pBlurSm)"/>`;};
      s+=ins(-22,13)+ins(22,13)+ins(0,3)+ins(-24,36)+ins(24,36);
      s+=`<line x1="${cx2}" y1="${oy+4}" x2="${cx2}" y2="${oy}" stroke="rgba(0,238,255,.95)" stroke-width="1.8" stroke-linecap="round"/>`;
      s+=`<circle cx="${cx2}" cy="${oy}" r="2.5" fill="rgba(0,238,255,1)" filter="url(#pBlurSm)"/>`;
      s+='</g>';
      return s;
    };

    const homIcoFn=(cx2,iy,aw,ah)=>{
      const sc=0.82,ox=cx2-43*sc,oy=iy+(ah-68*sc)/2;
      const p=(x,y)=>`${ox+x*sc},${oy+y*sc}`;
      let s='<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.5s" begin="1.65s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>';
      s+=`<ellipse cx="${cx2}" cy="${oy+72*sc}" rx="${36*sc}" ry="${3.8*sc}" fill="rgba(235,145,20,.18)" filter="url(#pBlur)"/>`;
      s+=`<rect x="${ox+52*sc}" y="${oy+2*sc}" width="${6*sc}" height="${12*sc}" rx="${1.5*sc}" fill="rgba(92,40,10,.88)" stroke="rgba(218,125,34,.62)" stroke-width="${0.9*sc}"/>`;
      s+=`<polygon points="${p(2,22)} ${p(30,6)} ${p(30,9)} ${p(2,25)}" fill="rgba(8,26,56,.8)" stroke="rgba(40,178,255,.45)" stroke-width="${0.8*sc}"/>`;
      s+=`<polygon points="${p(2,22)} ${p(30,6)} ${p(30,10)} ${p(2,26)}" fill="rgba(185,80,16,.88)" stroke="rgba(232,132,44,.88)" stroke-width="${0.95*sc}"/>`;
      s+=`<polygon points="${p(30,6)} ${p(62,22)} ${p(62,26)} ${p(30,10)}" fill="rgba(115,45,8,.88)" stroke="rgba(192,96,32,.78)" stroke-width="${0.95*sc}"/>`;
      s+=`<rect x="${ox}" y="${oy+20*sc}" width="${64*sc}" height="${4*sc}" rx="${sc}" fill="rgba(205,122,24,.18)" stroke="rgba(255,175,42,.44)" stroke-width="${0.85*sc}"/>`;
      s+=`<polygon points="${p(2,24)} ${p(30,24)} ${p(30,68)} ${p(2,68)}" fill="rgba(55,25,7,.96)" stroke="rgba(182,90,28,.55)" stroke-width="${0.85*sc}"/>`;
      s+=`<polygon points="${p(30,24)} ${p(62,24)} ${p(62,68)} ${p(30,68)}" fill="rgba(34,14,3,.97)" stroke="rgba(148,66,20,.48)" stroke-width="${0.85*sc}"/>`;
      const wn=(x,y,ww,wh)=>`<rect x="${ox+x*sc}" y="${oy+y*sc}" width="${ww*sc}" height="${wh*sc}" rx="${1.5*sc}" fill="rgba(255,218,95,.22)" stroke="rgba(255,198,62,.72)" stroke-width="${0.9*sc}"/>`;
      s+=wn(4,28,8,7)+wn(14,28,8,7)+wn(4,44,8,7)+wn(14,44,8,7);
      s+=`<rect x="${ox+33*sc}" y="${oy+26*sc}" width="${25*sc}" height="${16*sc}" rx="${1.5*sc}" fill="rgba(255,218,95,.2)" stroke="rgba(255,202,66,.72)" stroke-width="${0.9*sc}"/>`;
      s+=`<line x1="${p(45,26)}" x2="${p(45,42)}" stroke="rgba(255,185,52,.28)" stroke-width="${0.7*sc}"/>`;
      s+=`<line x1="${p(33,34)}" x2="${p(58,34)}" stroke="rgba(255,185,52,.28)" stroke-width="${0.7*sc}"/>`;
      s+=`<rect x="${ox+21*sc}" y="${oy+50*sc}" width="${8*sc}" height="${18*sc}" rx="${1.5*sc}" fill="rgba(8,4,1,.96)" stroke="rgba(255,175,42,.5)" stroke-width="${0.9*sc}"/>`;
      s+=`<circle cx="${ox+27.5*sc}" cy="${oy+60*sc}" r="${sc}" fill="rgba(255,178,42,.88)"/>`;
      s+=`<rect x="${ox+33*sc}" y="${oy+44*sc}" width="${26*sc}" height="${24*sc}" rx="${sc}" fill="rgba(195,115,22,.1)" stroke="rgba(255,175,42,.45)" stroke-width="${0.85*sc}"/>`;
      [51,56,61].forEach(yy=>{s+=`<line x1="${p(33,yy)}" x2="${p(59,yy)}" stroke="rgba(255,172,40,.42)" stroke-width="${0.75*sc}" stroke-linecap="round"/>`;});
      s+=`<line x1="${p(46,44)}" x2="${p(46,68)}" stroke="rgba(255,172,40,.42)" stroke-width="${0.75*sc}" stroke-linecap="round"/>`;
      s+=`<rect x="${ox-2}" y="${oy+67*sc}" width="${90*sc}" height="${3.5*sc}" rx="${1.2*sc}" fill="rgba(182,102,16,.22)" stroke="rgba(255,175,42,.32)" stroke-width="${0.7*sc}"/>`;
      s+='</g>';
      return s;
    };

    // Node cards
    const isInvActive=hasSolar||hasHome||hasGrid||isCharge||isDisch;
    const foBAT=this._svgCard(BAT_X,BAT_Y,BAT_W,BAT_H,'rgba(40,230,160,1)','rgba(30,190,120,.5)','rgba(0,14,8,.97)',batIcoFn,`${battW}W`,battDir,`${bVolt.toFixed(0)}V DC`,isCharge||isDisch);
    const foINV=this._svgCard(INV_X,INV_Y,INV_W,INV_H,'rgba(185,145,255,1)','rgba(145,90,255,.48)','rgba(6,2,18,.97)',invIcoFn,`${gridV}V`,'AC Output',`${bVolt.toFixed(0)}V BAT · ${pvDC}V PV`,isInvActive);
    const foGRD=this._svgCard(GRD_X,GRD_Y,GRD_W,GRD_H,'rgba(0,215,255,1)','rgba(0,165,240,.48)','rgba(0,10,20,.97)',grdIcoFn,`${gridW}W`,gridDir,`${gridV}V AC`,hasGrid);
    const foHOM=this._svgCard(HOM_X,HOM_Y,HOM_W,HOM_H,'rgba(255,178,40,1)','rgba(220,132,14,.48)','rgba(12,6,0,.97)',homIcoFn,`${homeW}W`,t18.homeConsume,'Home',hasHome);

    // Dynamic sky aura
    let r1,g1,b1,r2,g2,b2;
    if(t<0.25){const p=t/0.25;r1=Math.round(30+p*20);g1=Math.round(100+p*120);b1=Math.round(200-p*80);r2=Math.round(20+p*10);g2=Math.round(80+p*80);b2=Math.round(160-p*60);}
    else if(t<0.5){const p=(t-0.25)/0.25;r1=Math.round(50+p*180);g1=Math.round(220-p*50);b1=Math.round(120-p*110);r2=Math.round(30+p*150);g2=Math.round(160-p*40);b2=Math.round(100-p*90);}
    else if(t<0.75){const p=(t-0.5)/0.25;r1=Math.round(230+p*20);g1=Math.round(170-p*80);b1=Math.round(10+p*10);r2=Math.round(180+p*20);g2=Math.round(120-p*60);b2=10;}
    else{const p=(t-0.75)/0.25;r1=Math.round(250-p*200);g1=Math.round(90-p*60);b1=Math.round(20+p*180);r2=Math.round(200-p*160);g2=Math.round(60-p*40);b2=Math.round(10+p*140);}

    // Sun heartbeat
    let sunSVG='';
    if(!isNight){
      const powerRatio=Math.min(1,solarW/8000);
      const cR=255,cG=Math.round(235-bell*110),cB=Math.round(130-bell*120);
      const gR=255,gG=Math.round(200-bell*120),gB=Math.round(80-bell*70);
      const rCore=(5+powerRatio*5).toFixed(1);
      const rGlow1=(10+powerRatio*18).toFixed(1);
      const rGlow2=(18+powerRatio*28).toFixed(1);
      const beatDur=(2.2-powerRatio*1.75).toFixed(2);
      const blur=(3+powerRatio*5).toFixed(1);
      sunSVG=`<defs><filter id="sunGlowF" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="${blur}"/></filter><radialGradient id="sunCoreG" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="rgba(255,255,220,.98)"/><stop offset="40%" stop-color="rgb(${cR},${cG},${cB})"/><stop offset="100%" stop-color="rgba(${gR},${gG},${gB},.6)"/></radialGradient></defs>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rGlow2}" fill="rgba(${gR},${gG},${gB},.18)" filter="url(#sunGlowF)"><animate attributeName="r" values="${rGlow2};${(parseFloat(rGlow2)*1.22).toFixed(1)};${(parseFloat(rGlow2)*1.08).toFixed(1)};${(parseFloat(rGlow2)*1.22).toFixed(1)};${rGlow2}" dur="${beatDur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/><animate attributeName="opacity" values="0.55;1;0.3;0.9;0.55" dur="${beatDur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rGlow1}" fill="rgba(${gR},${gG},${gB},.55)" filter="url(#sf)"><animate attributeName="r" values="${rGlow1};${(parseFloat(rGlow1)*1.28).toFixed(1)};${(parseFloat(rGlow1)*1.10).toFixed(1)};${(parseFloat(rGlow1)*1.28).toFixed(1)};${rGlow1}" dur="${beatDur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/><animate attributeName="opacity" values="0.7;1;0.35;1;0.7" dur="${beatDur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rCore}" fill="url(#sunCoreG)" stroke="rgba(255,255,200,.85)" stroke-width="1.2"><animate attributeName="r" values="${rCore};${(parseFloat(rCore)*1.18).toFixed(1)};${rCore};${(parseFloat(rCore)*1.10).toFixed(1)};${rCore}" dur="${beatDur}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
    }

    // Moon SVG
    const mcx=isNight?mx2:((1-t)*(1-t)*332+2*(1-t)*t*173+t*t*14);
    const mcy=isNight?my2:((1-t)*(1-t)*115+2*(1-t)*t*95+t*t*115);
    const moonSVG=`<g filter="url(#mf)" opacity="${isNight?'1':'.35'}"><circle cx="${mcx}" cy="${mcy}" r="${isNight?10:7}" fill="${isNight?'rgba(180,205,255,.3)':'rgba(180,205,255,.10)'}"/><circle cx="${mcx}" cy="${mcy}" r="${isNight?6:3.5}" fill="${isNight?'rgba(220,235,255,.98)':'rgba(200,218,255,.85)'}" stroke="${isNight?'rgba(240,248,255,.9)':'rgba(225,235,255,.65)'}" stroke-width="1.2"/></g>`;

    // Battery bar
    let barColor,barGlow;
    if(bPct<=10){barColor='linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444)';barGlow='rgba(239,68,68,.6)';}
    else if(bPct<=20){barColor='linear-gradient(90deg,#dc2626,#ea580c,#f59e0b)';barGlow='rgba(245,158,11,.55)';}
    else{barColor='linear-gradient(90deg,#16a34a,#4ade80,#86efac)';barGlow='rgba(74,222,128,.5)';}
    const battBarColor2=`background:${barColor};box-shadow:0 0 8px ${barGlow}`;

    // Ticker
    const tickerMsg=t18.ticker(wState,daily,savFmt,bPct,isCharge,isDisch,battSoc);
    const ticker2=tickerMsg+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+tickerMsg;

    // Stats cells
    const cell='background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:10px 6px;text-align:center;';
    const lbl='font-size:10px;color:rgba(255,255,255,.45);margin-top:2px;white-space:nowrap;';
    const val='font-size:13px;font-weight:700;white-space:nowrap;';
    const ico='font-size:16px;margin-bottom:3px;';

    // Background
    const o=bgOpacity;
    const bg=`linear-gradient(135deg,rgba(0,20,30,${o}) 0%,rgba(0,40,50,${(o*0.78).toFixed(2)}) 100%)`;

    // ═══ HTML ═══════════════════════════════════════════════
    this.shadowRoot.innerHTML = `
      <style>:host{display:block}*{box-sizing:border-box;margin:0;padding:0}
      @keyframes scrollTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      </style>
      <div style="font-family:Inter,-apple-system,sans-serif;color:#fff;
        background:${bg};
        backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
        border:1px solid rgba(255,255,255,0.18);border-radius:24px;
        box-shadow:0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.20);
        overflow:hidden;">

        <!-- WEATHER HEADER -->
        <div style="padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
          <div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;margin-bottom:12px;">
            <div>${condHTML}</div>
            <div style="text-align:center;">
              <div style="font-size:80px;font-weight:800;line-height:1;letter-spacing:-3px;text-shadow:0 2px 20px rgba(255,255,255,.25);">
                ${hh}:${mm}<span style="font-size:28px;font-weight:400;opacity:.55;margin-left:4px;">${ap}</span>
              </div>
              <div style="font-size:18px;color:rgba(255,255,255,.55);margin-top:3px;">${dateStr}</div>
            </div>
            <div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 0;font-size:12px;color:rgba(255,255,255,.6);margin-bottom:8px;">
            <div>${cond}</div>
            <div style="text-align:right;">⚡ <span style="color:#fff;font-weight:600;">${tempHi}°</span> / <span style="color:rgba(255,255,255,.6);">${tempLo}°C</span></div>
            <div>🌡️ <span style="color:#fff;font-weight:600;">${temp}°C</span> &nbsp;💧 <span style="color:#fff;font-weight:600;">${humid}%</span></div>
            <div style="text-align:right;">UV <span style="color:#fff;font-weight:600;">${uv}</span> &nbsp;🌬️ <span style="color:#fff;font-weight:600;">${press}</span></div>
            ${rain?`<div style="color:rgba(255,255,255,.5);font-size:11px;">🌧️ <span style="color:rgba(255,220,100,.9);font-weight:600;">${rain}</span></div><div style="text-align:right;font-size:11px;color:rgba(255,255,255,.4);">hPa</div>`:`<div></div><div style="text-align:right;font-size:11px;color:rgba(255,255,255,.4);">hPa</div>`}
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:7px 11px;font-size:11.5px;">
            <span style="color:rgba(255,255,255,.45);">${t18.tomorrow}</span>
            <div style="transform:scale(0.55);transform-origin:center center;width:40px;height:25px;flex-shrink:0;position:relative;top:-18px;">${tmrHTML}</div>
            <span style="color:#fff;font-weight:600;">${tmrW}</span>
            <span style="margin-left:auto;color:#fff;font-weight:600;">${tmrHi}°</span>
            <span style="color:rgba(255,255,255,.45);">/</span>
            <span style="color:rgba(255,255,255,.65);">${tmrLo}°C</span>
          </div>
        </div>

        <!-- SUN ARC + ENERGY FLOW -->
        <div style="padding:8px 0 10px;border-bottom:1px solid rgba(255,255,255,.10);">
          <div style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.55);margin-bottom:5px;padding:0 14px;">
            <span>🌅 <strong style="color:#fff;">${riseStr}</strong> ${t18.sunrise}</span>
            <span><strong style="color:#fff;">${pct}%</strong> ${t18.dayPct}</span>
            <span>${t18.sunset} <strong style="color:#fff;">${setStr}</strong> 🌇</span>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;padding:0 14px;">
            <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(255,200,70,.15);border:1px solid rgba(255,200,70,.35);color:rgba(255,225,110,.95);">☀️ ${t18.daytime}: ${fmtDur(dayMin)}</div>
            <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(140,175,255,.12);border:1px solid rgba(140,175,255,.3);color:rgba(185,210,255,.9);">🌙 ${t18.nighttime}: ${fmtDur(nightMin)}</div>
          </div>
          <div style="position:relative;width:100%;height:500px;">
            <svg viewBox="0 0 346 530" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;">
              <defs>
                <filter id="pBlur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4"/></filter>
                <filter id="pBlurSm" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.5"/></filter>
                <filter id="sf"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="mf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="tf" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/><feFlood flood-color="rgba(0,0,0,.55)" result="c"/><feComposite in="c" in2="b" operator="in" result="d"/><feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(255,180,50,0)"/><stop offset="20%" stop-color="rgba(255,200,70,.5)"/><stop offset="50%" stop-color="rgba(255,228,110,.92)"/><stop offset="80%" stop-color="rgba(255,200,70,.5)"/><stop offset="100%" stop-color="rgba(255,180,50,0)"/></linearGradient>
                <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(140,170,255,0)"/><stop offset="50%" stop-color="rgba(200,215,255,.7)"/><stop offset="100%" stop-color="rgba(140,170,255,0)"/></linearGradient>
                <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(55,125,225,.10)"/><stop offset="100%" stop-color="rgba(55,125,225,0)"/></linearGradient>
                <radialGradient id="dynAuraG" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="rgba(${r1},${g1},${b1},.30)"/><stop offset="55%" stop-color="rgba(${r2},${g2},${b2},.10)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
                ${fpDefs}
              </defs>

              <ellipse cx="173" cy="${100-Math.round(bell*25)}" rx="155" ry="105" fill="url(#dynAuraG)"/>
              <path d="M14,65 Q173,-45 332,65 Z" fill="url(#skyG)"/>
              <line x1="6" y1="65" x2="340" y2="65" stroke="rgba(255,255,255,.12)" stroke-width="1" stroke-dasharray="3,8"/>
              <circle cx="14"  cy="65" r="3" fill="rgba(255,200,80,.65)"/>
              <circle cx="173" cy="65" r="2" fill="rgba(255,255,255,.25)"/>
              <circle cx="332" cy="65" r="3" fill="rgba(255,110,55,.65)"/>
              <text x="14"  y="77" fill="rgba(255,255,255,.45)" font-size="9" font-family="Inter" text-anchor="middle">${riseStr}</text>
              <text x="173" y="77" fill="rgba(255,255,255,.28)" font-size="9" font-family="Inter" text-anchor="middle">12:00</text>
              <text x="332" y="77" fill="rgba(255,255,255,.45)" font-size="9" font-family="Inter" text-anchor="middle">${setStr}</text>
              <path d="M14,65 Q173,-45 332,65" fill="none" stroke="url(#dg)" stroke-width="2.2"/>
              <path d="M332,65 Q173,145 14,65" fill="none" stroke="url(#ng)" stroke-width="1.5" stroke-dasharray="4,5" opacity=".35"/>

              ${sunSVG}
              <rect x="${lbx}" y="${lby}" width="${lbw}" height="26" rx="13" fill="rgba(255,200,50,.22)" stroke="rgba(255,210,60,.45)" stroke-width="1.2"/>
              <text x="${lbx+lbw/2}" y="${lby+17}" text-anchor="middle" fill="rgba(255,235,110,.98)" font-size="14" font-weight="800" font-family="Inter">${Math.round(solarW)}W ⚡</text>

              ${moonSVG}
              ${FL}
              ${foBAT}${foINV}${foGRD}${foHOM}
            </svg>
          </div>
        </div>

        <!-- BATTERY + TICKER + STATS -->
        <div style="padding:16px 16px 16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
            <span style="color:rgba(255,255,255,.6);">${t18.battLabel}</span>
            <span style="font-weight:700;font-size:12px;color:${bPct<=10?'#ef4444':bPct<=20?'#f59e0b':'#4ade80'}">${bPct}%</span>
          </div>
          <div style="height:7px;border-radius:4px;background:rgba(255,255,255,.10);overflow:hidden;margin-bottom:${battETA?'8px':'14px'}">
            <div style="height:100%;width:${bPct}%;border-radius:4px;${battBarColor2};transition:background .5s;"></div>
          </div>
          ${battETA?`<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.65);margin-bottom:14px;padding-left:2px;">${battETA}</div>`:''}

          <div style="overflow:hidden;white-space:nowrap;border-top:1px solid rgba(255,255,255,.10);border-bottom:1px solid rgba(255,255,255,.10);padding:7px 0;margin:0 0 14px;">
            <div style="display:inline-block;animation:scrollTicker 22s linear infinite;font-size:12px;font-weight:600;color:rgba(255,230,120,.95);text-shadow:0 1px 6px rgba(0,0,0,.5);">${ticker2}</div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;align-items:stretch;">
            <div style="${cell}"><div style="${ico}">☀️</div><div style="${val}">${daily} kWh</div><div style="${lbl}">${t18.solarToday}</div></div>
            <div style="${cell}"><div style="${ico}">🔌</div><div style="${val}">${gridDaily} kWh</div><div style="${lbl}">${t18.gridToday}</div></div>
            <div style="${cell}"><div style="${ico}">🏠</div><div style="${val}">${combinedFmt} kWh</div><div style="${lbl}">${t18.consume}</div></div>
            <div style="${cell}"><div style="${ico}">💰</div><div style="${val}">${savFmt}đ</div><div style="${lbl}">${t18.saving}</div></div>
            <div style="background:${isOff?'rgba(80,10,10,.45)':'rgba(255,255,255,.10)'};${isOff?'border:1.5px solid rgba(255,80,80,.8);box-shadow:0 0 8px rgba(255,80,80,.4)':'border:1px solid rgba(255,255,255,.15)'};border-radius:12px;padding:8px 6px;text-align:center;">
              <div style="font-size:9px;font-weight:700;color:rgba(100,210,255,.85);margin-bottom:4px;letter-spacing:.5px;white-space:nowrap;">${t18.system}</div>
              <div style="font-size:12px;font-weight:800;color:${stColor};margin-bottom:4px;">❤️ ${stLabel}</div>
              <div style="font-size:10px;color:rgba(255,200,80,.9);margin-bottom:2px;white-space:nowrap;">🌡️ ${invTemp}°C</div>
              <div style="font-size:10px;color:rgba(80,200,255,.9);white-space:nowrap;">🔋 ${batTemp}°C</div>
            </div>
          </div>
        </div>

      </div>`;
  }
}

customElements.define('solar-weather-card', SolarWeatherCard);
window.customCards = window.customCards||[];
window.customCards.push({
  type: 'solar-weather-card',
  name: 'Solar Weather Card',
  description: 'Solar + Battery + Weather — particle/line flow, EN/VI language, adjustable opacity',
  preview: false,
  documentationURL: 'https://github.com/doanlong1412/solar-weather-card',
});
