const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const secretKey = 'your-secret-key'; // Change this to your own secret key

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Register a new user
app.post('/register', async (req, res) => {
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

// Login
app.post('/login', async (req, res) => {
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

// Logout (not a standard JWT operation, just an example)
app.get('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

app.get('/watch-later', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // This value is set in the authenticateToken middleware

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.userId = decoded.userId;
        next();
    });
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
