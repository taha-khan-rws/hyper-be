const puppeteer = require("puppeteer");

async function validateAdobeBeacon(urlList) {
  let resultData={}
  try {
    const browser = await puppeteer.launch();
    let promiseArray = [];
    for (let i = 0; i < urlList.length; i++) {
      promiseArray[i] = new Promise(async(resolve, reject) => {
        let adobeBeaconFound = false;
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on("request", (request) => {
          const requestUrl = request.url();
          if (requestUrl.includes("b/ss/")) {
            adobeBeaconFound = true;
            // request.continue()
        } else {
              request.continue(); // Allow request to proceed
          }
        });
        try{
          await page.goto(urlList[i], { waitUntil: "load" ,timeout:0});
          // await page.goto(urlList[i], { waitUntil: "load" ,timeout:0});
        }catch(e){
          return `error while navigating to page${e.message}`
        }
          adobeBeaconFound
            ? resolve("Adobe beacon validated!")
            : reject("❌ No Adobe beacon detected.");
        await page.close()
      });
    }
    await Promise.allSettled(promiseArray).then((results) => {
        resultData = results;
     }).catch(e=>{
       resultData = `Error:${e.message}`
     });
     await browser.close()
  } catch (e) {
    console.log(`Error occured ${e}`);
  }
  return resultData
}
module.exports = validateAdobeBeacon
