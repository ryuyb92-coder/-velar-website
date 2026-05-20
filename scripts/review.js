#!/usr/bin/env node
// Captures desktop, tablet, and mobile screenshots of a URL for visual review.
// Usage: node scripts/review.js [url]

const { chromium } = require('playwright');
const path = require('path');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

async function review(url) {
  const browser = await chromium.launch();
  const saved = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(url, { waitUntil: 'networkidle' });

    const filename = `review-${vp.name}.png`;
    const outPath = path.resolve(__dirname, '..', 'screenshots', filename);
    await page.screenshot({ path: outPath, fullPage: true });
    await page.close();

    saved.push(outPath);
    console.log(`[${vp.name}] ${outPath}`);
  }

  await browser.close();
  console.log('\nReview complete. Read screenshots with Claude to inspect visually.');
}

const [,, url = 'http://localhost:3000'] = process.argv;
review(url).catch(err => {
  console.error(err.message);
  process.exit(1);
});
