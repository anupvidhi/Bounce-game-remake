(()=>{
const c=document.getElementById("gameCanvas"),x=c.getContext("2d");
let W=window.innerWidth,H=window.innerHeight;c.width=W;c.height=H;
let ball={x:100,y:H-100,r:30,dx:2,dy:0,rot:0,rings:0,meters:0};
let gravity=0.5,jump=-10,ground=H-60;
function drawBall(){x.save();x.translate(ball.x,ball.y);x.rotate(ball.rot);x.fillStyle="red";x.beginPath();x.arc(0,0,ball.r,0,Math.PI*2);x.fill();x.strokeStyle="white";x.lineWidth=4;x.beginPath();x.moveTo(-ball.r,0);x.lineTo(ball.r,0);x.stroke();x.restore();}
function update(){ball.dy+=gravity;ball.y+=ball.dy;ball.x+=ball.dx;ball.rot+=0.1; if(ball.y>ground){ball.y=ground;ball.dy=0;} ball.meters+=0.1;}
function loop(){x.clearRect(0,0,W,H);update();drawBall();document.getElementById("meters").innerText=Math.floor(ball.meters)+" m";document.getElementById("rings").innerText=ball.rings+" rings";requestAnimationFrame(loop);}loop();
document.getElementById("jump").ontouchstart=()=>{if(ball.y>=ground)ball.dy=jump;};
document.getElementById("left").ontouchstart=()=>{ball.dx=-2;};
document.getElementById("right").ontouchstart=()=>{ball.dx=2;};
})();
