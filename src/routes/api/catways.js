var express = require('express');
var router = express.Router();

const service = require('../../services/catways');
const private = require('../../middlewares/private');

/**
 * @swagger
 * tags:
 *   name: Catways
 *   description: Gestion des catways
 */

/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Récupérer la liste de tous les catways
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catways récupérée avec succès
 *       401:
 *         description: Non autorisé (JWT manquant ou invalide)
 */
router.get(
  '/',
  private.checkJWT,
  service.getAll
);

/**
 * @swagger
 * /catways/{catwayNumber}:
 *   get:
 *     summary: Récupérer un catway par son numéro
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     responses:
 *       200:
 *         description: Catway trouvé
 *       400:
 *         description: Numéro de catway invalide
 *       404:
 *         description: Catway non trouvé
 *       401:
 *         description: Non autorisé
 */
router.get(
  '/:catwayNumber',
  private.checkJWT,
  service.getById
);

/**
 * @swagger
 * /catways/add:
 *   put:
 *     summary: Créer un nouveau catway
 *     tags: [Catways]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catwayNumber
 *               - catwayType
 *               - catwayState
 *             properties:
 *               catwayNumber:
 *                 type: integer
 *               catwayType:
 *                 type: string
 *                 enum: [long, short]
 *               catwayState:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catway créé avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Catway déjà existant
 */
router.put(
  '/add',
  service.add
);

/**
 * @swagger
 * /catways/{catwayNumber}:
 *   patch:
 *     summary: Mettre à jour l’état d’un catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - catwayState
 *             properties:
 *               catwayState:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catway mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Catway non trouvé
 *       401:
 *         description: Non autorisé
 */
router.patch(
  '/:catwayNumber',
  private.checkJWT,
  service.update
);

/**
 * @swagger
 * /catways/{catwayNumber}:
 *   delete:
 *     summary: Supprimer un catway par son numéro
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     responses:
 *       204:
 *         description: Catway supprimé avec succès
 *       404:
 *         description: Catway non trouvé
 *       401:
 *         description: Non autorisé
 */
router.delete(
  '/:catwayNumber',
  private.checkJWT,
  service.delete
);

module.exports = router;
