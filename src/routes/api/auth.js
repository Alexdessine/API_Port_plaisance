const express = require('express');
const router = express.Router();
const usersService = require('../../services/users');
const optionalAuth = require('../../middlewares/optionalAuth');

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'login'
    })
});

router.post('/login', usersService.authenticate);

router.get('/logout', optionalAuth, usersService.logout);

module.exports = router;