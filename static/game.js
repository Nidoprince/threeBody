var socketIO = require('socket.io');
var io = socketIO(server);

var viewerSpeed = 3;
var myPlayer = null;

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
  y: 0
}

viewerUpdate = function()
{
  if(viewer.up)
  {
    viewer.y -= viewerSpeed;
  }
  if(viewer.down)
  {
    viewer.y +=  viewerSpeed;
  }
  if(viewer.right)
  {
    viewer.x +=  viewerSpeed;
  }
  if(viewer.left)
  {
    viewer.x -= viewerSpeed;
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
    viewer.x = myPlayer.loc.x - 800;
    viewer.y = myPlayer.loc.y - 400;
  }
  context.clearRect(0,0,1600,800);
  players = celestial[1]
  planets = celestial[0]
  for (var id in players) {
    if(id == socket.id)
    {
      myPlayer = players[id];
    }
    var player = players[id];
    context.fillStyle = player.color;
    context.beginPath();
    context.arc(player.loc.x-viewer.x,player.loc.y-viewer.y, player.size, 0, 2 * Math.PI);
    context.fill();
  }
  for (var id in planets) {
    var planet = planets[id];
    context.fillStyle = planet.color;
    context.beginPath();
    context.arc(planet.loc.x-viewer.x,planet.loc.y-viewer.y, planet.size, 0, 2 * Math.PI);
    context.fill();
  }
});
