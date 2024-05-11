async function getDataBaseURLS() {
  let attempts = 3;
  let dbURLS = false;

  // Attempting to fetch DB URLS a few times due to Render's cold start.
  while (attempts) {
    dbURLS = await fetch(process.env.API_URL)
      .then((res) => {
        if (res.ok) {
          attempts = 0;
          return res.json();
        }
        attempts -= 1;
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

  return dbURLS;
}

module.exports = { getDataBaseURLS };
