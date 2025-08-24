const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 320;

// Load ball sprite sheet
const ballImg = new Image();
ballImg.src = 'assets/ball.png';

let frame = 0;
let frameTick = 0;
const frameCount = 6;
const frameWidth = 64;
const frameHeight = 64;

let ball = {
  x: 100,
  y: 200,
  dx: 0,
  dy: 0,
  onGround: false
};

const gravity = 0.5;
const jumpPower = -8;

// Input
let keys = { left: false, right: false, up: false };
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') keys.left = true;
  if (e.code === 'ArrowRight') keys.right = true;
  if (e.code === 'Space') keys.up = true;
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft') keys.left = false;
  if (e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'Space') keys.up = false;
});

// Mobile controls
document.getElementById('leftBtn').addEventListener('touchstart', () => keys.left = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys.left = false);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys.right = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys.right = false);
document.getElementById('jumpBtn').addEventListener('touchstart', () => keys.up = true);
document.getElementById('jumpBtn').addEventListener('touchend', () => keys.up = false);

function update() {
  // Movement
  if (keys.left) ball.dx = -2;
  else if (keys.right) ball.dx = 2;
  else ball.dx = 0;

  // Jump
  if (keys.up && ball.onGround) {
    ball.dy = jumpPower;
    ball.onGround = false;
  }

  // Gravity
  ball.dy += gravity;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ground collision
  if (ball.y + frameHeight/2 >= canvas.height) {
    ball.y = canvas.height - frameHeight/2;
    ball.dy = 0;
    ball.onGround = true;
  }

  // Animate sprite
  frameTick++;
  if (frameTick > 5) {
    frame = (frame + 1) % frameCount;
    frameTick = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(ballImg, frame * frameWidth, 0, frameWidth, frameHeight, ball.x, ball.y, frameWidth, frameHeight);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

ballImg.onload = () => { loop(); };
