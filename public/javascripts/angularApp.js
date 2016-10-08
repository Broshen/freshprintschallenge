var app = angular.module('fp', []);
var debug=[];

app.controller('MainCtrl', function($scope){


	//initialize canvas
	$scope.canvas = new fabric.Canvas('c');
	$scope.canvas.setDimensions({width: 300, height: 450});

	 //for keeping track of edit history
	$scope.undoHistory = [["New Canvas", $scope.canvas.toDatalessJSON()]];
	$scope.redoHistory = [];

	//for keeping track of canvas text edits
	$scope.canvasText;

	//for keeping track of saving and loading design
	$scope.saveEmail = "";
	$scope.saveName = "";
	$scope.saveResult = "";

	$scope.loadEmail = "";
	$scope.loadName = "";
	$scope.loadResult = "";

	var isMoved=false, isScaled=false, isRotated=false;


	//------------------------------------------------------------------------------------------//
	//------------------Event listeners for editing text that is on the canvas------------------//	
	//------------------------------------------------------------------------------------------//

	//when a text object on canvas is selected, bind it to the edit text input 
	$scope.canvas.on('object:selected', function(e){

		//first remove any event listeners that may be binded to other text objects
		//so that multiple text objects are not binded to the text input
		$('#editInput').off();

		if(e.target.type == "text"){

			//hide the adding text input section, and show the edit text input section
			$('#addtext').hide();
			$('#edittext').show();

			//set the value inside the input box to what's on the canvas
			$scope.canvasText = e.target.text;
			$('#editInput').val($scope.canvasText);

			//attach an event listener to the input box so that when it is updated, the text on the canvas
			//is updated as well
			$('#editInput').on('input', function(){
				e.target.text=$('#editInput').val();
				//renderAll needs to be called because canvas does not show auto render.
				$scope.canvas.renderAll();
			});
		}

	});

	//before a selection is cleared, switch the text input fields back to add, and push to th edit history stack
	$scope.canvas.on('before:selection:cleared', function(e){

		if(e.target.type== "text"){
			//switch text input back to add
			$('#addtext').show();
			$('#edittext').hide();

			//if the edit input field is empty, delete the text field that is on the canvas
			if($('#editInput').val()==''){
				removeCanvasObject();
			}
			//otherwise, save the state onto the edit history stack
			else if($scope.canvasText != $('#editInput').val()){
				saveState("Edited Text");
				$scope.$apply();
			}
		}
	})

	//after a selection is cleared, clear the edit input field, and remove any event listeners attached to it
	$scope.canvas.on('selection:cleared', function(e){
		//clears the textarea for the edit text box
		$('#editInput').val('');
		$('#editInput').off();
	});


	//------------------------------------------------------------------------------------------//
	//----------------Event listeners for editing objects that are on the canvas----------------//	
	//------------------------------------------------------------------------------------------//

	//set the respective flag to true if an object is moved, scaled, or rotated
	$scope.canvas.on('object:moving', function(e){
		isMoved=true;
	});

	$scope.canvas.on('object:scaling', function(e){
		isScaled=true;
	});

	$scope.canvas.on('object:rotating', function(e){
		isRotated=true;
	});

	//after the object is modified, save the state, and set the flag to false
	//$scope.$apply() needs to be called explicitly here to update the edit history stack
	//because Angular doesnt work well with other event listeners
	$scope.canvas.on('object:modified', function(e){

		if(isMoved){
			saveState(e.target.type + " was moved");
			$scope.$apply();
			isMoved=false;
		}
		if(isScaled){
			saveState(e.target.type + " was scaled")
			$scope.$apply();
			isScaled=false;
		}
		if(isRotated){
			saveState(e.target.type + " was rotated");
			$scope.$apply();
			isRotated=false;
		}
	})

	//------------------------------------------------------------------------------------------//
	//-------------------Event listener for uploading an image to the canvas--------------------//	
	//------------------------------------------------------------------------------------------//
	//attach an event listener to the upload button to upload an image to the server
	$("#upload").change(function(e){addImage(e)});

	//send a POST request to the backend, and add the image to the Canvas with the URL 
	//after the upload is complete
	var addImage = function(e) {
        $('#uploadForm').ajaxSubmit({

            error: function(xhr) {
        		console.log('Error: ' + xhr.status);
            },

            success: function(response) {
                debug[0]=response;
                data = JSON.parse(response);
                imgURL = data.path;
                fabric.Image.fromURL(imgURL,function(oImg){
					oImg.scaleToWidth(200);
					$scope.canvas.add(oImg);	  
					saveState("Added Image");
					$scope.$apply();
				});		

            }
	    });
	    //disables page refresh.
	    return false;
	}

	//-----------------------------------------------------------------------------------------------------//
	//-------------------Function to add text to the canvas (binded to the addtext btn)--------------------//	
	//-----------------------------------------------------------------------------------------------------//
	this.addtext = function (){
		//checks to see if text being added is empty or not
		//only add text if not empty string
		if($('#addInput').val()){

			var text = $('#addInput').val();

			var canvasText = new fabric.Text(text, {left: 100, top: 100});

			$scope.canvas.add(canvasText);
			$('#addInput').val(''); //reset the input field after text is added
			saveState("Added Text"); //push to edit history
		}	
	}

	//------------------------------------------------------------------------------------//
	//-------------------Functions to remove an object from the canvas--------------------//	
	//--------------------------------------------------------------- --------------------//

	//if the object is a selection of multiple objects, call removeGroup()
	//otherwise, removeSingleObject()
	this.removeCanvasObject = function (){
		var canvasObject;
		if(canvasObject = $scope.canvas.getActiveGroup()){
			removeGroup(canvasObject);
		}
		else if (canvasObject = $scope.canvas.getActiveObject()){
			removeSingleObject(canvasObject);
		}
		else{
			//TODO - display error message when no object is selected
		}
	}

	//copy function for internal use
	var removeCanvasObject = this.removeCanvasObject;

	//removes a single object from the canvas and saves state to edit history stack
	var removeSingleObject = function (CanvasObj){

		$scope.canvas.remove(CanvasObj);

		if(CanvasObj.type == "image"){
			saveState("Deleted image");
		}
		else{
			saveState("Deleted Text");
		}
	}

	//iterates through every object in the group and removes it using removeSingleObject
	var removeGroup = function (CanvasGroup){
		 CanvasGroup.forEachObject(function(a) {
		 	removeSingleObject(a);
		  });

		$scope.canvas.discardActiveGroup();
		$scope.canvas.renderAll();
	}

	//------------------------------------------------------------------------------------//
	//-------------------Functions for undoing/redoing changes made-----------------------//	
	//--------------------------------------------------------------- --------------------//

	//saves the current state of the canvas, and clears the redoHistory stack
	var saveState = function(history){
		var state = $scope.canvas.toDatalessJSON();
		$scope.undoHistory.push([history, state]);
		$scope.redoHistory = [];
	}

	//loads a state from a JSON object to the canvas
	var loadState = function(state){
		$scope.canvas.loadFromDatalessJSON(state, function(){ 
			$scope.canvas.renderAll(); 
		});
		
	}

	this.undo = function (){
		//cant undo the first change (loading a empty canvas)
		if ($scope.undoHistory.length>1){
			
			//pop the last change on the undo history onto the redo history
			$scope.redoHistory.push($scope.undoHistory.pop());

			//the current state is the one at the top of the undo stack
			var state = $scope.undoHistory[$scope.undoHistory.length-1];
			loadState(state[1]); //load the state
		}
	}

	this.redo = function (){
		//reverse of undo (pop off redoHistory onto undoHistory)
		//still loading the top state on the undoHistory stack
		if ($scope.redoHistory.length>0){
			
			$scope.undoHistory.push( $scope.redoHistory.pop());

			var state = $scope.undoHistory[$scope.undoHistory.length-1];
			loadState(state[1]);
		}
	}
	

	//------------------------------------------------------------------------------------//
	//-------------Functions for saving/loading a canvas from the database----------------//	
	//--------------------------------------------------------------- --------------------//

	this.saveCanvas = function(){
		//dont let user save unless both fields are non empty
		if($scope.saveEmail=="" || $scope.saveName=="" ){
			$scope.saveResult="Please fill out all fields!";
			$('#saveMsg').fadeIn().delay(1000).fadeOut();
		}
		else{
			//turn the current state JSON into a string
			var state = JSON.stringify($scope.canvas.toDatalessJSON());

			//send POST request to save endpoint, which will save it into the mysql database
			$.post('/database/save', {email: $scope.saveEmail, name: $scope.saveName, canvas: state}, function(data, status, xhr){
				if(status=="success"){
					$scope.saveResult=data.status;
				}
				else{
					$scope.saveResult="An error occurred!";
				}

				$('#saveMsg').fadeIn().delay(1000).fadeOut();
			}, 'json');
		}
	}

	this.loadCanvas = function(){
		//dont let user load unless both fields are non empty
		if($scope.loadEmail=="" || $scope.loadName=="" ){
			$scope.loadResult="Please fill out all fields!";
			$('#loadMsg').fadeIn().delay(1000).fadeOut();
		}
		else{
			//initialize to empty string
			$scope.loadResult="";

			//send POST request to load endpoint, and load the canvas from the string 
			//in the callback
			$.post('/database/load', {email: $scope.loadEmail, name: $scope.loadName}, function(data, status, xhr){
				if(status=="success"){

					$scope.loadResult=data.status;

					//if the design exists, parse the string into a JSON, and load the canvas from that JSON
					if(data.data.length != 0){
						var stateJSON = JSON.parse(data.data[0].Design);
						$scope.canvas.loadFromDatalessJSON(stateJSON, function(){ 
							$scope.canvas.renderAll(); 
							saveState("Loaded a saved design");
							$scope.$apply();
						});
					}
				}
				else{
					$scope.loadResult="An error occurred!";
				}

				$('#loadMsg').fadeIn().delay(1000).fadeOut();
			}, 'json');
		}
		
	}
});

