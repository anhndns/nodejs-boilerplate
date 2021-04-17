const passport = require('passport');
const LocalStrategy = require('passport-local');
const authService = require('../services/auth');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'user[email]',
      passwordField: 'user[password]',
    },
    (email, password, done) => {
      authService.login(
        { email, password },
        (systemOrSyntaxError, user, valueError) => {
          done(systemOrSyntaxError, user, valueError);
        }
      );
    }
  )
);
