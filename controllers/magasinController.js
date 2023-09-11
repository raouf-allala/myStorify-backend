const cloudinary = require('../utils/cloudinary');
const prisma = require('../utils/prismaClient');

const { sendToOwner } = require('../utils/Email');

//           get all magasins
const getMagasins = async (req, res) => {
  const magasins = await prisma.magasin.findMany();
  if (magasins.length === 0)
    res.status(400).json({ message: '0 magasins' });
  else res.status(200).json(magasins);
};
const getMagasinById = async (req, res) => {
  const { id } = req.params;
  const magasin = await prisma.magasin.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      Categorie: {
        include: {
          Sous_Categorie: true,
        },
      },
      Utilisateur: true,
      Depot: true,
    },
  });
  if (magasin) res.status(200).json(magasin);
  else res.status(400);
};
//           get dash magasin
const getDashMagasins = async (req, res) => {
  const { dateOrder, nom, valide, categorieId } = req.body;

  const total = res.locals.total;

  let magasins;
  if (categorieId) {
    if (valide) {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            etat: valide,
            AND: {
              categorieId: categorieId,
            },
          },
        },
        include: {
          Utilisateur: true,
          Categorie: true,
        },

        take: 10,
      });
    } else {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            categorieId: categorieId,
          },
        },
        include: {
          Utilisateur: true,
          Categorie: true,
        },
        take: 10,
      });
    }
  } else if (valide) {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
        AND: {
          etat: valide,
        },
      },
      include: {
        Utilisateur: true,
        Categorie: true,
      },
      take: 10,
    });
  } else {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
      },
      take: 10,
      include: {
        Utilisateur: true,
        Categorie: true,
      },
    });
  }
  if (magasins.length)
    res.status(200).json({ magasins: magasins, total: total });
  else
    res.status(400).json({
      message: 'il y a pas des magasins !',
    });
};
const getDashMagasinsByPage = async (req, res) => {
  const { dateOrder, nom, valide, skip, categorieId } = req.body;
  let magasins;
  if (categorieId) {
    if (valide) {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            etat: valide,
            AND: {
              categorieId: categorieId,
            },
          },
        },
        include: {
          Utilisateur: true,
          Categorie: true,
        },
        take: 10,
        skip: skip,
      });
    } else {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            categorieId: categorieId,
          },
        },
        include: {
          Utilisateur: true,
          Categorie: true,
        },
        take: 10,
        skip: skip,
      });
    }
  } else if (valide) {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
        AND: {
          etat: valide,
        },
      },
      include: {
        Utilisateur: true,
        Categorie: true,
      },
      take: 10,
      skip: skip,
    });
  } else {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
      },
      include: {
        Utilisateur: true,
        Categorie: true,
      },
      take: 10,
      skip: skip,
    });
  }
  if (magasins.length) res.status(200).json(magasins);
  else
    res.status(400).json({
      message: 'il y a pas des magasins !',
    });
};
const getDashMagasinsCount = async (req, res, next) => {
  const { dateOrder, nom, valide, skip, categorieId } = req.body;

  let magasins;
  if (categorieId) {
    if (valide) {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            etat: valide,
            AND: {
              categorieId: categorieId,
            },
          },
        },
      });
    } else {
      magasins = await prisma.magasin.findMany({
        orderBy: { createdAt: dateOrder },
        where: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            categorieId: categorieId,
          },
        },
      });
    }
  } else if (valide) {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
        AND: {
          etat: valide,
        },
      },
    });
  } else {
    magasins = await prisma.magasin.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        nom: { startsWith: nom ? nom : '' },
      },
    });
  }

  if (magasins.length) {
    res.locals.total = magasins.length;
    next();
  } else
    res.status(400).json({
      message: 'il y a pas des magasins !',
    });
};
//           get all valid magasins

const getValidMagasins = async (req, res) => {
  const magasins = await prisma.magasin.findMany({
    where: {
      etat: 'validé',
    },
    include: {
      _count: {
        select: {
          produits: true,
        },
      },
    },
  });
  if (magasins.length === 0)
    res.status(400).json({ message: '0 magasins' });
  else res.status(200).json(magasins);
};

//              get valid by id (unauth)

const getValidMagasinsByIdUnAuth = async (req, res) => {
  const { id } = req.params;
  const magasin = await prisma.magasin.findFirst({
    where: {
      etat: 'validé',
      AND: {
        id: parseInt(id),
      },
    },
    include: {
      Categorie: true,
    },
  });
  if (magasin) res.status(200).send(magasin);
  else res.status(404).send('Not found');
};
//             get valid by id

const getValidMagasinById = async (req, res) => {
  const { id } = req.params;

  const user = req.user;

  const magasin = await prisma.magasin.findFirst({
    where: {
      etat: 'validé',
      AND: {
        id: parseInt(id),
        AND: {
          Utilisateur: {
            id: parseInt(user.id),
          },
        },
      },
    },
    include: {
      Depot: true,
      Categorie: {
        include: {
          Sous_Categorie: true,
        },
      },
    },
  });
  if (magasin) res.status(200).send(magasin);
  else res.status(404).send('Not found');
};
//             get all unvalidated magasins

const getUnValideMagasins = async (req, res) => {
  const magasins = await prisma.magasin.findMany({
    where: {
      etat: 'non-validé',
    },
  });
  if (magasins.length === 0)
    res.status(400).json({ message: '0 magasins' });
  else res.status(200).json(magasins);
};
//             get magasin by name
const getMagasin = async (req, res) => {
  const { name } = req.params;
  const magasin = await prisma.magasin.findFirst({
    where: {
      nom: name,
      AND: {
        etat: 'validé',
      },
    },
  });
  if (!magasin) {
    res.status(404).json({ message: "magasin n'exist pas" });
  } else {
    res.status(200).json(magasin);
  }
};

//                delete magasin

const deleteMagasin = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  console.log(email);
  let text;
  let subject;
  const magasin = await prisma.magasin.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      produits: true,
    },
  });
  const valide = await prisma.magasin.findFirst({
    where: {
      id: parseInt(id),
      AND: {
        etat: 'validé',
      },
    },
  });

  if (!magasin) {
    res.status(404).json({ message: "magasin n'exist pas" });
  } else if (valide) {
    subject = 'Suppression de votre magasin';
    text = `Votre magasin ${valide.nom} a été supprimé par l'admin`;
  } else {
    subject =
      "Répense sur la demande d'ouvrir un magasin sur notre platefrome ";
    text = `Nous sommes désolé de vous informer que votre demande d'ouvrir le magasin nommé (${magasin.nom}) sur notre plateforme a été refusée`;
  }
  const deletedMagasin = await prisma.magasin.update({
    where: {
      id: parseInt(id),
    },
    data: {
      etat: 'non-validé',
    },
  });
  if (deletedMagasin) {
    const user = await prisma.utilisateur.findFirst({
      where: {
        email: email,
      },
      include: {
        Magasin: {
          where: {
            etat: 'validé',
          },
        },
        Favori: true,
      },
    });
    sendToOwner(email, text, subject);
    res.status(200).json(user);
  } else res.status(400);
};

//                 create magasin

const createMagasin = async (req, res) => {
  const {
    nom,
    desc,
    categorieId,
    logo,
    registre,
    utilisateurId,
    fileName,
  } = req.body;
  const user = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(utilisateurId),
    },
  });
  const Depot = {
    nom: nom,
    wilaya: user.wilaya,
    adresse: user.adresse,
  };
  try {
    let uploadLogo;
    if (logo) {
      uploadLogo = await cloudinary.uploader.upload(logo, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'magasins-logo',
      });
    }
    const uploadRegister = await cloudinary.uploader.upload(
      registre,
      {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'magasins-registre',
        public_id: fileName,
        use_filename: true,
        unique_filename: false,
      }
    );
    const magasin = await prisma.magasin.create({
      data: {
        nom,
        description: desc,
        categorieId: parseInt(categorieId),
        logo: uploadLogo ? uploadLogo.url : undefined,
        register_commerce: uploadRegister.url,
        Depot: {
          create: Depot,
        },
        utilisateurId: parseInt(utilisateurId),
      },
    });
    if (magasin) {
      res.status(200).send(magasin);
    }
  } catch (err) {}
};

//           update magasin

const updateMagasin = async (req, res) => {
  const { id } = req.params;
  const { nom, desc, categorieId, logo, register_commerce } =
    req.body;

  let uploadLogo;
  let uploadRegister;
  const selectedMagasin = await prisma.magasin.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  try {
    if (logo) {
      uploadLogo = await cloudinary.uploader.upload(logo, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
      });
    }
    if (register_commerce) {
      uploadRegister = await cloudinary.uploader.upload(
        register_commerce,
        {
          upload_preset: 'ecommerce',
          resource_type: 'auto',
          public_id: fileName,
          use_filename: true,
          unique_filename: false,
        }
      );
    }
    const magasin = await prisma.magasin.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nom: nom ? nom : selectedMagasin.nom,
        description: desc ? desc : selectedMagasin.description,
        categorieId: categorieId
          ? parseInt(categorieId)
          : selectedMagasin.categorieId,
        logo: uploadLogo ? uploadLogo.url : selectedMagasin.logo,
        register_commerce: uploadRegister
          ? uploadRegister.url
          : selectedMagasin.register_commerce,
      },
    });
    if (magasin) {
      res.status(200).send({ message: 'magasin modifié' });
    }
  } catch (err) {}
};
const validerMagasin = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const magasin = await prisma.magasin.update({
    where: {
      id: parseInt(id),
    },
    data: {
      etat: 'validé',
    },
  });
  let text = `Votre demande d'ouvrir un magasin (${magasin.nom}) sur notre site a été acceptée , veuillez-vous appuiyez sur ce lien `;
  let subject = `Admission de votre demande d'ouvrir le magasin : ${magasin.nom}`;
  if (magasin) {
    res.status(200).json({ message: 'magasin validé' });
    const link = '`http://localhost:5173/?update=true';
    sendToOwner(email, text, subject, link);
  } else res.status(200).json({ message: 'magasin refusé' });
};

// addDepot
const addDepot = async (req, res) => {
  const { depot, magasinId } = req.body;

  const magasin = await prisma.magasin.update({
    data: {
      Depot: {
        create: depot,
      },
    },
    where: {
      id: parseInt(magasinId),
    },
    include: {
      Depot: true,
    },
  });

  if (magasin) res.status(200).json(magasin.Depot);
  else res.status(400).json({ message: 'error' });
};
//    delete depot
const deleteDepot = async (req, res) => {
  const { id } = req.params;
  const deletedDepot = await prisma.Depot.delete({
    where: {
      id: parseInt(id),
    },
  });
  if (deletedDepot) {
    res.status(200).json(deletedDepot);
  } else res.status(400);
};

//    add code promos
const addCodesPromos = async (req, res) => {
  const { code, dateFin, percentage } = req.body;
  const date = new Date(dateFin);
  const codePromo = await prisma.code_Promo.create({
    data: {
      code: code,
      data_fin: date,
      percentage: parseInt(percentage),
    },
  });

  if (codePromo) {
    const codes = await prisma.code_Promo.findMany();
    res.status(200).json(codes);
  } else res.status(400);
};
const getCodesPromos = async (req, res) => {
  const codes = await prisma.code_Promo.findMany();
  if (codes) res.status(200).json(codes);
  else res.status(400);
};
const deleteCodePromo = async (req, res) => {
  const { id } = req.params;
  const code = await prisma.code_Promo.delete({
    where: {
      id: parseInt(id),
    },
  });
  if (code) {
    const codes = await prisma.code_Promo.findMany();
    res.status(200).json(codes);
  } else res.status(400);
};
module.exports = {
  createMagasin,
  deleteMagasin,
  getMagasins,
  getMagasin,
  getMagasinById,
  updateMagasin,
  getValidMagasins,
  getUnValideMagasins,
  validerMagasin,
  getValidMagasinById,
  getValidMagasinsByIdUnAuth,
  addDepot,
  deleteDepot,
  getDashMagasins,
  getDashMagasinsCount,
  getDashMagasinsByPage,
  addCodesPromos,
  getCodesPromos,
  deleteCodePromo,
};
