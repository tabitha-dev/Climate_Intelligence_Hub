# Climate Intelligence Hub

A modern, accessible, source-first climate education dashboard. Built with **HTML, CSS, vanilla JavaScript and Chart.js**, hosted on GitHub Pages with no frontend build step, account requirement or paid API key.

**Live site:** https://tabitha-dev.github.io/Climate_Intelligence_Hub/  
**Source:** https://github.com/tabitha-dev/Climate_Intelligence_Hub
**Author and related work:** [Tabitha Khadse's engineering portfolio](https://code.tabitha.dev/) includes the Climate Intelligence Hub alongside other accessibility-focused data visualizations.

## What you can explore

- **Historical weather explorer:** Search a city and view annual mean near-surface temperatures and annual precipitation totals, aggregated from Open-Meteo's ERA5 historical daily weather reanalysis for 2015–2024 or 2021–2025. These are *modeled historical estimates*, not raw station measurements or global climate trends.
- **Sea-level scenarios:** Compare **published IPCC AR6 likely global mean sea-level rise ranges**, relative to 1995–2014. The two supported years are 2050 and 2100, with very low emissions (SSP1-1.9) and very high emissions (SSP5-8.5). **These are not local flood maps.**
- **U.S. AQI-scale modeled forecast:** Enter a U.S. city or 5-digit ZIP code to view modeled AQI, PM2.5 and PM10. Model estimates may differ from nearby AirNow monitoring stations.
- **Source library:** Direct links to NASA, NOAA climate.gov and IPCC in place of discontinued/failed free live-news feeds.
- **Accessible charts and tables:** Chart.js is optional for display; historical numerical data is also provided in an accessible table. °C/°F switch updates both.

## Why the free API implementation changed

The former RapidAPI climate and news endpoints no longer worked reliably. The project had also embedded RapidAPI and AirNow API credentials in browser code. The new version **does not contain those keys or call those endpoints**. As the previous code remains in public Git history, **the former API keys should be revoked** with their issuers even if their free subscriptions stopped working.

### Free data sources

- Historical weather: [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api), ERA5 reanalysis — CC BY 4.0 attribution applies.
- Air quality: [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api), modeled forecasts on the U.S. AQI scale. For official monitoring and health information use [AirNow.gov](https://www.airnow.gov/).
- Sea level: [IPCC AR6 Synthesis Report Summary for Policymakers](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/), likely range relative to 1995–2014.
- ZIP centroid lookup: [Zippopotam.us](https://docs.zippopotam.us/docs/getting-started/), based on GeoNames.
- City search: [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api).

Open-Meteo's keyless free tier is intended for non-commercial use with fair-use limits; higher-volume or commercial deployments may require a paid plan. Data and API access can be temporarily unavailable. This site does not silently replace unavailable values with fabricated numbers.

## Privacy and behavior

Location is **entered by the visitor**; no geolocation permission is requested. The entered city or ZIP and resulting coordinates are sent to the relevant public API providers to retrieve data. The app does not currently save household data or synchronize between devices. Third-party font and chart-script CDNs may receive standard network requests.

This is an educational tool, not a professional local climate-risk model, medical recommendation, or personalized flooding prediction.

## SEO / AEO / accessibility

The site contains meaningful static content and FAQs, page metadata, canonical URL, sitemap, robots.txt, Open Graph social image, WebApplication structured data and source attribution. The layout responds to desktop and mobile widths, respects reduced motion, uses keyboard focus styles and has explicitly labeled forms. Historical charts have a data-table alternative. A full manual screen-reader / WCAG 2.2 AA audit is still required before certifying compliance. Search metadata does not guarantee indexing or visibility in AI answers.

## Run locally

```bash
git clone https://github.com/tabitha-dev/Climate_Intelligence_Hub.git
cd Climate_Intelligence_Hub
python -m http.server 8000
```

Open http://localhost:8000. No Node build or API key is needed to browse; the charts need the Chart.js CDN, and external API data requires internet access.

### Browser QA

```bash
python -m pip install playwright==1.57.0
python -m playwright install chromium
npm install --no-save axe-core@4.10.3
python scripts/qa_responsive.py
python scripts/qa_accessibility.py
```

Run these in a separate terminal while the HTTP server is running. Tests use intercepted sample API payloads to validate the UI deterministically; they **do not** certify the current uptime of external data sources.

## License

Review the repository's license status before reuse.
