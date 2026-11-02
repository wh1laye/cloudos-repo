(function(){
var CH='01アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}$#%=+';
function rc(){return CH.charAt(Math.floor(Math.random()*CH.length))}
window.CloudSeason.reg('cy',{
  init:function(k){
    var D=[],fs=k.mobile()?13:16,L=12,pw=0;
    function build(w,h){
      var n=Math.ceil(w/(fs*1.5)*(k.pc()?1:.6)),i,s,q;
      D=[];
      for(i=0;i<n;i++){s=[];for(q=0;q<L;q++)s.push(rc());D.push({x:i*(w/n)+4,y:k.rnd(-300,h),v:k.rnd(60,190),s:s,a:0})}
    }
    k.canvas(function(c,dt,t,w,h){
      var n,i,q,o,y,y0=h*.8,p,x2;
      if(w!==pw){pw=w;build(w,h)}
      c.font=fs+'px monospace';c.textBaseline='top';c.globalAlpha=.6;
      n=Math.ceil(D.length*k.q());
      for(i=0;i<n;i++){
        o=D[i];o.y+=o.v*dt;o.a+=dt;
        if(o.a>.09){o.a=0;o.s.unshift(rc());o.s.pop()}
        if(o.y-L*fs>h){o.y=k.rnd(-300,-20);o.v=k.rnd(60,190)}
        for(q=0;q<L;q++){
          y=o.y-q*fs;
          if(y<-fs||y>h)continue;
          c.fillStyle=q===0?'#d8ffe6':'rgba(0,255,106,'+(.8*(1-q/L))+')';
          c.fillText(o.s[q],o.x,y);
        }
      }
      c.globalAlpha=.4;c.lineWidth=1;
      c.strokeStyle='#00dcff';c.beginPath();
      for(i=-14;i<=14;i++){c.moveTo(w/2+i*6,y0);c.lineTo(w/2+i*w*.1,h)}
      c.stroke();
      c.strokeStyle='#ff2bd6';c.beginPath();
      for(i=0;i<8;i++){p=((i+t*.35)%8)/8;y=y0+(h-y0)*p*p;c.moveTo(0,y);c.lineTo(w,y)}
      c.stroke();
      c.globalAlpha=1;
    },true,30,true);
  }
});
})();
