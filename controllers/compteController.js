const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prismaClient');
const {
  verifyForgotPass,
  verifyUserEmail,
  verifyUpdatedEmail,
  contactUs,
} = require('../utils/Email');

const dotenv = require('dotenv');

dotenv.config();
// register
const cleanUp = async (req, res) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - 15);
  const unverifiedUsers = await prisma.utilisateur.deleteMany({
    where: {
      verifier: false,
      createdAt: { lt: date },
    },
  });
};
// get user by email
const getUserByEmail = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.utilisateur.findFirst({
    where: {
      email: email,
    },
  });
  if (user) res.status(200).json(user);
  else res.status(400);
};
//      complete info
const completeInfo = async (req, res) => {
  const { wilaya, adresse, telephone, email } = req.body;
  const user = await prisma.utilisateur.update({
    where: {
      email: email,
    },
    data: {
      wilaya: wilaya,
      adresse: adresse,
      telephone: parseInt(telephone),
    },
  });
  if (user) {
    res.status(200).json(user);
  } else res.status(400);
};

//     add User by admin
const addUser = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, telephone, adresse, wilaya } =
    req.body;
  const existUser = await prisma.utilisateur.findFirst({
    where: {
      email: email,
    },
  });
  const existAdmin = await prisma.admin.findFirst({
    where: {
      email: email,
    },
  });
  if (existUser || existAdmin) {
    res.status(400).json({ message: 'Ce compte deja existé !' });
  } else if (adresse === '') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = await prisma.admin.create({
      data: {
        nom: nom,
        prenom: prenom,
        email: email,
        password: hashedPassword,
      },
    });
    if (admin) res.status(200).json(admin);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        password: hashedPassword,
        telephone: parseInt(telephone),
        adresse,
        wilaya,
        credit: 0,
        verifier: true,
      },
    });
    if (user) res.status(200).json(user);
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { nom, prenom, email, password, telephone, adresse, wilaya } =
    req.body;
  const exist = await prisma.utilisateur.findFirst({
    where: {
      email: email,
    },
  });
  if (exist) {
    res.status(400).json({ message: 'Ce compte deja existé !' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone: parseInt(telephone),
      adresse,
      wilaya,
      credit: 0,
    },
  });
  const newUser = await prisma.utilisateur.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    const payload = {
      id: newUser.id,
      nom: newUser.nom,
    };
    verifyUserEmail(email, nom);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.json({ mes: 'cookie set ' });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const addAdmin = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password', salt);
  const admin = await prisma.admin.create({
    data: {
      nom: 'admin',
      prenom: 'admin',
      email: 'admin@app.com',
      password: hashedPassword,
    },
  });
  if (admin) {
    res.status(200).json(admin);
  }
};
// verifyUser

const verifyEmail = async (req, res) => {
  const user = req.user;

  const verifiedUser = await prisma.utilisateur.update({
    where: {
      email: user.email,
    },
    data: {
      verifier: true,
    },
  });
  if (verifiedUser) {
    res.clearCookie('token', { httpOnly: true });
    res.status(200).json({ message: 'verified' });
  } else throw new Error('failed to verify');
};
// verify edit email
const verifyEditEmail = async (req, res) => {
  const { nom, newEmail } = req.body;
  const user = await prisma.utilisateur.findFirst({
    where: {
      email: newEmail,
    },
  });
  if (user)
    res.status(400).json({
      message: 'Cette adresse email deja existe !',
    });
  else {
    verifyUpdatedEmail(newEmail, nom);
    res.status(200).json('email sent');
  }
};
// update email
const updateEmail = async (req, res) => {
  const { newEmail } = req.body;
  const user = req.user;
  let updated;

  if (newEmail !== user.email) {
    updated = await prisma.utilisateur.update({
      where: {
        id: user.id,
      },
      data: {
        email: newEmail,
      },
    });
  }
  if (updated) {
    res.status(200).send(updated);
  } else res.status(400).send('error');
};
// forgotPass

const forgotPass = async (req, res) => {
  const { email } = req.body;

  const user = await prisma.utilisateur.findFirst({
    where: {
      email: email,
      verifier: true,
    },
  });
  if (!user)
    res.status(400).json({
      message: "Ce compte n'exist pas !",
    });
  if (user) {
    const payload = {
      id: user.id,
      nom: user.nom,
    };

    verifyForgotPass(email, user.nom);

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.json({ mes: 'cookie set ' });
  }
};

const updateForgotPass = async (req, res) => {
  const { password } = req.body;
  const user = req.user;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const updatedUser = await prisma.utilisateur.update({
    where: {
      email: user.email,
    },
    data: {
      password: hashedPassword,
    },
  });
  if (updatedUser) {
    res.clearCookie('token');
    res.status(200).json({ email: user.email });
  } else {
    throw new Error('Something went wrong');
  }
};

// login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let loggedUser;
  let type;
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
    },
  });
  const admin = await prisma.admin.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
    loggedUser = user;
    type = 'user';
  } else if (admin) {
    loggedUser = admin;
    type = 'admin';
  }

  if (!loggedUser) {
    return res.status(400).json({
      message: "Ce compte n'existe pas !",
    });
  }
  if (
    loggedUser &&
    (await bcrypt.compare(password, loggedUser.password))
  ) {
    const payload = {
      id: loggedUser.id,
      type: type,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    console.log(token);
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).json(loggedUser);
  } else {
    res.status(400).json({
      message: "L'addresse email ou le mot de pass sont incorrects !",
    });
  }
});

//                   google auth

const googleAuth = async (req, res) => {
  const user = req.user;
  if (user.adresse === 'non') {
    const payload = {
      id: user.id,
      type: 'user',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('token', token, {
      httpOnly: true,
    });
    res.redirect(
      `http://localhost:5173/completeInfo?email=${user.email}`
    );
  } else if (user) {
    const payload = {
      id: user.id,
      type: 'user',
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('token', token, {
      httpOnly: true,
    });
    //res.send(user);
    res.redirect(
      `http://localhost:5173/googleLogin?email=${user.email}`
    );
  } else throw new Error('Something went wrong');
};

const getRememberedUser = async (req, res) => {
  const { email } = req.body;

  let loggedUser;
  let type;
  if (typeof email === 'string') {
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
      },
    });
    const admin = await prisma.admin.findFirst({
      where: {
        email: email,
      },
    });
    if (user) {
      loggedUser = user;
      type = 'user';
    } else if (admin) {
      loggedUser = admin;
      type = 'admin';
    }
    const payload = {
      id: loggedUser.id,
      type: type,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.cookie('token', token, {
      httpOnly: true,
    });
    if (loggedUser) res.status(200).send(loggedUser);
  } else
    res.status(400).json({ message: "Utilisateur n'exist pas !" });
};

//                   delete account

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await prisma.utilisateur.update({
    where: {
      id: parseInt(id),
    },
    data: {
      verifier: false,
    },
  });
  res.status(200).json(user);
};

const logoutUser = (req, res) => {
  res.clearCookie('token', { httpOnly: true });
  res.status(200).json({ message: 'Logout successful' });
};
const rechargerCredit = async (req, res) => {
  const { code, utilisateurId } = req.body;
  const user = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(utilisateurId),
    },
  });
  const response = await prisma.carte_Cadeau.findFirst({
    where: {
      code,
    },
  });

  if (response) {
    if (response.valide) {
      const updatedUser = await prisma.utilisateur.update({
        where: {
          id: parseInt(utilisateurId),
        },
        data: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          password: user.password,
          telephone: user.telephone,
          adresse: user.adresse,
          wilaya: user.wilaya,
          credit: user.credit + response.valeur,
        },
        include: {
          Magasin: true,
        },
      });
      await prisma.carte_Cadeau.update({
        where: {
          id: response.id,
        },
        data: {
          code: response.code,
          id: response.id,
          valeur: response.valeur,
          valide: false,
        },
      });
      res.status(200).json(updatedUser);
    } else {
      res.status(400).json({ message: 'Ce code déja utilisée' });
    }
  } else {
    res.status(400).json({ message: 'Code invalide' });
  }
};
const getCard = async (req, res) => {
  const { code } = req.params;
  const carte = await prisma.carte_Cadeau.findFirst({
    where: {
      code,
    },
  });
  if (carte) {
    if (carte.valide === true) {
      res.status(200).json(carte);
    } else {
      res.status(400).json({ message: 'Carte Déja Utilisée' });
    }
  } else {
    res.status(400).json({ message: 'Carte Invalide' });
  }
};
const updateUserFromUser = async (req, res) => {
  const { id, nom, prenom, email, adresse, telephone, wilaya } =
    req.body;
  const user = req.user;
  if (user.id !== parseInt(id)) {
    return res.status(400).json({ message: 'not allowed' });
  }
  const toUpdateUser = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(id),
    },
  });
};
const updateUserFromAdmin = async (req, res) => {
  const { id, nom, prenom, email, adresse, telephone, wilaya } =
    req.body;

  const toUpdateUser = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  const updatedUser = await prisma.utilisateur.update({
    data: {
      nom: nom ? nom : toUpdateUser.nom,
      prenom: prenom ? prenom : toUpdateUser.prenom,
      email: email ? email : toUpdateUser.prenom,
      adresse: adresse ? adresse : toUpdateUser.adresse,
      telephone: telephone
        ? parseInt(telephone)
        : toUpdateUser.telephone,
      wilaya: wilaya ? wilaya : toUpdateUser.wilaya,
    },
    where: {
      id: parseInt(id),
    },
  });
  if (updatedUser) {
    res.status(200).send(updatedUser);
  } else {
    res.status(400).send({ message: 'erreur' });
  }
};
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user.id;
  const user = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(id),
    },
  });
  if (user.password === 'null') {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.utilisateur.update({
      where: {
        id: parseInt(id),
      },
      data: {
        password: hashedPassword,
      },
    });
    res.status(200).json('changed');
  } else if (
    user &&
    (await bcrypt.compare(oldPassword, user.password))
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.utilisateur.update({
      where: {
        id: parseInt(id),
      },
      data: {
        adresse: user.adresse,
        credit: user.credit,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        wilaya: user.wilaya,
        password: hashedPassword,
      },
    });
    res.status(200).json({ message: 'Mot de passe modifié' });
  } else {
    res.status(400).json({ message: 'Mot de passe incorrect !' });
  }
};
const sendContact = async (req, res) => {
  const { nom, desc } = req.body;
  contactUs(nom, desc);
  res.status(200).send('Votre message a éte envoyer');
};

//         get users

//    getUser by page
const getUsersByPage = async (req, res) => {
  const { dateOrder, hasStore, nom, skip } = req.body;
  let users;
  const total = res.locals.total;

  if (hasStore === true) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: { some: {} },
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },

      take: 10,
      skip: skip,
    });
  } else if (hasStore === false) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: { none: {} },
        AND: {
          nom: { startsWith: nom ? nom : '' },
        },
      },

      take: 10,
      skip: skip,
    });
  } else if (hasStore === 'all') {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
      },

      take: 10,
      skip: skip,
    });
  }

  if (users.length !== 0) {
    res.status(200).json({
      users: users,
      total: total,
    });
  } else {
    res
      .status(400)
      .json({ message: 'Il y a pas des utilisateurs !' });
  }
};

const getUsers = async (req, res) => {
  const { dateOrder, hasStore, nom, livreur } = req.body;
  let users;
  let finalUsers;
  const total = res.locals.total;
  if (livreur) {
    finalUsers = await prisma.livreur.findMany();
  } else if (hasStore === true) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: { some: {} },
        AND: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            verifier: true,
          },
        },
      },

      take: 10,
    });
    finalUsers = users;
  } else if (hasStore === false) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: { none: {} },
        AND: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            verifier: true,
          },
        },
      },

      take: 10,
    });
    finalUsers = users;
  } else if (hasStore === 'all') {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
        AND: {
          verifier: true,
        },
      },

      take: 10,
    });
    const livreurs = await prisma.livreur.findMany();
    finalUsers = users.concat(livreurs);
  }

  if (finalUsers.length !== 0) {
    res.status(200).json({
      users: finalUsers,
      total: total,
    });
  } else {
    res
      .status(400)
      .json({ message: 'Il y a pas des utilisateurs !' });
  }
};

const getUsersCount = async (req, res, next) => {
  const { hasStore, dateOrder, nom, livreur } = req.body;
  let users;
  let finalUsers;
  if (livreur) {
    finalUsers = await prisma.livreur.findMany();
  } else if (hasStore === true) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: {
          some: {},
        },
        AND: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            verifier: true,
          },
        },
      },
    });
    finalUsers = users;
  } else if (hasStore === false) {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        Magasin: { none: {} },
        AND: {
          nom: { startsWith: nom ? nom : '' },
          AND: {
            verifier: true,
          },
        },
      },
    });
    finalUsers = users;
  } else if (hasStore === 'all') {
    users = await prisma.utilisateur.findMany({
      orderBy: [{ createdAt: dateOrder }],
      where: {
        nom: { startsWith: nom ? nom : '' },
        AND: {
          verifier: true,
        },
      },
    });
    const livreurs = await prisma.livreur.findMany();
    finalUsers = users.concat(livreurs);
  }
  if (finalUsers) {
    res.locals.total = finalUsers.length;
    next();
  } else
    res.status(400).json({ message: 'Il ya pas des utilisateurs !' });
};
//        get user
const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await prisma.utilisateur.findFirst({
    where: {
      id: parseInt(id),
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
  if (user) res.status(200).json(user);
  else res.status(400);
};
const addReport = async (req, res) => {
  const { titre, type, desc } = req.body;

  const userId = req.user.id;
  const rep = await prisma.reclamation.create({
    data: {
      type: type,
      description: desc,
      titre: titre,
      utilisateurId: userId,
    },
  });
  if (rep) res.status(200).send('Reclamation ajouté !');
  else res.status(400).send('erreur');
};
const getReports = async (req, res) => {
  const { dateOrder, type, nom } = req.body;
  let reports;
  const total = res.locals.total;
  if (type) {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        type: type,
        AND: {
          titre: { startsWith: nom ? nom : '' },
        },
      },

      include: {
        utilisateur: true,
      },
      take: 10,
    });
  } else {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        titre: { startsWith: nom ? nom : '' },
      },
      include: {
        utilisateur: true,
      },
      take: 10,
    });
  }
  if (reports.length)
    res.status(200).json({ reports: reports, total: total });
  else
    res.status(400).json({
      message: 'il y a pas des reclamations !',
    });
};
const getReportsByPage = async (req, res) => {
  const { dateOrder, type, nom, skip } = req.body;
  let reports;
  const total = res.locals.total;
  if (type) {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        type: type,
        AND: {
          titre: { startsWith: nom ? nom : '' },
        },
      },

      include: {
        utilisateur: true,
      },
      take: 10,
      skip: skip,
    });
  } else {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        titre: { startsWith: nom ? nom : '' },
      },
      include: {
        utilisateur: true,
      },
      take: 10,
      skip: skip,
    });
  }
  if (reports.length) res.status(200).json(reports);
  else
    res.status(400).json({
      message: 'il y a pas des reclamations !',
    });
};
const getReportsCount = async (req, res, next) => {
  const { dateOrder, type, nom } = req.body;

  let reports;
  if (type) {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
      where: {
        type: type,
        AND: {
          titre: { startsWith: nom ? nom : '' },
        },
      },
    });
  } else {
    reports = await prisma.reclamation.findMany({
      orderBy: { createdAt: dateOrder },
    });
  }
  if (reports.length) {
    res.locals.total = reports.length;
    next();
  } else
    res.status(400).json({
      message: 'il y a pas des reclamations !',
    });
};
// get Report by id
const getReport = async (req, res) => {
  const { id } = req.params;
  const report = await prisma.reclamation.findFirst({
    where: {
      id: parseInt(id),
    },
    include: {
      utilisateur: true,
    },
  });
  if (report) res.status(200).json(report);
  else res.status(400);
};

//   update admin
const updateAdmin = async (req, res) => {
  const { email, nom, prenom, id } = req.body;
  const admin = await prisma.admin.update({
    where: {
      id: parseInt(id),
    },
    data: {
      email: email,
      nom: nom,
      prenom: prenom,
    },
  });
  if (admin) res.status(200).json(admin);
  else res.status(400);
};
//  update  admin password

const updateAdminPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user.id;
  const admin = await prisma.admin.findFirst({
    where: {
      id: parseInt(id),
    },
  });

  if (admin && (await bcrypt.compare(oldPassword, admin.password))) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await prisma.admin.update({
      where: {
        id: parseInt(id),
      },
      data: {
        password: hashedPassword,
      },
    });
    res.status(200).json({ message: 'Mot de passe modifié' });
  } else {
    res.status(400).json({ message: 'Mot de passe incorrect !' });
  }
};
const getStats = async (req, res) => {
  const magasinCount = await prisma.magasin.count();
  const usersCount = await prisma.utilisateur.count();
  const productCount = await prisma.produit.count();
  res.status(200).json({
    usersCount: usersCount,
    magasinCount: magasinCount,
    productCount: productCount,
  });
};
const getProductByName = async (req, res) => {
  const { name } = req.params;
  name[0].toUpperCase();
  const products = await prisma.produit.findMany({
    where: {
      nom: {
        contains: name,
      },
    },
    include: {
      images: true,
      discounts: true,
      magasin: true,
      Sous_Categorie: true,
      Review: true,
    },
  });
  res.send(products);
};
module.exports = {
  getUserByEmail,
  completeInfo,
  loginUser,
  registerUser,
  deleteUser,
  logoutUser,
  rechargerCredit,
  googleAuth,
  getRememberedUser,
  updateUserFromUser,
  updateUserFromAdmin,
  getCard,
  updatePassword,
  verifyEmail,
  forgotPass,
  updateForgotPass,
  verifyEditEmail,
  updateEmail,
  sendContact,
  addReport,
  cleanUp,
  getUsers,
  getUsersCount,
  getUsersByPage,
  getUser,
  addUser,
  getReports,
  getReportsCount,
  getReportsByPage,
  getReport,
  updateAdmin,
  updateAdminPassword,
  getStats,
  getProductByName,
  addAdmin,
};
