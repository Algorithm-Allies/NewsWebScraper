//Authors: Manuel, Mobin
//// IMPORTS ////
// Getting Scraper functions.
const { modestoBeeScraper } = require("./scrapers/modestoScraper");
const { turlockJournalScraper } = require("./scrapers/turlockScraper");
const { oakdaleLeaderScraper } = require("./scrapers/oakdaleScraper");
const { riverbankNewsScraper } = require("./scrapers/riverbankScraper");
const { tracyPressScraper } = require("./scrapers/tracyScraper");

//// GLOBAL VARIABLE ////
// Array of object articles for scraped data. Gets updated by updateData function.
let articleArray = [];

//// FUNCTIONS ////
// @ desc Scrapes city data or all cities if all is passed as arg.
// @ returns an array of objects where each object represents an article with the data we need as properties.
async function scrapeData(city) {
  console.time();
  switch (city) {
    case "turlock":
      console.log(await turlockJournalScraper());
      break;
    case "modesto":
      console.log(await modestoBeeScraper());
      break;
    case "oakdale":
      console.log(await oakdaleLeaderScraper());
      break;
    case "riverbank":
      console.log(await riverbankNewsScraper());
      break;
    case "tracy":
      console.log(await tracyPressScraper());
      break;
    case "all":
      const data = await Promise.all([
        tracyPressScraper(),
        turlockJournalScraper(),
        modestoBeeScraper(),
        oakdaleLeaderScraper(),
        riverbankNewsScraper(),
      ]).then((allData) => allData);
      for (let i = 0; i < data.length; i++) {
        articleArray = articleArray.concat(data[i]);
      }
      console.log(articleArray);
      break;
  }
  console.timeEnd();
}

// Updates Scraped Data object and will write to JSON file.
scrapeData("oakdale");

module.exports = { scrapeData };
