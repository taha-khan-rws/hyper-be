// const puppeteer = require("puppeteer");
// const {
//   Worker,
//   isMainThread,
//   workerData,
//   parentPort,
// } = require("worker_threads");
// const { Readable } = require("stream");

// // Change this to the target page

// async function scanPageForUrls(page) {
//   return await page.$$eval("a", (links) =>
//     links
//       .map((link) => link.href)
//       .filter((url) => url.startsWith("https://www.channelnewsasia.com/"))
//   );
// }

// function validateAdobeAnalyticsWithWorkers(urls) {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(__filename, { workerData: urls });
//     worker.on("message", resolve);
//     worker.on("error", reject);
//   });
// }

// if (isMainThread) {
//   (async () => {
//     const TARGET_URL = "https://www.channelnewsasia.com/international";
//     const browser = await puppeteer.launch({ timeout: 0 });
//     const page = await browser.newPage();
//     await page.goto(TARGET_URL, { timeout: 0 });

//     const urls = await scanPageForUrls(page);
//     await browser.close();

//     console.log(`Found ${urls.length} URLs. Validating Adobe Analytics...`);

//     const validationResults = await validateAdobeAnalyticsWithWorkers(urls);
//     console.log(`Adobe Analytics Validation Results:${new Date().toLocaleTimeString()}`,  validationResults);
//   })();
// } else {
//   async function validateUrlsStream(urls) {
//     urls = urls.slice(0,5)
//     console.log(urls)
//     const urlStream = Readable.from(urls);
//     const results = [];

//     const browser = await puppeteer.launch({ timeout: 0 });
//     for await(const url of urlStream) {
//       try {
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

//         page.on("request", (request) => {
//           if (request.url().includes("/b/ss/")) {
//             // Adobe Analytics request endpoint
//             results.push({ url, status: "Valid" });
//           }
//         });
//       } catch(e) {
//         results.push({ url, status: "Error",error:e });
//       }
//     }
//     parentPort.postMessage(results);
//     await browser.close();
//   }

//   validateUrlsStream(workerData);
// }

// Second solution

// const puppeteer = require("puppeteer");
// const {
//   Worker,
//   isMainThread,
//   workerData,
//   parentPort,
// } = require("worker_threads");

// if (isMainThread) {
//   (async () => {
//     const TARGET_URL = "https://www.channelnewsasia.com/international";
//     const browser = await puppeteer.launch({ timeout: 0 });
//     const page = await browser.newPage();
//     await page.goto(TARGET_URL, { timeout: 0 });

//     const urls = await page.$$eval("a", (links) =>
//       links
//         .map((link) => link.href)
//         .filter((url) => url.startsWith("https://www.channelnewsasia.com/"))
//     );
//     await browser.close();

//     console.log(`Found ${urls.length} URLs. Validating Adobe Analytics...`);

//     // Spawn multiple workers for efficiency
//     const WORKER_COUNT = 4;
//     const chunkSize = Math.ceil(urls.length / WORKER_COUNT);
//     const workers = [];

//     for (let i = 0; i < WORKER_COUNT; i++) {
//       const workerUrls = urls.slice(i * chunkSize, (i + 1) * chunkSize);
//       workers.push(
//         new Promise((resolve, reject) => {
//           console.log("inside worker promise")
//           const worker = new Worker(__filename, { workerData: workerUrls });
//           worker.on("message", resolve);
//           worker.on("error", reject);
//         })
//       );
//     }

//     const validationResults = await Promise.all(workers);
//     console.log(
//       `Adobe Analytics Validation Results: ${new Date().toLocaleTimeString()}`,
//       validationResults.flat()
//     );
//   })();
// } else {
//   async function validateUrls(urls) {
//     console.log("inside else ")
//     const browser = await puppeteer.launch({ timeout: 0 });
//     const results = [];

//     for (const url of urls) {
//       try {
//         const page = await browser.newPage();
//         await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
//         let hasAdobeAnalytics = false
//         // const hasAdobeAnalytics = await page.evaluate(() => {
//         //   return Array.from(document.querySelectorAll("script")).some(script => script.src.includes("/b/ss/"));
//         // });
//         await page.setRequestInterception(true);
//         page.on("request", (request) => {
//           if (request.url().includes("/b/ss/")) {
//             // Adobe Analytics request endpoint
//             // results.push({ url, status: "Valid" });
//             hasAdobeAnalytics = true
//           }
//         });

//         results.push({ url, status: hasAdobeAnalytics ? "Valid" : "Missing" });
//         console.log(results)
//         await page.close();
//       } catch (e) {
//         results.push({ url, status: "Error", error: e });
//         console.log(results)
//       }
//       // console.log(results)
//     }
//     parentPort.postMessage(results);
//     await browser.close();
//     // return results
//   }

//   validateUrls(workerData);
// }


//Third solution
const puppeteer = require("puppeteer");

async function validateAdobeAnalytics(urls) {
  const browser = await puppeteer.launch({ timeout: 0 });
  const results = [];

  // Open multiple pages in parallel
  await Promise.all(
    urls.map(async (url) => {
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });

        const hasAdobeAnalytics = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("script")).some(script => script.src.includes("/b/ss/"));
        });

        results.push({ url, status: hasAdobeAnalytics ? "Valid" : "Missing" });
      } catch (e) {
        results.push({ url, status: "Error", error: e.message });
      } finally {
        await page.close();
      }
    })
  );

  await browser.close();
  return results;
}

(async () => {
  const TARGET_URL = "https://www.channelnewsasia.com/international";
  const browser = await puppeteer.launch({ timeout: 0 });
  const page = await browser.newPage();
  await page.goto(TARGET_URL, { timeout: 0 });

  // Extract all valid URLs
  const urls = await page.$$eval("a", (links) =>
    links.map((link) => link.href).filter((url) => url.startsWith("https://www.channelnewsasia.com/"))
  );

  await browser.close();

  console.log(`Found ${urls.length} URLs. Validating Adobe Analytics...`);

  // Run validation without workers
  const validationResults = await validateAdobeAnalytics(urls);
  console.log(`Adobe Analytics Validation Results: ${new Date().toLocaleTimeString()}`, validationResults);
})();