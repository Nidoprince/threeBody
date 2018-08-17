// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var space = require("./space.js");
var compr = require("./spaceCompression.js");

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
  ships.push(new space.Ship(400,400,'green',planets,"realityRocket"));
  ships.push(new space.Ship(200,400,'green',planets,"miningShip"));
  ships.push(new space.Ship(400,200,'green',planets,"towRocket"));
  asteroids.push(new space.Asteroid(10000,0,0,4,100));
  asteroids.push(new space.Asteroid(0,0,0,0,100));
  asteroids.push(new space.Asteroid(500,500,0,0.5,200,"iron","brown",1,1));
  //asteroids.push(new space.Asteroid(800,800,0,0.5,200,"chronos","pink"));
  aliens.push(new space.Flock(50,3,100,100,5,"pink",3000));

});

var io = socketIO(server);

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function(faction) {
    var colors = ["red","blue","yellow","green"];
    players[socket.id] = new space.Player(300,300,colors[faction],planets,socket.id);
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
    player.mHeld = data.m;
    if(data.e){
      player.ePressed = data.e;
    }
    if(data.p)
    {
      player.pPressed = data.p;
    }
    if(data.t)
    {
      player.tPressed = data.t;
    }
    if(data.xGoal && data.yGoal)
    {
      player.goal = new space.Vector(data.xGoal,data.yGoal);
    }
    else
    {
      player.goal = false;
    }
    if(data.build)
    {
      if(data.build == "Base Rocket")
      {
        if(player.inventory.filter((x) => x == "iron").length > 0)
        {
          let index = player.inventory.indexOf("iron");
          player.inventory.splice(index,1);
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids)));
        }
      }
      if(data.build == "Tow Rocket")
      {
        if(player.inventory.filter((x) => x == "iron").length > 3)
        {
          for(let i = 0; i<4; i++)
          {
            let index = player.inventory.indexOf("iron");
            player.inventory.splice(index,1);
          }
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"towRocket"));
        }
      }
      if(data.build == "Mining Ship")
      {
        if(player.inventory.filter((x) => x == "iron").length > 7)
        {
          for(let i = 0; i<8; i++)
          {
            let index = player.inventory.indexOf("iron");
            player.inventory.splice(index,1);
          }
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"miningShip"));
        }
      }
      if(data.build == "Reality Rocket")
      {
        if(player.inventory.filter((x) => x == "iron").length > 0 && player.inventory.filter((x) => x == "chronos").length > 0)
        {
          let index = player.inventory.indexOf("iron");
          player.inventory.splice(index,1);
          index = player.inventory.indexOf("chronos");
          player.inventory.splice(index,1);
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"realityRocket"));
        }
      }
    }
  });
});

setInterval(function() {
  var currentTime = (new Date()).getTime();
  var timeDifferential = (currentTime - lastUpdateTime)/20;
  if(Math.random()*1000 < (50-asteroids.length)/50)
  {
    let size = (Math.random()+Math.random()+Math.random()+Math.random())*40+20;
    let x = Math.random()*40000-20000;
    let y = Math.random()*40000-20000;
    let xV = (Math.random()+Math.random())*5-5;
    let yV = (Math.random()+Math.random())*5-5;
    let contents;
    let color;
    let reality;
    if(Math.random()*100 < 5)
    {
      contents = "chronos";
      color = "pink";
    }
    else
    {
      contents = "iron";
      color = "brown";
    }
    if(Math.random()*100 < 10)
    {
      reality = 1;
    }
    else
    {
      reality = 0;
    }
    asteroids.push(new space.Asteroid(x,y,xV,yV,size,contents,color,1,reality));
  }
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
    planets[id].updateLocation(timeDifferential,planetoids);
  }
  for (var id in asteroids)
  {
    asteroids[id].updateVelocity(planetoids);
  }
  asteroids = asteroids.filter(asteroid =>
  {
    asteroid.updateLocation(timeDifferential,planetoids);
    return space.Vector.distance(asteroid.loc,new space.Vector(0,0)) < 50000;
  })
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
    if("isDead" in ships[id] && ships[id].isDead)
    {
      ships[id] = new space.Explosion(ships[id].loc.x,ships[id].loc.y,20,500,ships[id].planetThatMurderedMe,ships[id].reality);
    }
  }
  ships = ships.filter(ship =>
  {
    ship.updateLocation(timeDifferential,planetoids);
    if("isDead" in ship)
    {
      return true;
    }
    else
    {
      return ship.lifespan > 0;
    }
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
  io.sockets.emit('state', [planets.map(compr.planetCompress),players,ships.map(compr.shipCompress),asteroids.map(compr.planetCompress),aliens.map(compr.alienCompress)]);
  /*if(dog)
  {
    console.log(JSON.stringify([planets,players,ships,asteroids,aliens]).length);
    console.log(JSON.stringify([planets.map(compr.planetCompress),players,ships.map(compr.shipCompress),asteroids.map(compr.planetCompress),aliens.map(compr.alienCompress)]).length)
    dog = false;
  }*/
}, 1000/50);
//var dog = true;
