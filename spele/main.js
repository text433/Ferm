const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;

const WORLD={w:1800,h:1200};
const keys=new Set();
const player={x:700,y:520,w:26,h:34,speed:185,dir:'down',step:0};
const camera={x:0,y:0};
let coins=100,energy=100,seeds=12;

const island={x:120,y:120,w:1560,h:960,r:130};
const pond={x:1110,y:250,w:390,h:280,r:70};
const trees=[
 [250,230],[340,205],[430,240],[520,215],[1450,650],[1370,720],[1285,760],[350,840],[445,900],[560,865],[250,700],[1540,330]
].map(([x,y])=>({x,y,w:58,h:76}));
const rocks=[[260,520],[1490,860],[1180,850],[570,280]].map(([x,y])=>({x,y,w:34,h:24}));
const plots=[];
for(let r=0;r<3;r++)for(let c=0;c<5;c++)plots.push({x:700+c*76,y:515+r*66,w:62,h:50,state:0,grow:0});

const rectsOverlap=(a,b)=>a.x<a.x+a.w&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function insideRoundedRect(px,py,o){
 const rx=Math.max(o.x+o.r,Math.min(px,o.x+o.w-o.r));
 const ry=Math.max(o.y+o.r,Math.min(py,o.y+o.h-o.r));
 const dx=px-rx,dy=py-ry;
 return dx*dx+dy*dy<=o.r*o.r;
}
function inIsland(p){
 const pts=[[p.x+5,p.y+15],[p.x+p.w-5,p.y+15],[p.x+5,p.y+p.h-2],[p.x+p.w-5,p.y+p.h-2]];
 return pts.every(([x,y])=>insideRoundedRect(x,y,island));
}
function hitsRect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function blocked(p){
 const hit={x:p.x+5,y:p.y+15,w:p.w-10,h:p.h-15};
 if(!inIsland(p))return true;
 if(hitsRect(hit,{x:pond.x,y:pond.y,w:pond.w,h:pond.h}))return true;
 if(trees.some(t=>hitsRect(hit,{x:t.x+10,y:t.y+48,w:t.w-20,h:t.h-46})))return true;
 if(rocks.some(r=>hitsRect(hit,r)))return true;
 return false;
}
function move(dx,dy,dt){
 const ox=player.x,oy=player.y;
 player.x+=dx*player.speed*dt;
 if(blocked(player))player.x=ox;
 player.y+=dy*player.speed*dt;
 if(blocked(player))player.y=oy;
 if(dx||dy)player.step+=dt*8;
}
function update(dt){
 let dx=0,dy=0;
 if(keys.has('ArrowLeft')||keys.has('a')){dx--;player.dir='left'}
 if(keys.has('ArrowRight')||keys.has('d')){dx++;player.dir='right'}
 if(keys.has('ArrowUp')||keys.has('w')){dy--;player.dir='up'}
 if(keys.has('ArrowDown')||keys.has('s')){dy++;player.dir='down'}
 if(dx&&dy){dx*=0.7071;dy*=0.7071}
 move(dx,dy,dt);
 plots.forEach(p=>{if(p.state===1){p.grow+=dt;if(p.grow>7)p.state=2}});
 camera.x=Math.max(0,Math.min(WORLD.w-canvas.width,player.x-canvas.width/2));
 camera.y=Math.max(0,Math.min(WORLD.h-canvas.height,player.y-canvas.height/2));
}
function action(){
 const cx=player.x+player.w/2,cy=player.y+player.h/2;
 let best=null,dist=999;
 for(const p of plots){const d=Math.hypot(cx-(p.x+p.w/2),cy-(p.y+p.h/2));if(d<dist){dist=d;best=p}}
 if(!best||dist>75)return;
 if(best.state===0&&energy>=2&&seeds>0){best.state=1;best.grow=0;energy-=2;seeds--}
 else if(best.state===2){best.state=0;best.grow=0;coins+=12;seeds++}
 syncHud();
}
function syncHud(){
 document.getElementById('coins').textContent=coins;
 document.getElementById('energy').textContent=energy;
 document.getElementById('seeds').textContent=seeds;
}

function roundedPath(x,y,w,h,r){
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
function drawWater(){
 ctx.fillStyle='#63b9d6';ctx.fillRect(0,0,WORLD.w,WORLD.h);
 ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=2;
 for(let y=28;y<WORLD.h;y+=36){for(let x=((y/36)%2)*18;x<WORLD.w;x+=72){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+10,y-4,x+20,y);ctx.stroke()}}
}
function drawIsland(){
 roundedPath(island.x,island.y+14,island.w,island.h,island.r);ctx.fillStyle='#9a6f3f';ctx.fill();
 roundedPath(island.x,island.y,island.w,island.h,island.r);ctx.fillStyle='#79b85a';ctx.fill();
 roundedPath(island.x+12,island.y+12,island.w-24,island.h-24,island.r-8);ctx.strokeStyle='#93c86d';ctx.lineWidth=5;ctx.stroke();
 for(let y=island.y+34;y<island.y+island.h-25;y+=34){for(let x=island.x+30;x<island.x+island.w-28;x+=38){if(((x+y)/34|0)%7===0){ctx.fillStyle='#609e49';ctx.fillRect(x,y,3,8);ctx.fillRect(x+5,y+2,2,6)}}}
}
function drawPond(){
 roundedPath(pond.x,pond.y,pond.w,pond.h,pond.r);ctx.fillStyle='#5eb3d2';ctx.fill();
 roundedPath(pond.x+10,pond.y+10,pond.w-20,pond.h-20,pond.r-9);ctx.strokeStyle='#8ed3e4';ctx.lineWidth=4;ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;
 for(let y=pond.y+45;y<pond.y+pond.h-20;y+=42){for(let x=pond.x+35;x<pond.x+pond.w-35;x+=80){ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+12,y-5,x+24,y);ctx.stroke()}}
}
function drawPlot(p){
 ctx.fillStyle='#6d4528';ctx.fillRect(p.x+2,p.y+4,p.w,p.h);
 ctx.fillStyle='#93603a';ctx.fillRect(p.x,p.y,p.w,p.h-4);
 ctx.fillStyle='#74492d';for(let yy=p.y+8;yy<p.y+p.h-8;yy+=11)ctx.fillRect(p.x+6,yy,p.w-12,3);
 if(p.state===1){for(let i=0;i<4;i++){const x=p.x+10+i*13;ctx.fillStyle='#3d7e3d';ctx.fillRect(x,p.y+19,4,15);ctx.fillRect(x-3,p.y+20,4,4);ctx.fillRect(x+4,p.y+17,4,4)}}
 if(p.state===2){for(let i=0;i<4;i++){const x=p.x+9+i*13;ctx.fillStyle='#477f3c';ctx.fillRect(x+3,p.y+22,3,16);ctx.fillStyle='#e5c55c';ctx.fillRect(x,p.y+11,9,14);ctx.fillStyle='#f1dd7d';ctx.fillRect(x+2,p.y+9,5,5)}}
}
function drawTree(t){
 ctx.fillStyle='rgba(39,57,35,.25)';ctx.beginPath();ctx.ellipse(t.x+29,t.y+69,26,9,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#70462b';ctx.fillRect(t.x+24,t.y+45,11,30);
 ctx.fillStyle='#285f36';ctx.beginPath();ctx.arc(t.x+29,t.y+30,28,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#367947';ctx.beginPath();ctx.arc(t.x+18,t.y+23,18,0,Math.PI*2);ctx.arc(t.x+40,t.y+20,18,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#4b9252';ctx.beginPath();ctx.arc(t.x+28,t.y+12,16,0,Math.PI*2);ctx.fill();
}
function drawRock(r){ctx.fillStyle='#6c6d60';ctx.beginPath();ctx.moveTo(r.x,r.y+r.h);ctx.lineTo(r.x+5,r.y+7);ctx.lineTo(r.x+18,r.y);ctx.lineTo(r.x+r.w-3,r.y+9);ctx.lineTo(r.x+r.w,r.y+r.h);ctx.closePath();ctx.fill();ctx.fillStyle='#8b8b78';ctx.fillRect(r.x+10,r.y+5,10,4)}
function drawPlayer(){
 const x=player.x,y=player.y,bob=Math.sin(player.step)*1.5;
 ctx.fillStyle='rgba(38,52,31,.3)';ctx.beginPath();ctx.ellipse(x+13,y+34,12,5,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(0,bob);
 ctx.fillStyle='#6d3d25';ctx.fillRect(x+5,y+24,7,10);ctx.fillRect(x+15,y+24,7,10);
 ctx.fillStyle='#3f6e8e';ctx.fillRect(x+4,y+12,18,15);
 ctx.fillStyle='#d99a63';ctx.fillRect(x+7,y+1,12,12);
 ctx.fillStyle='#714026';ctx.fillRect(x+5,y-2,16,6);ctx.fillRect(x+17,y+2,5,5);
 ctx.fillStyle='#f2c18e';if(player.dir==='left')ctx.fillRect(x+5,y+13,4,10);else if(player.dir==='right')ctx.fillRect(x+18,y+13,4,10);else{ctx.fillRect(x+3,y+14,4,9);ctx.fillRect(x+20,y+14,4,9)}
 ctx.restore();
}
function drawFence(){
 ctx.fillStyle='#8a5a33';
 for(let x=665;x<1110;x+=42){ctx.fillRect(x,470,8,38);ctx.fillRect(x-5,469,18,6)}
 ctx.fillRect(660,485,455,6);
}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.save();ctx.translate(-camera.x,-camera.y);
 drawWater();drawIsland();drawPond();drawFence();plots.forEach(drawPlot);rocks.forEach(drawRock);trees.forEach(drawTree);drawPlayer();
 ctx.restore();
}
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame)}
requestAnimationFrame(frame);syncHud();
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);if(e.key===' '||e.key==='Enter'){e.preventDefault();action()}});
addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
document.querySelectorAll('[data-key]').forEach(btn=>{const k=btn.dataset.key;const down=e=>{e.preventDefault();keys.add(k)};const up=e=>{e.preventDefault();keys.delete(k)};btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up)});
document.getElementById('action').addEventListener('pointerdown',e=>{e.preventDefault();action()});
