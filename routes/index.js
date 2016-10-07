var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/', function(req, res, next) {
  res.render('index', { title: 'Fresh Prints Challenge' });
});

router.get('/upload', function(req, res, next) {
  res.render('index', { title: 'Fresh Prints Challenge' });
});


module.exports = router;
