var playerControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  e: false,
  m: false
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
    case 77: //M
      playerControl.m = true;
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
    case 77: //M
      playerControl.m = false;
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
