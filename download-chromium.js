// download-chromium.js
const puppeteer = require('puppeteer');

(async () => {
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('1108766');
    console.log('✅ Chromium downloaded to:', revisionInfo.folderPath);
  } catch (error) {
    console.error('❌ Failed to download Chromium:', error);
  }
})();
