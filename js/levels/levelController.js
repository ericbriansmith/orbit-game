var gameState;
var levels = [];
var nextLevelIndex;

function newGame() {
  levels = [new IntroLevel(), new EscapePlanet(), new MinimusMoon(), new LowEarthOrbitLevel(), new EarthLevel()];
  nextLevelIndex = 0;
  nextLevel();
}

function nextLevel() {
  setLevel(nextLevelIndex);
}

function setLevel(levelIndex) {
  gameState = levels[levelIndex];
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
  for (var i=0; i < this.planets.length; i++) {
    this.planets[i].calculateSurfaceVelocity();
  }
  // addLaunchpad(this.planets[0], 0);
}

Level.prototype.start = function() {}

Level.prototype.goalComplete = function() {
  return false;
}
