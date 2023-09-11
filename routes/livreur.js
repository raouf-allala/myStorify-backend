const express = require('express');
const {
  registerLivreur,
  loginLivreur,
  getLivraisonsLibre,
  getLivraisonsById,
  acceptLivraison,
  getLivraisonByLivreur,
  confirmArrival,
  annulerLivraison,
  getFinishedLivraison,
} = require('../controllers/livreurController');
const router = express.Router();

router.post('/register', registerLivreur);
router.post('/login', loginLivreur);
router.get('/', getLivraisonsLibre);
router.post('/accept', acceptLivraison);
router.get('/pending/:id', getLivraisonByLivreur);
router.patch('/arrived', confirmArrival);
router.patch('/annuler', annulerLivraison);
router.get('/finished/:id', getFinishedLivraison);
router.get('/:id', getLivraisonsById);

module.exports = router;
