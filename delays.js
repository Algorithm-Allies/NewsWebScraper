// Makes fetch request with a small delay of 1 to 3 seconds.
const smallFetchDelay = async (url) => {
  const delay = Math.floor(Math.random() * 3) + 1;
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  return fetch(url).then((response) => response.text());
};

// Makes fetch request with delay of 1 to 6 seconds.
const fetchDelay = async (url) => {
  const delay = Math.floor(Math.random() * 6) + 1;
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  return fetch(url).then((response) => response.text());
};

const fetchDelayTracy = async (url) => {
  const delay = Math.floor(Math.random() * 6) + 1;
  await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  return fetch(url, { signal: AbortSignal.timeout(10000) }).then((response) => {
    if (typeof response == "string") {
      return response;
    }
    return response.text();
  });
};

module.exports = {
  smallFetchDelay,
  fetchDelay,
  fetchDelayTracy,
};
