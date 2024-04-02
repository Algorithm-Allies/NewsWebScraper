async function filterURLS(urls, dbURLS) {
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
