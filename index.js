const NUM_POLYGONS = 15;
const POLYGON_MIN_SIZE = 40;
const POLYGON_MAX_SIZE = 100;
const FIELD_RADIUS = 400;

let polygons = [];
let selectedPolygon = null;
let hull = null;

const debug = {
  hArea: document.querySelector("#area"),
  pArea: document.querySelector("#polygons"),
  efficiency: document.querySelector("#efficiency"),
};

function setup() {
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  let attempts = 0;
  let cx = width / 2;
  let cy = height / 2;
  while (polygons.length < NUM_POLYGONS && attempts < 1000) {
    let pos = createVector(random(cx - FIELD_RADIUS, cx + FIELD_RADIUS), random(cy - FIELD_RADIUS, cy + FIELD_RADIUS));
    let newRock = new Rock(pos);
    if (!newRock.checkOverlap(polygons)) {
      polygons.push(newRock);
    }
    attempts++;
  }
  hull = new Hull(polygons);
}

function draw() {
  if (selectedPolygon) {
    selectedPolygon.move();
  }
  background(240, 5, 95);
  // draw polygons
  for (let poly of polygons) {
    poly.drawBase();
    if (poly === selectedPolygon) {
      poly.drawSelected();
    }
  }
  if (selectedPolygon) {
    let overlapping = selectedPolygon.checkOverlap(polygons);
    if (overlapping) {
      overlapping.forEach((item) => item.drawOver());
    }
  }
  hull.draw();

  debug.hArea.textContent = `Area: ${Math.round(hull.area / 1000)}`;
  let pArea = polygons.map((poly) => poly.area).reduce((a, b) => a + b, 0);
  debug.pArea.textContent = `Poly Area: ${Math.round(pArea / 1000)}`;
  debug.efficiency.textContent = `Efficiency: ${ ((pArea / hull.area)*100).toFixed(0)}%`;
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

