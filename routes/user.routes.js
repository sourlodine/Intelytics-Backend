const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.schema');
const router = express.Router();


// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(400).send(error.message);
    }
});



// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Invalid Credentials');
        }
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();
        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).send(error.message);
    }
});



// Token Refresh Route
router.post('/token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);
    const user = await User.findOne({ refreshToken }).exec();
    if (!user) return res.sendStatus(403); // Forbidden

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(403); 
        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    });
});


// Logout Route
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshToken }).exec();
    if (user) {
        user.refreshToken = null;
        await user.save();
    }
    res.sendStatus(204);
});

module.exports = router;