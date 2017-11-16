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
    console.log('new user has joined');

    socket.on('disconnect', () => {
      console.log('player has left. ' + socket.id)
      const tempRoom = rooms.getSpecificRoomByUserId(socket.id);
      if(tempRoom){
        rooms.removeRoom(tempRoom.id);
        console.log('user has left room ' + tempRoom.id + ". Room is being removed");
        socket.broadcast.to(tempRoom.id).emit('player-left-ttt');
      }

    })

    socket.on('ttt-join', (username, privateCode, callback) => {
      const openRoom = rooms.getOpenRoom();
      //if open room is available join it
      if(openRoom.id){
        console.log(username + " is joining room: " + openRoom.id)
        //join new room
        socket.join(openRoom.id);
        //choose a user to go first
        const firstTurn = Math.round(Math.random()) == 0 ? false : true;
        //send joining user the room id and other user
        socket.emit('ttt-join-game', {
          user : openRoom.users[0] || "Anonymous",
          room: openRoom.id,
          first:firstTurn
        });
        //send other user the room id and the new users
        socket.broadcast.to(openRoom.id).emit('ttt-join-game', {
          user : username || "Anonymous",
          room: openRoom.id,
          first:!firstTurn
        });
        //add user id to room
        rooms.rooms.filter((room) => room.id === openRoom.id)[0].userIds.push(socket.id);
        //add username to room
        rooms.rooms.filter((room) => room.id === openRoom.id)[0].users.push(username);
        openRoom.closeRoom();
      //else create and join a new room
      }else {
        console.log(username + " is creating room: " + socket.id)
        //create new room
        rooms.addRoom( {
          id: socket.id,
          game: 'ttt',
          privateCode,
          users: [username],
          userIds: [socket.id]
        }, () => alert("EVERYTHING IS BROKEN"));
        //join it
        socket.join(socket.id);
        //send user room id
        io.to(socket.id).emit('ttt-new-game', {
          room: socket.id
        });
      }

    	callback();
    })

    socket.on('player-move-ttt', (roomId, pos) => {
      console.log(roomId + 'player made move on ' + pos);
      socket.broadcast.to(roomId).emit('player-moved-ttt', pos);
    })

    socket.on('ttt-game-end', (winner, room, firstTurn) => {
      console.log(winner + ' won last game, starting new game');
      //start new game and flips users first turns
      socket.emit('ttt-reset-game', {winner, first:!firstTurn});
      socket.broadcast.to(room).emit('ttt-reset-game', {winner, first:firstTurn});
    });

});
/** 
//END: HANDLES ALL SOCKET CONNECTIONS TO SERVER
**/

//server listen on current env port
server.listen(port, (err) => {
    if(err) return console.log(err);
    console.log(`Server listening on port ${port}`);
});