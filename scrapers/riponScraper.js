// Imports
const cheerio = require("cheerio");
const moment = require("moment");
const { filterURLS } = require("../filterURLS");

// @ desc Scrapes Ripon Leader for article URLS.
// @ returns array of article URLS to scrape.
const getRiponURLS = async (dbURLS) => {
  console.log("Scraping The Ripon Press");

  // An array to populate with thumbnail objects.
  let thumbnailArr = [];

  // Creating sets to populate with unique URLS.
  const edArticleURLS = new Set();
  const localNewsArticleURLS = new Set();
  const highSchoolArticleURLS = new Set();

  // Main URLS to scrape.
  const edURL = "https://www.riponpress.com/news/education/";
  const localNewsURL = "https://www.riponpress.com/news/business/";
  const highSchoolURL = "https://www.riponpress.com/sports/prep/";

  // Variables to reasign depending on if Proxy is used.
  let edPromise;
  let localNewsPromise;
  let highSchoolPromise;
  // Getting Category DOM.

  console.log("Fetching Category DOMS ");
  edPromise = fetch(edURL).then((res) => res.text());
  localNewsPromise = fetch(localNewsURL).then((res) => res.text());
  highSchoolPromise = fetch(highSchoolURL).then((res) => res.text());
  const [edDOM, localNewsDOM, highSchoolDOM] = await Promise.all([
    edPromise,
    localNewsPromise,
    highSchoolPromise,
  ]);
  console.log("Got all Category DOMS");

  // Creating cheerio objects.
  const $ed = cheerio.load(edDOM);
  const $localNews = cheerio.load(localNewsDOM);
  const $highSchool = cheerio.load(highSchoolDOM);

  // Populating Sets with URLS and thumbnailsArr with thumbnail objects.
  getURLS($ed, thumbnailArr, edArticleURLS);
  getURLS($localNews, thumbnailArr, localNewsArticleURLS);
  getURLS($highSchool, thumbnailArr, highSchoolArticleURLS);

  // Populating GLOBAL object of subcategorized URLS.
  subcategoriesObj["EDUCATION"] = Array.from(edArticleURLS);
  subcategoriesObj["LOCAL NEWS"] = Array.from(localNewsArticleURLS);
  subcategoriesObj["HIGH SCHOOL SPORTS"] = Array.from(highSchoolArticleURLS);

  // Creating an array of unique Article URLS to return.
  let articleURLS = [
    ...edArticleURLS,
    ...localNewsArticleURLS,
    ...highSchoolArticleURLS,
  ];

  // Filtering out DB URLS.
  console.log("Filtering...");
  const filteredArticleURLS = await filterURLS(articleURLS, dbURLS);
  if (!filteredArticleURLS) {
    console.error("Failed to filter URLS. Shutting down Scraper.");
    return;
  }

  return [filteredArticleURLS, thumbnailArr];
};
// @ desc Scrapes Ripon News
// @ returns updated Scraped data object with new scraped data.
const riponScraper = async (dbURLS) => {
  const articles = [];

  // Getting article URLS
  let urls;
  let thumbnails;
  const [resURLS, resThumbnails] = await getRiponURLS(dbURLS);
  urls = resURLS;
  if (!urls) {
    return;
  }
  thumbnails = resThumbnails;
  console.log("Got all article URLS");

  // Getting article DOMS
  let URLpromises;
  console.log("Getting article DOMS ");
  URLpromises = urls.map((url) => {
    return fetch(url).then((res) => res.text());
  });
  const articleDOMS = await Promise.all(URLpromises);
  console.log("Got all Article DOMS, Scraping Data... ");

  // Iterating over each Ripon article DOM to scrape data.
  for (let i = 0; i < articleDOMS.length; i++) {
    // Article object to populate and push to articles array.
    const objectToPush = {};

    // Main Cheerio Object.
    const $ = cheerio.load(articleDOMS[i]);

    // Getting the Image.
    const currentImage = $('meta[property="og:image"]').attr("content");
    const imageAlt = $('meta[name="twitter:image:alt"]').attr("content");
    const image = { src: currentImage, alt: imageAlt };

    // Getting paragraphs.
    const paragraphs = [];
    $("div.asset-content")
      .find("p")
      .each((i, element) => {
        const p = $(element).text();
        if (p !== "") {
          paragraphs.push(p.trim());
        }
      });

    // Getting more Data with one-liners.
    const date = $("time.tnt-date").text().trim();
    const datetime = moment($("time.tnt-date").attr("datetime")).toDate();
    const author = $("a.tnt-user-name:eq(1)").text().trim();
    const source = urls[i];
    const publisher = "The Ripon Press";
    const heading = $("h1.headline").text().trim();
    const subHeading = $("h2.subhead").text().trim() || null;
    const thumbnail = thumbnails[i];
    const [category, subcategory] = getCategories(source);

    // Saving data to an object to push to articles array.
    objectToPush["source"] = source;
    objectToPush["publisher"] = publisher;
    objectToPush["category"] = category;
    objectToPush["subcategory"] = subcategory;
    objectToPush["heading"] = heading;
    objectToPush["subHeading"] = subHeading;
    objectToPush["author"] = author;
    objectToPush["date"] = datetime.toDateString();
    objectToPush["datetime"] = datetime;
    objectToPush["thumbnail"] = thumbnail.src
      ? thumbnail
      : image.src
      ? image
      : { src: null, alt: null };
    objectToPush["img"] = image.src ? image : { src: null, alt: null };
    objectToPush["paragraphs"] = paragraphs;
    objectToPush["business_id"] = null;

    if (objectToPush.paragraphs.length != 0) {
      articles.push(objectToPush);
    }
  }
  return articles;
};

// Populates URL Sets and thumbnails array according to cheerio obj passed in.
function getURLS($, thumbnailArr, toAdd) {
  // Gets URLS and thumbnails for articles.
  $("a.tnt-asset-link").each((i, element) => {
    const anchor = $(element);
    if (anchor.attr("href") !== "{{url}}") {
      toAdd.add("https://www.riponpress.com" + anchor.attr("href"));
    }
    let image = {
      src: anchor.find("img").attr("srcset"),
      alt: anchor.find("img").attr("alt"),
    };
    thumbnailArr.push(image);
  });
}

// @ Desc gets categories from url.
// @ Returns category string.
function getCategories(source) {
  // Getting Categories.
  let category = "";
  let subcategory = "";

  // Control flow for categorizing using global object.
  if (subcategoriesObj["EDUCATION"].includes(source)) {
    category = "NEWS";
    subcategory = "EDUCATION";
  } else if (subcategoriesObj["LOCAL NEWS"].includes(source)) {
    category = "NEWS";
    subcategory = "LOCAL NEWS";
  } else {
    category = "SPORTS";
    subcategory = "HIGH SCHOOL SPORTS";
  }
  return [category, subcategory];
}

module.exports = { riponScraper };
