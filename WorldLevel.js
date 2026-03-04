class WorldLevel {
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      { bg: "#F0F0F0", platform: "#C8C8C8", blob: "#1478FF" },
      levelJson.theme ?? {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Camera knob (data-driven view state)
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 360;
    this.deathY = levelJson.world?.deathY ?? this.h + 200;

    // Start
    this.start = Object.assign(
      { x: 170, y: 220, r: 26 },
      levelJson.start ?? {},
    );

    // Finish (checkpoint to advance to next level)
    this.finish = levelJson.finish ?? { x: 0, y: 0, w: 40, h: 80 };

    // Platforms
    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );

    // Obstacles
    this.obstacles = (levelJson.obstacles ?? []).map(
      (o) => new Obstacle(o.x, o.y, o.w, o.h, o.type),
    );
    this.balls = [];
    if (levelJson.colorBalls) {
      const cfg = levelJson.colorBalls;
      const colors = cfg.colors;
      const ballR = cfg.r ?? 14;
      const floatY = cfg.floatY ?? 380;

      for (let i = 0; i < colors.length; i++) {
        // Space balls evenly: divide world width into (count + 1) slots
        const bx = (this.w / (colors.length + 1)) * (i + 1);
        this.balls.push({
          x: bx,
          y: floatY,
          r: ballR,
          col: colors[i],
          collected: false,
        });
      }
    }
  }

  allBallsCollected() {
    // Return true if there are no balls OR all balls are collected
    return this.balls.length === 0 || this.balls.every((b) => b.collected);
  }

  drawBalls(t) {
    noStroke();
    for (const b of this.balls) {
      if (b.collected) continue;
      // gentle up-and-down float using sine and the sketch time
      const floatOffset = sin(t * 2 + b.x * 0.01) * 6;
      fill(b.col);
      circle(b.x, b.y + floatOffset, b.r * 2);
      // white shine dot
      fill(255, 255, 255, 160);
      circle(b.x - b.r * 0.3, b.y + floatOffset - b.r * 0.3, b.r * 0.6);
    }
  }

  drawWorld() {
    background(this.theme.bg);
    push();
    rectMode(CORNER); // critical: undo any global rectMode(CENTER) [web:230]
    noStroke();
    fill(this.theme.platform);

    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h); // x,y = top-left [web:234]
    pop();
  }

  drawFinish() {
    // Draw checkmark at finish location
    push();
    noFill();
    stroke(0);
    strokeWeight(3);

    // Draw a checkmark symbol
    const cx = this.finish.x + this.finish.w / 2;
    const cy = this.finish.y + this.finish.h / 2;
    const size = this.finish.w / 3;

    // Checkmark: small line + long line
    line(cx - size * 0.4, cy, cx - size * 0.1, cy + size * 0.4);
    line(cx - size * 0.1, cy + size * 0.4, cx + size * 0.5, cy - size * 0.3);
    pop();
  }

  drawObstacles() {
    for (const o of this.obstacles) {
      o.draw();
    }
  }
}
