/**
 * Solar Weather Card v1.1.0
 * Custom Home Assistant card — Solar + Battery + Weather dashboard
 * Hỗ trợ Visual Config Editor — chọn entity qua UI
 * Convert từ button-card YAML bởi Doanlong1412
 */

// ═══════════════════════════════════════════════════════════════════
// EDITOR — hiện khi nhấn "Edit" trên card
// ═══════════════════════════════════════════════════════════════════
class SolarWeatherCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  static get FIELDS() {
    return [
      { key: 'weather_entity',          label: '🌤️ Weather entity',              required: true  },
      { key: 'temperature_entity',      label: '🌡️ Nhiệt độ ngoài trời',         required: true  },
      { key: 'humidity_entity',         label: '💧 Độ ẩm ngoài trời',            required: true  },
      { key: 'pressure_entity',         label: '🌬️ Áp suất khí quyển',           required: false },
      { key: 'uv_entity',               label: '☀️ Chỉ số UV',                   required: false },
      { key: 'rain_entity',             label: '🌧️ Dự báo mưa',                  required: false },
      { key: 'solar_pv1_entity',        label: '⚡ Solar Array 1 (W)',           required: true  },
      { key: 'solar_pv2_entity',        label: '⚡ Solar Array 2 (W)',           required: false },
      { key: 'battery_soc_entity',      label: '🔋 Pin % (SOC)',                 required: true  },
      { key: 'battery_flow_entity',     label: '🔋 Luồng pin (W, +sạc / -xả)',  required: true  },
      { key: 'battery_voltage_entity',  label: '🔋 Điện áp pin (V DC)',          required: false },
      { key: 'battery_capacity_entity', label: '🔋 Dung lượng pin (Wh)',         required: false },
      { key: 'grid_flow_entity',        label: '🔌 Luồng lưới điện (W)',         required: true  },
      { key: 'grid_voltage_entity',     label: '🔌 Điện áp lưới (V AC)',         required: false },
      { key: 'home_consumption_entity', label: '🏠 Tiêu thụ nhà (W)',            required: true  },
      { key: 'solar_today_entity',      label: '📊 Solar hôm nay (kWh)',         required: false },
      { key: 'consumption_today_entity',label: '📊 Tiêu thụ hôm nay (kWh)',     required: false },
      { key: 'inverter_status_entity',  label: '⚙️ Trạng thái inverter',         required: false },
      { key: 'inverter_temp_entity',    label: '🌡️ Nhiệt độ inverter (°C)',      required: false },
      { key: 'battery_temp_entity',     label: '🌡️ Nhiệt độ BMS (°C)',           required: false },
    ];
  }

  _fireChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }

  _render() {
    const rows = SolarWeatherCardEditor.FIELDS.map(f => `
      <div class="row">
        <label>${f.label}${f.required ? ' <span class="req">*</span>' : ''}</label>
        <input type="text" data-key="${f.key}"
          placeholder="${f.key.startsWith('weather') ? 'weather.your_entity' : 'sensor.your_entity'}"
          value="${this._config[f.key] || ''}" />
      </div>`).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 4px 0; }
        .note {
          font-size: 12px; color: var(--secondary-text-color);
          background: var(--secondary-background-color);
          border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;
          border-left: 3px solid var(--primary-color);
        }
        .row { display: flex; flex-direction: column; margin-bottom: 10px; }
        label { font-size: 13px; color: var(--primary-text-color); margin-bottom: 4px; font-weight: 500; }
        .req { color: var(--error-color); font-weight: 700; }
        input {
          background: var(--input-fill-color, rgba(0,0,0,.04));
          border: 1px solid var(--divider-color, #e0e0e0);
          border-radius: 8px; padding: 8px 12px;
          font-size: 13px; color: var(--primary-text-color);
          font-family: 'Roboto Mono', monospace; width: 100%;
          box-sizing: border-box; transition: border-color .2s;
        }
        input:focus { outline: none; border-color: var(--primary-color); }
        input::placeholder { color: var(--disabled-text-color); font-style: italic; }
      </style>
      <div class="note">
        💡 Điền <strong>entity ID</strong> cho từng sensor. Trường có <span class="req">*</span> là bắt buộc để card hiển thị đúng.
      </div>
      ${rows}`;

    this.shadowRoot.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', e => {
        const key = e.target.dataset.key;
        const val = e.target.value.trim();
        const c = { ...this._config };
        if (val) { c[key] = val; } else { delete c[key]; }
        this._config = c;
        this._fireChange();
      });
    });
  }
}

customElements.define('solar-weather-card-editor', SolarWeatherCardEditor);


// ═══════════════════════════════════════════════════════════════════
// CARD CHÍNH
// ═══════════════════════════════════════════════════════════════════
class SolarWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._updateInterval = null;
  }

  static getConfigElement() {
    return document.createElement('solar-weather-card-editor');
  }

  static getStubConfig() {
    return {
      weather_entity: '',
      temperature_entity: '',
      humidity_entity: '',
      pressure_entity: '',
      uv_entity: '',
      rain_entity: '',
      solar_pv1_entity: '',
      solar_pv2_entity: '',
      battery_soc_entity: '',
      battery_flow_entity: '',
      battery_voltage_entity: '',
      battery_capacity_entity: '',
      grid_flow_entity: '',
      grid_voltage_entity: '',
      home_consumption_entity: '',
      solar_today_entity: '',
      consumption_today_entity: '',
      inverter_status_entity: '',
      inverter_temp_entity: '',
      battery_temp_entity: '',
    };
  }

  setConfig(config) {
    this._config = config || {};
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    this._updateInterval = setInterval(() => this._render(), 30000);
    this._render();
  }

  disconnectedCallback() {
    if (this._updateInterval) clearInterval(this._updateInterval);
  }

  getCardSize() { return 12; }

  // ─── Helpers ───────────────────────────────────────────────────
  _g(cfgKey, def = '--') {
    const id = this._config[cfgKey];
    if (!id || !this._hass) return def;
    const s = this._hass.states[id];
    if (!s || s.state === 'unavailable' || s.state === 'unknown') return def;
    return s.state;
  }
  _gf(cfgKey, def = 0) { return parseFloat(this._g(cfgKey, def)) || def; }

  _calcEvn(kwh) {
    const tiers = [{l:50,r:1984},{l:100,r:2050},{l:200,r:2380},{l:300,r:2998},{l:400,r:3350},{l:Infinity,r:3460}];
    let cost = 0, prev = 0;
    for (const t of tiers) {
      if (kwh <= prev) break;
      cost += (Math.min(kwh, t.l) - prev) * t.r;
      prev = t.l;
    }
    return Math.round(cost);
  }

  _sfB(w, maxW, minV, maxV) {
    return (minV + Math.max(0, Math.min(1, w/maxW)) * (maxV - minV)).toFixed(2);
  }

  _flowPathB(path, w, maxW, cCore, cGlow, cFade) {
    const dur=this._sfB(w,maxW,1.5,0.4), w1=this._sfB(w,maxW,1.0,2.5), w2=this._sfB(w,maxW,1.5,4.0), w3=this._sfB(w,maxW,2.5,6.0);
    return `
      <path d="${path}" fill="none" stroke="${cFade.replace('X','0.12')}" stroke-width="${w3}" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${cCore.replace('X','0.92')}" stroke-width="${w1}" stroke-dasharray="28,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="148" to="0" dur="${dur}s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${cGlow.replace('X','0.85')}" stroke-width="${w2}" stroke-dasharray="12,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="132" to="0" dur="${dur}s" begin="0.3s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${cFade.replace('X','0.5')}" stroke-width="${w3}" stroke-dasharray="6,120" stroke-linecap="round" filter="url(#sf)"><animate attributeName="stroke-dashoffset" from="126" to="0" dur="${dur}s" begin="0.15s" repeatCount="indefinite"/></path>`;
  }

  _renderUnconfigured() {
    this.shadowRoot.innerHTML = `
      <style>:host{display:block;}</style>
      <ha-card style="padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">☀️🔋</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:8px;">Solar Weather Card</div>
        <div style="font-size:13px;color:var(--secondary-text-color);line-height:1.6;">
          Nhấn nút <strong>✏️ Edit</strong> (góc phải card)<br>để cấu hình các entity.
        </div>
      </ha-card>`;
  }

  _render() {
    if (!this._hass) return;
    const hasConfig = Object.values(this._config).some(v => v && String(v).trim());
    if (!hasConfig) { this._renderUnconfigured(); return; }

    // ── Data ──
    const temp   = this._gf('temperature_entity', 0).toFixed(1);
    const humid  = this._gf('humidity_entity', 0).toFixed(0);
    const uv     = this._gf('uv_entity', 0).toFixed(1);
    const rain   = this._g('rain_entity', '');
    const press  = this._gf('pressure_entity', 0).toFixed(0);

    const wId    = this._config.weather_entity;
    const wState = (wId && this._hass.states[wId]?.state) || 'cloudy';
    const condMap = {'sunny':'☀️ Sunny','clear-night':'🌙 Clear','partlycloudy':'⛅ Partly Cloudy','cloudy':'☁️ Cloudy','rainy':'🌧️ Rainy','pouring':'⛈️ Pouring','lightning':'⚡ Thunder','fog':'🌫️ Foggy','windy':'💨 Windy'};
    const cond   = condMap[wState] || '🌤️ ' + wState;
    const wfc    = wId && this._hass.states[wId]?.attributes?.forecast;
    const tempHi = wfc ? Math.round(wfc[0].temperature) : '--';
    const tempLo = wfc ? Math.round(wfc[0].templow)    : '--';
    const tmrW   = wfc&&wfc[1] ? (condMap[wfc[1].condition]||'🌤️ '+wfc[1].condition) : cond;
    const tmrHi  = wfc&&wfc[1] ? Math.round(wfc[1].temperature) : '--';
    const tmrLo  = wfc&&wfc[1] ? Math.round(wfc[1].templow) : '--';
    const condIcon = cond.split(' ')[0] || '🌤️';

    const pv1W   = this._gf('solar_pv1_entity', 0);
    const pv2W   = this._gf('solar_pv2_entity', 0);
    const solarW = pv1W + pv2W;
    const solarKW = (solarW/1000).toFixed(1);
    const hasSolar = solarW > 10;

    const battSoc  = this._gf('battery_soc_entity', 0);
    const battFlW  = this._gf('battery_flow_entity', 0);
    const isCharge = battFlW > 10;
    const isDisch  = battFlW < -10;
    const battW    = Math.abs(battFlW).toFixed(0);
    const battDir  = isCharge ? '🔋⚡ Sạc' : (isDisch ? '🔋🔁 Xả' : '⏳ Stanby');
    const bVolt    = this._gf('battery_voltage_entity', 0).toFixed(0);
    const bPct     = Math.round(battSoc);
    const battCapWh = this._gf('battery_capacity_entity', 30720);

    let battETA = '';
    if (isCharge && battFlW > 0) {
      const eta = Math.round((100-battSoc)/100*battCapWh/battFlW*60);
      if (eta > 0 && eta < 14400) battETA = '⚡ Dự kiến đầy pin: ' + (eta>=60?Math.floor(eta/60)+'h ':'') + (eta%60) + 'm';
    } else if (isDisch && Math.abs(battFlW) > 0) {
      const eta2 = Math.round(battSoc/100*battCapWh/Math.abs(battFlW)*60);
      if (eta2 > 0 && eta2 < 14400) battETA = '🔁 Dự kiến còn: ' + (eta2>=60?Math.floor(eta2/60)+'h ':'') + (eta2%60) + 'm';
    }

    const gridFlW = this._gf('grid_flow_entity', 0);
    const hasGrid = Math.abs(gridFlW) > 10;
    const gridW   = Math.abs(gridFlW).toFixed(0);
    const gridDir = gridFlW > 10 ? 'Xuất lưới' : 'Lưới điện';
    const gridV   = this._gf('grid_voltage_entity', 0).toFixed(0);

    const homeFlW = this._gf('home_consumption_entity', 0);
    const homeW   = homeFlW.toFixed(0);
    const hasHome = homeFlW > 10;

    const daily       = this._gf('solar_today_entity', 0).toFixed(1);
    const combinedFmt = this._gf('consumption_today_entity', 0).toFixed(1);
    const saving      = this._calcEvn(parseFloat(daily));
    const savFmt      = saving>=1000000?(saving/1000000).toFixed(2)+'M':saving>=1000?Math.round(saving/1000)+'k':String(saving);

    const luxState   = this._g('inverter_status_entity', '--');
    const invTemp    = this._gf('inverter_temp_entity', 0).toFixed(1);
    const batTemp    = this._gf('battery_temp_entity', 0).toFixed(1);
    const isOff      = luxState === '--' || ['unavailable','unknown','Unavailable'].includes(luxState);
    const isNormal   = ['Normal','normal','online','Online'].includes(luxState);
    const stateColor = isNormal?'rgba(74,222,128,1)':isOff?'rgba(255,80,80,1)':'rgba(255,200,60,1)';
    const stateLabel = isOff ? 'OFF' : luxState;

    // ── Clock ──
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    const hh = String(h%12||12).padStart(2,'0'), mm = String(m).padStart(2,'0'), ap = h>=12?'PM':'AM';
    const DAYS=['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
    const MONTHS=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
    const dateStr = DAYS[now.getDay()]+', '+now.getDate()+' '+MONTHS[now.getMonth()]+' '+now.getFullYear();

    // ── Sun arc ──
    const sunA = this._hass.states['sun.sun']?.attributes || {};
    const toMin = s => { try { const p=s.split(':').map(Number); return p[0]*60+p[1]; } catch(e){ return 0; } };
    const riseStr = sunA.next_rising ? new Date(sunA.next_rising).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '05:38';
    const setStr  = sunA.next_setting ? new Date(sunA.next_setting).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}) : '18:12';
    const RISE=toMin(riseStr), SET=toMin(setStr), nowM=h*60+m;
    const t = Math.max(0, Math.min(1, (nowM-RISE)/(SET-RISE)));
    const pct = Math.round(t*100);
    const dayMin=SET-RISE, nightMin=1440-dayMin;
    const fmtDur = mn => Math.floor(mn/60)+'h '+(mn%60)+'m';

    const bx=(1-t)*(1-t)*14+2*(1-t)*t*173+t*t*332;
    const by=(1-t)*(1-t)*115+2*(1-t)*t*5+t*t*115;
    let lbx=bx+14; if(lbx+86>340) lbx=bx-100;
    const lby=by-18;

    const isNight=nowM<RISE||nowM>SET;
    let tM=nowM>SET?(nowM-SET)/nightMin:(nowM+1440-SET)/nightMin;
    tM=Math.max(0,Math.min(1,tM));
    const mx2=(1-tM)*(1-tM)*332+2*(1-tM)*tM*173+tM*tM*14;
    const my2=(1-tM)*(1-tM)*115+2*(1-tM)*tM*195+tM*tM*115;

    // ── SVG constants ──
    const BAT_CX=45,BAT_CY=193,BAT_Y=148,BAT_BOT=238,BAT_R=90;
    const GRD_CX=301,GRD_CY=193,GRD_Y=148,GRD_L=256;
    const INV_CX=173,INV_Y=268,INV_L=128,INV_R=218,INV_TOP=268,INV_BOT=358;
    const HOM_CX=173,HOM_Y=408;
    const SAC_BEND_X=108,XA_BEND_Y=348,GRID_BEND_X=238,SAC_INV_Y=278,GRID_INV_Y=278;

    // ── Flows ──
    let FL='';
    if(hasSolar){ FL+=this._flowPathB(`M ${bx.toFixed(1)},${(by+1).toFixed(1)} L ${INV_CX},${(by+57).toFixed(1)} L ${INV_CX},${INV_TOP}`,solarW,5000,'rgba(255,250,200,X)','rgba(255,215,55,X)','rgba(255,235,120,X)'); }
    if(isCharge){
      FL+=this._flowPathB(`M${INV_L},${SAC_INV_Y} L${SAC_BEND_X},${SAC_INV_Y} L${SAC_BEND_X},${BAT_CY} L${BAT_R},${BAT_CY}`,battFlW,3000,'rgba(200,255,220,X)','rgba(80,220,120,X)','rgba(160,240,180,X)');
      FL+=`<text x="${SAC_BEND_X-3}" y="${SAC_INV_Y+(BAT_CY-SAC_INV_Y)/2}" text-anchor="end" fill="rgba(100,255,160,.95)" font-size="9.5" font-weight="700" font-family="sans-serif">${battW}W</text>`;
    }
    if(isDisch){
      FL+=this._flowPathB(`M${BAT_CX},${BAT_BOT} L${BAT_CX},${XA_BEND_Y} L${INV_L},${XA_BEND_Y}`,Math.abs(battFlW),3000,'rgba(255,245,180,X)','rgba(255,200,60,X)','rgba(255,230,130,X)');
      FL+=`<text x="${BAT_CX+5}" y="${BAT_BOT+(XA_BEND_Y-BAT_BOT)/2}" fill="rgba(255,220,100,.95)" font-size="9.5" font-weight="700" font-family="sans-serif">${battW}W</text>`;
    }
    if(hasGrid){
      const gp=gridFlW>10?`M${INV_R},${GRID_INV_Y} L${GRID_BEND_X},${GRID_INV_Y} L${GRID_BEND_X},${GRD_CY} L${GRD_L},${GRD_CY}`:`M${GRD_L},${GRD_CY} L${GRID_BEND_X},${GRD_CY} L${GRID_BEND_X},${GRID_INV_Y} L${INV_R},${GRID_INV_Y}`;
      FL+=this._flowPathB(gp,Math.abs(gridFlW),5000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
      FL+=`<text x="${GRID_BEND_X+3}" y="${GRD_CY+(GRID_INV_Y-GRD_CY)/2}" fill="rgba(140,210,255,.95)" font-size="9.5" font-weight="700" font-family="sans-serif">${gridW}W</text>`;
    }
    if(hasHome){
      FL+=this._flowPathB(`M${INV_CX},${INV_BOT+2} L${HOM_CX},${HOM_Y-2}`,homeFlW,5000,'rgba(255,230,180,X)','rgba(255,148,55,X)','rgba(255,190,100,X)');
      FL+=`<text x="${INV_CX+8}" y="${INV_BOT+18}" fill="rgba(255,185,100,.95)" font-size="9.5" font-weight="700" font-family="sans-serif">${homeW}W</text>`;
    }

    // ── Icons ──
    const bx0=BAT_CX-25,ty0=BAT_Y+9,fw=Math.max(2,Math.round(42*battSoc/100));
    const fc=battSoc>50?'rgba(80,225,120,.95)':battSoc>20?'rgba(255,200,55,.95)':'rgba(255,80,80,.95)';
    const battIco=`<rect x="${bx0}" y="${ty0}" width="50" height="23" rx="5" fill="rgba(255,255,255,.07)" stroke="rgba(120,240,150,.75)" stroke-width="1.6"/>
      <rect x="${bx0+50}" y="${ty0+6.5}" width="5" height="10" rx="2.5" fill="rgba(120,240,150,.55)"/>
      <rect x="${bx0+4}" y="${ty0+4}" width="${fw}" height="15" rx="2" fill="${fc}"/>
      <text x="${BAT_CX}" y="${ty0+15.5}" text-anchor="middle" fill="rgba(255,255,255,.95)" font-size="9" font-weight="700" font-family="sans-serif">${bPct}%</text>`;

    const cx2=INV_CX,ty2=INV_Y+9;
    const invIco=`<polygon points="${cx2-20},${ty2+26} ${cx2-14},${ty2} ${cx2+14},${ty2} ${cx2+20},${ty2+26}" fill="rgba(140,165,255,.2)" stroke="rgba(180,205,255,.7)" stroke-width="1.4" stroke-linejoin="round"/>
      <line x1="${cx2-8}" y1="${ty2+5}" x2="${cx2+8}" y2="${ty2+5}" stroke="rgba(255,220,80,.8)" stroke-width="1.8"/>
      <line x1="${cx2-5}" y1="${ty2+9}" x2="${cx2+5}" y2="${ty2+9}" stroke="rgba(255,220,80,.5)" stroke-width="1.2"/>
      <path d="M${cx2-11},${ty2+19} C${cx2-7},${ty2+12} ${cx2-3},${ty2+12} ${cx2},${ty2+19} C${cx2+3},${ty2+26} ${cx2+7},${ty2+26} ${cx2+11},${ty2+19}" fill="none" stroke="rgba(160,215,255,.98)" stroke-width="2" stroke-linecap="round"/>`;

    const cx3=GRD_CX,ty3=GRD_Y+7;
    const gridIco=`<line x1="${cx3}" y1="${ty3}" x2="${cx3}" y2="${ty3+34}" stroke="rgba(140,200,255,.9)" stroke-width="2"/>
      ${[[9,4],[12,12],[15,21]].map(([w,y])=>`<line x1="${cx3-w}" y1="${ty3+y}" x2="${cx3+w}" y2="${ty3+y}" stroke="rgba(140,200,255,.9)" stroke-width="1.6"/>`).join('')}
      <line x1="${cx3}" y1="${ty3+34}" x2="${cx3-12}" y2="${ty3+42}" stroke="rgba(140,200,255,.8)" stroke-width="1.6"/>
      <line x1="${cx3}" y1="${ty3+34}" x2="${cx3+12}" y2="${ty3+42}" stroke="rgba(140,200,255,.8)" stroke-width="1.6"/>
      <line x1="${cx3-12}" y1="${ty3+42}" x2="${cx3+12}" y2="${ty3+42}" stroke="rgba(140,200,255,.6)" stroke-width="1.3"/>`;

    const cx4=HOM_CX,ty4=HOM_Y+6;
    const homeIco=`<rect x="${cx4+5}" y="${ty4}" width="6" height="10" rx="1.5" fill="rgba(255,170,80,.3)" stroke="rgba(255,180,90,.6)" stroke-width="1"/>
      <polygon points="${cx4},${ty4+5} ${cx4-20},${ty4+19} ${cx4+20},${ty4+19}" fill="rgba(255,155,55,.3)" stroke="rgba(255,185,90,.9)" stroke-width="1.6" stroke-linejoin="round"/>
      <rect x="${cx4-14}" y="${ty4+19}" width="28" height="22" rx="2" fill="rgba(255,155,55,.15)" stroke="rgba(255,185,90,.7)" stroke-width="1.3"/>
      <rect x="${cx4-5}" y="${ty4+30}" width="10" height="11" rx="2" fill="rgba(255,155,55,.4)" stroke="rgba(255,185,90,.65)" stroke-width="1.1"/>
      <rect x="${cx4-12}" y="${ty4+21}" width="7" height="6" rx="1.5" fill="rgba(255,235,170,.22)" stroke="rgba(255,210,110,.6)" stroke-width="1"/>
      <rect x="${cx4+5}" y="${ty4+21}" width="7" height="6" rx="1.5" fill="rgba(255,235,170,.22)" stroke="rgba(255,210,110,.6)" stroke-width="1"/>`;

    const mcx=isNight?mx2:((1-t)*(1-t)*332+2*(1-t)*t*173+t*t*14);
    const mcy=isNight?my2:((1-t)*(1-t)*115+2*(1-t)*t*195+t*t*115);
    const moonSvg=`<g filter="url(#mf)" opacity="${isNight?'1':'.35'}">
      <circle cx="${mcx}" cy="${mcy}" r="${isNight?10:7}" fill="${isNight?'rgba(180,205,255,.3)':'rgba(180,205,255,.10)'}"/>
      <circle cx="${mcx}" cy="${mcy}" r="${isNight?6:3.5}" fill="${isNight?'rgba(220,235,255,.98)':'rgba(200,218,255,.85)'}" stroke="${isNight?'rgba(240,248,255,.9)':'rgba(225,235,255,.65)'}" stroke-width="1.2"/>
    </g>`;

    const battBarColor=bPct>50?'linear-gradient(90deg,#16a34a,#4ade80,#86efac)':bPct>20?'linear-gradient(90deg,#ca8a04,#facc15,#fde68a)':'linear-gradient(90deg,#b91c1c,#f87171,#fca5a5)';

    this.shadowRoot.innerHTML = `
      <style>:host{display:block;}*{box-sizing:border-box;margin:0;padding:0;}</style>
      <div style="font-family:-apple-system,'Helvetica Neue',sans-serif;color:#fff;
        background:linear-gradient(135deg,rgba(0,20,30,0.45) 0%,rgba(0,40,50,0.35) 100%);
        backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,0.18);border-radius:24px;
        box-shadow:0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.20);overflow:hidden;">

        <!-- WEATHER HEADER -->
        <div style="padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
          <div style="display:grid;grid-template-columns:40px 1fr 40px;align-items:center;margin-bottom:12px;">
            <div style="font-size:70px;line-height:1;">${condIcon}</div>
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
            <div style="text-align:right;">UV <span style="color:#fff;font-weight:600;">${uv}</span> &nbsp;🌬️ <span style="color:#fff;font-weight:600;">${press}</span> hPa</div>
            ${rain?`<div style="font-size:11px;">🌧️ <span style="color:rgba(255,220,100,.9);font-weight:600;">${rain}</span></div>`:'<div></div>'}
            <div></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:7px 11px;font-size:11.5px;">
            <span style="color:rgba(255,255,255,.45);">Ngày mai</span>
            <span style="color:#fff;font-weight:600;">${tmrW}</span>
            <span style="margin-left:auto;color:#fff;font-weight:600;">${tmrHi}°</span>
            <span style="color:rgba(255,255,255,.45);">/</span>
            <span style="color:rgba(255,255,255,.65);">${tmrLo}°C</span>
          </div>
        </div>

        <!-- SUN ARC + ENERGY FLOW -->
        <div style="padding:8px 0 10px;border-bottom:1px solid rgba(255,255,255,.10);">
          <div style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.55);margin-bottom:5px;padding:0 14px;">
            <span>🌅 <strong style="color:#fff;">${riseStr}</strong> Mọc</span>
            <span><strong style="color:#fff;">${pct}%</strong> qua ngày</span>
            <span>Lặn <strong style="color:#fff;">${setStr}</strong> 🌇</span>
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;padding:0 14px;">
            <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(255,200,70,.15);border:1px solid rgba(255,200,70,.35);color:rgba(255,225,110,.95);">☀️ Ban ngày: ${fmtDur(dayMin)}</div>
            <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(140,175,255,.12);border:1px solid rgba(140,175,255,.3);color:rgba(185,210,255,.9);">🌙 Ban đêm: ${fmtDur(nightMin)}</div>
          </div>
          <div style="position:relative;width:100%;height:520px;">
            <svg viewBox="0 0 346 520" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;">
              <defs>
                <radialGradient id="glowR" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="rgba(80,220,120,.26)"/><stop offset="60%" stop-color="rgba(80,220,120,.06)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
                <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(255,180,50,0)"/><stop offset="20%" stop-color="rgba(255,200,70,.5)"/><stop offset="50%" stop-color="rgba(255,228,110,.92)"/><stop offset="80%" stop-color="rgba(255,200,70,.5)"/><stop offset="100%" stop-color="rgba(255,180,50,0)"/></linearGradient>
                <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(140,170,255,0)"/><stop offset="50%" stop-color="rgba(200,215,255,.7)"/><stop offset="100%" stop-color="rgba(140,170,255,0)"/></linearGradient>
                <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(55,125,225,.10)"/><stop offset="100%" stop-color="rgba(55,125,225,0)"/></linearGradient>
                <linearGradient id="battG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(80,200,100,.25)"/><stop offset="100%" stop-color="rgba(40,120,60,.20)"/></linearGradient>
                <linearGradient id="gridG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(90,160,255,.25)"/><stop offset="100%" stop-color="rgba(40,80,200,.20)"/></linearGradient>
                <linearGradient id="homeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(255,160,60,.25)"/><stop offset="100%" stop-color="rgba(180,80,20,.20)"/></linearGradient>
                <linearGradient id="invG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(120,160,255,.25)"/><stop offset="100%" stop-color="rgba(60,80,200,.20)"/></linearGradient>
                <filter id="sf"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="mf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="tf" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/><feFlood flood-color="rgba(0,0,0,.55)" result="c"/><feComposite in="c" in2="b" operator="in" result="d"/><feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <ellipse cx="173" cy="185" rx="150" ry="110" fill="url(#glowR)"/>
              <path d="M14,115 Q173,5 332,115 Z" fill="url(#skyG)"/>
              <line x1="6" y1="115" x2="340" y2="115" stroke="rgba(255,255,255,.12)" stroke-width="1" stroke-dasharray="3,8"/>
              <circle cx="14" cy="115" r="3" fill="rgba(255,200,80,.65)"/>
              <circle cx="173" cy="115" r="2" fill="rgba(255,255,255,.25)"/>
              <circle cx="332" cy="115" r="3" fill="rgba(255,110,55,.65)"/>
              <text x="14"  y="127" fill="rgba(255,255,255,.45)" font-size="9" font-family="sans-serif" text-anchor="middle">${riseStr}</text>
              <text x="173" y="127" fill="rgba(255,255,255,.28)" font-size="9" font-family="sans-serif" text-anchor="middle">12:00</text>
              <text x="332" y="127" fill="rgba(255,255,255,.45)" font-size="9" font-family="sans-serif" text-anchor="middle">${setStr}</text>
              <path d="M14,115 Q173,5 332,115" fill="none" stroke="url(#dg)" stroke-width="2.2"/>
              <path d="M332,115 Q173,195 14,115" fill="none" stroke="url(#ng)" stroke-width="1.5" stroke-dasharray="4,5" opacity=".35"/>
              ${!isNight?`<g filter="url(#sf)"><circle cx="${bx}" cy="${by}" r="20" fill="rgba(255,225,80,.12)"/><circle cx="${bx}" cy="${by}" r="12" fill="rgba(255,235,100,.24)"/><circle cx="${bx}" cy="${by}" r="6" fill="rgba(255,245,170,.97)" stroke="rgba(255,255,220,.9)" stroke-width="1.5"/></g>`:''}
              <rect x="${lbx}" y="${lby}" width="86" height="22" rx="11" fill="rgba(255,200,50,.18)" stroke="rgba(255,210,60,.4)" stroke-width="1"/>
              <text x="${lbx+43}" y="${lby+15}" text-anchor="middle" fill="rgba(255,235,110,.96)" font-size="11.5" font-weight="700" font-family="sans-serif">${solarKW} kW ⚡</text>
              ${moonSvg}
              ${FL}
              <rect x="0" y="148" width="90" height="90" rx="16" fill="url(#battG)" stroke="rgba(80,220,120,.45)" stroke-width="1.5"/>
              <rect x="0" y="148" width="90" height="90" rx="16" fill="rgba(255,255,255,.07)"/>
              ${battIco}
              <text x="${BAT_CX}" y="${BAT_Y+56}" text-anchor="middle" fill="#fff" font-size="19" font-weight="700" font-family="sans-serif" filter="url(#tf)">${battW}W</text>
              <text x="${BAT_CX}" y="${BAT_Y+70}" text-anchor="middle" fill="rgba(100,240,155,.95)" font-size="13" font-family="sans-serif">${battDir}</text>
              <text x="${BAT_CX}" y="${BAT_Y+82}" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="12" font-family="sans-serif">${bVolt}V</text>
              <rect x="256" y="148" width="90" height="90" rx="16" fill="url(#gridG)" stroke="rgba(90,170,255,${hasGrid?'.45':'.18'})" stroke-width="1.5"/>
              <rect x="256" y="148" width="90" height="90" rx="16" fill="rgba(255,255,255,${hasGrid?'.07':'.02'})"/>
              ${gridIco}
              <text x="${GRD_CX}" y="${GRD_Y+56}" text-anchor="middle" fill="${hasGrid?'#fff':'rgba(255,255,255,.35)'}" font-size="17" font-weight="700" font-family="sans-serif" filter="url(#tf)">${gridW}W</text>
              <text x="${GRD_CX}" y="${GRD_Y+70}" text-anchor="middle" fill="rgba(140,200,255,${hasGrid?'.95':'.4'})" font-size="13" font-family="sans-serif">${gridDir}</text>
              <text x="${GRD_CX}" y="${GRD_Y+82}" text-anchor="middle" fill="rgba(255,255,255,.55)" font-size="12" font-family="sans-serif">${gridV}V AC</text>
              <rect x="128" y="268" width="90" height="90" rx="16" fill="url(#invG)" stroke="rgba(160,185,255,.45)" stroke-width="1.5"/>
              <rect x="128" y="268" width="90" height="90" rx="16" fill="rgba(255,255,255,.07)"/>
              ${invIco}
              <text x="${INV_CX}" y="${INV_Y+50}" text-anchor="middle" fill="rgba(255,255,255,.6)" font-size="7.5" font-weight="700" font-family="sans-serif" letter-spacing="1.5">INVERTER</text>
              <text x="${INV_CX}" y="${INV_Y+64}" text-anchor="middle" fill="rgba(160,215,255,.98)" font-size="13" font-family="sans-serif" filter="url(#tf)">${gridV}V AC</text>
              <text x="${INV_CX}" y="${INV_Y+78}" text-anchor="middle" fill="rgba(255,255,255,.35)" font-size="12" font-family="sans-serif">${bVolt}V DC</text>
              <rect x="128" y="408" width="90" height="82" rx="16" fill="url(#homeG)" stroke="rgba(255,155,65,${hasHome?'.45':'.18'})" stroke-width="1.5"/>
              <rect x="128" y="408" width="90" height="82" rx="16" fill="rgba(255,255,255,${hasHome?'.07':'.02'})"/>
              ${homeIco}
              <text x="${HOM_CX}" y="${HOM_Y+65}" text-anchor="middle" fill="${hasHome?'#fff':'rgba(255,255,255,.35)'}" font-size="19" font-weight="700" font-family="sans-serif" filter="url(#tf)">${homeW}W</text>
              <text x="${HOM_CX}" y="${HOM_Y+78}" text-anchor="middle" fill="rgba(255,185,95,${hasHome?'.95':'.4'})" font-size="12" font-family="sans-serif">Nhà tiêu thụ</text>
            </svg>
          </div>
        </div>

        <!-- STATS -->
        <div style="padding:10px 14px 14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:11px;">
            <span style="color:rgba(255,255,255,.6);">🔋 Battery</span>
            <span style="color:#4ade80;font-weight:700;font-size:12px;">${bPct}%</span>
          </div>
          <div style="height:7px;border-radius:4px;background:rgba(255,255,255,.10);overflow:hidden;margin-bottom:${battETA?'4px':'10px'}">
            <div style="height:100%;width:${bPct}%;border-radius:4px;background:${battBarColor};box-shadow:0 0 8px rgba(74,222,128,.5);transition:width .5s ease;"></div>
          </div>
          ${battETA?`<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.65);margin-bottom:10px;">${battETA}</div>`:''}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
            <div style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:9px 8px;">
              <div style="font-size:18px;margin-bottom:3px;">☀️</div>
              <div style="font-size:16px;font-weight:700;">${daily} kWh</div>
              <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:1px;">Solar Hôm Nay</div>
            </div>
            <div style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:9px 8px;">
              <div style="font-size:18px;margin-bottom:3px;">🏠</div>
              <div style="font-size:16px;font-weight:700;">${combinedFmt} kWh</div>
              <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:1px;">Tiêu Thụ Hôm Nay</div>
            </div>
            <div style="background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:9px 8px;">
              <div style="font-size:18px;margin-bottom:3px;">💰</div>
              <div style="font-size:16px;font-weight:700;">${savFmt}đ</div>
              <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:1px;">Tiết Kiệm Hôm Nay</div>
            </div>
            <div style="background:${isOff?'rgba(80,10,10,.45)':'rgba(255,255,255,.10)'};${isOff?'border:1.5px solid rgba(255,80,80,.8);box-shadow:0 0 8px rgba(255,80,80,.4)':'border:1px solid rgba(255,255,255,.15)'};border-radius:12px;padding:9px 8px;">
              <div style="font-size:11px;font-weight:700;color:rgba(100,210,255,.95);margin-bottom:5px;">⚙️ Hệ thống</div>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;margin-bottom:3px;"><span style="color:rgba(255,255,255,.55);">❤️:</span><span style="font-weight:700;color:${stateColor};">${stateLabel}</span></div>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;margin-bottom:3px;"><span style="color:rgba(255,255,255,.55);">🌡️ INV:</span><span style="font-weight:700;color:rgba(255,200,80,.95);">${invTemp}°C</span></div>
              <div style="display:flex;align-items:center;gap:4px;font-size:11px;"><span style="color:rgba(255,255,255,.55);">🔋 BMS:</span><span style="font-weight:700;color:rgba(80,200,255,.95);">${batTemp}°C</span></div>
            </div>
          </div>
        </div>

      </div>`;
  }
}

customElements.define('solar-weather-card', SolarWeatherCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'solar-weather-card',
  name:        'Solar Weather Card',
  description: 'Solar + Battery + Weather dashboard — cấu hình entity qua UI',
  preview:     false,
  documentationURL: 'https://github.com/doanlong1412/solar-weather-card',
});
