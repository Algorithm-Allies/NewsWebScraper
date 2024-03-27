// Imports
const cheerio = require("cheerio");
const axios = require("axios");

// @ desc Scrapes Oakdale Leader for article URLS.
// @ returns array of article URLS to scrape.
const getOakdaleURLS = async () => {
  // Arrays to return.
  const articleURLS = [];
  const thumbnails = [];

  // Main URLS to scrape.
  const newsURL = "https://www.oakdaleleader.com/news/";
  const sportsURL = "https://www.oakdaleleader.com/sports/";

  // Getting DOM strings to create cheerio objects out of.
  const newsPromise = axios.get(newsURL).then((res) => res.data);
  const sportsPromise = axios.get(sportsURL).then((res) => res.data);

  const [newsDOM, sportsDOM] = await Promise.all([newsPromise, sportsPromise]);
  const articleDOMS = newsDOM.concat(sportsDOM);

  // Creating main cheerio objects out of DOM strings.
  const $ = cheerio.load(articleDOMS);

  // Gets URLS and thumbnails for articles.
  $("a.anvil-images__image-container").each((i, element) => {
    const anchor = $(element);
    articleURLS.push(anchor.attr("href"));
    const $thumbnail = anchor.find("img.anvil-images__image--main-article");
    const { src, alt } = $thumbnail.attr();
    const thumbnail = { src, alt };
    thumbnails.push(thumbnail);
  });

  return [articleURLS, thumbnails];
};

// @ desc Scrapes Oakdale Leader
// @ returns updated Scraped data object with new scraped data.
const oakdaleLeaderScraper = async () => {
  const articles = [];

  // Getting an array of article DOM strings for cheerio.
  const [urls, thumbnails] = await getOakdaleURLS();
  const URLpromises = urls.map((url) => {
    return axios.get(url).then((res) => res.data);
  });
  const articleDOMS = await Promise.all(URLpromises);

  // Iterating over each DOM in article DOM, and creating article object to push to articles array.
  for (let i = 0; i < articleDOMS.length; i++) {
    const objectToPush = {};

    // Creating main cheerio object.
    const $ = cheerio.load(articleDOMS[i]);

    // Getting JSON data for finding author and date.
    const jsonData = JSON.parse(
      $("div.anvil-padding-bottom")
        .find("span")
        .attr("data-page-tracker-analytics-payload")
    );

    // Getting image cheerio object for getting image data.
    const $image = $("div.anvil-images__image-container")
      .find("picture.anvil-images__image--main-article")
      .next();

    // Getting paragraphs.
    const paragraphs = [];
    $("div.rich-text")
      .find("div.rich-text")
      .children()
      .each((i, element) => {
        const p = $(element);
        if (p.text().trim() !== "") {
          paragraphs.push(p.text().trim());
        }
      });

    // Getting more data that fit in single line.
    const source = urls[i];
    const publisher = "Oakdale Leader";
    const heading = $("div.anvil-article__title").text();
    const subHeading = $("div.anvil-article__subtitle").text().trim() || null;
    const author = jsonData.page_meta.author || paragraphs[0];
    const date = jsonData.page_meta.page_created_at_pretty;
    const image = { src: $image.attr("src"), alt: $image.attr("alt") };
    const [category, subCategory] = getCategory(urls[i]);

    // Saving data to an object I will push to the array of objects.
    objectToPush["source"] = source;
    objectToPush["publisher"] = publisher;
    objectToPush["heading"] = heading.trim();
    objectToPush["subHeading"] = subHeading;
    objectToPush["category"] = category;
    objectToPush["subcategory"] = subCategory;
    objectToPush["author"] = author;
    objectToPush["date"] = date;
    objectToPush["img"] = image;
    objectToPush["thumbnail"] = thumbnails[i];
    objectToPush["paragraphs"] = paragraphs;

    articles.push(objectToPush);
  }
  return articles;
};

// @ Desc gets categories from url.
// @ Returns category string.
function getCategory(url) {
  let category = "";
  let subCategory = "";

  if (url.includes("https://www.oakdaleleader.com/news/")) {
    category = "NEWS";
  } else {
    category = "SPORTS";
  }

  let subCategories = {
    "high-school": ["sports", "HIGH SCHOOL SPORTS"],
    "local-sports-2": ["sports", "LOCAL SPORTS"],
    college: ["sports", "COLLEGE SPORTS"],
    crime: ["news", "CRIME"],
    government: ["news", "GOVERNMENT"],
    education: ["news", "EDUCATION"],
    "local-news": ["news", "LOCAL NEWS"],
  };

  let keys = Object.keys(subCategories);
  for (let i = 0; i < keys.length; i++) {
    if (url.includes(keys[i]) && url.includes(keys[i][1])) {
      subCategory = subCategories[keys[i]];
    }
  }
  if (!subCategory) {
    subCategory = null;
  }
  return [category, subCategory];
}

module.exports = { oakdaleLeaderScraper };
