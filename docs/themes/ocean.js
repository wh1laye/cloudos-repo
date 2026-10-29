(function(){
  var SKY='<rect width="1000" height="220" fill="#6fa8dc"/><circle cx="820" cy="80" r="46" fill="#ffe066" opacity=".95"/><circle cx="832" cy="70" r="11" fill="#fff" opacity=".6"/>';
  var CLOUD='<g transform="translate(0 6)"><ellipse cx="40" cy="42" rx="34" ry="22" fill="#fff" opacity=".92"/><ellipse cx="72" cy="36" rx="28" ry="20" fill="#fff" opacity=".88"/><ellipse cx="14" cy="38" rx="22" ry="16" fill="#fff" opacity=".92"/></g>';
  var WAVE1='<path d="M0 28Q120 12 240 28T480 28T720 28T960 28V72H0z" fill="#1b5e8f" opacity=".96"/><path d="M0 32Q120 16 240 32T480 32T720 32T960 32V72H0z" fill="#144c70" opacity=".88"/><path d="M0 36Q120 20 240 36T480 36T720 36T960 36V72H0z" fill="#0d3a55" opacity=".8"/><path d="M16 34Q100 22 184 34Q268 46 352 34Q436 22 520 34Q604 46 688 34Q772 22 856 34Q940 46 984 34" fill="none" stroke="#2a7db0" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
  var WAVE2='<path d="M0 26Q110 10 220 26T440 26T660 26T880 26V66H0z" fill="#2a6fa5" opacity=".92"/><path d="M0 30Q110 14 220 30T440 30T660 30T880 30V66H0z" fill="#1f5a7e" opacity=".84"/><path d="M12 32Q96 20 180 32Q264 44 348 32Q432 20 516 32Q600 44 684 32Q768 20 852 32Q936 44 976 32" fill="none" stroke="#3a9cc8" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>';
  var WHALE='<g transform="translate(0 8)"><path d="M10 56Q68 8 126 56Q92 92 10 56z" fill="#263238" stroke="#0d47a1" stroke-width="3" stroke-linejoin="round"/><ellipse cx="100" cy="52" rx="22" ry="14" fill="#37474f" stroke="#0d47a1" stroke-width="2"/><circle cx="120" cy="44" r="3" fill="#222"/><circle cx="122" cy="42" r="1" fill="#fff"/><path d="M70 64Q90 72 110 64" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M126 56Q146 66 146 76Q126 78 126 56z" fill="#263238" stroke="#0d47a1" stroke-width="2"/><path d="M10 56Q42 76 72 74Q102 82 126 76Q136 70 136 56z" fill="none" stroke="#0d47a1" stroke-width="3" stroke-linecap="round"/></g>';
  var DOLPHIN='<g transform="translate(0 4)"><path d="M10 46Q36 6 76 46Q106 78 76 64Q44 56 10 46z" fill="#00acc1" stroke="#006064" stroke-width="2.5" stroke-linejoin="round"/><circle cx="85" cy="42" r="3" fill="#222"/><circle cx="87" cy="40" r="1" fill="#fff"/><path d="M56 58Q71 64 86 58" fill="none" stroke="#4dd0e1" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><path d="M76 46Q91 54 91 62Q76 64 76 46z" fill="#00acc1" stroke="#006064" stroke-width="2"/></g>';
  var GULL='<g transform="translate(0 2)"><path d="M18 30Q28 18 38 30Q48 18 58 30" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="38" cy="26" r="2" fill="#fff"/><path d="M32 26Q36 24 40 26" fill="none" stroke="#b0bec5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>';
  var LIGHT='<g transform="translate(0 10)"><rect x="44" cy="14" rx="4" ry="4" width="12" height="14" fill="#eceff1" stroke="#37474f" stroke-width="1.8"/><rect x="44" y="28" width="24" height="4" fill="#78909c" stroke="#37474f" stroke-width="1.4"/><rect x="46" y="30" width="20" height="14" rx="2" fill="#37474f"/><path d="M50 30l-18 16M68 30l18 16" stroke="#455a64" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="10" r="7" fill="#fff4e0" opacity=".95"/><circle cx="50" cy="10" r="4" fill="#fff" opacity="1"/></g>';
  var SAND='<g transform="translate(0 0)"><path d="M0 30Q100 20 200 30T400 30T600 30T800 30T1000 30V50H0z" fill="#d4af37" opacity=".9"/><path d="M0 34Q100 24 200 34T400 34T600 34T800 34T1000 34V50H0z" fill="#c9a227" stroke="#b8941e" stroke-width="1.5" opacity=".85"/></g>';
  window.CloudSeason.reg('oc',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?32:44,i;
      var back=k.el('','<div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?95:130)+'px',true);
      k.hbWatch(function(hb){[].forEach.call(document.querySelectorAll('.zs-fog2'),function(e){e.style.top=(hb-12)+'px'})});
      k.el('',k.svg('0 0 1000 220',SKY),'left:0;right:0;top:0;height:220px;opacity:1');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 120 76',CLOUD),'left:'+k.rnd(-20,60).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.4,gh*.7))+'px;width:'+(m?110:150)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*24).toFixed(1)+'s;opacity:.92');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.8,20,7,11)+k.hill(1000,gh*2.4,28,9,19)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0b1d26;stroke:#163a4c;stroke-width:2;opacity:.98');
      k.el('','<div class="zs-wv">'+WAVE1+'</div>','left:0;bottom:0;width:100%;height:'+gh+'px;opacity:.99');
      k.el('zs-wv b2','<div class="zs-wv">'+WAVE2+'</div>','left:0;bottom:0;width:100%;height:'+Math.round(gh*.6)+'px;opacity:.88');
      k.el('',k.svg('0 0 1000 46',SAND),'left:0;right:0;bottom:0;height:46px;opacity:.97');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#00bfa5" stroke="#00838f" stroke-width="1.2"/><circle cx="14" cy="12" r="2" fill="#b2ebf2"/><circle cx="20" cy="14" r="1.5" fill="#b2ebf2"/></svg>'},0,0,0,{fit:true});
      var lh=k.el('zs-bob',k.svg('0 0 100 110',LIGHT),'right:3%;bottom:'+Math.round(gh*.42)+'px;width:'+(m?44:70)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      k.hbWatch(function(hb){lh.style.top=(hb+(m?2:8))+'px'});
      var wh=k.el('zs-fly zs-whale',k.svg('0 0 226 114',WHALE),'left:-14%;bottom:'+Math.round(gh*.48)+'px;width:'+(m?150:226)+'px;animation-duration:'+(m?140:180)+'s;animation-delay:-40s');
      wh.innerHTML='<div>'+wh.innerHTML+'</div>';
      k.hbWatch(function(hb){wh.style.top=(hb+(m?4:12))+'px'});
      var dl=k.el('zs-fly r zs-dolphin',k.svg('0 0 164 92',DOLPHIN),'right:-16%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?114:164)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-54s');
      dl.innerHTML='<div>'+dl.innerHTML+'</div>';
      k.hbWatch(function(hb){dl.style.top=(hb+(m?2:8))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.15,gh*.55))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.8).toFixed(1)+'s',true);
        for(i=0;i<6;i++)k.el('zs-fly',k.svg('0 0 72 42',GULL),'left:'+k.rnd(10,80).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.3,gh*.62))+'px;width:'+(m?36:52)+'px;animation-duration:'+(m?80:110)+'s;animation-delay:'+(-i*10).toFixed(1)+'s');
        var bs=k.sprite(16,16,function(c){
          var g=c.createRadialGradient(-2,-2,0,0,0,7);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.4,'rgba(200,250,255,.4)');g.addColorStop(1,'rgba(100,180,200,0)');
          c.fillStyle=g;c.beginPath();c.arc(0,0,7,0,6.283);c.fill();
          c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;c.beginPath();c.arc(0,0,6,0,6.283);c.stroke();
        }),bl=[],nb=k.n(18),b0;
        for(b0=0;b0<nb;b0++)bl.push({x:Math.random(),y:Math.random(),v:k.rnd(18,44),s:k.rnd(.5,1.15),ph:k.rnd(0,6.28)});
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
