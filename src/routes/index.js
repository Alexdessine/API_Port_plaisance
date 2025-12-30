var express = require('express');
var router = express.Router();

const userRoute = require('../routes/users');
const authRoute = require('../routes/auth');

const optionalAuth = require('../middlewares/optionalAuth'); // inject user if any
const requireAuth = require('../middlewares/requireAuth');

const Reservations = require('../models/reservation');


router.get('/', optionalAuth, (req, res) => {
  if (req.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  res.render('index', {
    title: 'Accueil',
    isAuthenticated: req.isAuthenticated,
    user: req.user || null,
    error: null,
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);

router.get('/dashboard', optionalAuth, requireAuth, async (req, res) => {
  try {
    const now = new Date();

    const reservations = await Reservations.find().sort({ startDate: 1 });

    return res.render('dashboard', {
      title: 'Dashboard',
      isAuthenticated: req.isAuthenticated,
      user: req.user || null,
      today: now,
      reservations,
    });
  } catch (err) {
    return res.status(500).render('dashboard', {
      title: 'Dashboard',
      isAuthenticated: req.isAuthenticated,
      user: req.user || null,
      today: new Date(),
      reservations: [],
      error: "Erreur serveur lors du chargement des réservations",
    });
  }
});

module.exports = router;
