(function(){
function blossom(x,y,s,r,dl){
  var p='',i;
  for(i=0;i<5;i++)p+='<ellipse cx="0" cy="-7.2" rx="5.6" ry="8.2" transform="rotate('+i*72+')" fill="#ffc6df" stroke="#e0679d" stroke-width="1.5"/>';
  return '<g transform="translate('+x+' '+y+') rotate('+r+') scale('+s+')"><g class="bl" style="animation-delay:'+dl+'s">'+p+'<circle r="3.2" fill="#ffd966" stroke="#d99a00" stroke-width="1.3"/><circle cx="-1" cy="-1" r="1" fill="#fff" opacity=".8"/></g></g>';
}
function branch(){
  var wood='<path d="M-10 18C60 30 100 60 170 70S270 110 330 150" fill="none" stroke="#6e3f33" stroke-width="10" stroke-linecap="round"/><path d="M80 40C100 20 130 20 150 30M130 62C150 90 160 110 150 140M210 90C230 70 260 66 290 74M250 112C270 140 276 160 270 190M40 26C50 6 70 2 86 8" fill="none" stroke="#6e3f33" stroke-width="5.4" stroke-linecap="round"/>';
  var B=[[150,30,1.2],[126,24,1],[104,36,.9],[86,8,1],[62,26,.9],[150,140,1.2],[158,112,1],[136,100,.8],[290,74,1.1],[266,70,1],[242,76,.9],[270,190,1.1],[276,160,1],[300,140,1],[172,68,1.1],[212,92,1],[232,66,.9],[242,106,.9],[190,72,.8],[110,52,.8],[320,152,.9],[46,10,.8]],s='',i;
  for(i=0;i<B.length;i++)s+=blossom(B[i][0],B[i][1],B[i][2],(i*47)%360,(-(i*.43)%4).toFixed(2));
  var buds='<circle cx="206" cy="66" r="3.6" fill="#ff9cc4" stroke="#e0679d" stroke-width="1.2"/><circle cx="96" cy="14" r="3.4" fill="#ff9cc4" stroke="#e0679d" stroke-width="1.2"/><circle cx="258" cy="130" r="3.6" fill="#ff9cc4" stroke="#e0679d" stroke-width="1.2"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 200" width="100%" style="display:block;overflow:visible">'+wood+buds+s+'</svg>';
}
var HILL='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 80" preserveAspectRatio="none" width="100%" height="64" style="display:block"><path d="M0 80V40Q100 12 220 34T460 30T700 36T1000 26V80z" fill="#9fdc8f" stroke="#4fa35a" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M0 80V54Q120 30 260 50T520 48T760 52T1000 44V80z" fill="#62c46c" stroke="#2e8b4f" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>';
function tulip(c){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 62" width="100%" style="display:block"><path d="M15 60V28" stroke="#2e8b4f" stroke-width="3.4" stroke-linecap="round"/><path d="M15 54Q4 50 5 38Q13 42 15 54zM15 48Q26 44 25 34Q17 38 15 48z" fill="#4fc36a" stroke="#2e8b4f" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 28Q4 8 15 5Q26 8 25 28Q20 21 15 26Q10 21 5 28z" fill="'+c+'" stroke="#8a2a52" stroke-width="2.2" stroke-linejoin="round"/></svg>'}
function daisy(){var p='',i;for(i=0;i<8;i++)p+='<ellipse cx="15" cy="9" rx="3.6" ry="7" transform="rotate('+i*45+' 15 18)" fill="#fff" stroke="#9aa7b5" stroke-width="1.3"/>';return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 62" width="100%" style="display:block"><path d="M15 60V22" stroke="#2e8b4f" stroke-width="3.2" stroke-linecap="round"/><path d="M15 50Q5 46 6 38Q14 40 15 50z" fill="#4fc36a" stroke="#2e8b4f" stroke-width="1.5"/>'+p+'<circle cx="15" cy="18" r="4.4" fill="#ffd93b" stroke="#c98a00" stroke-width="1.6"/></svg>'}
var FL='<g transform="translate(20 15)">'+(function(){var s='',i;for(i=0;i<5;i++)s+='<ellipse cx="0" cy="-6.4" rx="4.6" ry="6.8" transform="rotate('+i*72+')" fill="#ffc6df" stroke="#e0679d" stroke-width="1.5"/>';return s})()+'<circle r="2.8" fill="#ffd966" stroke="#d99a00" stroke-width="1.2"/></g>';
var PC=['#ffc6df','#ffb0d0','#ffd9ea','#ff9cc4'],WC=[['#ffd166','#ff9f1c'],['#4cc9f0','#4361ee'],['#f78fb3','#c2185b'],['#b388ff','#7c4dff']];
function petal(c,x,y,r,rot,sx,col){
  c.save();c.translate(x,y);c.rotate(rot);c.scale(sx,1);
  c.beginPath();c.moveTo(0,r);c.bezierCurveTo(-r*1.1,r*.2,-r*.7,-r,-r*.14,-r);c.lineTo(0,-r*.76);c.lineTo(r*.14,-r);c.bezierCurveTo(r*.7,-r,r*1.1,r*.2,0,r);
  c.fillStyle=col;c.fill();c.lineWidth=1.4;c.strokeStyle='#e0679d';c.stroke();
  c.restore();
}
function butterfly(c,x,y,s,f,cl){
  c.save();c.translate(x,y);c.scale(s,s);
  var fw=Math.abs(Math.cos(f))*.8+.2,k;
  c.lineWidth=1.8;c.strokeStyle='#3a2a4a';c.lineJoin='round';
  for(k=-1;k<=1;k+=2){
    c.save();c.scale(k*fw,1);
    c.beginPath();c.ellipse(9,-6,9,11,.5,0,6.283);c.fillStyle=cl[0];c.fill();c.stroke();
    c.beginPath();c.ellipse(7,8,6.4,8,-.4,0,6.283);c.fillStyle=cl[1];c.fill();c.stroke();
    c.beginPath();c.arc(10,-8,2.4,0,6.283);c.fillStyle='rgba(255,255,255,.85)';c.fill();
    c.restore();
  }
  c.beginPath();c.ellipse(0,0,2.6,10,0,0,6.283);c.fillStyle='#3a2a4a';c.fill();
  c.beginPath();c.moveTo(0,-9);c.quadraticCurveTo(-4,-17,-8,-16);c.moveTo(0,-9);c.quadraticCurveTo(4,-17,8,-16);c.stroke();
  c.restore();
}
window.CloudSeason.reg('sp',{
  init:function(k){
    var m=k.mobile(),i;
    k.el('sx-branch',branch());
    k.el('sx-branch r',branch(),'');
    k.el('',HILL,'left:0;right:0;bottom:0;width:100%');
    var cols=['#ff6b8b','#ffd23f','#ff9f5a','#c77dff','#ff6b8b'],nf=m?7:14;
    for(i=0;i<nf;i++)k.el('sx-flower',i%3===2?daisy():tulip(cols[i%cols.length]),'left:'+(2+i*(96/nf)+k.rnd(-2,2)).toFixed(1)+'%;bottom:'+(m?12:16)+'px;width:'+(m?22:30)+'px;animation-delay:'+(-i*.47).toFixed(2)+'s');
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 30" width="22" height="16">'+FL+'</svg>','right:-6px;top:-8px');
    var pt=[],n=Math.round(Math.min(90,k.W()*k.H()/17000)*k.scale),bt=[],nb=Math.max(1,Math.round((m?1:3)*k.scale));
    for(i=0;i<n;i++)pt.push({x:Math.random(),y:Math.random(),r:k.rnd(8,15),v:k.rnd(28,60),a:k.rnd(20,60),p:k.rnd(0,6.28),s:k.rnd(.5,1.4),rot:k.rnd(0,6.28),rs:k.rnd(-2,2),c:PC[i%PC.length]});
    for(i=0;i<nb;i++)bt.push({x:k.rnd(.1,.9),y:k.rnd(.2,.7),tx:Math.random(),ty:k.rnd(.2,.8),vx:0,vy:0,c:WC[i%WC.length],ph:k.rnd(0,6),tm:0,s:m?1.2:1.75});
    k.canvas(function(c,dt,t,w,h){
      pt.forEach(function(o){
        o.y+=o.v*dt/h;o.x+=(14+Math.sin(t*.6+o.p)*10)*dt/w;o.rot+=o.rs*dt;
        if(o.y>1.04||o.x>1.05){o.y=-.04;o.x=Math.random()*.9-.1}
        petal(c,o.x*w+Math.sin(t*o.s+o.p)*o.a*.3,o.y*h,o.r,o.rot,Math.cos(t*o.s*1.6+o.p)*.8+.2,o.c);
      });
      bt.forEach(function(o){
        o.tm-=dt;
        if(o.tm<=0){o.tx=Math.random();o.ty=k.rnd(.18,.8);o.tm=k.rnd(2.5,5)}
        o.vx+=((o.tx-o.x)*w*.5-o.vx*1.2)*dt;o.vy+=((o.ty-o.y)*h*.5-o.vy*1.2)*dt;
        o.x+=o.vx*dt/w;o.y+=o.vy*dt/h;
        butterfly(c,o.x*w,o.y*h+Math.sin(t*3+o.ph)*7,o.s,t*13+o.ph,o.c);
      });
    });
  }
});
})();
