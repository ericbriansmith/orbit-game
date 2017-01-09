var Body = function(name, radius, mass) {
  this.name = name;
  this.radius = radius;
  this.mass = mass;
  this.velocity = {x: 0, y: 0};
  this.direction = 0; //planets should rotate counterclockwise
  this.angularVelocity = 0; // in radians per second
  this.surfaceVelocity = 0;
  this.rocketDistanceResult = {
    distToCenter: 0,
    distance: 0,
    xToCenter: 0,
    yToCenter: 0
  };
}

function OritingBody(name,altitude,radius,mass,planet) {
  Body.call(this, name, radius, mass);
  this.planet = planet;
  this.x = planet.radius + altitude;
  this.y = planet.y;
  var xVel = 0;
  var yVel = -Math.sqrt(g * planet.mass / this.x);
  this.velocity =  { x: xVel, y: yVel };
}
OritingBody.prototype = Object.create(Body.prototype);
OritingBody.prototype.move = function(time) {
  this.x += this.velocity.x * time;
  this.y += this.velocity.y * time;
  var distanceResult = getDistanceToBodySurface(this.x, this.y, this.planet);

  var accel = gravityAcceleration(this.planet.mass, distanceResult.distToCenter);
  this.velocity.x -= distanceResult.xUnit * accel * time;
  this.velocity.y -= distanceResult.yUnit * accel * time;
}

function Moon (name,altitude,radius,mass,planet) {
  OritingBody.call(this, name, altitude, radius, mass, planet);
}
Moon.prototype = Object.create(OritingBody.prototype);

function Satellite (name, altitude, planet) {
  OritingBody.call(this, name, altitude, 0, 0, planet);
}
Satellite.prototype = Object.create(OritingBody.prototype);

function Planet (name,radius,mass) {
  Body.call(this, name, radius, mass);
  this.x=0;
  this.y=0;
  this.move = function(time) {
    this.direction += this.angularVelocity * time;
  };
  this.calculateSurfaceVelocity = function() {
    this.surfaceVelocity = this.angularVelocity * this.radius;
  };
}
Planet.prototype = Object.create(Body.prototype);

function Minimus() {
  Planet.call(this, "Minimus", 1000, 1.5 * Math.pow(10, 17));
}
Minimus.prototype = Object.create(Planet.prototype);
Minimus.prototype.initAngularVelocity = function() {
  this.angularVelocity = -Math.PI * 2 / 120;
}

function Earth() {
  Planet.call(this, "Earth", 6371390, 5.97 * Math.pow(10, 24));
  this.angularVelocity = -7.2921159 * Math.pow(10, -5);
}
Earth.prototype = Object.create(Planet.prototype);
