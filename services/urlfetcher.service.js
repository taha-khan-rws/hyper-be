const puppeteer = require("puppeteer");

const fetchUrls = async (homepageURL) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(homepageURL, {
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

  await browser.close();
  return links;
};
module.exports = fetchUrls;

// Function to continuously check for new URLs
// async function watchQueue() {
//   while (true) {
//     if (urlQueue.length > 0) {
//       const url = urlQueue.shift();
//       if (!processing.has(url)) {
//         processing.add(url);
//         validateAdobeBeacon(url);
//       }
//     }
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every second
//   }
// }

// Start watching for new URLs
// watchQueue();
