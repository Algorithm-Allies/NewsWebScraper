//Authors: Manuel, Mobin
//// IMPORTS ////
const { writeFile } = require("fs/promises");
const path = require("path");
// Getting Scraper functions.
const { modestoBeeScraper } = require("./scrapers/modestoScraper");
const { turlockJournalScraper } = require("./scrapers/turlockScraper");
const { oakdaleLeaderScraper } = require("./scrapers/oakdaleScraper");
const { riverbankNewsScraper } = require("./scrapers/riverbankScraper");
const { tracyPressScraper } = require("./scrapers/tracyScraper");
const { riponScraper } = require("./scrapers/riponScraper");

//// FUNCTIONS ////
// @ desc Scrapes city data or all cities if all is passed as arg.
// @ returns an array of objects where each object represents an article with the data we need as properties.
async function scrapeData(city = "all") {
  console.log("\n");
  let articles = [];
  console.time();
  switch (city) {
    case "turlock":
      articles = await turlockJournalScraper();
      console.log(
        `Scraped ${articles.length} articles from The Turlock Journal`
      );
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "modesto":
      articles = await modestoBeeScraper();
      console.log(`Scraped ${articles.length} articles from The Modesto Bee`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "oakdale":
      articles = await oakdaleLeaderScraper();
      console.log(
        `Scraped ${articles.length} articles from The Oakdale Leader`
      );
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "riverbank":
      articles = await riverbankNewsScraper();
      console.log(`Scraped ${articles.length} articles from Riverbank News`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "tracy":
      articles = await tracyPressScraper();
      console.log(`Scraped ${articles.length} articles from Tracy Press`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "ripon":
      articles = await riponScraper();
      console.log(`Scraped ${articles.length} articles from Ripon Press`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "all":
      try {
        modestoArr = await modestoBeeScraper();
        articles = [...articles, ...modestoArr];
        console.log(
          `Scraped ${modestoArr.length} articles from The Modesto Bee\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Modesto. Error: ${e.message}\n`);
      }
      try {
        tracyArr = await tracyPressScraper();
        articles = [...articles, ...tracyArr];
        console.log(
          `Scraped ${tracyArr.length} articles from The Tracy Press\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Tracy. Error ${e.message}\n`);
      }
      try {
        turlockArr = await turlockJournalScraper();
        articles = [...articles, ...turlockArr];
        console.log(
          `Scraped ${turlockArr.length} articles from The Turlock Journal\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Turlock. Error ${e.message}\n`);
      }
      try {
        oakdaleArr = await oakdaleLeaderScraper();
        articles = [...articles, ...oakdaleArr];
        console.log(`Scraped ${oakdaleArr.length} from The Oakdale Leader\n`);
      } catch (e) {
        console.log(`Failed to scrape Oakdale. Error ${e.message}\n`);
      }
      try {
        riverbankArr = await riverbankNewsScraper();
        articles = [...articles, ...riverbankArr];
        console.log(
          `Scraped ${riverbankArr.length} articles from The Riverbank News\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Riverbank. Error ${e.message}\n`);
      }
      try {
        riponArr = await riponScraper();
        articles = [...articles, ...riponArr];
        console.log(
          `Scraped ${riponArr.length} articles from The Ripon Press\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Ripon. Error ${e.message}\n`);
      }

      console.log(`Scraped a Total of ${articles.length} Articles. \n`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
  }
  console.log("Wrote Articles to articles.json");
  console.timeEnd();
}

// Updates Scraped Data object and will write to JSON file.
scrapeData();

module.exports = { scrapeData };
