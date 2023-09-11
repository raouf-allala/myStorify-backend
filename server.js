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
app.use(
  cors({
    origin: 'https://mystorify.netlify.app',
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

// notif

const serverIo = require('http').createServer(app);
serverIo.listen(3001, () => {
  console.log('running');
});
const { Server } = require('socket.io');

const io = new Server(serverIo, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});
/*const addNotfi = async (notif) => {
  const notification = await prisma.notification.create({
    data: {
      utilisateurId: notif.userId,
      titre: notif.titre,
      description: notif.desc,
    },
  });
};*/
io.on('connection', (socket) => {
  let notify = {};
  socket.on('join_room', (data, cb) => {
    socket.join(`room${data}`);
    cb('joind' + data);
  });

  socket.on('send_notif', async (notif) => {
    /*  console.log(socket.rooms);
    console.log('arrived', notif);*/
    const notification = await prisma.notification.create({
      data: {
        utilisateurId: notif.userId,
        titre: notif.titre,
        description: notif.desc,
      },
    });
    //notify = notification;
    //console.log(`room_${notif.userId}`);
    socket.to(`room${notif.userId}`).emit('recieve', notification);
    //console.log('room_' + JSON.stringify(notif.userId));
    //
    //socket.emit('room_' + JSON.stringify(notif.userId), notification);
  });
  // console.log(notify.utilisateurId);

  socket.on('disconnect', () => {
    /* console.log('disconnecte ', socket.id);*/
  });
});
