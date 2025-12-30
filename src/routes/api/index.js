const express = require('express');
const router = express.Router();

router.use('/catways', require('./catways'));
router.use('/catways/:catwayNumber/reservations', require('./reservations'));
router.use('/users', require('./users'));
router.use('/auth', require('./auth'));

module.exports = router;
