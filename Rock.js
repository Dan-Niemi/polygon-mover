class Rock {
  constructor(pos) {
    this.numVertices = int(random(5, 12));
    this.vertices = [];
    this.brightness = random(60, 80);
    this.radius = random(40, 100);
    for (let i = 0; i < this.numVertices; i++) {
      let angle = random(TWO_PI);
      let x = pos.x + this.radius * cos(angle);
      let y = pos.y + this.radius * sin(angle);
      this.vertices.push(createVector(x, y));
    }
    this.vertices.sort((a, b) => atan2(a.y - pos.y, a.x - pos.x) - atan2(b.y - pos.y, b.x - pos.x));
  }
  get area() {
    let area = 0;
    let n = this.numVertices;
    let p = this.vertices;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n;
      area += p[i].x * p[j].y;
      area -= p[j].x * p[i].y;
    }
    return Math.abs(area) / 2;
  }
  checkOverlap(rocks) {
    // check for collision
    let res = [];
    for (let other of rocks) {
      if (other !== this) {
        // if lines collide
        if (collidePolyPoly(this.vertices, other.vertices)) {
          res.push(...[this, other]);
        }
        // if this is entirely inside another
        for (let point of this.vertices) {
          if (collidePointPoly(point.x, point.y, other.vertices)) {
            res.push(...[this, other]);
          }
        }
        // if another is entirely inside this
        for (let point of other.vertices) {
          if (collidePointPoly(point.x, point.y, this.vertices)) {
            res.push(...[this, other]);
          }
        }
      }
    }
    return res.length ? [...new Set(res)] : false;
  }
  get center() {
    let c = createVector(0, 0);
    c.x = this.vertices.map((v) => v.x).reduce((a, b) => a + b, 0) / this.numVertices;
    c.y = this.vertices.map((v) => v.y).reduce((a, b) => a + b, 0) / this.numVertices;
    return c;
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
    fill(240, 10, 20, 50);
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  drawOver() {
    fill(0, 100, 100, 25);
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
  move() {
    for (let v of this.vertices) {
      v.x += mouseX - pmouseX;
      v.y += mouseY - pmouseY;
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
