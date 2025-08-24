// Bounce – Final Build

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hudCount = document.getElementById('ringCount');
const overlay = document.getElementById('overlay');

// Load assets
const assets = {
  bg: loadImage('assets/background.png'),
  ball: loadImage('assets/ball.png'),      // 6 frames, 128x128 each
  ring: loadImage('assets/ring.png'),
  spike: loadImage('assets/spike.png'),
  platform: loadImage('assets/platform.png'),
  portal: loadImage('assets/portal.png')
};

function loadImage(src){
  const img = new Image();
  img.src = src;
  return img;
}

// Camera
let camX = 0;

// Level data
const FRAME_W = 128, FRAME_H = 128, BALL_FRAMES = 6;
const TILE_W = 128, TILE_H = 64;

const platforms = [
  // x, y are world coordinates
  {x: 0,   y: 360},  // start
  {x: 200, y: 300},
  {x: 380, y: 260},
  {x: 580, y: 320},
  {x: 780, y: 260},
  {x: 980, y: 320},
];

const rings = [
  {x: 235, y: 240, taken:false},
  {x: 610, y: 220, taken:false},
];

const spikes = [
  {x: 470, y: 332}, // near third platform gap
];

const portal = {x: 1150, y: 240};

// Player
const player = {
  x: 40,
  y: 260,
  vx: 0, vy: 0,
  speed: 3.2,
  onGround: false,
  frame: 0, frameTimer: 0
};
let ringCount = 0;
let respawn = {x: 40, y: 260};

// Input
const keys = {left:false, right:false, up:false};
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowUp' || e.key === ' ') keys.up = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowUp' || e.key === ' ') keys.up = false;
});
bindBtn('leftBtn','left'); bindBtn('rightBtn','right'); bindBtn('jumpBtn','up');
function bindBtn(id, key){
  const el = document.getElementById(id);
  const on = e=>{ e.preventDefault(); keys[key]=true; };
  const off= e=>{ e.preventDefault(); keys[key]=false; };
  el.addEventListener('touchstart', on, {passive:false});
  el.addEventListener('touchend', off, {passive:false});
  el.addEventListener('touchcancel', off, {passive:false});
  el.addEventListener('mousedown', on);
  el.addEventListener('mouseup', off);
  el.addEventListener('mouseleave', off);
}

// Physics
const GRAV = 0.6, JUMP = -10, FRICTION = 0.85;

// Helpers
function aabb(ax,ay,aw,ah,bx,by,bw,bh){
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

function update(dt){
  // Horizontal input
  if (keys.left)  player.vx = -player.speed;
  else if (keys.right) player.vx = player.speed;
  else player.vx *= FRICTION;

  // Jump
  if (keys.up && player.onGround){
    player.vy = JUMP;
    player.onGround = false;
  }

  // Gravity
  player.vy += GRAV;

  // Integrate
  player.x += player.vx;
  player.y += player.vy;

  // Collide with platforms (treat each platform as TILE_W x TILE_H)
  player.onGround = false;
  for (const p of platforms){
    const px = p.x, py = p.y, pw = TILE_W, ph = TILE_H;
    // Only check if close to camera for performance
    if (px+pw > camX-200 && px < camX + canvas.width + 200){
      // From above landing
      if (aabb(player.x, player.y, FRAME_W, FRAME_H, px, py, pw, ph)){
        // simplistic: put player on top if falling
        const wasAbove = (player.y + FRAME_H - player.vy) <= py;
        if (wasAbove && player.vy >= 0){
          player.y = py - FRAME_H;
          player.vy = 0;
          player.onGround = true;
          // update respawn to latest platform touched
          respawn = {x: player.x, y: player.y};
        } else {
          // avoid clipping sides crudely
          if (player.x < px) player.x = px - FRAME_W;
          else player.x = px + pw;
          player.vx = 0;
        }
      }
    }
  }

  // Rings
  for (const r of rings){
    if (!r.taken && aabb(player.x+20, player.y+20, 88, 88, r.x+32, r.y+32, 64, 64)){
      r.taken = true; ringCount += 1; hudCount.textContent = ringCount.toString();
    }
  }

  // Spikes – if touch, respawn
  for (const s of spikes){
    if (aabb(player.x+24, player.y+80, 80, 40, s.x+10, s.y+40, 108, 78)){
      // pop + respawn
      player.x = respawn.x; player.y = respawn.y;
      player.vx = 0; player.vy = 0;
      // optionally flash
    }
  }

  // Portal – complete
  if (aabb(player.x+40, player.y+40, 48, 48, portal.x+24, portal.y+24, 80, 80)){
    overlay.classList.remove('hidden');
    overlay.textContent = 'Level Complete! Rings: ' + ringCount + ' ✅';
  }

  // Camera follows player (center-ish)
  const target = player.x + FRAME_W/2 - canvas.width/2;
  camX += (target - camX) * 0.12;
  if (camX < 0) camX = 0;

  // Animate ball frames
  player.frameTimer += dt;
  const msPerFrame = (Math.abs(player.vx) > 0.2) ? 70 : 110;
  if (player.frameTimer >= msPerFrame){
    player.frame = (player.frame + 1) % BALL_FRAMES;
    player.frameTimer = 0;
  }
}

function draw(){
  // Background
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if (assets.bg.complete){
    // parallax slight
    const bgX = - (camX * 0.3) % canvas.width;
    ctx.drawImage(assets.bg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.bg, bgX + canvas.width, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#9ed0ff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  // Platforms
  for (const p of platforms){
    const sx = p.x - camX;
    if (sx > -TILE_W && sx < canvas.width){
      ctx.drawImage(assets.platform, sx, p.y, TILE_W, TILE_H);
    }
  }

  // Rings
  for (const r of rings){
    if (r.taken) continue;
    const sx = r.x - camX;
    ctx.drawImage(assets.ring, sx, r.y, 128, 128);
  }

  // Spikes
  for (const s of spikes){
    const sx = s.x - camX;
    ctx.drawImage(assets.spike, sx, s.y, 128, 128);
  }

  // Portal
  ctx.drawImage(assets.portal, portal.x - camX, portal.y, 128, 128);

  // Player (ball)
  const sx = player.frame * FRAME_W;
  ctx.drawImage(assets.ball, sx, 0, FRAME_W, FRAME_H, player.x - camX, player.y, FRAME_W, FRAME_H);
}

let last = 0;
function loop(ts){
  const dt = ts - last; last = ts;
  update(dt || 16);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
