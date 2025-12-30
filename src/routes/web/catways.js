const express = require('express');
const router = express.Router();

const optionalAuth = require('../../middlewares/optionalAuth');
const requireAuth = require('../../middlewares/requireAuth');

const Catways = require('../../models/catway');
const mongoose = require("mongoose");

router.get('/', optionalAuth, requireAuth, async (req, res) => {
    try {

        const catways = await Catways.find().sort({ catwayNumber: 1 });

        return res.render('catways/index', {
            title: 'Catways',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways,
            error: null,
        });
    } catch (err) {
        return res.status(500).render('catways/index', {
            title: 'Catways',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways: [],
            error: "Erreur serveur lors du chargement des catways",
        });
    }
});

// GET /dashboard/add -> formulaire d'ajout d'une réservation
router.get("/add", optionalAuth, requireAuth, (req, res) => {
    return res.render("dashboard/add", {
        title: "Ajouter une réservation",
        isAuthenticated: req.isAuthenticated,
        user: req.user || null,
        error: null,
        form: {
            catwayNumber: "",
            clientName: "",
            boatName: "",
            startDate: "",
            endDate: "",
        },
    });
});

// POST /dashboard/reservations -> création d'une réservation
router.post("/reservations", optionalAuth, requireAuth, async (req, res) => {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;

    const form = { catwayNumber, clientName, boatName, startDate, endDate };

    const num = Number(catwayNumber);
    if (Number.isNaN(num)) {
        return res.status(400).render("dashboard/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "catwayNumber doit être un nombre",
            form,
        });
    }

    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).render("dashboard/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Tous les champs sont obligatoires",
            form,
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).render("dashboard/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Dates invalides (ex: 2025-02-12)",
            form,
        });
    }

    if (end < start) {
        return res.status(400).render("dashboard/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "La date de fin doit être après la date de début",
            form,
        });
    }

    try {
        // chevauchement si existing.startDate <= newEnd ET existing.endDate >= newStart
        const overlap = await Reservations.findOne({
            catwayNumber: num,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).render("dashboard/add", {
                title: "Ajouter une réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                error: "Conflit : une réservation existe déjà sur cette période pour ce catway",
                form,
            });
        }

        const created = await Reservations.create({
            catwayNumber: num,
            clientName,
            boatName,
            startDate: start,
            endDate: end,
        });

        return res.redirect(`/dashboard/show/${created._id}`);
    } catch (err) {
        return res.status(500).render("dashboard/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Erreur serveur lors de la création",
            form,
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
