const NUM_POLYGONS = 15;
let rotateClickPos = false;
let polygons = [],
  selectedPolygon,
  hull,
  bg;

const debug = {
  hArea: document.querySelector("#area"),
  pArea: document.querySelector("#polygons"),
  efficiency: document.querySelector("#efficiency"),
};

function setup() {
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  noStroke();
  addRocks(NUM_POLYGONS, width / 2, height / 2, min(height, width) / 2);
  hull = new Hull(polygons);
}

function addRocks(num = NUM_POLYGONS) {
  let buffer = 50;
  let failedAttempts = 0;
  for (let i = 0; i < num; ) {
    let pos = createVector(random(buffer,width-buffer), random(buffer,height-buffer));
    let newRock = new Rock(pos);
    if (!newRock.checkOverlap(polygons)) {
      polygons.push(newRock);
      i++;
    } else {
      failedAttempts++;
      if (failedAttempts > 50) return;
    }
  }
}

function draw() {
  background(240, 5, 95);
  selectedPolygon && selectedPolygon.move();
  // draw base polygons
  polygons.forEach((poly) => poly.draw());
  // draw overlapping overlay
  let overlapping = selectedPolygon && selectedPolygon.checkOverlap(polygons);
  overlapping && overlapping.forEach((item) => item.drawPoints(item.overlapColor));

  hull.draw();

  debug.hArea.textContent = `Area: ${Math.round(hull.area / 1000)}`;
  let pArea = polygons.map((poly) => poly.area).reduce((a, b) => a + b, 0);
  debug.pArea.textContent = `Poly Area: ${Math.round(pArea / 1000)}`;
  debug.efficiency.textContent = `Efficiency: ${((pArea / hull.area) * 100).toFixed(0)}%`;
}
function mousePressed() {
  if (selectedPolygon) {
    // if legal, drop
    if (!selectedPolygon.checkOverlap(polygons)) {
      selectedPolygon = null;
      hull.update(polygons);
    }
  } else {
    for (let poly of polygons) {
      if (collidePointPoly(mouseX, mouseY, poly.vertices)) {
        selectedPolygon = poly;
        poly.clickCenter = createVector(mouseX,mouseY)
        break;
      }
    }
  }
}
function mouseWheel(event) {
  if (!selectedPolygon) return false;
  const MAX_SPEED = 200;
  let angle = constrain(event.delta, -MAX_SPEED, MAX_SPEED);
  let isFine = keyIsDown(91); //command key
  let scalar = isFine ? 0.0005 : 0.003;
  selectedPolygon.rotate(angle * scalar);
  return false;
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
