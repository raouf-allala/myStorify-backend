const express = require('express');
const {
  getCategories,
  createCategorie,
  deleteCategorie,
  updateCategorie,
  getCategoriesByMagasin,
  updateSousCategorie,
  addSousCategorie,
  deleteSousCategorie,
} = require('../controllers/categorieController');
const app = require('../server');
const router = express.Router();

//          get all
router.get('/', getCategories);

//       get by id
router.get('/:id', getCategoriesByMagasin);

//          create
router.post('/', createCategorie);

//           delete

router.delete('/:id', deleteCategorie);

//         update sous categories
router.patch('/sous/:id', updateSousCategorie);
//           update
router.patch('/:id', updateCategorie);
//     add sous categorie
router.post('/sous', addSousCategorie);
//     delete sous categorie
router.post('/sous/:id', deleteSousCategorie);
module.exports = router;
