var express = require('express');
var router = express.Router();

const service = require('../services/catways');

const private = require('../middlewares/private');

// Route pour lire tous les catways
router.get(
  '/', 
  private.checkJWT,
  service.getAll
);



// Route pour lire les infos d'un utilisateur
router.get(
  '/:catwayNumber', 
  private.checkJWT, 
  service.getById
);

// Route pour ajouter un utilisateur
router.put(
  '/add', 
  service.add
);

// Route pour mettre à jour un utilisateur
router.patch(
  '/:catwayNumber', 
  private.checkJWT, 
  service.update
);

// Route pour supprimer un utilisateur
router.delete(
  '/:catwayNumber', 
  private.checkJWT, 
  service.delete
);


module.exports = router;
