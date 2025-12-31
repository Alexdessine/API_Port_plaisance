const express = require('express');
const router = express.Router();

const optionalAuth = require('../../middlewares/optionalAuth');

// HOME "/" (page d'accueil)
router.get('/', optionalAuth, (req, res) => {
  if (req.isAuthenticated) return res.redirect('/dashboard');

  return res.render('index', {
    title: 'Accueil',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null,
    error: req.query.error || null,
  });
});

// Dashboard (monté sur /dashboard)
router.use('/dashboard', require('./dashboard'));

module.exports = router;
