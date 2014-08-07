var mousePressed = false;
  	var lastX, lastY;
  	var ctx;
    $(document).ready(function(){
    	ctx = document.getElementById('board').getContext('2d');
    	$('#board').mousedown(function(e){
    		mousePressed = true;
    		draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);

    	});
    	$('#board').mousemove(function(e){
    		if(mousePressed){
    			draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
    		}
    	});
    	$('#board').mouseup(function(e){
    		mousePressed = false;
    	});
    	$('#board').mouseleave(function(e){
    		mousePressed = false;
    	});
    });
    function draw(x, y, isDown){
    	if(isDown){
    		ctx.beginPath();
    		ctx.strokeStyle = 'black';
    		ctx.lineWidth = '5';
    		ctx.lineJoin = 'round';
    		ctx.moveTo(lastX, lastY);
    		ctx.lineTo(x, y);
    		ctx.closePath();
        ctx.stroke();
    	}
    	lastX = x;
    	lastY = y;
    }