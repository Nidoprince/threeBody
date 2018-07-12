// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);
var lastUpdateTime = (new Date()).getTime();

var planets = {};
var gravitationalConstant = 0.005;

var universeSpeed = 1;

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

//Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'))
});

//Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000')
  planets[0] = new Planet(100,100,0.1,0,10);
  planets[1] = new Planet(400,400,0,0,30,'blue');
  planets[2] = new Planet(200,300,0,0.1,10);
});

//Add the WebSocket handlers
//io.on('connection', function(socket) {
//});

setInterval(function() {
  io.sockets.emit('message', 'hi!');
}, 1000);

var players = {};
io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = new Player(300,300);
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

class Player
{
  constructor(x,y,color = 'green')
  {
    this.loc = new Vector(x,y);
    this.leftHeld = false;
    this.rightHeld = false;
    this.upHeld = false;
    this.rightHeld = false;
    this.color = color;
  }

  updatePlayer(timeDifferential)
  {
    var x = 0;
    var y = 0;
    if(this.leftHeld)
    {
      x -= 1;
    }
    if(this.rightHeld)
    {
      x += 1;
    }
    if(this.upHeld)
    {
      y -= 1;
    }
    if(this.downHeld)
    {
      y += 1;
    }
    var deltaVector = new Vector(x,y);
    this.loc = this.loc.addVector(deltaVector.normalize(5*timeDifferential*universeSpeed));
  }
}

class Planet
{
  constructor(startX,startY,startXD,startYD,size,color = 'red',density = 1)
  {
    this.loc = new Vector(startX,startY);
    this.vel = new Vector(startXD,startYD);
    this.size = size;
    this.density = density;
    this.color = color;
  }

  updateLocation(timeDifferential)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
  }

  updateVelocity()
  {
    for(var id in planets)
    {
      var planet = planets[id];
      if(!this.loc.isEqual(planet.loc))
      {
        var dir = this.loc.direction(planet.loc);
        var dist = Vector.distance(this.loc,planet.loc);
        var force = gravitationalConstant*this.weight()*planet.weight()/(dist*dist);
        var acc = dir.normalize(force/this.weight());
        this.vel = this.vel.addVector(acc);
      }
    }
  }

  update(timeDifferential)
  {
    this.updateVelocity();
    this.updateLocation(timeDifferential);
  }

  weight()
  {
    return this.density*this.size*this.size*3.14159265358979;
  }
}

setInterval(function() {
  var currentTime = (new Date()).getTime();
  var timeDifferential = (currentTime - lastUpdateTime)/17;
  for (var id in planets)
  {
    planets[id].update(timeDifferential);
  }
  for (var id in players)
  {
    players[id].updatePlayer(timeDifferential);
  }
  lastUpdateTime = currentTime;
  io.sockets.emit('state', [planets,players]);
}, 1000/60);


//For Holding 2d Data and Doing Vector Math
class Vector
{
   constructor(x,y)
   {
	   this.x = x;
	   this.y = y;
   }

   isEqual(vec)
   {
     return vec.x==this.x && vec.y==this.y;
   }

   addVector(x,y)
   {
	   return(new Vector(this.x+x,this.y+y));
   }

   addVector(vec)
   {
	   return(new Vector(this.x+vec.x,this.y+vec.y));
   }

   multiplyScaler(s)
   {
	   return(new Vector(this.x*s,this.y*s));
   }

   direction(vec)
   {
     return this.addVector(vec.negate()).negate().normalize(1);
   }
   //Changing length of Vector to size while preserving angle
   normalize(size)
   {
	   var norm = Math.sqrt(this.x*this.x+this.y*this.y);
     if(norm == 0)
     {
       return new Vector(0,0);
     }
     else
     {
       return(new Vector(size*this.x/norm,size*this.y/norm));
     }
   }

   //Change length if Greater than Limit
   speedLimit(limit)
   {
		var norm = Math.sqrt(this.x*this.x+this.y*this.y);
		if(norm<limit)
		{
			return(this.copy())
		}
		else
		{
			//alert("OUTLIM")
			return(new Vector(limit*this.x/norm,limit*this.y/norm));
		}
   }

   negate()
   {
	   return(new Vector(-1*this.x,-1*this.y));
   }

   //Change Angle while Keeping Length Constant
   rotate(angle)
   {
	   var tempX = this.x*Math.cos(angle)-this.y*Math.sin(angle);
	   var tempY = this.x*Math.sin(angle)+this.y*Math.cos(angle);
	   return(new Vector(tempX,tempY));
   }

   getX()
   {
	   return this.x;
   }

   getY()
   {
	   return this.y;
   }

   copy()
   {
	   return(new Vector(this.x,this.y));
   }

   //Find Distance Between Boids
   static distance(a,b)
   {
	   return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
   }
}
