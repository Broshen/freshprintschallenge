var app = angular.module('fp', []);
var debug=[];

app.controller('MainCtrl', function($scope){


	//initialize canvas
	$scope.canvas = new fabric.Canvas('c');
	$scope.canvas.setDimensions({width: 600, height: 400});

	$scope.imageIndex = 0; //for keeping track of adding and removing images

	 //for keeping track of edit history
	$scope.undoHistory = [["New Canvas", $scope.canvas.toDatalessJSON()]];
	$scope.redoHistory = [];

	//for keeping track of canvas text edits
	$scope.canvasText;

	var isMoved=false, isScaled=false, isRotated=false;


	//initialize listeners for editing text
	$scope.canvas.on('object:selected', function(e){

		$scope.canvasObj=e.target;
		$('#editInput').off();

		if(e.target.type == "text"){
			console.log("selected");
			$scope.canvasText = e.target.text;

			$('#editInput').val($scope.canvasText);

			$('#editInput').on('input', function(){
				console.log('input');
				e.target.text=$('#editInput').val();
				$scope.canvas.renderAll();
			});
		}

	});

	$scope.canvas.on('before:selection:cleared', function(e){

		console.log("before deselect");

		if(e.target.type== "text"){
			if($('#editInput').val()==''){
				removeCanvasObject();
			}
			else if($scope.canvasText != $('#editInput').val()){
				saveState("Edited Text");
	    		$scope.$apply();
			}
		}
	})

	$scope.canvas.on('selection:cleared', function(e){
		console.log("deselected");

		//clears the textarea for the edit text box
		$('#editInput').val('');
		$('#editInput').off();
	});

	$scope.canvas.on('object:moving', function(e){
		isMoved=true;
	});

	$scope.canvas.on('object:scaling', function(e){
		isScaled=true;
	});

	$scope.canvas.on('object:rotating', function(e){
		isRotated=true;
	});

	$scope.canvas.on('object:modified', function(e){

		if(isMoved){
			saveState(e.target.type + " was moved");
			$scope.$apply();
			isMoved=false;
		}
		if(isScaled){
			saveState(e.target.type + " was scaled");
			$scope.$apply();
			isScaled=false;
		}
		if(isRotated){
			saveState(e.target.type + " was rotated");
			$scope.$apply();
			isRotated=false;
		}
	})


	$("#upload").change(function(e){addImage(e)});

	var addImage = function(e) {
		console.log("File is uploading...");
        $('#uploadForm').ajaxSubmit({

            error: function(xhr) {
        	console.log('Error: ' + xhr.status);
            },

            success: function(response) {
                console.log(response);
                debug[0]=response;
                data = JSON.parse(response);
                imgURL = data.path;
                fabric.Image.fromURL(imgURL,function(oImg){
					oImg.scaleToWidth(200);
					$scope.canvas.add(oImg);	  
					saveState("Added Image");
					$scope.$apply();
					console.log("applied");
				});		

            }
	    });
	    //disables page refresh.
	    return false;
	}

	this.addtext = function (){
		if($('#addInput').val()){

			var text = $('#addInput').val();

			var canvasText = new fabric.Text(text, {left: 100, top: 100});

			$scope.canvas.add(canvasText);
			$('#addInput').val('');
			saveState("Added Text");
		}	
	}

	this.removeCanvasObject = function (){
		var canvasObject;
		if(canvasObject = $scope.canvas.getActiveGroup()){
			removeGroup(canvasObject);
		}
		else if (canvasObject = $scope.canvas.getActiveObject()){
			console.log('case2');
			removeSingleObject(canvasObject);
		}
		else{
			//TODO - display error message
			console.log('case3');
		}
	}

	var removeCanvasObject = this.removeCanvasObject;

	var removeSingleObject = function (CanvasObj){

		//removes the object from the canvas
		$scope.canvas.remove(CanvasObj);

		if(CanvasObj.type == "image"){
			saveState("Deleted image");
		}
		else{
			saveState("Deleted Text");
		}
	}

	var removeGroup = function (CanvasGroup){
		 CanvasGroup.forEachObject(function(a) {
		 	removeSingleObject(a);
		  });

		$scope.canvas.discardActiveGroup();
		$scope.canvas.renderAll();
	}

	this.undo = function (){
		if ($scope.undoHistory.length>1){
			
			$scope.redoHistory.push($scope.undoHistory.pop());

			var state = $scope.undoHistory[$scope.undoHistory.length-1];
			loadState(state[1]);
		}
	}

	this.redo = function (){
		if ($scope.redoHistory.length>0){
			
			$scope.undoHistory.push( $scope.redoHistory.pop());

			var state = $scope.undoHistory[$scope.undoHistory.length-1];
			loadState(state[1]);
		}
	}
	
	var saveState = function(history){
		console.log("triggered");
		var state = $scope.canvas.toDatalessJSON();
		$scope.undoHistory.push([history, state]);
		$scope.redoHistory = [];
	}

	var loadState = function(state){
		$scope.canvas.loadFromDatalessJSON(state, function(){ 
			$scope.canvas.renderAll(); 
		});
		
	}

	this.saveCanvas = function(){

	}

	this.loadCanvas = function(){
		
	}
});

