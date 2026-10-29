(function(){
var STAR='<circle cx="0" cy="0" r="1.4" fill="#fff"/>';
var MOON='<circle cx="50" cy="40" r="22" fill="#fff" stroke="#e0e0e0" stroke-width="2"/><circle cx="38" cy="34" r="6" fill="#1a1a2e"/>';
function starSprite(k,s){
  return k.sprite(s,s,function(c){var g=c.createRadialGradient(0,0,0,0,0,s/2);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,s/2,0,6.283);c.fill()});
}
window.CloudSeason.reg('ni',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    k.el('zs-moon',MOON,'right:8%;bottom:'+Math.round(gh*.55)+'px;width:'+(m?56:88)+'px;height:'+(m?56:88)+'px');
    var stars=[],ns=m?30:60;
    for(var i=0;i<ns;i++)stars.push({x:Math.random(),y:Math.random(),s:k.rnd(1.4,3.4),a:k.rnd(0,6.28),p:k.rnd(0,10),tw:k.rnd(.4,1.6)});
    var spr=starSprite(k,6);
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(ns*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=stars[j];
        var al=.5+.5*Math.abs(Math.sin(t*o.tw+o.p));
        c.globalAlpha=al;
        k.put(c,spr,o.x*w+Math.sin(t*o.a)*o.s*2,o.y*h+Math.cos(t*o.a)*o.s*2,o.s,0,o.s/6);
      }
      c.globalAlpha=1;
    },false,20);
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><circle cx="32" cy="16" r="10" fill="none" stroke="#bb86fc" stroke-width="2"/><path d="M22 16Q32 6 42 16" fill="none" stroke="#bb86fc" stroke-width="2" stroke-linecap="round"/><path d="M60 38H4" fill="none" stroke="#3700b3" stroke-width="2"/></svg>',.1,.4,m?16:20);
  }
});
})();
