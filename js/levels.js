var gameState;
var levels = [];
var nextLevelIndex;

function newGame() {
  levels = [new IntroLevel(), new LowEarthOrbitLevel()];
  nextLevelIndex = 0;
  nextLevel();
}

function nextLevel() {
  gameState = levels[nextLevelIndex];
  gameState.start();
  nextLevelIndex++;
}

var Level = function() {
  this.planets = [];
  this.bodies = []; //all moons and planets
  this.moons = [];
  this.rocket = Rocket(0, 0);
  this.input = {spacebar: false, left: false, right: false};
  this.inputMuted = false;
  this.timeScale = 1;
  this.zoomMode = 1; //0 for normal, 1 on ship
};

Level.prototype.setupPlanetsMoons = function(planets, moons) {
  this.planets = planets;
  this.moons = moons;
  this.bodies = this.planets.concat(this.moons);
  // addLaunchpad(this.planets[0], 0);
}

Level.prototype.start = function() {}

Level.prototype.goalComplete = function() {
  return false;
}

var IntroLevel = function() {
  Level.call(this);
  this.setupPlanetsMoons([new Planet("Minimus", 0, 0, 1000, 1 * Math.pow(10, 17))], []);
  this.rocket.x = 1010;
  this.rocket.y = 0;
  this.quartersCompleted = 0; //user needs to complete 4 quarters
  this.travelingClockwise = false;
};
IntroLevel.prototype = Object.create(Level.prototype);
IntroLevel.prototype.start = function() {
  message("Small planet. Complete an orbit.");
}
IntroLevel.prototype.goalComplete = function() {
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

var LowEarthOrbitLevel = function() {
  Level.call(this);
  var earth = new Planet("Earth", 0, 0, 6371390, 5.97 * Math.pow(10, 24));
  this.rocket.x = 6371390 + 160000;
  this.rocket.y = 0;
  this.rocket.velocity.y = 7808;
  this.setupPlanetsMoons([earth], [new Moon("Moon", 385000000, 1737100, 7.3477 * Math.pow(10, 22), earth)]);
};

LowEarthOrbitLevel.prototype = Object.create(Level.prototype);

LowEarthOrbitLevel.prototype.start = function() {
  message("You are now in low earth orbit.");
}
