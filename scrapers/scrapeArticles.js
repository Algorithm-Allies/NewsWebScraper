//// IMPORTS ////
const cheerio = require("cheerio");
const axios = require("axios");
const {
  getTurlockURLS,
  getRiponURLS,
  getTracyURLS,
  getModestoURLS,
  getRiverbankURLS,
  getOakdaleURLS,
} = require("./scrapeArticleURLS");

// @ desc Scrapes The Turlock Journal
// @ returns updated Scraped data object with new scraped data.
const turlockJournalScraper = async () => {
  // Getting turlock article urls to iterate over and scrape.
  const urls = await getTurlockURLS();

  // Getting an array of promises to pass to Promise.all(). Resolved when each url is turned into DOM string.
  const URLpromises = urls.map((url) => {
    return axios.get(url).then((res) => res.data);
  });
  // Awaiting all promises to be fulfilled before continuing to next part of code.
  const articleDOMS = await Promise.all(URLpromises);

  // Creating array to push objects to.
  const arr = new Array();

  // Iterating over each turlock article DOM to scrape data.
  for (let i = 0; i < articleDOMS.length; i++) {
    // const object to push
    const objectToPush = {};

    // Creating main cheerio object.
    const $ = cheerio.load(articleDOMS[i]);

    // Getting needed data I could get that wasn't filled with props.
    const source = urls[i];
    const publisher = "Turlock Journal";
    const heading = $("div.anvil-article__title").text();
    const subHeading = $("div.anvil-article__subtitle").text().trim() || null;
    const paragraphs = [];
    $("div.rich-text")
      .find("div.rich-text")
      .children()
      .each((i, element) => {
        const p = $(element);
        paragraphs.push(p.text().trim());
      });
    const filteredParagraphs = paragraphs.filter((p) => p !== "");

    // Getting data that was filled with props, but luckily was in JSON in a span tag.
    const jsonData = JSON.parse(
      $("div.anvil-padding-bottom")
        .find("span")
        .attr("data-page-tracker-analytics-payload")
    );

    const date = jsonData.page_meta.page_created_at_pretty;
    if (date === "March 06, 2024") {
      const author = jsonData.page_meta.author || paragraphs[0];
      // Saving data to an object I will push to the array of objects.
      objectToPush["source"] = source;
      objectToPush["publisher"] = publisher;
      objectToPush["heading"] = heading.trim();
      objectToPush["subHeading"] = subHeading;
      objectToPush["author"] = author;
      objectToPush["date"] = date;

      // Getting the image data and saving that to objectToPush
      const image = {};
      $("div.anvil-images__image-container").each((i, element) => {
        const currentImage = $(element)
          .find("img.anvil-images__background--glass")
          .attr("src");
        const imageAlt = $(element)
          .find("img.anvil-images__background--glass")
          .attr("alt");
        image["url"] = currentImage;
        image["alt"] = imageAlt;
        objectToPush["img"] = image;
      });
      objectToPush["img"] = image;
      objectToPush["paragraphs"] = filteredParagraphs;

      arr.push(objectToPush);
    }
  }
  return arr;
};

// @ desc Scrapes Ripon News
// @ returns updated Scraped data object with new scraped data.
const riponNewsScraper = () => {
  return [{ ripon: "articles" }];
};

// @ desc Scrapes the Tracy Press
// @ returns updated scraped data object with new scraped data.
const tracyPressScraper = () => {
  return [{ tracy: "articles" }];
};

// @ desc Scrapes The Modesto Bee
// @ returns updated scraped data object with new scraped data.
const modestoBeeScraper = () => {
  return [{ modesto: "articles" }];
};

// @ desc Scrapes Riverbank News
// @ returns updated scraped data object with new scraped data.
const riverbankNewsScraper = () => {
  return [{ riverbank: "articles" }];
};

// @ desc Scrapes Oakdale Leader
// @ returns updated scraped data object with new scraped data.
const oakdaleLeaderScraper = () => {
  return [{ oakdale: "myArticle" }];
};

// Exporting each webscraper.
module.exports = {
  turlockJournalScraper,
  riponNewsScraper,
  tracyPressScraper,
  modestoBeeScraper,
  riverbankNewsScraper,
  oakdaleLeaderScraper,
};
