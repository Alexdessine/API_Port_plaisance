// On importe le modèle de données
const Reservations = require('../models/reservation');
const mongoose = require('mongoose');

// On exporte le callback afin d'y accéder dans notre gestionnaire de routes

// Ici c'est le callback qui servira à visualier tous les catways
exports.getAllGlobal = async (req, res) => {
    const catwayNumber = req.params.catwayNumber ? Number(req.params.catwayNumber) : null;

    const filter = {};
    if (catwayNumber !== null) {
        if (Number.isNaN(catwayNumber)) return res.status(400).json({ message: "catwayNumber invalide" });
        filter.catwayNumber = catwayNumber;
    }

    const reservations = await Reservations.find(filter);
    return res.status(200).json(reservations);
};


// Ici c'est le callback qui servira à visualier toutes les réservations d'un catway
exports.getAllByCatway = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({message: "catwayNumber invalide !"});
    }

    try {
        const reservations = await Reservations.find({ catwayNumber });
        return res.status(200).json(reservations);
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
        });
    }
};

// Ici c'est le callback qui servira à visualiser le détail d'une réservation d'un catway avec son ID
exports.getById = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);
    const id = req.params.id;

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: "catwayNumber invalide" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "id réservation invalide" });
    }

    try {
        const reservation = await Reservations.findOne({
            _id: id,
            catwayNumber,
        });

        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        return res.status(200).json(reservation);
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
            keyValue: error?.keyValue,
        });
    }
};



// Ici c'est le callback qui servira à ajouter un catways
exports.add = async (req, res, next) => {
    const catwayNumber = Number(req.body.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: 'catwayNumber doit être un nombre' });
    }

    const { clientName, boatName, startDate, endDate } = req.body;

    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Les dates doivent être au format YYYY-MM-DD' });
    }

    if (end < start) {
        return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    try {
        // On vérifie si une réservation est déjà existante
        // existing.startDate <= newEnd ET existing.endDate >= newStart
        const overlap = await Reservations.findOne({
            catwayNumber, 
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).json({
                message: "Conflit: une réservation existe déjà sur cette période pour ce catway",
                conflicReservationId: overlap._id,
            });
        }

        const reservation = await Reservations.create({
            catwayNumber,
            clientName,
            boatName,
            startDate,
            endDate,
        });

        return res.status(201).json(reservation);
    } catch (error) {
        console.log('BODY RECU:', req.body);
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
            keyValue: error?.keyValue
        });
    }
};

// Ici c'est le callback qui sert à modifier un catways avec son id
exports.update = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: 'catwayNumber doit être un nombre' });
    }

    // On n'accepte QUE catwayState
    const { catwayState } = req.body;

    if (typeof catwayState !== 'string' || catwayState.trim() === '') {
        return res.status(400).json({ message: 'catwayState est obligatoire' });
    }

    try {
        const catway = await Catways.findOne({ catwayNumber });

        if (!catway) {
            return res.status(404).json({ message: 'Catway non trouvée' });
        }

        catway.catwayState = catwayState;
        await catway.save();

        return res.status(200).json(catway);
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
        });
    }
};


// Ici c'est le callback qui servira à supprimer un catways
// Ici c'est le callback qui servira à supprimer un catway par son numéro
exports.delete = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: 'catwayNumber doit être un nombre' });
    }

    try {
        const result = await Catways.deleteOne({ catwayNumber });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Catway non trouvée' });
        }

        // 204 = No Content → pas de body
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
        });
    }
};



