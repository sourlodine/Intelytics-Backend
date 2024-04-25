const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    price: [{
        type: Number,
        required: true
    }],
    liquidity: [{
        type: Number,
        required: true
    }],
    volume:[{
        h24: {
            type: Number,
            required: true
        },
        h6: {
            type: Number,
            required: true
        },
        h1: {
            type: Number,
            required: true
        },
        m5: {
            type: Number,
            required: true
        }
    }],
    timestamp: [{
        type: Date,
        required: true
    }]
});

module.exports = mongoose.model('Token', TokenSchema);
