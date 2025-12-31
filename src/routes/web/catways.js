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

// GET /catways/add -> formulaire d'ajout
router.get("/add", optionalAuth, requireAuth, (req, res) => {
    return res.render("catways/add", {
        title: "Ajouter un catway",
        isAuthenticated: req.isAuthenticated,
        user: req.user || null,
        error: null,
        form: { catwayNumber: "", catwayType: "", catwayState: "" },
    });
});

// POST /catways -> création
router.post("/", optionalAuth, requireAuth, async (req, res) => {
    const { catwayNumber, catwayType, catwayState } = req.body;
    const form = { catwayNumber, catwayType, catwayState };

    const num = Number(catwayNumber);
    if (Number.isNaN(num) || num <= 0) {
        return res.status(400).render("catways/add", {
            title: "Ajouter un catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "catwayNumber doit être un nombre positif",
            form,
        });
    }

    if (!catwayType || !["long", "short"].includes(catwayType)) {
        return res.status(400).render("catways/add", {
            title: "Ajouter un catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "catwayType doit être 'long' ou 'short'",
            form,
        });
    }

    if (!catwayState || typeof catwayState !== "string" || catwayState.trim() === "") {
        return res.status(400).render("catways/add", {
            title: "Ajouter un catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "catwayState est obligatoire",
            form,
        });
    }

    try {
        const created = await Catways.create({
            catwayNumber: num,
            catwayType,
            catwayState: catwayState.trim(),
        });

        return res.redirect(`/catways/show/${created.catwayNumber}`);
    } catch (err) {
        // exemple : duplicate key error si catwayNumber est unique
        if (err?.code === 11000) {
            return res.status(409).render("catways/add", {
                title: "Ajouter un catway",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                error: "Ce catwayNumber existe déjà",
                form,
            });
        }

        return res.status(500).render("catways/add", {
            title: "Ajouter un catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Erreur serveur lors de la création",
            form,
        });
    }
});

// GET /catways / show /: id -> affiche le détail d'une catway
router.get('/show/:catwayNumber', optionalAuth, requireAuth, async (req, res) => {
    try {
        const catwayNumber = Number(req.params.catwayNumber);

        if (Number.isNaN(catwayNumber)) {
            return res.status(400).render('catways/show', {
                title: 'Détail du catway',
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                catways: null,
                error: "catwayNumber invalide (doit être un nombre)",
            });
        }

        const catways = await Catways.findOne({ catwayNumber });

        if (!catways) {
            return res.status(404).render('catways/show', {
                title: 'Détail du catway',
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                catways: null,
                error: "Catway introuvable",
            });
        }

        return res.render('catways/show', {
            title: 'Détail du catway',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways,
            error: null,
        });

    } catch (err) {
        return res.status(500).render('catways/show', {
            title: 'Détail du catway',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways: null,
            error: "Erreur serveur lors du chargement du catway",
        });
    }
});

// GET /catways/edit/:id -> formulaire d'édition d'un catway
router.get('/edit/:catwayNumber', optionalAuth, requireAuth, async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).render('catways/edit', {
            title: 'Modifier le catway',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway: null,
            error: 'catwayNumber invalide (doit être un nombre)',
        });
    }

    try {
        const catway = await Catways.findOne({ catwayNumber });

        if (!catway) {
            return res.status(404).render('catways/edit', {
                title: 'Modifier le catway',
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                catway: null,
                error: 'Catway introuvable',
            });
        }

        return res.render('catways/edit', {
            title: 'Modifier le catway',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway,
            error: null,
        });
    } catch (err) {
        return res.status(500).render('catways/edit', {
            title: 'Modifier le catway',
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway: null,
            error: 'Erreur serveur lors du chargement du catway',
        });
    }
});


// GET /catways/edit/:id -> envoie du formulaire formulaire d'édition d'un catway
router.patch("/edit/:catwayNumber", optionalAuth, requireAuth, async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).render("catways/edit", {
            title: "Modifier catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway: null,
            error: "catwayNumber doit être un nombre",
        });
    }

    // seul champ modifiable
    const { catwayState } = req.body;

    if (!catwayState || typeof catwayState !== "string" || catwayState.trim() === "") {
        const catway = await Catways.findOne({ catwayNumber }).catch(() => null);
        return res.status(400).render("catways/edit", {
            title: "Modifier catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway,
            error: "catwayState est obligatoire",
        });
    }

    try {
        const catway = await Catways.findOne({ catwayNumber });

        if (!catway) {
            return res.status(404).render("catways/edit", {
                title: "Modifier catway",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                catway: null,
                error: "Catway introuvable",
            });
        }

        catway.catwayState = catwayState.trim();
        await catway.save();

        // redirige vers ta page show
        return res.redirect(`/catways/show/${catway.catwayNumber}`);
    } catch (err) {
        const catway = await Catways.findOne({ catwayNumber }).catch(() => null);
        return res.status(500).render("catways/edit", {
            title: "Modifier catway",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catway,
            error: "Erreur serveur lors de la mise à jour",
        });
    }
});

// DELETE /catways/delete/:catwayNumber -> supprime un catway puis redirige vers /catways
router.delete("/delete/:catwayNumber", optionalAuth, requireAuth, async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber) || catwayNumber <= 0) {
        return res.status(400).render("catways/index", {
            title: "Catways",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways: await Catways.find().sort({ catwayNumber: 1 }).catch(() => []),
            error: "catwayNumber invalide (doit être un nombre positif)",
        });
    }

    try {
        const result = await Catways.deleteOne({ catwayNumber });

        if (result.deletedCount === 0) {
            return res.status(404).render("catways/index", {
                title: "Catways",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                catways: await Catways.find().sort({ catwayNumber: 1 }).catch(() => []),
                error: "Catway introuvable",
            });
        }

        return res.redirect("/catways");
    } catch (err) {
        return res.status(500).render("catways/index", {
            title: "Catways",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            catways: await Catways.find().sort({ catwayNumber: 1 }).catch(() => []),
            error: "Erreur serveur lors de la suppression",
        });
    }
});



module.exports = router;
