(function(){
var GHOST='<path d="M12 92V42C12 20 27 6 40 6s28 14 28 36v50l-10-10-9 10-9-10-9 10-9-10z" fill="#fff" stroke="#4b3a78" stroke-width="3.2" stroke-linejoin="round"/><ellipse cx="30" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><ellipse cx="50" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><circle cx="31.8" cy="39" r="1.9" fill="#fff"/><circle cx="51.8" cy="39" r="1.9" fill="#fff"/><ellipse cx="40" cy="60" rx="5" ry="6.4" fill="#2b1b4d"/><ellipse cx="22" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/><ellipse cx="58" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/>';
var PUMPKIN='<path d="M56 18Q58 4 72 8L67 22z" fill="#5d9a2e" stroke="#2f5a14" stroke-width="3" stroke-linejoin="round"/><ellipse cx="38" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="82" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="60" cy="62" rx="26" ry="35" fill="#ffa02e" stroke="#8a3d00" stroke-width="3.2"/><path d="M38 52L52 52L45 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M68 52L82 52L75 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 70L46 78L54 68L60 78L66 68L74 78L84 70Q60 98 36 70z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/>';
var SPIDER='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" style="display:block;overflow:visible"><g fill="none" stroke="#2b1b4d" stroke-width="3.2" stroke-linecap="round"><path d="M20 30Q6 22 3 36M20 36Q5 36 5 50M22 42Q10 48 12 56M24 26Q14 14 8 20M40 30Q54 22 57 36M40 36Q55 36 55 50M38 42Q50 48 48 56M36 26Q46 14 52 20"/></g><circle cx="30" cy="34" r="14" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="30" cy="18" r="9" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="26" cy="17" r="3.6" fill="#fff"/><circle cx="34" cy="17" r="3.6" fill="#fff"/><circle cx="26.6" cy="17.6" r="1.7" fill="#111"/><circle cx="34.6" cy="17.6" r="1.7" fill="#111"/><circle cx="30" cy="38" r="4" fill="#ff8f1f"/></svg>';
var MOON='<circle cx="50" cy="50" r="46" fill="#fff3b0" stroke="#e0c866" stroke-width="3"/><circle cx="34" cy="38" r="8" fill="#f0dd86"/><circle cx="62" cy="60" r="11" fill="#f0dd86"/><circle cx="58" cy="30" r="5" fill="#f0dd86"/><circle cx="36" cy="66" r="4.4" fill="#f0dd86"/>';
var WEB='<g fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.8" stroke-linecap="round"><path d="M0 0L118 0M0 0L108 54M0 0L84 84M0 0L54 108M0 0L0 118"/><path d="M34 0Q30 30 0 34M66 0Q56 54 0 66M98 0Q80 80 0 98"/></g>';
var TOMB='<path d="M6 70V30Q6 6 28 6t22 24v40z" fill="#9a93b0" stroke="#4b3a78" stroke-width="3" stroke-linejoin="round"/><path d="M28 22v22M20 30h16" stroke="#4b3a78" stroke-width="3.4" stroke-linecap="round"/><path d="M2 72h52" stroke="#4b3a78" stroke-width="3" stroke-linecap="round"/>';
var HAT='<ellipse cx="20" cy="29" rx="19" ry="5" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.8"/><path d="M9 28Q18 22 21 3Q25 19 31 28z" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.8" stroke-linejoin="round"/><rect x="10" y="22" width="19" height="4" fill="#ff8f1f"/>';
var WITCH='<path d="M24 60L148 42" stroke="#7a4a21" stroke-width="5" stroke-linecap="round"/><path d="M26 60L4 50L9 60L2 68L11 68L7 78L28 64z" fill="#e0a43a" stroke="#8a5a1e" stroke-width="2" stroke-linejoin="round"/><ellipse cx="38" cy="52" rx="9" ry="6.5" fill="#1b1030"/><circle cx="31" cy="45" r="5.4" fill="#1b1030"/><path d="M27 42l-1-6 5 3zM35 41l3-5 1 6z" fill="#1b1030"/><circle cx="29.5" cy="44.5" r="1.4" fill="#ffd23f"/><circle cx="33.5" cy="44.5" r="1.4" fill="#ffd23f"/><path d="M64 54Q70 32 90 36Q96 46 88 56z" fill="#6a3fb0" stroke="#2b1b4d" stroke-width="2.6" stroke-linejoin="round"/><circle cx="90" cy="28" r="9.6" fill="#8ad46b" stroke="#2b1b4d" stroke-width="2.4"/><path d="M98 29l10 3-9 3z" fill="#8ad46b" stroke="#2b1b4d" stroke-width="1.8" stroke-linejoin="round"/><circle cx="92" cy="26" r="1.8" fill="#222"/><path d="M76 24Q90 20 104 24" fill="none" stroke="#2b1b4d" stroke-width="5" stroke-linecap="round"/><path d="M79 23Q88 14 92 -6Q98 14 102 23z" fill="#2b1b4d" stroke="#7a5cc0" stroke-width="2" stroke-linejoin="round"/><rect x="82" y="15" width="19" height="4" fill="#ff8f1f"/>';
var LC=['#ff8f1f','#e8590c','#f6c23e','#b5541a','#d9480f'];
function leafSprite(k,col){
  return k.sprite(34,40,function(c){
    var r=14;
    c.beginPath();c.moveTo(0,-r);c.bezierCurveTo(r*.95,-r*.5,r*.9,r*.5,0,r);c.bezierCurveTo(-r*.9,r*.5,-r*.95,-r*.5,0,-r);
    c.fillStyle=col;c.fill();c.lineWidth=1.8;c.strokeStyle='rgba(60,25,5,.85)';c.stroke();
    c.beginPath();c.moveTo(0,-r);c.lineTo(0,r*1.35);c.moveTo(0,-r*.1);c.lineTo(r*.4,-r*.45);c.moveTo(0,r*.25);c.lineTo(-r*.4,-r*.1);c.stroke();
  });
}
function batSprite(k,f){
  return k.sprite(96,56,function(c){
    var a=Math.sin(f)*11,s,sg;
    c.translate(0,6);
    c.fillStyle='#1b1030';c.strokeStyle='#7a5cc0';c.lineWidth=2;c.lineJoin='round';
    for(sg=-1;sg<=1;sg+=2){
      c.beginPath();c.moveTo(sg*5,-1);c.quadraticCurveTo(sg*20,-16-a,sg*42,-8-a*1.5);c.quadraticCurveTo(sg*35,0,sg*31,6);c.quadraticCurveTo(sg*23,0,sg*17,8);c.quadraticCurveTo(sg*10,2,sg*5,10);c.closePath();c.fill();c.stroke();
    }
    c.beginPath();c.ellipse(0,2,7,9,0,0,6.283);c.fill();c.stroke();
    c.beginPath();c.moveTo(-6,-5);c.lineTo(-6,-14);c.lineTo(-1,-7);c.moveTo(6,-5);c.lineTo(6,-14);c.lineTo(1,-7);c.fill();c.stroke();
    c.fillStyle='#ffd23f';c.beginPath();c.arc(-2.8,0,1.7,0,6.283);c.arc(2.8,0,1.7,0,6.283);c.fill();
  });
}
window.CloudSeason.reg('hw',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?40:50,i,pw=m?64:92,web,spd,moon,wch;
    k.el('zs-fog','');
    k.el('',k.strip(60,[{d:k.hill(1000,34,16,4,9),fill:'#3b2866',line:'#8a66d8'},{d:k.hill(1000,44,12,6,4),fill:'#241540',line:'#6b4bb0'}]),'left:0;right:0;bottom:0;height:'+gh+'px');
    function pk(css,w){
      var e=k.el('',('<div class="zs-pglow" style="position:absolute;left:-18%;top:-10%;width:136%;height:120%"></div>')+k.svg('0 0 120 100',PUMPKIN),css+'width:'+w+'px');
    }
    pk((wd?'right:calc(3% + 100px);':'left:2%;')+'bottom:'+Math.round(gh*.34)+'px;',pw);
    pk((wd?'right:calc(3% + '+(100+Math.round(pw*.84))+'px);':'left:calc(2% + '+Math.round(pw*.82)+'px);')+'bottom:'+Math.round(gh*.26)+'px;',Math.round(pw*.55));
    k.el('',k.svg('0 0 56 78',TOMB),'right:3%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?28:44)+'px');
    k.el('',k.svg('0 0 56 78',TOMB),'right:calc(3% + '+(m?30:48)+'px);bottom:'+Math.round(gh*.3)+'px;width:'+(m?22:36)+'px');
    var gp=m?[[.8,gh+54,40,'0s']]:[[.9,.32,64,'0s'],[.8,gh+90,56,'-3s']];
    gp.forEach(function(g){
      var css=m||g[1]>1?'left:'+(g[0]*100)+'%;bottom:'+g[1]+'px;':'left:'+(g[0]*100)+'%;top:'+(g[1]*100)+'%;';
      k.el('zs-ghost',k.svg('0 0 80 100',GHOST),css+'width:'+g[2]+'px;opacity:.92;animation-delay:'+g[3]);
    });
    var sw=m?36:46;
    spd=k.el('zs-sp','<i class="zs-spth"></i><div class="zs-spbd">'+k.svg('0 0 60 56',SPIDER.replace(/^<svg[^>]*>|<\/svg>$/g,''))+'</div>','right:'+(m?'18%':'13%')+';width:'+sw+'px;height:130px');
    web=k.el('',k.svg('0 0 118 118',WEB),'right:0;transform:scaleX(-1);width:'+(m?64:110)+'px');
    if(wd)moon=k.el('zs-moon',k.svg('0 0 100 100',MOON),'right:12%;width:88px;height:88px');
    wch=k.el('zs-fly r',k.svg('0 0 150 84',WITCH),'width:'+(m?96:140)+'px;animation-duration:'+(m?40:52)+'s;animation-delay:-14s');
    wch.innerHTML='<div>'+wch.innerHTML+'</div>';
    k.hbWatch(function(hb){spd.style.top=hb+'px';web.style.top=hb+'px';if(moon)moon.style.top=(hb+18)+'px';wch.style.top=(hb+(m?96:110))+'px'});
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" style="display:block;overflow:visible">'+HAT+'</svg>',-.1,-.8,m?20:22);
    var spr=LC.map(function(c){return leafSprite(k,c)}),lv=[],n=m?22:48;
    for(i=0;i<n;i++)lv.push({x:Math.random(),y:Math.random(),z:k.rnd(.6,1.15),v:k.rnd(30,62),a:k.rnd(14,40),p:k.rnd(0,6.28),s:k.rnd(.5,1.3),rot:k.rnd(0,6.28),rs:k.rnd(-1.6,1.6),c:i%LC.length});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(n*k.q()),j,l;
      for(j=0;j<cnt;j++){
        l=lv[j];l.y+=l.v*dt/h;l.rot+=l.rs*dt;
        if(l.y>1.04){l.y=-.04;l.x=Math.random()}
        k.put(c,spr[l.c],l.x*w+Math.sin(t*l.s+l.p)*l.a,l.y*h,l.z,l.rot+Math.sin(t*l.s+l.p)*.5);
      }
    },true,30);
    var bf=[],b=[],nb=m?2:4;
    for(i=0;i<8;i++)bf.push(batSprite(k,i/8*6.283));
    for(i=0;i<nb;i++)b.push({x:-.1-i*.3,y:Math.random(),v:k.rnd(70,115),s:m?.9:1.2,ph:k.rnd(0,6)});
    k.canvas(function(c,dt,t,w,h){
      var top=k.hb()+16,cnt=Math.max(1,Math.ceil(nb*k.q())),j,o;
      for(j=0;j<cnt;j++){
        o=b[j];o.x+=o.v*dt/w;
        if(o.x>1.1){o.x=-.1;o.y=Math.random()}
        k.put(c,bf[Math.floor((((t*14+o.ph)%6.283)+6.283)%6.283/6.283*8)%8],o.x*w,top+o.y*80+Math.sin(t*2.4+o.ph)*14,o.s,0);
      }
    },false,30);
  }
});
})();
