var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var selectQuery = "SELECT * FROM `freshprintsdesigns` WHERE `Email`= ? AND	`DesignName`= ?";
var insertQuery = "INSERT INTO `freshprintsdesigns`(`Email`, `DesignName`, `Design`) VALUES (?,?,?)";

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


router.post('/save', function(req, res, next) {
	var email = req.body.email;
	var designName = req.body.name;
	var canvas = req.body.canvas;
	var selectArr = [email, designName];
	var insertArr = [email, designName, canvas];
	var msg;


	connection.query(selectQuery, selectArr, function(err, rows, fields) {
		if (err) throw err;

		if(rows.length==0){
			connection.query(insertQuery, insertArr, function(err,results){
				if (err) throw err;

				msg = "Your design was successfully saved!";
				res.jsonp({status: msg});
				res.end("");
				
			});
		}
		else{
			msg = "Design already exists! Please save your design under a different email or name.";
			res.jsonp({status: msg});
			res.end("");
		}
	});




	
});

router.post('/load', function(req, res, next){
	var email = req.body.email;
	var designName = req.body.name;	
	var selectArr = [email, designName];
	var msg, data;

	connection.query(selectQuery, selectArr, function(err, rows, fields) {
		if (err) throw err;

		if(rows.length==0){
			msg = "Design not found!";
			data = rows;
		}
		else{
			msg = "Design successfully loaded!";
			data = rows;
		}
	
		res.jsonp({status: msg, data: data});
		res.end("");
	});


})

module.exports = router;
