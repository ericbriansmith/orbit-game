var MinimusMoon = function() {

};
MinimusMoon.prototype = Object.create(Level.prototype);
MinimusMoon.prototype.start = function() {
  message("Small planet with moon.");
  this.superStart();
  var minimus = new Minimus();
  minimus.initAngularVelocity();
  var moon = new Moon("Moon", 10000, 100, 1 * Math.pow(10, 15), minimus);
  this.setupPlanetsMoons([minimus], [moon], []);
  this.rocket.x = minimus.radius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.velocity.y = 0;
  this.rocket.fuel = 9;
  this.travelingClockwise = false;
}
MinimusMoon.prototype.goalComplete = function() {
  return false;
}
