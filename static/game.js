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

var openBuilding = false;

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

setInterval(function() {
  //Open or close any of the building menus;
  if(myPlayer && playerControl.e && myPlayer.controllingPlanet)
  {
    if(["refinery","warehouse"].includes(menuOpen))
    {
      menuOpen = false;
    }
    else
    {
      let playerAngle = Vector.makeVec(myPlayer.controllingPlanet.loc).direction(Vector.makeVec(myPlayer.loc)).angle();
      for(let factory of myPlayer.controllingPlanet.buildings)
      {
        let difference = Math.abs(factory.angle-playerAngle);
        if(difference < factory.size/myPlayer.controllingPlanet.size && factory.type != "autoCannon")
        {
          menuOpen = factory.type;
          menuLoc = 0;
          openBuilding = factory;
        }
      }
    }
  }
  if(myPlayer && menuOpen == "warehouse" && playerControl.inventory)
  {
    if(openBuilding.storage.length < 48)
    {
      playerControl.give = playerControl.inventory;
      playerControl.inventory = false;
    }
  }
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
  else{
    socket.emit('playerControl', playerControl.menuMode());
  }
  trigger.resetPlayer();
}, 1000/60);

var canvas = document.getElementById('canvas');
realWidth = canvas.clientWidth;
realHeight = canvas.clientHeight;
canvas.width = 1600;
canvas.height = 800;

var context = canvas.getContext('2d');
socket.on("normalizeForWin",function()
{
  reality = 0;
  zoomRatio = 1.04;
  zoomMult = Math.pow(zoomRatio,viewer.zoom);
  colorSelected = false;
  cursorMove = 0;
  cursorLoc = 0;
  menuOpen = false;
  menuLoc = 0;
  openBuilding = false;
  trigger.reset();
  viewer.space = false;
  viewer.enter = false;
});
socket.on('winState',function(animations) {
  context.clearRect(0,0,1600,800);
  let players = animations[0];
  let dragonballs = animations[1];
  let shenronBody = animations[2];
  let shenronEnds = animations[3];
  let text = animations[4];
  let countdown = animations[5];
  for (var id in players)
  {
    if(id == socket.id)
    {
      myPlayer = players[id];
    }
  }
  starForger(context);
  shenronBody.sort((a,b) => a.time - b.time);
  for(let segment of shenronBody)
  {
    shenronDrawer(segment,context);
  }
  if(countdown == 200 && myPlayer.inventory.filter((x) => x == "dragonball").length == 7)
  {
    let wish = window.prompt("What is your wish?","???");
    wish = wish.replace(/[^0-9a-z .!',?-]/gi, '');
    socket.emit("wish",wish);
  }
  trigger.reset();
  viewer.space = false;
  viewer.enter = false;
});
socket.on('state',function(celestial) {
  context.clearRect(0,0,1600,800);
  if(reality == 1)
  {
    context.fillStyle = "white";
    context.fillRect(0,0,1600,800);
  }
  else if(reality == 2)
  {
    context.fillStyle = "lightblue";
    context.fillRect(0,0,1600,800);
  }
  if(colorSelected)
  {
    let players = celestial[1];
    let planets = celestial[0];
    let ships = celestial[2];
    let asteroids = celestial[3];
    let aliens = celestial[4];
    let items = celestial[5];
    let tears = celestial[6];

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
    items = items.filter((x)=>x.reality==reality);

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
        reality = 0;
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
    for (var id in items) {
      var item = items[id];
      itemDrawer(item,context);
    }
    for (var id in tears) {
      var tear = tears[id];
      tearDrawer(tear,context);
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
      drawInventory(myPlayer,context);
      if(myPlayer.inSpaceShip)
      {
        fuelBar(myPlayer, context);
        if(myPlayer.inSpaceShip.type == "capitolShip")
        {
          shipDrawer(myPlayer.inSpaceShip, context, {x: myPlayer.loc.x - 2100,y: myPlayer.loc.y + 900},3);
        }
        else
        {
          shipDrawer(myPlayer.inSpaceShip, context, {x: myPlayer.loc.x - 700,y: myPlayer.loc.y + 300},1);
        }
        context.strokeStyle = "grey";
        context.strokeRect(1400,0,200,200);
        parkDrawer(myPlayer.inSpaceShip.parked, context, 1400,200);
        if(myPlayer.inventory.includes("scanner"))
        {
          scannerDrawer(myPlayer,asteroids,context,1465,200);
        }
        specialDrawer(myPlayer.inSpaceShip, context, 1530,200);
      }
      else
      {
        if(myPlayer.air < myPlayer.airMax)
        {
          airBar(myPlayer,context);
        }
        if(myPlayer.inventory.includes("cannon"))
        {
          playerDrawer(myPlayer,context, {x: myPlayer.loc.x - 700,y: myPlayer.loc.y + 300},1);
          context.strokeStyle = "grey";
          context.strokeRect(1400,0,200,200);
          specialDrawer(myPlayer,context,1530,200);
        }
      }
      if(myPlayer.inventory.includes("radar"))
      {
        radarDrawer(myPlayer,context);
      }
    }

    if(myPlayer && menuOpen == "refinery")
    {
      if(trigger.right)
      {
        menuLoc = (menuLoc+1)%8;
      }
      else if(trigger.left)
      {
        menuLoc = ((menuLoc-1)%8+8)%8;
      }
      else if(trigger.down)
      {
        menuLoc = (menuLoc+4)%8;
      }
      else if(trigger.up)
      {
        menuLoc = ((menuLoc-4)%8+8)%8;
      }
      else if(trigger.enter)
      {
        if(menuLoc == 0 && myPlayer.inventory.filter((x) => x == "iron").length > 0 && myPlayer.inventory.filter((x) => x == "fuel").length > 0)
        {
          playerControl.build = "Steel";
          menuOpen = false;
        }
        else if(menuLoc == 1 && myPlayer.inventory.filter((x) => x == "chronos").length > 3)
        {
          playerControl.build = "Chaos";
          menuOpen = false;
        }
        else if(menuLoc == 2 && myPlayer.inventory.filter((x) => x == "fuel").length > 3)
        {
          playerControl.build = "Fuel+";
          menuOpen = false;
        }
        else if(menuLoc == 3 && myPlayer.inventory.includes("iron") && myPlayer.inventory.includes("chronos") && myPlayer.inventory.includes("dark"))
        {
          playerControl.build = "Omega";
          menuOpen = false;
        }
        else if(menuLoc == 4 && myPlayer.inventory.filter((x) => x == "omega").length > 1 && myPlayer.inventory.filter((x) => x == "fuel+").length > 1)
        {
          playerControl.build = "Fusion";
          menuOpen = false;
        }
        else if(menuLoc == 5 && myPlayer.inventory.filter((x) => x == "rock").length > 3)
        {
          playerControl.build = "Iron";
          menuOpen = false;
        }
        else if(menuLoc == 6 && myPlayer.inventory.filter((x) => x == "chronos").length > 5)
        {
          playerControl.build = "Wormhole";
          menuOpen = false;
        }
        else if(menuLoc == 7 && myPlayer.inventory.includes("dark") && myPlayer.inventory.includes("fuel"))
        {
          playerControl.build = "Life";
          menuOpen = false;
        }
      }
      refineMenuAnimation(context);
    }
    else if(myPlayer && menuOpen == "build")
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
        if(menuLoc == 3 && myPlayer.inventory.filter((x) => x == "steel").length > 0 && myPlayer.inventory.filter((x) => x == "chronos").length > 0)
        {
          playerControl.build = "Jump Ship";
          menuOpen = false;
        }
        if(menuLoc == 4 && myPlayer.inventory.filter((x) => x == "steel").length > 1 && myPlayer.inventory.filter((x) => x == "chronos").length > 1)
        {
          playerControl.build = "Reality Rocket";
          menuOpen = false;
        }
        if(menuLoc == 5 && myPlayer.inventory.filter((x) => x == "steel").length > 3 && myPlayer.inventory.filter((x) => x == "chaos").length > 1 && myPlayer.inventory.filter((x) => x == "omega").length > 1)
        {
          playerControl.build = "Capitol Ship";
          menuOpen = false;
        }
        if(menuLoc == 6 && myPlayer.inventory.filter((x) => x == "iron").length > 1)
        {
          playerControl.build = "Scanner";
          menuOpen = false;
        }
        if(menuLoc == 7 && myPlayer.inventory.filter((x) => x == "steel").length > 0 && myPlayer.inventory.filter((x) => x == "fuel").length > 0)
        {
          playerControl.build = "Helmet";
          menuOpen = false;
        }
        if(menuLoc == 8 && myPlayer.inventory.filter((x) => x == "steel").length > 1 && myPlayer.inventory.filter((x) => x == "iron").length > 1)
        {
          playerControl.build = "Crash Suit";
          menuOpen = false;
        }
        if(menuLoc == 9 && myPlayer.inventory.filter((x) => x == "steel").length > 0 && myPlayer.inventory.filter((x) => x == "fuel+").length > 0)
        {
          playerControl.build = "Jet Pack";
          menuOpen = false;
        }
        if(menuLoc == 10 && myPlayer.inventory.filter((x) => x == "chronos").length > 0 && myPlayer.inventory.filter((x) => x == "iron").length > 0)
        {
          playerControl.build = "Gravity Cannon";
          menuOpen = false;
        }
        if(menuLoc == 11 && myPlayer.inventory.filter((x) => x == "dark").length > 1 && myPlayer.inventory.filter((x) => x == "chronos").length > 1 && myPlayer.inventory.filter((x) => x == "iron").length > 1)
        {
          playerControl.build = "Dragon Radar";
          menuOpen = false;
        }
        if(menuLoc == 12 && myPlayer.inventory.filter((x) => x == "iron").length > 0)
        {
          playerControl.build = "SUV";
          menuOpen = false;
        }
        if(menuLoc == 13 && myPlayer.inventory.filter((x) => x == "steel").length > 0)
        {
          playerControl.build = "Hopper";
          menuOpen = false;
        }
        if(menuLoc == 14 && myPlayer.inventory.filter((x) => x == "iron").length > 3 && myPlayer.inventory.filter((x) => x == "chronos").length > 0)
        {
          playerControl.build = "Tank";
          menuOpen = false;
        }
        if(menuLoc == 15 && myPlayer.inventory.filter((x) => x == "iron").length > 1 && myPlayer.inventory.filter((x) => x == "fuel").length > 1 && myPlayer.controllingPlanet)
        {
          playerControl.build = "Refinery";
          menuOpen = false;
        }
        if(menuLoc == 16 && myPlayer.inventory.filter((x) => x == "steel").length > 1)
        {
          playerControl.build = "Warehouse";
          menuOpen = false;
        }
        if(menuLoc == 17 && myPlayer.inventory.filter((x) => x == "steel").length > 1 && myPlayer.inventory.filter((x) => x == "chronos").length > 1 && myPlayer.inventory.filter((x) => x == "rock").length > 1)
        {
          playerControl.build = "Auto Cannon";
          menuOpen = false;
        }
      }
      buildMenuAnimation(context);
    }
    else if(myPlayer && menuOpen == "warehouse")
    {
      let playerAngle = Vector.makeVec(myPlayer.controllingPlanet.loc).direction(Vector.makeVec(myPlayer.loc)).angle();
      openBuilding = false;
      for(let factory of myPlayer.controllingPlanet.buildings)
      {
        let difference = Math.abs(factory.angle-playerAngle);
        if(difference < factory.size/myPlayer.controllingPlanet.size && factory.type == "warehouse")
        {
          openBuilding = factory;
        }
      }
      if(trigger.right)
      {
        menuLoc = (menuLoc+1)%48;
      }
      else if(trigger.left)
      {
        menuLoc = ((menuLoc-1)%48+48)%48;
      }
      else if(trigger.down)
      {
        menuLoc = (menuLoc+12)%48;
      }
      else if(trigger.up)
      {
        menuLoc = ((menuLoc-12)%48+48)%48;
      }
      else if(trigger.enter)
      {
        if(openBuilding.storage.length > menuLoc)
        {
          if(player.inventory.length < 8)
          {
            playerControl.take = menuLoc+1;
          }
        }
      }
      if(openBuilding)
      {
        warehouseMenuAnimation(context,openBuilding);
      }
      else
      {
        menuOpen = false;
      }
    }
  }
  else
  {
    let colorNumbers = celestial[7];
    context.fillStyle = "white"
    context.font = "bold 30px Arial";
    context.fillText("Please select a faction:",100,100);
    context.fillText("# of Players",1100,100);
    context.fillText("Score",1400,100);
    context.fillStyle = "red";
    context.fillText("Radical Extermination Deployment",200,250);
    context.fillText(colorNumbers.red.number,1200,250);
    context.fillText(colorNumbers.red.score,1450,250);
    context.fillStyle = "blue";
    context.fillText("Bombastic Lizards Using Explosives",200,350);
    context.fillText(colorNumbers.blue.number,1200,350);
    context.fillText(colorNumbers.blue.score,1450,350);
    context.fillStyle = "yellow";
    context.fillText("Yammering Eccentric Llama Lovers Of Woe",200,450);
    context.fillText(colorNumbers.yellow.number,1200,450);
    context.fillText(colorNumbers.yellow.score,1450,450);
    context.fillStyle = "green";
    context.fillText("Generally Really Entrancingly Entertaining Nomads",200,550);
    context.fillText(colorNumbers.green.number,1200,550);
    context.fillText(colorNumbers.green.score,1450,550);
    context.fillStyle = "white"
    context.fillText("->",100,250+100*cursorLoc);
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
