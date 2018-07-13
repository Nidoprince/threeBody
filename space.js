var gravitationalConstant = 0.05;

var universeSpeed = 1;
var controlSpeed = 0.1;


class Player
{
  constructor(x,y,color = 'green',size = 10,density = 1)
  {
    this.loc = new Vector(x,y);
    this.vel = new Vector(0,0);
    this.actingVel = new Vector(0,0);
    this.leftHeld = false;
    this.rightHeld = false;
    this.upHeld = false;
    this.rightHeld = false;
    this.color = color;
    this.size = size;
    this.density = density;
  }

  mass()
  {
    return this.size*this.density;
  }

  updateVelocity(planets)
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
    this.vel = this.vel.addVector(deltaVector.normalize(controlSpeed))
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
        this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo));
      }
    }
  }

  updatePlayer(timeDifferential,planets)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
    for(var id in planets)
    {
      var planet = planets[id];
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size)
      {
        this.loc = planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size))
      }
    }
  }
}

class Planet
{
  constructor(startX,startY,startXD,startYD,size,color = 'red',density = 1)
  {
    this.loc = new Vector(startX,startY);
    this.vel = new Vector(startXD,startYD);
    this.oldVel = this.vel.copy();
    this.size = size;
    this.density = density;
    this.color = color;
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
          this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo));
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