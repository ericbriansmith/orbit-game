
var Earth = function() {
  Level.call(this);
  var earth = new Planet("Earth", 0, 0, 6371390, 5.97 * Math.pow(10, 24));
  earth.angularVelocity = 7.2921159 * Math.pow(10, -5);
  this.rocket.x = 6371390 + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 1000;
  this.setupPlanetsMoons([earth], [new Moon("Moon", 385000000, 1737100, 7.3477 * Math.pow(10, 22), earth)]);
};

Earth.prototype = Object.create(Level.prototype);

Earth.prototype.start = function() {
  message("You are on earth.");
}

Earth.prototype.goalComplete = function() {

}
