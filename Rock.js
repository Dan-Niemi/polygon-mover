class Rock {
  constructor(pos) {
    this.numVertices = int(random(5, 12));
    this.vertices = [];
    this.radius = random(40, 100);
    // VISUALS
    this.brightness = random(60, 80);
    this.color = color(240, 10, this.brightness);
    this.shadowColor = color(0, 0, 0, 10);
    this.shadowVector = createVector(-10, -5);
    this.highlightColor = color(0, 0, 100, 10);
    this.highlightVector = this.shadowVector.copy().mult(-0.5);
    this.overlapColor = color(0, 100, 100, 25);
    this.g = createGraphics(300, 300);
    this.g.noStroke();
    this.clickCenter;
    this.rotation = 0;

    for (let i = 0; i < this.numVertices; i++) {
      let angle = random(TWO_PI);
      let x = pos.x + this.radius * cos(angle);
      let y = pos.y + this.radius * sin(angle);
      this.vertices.push(createVector(x, y));
    }
    this.vertices.sort((a, b) => atan2(a.y - pos.y, a.x - pos.x) - atan2(b.y - pos.y, b.x - pos.x));
    this.drawSpeckles(pos);
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

    push();
    beginClip();
    this.drawPoints(this.color);
    endClip();
    translate(this.center);
    rotate(this.rotation);
    image(this.g, -this.radius, -this.radius);
    pop();
    // draw selected overlay
    this === selectedPolygon && this.drawPoints(this.shadowColor);
  }

  drawSpeckles() {
    this.g.colorMode(HSB, 360, 100, 100, 100);
    for (let i = 0; i < 500; i++) {
      this.g.fill(240, 0, random(100), random(25));
      this.g.ellipse(random(this.g.width), random(this.g.height), random(4));
    }
  }

  move() {
    let pMouse = createVector(mouseX - pmouseX, mouseY - pmouseY);
    this.vertices.forEach((v) => v.add(pMouse));
    this.clickCenter.add(pMouse)
  }

  rotate(angle) {
    let center = rotateClickPos ? this.clickCenter : this.center;
    this.rotation += angle;
    this.vertices.forEach((v) => v.sub(center).rotate(angle).add(center));

    
  }
}
