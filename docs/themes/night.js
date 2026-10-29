(function(){
var STAR='<circle cx="0" cy="0" r="1.6" fill="#fff"/>';
var STAR2='<circle cx="0" cy="0" r="2.4" fill="#fff"/>';
var MOON='<circle cx="50" cy="42" r="26" fill="#fff" stroke="#e0e0e0" stroke-width="2.5"/><circle cx="36" cy="35" r="7" fill="#0a0a12"/><circle cx="62" cy="50" r="5" fill="#fff8e1" opacity=".8"/>';
var CLOUD='<path d="M10 44Q20 30 32 36Q48 42 60 38Q72 48 84 42Q92 46 96 44" fill="none" stroke="#2a2a4e" stroke-width="3" stroke-linecap="round"/><path d="M12 50Q22 36 34 42Q46 48 58 44Q68 50 80 48Q88 46 92 50" fill="none" stroke="#22223a" stroke-width="2" stroke-linecap="round" opacity=".85"/>';
var COMET='<path d="M0 0Q20 10 40 0" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M0 0Q10 5 20 0" fill="none" stroke="#bb86fc" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="0" r="3" fill="#fff"/>';
function starSprite(k,s){
  return k.sprite(s,s,function(c){var g=c.createRadialGradient(0,0,0,0,0,s/2);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,s/2,0,6.283);c.fill()});
}
window.CloudSeason.reg('ni',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    k.el('zs-moon',MOON,'right:6%;bottom:'+Math.round(gh*.62)+'px;width:'+(m?62:96)+'px;height:'+(m?62:96)+'px');
    if(k.pc()){
      k.el('zs-cloud',CLOUD,'left:-10%;bottom:'+Math.round(gh*.45)+'px;width:'+(m?200:340)+'px;animation:zsdrift 150s linear infinite');
      k.el('zs-cloud b2',CLOUD,'left:60%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?220:360)+'px;animation:zsdrift 180s linear infinite reverse;opacity:.85');
    }
    for(var i=0;i<3;i++){
      k.el('zs-comet',COMET,'left:'+k.rnd(5,80).toFixed(1)+'%;top:'+k.rnd(4,30).toFixed(1)+'%;animation-duration:'+k.rnd(10,20).toFixed(1)+'s;animation-delay:'+(-k.rnd(0,15)).toFixed(1)+'s',true);
    }
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><circle cx="32" cy="16" r="11" fill="none" stroke="#bb86fc" stroke-width="2.5"/><path d="M22 16Q32 6 42 16" fill="none" stroke="#bb86fc" stroke-width="2.5" stroke-linecap="round"/><circle cx="26" cy="12" r="2" fill="#fff"/><circle cx="38" cy="12" r="2" fill="#fff"/><circle cx="32" cy="22" r="2" fill="#fff"/><path d="M60 38H4" fill="none" stroke="#3700b3" stroke-width="2"/></svg>',.1,.4,m?16:22);
    var stars=[],ns=m?28:56;
    for(var i=0;i<ns;i++)stars.push({x:Math.random(),y:Math.random(),s:k.rnd(1.6,4),a:k.rnd(0,6.28),p:k.rnd(0,10),tw:k.rnd(.3,1.4),c:i%2});
    var sprs=[starSprite(k,6),starSprite(k,10)];
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(ns*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=stars[j];
        var al=.35+.65*Math.abs(Math.sin(t*o.tw+o.p));
        c.globalAlpha=al;
        k.put(c,sprs[o.c],o.x*w+Math.sin(t*o.a)*o.s*1.5,o.y*h+Math.cos(t*o.a)*o.s*1.5,o.s,0,o.s/8);
      }
      c.globalAlpha=1;
    },false,18);
  }
});
})();
