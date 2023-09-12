const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var GoogleStrategy = require('passport-google-oauth2').Strategy;

const dotenv = require('dotenv');
const passport = require('passport');
const prisma = require('./prismaClient');

dotenv.config();
const opts = {};
const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
  }
  return token;
};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    let loggedUser;
    if (jwt_payload.type === 'user') {
      const user = await prisma.utilisateur.findFirst({
        where: {
          id: jwt_payload.id,
        },
        include: {
          Magasin: {
            where: {
              etat: 'validé',
            },
          },
        },
      });
      loggedUser = user;
    } else if (jwt_payload.type === 'admin') {
      const admin = await prisma.admin.findFirst({
        where: {
          id: jwt_payload.id,
        },
      });
      loggedUser = admin;
      console.log('bob', loggedUser);
    }

    if (loggedUser) {
      return done(null, loggedUser);
    } else {
      console.log(loggedUser);
      return done(' blob erreur', false);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await prisma.utilisateur.findFirst({
    where: {
      id: id,
    },
    include: {
      Magasin: {
        where: {
          etat: 'validé',
        },
      },
    },
  });
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        'https://mystorify-api.cyclic.app/api/users/auth/google/redirect',
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      const user = await prisma.utilisateur.findFirst({
        where: {
          email: profile.emails[0].value,
        },
        include: {
          Magasin: {
            where: {
              etat: 'validé',
            },
          },
        },
      });
      if (user) {
        console.log(user);
        done(null, user);
      } else {
        const newUser = await prisma.utilisateur.create({
          data: {
            nom: profile.family_name,
            prenom: profile.given_name,
            email: profile.emails[0].value,
            password: 'null',
            telephone: 0,
            adresse: 'non',
            wilaya: 'non',
            credit: 0,
            verifier: true,
          },
        });
        console.log('new User', newUser);
        done(null, newUser);
      }
    }
  )
);
