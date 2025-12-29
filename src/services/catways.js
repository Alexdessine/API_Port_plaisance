// On importe le modèle de données
const Catways = require('../models/catway');

// On exporte le callback afin d'y accéder dans notre gestionnaire de routes

// Ici c'est le callback qui servira à visualier tous les catways
exports.getAll = async (req, res) => {
    try {
        let catways = await Catways.find();
        return res.status(200).json(catways);
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


// Ici c'est le callback qui servira à visualiser un catways avec son ID
exports.getById = async (req, res) => {
    const catwayNumber = Number(req.params.catwayNumber); // ou req.params.catwayNumber si ta route s'appelle comme ça

    if (Number.isNaN(catwayNumber)) {
        return res.status(400).json({ message: "catwayNumber invalide" });
    }

    try {
        const catway = await Catways.findOne({ catwayNumber: catwayNumber });

        if (!catway) {
            return res.status(404).json({ message: "Catway non trouvée" });
        }

        return res.status(200).json(catway);
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
    const temp = ({
        catwayNumber: req.body.catwayNumber,
        catwayType: req.body.catwayType,
        catwayState: req.body.catwayState
    });

    try {
        let catway = await Catways.create(temp);
        return res.status(201).json(catway);
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



