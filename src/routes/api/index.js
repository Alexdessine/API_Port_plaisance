const express = require('express');
const router = express.Router();

router.use('/catways', require('./catways'));
router.use('/catways/:catwayNumber/reservations', require('./reservations'));
router.use('/users', require('./users'));
router.use('/auth', require('./auth'));

const { checkJWT } = require('../../middlewares/private');

/* GET home page. */
router.get('/', async (req, res, next) => {
    res.status(200).json({
        name: process.env.APP_NAME,
        version: '1.0',
        status: 200,
        message: 'Bienvenue sur l\'API !'
    });
});

module.exports = router;
