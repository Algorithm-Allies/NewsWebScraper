function filterURLS(urls) {
  // TODO: Update line bellow to make GET req to db once endpoint is set up. Set to empty for now.
  const dbURLS = [];

  // If dbURLS is empty, return unfiltered urls array.
  if (dbURLS.length == 0) {
    return urls;
  }

  // If dbURLS truthy, filter out URLS we already have in db.
  urls.filter((url) => {
    return !dbURLS.includes(url);
  });
}

module.exports = { filterURLS };
