const NUM_POLYGONS = 15;
const FIELD_RADIUS = 400;

let polygons,selectedPolygon,hull

const debug = {
  hArea: document.querySelector("#area"),
  pArea: document.querySelector("#polygons"),
  efficiency: document.querySelector("#efficiency"),
};

function setup() {
  colorMode(HSB, 360, 100, 100, 100);
  createCanvas(windowWidth, windowHeight);
  polygons = generateRocks(NUM_POLYGONS,width/2,height/2,FIELD_RADIUS);
  hull = new Hull(polygons);
}

function generateRocks(num,cx,cy,radius) {
  let arr = []
  let attempts = 0;
  while (arr.length < num && attempts < 1000) {
    let pos = createVector(random(cx - radius, cx + radius), random(cy - radius, cy + radius));
    let newRock = new Rock(pos);
    if (!newRock.checkOverlap(arr)) {
      arr.push(newRock);
    }
    attempts++;
  }
  return arr
}

function draw() {
  selectedPolygon && selectedPolygon.move();
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
