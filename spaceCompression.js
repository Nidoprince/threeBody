var space = require("./space.js");

var planetCompress = function(planet)
{
  return {
    loc: planet.loc,
    size: planet.size,
    color: planet.color,
    atmosphereColor: planet.atmosphereColor,
    fuelSources: planet.fuelSources
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
      particles: ship.particles.map(particleCompress)
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
      towing: towCompress(ship.towing)
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
      driverColor: ship.driverColor
    }
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
      color: alien.color
    }
  }
}

module.exports.planetCompress = planetCompress;
module.exports.shipCompress = shipCompress;
module.exports.alienCompress = alienCompress;