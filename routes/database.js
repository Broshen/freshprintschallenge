var express = require('express');
var mysql = require('mysql');
var router = express.Router();

// Queries to select and insert from database
var selectQuery = "SELECT * FROM `freshprintsdesigns` WHERE `Email`= ? AND	`DesignName`= ?";
var insertQuery = "INSERT INTO `freshprintsdesigns`(`Email`, `DesignName`, `Design`) VALUES (?,?,?)";

//connect to database
var config = {
	host     : 'us-cdbr-iron-east-04.cleardb.net',
	user     : 'be3a19940762f7',
	password : 'fdf0a46a',
	database : 'heroku_3c3f8da92d69a30'
};

var connection;

//endpoint for saving a design to database
router.post('/save', function(req, res, next) {
	var email = req.body.email;
	var designName = req.body.name;
	var canvas = req.body.canvas;
	var selectArr = [email, designName];
	var insertArr = [email, designName, canvas];
	var msg;

	//first check if a design with the same name under the same user has already been saved
	connection.query(selectQuery, selectArr, function(err, rows, fields) {
		if (err) throw err;

		//if not, save the design, otherwise, inform them that design already exists
		//currently no way to overload and save over previous design
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

//endpoint for loading a previously saved design
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

//handle disconnects gracefully - source: http://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
function handleDisconnect() {
  connection = mysql.createConnection(config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

module.exports = router;
