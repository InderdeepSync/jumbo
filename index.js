const express = require('express');

const app = express();
app.use(express.json());

const authRouter = require("./auth")
app.use("/", authRouter)

const {authenticateToken} = require("./middleware");

app.get('/watch-later', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // This value is set in the authenticateToken middleware
        res.json({ "aa": 1 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
