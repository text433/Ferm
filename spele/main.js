const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;

const WORLD={w:1600,h:1000};
const keys=new Set();
const player={x:520,y:430,w:26,h:34,speed:190,dir:'down'};
const camera={x:0,y:0};
let coins=100,energy=100;

const water=[
  {x:0,y:0,w:1600,h:135},
  {x:0,y:865,w:1600,h:135},
  {x:0,y:0,w:120,h:1000},
  {x:1480,y:0,w:120,h:1000},
  {x:1030,y:135,w:450,h:250}
];
const trees=[
  [220,220],[300,205],[385,230],[1280,480],[1360,520],[1220,610],[270,700],[360,760],[470,735],[1120,760]
].map(([x,y])=>({x,y,w:54,h:66}));
const plots=[];
for(let r=0;r<3;r++)for(let c=0;c<5;c++)plots.push({x:650+c*72,y:410+r*68,w:58,h:48,state:0,grow:0});

function rectsOverlap(a,b){return a.x<a2(b)&&a2(a)>b.x&&a.y<b2(b)&&b2(a)>b.y}
function a2(o){return o.x+o.w} function b2(o){return o.y+o.h}
function blocked(p){
  const hit={x:p.x+4,y:p.y+12,w:p.w-8,h:p.h-12};
  if(water.some(o=>rectsOverlap(hit,o)))return true;
  if(trees.some(o=>rectsOverlap(hit,{x:o.x+8,y:o.y+38,w:o.w-16,h:o.h-38})))return true;
  return false;
}
function move(dx,dy,dt){
  const oldX=player.x,oldY=player.y;
  player.x+=dx*player.speed*dt;
  player.y+=dy*player.speed*dt;
  player.x=Math.max(120,Math.min(WORLD.w-120-player.w,player.x));
  player.y=Math.max(135,Math.min(WORLD.h-135-player.h,player.y));
  if(blocked(player)){player.x=oldX;player.y=oldY}
}
function update(dt){
  let dx=0,dy=0;
  if(keys.has('ArrowLeft')||keys.has('a')){dx--;player.dir='left'}
  if(keys.has('ArrowRight')||keys.has('d')){dx++;player.dir='right'}
  if(keys.has('ArrowUp')||keys.has('w')){dy--;player.dir='up'}
  if(keys.has('ArrowDown')||keys.has('s')){dy++;player.dir='down'}
  if(dx&&dy){dx*=0.7071;dy*=0.7071}
  move(dx,dy,dt);
  plots.forEach(p=>{if(p.state===1){p.grow+=dt;if(p.grow>8)p.state=2}});
  camera.x=Math.max(0,Math.min(WORLD.w-canvas.width,player.x-canvas.width/2));
  camera.y=Math.max(0,Math.min(WORLD.h-canvas.height,player.y-canvas.height/2));
}
function action(){
  const cx=player.x+player.w/2,cy=player.y+player.h/2;
  let best=null,dist=999;
  for(const p of plots){const d=Math.hypot(cx-(p.x+p.w/2),cy-(p.y+p.h/2));if(d<dist){dist=d;best=p}}
  if(!best||dist>72)return;
  if(best.state===0&&energy>=2){best.state=1;best.grow=0;energy-=2}
  else if(best.state===2){best.state=0;best.grow=0;coins+=12}
  document.getElementById('coins').textContent=coins;
  document.getElementById('energy').textContent=energy;
}
function drawGrass(){
  ctx.fillStyle='#78bd64';ctx.fillRect(0,0,WORLD.w,WORLD.h);
  ctx.fillStyle='#6eb159';
  for(let y=150;y<WORLD.h-130;y+=32)for(let x=125;x<WORLD.w-120;x+=32){if(((x/32+y/32)|0)%5===0)ctx.fillRect(x+5,y+8,3,7)}
}
function drawWater(){
  ctx.fillStyle='#4fa9c8';water.forEach(w=>ctx.fillRect(w.x,w.y,w.w,w.h));
  ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=3;
  for(let y=30;y<WORLD.h;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(WORLD.w,y);ctx.stroke()}
}
function drawPlot(p){
  ctx.fillStyle='#8b5a34';ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.fillStyle='#6f4529';
  for(let y=p.y+8;y<p.y+p.h;y+=12)ctx.fillRect(p.x+5,y,p.w-10,4);
  if(p.state===1){ctx.fillStyle='#67a743';for(let i=0;i<4;i++){ctx.fillRect(p.x+10+i*12,p.y+17,5,13)}}
  if(p.state===2){ctx.fillStyle='#e4c14a';for(let i=0;i<4;i++){ctx.fillRect(p.x+9+i*12,p.y+12,7,21);ctx.fillStyle='#7fb84f';ctx.fillRect(p.x+11+i*12,p.y+27,3,9);ctx.fillStyle='#e4c14a'}}
}
function drawTree(t){
  ctx.fillStyle='#6f4529';ctx.fillRect(t.x+22,t.y+40,12,26);
  ctx.fillStyle='#2f773f';ctx.beginPath();ctx.arc(t.x+27,t.y+27,28,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#469354';ctx.beginPath();ctx.arc(t.x+18,t.y+17,16,0,Math.PI*2);ctx.fill();
}
function drawPlayer(){
  const x=player.x,y=player.y;
  ctx.fillStyle='#e4b47b';ctx.fillRect(x+7,y,12,12);
  ctx.fillStyle='#d95b45';ctx.fillRect(x+4,y+12,18,14);
  ctx.fillStyle='#355f89';ctx.fillRect(x+5,y+26,7,8);ctx.fillRect(x+14,y+26,7,8);
  ctx.fillStyle='#3a2a22';ctx.fillRect(x+5,y-3,16,5);
}
function draw(){
  ctx.save();ctx.translate(-camera.x,-camera.y);
  drawGrass();drawWater();plots.forEach(drawPlot);trees.forEach(drawTree);drawPlayer();
  ctx.restore();
}
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys.add(k);if(e.key===' '||e.key==='Enter')action();});
addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
document.querySelectorAll('[data-key]').forEach(btn=>{
 const k=btn.dataset.key;
 const down=e=>{e.preventDefault();keys.add(k)};const up=e=>{e.preventDefault();keys.delete(k)};
 btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
});
document.getElementById('action').addEventListener('pointerdown',e=>{e.preventDefault();action()});
