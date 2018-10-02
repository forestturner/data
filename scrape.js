let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs'); 


let USAURL = 'https://tradingeconomics.com/united-states/indicators'
let JAPANURl = 'https://tradingeconomics.com/japan/indicators'
let currentURl = USAURL
axios.get(currentURl)
    .then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html); 
            let data = {};
            $('tr').each((i, elm) => {
                let description = $(elm).children().eq(0).first().text().trim()
                let value = $(elm).children().eq(1).first().text().trim().split("\n")[0]
                if (isNumeric(value) ){
                    data[description] = parseFloat(value)
                }
            })
            if(USAURL !== currentURl) {
                data = convertCurrencyToUSD(data)
            }
            fs.writeFile(`${currentURl.split('/')[3]}.json`, 
                        JSON.stringify(data, null, 4), 
                        (err)=> console.log('File successfully created'))
    }
}, (error) => console.log(err) );


function isNumeric(n) {
    return !isNaN(parseFloat(n));
}

function convertCurrencyToUSD(incomingData) {
    let arrayJPY = [
        'GDP Constant Prices',
        'Gross National Product',
        'Gross Fixed Capital Formation',
        'GDP From Agriculture',
        'GDP From Construction',
        'GDP From Manufacturing',
        'GDP From Mining',
        'GDP From Public Administration',
        'GDP From Services',
        'GDP From Transport',
        'GDP From Utilities',
        'Wages',
        'Minimum Wages',
        'Wages in Manufacturing',
        'Money Supply M0',
        'Money Supply M1',
        'Money Supply M2',
        'Money Supply M3',
        'Central Bank Balance Sheet',
        'Foreign Exchange Reserves',
        'Loans to Private Sector',
        'Foreign Stock Investment',
        'Foreign Bond Investment',
        'Balance of Trade',
        'Exports',
        'Imports',
        'Current Account',
        'External Debt',
        'Foreign Direct Investment',
        'Tourism Revenues',
        'Government Budget Value',
        'Government Spending',
        'New Orders',
        'Changes in Inventories',
        'Corporate Profits',
        'Consumer Spending',
        'Consumer Credit'
        ];
    for( key of arrayJPY ) {
        if (incomingData[key] && incomingData['Currency']) {
            incomingData[key] = Math.floor((incomingData[key] / incomingData['Currency']))
        }
    }
    return incomingData
}