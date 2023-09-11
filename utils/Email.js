const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

let transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  secure: false,
  auth: {
    user: 'skandarcron@gmail.com', // ur email (gamil)
    pass: 'wrsgptgixyrzzreq', // ur password (gamil)
  },
});

// send mail with defined transport object
module.exports = {
  verifyUserEmail: async function verifyUserEmail(
    userEmail,
    userName,
    dest
  ) {
    let info = await transporter.sendMail(
      {
        from: process.env.EMAIL_SEND,
        to: userEmail,
        subject:
          'Salut ' +
          userName +
          ' sil vous plaît appuyer sur le lien suivant p= aour confirmer votre E-mail',
        html: process.env.SITE_HOST + 'verifyEmail/',
      },
      (err, res) => {
        if (err) console.log(err);
        else {
          console.log(res);
        }
      }
    );
  },
  verifyUpdatedEmail: async function verifyUserEmail(
    userEmail,
    userName
  ) {
    let info = await transporter.sendMail(
      {
        from: process.env.EMAIL_SEND,
        to: userEmail,
        subject:
          'Salut ' +
          userName +
          ' sil vous plaît appuyer sur le lien suivant pour confirmer votre E-mail',
        html:
          process.env.SITE_HOST +
          'verifyEditEmail' +
          '?email=' +
          userEmail,
      },
      (err, res) => {
        if (err) console.log(err);
        else {
          console.log(res);
        }
      }
    );
  },
  verifyForgotPass: async function verifyforgotPass(
    userEmail,
    userName
  ) {
    let info = await transporter.sendMail(
      {
        from: process.env.EMAIL_SEND,
        to: userEmail,
        subject:
          'Salut ' +
          userName +
          ' sil vous plaît appuyer sur le lien suivant pour changer votre mot de pass',
        html: process.env.SITE_HOST + 'forgotPass/update',
      },
      (err, res) => {
        if (err) console.log(err);
        else {
          console.log(res);
        }
      }
    );
  },
  contactUs: async function verifyforgotPass(userName, desc) {
    let info = await transporter.sendMail(
      {
        from: process.env.EMAIL_SEND,
        to: 'skandarcron@gmail.com',
        subject: 'Contactez-nous message depuis ' + userName,
        html: desc,
      },
      (err, res) => {
        if (err) console.log(err);
        else {
          console.log(res);
        }
      }
    );
  },
  sendToOwner: async function sendToOwner(
    email,
    text,
    subject,
    link
  ) {
    let info = await transporter.sendMail(
      {
        from: process.env.EMAIL_SEND,
        to: email,
        subject: subject,
        html: `<h3>${text}<br/>${link}</h3>`,
      },
      (err, res) => {
        if (err) console.log(err);
        else {
          console.log(res);
        }
      }
    );
  },
};
