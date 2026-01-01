import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Headless false to see browser
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Test HTTPS first to see if it causes SSL error
  try {
    console.log('Testing HTTPS navigation to https://localhost:3000...');
    await page.goto('https://localhost:3000', { waitUntil: 'networkidle2', timeout: 5000 });
    console.log('HTTPS navigation successful');
  } catch (httpsError) {
    console.log('HTTPS navigation failed:', httpsError.message);
  }

  try {
    console.log('Navigating to app via HTTP...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    const title = await page.title();
    console.log('Page title:', title);

    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Screenshot saved as debug-screenshot.png');

    // Log some HTML content
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 1000));
    console.log('Body HTML (first 1000 chars):', bodyHTML);

    // Wait for app to load
    try {
      await page.waitForSelector('aside', { timeout: 10000 });
      console.log('Aside element found');
    } catch (e) {
      console.log('Aside not found, checking for other elements...');
      const allElements = await page.$$('*');
      console.log(`Total elements found: ${allElements.length}`);

      // Check for common elements
      const divs = await page.$$('div');
      console.log(`Div elements: ${divs.length}`);

      const buttons = await page.$$('button');
      console.log(`Button elements: ${buttons.length}`);

      // Log some button texts
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].evaluate(btn => btn.textContent);
        console.log(`Button ${i}: "${text}"`);
      }
    }

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for app to load

    if (errors.length > 0) {
      console.log('Console errors found:');
      errors.forEach(error => console.log('  -', error));
    } else {
      console.log('✓ No console errors');
    }

    // Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    if (jsErrors.length > 0) {
      console.log('JavaScript errors found:');
      jsErrors.forEach(error => console.log('  -', error));
    } else {
      console.log('✓ No JavaScript errors');
    }

    console.log('Debugging complete');

  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
})();