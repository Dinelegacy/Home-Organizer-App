const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authRequired(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please log in to continue" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Your session has expired. Please log in again" });
    }
}

module.exports = authRequired; 