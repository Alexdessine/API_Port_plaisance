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

// GET /dashboard / show /: id -> affiche le détail d'une réservation
router.get('/show/:id', optionalAuth, requireAuth, async (req, res) => {
    try {
        const reservation = await Reservations.findById(req.params.id);

        if (!reservation) {
            return res.status(404).render('dashboard/show', {
                title: 'Détail réservation',
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "Réservation introuvable",
            });
        }

        return res.render('dashboard/show', {
            title: 'Détail réservation',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: null,
        });
    } catch (err) {
        return res.status(500).render('dashboard/show', {
            title: 'Détail réservation',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: "Erreur serveur lors du chargement de la réservation",
        });
    }
});


// GET /dashboard/edit/:id -> formulaire d'édition d'une réservation
router.get('/edit/:id', optionalAuth, requireAuth, async (req, res) => {
    try {
        const reservation = await Reservations.findById(req.params.id);

        if (!reservation) {
            return res.status(404).render('dashboard/edit', {
                title: 'Modifier la réservation',
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: 'Réservation introuvable',
            });
        }

        return res.render('dashboard/edit', {
            title: 'Modifier la réservation',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: null,
        });
    } catch (err) {
        return res.status(500).render('dashboard/edit', {
            title: 'Modifier la réservation',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: 'Erreur serveur lors du chargement de la réservation',
        });
    }
});


module.exports = router;
