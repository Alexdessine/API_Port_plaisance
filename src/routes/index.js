var express = require('express');
var router = express.Router();

const { checkJWT } = require('../middlewares/private');
const userRoute = require('../routes/users');
const authRoute = require('../routes/auth');
const optionalAuth = require('../middlewares/optionalAuth');



/* GET home page. */
router.get('/', optionalAuth, (req, res) => {
  res.render('index', {
    title: 'Accueil',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null
  });
});

router.use('/auth', authRoute);

router.use('/users', userRoute);

router.get('/dashboard', optionalAuth, (req, res) => {
  res.render('dashboard', {
    title: 'Accueil',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null
  });
});


module.exports = router;
