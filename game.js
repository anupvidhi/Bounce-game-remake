const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  x: 100,
  y: 300,
  radius: 20,
  dx: 0,
  dy: 0,
  onGround: false
};

const gravity = 0.5;
const jumpPower = -10;
const moveSpeed = 3;
let cameraX = 0;

let leftPressed = false;
let rightPressed = false;

document.getElementById("left").addEventListener("touchstart", () => leftPressed = true);
document.getElementById("left").addEventListener("touchend", () => leftPressed = false);
document.getElementById("right").addEventListener("touchstart", () => rightPressed = true);
document.getElementById("right").addEventListener("touchend", () => rightPressed = false);
document.getElementById("jump").addEventListener("touchstart", () => {
  if (player.onGround) {
    player.dy = jumpPower;
    player.onGround = false;
  }
});

function update() {
  if (leftPressed) {
    player.dx = -moveSpeed;
  } else if (rightPressed) {
    player.dx = moveSpeed;
  } else {
    player.dx = 0;
  }

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  if (player.y + player.radius > canvas.height - 50) {
    player.y = canvas.height - 50 - player.radius;
    player.dy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  cameraX = player.x - canvas.width / 2;
}

function draw() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, 0);

  ctx.fillStyle = "#654321";
  ctx.fillRect(0, canvas.height - 50, 99999, 50);

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.moveTo(player.x - player.radius, player.y);
  ctx.lineTo(player.x + player.radius, player.y);
  ctx.stroke();

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
