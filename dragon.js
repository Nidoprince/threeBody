var space = require("./space.js");
var Vector = space.Vector;

class DragonBody
{
  constructor(colorScale, colorBelly, size, baseOffset)
  {
    this.loc = new Vector(0,0);
    this.direction = new Vector(0,-1);
    this.scaleColor = colorScale;
    this.bellyColor = colorBelly;
    this.twist = Math.PI;
    this.baseOffset = baseOffset;
    this.maxSize = size;
    this.size = size;
    this.time = baseOffset;
  }

  findWhere(t)
  {
    t = t+this.baseOffset;
    let x;
    let y;
    if(t>400)
    {
      t = t%400;
    }
    if(t>=0 && t<= 150)
    {
      y = 700-2*t;
      x = 750+(150*(Math.pow(Math.E,-Math.pow(t-80,2)/(1600))));
    }
    else if(t>150 && t<=350)
    {
      let tR = t-150;
      x = 755-2.5*(tR);
      y = 400-(200-Math.pow((tR-100)/7.1,2))
    }
    else if(t>350 && t<=400)
    {
      let tR = Math.PI*(0.8)+(t-350)*(0.7*Math.PI)/50;
      x = 343+100*Math.cos(tR);
      y = 447-100*Math.sin(tR);
    }
    return new Vector(x,y);
  }

  updateLocation(time)
  {
    this.loc = this.findWhere(time);
    this.direction = this.loc.direction(this.findWhere(time+3));
    this.time = (time+this.baseOffset)%400;
    if(this.time < 50)
    {
      this.size = 5+(this.maxSize-5)*(this.time/50);
    }
    else
    {
      this.size = this.maxSize;
    }
  }
}

module.exports.DragonBody = DragonBody;
