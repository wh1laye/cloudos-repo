(function(){
var WAVE1='<path d="M0 44Q40 12 80 44T160 44T240 44" fill="none" stroke="#00bfa5" stroke-width="3.5" stroke-linecap="round"/><path d="M0 48Q40 16 80 48T160 48T240 48" fill="none" stroke="#00897b" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>';
var WAVE2='<path d="M0 44Q40 20 80 44T160 44T240 44" fill="none" stroke="#00acc1" stroke-width="3" stroke-linecap="round"/><path d="M0 48Q40 24 80 48T160 48T240 48" fill="none" stroke="#0097a7" stroke-width="2" stroke-linecap="round" opacity=".75"/>';
var BOAT='<g transform="translate(0 8)"><path d="M50 38L18 62H82z" fill="#37474f" stroke="#263238" stroke-width="2"/><rect x="30" y="24" width="20" height="14" fill="#eceff1" stroke="#263238" stroke-width="1.5"/><line x1="40" y1="24" x2="40" y2="10" stroke="#263238" stroke-width="1.5"/><path d="M40 10L26 22L54 22z" fill="#cfd8dc" stroke="#263238" stroke-width="1.5"/><circle cx="40" cy="52" r="2" fill="#263238"/><circle cx="60" cy="54" r="2" fill="#263238"/></g>';
var BIRD='<path d="M0 0Q8 -6 16 0M16 0Q24 -6 32 0" fill="none" stroke="#263238" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
var BUBBLE='<circle cx="0" cy="0" r="5" fill="none" stroke="#b2dfdb" stroke-width="1.4"/><circle cx="0" cy="0" r="2" fill="#fff" opacity=".8"/>';
function spriteWave(k){
  return k.sprite(180,52,function(c){
    var g=c.createLinearGradient(0,0,180,0);g.addColorStop(0,'#00bfa5');g.addColorStop(.5,'#00897b');g.addColorStop(1,'#004d40');
    c.strokeStyle=g;c.lineWidth=3.5;c.lineCap='round';c.beginPath();c.moveTo(0,26);c.quadraticCurveTo(40,0,80,26);c.quadraticCurveTo(120,0,160,26);c.quadraticCurveTo(200,0,240,26);c.stroke();
  });
}
function spriteWave2(k){
  return k.sprite(180,52,function(c){
    var g=c.createLinearGradient(0,0,180,0);g.addColorStop(0,'#00acc1');g.addColorStop(.5,'#0097a7');g.addColorStop(1,'#004d40');
    c.strokeStyle=g;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(0,26);c.quadraticCurveTo(40,8,80,26);c.quadraticCurveTo(120,8,160,26);c.quadraticCurveTo(200,8,240,26);c.stroke();
  });
}
function spriteBoat(k){
  return k.sprite(80,70,function(c){
    c.fillStyle='#37474f';c.strokeStyle='#263238';c.lineWidth=2;c.lineJoin='round';
    c.beginPath();c.moveTo(50,38);c.lineTo(18,62);c.lineTo(82,62);c.closePath();c.fill();c.stroke();
    c.fillStyle='#eceff1';c.fillRect(30,24,20,14);c.strokeRect(30,24,20,14);
    c.beginPath();c.moveTo(40,24);c.lineTo(40,10);c.stroke();
    c.beginPath();c.moveTo(40,10);c.lineTo(26,22);c.lineTo(54,22);c.closePath();c.fillStyle='#cfd8dc';c.fill();c.stroke();
    c.fillStyle='#263238';c.beginPath();c.arc(40,52,2,0,6.283);c.fill();c.beginPath();c.arc(60,54,2,0,6.283);c.fill();
  });
}
function spriteBird(k){
  return k.sprite(40,20,function(c){
    c.strokeStyle='#263238';c.lineWidth=2.2;c.lineCap='round';c.lineJoin='round';
    c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(8,-6,16,0);c.moveTo(16,0);c.quadraticCurveTo(24,-6,32,0);c.stroke();
  });
}
window.CloudSeason.reg('oc',{
  init:function(k){
    var m=k.mobile(),wd=k.wide(),gh=m?34:44;
    k.el('zs-wv',WAVE1,'left:0;bottom:0;width:250%;height:'+gh+'px;opacity:.95');
    k.el('zs-wv b2',WAVE2,'left:-60%;bottom:0;width:250%;height:'+Math.round(gh*.68)+'px;opacity:.8');
    if(k.pc()){
      var bt=k.el('zs-fly',BOAT,'bottom:'+Math.round(gh*.52)+'px;width:'+(m?50:80)+'px;animation-duration:'+(m?65:85)+'s;animation-delay:-25s');
      bt.innerHTML='<div>'+bt.innerHTML+'</div>';
      for(var i=0;i<4;i++){
        k.el('zs-fly',BIRD,'left:'+k.rnd(10,85).toFixed(1)+'%;bottom:'+Math.round(gh*(.6+i*.12))+'px;width:'+(m?20:32)+'px;animation-duration:'+k.rnd(8,16).toFixed(1)+'s;animation-delay:'+(-k.rnd(0,12)).toFixed(1)+'s');
      }
    }
    k.logo('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block"><path d="M4 36Q32 4 60 36" fill="none" stroke="#00bfa5" stroke-width="3.5" stroke-linejoin="round"/><path d="M60 38H4" fill="none" stroke="#004d40" stroke-width="2"/><circle cx="20" cy="24" r="2.5" fill="#00bfa5"/><circle cx="32" cy="26" r="2.5" fill="#00acc1"/><circle cx="44" cy="24" r="2.5" fill="#00bfa5"/></svg>',.12,.3,m?18:24);
    if(k.pc()){
      var dots=[],nd=m?14:26;
      var spr=k.sprite(5,5,function(c){c.fillStyle='#b2dfdb';c.beginPath();c.arc(0,0,2.5,0,6.283);c.fill()});
      for(var i=0;i<nd;i++)dots.push({x:Math.random(),y:Math.random(),v:k.rnd(6,16),s:k.rnd(.7,1.5),p:k.rnd(0,6.28)});
      k.canvas(function(c,dt,t,w,h){
        var cnt=Math.ceil(nd*k.q()),j,o;
        for(j=0;j<cnt;j++){
          o=dots[j];o.y+=o.v*dt/h;o.x+=(4+Math.sin(t+o.p)*3)*dt/w;
          if(o.y>1.05){o.y=-.05;o.x=Math.random()}
          k.put(c,spr,o.x*w+Math.sin(t*o.s+o.p)*7,o.y*h,o.s,0);
        }
      },true,22);
    }
  }
});
})();
