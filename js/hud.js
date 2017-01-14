function drawStatus(tick) {
  var nearestBody = gameState.rocket.nearestBody;

  var nameValuePairs = [];
  nameValuePairs.push({name: "Fuel", value: Math.round(gameState.rocket.fuel * 100) / 100});
  var velocity = gameState.rocket.relativeVelocityNearest.total;
  var nearestBodyName = gameState.rocket.nearestBody.name;
  if (gameState.rocket.collided) {
    velocity = 0;
  }
  nameValuePairs.push({name: "Velocity (" + nearestBodyName + ")", value: metersOrKm(velocity, "/s")});
  nameValuePairs.push({name: "Speed to hold orbit", value: metersOrKm(speedToKeepOrbit, "/s")});
  nameValuePairs.push({name: "Altitude (" + nearestBodyName + ")", value: metersOrKm(gameState.rocket.nearestBody.rocketDistanceResult.distance, "")});
  nameValuePairs.push({name: "Time stretch", value: gameState.timeScale});
  nameValuePairs.push({name: "Approach Speed", value: metersOrKm(gameState.rocket.approachPlanetSpeed, "/s")});
  nameValuePairs.push({name: "Tangent Speed", value: metersOrKm(gameState.rocket.planetTangentSpeed, "/s")});
  var dirStr = Math.floor(gameState.rocket.nearestBody.rocketDistanceResult.direction * 180 / Math.PI);
  nameValuePairs.push({name: "Direction", value: dirStr});
  nameValuePairs.push({name: "fps", value: Math.floor(1/tick)});
  drawHud(nameValuePairs);
}

function drawHud(nameValuePairs) {
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.fillStyle = colors.text;

  ctx.font = "15px Arial";
  var lineJump = 20;
  var textX = 2;
  var index = lineJump;
  for (i=0; i < nameValuePairs.length; i++) {
    ctx.fillText(nameValuePairs[i].name + ": " + nameValuePairs[i].value, textX, index);
    index += lineJump;
  }
}
