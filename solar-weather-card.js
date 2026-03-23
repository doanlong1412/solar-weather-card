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
 *
 * Solar Weather Card v1.4.1
 * Changelog v1.4.1:
 *   - Cột điện mới: lattice tower + transformer chi tiết
 *   - flowLevel có type (solar/battery/grid/home) — thang riêng từng loại
 *   - Language: vi / en / de / it — dropdown 4 lựa chọn
 *   - Tùy chọn bật/tắt dự báo ngày mai (show_tomorrow)
 *   - Tùy chọn thang giá tùy chỉnh + đơn vị tiền tệ
 *     (nếu không nhập → mặc định EVN VNĐ)
 *
 * Solar Weather Card v1.5.1
 * Changelog v1.5.0:
 *   - Flow style thứ 3: "wave" — sóng sin + dust particles + bright dots
 *   - Tùy chọn bật/tắt node glow (show_node_glow)
 *   - Xóa label công suất cạnh flow (chỉ hiển thị trong node card)
 *   - ha-entity-picker trong Editor — dropdown chọn entity như HA native
 *   - Giữ nguyên tất cả tính năng v1.4.1
 */

// ═══════════════════════════════════════════════════════════════
// I18N
// ═══════════════════════════════════════════════════════════════
const I18N = {
  vi: {
    tomorrow:'Ngày mai', sunrise:'Mọc', sunset:'Lặn', dayPct:'qua ngày',
    daytime:'Ban ngày', nighttime:'Ban đêm',
    charging:'🔋⚡ Sạc', discharging:'🔋🔁 Xả', standby:'⏳ Stanby',
    exportGrid:'Xuất lưới', importGrid:'Lưới điện',
    homeConsume:'Tiêu thụ', battLabel:'🔋 Pin',
    etaFull:'⚡ Thời gian dự kiến đầy pin: ', etaLeft:'🔁 Thời gian sử dụng dự kiến còn: ',
    slowCharge:'⚡ Sạc rất chậm, chưa ước được thời gian đầy pin',
    slowDisch:'🔁 Xả rất chậm, chưa ước được thời gian hết pin',
    solarStat:'Solar', gridStat:'Lấy lưới', consumeStat:'Tiêu thụ',
    savingStat:'Tiết kiệm', systemStat:'⚙️ HỆ THỐNG', statsTitle:'Thống kê hôm nay',
    condMap:{'sunny':'☀️ Nắng','clear-night':'🌙 Trời quang','partlycloudy':'⛅ Ít mây','cloudy':'☁️ Nhiều mây','rainy':'🌧️ Có mưa','pouring':'⛈️ Mưa to','lightning':'⚡ Dông sét','fog':'🌫️ Sương mù','windy':'💨 Có gió'},
    days:['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
    months:['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    ticker(ws,daily,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Hôm nay trời mưa, sản lượng solar không tốt${kw>0?' — thu được '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Thời tiết xấu, hệ thống solar tạm dừng bảo vệ thiết bị.';
      else if(ws==='cloudy') msg=`☁️ Trời nhiều mây, solar cầm chừng${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Ít mây, solar khá tốt — ${daily} kWh hôm nay.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Nắng đẹp, solar xuất sắc — ${daily} kWh!`; else if(kw>8) msg=`☀️ Trời nắng tốt, solar thu được ${daily} kWh.`; else msg=`☀️ Trời nắng nhưng sản lượng còn thấp — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Sương mù dày, ánh sáng yếu — solar kém hiệu quả.';
      else if(ws==='windy') msg=`💨 Trời có gió, solar bình thường — ${daily} kWh.`;
      else msg=`🌤️ Solar thu được ${daily} kWh — tiết kiệm ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Pin đã đầy!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Pin đang sạc và gần đầy (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Pin đang cạn (${bPct}%), cần chú ý!`;
      return msg;
    }
  },
  en: {
    tomorrow:'Tomorrow', sunrise:'Rise', sunset:'Set', dayPct:'of day',
    daytime:'Daytime', nighttime:'Nighttime',
    charging:'🔋⚡ Charging', discharging:'🔋🔁 Discharging', standby:'⏳ Standby',
    exportGrid:'Export', importGrid:'Grid',
    homeConsume:'Consuming', battLabel:'🔋 Battery',
    etaFull:'⚡ Estimated full in: ', etaLeft:'🔁 Estimated remaining: ',
    slowCharge:'⚡ Charging very slowly', slowDisch:'🔁 Discharging very slowly',
    solarStat:'Solar', gridStat:'From Grid', consumeStat:'Consume',
    savingStat:'Saving', systemStat:'⚙️ SYSTEM', statsTitle:"Today's Stats",
    condMap:{'sunny':'☀️ Sunny','clear-night':'🌙 Clear Night','partlycloudy':'⛅ Partly Cloudy','cloudy':'☁️ Cloudy','rainy':'🌧️ Rainy','pouring':'⛈️ Pouring','lightning':'⚡ Thunder','fog':'🌫️ Foggy','windy':'💨 Windy'},
    days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    ticker(ws,daily,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Rainy day, solar limited${kw>0?' — '+daily+' kWh collected':''}.`;
      else if(ws==='lightning') msg='⛈️ Bad weather, solar paused for protection.';
      else if(ws==='cloudy') msg=`☁️ Cloudy, solar at reduced output${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Partly cloudy, solar performing well — ${daily} kWh today.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Great sunshine — ${daily} kWh!`; else if(kw>8) msg=`☀️ Good sunshine, collected ${daily} kWh.`; else msg=`☀️ Sunny but output still low — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Dense fog, poor solar performance.';
      else if(ws==='windy') msg=`💨 Windy, solar normal — ${daily} kWh.`;
      else msg=`🌤️ Solar collected ${daily} kWh — saved ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Battery full!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Charging, nearly full (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Battery low (${bPct}%)!`;
      return msg;
    }
  },
  de: {
    tomorrow:'Morgen', sunrise:'Aufgang', sunset:'Untergang', dayPct:'des Tages',
    daytime:'Tag', nighttime:'Nacht',
    charging:'🔋⚡ Lädt', discharging:'🔋🔁 Entlädt', standby:'⏳ Bereit',
    exportGrid:'Einspeisung', importGrid:'Stromnetz',
    homeConsume:'Verbrauch', battLabel:'🔋 Akku',
    etaFull:'⚡ Voraussichtlich voll in: ', etaLeft:'🔁 Verbleibende Zeit: ',
    slowCharge:'⚡ Ladet sehr langsam', slowDisch:'🔁 Entladet sehr langsam',
    solarStat:'Solar', gridStat:'Netzbezug', consumeStat:'Verbrauch',
    savingStat:'Ersparnis', systemStat:'⚙️ SYSTEM', statsTitle:'Heutige Statistik',
    condMap:{'sunny':'☀️ Sonnig','clear-night':'🌙 Klare Nacht','partlycloudy':'⛅ Bewölkt','cloudy':'☁️ Bedeckt','rainy':'🌧️ Regen','pouring':'⛈️ Starkregen','lightning':'⚡ Gewitter','fog':'🌫️ Nebel','windy':'💨 Windig'},
    days:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
    months:['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    ticker(ws,daily,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Regnerischer Tag, Solarertrag begrenzt${kw>0?' — '+daily+' kWh erzeugt':''}.`;
      else if(ws==='lightning') msg='⛈️ Schlechtes Wetter, Solar pausiert.';
      else if(ws==='cloudy') msg=`☁️ Bewölkt, Solar läuft gedrosselt${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Teilweise bewölkt, Solar läuft gut — ${daily} kWh heute.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Sonnenschein, Solar ausgezeichnet — ${daily} kWh!`; else msg=`☀️ Gutes Wetter, ${daily} kWh erzeugt.`; }
      else msg=`🌤️ Solar erzeugte ${daily} kWh — Ersparnis ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Akku voll!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Lädt, fast voll (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Akku niedrig (${bPct}%)!`;
      return msg;
    }
  },
  it: {
    tomorrow:'Domani', sunrise:'Alba', sunset:'Tramonto', dayPct:'del giorno',
    daytime:'Giorno', nighttime:'Notte',
    charging:'🔋⚡ Ricarica', discharging:'🔋🔁 Scarica', standby:'⏳ Standby',
    exportGrid:'Immissione', importGrid:'Rete',
    homeConsume:'Consumo', battLabel:'🔋 Batteria',
    etaFull:'⚡ Piena prevista in: ', etaLeft:'🔁 Autonomia residua: ',
    slowCharge:'⚡ Ricarica molto lenta', slowDisch:'🔁 Scarica molto lenta',
    solarStat:'Solare', gridStat:'Dalla rete', consumeStat:'Consumo',
    savingStat:'Risparmio', systemStat:'⚙️ SISTEMA', statsTitle:'Statistiche di oggi',
    condMap:{'sunny':'☀️ Soleggiato','clear-night':'🌙 Sereno','partlycloudy':'⛅ Nuvoloso','cloudy':'☁️ Coperto','rainy':'🌧️ Pioggia','pouring':'⛈️ Acquazzone','lightning':'⚡ Temporale','fog':'🌫️ Nebbia','windy':'💨 Vento'},
    days:['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
    months:['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
    ticker(ws,daily,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Giornata piovosa, solare limitato${kw>0?' — '+daily+' kWh prodotti':''}.`;
      else if(ws==='lightning') msg='⛈️ Brutto tempo, solare in pausa.';
      else if(ws==='cloudy') msg=`☁️ Nuvoloso, solare ridotto${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Parzialmente nuvoloso, solare buono — ${daily} kWh oggi.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Bella giornata, solare eccellente — ${daily} kWh!`; else msg=`☀️ Giornata di sole, ${daily} kWh prodotti.`; }
      else msg=`🌤️ Solare ha prodotto ${daily} kWh — risparmio ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Batteria piena!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 In ricarica, quasi piena (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Batteria scarica (${bPct}%)!`;
      return msg;
    }
  },
  fr: {
    tomorrow:'Demain', sunrise:'Lever', sunset:'Coucher', dayPct:'de la journée',
    daytime:'Jour', nighttime:'Nuit',
    charging:'🔋⚡ Charge', discharging:'🔋🔁 Décharge', standby:'⏳ Veille',
    exportGrid:'Injection', importGrid:'Réseau',
    homeConsume:'Consommation', battLabel:'🔋 Batterie',
    etaFull:'⚡ Pleine charge estimée dans : ', etaLeft:'🔁 Autonomie restante : ',
    slowCharge:'⚡ Charge très lente', slowDisch:'🔁 Décharge très lente',
    solarStat:'Solaire', gridStat:'Du réseau', consumeStat:'Conso.',
    savingStat:'Économie', systemStat:'⚙️ SYSTÈME', statsTitle:"Stats d'aujourd'hui",
    condMap:{'sunny':'☀️ Ensoleillé','clear-night':'🌙 Nuit claire','partlycloudy':'⛅ Peu nuageux','cloudy':'☁️ Nuageux','rainy':'🌧️ Pluie','pouring':'⛈️ Forte pluie','lightning':'⚡ Orage','fog':'🌫️ Brouillard','windy':'💨 Venteux'},
    days:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    months:['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'],
    ticker(ws,daily,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Journée pluvieuse, production solaire limitée${kw>0?' — '+daily+' kWh produits':''}.`;
      else if(ws==='lightning') msg='⛈️ Mauvais temps, solaire en pause.';
      else if(ws==='cloudy') msg=`☁️ Nuageux, production solaire réduite${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Partiellement nuageux, solaire correct — ${daily} kWh aujourd'hui.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Belle journée, solaire excellent — ${daily} kWh !`; else msg=`☀️ Journée ensoleillée, ${daily} kWh produits.`; }
      else msg=`🌤️ Le solaire a produit ${daily} kWh — économie ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Batterie pleine !';
      else if(isCharge&&battSoc>80) msg+=` 🔋 En charge, presque pleine (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Batterie faible (${bPct}%) !`;
      return msg;
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// WEATHER ICONS
// ═══════════════════════════════════════════════════════════════
function makeWeatherIcon(ws){
  const css=`<style>
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
  const rays=Array.from({length:8},(_,i)=>`<div class="sn-ray" style="transform:translateX(-50%) rotate(${i*45}deg)"></div>`).join('');
  const sun=`${css}<div class="wi"><div class="sn-r">${rays}</div><div class="sn-c"></div></div>`;
  if(ws==='sunny') return sun;
  if(ws==='clear-night') return `${css}<div class="wi"><div class="mn"></div><div class="mst" style="width:4px;height:4px;top:10px;right:8px"></div><div class="mst" style="width:3px;height:3px;top:18px;right:18px;animation-delay:.6s"></div><div class="mst" style="width:2px;height:2px;top:11px;right:22px;animation-delay:1.2s"></div></div>`;
  if(ws==='partlycloudy') return `${css}<div class="wi"><div class="pc-sn"></div><div class="cl cl-w cl-f" style="width:40px;height:18px;bottom:10px;left:4px"></div></div>`;
  if(ws==='cloudy') return `${css}<div class="wi"><div class="cl cl-w cl-f"></div></div>`;
  if(ws==='rainy'){const d=[{h:'10px',d:'0s'},{h:'12px',d:'.2s'},{h:'9px',d:'.4s'},{h:'11px',d:'.15s'},{h:'10px',d:'.35s'}].map(a=>`<div class="dp" style="height:${a.h};animation-delay:${a.d}"></div>`).join('');return `${css}<div class="wi"><div class="cl cl-g cl-abs" style="top:8px;width:44px;height:20px"></div><div class="dps">${d}</div></div>`;}
  if(ws==='pouring'){const d=[{h:'14px',d:'0s'},{h:'12px',d:'.1s'},{h:'15px',d:'.05s'},{h:'13px',d:'.15s'},{h:'14px',d:'.08s'},{h:'11px',d:'.2s'}].map(a=>`<div class="dp" style="height:${a.h};animation-delay:${a.d};animation-duration:.55s;width:3px"></div>`).join('');return `${css}<div class="wi"><div class="cl cl-dk cl-abs" style="top:5px;width:46px;height:20px"></div><div class="dps" style="gap:4px;bottom:2px">${d}</div></div>`;}
  if(ws==='lightning') return `${css}<div class="wi"><div class="cl cl-dk cl-abs" style="top:4px;width:46px;height:20px"></div><div class="bl-w"><svg width="16" height="22" viewBox="0 0 16 22"><polygon points="9,0 1,13 7,13 5,22 15,9 9,9" fill="#FFE040" stroke="rgba(255,235,80,.5)" stroke-width="1"/></svg></div></div>`;
  if(ws==='fog') return `${css}<div class="wi"><div class="fg-w"><div class="fg-l" style="width:50px"></div><div class="fg-l" style="width:36px;margin-left:8px"></div><div class="fg-l" style="width:44px"></div></div></div>`;
  if(ws==='windy') return `${css}<div class="wi"><div style="display:flex;flex-direction:column;gap:9px"><div class="wd-l" style="width:50px"></div><div class="wd-l" style="width:38px;animation-delay:.18s"></div><div class="wd-l" style="width:46px;animation-delay:.36s"></div></div></div>`;
  return sun;
}

// ═══════════════════════════════════════════════════════════════
// EDITOR — accordion sections + ha-entity-picker
// ═══════════════════════════════════════════════════════════════
class SolarWeatherCardEditor extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this._config={};
    this._hass=null;
    // track which accordion sections are open
    this._open={display:true, weather:false, solar:false, battery:false, grid:false, stats:false, pricing:false};
  }

  set hass(h){ this._hass=h; this._syncPickers(); }
  setConfig(c){ this._config={...c}; this._render(); }

  static get SECTIONS(){ return [
    {
      id:'weather', label:'☁️ Weather & Environment',
      fields:[
        {k:'weather_entity',           l:'🌤️ Weather entity',               r:true,  domain:'weather'},
        {k:'temperature_entity',       l:'🌡️ Outdoor temperature (°C)',      r:true,  domain:'sensor'},
        {k:'humidity_entity',          l:'💧 Outdoor humidity (%)',          r:true,  domain:'sensor'},
        {k:'pressure_entity',          l:'🌬️ Atmospheric pressure (hPa)',    r:false, domain:'sensor'},
        {k:'uv_entity',                l:'☀️ UV index',                      r:false, domain:'sensor'},
        {k:'rain_entity',              l:'🌧️ Rain forecast sensor',          r:false, domain:'sensor'},
      ]
    },
    {
      id:'solar', label:'⚡ Solar',
      fields:[
        {k:'solar_pv1_entity',         l:'⚡ Solar Array 1 power (W)',       r:true,  domain:'sensor'},
        {k:'solar_pv2_entity',         l:'⚡ Solar Array 2 power (W)',       r:false, domain:'sensor'},
        {k:'solar_pv1_voltage_entity', l:'⚡ Solar Array 1 voltage (V)',     r:false, domain:'sensor'},
        {k:'solar_pv2_voltage_entity', l:'⚡ Solar Array 2 voltage (V)',     r:false, domain:'sensor'},
        {k:'solar_today_entity',       l:'📊 Solar today (kWh)',             r:false, domain:'sensor'},
      ]
    },
    {
      id:'battery', label:'🔋 Battery',
      fields:[
        {k:'battery_soc_entity',       l:'🔋 Battery SOC (%)',               r:true,  domain:'sensor'},
        {k:'battery_flow_entity',      l:'🔋 Battery flow (W, +charge/-discharge)', r:true, domain:'sensor'},
        {k:'battery_voltage_entity',   l:'🔋 Battery voltage (V DC)',        r:false, domain:'sensor'},
        {k:'battery_capacity_entity',  l:'🔋 Capacity sensor (Ah)',          r:false, domain:'sensor'},
        {k:'battery_capacity_wh',      l:'🔋 Capacity manual (Wh) — e.g. 26880', r:false, domain:null},
        {k:'battery_temp_entity',      l:'🌡️ BMS temperature (°C)',          r:false, domain:'sensor'},
      ]
    },
    {
      id:'grid', label:'🔌 Grid & Home',
      fields:[
        {k:'grid_flow_entity',         l:'🔌 Grid flow (W, +export/-import)', r:true, domain:'sensor'},
        {k:'grid_voltage_entity',      l:'🔌 Grid voltage (V AC)',            r:false, domain:'sensor'},
        {k:'grid_today_entity',        l:'🔌 Grid import today (kWh)',        r:false, domain:'sensor'},
        {k:'home_consumption_entity',  l:'🏠 Home consumption (W)',           r:true,  domain:'sensor'},
        {k:'consumption_today_entity', l:'📊 Consumption today (kWh)',        r:false, domain:'sensor'},
        {k:'inverter_switch_entity',   l:'🔘 Inverter switch (grid-direct)',  r:false, domain:'switch'},
        {k:'grid_direct_entity',       l:'🔌 Grid-direct power (W)',          r:false, domain:'sensor'},
      ]
    },
    {
      id:'stats', label:'⚙️ System & Stats',
      fields:[
        {k:'inverter_status_entity',   l:'⚙️ Inverter status',               r:false, domain:'sensor'},
        {k:'inverter_temp_entity',     l:'🌡️ Inverter temperature (°C)',      r:false, domain:'sensor'},
      ]
    },
  ];}

  _fire(){ this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true})); }

  _syncPickers(){
    if(!this._hass||!this.shadowRoot) return;
    const apply=()=>{
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(p=>{
        p.hass=this._hass;
        const domain=p.dataset.domain;
        if(domain) p.includeDomains=[domain];
        const key=p.dataset.key;
        const saved=this._config[key]||'';
        if(saved&&p.value!==saved){
          p.value=saved;
          p.setAttribute('value',saved);
        }
      });
    };
    apply();
    requestAnimationFrame(()=>requestAnimationFrame(apply));
  }

  _toggle(id){
    this._open[id]=!this._open[id];
    // update DOM without full re-render to preserve picker state
    const body=this.shadowRoot.getElementById('body-'+id);
    const arrow=this.shadowRoot.getElementById('arrow-'+id);
    if(body){
      body.style.display=this._open[id]?'block':'none';
      if(arrow) arrow.textContent=this._open[id]?'▾':'▸';
      if(this._open[id]) this._syncPickers();
    }
  }

  _fieldHTML(f){
    const val=this._config[f.k]||'';
    if(f.domain){
      return `<ha-entity-picker
        data-key="${f.k}"
        data-domain="${f.domain}"
        allow-custom-entity
      ></ha-entity-picker>`;
    }
    return `<input type="text" data-key="${f.k}" placeholder="e.g. 26880" value="${val}"/>`;
  }

  _sectionHTML(sec){
    const isOpen=this._open[sec.id];
    // count how many fields are filled
    const filled=sec.fields.filter(f=>this._config[f.k]).length;
    const total=sec.fields.length;
    const badge=filled>0?`<span style="background:var(--primary-color);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:8px;">${filled}/${total}</span>`:'';
    return `
    <div class="acc-wrap">
      <div class="acc-head" id="head-${sec.id}">
        <span>${sec.label}${badge}</span>
        <span class="acc-arrow" id="arrow-${sec.id}">${isOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-${sec.id}" style="display:${isOpen?'block':'none'}">
        ${sec.fields.map(f=>`
          <div class="row">
            <label>${f.l}${f.r?' <span class="req">*</span>':''}</label>
            ${this._fieldHTML(f)}
          </div>`).join('')}
      </div>
    </div>`;
  }

  _render(){
    const fs        = this._config.flow_style||'particle';
    const lang      = this._config.language||'vi';
    const op        = this._config.background_opacity??45;
    const showTmr   = this._config.show_tomorrow!==false;
    const showInfo  = this._config.show_weather_info!==false;
    const showGlow  = this._config.show_node_glow!==false;
    const cur       = this._config.currency||'đ';
    const customTiers = this._config.pricing_tiers||'';
    const isDispOpen  = this._open.display;
    const isPricingOpen = this._open.pricing;

    this.shadowRoot.innerHTML=`<style>
      :host{display:block;padding:4px 0}
      *{box-sizing:border-box}
      /* accordion */
      .acc-wrap{border:1px solid var(--divider-color);border-radius:10px;margin-bottom:8px;overflow:hidden}
      .acc-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;background:var(--secondary-background-color);font-size:13px;font-weight:700;color:var(--primary-text-color);user-select:none;transition:background .15s}
      .acc-head:hover{background:var(--table-row-background-color,rgba(0,0,0,.04))}
      .acc-arrow{font-size:14px;color:var(--secondary-text-color);transition:transform .2s}
      .acc-body{padding:12px 14px;border-top:1px solid var(--divider-color);background:var(--card-background-color,#fff)}
      /* fields */
      .row{display:flex;flex-direction:column;margin-bottom:12px}
      .row:last-child{margin-bottom:0}
      .row label{font-size:12px;color:var(--secondary-text-color);margin-bottom:4px;font-weight:600}
      .req{color:var(--error-color);font-weight:700}
      ha-entity-picker{display:block;width:100%}
      input[type=text]{background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color,#e0e0e0);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);font-family:monospace;width:100%}
      /* display options accordion */
      .opt-row{display:flex;flex-direction:column;margin-bottom:14px}
      .opt-row label{font-size:12px;font-weight:600;color:var(--secondary-text-color);margin-bottom:8px}
      .bg{display:flex;gap:6px}
      .ob{flex:1;padding:8px 6px;border-radius:8px;border:1.5px solid var(--divider-color);background:var(--secondary-background-color);cursor:pointer;text-align:center;font-size:12px;color:var(--primary-text-color);transition:all .2s}
      .ob.on{border-color:var(--primary-color);background:rgba(3,169,244,.12);color:var(--primary-color);font-weight:700}
      .toggle-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
      .toggle-row label.tl{font-size:12px;font-weight:600;color:var(--secondary-text-color)}
      .tog{position:relative;width:44px;height:24px;flex-shrink:0}
      .tog input{opacity:0;width:0;height:0}
      .tog-sl{position:absolute;inset:0;background:var(--divider-color);border-radius:12px;cursor:pointer;transition:.3s}
      .tog-sl::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.3s}
      input:checked+.tog-sl{background:var(--primary-color)}
      input:checked+.tog-sl::before{transform:translateX(20px)}
      .sl-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
      .sl-row label{font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:120px}
      .sl-row input[type=range]{flex:1}
      .slv{font-size:12px;font-weight:700;color:var(--primary-color);min-width:36px;text-align:right}
      select{background:var(--secondary-background-color);border:1.5px solid var(--divider-color);border-radius:8px;padding:8px 10px;font-size:13px;color:var(--primary-text-color);width:100%;cursor:pointer;margin-bottom:12px}
      .lang-grid{display:flex;flex-wrap:wrap;gap:6px}
      .lang-btn{display:flex;align-items:center;gap:5px;padding:7px 10px;border-radius:8px;border:1.5px solid var(--divider-color);background:var(--secondary-background-color);cursor:pointer;font-size:12px;color:var(--primary-text-color);transition:all .2s;white-space:nowrap}
      .lang-btn img{border-radius:2px;vertical-align:middle}
      .lang-btn.on{border-color:var(--primary-color);background:rgba(3,169,244,.12);color:var(--primary-color);font-weight:700}
      .hint{font-size:11px;color:var(--secondary-text-color);margin-top:4px;line-height:1.5}
    </style>

    <!-- CREDIT -->
    <div style="text-align:center;padding:10px 14px 4px;font-size:11px;color:var(--secondary-text-color);line-height:1.6;">
      ☀️ Designed by <strong style="color:var(--primary-color);">@doanlong1412</strong> from 🇻🇳 Vietnam
    </div>

    <!-- DISPLAY OPTIONS accordion -->
    <div class="acc-wrap" style="margin-bottom:8px">
      <div class="acc-head" id="head-display">
        <span>🎨 Display Options</span>
        <span class="acc-arrow" id="arrow-display">${isDispOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-display" style="display:${isDispOpen?'block':'none'}">

        <div class="opt-row">
          <label>🌊 Flow style</label>
          <div class="bg">
            <div class="ob ${fs==='particle'?'on':''}" data-t="flow_style" data-v="particle">✦ Particle</div>
            <div class="ob ${fs==='wave'?'on':''}"     data-t="flow_style" data-v="wave">〰️ Wave</div>
            <div class="ob ${fs==='line'?'on':''}"     data-t="flow_style" data-v="line">── Line</div>
          </div>
        </div>

        <div class="opt-row">
          <label>🌐 Language / Sprache / Lingua / Langue</label>
          <div class="lang-grid" id="langGrid">
            ${[
              {v:'vi', flag:'<img src="https://flagcdn.com/16x12/vn.png" width="20" height="14" alt="VN"/> Tiếng Việt'},
              {v:'en', flag:'<img src="https://flagcdn.com/16x12/gb.png" width="20" height="14" alt="GB"/> English'},
              {v:'de', flag:'<img src="https://flagcdn.com/16x12/de.png" width="20" height="14" alt="DE"/> Deutsch'},
              {v:'it', flag:'<img src="https://flagcdn.com/16x12/it.png" width="20" height="14" alt="IT"/> Italiano'},
              {v:'fr', flag:'<img src="https://flagcdn.com/16x12/fr.png" width="20" height="14" alt="FR"/> Français'},
            ].map(l=>`<div class="lang-btn ${lang===l.v?'on':''}" data-lang="${l.v}">${l.flag}</div>`).join('')}
          </div>
        </div>

        <div class="sl-row">
          <label>🪟 Background opacity</label>
          <input type="range" id="opS" min="0" max="100" value="${op}" step="5"/>
          <span class="slv" id="opV">${op}%</span>
        </div>

        <div class="toggle-row">
          <label class="tl">☁️ Show weather info panel</label>
          <label class="tog"><input type="checkbox" id="infoTog" ${showInfo?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">🌤️ Show tomorrow forecast</label>
          <label class="tog"><input type="checkbox" id="tmrTog" ${showTmr?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">✨ Node glow effect</label>
          <label class="tog"><input type="checkbox" id="glowTog" ${showGlow?'checked':''}/><span class="tog-sl"></span></label>
        </div>

      </div>
    </div>

    <!-- ENTITY SECTIONS -->
    ${SolarWeatherCardEditor.SECTIONS.map(s=>this._sectionHTML(s)).join('')}

    <!-- PRICING accordion -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-pricing">
        <span>💰 Pricing & Currency</span>
        <span class="acc-arrow" id="arrow-pricing">${isPricingOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-pricing" style="display:${isPricingOpen?'block':'none'}">
        <div class="row">
          <label>💱 Currency symbol (default: đ)</label>
          <input type="text" id="curInput" placeholder="đ / € / $ / £ ..." value="${cur}" style="font-family:inherit"/>
        </div>
        <div class="row">
          <label>📊 Custom pricing tiers (optional)</label>
          <input type="text" id="tiersInput" placeholder="50:0.10,100:0.15,∞:0.30" value="${customTiers}"/>
          <div class="hint">Format: <code>limit_kWh:rate</code> comma-separated. Leave empty = Vietnam EVN default.</div>
        </div>
      </div>
    </div>`;

    // ── Accordion toggles ───────────────────────────────────────
    // ── Add fr to isParticle/wave/line check too
    ['display','weather','solar','battery','grid','stats','pricing'].forEach(id=>{
      const h=this.shadowRoot.getElementById('head-'+id);
      if(h) h.addEventListener('click',()=>this._toggle(id));
    });

    // ── Flow style buttons ──────────────────────────────────────
    this.shadowRoot.querySelectorAll('.ob').forEach(b=>b.addEventListener('click',e=>{
      const{t,v}=e.currentTarget.dataset;
      this._config={...this._config,[t]:v}; this._fire(); this._render();
    }));

    // ── Language buttons ─────────────────────────────────────────
    this.shadowRoot.querySelectorAll('.lang-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        this._config={...this._config,language:btn.dataset.lang};
        this._fire(); this._render();
      });
    });

    // ── Opacity ─────────────────────────────────────────────────
    const sl=this.shadowRoot.getElementById('opS'),ov=this.shadowRoot.getElementById('opV');
    sl.addEventListener('input',e=>ov.textContent=e.target.value+'%');
    sl.addEventListener('change',e=>{ this._config={...this._config,background_opacity:parseInt(e.target.value)}; this._fire(); });

    // ── Toggles ─────────────────────────────────────────────────
    this.shadowRoot.getElementById('infoTog').addEventListener('change',e=>{
      this._config={...this._config,show_weather_info:e.target.checked}; this._fire();
    });
    this.shadowRoot.getElementById('tmrTog').addEventListener('change',e=>{
      this._config={...this._config,show_tomorrow:e.target.checked}; this._fire();
    });
    this.shadowRoot.getElementById('glowTog').addEventListener('change',e=>{
      this._config={...this._config,show_node_glow:e.target.checked}; this._fire();
    });

    // ── Pricing ─────────────────────────────────────────────────
    this.shadowRoot.getElementById('curInput').addEventListener('change',e=>{
      this._config={...this._config,currency:e.target.value.trim()||'đ'}; this._fire();
    });
    this.shadowRoot.getElementById('tiersInput').addEventListener('change',e=>{
      const v=e.target.value.trim(); const c={...this._config};
      if(v) c.pricing_tiers=v; else delete c.pricing_tiers;
      this._config=c; this._fire();
    });

    // ── ha-entity-picker events ─────────────────────────────────
    this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(picker=>{
      picker.addEventListener('value-changed',e=>{
        const k=picker.dataset.key, v=e.detail.value;
        const c={...this._config};
        if(v) c[k]=v; else delete c[k];
        this._config=c; this._fire();
      });
    });

    // ── Text inputs ─────────────────────────────────────────────
    this.shadowRoot.querySelectorAll('input[type=text][data-key]').forEach(inp=>inp.addEventListener('change',e=>{
      const k=e.target.dataset.key,v=e.target.value.trim();
      const c={...this._config}; if(v) c[k]=v; else delete c[k];
      this._config=c; this._fire();
    }));

    // ── Inject hass + values vào pickers ───────────────────────
    this._syncPickers();
  }
}
customElements.define('solar-weather-card-editor',SolarWeatherCardEditor);

// ═══════════════════════════════════════════════════════════════
// CARD
// ═══════════════════════════════════════════════════════════════
class SolarWeatherCard extends HTMLElement {
  constructor(){ super(); this.attachShadow({mode:'open'}); this._hass=null; this._config={}; this._iv=null; }

  static getConfigElement(){ return document.createElement('solar-weather-card-editor'); }
  static getStubConfig(){
    return {
      flow_style:'particle', language:'vi', background_opacity:45,
      show_weather_info:true, show_tomorrow:true, show_node_glow:true, currency:'đ', pricing_tiers:'',
      weather_entity:'', temperature_entity:'', humidity_entity:'',
      pressure_entity:'', uv_entity:'', rain_entity:'',
      solar_pv1_entity:'', solar_pv2_entity:'',
      solar_pv1_voltage_entity:'', solar_pv2_voltage_entity:'',
      battery_soc_entity:'', battery_flow_entity:'',
      battery_voltage_entity:'', battery_capacity_entity:'', battery_capacity_wh:'',
      grid_flow_entity:'', grid_voltage_entity:'', grid_today_entity:'',
      home_consumption_entity:'', solar_today_entity:'', consumption_today_entity:'',
      inverter_status_entity:'', inverter_switch_entity:'', grid_direct_entity:'',
      inverter_temp_entity:'', battery_temp_entity:'',
    };
  }

  setConfig(c){ this._config=c||{}; if(this._hass) this._render(); }
  set hass(h){ this._hass=h; this._render(); }
  connectedCallback(){ this._iv=setInterval(()=>this._render(),30000); this._render(); }
  disconnectedCallback(){ if(this._iv) clearInterval(this._iv); }
  getCardSize(){ return 14; }

  _g(k,def='--'){
    const id=this._config[k]; if(!id||!this._hass) return def;
    const s=this._hass.states[id];
    if(!s||s.state==='unavailable'||s.state==='unknown') return def;
    return s.state;
  }
  _gf(k,def=0){
    if(def===null){
      // null default: trả null nếu entity không có hoặc unavailable
      if(!this._config[k]||!this._hass) return null;
      const s=this._hass.states[this._config[k]];
      if(!s||s.state==='unavailable'||s.state==='unknown') return null;
      const v=parseFloat(s.state);
      return isNaN(v)?null:v;
    }
    return parseFloat(this._g(k,String(def)))||def;
  }

  _getTiers(){
    const raw=(this._config.pricing_tiers||'').trim();
    if(!raw) return [{l:50,r:1984},{l:100,r:2050},{l:200,r:2380},{l:300,r:2998},{l:400,r:3350},{l:Infinity,r:3460}];
    try{
      return raw.split(',').map(s=>{
        const[lim,rate]=s.trim().split(':');
        const l=(lim.trim()==='∞'||lim.trim()==='inf')?Infinity:parseFloat(lim);
        return{l,r:parseFloat(rate)};
      }).filter(t=>!isNaN(t.l)&&!isNaN(t.r));
    }catch(e){ return [{l:50,r:1984},{l:100,r:2050},{l:200,r:2380},{l:300,r:2998},{l:400,r:3350},{l:Infinity,r:3460}]; }
  }

  _calcCost(kwh){
    const tiers=this._getTiers(); let cost=0,prev=0;
    for(const t of tiers){if(kwh<=prev)break;cost+=(Math.min(kwh,t.l)-prev)*t.r;prev=t.l;}
    return Math.round(cost*100)/100;
  }

  _fmtSaving(val){
    if(val>=1000000) return (val/1000000).toFixed(2)+'M';
    if(val>=1000) return Math.round(val/1000)+'k';
    return val%1===0?String(val):val.toFixed(2);
  }

  // flowLevel với type
  _flowLevel(w,type='default'){
    if(type==='solar'){
      if(w<200)  return{dur:4.0,count:2,size:2.0};  if(w<600)  return{dur:3.2,count:4,size:2.4};
      if(w<1200) return{dur:2.5,count:6,size:2.8};  if(w<2500) return{dur:1.8,count:9,size:3.2};
      if(w<4000) return{dur:1.3,count:13,size:3.6}; if(w<6000) return{dur:0.9,count:17,size:4.0};
      return{dur:0.6,count:22,size:4.5};
    }
    if(type==='battery'||type==='grid'||type==='home'){
      if(w<150)  return{dur:4.0,count:2,size:2.0};  if(w<500)  return{dur:3.2,count:4,size:2.4};
      if(w<1000) return{dur:2.5,count:6,size:2.8};  if(w<2000) return{dur:1.8,count:9,size:3.2};
      if(w<3000) return{dur:1.3,count:13,size:3.6}; if(w<4500) return{dur:0.9,count:17,size:4.0};
      return{dur:0.6,count:22,size:4.5};
    }
    if(w<300) return{dur:2.2,count:5,size:2.6}; if(w<800) return{dur:1.7,count:8,size:3.0};
    if(w<2000) return{dur:1.1,count:12,size:3.5}; if(w<4000) return{dur:0.65,count:18,size:4.0};
    return{dur:0.30,count:25,size:4.5};
  }

  // ── Particle flow ────────────────────────────────────────────
  _particles(pathD,pid,color,gc,fl){
    let h=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="4,18" opacity="0.15" stroke-linecap="round"/>`;
    for(let j=0;j<Math.ceil(fl.count/3);j++){ const d=(j/Math.ceil(fl.count/3)*fl.dur).toFixed(3); h+=`<circle r="${(fl.size*2.6).toFixed(2)}" fill="${gc}" opacity="0.18" filter="url(#pBlur)"><animateMotion dur="${fl.dur}s" begin="-${d}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`; }
    for(let i=0;i<fl.count;i++){ const d=(i/fl.count*fl.dur).toFixed(3); h+=`<circle r="${(fl.size*(0.5+Math.random())).toFixed(2)}" fill="${color}" opacity="${(0.6+Math.random()*0.4).toFixed(2)}"><animateMotion dur="${fl.dur}s" begin="-${d}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`; }
    const hc=Math.ceil(fl.count*0.4);
    for(let k=0;k<hc;k++){ const d=(k/hc*fl.dur).toFixed(3); h+=`<circle r="${(fl.size*0.45).toFixed(2)}" fill="rgba(255,255,255,.92)" opacity="0.85" filter="url(#pBlurSm)"><animateMotion dur="${fl.dur}s" begin="-${d}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle>`; }
    const sk=Math.ceil(fl.count*0.55);
    for(let s=0;s<sk;s++){ const sd=(Math.random()*fl.dur).toFixed(3),ox=(Math.random()*12-6).toFixed(1),oy=(Math.random()*12-6).toFixed(1); h+=`<g transform="translate(${ox},${oy})"><circle r="${(0.9+Math.random()*1.8).toFixed(2)}" fill="${color}" opacity="${(0.22+Math.random()*0.45).toFixed(2)}"><animateMotion dur="${fl.dur}s" begin="-${sd}s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion></circle></g>`; }
    return h;
  }

  // ── Wave flow (từ YAML mới) ───────────────────────────────────
  _wave(pathD,pid,color,gc,fl){
    let h='';
    const dashDur=(fl.dur*0.8).toFixed(2);
    const dashLen=(8+fl.size*1.5).toFixed(1);
    const gapLen=(6+fl.size*1.2).toFixed(1);
    const dashTotal=(parseFloat(dashLen)+parseFloat(gapLen)).toFixed(1);
    // base dash track
    h+=`<path d="${pathD}" fill="none" stroke="${gc}" stroke-width="6" stroke-dasharray="${dashLen} ${gapLen}" stroke-linecap="round" opacity="0.25" filter="url(#pBlur)"><animate attributeName="stroke-dashoffset" from="${dashTotal}" to="0" dur="${dashDur}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    h+=`<path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.8" stroke-dasharray="${dashLen} ${gapLen}" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="${dashTotal}" to="0" dur="${dashDur}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    h+=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="1.0" stroke-dasharray="${dashLen} ${gapLen}" stroke-linecap="round" opacity="0.85"><animate attributeName="stroke-dashoffset" from="${dashTotal}" to="0" dur="${dashDur}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    // sine wave particles
    const waveDefs=[
      {amp:6, period:28, dur:fl.dur*0.9,  ox:0,  op:0.9,  sc:'rgba(255,255,255,0.92)'},
      {amp:10,period:38, dur:fl.dur*1.1,  ox:3,  op:0.6,  sc:color},
      {amp:8, period:22, dur:fl.dur*0.75, ox:-3, op:0.45, sc:gc},
      {amp:14,period:48, dur:fl.dur*1.25, ox:5,  op:0.3,  sc:color},
    ];
    const wc=Math.min(4,Math.max(2,Math.round(fl.count/4)));
    for(let wi=0;wi<wc;wi++){
      const wd=waveDefs[wi],sineCount=Math.round(fl.count*0.8),sineDur=wd.dur.toFixed(2);
      for(let si=0;si<sineCount;si++){
        const frac=si/sineCount,phase=frac*Math.PI*2;
        const sY=(wd.amp*Math.sin(phase+wi*1.1)).toFixed(1);
        const sX=(wd.ox+wd.amp*0.3*Math.cos(phase*0.5)).toFixed(1);
        const sDelay=(frac*parseFloat(sineDur)).toFixed(3);
        const sOp=(wd.op*(0.5+0.5*Math.abs(Math.sin(phase)))).toFixed(2);
        const sR=(0.9+Math.abs(Math.sin(phase))*1.4).toFixed(2);
        h+=`<g transform="translate(${sX},${sY})"><circle r="${sR}" fill="${wd.sc}" opacity="${sOp}"><animateMotion dur="${sineDur}s" begin="-${sDelay}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle></g>`;
        if(si%5===0) h+=`<g transform="translate(${(parseFloat(sX)+1.5).toFixed(1)},${(parseFloat(sY)-1.5).toFixed(1)})"><circle r="0.6" fill="rgba(255,255,255,0.95)" opacity="${(wd.op*0.7).toFixed(2)}"><animateMotion dur="${sineDur}s" begin="-${sDelay}s" repeatCount="indefinite" rotate="auto"><mpath href="#${pid}"/></animateMotion></circle></g>`;
      }
    }
    // dust
    const dustCount=Math.round(fl.count*1.2);
    for(let di=0;di<dustCount;di++){
      const r1=((di*167+41)%97)/97,r2=((di*233+61)%89)/89,r3=((di*311+23)%83)/83,r4=((di*421+37)%79)/79;
      const dox=((r1-0.5)*fl.size*7).toFixed(1),doy=((r2-0.5)*fl.size*7).toFixed(1);
      const dDur=(fl.dur*(0.6+r3*0.8)).toFixed(2),dDelay=(r4*parseFloat(dDur)).toFixed(3);
      h+=`<g transform="translate(${dox},${doy})"><circle r="${(0.4+r1*0.9).toFixed(2)}" fill="${r3>0.6?'rgba(255,255,255,0.9)':color}" opacity="${(0.15+r2*0.45).toFixed(2)}"><animateMotion dur="${dDur}s" begin="-${dDelay}s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion></circle></g>`;
    }
    // bright dots
    const dotCount=Math.max(2,Math.round(fl.count/3));
    for(let dti=0;dti<dotCount;dti++){
      const br1=((dti*191+47)%97)/97,br2=((dti*277+83)%89)/89;
      const bDur=(fl.dur*(0.45+br1*0.5)).toFixed(2),bDelay=(br2*parseFloat(bDur)).toFixed(3);
      const bR=(1.2+br1*1.6).toFixed(2);
      h+=`<circle r="${(parseFloat(bR)*2.8).toFixed(1)}" fill="${gc}" opacity="0.3" filter="url(#pBlurSm)"><animateMotion dur="${bDur}s" begin="-${bDelay}s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion></circle>`;
      h+=`<circle r="${bR}" fill="rgba(255,255,255,0.98)" opacity="${(0.7+br2*0.3).toFixed(2)}"><animateMotion dur="${bDur}s" begin="-${bDelay}s" repeatCount="indefinite"><mpath href="#${pid}"/></animateMotion></circle>`;
    }
    return h;
  }

  // ── Line flow ────────────────────────────────────────────────
  _sf(w,mx,mn,mx2){ return (mn+Math.max(0,Math.min(1,w/mx))*(mx2-mn)).toFixed(2); }
  _lineFlow(path,w,maxW,c1,c2,c3){
    const dur=this._sf(w,maxW,1.5,0.4),w1=this._sf(w,maxW,1.0,2.5),w2=this._sf(w,maxW,1.5,4.0),w3=this._sf(w,maxW,2.5,6.0);
    return `<path d="${path}" fill="none" stroke="${c3.replace('X','0.12')}" stroke-width="${w3}" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${c1.replace('X','0.92')}" stroke-width="${w1}" stroke-dasharray="28,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="148" to="0" dur="${dur}s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${c2.replace('X','0.85')}" stroke-width="${w2}" stroke-dasharray="12,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="132" to="0" dur="${dur}s" begin="0.3s" repeatCount="indefinite"/></path>
      <path d="${path}" fill="none" stroke="${c3.replace('X','0.5')}" stroke-width="${w3}" stroke-dasharray="6,120" stroke-linecap="round" filter="url(#sf)"><animate attributeName="stroke-dashoffset" from="126" to="0" dur="${dur}s" begin="0.15s" repeatCount="indefinite"/></path>`;
  }

  _svgCard(x,y,w,h,cc,glow,cbg,icoFn,val,dir,sub,active,showGlow){
    const barH=56,topH=h-barH,cx=x+w/2,cid=`c${(x*100+y*10+w+h)|0}`;
    let s=`<defs><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13"/></clipPath></defs>`;
    if(showGlow){
      if(active){
        s+=`<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="15" fill="none" stroke="${glow}" stroke-width="12" filter="url(#pBlur)"><animate attributeName="opacity" values="0;0;.8;0;0;.6;0" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`;
        s+=`<rect x="${x-1}" y="${y-1}" width="${w+2}" height="${h+2}" rx="14" fill="none" stroke="${cc}" stroke-width="2" filter="url(#pBlurSm)"><animate attributeName="opacity" values="0;0;.9;0;0;.5;0" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`;
      } else {
        s+=`<rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="14" fill="none" stroke="${glow}" stroke-width="6" filter="url(#pBlur)" opacity=".12"/>`;
      }
    }
    s+=`<g clip-path="url(#${cid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cbg}"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${topH}" fill="none" stroke="${cc}" stroke-width=".35" stroke-dasharray="2,16" opacity=".07"/>`;
    s+=`<ellipse cx="${cx}" cy="${y+topH}" rx="${w*.42}" ry="${topH*.28}" fill="${glow}" opacity=".15" filter="url(#pBlur)"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="20" fill="rgba(255,255,255,.06)"/></g>`;
    if(active){ s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.8"><animate attributeName="stroke-opacity" values=".2;.2;1;.2;.2;.7;.2" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/></rect>`; }
    else { s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.2" opacity=".35"/>`; }
    s+=`<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="12" fill="none" stroke="${glow}" stroke-width="3" filter="url(#pBlurSm)"><animate attributeName="opacity" values=".2;.5;.2" dur="2.5s" repeatCount="indefinite"/></rect>`;
    const cs=10,cw=2;
    s+=`<path d="M${x},${y+topH-cs} L${x},${y+topH} L${x+cs},${y+topH}" fill="none" stroke="${cc}" stroke-width="${cw}" stroke-linecap="round" opacity=".85"/>`;
    s+=`<path d="M${x+w},${y+topH-cs} L${x+w},${y+topH} L${x+w-cs},${y+topH}" fill="none" stroke="${cc}" stroke-width="${cw}" stroke-linecap="round" opacity=".85"/>`;
    s+=icoFn(cx,y+8,w,topH-10);
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

  _unconfigured(){
    this.shadowRoot.innerHTML=`<style>:host{display:block}</style>
      <ha-card style="padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">☀️🔋</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:8px;">Solar Weather Card</div>
        <div style="font-size:13px;color:var(--secondary-text-color);line-height:1.6;">Click <strong>✏️ Edit</strong> to configure entities.</div>
      </ha-card>`;
  }

  _render(){
    if(!this._hass) return;
    const cfg=this._config;
    if(!Object.values(cfg).some(v=>v&&String(v).trim()&&!['particle','wave','line','vi','en','de','it','fr'].includes(v)&&isNaN(v)&&v!=='đ'&&v!=='€'&&v!=='$')){ this._unconfigured(); return; }

    const lang=cfg.language||'vi';
    const T=I18N[lang]||I18N.vi;
    const flowStyle=cfg.flow_style||'particle';
    const isParticle=flowStyle==='particle';
    const isWave=flowStyle==='wave';
    const bgOp=(cfg.background_opacity??45)/100;
    const showTmr=cfg.show_tomorrow!==false;
    const showInfo=cfg.show_weather_info!==false;
    const showGlow=cfg.show_node_glow!==false;
    const currency=cfg.currency||'đ';

    // ── Sensors ──────────────────────────────────────────────
    // Đọc sensors — theo YAML gốc: đọc trực tiếp từ hass.states
    const _rS=(k)=>{ const id=this._config[k]; if(!id||!this._hass) return null; const s=this._hass.states[id]; if(!s||s.state==='unavailable'||s.state==='unknown') return null; const v=parseFloat(s.state); return isNaN(v)?null:v; };
    const tempRaw=_rS('temperature_entity');
    const temp=tempRaw!==null?tempRaw.toFixed(1):null;
    const humidRaw=_rS('humidity_entity');
    const humid=humidRaw!==null?Math.round(humidRaw):null;
    const uvRaw=_rS('uv_entity');
    const uv=uvRaw!==null?uvRaw.toFixed(1):null;
    const rain=this._g('rain_entity','');
    const pressRaw=_rS('pressure_entity');
    const press=pressRaw!==null?Math.round(pressRaw):null;
    const wId=cfg.weather_entity;
    const _wRaw=(wId&&this._hass.states[wId]?.state)||'cloudy';
    const wState=(_wRaw==='unavailable'||_wRaw==='unknown')?'cloudy':_wRaw;
    const cond=T.condMap[wState]||(wState==='cloudy'?T.condMap['cloudy']:wState);
    const wfc=wId&&this._hass.states[wId]?.attributes?.forecast;
    // Forecast hôm nay: wfc[0] — y hệt YAML gốc
    const _wfc0 = (wfc && wfc.length > 0) ? wfc[0] : null;
    const tempHi = _wfc0 ? Math.round(_wfc0.temperature) : '--';
    const tempLo = _wfc0 ? Math.round(_wfc0.templow !== undefined ? _wfc0.templow : (_wfc0.temp_low !== undefined ? _wfc0.temp_low : NaN)) : '--';
    const condHTML=makeWeatherIcon(wState);

    // Tomorrow — YAML gốc dùng sensor.tomorrow_raw_hourly, nếu không có thì dùng wfc[1]
    // Khởi tạo từ wfc[1] trước (fallback)
    const _wfc1 = (wfc && wfc.length > 1) ? wfc[1] : null;
    let tmrWstate = _wfc1 && _wfc1.condition && _wfc1.condition !== 'unavailable' ? _wfc1.condition : wState;
    let tmrW = T.condMap[tmrWstate] || T.condMap['cloudy'] || '';
    let tmrHi = _wfc1 ? Math.round(_wfc1.temperature) : '--';
    let tmrLo = _wfc1 ? Math.round(_wfc1.templow !== undefined ? _wfc1.templow : (_wfc1.temp_low !== undefined ? _wfc1.temp_low : NaN)) : '--';

    // Override từ sensor.tomorrow_raw_hourly nếu có (như YAML gốc)
    const _tmrRaw = this._hass.states['sensor.tomorrow_raw_hourly'];
    if(_tmrRaw && _tmrRaw.attributes && _tmrRaw.attributes.timelines) {
      try {
        const intervals = _tmrRaw.attributes.timelines[0].intervals;
        if(intervals && intervals.length) {
          const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
          const tmrDate = tomorrow.getDate(), tmrMonth = tomorrow.getMonth();
          const allSlots = [], daySlots = [];
          for(const iv of intervals) {
            const d = new Date(iv.startTime);
            if(d.getDate()===tmrDate && d.getMonth()===tmrMonth) {
              allSlots.push(iv.values);
              const h = d.getHours();
              if(h>=6 && h<=18) daySlots.push(iv.values);
            }
          }
          if(allSlots.length) {
            const temps = allSlots.map(v=>v.temperature);
            tmrHi = Math.round(Math.max(...temps));
            tmrLo = Math.round(Math.min(...temps));
            const slots = daySlots.length ? daySlots : allSlots;
            const codeCount = {};
            for(const s of slots) { codeCount[s.weatherCode]=(codeCount[s.weatherCode]||0)+1; }
            let bestCode = slots[0].weatherCode, bestN = 0;
            for(const k in codeCount) { if(codeCount[k]>bestN){bestN=codeCount[k];bestCode=parseInt(k);} }
            const tmCodeMap = {1000:'sunny',1100:'partlycloudy',1101:'partlycloudy',1102:'cloudy',1001:'cloudy',2000:'fog',2100:'fog',4000:'rainy',4001:'rainy',4200:'rainy',4201:'pouring',8000:'lightning',8001:'lightning',8002:'lightning'};
            tmrWstate = tmCodeMap[bestCode] || 'cloudy';
            tmrW = T.condMap[tmrWstate] || tmrW;
          }
        }
      } catch(e) {}
    }
    const tmrHTML = makeWeatherIcon(tmrWstate);

    const pv1W=this._gf('solar_pv1_entity',0),pv2W=this._gf('solar_pv2_entity',0);
    const solarW=pv1W+pv2W,hasSolar=solarW>10;
    const pv1V=this._gf('solar_pv1_voltage_entity',0),pv2V=this._gf('solar_pv2_voltage_entity',0);
    const pvDC=((pv1V+pv2V)/2).toFixed(0);

    const battSoc=this._gf('battery_soc_entity',0);
    const battFlW=this._gf('battery_flow_entity',0);
    const isCharge=battFlW>10,isDisch=battFlW<-10;
    const battW=Math.abs(battFlW).toFixed(0);
    const battDir=isCharge?T.charging:(isDisch?T.discharging:T.standby);
    const bVolt=parseFloat(this._gf('battery_voltage_entity',48));
    const bPct=Math.round(battSoc);
    const manualWh=parseFloat(cfg.battery_capacity_wh||0);
    const sensorAh=this._gf('battery_capacity_entity',0);
    const voltCap=bVolt>10?bVolt:48;
    let battCapWh;
    if(manualWh>0) battCapWh=manualWh;
    else if(sensorAh>0) battCapWh=sensorAh*voltCap;
    else battCapWh=560*48;
    let battETA='';
    if(battCapWh>0){
      if(isCharge&&battFlW>0){ const e=Math.round((100-battSoc)/100*battCapWh/battFlW*60); if(e>0){ battETA=e>=72000?T.slowCharge:T.etaFull+(e>=60?Math.floor(e/60)+'h ':'')+e%60+'m'; } }
      else if(isDisch&&Math.abs(battFlW)>0){ const e=Math.round(battSoc/100*battCapWh/Math.abs(battFlW)*60); if(e>0){ battETA=e>=72000?T.slowDisch:T.etaLeft+(e>=60?Math.floor(e/60)+'h ':'')+e%60+'m'; } }
    }

    const gridFlW=this._gf('grid_flow_entity',0);
    const hasGrid=Math.abs(gridFlW)>10;
    const gridW=Math.abs(gridFlW).toFixed(0);
    const gridDir=gridFlW>10?T.exportGrid:T.importGrid;
    const gridV=this._gf('grid_voltage_entity',220).toFixed(0);
    const homeFlW=this._gf('home_consumption_entity',0);
    const homeW=homeFlW.toFixed(0),hasHome=homeFlW>10;
    const invSwitchState=this._g('inverter_switch_entity','off');
    const invOff=invSwitchState==='on';
    const gridDirectW=invOff?this._gf('grid_direct_entity',0):0;
    const hasGridDirect=invOff&&gridDirectW>10;
    const daily=this._gf('solar_today_entity',0).toFixed(1);
    const gridDaily=this._gf('grid_today_entity',0).toFixed(1);
    const combinedFmt=this._gf('consumption_today_entity',0).toFixed(1);
    const saving=this._calcCost(parseFloat(daily));
    const savFmt=this._fmtSaving(saving);
    const luxState=this._g('inverter_status_entity','--');
    const invTemp=this._gf('inverter_temp_entity',0).toFixed(1);
    const batTemp=this._gf('battery_temp_entity',0).toFixed(1);
    const isOff=['--','unavailable','unknown','Unavailable'].includes(luxState);
    const isNormal=['Normal','normal','online','Online','ONLINE'].includes(luxState);
    const stColor=isNormal?'rgba(74,222,128,1)':isOff?'rgba(255,80,80,1)':'rgba(255,200,60,1)';
    const stLabel=isOff?'OFF':(isNormal?'ON':luxState);

    // Clock
    const now=new Date();
    const H=now.getHours(),M=now.getMinutes();
    const ap=H>=12?'PM':'AM',hh=String(H%12||12).padStart(2,'0'),mm=String(M).padStart(2,'0');
    const dateStr=`${T.days[now.getDay()]}, ${now.getDate()} ${T.months[now.getMonth()]} ${now.getFullYear()}`;

    // Sun arc
    const sunA=this._hass.states['sun.sun']?.attributes||{};
    const toMin=s=>{try{const p=s.split(':').map(Number);return p[0]*60+p[1];}catch{return 0;}};
    const riseStr=sunA.next_rising?new Date(sunA.next_rising).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}):'05:38';
    const setStr=sunA.next_setting?new Date(sunA.next_setting).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',hour12:false}):'18:12';
    const RISE=toMin(riseStr),SET=toMin(setStr),nowM=H*60+M;
    const t=Math.max(0,Math.min(1,(nowM-RISE)/(SET-RISE)));
    const bell=1-Math.pow(Math.abs(2*t-1),1.5);
    const pct=Math.round(t*100);
    const dayMin=SET-RISE,nightMin=1440-dayMin;
    const fmtDur=mn=>`${Math.floor(mn/60)}h ${mn%60}m`;
    const bx=(1-t)*(1-t)*14+2*(1-t)*t*173+t*t*332;
    const by=(1-t)*(1-t)*65+2*(1-t)*t*(-45)+t*t*65;
    const lbw=88,lbx=t<0.5?bx-lbw-10:bx+14,lby=by-20;
    const isNight=nowM<RISE||nowM>SET;
    let tMoon=nowM>SET?(nowM-SET)/nightMin:(nowM+1440-SET)/nightMin;
    tMoon=Math.max(0,Math.min(1,tMoon));
    const mx2=(1-tMoon)*(1-tMoon)*332+2*(1-tMoon)*tMoon*173+tMoon*tMoon*14;
    const my2=(1-tMoon)*(1-tMoon)*65+2*(1-tMoon)*tMoon*145+tMoon*tMoon*65;

    // Layout
    const BAT_X=-40,BAT_Y=100,BAT_W=92,BAT_H=126;
    const GRD_X=295,GRD_Y=100,GRD_W=92,GRD_H=126;
    const INV_X=120,INV_Y=220,INV_W=106,INV_H=130;
    const HOM_X=120,HOM_Y=400,HOM_W=106,HOM_H=124;
    const BAT_CX=BAT_X+BAT_W/2,BAT_CY=BAT_Y+BAT_H/2,BAT_R=BAT_X+BAT_W,BAT_BOT=BAT_Y+BAT_H;
    const GRD_CX=GRD_X+GRD_W/2,GRD_CY=GRD_Y+GRD_H/2,GRD_L=GRD_X;
    const INV_CX=INV_X+INV_W/2,INV_TOP=INV_Y,INV_BOT=INV_Y+INV_H;
    const HOM_CX=HOM_X+HOM_W/2,HOM_TOP=HOM_Y;

    // ── Build flows — NO power labels ────────────────────────
    let FL='',fpDefs='',fpIdx=0;
    const addFlow=(path,color,gc,fl)=>{
      const id=`fp-${fpIdx++}`;
      fpDefs+=`<path id="${id}" d="${path}"/>`;
      if(isWave)     FL+=this._wave(path,id,color,gc,fl);
      else if(isParticle) FL+=this._particles(path,id,color,gc,fl);
    };
    const addLine=(path,w,mx,c1,c2,c3)=>{ FL+=this._lineFlow(path,w,mx,c1,c2,c3); };

    if(hasSolar){
      const sp=`M ${bx.toFixed(1)},${(by+7).toFixed(1)} C ${bx.toFixed(1)},${INV_TOP-70} ${INV_CX},${INV_TOP-150} ${INV_CX},${INV_TOP}`;
      if(isParticle||isWave) addFlow(sp,'rgba(255,232,60,.95)','rgba(255,190,20,.55)',this._flowLevel(solarW,'solar'));
      else addLine(sp,solarW,8000,'rgba(255,250,200,X)','rgba(255,215,55,X)','rgba(255,235,120,X)');
    }
    if(isCharge){
      const p=`M${INV_X+30},${INV_BOT} C ${INV_X},${INV_BOT+90} ${BAT_CX},${BAT_BOT+180} ${BAT_CX},${BAT_BOT}`;
      if(isParticle||isWave) addFlow(p,'rgba(60,232,120,.95)','rgba(20,160,70,.55)',this._flowLevel(battFlW,'battery'));
      else addLine(p,battFlW,6000,'rgba(200,255,220,X)','rgba(80,220,120,X)','rgba(160,240,180,X)');
    }
    if(isDisch){
      const p=`M${BAT_R},${BAT_CY} C ${BAT_R},${BAT_CY+40} ${INV_CX},${INV_TOP-90} ${INV_CX-10},${INV_TOP}`;
      if(isParticle||isWave) addFlow(p,'rgba(255,205,40,.95)','rgba(200,140,10,.55)',this._flowLevel(Math.abs(battFlW),'battery'));
      else addLine(p,Math.abs(battFlW),6000,'rgba(255,245,180,X)','rgba(255,200,60,X)','rgba(255,230,130,X)');
    }
    if(hasGrid){
      const gp=gridFlW>10?`M${INV_CX},${INV_TOP} C ${INV_CX},${INV_TOP-60} ${GRD_L},${GRD_CY+60} ${GRD_L},${GRD_CY}`:`M${GRD_L},${GRD_CY} C ${GRD_L},${GRD_CY+40} ${INV_CX+10},${INV_TOP-90} ${INV_CX+10},${INV_TOP}`;
      if(isParticle||isWave) addFlow(gp,'rgba(80,190,255,.95)','rgba(30,130,230,.55)',this._flowLevel(Math.abs(gridFlW),'grid'));
      else addLine(gp,Math.abs(gridFlW),6000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
    }
    if(hasHome){
      const p=`M${INV_CX},${INV_BOT+2} C ${INV_CX},${INV_BOT+20} ${HOM_CX},${HOM_TOP-20} ${HOM_CX},${HOM_TOP-2}`;
      if(isParticle||isWave) addFlow(p,'rgba(255,148,45,.95)','rgba(200,90,10,.55)',this._flowLevel(homeFlW,'home'));
      else addLine(p,homeFlW,6000,'rgba(255,230,180,X)','rgba(255,148,55,X)','rgba(255,190,100,X)');
    }
    if(hasGridDirect){
      const p=`M${GRD_CX},${GRD_Y+GRD_H} C ${GRD_CX},${GRD_Y+GRD_H+80} ${HOM_CX+60},${HOM_TOP-60} ${HOM_CX},${HOM_TOP}`;
      if(isParticle||isWave) addFlow(p,'rgba(80,190,255,.95)','rgba(30,130,230,.55)',this._flowLevel(gridDirectW,'grid'));
      else addLine(p,gridDirectW,6000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
    }

    // ── Icons ─────────────────────────────────────────────────
    const battFillC=battSoc>50?'rgba(60,220,110,.95)':battSoc>20?'rgba(255,200,50,.95)':'rgba(255,70,70,.95)';

    const batIcoFn=(cx2,iy,aw,ah)=>{
      const bw=58,bh=26,bx0=cx2-bw/2,by0=iy+(ah-bh)/2-2,fw=Math.max(2,Math.round((bw-8)*battSoc/100));
      let s=`<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>`;
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
      s+=`<text x="${cx2}" y="${by0+bh/2+4.5}" text-anchor="middle" fill="rgba(255,255,255,.97)" font-size="14" font-weight="800" font-family="-apple-system,sans-serif">${bPct}%</text>`;
      if(isCharge){ const bCX=Math.min(bx0+fw*0.6+4,bx0+bw-14),bt=by0+4,bb=by0+bh-4,bm=(bt+bb)/2; s+=`<polygon points="${bCX+3},${bt} ${bCX},${bm} ${bCX+2.5},${bm} ${bCX-1},${bb} ${bCX+5},${bm} ${bCX+2.5},${bm}" fill="rgba(255,255,220,.95)"/>`; }
      s+='</g>'; return s;
    };

    const invIcoFn=(cx2,iy,aw,ah)=>{
      const iw=54,ih=46,ix=cx2-iw/2,iy0=iy+(ah-ih)/2-2;
      let s=`<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.3s" begin=".55s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>`;
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
      ['AC','DC','PV'].forEach((lb,li)=>{ const px=ix+4+li*(pw2+1); s+=`<rect x="${px}" y="${iy0+15}" width="${pw2}" height="5.5" rx="1" fill="rgba(3,1,14,.92)" stroke="rgba(165,122,255,.35)" stroke-width=".55"/><text x="${px+pw2/2}" y="${iy0+19.5}" text-anchor="middle" fill="rgba(205,175,255,${li===0?'.7':li===1?'.55':'.42'})" font-size="3.5" font-weight="700" font-family="-apple-system,sans-serif">${lb}</text>`; });
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
      s+='</g>'; return s;
    };

    // Grid icon — lattice tower + transformer (từ YAML v1.4.1)
    const grdIcoFn=(cx2,iy,aw,ah)=>{
      let s='<g>';
      s+=`<animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="2.9s" begin="1.1s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>`;
      const totalW=aw*0.96,startX=cx2-totalW/2;
      const tfW=totalW*0.34,gap=totalW*0.03,twW=totalW-tfW-gap;
      const twH=ah*0.90,tfX=startX+twW+gap;
      const twCX=startX+twW/2+twW*0.08,tyTop=iy+(ah-twH)/2;
      const sc=Math.min(twW/140,twH/420);
      const osx=twCX-200*sc,osy=tyTop-30*sc;
      const Tx=x=>(osx+x*sc).toFixed(1),Ty=y=>(osy+y*sc).toFixed(1),T=(x,y)=>Tx(x)+','+Ty(y);
      s+=`<line x1="${Tx(200)}" y1="${Ty(30)}" x2="${Tx(200)}" y2="${Ty(450)}" stroke="#4da6ff" stroke-width="1.2" opacity="0.9"/>`;
      s+=`<line x1="${Tx(200)}" y1="${Ty(40)}" x2="${Tx(130)}" y2="${Ty(450)}" stroke="#4da6ff" stroke-width="1.2" opacity="0.9"/>`;
      s+=`<line x1="${Tx(200)}" y1="${Ty(40)}" x2="${Tx(270)}" y2="${Ty(450)}" stroke="#4da6ff" stroke-width="1.2" opacity="0.9"/>`;
      [[150,130,250,130],[110,230,290,230],[120,330,280,330]].forEach(([x1,y1,x2,y2])=>{
        s+=`<line x1="${Tx(x1)}" y1="${Ty(y1)}" x2="${Tx(x2)}" y2="${Ty(y2)}" stroke="#4da6ff" stroke-width="2.2" opacity="0.95"/>`;
        s+=`<line x1="${Tx(x1)}" y1="${Ty(y1-14)}" x2="${Tx(x2)}" y2="${Ty(y2-14)}" stroke="#4da6ff" stroke-width="0.8" opacity="0.45"/>`;
      });
      s+=`<path d="M${T(185,80)} L${T(200,130)} L${T(215,80)}" stroke="#2a6299" stroke-width="0.9" fill="none" opacity="0.85"/>`;
      s+=`<path d="M${T(150,130)} L${T(200,230)} L${T(250,130)} M${T(175,130)} L${T(110,230)} M${T(225,130)} L${T(290,230)}" stroke="#2a6299" stroke-width="0.9" fill="none" opacity="0.75"/>`;
      s+=`<line x1="${Tx(140)}" y1="${Ty(180)}" x2="${Tx(260)}" y2="${Ty(180)}" stroke="#2a6299" stroke-width="0.8" opacity="0.55"/>`;
      s+=`<path d="M${T(110,230)} L${T(200,330)} L${T(290,230)} M${T(155,230)} L${T(120,330)} M${T(245,230)} L${T(280,330)}" stroke="#2a6299" stroke-width="0.9" fill="none" opacity="0.75"/>`;
      s+=`<line x1="${Tx(115)}" y1="${Ty(280)}" x2="${Tx(285)}" y2="${Ty(280)}" stroke="#2a6299" stroke-width="0.8" opacity="0.55"/>`;
      s+=`<path d="M${T(120,330)} L${T(200,450)} L${T(280,330)} M${T(160,330)} L${T(130,450)} M${T(240,330)} L${T(270,450)}" stroke="#2a6299" stroke-width="0.9" fill="none" opacity="0.75"/>`;
      s+=`<line x1="${Tx(125)}" y1="${Ty(390)}" x2="${Tx(275)}" y2="${Ty(390)}" stroke="#2a6299" stroke-width="0.8" opacity="0.55"/>`;
      const ins2=(gx,gy,h2)=>{const ix=parseFloat(Tx(gx)),iy0=parseFloat(Ty(gy)),ih=h2*sc;return `<rect x="${ix-1.5}" y="${iy0}" width="3" height="${ih.toFixed(1)}" rx="1" fill="#82cfff" opacity="0.9"/><rect x="${ix-2}" y="${iy0}" width="4" height="${(ih*0.4).toFixed(1)}" rx="1" fill="#4da6ff" opacity="0.9"/>`;};
      s+=ins2(150,130,30)+ins2(250,130,30)+ins2(110,230,40)+ins2(290,230,40)+ins2(120,330,40)+ins2(280,330,40);
      s+=`<circle cx="${Tx(200)}" cy="${Ty(26)}" r="2.2" fill="#a0d8ff"/>`;
      s+=`<circle cx="${Tx(200)}" cy="${Ty(26)}" r="4" fill="rgba(0,215,255,.3)" opacity="0.7"/>`;
      // wires left
      [[150,130,148,140],[110,230,248,260],[120,330,350,365]].forEach(([ax,ay,qy,ey])=>{
        s+=`<path d="M${Tx(ax)},${Ty(ay)} Q${(parseFloat(Tx(ax))-8).toFixed(1)},${Ty(qy)} ${(parseFloat(Tx(110))-10).toFixed(1)},${Ty(ey)}" fill="none" stroke="#7ec4ff" stroke-width="1.0" opacity="0.65"/>`;
      });
      // wires to transformer
      const tfCX=(tfX+tfW/2).toFixed(1),tfTopY=tyTop+twH*0.30;
      const armY1=parseFloat(Ty(130)),armY2=parseFloat(Ty(230)),armY3=parseFloat(Ty(330));
      [[250,armY1,6,4,4],[290,armY2,4,3,2],[280,armY3,4,3,0]].forEach(([ax,ay,qox,qoy,eoy])=>{
        s+=`<path d="M${Tx(ax)},${ay} Q${(parseFloat(Tx(ax))+qox).toFixed(1)},${(ay+qoy).toFixed(1)} ${tfCX},${(tfTopY-eoy).toFixed(1)}" fill="none" stroke="#7ec4ff" stroke-width="1.0" opacity="0.65"/>`;
      });
      // transformer
      const tfH=twH*0.40,tfY=tyTop+twH*0.46,tfBW=tfW*0.86,tfBX=tfX+(tfW-tfBW)/2;
      s+=`<rect x="${tfBX-2}" y="${tfY-2}" width="${tfBW+4}" height="${tfH+4}" rx="5" fill="none" stroke="rgba(77,166,255,.4)" stroke-width="4" filter="url(#pBlur)" opacity="0.6"/>`;
      s+=`<rect x="${tfBX-1}" y="${tfY-4}" width="${tfBW+2}" height="4.5" rx="1.5" fill="rgba(37,74,112,.9)" stroke="rgba(77,166,255,.6)" stroke-width="0.7"/>`;
      const bSpacing=tfBW/3;
      for(let bi=0;bi<3;bi++){ const bx2=tfBX+bSpacing*(bi+0.5); s+=`<rect x="${bx2-1.5}" y="${tfY-9}" width="3" height="6" rx="1" fill="rgba(126,196,255,.9)" stroke="rgba(180,220,255,.5)" stroke-width="0.5"/><circle cx="${bx2}" cy="${tfY-9}" r="1.5" fill="rgba(0,215,255,.9)"/>`; }
      s+=`<rect x="${tfBX}" y="${tfY}" width="${tfBW}" height="${tfH}" rx="3" fill="rgba(25,50,80,.92)" stroke="rgba(77,166,255,.8)" stroke-width="0.8"/>`;
      const colW=tfBW*0.22,colGap=(tfBW-colW*3)/4;
      for(let ci=0;ci<3;ci++){ const cx3=tfBX+colGap*(ci+1)+colW*ci; s+=`<rect x="${cx3}" y="${tfY+4}" width="${colW}" height="${tfH-8}" rx="2" fill="rgba(45,70,99,.9)" stroke="rgba(26,46,68,.8)" stroke-width="0.6"/>`; for(let li=0;li<3;li++){ const ly=tfY+7+li*(tfH-12)/3; s+=`<line x1="${cx3+1}" y1="${ly}" x2="${cx3+colW-1}" y2="${ly}" stroke="rgba(77,140,200,.4)" stroke-width="0.5"/>`; } }
      const finX=tfBX+tfBW+1,finH=tfH*0.72,finY=tfY+(tfH-finH)/2,finW=tfW*0.12;
      s+=`<rect x="${finX}" y="${finY}" width="${finW}" height="${finH}" rx="1.5" fill="rgba(58,107,156,.8)" stroke="rgba(26,46,68,.7)" stroke-width="0.5"/>`;
      for(let fi=0;fi<4;fi++){ const fy=finY+2+fi*(finH-4)/3; s+=`<line x1="${finX}" y1="${fy}" x2="${finX+finW}" y2="${fy}" stroke="rgba(26,46,68,.8)" stroke-width="0.6"/>`; }
      s+='</g>'; return s;
    };

    const homIcoFn=(cx2,iy,aw,ah)=>{
      const sc=0.82,ox=cx2-43*sc,oy=iy+(ah-68*sc)/2;
      const p=(x,y)=>`${ox+x*sc},${oy+y*sc}`;
      let s=`<g><animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3.5s" begin="1.65s" repeatCount="indefinite" calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1"/>`;
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
      [51,56,61].forEach(yy=>s+=`<line x1="${p(33,yy)}" x2="${p(59,yy)}" stroke="rgba(255,172,40,.42)" stroke-width="${0.75*sc}" stroke-linecap="round"/>`);
      s+=`<line x1="${p(46,44)}" x2="${p(46,68)}" stroke="rgba(255,172,40,.42)" stroke-width="${0.75*sc}" stroke-linecap="round"/>`;
      s+=`<rect x="${ox-2}" y="${oy+67*sc}" width="${90*sc}" height="${3.5*sc}" rx="${1.2*sc}" fill="rgba(182,102,16,.22)" stroke="rgba(255,175,42,.32)" stroke-width="${0.7*sc}"/>`;
      const ax=ox+56*sc,ayt=oy+13*sc,ayb=oy+21*sc;
      s+=`<line x1="${ax}" y1="${ayb}" x2="${ax}" y2="${ayt}" stroke="rgba(255,178,42,.68)" stroke-width="${1.1*sc}" stroke-linecap="round"/>`;
      s+=`<circle cx="${ax}" cy="${ayt}" r="${1.5*sc}" fill="rgba(255,178,42,.92)" filter="url(#pBlurSm)"/>`;
      s+=`<path d="M${ax-3.5*sc},${ayt+5*sc} Q${ax},${ayt+sc} ${ax+3.5*sc},${ayt+5*sc}" fill="none" stroke="rgba(255,178,42,.35)" stroke-width="${0.85*sc}" stroke-linecap="round"/>`;
      s+=`<ellipse cx="${cx2}" cy="${oy+46*sc}" rx="${28*sc}" ry="${15*sc}" fill="rgba(255,185,48,.05)" filter="url(#pBlur)"/>`;
      s+='</g>'; return s;
    };

    // Node cards
    const isInvActive=!invOff&&(hasSolar||hasHome||hasGrid||isCharge||isDisch);
    const foBAT=this._svgCard(BAT_X,BAT_Y,BAT_W,BAT_H,'rgba(40,230,160,1)','rgba(30,190,120,.5)','rgba(0,14,8,.97)',batIcoFn,`${battW}W`,battDir,`${bVolt.toFixed(0)}V DC`,isCharge||isDisch,showGlow);
    const foINV=this._svgCard(INV_X,INV_Y,INV_W,INV_H,'rgba(185,145,255,1)','rgba(145,90,255,.48)','rgba(6,2,18,.97)',invIcoFn,`${gridV}V`,'AC Output',`${bVolt.toFixed(0)}V BAT · ${pvDC}V PV`,isInvActive,showGlow);
    const foGRD=this._svgCard(GRD_X,GRD_Y,GRD_W,GRD_H,'rgba(0,215,255,1)','rgba(0,165,240,.48)','rgba(0,10,20,.97)',grdIcoFn,`${gridW}W`,gridDir,`${gridV}V AC`,hasGrid,showGlow);
    const foHOM=this._svgCard(HOM_X,HOM_Y,HOM_W,HOM_H,'rgba(255,178,40,1)','rgba(220,132,14,.48)','rgba(12,6,0,.97)',homIcoFn,`${homeW}W`,T.homeConsume,'Home',hasHome,showGlow);

    // Sky aura
    let r1,g1,b1,r2,g2,b2;
    if(t<0.25){const p=t/0.25;r1=Math.round(30+p*20);g1=Math.round(100+p*120);b1=Math.round(200-p*80);r2=Math.round(20+p*10);g2=Math.round(80+p*80);b2=Math.round(160-p*60);}
    else if(t<0.5){const p=(t-0.25)/0.25;r1=Math.round(50+p*180);g1=Math.round(220-p*50);b1=Math.round(120-p*110);r2=Math.round(30+p*150);g2=Math.round(160-p*40);b2=Math.round(100-p*90);}
    else if(t<0.75){const p=(t-0.5)/0.25;r1=Math.round(230+p*20);g1=Math.round(170-p*80);b1=Math.round(10+p*10);r2=Math.round(180+p*20);g2=Math.round(120-p*60);b2=10;}
    else{const p=(t-0.75)/0.25;r1=Math.round(250-p*200);g1=Math.round(90-p*60);b1=Math.round(20+p*180);r2=Math.round(200-p*160);g2=Math.round(60-p*40);b2=Math.round(10+p*140);}

    // Sun
    let sunSVG='';
    if(!isNight){
      const pr=Math.min(1,solarW/8000),cR=255,cG=Math.round(235-bell*110),cB=Math.round(130-bell*120);
      const gR=255,gG=Math.round(200-bell*120),gB=Math.round(80-bell*70);
      const rC=(5+pr*5).toFixed(1),rG1=(10+pr*18).toFixed(1),rG2=(18+pr*28).toFixed(1),bd=(2.2-pr*1.75).toFixed(2);
      sunSVG=`<defs><filter id="sunF" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="${(3+pr*5).toFixed(1)}"/></filter><radialGradient id="sunCG" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="rgba(255,255,220,.98)"/><stop offset="40%" stop-color="rgb(${cR},${cG},${cB})"/><stop offset="100%" stop-color="rgba(${gR},${gG},${gB},.6)"/></radialGradient></defs>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG2}" fill="rgba(${gR},${gG},${gB},.18)" filter="url(#sunF)"><animate attributeName="r" values="${rG2};${(parseFloat(rG2)*1.22).toFixed(1)};${(parseFloat(rG2)*1.08).toFixed(1)};${(parseFloat(rG2)*1.22).toFixed(1)};${rG2}" dur="${bd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/><animate attributeName="opacity" values="0.55;1;0.3;0.9;0.55" dur="${bd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG1}" fill="rgba(${gR},${gG},${gB},.55)" filter="url(#sf)"><animate attributeName="r" values="${rG1};${(parseFloat(rG1)*1.28).toFixed(1)};${(parseFloat(rG1)*1.10).toFixed(1)};${(parseFloat(rG1)*1.28).toFixed(1)};${rG1}" dur="${bd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/><animate attributeName="opacity" values="0.7;1;0.35;1;0.7" dur="${bd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
      sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rC}" fill="url(#sunCG)" stroke="rgba(255,255,200,.85)" stroke-width="1.2"><animate attributeName="r" values="${rC};${(parseFloat(rC)*1.18).toFixed(1)};${rC};${(parseFloat(rC)*1.10).toFixed(1)};${rC}" dur="${bd}s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/></circle>`;
    }

    // Moon
    const mcx=isNight?mx2:((1-t)*(1-t)*332+2*(1-t)*t*173+t*t*14);
    const mcy=isNight?my2:((1-t)*(1-t)*115+2*(1-t)*t*95+t*t*115);
    const moonSVG=`<g filter="url(#mf)" opacity="${isNight?'1':'.35'}"><circle cx="${mcx}" cy="${mcy}" r="${isNight?10:7}" fill="${isNight?'rgba(180,205,255,.3)':'rgba(180,205,255,.10)'}"/><circle cx="${mcx}" cy="${mcy}" r="${isNight?6:3.5}" fill="${isNight?'rgba(220,235,255,.98)':'rgba(200,218,255,.85)'}" stroke="${isNight?'rgba(240,248,255,.9)':'rgba(225,235,255,.65)'}" stroke-width="1.2"/></g>`;

    // Battery bar
    let bColor,bGlow;
    if(bPct<=10){bColor='linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444)';bGlow='rgba(239,68,68,.6)';}
    else if(bPct<=20){bColor='linear-gradient(90deg,#dc2626,#ea580c,#f59e0b)';bGlow='rgba(245,158,11,.55)';}
    else{bColor='linear-gradient(90deg,#16a34a,#4ade80,#86efac)';bGlow='rgba(74,222,128,.5)';}

    const tickMsg=T.ticker(wState,daily,savFmt,currency,bPct,isCharge,isDisch,battSoc);
    const ticker2=tickMsg+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+tickMsg;
    const cell='background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:10px 6px;text-align:center;';
    const lbl='font-size:10px;color:rgba(255,255,255,.45);margin-top:2px;white-space:nowrap;';
    const val='font-size:13px;font-weight:700;white-space:nowrap;';
    const ico='font-size:16px;margin-bottom:3px;';
    const bg=`linear-gradient(135deg,rgba(0,20,30,${bgOp}) 0%,rgba(0,40,50,${(bgOp*0.78).toFixed(2)}) 100%)`;

    this.shadowRoot.innerHTML=`
<style>:host{display:block}*{box-sizing:border-box;margin:0;padding:0}
@keyframes scrollTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
</style>
<div style="font-family:Inter,-apple-system,sans-serif;color:#fff;
  background:${bg};backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  border:1px solid rgba(255,255,255,.18);border-radius:24px;
  box-shadow:0 8px 32px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.20),inset 0 -1px 0 rgba(255,255,255,.05);
  overflow:hidden;">

  ${showInfo?`<div style="padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
    <div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;margin-bottom:12px;">
      <div>${condHTML}</div>
      <div style="text-align:center;">
        <div style="font-size:80px;font-weight:800;line-height:1;letter-spacing:-3px;text-shadow:0 2px 20px rgba(255,255,255,.25);">${hh}:${mm}<span style="font-size:28px;font-weight:400;opacity:.55;margin-left:4px;">${ap}</span></div>
        <div style="font-size:18px;color:rgba(255,255,255,.55);margin-top:3px;">${dateStr}</div>
      </div><div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 0;font-size:12px;color:rgba(255,255,255,.6);margin-bottom:8px;">
      <div>${cond}</div>
      <div style="text-align:right;">${tempHi!=='--'?`⚡ <span style="color:#fff;font-weight:600;">${tempHi}°</span> / <span style="color:rgba(255,255,255,.6);">${tempLo}°C</span>`:''}</div>
      <div>${temp!==null?`🌡️ <span style="color:#fff;font-weight:600;">${temp}°C</span>`:''}${temp!==null&&humid!==null?' &nbsp;':''}${humid!==null?`💧 <span style="color:#fff;font-weight:600;">${humid}%</span>`:''}</div>
      <div style="text-align:right;">${uv!==null?`UV <span style="color:#fff;font-weight:600;">${uv}</span> &nbsp;`:''}${press!==null?`🌬️ <span style="color:#fff;font-weight:600;">${press} hPa</span>`:''}</div>
      ${rain?`<div style="color:rgba(255,255,255,.5);font-size:11px;grid-column:1/-1;">🌧️ <span style="color:rgba(255,220,100,.9);font-weight:600;">${rain}</span></div>`:''}
    </div>
    ${showTmr?`<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:7px 11px;font-size:11.5px;">
      <span style="color:rgba(255,255,255,.45);">${T.tomorrow}</span>
      <div style="transform:scale(0.55);transform-origin:center center;width:40px;height:25px;flex-shrink:0;position:relative;top:-18px;">${tmrHTML}</div>
      <span style="color:#fff;font-weight:600;">${tmrW}</span>
      ${tmrHi!=='--'?`<span style="margin-left:auto;color:#fff;font-weight:600;">${tmrHi}°</span><span style="color:rgba(255,255,255,.45);">/</span><span style="color:rgba(255,255,255,.65);">${tmrLo}°C</span>`:''}
    </div>`:''}
  </div>`:`
  <div style="padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
    <div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;">
      <div>${condHTML}</div>
      <div style="text-align:center;">
        <div style="font-size:80px;font-weight:800;line-height:1;letter-spacing:-3px;text-shadow:0 2px 20px rgba(255,255,255,.25);">${hh}:${mm}<span style="font-size:28px;font-weight:400;opacity:.55;margin-left:4px;">${ap}</span></div>
        <div style="font-size:16px;color:rgba(255,255,255,.55);margin-top:4px;">${dateStr}</div>
      </div>
      <div></div>
    </div>
  </div>`}

  <div style="padding:8px 0 10px;border-bottom:1px solid rgba(255,255,255,.10);">
    <div style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.55);margin-bottom:5px;padding:0 14px;">
      <span>🌅 <strong style="color:#fff;">${riseStr}</strong> ${T.sunrise}</span>
      <span><strong style="color:#fff;">${pct}%</strong> ${T.dayPct}</span>
      <span>${T.sunset} <strong style="color:#fff;">${setStr}</strong> 🌇</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:8px;padding:0 14px;">
      <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(255,200,70,.15);border:1px solid rgba(255,200,70,.35);color:rgba(255,225,110,.95);">☀️ ${T.daytime}: ${fmtDur(dayMin)}</div>
      <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(140,175,255,.12);border:1px solid rgba(140,175,255,.3);color:rgba(185,210,255,.9);">🌙 ${T.nighttime}: ${fmtDur(nightMin)}</div>
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
          <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(140,170,255,0)"/><stop offset="30%" stop-color="rgba(155,185,255,.35)"/><stop offset="50%" stop-color="rgba(200,215,255,.7)"/><stop offset="70%" stop-color="rgba(155,185,255,.35)"/><stop offset="100%" stop-color="rgba(140,170,255,0)"/></linearGradient>
          <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(55,125,225,.10)"/><stop offset="100%" stop-color="rgba(55,125,225,0)"/></linearGradient>
          <radialGradient id="dynAuraG" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="rgba(${r1},${g1},${b1},.30)"/><stop offset="55%" stop-color="rgba(${r2},${g2},${b2},.10)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
          ${fpDefs}
        </defs>
        <ellipse cx="173" cy="${100-Math.round(bell*25)}" rx="155" ry="105" fill="url(#dynAuraG)"/>
        <path d="M14,65 Q173,-45 332,65 Z" fill="url(#skyG)"/>
        <line x1="6" y1="65" x2="340" y2="65" stroke="rgba(255,255,255,.12)" stroke-width="1" stroke-dasharray="3,8"/>
        <circle cx="14" cy="65" r="3" fill="rgba(255,200,80,.65)"/>
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

  <div style="padding:16px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
      <span style="color:rgba(255,255,255,.6);">${T.battLabel}</span>
      <span style="font-weight:700;color:${bPct<=10?'#ef4444':bPct<=20?'#f59e0b':'#4ade80'}">${bPct}%</span>
    </div>
    <div style="height:7px;border-radius:4px;background:rgba(255,255,255,.10);overflow:hidden;margin-bottom:${battETA?'8px':'14px'}">
      <div style="height:100%;width:${bPct}%;border-radius:4px;background:${bColor};box-shadow:0 0 8px ${bGlow}"></div>
    </div>
    ${battETA?`<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.65);margin-bottom:14px;">${battETA}</div>`:''}

    <div style="overflow:hidden;white-space:nowrap;border-top:1px solid rgba(255,255,255,.10);border-bottom:1px solid rgba(255,255,255,.10);padding:7px 0;margin:0 0 14px;">
      <div style="display:inline-block;animation:scrollTicker 22s linear infinite;font-size:12px;font-weight:600;color:rgba(255,230,120,.95);text-shadow:0 1px 6px rgba(0,0,0,.5);">${ticker2}</div>
    </div>

    <div style="text-align:center;font-size:11px;font-weight:600;color:rgba(255,255,255,.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:8px;">${T.statsTitle}</div>

    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
      <div style="${cell}"><div style="${ico}">☀️</div><div style="${val}">${daily} kWh</div><div style="${lbl}">${T.solarStat}</div></div>
      <div style="${cell}"><div style="${ico}">🔌</div><div style="${val}">${gridDaily} kWh</div><div style="${lbl}">${T.gridStat}</div></div>
      <div style="${cell}"><div style="${ico}">🏠</div><div style="${val}">${combinedFmt} kWh</div><div style="${lbl}">${T.consumeStat}</div></div>
      <div style="${cell}"><div style="${ico}">💰</div><div style="${val}">${savFmt}${currency}</div><div style="${lbl}">${T.savingStat}</div></div>
      <div style="background:${isOff?'rgba(80,10,10,.45)':'rgba(255,255,255,.10)'};${isOff?'border:1.5px solid rgba(255,80,80,.8);box-shadow:0 0 8px rgba(255,80,80,.4)':'border:1px solid rgba(255,255,255,.15)'};border-radius:12px;padding:8px 6px;text-align:center;">
        <div style="font-size:9px;font-weight:700;color:rgba(100,210,255,.85);margin-bottom:4px;letter-spacing:.5px;white-space:nowrap;">${T.systemStat}</div>
        <div style="font-size:12px;font-weight:800;color:${stColor};margin-bottom:4px;">❤️ ${stLabel}</div>
        <div style="font-size:10px;color:rgba(255,200,80,.9);margin-bottom:2px;white-space:nowrap;">🌡️ ${invTemp}°C</div>
        <div style="font-size:10px;color:rgba(80,200,255,.9);white-space:nowrap;">🔋 ${batTemp}°C</div>
      </div>
    </div>
  </div>
</div>`;
  }
}

customElements.define('solar-weather-card',SolarWeatherCard);
window.customCards=window.customCards||[];
window.customCards.push({
  type:'solar-weather-card',
  name:'Solar Weather Card',
  description:'Solar + Battery + Weather — particle/wave/line flow, 5 languages (VI/EN/DE/IT/FR), custom pricing, node glow toggle',
  preview:false,
  documentationURL:'https://github.com/doanlong1412/solar-weather-card',
});


