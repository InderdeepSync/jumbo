
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({"status": "ACCESS_DENIED"});
        }

        req.userId = decoded.userId;
        next();
    });
}

module.exports = {authenticateToken}