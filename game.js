(()=>{
const cvs=document.getElementById('game'),ctx=cvs.getContext('2d');
function resize(){cvs.width=innerWidth; cvs.height=innerHeight;} resize(); addEventListener('resize',resize);

const GRAV=0.75, JUMP=-13, SPEED=4, GROUND_Y=0; // ground computed per platform
const PLAYER_R=22;
const WORLD={platforms:[],spikes:[],rings:[],clouds:[], lastGenX:0};

const player={x:120,y:180,dx:0,dy:0,onGround:false,rot:0,lastSafe:{x:120,y:180}};
let cameraX=0, maxForwardX=player.x, meters=0, ringCount=0;

// --- Controls (mobile only) ---
let holdL=false, holdR=false;
const leftBtn=document.getElementById('btn-left');
const rightBtn=document.getElementById('btn-right');
const jumpBtn=document.getElementById('btn-jump');
function hold(btn, setter){
  btn.addEventListener('touchstart',e=>{e.preventDefault(); setter(true);},{passive:false});
  btn.addEventListener('touchend',e=>{e.preventDefault(); setter(false);},{passive:false});
  btn.addEventListener('touchcancel',e=>{e.preventDefault(); setter(false);},{passive:false});
}
hold(leftBtn,v=>holdL=v); hold(rightBtn,v=>holdR=v);
jumpBtn.addEventListener('touchstart',e=>{e.preventDefault(); if(player.onGround){player.dy=JUMP; player.onGround=false;}},{passive:false});

// --- Helpers ---
function rand(a,b){return Math.random()*(b-a)+a|0;}

// Initial terrain & clouds
function initWorld(){
  WORLD.platforms.push({x:0,y:cvs.height-70,w:800,h:70});
  WORLD.lastGenX=800;
  for(let i=0;i<12;i++){
    WORLD.clouds.push({x:rand(0,2000),y:rand(40,200),r:rand(18,36)});
  }
}
initWorld();

function genChunk(){
  // Base next platform
  const last=WORLD.platforms[WORLD.platforms.length-1];
  const gap=rand(60,160);
  const w=rand(160,260);
  let y=last.y + rand(-90,90);
  y=Math.max(140, Math.min(cvs.height-90, y));
  const x=last.x+last.w+gap;
  WORLD.platforms.push({x,y,w,h:20});

  // Occasionally add mid-air step
  if(Math.random()<0.35){
    const sX=x+rand(40,w-60), sY=y-rand(60,110);
    WORLD.platforms.push({x:sX,y:sY,w:rand(80,140),h:16});
  }
  // Spikes
  if(Math.random()<0.55){
    WORLD.spikes.push({x:x+rand(10,w-40),y:y-18,w:26,h:18});
  }
  // Ring above
  if(Math.random()<0.7){
    WORLD.rings.push({x:x+rand(30,w-30),y:y-rand(70,120),r:14,hit:false});
  }
  // More clouds ahead
  for(let i=0;i<3;i++){
    WORLD.clouds.push({x:x+rand(0,600),y:rand(30,220),r:rand(18,36)});
  }
  WORLD.lastGenX = x+w;
}

// Collision: circle vs AABB
function circleRect(cx,cy,cr, r){
  const nx=Math.max(r.x, Math.min(cx, r.x+r.w));
  const ny=Math.max(r.y, Math.min(cy, r.y+r.h));
  const dx=cx-nx, dy=cy-ny;
  return dx*dx+dy*dy <= cr*cr;
}

function update(){
  // Input → velocity (no auto-roll)
  if(holdL) player.dx=-SPEED; else if(holdR) player.dx=SPEED; else player.dx=0;

  // Physics
  player.dy+=GRAV;
  player.x+=player.dx;
  player.y+=player.dy;

  // Platforms collision (landing only, from above)
  player.onGround=false;
  for(const p of WORLD.platforms){
    // broad-phase
    if(player.x+PLAYER_R < p.x-40 || player.x-PLAYER_R > p.x+p.w+40) continue;
    // check landing
    const wasAbove = (player.y-PLAYER_R) <= p.y;
    if(wasAbove && circleRect(player.x, player.y, PLAYER_R, p)){
      player.y = p.y-PLAYER_R;
      player.dy = 0;
      player.onGround = true;
      player.lastSafe.x = player.x; player.lastSafe.y = player.y;
    }
  }

  // Spikes
  for(const s of WORLD.spikes){
    if(player.x+PLAYER_R < s.x-20 || player.x-PLAYER_R > s.x+s.w+20) continue;
    if(circleRect(player.x, player.y, PLAYER_R*0.9, {x:s.x,y:s.y,w:s.w,h:s.h+8})) {
      // auto respawn
      player.x = player.lastSafe.x; player.y = player.lastSafe.y; player.dx=0; player.dy=0;
      break;
    }
  }

  // Collect rings
  for(const r of WORLD.rings){
    if(r.hit) continue;
    if(Math.hypot(player.x-r.x, player.y-r.y) < (PLAYER_R*0.6 + r.r)){
      r.hit=true; ringCount++;
    }
  }

  // Fall off screen → respawn
  if(player.y - PLAYER_R > cvs.height+200){
    player.x = player.lastSafe.x; player.y = player.lastSafe.y; player.dx=0; player.dy=0;
  }

  // Rolling rotation (based on horizontal speed)
  player.rot += (player.dx / PLAYER_R);

  // Camera follow (horizontal only)
  cameraX = player.x - cvs.width*0.33;
  if(cameraX<0) cameraX=0;

  // Distance only increases when moving forward beyond previous best
  if(player.x > maxForwardX){
    meters += (player.x - maxForwardX)*0.05; // tune scaling → meters
    maxForwardX = player.x;
  }

  // Generate ahead
  while(WORLD.lastGenX < player.x + cvs.width*1.5) genChunk();
  // Trim far-behind objects for perf
  const cutoff=cameraX-200;
  WORLD.platforms = WORLD.platforms.filter(p=>p.x+p.w>cutoff);
  WORLD.spikes    = WORLD.spikes.filter(s=>s.x+s.w>cutoff);
  WORLD.rings     = WORLD.rings.filter(r=>r.x>cutoff-50 && !r.hit);
  WORLD.clouds    = WORLD.clouds.filter(cl=>cl.x>cutoff-400);
}

function drawBackground(){
  // sky already set via CSS; draw clouds (parallax 0.5)
  ctx.fillStyle='#fff';
  for(const cl of WORLD.clouds){
    const sx = cl.x - cameraX*0.5;
    const y = cl.y;
    // puffy cloud made of 3–4 circles
    ctx.beginPath(); ctx.arc(sx, y, cl.r, 0, Math.PI*2);
    ctx.arc(sx+cl.r*0.9, y+cl.r*0.1, cl.r*1.2, 0, Math.PI*2);
    ctx.arc(sx-cl.r*0.8, y+cl.r*0.2, cl.r, 0, Math.PI*2);
    ctx.arc(sx+cl.r*0.1, y-cl.r*0.6, cl.r*0.8, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawWorld(){
  ctx.save();
  ctx.translate(-cameraX,0);

  // Platforms (cartoony green top)
  for(const p of WORLD.platforms){
    ctx.fillStyle='#6b4b2a'; ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle='#2ecc71'; ctx.fillRect(p.x, p.y, p.w, 6);
  }

  // Spikes
  ctx.fillStyle='#d9d9d9';
  for(const s of WORLD.spikes){
    ctx.beginPath();
    ctx.moveTo(s.x, s.y+s.h);
    ctx.lineTo(s.x+s.w*0.5, s.y);
    ctx.lineTo(s.x+s.w, s.y+s.h);
    ctx.closePath();
    ctx.fill();
  }

  // Rings (glow)
  for(const r of WORLD.rings){
    if(r.hit) continue;
    ctx.save();
    ctx.shadowBlur=10; ctx.shadowColor='gold';
    ctx.lineWidth=5; ctx.strokeStyle='gold'; ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  // Player (rolling ball with stripes)
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.rot);
  ctx.fillStyle='red';
  ctx.beginPath(); ctx.arc(0,0,PLAYER_R,0,Math.PI*2); ctx.fill();
  // drop shadow
  ctx.globalAlpha=0.25; ctx.beginPath(); ctx.ellipse(0,PLAYER_R*0.85,PLAYER_R*0.9,PLAYER_R*0.35,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  // stripes
  ctx.lineWidth=4; ctx.strokeStyle='#fff';
  ctx.beginPath(); ctx.moveTo(-PLAYER_R,0); ctx.lineTo(PLAYER_R,0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-PLAYER_R); ctx.lineTo(0,PLAYER_R); ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function loop(){
  update();
  ctx.clearRect(0,0,cvs.width,cvs.height);
  drawBackground();
  drawWorld();
  // HUD
  document.getElementById('hud-distance').textContent = Math.floor(meters)+' m';
  document.getElementById('hud-rings').textContent = ringCount+' rings';
  requestAnimationFrame(loop);
}
loop();
})();