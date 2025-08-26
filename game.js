const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
let keys={left:false,right:false,jump:false};
document.getElementById("left").ontouchstart=()=>keys.left=true;
document.getElementById("left").ontouchend=()=>keys.left=false;
document.getElementById("right").ontouchstart=()=>keys.right=true;
document.getElementById("right").ontouchend=()=>keys.right=false;
document.getElementById("jump").ontouchstart=()=>keys.jump=true;
document.getElementById("jump").ontouchend=()=>keys.jump=false;

let ball={x:100,y:300,r:20,vy:0,onGround:false,angle:0,rings:0,meters:0};
let gravity=0.8,jumpPower=-12,speed=4;
let platforms=[{x:0,y:350,w:1000}];
let spikes=[],rings=[],clouds=[];
function reset(){ball.x=100;ball.y=300;ball.vy=0;ball.angle=0;ball.rings=0;ball.meters=0;
platforms=[{x:0,y:350,w:1000}];spikes=[];rings=[];clouds=[];}
function spawn(){let last=platforms[platforms.length-1];let nx=last.x+last.w+100;
let ny=350+(Math.random()*40-20);platforms.push({x:nx,y:ny,w:600});
if(Math.random()<0.5)spikes.push({x:nx+200,y:ny-20});if(Math.random()<0.5)rings.push({x:nx+300,y:ny-80});
if(Math.random()<0.3)clouds.push({x:nx+Math.random()*500,y:50+Math.random()*150});}
function update(){
  if(keys.left)ball.x-=speed;
  if(keys.right){ball.x+=speed;ball.meters+=0.1;}
  if(keys.jump&&ball.onGround){ball.vy=jumpPower;ball.onGround=false;}
  ball.vy+=gravity;ball.y+=ball.vy;
  ball.onGround=false;
  for(let p of platforms){if(ball.x>p.x&&ball.x<p.x+p.w&&ball.y+ball.r>=p.y){
    ball.y=p.y-ball.r;ball.vy=0;ball.onGround=true;}}
  for(let s of spikes){if(Math.abs(ball.x-s.x)<20&&Math.abs(ball.y-s.y)<20)reset();}
  for(let i=rings.length-1;i>=0;i--){let r=rings[i];if(Math.abs(ball.x-r.x)<20&&Math.abs(ball.y-r.y)<20){ball.rings++;rings.splice(i,1);}}
  if(ball.y>canvas.height)reset();
  if(ball.x>platforms[platforms.length-1].x+200)spawn();
  ball.angle+=(keys.left?-0.1:keys.right?0.1:0);
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#87CEEB";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#fff";for(let c of clouds){ctx.beginPath();ctx.arc(c.x-ball.x+100,c.y,30,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#654321";for(let p of platforms){ctx.fillRect(p.x-ball.x+100,p.y, p.w, canvas.height-p.y);}
  ctx.fillStyle="red";ctx.beginPath();ctx.arc(100,ball.y,ball.r,0,Math.PI*2);ctx.fill();
  // stripes
  ctx.save();ctx.translate(100,ball.y);ctx.rotate(ball.angle);
  ctx.strokeStyle="#fff";ctx.beginPath();ctx.moveTo(-ball.r,0);ctx.lineTo(ball.r,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,-ball.r);ctx.lineTo(0,ball.r);ctx.stroke();ctx.restore();
  // shadow
  let shadowScale=1-Math.min(1,(350-ball.y)/100);
  ctx.fillStyle="rgba(0,0,0,0.3)";ctx.beginPath();
  ctx.ellipse(100,350,ball.r*shadowScale*1.2,ball.r*0.4*shadowScale,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="yellow";for(let r of rings){ctx.beginPath();ctx.arc(r.x-ball.x+100,r.y,10,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle="black";for(let s of spikes){ctx.beginPath();ctx.moveTo(s.x-ball.x+100,s.y);
  ctx.lineTo(s.x-ball.x+90,s.y+40);ctx.lineTo(s.x-ball.x+110,s.y+40);ctx.closePath();ctx.fill();}
  document.getElementById("meters").innerText=Math.floor(ball.meters);
  document.getElementById("rings").innerText=ball.rings;
}
function loop(){update();draw();requestAnimationFrame(loop);}loop();
