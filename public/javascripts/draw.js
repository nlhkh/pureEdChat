(function() {
  var App;
  App = {};
  
  /*
  	Init 
  */  
  App.init = function(token) {
    App.canvas = document.createElement('canvas');
    App.canvas.height = 400;
    App.canvas.width = 800;
    document.getElementsByTagName('article')[0].appendChild(App.canvas);
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = "#ECD018";
    App.ctx.lineWidth = 5;
    App.ctx.lineCap = "round";

    App.socket = io.connect(document.domain, {query: 'token=' + token});
    App.socket.on('cdraw', function(data) {
      return App.draw(data.x, data.y, data.type);
    });

    App.draw = function(x, y, type) {
      if (type === "dragstart") {
        App.ctx.beginPath();
        return App.ctx.moveTo(x, y);
      } else if (type === "drag") {
        App.ctx.lineTo(x, y);
        return App.ctx.stroke();
      } else {
        return App.ctx.closePath();
      }
    };

  };

  /*
  	Draw Events
  */
  $('canvas').live('drag dragstart dragend', function(e) {
    var offset, type, x, y;
    type = e.handleObj.type;
    offset = $(this).offset();
    e.offsetX = e.layerX - offset.left;
    e.offsetY = e.layerY - offset.top;
    x = e.offsetX;
    y = e.offsetY;
    App.draw(x, y, type);
    App.socket.emit('drawClick', {
      x: x,
      y: y,
      type: type
    });
  });
  
  $(function() {
    $(document).ready(function(){
      $.post('/login', {email: 'email@gmail.com'}).done(function (result) {
        if(result.error == 0){
          return App.init(result.token);
        } else {
          alert('Login false');
        }
      });
    });
  });
}).call(this);
