var playerControl = {
  up: false,
  down: false,
  left: false,
  right: false,
  e: false,
  m: false,
  p: false,
  t: false,
  h: false,
  inventory: false,
  build: false,
  xGoal: false,
  yGoal: false,
  give: false,
  take: false,
  menuMode()
  {
    return {
      up:false,
      down: false,
      left: false,
      right: false,
      e: false,
      m: false,
      p: false,
      t: false,
      h: false,
      inventory: false,
      build: false,
      xGoal: false,
      yGoal: false,
      give: playerControl.give,
      take: playerControl.take
    }
  }
}
var adminControls = {
  q: false
}
var touchGesture = {
  oldLoc1: false,
  oldLoc2: false,
  newLoc1: false,
  newLoc2: false,
  updateTouch(x1,y1,x2,y2)
  {
    if(this.oldLoc1 == false)
    {
      this.oldLoc1 = new Vector(x1,y1);
      this.newLoc1 = new Vector(x1,y1);
      this.oldLoc2 = new Vector(x2,y2);
      this.newLoc2 = new Vector(x2,y2);
    }
    else
    {
      this.oldLoc1 = this.newLoc1.copy();
      this.oldLoc2 = this.newLoc2.copy();
      this.newLoc1 = new Vector(x1,y1);
      this.newLoc2 = new Vector(x2,y2);
    }
  },
  move1()
  {
    return this.oldLoc1.fromTill(this.newLoc1);
  },
  move2()
  {
    return this.oldLoc2.fromTill(this.newLoc2);
  },
  isZooming()
  {
    if(this.move1().magnitude() > 20 && this.move2().magnitude() > 20 && Math.abs(Vector.angleBetween(this.move1(),this.move2())) > Math.PI-0.5)
    {
      if(Vector.distance(this.oldLoc1,this.oldLoc2) > Vector.distance(this.newLoc1,this.newLoc2))
      {
        return "pinching";
      }
      else
      {
        return "expanding";
      }
    }
    else
    {
      return false;
    }
  },
  isStill()
  {
    if(this.move1().magnitude() <= 20 && this.move2().magnitude() <= 20)
    {
      return(new Vector((this.newLoc1.x+this.newLoc2.x)/2,(this.newLoc1.y+this.newLoc2.y)/2));
    }
    else
    {
      return false;
    }
  },
  reset()
  {
    this.oldLoc1 = false;
    this.oldLoc2 = false;
  }
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
  focusPlayer: true,
  log: false,
  enter: false,
  item: {
    lookingFor: "iron",
    next()
    {
      if(this.lookingFor == "iron")
      {
        this.lookingFor = "chronos";
      }
      else if(this.lookingFor == "chronos")
      {
        this.lookingFor = "dark";
      }
      else if(this.lookingFor == "dark")
      {
        this.lookingFor = "fuel";
      }
      else if(this.lookingFor == "fuel")
      {
        this.lookingFor = "iron";
      }
    }
  }
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
  p: false,
  b: false,
  t: false,
  h: false,
  tX: false,
  tY: false,
  i: false,
  inventory: false,
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
  },
  resetPlayer()
  {
    playerControl.e = false;
    playerControl.p = false;
    playerControl.t = false;
    playerControl.build = false;
    playerControl.inventory = false;
    playerControl.give = false;
    playerControl.take = false;
    playerControl.h = false;
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
  if(viewer.reduce && viewer.zoom > -50)
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

function touchHandler(event,touchType)
{
  if(event.touches && event.touches.length == 1)
  {
    //console.log(event.touches)
    trigger.tX = event.touches[0].pageX*(1600/realWidth) - canvas.offsetLeft;
    trigger.tY = event.touches[0].pageY*(800/realHeight) - canvas.offsetTop;
    if(touchType == "start")
    {
      if(trigger.tY > 180 && trigger.tY < 280)
      {
        if(trigger.tX > 1350 && trigger.tX < 1465)
        {
          playerControl.p = true;
        }
        else if(trigger.tX > 1465 && trigger.tX < 1530)
        {
          viewer.item.next();
        }
        else if(trigger.tX > 1530 && trigger.tX < 1650)
        {
          playerControl.t = true;
        }
      }
      if(trigger.tY > 700 && trigger.tX >= 50 && trigger.tX < 850)
      {
        playerControl.inventory = Math.floor((trigger.tX-50)/100)+1;
      }
      if(trigger.tY > 700 && trigger.tX > 1400)
      {
        playerControl.h = true;
      }
      if(trigger.tY < 100 && trigger.tX < 150)
      {
        if(menuOpen == "build")
        {
          menuOpen = false;
        }
        else
        {
          menuOpen = "build";
        }
      }
      if(menuOpen == "build" && trigger.tY > 100 && trigger.tY < 700 && trigger.tX > 100 && trigger.tX < 1500)
      {
        let clickWhere = Math.floor((trigger.tX-100)/250)+6*Math.floor((trigger.tY-100)/225);
        if(menuLoc == clickWhere)
        {
          trigger.enter = true;
        }
        else
        {
          menuLoc = clickWhere;
        }
      }

      if(menuOpen == "refinery" && trigger.tY > 100 && trigger.tY < 700 && trigger.tX > 100 && trigger.tX < 1500)
      {
        let clickWhere = Math.floor((trigger.tX-100)/375)+4*Math.floor((trigger.tY-100)/350);
        if(menuLoc == clickWhere)
        {
          trigger.enter = true;
        }
        else
        {
          menuLoc = clickWhere;
        }
      }

      if(menuOpen == "warehouse" && trigger.tY > 100 && trigger.tY < 700 && trigger.tX > 100 && trigger.tX < 1500)
      {
        let clickWhere = Math.floor((trigger.tX-100)/121)+12*Math.floor((trigger.tY-100)/175);
        if(menuLoc == clickWhere)
        {
          trigger.enter = true;
        }
        else
        {
          menuLoc = clickWhere;
        }
      }
    }
  }
  else if(event.touches && event.touches.length == 3 && touchType == "start")
  {
    playerControl.e = true;
  }
  else if(event.touches && event.touches.length == 2)
  {
    touchGesture.updateTouch(event.touches[0].pageX*(1600/realWidth) - canvas.offsetLeft,event.touches[0].pageY*(800/realHeight) - canvas.offsetTop,event.touches[1].pageX*(1600/realWidth) - canvas.offsetLeft,event.touches[1].pageY*(800/realHeight) - canvas.offsetTop);
    let zooming = touchGesture.isZooming();
    let stillLoc = touchGesture.isStill();
    if(zooming == "pinching" && viewer.zoom<150)
    {
      viewer.zoom += Math.floor(touchGesture.move1().magnitude()/10);
      if(viewer.zoom > 150)
      {
        viewer.zoom = 150;
      }
    }
    else if(zooming == "expanding" && viewer.zoom>-50)
    {
      viewer.zoom -= Math.floor(touchGesture.move1().magnitude()/10);
      if(viewer.zoom < -50)
      {
        viewer.zoom = -50;
      }
    }
    else if(stillLoc)
    {
      trigger.tX = stillLoc.x;
      trigger.tY = stillLoc.y;
      playerControl.m = true;
    }
  }
  else
  {
    trigger.tX = false;
    trigger.tY = false;
  }
}

function touchStartHandler(event)
{
  touchHandler(event,"start");
}
function touchMoveHandler(event)
{
  touchHandler(event,"move");
}

function touchEndHandler(event)
{
  if(!event.touches || event.touches.length != 1)
  {
    trigger.tX = false;
    trigger.tY = false;
  }
  if(!event.touches || event.touches.length != 2)
  {
    touchGesture.reset();
    playerControl.m = false;
  }
}

document.addEventListener("touchstart", touchStartHandler);
document.addEventListener("touchmove", touchMoveHandler);

document.addEventListener("touchend", touchEndHandler);
document.addEventListener("touchcancel", touchEndHandler);

document.addEventListener("resize", function(event)
{
  let canvasTest = document.getElementById('canvas');
  realWidth = canvasTest.clientWidth;
  realHeight = canvasTest.clientHeight;
});

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 49: //1
      trigger.inventory = 1;
      break;
    case 50: //2
      trigger.inventory = 2;
      break;
    case 51: //3
      trigger.inventory = 3;
      break;
    case 52: //4
      trigger.inventory = 4;
      break;
    case 53: //5
      trigger.inventory = 5;
      break;
    case 54: //6
      trigger.inventory = 6;
      break;
    case 55: //7
      trigger.inventory = 7;
      break;
    case 56: //8
      trigger.inventory = 8;
      break;
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
      trigger.e = true;
      break;
    case 73: //I
      trigger.i = true;
      break;
    case 77: //M
      playerControl.m = true;
      break;
    case 80: //P
      trigger.p = true;
      break;
    case 66: //B
      trigger.b = true;
      break;
    case 84: //T
      trigger.t = true;
      break;
    case 81: //Q
      adminControls.q = true;
      break;
    case 72: //H
      trigger.h = true;
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
    case 49: //1
      if(trigger.inventory == 1)
      {
        playerControl.inventory = 1;
      }
      trigger.inventory = false;
      break;
    case 50: //2
      if(trigger.inventory == 2)
      {
        playerControl.inventory = 2;
      }
      trigger.inventory = false;
      break;
    case 51: //3
      if(trigger.inventory == 3)
      {
        playerControl.inventory = 3;
      }
      trigger.inventory = false;
      break;
    case 52: //4
      if(trigger.inventory == 4)
      {
        playerControl.inventory = 4;
      }
      trigger.inventory = false;
      break;
    case 53: //5
      if(trigger.inventory == 5)
      {
        playerControl.inventory = 5;
      }
      trigger.inventory = false;
      break;
    case 54: //6
      if(trigger.inventory == 6)
      {
        playerControl.inventory = 6;
      }
      trigger.inventory = false;
      break;
    case 55: //7
      if(trigger.inventory == 7)
      {
        playerControl.inventory = 7;
      }
      trigger.inventory = false;
      break;
    case 56: //8
      if(trigger.inventory == 8)
      {
        playerControl.inventory = 8;
      }
      trigger.inventory = false;
      break;
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
      if(trigger.e)
      {
        playerControl.e = true;
      }
      trigger.e = false;
      break;
    case 72: //H
      if(trigger.h)
      {
        playerControl.h = true;
      }
      trigger.h = false;
      break;
    case 77: //M
      playerControl.m = false;
      break;
    case 80: //P
      if(trigger.p)
      {
        playerControl.p = true;
      }
      trigger.p = false;
      break;
    case 66: //B
      if(trigger.b)
      {
        if(menuOpen == "build")
        {
          menuOpen = false;
        }
        else
        {
          menuOpen = "build";
        }
      }
      trigger.b = false;
      break;
    case 84: //T
      if(trigger.t)
      {
        playerControl.t = true;
      }
      trigger.t = false;
      break;
    case 73: //I
      if(trigger.i)
      {
        viewer.item.next();
      }
      trigger.i = false;
      break;
    case 81: //Q
      adminControls.q = false;
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
