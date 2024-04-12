const cheerio = require("cheerio");
const moment = require("moment");
const { filterURLS } = require("../filterURLS");

// GLOBAL VARIABLE///
const subcategoriesObj = {};

// @ desc Scrapes The Turlock Journal for article URLS.
// @ returns array of article URLS to scrape.
const getTurlockURLS = async (dbURLS) => {
  console.log("Scraping The Turlock Journal");

  // Arrays to return.
  const thumbnailArr = [];

  // Creating sets to populate with unique URLS
  const crimeArticleURLS = new Set();
  const govArticleURLS = new Set();
  const edArticleURLS = new Set();
  const localNewsArticleURLS = new Set();
  const localSportsArticleURLS = new Set();
  const highSchoolSportsArticleURLS = new Set();

  // URLS to scrape.
  const crimeURLS = "https://www.turlockjournal.com/news/crime";
  const govURLS = "https://www.turlockjournal.com/news/government";
  const edURLS = "https://www.turlockjournal.com/news/education";
  const localNewsURLS = "https://www.turlockjournal.com/news/local";
  const localSportsURLS = "https://www.turlockjournal.com/sports/community";
  const highSchoolURLS =
    "https://www.turlockjournal.com/news/high-school-sports";

  // Variables to reasign depending on if Proxy is used.
  let crimePromise;
  let govPromise;
  let edPromise;
  let localNewsPromise;
  let localSportsPromise;
  let highSchoolPromise;

  // Getting Category DOMS
  console.log("Fetching Category DOMS ");
  crimePromise = fetch(crimeURLS).then((res) => res.text());
  govPromise = fetch(govURLS).then((res) => res.text());
  edPromise = fetch(edURLS).then((res) => res.text());
  localNewsPromise = fetch(localNewsURLS).then((res) => res.text());
  localSportsPromise = fetch(localSportsURLS).then((res) => res.text());
  highSchoolPromise = fetch(highSchoolURLS).then((res) => res.text());
  const [crimeDOM, govDOM, edDOM, localNewsDOM, localSportsDOM, highSchoolDOM] =
    await Promise.all([
      crimePromise,
      govPromise,
      edPromise,
      localNewsPromise,
      localSportsPromise,
      highSchoolPromise,
    ]);
  console.log("Got all Category DOMS");

  // Creating cheerio objects out of DOM strings.
  const $crime = cheerio.load(crimeDOM);
  const $gov = cheerio.load(govDOM);
  const $ed = cheerio.load(edDOM);
  const $localNews = cheerio.load(localNewsDOM);
  const $localSports = cheerio.load(localSportsDOM);
  const $highSchoolSports = cheerio.load(highSchoolDOM);

  // Populating Sets with URLS, and populating thumbnailArr.
  getURLS($crime, thumbnailArr, crimeArticleURLS);
  getURLS($gov, thumbnailArr, govArticleURLS);
  getURLS($ed, thumbnailArr, edArticleURLS);
  getURLS($localNews, thumbnailArr, localNewsArticleURLS);
  getURLS($localSports, thumbnailArr, localSportsArticleURLS);
  getURLS($highSchoolSports, thumbnailArr, highSchoolSportsArticleURLS);

  // Populating GLOBAL object of subcategorized URLS.
  subcategoriesObj["CRIME"] = Array.from(crimeArticleURLS);
  subcategoriesObj["GOVERNMENT"] = Array.from(govArticleURLS);
  subcategoriesObj["EDUCATION"] = Array.from(edArticleURLS);
  subcategoriesObj["LOCAL NEWS"] = Array.from(localNewsArticleURLS);
  subcategoriesObj["HIGH SCHOOL SPORTS"] = Array.from(
    highSchoolSportsArticleURLS
  );
  subcategoriesObj["LOCAL SPORTS"] = Array.from(localSportsArticleURLS);

  // Array of unique article URLS to return.
  let articleURLS = [
    ...crimeArticleURLS,
    ...govArticleURLS,
    ...edArticleURLS,
    ...localNewsArticleURLS,
    ...localSportsArticleURLS,
    ...highSchoolSportsArticleURLS,
  ];

  // Filtering out DB URLS.
  console.log("Filtering...");
  const filteredArticleURLS = await filterURLS(articleURLS, dbURLS);
  if (!filteredArticleURLS) {
    console.error("Failed to filter URLS. Shutting down Scraper.");
    return false;
  }

  return [filteredArticleURLS, thumbnailArr];
};

// @ desc Scrapes The Turlock Journal
// @ returns updated Scraped data object with new scraped data.
const turlockJournalScraper = async (dbURLS) => {
  const articles = [];

  // Getting article URLS.
  let urls;
  let thumbnails;
  const [resURLS, resThumbnails] = await getTurlockURLS(dbURLS);
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
  console.log("Got all article DOMS, Scraping Data... ");

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
    const publisher = "Turlock Journal";
    const heading = $("div.anvil-article__title").text();
    const subHeading = $("div.anvil-article__subtitle").text().trim() || null;
    const author = jsonData.page_meta.author || paragraphs[0];
    const date = jsonData.page_meta.page_created_at_pretty;
    const datetime = moment(jsonData.page_created_at).toDate();
    const image = { src: $image.attr("src"), alt: $image.attr("alt") };
    const [category, subcategory] = getCategories(source);

    // Saving data to an object I will push to the array of objects.
    objectToPush["source"] = source;
    objectToPush["publisher"] = publisher;
    objectToPush["heading"] = heading.trim();
    objectToPush["subHeading"] = subHeading;
    objectToPush["category"] = category;
    objectToPush["subcategory"] = subcategory;
    objectToPush["author"] = author;
    objectToPush["date"] = datetime.toDateString();
    objectToPush["datetime"] = datetime;
    objectToPush["img"] = image ? image : { src: null, alt: null };
    objectToPush["thumbnail"] = thumbnails[i]
      ? thumbnails[i]
      : { src: null, alt: null };
    objectToPush["paragraphs"] = paragraphs;
    objectToPush["business_id"] = null;

    articles.push(objectToPush);
  }
  return articles;
};

// Populates URL Sets and thumbnails array according to cheerio obj passed in.
function getURLS($, thumbnailArr, addTo) {
  // Gets URLS and thumbnails for articles.
  $("a.anvil-images__image-container").each((i, element) => {
    const anchor = $(element);
    addTo.add(anchor.attr("href"));
    const $thumbnail = anchor.find("img.anvil-images__image--main-article");
    const { src, alt } = $thumbnail.attr();
    const thumbnail = { src, alt };
    thumbnailArr.push(thumbnail);
  });
}

// @ Desc gets categories from url.
// @ Returns category string.
function getCategories(source) {
  // Getting Categories.
  let category = "";
  let subcategory = "";
  if (subcategoriesObj["CRIME"].includes(source)) {
    category = "NEWS";
    subcategory = "CRIME";
  } else if (subcategoriesObj["GOVERNMENT"].includes(source)) {
    category = "NEWS";
    subcategory = "GOVERNMENT";
  } else if (subcategoriesObj["EDUCATION"].includes(source)) {
    category = "NEWS";
    subcategory = "EDUCATION";
  } else if (subcategoriesObj["LOCAL NEWS"].includes(source)) {
    category = "NEWS";
    subcategory = "LOCAL NEWS";
  } else if (subcategoriesObj["LOCAL SPORTS"].includes(source)) {
    category = "SPORTS";
    subcategory = "LOCAL SPORTS";
  } else {
    category = "SPORTS";
    subcategory = "HIGH SCHOOL SPORTS";
  }

  return [category, subcategory];
}

module.exports = { turlockJournalScraper };
