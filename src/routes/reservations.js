var express = require('express');
var router = express.Router({mergeParams: true});

const service = require('../services/reservations');

const private = require('../middlewares/private');

// Route pour lire tous les catways
router.get(
  '/', 
  private.checkJWT,
  service.getAllGlobal
);

// Route pour afficher toutes les réservation d'un catway
router.get(
    '/', 
    private.checkJWT,
    service.getAllByCatway
)

// Route pour lire les détails d'une réservation de catway en particulier
router.get(
  '/:id', 
  private.checkJWT, 
  service.getById
);

// Route pour ajouter une réservation
router.put(
  '/', 
  service.add
);

// Route pour mettre à jour une réservation
router.patch(
  '/:id', 
  private.checkJWT, 
  service.update
);

// Route pour supprimer une réservation
router.delete(
  '/:id', 
  private.checkJWT, 
  service.delete
);


module.exports = router;
