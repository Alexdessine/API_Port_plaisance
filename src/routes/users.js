var express = require('express');
var router = express.Router();

const service = require('../services/users');

const private = require('../middlewares/private');

// Route pour lire tous les users
router.get(
  '/', 
  private.checkJWT,
  service.getAll
);


// Route pour lire les infos d'un utilisateur
router.get(
  '/:email', 
  private.checkJWT, 
  service.getByEmail
);

// Route pour ajouter un utilisateur
router.put(
  '/add', 
  service.add
);

// Route pour mettre à jour un utilisateur
router.patch(
  '/:email', 
  private.checkJWT, 
  service.update
);

// Route pour supprimer un utilisateur
router.delete(
  '/:email', 
  private.checkJWT, 
  service.delete
);

// Ajout de la route /authenticate
router.post('/authenticate', service.authenticate);

module.exports = router;
