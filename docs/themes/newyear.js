(function(){
var SNOWMAN='<path d="M24 62q-14-6-20-20M76 62q14-6 20-20M4 42l-5-5M4 42l-6 2M96 42l5-5M96 42l6 2" fill="none" stroke="#6b4423" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="104" r="28" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><circle cx="50" cy="66" r="21" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><circle cx="50" cy="36" r="16" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><rect x="33" y="22" width="34" height="4" rx="2" fill="#222"/><rect x="38" y="6" width="24" height="18" rx="3" fill="#333"/><rect x="38" y="16" width="24" height="5" fill="#d93a45"/><circle cx="44" cy="34" r="2.6" fill="#223"/><circle cx="56" cy="34" r="2.6" fill="#223"/><path d="M50 38l17 4-17 4z" fill="#ff8a1f" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><path d="M42 47q8 6 16 0" fill="none" stroke="#223" stroke-width="2" stroke-linecap="round"/><rect x="32" y="50" width="36" height="9" rx="4.5" fill="#d93a45" stroke="#8e1b1b" stroke-width="2"/><rect x="58" y="54" width="9" height="20" rx="3.5" fill="#d93a45" stroke="#8e1b1b" stroke-width="2"/><circle cx="50" cy="72" r="2.8" fill="#223"/><circle cx="50" cy="84" r="2.8" fill="#223"/><circle cx="50" cy="98" r="2.8" fill="#223"/><circle cx="38" cy="43" r="3.6" fill="#ff9aa8" opacity=".6"/><circle cx="62" cy="43" r="3.6" fill="#ff9aa8" opacity=".6"/>';
var ORN=['#ff4d4d','#ffd23f','#4db8ff','#ff7ad9','#fff'];
function tree(){
  var o='',pts=[[50,40],[38,70],[64,72],[28,96],[52,98],[76,100],[44,122],[66,122]],i;
  for(i=0;i<pts.length;i++)o+='<circle class="sx-orn" style="animation-delay:'+(-i*.35)+'s" cx="'+pts[i][0]+'" cy="'+pts[i][1]+'" r="4.6" fill="'+ORN[i%ORN.length]+'" stroke="#222" stroke-width="1.4"/>';
  return '<rect x="43" y="124" width="14" height="18" rx="3" fill="#7b4a24" stroke="#4a2a10" stroke-width="2.5"/><path d="M50 52L92 126H8z" fill="#2e9e5b" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/><path d="M50 30L84 92H16z" fill="#35b266" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/><path d="M50 8L74 58H26z" fill="#3cc272" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/>'+o+'<path d="M50 -4l3.6 8.2 8.8.8-6.6 5.8 2 8.6-7.8-4.6-7.8 4.6 2-8.6-6.6-5.8 8.8-.8z" fill="#ffd23f" stroke="#c88a00" stroke-width="2" stroke-linejoin="round"/>';
}
var HAT='<path d="M4 27Q8 5 31 6Q27 15 37 27z" fill="#e53935" stroke="#8e1b1b" stroke-width="2" stroke-linejoin="round"/><rect x="1" y="23" width="38" height="8" rx="4" fill="#fff" stroke="#b0bec5" stroke-width="1.6"/><circle cx="32" cy="6" r="4.6" fill="#fff" stroke="#b0bec5" stroke-width="1.6"/>';
var COL=['#ff4d4d','#ffd23f','#3ddc84','#4db8ff','#ff7ad9'];
function garland(W){
  var n=Math.max(2,Math.round(W/240)),aw=W/n,o='',w='',i,k,t,x,y,c=0;
  for(i=0;i<n;i++){
    var x0=i*aw,x1=x0+aw,cx=x0+aw/2;
    w+='<path d="M'+x0+' -3Q'+cx+' 26 '+x1+' -3" fill="none" stroke="#2b5d3a" stroke-width="2.4"/>';
    for(k=1;k<=5;k++){
      t=k/6;x=(1-t)*(1-t)*x0+2*t*(1-t)*cx+t*t*x1;y=(1-t)*(1-t)*-3+2*t*(1-t)*26+t*t*-3;
      var col=COL[c++%COL.length];
      o+='<g class="sx-bulb" style="animation-delay:'+(-(c*.37)%2).toFixed(2)+'s;color:'+col+'"><rect x="'+(x-2.4).toFixed(1)+'" y="'+(y+.5).toFixed(1)+'" width="4.8" height="4" rx="1" fill="#2b5d3a"/><ellipse cx="'+x.toFixed(1)+'" cy="'+(y+9).toFixed(1)+'" rx="4.2" ry="5.6" fill="'+col+'" stroke="#222" stroke-width="1.2" style="filter:drop-shadow(0 0 4px '+col+')"/></g>';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' 40" width="'+W+'" height="40" style="display:block;overflow:visible">'+w+o+'</svg>';
}
function icicles(W){
  var x=0,o='',r=function(a,b){return a+Math.random()*(b-a)},seed=7;
  function rr(a,b){seed=(seed*9301+49297)%233280;return a+seed/233280*(b-a)}
  while(x<W){
    var w=rr(14,26),l=rr(10,30);
    o+='<path d="M'+x.toFixed(1)+' 0H'+(x+w).toFixed(1)+'Q'+(x+w*.62).toFixed(1)+' '+(l*.7).toFixed(1)+' '+(x+w/2).toFixed(1)+' '+l.toFixed(1)+'Q'+(x+w*.38).toFixed(1)+' '+(l*.7).toFixed(1)+' '+x.toFixed(1)+' 0z" fill="#eaf7ff" stroke="#86bde6" stroke-width="1.6" stroke-linejoin="round"/>';
    x+=w+rr(0,5);
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' 34" width="'+W+'" height="34" style="display:block">'+o+'</svg>';
}
var DRIFT='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 60" preserveAspectRatio="none" width="100%" height="44" style="display:block"><path d="M0 60V38Q70 14 140 34T280 32T420 36T560 28T700 34T840 30T1000 32V60z" fill="#d6e9fb" stroke="#8fbde6" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="M0 60V46Q90 26 180 44T360 42T540 46T720 40T900 45T1000 42V60z" fill="#fff" stroke="#a9cdf0" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>';
function flake(c,x,y,r,rot){
  c.save();c.translate(x,y);c.rotate(rot);
  c.lineCap='round';c.strokeStyle='#8fc3ea';c.lineWidth=r*.2+2.2;
  var i;
  c.beginPath();for(i=0;i<6;i++){c.save();c.rotate(i*Math.PI/3);c.moveTo(0,0);c.lineTo(0,-r);c.moveTo(0,-r*.55);c.lineTo(r*.28,-r*.8);c.moveTo(0,-r*.55);c.lineTo(-r*.28,-r*.8);c.restore()}c.stroke();
  c.strokeStyle='#fff';c.lineWidth=r*.2+.2;
  c.beginPath();for(i=0;i<6;i++){c.save();c.rotate(i*Math.PI/3);c.moveTo(0,0);c.lineTo(0,-r);c.moveTo(0,-r*.55);c.lineTo(r*.28,-r*.8);c.moveTo(0,-r*.55);c.lineTo(-r*.28,-r*.8);c.restore()}c.stroke();
  c.restore();
}
window.CloudSeason.reg('ny',{
  init:function(k){
    var gar=k.el('',garland(k.W()),'left:0;top:0;width:100%;');
    var ice=k.el('',icicles(k.W()),'left:0;top:53px;width:100%;');
    k.onResize(function(){gar.innerHTML=garland(k.W());ice.innerHTML=icicles(k.W())});
    k.el('',DRIFT,'left:0;right:0;bottom:0;width:100%;');
    k.el('sx-snowman',k.svg('-6 -6 112 150',SNOWMAN));
    k.el('sx-tree',k.svg('0 -6 100 150',tree()));
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" width="26" height="21">'+HAT+'</svg>','left:-6px;top:-10px;transform:rotate(-14deg)');
    var fl=[],i,n=Math.round(Math.min(150,k.W()*k.H()/13000)*k.scale);
    for(i=0;i<n;i++)fl.push({x:Math.random(),y:Math.random(),r:k.rnd(2.2,7),v:k.rnd(26,70),a:k.rnd(8,30),p:k.rnd(0,6.28),s:k.rnd(.4,1.2),t:Math.random()<.45,rot:k.rnd(0,6.28),rs:k.rnd(-1,1)});
    k.canvas(function(c,dt,t,w,h){
      fl.forEach(function(f){
        f.y+=f.v*dt/h;f.rot+=f.rs*dt;
        if(f.y>1.03){f.y=-.03;f.x=Math.random()}
        var x=f.x*w+Math.sin(t*f.s+f.p)*f.a,y=f.y*h;
        if(f.t&&f.r>3.4)flake(c,x,y,f.r*1.7,f.rot);
        else{c.beginPath();c.arc(x,y,f.r*.7,0,6.283);c.fillStyle='#fff';c.fill();c.lineWidth=1.4;c.strokeStyle='#9ecbf0';c.stroke()}
      });
    });
  }
});
})();
