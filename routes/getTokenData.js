const Router = require('express').Router;
const Token = require('../models/token.schema.js');

const router = Router();

router.get('/getTokenData', async (req, res) => {
    let tokenName =req.query.tokenName;
    // fetching the token data from the database
    try{
        const token = await Token.findOne({ token: tokenName});
        if (!token) {
            return res.status(404).json({ message: 'Token not found' });
        }
        res.status(200).json(token);
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
    }
});


module.exports = router;