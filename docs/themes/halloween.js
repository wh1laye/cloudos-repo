(function(){
var GHOST='<path d="M12 92V42C12 20 27 6 40 6s28 14 28 36v50l-10-10-9 10-9-10-9 10-9-10z" fill="#fff" stroke="#4b3a78" stroke-width="3.2" stroke-linejoin="round"/><g class="eye"><ellipse cx="30" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><ellipse cx="50" cy="42" rx="5.4" ry="7.4" fill="#2b1b4d"/><circle cx="31.8" cy="39" r="1.9" fill="#fff"/><circle cx="51.8" cy="39" r="1.9" fill="#fff"/></g><ellipse cx="40" cy="60" rx="5" ry="6.4" fill="#2b1b4d"/><ellipse cx="22" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/><ellipse cx="58" cy="54" rx="5" ry="3.2" fill="#ff9ac2" opacity=".65"/>';
var PUMPKIN='<path d="M56 18Q58 4 72 8L67 22z" fill="#5d9a2e" stroke="#2f5a14" stroke-width="3" stroke-linejoin="round"/><ellipse cx="38" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="82" cy="62" rx="30" ry="32" fill="#ff8f1f" stroke="#8a3d00" stroke-width="3.2"/><ellipse cx="60" cy="62" rx="26" ry="35" fill="#ffa02e" stroke="#8a3d00" stroke-width="3.2"/><g class="glow"><path d="M38 52L52 52L45 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M68 52L82 52L75 38z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 70L46 78L54 68L60 78L66 68L74 78L84 70Q60 98 36 70z" fill="#ffe680" stroke="#8a3d00" stroke-width="2.4" stroke-linejoin="round"/></g>';
var SPIDER='<i></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 56" width="46" style="display:block;overflow:visible"><g fill="none" stroke="#2b1b4d" stroke-width="3.2" stroke-linecap="round"><path d="M20 30Q6 22 3 36M20 36Q5 36 5 50M22 42Q10 48 12 56M24 26Q14 14 8 20M40 30Q54 22 57 36M40 36Q55 36 55 50M38 42Q50 48 48 56M36 26Q46 14 52 20"/></g><circle cx="30" cy="34" r="14" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="30" cy="18" r="9" fill="#2b1b4d" stroke="#9b7bd8" stroke-width="2"/><circle cx="26" cy="17" r="3.6" fill="#fff"/><circle cx="34" cy="17" r="3.6" fill="#fff"/><circle cx="26.6" cy="17.6" r="1.7" fill="#111"/><circle cx="34.6" cy="17.6" r="1.7" fill="#111"/><circle cx="30" cy="38" r="4" fill="#ff8f1f"/></svg>';
var MOON='<circle cx="50" cy="50" r="42" fill="#fff3b0" stroke="#e0c866" stroke-width="3"/><circle cx="34" cy="38" r="8" fill="#f0dd86"/><circle cx="62" cy="60" r="11" fill="#f0dd86"/><circle cx="58" cy="30" r="5" fill="#f0dd86"/><circle cx="36" cy="66" r="4.4" fill="#f0dd86"/>';
var WEB='<g fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.8" stroke-linecap="round"><path d="M0 0L118 0M0 0L108 54M0 0L84 84M0 0L54 108M0 0L0 118"/><path d="M34 0Q30 30 0 34M66 0Q56 54 0 66M98 0Q80 80 0 98"/></g>';
var TOMB='<path d="M6 70V30Q6 6 28 6t22 24v40z" fill="#9a93b0" stroke="#4b3a78" stroke-width="3" stroke-linejoin="round"/><path d="M28 22v22M20 30h16" stroke="#4b3a78" stroke-width="3.4" stroke-linecap="round"/><path d="M2 72h52" stroke="#4b3a78" stroke-width="3" stroke-linecap="round"/>';
var HAT='<ellipse cx="20" cy="29" rx="19" ry="5" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.8"/><path d="M9 28Q18 22 21 3Q25 19 31 28z" fill="#2b1b4d" stroke="#8a66d8" stroke-width="1.8" stroke-linejoin="round"/><rect x="10" y="22" width="19" height="4" fill="#ff8f1f"/>';
var LC=['#ff8f1f','#e8590c','#f6c23e','#b5541a','#d9480f'];
function leaf(c,x,y,r,rot,col){
  c.save();c.translate(x,y);c.rotate(rot);
  c.beginPath();c.moveTo(0,-r);c.bezierCurveTo(r*.95,-r*.5,r*.9,r*.5,0,r);c.bezierCurveTo(-r*.9,r*.5,-r*.95,-r*.5,0,-r);
  c.fillStyle=col;c.fill();c.lineWidth=1.8;c.strokeStyle='rgba(60,25,5,.85)';c.stroke();
  c.beginPath();c.moveTo(0,-r);c.lineTo(0,r*1.35);c.moveTo(0,-r*.1);c.lineTo(r*.4,-r*.45);c.moveTo(0,r*.25);c.lineTo(-r*.4,-r*.1);c.stroke();
  c.restore();
}
function bat(c,x,y,s,f){
  c.save();c.translate(x,y);c.scale(s,s);
  var a=Math.sin(f)*11,k;
  c.fillStyle='#1b1030';c.strokeStyle='#7a5cc0';c.lineWidth=2;c.lineJoin='round';
  for(k=-1;k<=1;k+=2){
    c.beginPath();c.moveTo(k*5,-1);c.quadraticCurveTo(k*20,-16-a,k*42,-8-a*1.5);c.quadraticCurveTo(k*35,0,k*31,6);c.quadraticCurveTo(k*23,0,k*17,8);c.quadraticCurveTo(k*10,2,k*5,10);c.closePath();c.fill();c.stroke();
  }
  c.beginPath();c.ellipse(0,2,7,9,0,0,6.283);c.fill();c.stroke();
  c.beginPath();c.moveTo(-6,-5);c.lineTo(-6,-14);c.lineTo(-1,-7);c.moveTo(6,-5);c.lineTo(6,-14);c.lineTo(1,-7);c.fill();c.stroke();
  c.fillStyle='#ffd23f';c.beginPath();c.arc(-2.8,0,1.7,0,6.283);c.arc(2.8,0,1.7,0,6.283);c.fill();
  c.restore();
}
window.CloudSeason.reg('hw',{
  init:function(k){
    k.el('sx-fog','');
    k.el('sx-moon',k.svg('0 0 100 100',MOON));
    k.el('',k.svg('0 0 118 118',WEB),'left:0;top:54px;width:'+(k.mobile()?80:118)+'px');
    k.el('sx-pumpkin',k.svg('0 0 120 100',PUMPKIN));
    k.el('',k.svg('0 0 56 78',TOMB),'right:3%;bottom:6px;width:'+(k.mobile()?40:58)+'px');
    k.el('',k.svg('0 0 56 78',TOMB),'right:calc(3% + 54px);bottom:2px;width:'+(k.mobile()?32:46)+'px');
    k.el('sx-spider',SPIDER);
    var gs=k.mobile()?1:3,i,pos=[[.82,.35,'0s'],[.1,.55,'-2s'],[.9,.7,'-4s']];
    for(i=0;i<gs;i++)k.el('sx-ghost',k.svg('0 0 80 100',GHOST),'left:'+(pos[i][0]*100)+'%;top:'+(pos[i][1]*100)+'%;width:'+(k.mobile()?44:64)+'px;opacity:.92;animation-delay:'+pos[i][2]);
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 32" width="26" height="21">'+HAT+'</svg>','left:-4px;top:-12px;transform:rotate(-10deg)');
    var lv=[],n=Math.round(Math.min(60,k.W()*k.H()/24000)*k.scale),b=[],nb=Math.max(1,Math.round((k.mobile()?2:4)*k.scale));
    for(i=0;i<n;i++)lv.push({x:Math.random(),y:Math.random(),r:k.rnd(9,17),v:k.rnd(30,62),a:k.rnd(14,40),p:k.rnd(0,6.28),s:k.rnd(.5,1.3),rot:k.rnd(0,6.28),rs:k.rnd(-1.6,1.6),c:LC[i%LC.length]});
    for(i=0;i<nb;i++)b.push({x:-.1-i*.28,y:k.rnd(.12,.6),v:k.rnd(70,115),s:k.rnd(1.1,1.7),ph:k.rnd(0,6)});
    k.canvas(function(c,dt,t,w,h){
      lv.forEach(function(l){
        l.y+=l.v*dt/h;l.rot+=l.rs*dt;
        if(l.y>1.04){l.y=-.04;l.x=Math.random()}
        leaf(c,l.x*w+Math.sin(t*l.s+l.p)*l.a,l.y*h,l.r,l.rot+Math.sin(t*l.s+l.p)*.5,l.c);
      });
      b.forEach(function(o){
        o.x+=o.v*dt/w;
        if(o.x>1.1){o.x=-.1;o.y=k.rnd(.1,.6)}
        bat(c,o.x*w,o.y*h+Math.sin(t*2.4+o.ph)*22,o.s,t*14+o.ph);
      });
    });
  }
});
})();
