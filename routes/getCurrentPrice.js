const Router = require('express').Router;
const router = Router();
const TokenList = require('../tokenList')
const axios = require('axios');

router.get('/getCurrentPrice', async (req, res) => {
    let tokenName =req.query.tokenName;
    // checking the token name for the tokenList and getting the endpoint url and fetching the data from the endpoint
    const token = TokenList.find((token) => token.name === tokenName);
    if (!token) {
        return res.status(404).json({ message: 'Token not found' });
    }
    // fetching the token data from the endpoint
    try{
        const response = await axios.get(token.url);
        let tokenData = response.data;
        let currentPrice = tokenData.pairs[0].priceUsd
        res.status(200).json({
            token: tokenName,
            price: currentPrice
        }); 
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
    }
});

module.exports = router;

