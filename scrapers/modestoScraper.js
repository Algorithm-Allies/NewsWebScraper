const cheerio = require("cheerio");

// @ desc Scrapes The Modesto Bee for Article URLS.
// @ returns array of article URLS to scrape.
const getModestoURLS = async () => {
  // Arrays to populate with URLS and thumbnails.
  const articleURLS = [];
  const thumbnails = [];

  // URLS to scrape for article URLS
  const newsURL = "https://www.modbee.com/news/";
  const sportsURL = "https://www.modbee.com/sports/";

  // Getting DOM strings for each page.
  const newsPromise = fetch(newsURL).then((res) => res.text());
  const sportsPromise = fetch(sportsURL).then((res) => res.text());
  try {
    const [newsDOM, sportsDOM] = await Promise.all([
      newsPromise,
      sportsPromise,
    ]);
    const articleDOMS = newsDOM.concat(sportsDOM);
    const $ = cheerio.load(articleDOMS);
    $("a.image-link-macro").each((i, element) => {
      const anchor = $(element);
      articleURLS.push(anchor.attr("href"));
      thumbnails.push(anchor.find("img").attr("src"));
    });
    return [articleURLS, thumbnails];
  } catch (e) {
    console.log(`Failed to connect to modesto bee. Error: ${e.message}`);
    return;
  }
};

// @ desc Scrapes The Modesto Bee
// @ returns updated Scraped data object with new scraped data.
const modestoBeeScraper = async () => {
  // Creating an array to push articles into and return.
  const articles = [];

  // Getting article URLS and turning them into DOM strings.
  const [urls, thumbnails] = await getModestoURLS();
  const urlPromises = urls.map((url) => {
    return fetch(url).then((res) => res.text());
  });
  const articleDOMS = await Promise.all(urlPromises);

  // Iterating over each article DOM, creating article object, and pushing it to articles array.
  for (let i = 0; i < articleDOMS.length; i++) {
    const articleObject = {};

    // Creating a main cheerio object out of current url.
    const $ = cheerio.load(articleDOMS[i]);

    // Getting author.
    const author =
      $("div.byline").find("a").text().trim() ||
      $("div.byline").text().trim().split("\n")[0].trim() ||
      null;
    // Getting date.
    const date =
      $("time.update-date").text() || $("time.publish-date").text() || null;
    const thumbnail = thumbnails[i];

    // Getting Image.
    const image = {};
    image["src"] = $("img.responsive-image").eq(0).attr("srcset") || null;
    image["alt"] = $("img.responsive-image").eq(0).attr("alt") || null;

    // Getting Paragraphs.
    const paragraphs = [];
    $("article")
      .find("p")
      .each((i, element) => {
        const paragraph = $(element);
        if (paragraph.text().trim() !== "") {
          paragraphs.push(paragraph.text().trim());
        }
      });

    // Getting more data with one-liners.
    const source = urls[i];
    const publisher = "The Modesto Bee";
    const heading = $("h1.h1").text().trim();
    const subcategory = $("a.kicker").eq(0).text().trim();

    // Saving data to object.
    articleObject["source"] = source;
    articleObject["publisher"] = publisher;
    articleObject["heading"] = heading;
    articleObject["subheading"] = null;
    articleObject["category"] = getCategory(urls[i])[0];
    articleObject["subcategory"] = subcategory;
    articleObject["author"] = author;
    articleObject["date"] = date;
    articleObject["image"] = image;
    articleObject["thumbnail"] = thumbnail;
    articleObject["paragraphs"] = paragraphs;

    // Edge case: Some modesto articles had no title and were still being worked on.
    if (articleObject.heading) {
      articles.push(articleObject);
    }
  }
  // Returning articles array.
  return articles;
};

// @ Desc gets categories from url.
// @ Returns categories Array. Main category is index 0, sub is index 1.
function getCategory(url) {
  let category;
  let subCategory = "";

  if (url.includes("https://www.modbee.com/news/")) {
    category = "NEWS";
  } else {
    category = "SPORTS";
  }

  const subCategories = {
    "high-school": "HIGH SCHOOL SPORTS",
    "local-sports": "LOCAL SPORTS",
    college: "COLLEGE SPORTS",
    crime: "CRIME",
    government: "GOVERNMENT",
    education: "EDUCATION",
    local: "LOCAL NEWS",
  };

  let keys = subCategories.keys();
  for (let i = 0; i < keys.length; i++) {
    if (url.includes(keys[i])) {
      subCategory = subCategories[keys[i]];
    }
  }
  return [category, subCategory];
}

module.exports = { modestoBeeScraper };
