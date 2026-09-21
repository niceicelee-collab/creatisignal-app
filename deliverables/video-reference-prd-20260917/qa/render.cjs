const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const runtime = 'C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const { chromium } = require(path.join(runtime, 'playwright'));
const sharp = require(path.join(runtime, 'sharp'));
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--disable-background-networking'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const results = [];
  for (let n = 1; n <= 16; n++) {
    const id = `P${String(n).padStart(2, '0')}`;
    await page.goto(pathToFileURL(path.join(root, 'prototype', `${id}.html`)).href);
    await page.evaluate(() => document.fonts.ready);
    const checks = await page.evaluate(() => {
      const frame = document.querySelector('.frame').getBoundingClientRect();
      const workspace = document.querySelector('.workspace').getBoundingClientRect();
      const summary = document.querySelector('.summary').getBoundingClientRect();
      const panel = document.querySelector('.panel')?.getBoundingClientRect();
      const overflow = [...document.querySelectorAll('.notice,.file-details,.asset-info,.dialog,.panel,.note,.titlebox h2')].filter(el => el.scrollWidth > el.clientWidth + 2).map(el => ({ cls: el.className, text: el.textContent.slice(0, 60) }));
      return { frameWidth: frame.width, frameHeight: frame.height, workspaceBottom: workspace.bottom, summaryTop: summary.top, panelBottom: panel?.bottom, overflow, enabled: !document.querySelector('.gen').disabled, bodyText: document.body.innerText };
    });
    await page.screenshot({ path: path.join(root, 'prototype', 'png', `${id}.png`) });
    results.push({ id, ...checks });
  }
  await page.setViewportSize({ width: 1600, height: 1050 });
  await page.goto(pathToFileURL(path.join(root, 'prototype', 'index.html')).href);
  await page.locator('[data-id="P09"]').click();
  await page.waitForURL(/scene=P09/);
  const gallery = { active: await page.locator('.nav a.active').getAttribute('data-id'), iframe: await page.locator('iframe').getAttribute('src'), png: await page.locator('#png').getAttribute('href') };
  await page.screenshot({ path: path.join(root, 'qa', 'gallery.png') });
  await browser.close();
  fs.writeFileSync(path.join(root, 'qa', 'render-checks.json'), JSON.stringify({ results, gallery }, null, 2));
  const tiles = [];
  for (let n = 1; n <= 16; n++) {
    const id = `P${String(n).padStart(2, '0')}`;
    tiles.push({ input: await sharp(path.join(root, 'prototype', 'png', `${id}.png`)).resize(480, 333).toBuffer(), left: ((n - 1) % 4) * 492 + 12, top: Math.floor((n - 1) / 4) * 345 + 12 });
  }
  await sharp({ create: { width: 1980, height: 1392, channels: 3, background: '#e4eae5' } }).composite(tiles).jpeg({ quality: 92 }).toFile(path.join(root, 'prototype', 'overview.jpg'));
  console.log(JSON.stringify({ count: results.length, gallery, issues: results.filter(x => x.overflow.length || x.workspaceBottom > x.summaryTop || (x.panelBottom && x.panelBottom > x.summaryTop)) }, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
