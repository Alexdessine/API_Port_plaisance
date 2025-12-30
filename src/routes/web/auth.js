const express = require('express');
const router = express.Router();

const authService = require('../../services/users'); // là où tu as exports.logout
const usersService = require('../../services/users');
const optionalAuth = require('../../middlewares/optionalAuth');

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'login'
    })
});

router.post('/login', usersService.authenticate);

router.get('/logout', authService.logout);

module.exports = router;
