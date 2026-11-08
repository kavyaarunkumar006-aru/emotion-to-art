import { useEffect, useRef } from "react";
import p5 from "p5";
import { moods } from "./moodMapper";
import { drawJellyfish, makeBubbles, drawBubbles } from "./characters";

function ArtCanvas({ mood, mode }) {
  const containerRef = useRef(null);
  const moodRef = useRef(mood);
  const modeRef = useRef(mode);
  const instanceRef = useRef(null);

  useEffect(() => {
    moodRef.current = mood;
    modeRef.current = mode;
  }, [mood, mode]);

  useEffect(() => {
    const sketch = (p) => {
      let partsA = [];
      let partsB = [];
      let bubbles = [];
      let progress = 0;
      let lastKey = "";

      const makeParticles = (n) =>
        Array.from({ length: n }, () => ({
          x: p.random(p.width),
          y: p.random(p.height),
          angle: p.random(p.TWO_PI),
          size: p.random(5, 20),
        }));

      p.setup = () => {
        p.createCanvas(600, 400);
        partsA = makeParticles(80);
        partsB = makeParticles(40);
        bubbles = makeBubbles(p, 18);
      };

      const wrap = (pt) => {
        if (pt.x < 0) pt.x = p.width;
        if (pt.x > p.width) pt.x = 0;
        if (pt.y < 0) pt.y = p.height;
        if (pt.y > p.height) pt.y = 0;
      };

      const toLayer = (base, intensity) => ({
        colors: base.colors,
        speed: base.speed * intensity,
        style: base.style,
        sizeScale: 0.6 + 0.4 * intensity,
      });

      const blendToCalm = (layer, t) => {
        const calm = moods.calm;
        return {
          colors: layer.colors.map((c, i) =>
            p.lerpColor(p.color(c), p.color(calm.colors[i % calm.colors.length]), t)
          ),
          speed: p.lerp(layer.speed, calm.speed, t),
          style: t > 0.6 ? "waves" : layer.style,
          sizeScale: p.lerp(layer.sizeScale, 1, t),
        };
      };

      // Breathing timing: 4s in, 4s out
      const getBreath = () => {
        const phase = (p.millis() % 8000) / 8000;
        const inhale = phase < 0.5;
        return { inhale, amt: inhale ? phase * 2 : 2 - phase * 2 };
      };

      const drawBreath = (withCircle) => {
        const { inhale, amt } = getBreath();
        if (withCircle) {
          p.noFill();
          p.stroke(255, 255, 255, 120);
          p.strokeWeight(2);
          p.circle(p.width / 2, p.height / 2, p.lerp(60, 180, amt));
        }
        p.noStroke();
        p.fill(255, 220);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(18);
        const ty = withCircle ? p.height / 2 : p.height - 30;
        p.text(inhale ? "Breathe in" : "Breathe out", p.width / 2, ty);
      };

      // HAPPY: round bursts (round = warmth)
      const drawBurst = (m, parts) => {
        p.noStroke();
        parts.forEach((pt, i) => {
          const a = Math.atan2(pt.y - p.height / 2, pt.x - p.width / 2);
          pt.x += Math.cos(a) * m.speed * 1.5;
          pt.y += Math.sin(a) * m.speed * 1.5;
          if (pt.x < 0 || pt.x > p.width || pt.y < 0 || pt.y > p.height) {
            pt.x = p.width / 2 + p.random(-10, 10);
            pt.y = p.height / 2 + p.random(-10, 10);
          }
          p.fill(m.colors[i % m.colors.length]);
          p.circle(pt.x, pt.y, pt.size * m.sizeScale);
        });
      };

      // CALM: smooth curves
      const drawWaves = (m) => {
        const t = p.frameCount * 0.02;
        p.noFill();
        p.strokeWeight(3);
        for (let j = 0; j < 6; j++) {
          p.stroke(m.colors[j % m.colors.length]);
          p.beginShape();
          for (let x = 0; x <= p.width; x += 10) {
            const y =
              p.height / 2 + (j - 2.5) * 40 +
              Math.sin(x * 0.02 + t * m.speed + j) * 30 * m.sizeScale;
            p.vertex(x, y);
          }
          p.endShape();
        }
      };

      // SAD: gray rain
      const drawRain = (m, parts) => {
        p.strokeWeight(2);
        parts.forEach((pt, i) => {
          pt.y += m.speed * 2 + pt.size * 0.1;
          if (pt.y > p.height) {
            pt.y = 0;
            pt.x = p.random(p.width);
          }
          p.stroke(m.colors[i % m.colors.length]);
          p.line(pt.x, pt.y, pt.x, pt.y + pt.size * m.sizeScale);
        });
      };

      // ANGRY: sharp angular lines
      const drawShards = (m, parts) => {
        const count = Math.round(6 * m.sizeScale * (parts.length / 80));
        for (let k = 0; k < count; k++) {
          p.stroke(m.colors[k % m.colors.length]);
          p.strokeWeight(p.random(1, 4));
          const x = p.random(p.width);
          const y = p.random(p.height);
          p.line(x, y, x + p.random(-100, 100), y + p.random(-100, 100));
        }
      };

      // ANXIOUS: shaky jagged triangles (angular = tension)
      const drawJitter = (m, parts) => {
        p.noStroke();
        parts.forEach((pt, i) => {
          pt.x += p.random(-m.speed, m.speed);
          pt.y += p.random(-m.speed, m.speed);
          wrap(pt);
          const s = pt.size * 0.6 * m.sizeScale;
          p.fill(m.colors[i % m.colors.length]);
          p.push();
          p.translate(pt.x, pt.y);
          p.rotate(pt.angle + p.random(-0.5, 0.5)); // nervous wobble
          p.triangle(0, -s, s * 0.87, s * 0.5, -s * 0.87, s * 0.5);
          p.pop();
        });
      };

      // NEUTRAL
      const drawDrift = (m, parts) => {
        p.noStroke();
        parts.forEach((pt, i) => {
          pt.angle += p.random(-0.3, 0.3);
          pt.x += Math.cos(pt.angle) * m.speed;
          pt.y += Math.sin(pt.angle) * m.speed;
          wrap(pt);
          p.fill(m.colors[i % m.colors.length]);
          p.circle(pt.x, pt.y, pt.size * m.sizeScale);
        });
      };

      const drawLayer = (m, parts) => {
        switch (m.style) {
          case "burst":  drawBurst(m, parts);  break;
          case "waves":  drawWaves(m);         break;
          case "rain":   drawRain(m, parts);   break;
          case "shards": drawShards(m, parts); break;
          case "jitter": drawJitter(m, parts); break;
          default:       drawDrift(m, parts);
        }
      };

      p.draw = () => {
        const current = moodRef.current;
        const mode = modeRef.current;

        const key = current.name + mode;
        if (key !== lastKey) {
          progress = 0;
          lastKey = key;
        }

        let layerA = toLayer(current.primary, current.intensity);
        let layerB = current.secondary ? toLayer(current.secondary, current.intensity) : null;

        if (mode === "calm") {
          progress = Math.min(progress + 1 / (30 * 60), 1);
          layerA = blendToCalm(layerA, progress);
          layerB = layerB && progress < 0.6 ? blendToCalm(layerB, progress) : null;
        }

        const showJelly = layerA.style === "waves";

        if (showJelly) p.background(10, 25, 50);
        else p.background(20, 20, 30, 25);

        drawLayer(layerA, partsA);
        if (layerB) drawLayer(layerB, partsB);

        if (showJelly) {
          drawBubbles(p, bubbles);
          const pulse =
            mode === "calm" ? getBreath().amt : (Math.sin(p.millis() / 700) + 1) / 2;
          const jx = p.width / 2 + Math.sin(p.millis() / 2700) * 60;
          const jy = p.height / 2 - 20 + Math.sin(p.millis() / 1500) * 15;
          drawJellyfish(p, {
            x: jx,
            y: jy,
            size: 110,
            pulse,
            color: "#C9A7FF",
            eyesClosed: mode === "calm",
          });
        }

        if (mode === "calm") drawBreath(!showJelly);
      };
    };

    const instance = new p5(sketch, containerRef.current);
    instanceRef.current = instance;
    return () => instance.remove();
  }, []);

  const handleDownload = () => {
    const name = moodRef.current.name.replace(/\s\+\s/g, "-");
    instanceRef.current.saveCanvas(`emotion-art-${name}`, "png");
  };

  return (
    <div>
      <div ref={containerRef} className="canvas-box"></div>
      <br />
      <button className="download-btn" onClick={handleDownload}>
        Download Art
      </button>
    </div>
  );
}

export default ArtCanvas;