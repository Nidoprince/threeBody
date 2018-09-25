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
  if(ship.type == "towRocket" || ship.type == "realityRocket")
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
    if(ship.type == "realityRocket")
    {
      //Point 1.5
      var spikeLeft = penLoc.addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(localZoomMult)));
      drawOn.lineTo(spikeLeft.x,spikeLeft.y);
    }
    //Point 2
    var finLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/3/localZoomMult)).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.lineTo(finLeft.x,finLeft.y);
    //Point 3
    var finRight = penLoc.addVector(shipDir.negate().normalize(ship.size/3/localZoomMult)).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.lineTo(finRight.x,finRight.y);
    if(ship.type == "realityRocket")
    {
      //Point 3.5
      var spikeRight = penLoc.addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(localZoomMult)));
      drawOn.lineTo(spikeRight.x,spikeRight.y);
    }
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
    if(ship.type == "towRocket" && ship.towing)
    {
      drawOn.strokeStyle = "grey";
      drawOn.beginPath();
      drawOn.moveTo(penLoc.x,penLoc.y);
      let otherSide = new Vector((ship.towing.x-localViewer.x)/localZoomMult+800,(ship.towing.y-localViewer.y)/localZoomMult+400);
      drawOn.lineTo(otherSide.x,otherSide.y);
      drawOn.stroke();
    }
  }
  else if(ship.type == "SUV" || ship.type == "hopper" || ship.type == "tank")
  {
    drawOn.fillStyle = ship.color;
    drawOn.beginPath();
    //Point1
    if(ship.type == "SUV" || ship.type == "tank")
    {
      var topLeft = penLoc.addVector(shipDir.normalize(ship.size/localZoomMult).rotate(3*Math.PI/2)).addVector(shipDir.normalize(ship.size/4/localZoomMult));
    }
    else if(ship.type == "hopper")
    {
      var topLeft = penLoc.addVector(shipDir.normalize(1.5*ship.size/localZoomMult).rotate(3*Math.PI/2)).addVector(shipDir.normalize(ship.size/3/localZoomMult));
    }
    drawOn.moveTo(topLeft.x,topLeft.y);
    //Point2
    var bottomLeft = penLoc.addVector(shipDir.normalize(ship.size/localZoomMult).rotate(3*Math.PI/2)).subVector(shipDir.normalize(ship.size/2/localZoomMult));
    drawOn.lineTo(bottomLeft.x,bottomLeft.y);
    //Point3
    var bottomRight = penLoc.addVector(shipDir.normalize(ship.size/localZoomMult).rotate(Math.PI/2)).subVector(shipDir.normalize(ship.size/2/localZoomMult));
    drawOn.lineTo(bottomRight.x,bottomRight.y);
    //Point4
    if(ship.type == "SUV" || ship.type == "tank")
    {
      var topRight = penLoc.addVector(shipDir.normalize(ship.size/localZoomMult).rotate(Math.PI/2)).addVector(shipDir.normalize(ship.size/4/localZoomMult));
    }
    else if(ship.type == "hopper")
    {
      var topRight = penLoc.addVector(shipDir.normalize(1.5*ship.size/localZoomMult).rotate(Math.PI/2)).addVector(shipDir.normalize(ship.size/3/localZoomMult));
    }
    drawOn.lineTo(topRight.x,topRight.y);
    drawOn.closePath();
    drawOn.fill();
    if(ship.driverColor)
    {
      drawOn.fillStyle = ship.driverColor;
      drawOn.beginPath();
      drawOn.arc(penLoc.x,penLoc.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    if(ship.type == "tank")
    {
      let hardPoint = penLoc.addVector(shipDir.normalize(ship.size/(3*localZoomMult)));
      drawOn.beginPath();
      drawOn.arc(hardPoint.x,hardPoint.y,ship.size/(3*localZoomMult), 0, 2*Math.PI);
      drawOn.fill();
      let turretDirection = shipDir.rotate(ship.turretAngle);
      //Turret Point 1
      let turretBottomLeft = hardPoint.addVector(turretDirection.rotate(3*Math.PI/2).normalize(ship.size/(10*localZoomMult)));
      //Turret Point 2
      let turretBottomRight = hardPoint.addVector(turretDirection.rotate(Math.PI/2).normalize(ship.size/(10*localZoomMult)));
      //Turret Point 3
      let turretTopRight = turretBottomRight.addVector(turretDirection.normalize(ship.size/localZoomMult));
      //Turret Point 4
      let turretTopLeft = turretBottomLeft.addVector(turretDirection.normalize(ship.size/localZoomMult));
      drawOn.beginPath();
      drawOn.moveTo(turretBottomLeft.x,turretBottomLeft.y);
      drawOn.lineTo(turretBottomRight.x,turretBottomRight.y);
      drawOn.lineTo(turretTopRight.x,turretTopRight.y);
      drawOn.lineTo(turretTopLeft.x,turretTopLeft.y);
      drawOn.closePath();
      drawOn.fill();
      if(ship.officerColor)
      {
        drawOn.fillStyle = ship.officerColor;
        drawOn.beginPath();
        drawOn.arc(hardPoint.x,hardPoint.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
        drawOn.fill();
      }
      for(let projectile of ship.firedBlasts)
      {
        itemDrawer(projectile,drawOn);
      }
    }
  }
  else if(ship.type == "baseRocket" || ship.type == "miningShip" || ship.type == "jumpShip")
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
    if(ship.type == "jumpShip")
    {
      var topFinLeft = angleLeft.subVector(shipDir.normalize(ship.size/(2*localZoomMult)));
      drawOn.lineTo(topFinLeft.x,topFinLeft.y);
      var finTipLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult))).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(2*localZoomMult)));
      drawOn.lineTo(finTipLeft.x,finTipLeft.y);
      var inFinLeft = penLoc.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult))).addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(8*localZoomMult)));
      drawOn.lineTo(inFinLeft.x,inFinLeft.y);
    }
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
    if(ship.type == "jumpShip")
    {
      var inFinRight = penLoc.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult))).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(8*localZoomMult)));
      drawOn.lineTo(inFinRight.x,inFinRight.y);
      var finTipRight = penLoc.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult))).addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(2*localZoomMult)));
      drawOn.lineTo(finTipRight.x,finTipRight.y);
      var topFinRight = angleRight.subVector(shipDir.normalize(ship.size/(2*localZoomMult)));
      drawOn.lineTo(topFinRight.x,topFinRight.y);
    }
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
  else if(ship.type == "capitolShip")
  {
    if(ship.gravityDrive && localZoomMult == zoomMult)
    {
      let gradient = drawOn.createRadialGradient(penLoc.x,penLoc.y,10*ship.size/localZoomMult,penLoc.x,penLoc.y,60*ship.size/localZoomMult);
      if(ship.gravityDrive == "white")
      {
        gradient.addColorStop(0,"rgba(255,255,255,0.9)");
        gradient.addColorStop(1,"rgba(255,255,255,0)");
      }
      else if(ship.gravityDrive == "black")
      {
        gradient.addColorStop(0,"rgba(0,0,0,0.9)");
        gradient.addColorStop(1,"rgba(0,0,0,0)");
      }
      drawOn.fillStyle = gradient;
      drawOn.beginPath();
      drawOn.arc(penLoc.x,penLoc.y,60*ship.size/localZoomMult,0,2*Math.PI)
      drawOn.fill();
    }
    drawOn.fillStyle = ship.color;
    drawOn.beginPath();
    let forwardCircle = penLoc.addVector(shipDir.normalize(ship.size/(4*localZoomMult)));
    drawOn.arc(forwardCircle.x,forwardCircle.y,3*ship.size/(4*localZoomMult),0,2*Math.PI);
    drawOn.fill();
    let leftHalfCircle = penLoc.addVector(shipDir.rotate(3*Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.beginPath();
    drawOn.arc(leftHalfCircle.x,leftHalfCircle.y,ship.size/(1.5*localZoomMult),shipDir.angle()+Math.PI/4+ship.leftFinAngle,shipDir.angle()+Math.PI+Math.PI/4+ship.leftFinAngle);
    drawOn.fill();
    let rightHalfCircle = penLoc.addVector(shipDir.rotate(Math.PI/2).normalize(ship.size/(1.5*localZoomMult)));
    drawOn.beginPath();
    drawOn.arc(rightHalfCircle.x,rightHalfCircle.y,ship.size/(1.5*localZoomMult),shipDir.angle()-Math.PI/4+ship.rightFinAngle,shipDir.angle()+Math.PI-Math.PI/4+ship.rightFinAngle);
    drawOn.fill();
    let leftThruster = leftHalfCircle.addVector(shipDir.negate().normalize(ship.size/localZoomMult));
    drawOn.beginPath();
    drawOn.arc(leftThruster.x,leftThruster.y,ship.size/(2*localZoomMult),shipDir.angle(),shipDir.angle()+Math.PI,true);
    drawOn.fill();
    let rightThruster = rightHalfCircle.addVector(shipDir.negate().normalize(ship.size/localZoomMult));
    drawOn.beginPath();
    drawOn.arc(rightThruster.x,rightThruster.y,ship.size/(2*localZoomMult),shipDir.angle(),shipDir.angle()+Math.PI,true);
    drawOn.fill();
    let midThruster = penLoc.addVector(shipDir.negate().normalize(ship.size/(1.5*localZoomMult)));
    drawOn.beginPath();
    drawOn.arc(midThruster.x,midThruster.y,ship.size/(2*localZoomMult),shipDir.angle(),shipDir.angle()+Math.PI,true);
    drawOn.fill();
    if(ship.driverColor)
    {
      drawOn.fillStyle = ship.driverColor;
      drawOn.beginPath();
      drawOn.arc(forwardCircle.x,forwardCircle.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    if(ship.leftColor)
    {
      drawOn.fillStyle = ship.leftColor;
      drawOn.beginPath();
      drawOn.arc(leftHalfCircle.x,leftHalfCircle.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    if(ship.rightColor)
    {
      drawOn.fillStyle = ship.rightColor;
      drawOn.beginPath();
      drawOn.arc(rightHalfCircle.x,rightHalfCircle.y,ship.size/(6*localZoomMult), 0, 2 * Math.PI);
      drawOn.fill();
    }
    var shipControl = new Vector(ship.controlInput.x,ship.controlInput.y);
    let forwardThrust = Math.abs(shipControl.angle()-shipDir.angle())<Math.PI/3 && shipControl.magnitude()>0;
    if(ship.controlRotation > 0 || forwardThrust)
    {
      let intensity = 1;
      if(ship.controlRotation > 0 && forwardThrust)
      {
        intensity = 1.3;
      }
      angleLeft = leftThruster.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult)));
      drawOn.fillStyle = "blue";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,intensity*ship.size/(3*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = leftThruster.addVector(shipDir.negate().normalize(ship.size/(3*localZoomMult)));
      drawOn.fillStyle = "lightblue";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,intensity*ship.size/(6*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleLeft = leftThruster.addVector(shipDir.negate().normalize(ship.size/(3.5*localZoomMult)));
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleLeft.x,angleLeft.y,intensity*ship.size/(9*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    if(ship.controlRotation < 0 || forwardThrust)
    {
      let intensity = 1;
      if(ship.controlRotation < 0 && forwardThrust)
      {
        intensity = 1.3;
      }
      angleRight = rightThruster.addVector(shipDir.negate().normalize(ship.size/(2*localZoomMult)));
      drawOn.fillStyle = "blue";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,intensity*ship.size/(3*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      angleRight = rightThruster.addVector(shipDir.negate().normalize(ship.size/(3*localZoomMult)));
      drawOn.fillStyle = "lightblue";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,intensity*ship.size/(6*localZoomMult),0,2*Math.PI)
      angleRight = rightThruster.addVector(shipDir.negate().normalize(ship.size/(3.5*localZoomMult)));
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(angleRight.x,angleRight.y,intensity*ship.size/(9*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    if(forwardThrust)
    {
      let intensity = shipControl.magnitude();
      let engineLoc = midThruster.addVector(shipDir.negate().normalize(ship.size*1.2/localZoomMult));
      drawOn.fillStyle = "blue";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,intensity*ship.size/(1.5*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      engineLoc = midThruster.addVector(shipDir.negate().normalize(ship.size*1.1/localZoomMult));
      drawOn.fillStyle = "lightblue";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,intensity*ship.size/(2.5*localZoomMult),0,2*Math.PI)
      drawOn.fill();
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(engineLoc.x,engineLoc.y,intensity*ship.size/(4*localZoomMult),0,2*Math.PI)
      drawOn.fill();
    }
    for(let projectile of ship.firedBlasts)
    {
      itemDrawer(projectile,drawOn);
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
  if(flock.size/zoomMult > 1)
  {
    drawOn.fillStyle = flock.color;
    for (var boid of flock.flock)
    {
      boidDrawer(boid,drawOn,flock.size);
    }
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

var buildingDrawer = function(building,planet,drawOn)
{
  let planetLoc = new Vector(planet.loc.x,planet.loc.y);
  let dir = (new Vector(0,-1)).rotate(building.angle);
  let planetTouch = planetLoc.addVector((new Vector(0,-planet.size).rotate(building.angle)));
  planetTouch = new Vector((planetTouch.x-viewer.x)/zoomMult+800,(planetTouch.y-viewer.y)/zoomMult+400);
  drawOn.fillStyle = building.color;
  if(building.type == "refinery" || building.type == "warehouse")
  {
    //Make Points
    let upperLeftCorner = planetTouch.addVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/zoomMult).rotate(3*Math.PI/2));
    let upperRightCorner = planetTouch.addVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/zoomMult).rotate(Math.PI/2));
    let lowerLeftCorner = planetTouch.subVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/zoomMult).rotate(3*Math.PI/2));
    let lowerRightCorner = planetTouch.subVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/zoomMult).rotate(Math.PI/2));
    let leftSmokestack = planetTouch.addVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/(2*zoomMult)).rotate(3*Math.PI/2));
    let rightSmokestack = planetTouch.addVector(dir.multiplyScaler(building.size/zoomMult)).addVector(dir.multiplyScaler(building.size/(2*zoomMult)).rotate(Math.PI/2));
    let leftBase = planetTouch.addVector(dir.multiplyScaler(building.size/(2*zoomMult))).addVector(dir.multiplyScaler(building.size/(2*zoomMult)).rotate(3*Math.PI/2));
    let rightBase = planetTouch.addVector(dir.multiplyScaler(building.size/(2*zoomMult))).addVector(dir.multiplyScaler(building.size/(2*zoomMult)).rotate(Math.PI/2));
    drawOn.beginPath();
    drawOn.strokeStyle = "grey";
    drawOn.moveTo(lowerLeftCorner.x,lowerLeftCorner.y);
    drawOn.lineTo(upperLeftCorner.x,upperLeftCorner.y);
    if(building.type == "refinery")
    {
      drawOn.lineTo(leftSmokestack.x,leftSmokestack.y);
      drawOn.lineTo(leftBase.x,leftBase.y);
      drawOn.lineTo(rightBase.x,rightBase.y);
      drawOn.lineTo(rightSmokestack.x,rightSmokestack.y);
    }
    drawOn.lineTo(upperRightCorner.x,upperRightCorner.y);
    drawOn.lineTo(lowerRightCorner.x,lowerRightCorner.y);
    drawOn.closePath();
    drawOn.fill();
    drawOn.stroke();
  }
  else if(building.type == "autoCannon")
  {
    drawOn.beginPath();
    drawOn.arc(planetTouch.x,planetTouch.y,building.size/zoomMult,0,2*Math.PI);
    drawOn.fill();
    drawOn.closePath();
    drawOn.beginPath();
    drawOn.moveTo(planetTouch.x,planetTouch.y);
    drawOn.arc(planetTouch.x,planetTouch.y,building.size*1.8/zoomMult,building.cannonAngle+building.angle-Math.PI/10-Math.PI/2,building.cannonAngle+building.angle+Math.PI/10-Math.PI/2);
    drawOn.lineTo(planetTouch.x,planetTouch.y);
    drawOn.fill();
    drawOn.closePath();
    for(let projectile of building.shots)
    {
      itemDrawer(projectile,drawOn);
    }
  }
}

var buildingsDrawer = function(planet,drawOn)
{
  for(let building of planet.buildings)
  {
    buildingDrawer(building, planet, drawOn);
  }
}

var planetDrawer = function(planet,drawOn)
{
  for(var fuel of planet.fuelSources)
  {
    drawOn.fillStyle = "grey";
    drawOn.beginPath();
    let fuelLoc = (new Vector(planet.loc.x,planet.loc.y)).addVector((new Vector(0,-planet.size*0.98)).rotate(fuel));
    drawOn.arc((fuelLoc.x-viewer.x)/zoomMult+800,(fuelLoc.y-viewer.y)/zoomMult+400, planet.size*0.03/zoomMult,0, 2 * Math.PI);
    drawOn.fill();
  }
  buildingsDrawer(planet,drawOn);
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
  if(asteroid.size/zoomMult > 0.5)
  {
    buildingsDrawer(asteroid,drawOn);
    drawOn.fillStyle = asteroid.color;
    drawOn.beginPath();
    drawOn.arc((asteroid.loc.x-viewer.x)/zoomMult+800,(asteroid.loc.y-viewer.y)/zoomMult+400, asteroid.size/zoomMult, 0, 2 * Math.PI);
    drawOn.fill();
  }
}

var itemDrawer = function(item,drawOn)
{
  if(item.size/zoomMult > 0.5)
  {
    drawOn.fillStyle = item.color;
    drawOn.beginPath();
    drawOn.arc((item.loc.x-viewer.x)/zoomMult+800,(item.loc.y-viewer.y)/zoomMult+400, item.size/zoomMult, 0, 2 * Math.PI);
    drawOn.fill();
  }
}

var shenronDrawer = function(segment,drawOn)
{
  drawOn.fillStyle = segment.scaleColor;
  drawOn.strokeStyle = "grey";
  drawOn.beginPath();
  drawOn.arc(segment.loc.x,segment.loc.y,segment.size,0,2*Math.PI);
  drawOn.fill();
  drawOn.stroke();
}

var fuelBar = function(player,drawOn)
{
  drawOn.strokeStyle = "grey";
  drawOn.fillStyle = "purple";
  drawOn.strokeRect(29,29,32,502);
  drawOn.fillRect(30,30+500-500*(player.inSpaceShip.fuel/player.inSpaceShip.fuelMax),30,player.inSpaceShip.fuel/(player.inSpaceShip.fuelMax/500));
}

var airBar = function(player,drawOn)
{
  drawOn.strokeStyle = "grey";
  if(player.reality == 0)
  {
    drawOn.fillStyle = "white";
  }
  else
  {
    drawOn.fillStyle = "lightblue";
  }
  drawOn.strokeRect(29,29,32,502);
  drawOn.fillRect(30,30+500-500*(player.air/player.airMax),30,500*player.air/player.airMax);
}

var playerDrawer = function(player,drawOn,localViewer = viewer, localZoomMult = zoomMult)
{
  if(!player.inSpaceShip && player != "dead")
  {
    let adjustmentIndex = 0;
    if(player.reality != 0)
    {
      adjustmentIndex = 3;
    }
    let playerLoc = new Vector((player.loc.x-localViewer.x)/localZoomMult+800,(player.loc.y-localViewer.y)/localZoomMult+400);
    let velDirect = player.velocityComponents[8-adjustmentIndex][1];
    let earthMove = (new Vector(player.velocityComponents[5-adjustmentIndex][1].x,player.velocityComponents[5-adjustmentIndex][1].y)).addVector(new Vector(player.velocityComponents[4-adjustmentIndex][1].x,player.velocityComponents[4-adjustmentIndex][1].y));
    velDirect = (new Vector(velDirect.x,velDirect.y));
    if(player.inventory.includes("jetpack") && velDirect.magnitude() > 0)
    {
      let vel = velDirect.multiplyScaler(99).addVector((new Vector(player.vel.x,player.vel.y)).multiplyScaler(1)).multiplyScaler(0.01);
      let fireLoc = playerLoc.subVector(vel.normalize(player.size*1.5/localZoomMult));
      drawOn.fillStyle = "orange";
      drawOn.beginPath();
      drawOn.arc(fireLoc.x,fireLoc.y,player.size*0.75/localZoomMult,0,2*Math.PI);
      drawOn.fill();
      fireLoc = playerLoc.subVector(vel.normalize(player.size*1.2/localZoomMult));
      drawOn.fillStyle = "white";
      drawOn.beginPath();
      drawOn.arc(fireLoc.x,fireLoc.y,player.size*0.4/localZoomMult,0,2*Math.PI);
      drawOn.fill();
    }
    if(earthMove.magnitude() > 0)
    {
      velDirect = earthMove.copy();
    }
    else if(!player.inventory.includes("jetpack") && player.controllingPlanet)
    {
      let gravityDirection = Vector.makeVec(player.loc).direction(Vector.makeVec(player.controllingPlanet.loc));
      let velWithoutGravity = Vector.makeVec(player.vel).subVector(Vector.makeVec(player.vel).projectOnto(gravityDirection));
      if(velWithoutGravity.magnitude() > 0.1)
      {
        velDirect = velWithoutGravity.copy();
      }
    }
    drawOn.fillStyle = player.color;
    if(player.inventory.includes("cannon") && velDirect.magnitude() > 0)
    {
      drawOn.beginPath();
      drawOn.moveTo(playerLoc.x,playerLoc.y);
      let topCannon = playerLoc.addVector(velDirect.normalize(player.size*2/localZoomMult)).subVector(velDirect.rotate(Math.PI/2).normalize(player.size/(2*localZoomMult)));
      let bottomCannon = playerLoc.addVector(velDirect.normalize(player.size*2/localZoomMult)).addVector(velDirect.rotate(Math.PI/2).normalize(player.size/(2*localZoomMult)));
      drawOn.lineTo(topCannon.x,topCannon.y);
      drawOn.lineTo(bottomCannon.x,bottomCannon.y);
      drawOn.closePath();
      drawOn.fill();
    }
    drawOn.strokeStyle = "black";
    if(player.inventory.includes("suit"))
    {
      drawOn.strokeStyle = "grey";
    }
    drawOn.beginPath();
    drawOn.arc(playerLoc.x,playerLoc.y, player.size/localZoomMult, 0, 2 * Math.PI);
    drawOn.fill();
    drawOn.stroke();
    for(let projectile of player.shotsFired)
    {
      itemDrawer(projectile,drawOn);
    }
  }
}

var drawInventory = function(player, drawOn)
{
  for (var inv in player.inventory)
  {
    drawOn.fillStyle = "white"
    if(reality == 1)
    {
      drawOn.fillStyle = "black";
    }
    drawOn.font = "bold 14px Arial";
    drawOn.fillText(myPlayer.inventory[inv],50+inv*100,770)
  }
}

var playerDot = function(player, drawOn)
{
  drawOn.fillStyle = "purple";
  drawOn.beginPath();
  drawOn.arc((player.loc.x-viewer.x)/zoomMult+800,(player.loc.y-viewer.y)/zoomMult+400, 2, 0, 2 * Math.PI);
  drawOn.fill();
}

var radarDrawer = function(player, drawOn)
{
  let playerLoc = Vector.makeVec(player.loc);
  drawOn.fillStyle = "orange";
  for(let pointer of player.radarPoints)
  {
    let dir = Vector.makeVec(pointer);
    boidDrawer({
      loc: playerLoc.addVector(dir.multiplyScaler(player.size*2)),
      vel: dir.copy()
    },drawOn,player.size/2);
  }
}

var tearDrawer = function(tear, drawOn)
{
  drawOn.fillStyle = tear.color;
  if(tear.worm1reality == reality)
  {
    drawOn.beginPath();
    drawOn.arc((tear.worm1.x-viewer.x)/zoomMult+800,(tear.worm1.y-viewer.y)/zoomMult+400, tear.size/zoomMult, 0, 2*Math.PI);
    drawOn.fill();
  }
  if(tear.worm2reality == reality)
  {
    drawOn.beginPath();
    drawOn.arc((tear.worm2.x-viewer.x)/zoomMult+800,(tear.worm2.y-viewer.y)/zoomMult+400, tear.size/zoomMult, 0, 2*Math.PI);
    drawOn.fill();
  }
}

var starForger = function(drawOn)
{
  //Make Stars
  var time = (new Date()).getTime();
  for(var i = 0; i < 100 + 2*(viewer.zoom+50); i++)
  {
    var xS = Math.floor((5001*i+Math.floor(Math.abs(viewer.x)/20))%1600);
    var yS = Math.floor((333*i*i+Math.floor(Math.abs(viewer.y)/30))%800);
    let colorStart;
    if(reality == 0)
    {
      colorStart = "rgba(255,255,255,0."
    }
    else if(reality == 1)
    {
      colorStart = "rgba(0,0,0,0."
    }
    else if(reality == 2)
    {
      colorStart = "rgba(255,0,0,0."
    }
    if((time+2001*i)%100000 <= 500)
    {
      drawOn.fillStyle = colorStart+((Math.abs(i*i+i)%60)+49).toString()+")";
    }
    else
    {
      drawOn.fillStyle = colorStart+((Math.abs(i*i+i)%60)+20).toString()+")";
    }
    drawOn.beginPath();
    drawOn.arc(xS,yS,Math.abs(i*i+i)%5,0,2*Math.PI);
    drawOn.fill();
  }
}

var parkDrawer = function(isParked,drawOn,x,y)
{
  drawOn.fillStyle = "grey";
  drawOn.strokeStyle = "grey";
  drawOn.strokeRect(x,y-1,65,65);
  drawOn.font = "bold 50px Arial";
  if(isParked)
  {
    drawOn.fillText("P",x+15,y+50);
  }
  else
  {
    drawOn.fillText("X",x+15,y+50)
  }
}

var scannerDrawer = function(player,asteroids,drawOn,x,y)
{
  drawOn.fillStyle = "grey";
  drawOn.strokeStyle = "grey";
  drawOn.strokeRect(x,y-1,65,65);
  drawOn.font = "bold 50px Arial";
  let symbol;
  if(viewer.item.lookingFor == "iron")
  {
    symbol = "I";
  }
  else if(viewer.item.lookingFor == "chronos")
  {
    symbol = "C";
  }
  else if(viewer.item.lookingFor == "dark")
  {
    symbol = "D";
  }
  drawOn.fillText(symbol,x+15,y+50);
  asteroids = asteroids.filter((x) => x.reality == myPlayer.reality && x.contents == viewer.item.lookingFor);
  if(asteroids.length > 0)
  {
    let playerLoc = new Vector(player.loc.x,player.loc.y);
    let maxScanningDistance = 50000;
    let closestAsteroid = false;
    for(let asteroid of asteroids)
    {
      let asteroidLoc = new Vector(asteroid.loc.x,asteroid.loc.y);
      let distance = Vector.distance(playerLoc,asteroidLoc);
      if(distance < maxScanningDistance)
      {
        maxScanningDistance = distance;
        closestAsteroid = asteroid;
      }
    }
    if(closestAsteroid)
    {
      let asteroidLoc = new Vector(closestAsteroid.loc.x,closestAsteroid.loc.y);
      let towardsAsteroid = playerLoc.direction(asteroidLoc);
      let penLoc = new Vector((playerLoc.x-viewer.x)/zoomMult+800,(playerLoc.y-viewer.y)/zoomMult+400);
      let pointerTip = penLoc.addVector(towardsAsteroid.normalize(80));
      let leftBack = pointerTip.addVector(towardsAsteroid.normalize(15).rotate(-Math.PI*9/10));
      let rightBack = pointerTip.addVector(towardsAsteroid.normalize(15).rotate(Math.PI*9/10));
      drawOn.beginPath();
      drawOn.moveTo(pointerTip.x,pointerTip.y);
      drawOn.lineTo(leftBack.x,leftBack.y);
      drawOn.lineTo(rightBack.x,rightBack.y);
      drawOn.closePath();
      drawOn.fill();
    }
  }
}

var specialDrawer = function(ship,drawOn,x,y)
{
  if("id" in ship)
  {
    let player = ship;
    drawOn.strokeStyle = "grey";
    drawOn.strokeRect(x,y-1,65,65);
    drawOn.fillStyle = "grey";
    drawOn.font = "bold 50px Arial";
    if(player.cannonCooldown == 0)
    {
      drawOn.fillText("F",x+15,y+50);
    }
    else
    {
      drawOn.fillText("X",x+15,y+50);
    }
  }
  else if(["towRocket","realityRocket","miningShip","capitolShip"].includes(ship.type))
  {
    drawOn.strokeStyle = "grey";
    drawOn.strokeRect(x,y-1,65,65);
    drawOn.fillStyle = "grey";
    drawOn.font = "bold 50px Arial";
    if(ship.type == "towRocket")
    {
      if(ship.towing)
      {
        drawOn.fillText("T",x+15,y+50);
      }
      else
      {
        drawOn.fillText("X",x+15,y+50);
      }
    }
    else if(ship.type == "realityRocket")
    {
      drawOn.fillText(ship.reality,x+15,y+50);
    }
    else if(ship.type == "miningShip")
    {
      if(ship.driverColor && ship.minerColor)
      {
        drawOn.fillText("2",x+15,y+50);
      }
      else
      {
        drawOn.fillText("1",x+15,y+50);
      }
    }
    else if(ship.type == "jumpShip")
    {
      drawOn.fillText("J",x+15,y+50);
    }
    else if(ship.type == "capitolShip")
    {
      if(myPlayer.id == ship.driver)
      {
        let show = "X";
        if(ship.gravityDrive == "black")
        {
          show = "B";
        }
        else if(ship.gravityDrive == "white")
        {
          show = "W";
        }
        drawOn.fillText(show,x+15,y+50);
      }
      else if(myPlayer.id == ship.leftOfficer)
      {
        let show = "D";
        if(ship.leftFinCooldown > 0)
        {
          show = "X";
        }
        drawOn.fillText(show,x+15,y+50);
      }
      else if(myPlayer.id == ship.rightOfficer)
      {
        let show = "D";
        if(ship.rightFinCooldown > 0)
        {
          show = "X";
        }
        drawOn.fillText(show,x+15,y+50);
      }
    }
  }
}

var drawTouch = function(drawOn)
{
  drawOn.fillStyle = "orange";
  drawOn.beginPath();
  drawOn.arc(trigger.tX,trigger.tY,10,0,2*Math.PI);
  drawOn.fill();
}

var warehouseMenuAnimation = function(drawOn,whichHouse)
{
  drawOn.fillStyle = "brown";
  drawOn.fillRect(50,50,1500,700);
  drawOn.fillStyle = "darkgrey";
  drawOn.fillRect(100+121*(menuLoc%12),100+175*Math.floor(menuLoc/12),71,75);
  drawOn.fillStyle = "white";
  drawOn.font = "bold 14px Arial";
  for(let i in whichHouse.storage)
  {
    drawOn.fillText(whichHouse.storage[i],110+121*(i%12),150+175*Math.floor(i/12));
  }
}


var refineMenuAnimation = function(drawOn)
{
  drawOn.fillStyle = "darkgrey";
  drawOn.fillRect(50,50,1500,700);
  drawOn.fillStyle = "orange";
  drawOn.fillRect(100+375*(menuLoc%4),100+350*Math.floor(menuLoc/4),275,250);
  drawOn.fillStyle = "white";
  drawOn.font = "bold 16px Arial";
  drawOn.fillText("Steel",200,150);
  drawOn.fillText("1 Iron 1 Fuel",180,190);
  drawOn.fillText("Chaos",575,150);
  drawOn.fillText("4 Chronos",555,190);
  drawOn.fillText("Fuel+",955,150);
  drawOn.fillText("4 Fuel",955,190);
  drawOn.fillText("Omega",1325,150);
  drawOn.fillText("Iron Chronos Dark",1300,190);
  drawOn.fillText("Fusion",200,500);
  drawOn.fillText("2 Omega 2 Fuel+",180,540);
  drawOn.fillText("Iron",585,500);
  drawOn.fillText("4 Rocks",570,540);
  drawOn.fillText("Wormhole",955,500);
  drawOn.fillText("6 Chronos",955,540);
  drawOn.fillText("Life",1325,500);
  drawOn.fillText("1 Dark 1 Fuel",1305,540);
}

var buildMenuAnimation =  function(drawOn)
{
  drawOn.fillStyle = "grey";
  drawOn.fillRect(50,50,1500,700);
  drawOn.fillStyle = "purple";
  drawOn.fillRect(100+250*(menuLoc%6),100+225*Math.floor(menuLoc/6),150,150);
  drawOn.fillStyle = "white";
  drawOn.font = "bold 14px Arial";
  drawOn.fillText("Base Rocket",130,120);
  drawOn.fillText("1 Iron", 150,140);
  drawOn.fillText("Tow Rocket",380,120);
  drawOn.fillText("4 Iron", 400,140);
  drawOn.fillText("Press T to Tow.",375,160);
  drawOn.fillText("Mining Ship",630,120);
  drawOn.fillText("8 Iron", 650,140);
  drawOn.fillText("Holds 2 Players.",625,160);
  drawOn.fillText("Jump Ship",875,120);
  drawOn.fillText("1 Steel 1 Chronos", 870,140);
  drawOn.fillText("Press T to Jump.",875,160);
  drawOn.fillText("Reality Rocket",1125,120);
  drawOn.fillText("2 Steel 2 Chronos", 1120,140);
  drawOn.fillText("Press T to Warp.",1120,160);
  drawOn.fillText("Capitol Ship",1375,120);
  drawOn.fillText("4 Steel",1380,140);
  drawOn.fillText("2 Chaos 2 Omega",1360,160);
  drawOn.fillText("Press T for Gravity",1360,180);
  drawOn.fillText("2 Officers.",1365,200);
  drawOn.fillText("Press T for Blast",1360,220);
  drawOn.fillText("Asteroid Scanner",120,350);
  drawOn.fillText("2 Iron",150,370);
  drawOn.fillText("Press I to Switch",120,390);
  drawOn.fillText("Between Types",120,410);
  drawOn.fillText("Space Helmet",380,350);
  drawOn.fillText("1 Steel 1 Fuel",380,370);
  drawOn.fillText("Breath in Space",375,390);
  drawOn.fillText("Crash Suit",630,350);
  drawOn.fillText("2 Iron 2 Steel",625,370);
  drawOn.fillText("Don't Die in Crash", 615,390);
  drawOn.fillText("Jet Pack",885,350);
  drawOn.fillText("1 Steel 1 Fuel+",865,370);
  drawOn.fillText("Fly",910,390);
  drawOn.fillText("Gravity Cannon",1125,350);
  drawOn.fillText("1 Chronos 1 Iron",1120,370);
  drawOn.fillText("Repulse People",1125,390);
  drawOn.fillText("and Items",1150,410);
  drawOn.fillText("Dragon Radar",1375,350);
  drawOn.fillText("2 Dark 2 Chronos",1365,370);
  drawOn.fillText("2 Iron",1400,390);
  drawOn.fillText("Find Dragonballs",1365,410);
  drawOn.fillText("Base Car",130,570);
  drawOn.fillText("1 Iron", 150,590);
  drawOn.fillText("Hopper",400,570);
  drawOn.fillText("1 Steel",400,590);
  drawOn.fillText("Tank",650,570);
  drawOn.fillText("4 Iron 1 Chronos",620,590);
  drawOn.fillText("1 Officer",640,610);
  drawOn.fillText("Press T for Blast",620,630);
  drawOn.fillText("Refinery",875,570);
  drawOn.fillText("2 Iron 2 Fuel", 870,590);
  drawOn.fillText("Press E to Use.",875,610);
  drawOn.fillText("Warehouse",1125,570);
  drawOn.fillText("2 Steel", 1120,590);
  drawOn.fillText("Press E to Use.",1120,610);
  drawOn.fillText("Auto Turret",1375,570);
  drawOn.fillText("2 Chronos 2 Steel",1355,590);
  drawOn.fillText("2 Rocks",1385,610);
  drawOn.fillText("Knocks away other",1355,630);
  drawOn.fillText("colors",1385,650);
}
