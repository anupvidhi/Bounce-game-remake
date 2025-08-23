const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class Sprite {
  constructor(imgSrc, frameWidth, frameHeight, frameCount, frameSpeed) {
    this.image = new Image();
    this.image.src = imgSrc;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameCount = frameCount;
    this.frameSpeed = frameSpeed;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }

  update(deltaTime) {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
  }

  draw(ctx, x, y, scale = 1) {
    ctx.drawImage(
      this.image,
      this.currentFrame * this.frameWidth, 0, this.frameWidth, this.frameHeight,
      x, y, this.frameWidth * scale, this.frameHeight * scale
    );
  }
}

// Load sprites (assets need to be added separately)
const ball   = new Sprite("assets/ball.png", 128, 128, 6, 100);
const ring   = new Sprite("assets/ring.png", 128, 128, 8, 80);
const spike  = new Sprite("assets/spike.png", 128, 128, 4, 200);
const portal = new Sprite("assets/portal.png", 128, 128, 6, 120);

let keys = { left: false, right: false, up: false };

// Touch buttons
document.getElementById("leftBtn").addEventListener("touchstart", () => keys.left = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys.left = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => keys.right = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys.right = false);
document.getElementById("jumpBtn").addEventListener("touchstart", () => keys.up = true);
document.getElementById("jumpBtn").addEventListener("touchend", () => keys.up = false);

// Keyboard controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp") keys.up = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp") keys.up = false;
});

let lastTime = 0;

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw(ctx);

  requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
  ball.update(deltaTime);
  ring.update(deltaTime);
  spike.update(deltaTime);
  portal.update(deltaTime);
}

function draw(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ball.draw(ctx, 100, 300, 1);
  ring.draw(ctx, 300, 250, 1);
  spike.draw(ctx, 500, 350, 1);
  portal.draw(ctx, 700, 200, 1.2);
}

requestAnimationFrame(gameLoop);
