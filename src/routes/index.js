var express = require('express');
var router = express.Router();

const userRoute = require('../routes/users');
const authRoute = require('../routes/auth');

const optionalAuth = require('../middlewares/optionalAuth'); // inject user if any
const requireAuth = require('../middlewares/requireAuth');

router.get('/', optionalAuth, (req, res) => {
  res.render('index', {
    title: 'Accueil',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);

router.get('/dashboard', optionalAuth, requireAuth, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null
  });
});

module.exports = router;
