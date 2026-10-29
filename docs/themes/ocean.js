(function(){
  var SUN='<circle cx="820" cy="80" r="38" fill="#ffe066" stroke="#ffb300" stroke-width="3"/><circle cx="832" cy="70" r="10" fill="#fff" opacity=".6"/>';
  var CLOUD='<ellipse cx="42" cy="40" rx="30" ry="18" fill="#fff" opacity=".92"/><ellipse cx="72" cy="34" rx="26" ry="16" fill="#fff" opacity=".88"/><ellipse cx="14" cy="38" rx="22" ry="14" fill="#fff" opacity=".92"/>';
  var WAVE='<path d="M0 24Q120 8 240 24T480 24T720 24T960 24V60H0z" fill="#1b5e8f" opacity=".96"/><path d="M0 28Q120 12 240 28T480 28T720 28T960 28V60H0z" fill="#144c70" opacity=".88"/><path d="M0 32Q120 16 240 32T480 32T720 32T960 32V60H0z" fill="#0d3a55" opacity=".8"/><path d="M16 30Q100 22 184 30Q268 42 352 30Q436 22 520 30Q604 42 688 30Q772 22 856 30Q940 42 984 30" fill="none" stroke="#2a7db0" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
  var WAVE2='<path d="M0 22Q110 6 220 22T440 22T660 22T880 22V56H0z" fill="#2a6fa5" opacity=".92"/><path d="M0 26Q110 10 220 26T440 26T660 26T880 26V56H0z" fill="#1f5a7e" opacity=".84"/><path d="M12 28Q96 20 180 28Q264 40 348 28Q432 20 516 28Q600 40 684 28Q768 20 852 28Q936 40 976 28" fill="none" stroke="#3a9cc8" stroke-width="2.5" stroke-linecap="round" opacity=".75"/>';
  var WHALE='<g transform="translate(0 8)"><path d="M10 54Q66 6 124 54Q90 88 10 54z" fill="#263238" stroke="#0d47a1" stroke-width="3" stroke-linejoin="round"/><ellipse cx="98" cy="50" rx="20" ry="13" fill="#37474f" stroke="#0d47a1" stroke-width="2"/><circle cx="118" cy="42" r="3" fill="#222"/><circle cx="120" cy="40" r="1" fill="#fff"/><path d="M68 62Q88 70 108 62" fill="none" stroke="#4fc3f7" stroke-width="3" stroke-linecap="round" opacity=".85"/><path d="M124 54Q144 64 144 74Q124 76 124 54z" fill="#263238" stroke="#0d47a1" stroke-width="2"/><path d="M10 54Q40 74 70 72Q100 80 124 74Q134 68 134 54z" fill="none" stroke="#0d47a1" stroke-width="3" stroke-linecap="round"/></g>';
  var DOLPHIN='<g transform="translate(0 4)"><path d="M10 44Q34 4 74 44Q104 74 74 62Q42 54 10 44z" fill="#00acc1" stroke="#006064" stroke-width="2.5" stroke-linejoin="round"/><circle cx="83" cy="40" r="3" fill="#222"/><circle cx="85" cy="38" r="1" fill="#fff"/><path d="M54 56Q69 62 84 56" fill="none" stroke="#4dd0e1" stroke-width="2.5" stroke-linecap="round" opacity=".85"/><path d="M74 44Q89 52 89 60Q74 62 74 44z" fill="#00acc1" stroke="#006064" stroke-width="2"/></g>';
  var GULL='<g transform="translate(0 2)"><path d="M18 28Q28 16 38 28Q48 16 58 28" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="38" cy="24" r="2" fill="#fff"/><path d="M32 24Q36 22 40 24" fill="none" stroke="#b0bec5" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>';
  var LIGHT='<g transform="translate(0 10)"><rect x="44" cy="14" rx="4" ry="4" width="12" height="14" fill="#eceff1" stroke="#37474f" stroke-width="1.8"/><rect x="44" y="28" width="24" height="4" fill="#78909c" stroke="#37474f" stroke-width="1.4"/><rect x="46" y="30" width="20" height="14" rx="2" fill="#37474f"/><path d="M50 30l-18 16M68 30l18 16" stroke="#455a64" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="10" r="7" fill="#fff4e0" opacity=".95"/><circle cx="50" cy="10" r="4" fill="#fff" opacity="1"/></g>';
  var SAND='<g transform="translate(0 0)"><path d="M0 26Q100 16 200 26T400 26T600 26T800 26T1000 26V42H0z" fill="#d4af37" opacity=".9"/><path d="M0 30Q100 20 200 30T400 30T600 30T800 30T1000 30V42H0z" fill="#c9a227" stroke="#b8941e" stroke-width="1.5" opacity=".85"/></g>';
  window.CloudSeason.reg('oc',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?32:42,i;
      k.el('',k.svg('0 0 1000 150','<rect width="1000" height="100" fill="#6fa8dc"/>'+SUN),'left:0;right:0;top:0;height:150px');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 100 70',CLOUD),'left:'+k.rnd(-20,60).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.45,gh*.75))+'px;width:'+(m?90:130)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*24).toFixed(1)+'s;opacity:.92');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.8,20,7,11)+k.hill(1000,gh*2.4,28,9,19)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0b1d26;stroke:#163a4c;stroke-width:2;opacity:.98');
      k.el('','<div class="zs-wv">'+WAVE+'</div>','left:0;bottom:0;width:100%;height:'+gh+'px;opacity:.99');
      k.el('zs-wv b2','<div class="zs-wv">'+WAVE2+'</div>','left:0;bottom:0;width:100%;height:'+Math.round(gh*.58)+'px;opacity:.88');
      k.el('',k.svg('0 0 1000 40',SAND),'left:0;right:0;bottom:0;height:40px;opacity:.97');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#00bfa5" stroke="#00838f" stroke-width="1.2"/><circle cx="14" cy="12" r="2" fill="#b2ebf2"/><circle cx="20" cy="14" r="1.5" fill="#b2ebf2"/></svg>'},0,0,0,{fit:true});
      var lh=k.el('zs-bob',k.svg('0 0 100 110',LIGHT),'right:3%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?44:70)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      k.hbWatch(function(hb){lh.style.top=(hb+(m?2:8))+'px'});
      var wh=k.el('zs-fly zs-whale',k.svg('0 0 224 110',WHALE),'left:-14%;bottom:'+Math.round(gh*.46)+'px;width:'+(m?148:224)+'px;animation-duration:'+(m?140:180)+'s;animation-delay:-40s');
      wh.innerHTML='<div>'+wh.innerHTML+'</div>';
      k.hbWatch(function(hb){wh.style.top=(hb+(m?4:12))+'px'});
      var dl=k.el('zs-fly r zs-dolphin',k.svg('0 0 162 90',DOLPHIN),'right:-16%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?112:162)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-54s');
      dl.innerHTML='<div>'+dl.innerHTML+'</div>';
      k.hbWatch(function(hb){dl.style.top=(hb+(m?2:8))+'px'});
      if(k.pc()){
        for(i=0;i<8;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.15,gh*.55))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.8).toFixed(1)+'s',true);
        for(i=0;i<6;i++)k.el('zs-fly',k.svg('0 0 70 40',GULL),'left:'+k.rnd(10,80).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.3,gh*.62))+'px;width:'+(m?34:50)+'px;animation-duration:'+(m?80:110)+'s;animation-delay:'+(-i*10).toFixed(1)+'s');
        var bs=k.sprite(16,16,function(c){
          var g=c.createRadialGradient(-2,-2,0,0,0,7);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.4,'rgba(200,250,255,.4)');g.addColorStop(1,'rgba(100,180,200,0)');
          c.fillStyle=g;c.beginPath();c.arc(0,0,7,0,6.283);c.fill();
          c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;c.beginPath();c.arc(0,0,6,0,6.283);c.stroke();
        }),bl=[],nb=k.n(16),b0;
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
