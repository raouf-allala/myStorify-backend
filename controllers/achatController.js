const prisma = require('../utils/prismaClient');

const effectuerAchat = async (req, res) => {
  const {
    totale,
    methode_paiement,
    commande_produits,
    adresse,
    wilaya,
  } = req.body;
  const user = req.user;
  // Get today's date
  const today = new Date();

  // Get the year, month, and day
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  // Format the date as "yyyy-mm-dd"
  const formattedDate = year + '-' + month + '-' + day;
  const commande = await prisma.commande.create({
    data: {
      totale: totale,
      etat: 'payé',
      date: formattedDate,
      methode_paiement: methode_paiement,
      utilisateur: {
        connect: {
          id: user.id,
        },
      },
      commande_produits: {
        create: commande_produits,
      },
    },
    include: {
      commande_produits: true,
    },
  });
  commande.commande_produits.forEach(async (produit) => {
    const livraison = await prisma.livraison.create({
      data: {
        adresse,
        wilaya,
        etat: 'libre',
        salaire: 300,
        commandeId: commande.id,
        Commande_Produit: {
          connect: {
            id: produit.id,
          },
        },
      },
    });
  });
  if (commande) {
    res.status(200).send({ message: 'paiement effectué' });
  } else {
    res.status(400).send({ message: 'erreur' });
  }
};
const getCommandes = async (req, res) => {
  const { id } = req.params;
  const { nom, etat, quantityOrder } = req.body;
  let commande_produits = [];
  const magasin = await prisma.magasin.findFirst({
    where: { id: parseInt(id) },
    include: {
      produits: true,
    },
  });
  console.log(etat);
  if (etat) {
    magasin.produits.forEach(async (produit) => {
      const commandes = await prisma.commande_Produit.findMany({
        where: {
          produitId: parseInt(produit.id),
          AND: {
            etat: etat,
          },
        },
        include: {
          produit: {
            include: {
              images: true,
            },
          },
          Commande: {
            include: {
              utilisateur: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
      });

      if (commandes.length) {
        console.log('this porduct ', produit.id);
        commandes.forEach((commande) => {
          commande_produits.push(commande);
        });
      }
    });
  } else {
    magasin.produits.forEach(async (produit) => {
      const commandes = await prisma.commande_Produit.findMany({
        where: {
          produitId: parseInt(produit.id),
        },
        include: {
          produit: {
            include: {
              images: true,
            },
          },
          Commande: {
            include: {
              utilisateur: {
                select: {
                  nom: true,
                  prenom: true,
                },
              },
            },
          },
        },
      });

      if (commandes.length) {
        console.log('this porduct ', produit.id);
        commandes.forEach((commande) => {
          commande_produits.push(commande);
        });
      }
    });
  }

  setTimeout(() => {
    console.log(commande_produits.length);

    if (commande_produits.length !== 0) {
      console.log(commande_produits);
      res.status(200).json(commande_produits);
    } else
      res.status(400).json({
        message: 'Il ya pas des commandes !',
      });
  }, 100);
};
const getCommande = async (req, res) => {
  const { id } = req.params;
  const commande = await prisma.commande_Produit.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      produit: {
        include: {
          images: true,
        },
      },
      Commande: {
        include: {
          utilisateur: true,
        },
      },
    },
  });
  if (commande) res.status(200).json(commande);
  else res.status(400);
};
const getCommandesByUser = async (req, res) => {
  const { id } = req.params;
  const commandes = await prisma.commande.findMany({
    where: {
      utilisateurId: parseInt(id),
    },
    include: {
      commande_produits: {
        include: {
          produit: {
            include: {
              discounts: true,
              magasin: true,
              images: true,
            },
          },
        },
      },
    },
  });
  res.send(commandes);
};
module.exports = {
  effectuerAchat,
  getCommandes,
  getCommande,
  getCommandesByUser,
};
