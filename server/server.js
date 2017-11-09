const path = require('path');
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

//setup the server
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//serve up our static web page
app.use(express.static(publicPath));
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));


/** 
//START: HANDLES ALL SOCKET CONNECTIONS TO SERVER
**/
io.on('connection', (socket) => {
   

    //lets chatroom know a user has disconnected and updates user list
    socket.on('disconnect', () => {

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