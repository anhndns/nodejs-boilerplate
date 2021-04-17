const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();
require('./logger');
require('./middlewares/passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const apiAuthRouter = require('./routes/api/auth');

const app = express();
const loggerstream = {
  write(message) {
    logger.info(message);
  },
};

app.use(morgan('combined', { stream: loggerstream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/api/auth', apiAuthRouter);

module.exports = app;
