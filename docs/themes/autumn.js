(function(){
var LEAF='<path d="M0 -12Q7 0 0 12Q-7 0 0 -12z" fill="#d84315" stroke="#bf360c" stroke-width="1.3"/>';
var LEAF2='<path d="M0 -12Q7 0 0 12Q-7 0 0 -12z" fill="#ffb74d" stroke="#ef6c00" stroke-width="1.3"/>';
var LEAF3='<path d="M0 -12Q7 0 0 12Q-7 0 0 -12z" fill="#ffd54f" stroke="#f57f17" stroke-width="1.3"/>';
var LEAF4='<path d="M0 -12Q7 0 0 12Q-7 0 0 -12z" fill="#795548" stroke="#5d4037" stroke-width="1.3"/>';
var TREE='<path d="M50 115L25 35L75 35z" fill="#5d4037" stroke="#3e2723" stroke-width="2.5"/><path d="M50 90L15 20L85 20z" fill="#4e342e" stroke="#3e2723" stroke-width="2"/><rect x="47" y="115" width="6" height="12" fill="#3e2723"/><circle cx="38" cy="45" r="2.6" fill="#d84315"/><circle cx="62" cy="48" r="2.6" fill="#ffb74d"/><circle cx="45" cy="62" r="2.6" fill="#ffd54f"/><circle cx="55" cy="50" r="2.6" fill="#795548"/><circle cx="30" cy="55" r="2.6" fill="#d84315"/><circle cx="70" cy="60" r="2.6" fill="#ffb74d"/>';
var APPLE='<circle cx="12" cy="14" r="5" fill="#d84315" stroke="#bf360c" stroke-width="1.2"/><path d="M12 9Q10 6 12 6Q14 6 12 9z" fill="none" stroke="#3e2723" stroke-width="1"/><path d="M12 19L14 24" stroke="#4e342e" stroke-width="1.2" stroke-linecap="round"/>';
var PUMPKIN='<ellipse cx="14" cy="22" rx="7" ry="10" fill="#ffb74d" stroke="#ef6c00" stroke-width="1.5"/><ellipse cx="14" cy="22" rx="4" ry="10" fill="#ffd54f" stroke="#ef6c00" stroke-width="1"/><rect x="12" y="10" width="4" height="4" rx="1" fill="#5d4037"/><path d="M14 12Q10 14 14 16Q18 14 14 12" fill="none" stroke="#3e2723" stroke-width="1"/>';
var ACORN='<ellipse cx="12" cy="24" rx="4" ry="5" fill="#795548" stroke="#5d4037" stroke-width="1"/><rect x="10" y="18" width="4" height="2" fill="#5d4037"/>';
window.CloudSeason.reg('au',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    var tr=k.el('','<div style="transform-origin:0 0">'+TREE+'</div>','left:0;width:'+(m?280:500)+'px');
    k.hbWatch(function(hb){tr.style.top=(hb-10)+'px'});
    k.el('zs-fly',APPLE,'left:6%;bottom:'+Math.round(gh*.35)+'px;width:'+(m?18:30)+'px;animation-duration:'+k.rnd(6,11).toFixed(1)+'s;animation-delay:-2s');
    k.el('zs-fly',PUMPKIN,'left:22%;bottom:'+Math.round(gh*.28)+'px;width:'+(m?24:36)+'px;animation-duration:'+k.rnd(7,12).toFixed(1)+'s;animation-delay:-5s');
    k.el('zs-fly',ACORN,'left:40%;bottom:'+Math.round(gh*.22)+'px;width:'+(m?16:26)+'px;animation-duration:'+k.rnd(8,13).toFixed(1)+'s;animation-delay:-8s');
    k.el('zs-fly',APPLE,'left:62%;bottom:'+Math.round(gh*.32)+'px;width:'+(m?18:30)+'px;animation-duration:'+k.rnd(6,10).toFixed(1)+'s;animation-delay:-3s');
    k.el('zs-fly',PUMPKIN,'left:80%;bottom:'+Math.round(gh*.26)+'px;width:'+(m?24:36)+'px;animation-duration:'+k.rnd(7,11).toFixed(1)+'s;animation-delay:-6s');
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M10 24L20 6L30 24L40 6L50 24" fill="none" stroke="#d84315" stroke-width="3" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#795548" stroke-width="2"/><ellipse cx="16" cy="26" rx="3" ry="2" fill="#d84315"/><ellipse cx="24" cy="26" rx="3" ry="2" fill="#ffb74d"/><ellipse cx="32" cy="26" rx="3" ry="2" fill="#ffd54f"/><ellipse cx="40" cy="26" rx="3" ry="2" fill="#795548"/><ellipse cx="48" cy="26" rx="3" ry="2" fill="#d84315"/></svg>',.1,.4,m?16:22);
    var cols=['#d84315','#ffb74d','#ffd54f','#795548'],nf=m?12:22;
    var spr=cols.map(function(c){return k.sprite(13,13,function(ctx){var g=ctx.createRadialGradient(0,0,0,0,0,6.5);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,6.5,0,6.283);ctx.fill()})});
    var fl=[],nn=nf;
    for(var i=0;i<nn;i++)fl.push({x:Math.random(),y:Math.random(),v:k.rnd(16,38),a:k.rnd(9,22),p:k.rnd(0,6.28),s:k.rnd(.6,1.5),c:i%cols.length,rot:k.rnd(0,6.28),rs:k.rnd(-2.2,2.2)});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(nn*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=fl[j];o.y+=o.v*dt/h;o.rot+=o.rs*dt;o.x+=(12+Math.sin(t*1.8+o.p)*9)*dt/w;
        if(o.y>1.07||o.x>1.07){o.y=-.07;o.x=Math.random()}
        k.put(c,spr[o.c],o.x*w+Math.sin(t*o.s+o.p)*o.a,o.y*h,1,o.rot,Math.cos(t*o.s*1.5+o.p)*.7+.3);
      }
    },true,32);
  }
});
})();
