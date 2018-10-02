let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');


let URL = 'https://tradingeconomics.com/countries';
axios.get(URL)
  .then((response) => {
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      let data = {};
      $('.list-group-item').each((i, elm) => {
        let title = $(elm).text()
        let href = $(elm).find('a').eq(0).attr('href');
        data[title] = href
      })
      fs.writeFile('tradingeconomics.com-countries.json',
        JSON.stringify(data, null, 4),
        (obj) => console.log('File successfully created obj =', obj))
    }
  }, (error) => console.log(err));

