var altitudeGoal = 800;
var EscapePlanet = function() {
  Level.call(this);
  var minimus = new Minimus();
  minimus.initAngularVelocity();
  this.setupPlanetsMoons([minimus], []);
  this.rocket.x = minimus.radius + rocketHeight / 2;
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
