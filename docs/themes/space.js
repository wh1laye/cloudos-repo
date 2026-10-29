(function(){
  var STAR='<circle cx="0" cy="0" r="1.5" fill="#fff"/><path d="M0 -3.5l1 1.4 3.5 0.5l-2.4 1.7l0.5 3.5l-2.4 -1.7l3.5 -0.5z" fill="#fff" opacity=".95"/>';
  var NEB='<ellipse cx="0" cy="0" rx="120" ry="70" fill="rgba(120,60,220,.14)"/><ellipse cx="40" cy="20" rx="100" ry="50" fill="rgba(60,180,220,.12)"/><ellipse cx="-40" cy="-20" rx="110" ry="60" fill="rgba(220,80,120,.1)"/>';
  var PLANET='<g transform="translate(0 10)"><circle cx="42" cy="46" r="30" fill="#37474f" stroke="#546e7a" stroke-width="2.5"/><circle cx="32" cy="38" r="9" fill="#546e7a" opacity=".75"/><circle cx="52" cy="50" r="6" fill="#78909c" opacity=".7"/><circle cx="40" cy="56" r="4.5" fill="#90a4ae" opacity=".6"/><ellipse cx="42" cy="76" rx="30" ry="7" fill="rgba(55,71,79,.4)"/></g>';
  var RING='<ellipse cx="42" cy="46" rx="46" ry="11" fill="none" stroke="#cfd8dc" stroke-width="2.5" stroke-linecap="round" opacity=".85" transform="rotate(-22 42 46)"/>';
  var MOON2='<circle cx="30" cy="30" r="22" fill="#eceff1" stroke="#cfd8dc" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#cfd8dc" opacity=".8"/><circle cx="36" cy="22" r="3" fill="#cfd8dc" opacity=".7"/><circle cx="32" cy="36" r="3.5" fill="#cfd8dc" opacity=".6"/><path d="M14 30Q20 24 26 30" fill="none" stroke="#b0bec5" stroke-width="1.5" opacity=".7"/>';
  var SATELLITE='<g transform="translate(0 2)"><rect x="24" y="24" width="12" height="3" fill="#90a4ae" stroke="#455a64" stroke-width="1.2"/><rect x="28" y="20" width="4" height="8" fill="#90a4ae" stroke="#455a64" stroke-width="1"/><circle cx="30" cy="28" r="3" fill="#cfd8dc" stroke="#455a64" stroke-width="1.2"/><path d="M30 24l0 -8M30 32l0 8M22 28l8 0M38 28l8 0" stroke="#455a64" stroke-width="1.5" stroke-linecap="round"/><path d="M30 20l0 -14" stroke="#78909c" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>';
  var COMET='<g transform="translate(0 0)"><circle cx="10" cy="10" r="3" fill="#fff" stroke="#b0bec5" stroke-width="1"/><path d="M10 10Q-20 -10 -60 -40" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M10 10Q-30 -20 -70 -60" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="6" stroke-linecap="round" opacity=".4"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.7)';c.stroke();
    });
  }
  window.CloudSeason.reg('cs',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?30:42,i;
      var neb=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:60%',true);
      k.el('zs-moon','<div style="width:64px;height:64px;border-radius:50%;box-shadow:0 0 30px 10px rgba(236,239,241,.5)"></div>','left:6%;top:'+Math.round(gh*.2)+'px;width:'+(m?42:64)+'px;height:'+(m?42:64)+'px');
      k.el('',k.svg('0 0 64 64',MOON2),'left:6.5%;top:'+Math.round(gh*.22)+'px;width:'+(m?38:58)+'px;animation:zswob 8s ease-in-out infinite');
      k.el('',k.svg('0 0 90 100',PLANET),'right:8%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?70:110)+'px;animation:zswob 9s ease-in-out infinite;animation-delay:-2s');
      k.el('',k.svg('0 0 90 100',RING),'right:8%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?70:110)+'px;animation:zspin 20s linear infinite');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 130 80',NEB),'left:'+k.rnd(-25,35).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.3,gh*.8))+'px;width:'+(m?160:240)+'px;animation-duration:'+(m?140:180)+'s;animation-delay:'+(-i*30).toFixed(1)+'s;opacity:.9');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="9" r="2" fill="#fff" opacity=".8"/><circle cx="18" cy="11" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var sat=k.el('zs-fly',k.svg('0 0 60 40',SATELLITE),'right:6%;top:'+Math.round(gh*.3)+'px;width:'+(m?40:60)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-60s');
      sat.innerHTML='<div>'+sat.innerHTML+'</div>';
      k.hbWatch(function(hb){sat.style.top=(hb+(m?2:6))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-shoot','','left:'+k.rnd(5,85).toFixed(1)+'%;top:'+k.rnd(4,45).toFixed(1)+'%;animation-delay:'+(-i*2.6).toFixed(1)+'s;animation-duration:'+(9+i*3.5).toFixed(1)+'s',true);
        for(i=0;i<10;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.85))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4).toFixed(1)+'s',true);
        for(i=0;i<4;i++)k.el('zs-fly',k.svg('0 0 90 50',COMET),'left:'+k.rnd(0,40).toFixed(1)+'%;top:'+k.rnd(10,50).toFixed(1)+'%;width:'+(m?50:80)+'px;animation-duration:'+(m?120:160)+'s;animation-delay:'+(-i*20).toFixed(1)+'s');
        var ss=starSprite(k),st=[],ns=k.n(180),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.4),tw:k.rnd(1.2,4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.15});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(ns*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=st[j];
            c.globalAlpha=.2+.8*Math.abs(Math.sin(t*o.tw+o.p));
            if(o.g){
              c.save();c.translate(o.x*w,o.y*h);c.scale(o.z,o.z);
              c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(0,0,14*o.z,0,6.283);c.fill();c.restore();
            }else{
              k.put(c,ss,o.x*w+Math.sin(t*1.1+o.ph)*2,o.y*h,o.z,0);
            }
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
