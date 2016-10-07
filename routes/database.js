var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'sql9.freesqldatabase.com',
  user     : 'sql9138818',
  password : 'dL9GUNmHcB',
  database : 'sql9138818'
});

connection.connect(function(err) {
  if (err) {
    console.error('mysql error connecting: ' + err.stack);
    return;
  }

 console.log('connected as id ' + connection.threadId);
});

module.exports = router;
