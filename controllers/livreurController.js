const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prismaClient');

const dotenv = require('dotenv');

dotenv.config();

const registerLivreur = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, telephone, adresse, wilaya } = req.body;
  const exist = await prisma.livreur.findFirst({
    where: {
      email: email,
    },
  });
  if (exist) {
    return res.status(400).json({ message: 'Ce compte deja existé !' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await prisma.livreur.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone: parseInt(telephone),
      adresse,
      wilaya,
      libre: true,
    },
  });
  return res.status(200).send(user);
  // const newUser = await prisma.livreur.findFirst({
  //   where: {
  //     email: email,
  //   },
  // });
  // if (user) {
  //   const payload = {
  //     id: newUser.id,
  //     nom: newUser.nom,
  //   };
  //   verifyUserEmail(email, nom);
  //   const token = jwt.sign(payload, process.env.JWT_SECRET, {
  //     expiresIn: '5m',
  //   });
  //   res.cookie('token', token, {
  //     httpOnly: true,
  //   });
  //   res.json({ mes: 'cookie set ' });
  // } else {
  //   res.status(400);
  //   throw new Error('Invalid user data');
  // }
});
const loginLivreur = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log({ email, password });
  const user = await prisma.livreur.findFirst({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).json({
      message: "Ce compte n'existe pas !",
    });
  }
  if (user && (await bcrypt.compare(password, user.password))) {
    const payload = {
      id: user.id,
      nom: user.nom,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.status(200).json({ user, token });
  } else {
    res.status(400).json({
      message: "L'addresse email ou le mot de pass sont incorrects !",
    });
  }
});
const getLivraisonsLibre = async (req, res) => {
  const livraison = await prisma.livraison.findMany({
    where: {
      etat: 'libre',
    },
    include: {
      Commande_Produit: {
        include: {
          produit: {
            include: {
              images: true,
              Depot: true,
              magasin: true,
            },
          },
          Commande: true,
        },
      },
    },
  });
  res.send(livraison);
};
const getLivraisonsById = async (req, res) => {
  const { id } = req.params;
  const livraison = await prisma.livraison.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      Commande_Produit: {
        include: {
          produit: {
            include: {
              images: true,
              Depot: true,
              magasin: true,
            },
          },
          Commande: true,
        },
      },
    },
  });
  res.send(livraison);
};
const acceptLivraison = async (req, res) => {
  const { livraisonId, livreurId } = req.body;
  const livreur = await prisma.livreur.update({
    where: {
      id: parseInt(livreurId),
    },
    data: {
      libre: false,
    },
  });
  const livraison = await prisma.livraison.findFirst({
    where: {
      id: parseInt(livraisonId),
    },
  });
  const newLiv = await prisma.livraison.update({
    where: {
      id: parseInt(livraisonId),
    },
    data: {
      etat: 'occupé',
      livreur: {
        connect: {
          id: parseInt(livreurId),
        },
      },
    },
  });
  console.log('aloooo');
  res.send(newLiv);
};
const getLivraisonByLivreur = async (req, res) => {
  const { id } = req.params;
  const livraison = await prisma.livraison.findFirst({
    where: {
      livreurId: parseInt(id),
      AND: {
        etat: 'occupé',
      },
    },
    include: {
      Commande_Produit: {
        include: {
          produit: {
            include: {
              images: true,
              Depot: true,
              magasin: true,
            },
          },
          Commande: true,
        },
      },
    },
  });
  if (livraison) {
    res.send(livraison);
  } else {
    res.send({ message: 'no livraison' });
  }
};
const getFinishedLivraison = async (req, res) => {
  const { id } = req.params;
  const livraison = await prisma.livraison.findMany({
    where: {
      livreurId: parseInt(id),
      AND: {
        etat: 'terminé',
      },
    },
    include: {
      Commande_Produit: {
        include: {
          produit: {
            include: {
              images: true,
              Depot: true,
              magasin: true,
            },
          },
          Commande: true,
        },
      },
    },
  });
  if (livraison) {
    res.send(livraison);
  } else {
    res.send({ message: 'no livraison' });
  }
};
const confirmArrival = async (req, res) => {
  const { commandeProduitId, livraisonId, livreurId } = req.body;
  const updateCommande = await prisma.commande_Produit.update({
    where: {
      id: parseInt(commandeProduitId),
    },
    data: {
      etat: 'livré',
    },
  });
  const updateLivraison = await prisma.livraison.update({
    where: {
      id: parseInt(livraisonId),
    },
    data: {
      etat: 'terminé',
    },
  });
  const updateLivreur = await prisma.livreur.update({
    where: {
      id: parseInt(livreurId),
    },
    data: {
      libre: true,
    },
  });
  res.send({ message: 'Livraison terminé' });
};
const annulerLivraison = async (req, res) => {
  const { id, livreurId } = req.body;
  await prisma.livraison.update({
    where: {
      id: parseInt(id),
    },
    data: {
      etat: 'libre',
      livreurId: null,
    },
  });
  await prisma.livreur.update({
    where: {
      id: parseInt(livreurId),
    },
    data: {
      libre: true,
    },
  });
  res.send({ message: 'Livraison annulée' });
};
module.exports = {
  registerLivreur,
  loginLivreur,
  getLivraisonsLibre,
  getLivraisonsById,
  acceptLivraison,
  getLivraisonByLivreur,
  confirmArrival,
  annulerLivraison,
  getFinishedLivraison,
};
