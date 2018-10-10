let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');


//The earliest expansions were packaged in 8-card booster packs that usually contain 6 commons and 2 uncommons (there were no rares back then). A few expansions were packaged in 12-card booster packs that usually contain 9 commons, 2 uncommons and 1 rare. Since Mirage, most expansions were packaged in 15-card booster packs that usually contain 11 commons, 3 uncommons and 1 rare. One exception to this is Time Spiral, where the 15-card boosters include 10 commons, 3 uncommons, 1 rare and 1 Timeshifted card.
async function run() {
    let arrayOfPages = []
    let listOfPrices = {};
    let URL = 'https://shop.tcgplayer.com/price-guide/magic/guilds-of-ravnica';
    let response = await axios(URL)
    if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        $('.priceGuideDropDown#set option').each((i, elm) => {
            // console.log($(elm).attr('value'));
            // console.log()
            arrayOfPages.push(`https://shop.tcgplayer.com/price-guide/magic/${$(elm).val()}`)
        });
    }
    console.log('arrayOfPages=', arrayOfPages)
    for(page of arrayOfPages) {
        let response2 = await axios(page)
        if (response2.status === 200) {
            const html = response2.data;
            const $ = cheerio.load(html);
            let possibleCards = {};
            $('tr').each((i, elm) => {
                let product = $(elm).find('.product').text().trim()
                let rarity = $(elm).find('.rarity').text().trim()
                let marketPrice = $(elm).find('.marketPrice').text().trim()
                let buylistMarketPrice = $(elm).find('.buylistMarketPrice').text().trim()
                let medianPrice = $(elm).find('.medianPrice').text().trim()
        
                let card = {
                "product": product,
                "rarity": removeSpaceDollarSignAndConvertToFloat(rarity), 
                "marketPrice": removeSpaceDollarSignAndConvertToFloat(marketPrice),
                "buylistMarketPrice": removeSpaceDollarSignAndConvertToFloat(buylistMarketPrice),
                "medianPrice": removeSpaceDollarSignAndConvertToFloat(medianPrice)
                }
        
                if (product != "") {
                    possibleCards[`${card.product}`] = card
                }
            })
            //console.log('data=', possibleCards)
            let priceData = takeDataFindAverages(possibleCards)
            console.log('priceData=', priceData)
            listOfPrices[`${page}`] = priceData
        }
    }
    fs.writeFile(`prices.json`,
    JSON.stringify(listOfPrices, null, 4),
    (err) => console.log('File successfully created'))
}

run();


// let URL = 'https://shop.tcgplayer.com/price-guide/magic/guilds-of-ravnica';
// axios.get(URL)
//   .then((response) => {
//     if (response.status === 200) {
//       const html = response.data;
//       const $ = cheerio.load(html);
//       let possibleCards = {};
//       $('tr').each((i, elm) => {
//         let product = $(elm).find('.product').text().trim()
//         let rarity = $(elm).find('.rarity').text().trim()
//         let marketPrice = $(elm).find('.marketPrice').text().trim()
//         let buylistMarketPrice = $(elm).find('.buylistMarketPrice').text().trim()
//         let medianPrice = $(elm).find('.medianPrice').text().trim()

//         let card = {
//           "product": product,
//           "rarity": removeSpaceDollarSignAndConvertToFloat(rarity), 
//           "marketPrice": removeSpaceDollarSignAndConvertToFloat(marketPrice),
//           "buylistMarketPrice": removeSpaceDollarSignAndConvertToFloat(buylistMarketPrice),
//           "medianPrice": removeSpaceDollarSignAndConvertToFloat(medianPrice)
//         }

//         if (product != "") {
//             possibleCards[`${card.product}`] = card
//         }
//       })
//       //console.log('data=', possibleCards)
//       let priceData = takeDataFindAverages(possibleCards)

//     }
//   }, (error) => console.log(err));


  function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }

  function removeSpaceDollarSignAndConvertToFloat(input) {
    let results =  replaceAll(input,"\n","")
    results = replaceAll(results, " ", "")
    results = replaceAll(results, "$", "")
    results = replaceAll(results, '—', "0.0")
    if (isNumeric(results)) {
      results = parseFloat(results)
    }
    return results
  }

  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }

  function isNumeric(n) {
    return !isNaN(parseFloat(n));
  }


// 10 commons
// 3 uncommons
// 1 rare - mystic
// 1 land

//"product": product,
//"rarity": removeSpaceDollarSignAndConvertToFloat(rarity), 
//"marketPrice": removeSpaceDollarSignAndConvertToFloat(marketPrice),
//"buylistMarketPrice": removeSpaceDollarSignAndConvertToFloat(buylistMarketPrice),
//"medianPrice": removeSpaceDollarSignAndConvertToFloat(medianPrice)

function takeDataFindAverages(data, numberOfCardsPerPack = 15, isMysticPossible = true, numberBoostPacksPerBook = 36) {
    let landPercent = parseFloat((1 / numberOfCardsPerPack).toFixed(2))
    let commonPercent = parseFloat((10 / numberOfCardsPerPack).toFixed(2))
    let uncommonPercent = parseFloat((3 / numberOfCardsPerPack).toFixed(2))
    let rarePercent = parseFloat((1 / numberOfCardsPerPack).toFixed(2))
    let mysticPercent = 0.0
    if (isMysticPossible) {
        rarePercent = parseFloat((0.875 / numberOfCardsPerPack).toFixed(2))
        mysticPercent = parseFloat((0.125 / numberOfCardsPerPack).toFixed(2))
    }
    let results = {
        boosterBoxAveragePrice: 0,
        boosterPackAveragePrice: 0,

        boosterBoxBuylistAveragePrice: 0,
        boosterPackBuylistAveragePrice: 0,

        boosterBoxMedianAveragePrice: 0,
        boosterPackMedianAveragePrice: 0,

        landAveragePrice: 0,
        landBuylistAveragePrice: 0,
        landMedianAveragePrice: 0,

        commonAveragePrice: 0,
        commonBuylistAveragePrice: 0,
        commonMedianAveragePrice: 0,
        
        uncommonAveragePrice: 0,
        uncommonBuylistAveragePrice: 0,
        uncommonMedianAveragePrice: 0,

        rareAveragePrice: 0,
        rareBuylistAveragePrice: 0,
        rareMedianAveragePrice: 0,

        mysticAveragePrice: 0,
        mysticBuylistAveragePrice: 0,
        mysticMedianAveragePrice: 0,

        commonAveragePrice: 0,
        uncommonAveragePrice: 0,
        rareAveragePrice: 0,
        mysticAveragePrice: 0,

        averagePricePerCardPerPack: 0,
        medianAveragePricePerCardPerPack: 0,
        buylistAveragePricePerCardPerPack: 0
    }
    let land = averagePrices(data, 'L')
    let token = averagePrices(data, 'T')
    let common = averagePrices(data, 'C')
    let uncommon = averagePrices(data, 'U')
    let rare = averagePrices(data, 'R')
    let mystic = averagePrices(data, 'M')
    let artifacts = averagePrices(data, 'A')
    results["landAveragePrice"] = land.averageMarketPrice
    results["landBuylistAveragePrice"] = land.averageBuyListMarketPrice
    results["landMedianAveragePrice"] = land.averageMedianPrice

    results["commonAveragePrice"] = common.averageMarketPrice
    results["commonBuylistAveragePrice"] = common.averageBuyListMarketPrice
    results["commonMedianAveragePrice"] = common.averageMedianPrice

    results["uncommonAveragePrice"] = uncommon.averageMarketPrice
    results["uncommonBuylistAveragePrice"] = uncommon.averageBuyListMarketPrice
    results["uncommonMedianAveragePrice"] = uncommon.averageMedianPrice

    results["tokenAveragePrice"] = token.averageMarketPrice
    results["tokenBuylistAveragePrice"] = token.averageBuyListMarketPrice
    results["tokenMedianAveragePrice"] = token.averageMedianPrice

    results["artifactsAveragePrice"] = artifacts.averageMarketPrice
    results["artifactsBuylistAveragePrice"] = artifacts.averageBuyListMarketPrice
    results["artifactsMedianAveragePrice"] = artifacts.averageMedianPrice
    
    results["rareAveragePrice"] = rare.averageMarketPrice
    results["rareBuylistAveragePrice"] = rare.averageBuyListMarketPrice
    results["rareMedianAveragePrice"] = rare.averageMedianPrice

    results["mysticAveragePrice"] = mystic.averageMarketPrice
    results["mysticBuylistAveragePrice"] = mystic.averageBuyListMarketPrice
    results["mysticMedianAveragePrice"] = mystic.averageMedianPrice

    results["averagePricePerCardPerPack"] = (
        results["landAveragePrice"] * landPercent +
        results["commonAveragePrice"] * commonPercent +
        results["uncommonAveragePrice"] * uncommonPercent +
        results["rareAveragePrice"] * rarePercent +
        results["mysticAveragePrice"] * mysticPercent
    );

    results["buylistAveragePricePerCardPerPack"] = (
        results["landBuylistAveragePrice"] * landPercent +
        results["commonBuylistAveragePrice"] * commonPercent +
        results["uncommonBuylistAveragePrice"] * uncommonPercent +
        results["rareBuylistAveragePrice"] * rarePercent +
        results["mysticBuylistAveragePrice"] * mysticPercent
    );

    results["medianAveragePricePerCardPerPack"] = (
        results["landMedianAveragePrice"] * landPercent +
        results["commonMedianAveragePrice"] * commonPercent +
        results["uncommonMedianAveragePrice"] * uncommonPercent +
        results["rareMedianAveragePrice"] * rarePercent +
        results["mysticMedianAveragePrice"] * mysticPercent
    );

    results["boosterPackAveragePrice"] = results["averagePricePerCardPerPack"] * numberOfCardsPerPack
    results["boosterBoxAveragePrice"] = results["averagePricePerCardPerPack"] * (numberBoostPacksPerBook * numberOfCardsPerPack)
    
    results["boosterPackBuylistAveragePrice"] = results["buylistAveragePricePerCardPerPack"] * numberOfCardsPerPack
    results["boosterBoxBuylistAveragePrice"] = results["buylistAveragePricePerCardPerPack"] * (numberBoostPacksPerBook * numberOfCardsPerPack)
    
    results["boosterPackMedianAveragePrice"] = results["medianAveragePricePerCardPerPack"] * numberOfCardsPerPack
    results["boosterBoxMedianAveragePrice"] = results["medianAveragePricePerCardPerPack"] * (numberBoostPacksPerBook * numberOfCardsPerPack)

    return results.boosterBoxAveragePrice;
}

function averagePrices(data, type) {
    let totalMarketPrice = 0.0
    let totalBuylistMarketPrice = 0.0
    let totalMedianPrice = 0.0
    let numberOfCards = 0

    for (keyCard of Object.keys(data)) {
        let card = data[keyCard]
        if (card.rarity === type) {
            totalMarketPrice += card.marketPrice
            totalBuylistMarketPrice += card.buylistMarketPrice 
            totalMedianPrice += card.medianPrice
            numberOfCards += 1
        }
    }
    // console.log('totalMarketPrice=', totalMarketPrice)
    // console.log('totalMarketPrice=', totalBuylistMarketPrice)
    // console.log('totalMarketPrice=', totalMedianPrice)
    let resultsData = {}
    resultsData["averageMarketPrice"] = parseFloat((totalMarketPrice / numberOfCards).toFixed(2))
    resultsData["averageBuyListMarketPrice"] = parseFloat((totalBuylistMarketPrice / numberOfCards).toFixed(2))
    resultsData["averageMedianPrice"] = parseFloat((totalMedianPrice / numberOfCards).toFixed(2))
    resultsData["numberOfCards"] = numberOfCards
    // console.log('resultsData=', resultsData)
    return resultsData;
}
