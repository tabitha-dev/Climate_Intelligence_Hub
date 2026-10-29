import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 results=[];fatal=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=["--no-sandbox"])
  for width,height in [(390,844),(1440,900)]:
   ctx=await browser.new_context(viewport={"width":width,"height":height})
   page=await ctx.new_page()
   await page.goto("http://127.0.0.1:8000",wait_until="domcontentloaded")
   await page.locator("#hero-title").wait_for()
   await page.add_script_tag(path="node_modules/axe-core/axe.min.js")
   for section in ["home","explorer","sea-level","air-quality","resources","about"]:
    await page.locator("#"+section).scroll_into_view_if_needed()
    violations=await page.evaluate("""async () => (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(x=>({id:x.id,impact:x.impact,targets:x.nodes.slice(0,5).map(n=>n.target)}))""")
    results.append({"width":width,"section":section,"violations":violations})
    fatal.extend([{"width":width,"section":section,**x} for x in violations if x["impact"] in ("serious","critical")])
   await ctx.close()
  await browser.close()
 Path("qa-output/axe-results.json").write_text(json.dumps(results,indent=2))
 print(json.dumps({"fatal":fatal,"summary":results},indent=2))
 if fatal:raise SystemExit("Axe serious or critical accessibility issue")
if __name__=="__main__":asyncio.run(main())
