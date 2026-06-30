const { chromium } = require('playwright-core');
(async () => {
  try{
    const browser = await chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', headless: true });
    const page = await browser.newPage();
    page.on('console', m => console.log('CON', m.type(), m.text()));
    page.on('pageerror', e => console.log('PAGEERR', e.message));
    await page.goto('file:///C:\\Users\\중진공39\\utilities_work\\utilities\\100days.html', { waitUntil:'domcontentloaded' });
    await page.waitForTimeout(500);
    const title = await page.title();
    console.log('TITLE:', title);
    await browser.close();
  }catch(e){
    console.log('ERR', e.message);
  }
})();
