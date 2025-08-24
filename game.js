// ---- Basic setup ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Start loop regardless of image loading so iOS doesn't stall
let last = 0;
requestAnimationFrame(loop);

// ---- Sprite sheet (ball) ----
// Use 128x128 frames (matches provided sheet).
// If the asset is missing, we fall back to drawing a red circle.
const ballImg = new Image();
ballImg.src = 'assets/ball.png';
let ballLoaded = false;
ballImg.onload = () => ballLoaded = true;
ballImg.onerror = () => { console.warn('ball.png missing'); ballLoaded = false; };

const FRAME_W = 128;
const FRAME_H = 128;
const FRAMES = 6;
let frame = 0;
let frameTick = 0;

// ---- Game state ----
const ball = {
  x: 100,   // top-left position for simplicity
  y: 250,
  dx: 0,
  dy: 0,
  onGround: false,
  speed: 3,
};

const gravity = 0.6;
const jumpVel = -10;

// ---- Input (keyboard + touch) ----
const keys = { left:false, right:false, up:false };

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ' || e.key === 'ArrowUp') keys.up = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft')  keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ' || e.key === 'ArrowUp') keys.up = false;
});

function bindBtn(id, key){
  const el = document.getElementById(id);
  const start = (e)=>{ e.preventDefault(); keys[key] = true; };
  const end   = (e)=>{ e.preventDefault(); keys[key] = false; };
  el.addEventListener('touchstart', start, {passive:false});
  el.addEventListener('touchend', end, {passive:false});
  el.addEventListener('touchcancel', end, {passive:false});
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', end);
  el.addEventListener('mouseleave', end);
}
bindBtn('leftBtn','left');
bindBtn('rightBtn','right');
bindBtn('jumpBtn','up');

// ---- Simple level (ground + a couple platforms) ----
const platforms = [
  {x:0, y:430, w:2000, h:50},     // ground
  {x:280, y:360, w:200, h:20},
  {x:620, y:300, w:200, h:20},
];

// ---- Update & Draw ----
function update(dt){
  // horizontal
  if (keys.left)  ball.dx = -ball.speed;
  else if (keys.right) ball.dx = ball.speed;
  else ball.dx = 0;

  // jump
  if (keys.up && ball.onGround){
    ball.dy = jumpVel;
    ball.onGround = false;
  }

  // gravity
  ball.dy += gravity;

  // apply
  ball.x += ball.dx;
  ball.y += ball.dy;

  // collision with platforms (basic AABB, top surface only)
  ball.onGround = false;
  for (const p of platforms){
    const withinX = (ball.x + FRAME_W*0.5) > p.x && (ball.x + FRAME_W*0.5) < (p.x + p.w);
    const hittingTop = (ball.y + FRAME_H) >= p.y && (ball.y + FRAME_H) <= (p.y + p.h + 10);
    if (withinX && hittingTop && ball.dy >= 0){
      ball.y = p.y - FRAME_H;
      ball.dy = 0;
      ball.onGround = true;
    }
  }

  // keep inside canvas horizontally
  if (ball.x < 0) ball.x = 0;
  if (ball.x + FRAME_W > canvas.width) ball.x = canvas.width - FRAME_W;

  // animate frames faster when moving
  frameTick += dt;
  const speedMs = (keys.left || keys.right) ? 70 : 110;
  if (frameTick >= speedMs){
    frame = (frame + 1) % FRAMES;
    frameTick = 0;
  }
}

function draw(){
  // background
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // sky already light blue via CSS; add simple ground shade
  ctx.fillStyle = '#b3e5fc';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // platforms
  ctx.fillStyle = '#7cb342';
  for (const p of platforms){
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // ball
  if (ballLoaded){
    ctx.drawImage(ballImg, frame*FRAME_W, 0, FRAME_W, FRAME_H, ball.x, ball.y, FRAME_W, FRAME_H);
  } else {
    // fallback placeholder so the game still runs if asset missing
    const r = 26;
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(ball.x + FRAME_W/2, ball.y + FRAME_H/2, r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '14px sans-serif';
    ctx.fillText('Missing assets/ball.png', 10, 20);
  }
}

function loop(ts){
  const dt = ts - last; last = ts;
  update(dt || 16);
  draw();
  requestAnimationFrame(loop);
}
