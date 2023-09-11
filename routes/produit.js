const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  deleteProduct,
  getMagasinProducts,
  getUserFavorites,
  removeProductFromWishlist,
  addProductToWishlist,
  getRandomProducts,
  getProductsByCategory,
  getMagasinProductsCount,
  getMagasinProductsByPage,
  getMagasinProductsUnAuth,
  getDiscountsProducts,
  updateProduct,
  getAdminProductsCount,
  getAdminProducts,
  getAdminProductsByPage,
  getTopProducts,
  getDashTopProducts,
  addDiscount,
  deleteDiscount,
  reviewProduct,
} = require('../controllers/produitController');
const passport = require('passport');
const {
  getProductByName,
} = require('../controllers/compteController');
const router = express.Router();

//    add and delete discounts
router.get('/search/:name', getProductByName);
router.post('/discount', addDiscount);
router.delete('/discount/:id', deleteDiscount);

//               get by category
router.get('/top/', getTopProducts);
router.get('/dashTop/:id', getDashTopProducts);

router.post('/categorie', getProductsByCategory);

//                get discout products

router.get('/discounts', getDiscountsProducts);

//           get all products

router.get('/', getProducts);

//           get magasin products

router.post(
  '/dash/magasin/:id',
  getMagasinProductsCount,
  getMagasinProducts
);
router.post('/paged/:id', getMagasinProductsByPage);

//           get admin products
router.post('/dash/admin/', getAdminProductsCount, getAdminProducts);
router.post('/admin/paged/', getAdminProductsByPage);

//            get magasin products for user

router.post(
  '/user/review',
  passport.authenticate('jwt', { session: false }),
  reviewProduct
);
router.post('/user/magasin/:id', getMagasinProductsUnAuth);

//              get user favorites

router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  getUserFavorites
);

//            delete product from favorites

router.delete(
  '/user/:id',
  passport.authenticate('jwt', { session: false }),
  removeProductFromWishlist
);

//            add product to favorites
router.post(
  '/user',
  passport.authenticate('jwt', { session: false }),
  addProductToWishlist
);

//           create product

router.post('/', createProduct);
//           update product
router.post('/update/:id', updateProduct);

//           delete product

router.delete('/:id', deleteProduct);

// //           update product

// router.patch('/:id', updateProduct);
//           get product by id

router.get('/:id', getProduct);

//              get random

router.get('/random/:number', getRandomProducts);
//      get top

module.exports = router;
