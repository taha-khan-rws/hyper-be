const puppeteer = require("puppeteer");

const validateAdobeBeacons = async (urls) => {
  const browser = await puppeteer.launch({ headless: true });
  // let counter = {};
  let totalPageScanned = 0;
  let adobeAnalyticsTagPresent = 0;
  let adobeAnalyticsTagAbsent = 0;
  let adobeDataLayerPresent = 0;
  let adobeDataLayerAbsent = 0;
  let adobeAnalyticsRequestSent = 0;
  let adobeAnalyticsRequestNotSent = 0;
  let adobeAnalyticsResponseReceived = 0;
  let adobeAnalyticsResponseNotReceived = 0;
  let adobeAnalyticsResponseCode200 = 0;
  let adobeAnalyticsResponseCodeNot200 = 0;

  const page = await browser.newPage();
  try {
    for (const i in urls) {
      //   console.log(`Navigating to: ${urls[i]}`);
      await page.goto(urls[i], { waitUntil: "load", timeout: 0 }); // waitUntil : 'networkidle2'
      totalPageScanned++;

      // Check for Adobe Analytics tag presence in scripts
      //   console.log(`Validating Adobe Analytics tag presence on: ${urls[i]}`);
      const hasAdobeAnalyticsTag = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll("script"));
        return scripts.some(
          (script) =>
            script.innerHTML.includes("s.t") ||
            script.innerHTML.includes("s.tl")
        );
      });
      if (hasAdobeAnalyticsTag) {
        adobeAnalyticsTagPresent++;
        // console.log('✔ Adobe Analytics tag found');
      } else {
        adobeAnalyticsTagAbsent++;
        // console.log('✘ Adobe Analytics tag NOT found');
      }

      // Monitor network requests for Adobe Analytics requests
      //   console.log(`Monitoring network requests on: ${urls[i]}`);
      let analyticsRequestSent = false;
      let analyticsResponseReceived = false;

      page.on("request", (request) => {
        if (request.url().includes("/b/ss/")) {
          // Adobe Analytics request endpoint
          analyticsRequestSent = true;
          adobeAnalyticsRequestSent++;
          // console.log('✔ Adobe Analytics request sent');
        }
        // else {
        //   adobeAnalyticsRequestNotSent++;
        // }
      });

      page.on("response", async (response) => {
        if (response.url().includes("/b/ss/")) {
          analyticsResponseReceived = true;
          adobeAnalyticsResponseReceived++;
          if (response.status == 200) adobeAnalyticsResponseCode200++;
          //   else adobeAnalyticsResponseCodeNot200++;
          // console.log('✔ Adobe Analytics response received');
        }
        // else {
        //   adobeAnalyticsResponseNotReceived++;
        // }
      });

      // Validate Adobe Data Layer presence
      // console.log(`Validating Adobe Data Layer on: ${url}`);
      const hasValidAdobeDataLayer = await page.evaluate(() => {
        return !!window.dataLayer && window.dataLayer.length > 0; // Checks if adobeDataLayer object exists
      });
      if (hasValidAdobeDataLayer) {
        adobeDataLayerPresent++;
        // console.log('✔ Valid Adobe Data Layer present');
      } else {
        adobeDataLayerAbsent++;
        // console.log('✘ Adobe Data Layer NOT found or invalid');
      }

      // Close the page
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
  // finally {
  await page.close();
  await browser.close();
  // }
  return {
    totalPageScanned,
    adobeAnalyticsTagPresent,
    adobeAnalyticsTagAbsent,
    adobeDataLayerPresent,
    adobeDataLayerPresent,
    adobeAnalyticsRequestSent,
    adobeAnalyticsRequestNotSent,
    adobeAnalyticsResponseReceived,
    adobeAnalyticsResponseNotReceived,
    adobeAnalyticsResponseCode200,
    adobeAnalyticsResponseCodeNot200,
  };
};
module.exports = validateAdobeBeacons;
