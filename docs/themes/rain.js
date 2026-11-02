(function(){
window.CloudSeason.reg('rn',{
  init:function(k){
    var n=k.n(110),R=[],S=[],CL=[],j,fl=0,bolt=null,nx=k.rnd(5,12);
    for(j=0;j<n;j++)R.push({x:Math.random(),y:Math.random(),v:k.rnd(700,1100),l:k.rnd(10,22),z:k.rnd(.4,1)});
    for(j=0;j<6;j++)CL.push({x:Math.random(),y:k.rnd(-.02,.08),r:k.rnd(.12,.25),v:k.rnd(.004,.012)});
    function mk(w,h){
      var p=[],x=k.rnd(.15,.85)*w,y=0;
      while(y<h*.55){p.push([x,y]);x+=k.rnd(-26,26);y+=k.rnd(22,48)}
      return p;
    }
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(n*k.q()),o,i,g,x,y,s;
      for(j=0;j<CL.length;j++){
        o=CL[j];o.x+=o.v*dt;if(o.x>1.25)o.x=-.25;
        g=c.createRadialGradient(o.x*w,o.y*h,0,o.x*w,o.y*h,o.r*w);
        g.addColorStop(0,'rgba(20,30,48,.55)');g.addColorStop(1,'rgba(20,30,48,0)');
        c.fillStyle=g;c.fillRect(0,0,w,h*.5);
      }
      c.lineWidth=1.1;c.lineCap='round';
      for(j=0;j<cnt;j++){
        o=R[j];o.y+=o.v*o.z*dt/h;o.x-=o.v*o.z*dt*.18/w;
        if(o.y>1){
          if(S.length<60&&o.z>.7)S.push({x:o.x*w,y:h-k.rnd(2,34),r:1,a:.5});
          o.y=-.05;o.x=Math.random()*1.2;
        }
        if(o.x<-.05)o.x+=1.1;
        c.strokeStyle='rgba(175,205,240,'+(.18+.35*o.z)+')';
        c.beginPath();c.moveTo(o.x*w,o.y*h);c.lineTo(o.x*w+o.l*.2*o.z,o.y*h-o.l*o.z);c.stroke();
      }
      c.lineWidth=1;
      for(i=S.length-1;i>=0;i--){
        s=S[i];s.r+=dt*26;s.a-=dt*1.1;
        if(s.a<=0){S.splice(i,1);continue}
        c.strokeStyle='rgba(190,215,245,'+s.a+')';c.beginPath();c.ellipse(s.x,s.y,s.r,s.r*.3,0,0,6.283);c.stroke();
      }
      nx-=dt;
      if(nx<=0){nx=k.rnd(7,16);fl=1;bolt=mk(w,h)}
      if(fl>0){
        c.fillStyle='rgba(215,228,255,'+(fl*.1)+')';c.fillRect(0,0,w,h);
        if(bolt){
          c.strokeStyle='rgba(255,255,255,'+fl+')';c.lineWidth=2;c.shadowBlur=14;c.shadowColor='#9cf';
          c.beginPath();c.moveTo(bolt[0][0],bolt[0][1]);
          for(i=1;i<bolt.length;i++)c.lineTo(bolt[i][0],bolt[i][1]);
          c.stroke();c.shadowBlur=0;
        }
        fl-=dt*2;
        if(fl<=0)bolt=null;
      }
    },true,30,true);
  }
});
})();
