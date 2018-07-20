var viewerSpeed = 3;
var myPlayer = null;
var zoomRatio = 1.05;

var colorSelected = false;
var cursorMove = 0;
var cursorLoc = 0;

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

var playerControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  e: false
}
var viewer = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  x: 0,
  y: 0,
  zoom: 0,
  velocity: false,
  showVelocity: false,
  focus: false,
  focusPlayer: false,
  log: false,
  enter: false
}
var trigger = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  velocity: false,
  focus: false,
  enter: false,
  e: false,
  reset()
  {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.space = false;
    this.velocity = false;
    this.focus = false;
    this.enter = false;
    this.e = false;
  }
}

viewerUpdate = function()
{
  if(viewer.up)
  {
    viewer.y -= viewerSpeed*Math.pow(zoomRatio,viewer.zoom);
  }
  if(viewer.down)
  {
    viewer.y +=  viewerSpeed*Math.pow(zoomRatio,viewer.zoom);
  }
  if(viewer.right)
  {
    viewer.x +=  viewerSpeed*Math.pow(zoomRatio,viewer.zoom);
  }
  if(viewer.left)
  {
    viewer.x -= viewerSpeed*Math.pow(zoomRatio,viewer.zoom);
  }
  if(viewer.reduce && viewer.zoom > -20)
  {
    viewer.zoom -= 1;
  }
  if(viewer.increase && viewer.zoom < 150)
  {
    viewer.zoom += 1;
  }
  if(viewer.resetZoom)
  {
    viewer.zoom = 0;
  }
  if(trigger.velocity)
  {
    viewer.showVelocity = ! viewer.showVelocity;
  }
  if(trigger.focus)
  {
    viewer.focusPlayer = ! viewer.focusPlayer;
  }
  if(cursorLoc)
  {
    viewer.space = true;
    cursorLoc = false;
  }
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: //A
      playerControl.left = true;
      break;
    case 87: //W
      playerControl.up = true;
      break;
    case 68: //D
      playerControl.right = true;
      break;
    case 83: //S
      playerControl.down = true;
      break;
    case 86: //V
      viewer.velocity = true;
      break;
    case 76: //l
      viewer.log = true;
      break;
    case 70: //F
      viewer.focus = true;
      break;
    case 69: //E
      playerControl.e = true;
      break;
    case 38: //Up Arrow
      viewer.up = true;
      break;
    case 40: //Down Arrow
      viewer.down = true;
      break;
    case 37: //Left Arrow
      viewer.left = true;
      break;
    case 39: //Right Arrow
      viewer.right = true;
      break;
    case 32: //Space
      viewer.space = true;
      break;
    case 13: //Enter
      viewer.enter = true;
      break;
    case 221: //Right Bracket
      viewer.increase = true;
      break;
    case 219: //Left Bracket
      viewer.reduce = true;
      break;
    case 220: //Backslash
      viewer.resetZoom = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: //A
      if(playerControl.left)
      {
        trigger.left = true;
      }
      playerControl.left = false;
      break;
    case 87: //W
      if(playerControl.up)
      {
        trigger.up = true;
      }
      playerControl.up = false;
      break;
    case 68: //D
      if(playerControl.right)
      {
        trigger.right = true;
      }
      playerControl.right = false;
      break;
    case 83: //S
      if(playerControl.down)
      {
        trigger.down = true;
      }
      playerControl.down = false;
      break;
    case 86: //V
      if(viewer.velocity)
      {
        trigger.velocity = true;
      }
      viewer.velocity = false;
      break;
    case 76: //l
      viewer.log = false;
      break;
    case 70: //F
      if(viewer.focus)
      {
        trigger.focus = true;
      }
      viewer.focus = false;
      break;
    case 69: //E
      if(playerControl.e)
      {
        trigger.e = true;
      }
      playerControl.e = false;
      break;
    case 38: //Up Arrow
      if(viewer.up)
      {
        trigger.up = true;
      }
      viewer.up = false;
      break;
    case 40: //Down Arrow
      if(viewer.down)
      {
        trigger.down = true;
      }
      viewer.down = false;
      break;
    case 37: //Left Arrow
      if(viewer.left)
      {
        trigger.left = true;
      }
      viewer.left = false;
      break;
    case 39: //Right Arrow
      if(viewer.right)
      {
        trigger.right = true;
      }
      viewer.right = false;
      break;
    case 32: //Space
      if(viewer.space)
      {
        trigger.space = true;
      }
      viewer.space = false;
      break;
    case 13: //Enter
      if(viewer.enter)
      {
        trigger.enter = true;
      }
      viewer.enter = false;
      break;
    case 221: //Right Bracket
      viewer.increase = false;
      break;
    case 219: //Left Bracket
      viewer.reduce = false;
      break;
    case 220: //Backslash
      viewer.resetZoom = false;
      break;
  }
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
  if(colorSelected){
  viewerUpdate();
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
  var time = (new Date()).getTime();
  for(var i = 0; i < 100 +10*(viewer.zoom+20); i++)
  {
    var xS = (5001*i+Math.floor(Math.abs(viewer.x)/20))%1600;
    var yS = (333*i*i+Math.floor(Math.abs(viewer.y)/30))%800;
    if((time+2001*i)%100000 <= 500)
    {
      context.fillStyle = "rgba(255,255,255,0."+((Math.abs(i*i+i)%60)+49).toString()+")";
    }
    else
    {
      context.fillStyle = "rgba(255,255,255,0."+((Math.abs(i*i+i)%60)+20).toString()+")";
    }
    context.beginPath();
    context.arc(xS,yS,Math.abs(i*i+i)%5,0,2*Math.PI);
    context.fill();
  }

  players = celestial[1];
  planets = celestial[0];
  ships = celestial[2];
  for (var id in players) {
    if(id == socket.id)
    {
      myPlayer = players[id];
    }
    var player = players[id];
    if(!player.inSpaceShip)
    {
      context.fillStyle = player.color;
      context.beginPath();
      context.arc((player.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom)+800,(player.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom)+400, player.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
      context.fill();
    }
  }
  for (var id in planets) {
    var planet = planets[id];
    context.fillStyle = planet.color;
    context.beginPath();
    context.arc((planet.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom)+800,(planet.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom)+400, planet.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = planet.atmosphereColor;
    context.beginPath();
    context.arc((planet.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom)+800,(planet.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom)+400, 1.2*planet.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
    context.fill();
  }
  for (var id in ships) {
    var ship = ships[id];
    shipDrawer(ship,context);
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
  }}
  else {
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
