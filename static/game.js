var viewerSpeed = 3;
var myPlayer = null;
var zoomRatio = 1.1;

var socket = io();
socket.on('message', function(data) {
  console.log(data);
});

var movement = {
  up: false,
  down: false,
  left: false,
  right: false
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
  velocityToggle: false,
  velocityTrigger: false,
  showVelocity: true,
  log: false
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
    viewer.x+=800*(Math.pow(zoomRatio,viewer.zoom+1)-Math.pow(zoomRatio,viewer.zoom))
    viewer.y+=400*(Math.pow(zoomRatio,viewer.zoom+1)-Math.pow(zoomRatio,viewer.zoom))
  }
  if(viewer.increase && viewer.zoom < 100)
  {
    viewer.zoom += 1;
    viewer.x-=800*(Math.pow(zoomRatio,viewer.zoom)-Math.pow(zoomRatio,viewer.zoom-1))
    viewer.y-=400*(Math.pow(zoomRatio,viewer.zoom)-Math.pow(zoomRatio,viewer.zoom-1))
  }
  if(viewer.resetZoom)
  {
    var preZoom = viewer.zoom;
    viewer.zoom = 0;
    viewer.x = viewer.x+800*Math.pow(zoomRatio,preZoom)-800;
    viewer.y = viewer.y+400*Math.pow(zoomRatio,preZoom)-400;
  }
  if(viewer.velocityTrigger)
  {
    viewer.velocityToggle = true;
  }
  else
  {
    if(viewer.velocityToggle)
    {
      viewer.showVelocity = ! viewer.showVelocity;
      viewer.velocityToggle = false;
    }
  }

}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: //A
      movement.left = true;
      break;
    case 87: //W
      movement.up = true;
      break;
    case 68: //D
      movement.right = true;
      break;
    case 83: //S
      movement.down = true;
      break;
    case 86: //V
      viewer.velocityTrigger = true;
      break;
    case 76: //l
      viewer.log = true;
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
      movement.left = false;
      break;
    case 87: //W
      movement.up = false;
      break;
    case 68: //D
      movement.right = false;
      break;
    case 83: //S
      movement.down = false;
      break;
    case 86: //V
      viewer.velocityTrigger = false;
      break;
    case 76: //l
      viewer.log = false;
      break;
    case 38: //Up Arrow
      viewer.up = false;
      break;
    case 40: //Down Arrow
      viewer.down = false;
      break;
    case 37: //Left Arrow
      viewer.left = false;
      break;
    case 39: //Right Arrow
      viewer.right = false;
      break;
    case 32: //Space
      viewer.space = false;
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

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000/60);

var canvas = document.getElementById('canvas');
canvas.width = 1600;
canvas.height = 800;
var context = canvas.getContext('2d');
socket.on('state',function(celestial) {
  viewerUpdate();
  if(viewer.space && myPlayer)
  {
    viewer.x = myPlayer.loc.x - 800*Math.pow(zoomRatio,viewer.zoom);
    viewer.y = myPlayer.loc.y - 400*Math.pow(zoomRatio,viewer.zoom);
  }
  if(myPlayer && myPlayer.controllingPlanet)
  {
    viewer.x += myPlayer.controllingPlanet.vel.x;
    viewer.y += myPlayer.controllingPlanet.vel.y;
  }
  context.clearRect(0,0,1600,800);
  for(var i = 0; i < 100 +10*(viewer.zoom+20); i++)
  {
    var xS = (5001*i+Math.floor(Math.abs(viewer.x)/20))%1600;
    var yS = (333*i*i+Math.floor(Math.abs(viewer.y)/30))%800;
    context.fillStyle = "rgba(255,255,255,0."+(Math.abs(i*i+i)%5+4).toString()+")";
    context.beginPath();
    context.arc(xS,yS,Math.abs(i*i+i)%5,0,2*Math.PI);
    context.fill();
  }
  players = celestial[1];
  planets = celestial[0];
  for (var id in players) {
    if(id == socket.id)
    {
      myPlayer = players[id];
    }
    var player = players[id];
    context.fillStyle = player.color;
    context.beginPath();
    context.arc((player.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom),(player.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom), player.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
    context.fill();
  }
  for (var id in planets) {
    var planet = planets[id];
    context.fillStyle = planet.color;
    context.beginPath();
    context.arc((planet.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom),(planet.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom), planet.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
    context.fill();
    context.fillStyle = planet.atmosphereColor;
    context.beginPath();
    context.arc((planet.loc.x-viewer.x)/Math.pow(zoomRatio,viewer.zoom),(planet.loc.y-viewer.y)/Math.pow(zoomRatio,viewer.zoom), 1.2*planet.size/Math.pow(zoomRatio,viewer.zoom), 0, 2 * Math.PI);
    context.fill();
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
});
