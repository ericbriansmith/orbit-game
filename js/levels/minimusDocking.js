var MinimusDocking = function() {
  Level.call(this);
  var minimus = new Minimus();
  var spaceStation = new Satellite("Space Station", 800, minimus);
  minimus.initAngularVelocity();
  this.setupPlanetsMoons([minimus], [], [spaceStation]);
  this.rocket.x = minimus.radius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 100;
};
MinimusDocking.prototype = Object.create(Level.prototype);
MinimusDocking.prototype.start = function() {
  message("Dock with the space station");
}
MinimusDocking.prototype.goalComplete = function() {
  return false;
}