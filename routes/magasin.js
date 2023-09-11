const express = require('express');
const router = express.Router();

const {
  getMagasin,
  getMagasins,
  createMagasin,
  deleteMagasin,
  updateMagasin,
  getValidMagasins,
  getUnValideMagasins,
  validerMagasin,
  getValidMagasinById,
  getValidMagasinsByIdUnAuth,
  addDepot,
  deleteDepot,
  getMagasinById,
  getDashMagasins,
  getDashMagasinsCount,
  getDashMagasinsByPage,
  addCodesPromos,
  getCodesPromos,
  deleteCodePromo,
} = require('../controllers/magasinController');
const passport = require('passport');

//           delete

router.post('/delete/:id', deleteMagasin);

// add code promo
router.post('/codesPromos/add', addCodesPromos);
router.get('/codesPromos', getCodesPromos);
router.delete('/codesPromos/:id', deleteCodePromo);

router.get('/valide', getValidMagasins);
//          get all
router.get('/', getMagasins);
router.get('/:id', getMagasinById);

//         get dash magasins
router.post('/dash', getDashMagasinsCount, getDashMagasins);
router.post('/paged', getDashMagasinsByPage);

//          get all validated magasins

//          get valide by id user

router.get(
  '/user/valide/:id',
  passport.authenticate('jwt', { session: false }),
  getValidMagasinById
);

//          get valide by id

router.get('/valide/:id', getValidMagasinsByIdUnAuth);

//          get all unvalidated magasins

router.get('/non-valide', getUnValideMagasins);

//          create
router.post('/', createMagasin);

//          getOne

router.get('/:name', getMagasin);

//           update

router.patch('/:id', updateMagasin);

//            validate magasin

router.patch('/valider/:id', validerMagasin);

//           add depot
router.post('/depot/add', addDepot);

//           delete depot

router.delete('/depot/delete/:id', deleteDepot);
module.exports = router;
