const puppeteer = require("puppeteer");

const validateAdobeBeacons2 = async (urls) => {
    urls = urls[0,20]
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();
  try {
    for (const i in urls) {
      //   console.log(`Navigating to: ${urls[i]}`);
      await page.goto(urls[i], { waitUntil: "load", timeout: 0 }); // waitUntil : 'networkidle2'

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
        // console.log('✔ Adobe Analytics tag found');
      } else {
        // console.log('✘ Adobe Analytics tag NOT found');
      }

      // Monitor network requests for Adobe Analytics requests
      //   console.log(`Monitoring network requests on: ${urls[i]}`);

      page.on("request", (request) => {
        if (request.url().includes("/b/ss/")) {
          // Adobe Analytics request endpoint

          // console.log('✔ Adobe Analytics request sent');
        }
        // else {
        //
        // }
      });

      page.on("response", async (response) => {
        if (response.url().includes("/b/ss/")) {
          if (response.status == 200) {
          }
        }
      });

      // Validate Adobe Data Layer presence
      // console.log(`Validating Adobe Data Layer on: ${url}`);
      const hasValidAdobeDataLayer = await page.evaluate(() => {
        return !!window.dataLayer && window.dataLayer.length > 0; // Checks if adobeDataLayer object exists
      });
      if (hasValidAdobeDataLayer) {
        // console.log('✔ Valid Adobe Data Layer present');
      } else {
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
  return {};
};
module.exports = validateAdobeBeacons2;
