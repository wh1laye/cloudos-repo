(function(){
var LEAF='<path d="M0 -10Q6 0 0 10Q-6 0 0 -10z" fill="#d84315" stroke="#bf360c" stroke-width="1.2"/>';
var LEAF2='<path d="M0 -10Q6 0 0 10Q-6 0 0 -10z" fill="#ffb74d" stroke="#ef6c00" stroke-width="1.2"/>';
var LEAF3='<path d="M0 -10Q6 0 0 10Q-6 0 0 -10z" fill="#ffd54f" stroke="#f57f17" stroke-width="1.2"/>';
var TREE='<path d="M50 110L30 40L70 40z" fill="#5d4037" stroke="#3e2723" stroke-width="2"/><path d="M50 90L20 20L80 20z" fill="#4e342e" stroke="#3e2723" stroke-width="2"/><rect x="47" y="110" width="6" height="10" fill="#3e2723"/>';
function fallingLeaf(col){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" style="display:block"><path d="M10 0Q14 0 10 10Q6 0 10 0z" fill="'+col+'" stroke="#3e2723" stroke-width="1"/></svg>';
}
window.CloudSeason.reg('au',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    var tr=k.el('','<div style="transform-origin:0 0">'+TREE+'</div>','left:0;width:'+(m?260:460)+'px');
    k.hbWatch(function(hb){tr.style.top=(hb-8)+'px'});
    for(var i=0;i<5;i++){
      k.el('zs-fly',fallingLeaf(['#d84315','#ffb74d','#ffd54f','#795548','#5d4037'][i%5]),'left:'+(10+i*18).toFixed(1)+'%;bottom:'+Math.round(gh*(.2+i*.15))+'px;width:'+(m?14:22)+'px;animation-duration:'+k.rnd(4,9).toFixed(1)+'s;animation-delay:'+(-k.rnd(0,6)).toFixed(2)+'s');
    }
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M10 24L20 6L30 24L40 6L50 24" fill="none" stroke="#d84315" stroke-width="3" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#795548" stroke-width="2"/></svg>',.1,.4,m?16:20);
    var cols=['#d84315','#ffb74d','#ffd54f','#795548'],nf=m?10:18;
    var spr=cols.map(function(c){return k.sprite(12,12,function(ctx){var g=ctx.createRadialGradient(0,0,0,0,0,6);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,6,0,6.283);ctx.fill()})});
    var fl=[],nn=nf;
    for(var i=0;i<nn;i++)fl.push({x:Math.random(),y:Math.random(),v:k.rnd(14,34),a:k.rnd(8,20),p:k.rnd(0,6.28),s:k.rnd(.5,1.4),c:i%cols.length,rot:k.rnd(0,6.28),rs:k.rnd(-2,2)});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(nn*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=fl[j];o.y+=o.v*dt/h;o.rot+=o.rs*dt;o.x+=(10+Math.sin(t*2+o.p)*8)*dt/w;
        if(o.y>1.06||o.x>1.06){o.y=-.06;o.x=Math.random()}
        k.put(c,spr[o.c],o.x*w+Math.sin(t*o.s+o.p)*o.a,o.y*h,1,o.rot,Math.cos(t*o.s*1.4+o.p)*.7+.3);
      }
    },true,30);
  }
});
})();
