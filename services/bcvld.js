const puppeteer = require("puppeteer");

async function validateAdobeBeacon(urlList) {
  let resultData 
  try {
    const browser = await puppeteer.launch();
    let promiseArray = [];
    //   making promise for scanning every url in an array
    for (let i = 0; i < urlList.length; i++) {
      const page = await browser.newPage();
      // Intercept requests
      await page.setRequestInterception(true);
      promiseArray[i] = new Promise(async (resolve, reject) => {
        let adobeBeaconFound = false;
        try {
          page.on("request", (request) => {
            const requestUrl = request.url();
            if (requestUrl.includes("b/ss/")) {
              adobeBeaconFound = true;
              //   console.log("✅ Adobe Analytics Beacon Found:", requestUrl);
              request.continue(); // Allow request to proceed
            } else {
              request.continue();
              console.log("adobe pv not fired at",request.url)
            }
          });        
        } catch (error) {
          reject(`Error: ${error} , could not reach the page`);
        }
      });
      await page.goto(urlList[i], { waitUntil: "load" ,timeout:0});
    adobeBeaconFound
      ? resolve("Adobe beacon validated!")
      : reject("❌ No Adobe beacon detected.");
    }
    
    await Promise.allSettled(promiseArray).then((results) => {
       resultData = results;
    }).catch(e=>{
      resultData = `Error:${e.message}`
    });
    await browser.close();
  } catch (e) {
    console.log(`error:${e.message}`);
  }
  return resultData
}

// async function validateAdobeBeacon(urlList) {
//   const browser = await puppeteer.launch();
//   let promiseArray = [];

//   for (let url of urlList) {
//     const page = await browser.newPage(); // Create a new page per URL
//     let adobeBeaconFound = false;

//     // Enable request interception
//     await page.setRequestInterception(true);
//     page.on("request", (request) => {
//       if (request.url().includes("b/ss/")) {
//         adobeBeaconFound = true;
//       }
//       request.continue(); // Allow the request to proceed
//     });
//     new Promise((resolve) => {
//       page.goto(url, { waitUntil: "load", timeout: 0 })
//         .then(() => {
//           resolve({
//             url,
//             status: adobeBeaconFound ? "✅ Adobe beacon validated!" : "❌ No Adobe beacon detected."
//           });
//         })
//         .catch((error) => {
//           resolve({
//             url,
//             status: `Error: ${error.message}, could not reach the page`
//           });
//         });
//     })
//     await page.close();
//   }

//   const resultData = await Promise.allSettled(promiseArray);
//   await browser.close(); // Close browser after all promises resolve

//   return resultData;
// }

// module.exports = validateAdobeBeacon;