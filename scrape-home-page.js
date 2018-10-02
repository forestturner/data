let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');


let URL = 'https://tradingeconomics.com/';
axios.get(URL)
  .then((response) => {
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      let data = {};
      $('tr').each((i, elm) => {
        let description = $(elm).children().eq(0).first().text().trim()
        if (parseFloat($(elm).children().eq(1).first().text().trim().split("\n")[0].replace(',', ''))) {
          data[description] = findAllValues($, elm);
        }
      })
      fs.writeFile(`${URL.split('/')[2]}.json`,
        JSON.stringify(data, null, 4),
        (err) => console.log('File successfully created'))
    }
  }, (error) => console.log(err));


function isNumeric(n) {
  return !isNaN(parseFloat(n));
}

function findAllValues($,elm) {
  let count = 1
  let results = []
  while (isNumeric($(elm).children().eq(count).first().text().trim().split("\n")[0].replace(',', ''))) {
    results.push(parseFloat($(elm).children().eq(count).first().text().trim().split("\n")[0].replace(',', '')))
    count++;
  }
  return results
}