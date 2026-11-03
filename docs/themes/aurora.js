(function(){
function rg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
var COLS=[['77,240,176','60,200,255'],['120,255,200','170,120,255'],['60,220,255','255,120,220']];
window.CloudSeason.reg('ar',{
  init:function(k){
    var m=k.phone()||k.mobile(),r=rg(17),S=[],ns=k.n(60),j,sh={x:0,y:0,l:0,w:6},gh=m?80:130,sc=m?.18:.35,ow=0,oh=0,pw=0,ph=0,G=[],nr=m?2:3;
    var off=document.createElement('canvas'),oc=off.getContext('2d');
    for(j=0;j<ns;j++)S.push({x:r(),y:r()*.7,r:.5+r()*1.4,p:r()*6.28,s:.5+r()*2});
    k.el('',k.strip(gh,[{d:k.hill(1000,70,42,5,2),fill:'rgba(14,30,52,.9)',line:'rgba(180,230,255,.45)',w:2},{d:k.hill(1000,95,30,7,8),fill:'rgba(6,16,32,.97)',line:'rgba(150,210,255,.3)',w:2}]),'left:0;right:0;bottom:0;height:'+gh+'px',true);
    function fit(w,h){
      var i,g,c;
      ow=Math.max(16,Math.round(w*sc));oh=Math.max(16,Math.round(h*sc));
      off.width=ow;off.height=oh;G=[];
      for(i=0;i<nr;i++){
        c=COLS[i];g=oc.createLinearGradient(0,oh*.08,0,oh*.62);
        g.addColorStop(0,'rgba('+c[0]+',0)');g.addColorStop(.35,'rgba('+c[0]+',.6)');g.addColorStop(.7,'rgba('+c[1]+',.3)');g.addColorStop(1,'rgba('+c[1]+',0)');
        G.push(g);
      }
    }
    k.canvas(function(c,dt,t,w,h){
      var i,x,xr,yy,ln,a,o,q;
      if(!oc)return;
      if(w!==pw||h!==ph){pw=w;ph=h;fit(w,h)}
      for(j=0;j<S.length;j++){
        o=S[j];c.globalAlpha=.35+.65*Math.abs(Math.sin(t*o.s*.6+o.p));
        c.fillStyle='#e8f4ff';c.fillRect(o.x*w,o.y*h,o.r,o.r);
      }
      c.globalAlpha=1;
      oc.clearRect(0,0,ow,oh);
      oc.globalCompositeOperation='lighter';
      for(i=0;i<nr;i++){
        oc.fillStyle=G[i];
        for(x=0;x<=ow;x+=2){
          xr=x/sc;
          yy=oh*(.16+i*.07)+Math.sin(xr*.004+t*.3+i*1.3)*oh*.06+Math.sin(xr*.011-t*.5+i)*oh*.02;
          ln=oh*.26*(.55+.45*Math.sin(xr*.007+t*.4+i*2));
          a=.55+.45*Math.sin(xr*.02+t*.9+i);
          oc.globalAlpha=Math.max(0,a)*.5;
          oc.fillRect(x,yy,3,ln);
        }
      }
      c.globalAlpha=1;
      c.drawImage(off,0,0,w,h);
      if(sh.l>0){
        sh.l-=dt*1.4;sh.x+=dt*w*.5;sh.y+=dt*h*.25;
        q=c.createLinearGradient(sh.x,sh.y,sh.x-90,sh.y-45);
        q.addColorStop(0,'rgba(255,255,255,'+Math.max(0,sh.l)+')');q.addColorStop(1,'rgba(255,255,255,0)');
        c.strokeStyle=q;c.lineWidth=2;c.beginPath();c.moveTo(sh.x,sh.y);c.lineTo(sh.x-90,sh.y-45);c.stroke();
      }else{
        sh.w-=dt;
        if(sh.w<=0){sh.w=k.rnd(6,14);sh.l=1;sh.x=k.rnd(.1,.6)*w;sh.y=k.rnd(.03,.25)*h}
      }
    },true,24,true);
  }
});
})();
