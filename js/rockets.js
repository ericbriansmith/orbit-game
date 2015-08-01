var ctx;
var canvas;
var gameWidth = 800;
var gameHeight = 800;
var lastTime;
var planetPeek = 50;

function start() {
  canvas = $("#main")[0];
  newGame();
  lastTime = new Date().getTime();
  ctx = canvas.getContext("2d");
  update();
}

function update() {
  resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var now = new Date().getTime();
  var timeDiff = now - lastTime;
  lastTime = now;
  gameState.rocket.move(timeDiff/1000);
  drawState();
  setTimeout(update, 1000/30);
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawState() {
  ctx.translate(gameWidth / 2, gameHeight / 2);
  ctx.rotate(gameState.rocket.dir*Math.PI/180);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(10, 10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, -20);
  ctx.stroke();
  ctx.rotate(gameState.rocket.dir*Math.PI/-180);
  var scale = (gameHeight / 2 - planetPeek) / nearestPlanetDistance();
  if (scale > 1) {
    scale = 1;
  }
  var index
  for (index=0; index < gameState.planets.length; index++) {
    resetTransform();
    var planet = gameState.planets[index];

    ctx.translate(gameWidth / 2, gameHeight / 2);
    ctx.translate(scale * (gameState.rocket.x * -1 + planet.x), scale * (gameState.rocket.y * -1 + planet.y));
    drawCircle(0, 0, planet.radius * scale);
  }
}

function drawCircle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x,y,radius,0,2*Math.PI);
  ctx.stroke();
}

function fixSize() {
  $("#main").width($("#mainDiv").width());
  $("#main").height($("#mainDiv").height);
}

$(start);
