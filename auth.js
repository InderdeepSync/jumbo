
const express = require('express');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {prisma} = require("./db")
const {isValidEmail} = require("./utils")

const secretKey = process.env.SECRET_KEY; // Change this to your own secret key
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Check if a user with the same email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.json({ message: `New User ${user.email} registered successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An Unexpected Error occurred' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: `User ${email} does not exist.` });
        }

        const doesPasswordMatch = await bcrypt.compare(password, user.password);

        if (!doesPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30s' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An Unexpected Error occurred' });
    }
});

// Logout (nothing to do here)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
