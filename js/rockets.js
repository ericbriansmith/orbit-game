var ctx;
var canvas;
var gameWidth = 800;
var gameHeight = 700;
var lastTime;
var planetPeek = 100; //the minimum distance we want the nearest body to overlap the screen.

var updateCount = 0;

function start() {
  canvas = $("#main")[0];
  setupInput();
  setupDevInput();
  newGame();
  lastTime = new Date().getTime();
  ctx = canvas.getContext("2d");
  setInterval(update, 1000/60);
}

function setupInput() {
  document.addEventListener("keydown", function(event) {
    if (event.keyCode == 32) {
      gameState.input.spacebar = true;
    } else if (event.keyCode == 37) {
      gameState.input.left = true;
    } else if (event.keyCode == 39) {
      gameState.input.right = true;
    }
  });
  document.addEventListener("keyup", function(event) {
    if (event.keyCode == 32) {
      gameState.input.spacebar = false;
    } else if (event.keyCode == 37) {
      gameState.input.left = false;
    } else if (event.keyCode == 39) {
      gameState.input.right = false;
    }
  });
  document.addEventListener("keypress", function(event) {
    //var x = event.which || event.keyCode; for firefox support
    if (!gameState.inputMuted) {
      if (event.keyCode == 44) {
        if (gameState.timeScale >= 2) { //,
          gameState.timeScale /= 2;
        }
      } else if (event.keyCode == 46) { //.
        if (gameState.timeScale < 10000) {
          gameState.timeScale *= 2;
        }
      } else if (event.keyCode == 122) { //z
        if (gameState.zoomMode == 0) {
          setZoom(1);
        } else {
          setZoom(0);
        }
      } else if (event.keyCode == 97) { //a
        setZoom(2);
      } else if (event.keyCode == 116) { //t
        startTrajectory();
      }
    }
  });
}

function setZoom(newZoomMode) {
  gameState.zoomMode = newZoomMode;
}

var showingTrajectory = false;
function startTrajectory() {
  //not finished
  showingTrajectory = true;
  drawTrajectory(clone(gameState));
}

function update() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // if (!showingTrajectory) {
    var now = new Date().getTime();
    var timeDiff = now - lastTime;
    lastTime = now;
    if (timeDiff > 500) {
      //happens when losing focus for a while. probably should implement a real pause feature
      timeDiff = 0;
    }
    var tick = gameState.timeScale * timeDiff/1000;
    moveThings(gameState, tick);
    if (gameState.goalComplete()) {
      nextLevel();
    }
  // }
  drawState(tick);
}

function moveThings(movingGameState, tick) {
  movingGameState.rocket.move(tick);
  for (i = 0; i < movingGameState.planets.length; i++) {
    movingGameState.planets[i].move(tick);
  }
  if (updateCount == 0) {
    updatePeriodicCalculations();
  }
  var moonsAndSatellites = movingGameState.moons.concat(movingGameState.satellites);
  for (i = 0; i < moonsAndSatellites.length; i++) {
    moonsAndSatellites[i].move(tick);
  }
  updateCount = (updateCount + 1) % 30;
}

var speedToKeepOrbit = 0;

function updatePeriodicCalculations() {
  speedToKeepOrbit = Math.sqrt(g * gameState.rocket.nearestBody.mass / gameState.rocket.nearestBody.rocketDistanceResult.distToCenter);
}

function drawBodies(scale) {
  var i;
  for (i = 0; i < gameState.bodies.length; i++) {
    var body = gameState.bodies[i];
    if (body instanceof Satellite) {
      drawSatellite(body, scale);
    } else {
      drawCircle(body.x, body.y, body.radius, scale, body.direction);
    }
    // drawLaunchpads(body, scale);
  }
}

function drawSatellite(satellite, scale) {
  resetTransform();
  ctx.translate(gameWidth / 2, gameHeight / 2);
  var x = satellite.x;
  var y = satellite.y;
  ctx.translate(scale * (gameState.rocket.x * -1 + x), scale * (gameState.rocket.y * -1 + y));
  ctx.fillRect(0, 0, scale * 30, scale * 30);
}

var launchPadSize = 50;
function drawLaunchpads(body, scale) {
  var i;
  for (i = 0; i < body.launchpads.length; i++) {
    var launchpad = body.launchpads[i];
    resetTransform();
    ctx.translate(gameWidth / 2, gameHeight / 2);
    ctx.translate(scale * (gameState.rocket.x * -1 + launchpad.x), scale * (gameState.rocket.y * -1 + launchpad.y));
    ctx.fillRect(0, 0, launchPadSize * scale, launchPadSize * scale);
  }
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function calcScale() {
  //find scale so that we can see the ship and the nearest body.
  var scale = (gameHeight / 2 - planetPeek) / gameState.rocket.nearestBody.rocketDistanceResult.distance;
  if (scale > 1 || gameState.zoomMode == 1) {
    scale = 1;
  }
  if (gameState.zoomMode == 2) {
    //find scale to see all bodies
    var farthestBody = gameState.rocket.farthestBody;
    var scale = (gameHeight / 2) / (farthestBody.rocketDistanceResult.distance + farthestBody.radius * 2);
  }
  return scale;
}

function drawTrajectory(gameStateToDraw) {
  resetTransform();
  var tick = 100;
  var i=0;
  while (i < 10) {
    moveThings(gameStateToDraw, tick);
    drawRocket(gameStateToDraw.rocket);
    i++;
  }
}

function drawState(tick) {
  var scale = calcScale();
  drawRocket(gameState.rocket, scale);
  drawBodies(scale);
  resetTransform();
  drawStatus(tick);
}

function metersOrKm(value,tag) {
  if (value > 1000) {
    return "" + (Math.round((value / 1000) * 1000) / 1000) + "km" + tag;
  } else {
    return "" + Math.round(value) + "m" + tag;
  }
}

function drawRocket(rocket, scale) {
  if (rocket.crashed) {
    message("Crashed");
  }
  var rocketHalfHeight = rocketHeight / 2;
  ctx.strokeStyle = colors.rocket;
  ctx.lineWidth = 2;
  ctx.translate(gameWidth / 2, gameHeight / 2);
  ctx.rotate(gameState.rocket.dir);
  ctx.beginPath();
  ctx.moveTo(0, -rocketHeight * scale);
  ctx.lineTo(rocketHalfHeight * scale, rocketHalfHeight * scale);
  ctx.lineTo(-rocketHalfHeight * scale, rocketHalfHeight * scale);
  ctx.lineTo(0, -rocketHeight * scale);
  ctx.rotate(-1 * gameState.rocket.dir);
  ctx.moveTo(0, 0);
  ctx.lineTo(rocket.relativeVelocityNearest.x, rocket.relativeVelocityNearest.y);
  if (rocket.crashed) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

// function drawCloud(x,y) {
//   ctx.strokeRect(x,y, 20, 20);
// }

function drawCircle(x, y, radius, scale, startDir) {
  // var lineWidth = 10 * scale;
  // if (lineWidth < 1) {
  //   lineWidth = 1;
  // }
  resetTransform();
  ctx.translate(gameWidth / 2, gameHeight / 2);
  ctx.translate(scale * (gameState.rocket.x * -1 + x), scale * (gameState.rocket.y * -1 + y));

  var circleRad = radius * scale;
  ctx.beginPath();
  ctx.arc(0, 0,  circleRad, 0, 2 * Math.PI);
  ctx.fillStyle = colors.planetFill;
  ctx.fill();

  drawLandmarks(x, y, radius, scale, startDir);


  //
  //Below code for drawing dashed line around planet. Doesn't work well in
  //chrome
  //

  // var i;
  // var seg = 2 * Math.PI / 100;
  // ctx.lineWidth = lineWidth;
  // ctx.strokeStyle=colors.outline1;
  // for (i=startDir; i < startDir + 2 * Math.PI; i+=seg) {
  //   if (ctx.strokeStyle == colors.outline1) {
  //     ctx.strokeStyle=colors.outline2;
  //   } else {
  //     ctx.strokeStyle=colors.outline1;
  //   }
  //
  //   ctx.beginPath();
  //   var circleRad = radius * scale - lineWidth/2;
  //   if (circleRad < 1) {circleRad = 1;}
  //   ctx.arc(0, 0,  circleRad, i, i + seg);
  //   ctx.stroke();
  // }

}

function drawLandmarks(x, y, radius, scale, startDir) {
  //TODO: below calculations could be cached
  var circumference = 2 * Math.PI * radius;
  var distanceBetweenLandmarks = 900;
  var numLandmarks = Math.floor(circumference / distanceBetweenLandmarks);
  var i;
  radius *= scale;
  var angleBetweenMarks = 2 * Math.PI / numLandmarks;
  var shipDirection = gameState.rocket.nearestBody.rocketDistanceResult.direction;
  var start = Math.floor((shipDirection - startDir)/angleBetweenMarks) - 1;
  for (i = start; i < start + 3; i++) {
    var angle = startDir + i * angleBetweenMarks;
    ctx.beginPath();
    var x = radius * Math.cos(angle);
    var y = radius * Math.sin(angle);
    ctx.rect(x, y, 10 * scale, 10 * scale);
    ctx.stroke();
  }
}

function fixSize() {
  $("#main").width($("#mainDiv").width());
  $("#main").height($("#mainDiv").height);
}

$(start);
