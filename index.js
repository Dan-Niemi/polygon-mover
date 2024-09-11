const NUM_POLYGONS = 10;


let polygons = [],
  rotateClickPos = false,
  selectedPolygon,
  hull,
  debug

function setup() {
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  noStroke();
  addRocks(NUM_POLYGONS, width / 2, height / 2, min(height, width) / 2);
  hull = new Hull(polygons);
  debug = new Debug(document.querySelector('.debug'))
}

function addRocks(num = NUM_POLYGONS) {
  let margin = 50;
  let failedAttempts = 0;
  for (let i = 0; i < num; ) {
    let pos = createVector(random(margin, width - margin), random(margin, height - margin));
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
  debug.update()

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
        poly.clickCenter = createVector(mouseX, mouseY);
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
