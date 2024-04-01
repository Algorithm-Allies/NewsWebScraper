const cheerio = require("cheerio");
const moment = require("moment");

// Global Variable //
const subcategoriesObj = {};

// @ desc Scrapes Oakdale Leader for article URLS.
// @ returns URLS and Thumbnail objects.
const getOakdaleURLS = async () => {
  console.log("Scraping the Oakdale Leader");

  // Arrays to return.
  const thumbnailArr = [];

  // Creating sets to populate with unique URLS.
  const crimeArticleURLS = new Set();
  const govArticleURLS = new Set();
  const edArticleURLS = new Set();
  const localNewsArticleURLS = new Set();
  const localSportsArticleURLS = new Set();

  // Main URLS to scrape.
  const crimeURL = "https://www.oakdaleleader.com/news/crime";
  const govURL = "https://www.oakdaleleader.com/news/government";
  const edURL = "https://www.oakdaleleader.com/news/education";
  const localNewsURL = "https://www.oakdaleleader.com/news/local-news";
  const localSportsURL = "https://www.oakdaleleader.com/sports/local-sports-2";

  // Variables to reasign depending on if using Proxy.
  let crimePromise;
  let govPromise;
  let edPromise;
  let localNewsPromise;
  let localSportsPromise;
  // Getting Category DOMS
  console.log("Fetching Category DOMS ");
  crimePromise = fetch(crimeURL).then((res) => res.text());
  govPromise = fetch(govURL).then((res) => res.text());
  edPromise = fetch(edURL).then((res) => res.text());
  localNewsPromise = fetch(localNewsURL).then((res) => res.text());
  localSportsPromise = fetch(localSportsURL).then((res) => res.text());
  const [crimeDOM, govDOM, edDOM, localNewsDOM, localSportsDOM] =
    await Promise.all([
      crimePromise,
      govPromise,
      edPromise,
      localNewsPromise,
      localSportsPromise,
    ]);
  console.log("Got all Category DOMS");

  // Creating cheerio objects out of DOM strings.
  const $crime = cheerio.load(crimeDOM);
  const $gov = cheerio.load(govDOM);
  const $ed = cheerio.load(edDOM);
  const $localNews = cheerio.load(localNewsDOM);
  const $localSports = cheerio.load(localSportsDOM);

  // Populating Sets with URLS, and populating thumbnailArr.
  getURLS($crime, thumbnailArr, crimeArticleURLS);
  getURLS($gov, thumbnailArr, govArticleURLS);
  getURLS($ed, thumbnailArr, edArticleURLS);
  getURLS($localNews, thumbnailArr, localNewsArticleURLS);
  getURLS($localSports, thumbnailArr, localSportsArticleURLS);

  // Populating GLOBAL object of subcategorized URLS.
  subcategoriesObj["CRIME"] = Array.from(crimeArticleURLS);
  subcategoriesObj["GOVERNMENT"] = Array.from(govArticleURLS);
  subcategoriesObj["EDUCATION"] = Array.from(edArticleURLS);
  subcategoriesObj["LOCAL NEWS"] = Array.from(localNewsArticleURLS);
  subcategoriesObj["LOCAL SPORTS"] = Array.from(localSportsArticleURLS);

  // Creating articles array to return.
  let articleURLS = [
    ...crimeArticleURLS,
    ...govArticleURLS,
    ...edArticleURLS,
    ...localNewsArticleURLS,
    ...localSportsArticleURLS,
  ];

  return [articleURLS, thumbnailArr];
};

// @ desc Scrapes Oakdale Leader
// @ returns updated Scraped data object with new scraped data.
const oakdaleLeaderScraper = async () => {
  const articles = [];

  // Getting article URLS.
  let urls;
  let thumbnails;
  const [resURLS, resThumbnails] = await getOakdaleURLS(true);
  urls = resURLS;
  thumbnails = resThumbnails;
  console.log("Got all article URLS");

  // Getting article DOMS
  let URLpromises;
  console.log("Getting article DOMS ");
  URLpromises = urls.map((url) => {
    return fetch(url).then((res) => res.text());
  });

  const articleDOMS = await Promise.all(URLpromises);
  console.log("Got all article DOMS, Scraping data... ");

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
    const [category, subcategory] = getCategories(source);
    const publisher = "Oakdale Leader";
    const heading = $("div.anvil-article__title").text();
    const subHeading = $("div.anvil-article__subtitle").text().trim() || null;
    const author = jsonData.page_meta.author || paragraphs[0];
    const date = jsonData.page_meta.page_created_at_pretty;
    const datetime = moment(jsonData.page_created_at).toDate();
    const image = { src: $image.attr("src"), alt: $image.attr("alt") };

    // Saving data to an object I will push to the array of objects.
    objectToPush["source"] = source;
    objectToPush["publisher"] = publisher;
    objectToPush["heading"] = heading.trim();
    objectToPush["subHeading"] = subHeading;
    objectToPush["category"] = category;
    objectToPush["subcategory"] = subcategory;
    objectToPush["author"] = author;
    objectToPush["date"] = date;
    objectToPush["datetime"] = datetime;
    objectToPush["img"] = image;
    objectToPush["thumbnail"] = thumbnails[i];
    objectToPush["paragraphs"] = paragraphs;

    articles.push(objectToPush);
  }
  return articles;
};

// Populates URL Sets and thumbnails array according to cheerio obj passed in.
function getURLS($, thumbnailArr, toAdd) {
  // Gets URLS and thumbnails for articles.
  $("a.anvil-images__image-container").each((i, element) => {
    const anchor = $(element);
    toAdd.add(anchor.attr("href"));
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
  } else {
    category = "SPORTS";
    subcategory = "LOCAL SPORTS";
  }

  return [category, subcategory];
}

module.exports = { oakdaleLeaderScraper };
