//express setup stuff
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//database functions route
var database = require('./routes/database');

//multer setup for image uploads
var multer = require('multer');
var upload = multer({ dest: 'uploads' })

var app = express();

// using plain HTML for views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//public assets
app.use(express.static(path.join(__dirname, 'public')));
//routes to uploaded pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//route to database functions
app.use('/database', database);

//render homepage
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Fresh Prints Challenge' });
});

//upload photos to upload folder
app.post('/', upload.single('userFile'), function(req,res){
  console.log(req.file);
  res.end(JSON.stringify(req.file));
});
  
module.exports = app;
