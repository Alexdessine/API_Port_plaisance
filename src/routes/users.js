var express = require('express');
var router = express.Router();

const service = require('../services/users');

const private = require('../middlewares/private');


// Route pour lire les infos d'un utilisateur
router.get(
  '/:id', 
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
  '/:id', 
  private.checkJWT, 
  service.update
);

// Route pour supprimer un utilisateur
router.delete(
  '/:id', 
  private.checkJWT, 
  service.delete
);

// Ajout de la route /authenticate
router.post('/authenticate', service.authenticate);

module.exports = router;
