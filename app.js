var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var database = require('./routes/database');
var uploads = require('./routes/uploads');

var multer = require('multer');
var upload = multer({ dest: 'uploads' })


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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/', routes);
//app.use('/users', users);

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Fresh Prints Challenge' });
});

app.post('/', upload.single('userFile'), function(req,res){
  console.log(req.file);
  res.end(JSON.stringify(req.file));
});

module.exports = app;
