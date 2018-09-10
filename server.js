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
var items = [];
var tears = [];

app.use(express.static('static'))
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(req, res) {
  console.log(__dirname)
  res.sendFile(path.join(__dirname, 'index.html'))
});

//Starts the server.
server.listen(process.env.PORT || 5000, function() {
  console.log('Starting server on port 5000')
  planets.push(new space.Planet(0,25000,10,0,4031,'red','rgba(255,0,0,0.1)',2));
  planets.push(new space.Planet(-43300/2,-25000/2,-5,8.66,4031,'blue','rgba(0,0,255,0.1)',2));
  planets.push(new space.Planet(43300/2,-25000/2,-5,-8.66,4031,'yellow','rgba(255,255,0,0.1)',2));
  ships.push(new space.Ship(100,100,"green",planets));
  ships.push(new space.Ship(1000,25000,"red",planets));
  //ships.push(new space.Car(500,25050,"red",planets));
  ships.push(new space.Ship(-43300/2,-25500/2,"blue",planets));
  ships.push(new space.Ship(43300/2,-25500/2,"yellow",planets));
  ships.push(new space.Ship(600,400,'green',planets,"capitolShip"));
  //ships.push(new space.Ship(200,400,'green',planets,"miningShip"));
  //ships.push(new space.Ship(400,200,'green',planets,"towRocket"));
  asteroids.push(new space.Asteroid(10000,0,0,4,100));
  asteroids.push(new space.Asteroid(0,0,0,0,100));
  asteroids.push(new space.Asteroid(500,500,0,0.5,200,"iron","brown",1,1));
  //asteroids.push(new space.Asteroid(800,800,0,0.5,200,"chronos","pink"));
  aliens.push(new space.Flock(50,3,100,100,5,"pink",3000));
  //tears.push(new space.Wormhole(200,200,0,500,0,2,'rgba(0,255,255,0.2)',40));

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
    if(data.e)
    {
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
    if(data.inventory)
    {
      player.dropWhat = data.inventory;
    }
    if(data.xGoal && data.yGoal)
    {
      player.goal = new space.Vector(data.xGoal,data.yGoal);
    }
    else
    {
      player.goal = false;
    }
    if(data.give || data.take)
    {
      let playerAngle = player.controllingPlanet.loc.direction(player.loc).angle();
      for(let factory of player.controllingPlanet.buildings)
      {
        let difference = Math.abs(factory.angle-playerAngle);
        if(difference < factory.size/player.controllingPlanet.size)
        {
          if(data.take && data.take <= factory.storage.length && player.inventory.length < 8)
          {
            player.inventory.push(factory.storage[data.take-1]);
            factory.storage.splice(data.take-1,1);
          }
          if(data.give && data.give <= player.inventory.length && factory.storage.length < 48)
          {
            factory.storage.push(player.inventory[data.give-1]);
            player.inventory.splice(data.give-1,1);
          }
        }
      }
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
      if(data.build == "SUV")
      {
        if(player.inventory.filter((x) => x == "iron").length > 0)
        {
          let index = player.inventory.indexOf("iron");
          player.inventory.splice(index,1);
          ships.push(new space.Car(player.loc.x,player.loc.y,player.color,planets.concat(asteroids)));
        }
      }
      if(data.build == "Hopper")
      {
        if(player.inventory.filter((x) => x == "steel").length > 0)
        {
          let index = player.inventory.indexOf("steel");
          player.inventory.splice(index,1);
          ships.push(new space.Car(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"hopper"));
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
      if(data.build == "Jump Ship")
      {
        if(player.inventory.filter((x) => x == "steel").length > 0 && player.inventory.filter((x) => x == "chronos").length > 0)
        {
          let index = player.inventory.indexOf("steel");
          player.inventory.splice(index,1);
          index = player.inventory.indexOf("chronos");
          player.inventory.splice(index,1);
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"jumpShip"));
        }
      }
      if(data.build == "Reality Rocket")
      {
        if(player.inventory.filter((x) => x == "steel").length > 1 && player.inventory.filter((x) => x == "chronos").length > 1)
        {
          for(let i = 0; i<2; i++)
          {
            let index = player.inventory.indexOf("steel");
            player.inventory.splice(index,1);
            index = player.inventory.indexOf("chronos");
            player.inventory.splice(index,1);
          }
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"realityRocket"));
        }
      }
      if(data.build == "Capitol Ship")
      {
        if(player.inventory.filter((x) => x == "steel").length > 3 && player.inventory.filter((x) => x == "chaos").length > 1 && player.inventory.filter((x) => x == "omega").length > 1)
        {
          for(let i = 0; i<4; i++)
          {
            let index = player.inventory.indexOf("steel");
            player.inventory.splice(index,1);
            if(i%2 == 0)
            {
              index = player.inventory.indexOf("chaos");
              player.inventory.splice(index,1);
              index = player.inventory.indexOf("omega");
              player.inventory.splice(index,1);
            }
          }
          ships.push(new space.Ship(player.loc.x,player.loc.y,player.color,planets.concat(asteroids),"capitolShip"));
        }
      }
      if(data.build == "Refinery")
      {
        if(player.inventory.filter((x) => x == "iron").length > 1 && player.inventory.filter((x) => x == "fuel").length > 1 && player.controllingPlanet)
        {
          for(let i = 0; i<2; i++)
          {
            let index = player.inventory.indexOf("iron");
            player.inventory.splice(index,1);
            index = player.inventory.indexOf("fuel");
            player.inventory.splice(index,1);
          }
          player.controllingPlanet.build(player.loc.x,player.loc.y,player.color);
        }
      }
      if(data.build == "Warehouse")
      {
        if(player.inventory.filter((x) => x == "steel").length > 1)
        {
          for(let i = 0; i<2; i++)
          {
            let index = player.inventory.indexOf("steel");
            player.inventory.splice(index,1);
          }
          player.controllingPlanet.build(player.loc.x,player.loc.y,player.color,"warehouse");
        }
      }
      if(["Chaos","Steel","Fuel+","Omega"].includes(data.build))
      {
        let inFactory = false;
        let playerAngle = player.controllingPlanet.loc.direction(player.loc).angle();
        for(let factory of player.controllingPlanet.buildings)
        {
          let difference = Math.abs(factory.angle-playerAngle);
          if(difference < factory.size/player.controllingPlanet.size)
          {
            inFactory = true;
          }
        }
        if(inFactory)
        {
          if(data.build == "Steel")
          {
            if(player.inventory.filter((x) => x == "iron").length > 0 && player.inventory.filter((x) => x == "fuel").length > 0 && player.controllingPlanet)
            {
              for(let i = 0; i<1; i++)
              {
                let index = player.inventory.indexOf("iron");
                player.inventory.splice(index,1);
                index = player.inventory.indexOf("fuel");
                player.inventory.splice(index,1);
              }
              player.inventory.push("steel");
            }
          }
          if(data.build == "Chaos")
          {
            if(player.inventory.filter((x) => x == "chronos").length > 3)
            {
              for(let i = 0; i<4; i++)
              {
                let index = player.inventory.indexOf("chronos");
                player.inventory.splice(index,1);
              }
              player.inventory.push("chaos");
            }
          }
          if(data.build == "Fuel+")
          {
            if(player.inventory.filter((x) => x == "fuel").length > 3)
            {
              for(let i = 0; i<4; i++)
              {
                let index = player.inventory.indexOf("fuel");
                player.inventory.splice(index,1);
              }
              player.inventory.push("fuel+");
            }
          }
          if(data.build == "Omega")
          {
            if(player.inventory.includes("iron") && player.inventory.includes("chronos") && player.inventory.includes("dark"))
            {
              let index = player.inventory.indexOf("iron");
              player.inventory.splice(index,1);
              index = player.inventory.indexOf("chronos");
              player.inventory.splice(index,1);
              index = player.inventory.indexOf("dark");
              player.inventory.splice(index,1);
              player.inventory.push("omega");
            }
          }
        }
      }
    }
  });
});

setInterval(function() {
  var currentTime = (new Date()).getTime();
  var timeDifferential = (currentTime - lastUpdateTime)/20;

  //Generate Stuff
  if(Math.random()*3000 < (5-tears.length)/5)
  {
    let size = (Math.random()*Math.random()*Math.random()*Math.random()*4000+100);
    let x1 = Math.random()*200000-100000;
    let y1 = Math.random()*200000-100000;
    let x2 = Math.random()*200000-100000;
    let y2 = Math.random()*200000-100000;
    let color = ['rgba(255,0,0,0.2)','rgba(0,255,0,0.2)','rgba(0,0,255,0.2)','rgba(0,255,255,0.2)','rgba(255,255,0,0.2)','rgba(255,0,255,0.2)'][Math.floor(Math.random()*6)];
    let randoReality = Math.random()*1000;
    let z1;
    let z2;
    if(randoReality < 300)
    {
      z1 = 0;
      z2 = 0;
    }
    else if(randoReality < 900)
    {
      z1 = 1;
      z2 = 1;
    }
    else if(randoReality < 990)
    {
      z1 = 0;
      z2 = 1;
    }
    else if(randoReality < 999)
    {
      z1 = 1;
      z2 = 2;
    }
    else
    {
      z1 = 0;
      z2 = 2;
    }
    tears.push(new space.Wormhole(x1,y1,z1,x2,y2,z2,color,size));
  }
  if(Math.random()*1000 < (50-asteroids.length)/50)
  {
    let size = (Math.random()+Math.random()+Math.random()+Math.random())*40+20;
    let x = Math.random()*200000-100000;
    let y = Math.random()*200000-100000;
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
    else if(Math.random()*100 < 10)
    {
      contents = "dark";
      color = "black";
    }
    else
    {
      contents = "iron";
      color = "brown";
    }
    if(Math.random()*100 < 50)
    {
      reality = 1;
    }
    else
    {
      reality = 0;
    }
    asteroids.push(new space.Asteroid(x,y,xV,yV,size,contents,color,1,reality));
  }
  if(Math.random()*3000 < 1)
  {
    aliens.push(new space.Flock(10+Math.random()*70,5,Math.random()*20000-10000,Math.random()*20000-10000,5,["red","green","blue","pink","grey","purple","yellow","white","orange","darkgrey"][Math.floor(Math.random()*10)],1000+Math.random()*9000));
  }

  let planetoids = planets.concat(asteroids,ships.filter((x)=>x.type == "capitolShip" && x.gravityDrive));

  //Update Stuff
  for (var id in planets)
  {
    planets[id].updateVelocity(planets);
    planets[id].spawnFuel();
  }
  for (var id in planets)
  {
    planets[id].updateLocation(timeDifferential,planetoids);
    //console.log("Net: "+planets[id].vel.magnitude())
  }
  for (var id in asteroids)
  {
    asteroids[id].updateVelocity(planetoids);
  }
  asteroids = asteroids.filter(asteroid =>
  {
    asteroid.updateLocation(timeDifferential,planetoids);
    return space.Vector.distance(asteroid.loc,new space.Vector(0,0)) < 500000 && asteroid.size > 20;
  })
  planetoids = planets.concat(asteroids,ships.filter((x)=>x.type == "capitolShip" && x.gravityDrive));
  for (var id in aliens)
  {
    aliens[id].updateVelocity();
  }
  aliens = aliens.filter(alien =>
  {
    alien.updateLocation(timeDifferential);
    return alien.lifespan > 0;
  })
  tears = tears.filter(tear =>
  {
    tear.warpStuff(ships,items,players);
    if(Math.random()*4000 > 1)
    {
      return true;
    }
    else
    {
      return false;
    }
  })
  for (var id in ships)
  {
    ships[id].updateVelocity(planetoids);
    if("isDead" in ships[id] && ships[id].isDead)
    {
      ships[id] = new space.Explosion(ships[id].loc.x,ships[id].loc.y,ships[id].size/2,500,ships[id].planetThatMurderedMe,ships[id].reality);
    }
  }
  ships = ships.filter(ship =>
  {
    ship.updateLocation(timeDifferential,planetoids,items);
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
      players[id].updatePlayer(timeDifferential,planetoids,ships,items);
    }
  }
  for (var id in players)
  {
    if(players[id].isDead)
    {
      players[id] = "dead";
    }
  }
  for (var id in items)
  {
    items[id].updateVelocity(planetoids);
  }
  items = items.filter(item =>
  {
    item.updateLocation(timeDifferential,planetoids);
    return item.stillCorporeal;
  })
  lastUpdateTime = currentTime;
  io.sockets.emit('state', [planets.map(compr.planetCompress),players,ships.map(compr.shipCompress),asteroids.map(compr.planetCompress),aliens.map(compr.alienCompress),items.map(compr.itemCompress),tears]);
  /*if(dog)
  {
    console.log(JSON.stringify([planets,players,ships,asteroids,aliens]).length);
    console.log(JSON.stringify([planets.map(compr.planetCompress),players,ships.map(compr.shipCompress),asteroids.map(compr.planetCompress),aliens.map(compr.alienCompress)]).length)
    dog = false;
  }*/
}, 1000/50);
//var dog = true;
