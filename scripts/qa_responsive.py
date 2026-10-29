import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8000"
OUT=Path("qa-output");OUT.mkdir(exist_ok=True)
STUB_GEO={"results":[{"name":"Charlotte","admin1":"North Carolina","country":"United States","latitude":35.2271,"longitude":-80.8431}]}
STUB_ARCHIVE={"daily":{"time":[f"{y}-01-02" for y in range(2015,2026)],"temperature_2m_mean":[float(y-2000) for y in range(2015,2026)],"precipitation_sum":[100.0]*11}}
STUB_AIR={"current":{"time":"2026-10-29T14:00","us_aqi":42,"pm2_5":8.6,"pm10":12.3}}
STUB_ZIP={"places":[{"place name":"Charlotte","state":"North Carolina","latitude":"35.22","longitude":"-80.84"}]}

async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=["--no-sandbox"])
  for width,height,label in [(320,740,"narrow"),(390,844,"phone"),(768,900,"tablet"),(1024,768,"laptop"),(1440,900,"desktop")]:
   ctx=await browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce")
   page=await ctx.new_page();errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   async def respond(route):
    url=route.request.url
    if "geocoding-api.open-meteo.com" in url:payload=STUB_GEO
    elif "archive-api.open-meteo.com" in url:payload=STUB_ARCHIVE
    elif "air-quality-api.open-meteo.com" in url:payload=STUB_AIR
    elif "api.zippopotam.us" in url:payload=STUB_ZIP
    else:return await route.continue_()
    await route.fulfill(status=200,content_type="application/json",body=json.dumps(payload))
   await page.route("**/*",respond)
   await page.goto(BASE,wait_until="domcontentloaded",timeout=35000)
   await page.locator("#hero-title").wait_for()
   dimensions=await page.evaluate("""() => ({root:document.documentElement.scrollWidth,body:document.body.scrollWidth,viewport:innerWidth})""")
   assert dimensions["root"]<=width+2,(label,"horizontal overflow",dimensions)
   assert await page.locator(".feature-card").count()==3
   assert await page.locator(".resource-card").count()==3
   assert await page.locator(".faq details").count()==4
   await page.get_by_role("button",name="2100").click()
   assert await page.locator("#sea-low").inner_text()=="0.28–0.55 m"
   assert await page.locator("#sea-high").inner_text()=="0.63–1.01 m"
   await page.get_by_role("button",name="2050").click()
   await page.locator("#weather-form").get_by_role("button",name="Explore location").click()
   await page.locator("#weather-rows tr").first.get_by_role("cell").first.wait_for()
   await page.wait_for_function("document.querySelector('#weather-rows').children.length===10")
   assert await page.locator("#weather-location").inner_text()=="Charlotte, North Carolina, United States"
   await page.get_by_role("button",name="°F").click()
   assert await page.locator("#temp-heading").inner_text()=="Mean temperature (°F)"
   assert await page.locator("#weather-rows tr").count()==10
   await page.locator("#air-location").fill("28202")
   await page.locator("#air-form").get_by_role("button",name="Check air quality").click()
   await page.wait_for_function("document.querySelector('#air-aqi').textContent==='42'")
   assert "Charlotte" in await page.locator("#air-place").inner_text()
   assert await page.locator("#air-category").inner_text()=="Good"
   assert not errors,(label,errors)
   if label in ("desktop","phone","narrow"):
    await page.screenshot(path=str(OUT/(label+"-homepage.png")),full_page=False)
   results.append({"viewport":label,"width":width,"layout":"pass","historical":"pass","sea":"pass","aqi":"pass","errors":errors})
   await ctx.close()
  await browser.close()
 (OUT/"responsive-results.json").write_text(json.dumps(results,indent=2))
 print(json.dumps(results,indent=2))
if __name__=="__main__":asyncio.run(main())
