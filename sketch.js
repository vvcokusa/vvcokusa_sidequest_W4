/*
Week 5 — Example 5: Side-Scroller Platformer with JSON Levels + Modular Camera

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows | Jump: Space

Learning goals:
- Build a side-scrolling platformer using modular game systems
- Load complete level definitions from external JSON (LevelLoader + levels.json)
- Separate responsibilities across classes (Player, Platform, Camera, World)
- Implement gravity, jumping, and collision with platforms
- Use a dedicated Camera2D class for smooth horizontal tracking
- Support multiple levels and easy tuning through data files
- Explore scalable project architecture for larger games
*/

const VIEW_W = 700;
const VIEW_H = 480;

let allLevelsData;
let levelIndex = 0;

let level;
let player;
let cam;
let playerColor; // tracks current blob colour, changes on ball pickup

function preload() {
  allLevelsData = loadJSON("levels.json"); // levels.json beside index.html [web:122]
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  cam = new Camera2D(width, height);
  loadLevel(levelIndex);
}

function loadLevel(i) {
  level = LevelLoader.fromLevelsJson(allLevelsData, i);

  player = new BlobPlayer();
  player.spawnFromLevel(level);
  playerColor = level.theme.blob; // reset colour to level default on (re)load

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);
}

function draw() {
  // --- game state ---
  player.update(level);

  // Fall death â†’ respawn
  if (player.y - player.r > level.deathY) {
    loadLevel(levelIndex);
    return;
  }

  // --- view state (data-driven smoothing) ---
  cam.followSideScrollerX(player.x, level.camLerp);
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  // --- draw ---
  cam.begin();
  level.drawWorld();
  level.drawBalls(frameCount * 0.05); // pass time for floating animation
  level.drawFinish(); // draw the checkmark
  level.drawObstacles(); // draw obstacles

  // Check if player touched any uncollected ball
  for (const b of level.balls) {
    if (!b.collected) {
      const d = dist(player.x, player.y, b.x, b.y);
      if (d < player.r + b.r) {
        b.collected = true; // remove ball from world
        playerColor = b.col; // change blob to ball's colour
      }
    }
  }

  // Check if player touched any obstacle
  for (const o of level.obstacles) {
    const obstacleBox = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (BlobPlayer.overlap(player.getBox(), obstacleBox)) {
      loadLevel(levelIndex); // restart level
      return;
    }
  }

  // Check if player touched the finish checkpoint
  const finishX = level.finish.x + level.finish.w / 2;
  const finishY = level.finish.y + level.finish.h / 2;
  const finishDist = dist(player.x, player.y, finishX, finishY);
  const finishRadius = Math.max(level.finish.w, level.finish.h) / 2;
  if (finishDist < player.r + finishRadius && level.allBallsCollected()) {
    levelIndex = (levelIndex + 1) % allLevelsData.levels.length;
    loadLevel(levelIndex);
    cam.begin(); // restart camera after level load
  }

  player.draw(playerColor);
  cam.end();

  // HUD
  fill(0);
  noStroke();
  text(level.name, 10, 18);
  text(" you can use (ADWS) keys or (arrows/space) to move the blob.", 10, 36);
  text(`(N) will take you to the next level.`, 10, 58);
}

function keyPressed() {
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.tryJump();
  }
  if (key === "r" || key === "R") loadLevel(levelIndex);

  if (key === "n" || key === "N") {
    levelIndex = (levelIndex + 1) % allLevelsData.levels.length;
    loadLevel(levelIndex);
  }
}
