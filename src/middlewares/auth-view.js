const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.injectUserIfAny = async (req, res, next) => {
    const token = req.cookies?.token;

    // valeurs par défaut
    req.isAuthenticated = false;
    req.user = null;

    res.locals.isAuthenticated = false;
    res.locals.user = null;

    if (!token) return next();

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(payload.user._id).select('-password -__v');

        req.isAuthenticated = !!user;
        req.user = user || null;

        res.locals.isAuthenticated = !!user;
        res.locals.user = user || null;
        res.locals.auth = payload;

        return next();
    } catch (e) {
        return next();
    }
};
