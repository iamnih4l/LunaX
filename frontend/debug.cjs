const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('PAGE_ERROR:', err.message);
    console.log(err.stack);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE_ERROR:', msg.text());
    }
  });
  
  console.log('Navigating to landing...');
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking EXPLORE LUNAR DATA...');
  // Find the button with text EXPLORE LUNAR DATA
  const exploreBtn = await page.$x("//button[contains(., 'EXPLORE LUNAR DATA')]");
  if (exploreBtn.length > 0) {
    await exploreBtn[0].click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Reference Image...');
  const refImg = await page.$x("//div[contains(@class, 'explorer__card--reference')]");
  if (refImg.length > 0) {
    await refImg[0].click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking Source Image...');
  const srcImg = await page.$x("//div[contains(@class, 'explorer__card--source')]");
  if (srcImg.length > 0) {
    await srcImg[0].click();
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Clicking INITIATE CORRESPONDENCE...');
  const initiateBtn = await page.$x("//button[contains(., 'INITIATE CORRESPONDENCE')]");
  if (initiateBtn.length > 0) {
    await initiateBtn[0].click();
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Clicking PROCEED TO WORKSPACE...');
  const proceedBtn = await page.$x("//button[contains(., 'PROCEED TO WORKSPACE')]");
  if (proceedBtn.length > 0) {
    await proceedBtn[0].click();
  }

  await new Promise(r => setTimeout(r, 3000));

  console.log('Done.');
  await browser.close();
})();
