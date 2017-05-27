var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var routes = require('./routes');
var index = require('./routes/index');
var users = require('./routes/users');
var settings = require('./settings');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
  secret:settings.cookieSecret,
  key:settings.db, // cookie name
  cookie:{maxAge:1000 * 60 * 60 * 24 * 1}, // 1 days
  resave: true, // 強制更新 session
  saveUninitialized: false, // 設置為 false,強制創建一個session,即使用戶未登入
  store: new MongoStore({
    db:settings.db,
    host:settings.host,
    port:settings.port,
    url:'mongodb://localhost:27017/blog'
  }),
}));
// 用來顯示通知
app.use(flash());

app.use('/', index);
app.use('/users', users);



//routes(app);

//http://yunkus.com/connect-flash-usage/
// set flash
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.errors = req.flash('error').toString();
  next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
// 匯出app 供其他模組使用
module.exports = app;
