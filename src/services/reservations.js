// On importe le modèle de données
const Reservations = require('../models/reservation');
const Catways = require('../models/catway');
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



// Ici c'est le callback qui servira à ajouter une réservation
exports.add = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: "catwayNumber doit être un nombre" });
    }

    const { clientName, boatName, startDate, endDate } = req.body;

    if (!clientName || !boatName || !startDate || !endDate) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ message: "Dates invalides (ex: 2025-02-12)" });
    }

    if (end < start) {
        return res.status(400).json({ message: "La date de fin doit être après la date de début" });
    }

    try {
        // 1) vérifier que le catway existe
        const catway = await Catways.findOne({ catwayNumber });
        if (!catway) {
            return res.status(404).json({ message: "Catway introuvable" });
        }

        // 2) vérifier chevauchement
        const overlap = await Reservations.findOne({
            catwayNumber,
            startDate: { $lte: end },
            endDate: { $gte: start },
        });

        if (overlap) {
            return res.status(409).json({
                message: "Conflit: une réservation existe déjà sur cette période pour ce catway",
                conflictReservationId: overlap._id,
            });
        }

        // 3) créer
        const reservation = await Reservations.create({
            catwayNumber,
            clientName,
            boatName,
            startDate: start,
            endDate: end,
        });

        return res.status(201).json(reservation);
    } catch (error) {
        return res.status(500).json({
            name: error?.name,
            message: error?.message,
            code: error?.code,
            keyValue: error?.keyValue,
        });
    }
};

// Ici c'est le callback qui sert à modifier un catways avec son id
exports.update = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber);
    const id = req.params.id;

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: "catwayNumber doit être un nombre" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "id réservation invalide" });
    }

    try {
        // 1) Charger la réservation ciblée + vérifier qu’elle appartient au bon catway
        const reservation = await Reservations.findOne({ _id: id, catwayNumber });

        if (!reservation) {
            return res.status(404).json({ message: "Réservation non trouvée" });
        }

        // 2) Construire les nouvelles valeurs (on garde l’existant si non fourni)
        const nextClientName = req.body.clientName ?? reservation.clientName;
        const nextBoatName = req.body.boatName ?? reservation.boatName;

        const nextStart = req.body.startDate ? new Date(req.body.startDate) : reservation.startDate;
        const nextEnd = req.body.endDate ? new Date(req.body.endDate) : reservation.endDate;

        // 3) Valider dates si modifiées (ou juste pour être safe)
        if (Number.isNaN(nextStart.getTime()) || Number.isNaN(nextEnd.getTime())) {
            return res.status(400).json({ message: "Dates invalides (ex: 2025-02-12)" });
        }

        if (nextEnd < nextStart) {
            return res.status(400).json({ message: "La date de fin doit être après la date de début" });
        }

        // 4) Vérifier chevauchement avec une AUTRE réservation du même catway
        const overlap = await Reservations.findOne({
            catwayNumber,
            _id: { $ne: reservation._id },        // exclure celle qu'on modifie
            startDate: { $lte: nextEnd },
            endDate: { $gte: nextStart },
        });

        if (overlap) {
            return res.status(409).json({
                message: "Conflit: une réservation existe déjà sur cette période pour ce catway",
                conflictReservationId: overlap._id,
            });
        }

        // 5) Appliquer les changements
        reservation.clientName = nextClientName;
        reservation.boatName = nextBoatName;
        reservation.startDate = nextStart;
        reservation.endDate = nextEnd;

        await reservation.save();

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


// Ici c'est le callback qui servira à supprimer un catways
// Ici c'est le callback qui servira à supprimer un catway par son numéro
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        await Reservations.deleteOne({ _id: id });
        return res.status(200).json('La réservation est bien supprimée.');
    } catch (error) {
        console.log(error);
        return res.status(501).json(error);
    }
};



