const cloudinary = require('../utils/cloudinary');
const prisma = require('../utils/prismaClient');

//         get all products

const getProducts = async (req, res) => {
  const products = await prisma.produit.findMany({
    include: {
      magasin: true,
      Sous_Categorie: true,
      images: true,
      Review: true,
      discounts: true,
    },
  });
  if (products.length === 0)
    res.status(400).json({ message: '0 produits' });
  else res.status(200).json(products);
};

//        get product by id

const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await prisma.produit.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      images: true,
      Review: {
        include: {
          utilisateur: true,
        },
      },
      Depot: true,
      magasin: true,
      Sous_Categorie: true,
      discounts: true,
    },
  });
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(400).json({ message: 'error not found' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    description,
    prix,
    quantity,
    depotId,
    categorieId,
    image1,
    image2,
    image3,
    image4,
  } = req.body;
  let uploadImage2;
  let uploadImage3;
  let uploadImage4;
  try {
    const uploadImage1 = await cloudinary.uploader.upload(image1, {
      upload_preset: 'ecommerce',
      resource_type: 'auto',
      folder: 'produits',
    });
    if (image2) {
      uploadImage2 = await cloudinary.uploader.upload(image2, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    if (image3) {
      uploadImage3 = await cloudinary.uploader.upload(image3, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    if (image4) {
      uploadImage4 = await cloudinary.uploader.upload(image4, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    let images = [{ image_url: uploadImage1.url }];
    if (uploadImage2) {
      images.push({ image_url: uploadImage2.url });
    }
    if (uploadImage3) {
      images.push({ image_url: uploadImage3.url });
    }
    if (uploadImage4) {
      images.push({ image_url: uploadImage4.url });
    }
    const produit = await prisma.produit.update({
      where: {
        id: parseInt(id),
      },
      data: {
        nom,
        description,
        prix: parseFloat(prix),
        sous_CategorieId: categorieId,
        depotId: parseInt(depotId),
        quantity: parseInt(quantity),
        images: {
          deleteMany: { produitId: parseInt(id) },
          create: Array.from(images),
        },
      },
    });
    if (produit) {
      res.status(200).json({ produit });
    } else res.status(400).send('failed');
  } catch (err) {
    console.log(err);
  }
};

const getMagasinProducts = async (req, res) => {
  const { prixOrder, quantityOrder, dateOrder, nom } = req.body;
  const { id } = req.params;
  let products;
  const total = res.locals.total;
  const categorieId = res.locals.categorieId;

  console.log(categorieId);

  if (categorieId) {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    }
  } else {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    }
  }

  if (products.length !== 0) {
    res.status(200).json({
      products: products,
      total: total,
    });
  } else {
    res.status(400).json({ message: 'Il y a pas des produits !' });
  }
};
const getMagasinProductsByPage = async (req, res) => {
  const { id } = req.params;
  const {
    skip,
    prixOrder,
    quantityOrder,
    categorieId,
    dateOrder,
    nom,
  } = req.body;
  let products;

  if (categorieId) {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          magasinId: parseInt(id),

          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    }
  }
  if (prixOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ prix: prixOrder }],
      where: {
        magasinId: parseInt(id),
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  } else if (quantityOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ quantity: quantityOrder }],
      where: {
        magasinId: parseInt(id),
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  } else if (dateOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        magasinId: parseInt(id),
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  }
  console.log(products);
  if (products.length !== 0) {
    res.status(200).json(products);
  } else {
    res.status(400).json({ message: 'Il y a pas des produits !' });
  }
};

const createProduct = async (req, res) => {
  const {
    nom,
    description,
    prix,
    quantity,
    depotId,
    categorieId,
    image1,
    image2,
    image3,
    image4,
    magasinId,
  } = req.body;
  let uploadImage2;
  let uploadImage3;
  let uploadImage4;
  try {
    const uploadImage1 = await cloudinary.uploader.upload(image1, {
      upload_preset: 'ecommerce',
      resource_type: 'auto',
      folder: 'produits',
    });
    if (image2) {
      uploadImage2 = await cloudinary.uploader.upload(image2, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    if (image3) {
      uploadImage3 = await cloudinary.uploader.upload(image3, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    if (image4) {
      uploadImage4 = await cloudinary.uploader.upload(image4, {
        upload_preset: 'ecommerce',
        resource_type: 'auto',
        folder: 'produits',
      });
    }
    let images = [{ image_url: uploadImage1.url }];
    if (uploadImage2) {
      images.push({ image_url: uploadImage2.url });
    }
    if (uploadImage3) {
      images.push({ image_url: uploadImage3.url });
    }
    if (uploadImage4) {
      images.push({ image_url: uploadImage4.url });
    }
    const produit = await prisma.produit.create({
      data: {
        nom,
        description,
        prix: parseFloat(prix),
        magasinId: parseInt(magasinId),
        sous_CategorieId: categorieId,
        depotId: parseInt(depotId),
        quantity: parseInt(quantity),
        images: {
          create: Array.from(images),
        },
      },
    });
    if (produit) {
      res.status(200).json({ produit });
    } else res.status(400).send('failed');
  } catch (err) {
    console.log(err);
  }
};

//                  delete produit
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const produit = await prisma.produit.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  if (produit) {
    const deleteImages = prisma.image.deleteMany({
      where: {
        produitId: parseInt(id),
      },
    });
    const deleteReviews = prisma.review.deleteMany({
      where: {
        produitId: parseInt(id),
      },
    });
    const deleteFavori = prisma.favori.deleteMany({
      where: {
        produitId: parseInt(id),
      },
    });
    const deleteCommande = prisma.commande_Produit.deleteMany({
      where: {
        produitId: parseInt(id),
      },
    });
    const deleteDiscount = prisma.discount.deleteMany({
      where: {
        produitId: parseInt(id),
      },
    });
    const deleteProduit = prisma.produit.delete({
      where: {
        id: parseInt(id),
      },
    });
    const transaction = await prisma
      .$transaction([
        deleteImages,
        deleteReviews,
        deleteFavori,
        deleteDiscount,
        deleteCommande,
        deleteProduit,
      ])
      .then(() => {
        res.status(200).json({ message: 'produit supprimé' });
      });
  } else {
    res.status(400).json({ message: 'produit not found' });
  }
};
const getUserFavorites = async (req, res) => {
  const user = req.user;
  const favorites = await prisma.favori.findMany({
    where: {
      utilisateurId: user.id,
    },
    include: {
      produit: {
        include: {
          Review: true,
          images: true,
          Sous_Categorie: true,
          magasin: true,
          discounts: true,
        },
      },
    },
  });
  if (favorites) {
    res.status(200).json(favorites);
  }
};
const removeProductFromWishlist = async (req, res) => {
  const { id } = req.params;
  await prisma.favori.delete({
    where: {
      id: parseInt(id),
    },
  });
  res.status(200).json({ message: 'Produit supprimé du favoris' });
};
const addProductToWishlist = async (req, res) => {
  const user = req.user;
  const { produitId } = req.body;
  await prisma.favori.create({
    data: {
      utilisateur: {
        connect: {
          id: user.id,
        },
      },
      produit: {
        connect: {
          id: produitId,
        },
      },
    },
  });
  res.status(200).json({ message: 'Produit ajouté au favoris' });
};
const getRandomProducts = async (req, res) => {
  const { number } = req.params;
  const productsCount = await prisma.produit.count();
  const skip = Math.floor(Math.random() * productsCount);
  const products = await prisma.produit.findMany({
    take: parseInt(number),
    skip: skip,
    include: {
      images: true,
      magasin: true,
      Review: true,
      Sous_Categorie: true,
      discounts: true,
    },
  });
  res.send(products);
};
const getProductsByCategory = async (req, res) => {
  const { sous_CategorieId } = req.body;
  const products = await prisma.produit.findMany({
    where: {
      sous_CategorieId: parseInt(sous_CategorieId),
    },
    include: {
      images: true,
      Review: true,
      Sous_Categorie: true,
      magasin: true,
      discounts: true,
    },
  });
  if (products) {
    res.status(200).send(products);
  }
  const getProductsbyName = async (req, res) => {
    const { name } = req.body;
    const products = await prisma.produit.findMany({
      where: {
        nom: { startsWith: { name } },
      },
      include: {
        images: true,
        Review: true,
        Sous_Categorie: true,
        magasin: true,
        discounts: true,
      },
    });
    if (products.length) res.status(200).send(products);
  };
};
const getMagasinProductsCount = async (req, res, next) => {
  const { prixOrder, quantityOrder, categorieId, dateOrder, nom } =
    req.body;
  const { id } = req.params;

  let products;

  console.log(categorieId);
  if (categorieId) {
    products = await prisma.produit.findMany({
      where: {
        magasinId: parseInt(id),
        AND: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },
      },
    });
  } else {
    products = await prisma.produit.findMany({
      where: {
        magasinId: parseInt(id),
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },
    });
  }
  if (products) {
    res.locals.total = products.length;
    console.log(products.length);
    res.locals.categorieId = categorieId;
    next();
  } else res.status(400).json({ message: '0 produits' });
};
const getMagasinProductsUnAuth = async (req, res) => {
  const { id } = req.params;
  const produits = await prisma.produit.findMany({
    where: {
      magasinId: parseInt(id),
    },
    include: {
      images: true,
      Review: true,
      discounts: true,
    },
  });
  res.status(200).send(produits);
};
const getDiscountsProducts = async (req, res) => {
  const discounts = await prisma.discount.findMany({
    include: {
      produit: {
        include: {
          Review: true,
          images: true,
          magasin: true,
          discounts: true,
          Sous_Categorie: true,
        },
      },
    },
  });
  if (discounts) {
    res.status(200).send(discounts);
  }
};
//     get products by admin
const getAdminProducts = async (req, res) => {
  const { prixOrder, quantityOrder, dateOrder, nom } = req.body;
  let products;
  const total = res.locals.total;
  const categorieId = res.locals.categorieId;

  console.log(categorieId);

  if (categorieId) {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    }
  } else {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          nom: { startsWith: nom ? nom : '' },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          nom: { startsWith: nom ? nom : '' },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          nom: { startsWith: nom ? nom : '' },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
      });
    }
  }

  if (products.length !== 0) {
    res.status(200).json({
      products: products,
      total: total,
    });
  } else {
    res.status(400).json({ message: 'Il y a pas des produits !' });
  }
};
const getAdminProductsByPage = async (req, res) => {
  const {
    skip,
    prixOrder,
    quantityOrder,
    categorieId,
    dateOrder,
    nom,
  } = req.body;
  let products;

  if (categorieId) {
    if (prixOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ prix: prixOrder }],
        where: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    } else if (quantityOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ quantity: quantityOrder }],
        where: {
          magasinId: parseInt(id),
          AND: {
            sous_CategorieId: parseInt(categorieId),
            AND: {
              nom: { startsWith: nom ? nom : '' },
            },
          },
        },
        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    } else if (dateOrder) {
      products = await prisma.produit.findMany({
        orderBy: [{ createdAt: dateOrder }],
        where: {
          sous_CategorieId: parseInt(categorieId),
          AND: {
            nom: { startsWith: nom ? nom : '' },
          },
        },

        include: {
          images: true,
          Sous_Categorie: true,
          Review: true,
          discounts: true,
        },
        take: 10,
        skip: parseInt(skip),
      });
    }
  }
  if (prixOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ prix: prixOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  } else if (quantityOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ quantity: quantityOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  } else if (dateOrder) {
    products = await prisma.produit.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
      },

      include: {
        images: true,
        Sous_Categorie: true,
        Review: true,
        discounts: true,
      },
      take: 10,
      skip: parseInt(skip),
    });
  }
  console.log(products);
  if (products.length !== 0) {
    res.status(200).json(products);
  } else {
    res.status(400).json({ message: 'Il y a pas des produits !' });
  }
};
const getAdminProductsCount = async (req, res, next) => {
  const { prixOrder, quantityOrder, categorieId, dateOrder, nom } =
    req.body;
  const { id } = req.params;

  let products;

  console.log(categorieId);
  if (categorieId) {
    products = await prisma.produit.findMany({
      where: {
        sous_CategorieId: parseInt(categorieId),
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },
    });
  } else {
    products = await prisma.produit.findMany({
      where: {
        nom: { startsWith: nom ? nom : '' },
      },
    });
  }
  if (products) {
    res.locals.total = products.length;
    console.log(products.length);
    res.locals.categorieId = categorieId;
    next();
  } else res.status(400).json({ message: '0 produits' });
};
const getDashTopProducts = async (req, res) => {
  const { id } = req.params;
  const products = await prisma.produit.findMany({
    where: {
      magasinId: parseInt(id),
    },
    include: {
      _count: {
        select: {
          Commande_Produit: true,
        },
      },
      images: true,
    },
  });
  function compare(a, b) {
    return b._count.Commande_Produit - a._count.Commande_Produit;
  }
  const sorted = products.sort(compare);
  res.status(200).json(sorted);
};
const getTopProducts = async (req, res) => {
  const products = await prisma.produit.findMany({
    include: {
      _count: {
        select: {
          Commande_Produit: true,
        },
      },
      images: true,
      discounts: true,
      Review: true,
    },
  });
  function compare(a, b) {
    return b._count.Commande_Produit - a._count.Commande_Produit;
  }
  const sorted = products.sort(compare);
  res.status(200).json(sorted);
};
const addDiscount = async (req, res) => {
  const { produitId, dateDebut, dateFin, percentage } = req.body;
  const discountDeleted = await prisma.discount.create({
    data: {
      pourcentage: parseInt(percentage),
      date_debut: dateDebut,
      date_fin: dateFin,
      produitId: produitId,
      valide: true,
    },
  });
  if (discountDeleted) {
    const discount = await prisma.discount.findMany();
    res.status(200).json(discount);
  } else res.status(400);
};
const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  const discount = await prisma.discount.deleteMany({
    where: {
      produitId: parseInt(id),
    },
  });
  if (discount) res.status(200).json(discount);
  else res.status(400);
};
const reviewProduct = async (req, res) => {
  const { user } = req;
  const { productId, rating, title, desc } = req.body;
  const review = await prisma.review.create({
    data: {
      date: '2023-06-03',
      evaluation: parseInt(rating),
      title: title,
      description: desc,
      produit: {
        connect: {
          id: parseInt(productId),
        },
      },
      utilisateur: {
        connect: {
          id: parseInt(user.id),
        },
      },
    },
  });
  res.send({ message: 'review created' });
};
module.exports = {
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
  getAdminProducts,
  getAdminProductsCount,
  getAdminProductsByPage,
  getDashTopProducts,
  getTopProducts,
  addDiscount,
  deleteDiscount,
  reviewProduct,
};
