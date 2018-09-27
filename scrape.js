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
            let containerDivId = "ctl00_ContentPlaceHolder1_ctl00_Panel1"
            let eachTableName = ".table"
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
            // $('.single-article').each(function(i, elem) {
            //     devtoList[i] = {
            //         title: $(this).find('h3').text().trim(),
            //         url: $(this).children('.index-article-link').attr('href'),
            //         tags: $(this).find('.tags').text().split('#')
            //               .map(tag =>tag.trim())
            //               .filter(function(n){ return n != "" })
            //     }      
            // });
            // const devtoListTrimmed = devtoList.filter(n => n != undefined )
            fs.writeFile('UnitedStates.json', 
                          JSON.stringify(data, null, 4), 
                          (err)=> console.log('File successfully written!'))
    }
}, (error) => console.log(err) );


function isNumeric(n) {
    return !isNaN(parseFloat(n));
  }