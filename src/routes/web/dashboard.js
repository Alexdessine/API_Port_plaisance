const express = require('express');
const router = express.Router();

const optionalAuth = require('../../middlewares/optionalAuth');
const requireAuth = require('../../middlewares/requireAuth');

const Reservations = require('../../models/reservation');
const mongoose = require("mongoose");

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

// GET /dashboard/edit/:id -> envoie du formulaire formulaire d'édition d'une réservation
router.patch("/reservations/:id", optionalAuth, requireAuth, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("dashboard/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: "ID réservation invalide",
        });
    }

    // champs autorisés à la modification
    const { clientName, boatName, startDate, endDate } = req.body;

    if (!clientName || !boatName || !startDate || !endDate) {
        // On recharge la réservation pour ré-afficher le formulaire
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("dashboard/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Tous les champs sont obligatoires",
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("dashboard/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Dates invalides (ex: 2025-02-12)",
        });
    }

    if (end < start) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("dashboard/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "La date de fin doit être après la date de début",
        });
    }

    try {
        // 1) récupérer la réservation actuelle (pour connaître catwayNumber)
        const current = await Reservations.findById(id);
        if (!current) {
            return res.status(404).render("dashboard/edit", {
                title: "Modifier réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "Réservation introuvable",
            });
        }

        // 2) vérifier chevauchement sur le même catway, en excluant la réservation courante
        const overlap = await Reservations.findOne({
            _id: { $ne: current._id },
            catwayNumber: current.catwayNumber,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).render("dashboard/edit", {
                title: "Modifier réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: current,
                error: "Conflit : une autre réservation existe déjà sur cette période pour ce catway",
            });
        }

        // 3) appliquer update
        current.clientName = clientName;
        current.boatName = boatName;
        current.startDate = start;
        current.endDate = end;

        await current.save();

        // 4) redirection vers la page show (à adapter selon ton routing)
        return res.redirect(`/dashboard/show/${current._id}`);
    } catch (err) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(500).render("dashboard/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Erreur serveur lors de la mise à jour",
        });
    }
});

// DELETE /dashboard/reservations/:id -> supprime une réservation puis redirige vers /dashboard
router.delete("/reservations/:id", optionalAuth, requireAuth, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("dashboard/index", {
            title: "Dashboard",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            today: new Date(),
            reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
            error: "ID réservation invalide",
        });
    }

    try {
        const result = await Reservations.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            // Rien supprimé -> réservation introuvable
            return res.status(404).render("dashboard/index", {
                title: "Dashboard",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                today: new Date(),
                reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
                error: "Réservation introuvable",
            });
        }

        return res.redirect("/dashboard");
    } catch (err) {
        return res.status(500).render("dashboard/index", {
            title: "Dashboard",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            today: new Date(),
            reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
            error: "Erreur serveur lors de la suppression",
        });
    }
});


module.exports = router;
