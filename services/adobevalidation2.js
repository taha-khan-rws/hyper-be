const puppeteer = require("puppeteer");

const validateAdobeBeacons2 = async () => {
  const browser = await puppeteer.launch({ timeout: 0 });
  let urls = [];
  const page = await browser.newPage();

  await page.goto("https://www.channelnewsasia.com/", {
    waitUntil: "load",
    timeout: 0,
  });

  const links = await page.evaluate(() => {
    const anchorTags = document.querySelectorAll("a");
    const filteredURL = new Set();

    anchorTags.forEach((anchor) => {
      const href = anchor.href;
      if (href.startsWith("https://www.channelnewsasia.com/")) {
        filteredURL.add(href);
      }
    });

    return Array.from(filteredURL);
  });
  // urls = urls.slice(0, 21);
  urls = links.slice(0, 21);
  console.log("List of urls ", urls);
  // Setting up the event listener for request event
  page.on("request", (request) => {
    // console.log(typeof request);
    if (request.url().includes("/b/ss/")) {
      // Adobe Analytics request endpoint
      console.log(
        "requested url id ::",
        request.url().split("/")[8].split("?")[0]
      );
      // request.continue();
      console.log(
        "✔ Adobe Analytics request sent",
        request.url().split("/")[8].split("?")[0]
      );
    } else {
      // request.abort();
    }
  });

  for (let url of urls) {
    try {
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { waitUntil: "load", timeout: 0 }); // waitUntil : 'networkidle2'
      // await page.setRequestInterception(true);

      // Check for Adobe Analytics tag presence in scripts
      //   console.log(`Validating Adobe Analytics tag presence on: ${url}`);
      // const hasAdobeAnalyticsTag = await page.evaluate(() => {
      //   const scripts = Array.from(document.querySelectorAll("script"));
      //   return scripts.some(
      //     (script) =>
      //       script.innerHTML.includes("s.t") ||
      //       script.innerHTML.includes("s.tl")
      //   );
      // });
      // if (hasAdobeAnalyticsTag) {
      //   // console.log('✔ Adobe Analytics tag found');
      // } else {
      //   // console.log('✘ Adobe Analytics tag NOT found');
      // }

      // Monitor network requests for Adobe Analytics requests
      //   console.log(`Monitoring network requests on: ${url}`);

      //  Here comes the code of request listener

      // # commenting response , will look later about significance of validating reposnse
      // page.on("response", async (response) => {
      //   if (response.url().includes("/b/ss/")) {
      //     if (response.status == 200) {
      //       console.log("adobe analytics request response received");
      //     }
      //   }
      // });

      // Validate Adobe Data Layer presence
      // console.log(`Validating Adobe Data Layer on: ${url}`);
      const hasValidAdobeDataLayer = await page.evaluate(() => {
        return !!window.dataLayer && window.dataLayer.length > 0; // Checks if adobeDataLayer object exists
      });
      if (hasValidAdobeDataLayer) {
        console.log("✔ Valid Adobe Data Layer present");
      } else {
        console.log("✘ Adobe Data Layer NOT found or invalid");
      }

      // Close the page
    } catch (error) {
      console.log(`An error occurred: ${error}`);
    }
  }
  // finally {
  await page.close();
  await browser.close();
  // }
  // return {};
};
// module.exports = validateAdobeBeacons2;
validateAdobeBeacons2();

// urls.forEach(async (url) => {
//   {
//     console.log(`Navigating to: ${url}`);
//     await page.goto(url, { waitUntil: "load", timeout: 0 }); // waitUntil : 'networkidle2'

//     // Check for Adobe Analytics tag presence in scripts
//     //   console.log(`Validating Adobe Analytics tag presence on: ${url}`);
//     const hasAdobeAnalyticsTag = await page.evaluate(() => {
//       const scripts = Array.from(document.querySelectorAll("script"));
//       return scripts.some(
//         (script) =>
//           script.innerHTML.includes("s.t") ||
//           script.innerHTML.includes("s.tl")
//       );
//     });
//     if (hasAdobeAnalyticsTag) {
//       // console.log('✔ Adobe Analytics tag found');
//     } else {
//       // console.log('✘ Adobe Analytics tag NOT found');
//     }

//     // Monitor network requests for Adobe Analytics requests
//     //   console.log(`Monitoring network requests on: ${url}`);

//     page.on("request", (request) => {
//       console.log("requested urls ::", request.url());
//       if (request.url().includes("/b/ss/")) {
//         // Adobe Analytics request endpoint
//         console.log("✔ Adobe Analytics request sent");
//       }
//       // else {
//       //
//       // }
//     });

//     page.on("response", async (response) => {
//       if (response.url().includes("/b/ss/")) {
//         if (response.status == 200) {
//           console.log("adobe analytics request response received");
//         }
//       }
//     });

//     // Validate Adobe Data Layer presence
//     // console.log(`Validating Adobe Data Layer on: ${url}`);
//     const hasValidAdobeDataLayer = await page.evaluate(() => {
//       return !!window.dataLayer && window.dataLayer.length > 0; // Checks if adobeDataLayer object exists
//     });
//     if (hasValidAdobeDataLayer) {
//       // console.log('✔ Valid Adobe Data Layer present');
//     } else {
//       // console.log('✘ Adobe Data Layer NOT found or invalid');
//     }

//     // Close the page
//   }
// });
