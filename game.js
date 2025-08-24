const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 50,
  y: 150, // fixed spawn height
  width: 40,
  height: 40,
  dy: 0,
  dx: 0,
  grounded: false
};

let gravity = 0.8;
let jumpPower = -12;
let moveSpeed = 5;

let keys = { left: false, right: false, up: false };
let rings = 0;

// Platforms
let platforms = [
  {x:0, y:360, width:600, height:40},
  {x:200, y:280, width:100, height:20},
  {x:400, y:220, width:100, height:20},
];

// Rings
let collectibles = [
  {x:220, y:240, collected:false},
  {x:420, y:180, collected:false}
];

// Spikes
let spikes = [
  {x:300, y:340, width:40, height:20}
];

function respawn(){
  player.x = 50;
  player.y = 150;
  player.dx = 0;
  player.dy = 0;
  player.grounded = false;
}

// Controls
document.getElementById("left").addEventListener("touchstart", ()=> keys.left=true);
document.getElementById("left").addEventListener("touchend", ()=> keys.left=false);
document.getElementById("right").addEventListener("touchstart", ()=> keys.right=true);
document.getElementById("right").addEventListener("touchend", ()=> keys.right=false);
document.getElementById("jump").addEventListener("touchstart", ()=> {
  if(player.grounded){
    player.dy = jumpPower;
    player.grounded = false;
  }
});

function update(){
  // Movement
  if(keys.left) player.dx = -moveSpeed;
  else if(keys.right) player.dx = moveSpeed;
  else player.dx = 0;

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  player.grounded = false;

  // Platform collision
  for(let p of platforms){
    if(player.x < p.x + p.width &&
       player.x + player.width > p.x &&
       player.y < p.y + p.height &&
       player.y + player.height > p.y){
      if(player.dy > 0){
        player.y = p.y - player.height;
        player.dy = 0;
        player.grounded = true;
      }
    }
  }

  // Spike collision
  for(let s of spikes){
    if(player.x < s.x + s.width &&
       player.x + player.width > s.x &&
       player.y < s.y + s.height &&
       player.y + player.height > s.y){
       respawn();
    }
  }

  // Collect rings
  for(let c of collectibles){
    if(!c.collected &&
       player.x < c.x + 20 &&
       player.x + player.width > c.x &&
       player.y < c.y + 20 &&
       player.y + player.height > c.y){
         c.collected = true;
         rings++;
         document.getElementById("hud").innerText = "Rings: " + rings;
    }
  }

  // Respawn if fall
  if(player.y > canvas.height){
    respawn();
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Clouds
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(100,80,30,0,Math.PI*2);
  ctx.arc(130,80,40,0,Math.PI*2);
  ctx.arc(160,80,30,0,Math.PI*2);
  ctx.fill();

  // Platforms
  ctx.fillStyle = "brown";
  for(let p of platforms){
    ctx.fillRect(p.x,p.y,p.width,p.height);
    ctx.fillStyle="green";
    ctx.fillRect(p.x,p.y,p.width,10);
    ctx.fillStyle="brown";
  }

  // Rings
  for(let c of collectibles){
    if(!c.collected){
      ctx.beginPath();
      ctx.arc(c.x+10, c.y+10, 15, 0, Math.PI*2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "gold";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "gold";
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Spikes
  ctx.fillStyle="gray";
  for(let s of spikes){
    ctx.beginPath();
    ctx.moveTo(s.x, s.y+s.height);
    ctx.lineTo(s.x+s.width/2, s.y);
    ctx.lineTo(s.x+s.width, s.y+s.height);
    ctx.closePath();
    ctx.fill();
  }

  // Player (red ball)
  ctx.fillStyle="red";
  ctx.beginPath();
  ctx.arc(player.x+player.width/2, player.y+player.height/2, player.width/2, 0, Math.PI*2);
  ctx.fill();
}

function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
