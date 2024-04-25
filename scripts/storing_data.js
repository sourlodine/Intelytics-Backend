require("dotenv").config();
const INTERVAL = process.env.INTERVAL * 60 * 1000 || 5 * 60 * 1000;

const axios = require("axios");
const connectDB = require("../db");
const Token = require("../models/token.schema");
const winston = require("winston");
const fs = require("fs");
const tokenList = require("../tokenList");

// Create log directory if it doesn't exist
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configure the Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logDir}/combined.log` }),
  ],
});

// Function to fetch data from the API and store it in MongoDB
async function fetchDataAndStore() {
  try {
    tokenList.forEach(async (tokens) => {
      url = tokens.url;
      // Log fetching data
      // logger.info(`Fetching data for ${tokenName} from the API...`);
      // Fetch data from the API
      const response = await axios.get(url);
      const tokenData = response.data;

      const token = new Token({
        token: tokenData.pairs[0].baseToken.symbol,
        price: tokenData.pairs[0].priceUsd,
        liquidity: tokenData.pairs[0].liquidity.usd,
        volume: tokenData.pairs[0].volume,
        timestamp: new Date().toISOString(),
      });
      await token.save();
      // Store data in the database
    });
    // Log successful data storage
    logger.info("Data stored successfully.");
  } catch (error) {
    // Log errors
    logger.error(`Error fetching or storing data: ${error.message}`);
  }
}

// Connect to the database
connectDB();

// Fetch and store data initially
fetchDataAndStore();

// Schedule fetching and storing data every 5 minutes
setInterval(() => {
  // Log scheduling
  logger.info("Scheduling data fetch and store...");

  fetchDataAndStore();
}, INTERVAL);
