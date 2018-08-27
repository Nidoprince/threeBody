const viewerSpeed = 3;
var myPlayer = null;
var reality = 0;
var zoomRatio = 1.04;
var zoomMult = Math.pow(zoomRatio,viewer.zoom);

var realWidth = 1600;
var realHeight = 800;

var showTouch = true;

var deathCounter = 500;

var colorSelected = false;
var cursorMove = 0;
var cursorLoc = 0;

var menuOpen = false;
var menuLoc = 0;

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

setInterval(function() {
  if(trigger.tX && trigger.tY)
  {
    playerControl.xGoal = (trigger.tX-800)*zoomMult+viewer.x;
    playerControl.yGoal = (trigger.tY-400)*zoomMult+viewer.y;
  }
  else
  {
    playerControl.xGoal = false;
    playerControl.yGoal = false;
  }
  if(!menuOpen){
    socket.emit('playerControl', playerControl);
  }
  trigger.resetPlayer();
}, 1000/60);

var canvas = document.getElementById('canvas');
realWidth = canvas.clientWidth;
realHeight = canvas.clientHeight;
canvas.width = 1600;
canvas.height = 800;

var context = canvas.getContext('2d');
socket.on('state',function(celestial) {
  context.clearRect(0,0,1600,800);
  if(reality == 1)
  {
    context.fillStyle = "white";
    context.fillRect(0,0,1600,800);
  }
  if(colorSelected)
  {
    let players = celestial[1];
    let planets = celestial[0];
    let ships = celestial[2];
    let asteroids = celestial[3];
    let aliens = celestial[4];

    for (var id in players)
    {
      if(id == socket.id)
      {
        myPlayer = players[id];
      }
    }
    if(myPlayer && myPlayer != "dead")
    {
      reality = myPlayer.reality;
      if(adminControls.q)
      {
        reality = 1 - reality;
      }
    }

    planets = planets.filter((x)=>x.reality==reality);
    ships = ships.filter((x)=>x.reality==reality);
    asteroids = asteroids.filter((x)=>x.reality==reality);
    aliens = aliens.filter((x)=>x.reality==reality);

    if(myPlayer && myPlayer == "dead")
    {
      if(deathCounter > 0)
      {
        deathCounter--;
      }
      else {
        myPlayer = null;
        colorSelected = false;
        cursorLoc = 0;
        cursorMove = 0;
        socket.emit("dead");
        viewer.space = false;
        viewer.enter = false;
        deathCounter = 500;
        return(0);
      }
    }

    viewerUpdate();
    zoomMult = Math.pow(zoomRatio,viewer.zoom);
    if(myPlayer && (viewer.space || viewer.focusPlayer) && myPlayer != "dead")
    {
      viewer.x = myPlayer.loc.x;
      viewer.y = myPlayer.loc.y;
    }
    if(myPlayer && myPlayer.controllingPlanet && myPlayer != "dead")
    {
      viewer.x += myPlayer.controllingPlanet.vel.x;
      viewer.y += myPlayer.controllingPlanet.vel.y;
    }

    //Make Stars
    starForger(context);

    for (var id in planets) {
      var planet = planets[id];
      planetDrawer(planet,context);
    }
    for (var id in asteroids) {
      var asteroid = asteroids[id];
      asteroidDrawer(asteroid,context);
    }
    for (var id in ships) {
      var ship = ships[id];
      shipDrawer(ship,context);
    }
    for (var id in players) {
      var player = players[id];
      if(player.reality == reality)
      {
        playerDrawer(player,context);
      }
    }
    for (var id in aliens) {
      var alien = aliens[id];
      alienDrawer(alien,context);
    }
    if(myPlayer && myPlayer != "dead")
    {
      playerDot(myPlayer,context)
    }
    if(myPlayer && viewer.showVelocity && myPlayer != "dead")
    {
      var toMap = new Map(myPlayer.velocityComponents)
      var velPieces = toMap.size;
      for (var [key,value] of toMap)
      {
        context.fillStyle = "white";
        if(reality == 1)
        {
          context.fillStyle = "black";
        }
        context.font = "bold 16px Arial";
        context.fillText(key + " - x: " + value.x.toFixed(3) + " y: "+value.y.toFixed(3) +" m: "+Math.sqrt(value.x*value.x+value.y*value.y).toFixed(3),1300,810-50*velPieces);
        velPieces -= 1;
        if(viewer.log)
        {
          console.log((new Date()).getTime()+" "+key + " - x: " + value.x.toFixed(3) + " y: "+value.y.toFixed(3) +" m: "+Math.sqrt(value.x*value.x+value.y*value.y).toFixed(3));
        }
      }
    }
    if(myPlayer && myPlayer != "dead")
    {
      for (var inv in myPlayer.inventory)
      {
        context.fillStyle = "white"
        if(reality == 1)
        {
          context.fillStyle = "black";
        }
        context.font = "bold 14px Arial";
        context.fillText(myPlayer.inventory[inv],50+inv*100,750)
      }
      if(myPlayer.inSpaceShip)
      {
        fuelBar(myPlayer, context);
        shipDrawer(myPlayer.inSpaceShip, context, {x: myPlayer.loc.x - 700,y: myPlayer.loc.y + 300},1);
        context.strokeStyle = "grey";
        context.strokeRect(1400,0,200,200);
        parkDrawer(myPlayer.inSpaceShip.parked, context, 1400,200);
        specialDrawer(myPlayer.inSpaceShip, context, 1530,200);
      }
      else if(myPlayer.air < myPlayer.airMax)
      {
        airBar(myPlayer,context);
      }
    }

    if(myPlayer && menuOpen)
    {
      if(trigger.right)
      {
        menuLoc = (menuLoc+1)%18;
      }
      else if(trigger.left)
      {
        menuLoc = ((menuLoc-1)%18+18)%18;
      }
      else if(trigger.down)
      {
        menuLoc = (menuLoc+6)%18;
      }
      else if(trigger.up)
      {
        menuLoc = ((menuLoc-6)%18+18)%18;
      }
      else if(trigger.enter)
      {
        if(menuLoc == 0 && myPlayer.inventory.filter((x) => x == "iron").length > 0)
        {
          playerControl.build = "Base Rocket";
          menuOpen = false;
        }
        if(menuLoc == 1 && myPlayer.inventory.filter((x) => x == "iron").length > 3)
        {
          playerControl.build = "Tow Rocket";
          menuOpen = false;
        }
        if(menuLoc == 2 && myPlayer.inventory.filter((x) => x == "iron").length > 7)
        {
          playerControl.build = "Mining Ship";
          menuOpen = false;
        }
        if(menuLoc == 3 && myPlayer.inventory.filter((x) => x == "iron").length > 0 && myPlayer.inventory.filter((x) => x == "chronos").length > 0)
        {
          playerControl.build = "Reality Rocket";
          menuOpen = false;
        }
        if(menuLoc == 4 && myPlayer.inventory.filter((x) => x == "iron").length > 1 && myPlayer.inventory.filter((x) => x == "chronos").length > 1)
        {
          playerControl.build = "Jump Ship";
          menuOpen = false;
        }
        if(menuLoc == 12 && myPlayer.inventory.filter((x) => x == "iron").length > 0)
        {
          playerControl.build = "SUV";
          menuOpen = false;
        }
        if(menuLoc == 15 && myPlayer.inventory.filter((x) => x == "iron").length > 1 && myPlayer.inventory.filter((x) => x == "fuel").length > 1 && myPlayer.controllingPlanet)
        {
          playerControl.build = "Refinery";
          menuOpen = false;
        }
      }
      menuAnimation(context);
    }
  }
  else
  {
    context.fillStyle = "white"
    context.font = "bold 30px Arial";
    context.fillText("Please select a faction:",400,200);
    context.fillStyle = "red";
    context.fillText("Radical Extermination Deployment",500,350);
    context.fillStyle = "blue";
    context.fillText("Bombastic Lizards Using Explosives",500,450);
    context.fillStyle = "yellow";
    context.fillText("Yammering Eccentric Llama Lovers Of Woe",500,550);
    context.fillStyle = "green";
    context.fillText("Generally Really Entrancingly Entertaining Nomads",500,650);
    context.fillStyle = "white"
    context.fillText("->",400,350+100*cursorLoc);
    if(viewer.up || playerControl.up)
    {
      cursorMove--;
    }
    if(cursorMove <= -10 || trigger.up)
    {
      cursorLoc -= 1;
      if(cursorLoc < 0)
      {
        cursorLoc = 3;
      }
      cursorMove = 0;
    }
    if(viewer.down || playerControl.down)
    {
      cursorMove++;
    }
    if(cursorMove >= 10 || trigger.down)
    {
      cursorLoc += 1;
      if(cursorLoc > 3)
      {
        cursorLoc = 0;
      }
      cursorMove = 0;
    }
    if(viewer.space || viewer.enter)
    {
      socket.emit("new player",cursorLoc);
      colorSelected = true;
    }
    if(trigger.tX && trigger.tY)
    {
      if(trigger.tX > 400 && trigger.tX < 1200)
      {
        if(trigger.tY > 300 && trigger.tY <400)
        {
          socket.emit("new player",0);
          colorSelected = true;
        }
        else if(trigger.tY > 400 && trigger.tY <500)
        {
          socket.emit("new player",1);
          colorSelected = true;
        }
        else if(trigger.tY > 500 && trigger.tY <600)
        {
          socket.emit("new player",2);
          colorSelected = true;
        }
        else if(trigger.tY > 600 && trigger.tY <750)
        {
          socket.emit("new player",3);
          colorSelected = true;
        }
      }
    }
  }
  trigger.reset();
  if(showTouch && trigger.tX > 0 && trigger.tY > 0);
  {
    drawTouch(context);
  }
});
