const express = require("express");
const { scrapeData } = require("./scrapeData"); // Import the scrapeData function

const app = express();
const port = process.env.PORT || 3000;

// Define a route for triggering scraping
app.get("/scrape", async (req, res) => {
  try {
    const articles = await scrapeData(); // Call the scrapeData function when the endpoint is hit
    res.json(articles); // Return the scraped data as JSON
  } catch (error) {
    console.error("Error initiating scraping:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/test", (req, res) => {
  res.send("Server is working!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
