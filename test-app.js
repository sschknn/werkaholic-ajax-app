import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000'); // Configured port
  await page.waitForSelector('body'); // Wait for page to load
  const title = await page.title();
  console.log('Page title:', title);
  await browser.close();
})();