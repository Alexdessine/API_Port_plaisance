const express = require('express');
const router = express.Router();

const optionalAuth = require('../../middlewares/optionalAuth');
const requireAuth = require('../../middlewares/requireAuth');

const Reservations = require('../../models/reservation');

router.get('/', optionalAuth, requireAuth, async (req, res) => {
    try {
        const now = new Date();

        const reservations = await Reservations.find().sort({ startDate: 1 });

        return res.render('dashboard/index', {
            title: 'Dashboard',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            today: now,
            reservations,
            error: null,
        });
    } catch (err) {
        return res.status(500).render('dashboard/index', {
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
