const cheerio = require("cheerio");
const { fetchWithProxy, fetchWithProxyTracy } = require("../proxyFetch");
const moment = require("moment");

const {
  startSpinner,
  stopSpinner,
  smallFetchDelay,
  fetchDelay,
  fetchDelayTracy,
} = require("../delays");

// GLOBAL VARS FOR CATEGORIZING ARTICLES //
subcategoriesObj = {};

// @ Desc scrapes tracy press for article urls.
const getTracyURLS = async (proxy = false) => {
  console.log("Scraping The Tracy Press");

  // Creating sets to populate with unique URLS.
  const crimeArticleURLS = new Set();
  const govArticleURLS = new Set();
  const edArticleURLS = new Set();
  const localNewsArticleURLS = new Set();
  const localSportsArticleURLS = new Set();
  const highSchoolSportsArticleURLS = new Set();

  // URLS to scrape.
  const crimeNewsURL =
    "https://www.ttownmedia.com/tracy_press/news/law_and_order/";
  const govNewsURL =
    "https://www.ttownmedia.com/tracy_press/news/election_coverage/";
  const educationNewsURL =
    "https://www.ttownmedia.com/tracy_press/news/schools/";
  const localNewsURL = "https://www.ttownmedia.com/tracy_press/news/city/";
  const localSportsURL =
    "https://www.ttownmedia.com/tracy_press/sports/local_sports";
  const highSchoolSportsURL =
    "https://www.ttownmedia.com/tracy_press/sports/prep_sports";

  // Variables to reasign depending on if proxy is used.
  let crimePromise;
  let govPromise;
  let edPromise;
  let localNewsPromise;
  let localSportsPromise;
  let highSchoolSportsPromise;

  // Getting Category DOMS.
  console.log("Fetching Category DOMS ");
  startSpinner();
  crimePromise = fetchDelay(crimeNewsURL);
  govPromise = fetchDelay(govNewsURL);
  edPromise = fetchDelay(educationNewsURL);
  localNewsPromise = fetchDelay(localNewsURL);
  localSportsPromise = fetchDelay(localSportsURL);
  highSchoolSportsPromise = fetchDelay(highSchoolSportsURL);
  const [
    crimeDOM,
    govDOM,
    edDOM,
    localNewsDOM,
    highSchoolSportsDOM,
    localSportsDOM,
  ] = await Promise.all([
    crimePromise,
    govPromise,
    edPromise,
    localNewsPromise,
    highSchoolSportsPromise,
    localSportsPromise,
  ]);
  stopSpinner();
  console.log("Got all Category DOMS");

  // Creating cheerio object out of DOM strings.
  const $crime = cheerio.load(crimeDOM);
  const $gov = cheerio.load(govDOM);
  const $ed = cheerio.load(edDOM);
  const $localNews = cheerio.load(localNewsDOM);
  const $highSchoolSports = cheerio.load(highSchoolSportsDOM);
  const $localSports = cheerio.load(localSportsDOM);

  // Getting URLS.
  getURLS($crime, crimeArticleURLS);
  getURLS($gov, govArticleURLS);
  getURLS($ed, edArticleURLS);
  getURLS($localNews, localNewsArticleURLS);
  getURLS($highSchoolSports, highSchoolSportsArticleURLS);
  getURLS($localSports, localSportsArticleURLS);

  // Populating GLOBAL object of subcategorized URLS.
  subcategoriesObj["CRIME"] = Array.from(crimeArticleURLS);
  subcategoriesObj["GOVERNMENT"] = Array.from(govArticleURLS);
  subcategoriesObj["EDUCATION"] = Array.from(edArticleURLS);
  subcategoriesObj["LOCAL NEWS"] = Array.from(localNewsArticleURLS);
  subcategoriesObj["HIGH SCHOOL SPORTS"] = Array.from(
    highSchoolSportsArticleURLS
  );
  subcategoriesObj["LOCAL SPORTS"] = Array.from(localSportsArticleURLS);

  // Returning array of unique articles URLS.
  let articleURLS = [
    ...crimeArticleURLS,
    ...govArticleURLS,
    ...edArticleURLS,
    ...localNewsArticleURLS,
    ...highSchoolSportsArticleURLS,
    ...localSportsArticleURLS,
  ];
  let uniqueURLS = new Set(articleURLS);
  let uniqueURLSArray = Array.from(uniqueURLS);
  return uniqueURLSArray;
};

// @ desc Scrapes Oakdale Leader
// @ returns updated Scraped data object with new scraped data.
const tracyPressScraper = async (proxy = false) => {
  const articles = [];

  // Getting article URLS.
  let urls;
  urls = await getTracyURLS();

  console.log("Got all article URLS");

  // Getting Article DOMS
  let URLpromises;
  console.log("Fetching article DOMS ");
  startSpinner();
  URLpromises = urls.map((url) => {
    return fetchWithProxyTracy(url);
  });
  const articleDOMS = await Promise.all(URLpromises);
  stopSpinner();
  console.log("Got all article DOMS, Scraping Data... ");
  startSpinner();
  // Iterating over urls, turning them to article objects, and pushing them to articles array.
  for (let i = 0; i < articleDOMS.length; i++) {
    // Creating article object and main cheerio object.
    const objectToPush = {};
    const $ = cheerio.load(articleDOMS[i]);

    // Getting author.
    const author =
      $("div.asset-masthead")
        .find("ul.list-inline")
        .find("span.tnt-byline")
        .text()
        .trim() || "The Tracy Press";

    // Getting date.
    const date = $("div.meta")
      .find("span")
      .find("ul")
      .find("li.hidden-print")
      .find("time")
      .text()
      .trim();
    let datetime;
    try {
      datetime = $("div.meta")
        .find("span")
        .find("ul")
        .find("li.visible-print")
        .find("time")
        .attr("datetime");
      datetime = moment(datetime).toDate();
    } catch {
      datetime = null;
    }

    // Getting Image.
    const src = $("div.image").find("div").children().eq(2).attr("content");
    const alt = $("div.image").find("div").children().find("img").attr("alt");
    const image = { src, alt };

    // Getting paragraphs.
    let paragraphs = [];

    $("div.asset-content")
      .find("p")
      .each((i, element) => {
        const paragraph = $(element).text().trim();
        paragraphs.push(paragraph);
      });

    // Getting the source, category, and subcategory.
    const source = urls[i];
    const [category, subcategory] = getCategories(source);

    // Getting more data, single-liners.
    const publisher = "The Tracy Press";
    const heading = $("h1.headline").find("span").text().trim();

    // Saving data to an object I will push to the array of objects.
    objectToPush["source"] = source;
    objectToPush["publisher"] = publisher;
    objectToPush["heading"] = heading;
    objectToPush["subHeading"] = null;
    objectToPush["category"] = category;
    objectToPush["subcategory"] = subcategory;
    objectToPush["author"] = author;
    objectToPush["date"] = date;
    objectToPush["datetime"] = datetime;
    objectToPush["img"] = image.src ? image : null;
    objectToPush["thumbnail"] = image.src ? image : null;
    objectToPush["paragraphs"] = paragraphs;

    // Pushing object to articles array.
    if (objectToPush.paragraphs.length != 0) {
      articles.push(objectToPush);
    }
  }
  stopSpinner();
  return articles;
};

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

// Populates URL SETS based on cheerio object passed in.
function getURLS($, addTo) {
  $("div.card-container")
    .find("a.tnt-asset-link")
    .each((i, element) => {
      const $anchor = $(element);
      const url = $anchor.attr("href").includes("https://ttownmedia.com")
        ? $anchor.attr("href")
        : "https://www.ttownmedia.com" + $anchor.attr("href");
      addTo.add(url);
    });
}

module.exports = { tracyPressScraper };
