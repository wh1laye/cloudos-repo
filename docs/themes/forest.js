(function(){
  var PINE1='<path d="M50 132L20 64L80 64z" fill="#1b3a17" stroke="#0d2a10" stroke-width="2.5"/><path d="M50 106L12 42L88 42z" fill="#2d5a27" stroke="#0d2a10" stroke-width="2.5"/><path d="M50 80L26 18L74 18z" fill="#3a7d33" stroke="#0d2a10" stroke-width="2"/><rect x="47" y="132" width="6" height="16" fill="#4e342e"/><ellipse cx="50" cy="148" rx="10" ry="3" fill="#3a2a1e" opacity=".7"/>';
  var PINE2='<path d="M45 122L16 56L74 56z" fill="#2d5a27" stroke="#0d2a10" stroke-width="2"/><path d="M45 96L10 36L80 36z" fill="#3a7d33" stroke="#0d2a10" stroke-width="2"/><path d="M45 70L24 12L66 12z" fill="#4caf50" stroke="#0d2a10" stroke-width="1.5"/><rect x="42" y="122" width="6" height="14" fill="#4e342e"/>';
  var OAK='<g transform="translate(0 8)"><ellipse cx="48" cy="46" rx="42" ry="36" fill="#3a5a1e" stroke="#1b3a10" stroke-width="2.5"/><ellipse cx="48" cy="62" rx="34" ry="28" fill="#5a7d2e" stroke="#1b3a10" stroke-width="2"/><ellipse cx="48" cy="76" rx="26" ry="22" fill="#6b8f3e" stroke="#1b3a10" stroke-width="1.8"/><rect x="44" y="74" width="8" height="20" fill="#5d4037"/><circle cx="30" cy="36" r="4" fill="#8d6e63"/><circle cx="66" cy="34" r="4" fill="#8d6e63"/><circle cx="54" cy="54" r="4" fill="#8d6e63"/><circle cx="42" cy="68" r="4" fill="#8d6e63"/><circle cx="58" cy="70" r="4" fill="#8d6e63"/><circle cx="36" cy="58" r="4" fill="#8d6e63"/></g>';
  var BIRCH='<g transform="translate(0 10)"><ellipse cx="30" cy="40" rx="30" ry="28" fill="#6b8f3e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="30" cy="56" rx="24" ry="22" fill="#7ca04e" stroke="#3a5a1e" stroke-width="1.8"/><rect x="28" y="54" width="4" height="40" fill="#dce775"/><path d="M28 54h4M28 60h4M28 66h4M28 72h4M28 78h4M28 84h4" stroke="#5d4037" stroke-width="1.5"/><circle cx="22" cy="32" r="2.5" fill="#8d6e63"/><circle cx="38" cy="36" r="2.5" fill="#8d6e63"/><circle cx="30" cy="48" r="2.5" fill="#8d6e63"/></g>';
  var MOSS='<path d="M0 28Q15 22 30 28T60 28T90 28" fill="none" stroke="#4caf50" stroke-width="7" stroke-linecap="round" opacity=".9"/><path d="M0 32Q15 26 30 32T60 32T90 32" fill="none" stroke="#66bb6a" stroke-width="5" stroke-linecap="round" opacity=".75"/><path d="M0 36Q15 30 30 36T60 36T90 36" fill="none" stroke="#81c784" stroke-width="3" stroke-linecap="round" opacity=".6"/>';
  var LEAF='<path d="M0 -11Q5.5 0 0 11Q-5.5 0 0 -11z" fill="#4caf50" stroke="#2d5a27" stroke-width="1"/>';
  var LEAF2='<path d="M0 -11Q5.5 0 0 11Q-5.5 0 0 -11z" fill="#66bb6a" stroke="#2d5a27" stroke-width="1"/>';
  var LEAF3='<path d="M0 -11Q5.5 0 0 11Q-5.5 0 0 -11z" fill="#81c784" stroke="#2d5a27" stroke-width="1"/>';
  var MUSH='<ellipse cx="12" cy="20" rx="8" ry="5" fill="#d84315" stroke="#bf360c" stroke-width="1.5"/><rect x="11" y="20" width="2" height="8" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="1"/><circle cx="9" cy="18" r="1.2" fill="#fff"/><circle cx="15" cy="19" r="1" fill="#fff"/>';
  var FERN='<path d="M0 40Q8 30 0 20Q-8 30 0 40" fill="#388e3c" stroke="#1b5e20" stroke-width="1.2"/><path d="M0 20Q6 12 0 4Q-6 12 0 20" fill="#43a047" stroke="#1b5e20" stroke-width="1.2"/><path d="M0 4Q4 0 0 -4Q-4 0 0 4" fill="#4caf50" stroke="#1b5e20" stroke-width="1"/>';
  var FLOWER='<circle cx="0" cy="0" r="3" fill="#ffeb3b" stroke="#f57f17" stroke-width="1"/><path d="M0 -6Q2 -4 0 -2Q-2 -4 0 -6M6 0Q4 2 2 0Q4 -2 6 0M0 6Q2 4 0 2Q-2 4 0 6M-6 0Q-4 -2 -2 0Q-4 2 -6 0" fill="#f48fb1" stroke="#e91e63" stroke-width="1"/>';
  var SQUIR='<g transform="translate(0 4)"><ellipse cx="22" cy="46" rx="16" ry="10" fill="#5d4037" stroke="#3e2723" stroke-width="1.5"/><ellipse cx="34" cy="38" rx="10" ry="8" fill="#6d4c41" stroke="#3e2723" stroke-width="1.2"/><circle cx="42" cy="30" r="6" fill="#6d4c41" stroke="#3e2723" stroke-width="1.2"/><circle cx="46" cy="28" r="1.6" fill="#222"/><circle cx="47" cy="27" r="0.7" fill="#fff"/><path d="M44 32Q50 30 52 36Q46 38 44 36z" fill="#d7ccc8" stroke="#3e2723" stroke-width="1"/><ellipse cx="46" cy="52" rx="3" ry="9" fill="#5d4037" stroke="#3e2723" stroke-width="1.2" transform="rotate(-30 46 52)"/><ellipse cx="42" cy="46" rx="2" ry="6" fill="#5d4037" stroke="#3e2723" stroke-width="1"/><circle cx="24" cy="48" r="1.8" fill="#d7ccc8"/><circle cx="20" cy="44" r="1.6" fill="#d7ccc8"/></g>';
  var BIRD='<g transform="translate(0 2)"><ellipse cx="24" cy="28" rx="14" ry="8" fill="#424242" stroke="#212121" stroke-width="1.2"/><circle cx="34" cy="22" r="7" fill="#424242" stroke="#212121" stroke-width="1.2"/><circle cx="37" cy="20" r="1.4" fill="#222"/><path d="M39 20l5-2" stroke="#795548" stroke-width="1.8" stroke-linecap="round"/><path d="M20 30l-6 4" stroke="#212121" stroke-width="2" stroke-linecap="round"/><path d="M28 30l-4 4" stroke="#212121" stroke-width="2" stroke-linecap="round"/></g>';
  function ffSpr(k){return k.sprite(10,10,function(c){var g=c.createRadialGradient(0,0,0,0,0,5);g.addColorStop(0,'rgba(255,255,200,1)');g.addColorStop(.4,'rgba(200,255,100,.8)');g.addColorStop(1,'rgba(150,255,50,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,5,0,6.283);c.fill()});}
  function fireflySprite(k){
    return k.sprite(14,14,function(c){
      var g=c.createRadialGradient(0,0,0,0,0,6);g.addColorStop(0,'rgba(255,255,160,1)');g.addColorStop(.5,'rgba(255,255,120,.6)');g.addColorStop(1,'rgba(200,255,80,0)');
      c.fillStyle=g;c.beginPath();c.arc(0,0,6,0,6.283);c.fill();
      c.beginPath();c.arc(-1,-1,1.4,0,6.283);c.fillStyle='#fff';c.fill();
    });
  }
  window.CloudSeason.reg('fr',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?30:40,i;
      var back=k.el('','<div class="zs-fog"></div><div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?110:150)+'px',true);
      k.hbWatch(function(hb){back.style.top=(hb-12)+'px'});
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.6,20,7,7)+k.hill(1000,gh*3.2,28,9,13)),'left:0;right:0;bottom:0;height:'+gh+'px;opacity:.92');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.6,16,5,19)),'left:0;right:0;bottom:0;height:'+Math.round(gh*.55)+'px;opacity:.75');
      for(i=0;i<(m?4:8);i++)k.el('zs-brn',k.svg('0 0 100 140',PINE1),'left:'+k.rnd(-6,24).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.25,gh*.55))+'px;width:'+(m?44:70)+'px;animation-delay:'+(-i*.8).toFixed(2)+'s');
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 110 150',PINE2),'left:'+k.rnd(26,60).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.3,gh*.6))+'px;width:'+(m?40:64)+'px;animation-delay:'+(-i*.7).toFixed(2)+'s');
      for(i=0;i<(m?2:4);i++)k.el('zs-brn',k.svg('0 0 100 110',OAK),'left:'+k.rnd(58,94).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.28,gh*.58))+'px;width:'+(m?36:56)+'px;animation-delay:'+(-i*.6).toFixed(2)+'s');
      for(i=0;i<(m?2:3);i++)k.el('zs-bob zs-brn',k.svg('0 0 100 100',BIRCH),'left:'+k.rnd(4,30).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.32,gh*.62))+'px;width:'+(m?32:50)+'px;animation-delay:'+(-i*.5).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#4caf50" stroke="#2d5a27" stroke-width="1.4"/><circle cx="14" cy="10" r="2.5" fill="#d84315"/><circle cx="20" cy="12" r="2" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      var sq=k.el('zs-fly',k.svg('0 0 120 110',SQUIR),'left:2%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?56:90)+'px;animation-duration:'+(m?110:140)+'s;animation-delay:-25s');
      sq.innerHTML='<div>'+sq.innerHTML+'</div>';
      k.hbWatch(function(hb){sq.style.top=(hb+(m?4:10))+'px'});
      var br=k.el('zs-fly',k.svg('0 0 90 70',BIRD),'right:4%;bottom:'+Math.round(gh*.55)+'px;width:'+(m?44:70)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-40s');
      br.innerHTML='<div>'+br.innerHTML+'</div>';
      k.hbWatch(function(hb){br.style.top=(hb+(m?2:6))+'px'});
      var mu=k.el('zs-bob',k.svg('0 0 36 40',MUSH),'left:'+k.rnd(30,70).toFixed(1)+'%;bottom:'+Math.round(gh*.35)+'px;width:'+(m?18:28)+'px;animation-delay:'+(-k.rnd(0,2)).toFixed(2)+'s');
      var fe=k.el('zs-wob',k.svg('0 0 48 60',FERN),'left:'+k.rnd(70,95).toFixed(1)+'%;bottom:'+Math.round(gh*.3)+'px;width:'+(m?24:38)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      var fl=k.el('zs-flower',FLOWER,'left:'+k.rnd(10,40).toFixed(1)+'%;bottom:'+Math.round(gh*.4)+'px;width:16px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      if(k.pc()){
        for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.1,gh*.8))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.6,3).toFixed(1)+'s');
        k.el('zs-god','<i></i>','right:0;top:0;width:60vmax;height:60vmax',true);
        var fs=fireflySprite(k),ff=[],nf=k.n(14),f0;
        for(f0=0;f0<nf;f0++)ff.push({x:Math.random(),y:k.rnd(.15,.8),vx:k.rnd(6,18),vy:k.rnd(-4,4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),s:k.rnd(.5,1),alive:Math.random()>.5});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nf*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=ff[j];if(!o.alive)continue;
            o.x+=o.vx*dt/w;o.y+=Math.sin(t*2+o.ph)*o.vy*dt/h;
            if(o.x>1.06){o.x=-.04;o.y=k.rnd(.15,.8)}
            c.globalAlpha=.5+.5*Math.abs(Math.sin(t*3+o.p));
            k.put(c,fs,o.x*w,o.y*h,o.s,0,Math.max(.2,Math.cos(t*2+o.p)*.6+.2));
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
