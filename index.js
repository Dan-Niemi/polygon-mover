let polygons = [];
let selectedPolygon = null;
const NUM_POLYGONS = 10


function setup() {
	createCanvas(windowWidth, windowHeight);
	for (let i = 0; i < NUM_POLYGONS; i++) {
		polygons.push(new Shape());
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
		if (poly.isOverlapping()) {
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
		if (!selectedPolygon.isOverlapping()) {
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
	if (selectedPolygon) {
		let angle = event.delta / 100;
		selectedPolygon.rotate(angle);
		return false; // Prevent default scrolling
	}
}




class Shape {
	constructor() {
		this.numVertices = int(random(4, 8));
		this.radius = int(random(50, 100));
		this.vertices = [];
		this.init();
	}
	init() {
		let center = createVector(random(width), random(height));
		for (let i = 0; i < this.numVertices; i++) {
			let angle = random(TWO_PI);
			let x = center.x + this.radius * cos(angle);
			let y = center.y + this.radius * sin(angle);
			this.vertices.push(createVector(x, y));
		}
		this.vertices.sort((a, b) => atan2(a.y - center.y, a.x - center.x) - atan2(b.y - center.y, b.x - center.x));
	}
	isOverlapping() {
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
		c.x = this.vertices.map(v=>v.x).reduce((a, b) => a + b, 0) / this.numVertices
		c.y = this.vertices.map(v=>v.y).reduce((a, b) => a + b, 0) / this.numVertices
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