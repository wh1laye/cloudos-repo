(function(){
var PINE1='<path d="M50 120L25 55L75 55z" fill="#2d5a27" stroke="#1b3a17" stroke-width="2.5"/><path d="M50 95L15 35L85 35z" fill="#3a7d33" stroke="#1b3a17" stroke-width="2.5"/><path d="M50 70L30 15L70 15z" fill="#4caf50" stroke="#1b3a17" stroke-width="2"/><rect x="47" y="120" width="6" height="14" fill="#5d4037"/>';
var PINE2='<path d="M45 110L20 50L70 50z" fill="#3a7d33" stroke="#1b3a17" stroke-width="2"/><path d="M45 85L12 30L78 30z" fill="#4caf50" stroke="#1b3a17" stroke-width="2"/><path d="M45 60L28 10L62 10z" fill="#66bb6a" stroke="#1b3a17" stroke-width="1.5"/><rect x="42" y="110" width="6" height="12" fill="#5d4037"/>';
var OAK='<g transform="translate(0 10)"><ellipse cx="45" cy="42" rx="38" ry="32" fill="#5a7d2e" stroke="#3a5a1e" stroke-width="2.5"/><ellipse cx="45" cy="58" rx="30" ry="24" fill="#6b8f3e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="45" cy="72" rx="22" ry="18" fill="#7ca04e" stroke="#3a5a1e" stroke-width="1.8"/><rect x="41" y="70" width="8" height="16" fill="#5d4037"/><circle cx="32" cy="34" r="3.4" fill="#8d6e63"/><circle cx="58" cy="32" r="3.4" fill="#8d6e63"/><circle cx="50" cy="50" r="3.4" fill="#8d6e63"/><circle cx="40" cy="64" r="3.4" fill="#8d6e63"/><circle cx="52" cy="66" r="3.4" fill="#8d6e63"/></g>';
var MOSS='<path d="M0 30Q20 24 40 30T80 30" fill="none" stroke="#4caf50" stroke-width="6" stroke-linecap="round" opacity=".85"/><path d="M0 34Q20 28 40 34T80 34" fill="none" stroke="#66bb6a" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
var LEAF='<path d="M0 -10Q5 0 0 10Q-5 0 0 -10z" fill="#4caf50" stroke="#2d5a27" stroke-width="1"/>';
var LEAF2='<path d="M0 -10Q5 0 0 10Q-5 0 0 -10z" fill="#66bb6a" stroke="#2d5a27" stroke-width="1"/>';
var LEAF3='<path d="M0 -10Q5 0 0 10Q-5 0 0 -10z" fill="#81c784" stroke="#2d5a27" stroke-width="1"/>';
window.CloudSeason.reg('fr',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    var p1=k.el('','<div style="transform-origin:0 0">'+PINE1+'</div>','left:0;width:'+(m?260:480)+'px');
    k.hbWatch(function(hb){p1.style.top=(hb-12)+'px'});
    var p2=k.el('','<div style="transform-origin:0 0">'+PINE2+'</div>','left:12%;width:'+(m?220:380)+'px');
    k.hbWatch(function(hb){p2.style.top=(hb-6)+'px'});
    var oak=k.el('','<div style="transform-origin:0 0">'+OAK+'</div>','right:0;width:'+(m?240:420)+'px');
    k.hbWatch(function(hb){oak.style.top=(hb+6)+'px'});
    k.el('zs-moss',MOSS,'left:0;bottom:'+Math.round(gh*.28)+'px;width:'+(m?260:520)+'px');
    k.el('zs-moss b2',MOSS,'left:20%;bottom:'+Math.round(gh*.22)+'px;width:'+(m?300:600)+'px;opacity:.85');
    var leaves=[LEAF,LEAF2,LEAF3];
    for(var i=0;i<6;i++){
      k.el('zs-fly',leaves[i%leaves.length],'left:'+(8+i*15).toFixed(1)+'%;bottom:'+Math.round(gh*(.15+i*.14))+'px;width:'+(m?14:24)+'px;animation-duration:'+k.rnd(5,10).toFixed(1)+'s;animation-delay:'+(-k.rnd(0,8)).toFixed(2)+'s');
    }
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M10 30L20 10L30 30L40 10L50 30" fill="none" stroke="#4caf50" stroke-width="3" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#2d5a27" stroke-width="2"/><ellipse cx="20" cy="20" rx="4" ry="2" fill="#4caf50"/><ellipse cx="30" cy="20" rx="4" ry="2" fill="#66bb6a"/><ellipse cx="44" cy="20" rx="4" ry="2" fill="#81c784"/></svg>',.1,.4,m?16:22);
    var cols=['#4caf50','#66bb6a','#81c784'],nf=m?10:18;
    var spr=cols.map(function(c){return k.sprite(11,11,function(ctx){var g=ctx.createRadialGradient(0,0,0,0,0,5.5);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,5.5,0,6.283);ctx.fill()})});
    var fl=[],nn=nf;
    for(var i=0;i<nn;i++)fl.push({x:Math.random(),y:Math.random(),v:k.rnd(12,28),a:k.rnd(7,17),p:k.rnd(0,6.28),s:k.rnd(.5,1.3),c:i%cols.length,rot:k.rnd(0,6.28),rs:k.rnd(-1.6,1.6)});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(nn*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=fl[j];o.y+=o.v*dt/h;o.rot+=o.rs*dt;o.x+=(6+Math.sin(t*1.3+o.p)*5)*dt/w;
        if(o.y>1.05||o.x>1.05){o.y=-.05;o.x=Math.random()}
        k.put(c,spr[o.c],o.x*w+Math.sin(t*o.s+o.p)*o.a,o.y*h,1,o.rot,Math.cos(t*o.s*1.3+o.p)*.65+.35);
      }
    },true,30);
  }
});
})();
