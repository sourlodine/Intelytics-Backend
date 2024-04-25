require('dotenv').config();
const connectDB = require('./db');
const {getTokenData,getCurrentPrice,getDataByInterval} = require('./routes');
const cors = require('cors');

const express = require('express');
const app = express();
app.use(cors({
    origin: 'https://www.intelytics.net',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Connect to the database
connectDB();

const PORT= process.env.PORT || 3000;

// enable json parsing 
app.use(express.json());
app.use('/api', getTokenData);
app.use('/api', getCurrentPrice);
app.use('/api', getDataByInterval);

app.use('/', (req, res) => {
    res.send('Welcome to the Intelytics API');
});

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});

// for vercel
module.exports = app;