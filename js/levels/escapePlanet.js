var altitudeGoal = 800;
var EscapePlanet = function() {
  Level.call(this);
  var planetRadius = 1000;
  var minimus = new Planet("Minimus", 0, 0, planetRadius, 1.5 * Math.pow(10, 17));
  minimus.angularVelocity = -Math.PI * 2 / 120;
  this.setupPlanetsMoons([minimus], []);
  this.rocket.x = planetRadius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 4;
};
EscapePlanet.prototype = Object.create(Level.prototype);
EscapePlanet.prototype.start = function() {
  message("Ascend to " + altitudeGoal + "m");
}
EscapePlanet.prototype.goalComplete = function() {
  return this.rocket.nearestBody.rocketDistanceResult.distance > altitudeGoal;
}
