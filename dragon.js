var space = require("./space.js");
var Vector = space.Vector;

class Dragonball
{
  constructor(color,size,baseOffset)
  {
    this.loc = new Vector(0,0);
    this.direction = new Vector(0,-1);
    this.color = color;
    this.baseOffset = baseOffset;
    this.size = size;
  }
  findWhere(t)
  {
    t = t+this.baseOffset;
    let x;
    let y;
    if(t>700)
    {
      x = 753+15*Math.cos(-this.baseOffset*Math.PI/35);
      y = 702+15*Math.sin(-this.baseOffset*Math.PI/35);
    }
    else
    {
      let d = 30+300*Math.sin(t*Math.PI/700);
      let h = t*300/700;
      x = 750+d*Math.cos(t/20);
      y = 400+h+d*Math.sin(t/20);
    }
    return new Vector(x,y);
  }
  updateLocation(time)
  {
    this.loc = this.findWhere(time);
  }
}

class DragonHead
{
  constructor(x,y,size,type="head")
  {
    this.loc = new Vector(x,y);
    this.type = type;
    this.size = size;
    this.baseLoc = this.loc.copy();
    this.whisker = 0;
  }

  updateLocation()
  {
    if(Math.random()>10/(1+Vector.distance(this.loc,this.baseLoc)))
    {
      this.loc = this.loc.addVector(this.loc.direction(this.baseLoc));
    }
    else
    {
      this.loc = this.loc.addVector(new Vector(Math.random()*1-0.5,Math.random()*1-0.5));
    }
    this.whisker = this.whisker+1;
  }
}

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
    if(t>1120)
    {
      t = t%1120;
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
    else if(t>400 && t <=700)
    {
      let tR = t-400;
      x = 343+3*tR;
      y = 400+150*Math.cos(tR/300*Math.PI);
    }
    else if(t>700 && t <= 800)
    {
      let tR = Math.PI/2-(t-700)*Math.PI/100;
      x = 1245+100*Math.cos(tR);
      y = 350-100*Math.sin(tR);
    }
    else if(t>800 && t <= 990)
    {
      let tR = t-800;
      x = 1245-3.5*tR;
      y = 452-(Math.pow(2,tR/27));
    }
    else if(t>990 && t <= 1120)
    {
      let tR = Math.PI*1.3-(t-990)*Math.PI*1.3/130;
      x = 650+120*Math.cos(tR);
      y = 220-120*Math.sin(tR);
    }
    return new Vector(x,y);
  }

  updateLocation(time)
  {
    this.loc = this.findWhere(time);
    this.direction = this.loc.direction(this.findWhere(time+3));
    this.time = (time+this.baseOffset)%1120;
    if(this.time < 50)
    {
      this.size = 5+(this.maxSize-5)*(this.time/50);
    }
    else if(this.time < 800)
    {
      this.size = this.maxSize;
    }
    else
    {
      this.size = this.maxSize+this.maxSize*0.25*(this.time-800)/200;
    }
  }
}

module.exports.DragonHead = DragonHead;
module.exports.DragonBody = DragonBody;
module.exports.Dragonball = Dragonball;
