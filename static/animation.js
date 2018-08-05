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
//
// towRocket
//     -
//  -     -
//  1     4
//2         3
//
var shipDrawer = function(ship, drawOn, localViewer = viewer, localZoomMult = zoomMult)
{
  if(ship.type == "explosion")
  {
    for(let particle of ship.particles)
    {
      drawOn.fillStyle = particle.color;
      drawOn.beginPath();
      drawOn.arc((particle.loc.x-localViewer.x)/localZoomMult+800,(particle.loc.y-localViewer.y)/localZoomMult+400, particle.size/localZoomMult, 0, 2 * Math.PI);
      drawOn.fill();
    }
  }
  else
  {
    var penLoc = new Vector((ship.loc.x-localViewer.x)/localZoomMult+800,(ship.loc.y-localViewer.y)/localZoomMult+400);
    var shipDir = new Vector(ship.direction.x,ship.direction.y);
  }
  if(ship.type == "towRocket")
  {
    drawOn.fillStyle = ship.color;
    drawOn.beginPath();
    //CircleCenter
    var circleCenter = penLoc.addVector(shipDir.normalize(ship.size/(2*localZoomMult)));
    drawOn.arc(circleCenter.x,circleCenter.y,ship.size/(2*localZoomMult),shipDir.angle()+3*Math.PI/4,shipDir.angle()+Math.PI/4);
    drawOn.fill();
    drawOn.beginPath();
    //Point 1
    var indentLeft = circleCenter.addVector(shipDir.normalize(ship.size/(3*localZoomMult)).rotate(-Math.PI/2));
    drawOn.moveTo(indentLeft.x,indentLeft.y);
    //Point 2
    var finLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/3/localZoomMult)).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.lineTo(finLeft.x,finLeft.y);
    //Point 3
    var finRight = penLoc.addVector(shipDir.negate().normalize(ship.size/3/localZoomMult)).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.lineTo(finRight.x,finRight.y);
    //Point 4
    var indentRight = circleCenter.addVector(shipDir.normalize(ship.size/(3*localZoomMult)).rotate(Math.PI/2));
    drawOn.lineTo(indentRight.x,indentRight.y);
    drawOn.closePath();
    drawOn.fill();
    if(ship.driverColor)
    {
      drawOn.fillStyle = ship.driverColor;
      drawOn.beginPath();
      drawOn.arc(penLoc.x,penLoc.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    var shipControl = new Vector(ship.controlInput.x,ship.controlInput.y);
    if(Math.abs(shipControl.angle()-shipDir.angle())<Math.PI/3 && shipControl.magnitude()>0)
    {
      let engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*1/localZoomMult));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(1.5*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*0.9/localZoomMult));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(3*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(6*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    if(ship.towing)
    {
      drawOn.strokeStyle = "grey";
      drawOn.beginPath();
      drawOn.moveTo(penLoc.x,penLoc.y);
      let otherSide = new Vector((ship.towing.x-localViewer.x)/localZoomMult+800,(ship.towing.y-localViewer.y)/localZoomMult+400);
      drawOn.lineTo(otherSide.x,otherSide.y);
      drawOn.stroke();
    }
  }
  else if(ship.type == "baseRocket" || ship.type == "miningShip")
  {
    let shipWidth = 1;
    if(ship.type == "miningShip")
    {
      shipWidth = 2;
    }
    drawOn.beginPath();
    drawOn.fillStyle = ship.color;
    //Point 1
    var tipPoint = penLoc.addVector(shipDir.normalize(ship.size/localZoomMult));
    drawOn.moveTo(tipPoint.x,tipPoint.y);
    //Point 2
    var angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(shipWidth*ship.size/(4*localZoomMult)));
    drawOn.lineTo(angleLeft.x,angleLeft.y);
    //Point 3
    var baseLeft = angleLeft.addVector(shipDir.negate().normalize(ship.size*3/(2*localZoomMult)));
    drawOn.lineTo(baseLeft.x,baseLeft.y);
    //Point 4
    var finLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/localZoomMult)).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(2*localZoomMult)));
    drawOn.lineTo(finLeft.x,finLeft.y);
    //Point 5
    var finRight = penLoc.addVector(shipDir.negate().normalize(ship.size/localZoomMult)).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(2*localZoomMult)));
    drawOn.lineTo(finRight.x,finRight.y);
    //Point 7
    var angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(shipWidth*ship.size/(4*localZoomMult)));
    //Point 6
    var baseRight = angleRight.addVector(shipDir.negate().normalize(ship.size*3/(2*localZoomMult)));
    drawOn.lineTo(baseRight.x,baseRight.y);
    drawOn.lineTo(angleRight.x,angleRight.y);
    drawOn.closePath();
    drawOn.fill();
    if(ship.driverColor)
    {
      drawOn.fillStyle = ship.driverColor;
      drawOn.beginPath();
      drawOn.arc(penLoc.x,penLoc.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    if(ship.type == "miningShip" && ship.minerColor)
    {
      var minerPoint = penLoc.subVector(shipDir.normalize(ship.size/(2*localZoomMult)));
      drawOn.fillStyle = ship.minerColor;
      drawOn.beginPath();
      drawOn.arc(minerPoint.x,minerPoint.y,ship.size/(6*localZoomMult),0,2*Math.PI);
      drawOn.fill();
    }
    if(ship.controlRotation > 0)
    {
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(2.5*localZoomMult)));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(9*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(3*localZoomMult)));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(13*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(4*localZoomMult)));
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(20*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    if(ship.controlRotation < 0)
    {
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(2.5*localZoomMult)));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(9*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(3*localZoomMult)));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(13*localZoomMult),0,2*Math.PI)
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(4*localZoomMult)));
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(20*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    var shipControl = new Vector(ship.controlInput.x,ship.controlInput.y);
    if(Math.abs(shipControl.angle()-shipDir.angle())<Math.PI/3 && shipControl.magnitude()>0)
    {
      let engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*1.2/localZoomMult));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(4*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*1.1/localZoomMult));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(8*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(15*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
  }
}
var boidDrawer = function(boid,drawOn,size)
{
  let loc = new Vector((boid.loc.x-viewer.x)/zoomMult+800,(boid.loc.y-viewer.y)/zoomMult+400);
  let vel = new Vector(boid.vel.x,boid.vel.y);
  drawOn.beginPath();
  let tip = loc.addVector(vel.normalize(size/zoomMult));
  drawOn.moveTo(tip.x,tip.y);
  let leftBack = loc.addVector(vel.normalize(size/zoomMult).rotate(-Math.PI*5/6));
  drawOn.lineTo(leftBack.x,leftBack.y);
  let rightBack = loc.addVector(vel.normalize(size/zoomMult).rotate(Math.PI*5/6));
  drawOn.lineTo(rightBack.x,rightBack.y);
  drawOn.closePath();
  drawOn.fill();
}
var flockDrawer = function(flock,drawOn)
{
  drawOn.fillStyle = flock.color;
  for (var boid of flock.flock)
  {
    boidDrawer(boid,drawOn,flock.size);
  }
}
var alienDrawer = function(alien,drawOn)
{
  if("flock" in alien)
  {
    flockDrawer(alien,drawOn);
  }
  else
  {
    drawOn.fillStyle = "white"
    drawOn.fillRect((alien.loc.x-5-viewer.x)/zoomMult+800,(alien.loc.y-5-viewer.y)/zoomMult+400,10/zoomMult,10/zoomMult);
  }
}
var planetDrawer = function(planet,drawOn)
{
  for(var fuel of planet.fuelSources)
  {
    drawOn.fillStyle = "grey";
    drawOn.beginPath();
    let fuelLoc = (new Vector(planet.loc.x,planet.loc.y)).addVector((new Vector(0,-planet.size*0.99)).rotate(fuel));
    drawOn.arc((fuelLoc.x-viewer.x)/zoomMult+800,(fuelLoc.y-viewer.y)/zoomMult+400, planet.size*0.015/zoomMult,0, 2 * Math.PI);
    drawOn.fill();
  }
  drawOn.fillStyle = planet.color;
  drawOn.beginPath();
  drawOn.arc((planet.loc.x-viewer.x)/zoomMult+800,(planet.loc.y-viewer.y)/zoomMult+400, planet.size/zoomMult, 0, 2 * Math.PI);
  drawOn.fill();
  drawOn.fillStyle = planet.atmosphereColor;
  drawOn.beginPath();
  drawOn.arc((planet.loc.x-viewer.x)/zoomMult+800,(planet.loc.y-viewer.y)/zoomMult+400, 1.2*planet.size/zoomMult, 0, 2 * Math.PI);
  drawOn.fill();
}

var asteroidDrawer = function(asteroid,drawOn)
{
  drawOn.fillStyle = asteroid.color;
  drawOn.beginPath();
  drawOn.arc((asteroid.loc.x-viewer.x)/zoomMult+800,(asteroid.loc.y-viewer.y)/zoomMult+400, asteroid.size/zoomMult, 0, 2 * Math.PI);
  drawOn.fill();
}

var fuelBar = function(player,drawOn)
{
  drawOn.strokeStyle = "grey";
  drawOn.fillStyle = "purple";
  drawOn.strokeRect(29,29,32,502);
  drawOn.fillRect(30,30+500-player.inSpaceShip.fuel/100,30,player.inSpaceShip.fuel/100);
}

var playerDrawer = function(player,drawOn)
{
  if(!player.inSpaceShip && player != "dead")
  {
    drawOn.fillStyle = player.color;
    drawOn.beginPath();
    drawOn.arc((player.loc.x-viewer.x)/zoomMult+800,(player.loc.y-viewer.y)/zoomMult+400, player.size/zoomMult, 0, 2 * Math.PI);
    drawOn.fill();
  }
}

var playerDot = function(player, drawOn)
{
  drawOn.fillStyle = "purple";
  drawOn.beginPath();
  drawOn.arc((player.loc.x-viewer.x)/zoomMult+800,(player.loc.y-viewer.y)/zoomMult+400, 2, 0, 2 * Math.PI);
  drawOn.fill();
}

var starForger = function(drawOn)
{
  //Make Stars
  var time = (new Date()).getTime();
  for(var i = 0; i < 100 +10*(viewer.zoom+20); i++)
  {
    var xS = (5001*i+Math.floor(Math.abs(viewer.x)/20))%1600;
    var yS = (333*i*i+Math.floor(Math.abs(viewer.y)/30))%800;
    if((time+2001*i)%100000 <= 500)
    {
      drawOn.fillStyle = "rgba(255,255,255,0."+((Math.abs(i*i+i)%60)+49).toString()+")";
    }
    else
    {
      drawOn.fillStyle = "rgba(255,255,255,0."+((Math.abs(i*i+i)%60)+20).toString()+")";
    }
    drawOn.beginPath();
    drawOn.arc(xS,yS,Math.abs(i*i+i)%5,0,2*Math.PI);
    drawOn.fill();
  }
}

var menuAnimation =  function(drawOn)
{
  drawOn.fillStyle = "grey";
  drawOn.fillRect(50,50,1500,700);
  drawOn.fillStyle = "purple";
  drawOn.fillRect(100+250*(menuLoc%6),100+225*Math.floor(menuLoc/6),150,150);
  drawOn.fillStyle = "white";
  drawOn.font = "bold 14px Arial";
  drawOn.fillText("Base Rocket",130,150);
  drawOn.fillText("1 Iron", 150,190);
  drawOn.fillText("Tow Rocket",380,150);
  drawOn.fillText("4 Iron", 400,190);
  drawOn.fillText("Press T to Tow.",375,230);
}
