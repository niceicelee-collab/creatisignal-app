const {chromium}=require('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1600,height:1040},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8771/index.html');
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 const checks={galleryImages:await page.locator('.gallery img').count(),functions:await page.locator('.doc tbody tr').filter({has:page.locator('td:first-child', {hasText:/^F\d\d$/})}).count(),documentHeadings:await page.locator('.doc h2').count(),acceptanceRows:await page.locator('.doc tbody tr').evaluateAll(rows=>rows.filter(r=>/^A\d{2}$/.test(r.cells[0]?.textContent||'')).length),horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),brokenLocalFiles:[]};
 const links=await page.locator('[href],[src]').evaluateAll(els=>els.map(e=>e.getAttribute('href')||e.getAttribute('src')).filter(Boolean));
 for(const link of links){if(link.startsWith('#'))continue;const f=link.split('?')[0].split('#')[0];if(!f||/^(https?:|data:)/.test(f))continue;if(!fs.existsSync(path.join(root,decodeURIComponent(f))))checks.brokenLocalFiles.push(f);}
 await page.screenshot({path:path.join(__dirname,'overview.png'),animations:'disabled'});
 await page.locator('.doc h2').filter({hasText:'2 功能清单'}).scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(__dirname,'document-functions.png'),animations:'disabled'});
 await page.locator('.doc h2').filter({hasText:'3 字段清单'}).scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(__dirname,'document-fields.png'),animations:'disabled'});
 await page.locator('.doc h2').filter({hasText:'12 验收清单'}).scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(__dirname,'document-acceptance.png'),animations:'disabled'});
 fs.writeFileSync(path.join(__dirname,'delivery-verification.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify(checks));
 if(checks.galleryImages!==8||checks.functions!==12||checks.acceptanceRows!==28||checks.horizontalOverflow||checks.brokenLocalFiles.length)throw Error('Delivery checks failed');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
