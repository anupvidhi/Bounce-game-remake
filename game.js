const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
let rings = 0;
let distance = 0;

const player = {
  x: 100,
  y: 300,
  width: 40,
  height: 40,
  vy: 0,
  onGround: false,
};

let cameraX = 0;
let gravity = 0.6;
let jumpPower = -12;
let moveSpeed = 5;

let platforms = [{ x: 0, y: 400, width: 800, height: 40 }];
let spikes = [];
let ringsList = [];

// Input handling
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.getElementById("leftBtn").addEventListener("touchstart", () => keys["ArrowLeft"] = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys["ArrowLeft"] = false);

document.getElementById("rightBtn").addEventListener("touchstart", () => keys["ArrowRight"] = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys["ArrowRight"] = false);

document.getElementById("jumpBtn").addEventListener("touchstart", () => {
  if (player.onGround) {
    player.vy = jumpPower;
    player.onGround = false;
  }
});

// Generate random objects
function generateObjects() {
  let lastPlat = platforms[platforms.length - 1];
  let newX = lastPlat.x + lastPlat.width + Math.random() * 100 + 100;
  let newY = 350 + Math.random() * 100 - 50;
  platforms.push({ x: newX, y: newY, width: 200, height: 40 });

  if (Math.random() > 0.6) {
    spikes.push({ x: newX + 50, y: newY - 20, width: 40, height: 20 });
  }

  if (Math.random() > 0.5) {
    ringsList.push({ x: newX + 100, y: newY - 80, radius: 15, collected: false });
  }
}

// Update loop
function update() {
  if (keys["ArrowLeft"]) player.x -= moveSpeed;
  if (keys["ArrowRight"]) {
    player.x += moveSpeed;
    distance += 0.1; // forward-only distance
  }

  player.vy += gravity;
  player.y += player.vy;

  player.onGround = false;
  for (let p of platforms) {
    if (player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y + player.height > p.y &&
        player.y + player.height < p.y + p.height) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
    }
  }

  for (let s of spikes) {
    if (player.x < s.x + s.width &&
        player.x + player.width > s.x &&
        player.y + player.height > s.y) {
      respawn();
    }
  }

  for (let r of ringsList) {
    if (!r.collected &&
        Math.hypot(player.x - r.x, player.y - r.y) < r.radius + 20) {
      r.collected = true;
      rings++;
    }
  }

  if (player.y > canvas.height) respawn();

  cameraX = player.x - canvas.width / 2;

  if (platforms[platforms.length - 1].x < player.x + canvas.width) {
    generateObjects();
  }
}

// Respawn
function respawn() {
  player.x = cameraX + 100;
  player.y = 200;
  player.vy = 0;
}

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);

  ctx.fillStyle = "#654321";
  for (let p of platforms) {
    ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
  }

  ctx.fillStyle = "red";
  for (let s of spikes) {
    ctx.beginPath();
    ctx.moveTo(s.x - cameraX, s.y + s.height);
    ctx.lineTo(s.x + s.width / 2 - cameraX, s.y);
    ctx.lineTo(s.x + s.width - cameraX, s.y + s.height);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 4;
  for (let r of ringsList) {
    if (!r.collected) {
      ctx.beginPath();
      ctx.arc(r.x - cameraX, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  document.getElementById("rings").innerText = "Rings: " + rings;
  document.getElementById("distance").innerText = "Distance: " + Math.floor(distance) + " m";
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
