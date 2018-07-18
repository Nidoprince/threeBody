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

// baseRocket
//      1
//   2     7
//
//
//
//
//
//
//   3     6
//
//4           5
var shipDrawer = function(ship, drawOn)
{
  var zoomMult = Math.pow(zoomRatio,viewer.zoom);
  var penLoc = new Vector((ship.loc.x-viewer.x)/zoomMult+800,(ship.loc.y-viewer.y)/zoomMult+400);
  var shipDir = new Vector(ship.direction.x,ship.direction.y);
  if(ship.type == "baseRocket")
  {
    drawOn.beginPath();
    drawOn.fillStyle = ship.color;
    //Point 1
    var tipPoint = penLoc.addVector(shipDir.normalize(ship.size/zoomMult));
    drawOn.moveTo(tipPoint.x,tipPoint.y);
    //Point 2
    var angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(4*zoomMult)));
    drawOn.lineTo(angleLeft.x,angleLeft.y);
    //Point 3
    var baseLeft = angleLeft.addVector(shipDir.negate().normalize(ship.size*3/(2*zoomMult)));
    drawOn.lineTo(baseLeft.x,baseLeft.y);
    //Point 4
    var finLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/zoomMult)).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(2*zoomMult)));
    drawOn.lineTo(finLeft.x,finLeft.y);
    //Point 5
    var finRight = penLoc.addVector(shipDir.negate().normalize(ship.size/zoomMult)).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(2*zoomMult)));
    drawOn.lineTo(finRight.x,finRight.y);
    //Point 7
    var angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(4*zoomMult)));
    //Point 6
    var baseRight = angleRight.addVector(shipDir.negate().normalize(ship.size*3/(2*zoomMult)));
    drawOn.lineTo(baseRight.x,baseRight.y);
    drawOn.lineTo(angleRight.x,angleRight.y);
    drawOn.closePath();
    drawOn.fill();
  }
}
