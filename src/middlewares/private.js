const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

// Méthode pour faire fonctionner le cookie avec le JWT
exports.checkJWT = (req, res, next) => {
    const header = req.headers.authorization;
    const tokenFromHeader = header && header.startsWith('Bearer ') ? header.slice(7) : null;
    const tokenFromCookie = req.cookies?.token;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) return res.status(401).json('token_required');

    try {
        req.auth = jwt.verify(token, SECRET_KEY);
        return next();
    } catch (e) {
        return res.status(401).json('token_not_valid');
    }
};