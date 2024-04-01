require("dotenv").config();
const { HttpsProxyAgent } = require("https-proxy-agent");

// Array of proxy objects
const proxies = [
  { ip: process.env.PROXY_IP_1, port: process.env.PORT_1 },
  { ip: process.env.PROXY_IP_2, port: process.env.PORT_2 },
  { ip: process.env.PROXY_IP_3, port: process.env.PORT_3 },
  { ip: process.env.PROXY_IP_4, port: process.env.PORT_4 },
  { ip: process.env.PROXY_IP_5, port: process.env.PORT_5 },
  { ip: process.env.PROXY_IP_6, port: process.env.PORT_6 },
  { ip: process.env.PROXY_IP_7, port: process.env.PORT_7 },
  { ip: process.env.PROXY_IP_8, port: process.env.PORT_8 },
  { ip: process.env.PROXY_IP_9, port: process.env.PORT_9 },
  { ip: process.env.PROXY_IP_10, port: process.env.PORT_10 },
];

const headers = [
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-us",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Android 10; Mobile; rv:88.0) Gecko/88.0 Firefox/88.0",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.818.62 Safari/537.36 Edg/90.0.818.46",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36 OPR/60.0.3255.170",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Language": "en-US,en;q=0.9",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
    Accept: "text/html, application/xhtml+xml, image/jxr, */*",
    "Accept-Language": "en-US,en;q=0.5",
  },
];

// Function to pick a random proxy object from list.
function getRandomIndex() {
  const randIndex = Math.floor(Math.random() * proxies.length);
  return randIndex;
}

// Function to make fetch request using random proxy.
async function fetchWithProxy(url) {
  try {
    const delay = Math.floor(Math.random() * 10) + 1;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    const index = getRandomIndex();

    const ip = proxies[index].ip;
    const port = proxies[index].port;
    const header = headers[index];

    const proxyAgent = new HttpsProxyAgent(`https://${ip}:${port}`);

    const response = await fetch(url, {
      headers: header,
      agent: proxyAgent,
      method: "GET",
      cache: "no-cache",
      signal: AbortSignal.timeout(15000),
    });
    return await response.text();
  } catch (e) {
    console.error("Proxy Request  Failed:", e);
  }
}

// Function to make fetch request using random proxy.
async function fetchWithProxyTracy(url) {
  try {
    const delay = Math.floor(Math.random() * 10) + 1;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    const index = getRandomIndex();

    const ip = proxies[index].ip;
    const port = proxies[index].port;
    const header = headers[index];

    const proxyAgent = new HttpsProxyAgent(`https://${ip}:${port}`);

    const response = await fetch(url, {
      headers: header,
      agent: proxyAgent,
      method: "GET",
      cache: "no-cache",
      signal: AbortSignal.timeout(15000),
    });
    if (typeof response == "string") {
      return response;
    }
    return response.text();
  } catch (e) {
    console.error("Proxy Request  Failed:", e);
  }
}

module.exports = { fetchWithProxy, fetchWithProxyTracy };
