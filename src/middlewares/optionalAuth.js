const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        const tokenFromHeader =
            header && header.startsWith('Bearer ')
                ? header.slice(7) // <-- "Bearer " = 7 chars
                : null;

        const tokenFromCookie = req.cookies?.token;
        const token = tokenFromHeader || tokenFromCookie;

        if (!token) {
            req.isAuthenticated = false;
            return next();
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // récupère le user complet depuis Mongo (au moins firstname/email/lastLoginAt)
        const user = await User.findById(decoded.user._id).select('firstname name email lastLoginAt');

        if (!user) {
            req.isAuthenticated = false;
            return next();
        }

        req.isAuthenticated = true;
        req.user = user;          // <-- user Mongo complet
        req.auth = decoded;       // optionnel : garde le decoded si tu veux
        return next();
    } catch (e) {
        req.isAuthenticated = false;
        return next();
    }
};
