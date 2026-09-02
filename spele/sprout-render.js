(()=>{
  const A={};
  const load=(k,src)=>{const im=new Image();im.src=src;A[k]=im;};
  load('grass','assets/grass.png');
  load('water','assets/water.png');
  load('tree','assets/tree.png');
  load('character','assets/character.png');
  load('plants','data:image/png;base64,'+window.__plantsData);

  fetch('assets/plants.b64').then(r=>r.text()).then(s=>{window.__plantsData=s.trim();A.plants.src='data:image/png;base64,'+window.__plantsData;});

  window.drawWater=function(){
    if(A.water.complete&&A.water.naturalWidth){const p=ctx.createPattern(A.water,'repeat');ctx.fillStyle=p;ctx.fillRect(0,0,WORLD.w,WORLD.h);}else{ctx.fillStyle='#63b9d6';ctx.fillRect(0,0,WORLD.w,WORLD.h);}
  };
  window.drawIsland=function(){
    roundedPath(island.x,island.y+14,island.w,island.h,island.r);ctx.fillStyle='#8c633c';ctx.fill();
    ctx.save();roundedPath(island.x,island.y,island.w,island.h,island.r);ctx.clip();
    if(A.grass.complete&&A.grass.naturalWidth){const p=ctx.createPattern(A.grass,'repeat');ctx.fillStyle=p;ctx.fillRect(island.x,island.y,island.w,island.h);}else{ctx.fillStyle='#79b85a';ctx.fillRect(island.x,island.y,island.w,island.h);}ctx.restore();
  };
  window.drawTree=function(t){ctx.fillStyle='rgba(38,52,31,.22)';ctx.beginPath();ctx.ellipse(t.x+30,t.y+71,25,8,0,0,Math.PI*2);ctx.fill();if(A.tree.complete&&A.tree.naturalWidth)ctx.drawImage(A.tree,t.x-3,t.y-12,64,88);};
  window.drawPlayer=function(){const bob=Math.sin(player.step)*1.2;ctx.fillStyle='rgba(38,52,31,.25)';ctx.beginPath();ctx.ellipse(player.x+13,player.y+33,11,4,0,0,Math.PI*2);ctx.fill();if(A.character.complete&&A.character.naturalWidth)ctx.drawImage(A.character,player.x-11,player.y-9+bob,48,48);};
  window.drawPlot=function(p){
    ctx.fillStyle='#6d4528';ctx.fillRect(p.x+2,p.y+4,p.w,p.h);ctx.fillStyle='#93603a';ctx.fillRect(p.x,p.y,p.w,p.h-4);ctx.fillStyle='#74492d';for(let yy=p.y+8;yy<p.y+p.h-8;yy+=11)ctx.fillRect(p.x+6,yy,p.w-12,3);
    if(p.state>0&&A.plants.complete&&A.plants.naturalWidth){const sw=16,sh=16;const stage=p.state===2?3:1;ctx.drawImage(A.plants,stage*sw,0,sw,sh,p.x+15,p.y+8,32,32);}
  };
})();