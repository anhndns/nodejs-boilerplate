const express = require('express');
const passport = require('passport');
const authMiddleware = require('../../middlewares/auth');
const authService = require('../../services/auth');

const router = express.Router();

router.post('/register', authMiddleware.optional, (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return authService.register(user, (finalUser) => res.json(finalUser));
});

router.post('/login', authMiddleware.optional, (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    (err, passportUser, messageError) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        return res.json({ passportUser });
      }

      return res.status(400).json({ status: 400, ...messageError });
    }
  )(req, res, next);
});

module.exports = router;
