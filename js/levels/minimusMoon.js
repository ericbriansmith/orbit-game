var MinimusMoon = function() {
  Level.call(this);
  var planetRadius = 1000;
  var minimus = new Planet("Minimus", 0, 0, planetRadius, 1.5 * Math.pow(10, 17));
  minimus.angularVelocity = -Math.PI * 2 / 120;
  var moon = new Moon("Moon", 10000, 100, 1 * Math.pow(10, 15), minimus);
  this.setupPlanetsMoons([minimus], [moon]);
  this.rocket.x = planetRadius + rocketHeight / 2 + 20;
  this.rocket.y = 0;
  this.rocket.velocity.y = 0;
  this.rocket.fuel = 14;
  this.travelingClockwise = false;
};
MinimusMoon.prototype = Object.create(Level.prototype);
MinimusMoon.prototype.start = function() {
  message("Small planet with moon.");
}
MinimusMoon.prototype.goalComplete = function() {
  return false;
}
