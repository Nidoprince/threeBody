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
    if(ship.driver)
    {
      drawOn.fillStyle = ship.driverColor;
      drawOn.beginPath();
      drawOn.arc(penLoc.x,penLoc.y,ship.size/(6*zoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    if(ship.controlRotation > 0)
    {
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(2.5*zoomMult)));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(9*zoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(3*zoomMult)));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(13*zoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = tipPoint.addVector(shipDir.negate().rotate(Math.PI/6).normalize(ship.size/(4*zoomMult)));
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,ship.size/(20*zoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    if(ship.controlRotation < 0)
    {
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(2.5*zoomMult)));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(9*zoomMult),0,2*Math.PI)
      drawOn.fill();
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(3*zoomMult)));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(13*zoomMult),0,2*Math.PI)
      angleRight = tipPoint.addVector(shipDir.negate().rotate(-Math.PI/6).normalize(ship.size/(4*zoomMult)));
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,ship.size/(20*zoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    var shipControl = new Vector(ship.controlInput.x,ship.controlInput.y);
    if(Math.abs(shipControl.angle()-shipDir.angle())<Math.PI/3 && shipControl.magnitude()>0)
    {
      let engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*1.2/zoomMult));
      drawOn.fillStyle = "red";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(4*zoomMult),0,2*Math.PI)
      drawOn.fill();
      engineLoc = penLoc.addVector(shipDir.negate().normalize(ship.size*1.1/zoomMult));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(8*zoomMult),0,2*Math.PI)
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,ship.size/(15*zoomMult),0,2*Math.PI)
      drawOn.fill();
    }
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
  if(!player.inSpaceShip)
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
