#!/usr/bin/env node
// Usage: node scripts/screenshot.js [url] [filename] [viewport]
// Examples:
//   node scripts/screenshot.js http://localhost:3000
//   node scripts/screenshot.js http://localhost:3000 hero.png mobile
//   node scripts/screenshot.js http://localhost:3000 full.png desktop full

const { chromium } = require('playwright');
const path = require('path');

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

async function screenshot(url, filename, viewportName = 'desktop', fullPage = false) {
  const browser = await chromium.launch();
  const viewport = VIEWPORTS[viewportName] || VIEWPORTS.desktop;
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });

  await page.goto(url, { waitUntil: 'networkidle' });

  const outPath = path.resolve(__dirname, '..', 'screenshots', filename);
  await page.screenshot({ path: outPath, fullPage });

  await browser.close();
  console.log(`Screenshot saved: ${outPath}`);
}

const [,, url = 'http://localhost:3000', filename = 'screenshot.png', viewportName = 'desktop', mode] = process.argv;
const fullPage = mode === 'full';

screenshot(url, filename, viewportName, fullPage).catch(err => {
  console.error(err.message);
  process.exit(1);
});
