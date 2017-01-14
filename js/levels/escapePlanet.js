var altitudeGoal = 800;
var EscapePlanet = function() {

};
EscapePlanet.prototype = Object.create(Level.prototype);
EscapePlanet.prototype.start = function() {
  message("Ascend to " + altitudeGoal + "m");
  this.superStart();
  var minimus = new Minimus();
  minimus.initAngularVelocity();
  this.setupPlanetsMoons([minimus], [], []);
  this.rocket.x = minimus.radius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 4;
}
EscapePlanet.prototype.goalComplete = function() {
  return this.rocket.nearestBody.rocketDistanceResult.distance > altitudeGoal;
}
