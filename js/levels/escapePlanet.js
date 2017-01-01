var altitudeGoal = 13000;
var EscapePlanet = function() {
  Level.call(this);
  var planetRadius = 1000;
  var minimus = new Planet("Minimus", 0, 0, planetRadius, 1.5 * Math.pow(10, 17));
  minimus.angularVelocity = -Math.PI * 2 / 60;
  this.setupPlanetsMoons([minimus], []);
  this.rocket.x = planetRadius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 9;
};
EscapePlanet.prototype = Object.create(Level.prototype);
EscapePlanet.prototype.start = function() {
  message("Ascend to " + altitudeGoal / 1000 + "km");
}
EscapePlanet.prototype.goalComplete = function() {
  return false;
}
