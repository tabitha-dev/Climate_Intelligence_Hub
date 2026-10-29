#!/usr/bin/env python3
"""One-time live public source smoke test, no API keys."""
import json, urllib.request
sources={
 "City geocoding":"https://geocoding-api.open-meteo.com/v1/search?name=Charlotte&count=1&language=en&format=json",
 "ERA5 historical":"https://archive-api.open-meteo.com/v1/archive?latitude=35.22&longitude=-80.84&start_date=2024-01-01&end_date=2024-01-07&daily=temperature_2m_mean,precipitation_sum&timezone=auto&models=era5",
 "Modeled AQI":"https://air-quality-api.open-meteo.com/v1/air-quality?latitude=35.22&longitude=-80.84&current=us_aqi,pm2_5,pm10&timezone=auto",
 "ZIP location":"https://api.zippopotam.us/us/28202"
}
results={}
for name,url in sources.items():
 try:
  request=urllib.request.Request(url,headers={"User-Agent":"ClimateIntelligenceHub-SourceCheck/1.0","Accept":"application/json","Origin":"https://tabitha-dev.github.io"})
  with urllib.request.urlopen(request,timeout=25) as response:
   cors=response.headers.get("Access-Control-Allow-Origin","")
   data=json.load(response)
  if cors!="*" and "localhost" not in cors and "github.io" not in cors:
   raise RuntimeError("Missing browser CORS permission (Access-Control-Allow-Origin): "+repr(cors))
  if name=="City geocoding":ok=bool(data.get("results"))
  elif name=="ERA5 historical":ok=bool(data.get("daily",{}).get("time"))
  elif name=="Modeled AQI":ok=data.get("current",{}).get("us_aqi") is not None
  else:ok=bool(data.get("places"))
  results[name]={"ok":ok}
 except Exception as exc:results[name]={"ok":False,"error":str(exc)[:180]}
print(json.dumps(results,indent=2))
if not all(x["ok"] for x in results.values()):raise SystemExit("At least one public data source unavailable")
