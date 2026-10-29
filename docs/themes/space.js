(function(){
  var SKY='<rect width="1000" height="220" fill="#05050a"/><radialGradient id="g1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a1a2e" stop-opacity="1"/><stop offset="100%" stop-color="#05050a" stop-opacity="1"/></radialGradient><rect width="1000" height="220" fill="url(#g1)"/>';
  var STAR='<circle cx="0" cy="0" r="1.3" fill="#fff"/><path d="M0 -3l0.9 1.3 3.2 0.4l-2.2 1.6l0.4 3l-2.2 -1.6l3.2 -0.4z" fill="#fff" opacity=".96"/>';
  var NEB='<ellipse cx="0" cy="0" rx="140" ry="80" fill="rgba(130,60,220,.16)"/><ellipse cx="50" cy="25" rx="120" ry="60" fill="rgba(60,190,220,.14)"/><ellipse cx="-50" cy="-25" rx="130" ry="70" fill="rgba(220,90,130,.12)"/>';
  var PLANET='<g transform="translate(0 12)"><circle cx="42" cy="48" r="32" fill="#37474f" stroke="#546e7a" stroke-width="2.5"/><circle cx="32" cy="40" r="10" fill="#546e7a" opacity=".8"/><circle cx="52" cy="52" r="7" fill="#78909c" opacity=".75"/><circle cx="40" cy="58" r="5" fill="#90a4ae" opacity=".65"/><ellipse cx="42" cy="80" rx="32" ry="8" fill="rgba(55,71,79,.4)"/></g>';
  var RING='<ellipse cx="42" cy="48" rx="50" ry="12" fill="none" stroke="#cfd8dc" stroke-width="2.5" stroke-linecap="round" opacity=".85" transform="rotate(-22 42 48)"/>';
  var MOON='<circle cx="30" cy="30" r="24" fill="#eceff1" stroke="#cfd8dc" stroke-width="2"/><circle cx="24" cy="24" r="4.5" fill="#cfd8dc" opacity=".85"/><circle cx="36" cy="22" r="3.5" fill="#cfd8dc" opacity=".75"/><circle cx="32" cy="38" r="4" fill="#cfd8dc" opacity=".65"/><path d="M14 30Q20 24 26 30" fill="none" stroke="#b0bec5" stroke-width="1.5" opacity=".75"/>';
  var SATELLITE='<g transform="translate(0 2)"><rect x="24" y="24" width="12" height="3" fill="#90a4ae" stroke="#455a64" stroke-width="1.2"/><rect x="28" y="20" width="4" height="8" fill="#90a4ae" stroke="#455a64" stroke-width="1"/><circle cx="30" cy="28" r="3" fill="#cfd8dc" stroke="#455a64" stroke-width="1.2"/><path d="M30 24l0 -8M30 32l0 8M22 28l8 0M38 28l8 0" stroke="#455a64" stroke-width="1.5" stroke-linecap="round"/><path d="M30 20l0 -14" stroke="#78909c" stroke-width="2" stroke-linecap="round" opacity=".75"/></g>';
  var COMET='<g transform="translate(0 0)"><circle cx="10" cy="10" r="3" fill="#fff" stroke="#b0bec5" stroke-width="1"/><path d="M10 10Q-26 -16 -70 -48" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M10 10Q-40 -24 -100 -70" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="6" stroke-linecap="round" opacity=".45"/></g>';
  var GROUND='<g transform="translate(0 0)"><path d="M0 18Q100 8 200 18T400 18T600 18T800 18T1000 18V38H0z" fill="#05050a" stroke="#141420" stroke-width="2"/><path d="M0 22Q100 12 200 22T400 22T600 22T800 22T1000 22V38H0z" fill="#0a0a12" stroke="#1a1a2e" stroke-width="1.5" opacity=".8"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.75)';c.stroke();
    });
  }
  window.CloudSeason.reg('cs',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?30:42,i;
      var back=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:62%',true);
      k.el('',k.svg('0 0 1000 220',SKY),'left:0;right:0;top:0;height:220px;opacity:1');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 140 90',NEB),'left:'+k.rnd(-30,40).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.35,gh*.8))+'px;width:'+(m?150:260)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*34).toFixed(1)+'s;opacity:.95');
      var moonGlow=k.el('','<div style="width:70px;height:70px;border-radius:50%;box-shadow:0 0 36px 18px rgba(236,239,241,.6)"></div>','left:5%;top:'+Math.round(gh*.18)+'px;width:'+(m?46:70)+'px;height:'+(m?46:70)+'px',true);
      k.el('',k.svg('0 0 64 64',MOON),'left:5.5%;top:'+Math.round(gh*.2)+'px;width:'+(m?40:62)+'px;height:'+(m?40:62)+'px;animation:zswob 9s ease-in-out infinite');
      k.el('',k.svg('0 0 94 104',PLANET),'right:7%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?70:110)+'px;animation:zswob 10s ease-in-out infinite;animation-delay:-2s');
      k.el('',k.svg('0 0 94 104',RING),'right:7%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?70:110)+'px;animation:zsspin 24s linear infinite');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.4,28,9,15)+k.hill(1000,gh*3.0,36,11,25)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#05050a;stroke:#141420;stroke-width:2;opacity:.99');
      k.el('',k.svg('0 0 1000 38',GROUND),'left:0;right:0;bottom:0;height:38px;opacity:.96');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="9" r="2" fill="#fff" opacity=".85"/><circle cx="18" cy="11" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var sat=k.el('zs-fly zs-orbit',k.svg('0 0 62 42',SATELLITE),'right:6%;top:'+Math.round(gh*.32)+'px;width:'+(m?40:62)+'px;animation-duration:'+(m?100:140)+'s;animation-delay:-60s');
      sat.innerHTML='<div>'+sat.innerHTML+'</div>';
      k.hbWatch(function(hb){sat.style.top=(hb+(m?2:8))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-shoot','','left:'+k.rnd(4,84).toFixed(1)+'%;top:'+k.rnd(4,48).toFixed(1)+'%;animation-delay:'+(-i*3.0).toFixed(1)+'s;animation-duration:'+(9+i*4.0).toFixed(1)+'s',true);
        for(i=0;i<10;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.9))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4.4).toFixed(1)+'s',true);
        for(i=0;i<4;i++)k.el('zs-fly zs-comet',k.svg('0 0 96 54',COMET),'left:'+k.rnd(0,42).toFixed(1)+'%;top:'+k.rnd(10,52).toFixed(1)+'%;width:'+(m?50:80)+'px;animation-duration:'+(m?120:170)+'s;animation-delay:'+(-i*24).toFixed(1)+'s');
        var ss=starSprite(k),st=[],ns=k.n(220),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.6),tw:k.rnd(1.0,4.6),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.17});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(ns*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=st[j];
            c.globalAlpha=.18+.82*Math.abs(Math.sin(t*o.tw+o.p));
            if(o.g){
              c.save();c.translate(o.x*w,o.y*h);c.scale(o.z,o.z);
              c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(0,0,16*o.z,0,6.283);c.fill();c.restore();
            }else{
              k.put(c,ss,o.x*w+Math.sin(t*1+o.ph)*2,o.y*h,o.z,0);
            }
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
