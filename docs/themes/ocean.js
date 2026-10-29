(function(){
  var WAVE1='<path d="M0 36Q120 16 240 36T480 36T720 36T960 36V96H0z" fill="#163a4c" opacity=".96"/><path d="M0 40Q120 20 240 40T480 40T720 40T960 40V96H0z" fill="#0f2a38" opacity=".88"/><path d="M0 44Q120 24 240 44T480 44T720 44T960 44V96H0z" fill="#0b1d26" opacity=".78"/><path d="M16 42Q100 26 184 42Q268 58 352 42Q436 26 520 42Q604 58 688 42Q772 26 856 42Q940 58 984 42" fill="none" stroke="#265c73" stroke-width="3" stroke-linecap="round" opacity=".75"/>';
  var WAVE2='<path d="M0 32Q110 12 220 32T440 32T660 32T880 32V88H0z" fill="#1f4e63" opacity=".9"/><path d="M0 36Q110 16 220 36T440 36T660 36T880 36V88H0z" fill="#163a4c" opacity=".82"/><path d="M12 38Q96 22 180 38Q264 54 348 38Q432 22 516 38Q600 54 684 38Q768 22 852 38Q936 54 976 38" fill="none" stroke="#3a7ca5" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>';
  var WHALE='<g transform="translate(0 8)"><path d="M10 58Q68 10 126 58Q92 96 10 58z" fill="#263238" stroke="#0d47a1" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="52" rx="22" ry="14" fill="#37474f" stroke="#0d47a1" stroke-width="2"/><circle cx="120" cy="44" r="3" fill="#222"/><circle cx="122" cy="42" r="1" fill="#fff"/><path d="M70 66Q90 74 110 66" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M126 58Q146 68 146 78Q126 80 126 58z" fill="#263238" stroke="#0d47a1" stroke-width="2"/><path d="M10 58Q42 78 72 76Q102 84 126 78Q136 72 136 58z" fill="none" stroke="#0d47a1" stroke-width="3" stroke-linecap="round"/></g>';
  var DOLPHIN='<g transform="translate(0 4)"><path d="M10 48Q38 8 78 48Q108 80 78 66Q46 58 10 48z" fill="#00acc1" stroke="#006064" stroke-width="2.5" stroke-linejoin="round"/><circle cx="85" cy="44" r="3" fill="#222"/><circle cx="87" cy="42" r="1" fill="#fff"/><path d="M58 60Q73 66 88 60" fill="none" stroke="#4dd0e1" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><path d="M78 48Q93 56 93 64Q78 66 78 48z" fill="#00acc1" stroke="#006064" stroke-width="2"/></g>';
  var GULL='<g transform="translate(0 2)"><path d="M18 32Q28 20 38 32Q48 20 58 32" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="38" cy="28" r="2" fill="#fff"/><path d="M32 28Q36 26 40 28" fill="none" stroke="#b0bec5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>';
  var LIGHT='<g transform="translate(0 10)"><rect x="44" cy="14" rx="4" ry="4" width="12" height="14" fill="#eceff1" stroke="#37474f" stroke-width="1.8"/><rect x="44" y="28" width="24" height="4" fill="#78909c" stroke="#37474f" stroke-width="1.4"/><rect x="46" y="30" width="20" height="14" rx="2" fill="#37474f"/><path d="M50 30l-18 16M68 30l18 16" stroke="#455a64" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="10" r="7" fill="#fff4e0" opacity=".95"/><circle cx="50" cy="10" r="4" fill="#fff" opacity="1"/></g>';
  function bubbleSprite(k){
    return k.sprite(16,16,function(c){
      var g=c.createRadialGradient(-2,-2,0,0,0,7);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.4,'rgba(200,250,255,.4)');g.addColorStop(1,'rgba(100,180,200,0)');
      c.fillStyle=g;c.beginPath();c.arc(0,0,7,0,6.283);c.fill();
      c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;c.beginPath();c.arc(0,0,6,0,6.283);c.stroke();
    });
  }
  window.CloudSeason.reg('oc',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?30:42,i;
      var sea=k.el('','<div class="zs-wv">'+WAVE1+'</div>','left:0;bottom:0;width:100%;height:'+gh+'px;opacity:.98');
      k.el('zs-wv b2','<div class="zs-wv">'+WAVE2+'</div>','left:0;bottom:0;width:100%;height:'+Math.round(gh*.58)+'px;opacity:.85');
      var fog=k.el('','<div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?90:120)+'px',true);
      k.hbWatch(function(hb){[].forEach.call(document.querySelectorAll('.zs-fog2'),function(e){e.style.top=(hb-10)+'px'})});
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.6,18,6,11)+k.hill(1000,gh*2.2,26,8,19)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0b1d26;stroke:#163a4c;stroke-width:2;opacity:.97');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#00bfa5" stroke="#00838f" stroke-width="1.2"/><circle cx="14" cy="12" r="2" fill="#b2ebf2"/><circle cx="20" cy="14" r="1.5" fill="#b2ebf2"/></svg>'},0,0,0,{fit:true});
      var lh=k.el('zs-bob',k.svg('0 0 100 110',LIGHT),'right:3%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?44:70)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      k.hbWatch(function(hb){lh.style.top=(hb+(m?2:6))+'px'});
      var wh=k.el('zs-fly zs-whale',k.svg('0 0 226 114',WHALE),'left:-14%;bottom:'+Math.round(gh*.48)+'px;width:'+(m?150:226)+'px;animation-duration:'+(m?140:180)+'s;animation-delay:-38s');
      wh.innerHTML='<div>'+wh.innerHTML+'</div>';
      k.hbWatch(function(hb){wh.style.top=(hb+(m?4:10))+'px'});
      var dl=k.el('zs-fly r zs-dolphin',k.svg('0 0 164 92',DOLPHIN),'right:-16%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?114:164)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-52s');
      dl.innerHTML='<div>'+dl.innerHTML+'</div>';
      k.hbWatch(function(hb){dl.style.top=(hb+(m?2:6))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.15,gh*.55))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.6).toFixed(1)+'s',true);
        for(i=0;i<6;i++)k.el('zs-fly',k.svg('0 0 72 42',GULL),'left:'+k.rnd(10,80).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.28,gh*.62))+'px;width:'+(m?36:52)+'px;animation-duration:'+(m?80:110)+'s;animation-delay:'+(-i*10).toFixed(1)+'s');
        var bs=bubbleSprite(k),bl=[],nb=k.n(16),b0;
        for(b0=0;b0<nb;b0++)bl.push({x:Math.random(),y:Math.random(),v:k.rnd(18,42),s:k.rnd(.5,1.1),ph:k.rnd(0,6.28)});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nb*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=bl[j];o.y-=o.v*dt/h;o.x+=Math.sin(t*1.1+o.ph)*4*dt/w;
            if(o.y<-.05){o.y=1.05;o.x=Math.random()}
            k.put(c,bs,o.x*w+Math.sin(t*2+o.ph)*6,o.y*h,o.s,0);
          }
        },true,24);
      }
    }
  });
})();
