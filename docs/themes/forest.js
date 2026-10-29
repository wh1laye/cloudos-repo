(function(){
var TREE='<path d="M40 120L20 60L60 60z" fill="#2d5a27" stroke="#1b3a17" stroke-width="2"/><path d="M40 100L15 40L65 40z" fill="#3a7d33" stroke="#1b3a17" stroke-width="2"/><path d="M40 80L25 20L55 20z" fill="#4caf50" stroke="#1b3a17" stroke-width="2"/><rect x="37" y="120" width="6" height="12" fill="#5d4037"/>';
var OAK='<g transform="translate(0 12)"><ellipse cx="40" cy="40" rx="34" ry="28" fill="#5a7d2e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="40" cy="56" rx="26" ry="20" fill="#6b8f3e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="40" cy="70" rx="18" ry="14" fill="#7ca04e" stroke="#3a5a1e" stroke-width="2"/><rect x="36" y="68" width="8" height="14" fill="#5d4037"/><circle cx="30" cy="32" r="3" fill="#8d6e63"/><circle cx="50" cy="30" r="3" fill="#8d6e63"/><circle cx="45" cy="48" r="3" fill="#8d6e63"/><circle cx="35" cy="62" r="3" fill="#8d6e63"/></g>';
var LEAF='<path d="M0 -8Q4 0 0 8Q-4 0 0 -8z" fill="#4caf50" stroke="#2d5a27" stroke-width="1"/>';
window.CloudSeason.reg('fr',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    var h=k.el('','<div class="zs-brn" style="transform-origin:0 0">'+TREE+'</div>','left:0;width:'+(m?300:520)+'px');
    k.hbWatch(function(hb){h.style.top=(hb-10)+'px'});
    var oak=k.el('','<div style="transform-origin:0 0">'+OAK+'</div>','right:0;width:'+(m?220:380)+'px');
    k.hbWatch(function(hb){oak.style.top=(hb+8)+'px'});
    k.el('','<div class="zs-fly" style="animation:zsfloat 6s ease-in-out infinite">'+LEAF+'</div>','left:10%;bottom:'+Math.round(gh*.2)+'px;width:'+(m?16:24)+'px');
    k.el('','<div class="zs-fly" style="animation:zsfloat 8s ease-in-out infinite">'+LEAF+'</div>','left:30%;bottom:'+Math.round(gh*.35)+'px;width:'+(m?18:28)+'px');
    k.el('','<div class="zs-fly" style="animation:zsfloat 7s ease-in-out infinite">'+LEAF+'</div>','left:55%;bottom:'+Math.round(gh*.18)+'px;width:'+(m?14:22)+'px');
    k.el('','<div class="zs-fly" style="animation:zsfloat 9s ease-in-out infinite">'+LEAF+'</div>','left:75%;bottom:'+Math.round(gh*.3)+'px;width:'+(m?16:26)+'px');
    k.el('','<div class="zs-fly" style="animation:zsfloat 7.5s ease-in-out infinite">'+LEAF+'</div>','left:90%;bottom:'+Math.round(gh*.25)+'px;width:'+(m?15:23)+'px');
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M10 30L20 10L30 30L40 10L50 30" fill="none" stroke="#4caf50" stroke-width="3" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#2d5a27" stroke-width="2"/></svg>',.1,.4,m?16:20);
    var cols=['#4caf50','#66bb6a','#81c784'],nf=m?8:14;
    var spr=cols.map(function(c){return k.sprite(10,10,function(ctx){var g=ctx.createRadialGradient(0,0,0,0,0,5);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,5,0,6.283);ctx.fill()})});
    var fl=[],nn=nf;
    for(var i=0;i<nn;i++)fl.push({x:Math.random(),y:Math.random(),v:k.rnd(10,26),a:k.rnd(6,16),p:k.rnd(0,6.28),s:k.rnd(.4,1.2),c:i%cols.length,rot:k.rnd(0,6.28),rs:k.rnd(-1.5,1.5)});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(nn*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=fl[j];o.y+=o.v*dt/h;o.rot+=o.rs*dt;
        if(o.y>1.04){o.y=-.04;o.x=Math.random()}
        k.put(c,spr[o.c],o.x*w+Math.sin(t*o.s+o.p)*o.a,o.y*h,1,o.rot,Math.cos(t*o.s*1.2+o.p)*.6+.4);
      }
    },true,28);
  }
});
})();
