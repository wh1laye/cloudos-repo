(function(){
var SNOWMAN='<path d="M24 62q-14-6-20-20M76 62q14-6 20-20M4 42l-5-5M4 42l-6 2M96 42l5-5M96 42l6 2" fill="none" stroke="#6b4423" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="104" r="28" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><circle cx="50" cy="66" r="21" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><circle cx="50" cy="36" r="16" fill="#fff" stroke="#3b5f8f" stroke-width="3"/><rect x="33" y="22" width="34" height="4" rx="2" fill="#222"/><rect x="38" y="6" width="24" height="18" rx="3" fill="#333"/><rect x="38" y="16" width="24" height="5" fill="#d93a45"/><circle cx="44" cy="34" r="2.6" fill="#223"/><circle cx="56" cy="34" r="2.6" fill="#223"/><path d="M50 38l17 4-17 4z" fill="#ff8a1f" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/><path d="M42 47q8 6 16 0" fill="none" stroke="#223" stroke-width="2" stroke-linecap="round"/><rect x="32" y="50" width="36" height="9" rx="4.5" fill="#d93a45" stroke="#8e1b1b" stroke-width="2"/><rect x="58" y="54" width="9" height="20" rx="3.5" fill="#d93a45" stroke="#8e1b1b" stroke-width="2"/><circle cx="50" cy="72" r="2.8" fill="#223"/><circle cx="50" cy="84" r="2.8" fill="#223"/><circle cx="50" cy="98" r="2.8" fill="#223"/><circle cx="38" cy="43" r="3.6" fill="#ff9aa8" opacity=".6"/><circle cx="62" cy="43" r="3.6" fill="#ff9aa8" opacity=".6"/>';
var ORN=['#ff4d4d','#ffd23f','#4db8ff','#ff7ad9','#fff'];
function tree(){
  var o='',pts=[[50,40],[38,70],[64,72],[28,96],[52,98],[76,100],[44,122],[66,122]],i;
  for(i=0;i<pts.length;i++)o+='<circle cx="'+pts[i][0]+'" cy="'+pts[i][1]+'" r="4.6" fill="'+ORN[i%ORN.length]+'" stroke="#222" stroke-width="1.4"/>';
  return '<rect x="43" y="124" width="14" height="18" rx="3" fill="#7b4a24" stroke="#4a2a10" stroke-width="2.5"/><path d="M50 52L92 126H8z" fill="#2e9e5b" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/><path d="M50 30L84 92H16z" fill="#35b266" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/><path d="M50 8L74 58H26z" fill="#3cc272" stroke="#17653a" stroke-width="3" stroke-linejoin="round"/>'+o+'<path d="M50 -4l3.6 8.2 8.8.8-6.6 5.8 2 8.6-7.8-4.6-7.8 4.6 2-8.6-6.6-5.8 8.8-.8z" fill="#ffd23f" stroke="#c88a00" stroke-width="2" stroke-linejoin="round"/>';
}
var HAT='<path d="M4 27Q8 5 31 6Q27 15 37 27z" fill="#e53935" stroke="#8e1b1b" stroke-width="2" stroke-linejoin="round"/><rect x="1" y="23" width="38" height="8" rx="4" fill="#fff" stroke="#b0bec5" stroke-width="1.6"/><circle cx="32" cy="6" r="4.6" fill="#fff" stroke="#b0bec5" stroke-width="1.6"/>';
var GIFT='<rect x="3" y="17" width="34" height="21" rx="3" fill="#e53935" stroke="#8e1b1b" stroke-width="2.4"/><rect x="17" y="17" width="6" height="21" fill="#ffd23f"/><path d="M20 17C13 5 5 8 9 14S20 17 20 17zM20 17C27 5 35 8 31 14S20 17 20 17z" fill="#ffd23f" stroke="#c88a00" stroke-width="2" stroke-linejoin="round"/>';
var GIFT2='<rect x="4" y="18" width="32" height="20" rx="3" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2.4"/><rect x="4" y="25" width="32" height="5" fill="#fff"/><rect x="17" y="18" width="6" height="20" fill="#fff"/><circle cx="20" cy="15" r="4" fill="#fff" stroke="#9aa7b5" stroke-width="2"/>';
var RD='<ellipse cx="46" cy="52" rx="20" ry="11" fill="#b8723a" stroke="#5a3414" stroke-width="2.6"/><path d="M34 60l-6 16M44 62l-3 17M56 62l4 16M64 58l8 14" stroke="#5a3414" stroke-width="3.6" stroke-linecap="round"/><path d="M60 46Q70 38 74 32" stroke="#5a3414" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M60 46Q70 38 74 32" stroke="#b8723a" stroke-width="6.4" stroke-linecap="round" fill="none"/><circle cx="78" cy="28" r="9" fill="#b8723a" stroke="#5a3414" stroke-width="2.6"/><path d="M74 20l-4-12M70 8l-6-2M70 8l1-7M82 20l4-12M86 8l6-2M86 8l-1-7" stroke="#5a3414" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="86" cy="31" r="3.8" fill="#ff3b3b" stroke="#8e1b1b" stroke-width="1.4"/><circle cx="76" cy="26" r="1.8" fill="#222"/>';
var SLEIGH='<path d="M96 48Q120 44 130 50" fill="none" stroke="#8d5a2b" stroke-width="2.2"/><g transform="translate(112 0)">'+RD+'</g><g transform="translate(150 8) scale(.92)">'+RD+'</g><path d="M8 50H78Q92 50 88 36L80 34H14Q8 40 8 50z" fill="#e53935" stroke="#8e1b1b" stroke-width="2.6" stroke-linejoin="round"/><path d="M4 68H84Q100 68 98 50" fill="none" stroke="#ffcc33" stroke-width="3.6" stroke-linecap="round"/><path d="M18 58V68M70 58V68" stroke="#ffcc33" stroke-width="3"/><circle cx="24" cy="34" r="12" fill="#8d5a2b" stroke="#4a2a10" stroke-width="2.4"/><path d="M18 24l6-8 6 8" fill="#ffd23f" stroke="#c88a00" stroke-width="2" stroke-linejoin="round"/><circle cx="52" cy="30" r="8.4" fill="#ffd9b8" stroke="#8a5a3a" stroke-width="2"/><path d="M44 28Q48 10 66 18Q58 22 60 30z" fill="#e53935" stroke="#8e1b1b" stroke-width="2" stroke-linejoin="round"/><circle cx="67" cy="17" r="3.8" fill="#fff" stroke="#b0bec5" stroke-width="1.4"/><path d="M46 36Q52 48 58 36" fill="#fff" stroke="#b0bec5" stroke-width="1.6"/>';
var COL=['#ff4d4d','#ffd23f','#3ddc84','#4db8ff','#ff7ad9'];
function garland(W){
  var n=Math.max(2,Math.round(W/(W<640?150:230))),aw=W/n,w='',b='',i,k,t,x,y,c=0;
  for(i=0;i<n;i++){
    var x0=i*aw,x1=x0+aw,cx=x0+aw/2;
    w+='<path d="M'+x0+' -3Q'+cx+' 26 '+x1+' -3" fill="none" stroke="#2b5d3a" stroke-width="3"/>';
    for(k=1;k<=5;k++){
      t=k/6;x=(1-t)*(1-t)*x0+2*t*(1-t)*cx+t*t*x1;y=(1-t)*(1-t)*-3+2*t*(1-t)*26+t*t*-3;
      var col=COL[c++%COL.length];
      b+='<i class="zs-bulb" style="left:'+x.toFixed(1)+'px;top:'+(y+2).toFixed(1)+'px;background:'+col+';box-shadow:0 0 8px 2px '+col+';animation-delay:'+(-(c*.37)%2).toFixed(2)+'s"></i>';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' 40" width="'+W+'" height="40" style="display:block;overflow:visible">'+w+'</svg>'+b;
}
function icicles(W){
  var x=0,o='',seed=7;
  function rr(a,b){seed=(seed*9301+49297)%233280;return a+seed/233280*(b-a)}
  while(x<W){
    var w=rr(12,22),l=rr(7,22);
    o+='<path d="M'+x.toFixed(1)+' 0H'+(x+w).toFixed(1)+'Q'+(x+w*.62).toFixed(1)+' '+(l*.7).toFixed(1)+' '+(x+w/2).toFixed(1)+' '+l.toFixed(1)+'Q'+(x+w*.38).toFixed(1)+' '+(l*.7).toFixed(1)+' '+x.toFixed(1)+' 0z" fill="#eaf7ff" stroke="#86bde6" stroke-width="1.6" stroke-linejoin="round"/>';
    x+=w+rr(0,5);
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' 34" width="'+W+'" height="34" style="display:block">'+o+'</svg>';
}
function armPath(c,R){var i;c.beginPath();for(i=0;i<6;i++){c.save();c.rotate(i*Math.PI/3);c.moveTo(0,0);c.lineTo(0,-R);c.moveTo(0,-R*.55);c.lineTo(R*.28,-R*.8);c.moveTo(0,-R*.55);c.lineTo(-R*.28,-R*.8);c.restore()}}
window.CloudSeason.reg('ny',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44,i;
    var gar=k.el('',garland(k.W()),'left:0;top:0;width:100%;height:40px');
    var ice=k.el('zs-snow',icicles(k.W()),'left:0;width:100%');
    var sl=k.el('zs-fly',k.svg('0 0 240 90',SLEIGH),'width:'+(m?120:190)+'px;animation-duration:'+(m?36:46)+'s;animation-delay:-9s');
    sl.innerHTML='<div>'+sl.innerHTML+'</div>';
    k.hbWatch(function(hb){ice.style.top=(hb-1)+'px';sl.style.top=(hb+(m?28:36))+'px'});
    k.onResize(function(){gar.innerHTML=garland(k.W());ice.innerHTML=icicles(k.W())});
    k.el('zs-snow',k.strip(60,[{d:k.hill(1000,36,18,5,5),fill:'#d3e8fb',line:'#9ac6ec'},{d:k.hill(1000,44,15,7,11),fill:'#fff',line:'#a9cdf0'}]),'left:0;right:0;bottom:0;height:'+gh+'px');
    var sw=m?58:92,tw=m?54:84;
    k.el('zs-wob',k.svg('-6 -6 112 150',SNOWMAN),(wd?'right:calc(2% + '+(tw+76)+'px);':'left:2%;')+'bottom:'+Math.round(gh*.42)+'px;width:'+sw+'px');
    k.el('',k.svg('0 -6 100 150',tree()),'right:2%;bottom:'+Math.round(gh*.42)+'px;width:'+tw+'px');
    k.el('',k.svg('0 0 40 40',GIFT),'right:calc(2% + '+Math.round(tw*.92)+'px);bottom:'+Math.round(gh*.3)+'px;width:'+(m?22:34)+'px');
    k.el('',k.svg('0 0 40 40',GIFT2),'right:calc(2% + '+Math.round(tw*.92+(m?18:30))+'px);bottom:'+Math.round(gh*.28)+'px;width:'+(m?18:28)+'px');
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" style="display:block;overflow:visible">'+HAT+'</svg>',0.47,0.06,m?16:19,{ax:.5,ay:.84,rot:7});
    if(k.pc()){
      k.el('zs-aur','<i class="a1"></i><i class="a2"></i><i class="a3"></i>','left:0;top:0;width:100%;height:60%',true);
      for(i=0;i<3;i++)k.el('zs-shoot','','left:'+k.rnd(10,70).toFixed(0)+'%;top:'+k.rnd(8,35).toFixed(0)+'%;animation-delay:'+(-i*4.7).toFixed(1)+'s;animation-duration:'+(11+i*3)+'s',true);
      for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(2,gh*.8))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.6,3.4).toFixed(1)+'s');
    }
    for(i=0;i<k.n(16);i++)k.el('zs-star','','left:'+k.rnd(2,98).toFixed(1)+'%;top:'+k.rnd(4,62).toFixed(1)+'%;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2.2,4.4).toFixed(1)+'s',true);
    var dots=[k.sprite(8,8,function(c){c.beginPath();c.arc(0,0,2.6,0,6.283);c.fillStyle='#fff';c.fill();c.lineWidth=1;c.strokeStyle='#9ecbf0';c.stroke()}),k.sprite(11,11,function(c){c.beginPath();c.arc(0,0,4,0,6.283);c.fillStyle='#fff';c.fill();c.lineWidth=1.2;c.strokeStyle='#9ecbf0';c.stroke()})];
    var fl=[22,28,34].map(function(S){return k.sprite(S,S,function(c){var R=S/2-2;armPath(c,R);c.lineCap='round';c.strokeStyle='#8fc3ea';c.lineWidth=3.6;c.stroke();armPath(c,R);c.strokeStyle='#fff';c.lineWidth=1.8;c.stroke()})});
    var far=[],near=[],nf=k.n(80),nn=k.n(20);
    for(i=0;i<nf;i++)far.push({x:Math.random(),y:Math.random(),v:k.rnd(14,30),a:k.rnd(4,12),p:k.rnd(0,6.28),s:k.rnd(.4,1),t:i%2,z:k.rnd(.8,1.3)});
    for(i=0;i<nn;i++)near.push({x:Math.random(),y:Math.random(),v:k.rnd(30,62),a:k.rnd(10,28),p:k.rnd(0,6.28),s:k.rnd(.4,1.1),rot:k.rnd(0,6.28),rs:k.rnd(-1,1),t:i%3});
    k.canvas(function(c,dt,t,w,h){
      var q=k.q(),a=Math.ceil(nf*q),b=Math.ceil(nn*q),j,f;
      for(j=0;j<a;j++){f=far[j];f.y+=f.v*dt/h;if(f.y>1.02){f.y=-.02;f.x=Math.random()}k.put(c,dots[f.t],f.x*w+Math.sin(t*f.s+f.p)*f.a,f.y*h,f.z,0)}
      for(j=0;j<b;j++){f=near[j];f.y+=f.v*dt/h;f.rot+=f.rs*dt;if(f.y>1.04){f.y=-.04;f.x=Math.random()}k.put(c,fl[f.t],f.x*w+Math.sin(t*f.s+f.p)*f.a,f.y*h,1,f.rot)}
    },true,30);
  }
});
})();
