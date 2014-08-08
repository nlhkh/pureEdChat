var socketioJwt = require('socketio-jwt');
var jwtSecret = 'oiwefhdjhvUhasDHuaSDEFSDCJsdkfjdsfssdoreotirhjkd';
var flashCmdPrefix = "vn.puresolutions.pureclassroom.";
var rooms = [];
var roomTeachers = {};


var pureEdClassroom = function(io){

	io.use(socketioJwt.authorize({
		secret: jwtSecret,
		handshake: true})
	);

	io.sockets.on('connection', function(socket) {
		socket.emit('handshaken', {id:socket.id}); // for HTML clients
		socket.json.send({type:'handshaken', id:socket.id}); // for Flash clients
		console.log('Client connected: ' + socket.decoded_token.userEmail + ' from: ');
		console.log(socket.handshake.address);

		socket.on('subscribe', function(roomId) {
			doSubscribe(socket, roomId);
		});

		socket.on('unsubscribe', function(roomId) {
			doUnsubscribe(socket, roomId);
		});

		socket.on('message', function(data) {
			console.log('Received message type ' + typeof(data) + ' from a client:');
		    console.log(data);

		    // sometimes the message needs to be unserialized first
		    if(typeof(data) == 'string')
		      data = JSON.parse(data);

		    // actually we could check if the user is in a room here
		    // and return an appropriate message if that user isn't in one;
		    // however, all clients are supposed to only allow
		    // posting after joining a room (class)
		    // and the server needn't be responsible for any 'mischieveous' behaviour

		    switch(data.type) {
		    	case flashCmdPrefix+'subscribe' :
		    		doSubscribe(socket, data.roomId);
		    	break;
		    	case flashCmdPrefix+'unsubscribe' :
		        	doUnsubscribe(socket, data.roomId);
		        break;
		        case 'subscribeAsTeacher' :
		        	doSubscribe(socket, data.roomId);
		        	registerTeacher(socket, data.roomId, data.user.id);
		        break;
		        case flashCmdPrefix+'sendMultipleChoiceTest' :
		        case 'sendMultipleChoiceTest' :
		        	doSendMultipleChoiceTest(socket, data);
		        break;
		        case 'multipleChoiceTestDoAnswer' :
		        	sendStudentAnswerToTeacher(io, data);
		        break;
		        default :
		        	console.log('Unsupported client message type: ' + data.type);
		        	socket.send('Hold on man...');
		        break;
		    }
		});
		
		socket.on('chat', function(data) {
			console.log('Receive a chat message:');
			console.log(data.message);
		    doChat(io, data);
		});

		socket.on('draw', function(data){
			io.emit('canvasdraw', data);
		});

		socket.on('drawClick', function(data) {
			//console.log('x: ' + data.x + ',y: ' + data.y + ',type: ' + data.type);
			socket.broadcast.emit('draw', {
				x: data.x,
				y: data.y,
				type: data.type
			});
		});
	});
}

function doSubscribe(socket, roomId) {
  socket.join(roomId);
  var newcommermsg = 'Successfully joined room \"' + roomId + '\".';
  socket.emit('joinRoomCallback', {code: 0, message: newcommermsg, roomId: roomId});
  var msg = 'User \"' + socket.id + '\" just joined the room.';
  socket.broadcast.to(roomId).send(msg);
}
function doUnsubscribe(socket, roomId) {
  var msg = 'User \"' + socket.id + '\" just left the room.';
  socket.broadcast.to(roomId).send(msg);
  socket.leave(roomId);
}

function registerTeacher(socket, roomId, teacherId) {
  roomTeachers[roomId] = teacherId;
  socket.send('Thank you for registration as a teacher to the room \"' + roomId + '\".');
}
function unregisterTeacher(socket, roomId, teacherId) {
  roomTeachers[roomId] = null; //TODO: check to see if this can be optimized (i.e. less stress on array looking up)
  socket.send('You have been removed from the teacher role to the room \"' + roomId + '\".');
}

function doSendMultipleChoiceTest(socket, data) {
  socket.broadcast.to(data.roomId).json.send(data.content);
}

function sendStudentAnswerToTeacher(io, data) {
  var teacherId = roomTeachers[data.roomId];
  //io.sockets.socket(teacherId).json.send({type:'studentAnswer', data: data}); // this worked in Socket.io v0.9
  io.to(teacherId).json.send({type:'studentAnswer', data: data});
}

function doChat(io, data) {
  io.sockets.in(data.roomId).emit('chatMsgReceived', {userId:data.userId, username:data.username, message:data.message});
}


///////////////////////////////////////////////////////////
// DEPRECATED METHODS. YOU MIGHT NOT WANNA USE THESE AT ALL

function getRoomClients(roomId) {
  var res = [];
  pureEdClassroom.io.sockets.clients().forEach(function(s) {
    s.get('roomId', function(err, id) {
      if(roomId == id) {
        res.push(s);
      }
    });
  });
  return res;
}

function getRoomById(id) {
  for(var i=0; i<rooms.length; i++) {
    if(rooms[i].id == id) {
      return rooms[i];
    }
  }
  return null;
}

function removeUserFromRoom(roomId, userId) {
  console.log('About to remove user ' + userId + ' from room ' + roomId + '.');
  var theRoom = getRoomById(roomId);
  if(theRoom) {
    if(theRoom.masterId == userId)
    {
      destroyRoom(theRoom);
      console.log('Removed user is master of room \"' + roomId + '\". The whole room was destroyed.');
      return true;
    }
    else
    {
      for(var i=0; i<theRoom.users.length; i++) {
        if(theRoom.users[i].id == userId) {
          theRoom.users.splice(i, 1);
          console.log('User \"' + userId + '\" disconnected from room \"' + roomId + '\".');
          return true;
        }
      }
    }
  }
  console.log('Operation failed...');
  return false;
}

function destroyRoom(room) {
  var id = rooms.indexOf(room);
  rooms.splice(id, 1);
}

module.exports = pureEdClassroom;