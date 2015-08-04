
var gameState;
var gravity = 9.8;

function newGame() {
  gameState = {
    planets: [
      new Planet("earth", 0, 0, 5000,40 * Math.pow(10, 18)),
      new Planet("mars", 0, -6371390 * 4, 6371390, 5.97 * Math.pow(10, 24))
    ],
    moons: [],
    rocket: Rocket(),
    input: {spacebar: false, left: false, right: false},
    timeScale: 1,
    zoomMode: 0 //0 for normal, 1 on ship
  };
  gameState.moons[0] = new Moon(10000, 0, 1000, 10, gameState.planets[0]);
}

function nearestPlanetDistance() {
  var idx;
  var min = -1;
  var planet;
  var minDistanceResult;
  for (idx=0; idx < gameState.planets.length; idx ++) {
    var distanceResult = getDistanceToPlanetSurfaceForRocket(gameState.planets[idx]);
    if (min == -1 || distanceResult.distance < min) {
      min = distanceResult.distance;
      planet = gameState.planets[idx];
      minDistanceResult = distanceResult
    }
  }
  return { distanceResult: minDistanceResult, planet: planet };
}

function getDistanceToPlanetSurfaceForRocket(planet) {
  return getDistanceToPlanetSurface(gameState.rocket.x, gameState.rocket.y, planet);
}

function getDistanceToPlanetSurface(x,y,planet) {
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
    x: 10000,
    y: 6000,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    nearestPlanet: null,
    nearestPlanetDistanceResult: null,
    fuel: 100, //seconds of fuel
    velocity: { x: 0, y:0, total: 0 },
    maxThrust: 100,
    // throttle: 0, //0 to 100
    move: function(time) {
      this.x += this.velocity.x * time;
      this.y += this.velocity.y * time;
      var nearestPlanetResult = nearestPlanetDistance();
      this.nearestPlanet = nearestPlanetResult.planet;
      this.nearestPlanetDistanceResult = nearestPlanetResult.distanceResult;
      var accel = gravityAcceleration(this.nearestPlanet.mass, this.nearestPlanetDistanceResult.distToCenter);
      this.velocity.x -= this.nearestPlanetDistanceResult.x * accel * time;
      this.velocity.y -= this.nearestPlanetDistanceResult.y * accel * time;
      if (gameState.input.spacebar && this.fuel > 0) {
        this.fuel -= time;
        this.velocity.y -= Math.cos(this.dir) * this.maxThrust * time;
        this.velocity.x += Math.sin(this.dir) * this.maxThrust * time;
      }
      this.velocity.total = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
      if (gameState.input.left) {
        this.dir -= this.dirChangeAmount * time;
      } else if (gameState.input.right) {
        this.dir += this.dirChangeAmount * time;
      }
    }
  };
  return rocket;
}

function Moon (x,y,radius,mass,planet) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.mass = mass;
  this.planet = planet;
  this.velocity =  { x: 0, y: 0 };
  this.move = function(time) {
    this.x += this.velocity.x * time;
    this.y += this.velocity.y * time;
    var distanceResult = getDistanceToPlanetSurface(this.x, this.y, this.planet);

    var accel = gravityAcceleration(this.planet.mass, distanceResult.distToCenter);
    this.velocity.x -= distanceResult.x * accel * time;
    this.velocity.y -= distanceResult.y * accel * time;
  };
}

function Planet (name,x,y,radius,mass) {
  this.name = name;
  this.x=x;
  this.y=y;
  this.radius=radius;
  this.mass=mass;
}
