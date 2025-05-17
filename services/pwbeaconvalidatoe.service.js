const { chromium } = require("playwright");

async function pwvalidateAdobeBeacon(urlList) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    let results = [];

    for (const url of urlList) {
        const page = await context.newPage();
        let beaconFound = false;

        // Enable network interception
        await page.route("**/*", (route, request) => {
            if (request.url().includes("b/ss/")) {
                beaconFound = true;
            }
            route.continue();
        });

        try {
            await page.goto(url, { waitUntil: "load", timeout: 60000 });
            results.push({ url, status: beaconFound ? "✅ Adobe beacon detected" : "❌ No Adobe beacon found" });
        } catch (error) {
            results.push({ url, status: `❌ Error loading page: ${error.message}` });
        }

        await page.close();
    }

    await browser.close();
    return results;
}
module.exports = pwvalidateAdobeBeacon

// Example usage
// const urls = ["https://example.com", "https://yourwebsite.com"];
// validateAdobeBeacon(urls).then(results => console.log(results));