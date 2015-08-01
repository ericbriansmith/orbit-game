
var gameState;

function newGame() {
  gameState = {
    planets: [
      new Planet("earth", 0, 0, 20903520),
      new Planet("mars", 0, -20903520 * 4, 20903520)
    ],
    rocket: Rocket()
  };
}

function nearestPlanetDistance() {
  var idx;
  var min = -1;
  for (idx=0; idx < gameState.planets.length; idx ++) {
    var dist = getDistanceToPlanetSurface(gameState.planets[idx]);
    if (min == -1 || dist < min) {
      min = dist;
    }
  }
  return min;
}

function getDistanceToPlanetSurface(planet) {
  var xDiff = gameState.rocket.x - planet.x;
  var yDiff = gameState.rocket.y - planet.y;
  var distToCenter = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  return distToCenter - planet.radius;
}

function Rocket() {
  var rocket = {
    x: 0,
    y: -20903530,
    dir: 0,
    velocity: { x: 0, y:-1000000 },
    maxThrust: 100,
    throttle: 0, //0 to 100
    move: function(time) {
      this.x += this.velocity.x * time;
      this.y += this.velocity.y * time;
    }
  };
  return rocket;
}

function Planet (name,x,y,radius) {
  this.name = name;
  this.x=x;
  this.y=y;
  this.radius=radius;
}
