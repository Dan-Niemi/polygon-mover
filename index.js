let polygons = [];
let selectedPolygon = null;
const NUM_POLYGONS = 10


function setup() {
	createCanvas(windowWidth, windowHeight);
	let attempts = 0;
	while (polygons.length < NUM_POLYGONS && attempts < 1000) {
		let newShape = new Shape();
		if (!newShape.isOverlapping) {
			polygons.push(newShape);
		}
		attempts++;
	}
}

function draw() {
	background(220);

	for (let poly of polygons) {

		// Draw all
		stroke(0);
		fill(150, 150, 255, 150);
		poly.draw()

		// Draw selected
		if (poly === selectedPolygon) {
			stroke(255, 0, 0);
			strokeWeight(3);
			noFill();
			poly.draw()
		}
	}

	if (selectedPolygon) {
		selectedPolygon.move()
	}

	// Check for overlaps
	for (let poly of polygons) {
		if (poly.isOverlapping) {
			stroke(255, 0, 0);
			strokeWeight(2);
			fill(255, 0, 0, 50);
			poly.draw()
		}
	}
}

function mousePressed() {
	if (selectedPolygon) {
		// if legal, drop
		if (!selectedPolygon.isOverlapping) {
			selectedPolygon = null;
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
	let isFine = keyIsDown(91);
	let scalar = isFine ? 0.0005 : 0.003;
	selectedPolygon.rotate(angle * scalar);
	return false;

}

class Shape {
	constructor() {
		this.numVertices = int(random(4, 12));
		this.vertices = [];
		this.init();
	}
	init() {
		let center = createVector(random(200,width-200), random(200,height-200));
		let radius = random(40, 100);
		for (let i = 0; i < this.numVertices; i++) {
			let angle = random(TWO_PI);
			let x = center.x + radius * cos(angle);
			let y = center.y + radius * sin(angle);
			this.vertices.push(createVector(x, y));
		}
		this.vertices.sort((a, b) => atan2(a.y - center.y, a.x - center.x) - atan2(b.y - center.y, b.x - center.x));

	}
	get isOverlapping() {
		for (let other of polygons) {
			if (other !== this && collidePolyPoly(this.vertices, other.vertices)) {
				return true;
			}
		}
		return false;
	}
	draw() {
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
	get center() {
		let c = createVector(0, 0);
		c.x = this.vertices.map(v => v.x).reduce((a, b) => a + b, 0) / this.numVertices
		c.y = this.vertices.map(v => v.y).reduce((a, b) => a + b, 0) / this.numVertices
		return c
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
