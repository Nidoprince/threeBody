var space = require("./space.js");

var planetCompress = function(planet)
{
  return {
    loc: new space.Vector(Math.floor(planet.loc.x),Math.floor(planet.loc.y)),
    size: planet.size,
    color: planet.color,
    atmosphereColor: planet.atmosphereColor,
    fuelSources: planet.fuelSources,
    reality: planet.reality,
    buildings: planet.buildings
  }
}

var particleCompress = function(particle)
{
  return {
    loc: new space.Vector(Math.floor(particle.loc.x),Math.floor(particle.loc.y)),
    color: particle.color,
    size: Math.floor(particle.size)
  }
}

var towCompress = function(towed)
{
  if(towed)
  {
    return towed.loc.copy();
  }
  else {
    return false;
  }
}
var shipCompress = function(ship)
{
  if(ship.type == "explosion")
  {
    return {
      type: "explosion",
      particles: ship.particles.map(particleCompress),
      reality: ship.reality
    }
  }
  else if(ship.type == "towRocket")
  {
    return {
      type: ship.type,
      loc: ship.loc,
      direction: ship.direction,
      size: ship.size,
      color: ship.color,
      controlInput: ship.controlInput,
      controlRotation: ship.controlRotation,
      driverColor: ship.driverColor,
      towing: towCompress(ship.towing),
      reality: ship.reality
    }
  }
  else if(ship.type == "miningShip")
  {
    return {
      type: ship.type,
      loc: ship.loc,
      direction: ship.direction,
      size: ship.size,
      color: ship.color,
      controlInput: ship.controlInput,
      controlRotation: ship.controlRotation,
      driverColor: ship.driverColor,
      minerColor: ship.minerColor,
      reality: ship.reality
    }
  }
  else if(ship.type == "capitolShip")
  {
    return {
      type: ship.type,
      loc: ship.loc,
      direction: ship.direction,
      size: ship.size,
      color: ship.color,
      controlInput: ship.controlInput,
      controlRotation: ship.controlRotation,
      driverColor: ship.driverColor,
      leftColor: ship.leftColor,
      rightColor: ship.rightColor,
      reality: ship.reality,
      leftFinAngle: ship.leftFinAngle,
      rightFinAngle: ship.rightFinAngle,
      gravityDrive: ship.gravityDrive
    }
  }
  else
  {
    return {
      type: ship.type,
      loc: ship.loc,
      direction: ship.direction,
      size: ship.size,
      color: ship.color,
      controlInput: ship.controlInput,
      controlRotation: ship.controlRotation,
      driverColor: ship.driverColor,
      reality: ship.reality
    }
  }
}

var itemCompress = function(item)
{
  return {
    loc: new space.Vector(Math.floor(item.loc.x),Math.floor(item.loc.y)),
    color: item.color,
    size: item.size,
    reality: item.reality
  }
}

var boidCompress = function(boid)
{
  return {
    loc: new space.Vector(Math.floor(boid.loc.x),Math.floor(boid.loc.y)),
    vel: new space.Vector(Math.floor(boid.vel.x),Math.floor(boid.vel.y))
  }
}
var alienCompress = function(alien)
{
  if("flock" in alien)
  {
    return {
      flock: alien.flock.map(boidCompress),
      size: alien.size,
      color: alien.color,
      reality: alien.reality
    }
  }
}

module.exports.planetCompress = planetCompress;
module.exports.shipCompress = shipCompress;
module.exports.alienCompress = alienCompress;
module.exports.itemCompress = itemCompress;
