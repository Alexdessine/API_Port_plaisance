// on importe le modèle de données
const User = require('../models/user');

// Ajout système d'authentification
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAll = async (req, res) => {
    try {
        let users = await User.find();
        return res.status(200).json(users);
    } catch (error) {
        console.log('BODY RECU:', req.body);
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
            keyValue: error?.keyValue
        });
    }
}


// On exporte le callback afin d'y accéder dans notre gestionnaire de routes
// Ici c'est le callback qui servira à ajouter un user avec son id
exports.getByEmail = async (req, res) => {
    const email = req.params.email;


    try {
        let user = await User.findOne({email : email});

        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    } catch (error) {
        console.log('BODY RECU: ', req.body);
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
            keyValue: error?.keyValue
        });
    }
}

// Ici c'est le callback qui servira à ajouter un user
exports.add = async (req, res, next) => {

    const temp = ({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    try {
        let user = await User.create(temp);

        return res.status(201).json(user);
    } catch (error) {
        console.log('BODY RECU:', req.body);
        return res.status(500).json({
            message : "Un utilisateur avec cet email existe déjà."
        });
    }
}

// Ici c'est le callback qui servira à modifier un user avec son id
exports.update = async (req, res) => {
    const email = decodeURIComponent(req.params.email).trim().toLowerCase();

    const temp = {
        username: req.body.username,
        password: req.body.password,
    };

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        Object.keys(temp).forEach((key) => {
            if (temp[key] !== undefined && temp[key] !== null && temp[key] !== "") {
                user[key] = temp[key];
            }
        });

        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
        });
    }
};

// Ici c'est le callback qui servira à supprimer un user avec son id
exports.delete = async (req, res, next) => {
    const email = req.params.email;

    try {
        await User.deleteOne({ email });
        return res.status(200).json('delete_ok');
    } catch (error) {
        console.log(error);
        return res.status(501).json(error);
    }
}

// Adaptation de l'authentification pour le front avec JWT dans les headers
exports.authenticate = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).render('/?error=', { error: 'Utilisateur introuvable' });
        }

        bcrypt.compare(password, user.password, function (err, ok) {
            if (err) {
                return res.status(500).render('index', { error: 'Erreur serveur' });
            }

            if (!ok) {
                return res.status(403).render('index', { error: 'Identifiants incorrects' });
            }

            const loginAt = new Date().toISOString();

            const expireIn = 24 * 60 * 60; // 24 heures
            const token = jwt.sign({ user: { _id: user._id, email: user.email }, loginAt: loginAt }, process.env.SECRET_KEY, {
                expiresIn: expireIn,
            });

            // Cookie httpOnly (le navigateur le stocke, js ne peut pas le lire)
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: expireIn * 1000,
            });

            return res.redirect('/dashboard');
        });
    } catch (error) {
        return res.status(500).render('index', { error: 'Erreur serveur' });
    }
};

exports.logout = async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (token) {
            const payload = jwt.verify(token, process.env.SECRET_KEY);

            // ✅ lastLoginAt = moment où cette session a commencé (loginAt)
            await User.updateOne(
                { _id: payload.user._id },
                { $set: { lastLoginAt: payload.loginAt } }
            );
        }
    } catch (e) {
        // même si token invalide/expiré : on déconnecte quand même
    }

    res.clearCookie('token');
    return res.redirect('/');
};
