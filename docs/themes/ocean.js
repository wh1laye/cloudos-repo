(function(){
  var WAVE='<path d="M0 40Q120 20 240 40T480 40T720 40T960 40V96H0z" fill="#163a4c" opacity=".95"/><path d="M0 44Q120 24 240 44T480 44T720 44T960 44V96H0z" fill="#0f2a38" opacity=".85"/><path d="M0 50Q120 30 240 50T480 50T720 50T960 50V96H0z" fill="#0b1d26" opacity=".75"/><path d="M20 44Q100 28 180 44Q260 60 340 44Q420 28 500 44Q580 60 660 44Q740 28 820 44Q900 60 980 44" fill="none" stroke="#265c73" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
  var WHALE='<g transform="translate(0 8)"><path d="M10 60Q70 10 130 60Q90 100 10 60z" fill="#263238" stroke="#1a237e" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="52" rx="22" ry="14" fill="#37474f" stroke="#1a237e" stroke-width="2"/><circle cx="120" cy="44" r="3" fill="#222"/><circle cx="122" cy="42" r="1" fill="#fff"/><path d="M70 68Q90 76 110 68" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M130 60Q150 70 150 80Q130 82 130 60z" fill="#263238" stroke="#1a237e" stroke-width="2"/><path d="M10 60Q40 80 70 78Q100 86 130 80Q140 74 140 60z" fill="none" stroke="#1a237e" stroke-width="3" stroke-linecap="round"/></g>';
  var DOLPHIN='<g transform="translate(0 4)"><path d="M10 50Q40 10 80 50Q110 82 80 68Q50 60 10 50z" fill="#00acc1" stroke="#006064" stroke-width="2.5" stroke-linejoin="round"/><circle cx="85" cy="46" r="3" fill="#222"/><circle cx="87" cy="44" r="1" fill="#fff"/><path d="M60 62Q75 68 90 62" fill="none" stroke="#4dd0e1" stroke-width="2.5" stroke-linecap="round" opacity=".8"/><path d="M80 50Q95 58 95 66Q80 68 80 50z" fill="#00acc1" stroke="#006064" stroke-width="2"/></g>';
  var GULL='<g transform="translate(0 2)"><path d="M20 34Q30 20 40 34Q50 20 60 34" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="40" cy="30" r="2" fill="#fff"/><path d="M34 30Q38 28 42 30" fill="none" stroke="#b0bec5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>';
  var LIGHT='<g transform="translate(0 10)"><rect cx="50" cy="14" rx="4" ry="4" width="12" height="14" fill="#eceff1" stroke="#37474f" stroke-width="1.8"/><rect x="44" y="28" width="24" height="4" fill="#78909c" stroke="#37474f" stroke-width="1.4"/><rect x="46" y="30" width="20" height="14" rx="2" fill="#37474f"/><path d="M50 30l-18 16M68 30l18 16" stroke="#455a64" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="10" r="7" fill="#fff4e0" opacity=".95"/><circle cx="50" cy="10" r="4" fill="#fff" opacity="1"/></g>';
  function waveSprite(k){
    return k.sprite(150,30,function(c){
      c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.moveTo(0,15);c.bezierCurveTo(30,-5,60,35,90,15);c.bezierCurveTo(120,-5,150,35,150,15);c.lineTo(150,30);c.lineTo(0,30);c.fill();
    });
  }
  window.CloudSeason.reg('oc',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?32:44,i;
      var sea=k.el('','<div class="zs-wv">'+WAVE+'</div>','left:0;bottom:0;width:100%;height:'+gh+'px;opacity:.96');
      k.el('zs-wv b2','<div class="zs-wv">'+WAVE+'</div>','left:0;bottom:0;width:100%;height:'+Math.round(gh*.62)+'px;opacity:.7');
      k.el('','<div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?90:120)+'px',true);
      k.hbWatch(function(hb){document.querySelectorAll('.zs-fog2').forEach(function(e){e.style.top=(hb-8)+'px'})});
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.8,18,6,11)+k.hill(1000,gh*2.4,26,8,21)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0b1d26;stroke:#163a4c;stroke-width:2;opacity:.95');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#00bfa5" stroke="#00838f" stroke-width="1.2"/><circle cx="14" cy="12" r="2" fill="#b2ebf2"/><circle cx="20" cy="14" r="1.5" fill="#b2ebf2"/></svg>'},0,0,0,{fit:true});
      var lh=k.el('zs-bob',k.svg('0 0 100 110',LIGHT),'right:3%;bottom:'+Math.round(gh*.35)+'px;width:'+(m?44:70)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      k.hbWatch(function(hb){lh.style.top=(hb+(m?2:6))+'px'});
      var wh=k.el('zs-fly',k.svg('0 0 220 110',WHALE),'left:-12%;bottom:'+Math.round(gh*.45)+'px;width:'+(m?140:220)+'px;animation-duration:'+(m?130:170)+'s;animation-delay:-35s');
      wh.innerHTML='<div>'+wh.innerHTML+'</div>';
      k.hbWatch(function(hb){wh.style.top=(hb+(m?4:8))+'px'});
      var dl=k.el('zs-fly r',k.svg('0 0 160 90',DOLPHIN),'right:-14%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?110:160)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-50s');
      dl.innerHTML='<div>'+dl.innerHTML+'</div>';
      k.hbWatch(function(hb){dl.style.top=(hb+(m?2:6))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.15,gh*.55))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.4).toFixed(1)+'s',true);
        for(i=0;i<6;i++)k.el('zs-fly',k.svg('0 0 70 40',GULL),'left:'+k.rnd(10,80).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.25,gh*.6))+'px;width:'+(m?34:50)+'px;animation-duration:'+(m?80:110)+'s;animation-delay:'+(-i*9).toFixed(1)+'s');
        var ws=waveSprite(k),wl=[],nw=k.n(12),w0;
        for(w0=0;w0<nw;w0++)wl.push({x:Math.random(),y:k.rnd(.2,.75),v:k.rnd(20,46),s:k.rnd(.6,1.2),ph:k.rnd(0,6.28)});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nw*k.q()),j,o,top=k.hb()+40;
          for(j=0;j<cnt;j++){
            o=wl[j];o.x+=o.v*dt/w;
            if(o.x>1.1){o.x=-.12;o.y=k.rnd(.2,.75)}
            k.put(c,ws,o.x*w+Math.sin(t*1.2+o.ph)*10,top+o.y*h*.5+Math.sin(t*2+o.ph)*6,o.s,0);
          }
        },false,24);
      }
    }
  });
})();
