(function(){
  var STAR='<circle cx="0" cy="0" r="1.4" fill="#fff"/><path d="M0 -3.2l0.9 1.3 3.2 0.4l-2.2 1.6l0.4 3.2l-2.2 -1.6l3.2 -0.4z" fill="#fff" opacity=".96"/>';
  var PLANET='<g transform="translate(0 10)"><circle cx="42" cy="46" r="30" fill="#37474f" stroke="#546e7a" stroke-width="2.5"/><circle cx="32" cy="38" r="9" fill="#546e7a" opacity=".8"/><circle cx="52" cy="50" r="6" fill="#78909c" opacity=".75"/><circle cx="40" cy="56" r="4.5" fill="#90a4ae" opacity=".65"/><ellipse cx="42" cy="76" rx="30" ry="7" fill="rgba(55,71,79,.4)"/></g>';
  var RING='<ellipse cx="42" cy="46" rx="46" ry="11" fill="none" stroke="#cfd8dc" stroke-width="2.5" stroke-linecap="round" opacity=".85" transform="rotate(-22 42 46)"/>';
  var MOON='<circle cx="30" cy="30" r="22" fill="#eceff1" stroke="#cfd8dc" stroke-width="2"/><circle cx="24" cy="24" r="4" fill="#cfd8dc" opacity=".85"/><circle cx="36" cy="22" r="3" fill="#cfd8dc" opacity=".75"/><circle cx="32" cy="36" r="3.5" fill="#cfd8dc" opacity=".65"/><path d="M14 30Q20 24 26 30" fill="none" stroke="#b0bec5" stroke-width="1.5" opacity=".75"/>';
  var SATELLITE='<g transform="translate(0 2)"><rect x="24" y="24" width="12" height="3" fill="#90a4ae" stroke="#455a64" stroke-width="1.2"/><rect x="28" y="20" width="4" height="8" fill="#90a4ae" stroke="#455a64" stroke-width="1"/><circle cx="30" cy="28" r="3" fill="#cfd8dc" stroke="#455a64" stroke-width="1.2"/><path d="M30 24l0 -8M30 32l0 8M22 28l8 0M38 28l8 0" stroke="#455a64" stroke-width="1.5" stroke-linecap="round"/><path d="M30 20l0 -14" stroke="#78909c" stroke-width="2" stroke-linecap="round" opacity=".75"/></g>';
  var COMET='<g transform="translate(0 0)"><circle cx="10" cy="10" r="2.8" fill="#fff" stroke="#b0bec5" stroke-width="1"/><path d="M10 10Q-24 -14 -66 -46" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.8" stroke-linecap="round" opacity=".7"/><path d="M10 10Q-36 -22 -92 -68" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="5" stroke-linecap="round" opacity=".45"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.75)';c.stroke();
    });
  }
  window.CloudSeason.reg('cs',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?28:40,i;
      var neb=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:58%',true);
      var moonGlow=k.el('','<div style="width:66px;height:66px;border-radius:50%;box-shadow:0 0 32px 14px rgba(236,239,241,.55)"></div>','left:5%;top:'+Math.round(gh*.18)+'px;width:'+(m?44:66)+'px;height:'+(m?44:66)+'px',true);
      k.el('',k.svg('0 0 64 64',MOON),'left:5.5%;top:'+Math.round(gh*.2)+'px;width:'+(m?38:58)+'px;height:'+(m?38:58)+'px;animation:zswob 8s ease-in-out infinite');
      k.el('',k.svg('0 0 92 102',PLANET),'right:7%;bottom:'+Math.round(gh*.52)+'px;width:'+(m?68:108)+'px;animation:zswob 9.5s ease-in-out infinite;animation-delay:-2s');
      k.el('',k.svg('0 0 92 102',RING),'right:7%;bottom:'+Math.round(gh*.52)+'px;width:'+(m?68:108)+'px;animation:zsspin 22s linear infinite');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 136 86',NEB),'left:'+k.rnd(-28,32).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.32,gh*.82))+'px;width:'+(m?150:250)+'px;animation-duration:'+(m?140:190)+'s;animation-delay:'+(-i*32).toFixed(1)+'s;opacity:.92');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="9" r="2" fill="#fff" opacity=".85"/><circle cx="18" cy="11" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var sat=k.el('zs-fly zs-orbit',k.svg('0 0 62 42',SATELLITE),'right:6%;top:'+Math.round(gh*.32)+'px;width:'+(m?40:62)+'px;animation-duration:'+(m?100:140)+'s;animation-delay:-58s');
      sat.innerHTML='<div>'+sat.innerHTML+'</div>';
      k.hbWatch(function(hb){sat.style.top=(hb+(m?2:6))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-shoot','','left:'+k.rnd(4,84).toFixed(1)+'%;top:'+k.rnd(4,46).toFixed(1)+'%;animation-delay:'+(-i*2.8).toFixed(1)+'s;animation-duration:'+(9+i*3.8).toFixed(1)+'s',true);
        for(i=0;i<10;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.88))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4.2).toFixed(1)+'s',true);
        for(i=0;i<4;i++)k.el('zs-fly zs-comet',k.svg('0 0 94 52',COMET),'left:'+k.rnd(0,42).toFixed(1)+'%;top:'+k.rnd(10,52).toFixed(1)+'%;width:'+(m?50:80)+'px;animation-duration:'+(m?120:170)+'s;animation-delay:'+(-i*22).toFixed(1)+'s');
        var ss=starSprite(k),st=[],ns=k.n(200),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.5),tw:k.rnd(1.1,4.4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.16});
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
