const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const prisma = require('./utils/prismaClient');
const compteRoutes = require('./routes/compte');
const magasinRoutes = require('./routes/magasin');
const categorieRoutes = require('./routes/categorie');
const produitRoutes = require('./routes/produit');
const achatRoutes = require('./routes/achat');
const livreurRoutes = require('./routes/livreur');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const cookieParser = require('cookie-parser');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// cors whitelist
app.use(
  cors({
    origin: process.env.CORS_ALLOW,
    credentials: true,
  })
);
app.use(fileUpload({ useTempFiles: true }));
app.use(passport.initialize());
app.use(cookieParser());
require('./utils/passport');
app.listen(3000, () => {
  console.log('App running');
});

app.use('/api/users', compteRoutes);
app.use('/api/magasins', magasinRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/achat', achatRoutes);
app.use('/api/livreur', livreurRoutes);
