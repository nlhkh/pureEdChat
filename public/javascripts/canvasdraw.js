var ctx;
var canvas_draw = function(o){
    ctx = document.getElementById(o).getContext('2d');
    this.lastX = 0; this.lastY = 0;
    this.mousePressed = false;
}

canvas_draw.prototype.draw = function(x, y, isDown){
    if(isDown){
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = '5';
        ctx.lineJoin = 'round';
        ctx.moveTo(canvas_draw.lastX, canvas_draw.lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    canvas_draw.lastX = x;
    canvas_draw.lastY = y;
}


    /*$(document).ready(function(){
    	
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
    function draw*/