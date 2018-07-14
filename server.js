// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var space = require("./space.js");

var app = express();
var server = http.Server(app);

var lastUpdateTime = (new Date()).getTime();

var planets = {};

app.use(express.static('static'))
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname, 'index.html'))
});

//Starts the server.
server.listen(process.env.PORT || 5000, function() {
  console.log('Starting server on port 5000')
  planets[0] = new space.Planet(0,5000,5,0,1000,'red','rgba(255,0,0,0.1)',2);
  planets[1] = new space.Planet(-4330,-2500,-5/2,8.66/2,1000,'blue','rgba(0,0,255,0.1)',2);
  planets[2] = new space.Planet(4330,-2500,-5/2,-8.66/2,1000,'yellow','rgba(255,255,0,0.1)',2);
});

var io = socketIO(server);

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = new space.Player(300,300);
  });
  socket.on('disconnect', function() {
    delete players[socket.id];
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    player.leftHeld = data.left;
    player.upHeld = data.up;
    player.rightHeld = data.right;
    player.downHeld = data.down;
  });
});

setInterval(function() {
  var currentTime = (new Date()).getTime();
  var timeDifferential = (currentTime - lastUpdateTime)/17;
  for (var id in planets)
  {
    planets[id].updateVelocity(planets);
  }
  for (var id in planets)
  {
    planets[id].updateLocation(timeDifferential);
  }
  for (var id in players)
  {
    players[id].updateVelocity(planets);
  }
  for (var id in players)
  {
    players[id].updatePlayer(timeDifferential,planets);
  }
  lastUpdateTime = currentTime;
  io.sockets.emit('state', [planets,players]);
}, 1000/60);
