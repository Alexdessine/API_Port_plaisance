const express = require("express");
const router = express.Router();

const optionalAuth = require("../../middlewares/optionalAuth");
const requireAuth = require("../../middlewares/requireAuth");

const Users = require("../../models/user"); // <-- ajuste le chemin/nom si besoin
const bcrypt = require("bcrypt");

// petite aide: validation email (simple)
function isValidEmail(email) {
    if (typeof email !== "string") return false;
    const e = email.trim().toLowerCase();
    // regex simple, suffisante pour un devoir (sans prétendre être parfaite)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

// GET /users/ -> liste des users
router.get("/", optionalAuth, requireAuth, async (req, res) => {
    try {
        const users = await Users.find().sort({ email: 1 });

        return res.render("users/index", {
            title: "Utilisateurs",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            users,
            error: null,
        });
    } catch (err) {
        return res.status(500).render("users/index", {
            title: "Utilisateurs",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            users: [],
            error: "Erreur serveur lors du chargement des utilisateurs",
        });
    }
});

// GET /users/add -> formulaire d'ajout (DOIT être avant "/:email")
router.get("/add", optionalAuth, requireAuth, (req, res) => {
    return res.render("users/add", {
        title: "Ajouter un utilisateur",
        isAuthenticated: req.isAuthenticated,
        user: req.user || null,
        error: null,
        form: { username: "", email: "" },
    });
});

// GET /users/:email -> détail d'un user
// GET /users/:email -> détail OU formulaire d'édition via ?edit=true
router.get("/:email", optionalAuth, requireAuth, async (req, res) => {
    try {
        const email = (req.params.email || "").trim().toLowerCase();
        const isEdit = String(req.query.edit || "").toLowerCase() === "true";

        if (!isValidEmail(email)) {
            return res.status(400).render(isEdit ? "users/edit" : "users/show", {
                title: isEdit ? "Modifier utilisateur" : "Détail utilisateur",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                userData: null,
                error: "Email invalide",
                form: isEdit ? { username: "", email } : undefined,
            });
        }

        const userData = await Users.findOne({ email });

        if (!userData) {
            return res.status(404).render(isEdit ? "users/edit" : "users/show", {
                title: isEdit ? "Modifier utilisateur" : "Détail utilisateur",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                userData: null,
                error: "Utilisateur introuvable",
                form: isEdit ? { username: "", email } : undefined,
            });
        }

        if (isEdit) {
            return res.render("users/edit", {
                title: "Modifier utilisateur",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                userData,
                error: null,
                form: { username: userData.username || "", email: userData.email },
            });
        }

        return res.render("users/show", {
            title: "Détail utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData,
            error: null,
        });
    } catch (err) {
        const isEdit = String(req.query.edit || "").toLowerCase() === "true";
        return res.status(500).render(isEdit ? "users/edit" : "users/show", {
            title: isEdit ? "Modifier utilisateur" : "Détail utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData: null,
            error: "Erreur serveur lors du chargement de l'utilisateur",
            form: isEdit ? { username: "", email: "" } : undefined,
        });
    }
});


// POST /users/ -> création d'un user
router.post("/", optionalAuth, requireAuth, async (req, res) => {
    // adapte ces champs à TON schéma
    const { username, email, password } = req.body;
    const form = { username: username || "", email: email || "" };

    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!username || typeof username !== "string" || username.trim() === "") {
        return res.status(400).render("users/add", {
            title: "Ajouter un utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Le nom est obligatoire",
            form,
        });
    }

    if (!isValidEmail(normalizedEmail)) {
        return res.status(400).render("users/add", {
            title: "Ajouter un utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Email invalide",
            form,
        });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).render("users/add", {
            title: "Ajouter un utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Mot de passe invalide (min 6 caractères)",
            form,
        });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        const created = await Users.create({
            username: username.trim(),
            email: normalizedEmail,
            password: hashed, // adapte si ton champ s'appelle autrement
        });

        return res.redirect(`/users/${created.email}`);
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).render("users/add", {
                title: "Ajouter un utilisateur",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                error: "Cet email est déjà utilisé",
                form,
            });
        }

        return res.status(500).render("users/add", {
            title: "Ajouter un utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            error: "Erreur serveur lors de la création",
            form,
        });
    }
});

// PUT /users/:email -> mise à jour d'un user
// PUT /users/:email -> mise à jour d'un user (username + password optionnel)
router.put("/:email", optionalAuth, requireAuth, async (req, res) => {
    const email = (req.params.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
        return res.status(400).render("users/edit", {
            title: "Modifier utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData: null,
            error: "Email invalide",
            form: { username: req.body?.username || "", email },
        });
    }

    const username =
        typeof req.body.username === "string" ? req.body.username.trim() : "";
    const password =
        typeof req.body.password === "string" ? req.body.password : "";

    // username obligatoire (si tu veux le rendre optionnel, dis-le et je t'adapte)
    if (!username) {
        const userData = await Users.findOne({ email }).catch(() => null);
        return res.status(400).render("users/edit", {
            title: "Modifier utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData,
            error: "Le username est obligatoire",
            form: { username, email },
        });
    }

    // password optionnel : si vide -> on ne change pas
    if (password && password.length < 6) {
        const userData = await Users.findOne({ email }).catch(() => null);
        return res.status(400).render("users/edit", {
            title: "Modifier utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData,
            error: "Mot de passe invalide (min 6 caractères)",
            form: { username, email },
        });
    }

    try {
        const userData = await Users.findOne({ email });

        if (!userData) {
            return res.status(404).render("users/edit", {
                title: "Modifier utilisateur",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                userData: null,
                error: "Utilisateur introuvable",
                form: { username, email },
            });
        }

        userData.username = username;

        if (password) {
            userData.password = await bcrypt.hash(password, 10);
        }

        await userData.save();

        return res.redirect(`/users/${userData.email}`);
    } catch (err) {
        const userData = await Users.findOne({ email }).catch(() => null);
        return res.status(500).render("users/edit", {
            title: "Modifier utilisateur",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            userData,
            error: "Erreur serveur lors de la mise à jour",
            form: { username, email },
        });
    }
});


// DELETE /users/:email -> suppression d'un user
router.delete("/:email", optionalAuth, requireAuth, async (req, res) => {
    const email = (req.params.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
        return res.status(400).render("users/index", {
            title: "Utilisateurs",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            users: await Users.find().sort({ email: 1 }).catch(() => []),
            error: "Email invalide",
        });
    }

    try {
        const result = await Users.deleteOne({ email });

        if (result.deletedCount === 0) {
            return res.status(404).render("users/index", {
                title: "Utilisateurs",
                isAuthenticated: req.isAuthenticated,
                user: req.user || null,
                users: await Users.find().sort({ email: 1 }).catch(() => []),
                error: "Utilisateur introuvable",
            });
        }

        return res.redirect("/users");
    } catch (err) {
        return res.status(500).render("users/index", {
            title: "Utilisateurs",
            isAuthenticated: req.isAuthenticated,
            user: req.user || null,
            users: await Users.find().sort({ email: 1 }).catch(() => []),
            error: "Erreur serveur lors de la suppression",
        });
    }
});

module.exports = router;
