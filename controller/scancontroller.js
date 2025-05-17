const fetchUrls = require("../services/urlfetcher.service")
// const validateAdobeBeacons = require("../services/adobevalidation.service")
const validateAdobeBeacons = require("../services/beaconvalidator.service")
// const pwvalidateAdobeBeacon = require("../services/pwbeaconvalidatoe.service")
async function scancontroller(req,res) {
    // console.log(req.params.sitename)
    const sitename = req.params.sitename
    // console.log(sitename)
    if(sitename == "cna") homeurl = "https://www.channelnewsasia.com/international"
    const urlList = await fetchUrls(homeurl)
    const responseData = await validateAdobeBeacons(urlList.slice(0,100))  
    res.json({"msg":"ok","response":responseData})    
}
module.exports = scancontroller