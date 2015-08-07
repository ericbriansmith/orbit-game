
var gameState;
var g = 6.67 * (Math.pow(10, -11))


function newGame() {
  gameState = {
    planets: [
      new Planet("Earth", 0, 6371390 * 4, 6371390, 5.97 * Math.pow(10, 24)),
      new Planet("Mercury", 0, -6371390 * 4, 2439770, 3.285 * Math.pow(10, 23)),
      new Planet("small", 0, 0, 1000, 1 * Math.pow(10, 17))
    ],
    bodies: [], //all moons and planets
    moons: [],
    rocket: Rocket(),
    input: {spacebar: false, left: false, right: false},
    timeScale: 1,
    zoomMode: 0 //0 for normal, 1 on ship
  };
  gameState.moons[0] = new Moon("moon", 500, 100, 1 * Math.pow(10, 16), gameState.planets[2]);

  gameState.bodies = gameState.planets.concat(gameState.moons);
  addLaunchpad(gameState.planets[0], 0);
}

function addLaunchpad(body, direction) {
  var x = body.radius * Math.cos(direction);
  var y = body.radius * Math.sin(direction);
  body.launchpads[body.launchpads.length] = { x: x, y: y, direction: direction };
}

function nearestBodyDistance() {
  var idx;
  var min = -1;
  var body;
  var minDistanceResult;
  for (idx=0; idx < gameState.bodies.length; idx ++) {
    var distanceResult = getDistanceToBodySurfaceForRocket(gameState.bodies[idx]);
    if (min == -1 || distanceResult.distance < min) {
      min = distanceResult.distance;
      body = gameState.bodies[idx];
      minDistanceResult = distanceResult;
    }
  }
  return { distanceResult: minDistanceResult, body: body };
}

function getDistanceToBodySurfaceForRocket(body) {
  return getDistanceToBodySurface(gameState.rocket.x, gameState.rocket.y, body);
}

function getDistanceToBodySurface(x,y,body) {
  var xDiff = x - body.x;
  var yDiff = y - body.y;
  var distToCenter = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  var distance = distToCenter - body.radius;

  return { distToCenter: distToCenter, distance: distance, x: xDiff / distToCenter, y: yDiff / distToCenter };
}

function gravityAcceleration(bodyMass, distance) {
  return (g * bodyMass) / Math.pow(distance, 2)
}

function Rocket() {
  var rocket = {
    x: 1000 + 10,
    y: 0,
    lastX: 0,
    lastY: 0,
    collided: false,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    nearestBody: null,
    nearestBodyDistanceResult: null,
    fuel: 1000, //seconds of fuel
    velocity: { x: 0, y:0, total: 0 },
    maxThrust: 20,
    maxImpactVelocity: 10,
    crashed: false,
    // throttle: 0, //0 to 100
    move: function(time) {
      var nearestBodyResult = nearestBodyDistance();
      this.nearestBody = nearestBodyResult.body;
      this.nearestBodyDistanceResult = nearestBodyResult.distanceResult;
      this.detectCollision();
      if (this.collided) {
        var relativeVelocity = {x: this.velocity.x - this.nearestBody.velocity.x,
                      y: this.velocity.y - this.nearestBody.velocity.y};
        relativeVelocity.total = Math.sqrt(Math.pow(relativeVelocity.x, 2) + Math.pow(relativeVelocity.y, 2));
        if (relativeVelocity.total > 10) {
          console.log(this.velocity.total);
          this.crashed = true;
        }
        this.velocity = {x: 0, y: 0, total: 0};
        this.x = this.lastX;
        this.y = this.lastY;
      }
      //TODO: get force from all or multiple bodies
      var accel = gravityAcceleration(this.nearestBody.mass, this.nearestBodyDistanceResult.distToCenter);
      var accelX = this.nearestBodyDistanceResult.x * accel * time;
      var accelY = this.nearestBodyDistanceResult.y * accel * time;

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
      if (this.nearestBodyDistanceResult.distance < 10) {
        this.collided = true;
      } else {
        this.collided = false;
      }
    }
  };
  return rocket;
}

function Moon (name,altitude,radius,mass,planet) {
  this.name = name;
  this.x = planet.radius + altitude;
  this.y = planet.y;
  this.radius = radius;
  this.mass = mass;
  this.launchpads = [];
  this.planet = planet;
  var xVel = 0;
  var yVel = Math.sqrt(g * planet.mass / this.x);
  this.velocity =  { x: xVel, y: yVel };
  this.move = function(time) {
    this.x += this.velocity.x * time;
    this.y += this.velocity.y * time;
    var distanceResult = getDistanceToBodySurface(this.x, this.y, this.planet);

    var accel = gravityAcceleration(this.planet.mass, distanceResult.distToCenter);
    this.velocity.x -= distanceResult.x * accel * time;
    this.velocity.y -= distanceResult.y * accel * time;
  };
}

function Planet (name,x,y,radius,mass) {
  this.name = name;
  this.x=x;
  this.y=y;
  this.velocity = {x: 0, y: 0};
  this.launchpads = [];
  this.radius=radius;
  this.mass=mass;
}
