(function(){
var RAYS=(function(){var s='',i;for(i=0;i<12;i++)s+='<path d="M80 4L91 28H69z" transform="rotate('+i*30+' 80 80)"/>';return '<g fill="#ffb703" stroke="#e08a00" stroke-width="3" stroke-linejoin="round">'+s+'</g>'})();
var SUNFACE='<circle cx="80" cy="80" r="44" fill="#ffd93b" stroke="#e08a00" stroke-width="3.4"/><rect x="48" y="66" width="28" height="18" rx="7" fill="#1f2937"/><rect x="84" y="66" width="28" height="18" rx="7" fill="#1f2937"/><path d="M76 72h8" stroke="#1f2937" stroke-width="3"/><path d="M53 70l8-3M89 70l8-3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><path d="M60 98Q80 118 100 98" fill="none" stroke="#7a3b00" stroke-width="3.6" stroke-linecap="round"/><ellipse cx="50" cy="94" rx="6.4" ry="4" fill="#ff8a65" opacity=".6"/><ellipse cx="110" cy="94" rx="6.4" ry="4" fill="#ff8a65" opacity=".6"/>';
var CLOUD='<path d="M30 62H92A20 20 0 0 0 96 22.4 28 28 0 0 0 42 26 18 18 0 0 0 30 62z" fill="#fff" stroke="#86cfe9" stroke-width="3.2" stroke-linejoin="round"/><path d="M40 52Q52 46 64 52" fill="none" stroke="#cfeaf6" stroke-width="3" stroke-linecap="round"/>';
var FLAM='<ellipse cx="70" cy="122" rx="56" ry="20" fill="#ff6fa5" stroke="#b3135f" stroke-width="3.4"/><ellipse cx="70" cy="119" rx="28" ry="8" fill="#4fc3f7" stroke="#b3135f" stroke-width="2.6"/><path d="M92 106C116 86 80 72 98 42" fill="none" stroke="#b3135f" stroke-width="17" stroke-linecap="round"/><path d="M92 106C116 86 80 72 98 42" fill="none" stroke="#ff9cc4" stroke-width="11" stroke-linecap="round"/><ellipse cx="62" cy="102" rx="30" ry="19" fill="#ff9cc4" stroke="#b3135f" stroke-width="3.2"/><path d="M36 96Q22 82 28 70Q40 80 46 90z" fill="#ff7fb2" stroke="#b3135f" stroke-width="2.6" stroke-linejoin="round"/><circle cx="100" cy="36" r="12" fill="#ff9cc4" stroke="#b3135f" stroke-width="3.2"/><path d="M107 33Q128 32 124 48Q114 44 108 42z" fill="#ffd9e8" stroke="#b3135f" stroke-width="2.6" stroke-linejoin="round"/><path d="M118 40Q125 44 124 48Q121 46 118 44z" fill="#222"/><circle cx="98" cy="33" r="3" fill="#222"/><circle cx="99" cy="32" r="1" fill="#fff"/><path d="M52 112Q62 104 74 112" fill="none" stroke="#b3135f" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>';
var BALL=(function(){var cols=['#ff5252','#fff','#ffd93b','#fff','#4fc3f7','#fff'],s='',i,r=26;for(i=0;i<6;i++){var a0=i*Math.PI/3-Math.PI/2,a1=(i+1)*Math.PI/3-Math.PI/2;s+='<path d="M30 30L'+(30+r*Math.cos(a0)).toFixed(2)+' '+(30+r*Math.sin(a0)).toFixed(2)+'A'+r+' '+r+' 0 0 1 '+(30+r*Math.cos(a1)).toFixed(2)+' '+(30+r*Math.sin(a1)).toFixed(2)+'z" fill="'+cols[i]+'"/>'}return s+'<circle cx="30" cy="30" r="26" fill="none" stroke="#2b3a55" stroke-width="3"/><circle cx="30" cy="30" r="4" fill="#fff" stroke="#2b3a55" stroke-width="2.4"/>'})();
var DUCK='<ellipse cx="32" cy="44" rx="25" ry="14" fill="#ffd93b" stroke="#c98a00" stroke-width="3.2"/><circle cx="46" cy="22" r="14" fill="#ffd93b" stroke="#c98a00" stroke-width="3.2"/><path d="M58 22Q72 21 67 31Q60 31 57 28z" fill="#ff8a1f" stroke="#b45309" stroke-width="2.4" stroke-linejoin="round"/><circle cx="48" cy="18" r="2.8" fill="#222"/><circle cx="49" cy="17" r="1" fill="#fff"/><path d="M14 40Q26 34 36 44" fill="none" stroke="#c98a00" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="53" cy="27" rx="4" ry="2.6" fill="#ff8a65" opacity=".6"/>';
var GLASS='<rect x="2" y="3" width="14" height="9" rx="4" fill="#1f2937"/><rect x="20" y="3" width="14" height="9" rx="4" fill="#1f2937"/><path d="M16 6h4" stroke="#1f2937" stroke-width="2"/><path d="M5 5l4-1.4M23 5l4-1.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>';
var BALLOON='<ellipse cx="30" cy="28" rx="24" ry="27" fill="#ff5a5f" stroke="#7a1f23" stroke-width="2.8"/><ellipse cx="30" cy="28" rx="14" ry="27" fill="#ffd23f" stroke="#7a5a00" stroke-width="2.4"/><ellipse cx="30" cy="28" rx="5.4" ry="27" fill="#4fc3f7" stroke="#0b5a80" stroke-width="2.2"/><path d="M12 50L22 64M48 50L38 64M30 55V64" stroke="#7a4a21" stroke-width="2" stroke-linecap="round"/><rect x="21" y="62" width="18" height="12" rx="2.4" fill="#c98a4a" stroke="#6b4423" stroke-width="2.4"/>';
var BOAT='<path d="M6 40H64L56 52H14z" fill="#e53935" stroke="#7a1f23" stroke-width="2.8" stroke-linejoin="round"/><path d="M35 38V4" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/><path d="M37 6L60 36H37z" fill="#fff" stroke="#9aa7b5" stroke-width="2.4" stroke-linejoin="round"/><path d="M33 12L14 36H33z" fill="#bfe8fb" stroke="#6aa6c4" stroke-width="2.4" stroke-linejoin="round"/><path d="M35 4L46 8L35 12z" fill="#ffd23f" stroke="#c98a00" stroke-width="1.6" stroke-linejoin="round"/>';
function wave(fill,y,hl){
  var p='M0 '+y,i,s='';
  for(i=0;i<24;i++)p+='Q'+(i*100+25)+' '+(y-20)+' '+(i*100+50)+' '+y+'T'+(i*100+100)+' '+y;
  if(hl)for(i=0;i<24;i+=2)s+='<path d="M'+(i*100+30)+' '+(y+12)+'q14 -8 30 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 80" preserveAspectRatio="none" width="200%" height="100%" style="display:block"><path d="'+p+'V80H0z" fill="'+fill+'"/><path d="'+p+'" fill="none" stroke="#1d8fc4" stroke-width="3" vector-effect="non-scaling-stroke"/>'+s+'</svg>';
}
window.CloudSeason.reg('su',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?44:56,i,sunw=m?78:140,sun,bal;
    sun=k.el('','<div style="position:absolute;left:-30%;top:-30%;width:160%;height:160%;border-radius:50%;background:radial-gradient(circle,rgba(255,220,80,.5),rgba(255,220,80,0) 66%)"></div><div class="zs-rays" style="position:absolute;inset:0">'+k.svg('0 0 160 160',RAYS)+'</div><div style="position:absolute;inset:0">'+k.svg('0 0 160 160',SUNFACE)+'</div>','right:'+(m?'-16px':'3%')+';width:'+sunw+'px;height:'+sunw+'px');
    var cd=[[40,'80s','-12s',m?84:120],[110,'110s','-60s',m?64:96],[190,'95s','-35s',m?72:108]],cl=[];
    for(i=0;i<(m?2:3);i++)cl.push(k.el('zs-cloud',k.svg('0 0 120 70',CLOUD),'top:0;width:'+cd[i][3]+'px;animation-duration:'+cd[i][1]+';animation-delay:'+cd[i][2]+';opacity:.95',true));
    bal=k.el('zs-fly',k.svg('0 0 60 80',BALLOON),'width:'+(m?46:70)+'px;animation-duration:'+(m?90:110)+'s;animation-delay:-30s');
    bal.innerHTML='<div>'+bal.innerHTML+'</div>';
    k.hbWatch(function(hb){sun.style.top=(hb+(m?2:12))+'px';cl.forEach(function(c,j){c.style.top=(hb+cd[j][0])+'px'});bal.style.top=(hb+(m?70:90))+'px'});
    k.el('zs-wv',wave('#7ad9ff',40,false),'left:0;bottom:0;width:100%;height:'+gh+'px;opacity:.95');
    var bt=k.el('zs-fly',k.svg('0 0 70 56',BOAT),'bottom:'+Math.round(gh*.5)+'px;width:'+(m?44:66)+'px;animation-duration:'+(m?70:90)+'s;animation-delay:-45s');
    bt.innerHTML='<div>'+bt.innerHTML+'</div>';
    k.el('zs-spin zs-bob',k.svg('0 0 60 60',BALL),'left:'+(wd?'46%':'5%')+';bottom:'+Math.round(gh*.42)+'px;width:'+(m?34:50)+'px');
    k.el('zs-bob',k.svg('0 0 72 58',DUCK),'left:'+(wd?'58%':'30%')+';bottom:'+Math.round(gh*.36)+'px;width:'+(m?38:56)+'px;animation-delay:-1.2s');
    k.el('zs-bob',k.svg('0 0 140 150',FLAM),'right:4%;bottom:'+Math.round(gh*.2)+'px;width:'+(m?74:120)+'px');
    k.el('zs-wv b2',wave('#35b8f2',34,true),'left:0;bottom:0;width:100%;height:'+Math.round(gh*.62)+'px');
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 15" style="display:block;overflow:visible">'+GLASS+'</svg>',.12,.3,m?18:20);
    function bsp(col,hi){return k.sprite(22,22,function(c){c.beginPath();c.arc(0,0,8.5,0,6.283);c.lineWidth=1.8;c.strokeStyle=col;c.stroke();c.beginPath();c.arc(0,0,5.6,3.5,4.7);c.lineWidth=1.6;c.strokeStyle=hi;c.stroke()})}
    var sd=bsp('rgba(255,255,255,.78)','rgba(255,255,255,.96)'),sl=bsp('rgba(20,140,190,.7)','rgba(255,255,255,.98)'),h0=document.documentElement,b=[],n=m?12:24;
    for(i=0;i<n;i++)b.push({x:Math.random(),y:Math.random(),z:k.rnd(.45,1.1),v:k.rnd(14,38),a:k.rnd(4,12),p:k.rnd(0,6.28)});
    k.canvas(function(c,dt,t,w,h){
      var sp=h0.getAttribute('data-theme')==='light'?sl:sd,cnt=Math.ceil(n*k.q()),j,o;
      for(j=0;j<cnt;j++){
        o=b[j];o.y-=o.v*dt/h;
        if(o.y<-.04){o.y=1.02;o.x=Math.random()}
        k.put(c,sp,o.x*w+Math.sin(t*1.1+o.p)*o.a,o.y*h,o.z,0);
      }
    },true,24);
  }
});
})();
