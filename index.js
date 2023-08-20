const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

const secretKey = 'your-secret-key'; // Change this to your own secret key

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '30s' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// Logout (not a standard JWT operation, just an example)
app.get('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

app.get('/watch-later', authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // This value is set in the authenticateToken middleware
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ username: user.username, email: user.email });
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
