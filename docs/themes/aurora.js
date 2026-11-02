(function(){
function rg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
window.CloudSeason.reg('ar',{
  init:function(k){
    var m=k.mobile(),r=rg(17),S=[],ns=k.n(60),j,sh={x:0,y:0,l:0,w:6},gh=m?80:130,step=m?8:3;
    for(j=0;j<ns;j++)S.push({x:r(),y:r()*.7,r:.5+r()*1.4,p:r()*6.28,s:.5+r()*2});
    k.el('',k.strip(gh,[{d:k.hill(1000,70,42,5,2),fill:'rgba(14,30,52,.9)',line:'rgba(180,230,255,.45)',w:2},{d:k.hill(1000,95,30,7,8),fill:'rgba(6,16,32,.97)',line:'rgba(150,210,255,.3)',w:2}]),'left:0;right:0;bottom:0;height:'+gh+'px',true);
    var cols=[['77,240,176','60,200,255'],['120,255,200','170,120,255'],['60,220,255','255,120,220']];
    k.canvas(function(c,dt,t,w,h){
      var i,x,yy,ln,a,g,o,q,col;
      for(j=0;j<S.length;j++){
        o=S[j];c.globalAlpha=.35+.65*Math.abs(Math.sin(t*o.s*.6+o.p));
        c.fillStyle='#e8f4ff';c.fillRect(o.x*w,o.y*h,o.r,o.r);
      }
      c.globalAlpha=1;
      c.globalCompositeOperation='lighter';
      for(i=0;i<3;i++){
        col=cols[i];
        g=c.createLinearGradient(0,h*.08,0,h*.62);
        g.addColorStop(0,'rgba('+col[0]+',0)');g.addColorStop(.35,'rgba('+col[0]+',.55)');g.addColorStop(.7,'rgba('+col[1]+',.28)');g.addColorStop(1,'rgba('+col[1]+',0)');
        c.fillStyle=g;
        for(x=0;x<=w;x+=step){
          yy=h*(.16+i*.07)+Math.sin(x*.004+t*.3+i*1.3)*h*.06+Math.sin(x*.011-t*.5+i)*h*.02;
          ln=h*.26*(.55+.45*Math.sin(x*.007+t*.4+i*2));
          a=.55+.45*Math.sin(x*.02+t*.9+i);
          c.globalAlpha=Math.max(0,a)*.5;
          c.fillRect(x,yy,step+1,ln);
        }
      }
      c.globalCompositeOperation='source-over';c.globalAlpha=1;
      if(sh.l>0){
        sh.l-=dt*1.4;sh.x+=dt*w*.5;sh.y+=dt*h*.25;
        q=c.createLinearGradient(sh.x,sh.y,sh.x-90,sh.y-45);
        q.addColorStop(0,'rgba(255,255,255,'+Math.max(0,sh.l)+')');q.addColorStop(1,'rgba(255,255,255,0)');
        c.strokeStyle=q;c.lineWidth=2;c.beginPath();c.moveTo(sh.x,sh.y);c.lineTo(sh.x-90,sh.y-45);c.stroke();
      }else{
        sh.w-=dt;
        if(sh.w<=0){sh.w=k.rnd(6,14);sh.l=1;sh.x=k.rnd(.1,.6)*w;sh.y=k.rnd(.03,.25)*h}
      }
    },true,30,true);
  }
});
})();
