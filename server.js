// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var space = require("./space.js");

var app = express();
var server = http.Server(app);

var lastUpdateTime = (new Date()).getTime();

var planets = [];
var ships = [];
var asteroids = [];
var aliens = [];

app.use(express.static('static'))
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname, 'index.html'))
});

//Starts the server.
server.listen(process.env.PORT || 5000, function() {
  console.log('Starting server on port 5000')
  planets.push(new space.Planet(0,5000,5,0,1000,'red','rgba(255,0,0,0.1)',2));
  planets.push(new space.Planet(-4330,-2500,-5/2,8.66/2,1000,'blue','rgba(0,0,255,0.1)',2));
  planets.push(new space.Planet(4330,-2500,-5/2,-8.66/2,1000,'yellow','rgba(255,255,0,0.1)',2));
  ships.push(new space.Ship(100,100,"green",planets));
  ships.push(new space.Ship(1000,5000,"red",planets));
  ships.push(new space.Ship(-4330,-1500,"blue",planets));
  ships.push(new space.Ship(4330,-1500,"yellow",planets));
  asteroids.push(new space.Asteroid(10000,0,0,4,100));
  asteroids.push(new space.Asteroid(0,0,0,0,100));
  aliens.push(new space.Flock(50,3,100,100,5,"pink",3000));

});

var io = socketIO(server);

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function(faction) {
    var colors = ["red","blue","yellow","green"];
    players[socket.id] = new space.Player(300,300,colors[faction],planets);
  });
  socket.on('disconnect', function() {
    delete players[socket.id];
  });
  socket.on('dead', function() {
    delete players[socket.id];
  });
  socket.on('playerControl', function(data) {
    var player = players[socket.id] || {};
    player.leftHeld = data.left;
    player.upHeld = data.up;
    player.rightHeld = data.right;
    player.downHeld = data.down;
    player.ePressed = data.e;
    player.mHeld = data.m;
    player.pPressed = data.p;
  });
});

setInterval(function() {
  var currentTime = (new Date()).getTime();
  var timeDifferential = (currentTime - lastUpdateTime)/17;
  let planetoids = planets.concat(asteroids);
  if(Math.random()*3000 < 1)
  {
    aliens.push(new space.Flock(10+Math.random()*70,5,Math.random()*20000-10000,Math.random()*20000-10000,5,["red","green","blue","pink","grey","purple","yellow","white","orange","darkgrey"][Math.floor(Math.random()*10)],1000+Math.random()*9000));
  }
  for (var id in planets)
  {
    planets[id].updateVelocity(planets);
    planets[id].spawnFuel();
  }
  for (var id in planets)
  {
    planets[id].updateLocation(timeDifferential);
  }
  for (var id in asteroids)
  {
    asteroids[id].updateVelocity(planets);
  }
  for (var id in asteroids)
  {
    asteroids[id].updateLocation(timeDifferential);
  }
  for (var id in aliens)
  {
    aliens[id].updateVelocity();
  }
  aliens = aliens.filter(alien =>
  {
    alien.updateLocation(timeDifferential);
    return alien.lifespan > 0;
  })
  for (var id in ships)
  {
    ships[id].updateVelocity(planetoids);
  }
  ships = ships.filter(ship =>
  {
    ship.updateShip(timeDifferential,planetoids);
    return !ship.isDead;
  })
  for (var id in players)
  {
    if(players[id]!="dead")
    {
      players[id].updateVelocity(planetoids);
    }
  }
  for (var id in players)
  {
    if(players[id]!="dead")
    {
      players[id].updatePlayer(timeDifferential,planetoids,ships);
    }
  }
  for (var id in players)
  {
    if(players[id].isDead)
    {
      players[id] = "dead";
    }
  }
  lastUpdateTime = currentTime;
  io.sockets.emit('state', [planets,players,ships,asteroids,aliens]);
}, 1000/60);
