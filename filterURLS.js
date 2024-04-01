function filterURLS(urls) {
  // TODO: Update line bellow to make GET req to db once endpoint is set up. Set to empty for now.
  const dbURLS = [];

  // If dbURLS is empty, return unfiltered urls array.
  if (dbURLS.length == 0) {
    return urls;
  }

  const hashmap = {};

  for (let i = 0; i < dbURLS.length; i++) {
    hashmap[dbURLS[i]] = true;
  }

  // If dbURLS truthy, filter out URLS we already have in db.
  const filteredURLS = urls.filter((url) => {
    return url in hashmap;
  });

  return filteredURLS;
}

module.exports = { filterURLS };
