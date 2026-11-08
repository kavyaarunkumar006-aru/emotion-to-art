// Cute jellyfish. pulse: 0 = small, 1 = fully expanded
export function drawJellyfish(p, { x, y, size, pulse, color, eyesClosed = false }) {
  const t = p.millis() / 1000;
  const w = size * (0.9 + 0.25 * pulse);
  const h = size * (0.7 + 0.12 * pulse);

  const withAlpha = (a) => {
    const c = p.color(color);
    c.setAlpha(a);
    return c;
  };

  p.push();
  p.translate(x, y);

  // Soft glow
  p.noStroke();
  for (let i = 4; i > 0; i--) {
    p.fill(withAlpha(18));
    p.ellipse(0, -h * 0.3, w * (1 + i * 0.3), h * (1.2 + i * 0.3));
  }

  // Ribbon tentacles (4 thick, flowing ribbons)
  p.noFill();
  p.strokeWeight(size * 0.08);
  p.stroke(withAlpha(140));
  const count = 4;
  for (let k = 0; k < count; k++) {
    const startX = p.map(k, 0, count - 1, -w * 0.35, w * 0.35);
    p.beginShape();
    for (let s = 0; s <= 12; s++) {
      const yy = s * size * 0.07;
      const sway = Math.sin(t * 2 + s * 0.5 + k) * (2 + s * 1.3);
      p.vertex(startX + sway, yy);
    }
    p.endShape();
  }

  // Body (bell)
  p.noStroke();
  p.fill(withAlpha(230));
  p.arc(0, 0, w, h * 2, p.PI, p.TWO_PI, p.CHORD);

  // Frilly bottom edge
  for (let k = 0; k < 6; k++) {
    const bx = p.map(k, 0, 5, -w * 0.42, w * 0.42);
    p.ellipse(bx, 0, w / 6, size * 0.1);
  }

  // Shine
  p.fill(255, 255, 255, 90);
  p.ellipse(-w * 0.22, -h * 0.65, w * 0.18, h * 0.25);

  // Face
  const eyeY = -h * 0.38;
  const eyeDX = w * 0.17;
  const eyeS = size * 0.11;
  const blinking = t % 4 < 0.15;

  if (eyesClosed || blinking) {
    p.noFill();
    p.stroke(50);
    p.strokeWeight(2.5);
    p.arc(-eyeDX, eyeY, eyeS, eyeS * 0.7, 0, p.PI);
    p.arc(eyeDX, eyeY, eyeS, eyeS * 0.7, 0, p.PI);
  } else {
    p.noStroke();
    p.fill(50);
    p.ellipse(-eyeDX, eyeY, eyeS * 0.8, eyeS);
    p.ellipse(eyeDX, eyeY, eyeS * 0.8, eyeS);
    p.fill(255);
    p.circle(-eyeDX + eyeS * 0.15, eyeY - eyeS * 0.2, eyeS * 0.3);
    p.circle(eyeDX + eyeS * 0.15, eyeY - eyeS * 0.2, eyeS * 0.3);
  }

  // Blush
  p.noStroke();
  p.fill(255, 130, 170, 110);
  p.ellipse(-eyeDX * 1.6, eyeY + eyeS * 0.8, eyeS * 0.9, eyeS * 0.5);
  p.ellipse(eyeDX * 1.6, eyeY + eyeS * 0.8, eyeS * 0.9, eyeS * 0.5);

  // Smile
  p.noFill();
  p.stroke(50);
  p.strokeWeight(2.5);
  p.arc(0, eyeY + eyeS * 0.7, eyeS * 1.2, eyeS * 0.8, 0, p.PI);

  p.pop();
}

// Create bubbles once
export function makeBubbles(p, n) {
  return Array.from({ length: n }, () => ({
    x: p.random(p.width),
    y: p.random(p.height),
    r: p.random(4, 12),
    speed: p.random(0.4, 1.2),
  }));
}

// Rising, wobbling bubbles
export function drawBubbles(p, bubbles) {
  const t = p.millis();
  bubbles.forEach((b) => {
    b.y -= b.speed;
    b.x += Math.sin(t / 600 + b.r) * 0.3;
    if (b.y < -15) {
      b.y = p.height + 15;
      b.x = p.random(p.width);
    }
    p.noFill();
    p.stroke(200, 230, 255, 150);
    p.strokeWeight(1.5);
    p.circle(b.x, b.y, b.r * 2);
    p.noStroke();
    p.fill(255, 200);
    p.circle(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.5);
  });
}