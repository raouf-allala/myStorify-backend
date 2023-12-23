const express = require('express');
const router = express.Router();
const passport = require('passport');

var cron = require('node-cron');

const {
  loginUser,
  registerUser,
  logoutUser,
  rechargerCredit,
  googleAuth,
  deleteUser,
  updateUserFromUser,
  updateUserFromAdmin,
  getCard,
  updatePassword,
  verifyEmail,
  forgotPass,
  updateForgotPass,
  verifyEditEmail,
  updateEmail,
  getRememberedUser,
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
  getUserByEmail,
  completeInfo,
  updateAdmin,
  updateAdminPassword,
  getStats,
  addAdmin,
} = require('../controllers/compteController');

//cron.schedule('*/5 * * * *', cleanUp);

// update admin
router.patch('/dash/admin', updateAdmin);
router.get('/admin', addAdmin);
//   update admin password
router.patch(
  '/dash/admin/password',
  passport.authenticate('jwt', { session: false }),
  updateAdminPassword
);

//   complet info
router.post('/completeInfo', completeInfo);

//   get user by email
router.post('/email', getUserByEmail);

//   get Remebered User
router.post('/getRememberedUser', getRememberedUser);

//   verify token on first load
router.get(
  '/verifyToken',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send(req.user);
  }
);

//            get Users

router.post('/dash/admin/', getUsersCount, getUsers);
router.post('/dash/admin/paged', getUsersByPage);
router.get('/dash/admin/:id', getUser);
//          add user
router.post('/dash/admin/add', addUser);
//            login user
router.post('/login', loginUser);

//         send contact
router.post('/contactUs', sendContact);

//        add reclamation
router.post(
  '/report',
  passport.authenticate('jwt', { session: false }),
  addReport
);
//  get report by id
router.get('/reports/:id', getReport);
// get  reports
router.post('/reports', getReportsCount, getReports);
router.post('/reports/paged', getReportsByPage);
//         update email
router.post(
  '/verifyEditEmail',
  passport.authenticate('jwt', { session: false }),
  verifyEditEmail
);
router.patch(
  '/updateEmail',
  passport.authenticate('jwt', { session: false }),
  updateEmail
);

//            google login / register

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { session: false }),
  googleAuth
);
router.get(
  '/googleLogin',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send({
      user: req.user,
    });
  }
);

router.delete('/delete/:id', deleteUser);

//    register user
router.post('/registre', registerUser);

//    verifyEmail before register
router.get(
  '/verifyEmail',
  passport.authenticate('jwt', { session: false }),
  verifyEmail
);

//   forgot password
router.post('/forgotPass', forgotPass);
router.get(
  '/verifyForgotPass',
  passport.authenticate('jwt', { session: false })
);

router.patch(
  '/updateForgotPass',
  passport.authenticate('jwt', { session: false }),
  updateForgotPass
);

//             update user from user

router.patch(
  '/update',
  passport.authenticate('jwt', { session: false }),
  updateUserFromUser
);
router.patch('/admin/update', updateUserFromAdmin);
//            logout user

router.post('/logout', logoutUser);

//            recherger credit

router.patch('/credit', rechargerCredit);

//            get carte

router.get(
  '/credit/:code',
  passport.authenticate('jwt', { session: false }),
  getCard
);

//          update password

router.patch(
  '/password',
  passport.authenticate('jwt', { session: false }),
  updatePassword
);
router.get('/stats', getStats);
module.exports = router;
