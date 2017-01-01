var altitudeGoal = 13000;
var EscapePlanet = function() {
  Level.call(this);
  var planetRadius = 1000;
  this.setupPlanetsMoons([new Planet("Minimus", 0, 0, planetRadius, 1.5 * Math.pow(10, 17))], []);
  this.rocket.x = planetRadius + rocketHeight / 2;
  this.rocket.y = 0;
  this.rocket.fuel = 9;
  this.quartersCompleted = 0; //user needs to complete 4 quarters
  this.travelingClockwise = false;
};
EscapePlanet.prototype = Object.create(Level.prototype);
EscapePlanet.prototype.start = function() {
  message("Ascend to " + altitudeGoal / 1000 + "km");
}
EscapePlanet.prototype.goalComplete = function() {
  //planet center is 0,0
  if (this.quartersCompleted == 0 && gameState.rocket.x < 0) {
    this.quartersCompleted++;
    this.travelingClockwise = gameState.rocket.y < 0; //y down is negative
  } else if (this.quartersCompleted == 1) {
    if (this.travelingClockwise && gameState.rocket.y > 0) {
      this.quartersCompleted++;
    } else if (!this.travelingClockwise && gameState.rocket.y < 0) {
      this.quartersCompleted++;
    }
  } else if (this.quartersCompleted == 2) {
    if (gameState.rocket.x > 0) {
      this.quartersCompleted++;
    }
  } else if (this.quartersCompleted == 3) {
    if (this.travelingClockwise && gameState.rocket.y < 0) {
      this.quartersCompleted++;
    } else if (!this.travelingClockwise && gameState.rocket.y > 0) {
      this.quartersCompleted++;
    }
  }
  return this.quartersCompleted == 4;
}
