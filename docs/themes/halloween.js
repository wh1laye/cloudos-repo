(function(){
var GHOST='<path d="M12 92V42C12 20 27 6 40 6s28 14 28 36v50l-10-10-9 10-9-10-9 10-9-10z" fill="#fff" stroke="#4b3a78" stroke-width="3.2" stroke-linejoin="round"/><ellipse cx="30" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><ellipse cx="50" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><circle cx="31.8" cy="39" r="1.9" fill="#fff"/><circle cx="51.8" cy="39" r="1.9" fill="#fff"/><ellipse cx="40" cy="60" rx="5" ry="6.4" fill="#2b1b4d"/><ellipse cx="22" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/><ellipse cx="58" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/>';
var PUMPKIN='<path d="M56 18Q58 4 72 8L67 22z" fill="#5d9a2e" stroke="#2f5a14" stroke-width="3" stroke-linejoin="round"/><ellipse cx="38" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="82" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="60" cy="62" rx="26" ry="35" fill="#ffa02e" stroke="#8a3d00" stroke-width="3.2"/><path d="M38 52L52 52L45 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M68 52L82 52L75 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 70L46 78L54 68L60 78L66 68L74 78L84 70Q60 98 36 70z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/>';
var SPIDER='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" style="display:block;overflow:visible"><g fill="none" stroke="#2b1b4d" stroke-width="3.2" stroke-linecap="round"><path d="M20 30Q6 22 3 36M20 36Q5 36 5 50M22 42Q10 48 12 56M24 26Q14 14 8 20M40 30Q54 22 57 36M40 36Q55 36 55 50M38 42Q50 48 48 56M36 26Q46 14 52 20"/></g><circle cx="30" cy="34" r="14" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="30" cy="18" r="9" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="26" cy="17" r="3.6" fill="#fff"/><circle cx="34" cy="17" r="3.6" fill="#fff"/><circle cx="26.6" cy="17.6" r="1.7" fill="#111"/><circle cx="34.6" cy="17.6" r="1.7" fill="#111"/><circle cx="30" cy="38" r="4" fill="#ff8f1f"/></svg>';
var MOON='<circle cx="50" cy="50" r="46" fill="#fff3b0" stroke="#e0c866" stroke-width="3"/><circle cx="34" cy="38" r="8" fill="#f0dd86"/><circle cx="62" cy="60" r="11" fill="#f0dd86"/><circle cx="58" cy="30" r="5" fill="#f0dd86"/><circle cx="36" cy="66" r="4.4" fill="#f0dd86"/>';
var WEB='<g fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.8" stroke-linecap="round"><path d="M0 0L118 0M0 0L108 54M0 0L84 84M0 0L54 108M0 0L0 118"/><path d="M34 0Q30 30 0 34M66 0Q56 54 0 66M98 0Q80 80 0 98"/></g>';
var TOMB='<path d="M6 70V30Q6 6 28 6t22 24v40z" fill="#9a93b0" stroke="#4b3a78" stroke-width="3" stroke-linejoin="round"/><path d="M28 22v22M20 30h16" stroke="#4b3a78" stroke-width="3.4" stroke-linecap="round"/><path d="M2 72h52" stroke="#4b3a78" stroke-width="3" stroke-linecap="round"/>';
function hatLogo(cd){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><g transform="rotate(-8 31 12)">'
  +'<path d="M17 8.6L29.5 -13Q32 -17.4 40 -15.6Q34 -13 33.4 -8.4L45 8.6z" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.5" stroke-linejoin="round"/>'
  +'<path d="M22.4 -.6Q31 2.6 39.6 -.6L41.8 3.2Q31 6.8 20.2 3.2z" fill="#ff8f1f" stroke="#b85a00" stroke-width=".8" stroke-linejoin="round"/>'
  +'<ellipse cx="31" cy="8.8" rx="19.5" ry="4.2" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.5"/>'
  +'</g></svg>';
}
var WITCH='<g fill="none" stroke="#c9b6ff" stroke-width="2" stroke-linecap="round" opacity=".55"><path d="M-14 50H-2M-22 58H-6M-12 66H0"/></g><path d="M20 62L146 47" stroke="#7a4a21" stroke-width="5" stroke-linecap="round"/><path d="M38 56L10 45L16 53L5 58L15 63L8 72L38 64z" fill="#e0a43a" stroke="#8a5a1e" stroke-width="2" stroke-linejoin="round"/><path d="M13 49L30 57M10 62L30 60" stroke="#8a5a1e" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M35 55L40 64" stroke="#5a3a14" stroke-width="4.5" stroke-linecap="round"/><path d="M46 56Q47 46 53 42Q58 47 57 56z" fill="#1b1030"/><path d="M50 43l-1-6 4 3zM55 43l2-5 1 6z" fill="#1b1030"/><circle cx="52.5" cy="47" r="1.1" fill="#ffd23f"/><path d="M72 58C60 58 52 64 40 60C50 54 62 52 74 52z" fill="#55309a" stroke="#2b1b4d" stroke-width="2.2" stroke-linejoin="round"/><path d="M78 56L80 71M70 57L69 69" stroke="#3b2a6b" stroke-width="6.5" stroke-linecap="round"/><ellipse cx="86" cy="73" rx="8.5" ry="4" fill="#1b1030" stroke="#7a5cc0" stroke-width="1.6"/><ellipse cx="75" cy="71" rx="8" ry="3.8" fill="#1b1030" stroke="#7a5cc0" stroke-width="1.6"/><path d="M68 56C66 44 74 34 87 33C95 36 96 47 90 57z" fill="#6a3fb0" stroke="#2b1b4d" stroke-width="2.6" stroke-linejoin="round"/><path d="M86 40L106 50" stroke="#6a3fb0" stroke-width="6" stroke-linecap="round"/><circle cx="107" cy="50.5" r="3.4" fill="#8ad46b" stroke="#2b1b4d" stroke-width="1.8"/><path d="M84 24C76 18 66 24 56 20C62 28 72 31 84 32z" fill="#e8590c" stroke="#8a3d00" stroke-width="1.8" stroke-linejoin="round"/><circle cx="92" cy="27" r="9.8" fill="#8ad46b" stroke="#2b1b4d" stroke-width="2.4"/><path d="M99 25l11 5-10 4z" fill="#8ad46b" stroke="#2b1b4d" stroke-width="1.9" stroke-linejoin="round"/><circle cx="105.5" cy="31" r="1.3" fill="#5c8f3f"/><circle cx="96" cy="24.5" r="2.5" fill="#fff"/><circle cx="96.8" cy="24.8" r="1.2" fill="#222"/><path d="M93 33Q97 36 101 33" fill="none" stroke="#2b1b4d" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="91" cy="18.5" rx="17" ry="4.4" transform="rotate(-6 91 18.5)" fill="#2b1b4d" stroke="#7a5cc0" stroke-width="2"/><path d="M80 18C82 9 79 0 70 -9Q66 -13 62 -10Q70 -8 82 -2C88 6 94 13 102 16z" fill="#2b1b4d" stroke="#7a5cc0" stroke-width="2" stroke-linejoin="round"/><path d="M80.5 14.5Q91 18 101 14.5L102 17Q91 21 80 17.5z" fill="#ff8f1f"/>';
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
    var m=k.mobile(),wd=k.wide(),gh=m?40:50,i,pw=m?64:92,web,spd,moon,wch,wch2;
    k.el('zs-fog','');
    if(k.pc())k.el('zs-fog zs-fog2','');
    k.el('',k.strip(60,[{d:k.hill(1000,34,16,4,9),fill:'#3b2866',line:'#8a66d8'},{d:k.hill(1000,44,12,6,4),fill:'#241540',line:'#6b4bb0'}]),'left:0;right:0;bottom:0;height:'+gh+'px');
    function pk(css,w){
      var e=k.el('',('<div class="zs-pglow" style="position:absolute;left:-18%;top:-10%;width:136%;height:120%"></div>')+k.svg('0 0 120 100',PUMPKIN),css+'width:'+w+'px');
    }
    pk((wd?'right:calc(3% + 100px);':'left:2%;')+'bottom:'+Math.round(gh*.34)+'px;',pw);
    pk((wd?'right:calc(3% + '+(100+Math.round(pw*.84))+'px);':'left:calc(2% + '+Math.round(pw*.82)+'px);')+'bottom:'+Math.round(gh*.26)+'px;',Math.round(pw*.55));
    k.el('',k.svg('0 0 56 78',TOMB),'right:3%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?28:44)+'px');
    k.el('',k.svg('0 0 56 78',TOMB),'right:calc(3% + '+(m?30:48)+'px);bottom:'+Math.round(gh*.3)+'px;width:'+(m?22:36)+'px');
    var gp=m?[[.8,gh+54,40,'0s']]:[[.9,.32,64,'0s'],[.8,gh+90,56,'-3s']];
    if(k.pc())gp.push([.62,gh+130,48,'-5s'],[.05,gh+110,44,'-1.5s']);
    gp.forEach(function(g){
      var css=m||g[1]>1?'left:'+(g[0]*100)+'%;bottom:'+g[1]+'px;':'left:'+(g[0]*100)+'%;top:'+(g[1]*100)+'%;';
      k.el('zs-ghost',k.svg('0 0 80 100',GHOST),css+'width:'+g[2]+'px;opacity:.92;animation-delay:'+g[3]);
    });
    var sw=m?36:46;
    spd=k.el('zs-sp','<i class="zs-spth"></i><div class="zs-spbd">'+k.svg('0 0 60 56',SPIDER.replace(/^<svg[^>]*>|<\/svg>$/g,''))+'</div>','right:'+(m?'18%':'13%')+';width:'+sw+'px;height:130px');
    web=k.el('',k.svg('0 0 118 118',WEB),'right:0;transform:scaleX(-1);width:'+(m?64:110)+'px');
    if(wd)moon=k.el('zs-moon',k.svg('0 0 100 100',MOON),'right:12%;width:88px;height:88px');
    wch=k.el('zs-fly',k.svg('0 0 150 84',WITCH),'width:'+(m?96:140)+'px;animation-duration:'+(m?40:52)+'s;animation-delay:-14s');
    wch.innerHTML='<div>'+wch.innerHTML+'</div>';
    if(k.pc()){
      wch2=k.el('zs-fly r',k.svg('0 0 150 84',WITCH).replace('display:block','display:block;transform:scaleX(-1)'),'width:86px;opacity:.9;animation-duration:64s;animation-delay:-38s');
      wch2.innerHTML='<div style="animation-delay:-1.4s">'+wch2.innerHTML+'</div>';
    }
    k.hbWatch(function(hb){spd.style.top=hb+'px';web.style.top=hb+'px';if(moon)moon.style.top=(hb+18)+'px';wch.style.top=(hb+(m?96:110))+'px';if(wch2)wch2.style.top=(hb+190)+'px'});
    k.logo(hatLogo,0,0,0,{fit:true});
    var spr=LC.map(function(c){return leafSprite(k,c)}),lv=[],n=k.n(48);
    for(i=0;i<n;i++)lv.push({x:Math.random(),y:Math.random(),z:k.rnd(.6,1.15),v:k.rnd(30,62),a:k.rnd(14,40),p:k.rnd(0,6.28),s:k.rnd(.5,1.3),rot:k.rnd(0,6.28),rs:k.rnd(-1.6,1.6),c:i%LC.length});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(n*k.q()),j,l;
      for(j=0;j<cnt;j++){
        l=lv[j];l.y+=l.v*dt/h;l.rot+=l.rs*dt;
        if(l.y>1.04){l.y=-.04;l.x=Math.random()}
        k.put(c,spr[l.c],l.x*w+Math.sin(t*l.s+l.p)*l.a,l.y*h,l.z,l.rot+Math.sin(t*l.s+l.p)*.5);
      }
    },true,30);
    if(k.pc()){
      var bolt=k.el('zs-bolt','<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none"></svg>','left:0;top:0;width:100%;height:100%'),nx=k.rnd(6,12);
      var bsv=bolt.firstChild;
      var tick=function(dt,t){
        if(t<nx)return;
        nx=t+k.rnd(14,28);
        var x=k.rnd(120,880),y=0,p='M'+x+' 0',j;
        for(j=0;j<9;j++){y+=k.rnd(60,110);x+=k.rnd(-70,70);p+='L'+x.toFixed(0)+' '+y.toFixed(0)}
        bsv.innerHTML='<path d="'+p+'" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" opacity=".85"/><path d="'+p+'" fill="none" stroke="#c9b6ff" stroke-width="9" stroke-linejoin="round" opacity=".25"/>';
        bolt.classList.remove('go');void bolt.offsetWidth;bolt.classList.add('go');
      };
      k.tick(tick);
      var emb=k.sprite(14,14,function(c){var g=c.createRadialGradient(0,0,0,0,0,6);g.addColorStop(0,'rgba(255,230,140,1)');g.addColorStop(.35,'rgba(255,140,30,.85)');g.addColorStop(1,'rgba(255,90,0,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,6,0,6.283);c.fill()}),em=[],ne=k.n(26),e0;
      for(e0=0;e0<ne;e0++)em.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.2),v:k.rnd(22,58),a:k.rnd(6,24),p:k.rnd(0,6.28),s:k.rnd(.6,1.6)});
      k.canvas(function(c,dt,t,w,h){
        var cnt=Math.ceil(ne*k.q()),j,o;
        for(j=0;j<cnt;j++){
          o=em[j];o.y-=o.v*dt/h;
          if(o.y<-.04){o.y=1.03;o.x=Math.random()}
          c.globalAlpha=.55+.45*Math.sin(t*3*o.s+o.p);
          k.put(c,emb,o.x*w+Math.sin(t*o.s+o.p)*o.a,o.y*h,o.z,0);
        }
        c.globalAlpha=1;
      },false,30);
    }
    var bf=[],b=[],nb=k.n(4);
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
