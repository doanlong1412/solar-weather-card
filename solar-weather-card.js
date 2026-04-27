/**
 * v1.8.1
 * -------
 * [NEW] Show/Hide Clock & Weather  (`show_clock`)
 *       — Toggle the entire top section (clock, date, temperature,
 *         hourly strip, tomorrow forecast) from the Visual Editor.
 *         When hidden, the section is completely removed from the DOM.
 *
 * [NEW] Show/Hide Rooms / Devices  (`show_rooms_section`)
 *       — Toggle all room cards in the energy diagram SVG.
 *         Branch flow lines are unaffected; only the room node cards
 *         are hidden.
 *
 * [NEW] Show/Hide Battery Bar  (`show_battery_bar`)
 *       — Toggle the battery percentage bar, SOC label, and ETA text
 *         at the bottom of the card.
 *
 * [NEW] Show/Hide Stats Circles  (`show_stats_circles`)
 *       — Toggle the five SVG stat circles (Saving, Solar, Home,
 *         Grid, System) rendered below the energy diagram.
 *
 * [NEW] Show/Hide Battery Node  (`show_battery_node`)
 *       — Toggle the battery card node inside the energy diagram.
 *         When disabled the node is not rendered at all (foBAT = '').
 *
 * [NEW] Temperature Unit  (`temp_unit: C | F`)
 *       — Switch all temperature values on the card between °C and °F.
 *         Applies to: outdoor temperature, today Hi/Lo, tomorrow Hi/Lo,
 *         Inverter temperature and Battery temperature in the stat circles.
 *         Conversion formula: °F = °C × 9/5 + 32.
 *         Selector added in Visual Editor Display Options.
 *
 * v1.8.0
 *Rooms** — up to 4 configurable rooms/devices shown below the energy diagram, with custom name, icon, entity
 *YAML-style flow** — particle engine ported from YAML (stroke-dasharray animate, lighter & stable)
 *Flow styles** — Spark (YAML-style), Wave, Line
 *Room flow** — animated branch flows from Home node to each room
 *Removed Minimal mode** — animations always active (YAML parity)
 *Solar Forecast Chart** — actual hourly line + Solcast/formula forecast curve
 *Solcast integration** — reads detailed hourly forecast from [ha-solcast-solar](https://github.com/BJReplay/ha-solcast-solar) by **@BJReplay**
 *Formula sensor fallback** — forecast based on sun arc + cloud coverage when Solcast is unavailable
 *Hourly recording automation** — logs real solar output each hour into `input_text.solar_live_curve`
 *Bar chart** — Actual / Forecast Today / Forecast Tomorrow kWh bars left of Home node
 *Chart visibility toggle** — `show_forecast_chart` in the Visual Editor
 *Hourly forecast strip** — `show_hourly_forecast` toggle; strip always visible when show_tomorrow is off
 *Solar design capacity** (`solar_design_wp`) — enter your system's Wp so the chart Y-axis scales accurately
 *Minimal mode** — `minimal_mode` kills all animations (node float, glow pulse, particles→dashes, sun pulse, scroll ticker)
 *Background gradient presets** — 7 built-in presets + custom CSS gradient input
 *Node Y-axis controls** — `node_inv_y` and `node_hom_y` sliders in Node Layout
 *Color Theme** — customise node borders, flow/particle colours, chart line colours, and primary text colour; one-click Reset
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
    solarProduced:'Solar', solarUsed:'Nhà dùng',
    forecastToday:'☀️ Dự báo hôm nay', forecastTmr:'☀️ Dự báo ngày mai',
    actualToday:'☀️ Thực tế hôm nay', peakForecast:'Dự báo', actualNow:'Thực tế',
    condMap:{'sunny':'☀️ Nắng','clear-night':'🌙 Trời quang','partlycloudy':'⛅ Ít mây','cloudy':'☁️ Nhiều mây','rainy':'🌧️ Có mưa','pouring':'⛈️ Mưa to','lightning':'⚡ Dông sét','fog':'🌫️ Sương mù','windy':'💨 Có gió'},
    days:['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'],
    months:['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); const ku=parseFloat(dailyuse); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Hôm nay trời mưa, sản lượng solar không tốt${kw>0?' — sản xuất '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Thời tiết xấu, hệ thống solar tạm dừng bảo vệ thiết bị.';
      else if(ws==='cloudy') msg=`☁️ Trời nhiều mây, solar cầm chừng${kw>0?' — sản xuất '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Ít mây, solar khá tốt — sản xuất ${daily} kWh, nhà dùng ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Nắng đẹp, solar xuất sắc — sản xuất ${daily} kWh, nhà dùng ${dailyuse} kWh!`; else if(kw>8) msg=`☀️ Trời nắng tốt, solar sản xuất ${daily} kWh, nhà dùng ${dailyuse} kWh.`; else msg=`☀️ Trời nắng nhưng sản lượng còn thấp — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Sương mù dày, ánh sáng yếu — solar kém hiệu quả.';
      else if(ws==='windy') msg=`💨 Trời có gió, solar bình thường — sản xuất ${daily} kWh.`;
      else msg=`🌤️ Solar sản xuất ${daily} kWh, nhà dùng ${dailyuse} kWh — tiết kiệm ${savFmt}${cur}.`;
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
    solarProduced:'Solar', solarUsed:'Home Used',
    forecastToday:'☀️ Forecast today', forecastTmr:'☀️ Forecast tomorrow',
    actualToday:'☀️ Actual today', peakForecast:'Forecast', actualNow:'Actual',
    condMap:{'sunny':'☀️ Sunny','clear-night':'🌙 Clear Night','partlycloudy':'⛅ Partly Cloudy','cloudy':'☁️ Cloudy','rainy':'🌧️ Rainy','pouring':'⛈️ Pouring','lightning':'⚡ Thunder','fog':'🌫️ Foggy','windy':'💨 Windy'},
    days:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Rainy day, solar limited${kw>0?' — produced '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Bad weather, solar paused for protection.';
      else if(ws==='cloudy') msg=`☁️ Cloudy, solar at reduced output${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Partly cloudy — produced ${daily} kWh, home used ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Great sunshine — produced ${daily} kWh, home used ${dailyuse} kWh!`; else if(kw>8) msg=`☀️ Good sunshine — produced ${daily} kWh, home used ${dailyuse} kWh.`; else msg=`☀️ Sunny but output still low — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Dense fog, poor solar performance.';
      else if(ws==='windy') msg=`💨 Windy, solar normal — produced ${daily} kWh.`;
      else msg=`🌤️ Solar produced ${daily} kWh, home used ${dailyuse} kWh — saved ${savFmt}${cur}.`;
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
    solarProduced:'Solar', solarUsed:'Haus Verbrauch',
    forecastToday:'☀️ Prognose heute', forecastTmr:'☀️ Prognose morgen',
    actualToday:'☀️ Erzeugt heute', peakForecast:'Prognose', actualNow:'Aktuell',
    condMap:{'sunny':'☀️ Sonnig','clear-night':'🌙 Klare Nacht','partlycloudy':'⛅ Bewölkt','cloudy':'☁️ Bedeckt','rainy':'🌧️ Regen','pouring':'⛈️ Starkregen','lightning':'⚡ Gewitter','fog':'🌫️ Nebel','windy':'💨 Windig'},
    days:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
    months:['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Regnerischer Tag, Solarertrag begrenzt${kw>0?' — '+daily+' kWh erzeugt':''}.`;
      else if(ws==='lightning') msg='⛈️ Schlechtes Wetter, Solar pausiert.';
      else if(ws==='cloudy') msg=`☁️ Bewölkt, Solar gedrosselt${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Teilweise bewölkt — erzeugt ${daily} kWh, Haus verbrauchte ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Sonnenschein — erzeugt ${daily} kWh, Haus ${dailyuse} kWh!`; else msg=`☀️ Gutes Wetter — ${daily} kWh erzeugt, Haus ${dailyuse} kWh.`; }
      else msg=`🌤️ Solar erzeugte ${daily} kWh, Haus ${dailyuse} kWh — Ersparnis ${savFmt}${cur}.`;
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
    solarProduced:'Solare.', solarUsed:'Casa Usato',
    forecastToday:'☀️ Previsione oggi', forecastTmr:'☀️ Previsione domani',
    actualToday:'☀️ Reale oggi', peakForecast:'Previsione', actualNow:'Reale',
    condMap:{'sunny':'☀️ Soleggiato','clear-night':'🌙 Sereno','partlycloudy':'⛅ Nuvoloso','cloudy':'☁️ Coperto','rainy':'🌧️ Pioggia','pouring':'⛈️ Acquazzone','lightning':'⚡ Temporale','fog':'🌫️ Nebbia','windy':'💨 Vento'},
    days:['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'],
    months:['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Giornata piovosa, solare limitato${kw>0?' — '+daily+' kWh prodotti':''}.`;
      else if(ws==='lightning') msg='⛈️ Brutto tempo, solare in pausa.';
      else if(ws==='cloudy') msg=`☁️ Nuvoloso, solare ridotto${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Parzialmente nuvoloso — prodotti ${daily} kWh, casa usata ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Bella giornata — prodotti ${daily} kWh, casa ${dailyuse} kWh!`; else msg=`☀️ Giornata di sole — ${daily} kWh prodotti, casa ${dailyuse} kWh.`; }
      else msg=`🌤️ Solare ha prodotto ${daily} kWh, casa ${dailyuse} kWh — risparmio ${savFmt}${cur}.`;
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
    solarProduced:'Solaire.', solarUsed:'Maison Utilisé',
    forecastToday:"☀️ Prévision aujourd'hui", forecastTmr:'☀️ Prévision demain',
    actualToday:"☀️ Réel aujourd'hui", peakForecast:'Prévision', actualNow:'Réel',
    condMap:{'sunny':'☀️ Ensoleillé','clear-night':'🌙 Nuit claire','partlycloudy':'⛅ Peu nuageux','cloudy':'☁️ Nuageux','rainy':'🌧️ Pluie','pouring':'⛈️ Forte pluie','lightning':'⚡ Orage','fog':'🌫️ Brouillard','windy':'💨 Venteux'},
    days:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    months:['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Journée pluvieuse, production solaire limitée${kw>0?' — '+daily+' kWh produits':''}.`;
      else if(ws==='lightning') msg='⛈️ Mauvais temps, solaire en pause.';
      else if(ws==='cloudy') msg=`☁️ Nuageux, production réduite${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Partiellement nuageux — produit ${daily} kWh, maison utilisé ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Belle journée — produit ${daily} kWh, maison ${dailyuse} kWh !`; else msg=`☀️ Journée ensoleillée — ${daily} kWh produits, maison ${dailyuse} kWh.`; }
      else msg=`🌤️ Solaire a produit ${daily} kWh, maison ${dailyuse} kWh — économie ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Batterie pleine !';
      else if(isCharge&&battSoc>80) msg+=` 🔋 En charge, presque pleine (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Batterie faible (${bPct}%) !`;
      return msg;
    }
  },
  nl: {
    tomorrow:'Morgen', sunrise:'Opkomst', sunset:'Ondergang', dayPct:'van de dag',
    daytime:'Overdag', nighttime:'Nacht',
    charging:'🔋⚡ Opladen', discharging:'🔋🔁 Ontladen', standby:'⏳ Stand-by',
    exportGrid:'Teruglevering', importGrid:'Netwerk',
    homeConsume:'Verbruik', battLabel:'🔋 Accu',
    etaFull:'⚡ Geschatte voltijd: ', etaLeft:'🔁 Resterende tijd: ',
    slowCharge:'⚡ Laadt zeer langzaam', slowDisch:'🔁 Ontlaadt zeer langzaam',
    solarStat:'Solar', gridStat:'Van net', consumeStat:'Verbruik',
    savingStat:'Besparing', systemStat:'⚙️ SYSTEEM', statsTitle:'Statistieken vandaag',
    solarProduced:'Solar', solarUsed:'Thuis gebruikt',
    forecastToday:'☀️ Prognose vandaag', forecastTmr:'☀️ Prognose morgen',
    actualToday:'☀️ Werkelijk vandaag', peakForecast:'Prognose', actualNow:'Werkelijk',
    condMap:{'sunny':'☀️ Zonnig','clear-night':'🌙 Heldere nacht','partlycloudy':'⛅ Gedeeltelijk bewolkt','cloudy':'☁️ Bewolkt','rainy':'🌧️ Regenachtig','pouring':'⛈️ Zware regen','lightning':'⚡ Onweer','fog':'🌫️ Mistig','windy':'💨 Winderig'},
    days:['Zondag','Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag'],
    months:['Jan','Feb','Mrt','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Dec'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Regenachtige dag, solar beperkt${kw>0?' — geproduceerd '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Slecht weer, solar gepauzeerd.';
      else if(ws==='cloudy') msg=`☁️ Bewolkt, solar verminderd${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Gedeeltelijk bewolkt — geproduceerd ${daily} kWh, thuis gebruikt ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Prachtige dag — geproduceerd ${daily} kWh, thuis ${dailyuse} kWh!`; else msg=`☀️ Zonnige dag — ${daily} kWh geproduceerd, thuis ${dailyuse} kWh.`; }
      else if(ws==='fog') msg='🌫️ Dichte mist, slechte zonneprestaties.';
      else if(ws==='windy') msg=`💨 Winderig, solar normaal — geproduceerd ${daily} kWh.`;
      else msg=`🌤️ Solar produceerde ${daily} kWh, thuis ${dailyuse} kWh — bespaard ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Accu vol!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Oplaadend, bijna vol (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Accu laag (${bPct}%)!`;
      return msg;
    }
  },
  pl: {
    tomorrow:'Jutro', sunrise:'Wschód', sunset:'Zachód', dayPct:'dnia',
    daytime:'Dzień', nighttime:'Noc',
    charging:'🔋⚡ Ładowanie', discharging:'🔋🔁 Rozładowanie', standby:'⏳ Czuwanie',
    exportGrid:'Eksport', importGrid:'Sieć',
    homeConsume:'Zużycie', battLabel:'🔋 Bateria',
    etaFull:'⚡ Szacowany czas do pełna: ', etaLeft:'🔁 Pozostały czas: ',
    slowCharge:'⚡ Ładuje się bardzo wolno', slowDisch:'🔁 Rozładowuje się bardzo wolno',
    solarStat:'Solar', gridStat:'Z sieci', consumeStat:'Zużycie',
    savingStat:'Oszczędności', systemStat:'⚙️ SYSTEM', statsTitle:'Statystyki dzisiaj',
    solarProduced:'Solar', solarUsed:'Zużyto w domu',
    forecastToday:'☀️ Prognoza dzisiaj', forecastTmr:'☀️ Prognoza jutro',
    actualToday:'☀️ Rzeczywiste dzisiaj', peakForecast:'Prognoza', actualNow:'Rzeczywiste',
    condMap:{'sunny':'☀️ Słonecznie','clear-night':'🌙 Bezchmurna noc','partlycloudy':'⛅ Częściowo zachmurzony','cloudy':'☁️ Zachmurzony','rainy':'🌧️ Deszczowo','pouring':'⛈️ Ulewny deszcz','lightning':'⚡ Burza','fog':'🌫️ Mgła','windy':'💨 Wietrzno'},
    days:['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
    months:['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Deszczowy dzień, solar ograniczony${kw>0?' — wyprodukowano '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Zła pogoda, solar wstrzymany.';
      else if(ws==='cloudy') msg=`☁️ Zachmurzenie, solar zmniejszony${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Częściowe zachmurzenie — wyprodukowano ${daily} kWh, dom zużył ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Piękny dzień — wyprodukowano ${daily} kWh, dom ${dailyuse} kWh!`; else msg=`☀️ Słoneczny dzień — ${daily} kWh, dom ${dailyuse} kWh.`; }
      else if(ws==='fog') msg='🌫️ Gęsta mgła, słaba wydajność solarna.';
      else if(ws==='windy') msg=`💨 Wietrzno, solar normalny — wyprodukowano ${daily} kWh.`;
      else msg=`🌤️ Solar wyprodukował ${daily} kWh, dom ${dailyuse} kWh — zaoszczędzono ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Bateria pełna!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Ładowanie, prawie pełna (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Bateria niska (${bPct}%)!`;
      return msg;
    }
  },
  sv: {
    tomorrow:'Imorgon', sunrise:'Soluppgång', sunset:'Solnedgång', dayPct:'av dagen',
    daytime:'Dagtid', nighttime:'Nattid',
    charging:'🔋⚡ Laddar', discharging:'🔋🔁 Urladdning', standby:'⏳ Standby',
    exportGrid:'Export', importGrid:'Elnät',
    homeConsume:'Förbrukning', battLabel:'🔋 Batteri',
    etaFull:'⚡ Uppskattad full om: ', etaLeft:'🔁 Återstående tid: ',
    slowCharge:'⚡ Laddar mycket långsamt', slowDisch:'🔁 Urladdning mycket långsam',
    solarStat:'Solar', gridStat:'Från nät', consumeStat:'Förbrukning',
    savingStat:'Besparing', systemStat:'⚙️ SYSTEM', statsTitle:'Statistik idag',
    solarProduced:'Solar', solarUsed:'Hem använt',
    forecastToday:'☀️ Prognos idag', forecastTmr:'☀️ Prognos imorgon',
    actualToday:'☀️ Faktisk idag', peakForecast:'Prognos', actualNow:'Faktisk',
    condMap:{'sunny':'☀️ Soligt','clear-night':'🌙 Klar natt','partlycloudy':'⛅ Delvis molnigt','cloudy':'☁️ Molnigt','rainy':'🌧️ Regnigt','pouring':'⛈️ Häftigt regn','lightning':'⚡ Åska','fog':'🌫️ Dimmigt','windy':'💨 Blåsigt'},
    days:['Söndag','Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag'],
    months:['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Regnig dag, solar begränsad${kw>0?' — producerade '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Dåligt väder, solar pausad.';
      else if(ws==='cloudy') msg=`☁️ Molnigt, solar reducerad${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Delvis molnigt — producerade ${daily} kWh, hem använde ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Fantastisk dag — producerade ${daily} kWh, hem ${dailyuse} kWh!`; else msg=`☀️ Solig dag — ${daily} kWh producerade, hem ${dailyuse} kWh.`; }
      else if(ws==='fog') msg='🌫️ Tät dimma, dålig solandeprestanda.';
      else if(ws==='windy') msg=`💨 Blåsigt, solar normal — producerade ${daily} kWh.`;
      else msg=`🌤️ Solar producerade ${daily} kWh, hem ${dailyuse} kWh — sparade ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Batteri fullt!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Laddar, nästan fullt (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Batteri lågt (${bPct}%)!`;
      return msg;
    }
  },
  hu: {
    tomorrow:'Holnap', sunrise:'Napkelte', sunset:'Napnyugta', dayPct:'a napból',
    daytime:'Nappal', nighttime:'Éjszaka',
    charging:'🔋⚡ Töltés', discharging:'🔋🔁 Merülés', standby:'⏳ Készenléti',
    exportGrid:'Export', importGrid:'Hálózat',
    homeConsume:'Fogyasztás', battLabel:'🔋 Akkumulátor',
    etaFull:'⚡ Becsült teli idő: ', etaLeft:'🔁 Maradék idő: ',
    slowCharge:'⚡ Nagyon lassan tölt', slowDisch:'🔁 Nagyon lassan merül',
    solarStat:'Napelem', gridStat:'Hálózatból', consumeStat:'Fogyasztás',
    savingStat:'Megtakarítás', systemStat:'⚙️ RENDSZER', statsTitle:'Mai statisztikák',
    solarProduced:'Napelem', solarUsed:'Otthon használt',
    forecastToday:'☀️ Előrejelzés ma', forecastTmr:'☀️ Előrejelzés holnap',
    actualToday:'☀️ Tényleges ma', peakForecast:'Előrejelzés', actualNow:'Tényleges',
    condMap:{'sunny':'☀️ Napos','clear-night':'🌙 Tiszta éjszaka','partlycloudy':'⛅ Részben felhős','cloudy':'☁️ Felhős','rainy':'🌧️ Esős','pouring':'⛈️ Zápor','lightning':'⚡ Vihar','fog':'🌫️ Ködös','windy':'💨 Szeles'},
    days:['Vasárnap','Hétfő','Kedd','Szerda','Csütörtök','Péntek','Szombat'],
    months:['Jan','Feb','Már','Ápr','Máj','Jún','Júl','Aug','Szep','Okt','Nov','Dec'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Esős nap, napelem korlátozott${kw>0?' — termelt '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Rossz idő, napelem szünetel.';
      else if(ws==='cloudy') msg=`☁️ Felhős, napelem csökkentett${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Részben felhős — termelt ${daily} kWh, otthon felhasznált ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Gyönyörű nap — termelt ${daily} kWh, otthon ${dailyuse} kWh!`; else msg=`☀️ Napos nap — ${daily} kWh termelt, otthon ${dailyuse} kWh.`; }
      else if(ws==='fog') msg='🌫️ Sűrű köd, gyenge napelemi teljesítmény.';
      else if(ws==='windy') msg=`💨 Szeles, napelem normális — termelt ${daily} kWh.`;
      else msg=`🌤️ Napelem termelt ${daily} kWh, otthon ${dailyuse} kWh — megtakarítva ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Akkumulátor tele!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Töltés, majdnem tele (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Akkumulátor alacsony (${bPct}%)!`;
      return msg;
    }
  },
  cs: {
    tomorrow:'Zítra', sunrise:'Východ', sunset:'Západ', dayPct:'dne',
    daytime:'Den', nighttime:'Noc',
    charging:'🔋⚡ Nabíjení', discharging:'🔋🔁 Vybíjení', standby:'⏳ Pohotovost',
    exportGrid:'Přebytky', importGrid:'Síť',
    homeConsume:'Spotřeba', battLabel:'🔋 Baterie',
    etaFull:'⚡ Odhadovaný čas do plna: ', etaLeft:'🔁 Zbývající čas: ',
    slowCharge:'⚡ Nabíjí se velmi pomalu', slowDisch:'🔁 Vybíjí se velmi pomalu',
    solarStat:'Solár', gridStat:'Ze sítě', consumeStat:'Spotřeba',
    savingStat:'Úspora', systemStat:'⚙️ SYSTÉM', statsTitle:'Dnešní statistiky',
    solarProduced:'Solár', solarUsed:'Spotřeba domu',
    forecastToday:'☀️ Předpověď dnes', forecastTmr:'☀️ Předpověď zítra',
    actualToday:'☀️ Skutečnost dnes', peakForecast:'Předpověď', actualNow:'Skutečnost',
    condMap:{'sunny':'☀️ Slunečno','clear-night':'🌙 Jasná noc','partlycloudy':'⛅ Polojasno','cloudy':'☁️ Zataženo','rainy':'🌧️ Déšť','pouring':'⛈️ Přívalový déšť','lightning':'⚡ Bouřka','fog':'🌫️ Mlha','windy':'💨 Větrno'},
    days:['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'],
    months:['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Deštivý den, solární výroba omezena${kw>0?' — vyrobeno '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Špatné počasí, solár pozastaven.';
      else if(ws==='cloudy') msg=`☁️ Zataženo, solár snížen${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Polojasno — vyrobeno ${daily} kWh, dům spotřeboval ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Skvělý den — vyrobeno ${daily} kWh, dům ${dailyuse} kWh!`; else if(kw>8) msg=`☀️ Slunečný den — vyrobeno ${daily} kWh, dům ${dailyuse} kWh.`; else msg=`☀️ Slunečno, ale výroba zatím nízká — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Hustá mlha, slabý solární výkon.';
      else if(ws==='windy') msg=`💨 Větrno, solár normální — vyrobeno ${daily} kWh.`;
      else msg=`🌤️ Solár vyrobil ${daily} kWh, dům spotřeboval ${dailyuse} kWh — úspora ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Baterie plná!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Nabíjí se, téměř plná (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Baterie nízká (${bPct}%)!`;
      return msg;
    }
  },
  sl: {
    tomorrow:'Jutri', sunrise:'Vzhod', sunset:'Zahod', dayPct:'dneva',
    daytime:'Podnevi', nighttime:'Ponoči',
    charging:'🔋⚡ Polnjenje', discharging:'🔋🔁 Praznjenje', standby:'⏳ Pripravljenost',
    exportGrid:'Izvoz', importGrid:'Omrežje',
    homeConsume:'Poraba', battLabel:'🔋 Baterija',
    etaFull:'⚡ Predvideni čas do polne: ', etaLeft:'🔁 Preostali čas: ',
    slowCharge:'⚡ Polnjenje zelo počasi', slowDisch:'🔁 Praznjenje zelo počasi',
    solarStat:'Solarno', gridStat:'Iz omrežja', consumeStat:'Poraba',
    savingStat:'Prihranek', systemStat:'⚙️ SISTEM', statsTitle:'Današnja statistika',
    solarProduced:'Solarno', solarUsed:'Poraba doma',
    forecastToday:'☀️ Napoved danes', forecastTmr:'☀️ Napoved jutri',
    actualToday:'☀️ Dejansko danes', peakForecast:'Napoved', actualNow:'Dejansko',
    condMap:{'sunny':'☀️ Sončno','clear-night':'🌙 Jasna noč','partlycloudy':'⛅ Delno oblačno','cloudy':'☁️ Oblačno','rainy':'🌧️ Dežuje','pouring':'⛈️ Močan dež','lightning':'⚡ Nevihta','fog':'🌫️ Megla','windy':'💨 Vetrovno'},
    days:['Nedelja','Ponedeljek','Torek','Sreda','Četrtek','Petek','Sobota'],
    months:['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Avg','Sep','Okt','Nov','Dec'],
    ticker(ws,daily,dailyuse,savFmt,cur,bPct,isCharge,isDisch,battSoc){
      const kw=parseFloat(daily); let msg='';
      if(ws==='rainy'||ws==='pouring') msg=`🌧️ Deževni dan, solarni izkoristek omejen${kw>0?' — proizvedeno '+daily+' kWh':''}.`;
      else if(ws==='lightning') msg='⛈️ Slabo vreme, solarni sistem zaustavljen.';
      else if(ws==='cloudy') msg=`☁️ Oblačno, solarni izkoristek zmanjšan${kw>0?' — '+daily+' kWh':''}.`;
      else if(ws==='partlycloudy') msg=`⛅ Delno oblačno — proizvedeno ${daily} kWh, hiša porabila ${dailyuse} kWh.`;
      else if(ws==='sunny'){ if(kw>15) msg=`☀️ Odličen sončen dan — proizvedeno ${daily} kWh, hiša ${dailyuse} kWh!`; else if(kw>8) msg=`☀️ Sončno — proizvedeno ${daily} kWh, hiša ${dailyuse} kWh.`; else msg=`☀️ Sončno, a proizvodnja še nizka — ${daily} kWh.`; }
      else if(ws==='fog') msg='🌫️ Gosta megla, slab solarni izkoristek.';
      else if(ws==='windy') msg=`💨 Vetrovno, solar deluje normalno — ${daily} kWh.`;
      else msg=`🌤️ Solar je proizvedel ${daily} kWh, hiša porabila ${dailyuse} kWh — prihranek ${savFmt}${cur}.`;
      if(battSoc===100) msg+=' ✅ Baterija polna!';
      else if(isCharge&&battSoc>80) msg+=` 🔋 Polnjenje, skoraj polna (${bPct}%).`;
      else if(isDisch&&battSoc<20) msg+=` ⚠️ Baterija nizka (${bPct}%)!`;
      return msg;
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// WEATHER ICONS
// ═══════════════════════════════════════════════════════════════
const _WEATHER_ICON_CSS=`
  .wi{width:70px;height:70px;position:relative;display:flex;align-items:center;justify-content:center}
  .sn-c{width:26px;height:26px;background:#FFE135;border-radius:50%;box-shadow:0 0 14px 5px rgba(255,220,60,.55);position:relative;z-index:1}
  .sn-r{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
  .sn-ray{position:absolute;width:4px;height:11px;background:linear-gradient(to bottom,rgba(255,235,80,.9),rgba(255,220,60,.1));border-radius:2px;transform-origin:50% 50%;margin-left:-2px}
  .mn{width:30px;height:30px;background:#C8D8F8;border-radius:50%;box-shadow:-7px 2px 0 0 rgba(0,20,50,.92),0 0 16px 5px rgba(160,195,255,.4)}
  .mst{position:absolute;background:rgba(255,255,255,.9);border-radius:50%;opacity:.7}
  .cl{border-radius:10px;position:absolute;bottom:12px;left:10px}
  .cl::before{content:'';position:absolute;width:24px;height:24px;border-radius:50%;top:-12px;left:8px}
  .cl::after{content:'';position:absolute;width:18px;height:18px;border-radius:50%;top:-8px;left:22px}
  .cl-w{width:44px;height:20px;background:rgba(200,215,235,.88)}.cl-w::before,.cl-w::after{background:rgba(210,225,245,.9)}
  .cl-g{width:44px;height:20px;background:rgba(150,170,200,.88)}.cl-g::before,.cl-g::after{background:rgba(155,175,205,.88)}
  .cl-dk{width:46px;height:20px;background:rgba(100,120,155,.9)}.cl-dk::before,.cl-dk::after{background:rgba(105,125,160,.9)}
  .cl-abs{position:absolute;bottom:auto;left:50%;transform:translateX(-50%)}
  .pc-sn{position:absolute;top:8px;right:6px;width:22px;height:22px;background:#FFE135;border-radius:50%;box-shadow:0 0 9px rgba(255,215,50,.55)}
  .dp{width:2.5px;border-radius:2px;background:rgba(140,190,255,.9);opacity:.75}
  .dps{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);display:flex;gap:6px}
  .bl-w{position:absolute;bottom:5px;left:50%;transform:translateX(-50%)}
  .fg-l{height:6px;border-radius:3px;background:rgba(200,210,225,.65)}
  .fg-w{display:flex;flex-direction:column;gap:8px}
  .wd-l{height:5px;border-radius:3px;background:rgba(180,210,250,.75)}
`;
function _ensureWeatherCSS(root){
  if(!root||root.querySelector('#wi-css')) return;
  const s=document.createElement('style');
  s.id='wi-css';
  s.textContent=_WEATHER_ICON_CSS;
  root.appendChild(s);
}
function makeWeatherIcon(ws){
  // Return only the HTML div — CSS is injected once separately via _ensureWeatherCSS()
  const rays=Array.from({length:8},(_,i)=>`<div class="sn-ray" style="transform:rotate(${i*45}deg) translateY(-21px)"></div>`).join('');
  const sun=`<div class="wi"><div class="sn-r">${rays}</div><div class="sn-c"></div></div>`;
  if(ws==='sunny') return sun;
  if(ws==='clear-night') return `<div class="wi"><div class="mn"></div><div class="mst" style="width:4px;height:4px;top:10px;right:8px"></div><div class="mst" style="width:3px;height:3px;top:18px;right:18px"></div><div class="mst" style="width:2px;height:2px;top:11px;right:22px"></div></div>`;
  if(ws==='partlycloudy') return `<div class="wi"><div class="pc-sn"></div><div class="cl cl-w" style="width:40px;height:18px;bottom:10px;left:4px"></div></div>`;
  if(ws==='cloudy') return `<div class="wi"><div class="cl cl-w"></div></div>`;
  if(ws==='rainy'){const d=[{h:'10px'},{h:'12px'},{h:'9px'},{h:'11px'},{h:'10px'}].map(a=>`<div class="dp" style="height:${a.h}"></div>`).join('');return `<div class="wi"><div class="cl cl-g cl-abs" style="top:8px;width:44px;height:20px"></div><div class="dps">${d}</div></div>`;}
  if(ws==='pouring'){const d=[{h:'14px'},{h:'12px'},{h:'15px'},{h:'13px'},{h:'14px'},{h:'11px'}].map(a=>`<div class="dp" style="height:${a.h};width:3px"></div>`).join('');return `<div class="wi"><div class="cl cl-dk cl-abs" style="top:5px;width:46px;height:20px"></div><div class="dps" style="gap:4px;bottom:2px">${d}</div></div>`;}
  if(ws==='lightning') return `<div class="wi"><div class="cl cl-dk cl-abs" style="top:4px;width:46px;height:20px"></div><div class="bl-w"><svg width="16" height="22" viewBox="0 0 16 22"><polygon points="9,0 1,13 7,13 5,22 15,9 9,9" fill="#FFE040" stroke="rgba(255,235,80,.5)" stroke-width="1"/></svg></div></div>`;
  if(ws==='fog') return `<div class="wi"><div class="fg-w"><div class="fg-l" style="width:50px"></div><div class="fg-l" style="width:36px;margin-left:8px"></div><div class="fg-l" style="width:44px"></div></div></div>`;
  if(ws==='windy') return `<div class="wi"><div style="display:flex;flex-direction:column;gap:9px"><div class="wd-l" style="width:50px"></div><div class="wd-l" style="width:38px"></div><div class="wd-l" style="width:46px"></div></div></div>`;
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
    this._open={display:true,weather:false,solar:false,battery:false,grid:false,stats:false,rooms:false,pricing:false,layout:false,color:false};
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
        {k:'hourly_forecast_entity',   l:'🕐 Hourly forecast sensor (e.g. sensor.tomorrow_raw_hourly)', r:false, domain:'sensor'},
      ]
    },
    {
      id:'solar', label:'⚡ Solar',
      fields:[
        {k:'solar_pv1_entity',         l:'⚡ Solar Array 1 power (W)',          r:true,  domain:'sensor'},
        {k:'solar_pv2_entity',         l:'⚡ Solar Array 2 power (W)',          r:false, domain:'sensor'},
        {k:'solar_pv1_voltage_entity', l:'⚡ Solar Array 1 voltage (V)',        r:false, domain:'sensor'},
        {k:'solar_pv2_voltage_entity', l:'⚡ Solar Array 2 voltage (V)',        r:false, domain:'sensor'},
        {k:'solar_today_entity',       l:'📊 Solar produced today (kWh)',       r:false, domain:'sensor'},
        {k:'solar_dailyuse_entity',    l:'🏠 Solar used by home today (kWh)',   r:false, domain:'sensor'},
        {k:'solar_live_entity',        l:'⚡ Solar live total power (W)',       r:false, domain:'sensor'},
        {k:'solar_live_curve_entity',  l:'📈 Solar live curve (input_text)',    r:false, domain:'sensor'},
        {k:'solcast_today_entity',     l:'☀️ Solcast forecast today (kWh)',     r:false, domain:'sensor'},
        {k:'solcast_tomorrow_entity',  l:'☀️ Solcast forecast tomorrow (kWh)',  r:false, domain:'sensor'},
        {k:'solcast_detail_entity',    l:'📊 Solcast detailed forecast sensor', r:false, domain:'sensor'},
      ]
    },
    {
      id:'battery', label:'🔋 Battery',
      fields:[
        {k:'battery_soc_entity',       l:'🔋 Battery SOC (%)',               r:true,  domain:'sensor'},
        {k:'battery_flow_entity',      l:'🔋 Battery flow (W, +charge/-discharge)', r:false, domain:'sensor'},
        {k:'battery_charge_entity',    l:'🔋 Battery charge sensor (W)',     r:false, domain:'sensor'},
        {k:'battery_discharge_entity', l:'🔋 Battery discharge sensor (W)',  r:false, domain:'sensor'},
        {k:'battery_voltage_entity',   l:'🔋 Battery voltage (V DC)',        r:false, domain:'sensor'},
        {k:'battery_capacity_entity',  l:'🔋 Capacity sensor (Ah)',          r:false, domain:'sensor'},
        {k:'battery_capacity_wh',      l:'🔋 Capacity manual (Wh) — e.g. 26880', r:false, domain:null},
        {k:'battery_temp_entity',      l:'🌡️ BMS temperature (°C)',          r:false, domain:'sensor'},
      ]
    },
    {
      id:'grid', label:'🔌 Grid & Home',
      fields:[
        {k:'grid_flow_entity',         l:'🔌 Grid flow (W, +export/-import)', r:false, domain:'sensor'},
        {k:'grid_import_entity',       l:'🔌 Grid import sensor (W)',         r:false, domain:'sensor'},
        {k:'grid_export_entity',       l:'🔌 Grid export sensor (W)',         r:false, domain:'sensor'},
        {k:'grid_voltage_entity',      l:'🔌 Grid voltage (V AC)',            r:false, domain:'sensor'},
        {k:'grid_today_entity',        l:'🔌 Grid import today (kWh)',        r:false, domain:'sensor'},
        {k:'grid_export_today_entity', l:'⚡ Grid export today / Bán điện (kWh)', r:false, domain:'sensor'},
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
        {k:'battery_temp_entity',      l:'🌡️ BMS temperature (°C)',           r:false, domain:'sensor'},
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
        const ri=p.dataset.ri!==undefined?parseInt(p.dataset.ri):-1;
        if(ri>=0){
          const rooms=this._config.rooms||[];
          const saved=(rooms[ri]&&rooms[ri].entity)||'';
          p.value=saved; p.setAttribute('value',saved);
          return;
        }
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
    const filled=sec.fields.filter(f=>this._config[f.k]).length;
    const total=sec.fields.length;
    const badge=filled>0?`<span style="background:var(--primary-color);color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;font-weight:700;margin-left:8px;">${filled}/${total}</span>`:'';
    const L=this._L||{solarPowerUnit:'☀️ Solar power unit',solarDesignCap:'⚡ Solar design capacity (Wp) — chart Y-axis max',solarDesignHint:'Total design capacity (Wpv). Blank = auto 8000W.',sensorMode:'Sensor mode',invertDir:'🔄 Invert direction (Deye/Growatt)',gridPowerUnit:'Grid power unit',homePowerUnit:'Home power unit',battPowerUnit:'Power unit',gridOptions:'🔌 GRID OPTIONS',homeOptions:'🏠 HOME OPTIONS'};

    // Options block ở đầu body cho Battery và Grid
    let optionsHTML = '';
    if(sec.id==='solar'){
      const solarUnit = this._config.solar_unit||'auto';
      const homeUnit  = this._config.home_unit||'auto';
      const solarDesignWp = this._config.solar_design_wp||'';
      optionsHTML = `<div class="sec-opts">
        <div class="opt-row" style="margin-bottom:8px">
          <label style="font-size:12px;font-weight:600">${L.solarPowerUnit}</label>
          <div class="bg">
            <div class="ob ${solarUnit==='auto'?'on':''}" data-t="solar_unit" data-v="auto">Auto</div>
            <div class="ob ${solarUnit==='W'?'on':''}"    data-t="solar_unit" data-v="W">W</div>
            <div class="ob ${solarUnit==='kW'?'on':''}"   data-t="solar_unit" data-v="kW">kW</div>
          </div>
        </div>
        <div class="opt-row" style="margin-bottom:4px">
          <label style="font-size:12px;font-weight:600">${L.solarDesignCap}</label>
          <input type="number" id="solarDesignWpInput" placeholder="e.g. 8000" min="100" max="100000" step="100" value="${solarDesignWp}" style="background:var(--input-fill-color,rgba(0,0,0,.04));border:1px solid var(--divider-color,#e0e0e0);border-radius:8px;padding:8px 12px;font-size:13px;color:var(--primary-text-color);font-family:monospace;width:100%"/>
          <div style="font-size:11px;color:var(--secondary-text-color);margin-top:4px;">${L.solarDesignHint}</div>
        </div>
      </div>`;
    }
    if(sec.id==='grid'){
      const gridMode = this._config.grid_mode||'single';
      const gridInv  = this._config.grid_invert||false;
      const gridUnit = this._config.grid_unit||'auto';
      const homeUnit = this._config.home_unit||'auto';
      optionsHTML = `<div class="sec-opts">
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:8px;letter-spacing:.4px">${L.gridOptions}</div>
        <div class="opt-row" style="margin-bottom:8px">
          <label style="font-size:12px;font-weight:600">${L.sensorMode}</label>
          <div class="bg">
            <div class="ob ${gridMode==='single'?'on':''}" data-t="grid_mode" data-v="single">1 sensor</div>
            <div class="ob ${gridMode==='dual'?'on':''}"   data-t="grid_mode" data-v="dual">2 sensors</div>
          </div>
        </div>
        ${gridMode==='single'?`<div class="toggle-row" style="margin-bottom:8px"><label class="tl">${L.invertDir}</label><label class="tog"><input type="checkbox" id="gridInvTog" ${gridInv?'checked':''}/><span class="tog-sl"></span></label></div>`:''}
        <div class="opt-row" style="margin-bottom:4px">
          <label style="font-size:12px;font-weight:600">${L.gridPowerUnit}</label>
          <div class="bg">
            <div class="ob ${gridUnit==='auto'?'on':''}" data-t="grid_unit" data-v="auto">Auto</div>
            <div class="ob ${gridUnit==='W'?'on':''}"    data-t="grid_unit" data-v="W">W</div>
            <div class="ob ${gridUnit==='kW'?'on':''}"   data-t="grid_unit" data-v="kW">kW</div>
          </div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 8px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:8px;letter-spacing:.4px">${L.homeOptions}</div>
        <div class="opt-row" style="margin-bottom:4px">
          <label style="font-size:12px;font-weight:600">${L.homePowerUnit}</label>
          <div class="bg">
            <div class="ob ${homeUnit==='auto'?'on':''}" data-t="home_unit" data-v="auto">Auto</div>
            <div class="ob ${homeUnit==='W'?'on':''}"    data-t="home_unit" data-v="W">W</div>
            <div class="ob ${homeUnit==='kW'?'on':''}"   data-t="home_unit" data-v="kW">kW</div>
          </div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 4px"></div>
      </div>`;
    }
    if(sec.id==='battery'){
      const battMode = this._config.battery_mode||'single';
      const battInv  = this._config.battery_invert||false;
      const battUnit = this._config.battery_unit||'auto';
      optionsHTML = `<div class="sec-opts">
        <div class="opt-row" style="margin-bottom:8px">
          <label style="font-size:12px;font-weight:600">${L.sensorMode}</label>
          <div class="bg">
            <div class="ob ${battMode==='single'?'on':''}" data-t="battery_mode" data-v="single">1 sensor</div>
            <div class="ob ${battMode==='dual'?'on':''}"   data-t="battery_mode" data-v="dual">2 sensors</div>
          </div>
        </div>
        ${battMode==='single'?`<div class="toggle-row" style="margin-bottom:8px"><label class="tl">${L.invertDir}</label><label class="tog"><input type="checkbox" id="battInvTog" ${battInv?'checked':''}/><span class="tog-sl"></span></label></div>`:''}
        <div class="opt-row" style="margin-bottom:4px">
          <label style="font-size:12px;font-weight:600">${L.battPowerUnit}</label>
          <div class="bg">
            <div class="ob ${battUnit==='auto'?'on':''}" data-t="battery_unit" data-v="auto">Auto</div>
            <div class="ob ${battUnit==='W'?'on':''}"    data-t="battery_unit" data-v="W">W</div>
            <div class="ob ${battUnit==='kW'?'on':''}"   data-t="battery_unit" data-v="kW">kW</div>
          </div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 4px"></div>
      </div>`;
    }


    // Filter fields theo mode: ẩn field không dùng
    const filteredFields = sec.fields.filter(f=>{
      if(sec.id==='battery'){
        const m=this._config.battery_mode||'single';
        if(m==='single' && (f.k==='battery_charge_entity'||f.k==='battery_discharge_entity')) return false;
        if(m==='dual'   && f.k==='battery_flow_entity') return false;
      }
      if(sec.id==='grid'){
        const m=this._config.grid_mode||'single';
        if(m==='single' && (f.k==='grid_import_entity'||f.k==='grid_export_entity')) return false;
        if(m==='dual'   && f.k==='grid_flow_entity') return false;
      }
      return true;
    });

    return `
    <div class="acc-wrap">
      <div class="acc-head" id="head-${sec.id}">
        <span>${sec.label}${badge}</span>
        <span class="acc-arrow" id="arrow-${sec.id}">${isOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-${sec.id}" style="display:${isOpen?'block':'none'}">
        ${optionsHTML}
        ${filteredFields.map(f=>`
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

    // ── Editor UI translations ────────────────────────────────
    const E={
      vi:{
        displayOpts:'🎨 Tuỳ chọn hiển thị', flowStyle:'🌊 Kiểu dòng chảy',
        language:'🌐 Ngôn ngữ',
        bgOpacity:'🪟 Độ mờ nền', showWeatherInfo:'☁️ Hiện bảng thời tiết',
        showTomorrow:'🌤️ Hiện dự báo ngày mai', nodeGlow:'✨ Hiệu ứng phát sáng node',
        showForecastChart:'📊 Hiện biểu đồ solar', showHourlyStrip:'🕐 Hiện dự báo theo giờ',
        minimalMode:'🪄 Minimal mode (giảm animation)',
        pricingTitle:'💰 Giá điện & Tiền tệ', currencyLabel:'💱 Ký hiệu tiền tệ (mặc định: đ)',
        pricingTiersLabel:'📊 Bậc giá tuỳ chỉnh (tuỳ chọn)',
        pricingHint:'Định dạng: <code>giới_hạn_kWh:đơn_giá</code>, phân cách bằng dấu phẩy. Để trống = mặc định EVN Việt Nam.',
        layoutTitle:'📐 Bố cục node',
        layoutHint:'Điều chỉnh nếu node Pin hoặc Lưới bị cắt trên màn hình nhỏ (iPhone, Galaxy S10...). SVG viewBox = 346px.',
        batNodeX:'🔋 Node Pin X', grdNodeX:'🔌 Node Lưới X',
        invNodeY:'⚙️ Node Inverter Y', homNodeY:'🏠 Node Nhà Y',
        nodeScale:'📐 Tỉ lệ node (4 node)', particleDensity:'✦ Mật độ hạt (>1kW)',
        layoutDefault:'Mặc định: Pin X = <strong>-40</strong>, Lưới X = <strong>295</strong>, Inverter Y = <strong>210</strong>, Nhà Y = <strong>410</strong>, Tỉ lệ = <strong>100%</strong>, Hạt = <strong>100%</strong>.<br/>Màn hình nhỏ: Pin = <strong>4</strong>, Lưới = <strong>250</strong>. Thiết bị yếu: Hạt = <strong>40–60%</strong>.',
        roomLayoutTitle:'📐 Vị trí phòng (X/Y)',
        roomLayoutHint:'Kéo từng phòng đến vị trí tuỳ ý. Offset X: dịch trái/phải. Offset Y: âm = lên trên (flow sẽ tự thích nghi). Nhấn Reset để về mặc định.',
        roomOffsetX:'↔ X',roomOffsetY:'↕ Y',roomResetPos:'↺ Reset vị trí',
        colorTitle:'🎨 Màu sắc', bgGradient:'🌈 MÀU NỀN GRADIENT', preset:'Preset',
        nodeBorderColors:'⬡ MÀU VIỀN NODE', flowColors:'〰️ MÀU DÒNG CHẢY / HẠT',
        chartColors:'📊 MÀU BIỂU ĐỒ', textColor:'🔤 MÀU CHỮ',
        fcLine:'📈 Đường dự báo', liveActualLine:'📉 Đường thực tế',
        primaryText:'🔤 Chữ chính', resetColors:'↺ Đặt lại mặc định',
        color1:'🎨 Màu 1 (trên trái)', color2:'🎨 Màu 2 (dưới phải)',
        solarPowerUnit:'☀️ Đơn vị công suất solar', solarDesignCap:'⚡ Công suất thiết kế (Wp) — trục Y biểu đồ',
        solarDesignHint:'Tổng công suất thiết kế (Wp). Để trống = tự động 8000W. Biểu đồ sẽ vẽ theo giá trị này.',
        sensorMode:'Chế độ cảm biến', invertDir:'🔄 Đảo chiều (Deye/Growatt)',
        gridPowerUnit:'Đơn vị công suất lưới', homePowerUnit:'Đơn vị công suất nhà',
        battPowerUnit:'Đơn vị công suất', gridOptions:'🔌 TUỲ CHỌN LƯỚI', homeOptions:'🏠 TUỲ CHỌN NHÀ',
        timeFormat:'🕐 Định dạng giờ',
        showClock:'🕐 Hiện đồng hồ & thời tiết (toàn bộ phần trên)',
        showRoomsSection:'🏠 Hiện phòng / thiết bị',
        showBatteryBar:'🔋 Hiện thanh pin',
        showStatsCircles:'📊 Hiện các vòng tròn thống kê',
        showBatteryNode:'🔋 Hiện node Pin (thẻ pin trong sơ đồ)',
        tempUnit:'🌡️ Đơn vị nhiệt độ',
      },
      en:{
        displayOpts:'🎨 Display Options', flowStyle:'🌊 Flow style',
        language:'🌐 Language / Sprache / Lingua / Langue',
        bgOpacity:'🪟 Background opacity', showWeatherInfo:'☁️ Show weather info panel',
        showTomorrow:'🌤️ Show tomorrow forecast', nodeGlow:'✨ Node glow effect',
        showForecastChart:'📊 Show solar forecast chart', showHourlyStrip:'🕐 Show hourly forecast strip',
        minimalMode:'🪄 Minimal mode (reduce all animations)',
        pricingTitle:'💰 Pricing & Currency', currencyLabel:'💱 Currency symbol (default: đ)',
        pricingTiersLabel:'📊 Custom pricing tiers (optional)',
        pricingHint:'Format: <code>limit_kWh:rate</code> comma-separated. Leave empty = Vietnam EVN default.',
        layoutTitle:'📐 Node Layout',
        layoutHint:'Adjust if Battery or Grid node is cut off on small screens (iPhone, Galaxy S10...). SVG viewBox width = 346px.',
        batNodeX:'🔋 Battery node X', grdNodeX:'🔌 Grid node X',
        invNodeY:'⚙️ Inverter node Y', homNodeY:'🏠 Home node Y',
        nodeScale:'📐 Node scale (all 4)', particleDensity:'✦ Particle density (>1kW)',
        layoutDefault:'Default: Battery X = <strong>-40</strong>, Grid X = <strong>295</strong>, Inverter Y = <strong>210</strong>, Home Y = <strong>410</strong>, Scale = <strong>100%</strong>, Particles = <strong>100%</strong>.<br/>Small screens: Battery = <strong>4</strong>, Grid = <strong>250</strong>. Low-end devices: Particles = <strong>40–60%</strong>.',
        roomLayoutTitle:'📐 Room Positions (X/Y)',
        roomLayoutHint:'Drag each room to any position. X = left/right offset. Y negative = move up (flow adapts automatically). Click Reset to restore defaults.',
        roomOffsetX:'↔ X',roomOffsetY:'↕ Y',roomResetPos:'↺ Reset position',
        colorTitle:'🎨 Color Theme', bgGradient:'🌈 BACKGROUND GRADIENT', preset:'Preset',
        nodeBorderColors:'⬡ NODE BORDER COLORS', flowColors:'〰️ FLOW / PARTICLE COLORS',
        chartColors:'📊 CHART COLORS', textColor:'🔤 TEXT COLOR',
        fcLine:'📈 Forecast line', liveActualLine:'📉 Live/actual line',
        primaryText:'🔤 Primary text', resetColors:'↺ Reset to defaults',
        color1:'🎨 Color 1 (top-left)', color2:'🎨 Color 2 (bottom-right)',
        solarPowerUnit:'☀️ Solar power unit', solarDesignCap:'⚡ Solar design capacity (Wp) — chart Y-axis max',
        solarDesignHint:'Total design capacity (Wp). Blank = auto 8000W. Chart will draw according to this value.',
        sensorMode:'Sensor mode', invertDir:'🔄 Invert direction (Deye/Growatt)',
        gridPowerUnit:'Grid power unit', homePowerUnit:'Home power unit',
        battPowerUnit:'Power unit', gridOptions:'🔌 GRID OPTIONS', homeOptions:'🏠 HOME OPTIONS',
        timeFormat:'🕐 Time format',
        showClock:'🕐 Show clock & weather (entire top section)',
        showRoomsSection:'🏠 Show rooms / devices',
        showBatteryBar:'🔋 Show battery bar',
        showStatsCircles:'📊 Show stats circles',
        showBatteryNode:'🔋 Show Battery node (card in diagram)',
        tempUnit:'🌡️ Temperature unit',
      },
      de:{
        displayOpts:'🎨 Anzeigeoptionen', flowStyle:'🌊 Flussstil',
        language:'🌐 Sprache / Language / Lingua / Langue',
        bgOpacity:'🪟 Hintergrundtransparenz', showWeatherInfo:'☁️ Wetterinfopanel anzeigen',
        showTomorrow:'🌤️ Morgen-Vorhersage anzeigen', nodeGlow:'✨ Node-Leuchteffekt',
        showForecastChart:'📊 Solar-Prognose-Diagramm anzeigen', showHourlyStrip:'🕐 Stündliche Vorhersage anzeigen',
        minimalMode:'🪄 Minimalmodus (Animationen reduzieren)',
        pricingTitle:'💰 Preise & Währung', currencyLabel:'💱 Währungssymbol (Standard: đ)',
        pricingTiersLabel:'📊 Benutzerdefinierte Preisstufen (optional)',
        pricingHint:'Format: <code>limit_kWh:preis</code>, kommagetrennt. Leer = Vietnam EVN Standard.',
        layoutTitle:'📐 Node-Layout',
        layoutHint:'Anpassen wenn Batterie- oder Netz-Node auf kleinen Bildschirmen abgeschnitten ist.',
        batNodeX:'🔋 Batterie-Node X', grdNodeX:'🔌 Netz-Node X',
        invNodeY:'⚙️ Wechselrichter-Node Y', homNodeY:'🏠 Haus-Node Y',
        nodeScale:'📐 Node-Skalierung (alle 4)', particleDensity:'✦ Partikeldichte (>1kW)',
        layoutDefault:'Standard: Batterie X = <strong>-40</strong>, Netz X = <strong>295</strong>, WR Y = <strong>210</strong>, Haus Y = <strong>410</strong>.',
        roomLayoutTitle:'📐 Raumposition (X/Y)',
        roomLayoutHint:'Jeden Raum beliebig positionieren. Negatives Y = nach oben (Fluss passt sich an). Reset stellt Standard wieder her.',
        roomOffsetX:'↔ X',roomOffsetY:'↕ Y',roomResetPos:'↺ Reset',
        colorTitle:'🎨 Farbthema', bgGradient:'🌈 HINTERGRUNDVERLAUF', preset:'Preset',
        nodeBorderColors:'⬡ NODE-RANDFARBEN', flowColors:'〰️ FLUSS-/PARTIKELFARBEN',
        chartColors:'📊 DIAGRAMMFARBEN', textColor:'🔤 TEXTFARBE',
        fcLine:'📈 Prognoselinie', liveActualLine:'📉 Ist-Wert-Linie',
        primaryText:'🔤 Primärtext', resetColors:'↺ Auf Standard zurücksetzen',
        color1:'🎨 Farbe 1 (oben links)', color2:'🎨 Farbe 2 (unten rechts)',
        solarPowerUnit:'☀️ Solar-Leistungseinheit', solarDesignCap:'⚡ Solar-Nennleistung (Wp) — Y-Achse',
        solarDesignHint:'Gesamte Nennleistung (Wp). Leer = auto 8000W.',
        sensorMode:'Sensormodus', invertDir:'🔄 Richtung umkehren (Deye/Growatt)',
        gridPowerUnit:'Netz-Leistungseinheit', homePowerUnit:'Haus-Leistungseinheit',
        battPowerUnit:'Leistungseinheit', gridOptions:'🔌 NETZOPTIONEN', homeOptions:'🏠 HAUSOPTIONEN',
        timeFormat:'🕐 Zeitformat',
      },
      it:{
        displayOpts:'🎨 Opzioni di visualizzazione', flowStyle:'🌊 Stile flusso',
        language:'🌐 Lingua / Language / Sprache / Langue',
        bgOpacity:'🪟 Opacità sfondo', showWeatherInfo:'☁️ Mostra pannello meteo',
        showTomorrow:'🌤️ Mostra previsione domani', nodeGlow:'✨ Effetto bagliore nodo',
        showForecastChart:'📊 Mostra grafico previsione solare', showHourlyStrip:'🕐 Mostra striscia oraria',
        minimalMode:'🪄 Modalità minimale (ridurre animazioni)',
        pricingTitle:'💰 Prezzi & Valuta', currencyLabel:'💱 Simbolo valuta (default: đ)',
        pricingTiersLabel:'📊 Livelli di prezzo personalizzati (opzionale)',
        pricingHint:'Formato: <code>limite_kWh:tariffa</code>, separati da virgola. Vuoto = default EVN Vietnam.',
        layoutTitle:'📐 Layout nodi',
        layoutHint:'Regola se il nodo Batteria o Rete è tagliato su schermi piccoli.',
        batNodeX:'🔋 Nodo batteria X', grdNodeX:'🔌 Nodo rete X',
        invNodeY:'⚙️ Nodo inverter Y', homNodeY:'🏠 Nodo casa Y',
        nodeScale:'📐 Scala nodi (tutti 4)', particleDensity:'✦ Densità particelle (>1kW)',
        layoutDefault:'Default: Batteria X = <strong>-40</strong>, Rete X = <strong>295</strong>, Inverter Y = <strong>210</strong>, Casa Y = <strong>410</strong>.',
        roomLayoutTitle:'📐 Posizione stanze (X/Y)',
        roomLayoutHint:'Posiziona liberamente ogni stanza. Y negativo = spostamento verso l\'alto (il flusso si adatta). Reset ripristina i valori predefiniti.',
        roomOffsetX:'↔ X',roomOffsetY:'↕ Y',roomResetPos:'↺ Reset',
        colorTitle:'🎨 Tema colori', bgGradient:'🌈 GRADIENTE SFONDO', preset:'Preset',
        nodeBorderColors:'⬡ COLORI BORDO NODO', flowColors:'〰️ COLORI FLUSSO / PARTICELLE',
        chartColors:'📊 COLORI GRAFICO', textColor:'🔤 COLORE TESTO',
        fcLine:'📈 Linea previsione', liveActualLine:'📉 Linea reale',
        primaryText:'🔤 Testo primario', resetColors:'↺ Ripristina predefiniti',
        color1:'🎨 Colore 1 (in alto a sinistra)', color2:'🎨 Colore 2 (in basso a destra)',
        solarPowerUnit:'☀️ Unità potenza solare', solarDesignCap:'⚡ Potenza solare nominale (Wp) — asse Y',
        solarDesignHint:'Potenza nominale totale (Wp). Vuoto = auto 8000W.',
        sensorMode:'Modalità sensore', invertDir:'🔄 Inverti direzione (Deye/Growatt)',
        gridPowerUnit:'Unità potenza rete', homePowerUnit:'Unità potenza casa',
        battPowerUnit:'Unità potenza', gridOptions:'🔌 OPZIONI RETE', homeOptions:'🏠 OPZIONI CASA',
        timeFormat:'🕐 Formato ora',
      },
      fr:{
        displayOpts:'🎨 Options d\'affichage', flowStyle:'🌊 Style de flux',
        language:'🌐 Langue / Language / Sprache / Lingua',
        bgOpacity:'🪟 Opacité de fond', showWeatherInfo:'☁️ Afficher le panneau météo',
        showTomorrow:'🌤️ Afficher prévision demain', nodeGlow:'✨ Effet de lueur des nœuds',
        showForecastChart:'📊 Afficher le graphique solaire', showHourlyStrip:'🕐 Afficher prévisions horaires',
        minimalMode:'🪄 Mode minimal (réduire animations)',
        pricingTitle:'💰 Tarifs & Devise', currencyLabel:'💱 Symbole devise (défaut : đ)',
        pricingTiersLabel:'📊 Niveaux de tarif personnalisés (optionnel)',
        pricingHint:'Format : <code>limite_kWh:tarif</code>, séparés par virgule. Vide = EVN Vietnam par défaut.',
        layoutTitle:'📐 Disposition des nœuds',
        layoutHint:'Ajustez si le nœud Batterie ou Réseau est coupé sur les petits écrans.',
        batNodeX:'🔋 Nœud batterie X', grdNodeX:'🔌 Nœud réseau X',
        invNodeY:'⚙️ Nœud onduleur Y', homNodeY:'🏠 Nœud maison Y',
        nodeScale:'📐 Échelle nœuds (4 nœuds)', particleDensity:'✦ Densité particules (>1kW)',
        layoutDefault:'Défaut : Batterie X = <strong>-40</strong>, Réseau X = <strong>295</strong>, Onduleur Y = <strong>210</strong>, Maison Y = <strong>410</strong>.',
        colorTitle:'🎨 Thème couleurs', bgGradient:'🌈 DÉGRADÉ DE FOND', preset:'Preset',
        nodeBorderColors:'⬡ COULEURS BORDURE NŒUD', flowColors:'〰️ COULEURS FLUX / PARTICULES',
        chartColors:'📊 COULEURS GRAPHIQUE', textColor:'🔤 COULEUR TEXTE',
        fcLine:'📈 Ligne prévision', liveActualLine:'📉 Ligne réelle',
        primaryText:'🔤 Texte principal', resetColors:'↺ Réinitialiser',
        color1:'🎨 Couleur 1 (haut gauche)', color2:'🎨 Couleur 2 (bas droite)',
        solarPowerUnit:'☀️ Unité puissance solaire', solarDesignCap:'⚡ Capacité solaire nominale (Wp) — axe Y',
        solarDesignHint:'Puissance nominale totale (Wp). Vide = auto 8000W.',
        sensorMode:'Mode capteur', invertDir:'🔄 Inverser direction (Deye/Growatt)',
        gridPowerUnit:'Unité puissance réseau', homePowerUnit:'Unité puissance maison',
        battPowerUnit:'Unité puissance', gridOptions:'🔌 OPTIONS RÉSEAU', homeOptions:'🏠 OPTIONS MAISON',
        timeFormat:'🕐 Format heure',
      },
      nl:{
        displayOpts:'🎨 Weergaveopties', flowStyle:'🌊 Stroomstijl',
        language:'🌐 Taal / Language / Sprache / Lingua',
        bgOpacity:'🪟 Achtergrondtransparantie', showWeatherInfo:'☁️ Weerpaneel tonen',
        showTomorrow:'🌤️ Morgenprognose tonen', nodeGlow:'✨ Node-gloedeffect',
        showForecastChart:'📊 Solarprognose-diagram tonen', showHourlyStrip:'🕐 Uurlijkse prognose tonen',
        minimalMode:'🪄 Minimale modus (animaties verminderen)',
        pricingTitle:'💰 Tarieven & Valuta', currencyLabel:'💱 Valutasymbool (standaard: đ)',
        pricingTiersLabel:'📊 Aangepaste tariefniveaus (optioneel)',
        pricingHint:'Formaat: <code>limiet_kWh:tarief</code>, kommagescheiden. Leeg = Vietnam EVN standaard.',
        layoutTitle:'📐 Node-indeling',
        layoutHint:'Aanpassen als Batterij of Net-node wordt afgesneden op kleine schermen.',
        batNodeX:'🔋 Batterij-node X', grdNodeX:'🔌 Net-node X',
        invNodeY:'⚙️ Omvormer-node Y', homNodeY:'🏠 Huis-node Y',
        nodeScale:'📐 Node-schaal (alle 4)', particleDensity:'✦ Deeltjesdichtheid (>1kW)',
        layoutDefault:'Standaard: Batterij X = <strong>-40</strong>, Net X = <strong>295</strong>, Omvormer Y = <strong>210</strong>, Huis Y = <strong>410</strong>.',
        colorTitle:'🎨 Kleurthema', bgGradient:'🌈 ACHTERGRONDVERLOOP', preset:'Preset',
        nodeBorderColors:'⬡ NODE RANDKLEUREN', flowColors:'〰️ STROOM / DEELTJESKLEUREN',
        chartColors:'📊 DIAGRAMKLEUREN', textColor:'🔤 TEKSTKLEUR',
        fcLine:'📈 Prognoselijn', liveActualLine:'📉 Werkelijke lijn',
        primaryText:'🔤 Primaire tekst', resetColors:'↺ Standaard herstellen',
        color1:'🎨 Kleur 1 (linksboven)', color2:'🎨 Kleur 2 (rechtsonder)',
        solarPowerUnit:'☀️ Solar vermogenseenheid', solarDesignCap:'⚡ Solar ontwerpcapaciteit (Wp) — Y-as',
        solarDesignHint:'Totale ontwerpcapaciteit (Wp). Leeg = auto 8000W.',
        sensorMode:'Sensormodus', invertDir:'🔄 Richting omkeren (Deye/Growatt)',
        gridPowerUnit:'Net vermogenseenheid', homePowerUnit:'Huis vermogenseenheid',
        battPowerUnit:'Vermogenseenheid', gridOptions:'🔌 NETOPTIES', homeOptions:'🏠 HUISOPTIES',
        timeFormat:'🕐 Tijdformaat',
      },
      pl:{
        displayOpts:'🎨 Opcje wyświetlania', flowStyle:'🌊 Styl przepływu',
        language:'🌐 Język / Language / Sprache / Lingua',
        bgOpacity:'🪟 Przezroczystość tła', showWeatherInfo:'☁️ Pokaż panel pogody',
        showTomorrow:'🌤️ Pokaż jutrzejszą prognozę', nodeGlow:'✨ Efekt poświaty węzłów',
        showForecastChart:'📊 Pokaż wykres prognozy solarnej', showHourlyStrip:'🕐 Pokaż pasek godzinowy',
        minimalMode:'🪄 Tryb minimalny (zredukuj animacje)',
        pricingTitle:'💰 Ceny & Waluta', currencyLabel:'💱 Symbol waluty (domyślnie: đ)',
        pricingTiersLabel:'📊 Niestandardowe poziomy cenowe (opcjonalne)',
        pricingHint:'Format: <code>limit_kWh:stawka</code>, oddzielone przecinkiem. Puste = domyślny EVN Vietnam.',
        layoutTitle:'📐 Układ węzłów',
        layoutHint:'Dostosuj jeśli węzeł Bateria lub Sieć jest odcięty na małych ekranach.',
        batNodeX:'🔋 Węzeł baterii X', grdNodeX:'🔌 Węzeł sieci X',
        invNodeY:'⚙️ Węzeł falownika Y', homNodeY:'🏠 Węzeł domu Y',
        nodeScale:'📐 Skala węzłów (wszystkie 4)', particleDensity:'✦ Gęstość cząstek (>1kW)',
        layoutDefault:'Domyślnie: Bateria X = <strong>-40</strong>, Sieć X = <strong>295</strong>, Falownik Y = <strong>210</strong>, Dom Y = <strong>410</strong>.',
        colorTitle:'🎨 Motyw kolorów', bgGradient:'🌈 GRADIENT TŁA', preset:'Preset',
        nodeBorderColors:'⬡ KOLORY OBRAMOWANIA WĘZŁÓW', flowColors:'〰️ KOLORY PRZEPŁYWU / CZĄSTEK',
        chartColors:'📊 KOLORY WYKRESÓW', textColor:'🔤 KOLOR TEKSTU',
        fcLine:'📈 Linia prognozy', liveActualLine:'📉 Linia rzeczywista',
        primaryText:'🔤 Tekst główny', resetColors:'↺ Przywróć domyślne',
        color1:'🎨 Kolor 1 (lewy górny)', color2:'🎨 Kolor 2 (prawy dolny)',
        solarPowerUnit:'☀️ Jednostka mocy solarnej', solarDesignCap:'⚡ Moc projektowa (Wp) — oś Y',
        solarDesignHint:'Całkowita moc projektowa (Wp). Puste = auto 8000W.',
        sensorMode:'Tryb czujnika', invertDir:'🔄 Odwróć kierunek (Deye/Growatt)',
        gridPowerUnit:'Jednostka mocy sieci', homePowerUnit:'Jednostka mocy domu',
        battPowerUnit:'Jednostka mocy', gridOptions:'🔌 OPCJE SIECI', homeOptions:'🏠 OPCJE DOMU',
        timeFormat:'🕐 Format czasu',
      },
      sv:{
        displayOpts:'🎨 Visningsalternativ', flowStyle:'🌊 Flödesstil',
        language:'🌐 Språk / Language / Sprache / Lingua',
        bgOpacity:'🪟 Bakgrundstransparens', showWeatherInfo:'☁️ Visa väderpanel',
        showTomorrow:'🌤️ Visa morgondagens prognos', nodeGlow:'✨ Nodglödeffekt',
        showForecastChart:'📊 Visa solarprognos-diagram', showHourlyStrip:'🕐 Visa timprognos',
        minimalMode:'🪄 Minimalt läge (minska animationer)',
        pricingTitle:'💰 Priser & Valuta', currencyLabel:'💱 Valutasymbol (standard: đ)',
        pricingTiersLabel:'📊 Anpassade prisnivåer (valfritt)',
        pricingHint:'Format: <code>gräns_kWh:taxa</code>, kommaseparerade. Tom = Vietnam EVN standard.',
        layoutTitle:'📐 Nodlayout',
        layoutHint:'Justera om Batteri eller Nät-noden klipps på små skärmar.',
        batNodeX:'🔋 Batterinod X', grdNodeX:'🔌 Nätnod X',
        invNodeY:'⚙️ Invertarnod Y', homNodeY:'🏠 Hemnod Y',
        nodeScale:'📐 Nodskala (alla 4)', particleDensity:'✦ Partikeltäthet (>1kW)',
        layoutDefault:'Standard: Batteri X = <strong>-40</strong>, Nät X = <strong>295</strong>, Invertar Y = <strong>210</strong>, Hem Y = <strong>410</strong>.',
        colorTitle:'🎨 Färgtema', bgGradient:'🌈 BAKGRUNDSGRADIENT', preset:'Preset',
        nodeBorderColors:'⬡ NODKANTFÄRGER', flowColors:'〰️ FLÖDES- / PARTIKELFÄRGER',
        chartColors:'📊 DIAGRAMFÄRGER', textColor:'🔤 TEXTFÄRG',
        fcLine:'📈 Prognoslinje', liveActualLine:'📉 Verklig linje',
        primaryText:'🔤 Primär text', resetColors:'↺ Återställ standard',
        color1:'🎨 Färg 1 (övre vänster)', color2:'🎨 Färg 2 (nedre höger)',
        solarPowerUnit:'☀️ Solar effektenhet', solarDesignCap:'⚡ Solar designkapacitet (Wp) — Y-axel',
        solarDesignHint:'Total designkapacitet (Wp). Tom = auto 8000W.',
        sensorMode:'Sensorläge', invertDir:'🔄 Invertera riktning (Deye/Growatt)',
        gridPowerUnit:'Nät effektenhet', homePowerUnit:'Hem effektenhet',
        battPowerUnit:'Effektenhet', gridOptions:'🔌 NÄTALTERNATIV', homeOptions:'🏠 HEMALTERNATIV',
        timeFormat:'🕐 Tidsformat',
      },
      hu:{
        displayOpts:'🎨 Megjelenítési lehetőségek', flowStyle:'🌊 Áramlás stílusa',
        language:'🌐 Nyelv / Language / Sprache / Lingua',
        bgOpacity:'🪟 Háttér átlátszósága', showWeatherInfo:'☁️ Időjárás panel megjelenítése',
        showTomorrow:'🌤️ Holnapi előrejelzés megjelenítése', nodeGlow:'✨ Csomópont izzás effekt',
        showForecastChart:'📊 Napelem prognózis diagram megjelenítése', showHourlyStrip:'🕐 Óránkénti sáv megjelenítése',
        minimalMode:'🪄 Minimális mód (animációk csökkentése)',
        pricingTitle:'💰 Árak & Pénznem', currencyLabel:'💱 Pénznem szimbólum (alapért.: đ)',
        pricingTiersLabel:'📊 Egyéni árszintek (opcionális)',
        pricingHint:'Formátum: <code>határ_kWh:díjszabás</code>, vesszővel elválasztva. Üres = Vietnam EVN alapértelmezett.',
        layoutTitle:'📐 Csomópont elrendezés',
        layoutHint:'Állítsd be ha az Akkumulátor vagy Hálózat csomópont kis képernyőn levágódik.',
        batNodeX:'🔋 Akkumulátor csomópont X', grdNodeX:'🔌 Hálózat csomópont X',
        invNodeY:'⚙️ Inverter csomópont Y', homNodeY:'🏠 Otthon csomópont Y',
        nodeScale:'📐 Csomópont méretezés (mind 4)', particleDensity:'✦ Részecske sűrűség (>1kW)',
        layoutDefault:'Alapértelmezett: Akkumulátor X = <strong>-40</strong>, Hálózat X = <strong>295</strong>, Inverter Y = <strong>210</strong>, Otthon Y = <strong>410</strong>.',
        colorTitle:'🎨 Színtéma', bgGradient:'🌈 HÁTTÉR GRADIENS', preset:'Preset',
        nodeBorderColors:'⬡ CSOMÓPONT SZEGÉLY SZÍNEK', flowColors:'〰️ ÁRAMLÁS / RÉSZECSKE SZÍNEK',
        chartColors:'📊 DIAGRAM SZÍNEK', textColor:'🔤 SZÖVEG SZÍN',
        fcLine:'📈 Prognózis vonal', liveActualLine:'📉 Tényleges vonal',
        primaryText:'🔤 Elsődleges szöveg', resetColors:'↺ Alapértelmezett visszaállítása',
        color1:'🎨 Szín 1 (bal felső)', color2:'🎨 Szín 2 (jobb alsó)',
        solarPowerUnit:'☀️ Napelem teljesítmény egység', solarDesignCap:'⚡ Napelem tervezési kapacitás (Wp) — Y-tengely',
        solarDesignHint:'Teljes tervezési kapacitás (Wp). Üres = auto 8000W.',
        sensorMode:'Érzékelő mód', invertDir:'🔄 Irány megfordítása (Deye/Growatt)',
        gridPowerUnit:'Hálózat teljesítmény egység', homePowerUnit:'Otthon teljesítmény egység',
        battPowerUnit:'Teljesítmény egység', gridOptions:'🔌 HÁLÓZAT BEÁLLÍTÁSOK', homeOptions:'🏠 OTTHON BEÁLLÍTÁSOK',
        timeFormat:'🕐 Időformátum',
      },
      sl:{
        displayOpts:'🎨 Možnosti prikaza', flowStyle:'🌊 Slog toka',
        language:'🌐 Jezik / Language / Sprache / Lingua',
        bgOpacity:'🪟 Prosojnost ozadja', showWeatherInfo:'☁️ Pokaži vremenski panel',
        showTomorrow:'🌤️ Pokaži jutri napoved', nodeGlow:'✨ Učinek sijaja vozlišča',
        showForecastChart:'📊 Pokaži diagram solarnih napovedi', showHourlyStrip:'🕐 Pokaži urno napoved',
        pricingTitle:'💰 Cene & Valuta', currencyLabel:'💱 Simbol valute (privzeto: đ)',
        pricingTiersLabel:'📊 Stopnje cen po meri (neobvezno)',
        pricingHint:'Format: <code>meja_kWh:cena</code>, ločeno z vejico. Prazno = Vietnam EVN privzeto.',
        layoutTitle:'📐 Postavitev vozlišč',
        layoutHint:'Prilagodite, če je vozlišče baterije ali omrežja odrezano na majhnih zaslonih.',
        batNodeX:'🔋 Baterija vozlišče X', grdNodeX:'🔌 Omrežje vozlišče X',
        invNodeY:'⚙️ Razsmernik vozlišče Y', homNodeY:'🏠 Dom vozlišče Y',
        nodeScale:'📐 Merilo vozlišča (vsa 4)', particleDensity:'✦ Gostota delcev (>1kW)',
        layoutDefault:'Privzeto: Baterija X = <strong>-40</strong>, Omrežje X = <strong>295</strong>, Razsmernik Y = <strong>210</strong>, Dom Y = <strong>410</strong>.',
        colorTitle:'🎨 Barvna tema', bgGradient:'🌈 GRADIENT OZADJA', preset:'Prednastavitev',
        nodeBorderColors:'⬡ BARVE ROBOV VOZLIŠČ', flowColors:'〰️ BARVE TOKA / DELCEV',
        chartColors:'📊 BARVE DIAGRAMA', textColor:'🔤 BARVA BESEDILA',
        fcLine:'📈 Linija napovedi', liveActualLine:'📉 Dejanska linija',
        primaryText:'🔤 Glavno besedilo', resetColors:'↺ Ponastavi privzeto',
        color1:'🎨 Barva 1 (zgoraj levo)', color2:'🎨 Barva 2 (spodaj desno)',
        solarPowerUnit:'☀️ Enota moči solarnega', solarDesignCap:'⚡ Projektna zmogljivost (Wp) — os Y',
        solarDesignHint:'Skupna projektna zmogljivost (Wp). Prazno = auto 8000W.',
        sensorMode:'Način senzorja', invertDir:'🔄 Obrni smer (Deye/Growatt)',
        gridPowerUnit:'Enota moči omrežja', homePowerUnit:'Enota moči doma',
        battPowerUnit:'Enota moči', gridOptions:'🔌 NASTAVITVE OMREŽJA', homeOptions:'🏠 NASTAVITVE DOMA',
        timeFormat:'🕐 Format ure',
      },
    };
    const _Lbase=E[lang]||E.en;
    const L={...E.en,..._Lbase};
    this._L=L;
    const showTmr   = this._config.show_tomorrow!==false;
    const showInfo  = this._config.show_weather_info!==false;
    const showGlow  = this._config.show_node_glow!==false;
    const showForecastChart = this._config.show_forecast_chart!==false;
    const showHourlyForecast = this._config.show_hourly_forecast!==false;
    const minimalMode = this._config.minimal_mode===true;
    const bgPreset  = this._config.bg_preset||'default';
    const bgCustom  = this._config.bg_custom||'';
    const bgColor1  = this._config.bg_color1||'#001e2b';
    const bgColor2  = this._config.bg_color2||'#002832';
    const cur       = this._config.currency||'đ';
    const customTiers = this._config.pricing_tiers||'';
    const isDispOpen  = this._open.display;
    const isPricingOpen = this._open.pricing;
    const isLayoutOpen  = this._open.layout;
    const batX = this._config.node_bat_x??-40;
    const grdX = this._config.node_grd_x??295;
    const invY = this._config.node_inv_y??210;
    const homY = this._config.node_hom_y??410;
    const nodeScale = parseFloat(this._config.node_scale??1.0);
    const particleMult = parseFloat(this._config.particle_mult??1.0);
    const isColorOpen = this._open.color||false;

    // Color theme defaults
    const colorBat  = this._config.color_node_bat  ||'#28e6a0';
    const colorGrd  = this._config.color_node_grd  ||'#00d7ff';
    const colorInv  = this._config.color_node_inv  ||'#b991ff';
    const colorHom  = this._config.color_node_hom  ||'#ffb228';
    const colorSolar= this._config.color_flow_solar||'#ffe83c';
    const colorGrid = this._config.color_flow_grid ||'#50beff';
    const colorBatt = this._config.color_flow_batt ||'#3ce878';
    const colorHome = this._config.color_flow_home ||'#ff941d';
    const colorChartFc  = this._config.color_chart_fc  ||'#f5a623';
    const colorChartLive= this._config.color_chart_live||'#7ed321';
    const colorText = this._config.color_text_primary||'#ffffff';

    this.shadowRoot.innerHTML=`<style>
      :host{display:block;padding:4px 0}
      *{box-sizing:border-box}
      /* accordion */
      .acc-wrap{border:1px solid var(--divider-color);border-radius:10px;margin-bottom:8px;overflow:hidden}
      .acc-head{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;background:var(--secondary-background-color);font-size:13px;font-weight:700;color:var(--primary-text-color);user-select:none;transition:background .15s}
      .acc-head:hover{background:var(--table-row-background-color,rgba(0,0,0,.04))}
      .acc-arrow{font-size:14px;color:var(--secondary-text-color);transition:transform .2s}
      .acc-body{padding:12px 14px;border-top:1px solid var(--divider-color);background:var(--card-background-color,#fff)}
      .sec-opts{background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;margin-bottom:12px;border:1px solid var(--divider-color)}
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
      .color-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px}
      .color-item{display:flex;flex-direction:column;gap:4px}
      .color-item label{font-size:11px;font-weight:600;color:var(--secondary-text-color)}
      .color-preview-wrap{display:flex;align-items:center;gap:8px;background:var(--secondary-background-color);border:1.5px solid var(--divider-color);border-radius:8px;padding:6px 10px}
      .color-preview-wrap input[type=color]{width:28px;height:28px;border:none;background:none;cursor:pointer;padding:0;border-radius:4px}
      .color-hex{font-size:11px;font-family:monospace;color:var(--primary-text-color);flex:1}
    </style>

    <!-- CREDIT -->
    <div style="text-align:center;padding:10px 14px 4px;font-size:11px;color:var(--secondary-text-color);line-height:1.6;">
      ☀️ V1.8.1 Designed by <strong style="color:var(--primary-color);">@doanlong1412</strong> from 🇻🇳 Vietnam 
    </div>

    <!-- SOCIAL LINKS -->
    <div style="display:flex;gap:8px;margin:6px 14px 10px;">
      <a href="https://www.tiktok.com/@long.1412" target="_blank" rel="noopener noreferrer"
        style="display:flex;align-items:center;gap:6px;flex:1;padding:7px 10px;
          border-radius:10px;text-decoration:none;cursor:pointer;
          background:linear-gradient(135deg,rgba(0,0,0,0.85) 0%,rgba(30,20,40,0.92) 100%);
          border:1px solid rgba(255,255,255,0.08);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <path d="M27.2 7.2a7.6 7.6 0 0 1-7.6-7.6h-5v21.5a3.6 3.6 0 1 1-3.6-3.6c.33 0 .65.05.96.13V12.5a8.6 8.6 0 1 0 8.24 8.6V11.5a12.6 12.6 0 0 0 7.6 2.5V8.6a7.66 7.66 0 0 1-.54-.01z" fill="white"/>
          <path d="M27.2 7.2a7.6 7.6 0 0 1-7.6-7.6h-3v21.5a3.6 3.6 0 1 1-2.6-3.46V12.5a8.6 8.6 0 1 0 7.6 8.6V11.5a12.6 12.6 0 0 0 5.6 1.5V8.6a7.6 7.6 0 0 1 0 0z" fill="#69C9D0" fill-opacity="0.5"/>
          <path d="M13 21.1a3.6 3.6 0 1 0 3.6 3.6V3.6h-3v20.95a3.61 3.61 0 0 0-.6-.45z" fill="#EE1D52" fill-opacity="0.6"/>
        </svg>
        <div style="min-width:0;">
          <div style="font-size:11px;font-weight:700;color:#ffffff;line-height:1.3;white-space:nowrap;">TikTok</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,0.55);line-height:1.3;white-space:nowrap;">@long.1412</div>
        </div>
      </a>
      <a href="http://paypal.me/doanlong1412" target="_blank" rel="noopener noreferrer"
        style="display:flex;align-items:center;gap:6px;flex:1;padding:7px 10px;
          border-radius:10px;text-decoration:none;cursor:pointer;
          background:linear-gradient(135deg,rgba(0,68,153,0.9) 0%,rgba(0,36,100,0.95) 100%);
          border:1px solid rgba(255,255,255,0.1);
          box-shadow:0 2px 8px rgba(0,0,0,0.3);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
          <path d="M19.5 6.5C19.5 9.5 17.5 11.5 14.5 11.5H12L11 16H8L10 6H14.5C17.3 6 19.5 4 19.5 6.5Z" fill="#009cde"/>
          <path d="M17.5 4C17.5 7 15.5 9 12.5 9H10L9 14H6L8 4H12.5C15.3 4 17.5 2 17.5 4Z" fill="#ffffff" fill-opacity="0.85"/>
          <path d="M7 16H4.5L6.5 6H9L7 16Z" fill="#ffffff" fill-opacity="0.5"/>
        </svg>
        <div style="min-width:0;">
          <div style="font-size:11px;font-weight:700;color:#ffffff;line-height:1.3;white-space:nowrap;">Donate ☕</div>
          <div style="font-size:9.5px;color:rgba(255,255,255,0.55);line-height:1.3;white-space:nowrap;">PayPal</div>
        </div>
      </a>
    </div>
    <div class="acc-wrap" style="margin-bottom:8px">
      <div class="acc-head" id="head-display">
        <span>${L.displayOpts}</span>
        <span class="acc-arrow" id="arrow-display">${isDispOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-display" style="display:${isDispOpen?'block':'none'}">

        <div class="opt-row">
          <label>${L.flowStyle}</label>
          <div class="bg">
            <div class="ob ${fs==='particle'?'on':''}" data-t="flow_style" data-v="particle">✦ Spark</div>
            <div class="ob ${fs==='wave'?'on':''}"     data-t="flow_style" data-v="wave">〰️ Wave</div>
            <div class="ob ${fs==='bubble'?'on':''}"   data-t="flow_style" data-v="bubble">● Bubble</div>
            <div class="ob ${fs==='line'?'on':''}"     data-t="flow_style" data-v="line">── Line</div>
          </div>
        </div>

        <div class="opt-row">
          <label>${L.language}</label>
          <div class="lang-grid" id="langGrid">
            ${[
              {v:'vi', flag:'<img src="https://flagcdn.com/16x12/vn.png" width="20" height="14" alt="VN"/> Tiếng Việt'},
              {v:'en', flag:'<img src="https://flagcdn.com/16x12/gb.png" width="20" height="14" alt="GB"/> English'},
              {v:'de', flag:'<img src="https://flagcdn.com/16x12/de.png" width="20" height="14" alt="DE"/> Deutsch'},
              {v:'it', flag:'<img src="https://flagcdn.com/16x12/it.png" width="20" height="14" alt="IT"/> Italiano'},
              {v:'fr', flag:'<img src="https://flagcdn.com/16x12/fr.png" width="20" height="14" alt="FR"/> Français'},
              {v:'nl', flag:'<img src="https://flagcdn.com/16x12/nl.png" width="20" height="14" alt="NL"/> Nederlands'},
              {v:'pl', flag:'<img src="https://flagcdn.com/16x12/pl.png" width="20" height="14" alt="PL"/> Polski'},
              {v:'sv', flag:'<img src="https://flagcdn.com/16x12/se.png" width="20" height="14" alt="SE"/> Svenska'},
              {v:'hu', flag:'<img src="https://flagcdn.com/16x12/hu.png" width="20" height="14" alt="HU"/> Magyar'},
              {v:'cs', flag:'<img src="https://flagcdn.com/16x12/cz.png" width="20" height="14" alt="CZ"/> Čeština'},
              {v:'sl', flag:'<img src="https://flagcdn.com/16x12/si.png" width="20" height="14" alt="SI"/> Slovenščina'},
            ].map(l=>`<div class="lang-btn ${lang===l.v?'on':''}" data-lang="${l.v}">${l.flag}</div>`).join('')}
          </div>
        </div>

        <div class="sl-row">
          <label>${L.bgOpacity}</label>
          <input type="range" id="opS" min="0" max="100" value="${op}" step="5"/>
          <span class="slv" id="opV">${op}%</span>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showWeatherInfo}</label>
          <label class="tog"><input type="checkbox" id="infoTog" ${showInfo?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showTomorrow}</label>
          <label class="tog"><input type="checkbox" id="tmrTog" ${showTmr?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showForecastChart}</label>
          <label class="tog"><input type="checkbox" id="forecastChartTog" ${showForecastChart?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showHourlyStrip}</label>
          <label class="tog"><input type="checkbox" id="hourlyFcTog" ${showHourlyForecast?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="opt-row" style="margin-top:4px;margin-bottom:0">
          <label>${L.timeFormat}</label>
          <div class="bg">
            <div class="ob ${(this._config.time_format||'24h')==='24h'?'on':''}" data-t="time_format" data-v="24h">24h</div>
            <div class="ob ${this._config.time_format==='12h'?'on':''}"           data-t="time_format" data-v="12h">12h (AM/PM)</div>
          </div>
        </div>

        <div style="height:1px;background:var(--divider-color);margin:14px 0 12px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">👁️ ${L.language==='vi'?'ẨN / HIỆN CÁC PHẦN':'SHOW / HIDE SECTIONS'}</div>

        <div class="toggle-row">
          <label class="tl">${L.showClock||'🕐 Show clock & weather'}</label>
          <label class="tog"><input type="checkbox" id="showClockTog" ${this._config.show_clock!==false?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showRoomsSection||'🏠 Show rooms / devices'}</label>
          <label class="tog"><input type="checkbox" id="showRoomsTog" ${this._config.show_rooms_section!==false?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row">
          <label class="tl">${L.showBatteryBar||'🔋 Show battery bar'}</label>
          <label class="tog"><input type="checkbox" id="showBatteryBarTog" ${this._config.show_battery_bar!==false?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row" style="margin-bottom:0">
          <label class="tl">${L.showStatsCircles||'📊 Show stats circles'}</label>
          <label class="tog"><input type="checkbox" id="showStatsCirclesTog" ${this._config.show_stats_circles!==false?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div class="toggle-row" style="margin-top:12px;margin-bottom:0">
          <label class="tl">${L.showBatteryNode||'🔋 Show Battery node'}</label>
          <label class="tog"><input type="checkbox" id="showBatteryNodeTog" ${this._config.show_battery_node!==false?'checked':''}/><span class="tog-sl"></span></label>
        </div>

        <div style="height:1px;background:var(--divider-color);margin:14px 0 12px"></div>
        <div class="opt-row" style="margin-bottom:0">
          <label>${L.tempUnit||'🌡️ Temperature unit'}</label>
          <div class="bg">
            <div class="ob ${(this._config.temp_unit||'C')==='C'?'on':''}" data-t="temp_unit" data-v="C">°C Celsius</div>
            <div class="ob ${this._config.temp_unit==='F'?'on':''}"         data-t="temp_unit" data-v="F">°F Fahrenheit</div>
          </div>
        </div>

      </div>
    </div>

    <!-- ENTITY SECTIONS -->
    ${SolarWeatherCardEditor.SECTIONS.map(s=>this._sectionHTML(s)).join('')}

    <!-- ROOMS accordion -->
    ${(()=>{
      const isRoomsOpen=this._open['rooms']||false;
      const cfgR=this._config.rooms||[];
      const roomCount=Math.min(6,Math.max(2,parseInt(this._config.room_count??4)));
      const defIcons=['🛋️','🍳','🔥','💻','🛏️','🧺'];
      const defNames=lang==='vi'?['Phòng khách','Phòng bếp','Bếp từ','Office','Phòng ngủ','Giặt ủi']:['Living Room','Kitchen','Induction','Office','Bedroom','Laundry'];
      let body='';
      for(let ri=0;ri<roomCount;ri++){
        const rm=cfgR[ri]||{};
        body+=`<div style="background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:10px 12px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:700;color:var(--primary-color);margin-bottom:8px;">Room ${ri+1}</div>
          <div class="row"><label>${lang==='vi'?'📝 Tên phòng':'📝 Room name'}</label>
            <input type="text" class="room-name" data-ri="${ri}" placeholder="${defNames[ri]}" value="${rm.name||''}"/></div>
          <div class="row"><label>${lang==='vi'?'🎨 Icon (emoji)':'🎨 Icon (emoji)'}</label>
            <input type="text" class="room-icon" data-ri="${ri}" placeholder="${defIcons[ri]}" value="${rm.icon||''}"/></div>
          <div class="row"><label>${lang==='vi'?'⚡ Entity công suất (W/kW)':'⚡ Power entity (W/kW)'}</label>
            <ha-entity-picker class="room-entity" data-ri="${ri}" data-domain="sensor" allow-custom-entity></ha-entity-picker></div>
        </div>`;
      }
      return `<div class="acc-wrap">
        <div class="acc-head" id="head-rooms">
          <span>🏠 ${lang==='vi'?`Cấu hình phòng (${roomCount} phòng)`:`Room configuration (${roomCount} rooms)`}</span>
          <span class="acc-arrow" id="arrow-rooms">${isRoomsOpen?'▾':'▸'}</span>
        </div>
        <div class="acc-body" id="body-rooms" style="display:${isRoomsOpen?'block':'none'}">
          <div class="sl-row" style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:600;color:var(--secondary-text-color);min-width:120px">${lang==='vi'?'🏠 Số phòng':'🏠 Room count'}</label>
            <input type="range" id="roomCountSl" min="2" max="6" value="${roomCount}" step="1"/>
            <span class="slv" id="roomCountV">${roomCount}</span>
          </div>
          <div class="hint" style="margin-bottom:10px">${lang==='vi'?'Hiển thị phòng/thiết bị bên dưới sơ đồ. Để trống = dùng tên mặc định.':'Shows rooms/devices below the energy diagram. Leave empty = use defaults.'}</div>
          ${body}
          <!-- ROOM LAYOUT POSITION SECTION -->
          <div style="background:var(--secondary-background-color);border:1px solid var(--primary-color,#03a9f4);border-radius:10px;padding:12px 14px;margin-top:8px;">
            <div style="font-size:12px;font-weight:700;color:var(--primary-color);margin-bottom:6px;">${L.roomLayoutTitle||'📐 Room Positions (X/Y)'}</div>
            <div class="hint" style="margin-bottom:12px">${L.roomLayoutHint||'Offset each room freely. Negative Y = move up (flow adapts). Reset restores default.'}</div>
            ${Array.from({length:roomCount},(_,ri)=>{
              const offs=(this._config.room_offsets||[])[ri]||{};
              const ox=offs.x??0, oy=offs.y??0;
              return `<div style="background:var(--card-background-color,#fff);border:1px solid var(--divider-color);border-radius:8px;padding:8px 10px;margin-bottom:8px;">
                <div style="font-size:11px;font-weight:700;color:var(--primary-color);margin-bottom:6px;">Room ${ri+1}</div>
                <div class="sl-row" style="margin-bottom:6px">
                  <label style="font-size:11px;min-width:28px">${L.roomOffsetX||'↔ X'}</label>
                  <input type="range" class="room-ox" data-ri="${ri}" min="-160" max="160" value="${ox}" step="1"/>
                  <span class="slv room-oxv" data-ri="${ri}">${ox}</span>
                </div>
                <div class="sl-row" style="margin-bottom:4px">
                  <label style="font-size:11px;min-width:28px">${L.roomOffsetY||'↕ Y'}</label>
                  <input type="range" class="room-oy" data-ri="${ri}" min="-350" max="80" value="${oy}" step="1"/>
                  <span class="slv room-oyv" data-ri="${ri}">${oy}</span>
                </div>
                <button class="room-reset-pos" data-ri="${ri}" style="margin-top:4px;padding:4px 10px;border-radius:6px;border:1px solid var(--divider-color);background:var(--secondary-background-color);font-size:11px;cursor:pointer;color:var(--primary-text-color)">${L.roomResetPos||'↺ Reset'}</button>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    })()}

    <!-- PRICING accordion -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-pricing">
        <span>${L.pricingTitle}</span>
        <span class="acc-arrow" id="arrow-pricing">${isPricingOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-pricing" style="display:${isPricingOpen?'block':'none'}">
        <div class="row">
          <label>${L.currencyLabel}</label>
          <input type="text" id="curInput" placeholder="đ / € / $ / £ ..." value="${cur}" style="font-family:inherit"/>
        </div>
        <div class="row">
          <label>${L.pricingTiersLabel}</label>
          <input type="text" id="tiersInput" placeholder="50:0.10,100:0.15,∞:0.30" value="${customTiers}"/>
          <div class="hint">${L.pricingHint}</div>
        </div>
      </div>
    </div>

    <!-- LAYOUT accordion -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-layout">
        <span>${L.layoutTitle}</span>
        <span class="acc-arrow" id="arrow-layout">${isLayoutOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-layout" style="display:${isLayoutOpen?'block':'none'}">
        <div class="hint" style="margin-bottom:10px">${L.layoutHint}</div>
        <div class="sl-row">
          <label>${L.batNodeX}</label>
          <input type="range" id="batXSl" min="-50" max="80" value="${batX}" step="1"/>
          <span class="slv" id="batXV">${batX}</span>
        </div>
        <div class="sl-row" style="margin-top:6px">
          <label>${L.grdNodeX}</label>
          <input type="range" id="grdXSl" min="214" max="345" value="${grdX}" step="1"/>
          <span class="slv" id="grdXV">${grdX}</span>
        </div>
        <div class="sl-row" style="margin-top:6px">
          <label>${L.invNodeY}</label>
          <input type="range" id="invYSl" min="140" max="300" value="${invY}" step="5"/>
          <span class="slv" id="invYV">${invY}</span>
        </div>
        <div class="sl-row" style="margin-top:6px">
          <label>${L.homNodeY}</label>
          <input type="range" id="homYSl" min="300" max="480" value="${homY}" step="5"/>
          <span class="slv" id="homYV">${homY}</span>
        </div>
        <div class="sl-row" style="margin-top:6px">
          <label>${L.nodeScale}</label>
          <input type="range" id="nodeScSl" min="0.5" max="1.2" value="${this._config.node_scale??1.0}" step="0.05"/>
          <span class="slv" id="nodeScV">${((this._config.node_scale??1.0)*100).toFixed(0)}%</span>
        </div>
        <div class="sl-row" style="margin-top:6px">
          <label>${L.particleDensity}</label>
          <input type="range" id="partMSl" min="0.2" max="1.0" value="${this._config.particle_mult??1.0}" step="0.1"/>
          <span class="slv" id="partMV">${Math.round((this._config.particle_mult??1.0)*100)}%</span>
        </div>
        <div class="hint" style="margin-top:8px">${L.layoutDefault}</div>
      </div>
    </div>

    <!-- COLOR THEME accordion -->
    <div class="acc-wrap">
      <div class="acc-head" id="head-color">
        <span>${L.colorTitle}</span>
        <span class="acc-arrow" id="arrow-color">${isColorOpen?'▾':'▸'}</span>
      </div>
      <div class="acc-body" id="body-color" style="display:${isColorOpen?'block':'none'}">
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:8px;letter-spacing:.4px">${L.bgGradient}</div>
        <div class="opt-row" style="margin-bottom:8px">
          <label>${L.preset}</label>
          <div class="bg" style="flex-wrap:wrap;gap:5px;">
            ${[
              {v:'default',  l:'🌊 Default'},
              {v:'night',    l:'🌌 Night'},
              {v:'sunset',   l:'🌅 Sunset'},
              {v:'forest',   l:'🌿 Forest'},
              {v:'aurora',   l:'🔮 Aurora'},
              {v:'desert',   l:'🏜️ Desert'},
              {v:'ocean',    l:'🌊 Ocean'},
              {v:'custom',   l:'✏️ Custom'},
            ].map(p=>`<div class="ob ${bgPreset===p.v?'on':''}" data-t="bg_preset" data-v="${p.v}" style="flex:none;padding:6px 10px;">${p.l}</div>`).join('')}
          </div>
        </div>
        ${bgPreset==='custom'?`
        <div style="background:var(--secondary-background-color);border-radius:8px;padding:10px 12px;border:1px solid var(--divider-color);margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="flex:1">
              <label style="font-size:11px;color:var(--secondary-text-color);display:block;margin-bottom:4px;">${L.color1}</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input type="color" id="bgColor1" value="${bgColor1}" style="width:36px;height:28px;border:none;background:none;cursor:pointer;padding:0;border-radius:4px;"/>
                <span style="font-size:11px;font-family:monospace;color:var(--primary-text-color);">${bgColor1}</span>
              </div>
            </div>
            <div style="flex:1">
              <label style="font-size:11px;color:var(--secondary-text-color);display:block;margin-bottom:4px;">${L.color2}</label>
              <div style="display:flex;align-items:center;gap:6px;">
                <input type="color" id="bgColor2" value="${bgColor2}" style="width:36px;height:28px;border:none;background:none;cursor:pointer;padding:0;border-radius:4px;"/>
                <span style="font-size:11px;font-family:monospace;color:var(--primary-text-color);">${bgColor2}</span>
              </div>
            </div>
          </div>
          <div id="bgGradPreview" style="height:28px;border-radius:6px;background:linear-gradient(135deg,${bgColor1},${bgColor2});border:1px solid rgba(255,255,255,.15);"></div>
        </div>`:''}
        <div style="height:1px;background:var(--divider-color);margin:10px 0 10px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${L.nodeBorderColors}</div>
        <div class="color-grid">
          <div class="color-item"><label>🔋 Battery</label><div class="color-preview-wrap"><input type="color" id="c_node_bat" value="${colorBat}" data-ck="color_node_bat"/><span class="color-hex">${colorBat}</span></div></div>
          <div class="color-item"><label>🔌 Grid</label><div class="color-preview-wrap"><input type="color" id="c_node_grd" value="${colorGrd}" data-ck="color_node_grd"/><span class="color-hex">${colorGrd}</span></div></div>
          <div class="color-item"><label>⚙️ Inverter</label><div class="color-preview-wrap"><input type="color" id="c_node_inv" value="${colorInv}" data-ck="color_node_inv"/><span class="color-hex">${colorInv}</span></div></div>
          <div class="color-item"><label>🏠 Home</label><div class="color-preview-wrap"><input type="color" id="c_node_hom" value="${colorHom}" data-ck="color_node_hom"/><span class="color-hex">${colorHom}</span></div></div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 10px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${L.flowColors}</div>
        <div class="color-grid">
          <div class="color-item"><label>☀️ Solar flow</label><div class="color-preview-wrap"><input type="color" id="c_flow_solar" value="${colorSolar}" data-ck="color_flow_solar"/><span class="color-hex">${colorSolar}</span></div></div>
          <div class="color-item"><label>🔌 Grid flow</label><div class="color-preview-wrap"><input type="color" id="c_flow_grid" value="${colorGrid}" data-ck="color_flow_grid"/><span class="color-hex">${colorGrid}</span></div></div>
          <div class="color-item"><label>🔋 Battery flow</label><div class="color-preview-wrap"><input type="color" id="c_flow_batt" value="${colorBatt}" data-ck="color_flow_batt"/><span class="color-hex">${colorBatt}</span></div></div>
          <div class="color-item"><label>🏠 Home flow</label><div class="color-preview-wrap"><input type="color" id="c_flow_home" value="${colorHome}" data-ck="color_flow_home"/><span class="color-hex">${colorHome}</span></div></div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 10px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${L.chartColors}</div>
        <div class="color-grid">
          <div class="color-item"><label>${L.fcLine}</label><div class="color-preview-wrap"><input type="color" id="c_chart_fc" value="${colorChartFc}" data-ck="color_chart_fc"/><span class="color-hex">${colorChartFc}</span></div></div>
          <div class="color-item"><label>${L.liveActualLine}</label><div class="color-preview-wrap"><input type="color" id="c_chart_live" value="${colorChartLive}" data-ck="color_chart_live"/><span class="color-hex">${colorChartLive}</span></div></div>
        </div>
        <div style="height:1px;background:var(--divider-color);margin:10px 0 10px"></div>
        <div style="font-size:11px;font-weight:700;color:var(--secondary-text-color);margin-bottom:10px;letter-spacing:.4px">${L.textColor}</div>
        <div class="color-grid">
          <div class="color-item"><label>${L.primaryText}</label><div class="color-preview-wrap"><input type="color" id="c_text_primary" value="${colorText}" data-ck="color_text_primary"/><span class="color-hex">${colorText}</span></div></div>
        </div>
        <div style="margin-top:10px">
          <button id="resetColors" style="padding:7px 14px;border-radius:8px;border:1.5px solid var(--divider-color);background:var(--secondary-background-color);font-size:12px;cursor:pointer;color:var(--primary-text-color)">${L.resetColors}</button>
        </div>
      </div>
    </div>`;

    // ── Accordion toggles ───────────────────────────────────────
    // ── Add fr to isParticle/wave/line check too
    ['display','weather','solar','battery','grid','stats','rooms','pricing','layout','color'].forEach(id=>{
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

    // ── Option buttons (flow_style, battery_mode, grid_mode, battery_unit, grid_unit) ──
    this.shadowRoot.querySelectorAll('.ob[data-t]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        this._config={...this._config,[btn.dataset.t]:btn.dataset.v};
        this._fire(); this._render();
      });
    });

    // ── Battery invert toggle ──
    const battInvTog=this.shadowRoot.getElementById('battInvTog');
    if(battInvTog) battInvTog.addEventListener('change',e=>{
      this._config={...this._config,battery_invert:e.target.checked}; this._fire(); this._render();
    });

    // ── Grid invert toggle ──
    const gridInvTog=this.shadowRoot.getElementById('gridInvTog');
    if(gridInvTog) gridInvTog.addEventListener('change',e=>{
      this._config={...this._config,grid_invert:e.target.checked}; this._fire(); this._render();
    });

    // ── Opacity ─────────────────────────────────────────────────
    const sl=this.shadowRoot.getElementById('opS'),ov=this.shadowRoot.getElementById('opV');
    sl.addEventListener('input',e=>ov.textContent=e.target.value+'%');
    sl.addEventListener('change',e=>{ this._config={...this._config,background_opacity:parseInt(e.target.value)}; this._fire(); });

    // ── Node position sliders ──────────────────────────────
    const batXSl=this.shadowRoot.getElementById('batXSl');
    if(batXSl){
      batXSl.addEventListener('input',e=>{
        this.shadowRoot.getElementById('batXV').textContent=e.target.value;
      });
      batXSl.addEventListener('change',e=>{
        this._config={...this._config,node_bat_x:parseInt(e.target.value)};
        this._fire();
      });
    }
    const grdXSl=this.shadowRoot.getElementById('grdXSl');
    if(grdXSl){
      grdXSl.addEventListener('input',e=>{
        this.shadowRoot.getElementById('grdXV').textContent=e.target.value;
      });
      grdXSl.addEventListener('change',e=>{
        this._config={...this._config,node_grd_x:parseInt(e.target.value)};
        this._fire();
      });
    }
    const invYSl=this.shadowRoot.getElementById('invYSl');
    if(invYSl){
      invYSl.addEventListener('input',e=>{ this.shadowRoot.getElementById('invYV').textContent=e.target.value; });
      invYSl.addEventListener('change',e=>{ this._config={...this._config,node_inv_y:parseInt(e.target.value)}; this._fire(); });
    }
    const homYSl=this.shadowRoot.getElementById('homYSl');
    if(homYSl){
      homYSl.addEventListener('input',e=>{ this.shadowRoot.getElementById('homYV').textContent=e.target.value; });
      homYSl.addEventListener('change',e=>{ this._config={...this._config,node_hom_y:parseInt(e.target.value)}; this._fire(); });
    }
    const nodeScSl=this.shadowRoot.getElementById('nodeScSl');
    if(nodeScSl){
      nodeScSl.addEventListener('input',e=>{
        this.shadowRoot.getElementById('nodeScV').textContent=Math.round(e.target.value*100)+'%';
      });
      nodeScSl.addEventListener('change',e=>{
        this._config={...this._config,node_scale:parseFloat(e.target.value)};
        this._fire();
      });
    }
    const partMSl=this.shadowRoot.getElementById('partMSl');
    if(partMSl){
      partMSl.addEventListener('input',e=>{
        this.shadowRoot.getElementById('partMV').textContent=Math.round(e.target.value*100)+'%';
      });
      partMSl.addEventListener('change',e=>{
        this._config={...this._config,particle_mult:parseFloat(e.target.value)};
        this._fire();
      });
    }

    // ── Toggles ─────────────────────────────────────────────────
    this.shadowRoot.getElementById('infoTog').addEventListener('change',e=>{
      this._config={...this._config,show_weather_info:e.target.checked}; this._fire();
    });
    this.shadowRoot.getElementById('tmrTog').addEventListener('change',e=>{
      this._config={...this._config,show_tomorrow:e.target.checked}; this._fire();
    });
    this.shadowRoot.getElementById('forecastChartTog').addEventListener('change',e=>{
      this._config={...this._config,show_forecast_chart:e.target.checked}; this._fire();
    });
    const hourlyFcTog=this.shadowRoot.getElementById('hourlyFcTog');
    if(hourlyFcTog) hourlyFcTog.addEventListener('change',e=>{
      this._config={...this._config,show_hourly_forecast:e.target.checked}; this._fire();
    });
    const showClockTog=this.shadowRoot.getElementById('showClockTog');
    if(showClockTog) showClockTog.addEventListener('change',e=>{
      this._config={...this._config,show_clock:e.target.checked}; this._fire();
    });
    const showRoomsTog=this.shadowRoot.getElementById('showRoomsTog');
    if(showRoomsTog) showRoomsTog.addEventListener('change',e=>{
      this._config={...this._config,show_rooms_section:e.target.checked}; this._fire();
    });
    const showBatteryBarTog=this.shadowRoot.getElementById('showBatteryBarTog');
    if(showBatteryBarTog) showBatteryBarTog.addEventListener('change',e=>{
      this._config={...this._config,show_battery_bar:e.target.checked}; this._fire();
    });
    const showStatsCirclesTog=this.shadowRoot.getElementById('showStatsCirclesTog');
    if(showStatsCirclesTog) showStatsCirclesTog.addEventListener('change',e=>{
      this._config={...this._config,show_stats_circles:e.target.checked}; this._fire();
    });
    const showBatteryNodeTog=this.shadowRoot.getElementById('showBatteryNodeTog');
    if(showBatteryNodeTog) showBatteryNodeTog.addEventListener('change',e=>{
      this._config={...this._config,show_battery_node:e.target.checked}; this._fire();
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

    // ── Solar design capacity ─────────────────────────────────
    const solarWpInp=this.shadowRoot.getElementById('solarDesignWpInput');
    if(solarWpInp) solarWpInp.addEventListener('change',e=>{
      const v=parseInt(e.target.value);
      const c={...this._config};
      if(v>0) c.solar_design_wp=v; else delete c.solar_design_wp;
      this._config=c; this._fire();
    });

    // ── Color pickers ────────────────────────────────────────
    this.shadowRoot.querySelectorAll('input[type=color][data-ck]').forEach(inp=>{
      inp.addEventListener('input',e=>{
        const hex=e.target.value;
        const span=e.target.parentElement.querySelector('.color-hex');
        if(span) span.textContent=hex;
      });
      inp.addEventListener('change',e=>{
        const k=e.target.dataset.ck, v=e.target.value;
        this._config={...this._config,[k]:v}; this._fire();
      });
    });

    // ── Reset colors ─────────────────────────────────────────
    const resetBtn=this.shadowRoot.getElementById('resetColors');
    if(resetBtn) resetBtn.addEventListener('click',()=>{
      const c={...this._config};
      ['color_node_bat','color_node_grd','color_node_inv','color_node_hom',
       'color_flow_solar','color_flow_grid','color_flow_batt','color_flow_home',
       'color_chart_fc','color_chart_live','color_text_primary',
       'bg_preset','bg_custom','bg_color1','bg_color2'].forEach(k=>delete c[k]);
      this._config=c; this._fire(); this._render();
    });

    // ── BG custom color pickers ──────────────────────────────
    const bgC1=this.shadowRoot.getElementById('bgColor1');
    const bgC2=this.shadowRoot.getElementById('bgColor2');
    const _updateBgGradient=()=>{
      const c1=this._config.bg_color1||'#001e2b';
      const c2=this._config.bg_color2||'#002832';
      const prev=this.shadowRoot.getElementById('bgGradPreview');
      if(prev) prev.style.background=`linear-gradient(135deg,${c1},${c2})`;
      this._config={...this._config,bg_custom:`linear-gradient(135deg,${c1},${c2})`};
      this._fire();
    };
    if(bgC1){
      bgC1.addEventListener('input',e=>{
        const span=e.target.nextElementSibling; if(span) span.textContent=e.target.value;
        const prev=this.shadowRoot.getElementById('bgGradPreview');
        const c2=this._config.bg_color2||'#002832';
        if(prev) prev.style.background=`linear-gradient(135deg,${e.target.value},${c2})`;
      });
      bgC1.addEventListener('change',e=>{
        this._config={...this._config,bg_color1:e.target.value}; _updateBgGradient();
      });
    }
    if(bgC2){
      bgC2.addEventListener('input',e=>{
        const span=e.target.nextElementSibling; if(span) span.textContent=e.target.value;
        const prev=this.shadowRoot.getElementById('bgGradPreview');
        const c1=this._config.bg_color1||'#001e2b';
        if(prev) prev.style.background=`linear-gradient(135deg,${c1},${e.target.value})`;
      });
      bgC2.addEventListener('change',e=>{
        this._config={...this._config,bg_color2:e.target.value}; _updateBgGradient();
      });
    }

    // ── Rooms inputs ─────────────────────────────────────────────
    const roomCountSl=this.shadowRoot.getElementById('roomCountSl');
    if(roomCountSl){
      roomCountSl.addEventListener('input',e=>{
        this.shadowRoot.getElementById('roomCountV').textContent=e.target.value;
      });
      roomCountSl.addEventListener('change',e=>{
        this._config={...this._config,room_count:parseInt(e.target.value)};
        this._fire();
        // Re-render to show/hide room fields
        this._render();
        requestAnimationFrame(()=>this._syncPickers());
      });
    }
    // ── Room X/Y offset sliders ─────────────────────────────────
    const _getRoomOffsets=()=>{
      const maxR=Math.min(6,Math.max(2,parseInt(this._config.room_count??4)));
      const offs=[...(this._config.room_offsets||Array.from({length:maxR},()=>({x:0,y:0})))];
      while(offs.length<maxR) offs.push({x:0,y:0});
      return offs;
    };
    this.shadowRoot.querySelectorAll('.room-ox').forEach(sl=>{
      sl.addEventListener('input',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const sp=this.shadowRoot.querySelector(`.room-oxv[data-ri="${ri}"]`);
        if(sp) sp.textContent=e.target.value;
      });
      sl.addEventListener('change',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const offs=_getRoomOffsets();
        offs[ri]={...offs[ri],x:parseInt(e.target.value)};
        this._config={...this._config,room_offsets:offs}; this._fire();
      });
    });
    this.shadowRoot.querySelectorAll('.room-oy').forEach(sl=>{
      sl.addEventListener('input',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const sp=this.shadowRoot.querySelector(`.room-oyv[data-ri="${ri}"]`);
        if(sp) sp.textContent=e.target.value;
      });
      sl.addEventListener('change',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const offs=_getRoomOffsets();
        offs[ri]={...offs[ri],y:parseInt(e.target.value)};
        this._config={...this._config,room_offsets:offs}; this._fire();
      });
    });
    this.shadowRoot.querySelectorAll('.room-reset-pos').forEach(btn=>{
      btn.addEventListener('click',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const offs=_getRoomOffsets();
        offs[ri]={x:0,y:0};
        this._config={...this._config,room_offsets:offs}; this._fire(); this._render();
      });
    });
    this.shadowRoot.querySelectorAll('.room-name,.room-icon').forEach(inp=>{
      inp.addEventListener('change',e=>{
        const ri=parseInt(e.target.dataset.ri);
        const isName=e.target.classList.contains('room-name');
        const c={...this._config};
        const maxR=Math.min(6,Math.max(2,parseInt(c.room_count??4)));
        const rooms=[...(c.rooms||Array.from({length:maxR},()=>({})))];
        while(rooms.length<maxR) rooms.push({});
        rooms[ri]={...rooms[ri],[isName?'name':'icon']:e.target.value.trim()};
        c.rooms=rooms; this._config=c; this._fire();
      });
    });
    this.shadowRoot.querySelectorAll('.room-entity').forEach(picker=>{
      picker.addEventListener('value-changed',e=>{
        const ri=parseInt(picker.dataset.ri);
        const c={...this._config};
        const maxR=Math.min(6,Math.max(2,parseInt(c.room_count??4)));
        const rooms=[...(c.rooms||Array.from({length:maxR},()=>({})))];
        while(rooms.length<maxR) rooms.push({});
        rooms[ri]={...rooms[ri],entity:e.detail.value||''};
        c.rooms=rooms; this._config=c; this._fire();
      });
    });

    // ── ha-entity-picker events ─────────────────────────────────
    this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(picker=>{
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
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this._hass=null;
    this._config={};
    this._iv=null;
    this._raf=null;
    this._lastSig=null;
    this._animSig=null;   // signature riêng cho anim layer
    this._animStart=null;
    this._shellReady=false; // đã tạo shell (anim + data layers) chưa
  }

  static getConfigElement(){ return document.createElement('solar-weather-card-editor'); }
  static getStubConfig(){
    return {
      flow_style:'particle', language:'vi', background_opacity:45,
      battery_mode:'single', battery_invert:false, battery_unit:'auto',
      grid_mode:'single', grid_invert:false, grid_unit:'auto',
      solar_unit:'auto', home_unit:'auto', solar_design_wp:8000,
      show_weather_info:true, show_tomorrow:true, show_node_glow:true, show_forecast_chart:true,
      show_hourly_forecast:true, minimal_mode:false,
      bg_preset:'default', bg_custom:'',
      currency:'đ', pricing_tiers:'',
      weather_entity:'', temperature_entity:'', humidity_entity:'',
      pressure_entity:'', uv_entity:'', hourly_forecast_entity:'',
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

  setConfig(c){
    this._config=c||{};
    this._lastSig=null;
    this._animSig=null;   // force anim layer rebuild khi config thay đổi
    if(this._hass) this._schedRender();
  }
  set hass(h){
    this._hass=h;
    this._schedRender();
  }
  connectedCallback(){
    // Clock update mỗi 30s — chỉ update DOM clock, không render lại toàn bộ
    this._iv=setInterval(()=>this._tickClock(),30000);
    this._schedRender();
  }
  disconnectedCallback(){
    if(this._iv) clearInterval(this._iv);
    if(this._raf) cancelAnimationFrame(this._raf);
    this._shellReady=false;
    this._animNode=null;
  }
  // Debounce render — double-rAF: gộp nhiều hass update liên tiếp thành 1 lần render,
  // tránh render giữa chừng khi HA push nhiều state cùng 1 frame
  _schedRender(){
    if(this._raf) cancelAnimationFrame(this._raf);
    this._raf=requestAnimationFrame(()=>{
      this._raf=requestAnimationFrame(()=>{ this._raf=null; this._smartRender(); });
    });
  }
  // Chỉ render khi giá trị sensor thực sự thay đổi
  _smartRender(){
    const sig=this._buildSig();
    if(sig===this._lastSig) return; // không có gì thay đổi
    this._lastSig=sig;
    this._render();
  }  _buildSig(){
    if(!this._hass||!this._config) return '';
    const keys=[
      'solar_pv1_entity','solar_pv2_entity',
      'battery_soc_entity','battery_flow_entity','battery_charge_entity','battery_discharge_entity',
      'grid_flow_entity','grid_import_entity','grid_export_entity',
      'home_consumption_entity','inverter_switch_entity','grid_direct_entity',
      'weather_entity','temperature_entity','humidity_entity',
      'pressure_entity','uv_entity',
      'solar_today_entity','solar_dailyuse_entity','solar_live_entity',
      'solcast_today_entity','solcast_tomorrow_entity','solcast_detail_entity',
      'solar_live_curve_entity','grid_today_entity','consumption_today_entity',
      'grid_export_today_entity',
      'inverter_status_entity','battery_voltage_entity',
      'battery_temp_entity','inverter_temp_entity',
      'hourly_forecast_entity',
    ];
    // Với weather_entity: track thêm last_changed để bắt forecast attribute update
    const weatherId=this._config.weather_entity;
    const weatherExtra=weatherId&&this._hass.states[weatherId]
      ?this._hass.states[weatherId].last_changed||''
      :'';
    // Với hourly_forecast_entity: track last_changed thay vì toàn bộ state (state luôn là JSON lớn)
    const hourlyId=this._config.hourly_forecast_entity;
    const hourlyExtra=hourlyId&&this._hass.states[hourlyId]
      ?this._hass.states[hourlyId].last_changed||''
      :'';
    return keys.map(k=>{
      const id=this._config[k]; if(!id) return '';
      // hourly_forecast_entity dùng last_changed thay vì state (state rất lớn, parse chậm)
      if(k==='hourly_forecast_entity') return hourlyExtra;
      const s=this._hass.states[id]; return s?s.state:'';
    }).join('|')+'|'+weatherExtra
      +'|'+(this._config.room_count??4)+'|'+(this._config.rooms||[]).map(r=>{
      const id=r&&r.entity; if(!id||!this._hass) return '';
      const s=this._hass.states[id]; return s?s.state:'';
    }).join('|')+'|'+(JSON.stringify(this._config.room_offsets||[]));
  }

  // Signature cho anim layer — chỉ thay đổi khi layout/màu/style thay đổi
  // (không phụ thuộc vào giá trị sensor thực tế)
  _buildAnimSig(){
    const c=this._config;
    return [
      c.flow_style||'particle',
      c.node_bat_x??-40, c.node_grd_x??295,
      c.node_inv_y??220,  c.node_hom_y??400,
      c.node_scale??1.0,
      c.room_count??4,
      JSON.stringify(c.room_offsets||[]),
      c.color_flow_solar||'', c.color_flow_grid||'',
      c.color_flow_batt||'',  c.color_flow_home||'',
      c.particle_mult??1.0,
      c.minimal_mode===true?'1':'0',
      // sensor keys: khi entity được thêm/xóa cần rebuild path
      c.solar_pv1_entity||'', c.solar_pv2_entity||'',
      c.battery_flow_entity||'', c.battery_charge_entity||'', c.battery_discharge_entity||'',
      c.grid_flow_entity||'', c.grid_import_entity||'', c.grid_export_entity||'',
      c.home_consumption_entity||'', c.inverter_switch_entity||'', c.grid_direct_entity||'',
      (c.rooms||[]).map(r=>r&&r.entity||'').join(','),
    ].join('|');
  }
  // Chỉ update đồng hồ mà không render lại SVG
  _tickClock(){
    if(!this.shadowRoot) return;
    const now=new Date();
    let h=now.getHours(),m=now.getMinutes();
    const ap=h>=12?'PM':'AM'; h=h%12||12;
    const hh=String(h).padStart(2,'0'),mm=String(m).padStart(2,'0');
    const clockEl=this.shadowRoot.querySelector('#live-clock');
    if(clockEl) clockEl.textContent=`${hh}:${mm}`;
    const apEl=this.shadowRoot.querySelector('#live-ap');
    if(apEl) apEl.textContent=ap;
  }
  getCardSize(){ return 14; }

  // ── Two-layer DOM helpers ────────────────────────────────────
  // Trả về flow SVG element đang sống (nếu có)
  _getAnimLayer(){ return this.shadowRoot.getElementById('swc-flow-svg'); }
  // Các zone update độc lập — không bao giờ xóa wrap/anim
  _getTopLayer(){    return this.shadowRoot.getElementById('swc-top'); }
  _getBotLayer(){    return this.shadowRoot.getElementById('swc-bot'); }
  _getSunBar(){      return this.shadowRoot.getElementById('swc-sun-bar'); }
  _getSvgData(){     return this.shadowRoot.getElementById('swc-svg-data'); }
  // Legacy alias — giữ để không break các chỗ khác nếu có
  _getDataLayer(){   return this.shadowRoot.getElementById('swc-top'); }

  // Inject hoặc reuse flow SVG trong .swc-svg-wrap
  // needRebuild=true  → tạo SVG mới (layout/màu/style thay đổi)
  // needRebuild=false → chỉ appendChild SVG cũ vào wrap mới (wrap vừa bị data innerHTML tạo lại)
  //                     SVG cũ vẫn giữ nguyên, animation KHÔNG bị reset
  _injectAnimLayer(FL, fpDefs, svgH, needRebuild, vbX, vbW){
    const wrap=this.shadowRoot.querySelector('.swc-svg-wrap');
    if(!wrap) return;
    // Nếu không cần rebuild và SVG cũ còn tồn tại: chỉ move nó vào wrap mới
    if(!needRebuild && this._animNode){
      // Cập nhật viewBox nếu layout thay đổi (node positions)
      if(this._animNode.getAttribute('viewBox')!==`${vbX} 0 ${vbW} ${svgH}`){
        this._animNode.setAttribute('viewBox',`${vbX} 0 ${vbW} ${svgH}`);
      }
      if(!this._animNode.isConnected) wrap.appendChild(this._animNode);
      return;
    }
    // Tạo mới SVG bằng DOM API (không dùng innerHTML để có thể cache node)
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');
    svg.id='swc-flow-svg';
    svg.setAttribute('viewBox',`${vbX} 0 ${vbW} ${svgH}`);
    svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible;will-change:transform;pointer-events:none;z-index:3;';
    svg.innerHTML=`<defs>
      <filter id="swc-pBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id="swc-pBlurSm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5"/></filter>
      ${fpDefs}
    </defs>${FL}`;
    wrap.appendChild(svg);
    this._animNode=svg;
  }

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

  // Đọc 1 entity đơn giản với unit conversion về W nội bộ
  _readRawPower(entityKey, unitKey){
    const cfg=this._config;
    if(!cfg[entityKey]||!this._hass) return 0;
    const s=this._hass.states[cfg[entityKey]];
    if(!s||s.state==='unavailable'||s.state==='unknown') return 0;
    const v=parseFloat(s.state); if(isNaN(v)) return 0;
    // Lấy unit thực của sensor
    const sensorUnit=(s.attributes&&s.attributes.unit_of_measurement||'').trim();
    const unitCfg=cfg[unitKey]||'auto';
    // Luôn convert về W để tính toán
    if(unitCfg==='auto'){
      if(sensorUnit==='kW'||sensorUnit==='kilowatt') return v*1000;
      return v;
    } else if(unitCfg==='W'){
      if(sensorUnit==='kW'||sensorUnit==='kilowatt') return v*1000;
      return v;
    } else if(unitCfg==='kW'){
      // Sensor là W nhưng user muốn hiển thị kW — vẫn trả W nội bộ
      if(sensorUnit==='W'||sensorUnit==='watt'||sensorUnit==='') return v;
      return v*1000; // sensor là kW
    }
    return v;
  }

  // Đọc power sensor với đầy đủ xử lý: dual/single, invert, unit(W/kW)
  _readPower(type){
    const cfg=this._config;
    const _raw=(key)=>{
      if(!cfg[key]||!this._hass) return null;
      const s=this._hass.states[cfg[key]];
      if(!s||s.state==='unavailable'||s.state==='unknown') return null;
      const v=parseFloat(s.state); return isNaN(v)?null:v;
    };
    const _toW=(v,unitCfg,entityKey)=>{
      if(v===null) return 0;
      // Xác định unit thực tế của sensor
      let sensorUnit='W';
      if(entityKey&&cfg[entityKey]&&this._hass){
        const s=this._hass.states[cfg[entityKey]];
        if(s&&s.attributes&&s.attributes.unit_of_measurement){
          sensorUnit=s.attributes.unit_of_measurement.trim();
        }
      }
      // Auto: kW sensor → convert sang W để tính toán nội bộ
      // Nếu unitCfg='kW' và sensor là W → chuyển W→kW (hiển thị kW)
      // Nếu unitCfg='W' và sensor là kW → chuyển kW→W (hiển thị W)
      // Nếu unitCfg='auto': dùng unit thực của sensor
      if(unitCfg==='auto'||!unitCfg){
        // Luôn convert về W để tính toán flow/logic
        if(sensorUnit==='kW'||sensorUnit==='kilowatt') return v*1000;
        return v;
      } else if(unitCfg==='W'){
        if(sensorUnit==='kW'||sensorUnit==='kilowatt') return v*1000;
        return v;
      } else if(unitCfg==='kW'){
        if(sensorUnit==='W'||sensorUnit==='watt'||sensorUnit==='') return v/1000;
        return v; // đã là kW, giữ nguyên nhưng * 1000 để tính logic W
      }
      return v;
    };
    const _toWFixed=(v,unitCfg,entityKey)=>{
      // Như _toW nhưng luôn trả về W cho logic nội bộ
      const w=_toW(v,unitCfg,entityKey);
      if(unitCfg==='kW') return w*1000; // kW → W cho logic
      return w;
    };

    if(type==='battery'){
      const mode=cfg.battery_mode||'single';
      const inv=cfg.battery_invert||false;
      const unit=cfg.battery_unit||'auto';
      if(mode==='dual'){
        const ch=_raw('battery_charge_entity');
        const di=_raw('battery_discharge_entity');
        const chW=_toWFixed(ch,unit,'battery_charge_entity');
        const diW=_toWFixed(di,unit,'battery_discharge_entity');
        // charge=dương, discharge=âm
        if(chW>10) return chW;
        if(diW>10) return -diW;
        return 0;
      } else {
        const v=_raw('battery_flow_entity');
        let w=_toWFixed(v,unit,'battery_flow_entity');
        if(inv) w=-w;
        return w;
      }
    }

    if(type==='grid'){
      const mode=cfg.grid_mode||'single';
      const inv=cfg.grid_invert||false;
      const unit=cfg.grid_unit||'auto';
      if(mode==='dual'){
        const im=_raw('grid_import_entity');
        const ex=_raw('grid_export_entity');
        const imW=_toWFixed(im,unit,'grid_import_entity');
        const exW=_toWFixed(ex,unit,'grid_export_entity');
        // export=dương, import=âm (theo YAML gốc: +export/-import)
        if(exW>10) return exW;
        if(imW>10) return -imW;
        return 0;
      } else {
        const v=_raw('grid_flow_entity');
        let w=_toWFixed(v,unit,'grid_flow_entity');
        if(inv) w=-w;
        return w;
      }
    }
    return 0;
  }

  // Format giá trị W/kW để hiển thị theo unit config
  _fmtPower(watt, type){
    const cfg=this._config;
    const unitMap={battery:'battery_unit',grid:'grid_unit',solar:'solar_unit',home:'home_unit'};
    const unitKey=unitMap[type]||'battery_unit';
    const unit=cfg[unitKey]||'auto';
    if(unit==='kW') return (watt/1000).toFixed(2)+' kW';
    if(unit==='W')  return Math.round(watt)+'W';
    // auto: kW nếu >=1000W
    if(Math.abs(watt)>=1000) return (watt/1000).toFixed(1)+' kW';
    return Math.round(watt)+'W';
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

  // flowLevel với type + particle multiplier
  _flowLevel(w,type='default'){
    const mult=parseFloat(this._config.particle_mult??1.0);
    const _sc=(fl)=>{ return{...fl,count:Math.max(2,Math.round(fl.count*mult))}; };
    if(type==='solar'){
      if(w<200)  return _sc({dur:4.0,count:2, size:1.8}); if(w<600)  return _sc({dur:3.2,count:4, size:2.2});
      if(w<1200) return _sc({dur:2.7,count:5, size:2.5}); if(w<2500) return _sc({dur:2.4,count:6, size:2.8});
      if(w<4000) return _sc({dur:1.8,count:8, size:3.2}); if(w<6000) return _sc({dur:1.2,count:9, size:3.5});
      return _sc({dur:0.9,count:11,size:3.8});
    }
    if(type==='battery'||type==='grid'||type==='home'){
      if(w<150)  return _sc({dur:4.0,count:2, size:1.8}); if(w<500)  return _sc({dur:3.2,count:4, size:2.2});
      if(w<1000) return _sc({dur:2.7,count:5, size:2.5}); if(w<2000) return _sc({dur:2.4,count:6, size:2.8});
      if(w<3000) return _sc({dur:1.8,count:7, size:3.2}); if(w<4500) return _sc({dur:1.5,count:9, size:3.5});
      return _sc({dur:0.9,count:10,size:3.8});
    }
    if(type==='room'){
      if(w<50)   return _sc({dur:4.5,count:2, size:1.6}); if(w<200)  return _sc({dur:3.5,count:3, size:2.0});
      if(w<500)  return _sc({dur:3.2,count:4, size:2.3}); if(w<1000) return _sc({dur:2.9,count:5, size:2.6});
      if(w<2000) return _sc({dur:2.4,count:6, size:2.9}); if(w<3000) return _sc({dur:1.5,count:7, size:3.2});
      return _sc({dur:0.9,count:8, size:3.5});
    }
    if(w<200)  return _sc({dur:4.0,count:2, size:1.8}); if(w<600)  return _sc({dur:3.5,count:4, size:2.2});
    if(w<1200) return _sc({dur:3.0,count:5, size:2.5}); if(w<2500) return _sc({dur:2.5,count:6, size:2.8});
    if(w<4000) return _sc({dur:1.9,count:7, size:3.2}); if(w<6000) return _sc({dur:1.5,count:9, size:3.5});
    return _sc({dur:1.2,count:10,size:3.8});
  }

  // ── YAML-style particle flow (stroke-dasharray animate — nhẹ hơn, ổn định hơn) ──
  _particles(pathD,pid,color,gc,fl,elapsed=0){
    const rng=(seed)=>((seed*1664525+1013904223)&0x7fffffff)/0x7fffffff;
    let h=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="0.6" stroke-dasharray="3,18" opacity="0.10" stroke-linecap="round"/>`;
    const n=fl.count, spreadMax=fl.size*3.5;
    for(let i=0;i<n;i++){
      const r1=rng(i*137+31), r2=rng(i*251+73), r3=rng(i*179+11);
      const r4=rng(i*313+53), r5=rng(i*401+17), r6=rng(i*461+29);
      const r7=rng(i*557+43), r8=rng(i*631+67);
      // Shorter dashes + smaller gaps → dày hơn, trông như dòng suối
      const dashLen=(1.5+r1*r1*9).toFixed(1);
      const gapLen=(8+r2*20).toFixed(1);
      const cycle=parseFloat(dashLen)+parseFloat(gapLen);
      // Speed variation: some fast, some slow → hỗn độn
      const speedFactor=0.35+r7*r7*1.3; // phi tuyến: vài hạt rất nhanh, vài rất chậm
      const dur=(fl.dur*speedFactor).toFixed(2);
      const durF=parseFloat(dur);
      const rawPhase=r4*durF;
      const phaseOff=((rawPhase+elapsed)%durF).toFixed(3);
      // Wild scatter: chaotic x and y offsets like a turbulent stream
      const angle=r8*Math.PI*2; // random direction scatter
      const spreadFrac=r6*r6;   // more particles near center, some fly wide
      const scatterDist=spreadFrac*spreadMax;
      const ox=(Math.cos(angle)*scatterDist + (r1-0.5)*fl.size*1.2).toFixed(1);
      const oy=(Math.sin(angle)*scatterDist*0.6 + (r2-0.5)*fl.size*0.8).toFixed(1);
      const bright=r5>0.75, dark=r5<0.18;
      let strokeColor, opacity, strokeW;
      if(bright){ strokeColor='rgba(255,255,255,0.92)'; opacity=(0.55+r1*0.30).toFixed(2); strokeW=(0.8+r3*0.6).toFixed(1); }
      else if(dark){ strokeColor=color; opacity=(0.06+r2*0.10).toFixed(2); strokeW='0.4'; }
      else { strokeColor=color; opacity=(0.22+r3*0.50).toFixed(2); strokeW=(0.6+r4*0.8).toFixed(1); }
      const distFade=(1-spreadFrac*0.55).toFixed(2);
      opacity=(parseFloat(opacity)*parseFloat(distFade)).toFixed(2);
      if(bright){
        h+=`<g transform="translate(${ox},${oy})"><path d="${pathD}" fill="none" stroke="${gc}" stroke-width="${(parseFloat(strokeW)+1.5).toFixed(1)}" stroke-dasharray="${dashLen} ${gapLen}" stroke-linecap="round" opacity="${(0.22*parseFloat(distFade)).toFixed(2)}" filter="url(#pBlur)"><animate attributeName="stroke-dashoffset" from="${cycle.toFixed(1)}" to="0" dur="${dur}s" begin="-${phaseOff}s" repeatCount="indefinite" calcMode="linear"/></path></g>`;
      }
      h+=`<g transform="translate(${ox},${oy})"><path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeW}" stroke-dasharray="${dashLen} ${gapLen}" stroke-linecap="round" opacity="${opacity}"><animate attributeName="stroke-dashoffset" from="${cycle.toFixed(1)}" to="0" dur="${dur}s" begin="-${phaseOff}s" repeatCount="indefinite" calcMode="linear"/></path></g>`;
    }
    // core bright line
    const coreDash=(fl.size*2.2).toFixed(1), coreGap=(fl.size*8).toFixed(1), coreDur=(fl.dur*0.65).toFixed(2);
    const coreDurF=parseFloat(coreDur), corePhase=(elapsed%coreDurF).toFixed(3);
    const coreCycle=(parseFloat(coreDash)+parseFloat(coreGap)).toFixed(1);
    h+=`<path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="1.4" stroke-dasharray="${coreDash} ${coreGap}" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="${coreCycle}" to="0" dur="${coreDur}s" begin="-${corePhase}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    h+=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="0.9" stroke-dasharray="${coreDash} ${coreGap}" stroke-linecap="round" opacity="0.80"><animate attributeName="stroke-dashoffset" from="${coreCycle}" to="0" dur="${coreDur}s" begin="-${corePhase}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    return h;
  }

  // ── Bubble flow (animateMotion circles — YAML style) ──────────
  _bubble(pathD,pid,color,gc,fl,elapsed=0){
    const rng=(seed)=>((seed*1664525+1013904223)&0x7fffffff)/0x7fffffff;
    let h=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="0.5" stroke-dasharray="2,20" opacity="0.08" stroke-linecap="round"/>`;
    const n=fl.count;
    // glow halos (fewer, large soft circles)
    const glowCount=Math.ceil(n/3);
    for(let j=0;j<glowCount;j++){
      const gd=((j/glowCount*fl.dur)+elapsed%fl.dur).toFixed(3)%fl.dur;
      const r=(fl.size*2.8).toFixed(2);
      h+=`<circle r="${r}" fill="${gc}" opacity="0.22" filter="url(#pBlur)">`
        +`<animateMotion dur="${fl.dur}s" begin="-${gd}s" repeatCount="indefinite" rotate="auto">`
        +`<mpath href="#${pid}"/>`
        +`</animateMotion>`
        +`</circle>`;
    }
    // main bubbles — vary size and opacity
    for(let i=0;i<n;i++){
      const r1=rng(i*137+31), r2=rng(i*251+73), r3=rng(i*179+11), r4=rng(i*461+97);
      const delay=((i/n*fl.dur)+elapsed%fl.dur).toFixed(3);
      const sz=(fl.size*(0.55+r1*0.85)).toFixed(2);
      const op=(0.55+r2*0.40).toFixed(2);
      const isWhite=r3>0.72;
      const fill=isWhite?'rgba(255,255,255,0.90)':color;
      const opFinal=(isWhite?(0.65+r4*0.25):(0.45+r2*0.45)).toFixed(2);
      h+=`<circle r="${sz}" fill="${fill}" opacity="${opFinal}">`
        +`<animateMotion dur="${(fl.dur*(0.7+r1*0.65)).toFixed(2)}s" begin="-${delay}s" repeatCount="indefinite" rotate="auto">`
        +`<mpath href="#${pid}"/>`
        +`</animateMotion>`
        +`</circle>`;
    }
    // bright hot-spot specks (smallest, fastest, pure white)
    const hotCount=Math.ceil(n*0.4);
    for(let hc=0;hc<hotCount;hc++){
      const r1=rng(hc*311+41);
      const hcd=((hc/hotCount*fl.dur*0.5)+elapsed%fl.dur).toFixed(3);
      const hsz=(fl.size*0.38+r1*0.3).toFixed(2);
      h+=`<circle r="${hsz}" fill="rgba(255,255,255,0.95)" opacity="0.88" filter="url(#pBlurSm)">`
        +`<animateMotion dur="${(fl.dur*0.55).toFixed(2)}s" begin="-${hcd}s" repeatCount="indefinite" rotate="auto">`
        +`<mpath href="#${pid}"/>`
        +`</animateMotion>`
        +`</circle>`;
    }
    return h;
  }

  // ── Wave flow — river/snake: đoạn dài cuộn chảy như dòng nước ──
  _wave(pathD,pid,color,gc,fl,elapsed=0){
    let h='';
    const durF=fl.dur;

    // Kênh nền: đường mờ tĩnh cho thấy path
    h+=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" opacity="0.10"/>`;
    h+=`<path d="${pathD}" fill="none" stroke="${gc}"    stroke-width="7"   stroke-linecap="round" opacity="0.07" filter="url(#pBlur)"/>`;

    // Các "con rắn" — đoạn dài chạy nối tiếp nhau, mỗi con lệch tốc độ 1 chút
    const snakes=[
      {dashLen:55, gap:30, w:4.5, wGlow:12, speed:1.00, op:0.88, opG:0.28},
      {dashLen:40, gap:25, w:3.0, wGlow:8,  speed:0.82, op:0.65, opG:0.20},
      {dashLen:30, gap:20, w:2.0, wGlow:6,  speed:1.20, op:0.45, opG:0.14},
    ];
    const nSnakes=fl.count<=3?1:fl.count<=6?2:3;

    for(let si=0;si<nSnakes;si++){
      const s=snakes[si];
      const cycle=(s.dashLen+s.gap).toFixed(1);
      const durSF=durF*s.speed, durS=durSF.toFixed(2);
      const phaseOff=((elapsed + si*(durSF/nSnakes)) % durSF).toFixed(3);

      // glow rộng
      h+=`<path d="${pathD}" fill="none" stroke="${gc}" stroke-width="${s.wGlow}" stroke-dasharray="${s.dashLen} ${s.gap}" stroke-linecap="round" opacity="${s.opG}" filter="url(#pBlur)"><animate attributeName="stroke-dashoffset" from="${cycle}" to="0" dur="${durS}s" begin="-${phaseOff}s" repeatCount="indefinite" calcMode="linear"/></path>`;
      // thân chính
      h+=`<path d="${pathD}" fill="none" stroke="${color}" stroke-width="${s.w}" stroke-dasharray="${s.dashLen} ${s.gap}" stroke-linecap="round" opacity="${s.op}"><animate attributeName="stroke-dashoffset" from="${cycle}" to="0" dur="${durS}s" begin="-${phaseOff}s" repeatCount="indefinite" calcMode="linear"/></path>`;
      // highlight trắng chạy trên lưng
      const hDash=(s.dashLen*0.55).toFixed(1);
      const hGap=(s.gap+s.dashLen*0.45).toFixed(1);
      const hCycle=(parseFloat(hDash)+parseFloat(hGap)).toFixed(1);
      h+=`<path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="${(s.w*0.38).toFixed(1)}" stroke-dasharray="${hDash} ${hGap}" stroke-linecap="round" opacity="0.70"><animate attributeName="stroke-dashoffset" from="${hCycle}" to="0" dur="${durS}s" begin="-${phaseOff}s" repeatCount="indefinite" calcMode="linear"/></path>`;
    }

    return h;
  }

  // ── Line flow ────────────────────────────────────────────────
  _sf(w,mx,mn,mx2){ return (mn+Math.max(0,Math.min(1,w/mx))*(mx2-mn)).toFixed(2); }
  _lineFlow(path,w,maxW,c1,c2,c3,elapsed=0){
    const durF=parseFloat(this._sf(w,maxW,1.5,0.4));
    const dur=durF.toFixed(2);
    const w1=this._sf(w,maxW,1.0,2.5),w2=this._sf(w,maxW,1.5,4.0),w3=this._sf(w,maxW,2.5,6.0);
    const p0=(elapsed%durF).toFixed(3);
    const p1=((elapsed+0.3)%durF).toFixed(3);
    const p2=((elapsed+0.15)%durF).toFixed(3);
    return `<path d="${path}" fill="none" stroke="${c3.replace('X','0.12')}" stroke-width="${w3}" stroke-linecap="round"/>
      <path d="${path}" fill="none" stroke="${c1.replace('X','0.92')}" stroke-width="${w1}" stroke-dasharray="28,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="148" to="0" dur="${dur}s" begin="-${p0}s" repeatCount="indefinite" calcMode="linear"/></path>
      <path d="${path}" fill="none" stroke="${c2.replace('X','0.85')}" stroke-width="${w2}" stroke-dasharray="12,120" stroke-linecap="round"><animate attributeName="stroke-dashoffset" from="132" to="0" dur="${dur}s" begin="-${p1}s" repeatCount="indefinite" calcMode="linear"/></path>
      <path d="${path}" fill="none" stroke="${c3.replace('X','0.5')}" stroke-width="${w3}" stroke-dasharray="6,120" stroke-linecap="round" filter="url(#sf)"><animate attributeName="stroke-dashoffset" from="126" to="0" dur="${dur}s" begin="-${p2}s" repeatCount="indefinite" calcMode="linear"/></path>`;
  }

  _svgCard(x,y,w,h,cc,glow,cbg,icoFn,val,dir,sub,active,showGlow,minimal){
    const barH=56,topH=h-barH,cx=x+w/2,cid=`c${(x*100+y*10+w+h)|0}`;
    let s=`<defs><clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13"/></clipPath></defs>`;
    if(showGlow&&!minimal){
      if(active){
        s+=`<rect x="${x-3}" y="${y-3}" width="${w+6}" height="${h+6}" rx="15" fill="none" stroke="${glow}" stroke-width="12" filter="url(#pBlur)"><animate attributeName="opacity" values="0;.7;0" dur="1.4s" repeatCount="indefinite"/></rect>`;
        s+=`<rect x="${x-1}" y="${y-1}" width="${w+2}" height="${h+2}" rx="14" fill="none" stroke="${cc}" stroke-width="2" filter="url(#pBlurSm)"><animate attributeName="opacity" values="0;.85;0" dur="1.4s" repeatCount="indefinite"/></rect>`;
      } else {
        s+=`<rect x="${x-2}" y="${y-2}" width="${w+4}" height="${h+4}" rx="14" fill="none" stroke="${glow}" stroke-width="6" filter="url(#pBlur)" opacity=".12"/>`;
      }
    }
    s+=`<g clip-path="url(#${cid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cbg}"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${topH}" fill="none" stroke="${cc}" stroke-width=".35" stroke-dasharray="2,16" opacity=".07"/>`;
    s+=`<ellipse cx="${cx}" cy="${y+topH}" rx="${w*.42}" ry="${topH*.28}" fill="${glow}" opacity=".15" filter="url(#pBlur)"/>`;
    s+=`<rect x="${x}" y="${y}" width="${w}" height="20" fill="rgba(255,255,255,.06)"/></g>`;
    if(showGlow&&!minimal){
      if(active){ s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.8"><animate attributeName="stroke-opacity" values=".2;.95;.2" dur="1.4s" repeatCount="indefinite"/></rect>`; }
      else { s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="1.2" opacity=".35"/>`; }
      s+=`<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="12" fill="none" stroke="${glow}" stroke-width="3" filter="url(#pBlurSm)"><animate attributeName="opacity" values=".2;.5;.2" dur="2.5s" repeatCount="indefinite"/></rect>`;
    } else {
      // No glow or minimal: static border only
      s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="none" stroke="${cc}" stroke-width="${active?'1.8':'1.2'}" opacity="${active?'.85':'.35'}"/>`;
    }
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
    this._shellReady=false;
    this._animNode=null;
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
    if(!Object.values(cfg).some(v=>v&&String(v).trim()&&!['particle','wave','bubble','line','vi','en','de','it','fr','nl','pl','sv','hu','12h','24h'].includes(v)&&isNaN(v)&&v!=='đ'&&v!=='€'&&v!=='$')){ this._unconfigured(); return; }

    // Track how long animations have been running so begin offsets keep phase continuity across re-renders
    if(!this._animStart) this._animStart=performance.now();
    const _animElapsed=(performance.now()-this._animStart)/1000; // seconds

    const lang=cfg.language||'vi';
    const T=I18N[lang]||I18N.vi;
    const flowStyle=cfg.flow_style||'particle';
    const isParticle=flowStyle==='particle';
    const isWave=flowStyle==='wave';
    const isBubble=flowStyle==='bubble';
    const bgOp=(cfg.background_opacity??45)/100;
    const bgPreset=cfg.bg_preset||'default';
    const bgColor1=cfg.bg_color1||'#001e2b';
    const bgColor2=cfg.bg_color2||'#002832';
    const showTmr=cfg.show_tomorrow!==false;
    const showInfo=cfg.show_weather_info!==false;
    const showGlow=cfg.show_node_glow!==false;
    const showForecastChart=cfg.show_forecast_chart!==false;
    const showHourlyForecast=cfg.show_hourly_forecast!==false;
    const minimalMode=cfg.minimal_mode===true;
    const showClock=cfg.show_clock!==false;
    const showRoomsSection=cfg.show_rooms_section!==false;
    const showBatteryBar=cfg.show_battery_bar!==false;
    const showStatsCircles=cfg.show_stats_circles!==false;
    const showBatteryNode=cfg.show_battery_node!==false;
    const useFahrenheit=cfg.temp_unit==='F';
    const _toDisplayTemp=(c)=>c===null?null:(useFahrenheit?Math.round(c*9/5+32):c);
    const _tempSuffix=useFahrenheit?'°F':'°C';
    const currency=cfg.currency||'đ';
    const _hexToRgba=(hex,a)=>{try{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${r},${g},${b},${parseFloat(a).toFixed(2)})`;}catch{return hex;}};
    const _bgPresets={
      default: `linear-gradient(135deg,rgba(0,20,30,${bgOp}) 0%,rgba(0,40,50,${(bgOp*0.78).toFixed(2)}) 100%)`,
      night:   `linear-gradient(135deg,rgba(0,0,20,${bgOp}) 0%,rgba(10,0,40,${(bgOp*0.85).toFixed(2)}) 100%)`,
      sunset:  `linear-gradient(135deg,rgba(40,10,0,${bgOp}) 0%,rgba(70,20,0,${(bgOp*0.80).toFixed(2)}) 100%)`,
      forest:  `linear-gradient(135deg,rgba(0,20,8,${bgOp}) 0%,rgba(0,35,12,${(bgOp*0.80).toFixed(2)}) 100%)`,
      aurora:  `linear-gradient(135deg,rgba(0,30,25,${bgOp}) 0%,rgba(15,0,40,${(bgOp*0.82).toFixed(2)}) 100%)`,
      desert:  `linear-gradient(135deg,rgba(35,20,0,${bgOp}) 0%,rgba(50,25,0,${(bgOp*0.82).toFixed(2)}) 100%)`,
      ocean:   `linear-gradient(135deg,rgba(0,15,40,${bgOp}) 0%,rgba(0,30,60,${(bgOp*0.80).toFixed(2)}) 100%)`,
      custom:  `linear-gradient(135deg,${_hexToRgba(bgColor1,bgOp)} 0%,${_hexToRgba(bgColor2,(bgOp*0.80).toFixed(2))} 100%)`,
    };
    const bg=_bgPresets[bgPreset]||_bgPresets.default;

    // Color theme
    const clrNodeBat  = cfg.color_node_bat  ||'rgba(40,230,160,1)';
    const clrNodeGrd  = cfg.color_node_grd  ||'rgba(0,215,255,1)';
    const clrNodeInv  = cfg.color_node_inv  ||'rgba(185,145,255,1)';
    const clrNodeHom  = cfg.color_node_hom  ||'rgba(255,178,40,1)';
    const clrNodeBatG = cfg.color_node_bat  ? cfg.color_node_bat+'88' : 'rgba(30,190,120,.5)';
    const clrNodeGrdG = cfg.color_node_grd  ? cfg.color_node_grd+'88' : 'rgba(0,165,240,.48)';
    const clrNodeInvG = cfg.color_node_inv  ? cfg.color_node_inv+'88' : 'rgba(145,90,255,.48)';
    const clrNodeHomG = cfg.color_node_hom  ? cfg.color_node_hom+'88' : 'rgba(220,132,14,.48)';
    const clrFlowSolar= cfg.color_flow_solar||'rgba(255,232,60,.95)';
    const clrFlowGrid = cfg.color_flow_grid ||'rgba(80,190,255,.95)';
    const clrFlowBatt = cfg.color_flow_batt ||'rgba(60,232,120,.95)';
    const clrFlowHome = cfg.color_flow_home ||'rgba(255,148,45,.95)';
    const clrChartFc  = cfg.color_chart_fc  ||'rgba(245,166,35,1)';
    const clrChartLive= cfg.color_chart_live||'rgba(126,211,33,1)';
    const clrTextPrim = cfg.color_text_primary||'rgba(255,255,255,1)';
    // solar design capacity for chart Y-axis
    const solarDesignWp = parseInt(cfg.solar_design_wp||0)||8000;

    // ── Sensors ──────────────────────────────────────────────
    // Đọc sensors — theo YAML gốc: đọc trực tiếp từ hass.states
    const _rS=(k)=>{ const id=this._config[k]; if(!id||!this._hass) return null; const s=this._hass.states[id]; if(!s||s.state==='unavailable'||s.state==='unknown') return null; const v=parseFloat(s.state); return isNaN(v)?null:v; };
    const tempRaw=_rS('temperature_entity');
    const tempRawNum=tempRaw!==null?tempRaw:null;
    const temp=tempRawNum!==null?_toDisplayTemp(tempRawNum).toFixed(useFahrenheit?0:1):null;
    const humidRaw=_rS('humidity_entity');
    const humid=humidRaw!==null?Math.round(humidRaw):null;
    const uvRaw=_rS('uv_entity');
    const uv=uvRaw!==null?uvRaw.toFixed(1):null;
    const pressRaw=_rS('pressure_entity');
    const press=pressRaw!==null?Math.round(pressRaw):null;

    // Weather entity — nếu không cấu hình thì wState=null, không hiện icon/điều kiện
    const wId=cfg.weather_entity;
    const _wRaw=wId?this._hass.states[wId]?.state:null;
    const wState=(_wRaw&&_wRaw!=='unavailable'&&_wRaw!=='unknown')?_wRaw:null;
    const cond=wState?(T.condMap[wState]||wState):null;
    const wfc=wId&&this._hass.states[wId]?.attributes?.forecast;

    // Hourly forecast entity — KHÔNG fallback hardcode, chỉ dùng nếu user cấu hình
    const _hourlyEntityId = cfg.hourly_forecast_entity||null;
    const _hmRaw = _hourlyEntityId ? this._hass.states[_hourlyEntityId] : null;
    const _hmIntervals = (_hmRaw?.attributes?.timelines?.[0]?.intervals)||null;

    // tempHi/Lo hôm nay: ưu tiên từ hourly sensor (slots hôm nay), fallback wfc[0], default '--'
    let tempHi='--', tempLo='--';
    if(_hmIntervals){
      try{
        const today=new Date(), todayD=today.getDate(), todayM=today.getMonth();
        const todaySlots=[];
        for(const iv of _hmIntervals){
          const d=new Date(iv.startTime);
          if(d.getDate()===todayD&&d.getMonth()===todayM) todaySlots.push(iv.values.temperature);
        }
        if(todaySlots.length){ tempHi=Math.round(Math.max(...todaySlots)); tempLo=Math.round(Math.min(...todaySlots)); }
      }catch(e){}
    }
    if(tempHi==='--'){
      const _wfc0=(wfc&&wfc.length>0)?wfc[0]:null;
      if(_wfc0){
        tempHi=Math.round(_wfc0.temperature);
        const _tlo=_wfc0.templow!==undefined?_wfc0.templow:(_wfc0.temp_low!==undefined?_wfc0.temp_low:NaN);
        tempLo=isNaN(_tlo)?'--':Math.round(_tlo);
      }
    }
    // Convert tempHi/Lo to display unit
    if(tempHi!=='--') tempHi=_toDisplayTemp(tempHi);
    if(tempLo!=='--') tempLo=_toDisplayTemp(tempLo);

    const condHTML=wState?makeWeatherIcon(wState):makeWeatherIcon('cloudy');

    // Tomorrow — chỉ đọc từ hourly sensor nếu được cấu hình, fallback wfc[1], default '--'
    let tmrWstate=null, tmrW='--', tmrHi='--', tmrLo='--';
    if(_hmIntervals){
      try{
        const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
        const tmrDate=tomorrow.getDate(), tmrMonth=tomorrow.getMonth();
        const allSlots=[], daySlots=[];
        for(const iv of _hmIntervals){
          const d=new Date(iv.startTime);
          if(d.getDate()===tmrDate&&d.getMonth()===tmrMonth){
            allSlots.push(iv.values);
            const h=d.getHours();
            if(h>=6&&h<=18) daySlots.push(iv.values);
          }
        }
        if(allSlots.length){
          const temps=allSlots.map(v=>v.temperature);
          tmrHi=Math.round(Math.max(...temps));
          tmrLo=Math.round(Math.min(...temps));
          const slots=daySlots.length?daySlots:allSlots;
          const codeCount={};
          for(const s of slots){codeCount[s.weatherCode]=(codeCount[s.weatherCode]||0)+1;}
          let bestCode=slots[0].weatherCode, bestN=0;
          for(const k in codeCount){if(codeCount[k]>bestN){bestN=codeCount[k];bestCode=parseInt(k);}}
          const tmCodeMap={1000:'sunny',1100:'partlycloudy',1101:'partlycloudy',1102:'cloudy',1001:'cloudy',2000:'fog',2100:'fog',4000:'rainy',4001:'rainy',4200:'rainy',4201:'pouring',8000:'lightning',8001:'lightning',8002:'lightning'};
          tmrWstate=tmCodeMap[bestCode]||'cloudy';
          tmrW=T.condMap[tmrWstate]||tmrWstate;
        }
      }catch(e){}
    }
    if(!tmrWstate){
      const _wfc1=(wfc&&wfc.length>1)?wfc[1]:null;
      if(_wfc1){
        tmrWstate=(_wfc1.condition&&_wfc1.condition!=='unavailable')?_wfc1.condition:'cloudy';
        tmrW=T.condMap[tmrWstate]||tmrWstate;
        tmrHi=Math.round(_wfc1.temperature);
        const _tlo1=_wfc1.templow!==undefined?_wfc1.templow:(_wfc1.temp_low!==undefined?_wfc1.temp_low:NaN);
        tmrLo=isNaN(_tlo1)?'--':Math.round(_tlo1);
      }
    }
    // Convert tmrHi/Lo to display unit
    if(tmrHi!=='--') tmrHi=_toDisplayTemp(tmrHi);
    if(tmrLo!=='--') tmrLo=_toDisplayTemp(tmrLo);
    const tmrHTML=makeWeatherIcon(tmrWstate||'cloudy');

    // Solar — hỗ trợ unit W/kW
    const pv1W=this._readRawPower('solar_pv1_entity','solar_unit');
    const pv2W=this._readRawPower('solar_pv2_entity','solar_unit');
    const solarW=pv1W+pv2W,hasSolar=solarW>10;
    const pv1V=this._gf('solar_pv1_voltage_entity',0),pv2V=this._gf('solar_pv2_voltage_entity',0);
    const pvDC=((pv1V+pv2V)/2).toFixed(0);

    const battSoc=this._gf('battery_soc_entity',0);
    const battFlW=this._readPower('battery');
    const isCharge=battFlW>10,isDisch=battFlW<-10;
    const battW=this._fmtPower(Math.abs(battFlW),'battery');
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

    const gridFlW=this._readPower('grid');
    const hasGrid=Math.abs(gridFlW)>10;
    const gridW=this._fmtPower(Math.abs(gridFlW),'grid');
    const gridDir=gridFlW>10?T.exportGrid:T.importGrid;
    const gridV=this._gf('grid_voltage_entity',220).toFixed(0);
    // Home — hỗ trợ unit W/kW
    const homeFlW=this._readRawPower('home_consumption_entity','home_unit');
    const homeW=this._fmtPower(homeFlW,'home'),hasHome=homeFlW>10;
    const invSwitchState=this._g('inverter_switch_entity','off');
    const invOff=invSwitchState==='on';
    const gridDirectW=invOff?this._gf('grid_direct_entity',0):0;
    const hasGridDirect=invOff&&gridDirectW>10;
    const daily=this._gf('solar_today_entity',0).toFixed(1);
    const dailyuse=this._gf('solar_dailyuse_entity',0).toFixed(1);
    const liveW=this._gf('solar_live_entity',0);
    const gridDaily=this._gf('grid_today_entity',0).toFixed(1);
    const gridExportToday=this._gf('grid_export_today_entity',0);
    const combinedFmt=this._gf('consumption_today_entity',0).toFixed(1);
    const saving=this._calcCost(parseFloat(daily));
    const savFmt=this._fmtSaving(saving);
    // Saving based on solar-used-by-home (dailyuse), not total production
    const savingUse=this._calcCost(parseFloat(dailyuse));
    const savFmtUse=this._fmtSaving(savingUse);
    const luxState=this._g('inverter_status_entity','--');
    const invTemp=useFahrenheit?_toDisplayTemp(this._gf('inverter_temp_entity',0)).toFixed(0):this._gf('inverter_temp_entity',0).toFixed(1);
    const batTemp=useFahrenheit?_toDisplayTemp(this._gf('battery_temp_entity',0)).toFixed(0):this._gf('battery_temp_entity',0).toFixed(1);
    const isOff=['--','unavailable','unknown','Unavailable'].includes(luxState);
    const isNormal=['Normal','normal','online','Online','ONLINE'].includes(luxState);
    const stColor=isNormal?'rgba(74,222,128,1)':isOff?'rgba(255,80,80,1)':'rgba(255,200,60,1)';
    const stLabel=isOff?'OFF':(isNormal?'ON':luxState);

    // Clock
    const now=new Date();
    const H=now.getHours(),M=now.getMinutes();
    const use12h=cfg.time_format==='12h';
    const ap=use12h?(H>=12?'PM':'AM'):'';
    const hh=use12h?String(H%12||12).padStart(2,'0'):String(H).padStart(2,'0');
    const mm=String(M).padStart(2,'0');
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
    // Round tọa độ mặt trời/mặt trăng về số nguyên — vị trí thay đổi từng pixel mỗi giây
    // không cần độ chính xác cao, giúp HTML string ổn định → tránh innerHTML diff liên tục
    const bx=Math.round((1-t)*(1-t)*14+2*(1-t)*t*173+t*t*332);
    const by=Math.round((1-t)*(1-t)*65+2*(1-t)*t*(-45)+t*t*65);
    const lbw=88,lbx=t<0.5?bx-lbw-10:bx+14,lby=by-20;
    const isNight=nowM<RISE||nowM>SET;
    let tMoon=nowM>SET?(nowM-SET)/nightMin:(nowM+1440-SET)/nightMin;
    tMoon=Math.max(0,Math.min(1,tMoon));
    const mx2=Math.round((1-tMoon)*(1-tMoon)*332+2*(1-tMoon)*tMoon*173+tMoon*tMoon*14);
    const my2=Math.round((1-tMoon)*(1-tMoon)*65+2*(1-tMoon)*tMoon*145+tMoon*tMoon*65);

    // Layout
    const _ns=parseFloat(cfg.node_scale??1.0);
    const BAT_X=cfg.node_bat_x??-40,BAT_Y=100,BAT_W=Math.round(92*_ns),BAT_H=Math.round(126*_ns);
    const GRD_X=cfg.node_grd_x??295,GRD_Y=100,GRD_W=Math.round(92*_ns),GRD_H=Math.round(126*_ns);
    const INV_W=Math.round(106*_ns),INV_H=Math.round(130*_ns);
    const HOM_W=Math.round(106*_ns),HOM_H=Math.round(124*_ns);
    const INV_X=120,INV_Y=cfg.node_inv_y??220;
    const HOM_X=120,HOM_Y=cfg.node_hom_y??400;
    const BAT_CX=BAT_X+BAT_W/2,BAT_CY=BAT_Y+BAT_H/2,BAT_R=BAT_X+BAT_W,BAT_BOT=BAT_Y+BAT_H;
    const GRD_CX=GRD_X+GRD_W/2,GRD_CY=GRD_Y+GRD_H/2,GRD_L=GRD_X;
    const INV_CX=INV_X+INV_W/2,INV_TOP=INV_Y,INV_BOT=INV_Y+INV_H;
    const HOM_CX=HOM_X+HOM_W/2,HOM_TOP=HOM_Y;

    // ── Build flows ──────────────────────────────────────────────
    let FL='',fpDefs='',fpIdx=0;
    const addFlow=(path,color,gc,fl,wHint=0)=>{
      const id=`fp-${fpIdx++}`;
      fpDefs+=`<path id="${id}" d="${path}"/>`;
      if(isWave)         FL+=this._wave(path,id,color,gc,fl,_animElapsed);
      else if(isBubble)  FL+=this._bubble(path,id,color,gc,fl,_animElapsed);
      else if(isParticle)FL+=this._particles(path,id,color,gc,fl,_animElapsed);
      else {
        // line style — dùng wHint (W thực) nếu có, fallback ước từ fl
        const w=wHint>0?wHint:(fl.count<=1?150:fl.count<=2?500:fl.count<=3?1100:fl.count<=4?2400:4500);
        const mx=6000;
        const c1=color.replace(/,\s*[\d.]+\s*\)/,',X)');
        const c2=gc.replace(/,\s*[\d.]+\s*\)/,',X)');
        FL+=this._lineFlow(path,w,mx,c1,c2,c2,_animElapsed);
      }
    };
    const addLine=(path,w,mx,c1,c2,c3)=>{ FL+=this._lineFlow(path,w,mx,c1,c2,c3,_animElapsed); };

    if(hasSolar){
      const sp=`M ${bx.toFixed(1)},${(by+7).toFixed(1)} C ${bx.toFixed(1)},${INV_TOP-70} ${INV_CX},${INV_TOP-150} ${INV_CX},${INV_TOP}`;
      if(isParticle||isWave||isBubble) addFlow(sp,clrFlowSolar,'rgba(255,190,20,.55)',this._flowLevel(solarW,'solar'));
      else addLine(sp,solarW,8000,'rgba(255,250,200,X)','rgba(255,215,55,X)','rgba(255,235,120,X)');
    }
    if(isCharge){
      // Charge: exit left edge of inverter → curve up-left → enter bottom of battery
      const INV_LEFT_Y=INV_Y+INV_H*0.45;
      const p=`M${INV_X},${INV_LEFT_Y} C ${INV_X-40},${INV_LEFT_Y} ${BAT_CX},${BAT_BOT+50} ${BAT_CX},${BAT_BOT}`;
      if(isParticle||isWave||isBubble) addFlow(p,clrFlowBatt,'rgba(20,160,70,.55)',this._flowLevel(battFlW,'battery'));
      else addLine(p,battFlW,6000,'rgba(200,255,220,X)','rgba(80,220,120,X)','rgba(160,240,180,X)');
    }
    if(isDisch){
      const p=`M${BAT_R},${BAT_CY} C ${BAT_R},${BAT_CY+40} ${INV_CX},${INV_TOP-90} ${INV_CX-10},${INV_TOP}`;
      if(isParticle||isWave||isBubble) addFlow(p,'rgba(255,205,40,.95)','rgba(200,140,10,.55)',this._flowLevel(Math.abs(battFlW),'battery'));
      else addLine(p,Math.abs(battFlW),6000,'rgba(255,245,180,X)','rgba(255,200,60,X)','rgba(255,230,130,X)');
    }
    if(hasGrid){
      const gp=gridFlW>10?`M${INV_CX},${INV_TOP} C ${INV_CX},${INV_TOP-60} ${GRD_L},${GRD_CY+60} ${GRD_L},${GRD_CY}`:`M${GRD_L},${GRD_CY} C ${GRD_L},${GRD_CY+40} ${INV_CX+10},${INV_TOP-90} ${INV_CX+10},${INV_TOP}`;
      if(isParticle||isWave||isBubble) addFlow(gp,clrFlowGrid,'rgba(30,130,230,.55)',this._flowLevel(Math.abs(gridFlW),'grid'));
      else addLine(gp,Math.abs(gridFlW),6000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
    }
    if(hasHome){
      const p=`M${INV_CX},${INV_BOT+2} C ${INV_CX},${INV_BOT+20} ${HOM_CX},${HOM_TOP-20} ${HOM_CX},${HOM_TOP-2}`;
      if(isParticle||isWave||isBubble) addFlow(p,clrFlowHome,'rgba(200,90,10,.55)',this._flowLevel(homeFlW,'home'));
      else addLine(p,homeFlW,6000,'rgba(255,230,180,X)','rgba(255,148,55,X)','rgba(255,190,100,X)');
    }
    if(hasGridDirect){
      const p=`M${GRD_CX},${GRD_Y+GRD_H} C ${GRD_CX},${GRD_Y+GRD_H+80} ${HOM_CX+60},${HOM_TOP-60} ${HOM_CX},${HOM_TOP}`;
      if(isParticle||isWave||isBubble) addFlow(p,clrFlowGrid,'rgba(30,130,230,.55)',this._flowLevel(gridDirectW,'grid'));
      else addLine(p,gridDirectW,6000,'rgba(220,240,255,X)','rgba(90,175,255,X)','rgba(160,210,255,X)');
    }

    // ── Rooms data + flow + SVG ──────────────────────────────────
    const cfgRooms=cfg.rooms||[];
    const roomCount=Math.min(6,Math.max(2,parseInt(cfg.room_count??4)));
    const defRoomIcons=['🛋️','🍳','🔥','💻','🛏️','🧺'];
    const defRoomNames=lang==='vi'?['Phòng khách','Phòng bếp','Bếp từ','Office','Phòng ngủ','Giặt ủi']:['Living Room','Kitchen','Induction','Office','Bedroom','Laundry'];
    const roomPalette=[
      {main:'rgba(210,170,255,1)',glow:'rgba(170,120,255,.6)',border:'rgba(190,140,255,.78)',bg:'rgba(20,6,40,.88)',bar:'rgba(190,140,255,.4)'},
      {main:'rgba(255,190,100,1)',glow:'rgba(230,130,30,.6)', border:'rgba(255,170,70,.78)', bg:'rgba(36,16,2,.88)', bar:'rgba(255,160,50,.4)'},
      {main:'rgba(40,220,200,1)', glow:'rgba(20,160,145,.6)',border:'rgba(40,210,190,.78)',bg:'rgba(2,20,18,.88)',  bar:'rgba(40,200,180,.4)'},
      {main:'rgba(60,185,255,1)', glow:'rgba(20,120,220,.6)',border:'rgba(50,170,255,.78)', bg:'rgba(2,10,28,.88)', bar:'rgba(50,160,255,.4)'},
      {main:'rgba(255,120,160,1)',glow:'rgba(220,60,100,.6)', border:'rgba(255,100,140,.78)',bg:'rgba(30,4,14,.88)', bar:'rgba(255,90,130,.4)'},
      {main:'rgba(140,230,80,1)', glow:'rgba(90,180,30,.6)',  border:'rgba(120,215,65,.78)', bg:'rgba(8,22,2,.88)',  bar:'rgba(110,200,55,.4)'},
    ];

    // Auto-scale room card size based on count
    // ViewBox stays 346. For 5-6 rooms we scale the rooms+trunk group horizontally.
    // _roomScale: how much wider the rooms section is rendered vs viewBox
    const _roomScale = roomCount <= 4 ? 1.0 : roomCount === 5 ? 1.22 : 1.45;
    // Work in "room space" (346 wide), then apply scale transform when rendering
    const _padding = 6;
    const _roomSpanW = 346 - _padding * 2; // 334
    const _minGap = 5;
    const RW = Math.floor((_roomSpanW - (roomCount - 1) * _minGap) / roomCount);
    const RH = roomCount <= 4 ? 92 : roomCount === 5 ? 92 : 92;

    // Center rooms in 346 room-space
    const _actualGap = Math.floor((_roomSpanW - roomCount * RW) / Math.max(1, roomCount - 1));
    const _totalRoomsW = roomCount * RW + (roomCount - 1) * _actualGap;
    const _startX = Math.round((346 - _totalRoomsW) / 2);
    const RXS = Array.from({length: roomCount}, (_, i) => _startX + i * (RW + _actualGap));

    // For flows: rcx in screen space = scale transform applied around center (173)
    // screen_x = 173 + (room_x - 173) * _roomScale
    const _toScreen = (x) => 173 + (x - 173) * _roomScale;

    const HOM_BOT=HOM_Y+HOM_H;
    const TRUNK_Y=HOM_BOT+28;
    const ROOM_Y=TRUNK_Y+22;

    // ── Dynamic viewBox: expand left/right to fit all nodes regardless of user layout ──
    // This makes the card auto-scale on mobile without clipping Battery/Grid nodes
    const _VB_MARGIN = 8; // padding beyond the outermost node edge
    const _leftEdge  = Math.min(BAT_X - _VB_MARGIN, 0);          // Battery left (can be negative)
    const _rightEdge = Math.max(GRD_X + GRD_W + _VB_MARGIN, 346); // Grid right
    const VB_X = _leftEdge;
    const VB_W = _rightEdge - _leftEdge;
    // Scale factor from viewBox coords to the standard 346-unit space (used for centring)
    // SVG width:100% means the browser scales VB_W → container width automatically

    // Read room power values
    const cfgRoomOffsets=cfg.room_offsets||[];
    const roomsData=[];
    for(let ri=0;ri<roomCount;ri++){
      const rmCfg=cfgRooms[ri]||{};
      const eid=rmCfg.entity||null;
      let pw=0;
      if(eid&&this._hass){
        const st=this._hass.states[eid];
        if(st&&st.state!=='unavailable'&&st.state!=='unknown'){
          const v=parseFloat(st.state);
          if(!isNaN(v)){
            const u=(st.attributes&&st.attributes.unit_of_measurement||'').trim();
            pw=(u==='kW'||u==='kilowatt')?v*1000:v;
          }
        }
      }
      const rOff=cfgRoomOffsets[ri]||{};
      const ox=rOff.x??0, oy=rOff.y??0;
      // rx_room: X in "room space" (before scale transform) — used for scaled group render
      // rx_scr:  X in true SVG screen space — used for free render and for flow path endpoints
      // ox is a true-SVG offset (not scaled), so:
      //   screen center = _toScreen(RXS[ri] + RW/2) + ox
      const rx_room = RXS[ri] + ox; // X inside scale group (approximation; correct for flow via _toScreen below)
      const scrCX   = _toScreen(RXS[ri] + RW/2) + ox; // true screen center X of room
      // scrRW: visual width of a free room = RW scaled to screen space
      // This keeps free rooms the same size as their in-group counterparts
      const scrRW   = Math.round(RW * _roomScale);
      const scrX    = scrCX - scrRW/2;                 // true screen left edge, using scaled width
      roomsData.push({
        label:rmCfg.name||defRoomNames[ri]||`Room ${ri+1}`,
        icon: rmCfg.icon||defRoomIcons[ri]||'💡',
        w:pw,
        x:rx_room, y:ROOM_Y+oy,       // room-space coords (used inside scale group)
        scrX, scrCX, scrRW,            // true screen coords (used outside scale group & for flows)
        ox, oy,                        // raw offsets
        defaultX: RXS[ri],             // original room-space X without offset
        pal:roomPalette[ri%roomPalette.length],
      });
    }

    // Branch flows (home → each room) — 90° elbow routing
    // All coordinates are in true SVG screen space.
    // _toScreen() converts room-space X → screen X for default rooms.
    // For offset rooms, scrCX = _toScreen(defaultX + RW/2) + ox  (stored in rm.scrCX)

    const HOM_L = HOM_X;
    const HOM_R = HOM_X + HOM_W;
    const HOM_MID_Y = HOM_Y + HOM_H / 2;

    // Trunk: only spans rooms that are at default Y (no Y offset)
    let trunkSVG = '';
    const defaultYRooms = roomsData.filter(rm => rm.oy === 0);
    if(defaultYRooms.length > 0){
      const tX1 = _toScreen(defaultYRooms[0].defaultX + RW/2);
      const tX2 = _toScreen(defaultYRooms[defaultYRooms.length-1].defaultX + RW/2);
      trunkSVG =
        `<line x1="${HOM_CX}" y1="${HOM_BOT}" x2="${HOM_CX}" y2="${TRUNK_Y}" stroke="rgba(255,155,65,.22)" stroke-width="1.2" stroke-linecap="round"/>` +
        `<line x1="${tX1}" y1="${TRUNK_Y}" x2="${tX2}" y2="${TRUNK_Y}" stroke="rgba(255,155,65,.14)" stroke-width="1" stroke-dasharray="3,6"/>`;
    }

    for(let ri=0;ri<roomCount;ri++){
      const rm = roomsData[ri];
      const hasOff = rm.ox !== 0 || rm.oy !== 0;
      // True screen center X of this room
      const rCX = hasOff ? rm.scrCX : _toScreen(rm.defaultX + RW/2);
      const rY  = rm.y;           // top of room card (screen Y, same in both systems)
      const rBotY = rY + RH;
      let bp;

      if(!hasOff){
        // ── DEFAULT: no offset — standard trunk routing (90° elbow) ──
        // Down from Home bottom → horizontal trunk → 90° down to room top
        bp = `M${HOM_CX},${HOM_BOT}` +
             ` L${HOM_CX},${TRUNK_Y}` +
             ` L${rCX},${TRUNK_Y}` +
             ` L${rCX},${rY}`;

      } else if(rm.oy < 0 && rY < HOM_Y){
        // ── ELEVATED above Home: exit from left or right side of Home ──
        const goLeft = rCX <= HOM_CX;
        const exitX  = goLeft ? HOM_L : HOM_R;
        // Mid horizontal Y: halfway between Home mid and room bottom
        const elbowY = Math.min(HOM_MID_Y, rBotY + 20);
        // 90° path: exit side → go horizontal to rCX → turn and go up to rBotY
        bp = `M${exitX},${elbowY}` +
             ` L${rCX},${elbowY}` +
             ` L${rCX},${rBotY}`;

      } else if(rm.oy < 0 && rY < HOM_BOT){
        // ── BESIDE Home (overlapping vertically) ──
        // Exit from bottom, go straight down then horizontal
        const goLeft = rCX < HOM_CX;
        const exitX  = goLeft ? HOM_L : HOM_R;
        const elbowY = rBotY + Math.max(10, (HOM_BOT - rBotY) / 2);
        bp = `M${exitX},${HOM_MID_Y}` +
             ` L${rCX},${HOM_MID_Y}` +
             ` L${rCX},${rBotY}`;

      } else {
        // ── BELOW Home but with X offset only — go down via trunk at new X ──
        bp = `M${HOM_CX},${HOM_BOT}` +
             ` L${HOM_CX},${TRUNK_Y}` +
             ` L${rCX},${TRUNK_Y}` +
             ` L${rCX},${rY}`;
      }

      if(rm.w > 5){
        addFlow(bp, rm.pal.main, rm.pal.glow, this._flowLevel(rm.w, 'room'), rm.w);
      } else {
        FL += `<path d="${bp}" fill="none" stroke="${rm.pal.main}" stroke-width="0.6" stroke-dasharray="3,10" opacity="0.12" stroke-linecap="round"/>`;
      }
    }

    // MDI-style SVG paths for room icons (24x24 viewBox)
    const roomMDI=[
      // sofa / living room
      `<path d="M2,13 Q2,11 4,11 L4,9 Q4,7 6,7 L18,7 Q20,7 20,9 L20,11 Q22,11 22,13 L22,16 L20,16 L20,17 L18,17 L18,16 L6,16 L6,17 L4,17 L4,16 L2,16 Z" fill="rgba(210,170,255,.85)" stroke="rgba(210,170,255,.4)" stroke-width="0.5"/>
       <rect x="4" y="12" width="16" height="4" rx="1" fill="rgba(180,130,255,.6)"/>`,
      // pot / kitchen
      `<path d="M7,7 L17,7 L16,15 Q16,17 12,17 Q8,17 8,15 Z" fill="rgba(255,190,100,.85)" stroke="rgba(255,190,100,.4)" stroke-width="0.5"/>
       <rect x="6" y="6" width="12" height="2" rx="1" fill="rgba(255,190,100,.7)"/>
       <line x1="12" y1="4" x2="12" y2="6" stroke="rgba(255,190,100,.9)" stroke-width="1.5" stroke-linecap="round"/>
       <line x1="9" y1="4.5" x2="10" y2="6" stroke="rgba(255,190,100,.7)" stroke-width="1.2" stroke-linecap="round"/>
       <line x1="15" y1="4.5" x2="14" y2="6" stroke="rgba(255,190,100,.7)" stroke-width="1.2" stroke-linecap="round"/>`,
      // stove / induction
      `<rect x="4" y="6" width="16" height="12" rx="2" fill="rgba(40,220,200,.15)" stroke="rgba(40,220,200,.7)" stroke-width="1"/>
       <circle cx="9" cy="11" r="3" fill="none" stroke="rgba(40,220,200,.8)" stroke-width="1" stroke-dasharray="2 1.5"/>
       <circle cx="9" cy="11" r="1.2" fill="rgba(40,220,200,.85)"/>
       <circle cx="15" cy="11" r="3" fill="none" stroke="rgba(40,220,200,.5)" stroke-width="1" stroke-dasharray="2 1.5"/>
       <circle cx="15" cy="11" r="1.2" fill="rgba(40,220,200,.4)"/>
       <rect x="7" y="15.5" width="5" height="1.5" rx="0.75" fill="rgba(40,220,200,.5)" stroke="rgba(40,220,200,.7)" stroke-width="0.5"/>`,
      // monitor / office
      `<rect x="4" y="5" width="16" height="11" rx="2" fill="rgba(60,185,255,.12)" stroke="rgba(60,185,255,.75)" stroke-width="1"/>
       <rect x="5.5" y="6.5" width="13" height="8" rx="1" fill="rgba(5,20,40,.9)"/>
       <line x1="8" y1="8" x2="14" y2="8" stroke="rgba(60,185,255,.7)" stroke-width="1" stroke-linecap="round"/>
       <line x1="8" y1="10" x2="16" y2="10" stroke="rgba(60,185,255,.5)" stroke-width="1" stroke-linecap="round"/>
       <line x1="8" y1="12" x2="12" y2="12" stroke="rgba(60,185,255,.6)" stroke-width="1" stroke-linecap="round"/>
       <line x1="10" y1="16" x2="14" y2="16" stroke="rgba(60,185,255,.5)" stroke-width="1" stroke-linecap="round"/>
       <rect x="10.5" y="16" width="3" height="2.5" rx="0.5" fill="rgba(60,185,255,.2)" stroke="rgba(60,185,255,.5)" stroke-width="0.6"/>`,
      // bed / bedroom
      `<rect x="3" y="10" width="18" height="9" rx="2" fill="rgba(255,120,160,.12)" stroke="rgba(255,120,160,.75)" stroke-width="1"/>
       <rect x="3" y="8" width="5" height="5" rx="2" fill="rgba(255,120,160,.3)" stroke="rgba(255,120,160,.6)" stroke-width="0.8"/>
       <rect x="3" y="16" width="3" height="3" rx="1" fill="rgba(255,120,160,.5)"/>
       <rect x="18" y="16" width="3" height="3" rx="1" fill="rgba(255,120,160,.5)"/>
       <line x1="8" y1="10" x2="21" y2="10" stroke="rgba(255,120,160,.4)" stroke-width="1"/>`,
      // washing / laundry
      `<rect x="4" y="4" width="16" height="16" rx="3" fill="rgba(140,230,80,.12)" stroke="rgba(140,230,80,.75)" stroke-width="1"/>
       <circle cx="12" cy="13" r="4.5" fill="none" stroke="rgba(140,230,80,.8)" stroke-width="1"/>
       <circle cx="12" cy="13" r="2.5" fill="none" stroke="rgba(140,230,80,.5)" stroke-width="1" stroke-dasharray="3 2"/>
       <circle cx="7" cy="7" r="1" fill="rgba(140,230,80,.9)"/>
       <rect x="9" y="6" width="6" height="1.5" rx="0.75" fill="rgba(140,230,80,.4)"/>`,
    ];

    // Room node SVG cards
    // Rooms with Y offset != 0 or X offset != 0 are rendered OUTSIDE the scale group
    // so their offsets are in true SVG coordinates (no scale distortion).
    let roomSVG='';       // goes inside the scale group (default-position rooms)
    let roomSVGFree='';   // goes outside the scale group (offset rooms)
    // _invScale: compensates the horizontal scale applied to the rooms group
    // so fonts/icons render at correct aspect ratio
    const _invScale = 1 / _roomScale;
    const _nameFontSize = 11.5;
    const _valFontSize  = 16;
    const _icoScale     = 1.15;
    for(let ri=0;ri<roomCount;ri++){
      const rm=roomsData[ri],pal=rm.pal;
      const hasOff = rm.ox !== 0 || rm.oy !== 0;

      // For rooms inside the scale group (no offset): use room-space coords + RW
      // For rooms outside scale group (has offset): use screen-space coords + scrRW
      // scrRW = RW * _roomScale so free rooms appear the same visual size as scaled-group rooms
      const rx  = hasOff ? rm.scrX  : rm.x;
      const ry  = rm.y;  // Y is same in both systems (Y is not scaled)
      const rcx = hasOff ? rm.scrCX : (rm.x + RW/2);
      const FW  = hasOff ? rm.scrRW : RW;   // effective width for this room's render
      const FH  = RH; // height stays constant regardless of offset — Y axis is not scaled

      const active=rm.w>5;
      const wLabel=rm.w>=1000?(rm.w/1000).toFixed(2)+' kW':Math.round(rm.w)+' W';
      const barW=Math.min(FW-16,Math.round((FW-16)*Math.min(rm.w,3000)/3000));
      // Icon: if custom emoji set use text, else use MDI SVG
      const hasEmoji=rm.icon&&rm.icon.trim()&&rm.icon.trim()!==defRoomIcons[ri];
      const _icoY = ry + 28;   // Y positions stay same as default — height is not scaled
      const _icoFS = hasOff ? Math.round(20 * Math.min(_roomScale, 1.3)) : 20; // font slightly bigger for free rooms
      const _labelY = ry + 51;
      const _valY   = ry + 69;
      // Inside scale group: apply _invScale to cancel horizontal stretch on text/icons
      // Outside scale group: no correction needed (scale = 1), but scale icons/text up with _roomScale
      const _scaleCorr = hasOff ? '1' : _invScale.toFixed(4);
      const _icoScaleFree = hasOff ? Math.min(_roomScale, 1.3) * _icoScale : _icoScale;
      const _cs  = `translate(${rcx},0) scale(${_scaleCorr},1) translate(${-rcx},0)`;
      // For free rooms: translate icon to correct position then scale from its own origin
      const _csi = hasOff
        ? `translate(${rcx - 12*_icoScaleFree},${ry+5}) scale(${_icoScaleFree})`
        : `translate(${rcx-12*_icoScale},0) scale(${_scaleCorr},1)`;

      const iconSVG=hasEmoji
        ?`<g transform="${_cs}"><text x="${rcx}" y="${_icoY}" text-anchor="middle" font-size="${_icoFS}" font-family="Apple Color Emoji,Segoe UI Emoji,sans-serif">${rm.icon}</text></g>`
        : hasOff
          ?`<g transform="${_csi}">${roomMDI[ri%roomMDI.length]}</g>`
          :`<g transform="${_csi}"><g transform="translate(0,${ry+5}) scale(${_icoScale})">${roomMDI[ri%roomMDI.length]}</g></g>`;

      let roomChunk = `<g opacity="${active?'1':'0.38'}">`;
      if(active) roomChunk+=`<rect x="${rx-2}" y="${ry-2}" width="${FW+4}" height="${FH+4}" rx="15" fill="none" stroke="${pal.glow}" stroke-width="4" filter="url(#pBlur)" opacity=".3"/>`;
      roomChunk+=`<rect x="${rx}" y="${ry}" width="${FW}" height="${FH}" rx="13" fill="${pal.bg}" stroke="${pal.border}" stroke-width="${active?'1.5':'0.6'}" stroke-opacity="${active?'0.82':'0.20'}"/>`;
      roomChunk+=`<rect x="${rx+2}" y="${ry+2}" width="${FW-4}" height="10" rx="10" fill="rgba(255,255,255,0.04)"/>`;
      roomChunk+=iconSVG;
      const _nameFontSizeFree = hasOff ? (_nameFontSize * Math.min(_roomScale, 1.3)).toFixed(1) : _nameFontSize;
      const _valFontSizeFree  = hasOff ? (_valFontSize  * Math.min(_roomScale, 1.3)).toFixed(1) : _valFontSize;
      roomChunk+=`<g transform="${_cs}"><text x="${rcx}" y="${_labelY}" text-anchor="middle" font-size="${_nameFontSizeFree}" font-weight="600" font-family="Inter,-apple-system,sans-serif" fill="rgba(200,230,240,.92)">${rm.label}</text></g>`;
      roomChunk+=`<g transform="${_cs}"><text x="${rcx}" y="${_valY}" text-anchor="middle" font-size="${_valFontSizeFree}" font-weight="800" font-family="Inter,-apple-system,sans-serif" fill="${pal.main}" filter="url(#tf)">${wLabel}</text></g>`;
      // power bar track
      roomChunk+=`<rect x="${rx+8}" y="${ry+FH-9}" width="${FW-16}" height="4" rx="2" fill="rgba(255,255,255,.08)"/>`;
      if(barW>0){
        roomChunk+=`<rect x="${rx+8}" y="${ry+FH-9}" width="${barW}" height="4" rx="2" fill="${pal.main}" opacity=".85"/>`;
        roomChunk+=`<rect x="${rx+8}" y="${ry+FH-9}" width="${barW}" height="4" rx="2" fill="${pal.bar}" filter="url(#pBlur)"/>`;
      }
      roomChunk+=`</g>`;

      if(hasOff){ roomSVGFree += roomChunk; } else { roomSVG += roomChunk; }
    }

    // ── Icons ─────────────────────────────────────────────────
    const batIcoFn=(cx2,iy,aw,ah)=>{
      const bw=aw*0.82,bh=ah*0.52,bxb=cx2-bw/2,byb=iy+(ah-bh)/2-4;
      const fw=Math.max(2,(bw-6)*battSoc/100),br=5;
      let fillC,borderC,glowC;
      if(bPct>50){fillC='rgba(40,220,130,.9)';borderC='rgba(40,230,160,.92)';glowC='rgba(40,220,130,.55)';}
      else if(bPct>20){fillC='rgba(255,200,50,.95)';borderC='rgba(255,195,50,.92)';glowC='rgba(255,200,50,.45)';}
      else{fillC='rgba(240,70,70,.95)';borderC='rgba(240,70,70,.95)';glowC='rgba(240,60,60,.5)';}
      const floatStyle=minimalMode?'':'animation:nodeFloat 3s ease-in-out infinite;';
      let s=`<g style="${floatStyle}transform-origin:${cx2}px ${byb+bh}px">`;
      s+=`<rect x="${bxb}" y="${byb}" width="${bw}" height="${bh}" rx="${br}" fill="rgba(0,12,8,.97)" stroke="${borderC}" stroke-width="1.2"/>`;
      s+=`<rect x="${bxb+1}" y="${byb+1}" width="${bw-2}" height="${bh*0.35}" rx="${br}" fill="rgba(255,255,255,.04)"/>`;
      s+=`<clipPath id="batClip${(cx2|0)}"><rect x="${bxb+3}" y="${byb+3}" width="${bw-6}" height="${bh-6}" rx="${br-1}"/></clipPath>`;
      s+=`<rect x="${bxb+3}" y="${byb+3}" width="${fw}" height="${bh-6}" rx="${br-1}" fill="${fillC}" clip-path="url(#batClip${(cx2|0)})"/>`;
      s+=`<rect x="${bxb+3}" y="${byb+3}" width="${fw}" height="${bh*0.3}" rx="${br-1}" fill="rgba(255,255,255,.14)" clip-path="url(#batClip${(cx2|0)})"/>`;
      const nCells=4,cellW=(bw-6)/nCells;
      for(let ci=1;ci<nCells;ci++) s+=`<line x1="${bxb+3+ci*cellW}" y1="${byb+3}" x2="${bxb+3+ci*cellW}" y2="${byb+bh-3}" stroke="rgba(0,12,6,.55)" stroke-width="1.2"/>`;
      const termX=bxb+bw,termH=bh*0.45,termY=byb+(bh-termH)/2;
      s+=`<rect x="${termX}" y="${termY}" width="5" height="${termH}" rx="2" fill="rgba(40,180,110,.35)" stroke="${borderC}" stroke-width="1"/>`;
      s+=`<rect x="${termX+1.5}" y="${termY+2}" width="2.5" height="${termH-4}" rx="1" fill="${fillC}" opacity="0.65"/>`;
      s+=`<text x="${cx2}" y="${byb+bh/2+4.5}" text-anchor="middle" fill="rgba(255,255,255,.95)" font-size="15" font-weight="800" font-family="Inter,-apple-system,sans-serif" filter="url(#tf)">${bPct}%</text>`;
      const iconX=bxb+bw-14,iconY2=byb+3;
      if(isCharge){
        s+=`<g><animate attributeName="opacity" values="0;0;1;0.8;0;0;1;0.7;0" dur="1.1s" repeatCount="indefinite"/>`;
        s+=`<polygon points="${iconX+4},${iconY2} ${iconX},${iconY2+7} ${iconX+2.5},${iconY2+7} ${iconX+1},${iconY2+13} ${iconX+7},${iconY2+5.5} ${iconX+4.5},${iconY2+5.5}" fill="rgba(255,240,80,.97)"/></g>`;
      } else if(isDisch){
        const ay0=byb+bh*0.15,ayH=bh*0.22;
        for(let ai=0;ai<3;ai++){
          const aDelay=(ai*0.33).toFixed(2),ay=ay0+ai*ayH;
          s+=`<polyline points="${iconX},${ay} ${iconX+3.5},${ay+5} ${iconX+7},${ay}" fill="none" stroke="rgba(255,210,60,.95)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="0;1;1;0" dur="1.0s" begin="-${aDelay}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0,-4;0,3;0,8" dur="1.0s" begin="-${aDelay}s" repeatCount="indefinite" additive="sum"/></polyline>`;
        }
      } else if(bPct<=20){
        s+=`<text x="${iconX+3.5}" y="${iconY2+11}" text-anchor="middle" fill="rgba(255,80,80,.97)" font-size="12" font-weight="900" font-family="Inter,-apple-system,sans-serif">!<animate attributeName="opacity" values="1;0.15;1" dur="0.7s" repeatCount="indefinite"/></text>`;
      } else {
        s+=`<polyline points="${iconX},${iconY2+6} ${iconX+2.5},${iconY2+9} ${iconX+7},${iconY2+3}" fill="none" stroke="rgba(40,230,160,.95)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.5s" repeatCount="indefinite"/></polyline>`;
      }
      s+=`<rect x="${bxb}" y="${byb}" width="${bw}" height="${bh}" rx="${br}" fill="none" stroke="${borderC}" stroke-width="1.2" style="pointer-events:none"/>`;
      s+=`</g>`; return s;
    };

    const invIcoFn=(cx2,iy,aw,ah)=>{
      const iw=54,ih=46,ix=cx2-iw/2,iy0=iy+(ah-ih)/2-2;
      const floatStyle=minimalMode?'':'animation:nodeFloat 3.3s ease-in-out .55s infinite;';
      let s=`<g style="${floatStyle}transform-origin:${cx2}px ${iy0+ih}px">`;
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
      const floatStyleG=minimalMode?'':'animation:nodeFloat 2.9s ease-in-out 1.1s infinite;';
      s+=`<g style="${floatStyleG}transform-origin:${cx2}px ${iy+(ah*0.9)}px">`;
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
      s+='</g></g>'; return s;
    };

    const homIcoFn=(cx2,iy,aw,ah)=>{
      const sc=0.82,ox=cx2-43*sc,oy=iy+(ah-68*sc)/2;
      const p=(x,y)=>`${ox+x*sc},${oy+y*sc}`;
      const floatStyleH=minimalMode?'':'animation:nodeFloat 3.5s ease-in-out 1.65s infinite;';
      let s=`<g style="${floatStyleH}transform-origin:${cx2}px ${oy+72*sc}px">`;
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
      // ── Wind turbine (bên phải ngôi nhà) ──
      const tbX=ox+82*sc,tbBot=oy+68*sc,tbH=ah*0.78,tbTop=tbBot-tbH,tbR=tbH*0.52,tbCW=3.2;
      s+=`<polygon points="${tbX-tbCW},${tbBot} ${tbX+tbCW},${tbBot} ${tbX+tbCW*0.35},${tbTop} ${tbX-tbCW*0.35},${tbTop}" fill="rgba(160,200,240,.15)" stroke="rgba(140,195,255,.62)" stroke-width="0.8" stroke-linejoin="round"/>`;
      const nW=tbCW*3.2,nH=tbCW*1.6;
      s+=`<rect x="${tbX-nW/2}" y="${tbTop-nH/2}" width="${nW}" height="${nH}" rx="1.2" fill="rgba(100,160,220,.48)" stroke="rgba(160,210,255,.78)" stroke-width="0.8"/>`;
      s+=`<circle cx="${tbX}" cy="${tbTop}" r="${tbCW*0.65}" fill="rgba(200,230,255,.88)" stroke="rgba(255,255,255,.45)" stroke-width="0.6"/>`;
      const bLen=tbR,bWide=bLen*0.13;
      const bladeD=`M 0,0 C ${bWide*0.6},${-bLen*0.08} ${bWide*0.35},${-bLen*0.55} 0,${-bLen} C ${-bWide*0.35},${-bLen*0.55} ${-bWide*0.6},${-bLen*0.08} 0,0 Z`;
      s+=`<g transform="translate(${tbX},${tbTop})">`;
      s+=`<path d="${bladeD}" fill="rgba(180,220,255,.70)" stroke="rgba(200,235,255,.55)" stroke-width="0.5"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.2s" repeatCount="indefinite" calcMode="linear"/></path>`;
      s+=`<path d="${bladeD}" fill="rgba(160,210,255,.60)" stroke="rgba(190,230,255,.45)" stroke-width="0.5" transform="rotate(120)"><animateTransform attributeName="transform" type="rotate" from="120" to="480" dur="2.2s" repeatCount="indefinite" calcMode="linear"/></path>`;
      s+=`<path d="${bladeD}" fill="rgba(140,200,255,.50)" stroke="rgba(180,225,255,.40)" stroke-width="0.5" transform="rotate(240)"><animateTransform attributeName="transform" type="rotate" from="240" to="600" dur="2.2s" repeatCount="indefinite" calcMode="linear"/></path>`;
      s+=`</g>`;
      s+=`<circle cx="${tbX}" cy="${tbTop}" r="${tbCW*0.65}" fill="rgba(210,235,255,.92)" stroke="rgba(255,255,255,.55)" stroke-width="0.6"/>`;
      s+='</g>'; return s;
    };

    // Node cards
    const isInvActive=!invOff&&(hasSolar||hasHome||hasGrid||isCharge||isDisch);
    const foBAT=showBatteryNode?this._svgCard(BAT_X,BAT_Y,BAT_W,BAT_H,clrNodeBat,clrNodeBatG,'rgba(0,14,8,.97)',batIcoFn,battW,battDir,`${bVolt.toFixed(0)}V DC`,isCharge||isDisch,showGlow,minimalMode):'';
    const foINV=this._svgCard(INV_X,INV_Y,INV_W,INV_H,clrNodeInv,clrNodeInvG,'rgba(6,2,18,.97)',invIcoFn,`${gridV}V`,'AC Output',`${bVolt.toFixed(0)}V BAT · ${pvDC}V PV`,isInvActive,showGlow,minimalMode);
    const foGRD=this._svgCard(GRD_X,GRD_Y,GRD_W,GRD_H,clrNodeGrd,clrNodeGrdG,'rgba(0,10,20,.97)',grdIcoFn,gridW,gridDir,`${gridV}V AC`,hasGrid,showGlow,minimalMode);
    const foHOM=this._svgCard(HOM_X,HOM_Y,HOM_W,HOM_H,clrNodeHom,clrNodeHomG,'rgba(12,6,0,.97)',homIcoFn,homeW,T.homeConsume,'Home',hasHome,showGlow,minimalMode);

    // ── Solar Chart SVG (cạnh node Home) ─────────────────────
    const solarChartSVG=(()=>{
      const cX=HOM_X+HOM_W+15, cY=HOM_Y-20;
      const cW=158, cH=HOM_H+30;
      const pL=26, pB=22, pT=32, pR=6;
      const plotW=cW-pL-pR, plotH=cH-pT-pB;
      const maxW=solarDesignWp;
      // Round nowHour về số nguyên (giờ) — chart chỉ cần độ chính xác theo giờ,
      // tránh floating-point thay đổi mỗi giây gây innerHTML diff liên tục
      const _nowD=new Date();
      const nowHour=_nowD.getHours()+Math.round(_nowD.getMinutes()/60*10)/10;
      // Round tọa độ về 1 decimal — đủ chính xác cho chart, tránh micro-change từ floating-point
      const hToX=h=>Math.round((cX+pL+(h-6)/12*plotW)*10)/10;
      const wToY=w=>Math.round((cY+pT+plotH-Math.min(w,maxW)/maxW*plotH)*10)/10;

      // Solcast detailed forecast curve
      let curve=[];
      try {
        const sid=cfg.solcast_detail_entity;
        const solcast=sid&&this._hass.states[sid];
        if(solcast&&solcast.attributes&&solcast.attributes.detailedForecast){
          for(const pt of solcast.attributes.detailedForecast){
            const sh=new Date(pt.period_start).getHours()+new Date(pt.period_start).getMinutes()/60;
            const sw=Math.round((pt.pv_estimate||0)*1000);
            if(sh>=6&&sh<=18) curve.push({h:sh,w:sw});
          }
        }
      } catch(e){}

      // Forecast peak near now
      let peakW=0;
      if(curve.length>0){
        const cl=curve.reduce((a,b)=>Math.abs(b.h-nowHour)<Math.abs(a.h-nowHour)?b:a);
        peakW=Math.round(cl.w);
      }

      // FC polygon points
      let fcFill='', fcPts='';
      if(curve.length>0){
        const pts=[];
        pts.push(`${hToX(6)},${wToY(0)}`);
        for(const p of curve){
          if(p.h>=6&&p.h<=18&&!isNaN(p.w)) pts.push(`${hToX(p.h)},${wToY(p.w)}`);
        }
        pts.push(`${hToX(18)},${wToY(0)}`);
        fcFill=pts.join(' ');
        fcPts=pts.slice(1,pts.length-1).join(' ');
      }

      // Live curve from input_text entity
      let livePoints=[];
      try {
        const lid=cfg.solar_live_curve_entity;
        const lcState=lid&&this._hass.states[lid];
        const raw=lcState&&lcState.state&&lcState.state!=='unknown'&&lcState.state!=='unavailable'?lcState.state:'';
        if(raw){
          for(const kv of raw.split(',')){
            const parts=kv.split(':');
            if(parts.length===2){
              const ph=parseInt(parts[0]),pw=parseInt(parts[1]);
              if(!isNaN(ph)&&!isNaN(pw)&&ph>=6&&ph<=18) livePoints.push({h:ph,w:pw});
            }
          }
        }
      } catch(e){}

      let livePts='', liveFill='';
      if(livePoints.length>0){
        const lp=[`${hToX(6)},${wToY(0)}`];
        for(const p of livePoints) lp.push(`${hToX(p.h)},${wToY(p.w)}`);
        const lastH=livePoints[livePoints.length-1].h;
        liveFill=lp.join(' ')+' '+hToX(lastH)+','+wToY(0);
        livePts=lp.join(' ');
      } else if(nowHour>=6&&nowHour<=18){
        const lx=hToX(nowHour),ly=wToY(liveW||0);
        liveFill=`${hToX(6)},${wToY(0)} ${lx},${ly} ${lx},${wToY(0)}`;
        livePts=`${hToX(6)},${wToY(0)} ${lx},${ly}`;
      }

      // Solcast kWh totals
      const scTodayRaw=cfg.solcast_today_entity&&this._hass.states[cfg.solcast_today_entity];
      const scToday=scTodayRaw&&scTodayRaw.state!=='unavailable'&&scTodayRaw.state!=='unknown'?parseFloat(scTodayRaw.state)||0:0;
      const scTmrRaw=cfg.solcast_tomorrow_entity&&this._hass.states[cfg.solcast_tomorrow_entity];
      const scTmr=scTmrRaw&&scTmrRaw.state!=='unavailable'&&scTmrRaw.state!=='unknown'?parseFloat(scTmrRaw.state)||0:0;
      const solarTodayKwh=parseFloat(daily)||0;
      const cx2=cX+cW/2;

      let s='';
      // Background
      s+=`<rect x="${cX}" y="${cY}" width="${cW}" height="${cH}" rx="10" fill="rgba(0,0,0,.4)" stroke="rgba(255,255,255,.12)" stroke-width="1"/>`;
      // Legend: forecast peak W and live W
      s+=`<circle cx="${cx2-52}" cy="${cY+8}" r="6" fill="${clrChartFc}"/>`;
      s+=`<text x="${cx2-43}" y="${cY+12}" fill="${clrChartFc}" font-size="13" font-weight="800" font-family="Inter">${T.peakForecast}: ${peakW}W</text>`;
      s+=`<circle cx="${cx2-52}" cy="${cY+25}" r="6" fill="${clrChartLive}"/>`;
      s+=`<text x="${cx2-43}" y="${cY+29}" fill="${clrChartLive}" font-size="13" font-weight="800" font-family="Inter">${T.actualNow}: ${Math.round(liveW||0)}W</text>`;
      // Grid lines
      for(let gi=0;gi<=4;gi++){
        const gy=cY+pT+gi*plotH/4;
        const gw2=Math.round(maxW-gi*maxW/4);
        s+=`<line x1="${cX+pL}" y1="${gy}" x2="${cX+pL+plotW}" y2="${gy}" stroke="rgba(255,255,255,.07)" stroke-width="1"/>`;
        if(gi<4) s+=`<text x="${cX+pL-3}" y="${gy+3}" text-anchor="end" fill="rgba(255,255,255,.3)" font-size="7" font-family="Inter">${gw2>=1000?(gw2/1000).toFixed(1)+'k':gw2}</text>`;
      }
      // Forecast area + line
      if(fcFill){
        const fcRgba=clrChartFc.startsWith('#')?clrChartFc+'30':clrChartFc.replace(/,[\d.]+\)$/,',.18)');
        s+=`<polygon points="${fcFill}" fill="${fcRgba}"/>`;
        s+=`<polyline points="${fcPts}" fill="none" stroke="${clrChartFc}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      // Live area + line
      if(liveFill){
        const lvRgba=clrChartLive.startsWith('#')?clrChartLive+'33':clrChartLive.replace(/,[\d.]+\)$/,',.2)');
        s+=`<polygon points="${liveFill}" fill="${lvRgba}"/>`;
        s+=`<polyline points="${livePts}" fill="none" stroke="${clrChartLive}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      }
      // Now marker
      if(nowHour>=6&&nowHour<=18){
        const nx=hToX(nowHour);
        s+=`<line x1="${nx}" y1="${cY+pT}" x2="${nx}" y2="${cY+pT+plotH}" stroke="rgba(255,80,80,.6)" stroke-width="1" stroke-dasharray="2,3"/>`;
      }
      // X-axis hour labels
      for(const xh of [6,12,18]){
        const xx=hToX(xh),yy=cY+pT+plotH;
        s+=`<line x1="${xx}" y1="${yy}" x2="${xx}" y2="${yy+4}" stroke="rgba(255,255,255,.25)" stroke-width="1"/>`;
        s+=`<text x="${xx}" y="${yy+12}" text-anchor="middle" fill="rgba(255,255,255,.45)" font-size="9" font-family="Inter">${xh}h</text>`;
      }
      return s;
    })();

    // ── Bar Chart SVG (Actual / Forecast Today / Forecast Tomorrow) — left of Home node ──
    const barChartSVG=(()=>{
      const bcX = BAT_X + BAT_W - 95;
      const bcW = HOM_X - bcX - 16;
      const bcY = HOM_Y - 20;
      const bcH = HOM_H + 30;
      const bcPL=6,bcPR=6,bcPT=36,bcPB=28;
      const bcPW=bcW-bcPL-bcPR, bcPH=bcH-bcPT-bcPB;

      // Data
      const bcActual   = parseFloat(daily)||0;
      const bcFcToday  = parseFloat(this._gf('solcast_today_entity',0))||0;
      const bcFcTomorrow = parseFloat(this._gf('solcast_tomorrow_entity',0))||0;
      let bcMax = Math.round(Math.max(bcActual, bcFcToday, bcFcTomorrow, 1) * 1.15 * 10) / 10;
      // % vs forecast today (today = 100%)
      const bcPctActual   = bcFcToday>0?Math.round(bcActual/bcFcToday*100):null;
      const bcPctFcToday  = 100;
      const bcPctFcTmr    = bcFcToday>0?Math.round(bcFcTomorrow/bcFcToday*100):null;

      const nBars=3, barGap=bcPW*0.08;
      const barW=(bcPW - barGap*(nBars+1))/nBars;
      const bcBaseY=bcY+bcPT+bcPH;

      const bcBars=[
        {val:bcActual,    color:'rgba(74,222,128,1)',  label:lang==='vi'?'Thực tế':'Actual',    pct:bcPctActual},
        {val:bcFcToday,   color:'rgba(245,166,35,1)',  label:lang==='vi'?'Hôm nay':'Today',     pct:bcPctFcToday},
        {val:bcFcTomorrow,color:'rgba(72,209,255,1)',  label:lang==='vi'?'Ngày mai':'Tomorrow', pct:bcPctFcTmr},
      ];
      const bcBarX=i=>bcX+bcPL+barGap+i*(barW+barGap);
      const bcBarH=v=>Math.max(2,v/bcMax*bcPH);

      let s='';
      // card bg
      s+=`<rect x="${bcX}" y="${bcY}" width="${bcW}" height="${bcH}" rx="10" fill="rgba(0,0,0,.4)" stroke="rgba(255,255,255,.12)" stroke-width="1"/>`;
      // title
      s+=`<text x="${bcX+bcW/2}" y="${bcY+14}" text-anchor="middle" fill="rgba(255,255,255,.65)" font-size="11" font-weight="700" font-family="Inter">${lang==='vi'?'Dự báo kWh':'Forecast kWh'}</text>`;
      // legend dots
      const legItems=[{c:'rgba(74,222,128,1)',l:lang==='vi'?'Thực tế':'Actual'},{c:'rgba(245,166,35,1)',l:lang==='vi'?'Hôm nay':'Today'},{c:'rgba(72,209,255,1)',l:lang==='vi'?'Ngày mai':'Tmr'}];
      const legItemW=bcW/3;
      legItems.forEach((li,idx)=>{
        const lx=bcX+5+idx*legItemW;
        s+=`<circle cx="${lx+4}" cy="${bcY+24}" r="3" fill="${li.c}"/>`;
        s+=`<text x="${lx+10}" y="${bcY+27.5}" fill="rgba(255,255,255,.5)" font-size="7.5" font-family="Inter">${li.l}</text>`;
      });
      // grid lines
      for(let gi=0;gi<=4;gi++){
        const gy=bcY+bcPT+gi*bcPH/4;
        const gv=(bcMax*(1-gi/4)).toFixed(1);
        s+=`<line x1="${bcX+bcPL}" y1="${gy}" x2="${bcX+bcPL+bcPW}" y2="${gy}" stroke="rgba(255,255,255,.07)" stroke-width="1"/>`;
        if(gi<4) s+=`<text x="${bcX+bcPL-2}" y="${gy+3}" text-anchor="end" fill="rgba(255,255,255,.28)" font-size="6.5" font-family="Inter">${gv}</text>`;
      }
      // bars
      bcBars.forEach((bd,bi)=>{
        const bxPos=bcBarX(bi), bhVal=bcBarH(bd.val), byPos=bcBaseY-bhVal;
        // glow
        s+=`<rect x="${bxPos}" y="${byPos}" width="${barW}" height="${bhVal}" rx="3" fill="${bd.color}" opacity="0.15" filter="url(#pBlur)"/>`;
        // body
        s+=`<rect x="${bxPos}" y="${byPos}" width="${barW}" height="${bhVal}" rx="3" fill="${bd.color}" opacity="0.82"/>`;
        // highlight top
        s+=`<rect x="${bxPos}" y="${byPos}" width="${barW}" height="${Math.min(bhVal*0.35,10)}" rx="3" fill="rgba(255,255,255,.22)"/>`;
        // border
        s+=`<rect x="${bxPos}" y="${byPos}" width="${barW}" height="${bhVal}" rx="3" fill="none" stroke="${bd.color}" stroke-width="1.2" opacity="0.9"/>`;
        // value label
        s+=`<text x="${bxPos+barW/2}" y="${byPos-4}" text-anchor="middle" fill="${bd.color}" font-size="10" font-weight="800" font-family="Inter">${bd.val>0?bd.val.toFixed(1):'--'}</text>`;
        // % vs today label — sits just above baseline, overlaid on bar
        if(bd.pct!==null){
          const pctColor=bd.pct===100?'rgba(255,255,255,.9)':(bd.pct>100?'rgba(74,222,128,1)':'rgba(255,80,80,1)');
          s+=`<text x="${bxPos+barW/2}" y="${bcBaseY-4}" text-anchor="middle" fill="${pctColor}" font-size="8.5" font-weight="700" font-family="Inter">${bd.pct}%</text>`;
        }
        // axis label
        s+=`<text x="${bxPos+barW/2}" y="${bcBaseY+11}" text-anchor="middle" fill="rgba(255,255,255,.45)" font-size="8.5" font-family="Inter">${bd.label}</text>`;
      });
      // baseline
      s+=`<line x1="${bcX+bcPL}" y1="${bcBaseY}" x2="${bcX+bcPL+bcPW}" y2="${bcBaseY}" stroke="rgba(255,255,255,.22)" stroke-width="1"/>`;
      return s;
    })();


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
      if(minimalMode){
        // Minimal: static glow, no pulse
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG2}" fill="rgba(${gR},${gG},${gB},.18)" filter="url(#sunF)" opacity="0.55"/>`;
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG1}" fill="rgba(${gR},${gG},${gB},.55)" filter="url(#sf)" opacity="0.7"/>`;
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rC}" fill="url(#sunCG)" stroke="rgba(255,255,200,.85)" stroke-width="1.2"/>`;
      } else {
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG2}" fill="rgba(${gR},${gG},${gB},.18)" filter="url(#sunF)"><animate attributeName="r" values="${rG2};${(parseFloat(rG2)*1.18).toFixed(1)};${rG2}" dur="${bd}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.55;0.9;0.55" dur="${bd}s" repeatCount="indefinite"/></circle>`;
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rG1}" fill="rgba(${gR},${gG},${gB},.55)" filter="url(#sf)"><animate attributeName="r" values="${rG1};${(parseFloat(rG1)*1.22).toFixed(1)};${rG1}" dur="${bd}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;1;0.7" dur="${bd}s" repeatCount="indefinite"/></circle>`;
        sunSVG+=`<circle cx="${bx}" cy="${by}" r="${rC}" fill="url(#sunCG)" stroke="rgba(255,255,200,.85)" stroke-width="1.2"><animate attributeName="r" values="${rC};${(parseFloat(rC)*1.12).toFixed(1)};${rC}" dur="${bd}s" repeatCount="indefinite"/></circle>`;
      }
    }

    // Moon — round tọa độ về số nguyên (tương tự bx/by) để HTML ổn định
    const mcx=isNight?mx2:Math.round((1-t)*(1-t)*332+2*(1-t)*t*173+t*t*14);
    const mcy=isNight?my2:Math.round((1-t)*(1-t)*115+2*(1-t)*t*95+t*t*115);
    const moonSVG=`<g filter="url(#mf)" opacity="${isNight?'1':'.35'}"><circle cx="${mcx}" cy="${mcy}" r="${isNight?10:7}" fill="${isNight?'rgba(180,205,255,.3)':'rgba(180,205,255,.10)'}"/><circle cx="${mcx}" cy="${mcy}" r="${isNight?6:3.5}" fill="${isNight?'rgba(220,235,255,.98)':'rgba(200,218,255,.85)'}" stroke="${isNight?'rgba(240,248,255,.9)':'rgba(225,235,255,.65)'}" stroke-width="1.2"/></g>`;

    // Battery bar
    let bColor,bGlow;
    if(bPct<=10){bColor='linear-gradient(90deg,#7f1d1d,#dc2626,#ef4444)';bGlow='rgba(239,68,68,.6)';}
    else if(bPct<=20){bColor='linear-gradient(90deg,#dc2626,#ea580c,#f59e0b)';bGlow='rgba(245,158,11,.55)';}
    else{bColor='linear-gradient(90deg,#16a34a,#4ade80,#86efac)';bGlow='rgba(74,222,128,.5)';}

    // ── Two-layer render: anim layer stays alive, data layer updates freely ──
    // #swc-anim: flow SVG particles/waves — chỉ rebuild khi layout/màu/style thay đổi
    // #swc-data: weather, nodes, stats  — update mỗi khi sensor thay đổi
    const _cssText=`:host{display:block}*{box-sizing:border-box;margin:0;padding:0}
@keyframes nodeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
${_WEATHER_ICON_CSS}
${minimalMode?`*,*::before,*::after{animation-duration:0.001s!important;animation-iteration-count:1!important;transition-duration:0s!important;}`:''}`;

    const _curAnimSig=this._buildAnimSig();
    const _needAnimRebuild=_curAnimSig!==this._animSig||!this._shellReady;

    if(_needAnimRebuild){
      this._animSig=_curAnimSig;
      // Shell gồm 3 vùng cố định:
      //   swc-top       → header weather/clock  (update bằng innerHTML)
      //   swc-svg-section → sun-bar + svg-wrap  (wrap CỐ ĐỊNH — không bao giờ bị xóa)
      //     swc-svg-data  → <svg> chứa nodes/sun/rooms (update innerHTML riêng)
      //     swc-flow-svg  → flow particles (inject 1 lần, reuse, animation không bị reset)
      //   swc-bot       → battery bar + stats   (update bằng innerHTML)
      this.shadowRoot.innerHTML=`<style id="main-css">${_cssText}</style><div id="swc-card" style="font-family:Inter,-apple-system,sans-serif;color:${clrTextPrim};
  background:${bg};backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);
  border:1px solid rgba(255,255,255,.18);border-radius:24px;
  box-shadow:0 8px 32px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.20),inset 0 -1px 0 rgba(255,255,255,.05);
  overflow:hidden;position:relative;">
  <div id="swc-top"></div>
  <div id="swc-svg-section">
    <div id="swc-sun-bar"></div>
    <div class="swc-svg-wrap" style="position:relative;width:100%;height:${ROOM_Y+RH+16}px;contain:layout style;">
      <svg id="swc-svg-data" viewBox="${VB_X} 0 ${VB_W} ${ROOM_Y+RH+16}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;will-change:transform;z-index:1;"></svg>
    </div>
  </div>
  <div id="swc-bot"></div>
</div>`;
      this._shellReady=true;
    } else {
      // Chỉ update card background/color (bg thay đổi theo thời gian)
      const card=this.shadowRoot.getElementById('swc-card');
      if(card){ card.style.background=bg; card.style.color=clrTextPrim; }
      // Cập nhật kích thước wrap nếu layout thay đổi (room count, node Y)
      const wrap=this.shadowRoot.querySelector('.swc-svg-wrap');
      if(wrap) wrap.style.height=`${ROOM_Y+RH+16}px`;
      const svgData=this.shadowRoot.getElementById('swc-svg-data');
      if(svgData) svgData.setAttribute('viewBox',`${VB_X} 0 ${VB_W} ${ROOM_Y+RH+16}`);
    }

    // ── Data render — chia thành 4 zone độc lập ─────────────────
    // Zone 1: swc-top  — weather header, clock, hourly strip, tomorrow
    // Zone 2: swc-sun-bar — sun arc text labels (trên wrap)
    // Zone 3: swc-svg-data — SVG data nằm trong wrap CỐ ĐỊNH (không detach flow SVG)
    // Zone 4: swc-bot  — battery bar + stats circles
    //
    // Mỗi zone chỉ update innerHTML khi nội dung thực sự thay đổi (string diff)
    // → flow SVG (_animNode) luôn sống trong wrap → animation không bao giờ bị reset

    // ── Zone 1: TOP ───────────────────────────────────────────
    const _newTopHTML=showClock?`
  ${showInfo?`<div style="padding:18px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
    <div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;margin-bottom:12px;">
      <div>${wState?condHTML:'<div style="width:70px;height:70px;display:flex;align-items:center;justify-content:center;font-size:28px;opacity:.25;">🌤️</div>'}</div>
      <div style="text-align:center;">
        <div style="font-size:80px;font-weight:800;line-height:1;letter-spacing:-3px;text-shadow:0 2px 20px rgba(255,255,255,.25);"><span id="live-clock">${hh}:${mm}</span><span id="live-ap" style="font-size:28px;font-weight:400;opacity:.55;margin-left:4px;">${ap}</span></div>
        <div style="font-size:18px;color:rgba(255,255,255,.55);margin-top:3px;">${dateStr}</div>
      </div><div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 0;font-size:12px;color:rgba(255,255,255,.6);margin-bottom:8px;">
      <div>${cond||'--'}</div>
      <div style="text-align:right;">${(tempHi!=='--')?`⚡ <span style="color:#fff;font-weight:600;">${tempHi}°</span> / <span style="color:rgba(255,255,255,.6);">${tempLo}${_tempSuffix}</span>`:`<span style="color:rgba(255,255,255,.35);">-- / --${_tempSuffix}</span>`}</div>
      <div>${temp!==null?`🌡️ <span style="color:#fff;font-weight:600;">${temp}${_tempSuffix}</span>`:`<span style="color:rgba(255,255,255,.35);">🌡️ --${_tempSuffix}</span>`}${(temp!==null||humid!==null)?` &nbsp;`:''} ${humid!==null?`💧 <span style="color:#fff;font-weight:600;">${humid}%</span>`:'<span style="color:rgba(255,255,255,.35);">💧 --%</span>'}</div>
      <div style="text-align:right;">${uv!==null?`UV <span style="color:#fff;font-weight:600;">${uv}</span> &nbsp;`:''}${press!==null?`🌬️ <span style="color:#fff;font-weight:600;">${press} hPa</span>`:''}</div>
    </div>
    ${showHourlyForecast?(()=>{
      // Only use hourly_forecast_entity if configured — no fallback
      if(!cfg.hourly_forecast_entity) return '';
      let hourlySlots=[];
      try {
        const rawH=this._hass.states[cfg.hourly_forecast_entity];
        if(rawH&&rawH.attributes&&rawH.attributes.timelines){
          const ivs=rawH.attributes.timelines[0].intervals;
          const nowMs=Date.now();
          const tmIcons={1000:'☀️',1100:'🌤️',1101:'⛅',1102:'☁️',1001:'☁️',2000:'🌫️',2100:'🌫️',4000:'🌧️',4001:'🌧️',4200:'🌦️',4201:'🌧️',8000:'⛈️',8001:'⛈️',8002:'⛈️'};
          // Night variants: clear/partly-clear → moon; cloudy/rain/storm keep as-is
          const tmIconsNight={1000:'🌙',1100:'🌙',1101:'⛅',1102:'☁️',1001:'☁️',2000:'🌫️',2100:'🌫️',4000:'🌧️',4001:'🌧️',4200:'🌦️',4201:'🌧️',8000:'⛈️',8001:'⛈️',8002:'⛈️'};
          let cnt=0;
          for(const iv of ivs){
            if(cnt>=6) break;
            if(new Date(iv.startTime).getTime()<nowMs) continue;
            const slotH=new Date(iv.startTime).getHours();
            const isNightSlot=slotH>=18||slotH<6;
            const iconMap=isNightSlot?tmIconsNight:tmIcons;
            hourlySlots.push({h:slotH,t:Math.round(iv.values.temperature),ic:iconMap[iv.values.weatherCode]||'🌤️'});
            cnt++;
          }
        }
      } catch(e){}
      if(!hourlySlots.length) return '';
      return `<div style="display:flex;gap:2px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:6px 4px;margin-bottom:8px;">${
        hourlySlots.map(sl=>`<div style="text-align:center;flex:1;"><div style="font-size:10px;color:rgba(255,255,255,.45);">${sl.h}h</div><div style="font-size:13px;line-height:1.3;">${sl.ic}</div><div style="font-size:10px;font-weight:700;color:#fff;">${sl.t}°</div></div>`).join('')
      }</div>`;
    })():''}
    ${showTmr?`<div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:7px 11px;font-size:11.5px;">
      <span style="color:rgba(255,255,255,.45);">${T.tomorrow}</span>
      <div style="transform:scale(0.55);transform-origin:center center;width:40px;height:25px;flex-shrink:0;position:relative;top:-18px;">${tmrHTML}</div>
      <span style="color:#fff;font-weight:600;">${tmrWstate?tmrW:'--'}</span>
      ${tmrHi!=='--'?`<span style="margin-left:auto;color:#fff;font-weight:600;">${tmrHi}°</span><span style="color:rgba(255,255,255,.45);">/</span><span style="color:rgba(255,255,255,.65);">${tmrLo}${_tempSuffix}</span>`:`<span style="margin-left:auto;color:rgba(255,255,255,.35);">-- / --${_tempSuffix}</span>`}
    </div>`:''}
  </div>`:`
  <div style="padding:16px 16px 14px;border-bottom:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);">
    <div style="display:grid;grid-template-columns:80px 1fr 40px;align-items:center;">
      <div>${condHTML}</div>
      <div style="text-align:center;">
        <div style="font-size:80px;font-weight:800;line-height:1;letter-spacing:-3px;text-shadow:0 2px 20px rgba(255,255,255,.25);"><span id="live-clock">${hh}:${mm}</span><span id="live-ap" style="font-size:28px;font-weight:400;opacity:.55;margin-left:4px;">${ap}</span></div>
        <div style="font-size:16px;color:rgba(255,255,255,.55);margin-top:4px;">${dateStr}</div>
      </div>
      <div></div>
    </div>
  </div>`}
`:'';

    // ── Zone 2: SUN BAR ───────────────────────────────────────
    const _newSunBarHTML=`<div style="padding:8px 0 10px;border-bottom:1px solid rgba(255,255,255,.10);">
    <div style="display:flex;justify-content:space-between;font-size:10.5px;color:rgba(255,255,255,.55);margin-bottom:5px;padding:0 14px;">
      <span>🌅 <strong style="color:#fff;">${riseStr}</strong> ${T.sunrise}</span>
      <span><strong style="color:#fff;">${pct}%</strong> ${T.dayPct}</span>
      <span>${T.sunset} <strong style="color:#fff;">${setStr}</strong> 🌇</span>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:8px;padding:0 14px;">
      <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(255,200,70,.15);border:1px solid rgba(255,200,70,.35);color:rgba(255,225,110,.95);">☀️ ${T.daytime}: ${fmtDur(dayMin)}</div>
      <div style="flex:1;padding:5px 0;border-radius:20px;text-align:center;font-size:10.5px;font-weight:600;background:rgba(140,175,255,.12);border:1px solid rgba(140,175,255,.3);color:rgba(185,210,255,.9);">🌙 ${T.nighttime}: ${fmtDur(nightMin)}</div>
    </div>
  </div>`; // end _newSunBarHTML

    // ── Zone 3: SVG DATA (trong wrap cố định) ─────────────────
    // Chỉ update innerHTML của <svg id="swc-svg-data"> — không đụng đến wrap hay flow SVG
    const _newSvgDataHTML=`
        <defs>
          <filter id="pBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
          <filter id="pBlurSm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.5"/></filter>
          <filter id="sf"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="mf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="tf" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/><feFlood flood-color="rgba(0,0,0,.55)" result="c"/><feComposite in="c" in2="b" operator="in" result="d"/><feMerge><feMergeNode in="d"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(255,180,50,0)"/><stop offset="20%" stop-color="rgba(255,200,70,.5)"/><stop offset="50%" stop-color="rgba(255,228,110,.92)"/><stop offset="80%" stop-color="rgba(255,200,70,.5)"/><stop offset="100%" stop-color="rgba(255,180,50,0)"/></linearGradient>
          <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="rgba(140,170,255,0)"/><stop offset="30%" stop-color="rgba(155,185,255,.35)"/><stop offset="50%" stop-color="rgba(200,215,255,.7)"/><stop offset="70%" stop-color="rgba(155,185,255,.35)"/><stop offset="100%" stop-color="rgba(140,170,255,0)"/></linearGradient>
          <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(55,125,225,.10)"/><stop offset="100%" stop-color="rgba(55,125,225,0)"/></linearGradient>
          <radialGradient id="dynAuraG" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="rgba(${r1},${g1},${b1},.30)"/><stop offset="55%" stop-color="rgba(${r2},${g2},${b2},.10)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>
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
        <text x="${lbx+lbw/2}" y="${lby+17}" text-anchor="middle" fill="rgba(255,235,110,.98)" font-size="14" font-weight="800" font-family="Inter">${this._fmtPower(solarW,'solar')} ⚡</text>
        ${moonSVG}
        ${foBAT}${foINV}${foGRD}${foHOM}
        ${gridExportToday>0.005?`<g>
          <rect x="${GRD_X}" y="${GRD_Y+GRD_H+6}" width="${GRD_W}" height="22" rx="5" fill="rgba(255,210,50,.12)" stroke="rgba(255,210,50,.35)" stroke-width="1"/>
          <text x="${GRD_X+GRD_W/2}" y="${GRD_Y+GRD_H+21}" text-anchor="middle" fill="rgba(255,220,60,.95)" font-size="10" font-weight="700" font-family="Inter">⚡ ${gridExportToday.toFixed(2)} kWh</text>
        </g>`:''}
        ${showForecastChart?barChartSVG:''}
        ${showForecastChart?solarChartSVG:''}
        <g transform="translate(${(173*(1-_roomScale)).toFixed(2)},0) scale(${_roomScale},1)">
        ${trunkSVG}
        ${showRoomsSection?roomSVG:''}
        </g>
        ${showRoomsSection?roomSVGFree:''}
`; // end _newSvgDataHTML

    // ── Zone 4: BOT ───────────────────────────────────────────
    const _newBotHTML=`
  <div style="padding:${showBatteryBar||showStatsCircles?'16px':'0'};">
    ${showBatteryBar?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
      <span style="color:rgba(255,255,255,.6);">${T.battLabel}</span>
      <span style="font-weight:700;color:${bPct<=10?'#ef4444':bPct<=20?'#f59e0b':'#4ade80'}">${bPct}%</span>
    </div>
    <div style="height:7px;border-radius:4px;background:rgba(255,255,255,.10);overflow:hidden;margin-bottom:${battETA?'8px':'14px'}">
      <div style="height:100%;width:${bPct}%;border-radius:4px;background:${bColor};box-shadow:0 0 8px ${bGlow}"></div>
    </div>
    ${battETA?`<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,.65);margin-bottom:14px;">${battETA}</div>`:''}`:''}

    ${showStatsCircles?(()=>{
      // ── Stats circles SVG (design from v1.6 YAML) ──────────
      const solarPct=parseFloat(dailyuse)+parseFloat(gridDaily)>0?Math.round(parseFloat(dailyuse)/(parseFloat(dailyuse)+parseFloat(gridDaily))*100):0;
      const gridPct=100-solarPct;
      const angRad=gridPct/100*2*Math.PI;
      const pieX=(542+100*Math.sin(angRad)).toFixed(2);
      const pieY=(110-100*Math.cos(angRad)).toFixed(2);
      const largeArcG=gridPct>50?'1':'0';
      const largeArcS=solarPct>50?'1':'0';
      const luxState2=this._g('inverter_status_entity','--');
      const _invTempRaw2=this._gf('inverter_temp_entity',0);
      const _batTempRaw2=this._gf('battery_temp_entity',0);
      const invTemp2=(useFahrenheit?_toDisplayTemp(_invTempRaw2).toFixed(0):_invTempRaw2.toFixed(1));
      const batTemp2=(useFahrenheit?_toDisplayTemp(_batTempRaw2).toFixed(0):_batTempRaw2.toFixed(1));
      const isOff2=['--','unavailable','unknown','Unavailable'].includes(luxState2);
      const isNormal2=['Normal','normal','online','Online','ONLINE'].includes(luxState2);
      const stColor2=isNormal2?'#4ade80':isOff2?'#ff5050':'#ffc83c';
      const stLabel2=isOff2?'OFFLINE':(isNormal2?'ONLINE':luxState2);
      // Saving from dailyuse (solar used by home)
      const savCalc=savFmtUse+currency;

      return `<style>@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700&display=swap");</style>
<svg style="display:block;width:100%;height:auto" viewBox="-7 5 1090 220" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="gSav" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#0a2e12"/><stop offset="55%" stop-color="#051808"/><stop offset="100%" stop-color="#020c04"/></radialGradient>
  <radialGradient id="gS"   cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#3d2200"/><stop offset="55%" stop-color="#1c0f00"/><stop offset="100%" stop-color="#0e0800"/></radialGradient>
  <radialGradient id="gG"   cx="60%" cy="35%" r="65%"><stop offset="0%" stop-color="#0c2050"/><stop offset="55%" stop-color="#060e28"/><stop offset="100%" stop-color="#030812"/></radialGradient>
  <radialGradient id="gCi"  cx="42%" cy="38%" r="62%"><stop offset="0%" stop-color="#2a1800"/><stop offset="100%" stop-color="#0a0600"/></radialGradient>
  <radialGradient id="pA"   cx="20%" cy="70%" r="85%"><stop offset="0%" stop-color="#d49000"/><stop offset="45%" stop-color="#8a5800"/><stop offset="100%" stop-color="#3c2800"/></radialGradient>
  <radialGradient id="pB"   cx="80%" cy="20%" r="85%"><stop offset="0%" stop-color="#1060c0"/><stop offset="50%" stop-color="#0a1e60"/><stop offset="100%" stop-color="#050a25"/></radialGradient>
  <radialGradient id="gSys" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#1a0a2e"/><stop offset="55%" stop-color="#0d0518"/><stop offset="100%" stop-color="#06020c"/></radialGradient>
  <clipPath id="cSav"><circle cx="96"  cy="110" r="102"/></clipPath>
  <clipPath id="cS">  <circle cx="320" cy="110" r="98"/></clipPath>
  <clipPath id="cC">  <circle cx="544" cy="110" r="110"/></clipPath>
  <clipPath id="cG">  <circle cx="768" cy="110" r="98"/></clipPath>
  <clipPath id="cSys"><circle cx="980" cy="110" r="102"/></clipPath>
</defs>
<!-- BG circles -->
<circle cx="96"  cy="110" r="102" fill="url(#gSav)"/>
<circle cx="320" cy="110" r="98"  fill="url(#gS)"/>
<circle cx="768" cy="110" r="98"  fill="url(#gG)"/>
<circle cx="980" cy="110" r="102" fill="url(#gSys)"/>
<!-- connector shapes -->
<path d="M 408,82 C 420,82 426,90 432,92 C 438,94 442,94 444,94 L 444,126 C 442,126 438,126 432,128 C 426,130 420,138 408,138 Z" fill="#111010" opacity="0.95"/>
<path d="M 406,56 C 418,62 426,76 432,90 C 436,98 440,98 443,98"       fill="none" stroke="#c88000" stroke-width="2.4" stroke-linecap="round"/>
<path d="M 406,164 C 418,158 426,144 432,130 C 436,122 440,122 443,122" fill="none" stroke="#c88000" stroke-width="2.4" stroke-linecap="round"/>
<path d="M 680,82 C 668,82 661,90 655,92 C 649,94 646,94 644,94 L 644,126 C 646,126 649,126 655,128 C 661,130 668,138 680,138 Z" fill="#080c18" opacity="0.95"/>
<!-- borders -->
<circle cx="96"  cy="110" r="104" fill="none" stroke="rgba(30,180,60,0.18)"  stroke-width="7"/>
<circle cx="96"  cy="110" r="102" fill="none" stroke="#1a7a30" stroke-width="2.4"/>
<circle cx="320" cy="110" r="100" fill="none" stroke="rgba(210,145,0,0.18)"  stroke-width="7"/>
<circle cx="320" cy="110" r="98"  fill="none" stroke="#c88000" stroke-width="2.4"/>
<circle cx="544" cy="110" r="105" fill="none" stroke="rgba(200,145,0,0.18)"  stroke-width="7"/>
<circle cx="768" cy="110" r="100" fill="none" stroke="rgba(15,60,200,0.20)"  stroke-width="7"/>
<circle cx="768" cy="110" r="98"  fill="none" stroke="#1e50b8" stroke-width="2.4"/>
<circle cx="980" cy="110" r="104" fill="none" stroke="rgba(120,50,220,0.18)" stroke-width="7"/>
<circle cx="980" cy="110" r="102" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
<!-- Pie chart center -->
<path d="M542,110 L542,10 A100,100 0 ${largeArcG} 1 ${pieX} ${pieY} Z" fill="url(#pB)" clip-path="url(#cC)"/>
<path d="M542,110 L542,10 A100,100 0 ${largeArcS} 0 ${pieX} ${pieY} Z" fill="url(#pA)" clip-path="url(#cC)"/>
<line x1="542" y1="110" x2="542"      y2="10"       stroke="rgba(0,0,0,0.80)" stroke-width="1.8" clip-path="url(#cC)"/>
<line x1="542" y1="110" x2="${pieX}"  y2="${pieY}"   stroke="rgba(0,0,0,0.80)" stroke-width="1.8" clip-path="url(#cC)"/>
<circle cx="544" cy="110" r="100" fill="none" stroke="#a07800" stroke-width="2.4"/>
<path d="M 683,56 C 671,62 663,76 657,90 C 653,98 649,98 645,98"       fill="none" stroke="#1e50b8" stroke-width="2.4" stroke-linecap="round"/>
<path d="M 683,164 C 671,158 663,144 657,130 C 653,122 649,122 645,122" fill="none" stroke="#1e50b8" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="544" cy="110" r="75" fill="url(#gCi)"/>
<circle cx="544" cy="110" r="75" fill="none" stroke="rgba(180,130,0,0.45)" stroke-width="1.5"/>
<!-- Saving circle -->
<g clip-path="url(#cSav)">
  <g transform="translate(62,14)">
    <ellipse cx="34" cy="58" rx="27" ry="25" fill="rgba(30,140,60,0.22)" stroke="#1a7a30" stroke-width="2"/>
    <path d="M21,40 Q25,32 34,32 Q43,32 47,40" fill="none" stroke="#1a7a30" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="34" cy="38" rx="6" ry="4" fill="rgba(30,160,70,0.4)" stroke="#1a7a30" stroke-width="1.6"/>
    <ellipse cx="23" cy="58" rx="8" ry="4.5" fill="rgba(212,170,0,0.65)" stroke="#d4aa00" stroke-width="1.5"/>
    <text x="23" y="60.5" font-family="Arial" font-size="5.5" font-weight="900" fill="rgba(255,240,0,0.9)" text-anchor="middle">$</text>
    <ellipse cx="45" cy="58" rx="8" ry="4.5" fill="rgba(212,170,0,0.62)" stroke="#d4aa00" stroke-width="1.5"/>
    <text x="45" y="60.5" font-family="Arial" font-size="5.5" font-weight="900" fill="rgba(255,240,0,0.9)" text-anchor="middle">$</text>
    <ellipse cx="34" cy="46" rx="8" ry="4.5" fill="rgba(212,170,0,0.60)" stroke="#d4aa00" stroke-width="1.5"/>
    <text x="34" y="48.5" font-family="Arial" font-size="5.5" font-weight="900" fill="rgba(255,240,0,0.95)" text-anchor="middle">$</text>
  </g>
  <text x="96" y="135" font-family="Orbitron,monospace" font-size="36" font-weight="900" fill="#4ade80" text-anchor="middle">${savFmtUse}<tspan font-size="28" fill="rgba(74,222,128,0.85)">${currency}</tspan></text>
  <text x="96" y="174" font-family="Rajdhani,sans-serif" font-size="26" font-weight="700" fill="rgba(74,222,128,0.92)" text-anchor="middle" letter-spacing="1">Save</text>
</g>
<!-- Solar produced circle -->
<g clip-path="url(#cS)">
  <g transform="translate(288,32)">
    <rect x="0" y="0" width="64" height="44" rx="3" fill="rgba(180,110,0,0.15)" stroke="#c88000" stroke-width="2" opacity="0.9"/>
    <line x1="21.3" y1="0" x2="21.3" y2="44" stroke="#c88000" stroke-width="1.1" opacity="0.6"/>
    <line x1="42.7" y1="0" x2="42.7" y2="44" stroke="#c88000" stroke-width="1.1" opacity="0.6"/>
    <line x1="0" y1="14.7" x2="64" y2="14.7" stroke="#c88000" stroke-width="1.1" opacity="0.6"/>
    <line x1="0" y1="29.3" x2="64" y2="29.3" stroke="#c88000" stroke-width="1.1" opacity="0.6"/>
    <rect x="1.5" y="1.5" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.30"/>
    <rect x="22.8" y="1.5" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.20"/>
    <rect x="44.2" y="1.5" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.30"/>
    <rect x="1.5" y="16.2" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.18"/>
    <rect x="22.8" y="16.2" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.28"/>
    <rect x="44.2" y="16.2" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.18"/>
    <rect x="1.5" y="30.8" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.30"/>
    <rect x="22.8" y="30.8" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.20"/>
    <rect x="44.2" y="30.8" width="18.8" height="12.2" rx="1.5" fill="#c88000" opacity="0.30"/>
    <line x1="32" y1="44" x2="32" y2="54" stroke="#c88000" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <line x1="18" y1="54" x2="46" y2="54" stroke="#c88000" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <line x1="18" y1="54" x2="11" y2="61" stroke="#c88000" stroke-width="2"   stroke-linecap="round" opacity="0.6"/>
    <line x1="46" y1="54" x2="53" y2="61" stroke="#c88000" stroke-width="2"   stroke-linecap="round" opacity="0.6"/>
  </g>
  <text x="320" y="135" font-family="Orbitron,monospace" font-size="36" font-weight="900" fill="#ffc200" text-anchor="middle">${dailyuse}<tspan font-size="20" fill="rgba(255,194,0,0.85)" dx="2">kWh</tspan></text>
  <text x="320" y="174" font-family="Rajdhani,sans-serif" font-size="26" font-weight="700" fill="rgba(255,175,0,0.92)" text-anchor="middle" letter-spacing="1">${T.solarProduced}</text>
</g>
<!-- Pie labels -->
<text x="440" y="178" font-family="Rajdhani,sans-serif" font-size="25" font-weight="700" fill="#FFFFFF" text-anchor="middle">${solarPct}%</text>
<text x="445" y="200" font-family="Rajdhani,sans-serif" font-size="22" font-weight="600" fill="rgba(250,235,200,0.95)" text-anchor="middle">Solar</text>
<text x="645" y="45"  font-family="Rajdhani,sans-serif" font-size="25" font-weight="700" fill="#FFFFFF" text-anchor="middle">${gridPct}%</text>
<text x="652" y="65"  font-family="Rajdhani,sans-serif" font-size="22" font-weight="600" fill="rgba(72,118,255,0.95)" text-anchor="middle">Grid</text>
<!-- Home icon center pie -->
<g transform="translate(520,52)" fill="none" stroke="#c88000" stroke-width="1.9" stroke-linejoin="round" opacity="0.92">
  <polyline points="24,0 1,17 6,17 6,38 42,38 42,17 47,17 24,0"/>
  <rect x="15" y="23" width="10" height="15" rx="1.5"/>
  <path d="M27 11 l-6 10 h5 l-4 10 11-14 h-6 z" fill="#ffd700" stroke="none" opacity="0.95"/>
</g>
<!-- Consumption center -->
<text x="555" y="143" font-family="Orbitron,monospace" font-size="36" font-weight="900" fill="#ff9500" text-anchor="middle">${combinedFmt}<tspan font-size="18" fill="rgba(255,149,0,0.85)" dx="2">kWh</tspan></text>
<text x="544" y="192" font-family="Rajdhani,sans-serif" font-size="20" font-weight="700" fill="rgba(235,195,75,0.92)" text-anchor="middle">Daily used</text>
<!-- Grid circle -->
<g clip-path="url(#cG)">
  <g transform="translate(738,24)" stroke="#4da8ff" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <line x1="30" y1="2"  x2="30" y2="76" stroke-width="2.5" opacity="0.9"/>
    <line x1="5"  y1="18" x2="55" y2="18" stroke-width="2.2" opacity="0.9"/>
    <line x1="11" y1="34" x2="49" y2="34" stroke-width="2"   opacity="0.85"/>
    <line x1="17" y1="50" x2="43" y2="50" stroke-width="1.8" opacity="0.8"/>
    <line x1="30" y1="2"  x2="5"  y2="18" stroke-width="1.5" opacity="0.7"/>
    <line x1="30" y1="2"  x2="55" y2="18" stroke-width="1.5" opacity="0.7"/>
    <line x1="5"  y1="18" x2="11" y2="34" stroke-width="1.3" opacity="0.6"/>
    <line x1="55" y1="18" x2="49" y2="34" stroke-width="1.3" opacity="0.6"/>
    <line x1="11" y1="34" x2="17" y2="50" stroke-width="1.2" opacity="0.55"/>
    <line x1="49" y1="34" x2="43" y2="50" stroke-width="1.2" opacity="0.55"/>
    <line x1="30" y1="76" x2="16" y2="88" stroke-width="2.2" opacity="0.8"/>
    <line x1="30" y1="76" x2="44" y2="88" stroke-width="2.2" opacity="0.8"/>
    <line x1="12" y1="88" x2="20" y2="88" stroke-width="2"   opacity="0.7"/>
    <line x1="40" y1="88" x2="48" y2="88" stroke-width="2"   opacity="0.7"/>
    <circle cx="5"  cy="18" r="3.5" fill="#4da8ff" stroke="none" opacity="0.95"/>
    <circle cx="55" cy="18" r="3.5" fill="#4da8ff" stroke="none" opacity="0.95"/>
    <circle cx="11" cy="34" r="3"   fill="#4da8ff" stroke="none" opacity="0.85"/>
    <circle cx="49" cy="34" r="3"   fill="#4da8ff" stroke="none" opacity="0.85"/>
    <circle cx="17" cy="50" r="2.5" fill="#4da8ff" stroke="none" opacity="0.75"/>
    <circle cx="43" cy="50" r="2.5" fill="#4da8ff" stroke="none" opacity="0.75"/>
  </g>
  <text x="768" y="142" font-family="Orbitron,monospace" font-size="36" font-weight="900" fill="#4da8ff" text-anchor="middle">${gridDaily}<tspan font-size="20" fill="rgba(77,168,255,0.85)">kWh</tspan></text>
  <text x="768" y="174" font-family="Rajdhani,sans-serif" font-size="26" font-weight="700" fill="rgba(77,168,255,0.92)" text-anchor="middle" letter-spacing="1">Grid</text>
</g>
<!-- System circle -->
<g clip-path="url(#cSys)">
  <text x="980" y="46"  font-family="Rajdhani,sans-serif" font-size="20" font-weight="700" fill="rgba(180,140,255,0.85)" text-anchor="middle" letter-spacing="1.5">System</text>
  <text x="980" y="72"  font-family="Orbitron,monospace"  font-size="22" font-weight="800" fill="${stColor2}" text-anchor="middle">${stLabel2}</text>
  <line x1="938" y1="82" x2="1022" y2="82" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
  <text x="980" y="102" font-family="Rajdhani,sans-serif" font-size="20" font-weight="600" fill="rgba(255,200,80,0.85)" text-anchor="middle">Inverter</text>
  <text x="980" y="128" font-family="Orbitron,monospace"  font-size="24" font-weight="700" fill="rgba(255,200,80,1)"    text-anchor="middle">${invTemp2}${_tempSuffix}</text>
  <line x1="938" y1="134" x2="1022" y2="134" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="980" y="156" font-family="Rajdhani,sans-serif" font-size="20" font-weight="600" fill="rgba(80,200,255,0.85)" text-anchor="middle">Battery</text>
  <text x="980" y="182" font-family="Orbitron,monospace"  font-size="24" font-weight="700" fill="rgba(80,200,255,1)"   text-anchor="middle">${batTemp2}${_tempSuffix}</text>
</g>
</svg>`;
    })():''}

  </div>
`; // end _newBotHTML

    // ── Apply 4 zones — mỗi zone chỉ update khi nội dung thực sự thay đổi ──
    const _top=this._getTopLayer();
    if(_top&&_top.innerHTML!==_newTopHTML) _top.innerHTML=_newTopHTML;

    const _sunBar=this._getSunBar();
    if(_sunBar&&_sunBar.innerHTML!==_newSunBarHTML) _sunBar.innerHTML=_newSunBarHTML;

    // Zone SVG data: update trực tiếp innerHTML của <svg id="swc-svg-data">
    // wrap (.swc-svg-wrap) và flow SVG (_animNode) KHÔNG bị đụng đến
    const _svgData=this._getSvgData();
    if(_svgData&&_svgData.innerHTML!==_newSvgDataHTML) _svgData.innerHTML=_newSvgDataHTML;

    const _bot=this._getBotLayer();
    if(_bot&&_bot.innerHTML!==_newBotHTML) _bot.innerHTML=_newBotHTML;

    // Inject flow SVG vào .swc-svg-wrap — wrap luôn tồn tại trong shell, không bao giờ bị xóa
    // → animation không bao giờ bị detach/reset → không nháy
    this._injectAnimLayer(FL, fpDefs, ROOM_Y+RH+16, _needAnimRebuild, VB_X, VB_W);
  }
}

customElements.define('solar-weather-card',SolarWeatherCard);
window.customCards=window.customCards||[];
window.customCards.push({
  type:'solar-weather-card',
  name:'Solar Weather Card',
  description: '☀️ Solar & battery flow card with live weather, Solcast forecast, 10 languages, animated particles/waves, day/night icons & real-time stats.',
  preview:true,
  documentationURL:'https://github.com/doanlong1412/solar-weather-card',
});
