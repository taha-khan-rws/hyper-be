// This is poc to fetch url's from a webpage using fetch api

const data = fetch("https://channelnewsasia.com/international")
  .then((response) => response.text())
  .then((r) => {
    console.log(r);
    console.log(typeof r);
  });

// console.log(data)
