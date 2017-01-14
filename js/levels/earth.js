
var EarthLevel = function() {

};

EarthLevel.prototype = Object.create(Level.prototype);

EarthLevel.prototype.start = function() {
  message("You are on earth.");
  this.superStart();
  var earth = new Earth();
  this.rocket.x = earth.radius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 1000;
  this.setupPlanetsMoons([earth], [new Moon("Moon", 385000000, 1737100, 7.3477 * Math.pow(10, 22), earth)], []);
};

EarthLevel.prototype.goalComplete = function() {

};
