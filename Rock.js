class Rock {
  constructor(pos) {
    this.numVertices = int(random(5, 12));
    this.vertices = [];
    this.radius = random(40, 100);
    // VISUALS
    this.brightness = random(60, 80);
    this.color = color(240, 10, this.brightness);
    this.shadowColor = color(0, 0, 0, 5);
    this.shadowVector = createVector(-10, -5);
    this.highlightColor = color(0, 0, 100, 10);
    this.highlightVector = this.shadowVector.copy().mult(-0.5);
    this.overlapColor = color(0, 100, 100, 25);
    this.g = createGraphics(width, height);

    for (let i = 0; i < this.numVertices; i++) {
      let angle = random(TWO_PI);
      let x = pos.x + this.radius * cos(angle);
      let y = pos.y + this.radius * sin(angle);
      this.vertices.push(createVector(x, y));
    }
    this.vertices.sort((a, b) => atan2(a.y - pos.y, a.x - pos.x) - atan2(b.y - pos.y, b.x - pos.x));
    this.drawSpeckles();
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
  get center() {
    let c = createVector(0, 0);
    c.x = this.vertices.map((v) => v.x).reduce((a, b) => a + b, 0) / this.numVertices;
    c.y = this.vertices.map((v) => v.y).reduce((a, b) => a + b, 0) / this.numVertices;
    return c;
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

  drawPoints(color, translate = createVector(0, 0)) {
    push();
    fill(color);
    beginShape();
    this.vertices.forEach((v) => vertex(v.x + translate.x, v.y + translate.y));
    endShape(CLOSE);
    pop();
  }
  draw() {
    // draw base
    this.drawPoints(this.color);
    //draw shadow
    push();
    beginClip({ invert: true });
    this.drawPoints(this.color, this.shadowVector);
    endClip();
    this.drawPoints(this.shadowColor);
    pop();
    //draw highlight
    push();
    beginClip({ invert: true });
    this.drawPoints(this.color, this.highlightVector);
    endClip();
    this.drawPoints(this.highlightColor);
    pop();
    //draw speckles
    image(this.g, 0, 0);
    // draw selected overlay
    this === selectedPolygon && this.drawPoints(this.shadowColor);
  }

  drawSpeckles() {
    this.g.fill(this.shadowColor);
    const r = this.radius;
    const c = this.center;
    for (let y = c.y - r; y < c.y + r; y += 5) {
      for (let x = c.x - r; x < c.x + r; x += 5) {
        this.g.ellipse(x, y, 10);
      }
    }
    
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
