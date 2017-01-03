
var g = 6.67 * (Math.pow(10, -11)) //gravity

function addLaunchpad(body, direction) {
  var x = body.radius * Math.cos(direction);
  var y = body.radius * Math.sin(direction);
  body.launchpads[body.launchpads.length] = { x: x, y: y, direction: direction };
}

function getDistanceToBodySurfaceForRocket(body) {
  return getDistanceToBodySurface(gameState.rocket.x, gameState.rocket.y, body);
}

function getDistanceToBodySurface(x,y,body) {
  var xDiff = x - body.x;
  var yDiff = y - body.y;
  var distToCenter = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
  var distance = distToCenter - body.radius;

  return { distToCenter: distToCenter, distance: distance,
    xUnit: xDiff / distToCenter, yUnit: yDiff / distToCenter,
    xToCenter: xDiff, yToCenter: yDiff };
}

function gravityAcceleration(bodyMass, distance) {
  return (g * bodyMass) / Math.pow(distance, 2)
}

var rocketHeight = 20;
function Rocket(startX, startY) {
  var rocket = {
    x: startX,
    y: startY,
    lastX: 0,
    lastY: 0,
    collided: false,
    dir: Math.PI / 2,
    dirChangeAmount: 1,
    nearestBody: null,
    farthestBody: null,
    fuel: 0, //seconds of fuel
    velocity: { x: 0, y:0, total: 0 },
    relativeVelocityNearest: { x: 0, y:0, total: 0 },
    maxThrust: 20,
    maxImpactVelocity: 10,
    crashed: false,
    // throttle: 0, //0 to 100
    move: function(time) {
      this.getNearestBodyAndCalculateDistances();
      var nearestBody = this.nearestBody;
      var nearestBodyDistanceResult = this.nearestBody.rocketDistanceResult;
      this.calculateRelativeVelocityNearest();
      this.detectCollision();
      var i;
      var accelX=0, accelY=0, accel;
      if (this.collided) {
        var correctionRatio = (nearestBody.radius + rocketHeight / 2)  / nearestBodyDistanceResult.distToCenter
        this.x = nearestBody.x + nearestBodyDistanceResult.xToCenter * correctionRatio;
        this.y = nearestBody.y + nearestBodyDistanceResult.yToCenter * correctionRatio;
        this.velocity.x = nearestBody.velocity.x;
        this.velocity.y = nearestBody.velocity.y;
        var tangentToBodyUnit = rotate90CounterClockwise({x: nearestBodyDistanceResult.xUnit, y: nearestBodyDistanceResult.yUnit});
        var tangentVelocity = vectorMult(tangentToBodyUnit, nearestBody.surfaceVelocity);
        this.velocity = vectorAdd(this.velocity, tangentVelocity);
      } else {
        //calculate gravity
        for (i=0; i < gameState.bodies.length; i++) {
          accel = gravityAcceleration(gameState.bodies[i].mass, gameState.bodies[i].rocketDistanceResult.distToCenter);
          accelX += gameState.bodies[i].rocketDistanceResult.xUnit * accel * time;
          accelY += gameState.bodies[i].rocketDistanceResult.yUnit * accel * time;
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

      if (this.collided && 1==2) {//TODO: crashing
        if (this.relativeVelocityNearest.total > 10) {
          this.crashed = true;
          message("You have crashed");
        }
        this.velocity = { x: nearestBody.velocity.x, y: nearestBody.velocity.y, total: 0 };
      }

      if (gameState.input.left) {
        this.dir -= this.dirChangeAmount * time;
      } else if (gameState.input.right) {
        this.dir += this.dirChangeAmount * time;
      }
    },
    getNearestBodyAndCalculateDistances: function() {
      var min = -1;
      var max = -1;
      var nearestBody;
      var farthestBody;
      for (idx=0; idx < gameState.bodies.length; idx ++) {
        var distanceResult = getDistanceToBodySurfaceForRocket(gameState.bodies[idx]);
        gameState.bodies[idx].rocketDistanceResult = distanceResult;
        if (min == -1 || distanceResult.distance < min) {
          nearestBody = gameState.bodies[idx];
          min = distanceResult.distance;
        }
        if (max == -1 || distanceResult.distance > max) {
          farthestBody = gameState.bodies[idx];
          max = distanceResult.distance;
        }
      }
      this.nearestBody = nearestBody;
      this.farthestBody = farthestBody;
    },
    calculateRelativeVelocityNearest: function() {
      var relativePositionVector = {x: this.nearestBody.x - this.x, y: this.nearestBody.y - this.y};

      var relativeVelocity = {x: this.velocity.x - this.nearestBody.velocity.x,
                    y: this.velocity.y - this.nearestBody.velocity.y};
      this.approachPlanetSpeed = projectVector(relativeVelocity, relativePositionVector);
      this.planetTangentSpeed = projectVector(relativeVelocity, rotate90CounterClockwise(relativePositionVector));
      relativeVelocity.total = Math.sqrt(Math.pow(relativeVelocity.x, 2) + Math.pow(relativeVelocity.y, 2));
      this.relativeVelocityNearest = relativeVelocity;
    },
    detectCollision: function() {
      if (this.nearestBody.rocketDistanceResult.distance < rocketHeight / 2) {
        this.collided = true;
      } else {
        this.collided = false;
      }
    }
  };
  return rocket;
}

function vectorAdd(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function vectorMult(v, s) {
  return {x: v.x * s, y: v.y * s};
}

//project vector a onto vector b
function projectVector(a, b) {
  var bMag = Math.sqrt(Math.pow(b.x, 2) + Math.pow(b.y, 2));
  var unitB = {x: b.x / bMag, y: b.y / bMag};
  return a.x * unitB.x + a.y * unitB.y;
}

function unitVector(v) {
  var mag = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
  return {x: v.x / mag, y: v.y / mag};
}

function rotate90CounterClockwise(vector) {
  return {x: -vector.y, y: vector.x};
}

function Moon (name,altitude,radius,mass,planet) {
  this.name = name;
  this.x = planet.radius + altitude;
  this.y = planet.y;
  this.radius = radius;
  this.mass = mass;
  this.rocketDistanceResult = {
    distToCenter: 0,
    distance: 0,
    xToCenter: 0,
    yToCenter: 0
  };
  this.launchpads = [];
  this.planet = planet;
  this.direction = 0;
  var xVel = 0;
  var yVel = Math.sqrt(g * planet.mass / this.x);
  this.velocity =  { x: xVel, y: yVel };
  this.move = function(time) {
    this.x += this.velocity.x * time;
    this.y += this.velocity.y * time;
    var distanceResult = getDistanceToBodySurface(this.x, this.y, this.planet);

    var accel = gravityAcceleration(this.planet.mass, distanceResult.distToCenter);
    this.velocity.x -= distanceResult.xUnit * accel * time;
    this.velocity.y -= distanceResult.yUnit * accel * time;
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
  this.direction = 0; //planet rotates counterclockwise
  this.angularVelocity = 0; // in radians per second
  this.surfaceVelocity = 0;
  this.launchpads = [];
  this.radius = radius;
  this.mass = mass;
  this.move = function(time) {
    this.direction += this.angularVelocity * time;
  };
  this.calculateSurfaceVelocity = function() {
    this.surfaceVelocity = this.angularVelocity * this.radius;
  };
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
