let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs'); 

axios.get('https://tradingeconomics.com/united-states/indicators')
    .then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html); 
            let data = [];
            let counter = 0
            $('tr').each((i, elm) => {
                let description = $(elm).children().eq(0).first().text().trim()
                let value = $(elm).children().eq(1).first().text().trim().split("\n")[0]
                let obj = {}
                if (isNumeric(value) ){
                    obj[description] = parseFloat(value)
                    data[counter] = obj
                    counter++;
                }
            })
            fs.writeFile('UnitedStates.json', 
                          JSON.stringify(data, null, 4), 
                          (err)=> console.log('File successfully created'))
    }
}, (error) => console.log(err) );


function isNumeric(n) {
    return !isNaN(parseFloat(n));
  }

  // Convert none USD fields to USD standard for comparison