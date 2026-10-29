'use strict';
/* Climate Intelligence Hub: source-first, keyless data explorer.
   Never label reanalysis as raw observations or modeled AQI as station measurement. */
(() => {
  const el = id => document.getElementById(id);
  const years = {
    2050: {low:[.15,.23], high:[.20,.29]},
    2100: {low:[.28,.55], high:[.63,1.01]}
  };
  const state = { weather:null, chart:null, fahrenheit:false, weatherRequest:0, airRequest:0 };
  const format = (n,d=1) => Number.isFinite(Number(n)) ? Number(n).toFixed(d) : '—';
  const status = (node,message,error=false) => {
    node.textContent=message;
    node.dataset.state=error?'error':'info';
  };
  const fetchJSON = async (url, timeoutMs=24000) => {
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try {
      const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Source returned HTTP '+response.status);
      return await response.json();
    } finally{clearTimeout(timer);}
  };
  const geocodeCity=async (query,usOnly=false) => {
    const url=new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name',query);
    url.searchParams.set('count','5');url.searchParams.set('language','en');url.searchParams.set('format','json');
    if(usOnly)url.searchParams.set('countryCode','US');
    const data=await fetchJSON(url.toString(),15000);
    if(!Array.isArray(data.results)||!data.results.length)throw new Error('No matching city found. Try including a state or country name.');
    const item=data.results[0];
    if(!Number.isFinite(item.latitude)||!Number.isFinite(item.longitude))throw new Error('Could not locate that city.');
    return {lat:item.latitude,lon:item.longitude,name:[item.name,item.admin1,item.country].filter(Boolean).join(', ')};
  };
  const geocodeUS=async query=>{
    const input=query.trim();
    if(/^\d{5}$/.test(input)){
      const data=await fetchJSON('https://api.zippopotam.us/us/'+encodeURIComponent(input),15000);
      const place=data.places?.[0];
      if(!place)throw new Error('ZIP not found. Try a city name instead.');
      const lat=Number(place.latitude),lon=Number(place.longitude);
      if(!Number.isFinite(lat)||!Number.isFinite(lon))throw new Error('ZIP location is unavailable.');
      return {lat,lon,name:[place['place name'],place.state,input].filter(Boolean).join(', ')};
    }
    return geocodeCity(input,true);
  };
  const temperature=n=>state.fahrenheit?Number(n)*9/5+32:Number(n);
  const resetChart=()=>{if(state.chart){state.chart.destroy();state.chart=null;}};
  function updateDataTable(){
    const table=el('weather-rows');table.replaceChildren();
    if(!state.weather)return;
    const header=el('temp-heading');header.textContent='Mean temperature (°'+(state.fahrenheit?'F':'C')+')';
    state.weather.rows.forEach(row=>{
      const tr=document.createElement('tr');
      const entries=[String(row.year),Number.isFinite(row.temp)?format(temperature(row.temp),1):'Unavailable',Number.isFinite(row.rain)?format(row.rain,0):'Unavailable'];
      entries.forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.appendChild(td);});
      table.appendChild(tr);
    });
  }
  function drawChart(){
    resetChart();
    if(!state.weather)return;
    const data=state.weather.rows;
    const canvas=el('weather-chart'),fallback=el('chart-fallback');
    fallback.hidden=true;
    if(typeof Chart==='undefined'){
      canvas.hidden=true;fallback.hidden=false;return;
    }
    canvas.hidden=false;
    try{
      state.chart=new Chart(canvas.getContext('2d'),{
        data:{labels:data.map(r=>String(r.year)),datasets:[
          {type:'line',label:'Mean temperature (°'+(state.fahrenheit?'F':'C')+')',data:data.map(r=>Number.isFinite(r.temp)?temperature(r.temp):null),yAxisID:'temperature',borderColor:'#8ee7cf',backgroundColor:'#8ee7cf',tension:.25,pointRadius:4,borderWidth:3},
          {type:'bar',label:'Total precipitation (mm)',data:data.map(r=>Number.isFinite(r.rain)?r.rain:null),yAxisID:'precipitation',backgroundColor:'#86b6df99',borderColor:'#9dd7ff',borderWidth:1,borderRadius:4}
        ]},
        options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{position:'top',labels:{color:'#def3f5',font:{size:12},boxWidth:13}},tooltip:{enabled:true}},
          scales:{x:{ticks:{color:'#c4d7db'},grid:{color:'#2d4a5550'}},temperature:{type:'linear',position:'left',title:{display:true,text:'Temperature (°'+(state.fahrenheit?'F':'C')+')',color:'#b4d4d0'},ticks:{color:'#d1e4e1'},grid:{color:'#2d4a5577'}},
            precipitation:{type:'linear',position:'right',beginAtZero:true,title:{display:true,text:'Precipitation (mm)',color:'#d1e2f1'},ticks:{color:'#c1d5df'},grid:{drawOnChartArea:false}}}}
      });
    }catch(error){resetChart();canvas.hidden=true;fallback.hidden=false;}
  }
  const aggregate=(daily,start,end)=>{
    if(!daily||!Array.isArray(daily.time))throw new Error('Historical data format is unavailable.');
    const acc=new Map();
    daily.time.forEach((date,i)=>{
      const y=Number(String(date).slice(0,4));
      if(y<start||y>end)return;
      if(!acc.has(y))acc.set(y,{year:y,tempTotal:0,tempDays:0,rain:0,rainDays:0});
      const row=acc.get(y),t=Number(daily.temperature_2m_mean?.[i]),p=Number(daily.precipitation_sum?.[i]);
      if(daily.temperature_2m_mean?.[i]!=null&&Number.isFinite(t)){row.tempTotal+=t;row.tempDays++;}
      if(daily.precipitation_sum?.[i]!=null&&Number.isFinite(p)){row.rain+=p;row.rainDays++;}
    });
    return Array.from({length:end-start+1},(_,i)=>{
      const a=acc.get(start+i);return {year:start+i,temp:a?.tempDays?a.tempTotal/a.tempDays:null,rain:a?.rainDays?a.rain:null};
    });
  };
  async function loadWeather(event){
    event.preventDefault();
    const request=++state.weatherRequest;
    const input=el('weather-city').value.trim(),period=el('weather-period').value;
    const [start,end]=period.split('-').map(Number);
    if(input.length<2||![2015,2021].includes(start)||![2024,2025].includes(end))return;
    const button=el('weather-form').querySelector('button[type=submit]');
    button.disabled=true;
    status(el('weather-status'),'Finding the location and loading historical ERA5 data…');
    try{
      const city=await geocodeCity(input);
      const url=new URL('https://archive-api.open-meteo.com/v1/archive');
      const p={latitude:city.lat,longitude:city.lon,start_date:start+'-01-01',end_date:end+'-12-31',daily:'temperature_2m_mean,precipitation_sum',timezone:'auto',models:'era5'};
      Object.entries(p).forEach(([key,val])=>url.searchParams.set(key,String(val)));
      const data=await fetchJSON(url.toString(),45000);
      if(request!==state.weatherRequest)return;
      const rows=aggregate(data.daily,start,end);
      if(!rows.some(r=>Number.isFinite(r.temp)))throw new Error('This location has no usable historical data for the selected period.');
      state.weather={rows,city,period};
      el('weather-location').textContent=city.name;
      el('weather-subtitle').textContent=period+' • ERA5 reanalysis • yearly summaries';
      el('weather-table-caption').textContent=city.name+' historical modeled weather, '+period;
      updateDataTable();drawChart();
      status(el('weather-status'),'Loaded '+rows.filter(r=>Number.isFinite(r.temp)).length+' annual temperature summaries. Model-derived historical data; not direct station observations.');
    }catch(error){
      if(request!==state.weatherRequest)return;
      state.weather=null;resetChart();
      el('weather-chart').hidden=true;el('chart-fallback').hidden=false;
      el('chart-fallback').textContent='Data unavailable right now. Try again or choose another city.';
      el('weather-rows').replaceChildren();
      const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='Unable to load historical data.';tr.appendChild(td);el('weather-rows').appendChild(tr);
      status(el('weather-status'),'Unable to load historical data: '+(error.name==='AbortError'?'Request timed out.':error.message),true);
    }finally{if(request===state.weatherRequest)button.disabled=false;}
  }
  function switchUnits(fahrenheit){
    state.fahrenheit=fahrenheit;
    el('unit-c').setAttribute('aria-pressed',String(!fahrenheit));el('unit-f').setAttribute('aria-pressed',String(fahrenheit));
    updateDataTable();drawChart();
  }
  function setSeaYear(year){
    const d=years[year];if(!d)return;
    el('sea-low').textContent=d.low.map(n=>format(n,2)).join('–')+' m';
    el('sea-high').textContent=d.high.map(n=>format(n,2)).join('–')+' m';
    el('sea-low-bar').style.width=(d.low[1]/1.01*100).toFixed(1)+'%';
    el('sea-high-bar').style.width=(d.high[1]/1.01*100).toFixed(1)+'%';
    document.querySelectorAll('[data-year]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.year)===year)));
  }
  function categoryAQI(value){
    if(value<=50)return {name:'Good',color:'#51bc9f'};
    if(value<=100)return {name:'Moderate',color:'#e8c76a'};
    if(value<=150)return {name:'Unhealthy for sensitive groups',color:'#f6a369'};
    if(value<=200)return {name:'Unhealthy',color:'#e46b71'};
    if(value<=300)return {name:'Very unhealthy',color:'#a987d7'};
    return {name:'Hazardous',color:'#a76a77'};
  }
  async function loadAirQuality(event){
    event.preventDefault();
    const query=el('air-location').value.trim();
    if(!query)return;
    const request=++state.airRequest,button=el('air-form').querySelector('button[type=submit]');
    button.disabled=true;el('air-result').hidden=true;
    status(el('air-status'),'Finding location and loading the modeled air-quality forecast…');
    try{
      const place=await geocodeUS(query);
      const url=new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
      Object.entries({latitude:place.lat,longitude:place.lon,current:'us_aqi,pm2_5,pm10',timezone:'auto'}).forEach(([k,v])=>url.searchParams.set(k,String(v)));
      const data=await fetchJSON(url.toString(),25000);
      if(request!==state.airRequest)return;
      const aqi=Number(data.current?.us_aqi);
      if(data.current?.us_aqi==null||!Number.isFinite(aqi))throw new Error('No current modeled U.S. AQI value returned for this place.');
      const category=categoryAQI(aqi),result=el('air-result');
      el('air-aqi').textContent=String(Math.round(aqi));
      el('air-category').textContent=category.name;
      result.querySelector('.air-gauge').style.borderColor=category.color;
      el('air-place').textContent=place.name;
      el('air-time').textContent='Model timestamp: '+String(data.current.time||'not supplied')+' (location time)';
      el('air-pm25').textContent=data.current.pm2_5==null?'Unavailable':format(data.current.pm2_5,1)+' µg/m³';
      el('air-pm10').textContent=data.current.pm10==null?'Unavailable':format(data.current.pm10,1)+' µg/m³';
      result.hidden=false;
      status(el('air-status'),'Model estimate loaded. Not an official monitoring-station reading.');
    }catch(error){
      if(request!==state.airRequest)return;
      status(el('air-status'),'Air quality could not be loaded: '+(error.name==='AbortError'?'Request timed out.':error.message)+' You can check AirNow.gov for official U.S. data.',true);
    }finally{if(request===state.airRequest)button.disabled=false;}
  }
  function init(){
    el('year').textContent=new Date().getFullYear();
    el('weather-form').addEventListener('submit',loadWeather);
    el('unit-c').addEventListener('click',()=>switchUnits(false));
    el('unit-f').addEventListener('click',()=>switchUnits(true));
    document.querySelectorAll('[data-year]').forEach(button=>button.addEventListener('click',()=>setSeaYear(Number(button.dataset.year))));
    el('air-form').addEventListener('submit',loadAirQuality);
    setSeaYear(2050);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();