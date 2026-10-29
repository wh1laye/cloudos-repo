(function(){
var WAVE='<path d="M0 40Q40 0 80 40T160 40" fill="none" stroke="#00bfa5" stroke-width="3" stroke-linecap="round"/><path d="M0 44Q40 8 80 44T160 44" fill="none" stroke="#00897b" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>';
var BOAT='<path d="M50 40L20 60H80z" fill="#37474f" stroke="#263238" stroke-width="2"/><rect x="32" y="28" width="16" height="12" fill="#eceff1" stroke="#263238" stroke-width="1.5"/><line x1="40" y1="28" x2="40" y2="14" stroke="#263238" stroke-width="1.5"/><path d="M40 14L28 24L52 24z" fill="#cfd8dc" stroke="#263238" stroke-width="1.5"/>';
function waveSprite(k){
  return k.sprite(120,44,function(c){
    var g=c.createLinearGradient(0,0,120,0);g.addColorStop(0,'#00bfa5');g.addColorStop(.5,'#00897b');g.addColorStop(1,'#004d40');
    c.strokeStyle=g;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(0,22);c.quadraticCurveTo(40,0,80,22);c.quadraticCurveTo(120,0,160,22);c.stroke();
  });
}
window.CloudSeason.reg('oc',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    k.el('zs-wv',WAVE,'left:0;bottom:0;width:200%;height:'+gh+'px;opacity:.95');
    k.el('zs-wv b2',WAVE,'left:-40%;bottom:0;width:200%;height:'+Math.round(gh*.6)+'px;opacity:.7');
    var bt=k.el('zs-fly',BOAT,'bottom:'+Math.round(gh*.5)+'px;width:'+(m?44:70)+'px;animation-duration:'+(m?70:90)+'s;animation-delay:-30s');
    bt.innerHTML='<div>'+bt.innerHTML+'</div>';
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M4 36Q32 4 60 36" fill="none" stroke="#00bfa5" stroke-width="3" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#004d40" stroke-width="2"/></svg>',.12,.3,m?18:22);
    if(k.pc()){
      var dots=[],nd=m?12:24;
      for(var i=0;i<nd;i++)dots.push({x:Math.random(),y:Math.random(),v:k.rnd(8,20),s:k.rnd(.8,1.6),p:k.rnd(0,6.28)});
      var spr=k.sprite(4,4,function(c){c.fillStyle='#b2dfdb';c.beginPath();c.arc(0,0,2,0,6.283);c.fill()});
      k.canvas(function(c,dt,t,w,h){
        var cnt=Math.ceil(nd*k.q()),j,o;
        for(j=0;j<cnt;j++){
          o=dots[j];o.y+=o.v*dt/h;o.x+=(6+Math.sin(t+o.p)*4)*dt/w;
          if(o.y>1.04){o.y=-.04;o.x=Math.random()}
          k.put(c,spr,o.x*w+Math.sin(t*o.s+o.p)*8,o.y*h,o.s,0);
        }
      },true,24);
    }
  }
});
})();
