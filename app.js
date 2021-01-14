var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const Handlebars = require("handlebars");
var moment = require('moment');

 var hbs = require('express-handlebars')
//var hbs = require('handlebars');
//require('./HandlebarHelpers/handlebars')(hbs);
// hbs.registerHelper("inc", function(value, options)
// {
//     return parseInt(value) + 1;
// });

var fileupload = require('express-fileupload')

// const hb = require('handlebars');
// const moment = require("moment");
// var hbss = require('hbs');
// hbss.registerHelper('dateFormat', require('handlebars-dateformat'));

// hb.registerHelper('dateFormat', function (date, options) {
//   const formatToUse = (arguments[1] && arguments[1].hash && arguments[1].hash.format) || "DD/MM/YYYY"
//   return moment(date).format(formatToUse);
// });

// var handlebars = require('handlebars');
// var hbtdate = require('handlebars-helper-formatdate')(handlebars);


var customerRouter = require('./routes/customer');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var vendorRouter = require('./routes/vendor');

var db = require('./Config/connection')

var app = express();

var session = require('express-session')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//setting template engine
app.engine( 'hbs', hbs( { 
  extname: 'hbs', 
  defaultLayout: 'layout', 
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/',
  helpers :{ 
    formatDate: function (date, format) {return moment(date).format(format)},
    ifCond : function(v1, v2, options) {
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    itemRate : function(price,quantity){return parseInt(price)*parseInt(quantity)}
    // ifEquals  : function(arg1, arg2, options) {
    //   return (arg1 == arg2) ? options.fn(this) : options.inverse(this); }
  //  inc: function(value, options) {return parseInt(value) + 1;}
}
// helpers: { formatDate: function (date, format) {return moment(date).format(format)}}
} ) );


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",resave: true,
saveUninitialized: true,cookie:{maxAge:3000000}}))

db.connect((err)=>{
  if(err) console.log("Connection Error : "+err)
   else console.log("DB connected succesfully")})
  
app.use(fileupload())

app.use('/', customerRouter);
app.use('/users', usersRouter);
app.use('/admin',adminRouter)
app.use('/vendor',vendorRouter)

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
