
var imageIndex = 0; //for keeping track of adding and removing images

 //for keeping track of edit history
 var undoHistory = [];
 var redoHistory = [];
 var debug;

//initialize canvas
var canvas = new fabric.Canvas('c');
canvas.setDimensions({width: 600, height: 400});

//initialize listeners for editing text
canvas.on('object:selected', function(e){

	$('#editInput').off();
	if(e.target.type == "text"){
		console.log("selected");
		edittext(e.target);
	}

});

canvas.on('before:selection:cleared', function(e){
	console.log('b4 deselect');

	if($('#editInput').val('') && e.target.type== "text"){
		removeCanvasObject();
	}
})

canvas.on('selection:cleared', function(e){
	console.log("deselected");

	//clears the textarea for the edit text box
	$('#editInput').val('');

	$('#editInput').off();
});

$('body').on('keydown', function(e) {
    if ( ( e.which == 8 || e.which == 46 ) && !($("textarea").is(":focus")) ){
    	removeCanvasObject();
    } 
});

$("#upload").change(function(e) {
    for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {
        
        var file = e.originalEvent.srcElement.files[i];
        
        var img = document.createElement("img");
        var imgId = "image"+imageIndex;
        imageIndex++;

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
			imgInstance.scaleToHeight(300);
			canvas.add(imgInstance);
        }

        reader.readAsDataURL(file);

        $("#upload").after(img);
      
		
    }
});

function addtext(){
	if($('#addInput').val()){
		var text = $('#addInput').val();

		var canvasText = new fabric.Text(text, {left: 100, top: 100});

		canvas.add(canvasText);
		$('#addInput').val('');
	}	
}

function edittext(textobject){
	var text = textobject.text;
	$('#editInput').val(text);

	$('#editInput').on('input', function(){
		console.log('input');
		textobject.text=$('#editInput').val();
		canvas.renderAll();
	})
}

function removeCanvasObject(){
	var canvasObject;
	if(canvasObject = canvas.getActiveGroup()){
		removeGroup(canvasObject);
	}
	else if (canvasObject = canvas.getActiveObject()){
		console.log('case2');
		removeSingleObject(canvasObject);
	}
	else{
		//TODO - display error message
		console.log('case3');
	}
}

function removeSingleObject(CanvasObj){

	debug=CanvasObj;
	
	//when deleting images, need to remove the original image element
	if(CanvasObj.type == "image"){
		var ObjOriginalId = CanvasObj._element.id;

		//removes the original image element
		$("#"+ObjOriginalId).remove();
	}

	//removes the object from the canvas
	canvas.remove(CanvasObj);

}

function removeGroup(CanvasGroup){
	 CanvasGroup.forEachObject(function(a) {
	 	removeSingleObject(a);
	  });

	canvas.discardActiveGroup();
	canvas.renderAll();
}

function undo(){

}

function redo(){

}