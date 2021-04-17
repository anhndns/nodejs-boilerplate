const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Identity, Either } = require('ramda-fantasy');
const R = require('ramda');
const { Sequelize, Model, DataTypes } = require('sequelize');

const algorithm = 'HS256';
const sequelize = new Sequelize('db', 'root', 'abcd', {
  dialect: 'mysql',
  dialectOptions: {
    // Your mysql2 options here
  },
});
class UserModel extends Model {}
UserModel.init(
  {
    _id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: DataTypes.STRING,
    hash: DataTypes.STRING(1024),
    salt: DataTypes.STRING,
  },
  { sequelize, modelName: 'user' }
);

const User = (value) => Identity(value);
User.from = (value) => Identity(value);

const format = ({ email, hash, salt }) => ({ email, hash, salt });

const setPassword = ({ password, ...props }) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
    .toString('hex');
  return {
    ...props,
    salt,
    hash,
  };
};

const validatePassword = ({ password }) => ({ salt, hash }) => {
  const incomingHash = crypto
    .pbkdf2Sync(password, salt, 10000, 512, 'sha512')
    .toString('hex');
  return hash === incomingHash;
};

const secret = process.env.TOKEN_SECRET;
const toAuthJSON = ({ email, _id }) => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return {
    email,
    _id,
    token: jwt.sign(
      {
        email,
        id: _id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
      },
      secret,
      { algorithm }
    ),
  };
};

const userModel2User = (userM) => User.from(userM).map(toAuthJSON).value;
const register = async (user, onDone) => {
  const finalUser = User.from(user).map(setPassword).value;
  await sequelize.sync();
  const newUser = await UserModel.create(finalUser);
  onDone(User.from(newUser).map(toAuthJSON).value);
};
const error = Either.Left({
  errors: { message: 'Email or password is invalid' },
});

const checkUser = R.ifElse(R.identity, Either.Right, R.always(error));

const validateFn = R.curry(
  (user, findingData) => User.from(findingData).map(validatePassword(user)).value
);

const validatePasswordUser = (user) => R.ifElse(validateFn(user), Either.Right, R.always(error));

const login = async (user, onDone) => {
  try {
    const findingData = await UserModel.findOne({ email: user.email });
    const eitherLogin = Either.Right(findingData)
      .chain(checkUser)
      .chain(validatePasswordUser(user))
      .map(userModel2User);
    eitherLogin.either(
      (errorValue) => onDone(null, false, errorValue),
      (fetchedUser) => onDone(null, fetchedUser)
    );
  } catch (er) {
    onDone(er);
  }
};
module.exports.toAuthJSON = toAuthJSON;
module.exports.format = format;
module.exports.validatePassword = validatePassword;
module.exports.setPassword = setPassword;
module.exports.User = User;
module.exports.register = register;
module.exports.login = login;
