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
async function scrapeData(city = "turlock", proxy = false) {
  console.log("\n");
  let articles = [];
  console.time();
  switch (city) {
    case "turlock":
      proxy
        ? (articles = await turlockJournalScraper(true))
        : (articles = await turlockJournalScraper());
      console.log(
        `Scraped ${articles.length} articles from The Turlock Journal`
      );
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "modesto":
      proxy
        ? (articles = await modestoBeeScraper(true))
        : (articles = await modestoBeeScraper());
      console.log(`Scraped ${articles.length} articles from The Modesto Bee`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "oakdale":
      proxy
        ? (articles = await oakdaleLeaderScraper(true))
        : (articles = await oakdaleLeaderScraper());
      console.log(
        `Scraped ${articles.length} articles from The Oakdale Leader`
      );
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "riverbank":
      proxy
        ? (articles = await riverbankNewsScraper(true))
        : (articles = await riverbankNewsScraper());
      console.log(`Scraped ${articles.length} articles from Riverbank News`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "tracy":
      proxy
        ? (articles = await tracyPressScraper(true))
        : (articles = await tracyPressScraper());
      console.log(`Scraped ${articles.length} articles from Tracy Press`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "ripon":
      proxy
        ? (articles = await riponScraper(true))
        : (articles = await riponScraper());
      console.log(`Scraped ${articles.length} articles from Ripon Press`);
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
    case "all":
      try {
        proxy
          ? (modestoArr = await modestoBeeScraper(true))
          : (modestoArr = await modestoBeeScraper());
        articles = [...articles, ...modestoArr];
        console.log(
          `Scraped ${modestoArr.length} articles from The Modesto Bee\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Modesto. Error: ${e.message}\n`);
      }
      try {
        proxy
          ? (tracyArr = await tracyPressScraper(true))
          : (tracyArr = await tracyPressScraper());
        articles = [...articles, ...tracyArr];
        console.log(
          `Scraped ${tracyArr.length} articles from The Tracy Press\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Tracy. Error ${e.message}\n`);
      }
      try {
        proxy
          ? (turlockArr = await turlockJournalScraper(true))
          : (turlockArr = await turlockJournalScraper());
        articles = [...articles, ...turlockArr];
        console.log(
          `Scraped ${turlockArr.length} articles from The Turlock Journal\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Turlock. Error ${e.message}\n`);
      }
      try {
        proxy
          ? (oakdaleArr = await oakdaleLeaderScraper(true))
          : (oakdaleArr = await oakdaleLeaderScraper());
        articles = [...articles, ...oakdaleArr];
        console.log(`Scraped ${oakdaleArr.length} from The Oakdale Leader\n`);
      } catch (e) {
        console.log(`Failed to scrape Oakdale. Error ${e.message}\n`);
      }
      try {
        proxy
          ? (riverbankArr = await riverbankNewsScraper(true))
          : (riverbankArr = await riverbankNewsScraper());
        articles = [...articles, ...riverbankArr];
        console.log(
          `Scraped ${riverbankArr.length} articles from The Riverbank News\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Riverbank. Error ${e.message}\n`);
      }
      try {
        proxy
          ? (riponArr = await riponScraper(true))
          : (riponArr = await riponScraper());
        articles = [...articles, ...riponArr];
        console.log(
          `Scraped ${riponArr.length} articles from The Ripon Press\n`
        );
      } catch (e) {
        console.log(`Failed to scrape Ripon. Error ${e.message}\n`);
      }

      console.log(`Scraped a Total of ${articles.length} Articles. \n`);
      console.log(articles)
      await writeFile(
        path.join(process.cwd(), "articles.json"),
        JSON.stringify(articles)
      );
      break;
  }
  console.log("Wrote Articles to articles.json");
  console.timeEnd();
  return articles
}


module.exports = { scrapeData };
