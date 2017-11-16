const path = require('path');
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const socketIO = require('socket.io');
const {Rooms} = require('./libs/rooms');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

//setup the server
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//serve up our static web page
app.use(express.static(publicPath));
app.use(favicon(path.join(__dirname, '../public','images', 'favicon.ico')));

const rooms = new Rooms();

/** 
//START: HANDLES ALL SOCKET CONNECTIONS TO SERVER
**/
io.on('connection', (socket) => {
   

    //lets chatroom know a user has disconnected and updates user list
    socket.on('disconnect', () => {

    });

    socket.on('ttt-join', (username, privateCode, callback) => {
      const openRoom = rooms.getOpenRoom();
      console.log(openRoom)

      if(openRoom){
        console.log(username + " is joining room: " + openRoom)
        socket.join(openRoom);
        io.to(socket.id).emit('ttt-join-game', {
          user : username || "Anonymous",
          room: openRoom
        });
      }else {
        console.log(username + " is creating room: " + socket.id)
        rooms.addRoom( {
          id: socket.id,
          game: 'ttt',
          privateCode
        }, () => alert("EVERYTHING IS BROKEN"));
        socket.join(socket.id);

        io.to(socket.id).emit('ttt-join-game', {
          user : username || "Anonymous",
          room: socket.id
        });
      }


      console.log(username);
    	

    	callback('error');
    })

});
/** 
//END: HANDLES ALL SOCKET CONNECTIONS TO SERVER
**/

//server listen on current env port
server.listen(port, (err) => {
    if(err) return console.log(err);
    console.log(`Server listening on port ${port}`);
});