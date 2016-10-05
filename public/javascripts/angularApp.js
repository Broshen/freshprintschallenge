var app = angular.module('fp', []);
var debug1, debug2, debug3;

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

	debug3 = $scope.canvas;

	//for keeping track of 


	//initialize listeners for editing text
	$scope.canvas.on('object:selected', function(e){
		debug1 =e;

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

	$scope.canvas.on('object:modified', function(e){
		console.log("object was modified");
		console.log(e);
	})


	$("#upload").change(function(e){addImage(e)});

	var addImage = function(e) {


	    for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
	        
	        var file = e.originalEvent.srcElement.files[i];
	        
	        var img = document.createElement("img");
	        var imgId = "image"+$scope.imageIndex;
	        $scope.imageIndex++;

	        img.setAttribute("id", imgId);
	        //img.setAttribute("style", "display:none");

	        var reader = new FileReader();
	        reader.onloadend = function() {
	        	//set the image source
	             img.src = reader.result;

	             //find the image element
	             var imgElement = $('#'+imgId)[0];


	            //add the image to the canvas
				var imgInstance = new fabric.Image(imgElement,{
					left: 100,
					top: 100,
				});
				imgInstance.scaleToWidth(200);
				$scope.canvas.add(imgInstance);
	    		saveState("Added Image");
	    		$scope.$apply();
	    		console.log("applied");
	        }

	        reader.readAsDataURL(file);

	        $("#upload").after(img);			
	    }

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

		//when deleting images, need to remove the original image element
		if(CanvasObj.type == "image"){
			saveState("Deleted image");
			var ObjOriginalId = CanvasObj._element.id;

			//removes the original image element
			$("#"+ObjOriginalId).remove();
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

