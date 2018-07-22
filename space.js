const gravitationalConstant = 0.05;
const bouncyness = 0.9;
const playerBounce = false;
const groundTouchError = 0;
const similarEnoughVelocities = 0.3;
const fallingAngle = Math.PI/4;
const jumpForce = 15;

const shipSpeedLimit = 60;
const universeSpeed = 1;
const controlSpeed = 0.1;
const walkSpeed = 5;
const maxSpeed = 10;
const friction = 0.2;
const airResistance = 0.001;


class Ship
{
  constructor(x,y,color,planets,type="baseRocket",size = 40,density=1,thrust = 0.3,turnRate = 0.02,edgeThrust = 0.05,slowRate = 0.001)
  {
    this.loc = new Vector(x,y);
    this.vel = new Vector(0,0);
    this.color = color;
    this.size = size;
    this.density = density;
    this.type = type;
    this.thrust = thrust;
    this.turnRate = turnRate;
    this.edgeThrust = edgeThrust;
    this.slowRate = slowRate;
    this.parked = true;
    this.driver = false;
    this.driverColor = false;
    this.controlInput = new Vector(0,0);
    this.controlRotation = 0;
    var closestPlanetDistance = Number.MAX_SAFE_INTEGER;
    var closestPlanet = false;
    for (var id in planets)
    {
      var planet = planets[id];
      //Check for closestPlanet
      if(Vector.distance(this.loc,planet.loc) < closestPlanetDistance)
      {
        closestPlanetDistance = Vector.distance(this.loc,planet.loc);
        closestPlanet = planet;
      }
    }
    if(closestPlanet && closestPlanetDistance <= closestPlanet.size+this.size+5)
    {
      this.parked = closestPlanet;
      this.loc = this.parked.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size));
      this.direction = this.parked.loc.direction(this.loc);
      this.vel = this.parked.vel.copy();
    }
    else
    {
      this.parked = false;
      this.direction = (new Vector(1,0)).rotate(Math.random()*2*Math.PI);
    }
  }

  mass()
  {
    return this.size*this.density;
  }

  updateVelocity(planets)
  {
    if(this.driver)
    {
      this.updateVelocityControlled(planets);
    }
    else if(this.parked)
    {
      this.updateVelocityParked(planets);
    }
    else
    {
      this.updateVelocityFree(planets);
    }
    this.vel = this.vel.speedLimit(shipSpeedLimit);
  }
  shipControl(up,down,left,right)
  {
    this.controlInput = new Vector(0,0);
    this.controlRotation = 0;
    //Thrust
    if(up)
    {
      this.controlInput = this.direction.multiplyScaler(this.thrust);
    }
    //Rotation
    if(right && !left)
    {
      this.controlRotation = this.turnRate;
      this.controlInput = this.controlInput.addVector(this.direction.rotate(Math.PI/2).multiplyScaler(this.edgeThrust));
    }
    else if(left && !right)
    {
      this.controlRotation = -1*this.turnRate;
      this.controlInput = this.controlInput.addVector(this.direction.rotate(-1*Math.PI/2).multiplyScaler(this.edgeThrust));
    }
    //Slow
    if(down)
    {
      this.controlInput = this.controlInput.subVector(this.vel.multiplyScaler(this.slowRate))
    }
    return this.vel.copy();
  }
  updateVelocityControlled(planets)
  {
    this.vel = this.vel.addVector(this.controlInput);
    this.updateVelocityFree(planets);
  }
  updateVelocityParked(planets)
  {
    this.vel = this.parked.vel.copy();
  }
  updateVelocityFree(planets)
  {
    for(var id in planets)
    {
      var planet = planets[id];
      //Gravitational Attraction
      var dir = this.loc.direction(planet.loc);
      var dist = Vector.distance(this.loc,planet.loc);
      var force = gravitationalConstant*this.mass()*planet.mass()/(dist*dist);
      var acc = dir.normalize(force/this.mass());
      this.vel = this.vel.addVector(acc);
      //Bounce off each other.
      if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size)
      {
        var stepOne = Vector.dotProduct(this.vel.subVector(planet.oldVel),this.loc.subVector(planet.loc))/Math.pow((this.loc.subVector(planet.loc).magnitude()),2);
        var stepTwo = 2*planet.mass()/(this.mass()+planet.mass());
        var direction = this.loc.subVector(planet.loc);
        this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo*bouncyness));
      }
      //Air Resistance
      if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size*1.2)
      {
        this.vel = this.vel.subVector(this.vel.multiplyScaler(airResistance*this.vel.magnitude()));
      }
    }
  }

  updateShip(timeDifferential,planets)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(timeDifferential*universeSpeed));
    if(this.parked)
    {
      var angleFromStraight = this.parked.loc.direction(this.loc).angle();-this.direction.angle();
      if(Math.abs(angleFromStraight) > fallingAngle && Math.abs(angleFromStraight) < Math.PI/2)
      {
        this.direction = this.direction.rotate(angleFromStraight/10*timeDifferential*universeSpeed);
      }
      if(this.vel.x != this.parked.vel.x || this.vel.y != this.parked.vel.y)
      {
        this.parked = false;
      }
    }
    if(!this.parked)
    {
      this.direction = this.direction.rotate((this.vel.angle()-this.direction.angle())/240*timeDifferential*universeSpeed);
    }
    if(this.driver)
    {
      this.direction = this.direction.rotate(this.controlRotation*timeDifferential*universeSpeed);
    }
    for(var id in planets)
    {
      var planet = planets[id];
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size)
      {
        this.vel = this.vel.addVector(planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size)).subVector(this.loc));
        this.loc = planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size));
      }
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size+groundTouchError && Vector.distance(this.vel,planet.vel)<similarEnoughVelocities)
      {
        this.parked = planet;
        this.loc = this.parked.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size));
        this.vel = this.parked.vel.copy();
      }
    }
  }
}


class Player
{
  constructor(x,y,color, planets, size = 10,density = 1)
  {
    this.color = color;
    this.controllingPlanet = false;
    for (var id in planets)
    {
      if(planets[id].color == this.color)
      {
        this.controllingPlanet = planets[id];
      }
    }
    if(this.controllingPlanet)
    {
      this.loc = this.controllingPlanet.loc.addVector((new Vector(this.controllingPlanet.size,0)).rotate(Math.random()*Math.PI*2));
      this.vel = this.controllingPlanet.vel.copy();
    }
    else
    {
      this.loc = new Vector(x,y);
      this.vel = new Vector(0,0);
    }
    this.actingVel = new Vector(0,0);
    this.leftHeld = false;
    this.rightHeld = false;
    this.upHeld = false;
    this.rightHeld = false;
    this.ePressed = false;
    this.color = color;
    this.size = size;
    this.density = density;
    this.inAir = false;
    this.velocityComponents = new Map();
    this.velocityComponents.set("Base",this.vel.copy());
    this.inSpaceShip = false;
  }

  mass()
  {
    return this.size*this.density;
  }

  tellVelocityComponent()
  {
    return this.velocityComponents
  }
  enterOrExitSpaceship(ships)
  {
    if(this.inSpaceShip)
    {
      this.inSpaceShip.driver = false;
      this.inSpaceShip = false;
    }
    else
    {
      for (var id in ships)
      {
        var ship = ships[id];
        if(Vector.distance(this.loc,ship.loc) < this.size+ship.size)
        {
          this.inSpaceShip = ship;
          this.inSpaceShip.driver = true;
          this.inSpaceShip.driverColor = this.color;
          this.loc = this.inSpaceShip.loc.copy();
          break;
        }
      }
    }
  }
  updateVelocity(planets)
  {
    this.velocityComponents = new Map();
    if(this.inSpaceShip)
    {
      this.vel = this.inSpaceShip.shipControl(this.upHeld,this.downHeld,this.leftHeld,this.rightHeld);
      this.velocityComponents.set("Ship  ",this.vel.copy());
    }
    else
    {
      this.updateVelocitySelf(planets);
    }
  }
  updateVelocitySelf(planets)
  {
    this.velocityComponents.set("Base  ", this.vel.copy());
    var closestPlanetDistance = Number.MAX_SAFE_INTEGER;
    var closestPlanet = false;
    for(var id in planets)
    {
      var planet = planets[id];
      //Check for closestPlanet
      if(Vector.distance(this.loc,planet.loc) < closestPlanetDistance)
      {
        closestPlanetDistance = Vector.distance(this.loc,planet.loc);
        closestPlanet = planet;
      }
      //Gravitational Attraction
      var dir = this.loc.direction(planet.loc);
      var dist = Vector.distance(this.loc,planet.loc);
      var force = gravitationalConstant*this.mass()*planet.mass()/(dist*dist);
      var acc = dir.normalize(force/this.mass());
      this.velocityComponents.set("Grav "+id, acc.copy());
      this.vel = this.vel.addVector(acc);
      //Bounce off each other.
      if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size && playerBounce)
      {
        var stepOne = Vector.dotProduct(this.vel.subVector(planet.oldVel),this.loc.subVector(planet.loc))/Math.pow((this.loc.subVector(planet.loc).magnitude()),2);
        var stepTwo = 2*planet.mass()/(this.mass()+planet.mass());
        var direction = this.loc.subVector(planet.loc);
        this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo*bouncyness));
      }
      this.vel = this.vel.speedLimit(maxSpeed);
    }
    if(closestPlanetDistance < closestPlanet.size*1.2)
    {
      this.controllingPlanet = closestPlanet;
      this.updateVelocityAtmosphere(planets)
    }
    else
    {
      this.controllingPlanet = false;
      this.updateVelocitySpace(planets)
    }

  }
  updateVelocityAtmosphere(planets)
  {
    if(!this.inAir)
    {
      var jumpDirection = this.controllingPlanet.loc.direction(this.loc);
      if(this.upHeld)
      {
        this.velocityComponents.set("Jump  ",jumpDirection.normalize(jumpForce).copy());
        this.vel = this.vel.addVector(jumpDirection.normalize(jumpForce));
      }
      else
      {
        this.velocityComponents.set("Jump  ",new Vector(0,0));
      }
      if(this.leftHeld && !this.rightHeld)
      {
        this.velocityComponents.set("RolLft",jumpDirection.rotate(3*Math.PI/2).normalize(walkSpeed).copy());
        this.vel = this.vel.addVector(jumpDirection.rotate(3*Math.PI/2).normalize(walkSpeed));
      }
      else if(this.rightHeld && !this.leftHeld)
      {
        this.velocityComponents.set("RolRgt",jumpDirection.rotate(Math.PI/2).normalize(walkSpeed).copy());
        this.vel = this.vel.addVector(jumpDirection.rotate(Math.PI/2).normalize(walkSpeed));
      }
      else
      {
        this.velocityComponents.set("NoRoll",new Vector(0,0));
      }
      //Friction
      this.velocityComponents.set("Frictn",this.vel.multiplyScaler(friction).negate().copy());
      this.vel = this.vel.subVector(this.vel.multiplyScaler(friction));
    }
    else
    {
      //console.log("InTheAir")
      this.velocityComponents.set("Jump  ",new Vector(0,0));
      this.velocityComponents.set("NoRoll",new Vector(0,0));
      this.velocityComponents.set("Frictn",new Vector(0,0));
    }
    //Air Resistance
    this.velocityComponents.set("AirRes",this.vel.multiplyScaler(airResistance*this.vel.magnitude()).negate().copy());
    this.vel = this.vel.subVector(this.vel.multiplyScaler(airResistance*this.vel.magnitude()));
    this.velocityComponents.set("SpCtrl",new Vector(0,0));
  }
  updateVelocitySpace(planets)
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
    this.velocityComponents.set("Jump  ",new Vector(0,0));
    this.velocityComponents.set("NoRoll",new Vector(0,0));
    this.velocityComponents.set("Frictn",new Vector(0,0));
    this.velocityComponents.set("AirRes",new Vector(0,0));
    this.velocityComponents.set("SpCtrl",deltaVector.normalize(controlSpeed).copy());
    this.vel = this.vel.addVector(deltaVector.normalize(controlSpeed))
  }

  updatePlayer(timeDifferential,planets,ships)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
    for(var id in planets)
    {
      var planet = planets[id];
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size)
      {
        this.loc = planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size));
      }
    }
    if(this.controllingPlanet)
    {
      this.inAir = Vector.distance(this.loc,this.controllingPlanet.loc) > this.size+this.controllingPlanet.size+groundTouchError;
    }
    this.velocityComponents = [...this.velocityComponents];
    if(this.ePressed)
    {
      this.enterOrExitSpaceship(ships);
    }
  }
}

class Planet
{
  constructor(startX,startY,startXD,startYD,size,color = 'red',atmosphereColor = "rgba(255,0,0,0.1)",density = 1)
  {
    this.loc = new Vector(startX,startY);
    this.vel = new Vector(startXD,startYD);
    this.oldVel = this.vel.copy();
    this.size = size;
    this.density = density;
    this.color = color;
    this.atmosphereColor = atmosphereColor;
  }

  updateLocation(timeDifferential)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
    this.oldVel = this.vel.copy();
  }

  updateVelocity(planets)
  {
    for(var id in planets)
    {
      var planet = planets[id];
      if(!this.loc.isEqual(planet.loc))
      {
        //Gravitational Attraction
        var dir = this.loc.direction(planet.loc);
        var dist = Vector.distance(this.loc,planet.loc);
        var force = gravitationalConstant*this.mass()*planet.mass()/(dist*dist);
        var acc = dir.normalize(force/this.mass());
        this.vel = this.vel.addVector(acc);
        //Bounce off each other.
        if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size)
        {
          var stepOne = Vector.dotProduct(this.vel.subVector(planet.oldVel),this.loc.subVector(planet.loc))/Math.pow((this.loc.subVector(planet.loc).magnitude()),2);
          var stepTwo = 2*planet.mass()/(this.mass()+planet.mass());
          var direction = this.loc.subVector(planet.loc);
          this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo*bouncyness));
        }
      }
    }
  }

  update(timeDifferential)
  {
    this.updateVelocity();
    this.updateLocation(timeDifferential);
  }

  mass()
  {
    return this.density*this.size*this.size*3.14159265358979;
  }
}

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

   subVector(x,y)
   {
	   return(new Vector(this.x-x,this.y-y));
   }

   subVector(vec)
   {
	   return(new Vector(this.x-vec.x,this.y-vec.y));
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
	   var norm = this.magnitude();
     if(norm == 0)
     {
       return new Vector(0,0);
     }
     else
     {
       return(new Vector(size*this.x/norm,size*this.y/norm));
     }
   }

   //Returns the length of the vector.
   magnitude()
   {
     return Math.sqrt(this.x*this.x+this.y*this.y);
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

   //Get angle of the vector, with (0,-1) as 0, going clockwise
   angle()
   {
     if(this.x >= 0 && this.y <= 0)
     {
       return Math.atan2(this.x,-this.y);
     }
     else if(this.x >= 0 && this.y > 0)
     {
       return Math.PI/2+Math.atan2(this.y,this.x);
     }
     else if(this.y > 0)
     {
       return Math.PI + Math.atan2(-this.x,this.y);
     }
     else
     {
       return Math.PI*3/2 + Math.atan2(-this.y,-this.x);
     }
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

   //Find Distance
   static distance(a,b)
   {
	   return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
   }

   //Find dot product
   static dotProduct(a,b)
   {
     return a.x*b.x + a.y*b.y;
   }
}


module.exports.Vector = Vector;
module.exports.Player = Player;
module.exports.Planet = Planet;
module.exports.Ship = Ship;
