const Router = require("express").Router;
const Token = require("../models/token.schema.js");

const router = Router();

router.get("/getTokenData", async (req, res) => {
  let { token, start, end, range } = req.query;
  range = parseInt(range);
  // fetching the token data from the database
  try {
    console.info(
      `fetching chart data for token: ${token}, start: ${start}, end: ${end}, range: ${range}`
    );

    const priceFeeds = await findPrices({
      token,
      start,
      end,
    });

    const priceHistory = priceFeeds
      .map((feed) => {
        return {
          price: feed.price,
          volume: feed.volume.h24,
          ts: feed.timestamp.getTime(),
        };
      })
      .sort((price1, price2) => price1.ts - price2.ts);

    if (!priceHistory.length) return res.status(200).json([]);

    console.log(priceHistory);

    let candlePeriod = 60_000; // 1 min  default
    switch (range) {
      case 1:
        // default candle period
        break;
      case 5:
        candlePeriod = 300_000; // 5 mins
        break;
      case 15:
        candlePeriod = 1_800_000; // 30 mins
        break;
      case 60:
        candlePeriod = 3_600_000; // 1 hr
        break;
      case 120:
        candlePeriod = 7_200_000; // 2 hrs
        break;
    }

    let cdStart = Math.floor(priceHistory[0].ts / candlePeriod) * candlePeriod;
    let cdEnd =
      Math.floor(priceHistory[priceHistory.length - 1].ts / candlePeriod) *
      candlePeriod;

    console.log({ cdStart });
    console.log({ cdEnd });

    let cdFeeds = [];

    let pIndex = 0;
    for (
      let curCdStart = cdStart;
      curCdStart <= cdEnd;
      curCdStart += candlePeriod
    ) {
      let st = priceHistory[pIndex].price;
      let hi = priceHistory[pIndex].price;
      let lo = priceHistory[pIndex].price;
      let en = priceHistory[pIndex].price;
      let prevIndex = pIndex;
      for (; pIndex < priceHistory.length; pIndex++) {
        // break new candle data starts
        if (priceHistory[pIndex].ts >= curCdStart + candlePeriod) break;

        if (hi < priceHistory[pIndex].price) hi = priceHistory[pIndex].price;
        if (lo > priceHistory[pIndex].price) lo = priceHistory[pIndex].price;
        en = priceHistory[pIndex].price;
      }
      if (prevIndex !== pIndex)
        cdFeeds.push({
          open: st,
          high: hi,
          low: lo,
          close: en,
          time: curCdStart,
          volume: priceHistory[pIndex - 1].volume,
        });
    }

    res.status(200).json(cdFeeds);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const findPrices = async ({ token, start, end }) => {
  let query = {};

  if (token !== undefined) {
    query.token = token;
  }

  if (start !== undefined || end !== undefined) {
    query.$and = [];

    if (start !== undefined) {
      query.$and.push({ timestamp: { $gt: start } });
    }

    if (end !== undefined) {
      query.$and.push({ timestamp: { $lt: end } });
    }
  }

  console.dir({ query });
  // If no filters are provided, return all prices
  if (Object.keys(query).length === 0) {
    return await Token.find();
  }

  const prices = await Token.find(query);

  return prices;
};

// router.get("/getTokenData", async (req, res) => {
//   const { token, startDate, endDate, range } = req.query;
//   try {
//     console.info(
//       `fetching chart data for token: ${token}, startDate: ${startDate}, endDate: ${endDate}, range: ${range}`
//     );
//     const volumeType = range <= 5 ? "m5" : "h1";
//     const intervalInMilliseconds = range * 60 * 1000;

//     // Define the aggregation pipeline
//     const pipeline = [
//       {
//         $match: {
//           token,
//           timestamp: {
//             $gte: new Date(startDate || 0),
//             $lte: new Date(endDate || 9999999999999),
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           open: "$price",
//           high: "$price",
//           low: "$price",
//           close: "$price",
//           volume: `$volume.${volumeType}`,
//           timestamp: 1,
//         },
//       },
//       {
//         $group: {
//           _id: {
//             $toDate: {
//               $subtract: [
//                 { $toLong: { $toDate: "$timestamp" } },
//                 {
//                   $mod: [
//                     { $toLong: { $toDate: "$timestamp" } },
//                     intervalInMilliseconds,
//                   ],
//                 },
//               ],
//             },
//           },
//           open: { $first: "$open" },
//           high: { $max: "$high" },
//           low: { $min: "$low" },
//           close: { $last: "$close" },
//           volume: { $sum: "$volume" },
//         },
//       },
//       {
//         $sort: { _id: 1 }, // Sort by timestamp
//       },
//     ];

//     // Execute the aggregation pipeline
//     const result = await Token.aggregate(pipeline);

//     // Send the result as JSON
//     res.json(result);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

module.exports = router;
