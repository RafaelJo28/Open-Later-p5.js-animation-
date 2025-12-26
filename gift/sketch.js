let flowers = [];
let butterflies = [];
let particles = [];
let grass = [];
let stars = [];
let clouds = [];
let moon;

let wind = 0;
let windTarget = 0;
let calmTimer = 0;
let inStillness = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  background(0);

  for (let i = 0; i < width; i += 60) {
    grass.push(new GrassBlade(i + random(-20, 20)));
  }

  // Full moon
  moon = {
    x: 150,
    y: 120,
    size: 100
  };

  // Clouds
  for (let i = 0; i < 6; i++) {
    clouds.push(new Cloud(random(width), random(50, 200), random(80, 160), random(30, 60), random(0.2, 0.6)));
  }
}

function draw() {
  background(0, 0, 0, 0.92);

  // Stars
  if (stars.length < 150 && random() < 0.02) {
    stars.push(new Star(random(width), random(height)));
  }
  for (let s of stars) {
    s.update();
    s.draw();
  }
  stars = stars.filter(s => !s.dead);

  // Clouds
  for (let c of clouds) {
    c.update();
    c.draw();
  }

  // Moon
  drawMoon();

  // Wind logic
  if (!inStillness && random() < 0.0006) {
    inStillness = true;
    calmTimer = int(random(180, 300));
  }
  if (inStillness) {
    calmTimer--;
    if (calmTimer <= 0) inStillness = false;
  }
  if (!inStillness && frameCount % int(random(240, 420)) === 0) {
    windTarget = random(-1.2, 1.2);
  }
  wind = lerp(wind, windTarget, inStillness ? 0.002 : 0.01);

  // Draw grass
  for (let g of grass) g.draw();

  // Draw flowers
  for (let f of flowers) {
    f.update();
    f.draw();
  }

  // Draw particles
  for (let p of particles) {
    p.update();
    p.draw();
  }

  // Draw butterflies
  for (let b of butterflies) {
    b.update();
    b.draw();
  }

  // Cleanup
  particles = particles.filter(p => !p.dead);
  butterflies = butterflies.filter(b => !b.dead);
}

function mousePressed() {
  flowers.push(new Flower(mouseX, mouseY));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Moon
function drawMoon() {
  push();
  translate(moon.x, moon.y);
  noStroke();
  fill(60, 10, 100, 1); // full moon
  ellipse(0, 0, moon.size, moon.size);
  pop();
}

// Clouds
class Cloud {
  constructor(x, y, w, h, speed) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = speed;
  }

  update() {
    this.x += this.speed;
    if (this.x - this.w > width) this.x = -this.w;
  }

  draw() {
    noStroke();
    fill(0, 0, 100, 0.05);
    ellipse(this.x, this.y, this.w, this.h);
    ellipse(this.x + this.w * 0.3, this.y + this.h * 0.1, this.w * 0.8, this.h * 0.7);
    ellipse(this.x - this.w * 0.3, this.y - this.h * 0.1, this.w * 0.9, this.h * 0.8);
  }
}

// Stars
class Star {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = int(random(20, 100));
    this.maxAlpha = random(0.3, 1);
    this.baseSize = random(1, 3);
    this.dead = false;
  }

  update() {
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw() {
    let twinkle = sin((PI * this.life) / 20) * 2;
    let a = this.maxAlpha * sin((PI * this.life) / 20);
    noStroke();
    fill(60, 0, 100, a);
    ellipse(this.x, this.y, this.baseSize + twinkle, this.baseSize + twinkle);
  }
}

// Flower (She likes blue)
class Flower {
  constructor(x, y) {
    this.x = x + random(-6, 6);
    this.targetY = y;
    this.baseY = height;

    this.grow = 0;
    this.bloom = 0;
    this.delay = random(0, 0.4);
    this.hasBloomed = false;

    this.hueBase = random(195, 210);
    this.size = random(1.6, 2);
    this.swayOffset = random(1000);

    this.stemSway = 0;
    this.headSway = 0;

    this.leafPositions = [
      { p: random(0.35, 0.55), side: -1 },
      { p: random(0.35, 0.55), side: 1 }
    ];
  }

  update() {
    if (this.grow < 1) this.grow += 0.008;
    else {
      this.bloom = min(this.bloom + 0.02, 1);
      if (!this.hasBloomed && this.bloom > 0.6 + this.delay) {
        for (let i = 0; i < 90; i++) particles.push(new Particle(this.x, this.targetY));
        for (let i = 0; i < int(random(4, 7)); i++) butterflies.push(new Butterfly(this.x, this.targetY));
        this.hasBloomed = true;
      }
    }

    let target = sin(frameCount * 0.012 + this.swayOffset) * 12 + wind * 25;
    this.stemSway = lerp(this.stemSway, target, 0.08);
    this.headSway = lerp(this.headSway, this.stemSway, 0.05);
  }

  draw() {
    this.drawStem();
    if (this.bloom > 0) this.drawBloom();
  }

  drawStem() {
    let t = easeOut(this.grow);
    let yNow = lerp(this.baseY, this.targetY, t);

    noFill();
    beginShape();
    for (let i = 0; i <= 18; i++) {
      let p = i / 18;
      let y = lerp(this.baseY, yNow, p);
      let sway = this.stemSway * p;
      stroke(125, 55, 55, 0.9);
      strokeWeight(lerp(6, 2, p));
      vertex(this.x + sway, y);
    }
    endShape();

    for (let lp of this.leafPositions) {
      let y = lerp(this.baseY, yNow, lp.p);
      let sway = this.stemSway * lp.p;
      this.drawLeaf(this.x + sway, y, lp.side);
    }
  }

  drawLeaf(x, y, side) {
    let g = constrain(map(this.grow, 0.4, 1, 0, 1), 0, 1);
    push();
    translate(x, y);
    scale(side * g, g);
    rotate(this.stemSway * 0.02);
    noStroke();
    fill(130, 50, 50, 0.85);
    beginShape();
    vertex(0, 0);
    bezierVertex(25, -12, 55, 8, 70, 0);
    bezierVertex(55, 18, 25, 12, 0, 0);
    endShape(CLOSE);
    pop();
  }

  drawBloom() {
    let t = easeOut(this.bloom);
    let breathe = 1 + sin(frameCount * 0.025) * 0.025;
    push();
    translate(this.x + this.headSway, this.targetY);
    rotate(this.headSway * 0.015);
    scale(this.size * breathe);
    drawingContext.shadowBlur = 45 * t;
    drawingContext.shadowColor = color(this.hueBase, 35, 90);
    noStroke();

    for (let i = 0; i < 6; i++) {
      push();
      rotate((TWO_PI / 6) * i);
      fill(this.hueBase, 30, 92, 0.45 * t);
      ellipse(0, -32 * t, 28 * t, 60 * t);
      pop();
    }
    for (let i = 0; i < 6; i++) {
      push();
      rotate((TWO_PI / 6) * i + PI / 6);
      fill(this.hueBase + 5, 25, 98, 0.7 * t);
      ellipse(0, -20 * t, 20 * t, 38 * t);
      pop();
    }

    fill(0, 0, 100, 0.95 * t);
    beginShape();
    vertex(0, -4 * t);
    bezierVertex(-10 * t, -16 * t, -22 * t, 0, 0, 18 * t);
    bezierVertex(22 * t, 0, 10 * t, -16 * t, 0, -4 * t);
    endShape(CLOSE);

    fill(48, 90, 100, 0.9 * t);
    ellipse(0, 4 * t, 5 * t, 5 * t);

    drawingContext.shadowBlur = 0;
    pop();
  }
}

// Particles
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.6, 0.6), random(-1.2, -0.3));
    this.life = random(240, 360);
    this.size = random(3, 7);
    this.dead = false;
  }

  update() {
    this.vel.x += wind * 0.02;
    this.pos.add(this.vel);
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw() {
    let a = map(this.life, 0, 300, 0, 0.8);
    noStroke();
    fill(48, 90, 100, a);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

// Grass (I am a CS student, what is grass?)
class GrassBlade {
  constructor(x) {
    this.x = x;
    this.height = random(30, 55);
    this.curve = random(-20, 20);
    this.offset = random(1000);
    this.hue = random(95, 115);
  }

  draw() {
    let sway = sin(frameCount * 0.008 + this.offset) * 1.5 + wind * 4;
    noFill();
    stroke(this.hue, 45, 50, 0.65);
    beginShape();
    for (let i = 0; i <= 10; i++) {
      let p = i / 10;
      let y = lerp(height, height - this.height, p);
      let x = this.x + sway * p + this.curve * p * p;
      strokeWeight(lerp(4, 1, p));
      vertex(x, y);
    }
    endShape();
  }
}

// Butterfly (lmao butt)
class Butterfly {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 0.6));
    this.depth = random([0.6, 1, 1.4]);
    this.size = this.depth;
    this.alpha = map(this.depth, 0.6, 1.4, 0.4, 0.75);
    this.speedLimit = map(this.depth, 0.6, 1.4, 0.6, 1.6);
    this.hue = random(50, 60);
    this.noiseOffset = createVector(random(1000), random(1000));
    this.life = random(1400, 2200);
    this.dead = false;
  }

  update() {
    let angle = noise(this.noiseOffset.x, this.noiseOffset.y) * TWO_PI * 2;
    let drift = p5.Vector.fromAngle(angle).mult(0.12);
    drift.x += wind * 0.1;
    this.vel.add(drift);
    this.vel.limit(this.speedLimit);
    this.pos.add(this.vel);
    this.pos.y -= 0.015 * this.depth;
    this.noiseOffset.add(0.003, 0.003);
    this.life--;
    if (
      this.life <= 0 ||
      this.pos.x < -200 ||
      this.pos.x > width + 200 ||
      this.pos.y < -300 ||
      this.pos.y > height + 200
    ) this.dead = true;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.size);
    let flap = sin(frameCount * 0.18) * PI / 7;
    noStroke();
    fill(this.hue, 35, 90, this.alpha);
    rotate(flap);
    ellipse(-10, 0, 20, 28);
    rotate(-2 * flap);
    ellipse(10, 0, 20, 28);
    fill(0, 0, 100, this.alpha);
    ellipse(0, 3, 4, 10);
    pop();
  }
}

// Easing (Note to self: FOR RUNNING!! DONT CHANGE THIS OR U WILL BREAK EVERYTHING)
function easeOut(t) {
  return 1 - pow(1 - t, 3);
}