
var gameState;
var g = 6.67 * (Math.pow(10, -11))

function newGame() {
  gameState = {
    planets: [
      new Planet("earth", 0, 0, 6371390, 5.97 * Math.pow(10, 24)),
      new Planet("mars", 0, -6371390 * 4, 6371390, 5.97 * Math.pow(10, 24))
    ],
    bodies: [], //all moons and planets
    moons: [],
    rocket: Rocket(),
    input: {spacebar: false, left: false, right: false},
    timeScale: 1,
    zoomMode: 0 //0 for normal, 1 on ship
  };
  var orbit = Math.sqrt(g * gameState.planets[0].mass / 10000);
  gameState.moons[0] = new Moon(10000, 0, 0, orbit, 1000, 10, gameState.planets[0]);

  gameState.bodies = gameState.planets.concat(gameState.moons);
  addLaunchpad(gameState.planets[0], 0);
}

function addLaunchpad(body, direction) {
  var x = body.radius * Math.cos(direction);
  var y = body.radius * Math.sin(direction);
  body.launchpads[body.launchpads.length] = { x: x, y: y, direction: direction };
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
  var xDiff = x - planet.x;
  var yDiff = y - planet.y;
  var distToCenter = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  var distance = distToCenter - planet.radius;

  return { distToCenter: distToCenter, distance: distance, x: xDiff / distToCenter, y: yDiff / distToCenter };
}

function gravityAcceleration(planetMass, distance) {
  return (g * planetMass) / Math.pow(distance, 2)
}

function Rocket() {
  var rocket = {
    x: 6371390 + 20,
    y: 0,
    lastX: 0,
    lastY: 0,
    collided: false,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    nearestPlanet: null,
    nearestPlanetDistanceResult: null,
    fuel: 500, //seconds of fuel
    velocity: { x: 0, y:0, total: 0 },
    maxThrust: 100,
    maxImpactVelocity: 10,
    crashed: false,
    // throttle: 0, //0 to 100
    move: function(time) {
      var nearestPlanetResult = nearestPlanetDistance();
      this.nearestPlanet = nearestPlanetResult.planet;
      this.nearestPlanetDistanceResult = nearestPlanetResult.distanceResult;
      this.detectCollision();
      if (this.collided) {
        if (this.velocity.total > 10) {
          console.log(this.velocity.total);
          this.crashed = true;
        }
        this.velocity = {x: 0, y: 0, total: 0};
        this.x = this.lastX;
        this.y = this.lastY;
      }
      var accel = gravityAcceleration(this.nearestPlanet.mass, this.nearestPlanetDistanceResult.distToCenter);
      var accelX = this.nearestPlanetDistanceResult.x * accel * time;
      var accelY = this.nearestPlanetDistanceResult.y * accel * time;

      if (gameState.input.spacebar && this.fuel > 0) {
        this.fuel -= time;
        accelY += Math.cos(this.dir) * this.maxThrust * time;
        accelX -= Math.sin(this.dir) * this.maxThrust * time;
      }
      this.velocity.x -= accelX;
      this.velocity.y -= accelY;
      this.velocity.total = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
      this.lastX = this.x;
      this.lastY = this.y;
      this.x += this.velocity.x * time;
      this.y += this.velocity.y * time;
      if (gameState.input.left) {
        this.dir -= this.dirChangeAmount * time;
      } else if (gameState.input.right) {
        this.dir += this.dirChangeAmount * time;
      }
    },
    detectCollision: function() {
      if (this.nearestPlanetDistanceResult.distance < 10) {
        this.collided = true;
      } else {
        this.collided = false;
      }
    }
  };
  return rocket;
}

function Moon (x,y,xVel,yVel,radius,mass,planet) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.mass = mass;
  this.launchpads = [];
  this.planet = planet;
  this.velocity =  { x: xVel, y: yVel };
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
  this.launchpads = [];
  this.radius=radius;
  this.mass=mass;
}
