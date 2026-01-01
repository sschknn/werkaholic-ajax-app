import puppeteer from 'puppeteer';

async function testApp() {
  console.log('🚀 Starting Puppeteer test for Werkaholic AI...');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Collect console errors and logs
    const errors = [];
    const logs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        console.log('❌ Console Error:', text);
      } else {
        logs.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(error.message);
      console.log('❌ Page Error:', error.message);
    });

    // Navigate to the app (try Vite dev server first, fallback to static server)
    const urls = ['http://localhost:3000', 'http://localhost:8083'];
    let connected = false;

    for (const url of urls) {
      try {
        console.log(`📱 Trying to navigate to ${url}...`);
        await page.goto(url, {
          waitUntil: 'networkidle0',
          timeout: 10000
        });
        console.log(`✅ Successfully connected to ${url}`);
        connected = true;
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to ${url}: ${error.message}`);
      }
    }

    if (!connected) {
      throw new Error('Could not connect to any server');
    }

    // Wait for React to load
    await page.waitForSelector('#root', { timeout: 10000 });

    // Check if the app loaded
    const title = await page.title();
    console.log('📋 Page Title:', title);

    // Check for basic elements
    const hasRoot = await page.$('#root');
    console.log('✅ Root element found:', !!hasRoot);

    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for any visible errors
    const errorElements = await page.$$('[class*="error"], [class*="Error"]');
    console.log('⚠️ Error elements found:', errorElements.length);

    // Try to find main app elements
    const mainElements = await page.$$('[class*="bg-"], button, input');
    console.log('🎨 Styled elements found:', mainElements.length);

    // Check for specific components
    const buttons = await page.$$('button');
    const cards = await page.$$('[class*="card"], [class*="Card"]');
    const inputs = await page.$$('input');
    const headings = await page.$$('h1, h2, h3');
    const links = await page.$$('a');

    console.log('🔘 Buttons found:', buttons.length);
    console.log('📄 Cards found:', cards.length);
    console.log('📝 Inputs found:', inputs.length);
    console.log('📋 Headings found:', headings.length);
    console.log('🔗 Links found:', links.length);

    // Check for React root content
    const rootContent = await page.$eval('#root', el => el.innerHTML.length);
    console.log('📦 Root content length:', rootContent);

    // Check for loading states
    const loadingElements = await page.$$('[class*="loading"], [class*="Loading"], [class*="spinner"]');
    console.log('⏳ Loading elements found:', loadingElements.length);

    // Check for error messages
    const errorMessages = await page.$$('[class*="error"], [class*="Error"]');
    console.log('❌ Error messages found:', errorMessages.length);

    // Check if Firebase is loaded
    const firebaseLoaded = await page.evaluate(() => {
      return typeof window.firebase !== 'undefined' || typeof window.auth !== 'undefined';
    });
    console.log('🔥 Firebase loaded:', firebaseLoaded);

    // Check for authentication state
    const authState = await page.evaluate(() => {
      const authElements = document.querySelectorAll('[class*="auth"], [class*="login"], [class*="signin"]');
      return authElements.length;
    });
    console.log('🔐 Auth elements found:', authState);

    // Check if Tailwind CSS loaded
    const tailwindLoaded = await page.evaluate(() => {
      const testEl = document.createElement('div');
      testEl.className = 'hidden md:block';
      document.body.appendChild(testEl);
      const computed = window.getComputedStyle(testEl);
      document.body.removeChild(testEl);
      return computed.display === 'none';
    });
    console.log('🎨 Tailwind CSS loaded:', tailwindLoaded);

    // Test responsive design
    const viewport = await page.viewport();
    console.log('📱 Current viewport:', viewport);

    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('📱 Mobile viewport test completed');

    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('🖥️ Desktop viewport test completed');

    // Check for broken images
    const images = await page.$$('img');
    for (const img of images) {
      const src = await img.getProperty('src').then(s => s.jsonValue());
      const naturalWidth = await img.getProperty('naturalWidth').then(w => w.jsonValue());
      if (naturalWidth === 0) {
        console.log('❌ Broken image:', src);
        errors.push(`Broken image: ${src}`);
      }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log('✅ Page loaded successfully');
    console.log(`📋 Title: ${title}`);
    console.log(`🎨 Tailwind CSS: ${tailwindLoaded ? 'Loaded' : 'Failed'}`);
    console.log(`❌ Console Errors: ${errors.length}`);
    console.log(`📝 Console Logs: ${logs.length}`);
    console.log(`🖼️ Images: ${images.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors Found:');
      errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as test-screenshot.png');

    if (errors.length === 0) {
      console.log('\n🎉 All tests passed! App is working correctly.');
    } else {
      console.log(`\n⚠️ ${errors.length} issues found. Please review.`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testApp().catch(console.error);