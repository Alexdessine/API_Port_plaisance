const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.injectUserIfAny = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
        return next();
    }

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);

        // payload.user contient {_id, email} + payload.loginAt
        const user = await User.findById(payload.user._id).select('-password -__v');

        res.locals.isAuthenticated = !!user;
        res.locals.user = user || null;
        res.locals.auth = payload; // utile pour logout
        return next();
    } catch (e) {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
        return next();
    }
};
