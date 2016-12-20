
var gameState;
var g = 6.67 * (Math.pow(10, -11)) //gravity


function newGame() {
  gameState = {
    planets: [
      new Planet("Earth", 0, 6371390 * 4, 6371390, 5.97 * Math.pow(10, 24)),
      // new Planet("Mercury", 0, -6371390 * 4, 2439770, 3.285 * Math.pow(10, 23)),
      // new Planet("small", 0, 0, 1000, 1 * Math.pow(10, 17))
    ],
    bodies: [], //all moons and planets
    moons: [],
    rocket: Rocket(),
    input: {spacebar: false, left: false, right: false},
    timeScale: 1,
    zoomMode: 0 //0 for normal, 1 on ship
  };
  // gameState.moons[0] = new Moon("moon", 500, 100, 1 * Math.pow(10, 15), gameState.planets[2]);
  gameState.moons[0] = new Moon("Moon", 385000000 - 6371390, 1737100, 7.3477 * Math.pow(10, 22), gameState.planets[0]);

  gameState.bodies = gameState.planets.concat(gameState.moons);
  addLaunchpad(gameState.planets[0], 0);
}

function addLaunchpad(body, direction) {
  var x = body.radius * Math.cos(direction);
  var y = body.radius * Math.sin(direction);
  body.launchpads[body.launchpads.length] = { x: x, y: y, direction: direction };
}

function getNearestBodyAndCalculateDistances() {
  var idx;
  var min = -1;
  var body;
  var minDistanceResult;
  for (idx=0; idx < gameState.bodies.length; idx ++) {
    var distanceResult = getDistanceToBodySurfaceForRocket(gameState.bodies[idx]);
    gameState.bodies[idx].rocketDistanceResult = distanceResult;
    if (min == -1 || distanceResult.distance < min) {
      body = gameState.bodies[idx];
      min = distanceResult.distance;
    }
  }
  return body;
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
    x: 6371390 + 20,
    y: 6371390 * 4,
    lastX: 0,
    lastY: 0,
    collided: false,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    nearestBody: null,
    fuel: 1000, //seconds of fuel
    velocity: { x: 0, y:0, total: 0 },
    relativeVelocityNearest: { x: 0, y:0, total: 0 },
    maxThrust: 20,
    maxImpactVelocity: 10,
    crashed: false,
    // throttle: 0, //0 to 100
    move: function(time) {
      var nearestBody = getNearestBodyAndCalculateDistances();
      this.nearestBody = nearestBody;
      var nearestBodyDistanceResult = nearestBody.rocketDistanceResult;
      this.calculateRelativeVelocityNearest();
      this.detectCollision();
      var i;
      var accelX=0, accelY=0, accel;
      if (this.collided) {
        //make sure it is at the surface?
      } else {
        //calculate gravity
        for (i=0; i < gameState.bodies.length; i++) {
          accel = gravityAcceleration(gameState.bodies[i].mass, gameState.bodies[i].rocketDistanceResult.distToCenter);
          accelX += gameState.bodies[i].rocketDistanceResult.x * accel * time;
          accelY += gameState.bodies[i].rocketDistanceResult.y * accel * time;
        }
      }

      if (gameState.input.spacebar && this.fuel > 0) {
        this.fuel -= time;
        accelY += Math.cos(this.dir) * this.maxThrust * time;
        accelX -= Math.sin(this.dir) * this.maxThrust * time;
      }
      this.velocity.x -= accelX;
      this.velocity.y -= accelY;
      this.velocity.total = Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2));
      this.x += this.velocity.x * time;
      this.y += this.velocity.y * time;

      if (this.collided) {
        if (this.relativeVelocityNearest.total > 10) {
          console.log(this.relativeVelocityNearest.total);
          this.crashed = true;
        }
        this.velocity = { x: nearestBody.velocity.x, y: nearestBody.velocity.y, total: 0 };
      }

      if (gameState.input.left) {
        this.dir -= this.dirChangeAmount * time;
      } else if (gameState.input.right) {
        this.dir += this.dirChangeAmount * time;
      }
    },
    calculateRelativeVelocityNearest: function() {
      var relativeVelocity = {x: this.velocity.x - this.nearestBody.velocity.x,
                    y: this.velocity.y - this.nearestBody.velocity.y};
      relativeVelocity.total = Math.sqrt(Math.pow(relativeVelocity.x, 2) + Math.pow(relativeVelocity.y, 2));
      this.relativeVelocityNearest = relativeVelocity;
    },
    detectCollision: function() {
      if (this.nearestBody.rocketDistanceResult.distance < 10) {
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
  this.rocketDistanceResult = {
    distToCenter: 0,
    distance: 0
  };
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
  this.rocketDistanceResult = {
    distToCenter: 0,
    distance: 0
  };
  this.velocity = {x: 0, y: 0};
  this.launchpads = [];
  this.radius=radius;
  this.mass=mass;
}

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
