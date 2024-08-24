const NUM_POLYGONS = 40;
const POLYGON_MIN_SIZE = 40;
const POLYGON_MAX_SIZE = 100;
const BORDER_BUFFER = 200

let polygons = [];
let selectedPolygon = null;
let hull = [];
let area = 0;
window.stats = stats

function stats(){
	return {
		polygons: polygons,
		init(){
			console.log('beans')
		},
		get area(){
return area
		}
	}
}

function setup() {
	colorMode(HSB, 360, 100, 100, 100);
	createCanvas(windowWidth, windowHeight);
	let attempts = 0;
	while (polygons.length < NUM_POLYGONS && attempts < 1000) {
		let pos = createVector(random(200, width - 200), random(200, height - 200))
		let newRock = new Rock(pos);
		if (!newRock.isOverlapping) {
			polygons.push(newRock);
		}
		attempts++;
	}
	hull = updateHull(polygons)
	area = computePolygonArea(hull)

}
function update() {
	if (selectedPolygon) {
		selectedPolygon.move()
	}
}

function draw() {
	update()
	background(240, 5, 95);
	for (let poly of polygons) {
		poly.drawBase();
		if (poly === selectedPolygon) {
			poly.drawSelected();
		}
		if (poly.isOverlapping) {
			poly.drawOver()
		}
	}
	noFill()
	stroke(0, 100, 100);
	strokeWeight(4)
	drawPolygon(hull)

}

function mousePressed() {
	if (selectedPolygon) {
		// if legal, drop
		if (!selectedPolygon.isOverlapping) {
			selectedPolygon = null;
			hull = updateHull(polygons)
			area = computePolygonArea(hull)
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
	const MAX_SPEED = 200
	let angle = constrain(event.delta, -MAX_SPEED, MAX_SPEED)
	let isFine = keyIsDown(91); //command key
	let scalar = isFine ? 0.0005 : 0.003;
	selectedPolygon.rotate(angle * scalar);
	return false;
}

class Rock {
	constructor(pos) {
		this.numVertices = int(random(4, 12));
		this.vertices = [];
		this.brightness = random(50, 80)
		this.radius = random(40, 100)
		for (let i = 0; i < this.numVertices; i++) {
			let angle = random(TWO_PI);
			let x = pos.x + this.radius * cos(angle);
			let y = pos.y + this.radius * sin(angle);
			this.vertices.push(createVector(x, y));
		}
		this.vertices.sort((a, b) => atan2(a.y - pos.y, a.x - pos.x) - atan2(b.y - pos.y, b.x - pos.x));
	}

	get isOverlapping() {
		// check for collision
		for (let other of polygons) {
			if (other !== this) {
				// if lines collide
				if (collidePolyPoly(this.vertices, other.vertices)) {
					return true
				}
				// if this is entirely inside another
				for (let point of this.vertices) {
					if (collidePointPoly(point.x, point.y, other.vertices)) {
						return true;
					}
				}
				// if another is entirely inside this
				for (let point of other.vertices) {
					if (collidePointPoly(point.x, point.y, this.vertices)) {
						return true
					}
				}
			}
		}
		return false;
	}
	get center() {
		let c = createVector(0, 0);
		c.x = this.vertices.map(v => v.x).reduce((a, b) => a + b, 0) / this.numVertices
		c.y = this.vertices.map(v => v.y).reduce((a, b) => a + b, 0) / this.numVertices
		return c
	}

	drawBase() {
		fill(240, 10, this.brightness);
		noStroke();
		beginShape();
		for (let v of this.vertices) {
			vertex(v.x, v.y);
		}
		endShape(CLOSE);
	}
	drawSelected() {
		fill(240, 10, 20, 50)
		beginShape();
		for (let v of this.vertices) {
			vertex(v.x, v.y);
		}
		endShape(CLOSE);
	}
	drawOver() {
		fill(0, 100, 100, 25)
		beginShape();
		for (let v of this.vertices) {
			vertex(v.x, v.y);
		}
		endShape(CLOSE);
	}
	move() {
		for (let v of this.vertices) {
			v.x += (mouseX - pmouseX);
			v.y += (mouseY - pmouseY);
		}
	}

	rotate(angle) {
		let center = this.center;
		for (let v of this.vertices) {
			let x = v.x - center.x;
			let y = v.y - center.y;
			v.x = center.x + x * cos(angle) - y * sin(angle);
			v.y = center.y + x * sin(angle) + y * cos(angle);
		}
	}
}

function drawPolygon(poly) {
	beginShape();
	for (let v of poly) {
		vertex(v.x, v.y);
	}
	endShape(CLOSE);
}


function updateHull(arr = polygons) {
	let vertices = [];
	for (poly of polygons) {
		for (point of poly.vertices) {
			vertices.push(createVector(point.x, point.y))
		}
	}
	return computeConvexHull(vertices);
}

function computeConvexHull(points) {
	// Graham scan algorithm for convex hull
	points = points.slice(); // Copy the points array
	points.sort((a, b) => a.x - b.x || a.y - b.y);

	let lower = [];
	for (let point of points) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
			lower.pop();
		}
		lower.push(point);
	}

	let upper = [];
	for (let i = points.length - 1; i >= 0; i--) {
		let point = points[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
			upper.pop();
		}
		upper.push(point);
	}
	upper.pop();
	lower.pop();
	return lower.concat(upper);
}

function cross(o, a, b) {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function computePolygonArea(vertices) {
	let area = 0;
	let n = vertices.length;
	for (let i = 0; i < n; i++) {
		let j = (i + 1) % n;
		area += vertices[i].x * vertices[j].y;
		area -= vertices[j].x * vertices[i].y;
	}
	return abs(area) / 2;
}