var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
var fileUpload = require('express-fileupload');
var db = require('./db-connect/connectdb');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/', partialDir: __dirname + 'views/partials/'
}))
app.use(fileUpload())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({ secret: "Key", cookie: { maxAge: 6050000 } }));
app.use(session({
  name: 'mza_Cart',
  secret: 'm$cookie',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: ((1000 * 60) * 100)
  }
}));

db.connect((err => {
  if (err) {
    console.log('Error Occured' + err);
    process.exit(0);
  } else console.log('MongoDB Connected Successfully');
}))

app.use('/', indexRouter);
app.use('/admin', adminRouter);
// app.use(express.static('views/admin/icons'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  user = req.session.user
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error', { user });
});

module.exports = app;
