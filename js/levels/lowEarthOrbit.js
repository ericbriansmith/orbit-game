
var LowEarthOrbitLevel = function() {
  Level.call(this);
  var earth = new Planet("Earth", 0, 0, 6371390, 5.97 * Math.pow(10, 24));
  this.rocket.x = 6371390 + 160000;
  this.rocket.y = 0;
  this.rocket.velocity.y = 7808;
  this.setupPlanetsMoons([earth], [new Moon("Moon", 385000000, 1737100, 7.3477 * Math.pow(10, 22), earth)]);
};

LowEarthOrbitLevel.prototype = Object.create(Level.prototype);

LowEarthOrbitLevel.prototype.start = function() {
  message("You are now in low earth orbit.");
}

LowEarthOrbitLevel.prototype.goalComplete = function() {
  
}
