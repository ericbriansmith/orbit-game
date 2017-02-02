
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
  var dir = getAngleFromCartesian(xDiff, yDiff);

  return { distToCenter: distToCenter, distance: distance,
    xUnit: xDiff / distToCenter, yUnit: yDiff / distToCenter,
    xToCenter: xDiff, yToCenter: yDiff, direction: dir };
}

function getAngleFromCartesian(x, y) {
  var dir = Math.atan(y / x);
  if (x < 0) {
    return dir + Math.PI;
  } else if (y < 0) {
    return dir + 2 * Math.PI;
  }
  return dir;
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
    crashed: false,
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
        if (nearestBody instanceof Planet) {
          this.dir += nearestBody.angularVelocity * time;
        }
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
    firstCollisionCheck: true,
    detectCollision: function() {
      var threshold = 1; //plus one when space is not pressed to avoid flickers
      if (gameState.input.spacebar) {
        threshold = 0;
      }
      if (this.nearestBody.rocketDistanceResult.distance < rocketHeight / 2 + threshold) {
        if (!this.collided && !this.firstCollisionCheck) {
          var tangentGroundSpeed = -this.planetTangentSpeed - this.nearestBody.surfaceVelocity;
          console.log("collided. approach=" + this.approachPlanetSpeed + ", tangentGroundSpeed=" + tangentGroundSpeed);
          if (this.approachPlanetSpeed > 10 || tangentGroundSpeed > 5) {
            this.crashed = true;
          }
        }
        this.collided = true;
      } else {
        this.collided = false;
      }
      this.firstCollisionCheck = false;
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
