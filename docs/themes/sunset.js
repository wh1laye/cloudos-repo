(function(){
function bird(c,ph){
  var f=Math.sin(ph)*4;
  c.beginPath();c.moveTo(-8,f);c.quadraticCurveTo(-4,-2,0,0);c.quadraticCurveTo(4,-2,8,f);c.stroke();
}
window.CloudSeason.reg('sk',{
  init:function(k){
    var m=k.mobile(),CL=[],BD=[],j,gh=m?100:170;
    k.el('',k.strip(gh,[{d:k.hill(1000,60,46,6,3),fill:'rgba(130,40,90,.78)',line:'rgba(255,160,120,.5)',w:2},{d:k.hill(1000,92,34,8,9),fill:'rgba(80,22,66,.92)',line:'rgba(255,130,100,.4)',w:2},{d:k.hill(1000,120,20,11,5),fill:'rgba(40,10,40,.97)',line:'rgba(255,110,90,.3)',w:2}]),'left:0;right:0;bottom:0;height:'+gh+'px',true);
    for(j=0;j<(m?4:7);j++)CL.push({x:Math.random(),y:k.rnd(.08,.42),s:k.rnd(.6,1.6),v:k.rnd(.002,.006)});
    for(j=0;j<(m?3:6);j++)BD.push({x:Math.random(),y:k.rnd(.12,.45),v:k.rnd(.01,.025),p:k.rnd(0,6.28),z:k.rnd(.7,1.3)});
    k.canvas(function(c,dt,t,w,h){
      var sx=w*.72,sy=h*(.6+Math.sin(t*.05)*.01),R=Math.min(w,h)*.09,g,i,o,a;
      g=c.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'rgba(120,50,140,.14)');g.addColorStop(.6,'rgba(255,120,110,.14)');g.addColorStop(1,'rgba(255,170,80,.2)');
      c.fillStyle=g;c.fillRect(0,0,w,h);
      g=c.createRadialGradient(sx,sy,R*.5,sx,sy,R*5);
      g.addColorStop(0,'rgba(255,180,100,.5)');g.addColorStop(1,'rgba(255,140,90,0)');
      c.fillStyle=g;c.beginPath();c.arc(sx,sy,R*5,0,6.283);c.fill();
      c.fillStyle='rgba(255,255,220,.05)';
      for(i=0;i<6;i++){a=t*.03+i*1.047;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+Math.cos(a)*w,sy+Math.sin(a)*w);c.lineTo(sx+Math.cos(a+.12)*w,sy+Math.sin(a+.12)*w);c.closePath();c.fill()}
      c.fillStyle='rgba(255,190,110,.9)';c.beginPath();c.arc(sx,sy,R,0,6.283);c.fill();
      for(j=0;j<CL.length;j++){
        o=CL[j];o.x+=o.v*dt;if(o.x>1.2)o.x=-.2;
        c.fillStyle='rgba(255,185,170,.32)';
        c.beginPath();c.ellipse(o.x*w,o.y*h,70*o.s,16*o.s,0,0,6.283);c.ellipse(o.x*w+40*o.s,o.y*h+4,50*o.s,12*o.s,0,0,6.283);c.ellipse(o.x*w-38*o.s,o.y*h+5,46*o.s,11*o.s,0,0,6.283);c.fill();
      }
      c.strokeStyle='rgba(60,20,50,.8)';c.lineWidth=1.6;c.lineCap='round';
      for(j=0;j<BD.length;j++){
        o=BD[j];o.x+=o.v*dt;if(o.x>1.1)o.x=-.1;
        c.save();c.translate(o.x*w,(o.y+Math.sin(t*.6+o.p)*.01)*h);c.scale(o.z,o.z);bird(c,t*7+o.p);c.restore();
      }
    },true,30,true);
  }
});
})();
