(function(){
var STAR='<circle cx="0" cy="0" r="1.5" fill="#fff"/>';
var STAR2='<circle cx="0" cy="0" r="2.6" fill="#fff"/>';
var STAR3='<circle cx="0" cy="0" r="1.1" fill="#bb86fc"/>';
var PLANET='<circle cx="40" cy="40" r="18" fill="#1a237e" stroke="#3f51b5" stroke-width="2"/><circle cx="40" cy="40" r="24" fill="none" stroke="#5c6bc0" stroke-width="1.5" opacity=".6"/><path d="M22 40Q40 14 58 40Q40 66 22 40" fill="none" stroke="#3f51b5" stroke-width="2" stroke-linecap="round"/><circle cx="40" cy="40" r="2" fill="#fff"/>';
var PLANET2='<circle cx="55" cy="50" r="14" fill="#263238" stroke="#546e7a" stroke-width="2"/><ellipse cx="55" cy="50" rx="22" ry="8" fill="none" stroke="#78909c" stroke-width="1.5" opacity=".7"/><circle cx="55" cy="50" r="2" fill="#fff"/>';
var MOON='<circle cx="30" cy="45" r="16" fill="#eceff1" stroke="#cfd8dc" stroke-width="2"/><circle cx="24" cy="40" r="3" fill="#cfd8dc"/><circle cx="36" cy="50" r="2.5" fill="#cfd8dc"/><circle cx="28" cy="52" r="2" fill="#cfd8dc"/>';
var COMET='<path d="M0 0Q15 -10 30 0" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".6"/><path d="M0 0Q8 -5 16 0" fill="none" stroke="#bb86fc" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="0" r="2.5" fill="#fff"/>';
var SATELLITE='<rect x="0" y="0" width="12" height="4" fill="#90a4ae" stroke="#455a64" stroke-width="1"/><circle cx="2" cy="2" r="1.5" fill="#fff"/><circle cx="10" cy="2" r="1.5" fill="#fff"/><line x1="6" y1="0" x2="6" y2="8" stroke="#455a64" stroke-width="1"/><circle cx="6" cy="8" r="2" fill="#cfd8dc"/>';
var UFO='<ellipse cx="16" cy="10" rx="14" ry="4" fill="#37474f" stroke="#263238" stroke-width="1.5"/><rect x="10" y="6" width="12" height="5" rx="2" fill="#eceff1" stroke="#263238" stroke-width="1"/><circle cx="16" cy="8" r="2" fill="#fff" opacity=".9"/><path d="M16 12Q10 20 16 24Q22 20 16 12" fill="none" stroke="#bb86fc" stroke-width="1.5" opacity=".8"/>';
function starSprite(k,s,col){
  return k.sprite(s,s,function(c){var g=c.createRadialGradient(0,0,0,0,0,s/2);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,s/2,0,6.283);c.fill()});
}
window.CloudSeason.reg('cs',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    var stars=[],ns=m?40:80;
    for(var i=0;i<ns;i++)stars.push({x:Math.random(),y:Math.random(),s:k.rnd(1.4,3.8),a:k.rnd(0,6.28),p:k.rnd(0,10),tw:k.rnd(.3,1.6),c:i%3});
    var sprs=[starSprite(k,6,'#fff'),starSprite(k,10,'#fff'),starSprite(k,7,'#bb86fc')];
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(ns*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=stars[j];
        var al=.4+.6*Math.abs(Math.sin(t*o.tw+o.p));
        c.globalAlpha=al;
        k.put(c,sprs[o.c],o.x*w+Math.sin(t*o.a)*o.s*1.2,o.y*h+Math.cos(t*o.a)*o.s*1.2,o.s,0,o.s/8);
      }
      c.globalAlpha=1;
    },false,18);
    if(k.pc()){
      k.el('zs-pl1',PLANET,'left:10%;bottom:'+Math.round(gh*.55)+'px;width:'+(m?60:110)+'px;height:'+(m?60:110)+'px;animation:zsspin 25s linear infinite');
      k.el('zs-pl2',PLANET2,'right:12%;bottom:'+Math.round(gh*.42)+'px;width:'+(m?50:90)+'px;height:'+(m?50:90)+'px;animation:zsspin 35s linear infinite reverse');
      k.el('zs-moon',MOON,'left:4%;bottom:'+Math.round(gh*.68)+'px;width:'+(m?44:76)+'px;height:'+(m?44:76)+'px');
    } else {
      k.el('zs-pl1',PLANET,'left:6%;bottom:'+Math.round(gh*.6)+'px;width:'+(m?48:90)+'px;height:'+(m?48:90)+'px;animation:zsspin 25s linear infinite');
      k.el('zs-pl2',PLANET2,'right:8%;bottom:'+Math.round(gh*.48)+'px;width:'+(m?40:72)+'px;height:'+(m?40:72)+'px;animation:zsspin 35s linear infinite reverse');
    }
    for(var i=0;i<4;i++){
      k.el('zs-comet',COMET,'left:'+k.rnd(0,90).toFixed(1)+'%;top:'+k.rnd(2,35).toFixed(1)+'%;animation-duration:'+k.rnd(8,16).toFixed(1)+'s;animation-delay:'+(-k.rnd(0,14)).toFixed(1)+'s',true);
    }
    if(k.pc()){
      k.el('zs-sat',SATELLITE,'right:8%;bottom:'+Math.round(gh*.3)+'px;width:'+(m?28:48)+'px;animation-duration:'+k.rnd(20,30).toFixed(1)+'s;animation-delay:-10s');
      k.el('zs-sat b2',SATELLITE,'left:12%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?26:44)+'px;animation-duration:'+k.rnd(18,26).toFixed(1)+'s;animation-delay:-5s;opacity:.85');
      k.el('zs-ufo',UFO,'left:50%;bottom:'+Math.round(gh*.22)+'px;width:'+(m?40:70)+'px;animation-duration:'+k.rnd(12,18).toFixed(1)+'s;animation-delay:-6s');
      k.el('zs-ufo b2',UFO,'right:45%;bottom:'+Math.round(gh*.18)+'px;width:'+(m?34:56)+'px;animation-duration:'+k.rnd(14,20).toFixed(1)+'s;animation-delay:-9s;opacity:.8');
    }
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><circle cx="32" cy="14" r="10" fill="none" stroke="#bb86fc" stroke-width="2"/><circle cx="32" cy="14" r="2" fill="#fff"/><path d="M22 24Q32 14 42 24" fill="none" stroke="#bb86fc" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="18" r="1.8" fill="#fff"/><circle cx="40" cy="18" r="1.8" fill="#fff"/><circle cx="32" cy="26" r="1.8" fill="#fff"/><path d="M60 38H4" fill="none" stroke="#3f51b5" stroke-width="2"/></svg>',.1,.4,m?16:22);
  }
});
})();