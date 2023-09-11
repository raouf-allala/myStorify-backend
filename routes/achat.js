const express = require('express');
const {
  effectuerAchat,
  getCommandes,
  getCommande,
  getCommandesByUser,
} = require('../controllers/achatController');
const passport = require('passport');

const router = express.Router();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  effectuerAchat
);
router.post('/magasin/:id', getCommandes);
router.get('/user/:id', getCommandesByUser);
router.get('/:id', getCommande);

module.exports = router;
