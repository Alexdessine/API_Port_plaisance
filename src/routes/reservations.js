var express = require('express');
var router = express.Router({ mergeParams: true });

const service = require('../services/reservations');
const private = require('../middlewares/private');

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestion des réservations de catways
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Récupérer toutes les réservations (global)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les réservations
 *       401:
 *         description: Non autorisé
 */
router.get(
  '/',
  private.checkJWT,
  service.getAllGlobal
);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations:
 *   get:
 *     summary: Récupérer toutes les réservations d’un catway
 *     tags: [Reservations]
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
 *         description: Liste des réservations du catway
 *       400:
 *         description: Numéro de catway invalide
 *       401:
 *         description: Non autorisé
 */
router.get(
  '/',
  private.checkJWT,
  service.getAllByCatway
);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{id}:
 *   get:
 *     summary: Récupérer une réservation d’un catway par son ID
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       200:
 *         description: Réservation trouvée
 *       400:
 *         description: Paramètre invalide
 *       404:
 *         description: Réservation non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get(
  '/:id',
  private.checkJWT,
  service.getById
);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/add:
 *   put:
 *     summary: Créer une réservation pour un catway
 *     tags: [Reservations]
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
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Conflit de réservation (dates qui se chevauchent)
 */
router.put(
  '/add',
  service.add
);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{id}:
 *   patch:
 *     summary: Modifier une réservation existante
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Réservation mise à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Réservation non trouvée
 *       409:
 *         description: Conflit de réservation
 *       401:
 *         description: Non autorisé
 */
router.patch(
  '/:id',
  private.checkJWT,
  service.update
);

/**
 * @swagger
 * /catways/{catwayNumber}/reservations/{id}:
 *   delete:
 *     summary: Supprimer une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: catwayNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la réservation
 *     responses:
 *       204:
 *         description: Réservation supprimée avec succès
 *       404:
 *         description: Réservation non trouvée
 *       401:
 *         description: Non autorisé
 */
router.delete(
  '/:id',
  private.checkJWT,
  service.delete
);

module.exports = router;
