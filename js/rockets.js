var ctx;
var canvas;
var gameWidth = 800;
var gameHeight = 700;
var lastTime;
var planetPeek = 100;

function start() {
  canvas = $("#main")[0];
  setupInput();
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
    if (event.keyCode == 44) {
      if (gameState.timeScale >= 2) {
        gameState.timeScale /= 2;
      }
    } else if (event.keyCode == 46) {
      if (gameState.timeScale < 20) {
        gameState.timeScale *= 2;
      }
    } else if (event.keyCode == 122) {
      if (gameState.zoomMode == 0) {
        gameState.zoomMode = 1;
      } else if (gameState.zoomMode == 1) {
        gameState.zoomMode = 0;
      }
    }
  });
}

function update() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var now = new Date().getTime();
  var timeDiff = now - lastTime;
  lastTime = now;
  var tick = gameState.timeScale * timeDiff/1000;
  gameState.rocket.move(tick);

  drawState();
  var i;
  for (i = 0; i < gameState.moons.length; i++) {
    gameState.moons[i].move(tick);
  }
  // setTimeout(update, 10);
}

function drawMoons(scale) {
  var i;
  for (i = 0; i < gameState.moons.length; i++) {
    var moon = gameState.moons[i];
    drawCircle(moon.x, moon.y, moon.radius, scale);
  }
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawState() {
  drawStatus();
  var scale = (gameHeight / 2 - planetPeek) / gameState.rocket.nearestPlanetDistanceResult.distance;
  if (scale > 1 || gameState.zoomMode == 1) {
    scale = 1;
  }
  drawRocket(scale);
  var index;
  for (index=0; index < gameState.planets.length; index++) {
    var planet = gameState.planets[index];
    drawCircle(planet.x, planet.y, planet.radius, scale);
  }
  drawMoons(scale);
}

function drawStatus() {
  var lineJump = 20;
  var index = lineJump;
  ctx.font = "15px Arial";
  ctx.fillText("Fuel: " + Math.round(gameState.rocket.fuel * 100) / 100, 1, index);
  index += lineJump;
  ctx.fillText("Velocity: " + metersOrKm(gameState.rocket.velocity.total, "/s"), 1, index);
  index += lineJump;
  ctx.fillText("Altitude: " + gameState.rocket.nearestPlanet.name + " " + metersOrKm(gameState.rocket.nearestPlanetDistanceResult.distance, ""), 1, index);
  index += lineJump;
  ctx.fillText("Time stretch: " + gameState.timeScale, 1, index);
}

function metersOrKm(value,tag) {
  if (value > 1000) {
    return "" + (Math.round((value / 1000) * 100) / 100) + "km" + tag;
  } else {
    return "" + Math.round(value) + "m" + tag;
  }
}

function drawRocket(scale) {
  var rocket = gameState.rocket;
  ctx.translate(gameWidth / 2, gameHeight / 2);
  ctx.rotate(gameState.rocket.dir);
  ctx.beginPath();
  ctx.moveTo(0, -20 * scale);
  ctx.lineTo(10 * scale, 10 * scale);
  ctx.lineTo(-10 * scale, 10 * scale);
  ctx.lineTo(0, -20 * scale);
  ctx.rotate(-1 * gameState.rocket.dir);
  ctx.moveTo(0, 0);
  ctx.lineTo(rocket.velocity.x, rocket.velocity.y);
  ctx.stroke();
}

// function drawCloud(x,y) {
//   ctx.strokeRect(x,y, 20, 20);
// }

function drawCircle(x, y, radius, scale) {
  resetTransform();
  ctx.translate(gameWidth / 2, gameHeight / 2);
  ctx.translate(scale * (gameState.rocket.x * -1 + x), scale * (gameState.rocket.y * -1 + y));
  var i;
  var seg = 2 * Math.PI / 100;
  ctx.strokeStyle="#ff0000";
  for (i=0; i < 2*Math.PI; i+=seg) {
    if (ctx.strokeStyle == "#ff0000") {
      ctx.strokeStyle="#000000";
    } else {
      ctx.strokeStyle="#ff0000";
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * scale, i, i + seg);
    ctx.stroke();
  }
  ctx.strokeStyle="#000000"
}

function fixSize() {
  $("#main").width($("#mainDiv").width());
  $("#main").height($("#mainDiv").height);
}

$(start);
