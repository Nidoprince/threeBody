const gravitationalConstant = 0.05;
const bouncyness = 0.9;
const playerBounce = false;
const groundTouchError = 0;
const similarEnoughVelocities = 0.3;
const fallingAngle = Math.PI/4;
const jumpForce = 15;
const fuelWeight = 0.05;

const shipSpeedLimit = 60;
const universeSpeed = 1;
const controlSpeed = 0.1;
const walkSpeed = 5;
const maxSpeed = 10;
const friction = 0.2;
const airResistance = 0.001;

const gravityCalculator = function(body,attractor)
{
  let dir = body.loc.direction(attractor.loc);
  let dist = Vector.distance(body.loc,attractor.loc);
  let force = gravitationalConstant*body.mass()*attractor.mass()/(dist*dist);
  let acc = dir.normalize(force/body.mass());
  return acc;
}


class Boid
{
  constructor(velocityMax, location)
  {
    this.loc = new Vector(location.x+(Math.random()*4000-2000),location.y+(Math.random()*4000-2000));
    this.velMax = velocityMax;
    this.vel = new Vector(Math.random()*5,Math.random()*5);
  }
  updateVelocity(flock)
  {
    let centralize = new Vector(0,0);
    let fitIn = new Vector(0,0);
    let personalSpace = new Vector(0,0);
    for (var other of flock)
    {
      if(this.vel.x != other.vel.x || this.vel.y != other.vel.y)
      {
        centralize = centralize.addVector(other.loc);
        fitIn = fitIn.addVector(other.vel);
        if(Vector.distance(this.loc,other.loc)<10)
        {
          personalSpace = personalSpace.addVector(this.loc.fromTill(other.loc).negate());
        }
      }
    }
    centralize = this.loc.fromTill(centralize.multiplyScaler(1/(flock.length-1))).normalize(this.vel.magnitude()*0.05);
    fitIn = fitIn.multiplyScaler(1/(10*(flock.length-1)));
    this.vel = this.vel.addVector(centralize).addVector(fitIn).addVector(personalSpace);
    this.vel = this.vel.speedLimit(this.velMax);
  }
  updateLocation(timeDifferential)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(timeDifferential*universeSpeed));
  }
}

class Flock
{
  constructor(number, velocity, x, y, size, color, lifespan, reality = 0)
  {
    this.flock = [];
    for (var i = 0; i < number;i++)
    {
      this.flock.push(new Boid(velocity, new Vector(x,y)));
    }
    this.size =  size;
    this.color = color;
    this.lifespan = lifespan;
    this.reality = reality;
  }
  updateVelocity()
  {
    for (var boid of this.flock)
    {
      boid.updateVelocity(this.flock);
    }
  }
  updateLocation(timeDifferential)
  {
    for (var boid of this.flock)
    {
      boid.updateLocation(timeDifferential);
    }
    this.lifespan--;
  }
}
class Particle
{
  constructor(loc,vel,size,lifespan,color,relative = false)
  {
    this.loc = loc.copy();
    this.baseVel = vel.copy();
    this.vel = vel.copy();
    this.relative = relative;
    if(this.relative)
    {
      this.vel = this.baseVel.addVector(this.relative.vel.copy());
    }
    this.startSize = size;
    this.lifespan = lifespan;
    this.startLife = lifespan;
    this.color = color;
  }
  updateVelocity()
  {
    if(this.relative)
    {
      this.vel = this.baseVel.addVector(this.relative.vel.copy());
    }
    else
    {
      this.vel = this.baseVel.copy();
    }
  }
  updateLocation(timeDifferential)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(timeDifferential*universeSpeed));
    this.lifespan--;
    this.size = this.lifespan/this.startLife*this.startSize;
  }
}
class Explosion
{
  constructor(x,y,size,lifespan,relative = false,reality = 0,colors = ["red","yellow","orange"])
  {
    this.loc = new Vector(x,y);
    this.relative = relative;
    if(this.relative)
    {
      this.vel = this.relative.vel.copy();
    }
    else
    {
      this.vel = new Vector(x,y);
    }
    this.size = size;
    this.lifespan = lifespan;
    this.colors = colors;
    this.particles = [];
    this.spawnParticles(100);
    this.type = "explosion";
    this.reality = reality;
  }
  spawnParticles(numberOfParticles)
  {
    for(let i = 0;i<numberOfParticles;i++)
    {
      this.particles.push(new Particle(this.loc,(new Vector(0,-1)).rotate(Math.random()*Math.PI*2).multiplyScaler(0.1+Math.random()*0.5),this.size*(0.5+Math.random()),this.lifespan,this.colors[Math.floor(this.colors.length*Math.random())],this.relative));
    }
  }
  updateVelocity()
  {
    if(this.relative)
    {
      this.vel = this.relative.vel.copy();
    }
    for (let x of this.particles)
    {
      x.updateVelocity()
    }
  }
  updateLocation(timeDifferential)
  {
    this.loc = this.loc.addVector(this.vel.multiplyScaler(timeDifferential*universeSpeed));
    this.lifespan--;
    this.particles = this.particles.filter(particle =>
    {
      particle.updateLocation(timeDifferential);
      return particle.lifespan > 0;
    })
  }
}
class Ship
{
  constructor(x,y,color,planets,type="baseRocket",size = 40,density=1,reality = 0,thrust = 0.3,turnRate = 0.02,edgeThrust = 0.05,slowRate = 0.001)
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
    this.reality = reality;
    this.parked = true;
    this.driver = false;
    this.driverColor = false;
    this.controlInput = new Vector(0,0);
    this.controlRotation = 0;
    this.fuel = 0;
    this.fuelMax = 50000;
    this.isDead = false;
    this.planetThatMurderedMe = false;
    this.mineSpeed = 1;
    if(this.type == "towRocket")
    {
      this.density *= 2;
      this.towing = false;
    }
    else if(this.type == "miningShip")
    {
      this.miner = false;
      this.minerColor = false;
      this.mineSpeed = 10;
    }

    //Only in same reality
    planets = planets.filter((x)=>this.reality == x.reality)

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
      this.loc = this.parked.loc.addVector(this.parked.loc.direction(this.loc).normalize(planet.size+this.size));
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
    return this.size*this.density*this.size*3.14159265358979323646264338 + this.fuel*fuelWeight;
  }
  spaceAvailable()
  {
    if(!this.driver)
    {
      return true;
    }
    else if(["baseRocket","towRocket","realityRocket"].includes(this.type))
    {
      return false;
    }
    else if(["miningShip"].includes(this.type))
    {
      return !this.miner;
    }
    else
    {
      return false;
    }
  }
  setDriver(color,id)
  {
    if(["baseRocket","towRocket","realityRocket"].includes(this.type))
    {
      this.driverColor = color;
      this.driver = id;
    }
    else if(["miningShip"].includes(this.type))
    {
      if(this.driver)
      {
        this.miner = id;
        this.minerColor = color;
      }
      else
      {
        this.driver = id;
        this.driverColor = color;
      }
    }
  }
  driverLocation(id)
  {
    if(["baseRocket","towRocket","realityRocket"].includes(this.type))
    {
      return this.loc.copy();
    }
    else if(["miningShip"].includes(this.type))
    {
      if(this.driver == id)
      {
        return this.loc.copy();
      }
      else if(this.miner == id)
      {
        return this.loc.subVector(this.direction.normalize(this.size/2));
      }
    }
  }
  removeDriver(id)
  {
    if(["baseRocket","towRocket","realityRocket"].includes(this.type))
    {
      this.driver = false;
      this.driverColor = false;
    }
    else if(["miningShip"].includes(this.type))
    {
      if(this.driver == id)
      {
        this.driver = false;
        this.driverColor = false;
      }
      else if(this.miner == id)
      {
        this.miner = false;
        this.minerColor = false;
      }
    }
  }
  updateVelocity(planets)
  {
    //Only in same reality
    planets = planets.filter((x)=>this.reality == x.reality)

    if(this.parked)
    {
      this.updateVelocityParked(planets);
    }
    else if(this.driver)
    {
      this.updateVelocityControlled(planets);
    }
    else
    {
      this.updateVelocityFree(planets);
    }
    this.vel = this.vel.speedLimit(shipSpeedLimit);
  }
  shipControl(id,up,down,left,right,goal)
  {
    //Touch Control
    if(goal)
    {
      let towardsGoal = this.loc.direction(goal);
      let turningNeeded = Vector.angleBetween(this.direction,towardsGoal);
      if(Math.abs(turningNeeded) < Math.PI/6)
      {
        up = true;
      }
      if(turningNeeded > 0)
      {
        right = true;
      }
      if(turningNeeded < 0)
      {
        left = true;
      }
      if(Math.abs(Vector.angleBetween(this.vel,towardsGoal)) > Math.PI/2)
      {
        down = true;
      }
    }
    let thrustFuel;
    let turnFuel;
    let slowFuel;
    let thrustMultiplier;
    let edgeMultiplier;
    let slowMultiplier;
    if(this.type == "baseRocket")
    {
      thrustFuel = 5;
      turnFuel = 1;
      slowFuel = 3;
      thrustMultiplier = 1;
      edgeMultiplier = 1;
      slowMultiplier = 1;
    }
    else if(this.type == "towRocket")
    {
      thrustFuel = 10;
      turnFuel = 0.1;
      slowFuel = 0.1;
      thrustMultiplier = 3;
      edgeMultiplier = 0.3;
      slowMultiplier = 0.5;
    }
    else if(this.type == "realityRocket")
    {
      thrustFuel = 8 + (-10 * this.reality);
      turnFuel = 2;
      slowFuel = 10;
      thrustMultiplier = 0.9;
      edgeMultiplier = 1.5;
      slowMultiplier = 10;
    }
    else if(this.type == "miningShip")
    {
      if(id == this.driver)
      {
        thrustFuel = 8;
        turnFuel = 2;
        slowFuel = 2;
        thrustMultiplier = 0.6;
        edgeMultiplier = 3;
        slowMultiplier = 3;
      }
      else
      {
        thrustFuel = 0;
        turnFuel = 0;
        slowFuel = 0;
        thrustMultiplier = 0;
        edgeMultiplier = 0;
        slowMultiplier = 0;
      }
    }
    //Thrust
    if(up && this.fuel > thrustFuel)
    {
      this.controlInput = this.controlInput.addVector(this.direction.multiplyScaler(this.thrust*thrustMultiplier));
      this.fuel -= thrustFuel;
    }
    //Rotation
    if(right && !left && this.fuel >  turnFuel)
    {
      this.controlRotation += this.turnRate*edgeMultiplier;
      this.controlInput = this.controlInput.addVector(this.direction.rotate(Math.PI/2).multiplyScaler(this.edgeThrust*edgeMultiplier));
      this.fuel -=  turnFuel;
    }
    else if(left && !right && this.fuel >  turnFuel)
    {
      this.controlRotation += -1*this.turnRate*edgeMultiplier;
      this.controlInput = this.controlInput.addVector(this.direction.rotate(-1*Math.PI/2).multiplyScaler(this.edgeThrust*edgeMultiplier));
      this.fuel -=  turnFuel;
    }
    //Slow
    if(down && this.fuel > slowFuel)
    {
      this.controlInput = this.controlInput.subVector(this.vel.multiplyScaler(this.slowRate*slowMultiplier))
      this.fuel -= slowFuel;
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
      let gravityForce = gravityCalculator(this,planet);
      this.vel = this.vel.addVector(gravityForce);

      //Bounce off each other.
      if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size)
      {
        var stepOne = Vector.dotProduct(this.vel.subVector(planet.oldVel),this.loc.subVector(planet.loc))/Math.pow((this.loc.subVector(planet.loc).magnitude()),2);
        var stepTwo = 2*planet.mass()/(this.mass()+planet.mass());
        var direction = this.loc.subVector(planet.loc);
        if(this.vel.magnitude() >= 30)
        {
          this.isDead = true;
          this.planetThatMurderedMe = planet;
        }
        this.vel = this.vel.subVector(direction.multiplyScaler(stepOne*stepTwo*bouncyness));
      }
      //Air Resistance
      if(Vector.distance(this.loc,planet.loc) <= this.size+planet.size*1.2)
      {
        this.vel = this.vel.subVector(this.vel.multiplyScaler(airResistance*this.vel.magnitude()/this.mass()));
      }
    }
    //Tow Line
    if(this.type == "towRocket" && this.towing)
    {
      let stretchedDistance = Vector.distance(this.loc,this.towing.loc);
      let towingForce = 5;
      let minDistance = 100;
      if(stretchedDistance > minDistance)
      {
        let pull = this.loc.direction(this.towing.loc).normalize(towingForce*(stretchedDistance-minDistance));
        if(!this.parked)
        {
          this.vel = this.vel.addVector(pull.multiplyScaler(1/this.mass()));
        }
        if(!this.towing.parked)
        {
          this.towing.vel = this.towing.vel.subVector(pull.multiplyScaler(1/this.towing.mass()));
        }
      }
      if(this.towing.isDead)
      {
        this.towing = false;
      }
    }
  }

  updateLocation(timeDifferential,planets)
  {
    //Only in same reality
    planets = planets.filter((x)=>this.reality == x.reality)

    this.loc = this.loc.addVector(this.vel.multiplyScaler(timeDifferential*universeSpeed));
    if(this.parked)
    {
      var angleFromStraight = this.parked.loc.direction(this.loc).angle();-this.direction.angle();
      if(Math.abs(angleFromStraight) > fallingAngle && Math.abs(angleFromStraight) < Math.PI/2)
      {
        this.direction = this.direction.rotate(angleFromStraight/10*timeDifferential*universeSpeed);
      }
      if(Vector.distance(this.loc,this.parked.loc) > this.size+this.parked.size+5)
      {
        this.parked = false;
      }
    }
    if(!this.parked)
    {
      this.direction = this.direction.rotate((this.vel.angle()-this.direction.angle())/(240*this.mass())*timeDifferential*universeSpeed);
      if(this.driver)
      {
        this.direction = this.direction.rotate(this.controlRotation*timeDifferential*universeSpeed);
      }
    }
    for(var id in planets)
    {
      var planet = planets[id];
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size)
      {
        this.vel = this.vel.addVector(planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size)).subVector(this.loc));
        this.loc = planet.loc.addVector(planet.loc.direction(this.loc).normalize(planet.size+this.size));
      }
    }
    this.controlInput = new Vector(0,0);
    this.controlRotation = 0;
  }
}


class Player
{
  constructor(x,y,color, planets, serialNumber, size = 10,density = 1, reality = 0)
  {
    this.id = serialNumber;
    this.color = color;
    this.controllingPlanet = false;
    this.inventory = [];
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
      this.inventory.push("iron");
    }
    else
    {
      this.loc = new Vector(x,y);
      this.vel = new Vector(0,0);
      this.inventory.push("fuel");
      this.inventory.push("fuel");
      this.inventory.push("fuel");
      this.inventory.push("fuel");
      this.inventory.push("iron");
    }
    this.actingVel = new Vector(0,0);
    this.leftHeld = false;
    this.rightHeld = false;
    this.upHeld = false;
    this.rightHeld = false;
    this.ePressed = false;
    this.mHeld = false;
    this.pPressed = false;
    this.tPressed = false;
    this.goal = false;
    this.color = color;
    this.size = size;
    this.density = density;
    this.reality = reality;
    this.inAir = false;
    this.isDead = false;
    this.velocityComponents = new Map();
    this.velocityComponents.set("Base",this.vel.copy());
    this.inSpaceShip = false;
    this.currentlyLoading = false;
  }

  mass()
  {
    return this.size*this.density*this.size*3.14159265358979323646264338;
  }

  tellVelocityComponent()
  {
    return this.velocityComponents
  }
  enterOrExitSpaceship(ships)
  {
    if(this.inSpaceShip)
    {
      this.inSpaceShip.removeDriver(this.id);
      this.inSpaceShip = false;
    }
    else
    {
      for (var id in ships)
      {
        var ship = ships[id];
        if(Vector.distance(this.loc,ship.loc) < this.size+ship.size && ship.spaceAvailable())
        {
          this.inSpaceShip = ship;
          this.inSpaceShip.setDriver(this.color,this.id);
          this.loc = this.inSpaceShip.driverLocation(this.id);
          this.inSpaceShip.fuel += this.inventory.filter(x => x == "fuel").length*3000;
          let extrafuel = 0;
          if(this.inSpaceShip.fuel > this.inSpaceShip.fuelMax)
          {
            extrafuel = Math.floor((this.inSpaceShip.fuel - this.inSpaceShip.fuelMax)/3000);
            this.inSpaceShip.fuel = this.inSpaceShip.fuelMax;
          }
          this.inventory = this.inventory.filter(x => x != "fuel");
          for (var i = 0; i< extrafuel; i++)
          {
            this.inventory.push("fuel");
          }
          break;
        }
      }
    }
  }
  attachOrReleaseTowLine(ships)
  {
    if(this.inSpaceShip.towing)
    {
      this.inSpaceShip.towing = false;
    }
    else
    {
      let distance = 500;
      let closestShip = false;

      for(var ship of ships)
      {
        let dist = Vector.distance(this.inSpaceShip.loc,ship.loc);
        if(dist > 0 && dist < distance)
        {
          distance = dist;
          closestShip = ship;
        }
      }
      if(distance < 300)
      {
        this.inSpaceShip.towing = closestShip;
      }
    }
  }
  toggleParkingBreak()
  {
    if(this.inSpaceShip.parked)
    {
      this.inSpaceShip.parked = false;
    }
    else
    {
      if(Vector.distance(this.controllingPlanet.loc,this.loc) < this.inSpaceShip.size+this.controllingPlanet.size+5)
      {
        this.inSpaceShip.parked = this.controllingPlanet;
      }
    }
  }
  mineAsteroids(planetoids)
  {
    let asteroids = planetoids.filter(body => "contents" in body);
    for (var id in asteroids)
    {
      let asteroid = asteroids[id];
      if(Vector.distance(asteroid.loc,this.loc)<asteroid.size+this.inSpaceShip.size+10)
      {
        if(this.inventory.length == 0 || isNaN(this.inventory[this.inventory.length-1]))
        {
          if(this.inventory.length < 8)
          {
            this.inventory.push(0);
            this.currentlyLoading = asteroid.contents;
          }
        }
        else if(this.currentlyLoading != asteroid.contents)
        {
          this.currentlyLoading = asteroid.contents;
          this.inventory[this.inventory.length-1] = 0;
        }
        else if(this.inventory[this.inventory.length-1] < asteroid.mineTime)
        {
          this.inventory[this.inventory.length-1]+=this.inSpaceShip.mineSpeed;
        }
        else
        {
          this.inventory[this.inventory.length-1] = asteroid.contents;
          asteroid.mineTime *= 1.1;
          this.currentlyLoading = false;
        }
      }
    }
  }
  minePlanet()
  {
    this.controllingPlanet.fuelSources = this.controllingPlanet.fuelSources.filter(fuel =>
    {
      if(Math.abs(fuel-this.controllingPlanet.loc.direction(this.loc).angle()) < Math.PI/90)
      {
        if(this.inventory.length == 0 || isNaN(this.inventory[this.inventory.length-1]))
        {
          if(this.inventory.length < 8)
          {
            this.inventory.push(0);
            this.currentlyLoading = "fuel";
          }
        }
        else if(this.currentlyLoading != "fuel")
        {
          this.currentlyLoading = "fuel";
          this.inventory[this.inventory.length-1] = 0;
        }
        else if(this.inventory[this.inventory.length-1] < this.controllingPlanet.mineTime)
        {
          this.inventory[this.inventory.length-1]++;
        }
        else
        {
          this.inventory[this.inventory.length-1] = "fuel";
          this.currentlyLoading = false;
          return false;
        }
      }
      return true;
    })
  }
  updateVelocity(planets)
  {
    //Only in same reality
    planets = planets.filter((x)=>this.reality == x.reality)

    if(this.inSpaceShip)
    {
      if("lifespan" in this.inSpaceShip)
      {
        this.isDead = true;
      }
      else
      {
        this.isDead = this.inSpaceShip.isDead;
      }
    }
    var closestPlanetDistance = Number.MAX_SAFE_INTEGER;
    var closestPlanet = false;
    for(var id in planets)
    {
      var planet = planets[id];
      //Check for closestPlanet
      if(Vector.distance(this.loc,planet.loc) - planet.size < closestPlanetDistance)
      {
        closestPlanetDistance = Vector.distance(this.loc,planet.loc) - planet.size;
        closestPlanet = planet;
      }
    }

    if(Vector.distance(closestPlanet.loc,this.loc) < closestPlanet.size*1.2+this.size+100)
    {
      this.controllingPlanet = closestPlanet;
    }
    else
    {
      this.controllingPlanet = false;
    }

    this.velocityComponents = new Map();
    if(this.inSpaceShip)
    {
      this.vel = this.inSpaceShip.shipControl(this.id,this.upHeld,this.downHeld,this.leftHeld,this.rightHeld,this.goal);
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


    for(var id in planets)
    {
      var planet = planets[id];

      //Gravitational Attraction
      let gravityForce = gravityCalculator(this,planet);
      this.velocityComponents.set("Grav "+id, gravityForce);
      this.vel = this.vel.addVector(gravityForce);

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
    if(this.controllingPlanet && Vector.distance(this.controllingPlanet.loc,this.loc) < this.controllingPlanet.size*1.2)
    {
      this.updateVelocityAtmosphere(planets)
    }
    else
    {
      this.updateVelocitySpace(planets)
    }
  }
  updateVelocityAtmosphere(planets)
  {
    //Touch Controls
    if(this.goal)
    {
      let planetLocAngle = this.controllingPlanet.loc.direction(this.loc).angle();
      let goalLocAngle = this.controllingPlanet.loc.direction(this.goal).angle();
      let difference = goalLocAngle - planetLocAngle;
      if(difference < 0)
      {
        difference += Math.PI*2;
      }
      if(difference > 0.01 && difference < 2*Math.PI/3)
      {
        this.rightHeld = true;
      }
      else if(difference > 4*Math.PI/3 && difference < 2*Math.PI-0.01)
      {
        this.leftHeld = true;
      }
      else if((difference < 0.2 || difference > 2*Math.PI-0.2) && Vector.distance(this.loc,this.goal) > 100 && Vector.distance(this.loc,this.controllingPlanet.loc) < Vector.distance(this.goal,this.controllingPlanet.loc))
      {
        this.upHeld = true;
      }
    }
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
    //Touch Controls
    if(this.goal)
    {
      if(this.goal.x>this.loc.x)
      {
        this.rightHeld = true;
      }
      else if(this.goal.x<this.loc.x)
      {
        this.leftHeld = true;
      }
      if(this.goal.y>this.loc.y)
      {
        this.downHeld = true;
      }
      else if(this.goal.y<this.loc.y)
      {
        this.upHeld = true;
      }
    }
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
    //Only in same reality
    ships = ships.filter((x)=>this.reality == x.reality)
    planets = planets.filter((x)=>this.reality == x.reality)

    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
    for(var id in planets)
    {
      var planet = planets[id];
      if(Vector.distance(this.loc,planet.loc)<planet.size+this.size && !this.inSpaceShip)
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
    if(this.mHeld && this.inSpaceShip && this.controllingPlanet)
    {
      this.mineAsteroids(planets);
    }
    else if(this.mHeld && !this.inSpaceShip && this.controllingPlanet)
    {
      this.minePlanet();
    }
    else
    {
      if(!isNaN(this.inventory[this.inventory.length-1]))
      {
        this.inventory.pop();
      }
    }
    if(this.inSpaceShip)
    {
      this.loc = this.inSpaceShip.driverLocation(this.id);
    }
    if(this.inSpaceShip && this.controllingPlanet)
    {
      if(this.pPressed)
      {
        this.toggleParkingBreak();
      }
    }
    if(this.tPressed && this.inSpaceShip && this.inSpaceShip.type == "towRocket")
    {
      this.attachOrReleaseTowLine(ships);
    }
    if(this.tPressed && this.inSpaceShip && this.inSpaceShip.type == "realityRocket")
    {
      if(this.inSpaceShip.fuel > 50)
      {
        this.inSpaceShip.fuel -= 50;
        this.inSpaceShip.reality = 1-this.inSpaceShip.reality;
        this.reality = 1-this.reality;
        this.inSpaceShip.parked = false;
      }
    }
    //if(this.tPressed)
    //{
    //  console.log(this)
    //  console.log(this.inSpaceShip)
    //}
    this.tPressed = false;
    this.pPressed = false;
    this.ePressed = false;
  }
}

class Planet
{
  constructor(startX,startY,startXD,startYD,size,color = 'red',atmosphereColor = "rgba(255,0,0,0.1)",density = 1, reality = 0)
  {
    this.loc = new Vector(startX,startY);
    this.vel = new Vector(startXD,startYD);
    this.oldVel = this.vel.copy();
    this.size = size;
    this.density = density;
    this.color = color;
    this.atmosphereColor = atmosphereColor;
    this.reality = reality;
    this.fuelSources = [];
    this.mineTime = 200;
  }

  spawnFuel()
  {
    if(Math.random() < 0.0002*(10-this.fuelSources.length))
    {
      this.fuelSources.push(Math.random()*Math.PI*2);
    }
  }

  updateLocation(timeDifferential, planets)
  {
    let otherPlanets = planets.filter((x)=>!this.loc.isEqual(x.loc));

    //Only in same reality
    otherPlanets = otherPlanets.filter((x)=>this.reality == x.reality)

    this.loc = this.loc.addVector(this.vel.multiplyScaler(universeSpeed*timeDifferential));
    this.oldVel = this.vel.copy();

    for (let planet of otherPlanets)
    {
      if(planet.size+this.size > Vector.distance(planet.loc,this.loc))
      {
        let notTouching = planet.loc.addVector(planet.loc.direction(this.loc).multiplyScaler(planet.size+this.size));
        let movement = this.loc.fromTill(notTouching);
        this.loc = notTouching.copy();
        this.vel = this.vel.addVector(movement.multiplyScaler(0.01/this.mass()));
        planet.vel = planet.vel.subVector(movement.multiplyScaler(0.01/planet.mass()));
      }
    }
  }

  updateVelocity(planets)
  {
    let otherPlanets = planets.filter((x)=>!this.loc.isEqual(x.loc));

    //Only in same reality
    otherPlanets = otherPlanets.filter((x)=>this.reality == x.reality)

    for(var id in otherPlanets)
    {
      var planet = otherPlanets[id];

      //Gravitational Attraction
      this.vel = this.vel.addVector(gravityCalculator(this,planet));

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

  mass()
  {
    return this.density*this.size*this.size*3.14159265358979;
  }
}


class Asteroid extends Planet
{
  constructor(x,y,xV,yV,size,contents = "iron",color = "brown",density = 1,reality = 0)
  {
    super(x,y,xV,yV,size,color,"rgba(0,0,0,0)",density,reality);
    this.contents = contents;
    if(this.contents == "iron")
    {
      this.mineTime = 1000;
    }
    else if(this.contents == "chronos")
    {
      this.mineTime = 100;
    }
    else
    {
      this.mineTime = 10000;
    }
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

   fromTill(vec)
   {
     return this.addVector(vec.negate()).negate();
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

   //Angle Between 2 Vectors
   static angleBetween(a,b)
   {
     let difference = b.angle()-a.angle();
     if(difference < 0)
     {
       difference += Math.PI*2;
     }
     if(difference > Math.PI)
     {
       difference = difference-Math.PI*2;
     }
     return difference;
   }
}


module.exports.Vector = Vector;
module.exports.Player = Player;
module.exports.Planet = Planet;
module.exports.Ship = Ship;
module.exports.Asteroid = Asteroid;
module.exports.Flock = Flock;
module.exports.Explosion = Explosion;
