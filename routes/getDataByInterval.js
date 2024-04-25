const Router = require("express").Router;
const router = Router();
const Token = require("../models/token.schema.js");


// Helper function to get every nth element from arrays
function getNthElements(data, n) {
  return {
      price: data.price.filter((_, index) => index % n === 0),
      liquidity: data.liquidity.filter((_, index) => index % n === 0),
      volume: data.volume.filter((_, index) => index % n === 0),
      timestamp: data.timestamp.filter((_, index) => index % n === 0)
  };
}

// API Endpoints
router.get('/getDataByInterval/:tokenSymbol/:interval', async (req, res) => {
  try {
      const { tokenSymbol, interval } = req.params;
      const tokenData = await Token.findOne({ token: tokenSymbol }); // Find the data for the specified token

      if (!tokenData) {
          return res.status(404).send('Token data not found');
      }

      let result;
      switch (interval) {
          case '5m':
              // Return all data
              result = tokenData;
              break;
          case '1h':
              // Return every 12th data point
              result = getNthElements(tokenData, 12);
              break;
          case '24h':
              // Return every 288th data point
              result = getNthElements(tokenData, 288);
              break;
          default:
              return res.status(400).send('Invalid interval');
      }
      res.json(result);
  } catch (error) {
      res.status(500).send(error.message);
  }
});


module.exports = router;
