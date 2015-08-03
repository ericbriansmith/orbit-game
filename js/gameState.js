
var gameState;
var gravity = 9.8;

function newGame() {
  gameState = {
    planets: [
      new Planet("earth", 0, 0, 6371390,5.97 * Math.pow(10, 24)),
      new Planet("mars", 0, -6371390 * 4, 6371390, 5.97 * Math.pow(10, 24))
    ],
    rocket: Rocket(),
    input: {spacebar: false, left: false, right: false}
  };
}

function nearestPlanetDistance() {
  var idx;
  var min = -1;
  for (idx=0; idx < gameState.planets.length; idx ++) {
    var dist = getDistanceToPlanetSurface(gameState.planets[idx]).distance;
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
  var distance = distToCenter - planet.radius;

  return { distToCenter: distToCenter, distance: distance, x: xDiff / distToCenter, y: yDiff / distToCenter };
}

function gravityAcceleration(planetMass, distance) {
  var g = 6.67 * (Math.pow(10, -11))
  return (g * planetMass) / Math.pow(distance, 2)
}

function Rocket() {
  var rocket = {
    x: 6371490,
    y: 0,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    velocity: { x: 0, y:-20 },
    maxThrust: 100,
    // throttle: 0, //0 to 100
    move: function(time) {
      this.x += this.velocity.x * time;
      this.y += this.velocity.y * time;
      var distanceResult = getDistanceToPlanetSurface(gameState.planets[0]);
      var accel = gravityAcceleration(gameState.planets[0].mass,distanceResult.distToCenter);
      this.velocity.x -= distanceResult.x * accel * time;
      this.velocity.y -= distanceResult.y * accel * time;
      if (gameState.input.spacebar) {
        this.velocity.y += Math.cos(this.dir) * this.maxThrust * time;
        this.velocity.x += Math.sin(this.dir) * this.maxThrust * time;
      }
      if (gameState.input.left) {
        this.dir -= this.dirChangeAmount * time;
      } else if (gameState.input.right) {
        this.dir += this.dirChangeAmount * time;
      }
    }
  };
  return rocket;
}

function Planet (name,x,y,radius,mass) {
  this.name = name;
  this.x=x;
  this.y=y;
  this.radius=radius;
  this.mass=mass;
}
