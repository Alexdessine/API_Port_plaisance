const express = require("express");
const router = express.Router();

const optionalAuth = require("../../middlewares/optionalAuth");
const requireAuth = require("../../middlewares/requireAuth");

const Reservations = require("../../models/reservation");
const Catways = require("../../models/catway");
const mongoose = require("mongoose");

/**
 * Helpers
 */
function parsePositiveInt(value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) return null;
    return n;
}

function parseDate(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

/**
 * GET /reservations -> liste
 */
router.get("/", optionalAuth, requireAuth, async (req, res) => {
    try {
        const reservations = await Reservations.find().sort({ startDate: 1 });

        return res.render("reservations/index", {
            title: "Réservations",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservations,
            error: null,
        });
    } catch (err) {
        return res.status(500).render("reservations/index", {
            title: "Réservations",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservations: [],
            error: "Erreur serveur lors du chargement des réservations",
        });
    }
});

/**
 * GET /reservations/add -> formulaire
 */
router.get("/add", optionalAuth, requireAuth, (req, res) => {
    return res.render("reservations/add", {
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

/**
 * POST /reservations -> création
 */
router.post("/", optionalAuth, requireAuth, async (req, res) => {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    const form = { catwayNumber, clientName, boatName, startDate, endDate };

    const num = parsePositiveInt(catwayNumber);
    if (!num) {
        return res.status(400).render("reservations/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "catwayNumber doit être un entier positif",
            form,
        });
    }

    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).render("reservations/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Tous les champs sont obligatoires",
            form,
        });
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
        return res.status(400).render("reservations/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Dates invalides (ex: 2025-02-12)",
            form,
        });
    }

    if (end <= start) {
        return res.status(400).render("reservations/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "La date de fin doit être après la date de début",
            form,
        });
    }

    try {
        // catway doit exister
        const catwayExists = await Catways.findOne({ catwayNumber: num }).select("_id");
        if (!catwayExists) {
            return res.status(404).render("reservations/add", {
                title: "Ajouter une réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                error: `Catway ${num} introuvable`,
                form,
            });
        }

        // chevauchement
        const overlap = await Reservations.findOne({
            catwayNumber: num,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).render("reservations/add", {
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

        return res.redirect(`/reservations/show/${created._id}`);
    } catch (err) {
        return res.status(500).render("reservations/add", {
            title: "Ajouter une réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Erreur serveur lors de la création",
            form,
        });
    }
});

/**
 * GET /reservations/show/:id -> détail
 */
router.get("/show/:id", optionalAuth, requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).render("reservations/show", {
                title: "Détail réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "ID réservation invalide",
            });
        }

        const reservation = await Reservations.findById(id);

        if (!reservation) {
            return res.status(404).render("reservations/show", {
                title: "Détail réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "Réservation introuvable",
            });
        }

        return res.render("reservations/show", {
            title: "Détail réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: null,
        });
    } catch (err) {
        return res.status(500).render("reservations/show", {
            title: "Détail réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: "Erreur serveur lors du chargement de la réservation",
        });
    }
});

/**
 * GET /reservations/edit/:id -> formulaire edit
 */
router.get("/edit/:id", optionalAuth, requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).render("reservations/edit", {
                title: "Modifier la réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "ID réservation invalide",
            });
        }

        const reservation = await Reservations.findById(id);

        if (!reservation) {
            return res.status(404).render("reservations/edit", {
                title: "Modifier la réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "Réservation introuvable",
            });
        }

        return res.render("reservations/edit", {
            title: "Modifier la réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: null,
        });
    } catch (err) {
        return res.status(500).render("reservations/edit", {
            title: "Modifier la réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: "Erreur serveur lors du chargement de la réservation",
        });
    }
});

/**
 * PATCH /reservations/:id -> update
 */
router.patch("/:id", optionalAuth, requireAuth, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("reservations/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation: null,
            error: "ID réservation invalide",
        });
    }

    const { clientName, boatName, startDate, endDate } = req.body;

    if (!clientName || !boatName || !startDate || !endDate) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("reservations/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Tous les champs sont obligatoires",
        });
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("reservations/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Dates invalides (ex: 2025-02-12)",
        });
    }

    if (end <= start) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(400).render("reservations/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "La date de fin doit être après la date de début",
        });
    }

    try {
        const current = await Reservations.findById(id);
        if (!current) {
            return res.status(404).render("reservations/edit", {
                title: "Modifier réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: null,
                error: "Réservation introuvable",
            });
        }

        const overlap = await Reservations.findOne({
            _id: { $ne: current._id },
            catwayNumber: current.catwayNumber,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).render("reservations/edit", {
                title: "Modifier réservation",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservation: current,
                error: "Conflit : une autre réservation existe déjà sur cette période pour ce catway",
            });
        }

        current.clientName = clientName;
        current.boatName = boatName;
        current.startDate = start;
        current.endDate = end;

        await current.save();

        return res.redirect(`/reservations/show/${current._id}`);
    } catch (err) {
        const reservation = await Reservations.findById(id).catch(() => null);
        return res.status(500).render("reservations/edit", {
            title: "Modifier réservation",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservation,
            error: "Erreur serveur lors de la mise à jour",
        });
    }
});

/**
 * DELETE /reservations/:id -> delete
 */
router.delete("/:id", optionalAuth, requireAuth, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).render("reservations/index", {
            title: "Réservations",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
            error: "ID réservation invalide",
        });
    }

    try {
        const result = await Reservations.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return res.status(404).render("reservations/index", {
                title: "Réservations",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
                error: "Réservation introuvable",
            });
        }

        return res.redirect("/reservations");
    } catch (err) {
        return res.status(500).render("reservations/index", {
            title: "Réservations",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            reservations: await Reservations.find().sort({ startDate: 1 }).catch(() => []),
            error: "Erreur serveur lors de la suppression",
        });
    }
});

module.exports = router;
