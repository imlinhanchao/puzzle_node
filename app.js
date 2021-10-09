var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let session = require('express-session');
let robots = require('express-robots');
let FileStore = require('session-file-store')(session);
const config = require('./config.json');

var index = require('./routes/index');
var puzzle = require('./routes/puzzle');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: config.identityKey,
  secret: config.secret,
  store: new FileStore(),
  saveUninitialized: false,
  resave: false,
  cookie: {
      maxAge: 60 * 60 * 24 * 1000 * 365  // 有效期，单位是毫秒
  }
}));

app.use('/', index);
app.use('/', puzzle);
app.use(function(req, res, next) {
  res.status(404).send('Page not found.');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
