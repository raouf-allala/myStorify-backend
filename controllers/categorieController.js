const prisma = require('../utils/prismaClient');

//           get all categories
const getCategories = async (req, res) => {
  const categories = await prisma.categorie.findMany({
    include: {
      Sous_Categorie: true,
    },
  });
  if (categories.length === 0)
    res.status(400).json({ message: '0 catégories' });
  else res.status(200).json(categories);
};
//     get categories by magasin
const getCategoriesByMagasin = async (req, res) => {
  const { id } = req.params;
  const categories = await prisma.categorie.findMany({
    where: {
      id: parseInt(id),
    },
    include: {
      Sous_Categorie: true,
    },
  });
  if (categories.length === 0)
    res.status(400).json({ message: '0 catégories' });
  else res.status(200).send(categories);
};

//            create categorie

const createCategorie = async (req, res) => {
  const { nom, desc } = req.body;
  const exist = await prisma.categorie.findFirst({
    where: {
      nom: nom,
    },
  });
  if (exist) {
    res.status(400).json({ message: 'Ce nom deja exist !' });
  } else {
    const categorie = await prisma.categorie.create({
      data: {
        nom: nom,
        description: desc,
      },
    });
    if (categorie) res.status(200).json({ message: 'categorie creé' });
    else res.status(400).json({ message: 'error' });
  }
};
//  add sous categorie
const addSousCategorie = async (req, res) => {
  const { nomAdd, descAdd, categorieId } = req.body;
  const exist = await prisma.Sous_Categorie.findFirst({
    where: {
      nom: nomAdd,
    },
  });
  if (exist) {
    res.status(400).json({ message: 'Ce nom deja exist !' });
  } else {
    const categorie = await prisma.Sous_Categorie.create({
      data: {
        nom: nomAdd,
        description: descAdd,
        categorieId: parseInt(categorieId),
      },
    });
    if (categorie) {
      const cates = await prisma.Sous_Categorie.findMany({
        where: {
          categorieId: parseInt(categorieId),
        },
      });
      res.status(200).json(cates);
    } else res.status(400).json({ message: 'error' });
  }
};

//               delete categorie

const deleteCategorie = async (req, res) => {
  const { id } = req.params;
  const checkCategorie = await prisma.categorie.findFirst({
    where: {
      id: parseInt(id),
      AND: {
        magasin: { some: {} },
      },
    },
  });
  if (checkCategorie) {
    res.status(400).json({ message: 'Cette catégorie a des magasins ! ' });
  } else {
    const deleteCategorie = await prisma.categorie.delete({
      where: {
        id: parseInt(id),
      },
    });
    if (deleteCategorie) {
      const categories = await prisma.categorie.findMany();
      res.status(200).json(categories);
    } else res.status(400).json({ message: 'error' });
  }
};
//              delete sous categorie
const deleteSousCategorie = async (req, res) => {
  const { id } = req.params;
  const { categorieId } = req.body;
  const checkCategorie = await prisma.Sous_Categorie.findFirst({
    where: {
      id: parseInt(id),
      AND: {
        produits: { some: {} },
      },
    },
  });
  console.log(checkCategorie);
  if (checkCategorie) {
    res.status(400).json({ message: 'Cette catégorie a des porduits ! ' });
  } else {
    const deleteCategorie = await prisma.Sous_Categorie.delete({
      where: {
        id: parseInt(id),
      },
    });
    if (deleteCategorie) {
      const categories = await prisma.Sous_Categorie.findMany({
        where: {
          categorieId: parseInt(categorieId),
        },
      });
      res.status(200).json(categories);
    } else res.status(400).json({ message: 'error' });
  }
};

//              update categorie

const updateCategorie = async (req, res) => {
  const { id } = req.params;
  const { nom, desc } = req.body;
  const selectedCategorie = await prisma.categorie.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  const newCategorie = await prisma.categorie.update({
    where: {
      id: parseInt(id),
    },
    data: {
      nom: nom ? nom : selectedCategorie.nom,
      description: desc ? desc : selectedCategorie.description,
    },
  });
  if (newCategorie) {
    const cates = await prisma.categorie.findMany();
    res.status(200).json(cates);
  } else res.status(400).json({ message: 'error' });
};
//   update sous categories
const updateSousCategorie = async (req, res) => {
  const { id } = req.params;
  const { nom, desc, categorieId } = req.body;
  const selectedCategorie = await prisma.Sous_Categorie.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  const newCategorie = await prisma.Sous_Categorie.update({
    where: {
      id: parseInt(id),
    },
    data: {
      nom: nom ? nom : selectedCategorie.nom,
      description: desc ? desc : selectedCategorie.description,
    },
  });
  if (newCategorie) {
    const cates = await prisma.Sous_Categorie.findMany({
      where: {
        categorieId: categorieId,
      },
    });
    res.status(200).json(cates);
  } else res.status(400).json({ message: 'error' });
};

module.exports = {
  getCategories,
  getCategoriesByMagasin,
  createCategorie,
  deleteCategorie,
  updateCategorie,
  updateSousCategorie,
  addSousCategorie,
  deleteSousCategorie,
};
