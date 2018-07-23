const viewerSpeed = 3;
var myPlayer = null;
var zoomRatio = 1.05;
var zoomMult = Math.pow(zoomRatio,viewer.zoom);

var colorSelected = false;
var cursorMove = 0;
var cursorLoc = 0;

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

//socket.emit('new player');
setInterval(function() {
  socket.emit('playerControl', playerControl);
}, 1000/60);

var canvas = document.getElementById('canvas');
canvas.width = 1600;
canvas.height = 800;
var context = canvas.getContext('2d');
socket.on('state',function(celestial) {
  context.clearRect(0,0,1600,800);
  if(colorSelected)
  {
    players = celestial[1];
    planets = celestial[0];
    ships = celestial[2];
    asteroids = celestial[3];

    for (var id in players)
    {
      if(id == socket.id)
      {
        myPlayer = players[id];
      }
    }

    viewerUpdate();
    zoomMult = Math.pow(zoomRatio,viewer.zoom);
    if(myPlayer && (viewer.space || viewer.focusPlayer))
    {
      viewer.x = myPlayer.loc.x;
      viewer.y = myPlayer.loc.y;
    }
    if(myPlayer && myPlayer.controllingPlanet)
    {
      viewer.x += myPlayer.controllingPlanet.vel.x;
      viewer.y += myPlayer.controllingPlanet.vel.y;
    }

    //Make Stars
    starForger(context);

    for (var id in players) {
      var player = players[id];
      playerDrawer(player,context);
    }
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
    if(myPlayer)
    {
      playerDot(myPlayer,context)
    }
    if(myPlayer && viewer.showVelocity)
    {
      var toMap = new Map(myPlayer.velocityComponents)
      var velPieces = toMap.size;
      for (var [key,value] of toMap)
      {
        context.fillStyle = "white";
        context.font = "bold 16px Arial";
        context.fillText(key + " - x: " + value.x.toFixed(3) + " y: "+value.y.toFixed(3) +" m: "+Math.sqrt(value.x*value.x+value.y*value.y).toFixed(3),1300,810-50*velPieces);
        velPieces -= 1;
        if(viewer.log)
        {
          console.log((new Date()).getTime()+" "+key + " - x: " + value.x.toFixed(3) + " y: "+value.y.toFixed(3) +" m: "+Math.sqrt(value.x*value.x+value.y*value.y).toFixed(3));
        }
      }
    }
    if(myPlayer)
    {
      for (var inv in myPlayer.inventory)
      {
        content.fillStyle = "white"
        context.font = "bold 14px Arial";
        context.fillText(myPlayer.inventory[inv],50+inv*100,750)
      }
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
    context.fillText("Yammering Ecentric Llama Lovers Of Woe",500,550);
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
  }
  trigger.reset();
});
