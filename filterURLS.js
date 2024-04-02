async function filterURLS(urls) {
  let attempts = 3;
  let dbURLS = [];

  // Attempting to fetch DB URLS a few times due to Render's cold start.
  while (attempts) {
    dbURLS = await fetch("https://valleynews.onrender.com/api/articles/urls")
      .then((res) => {
        attempts = 0;
        return res.json();
      })
      .catch((e) => {
        attempts -= 1;
        console.log(`Failed to fetch DB URLS, attempts left: ${attempts}`);
      });
  }

  // Checking for Db URLS.
  if (!dbURLS) {
    console.log("Failed to fetch DB URLS.");
    return false;
  }

  // Creating hashmap of URLS for constant time lookup.
  const hashmap = {};
  for (let i = 0; i < dbURLS.length; i++) {
    hashmap[dbURLS[i]["source"]] = true;
  }

  // Creating counter for filtered articles and getting array of filtered URLS.
  let filteredCount = 0;
  const filteredURLS = urls.filter((url) => {
    if (url in hashmap) {
      filteredCount += 1;
      return false;
    }
    return true;
  });

  console.log(`Filtered ${filteredCount} URLS already in DataBase`);
  return filteredURLS;
}

module.exports = { filterURLS };
