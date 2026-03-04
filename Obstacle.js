class Obstacle {
  constructor(x, y, w, h, type = "spike") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
  }

  draw() {
    if (this.type === "spike") {
      // Draw a spike as a triangle pointing up
      fill(255, 0, 0); // red for danger
      noStroke();
      triangle(
        this.x,
        this.y + this.h, // bottom left
        this.x + this.w / 2,
        this.y, // top
        this.x + this.w,
        this.y + this.h, // bottom right
      );
    }
  }
}
