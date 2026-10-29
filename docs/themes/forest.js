(function(){
  var PINE='<g><path d="M50 130L15 60L85 60z" fill="#1b3a17" stroke="#0d2a10" stroke-width="2.5"/><path d="M50 100L10 40L90 40z" fill="#2d5a27" stroke="#0d2a10" stroke-width="2"/><path d="M50 70L25 20L75 20z" fill="#3a7d33" stroke="#0d2a10" stroke-width="1.5"/><rect x="47" y="130" width="6" height="14" fill="#4e342e"/><ellipse cx="50" cy="146" rx="9" ry="3" fill="#3a2a1e" opacity=".7"/></g>';
  var OAK='<g transform="translate(0 10)"><ellipse cx="46" cy="44" rx="40" ry="34" fill="#3a5a1e" stroke="#1b3a10" stroke-width="2.5"/><ellipse cx="46" cy="60" rx="32" ry="28" fill="#5a7d2e" stroke="#1b3a10" stroke-width="2"/><ellipse cx="46" cy="74" rx="24" ry="22" fill="#6b8f3e" stroke="#1b3a10" stroke-width="1.6"/><rect x="42" y="72" width="8" height="18" fill="#5d4037"/><circle cx="28" cy="34" r="4" fill="#8d6e63"/><circle cx="64" cy="32" r="4" fill="#8d6e63"/><circle cx="52" cy="52" r="4" fill="#8d6e63"/><circle cx="40" cy="66" r="4" fill="#8d6e63"/><circle cx="56" cy="68" r="4" fill="#8d6e63"/></g>';
  var BIRCH='<g transform="translate(0 8)"><ellipse cx="28" cy="38" rx="28" ry="26" fill="#6b8f3e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="28" cy="54" rx="22" ry="20" fill="#7ca04e" stroke="#3a5a1e" stroke-width="1.6"/><rect x="26" y="52" width="4" height="38" fill="#eceff1"/><path d="M26 52h4M26 58h4M26 64h4M26 70h4M26 76h4M26 82h4" stroke="#5d4037" stroke-width="1.4"/><circle cx="20" cy="30" r="2.5" fill="#8d6e63"/><circle cx="36" cy="34" r="2.5" fill="#8d6e63"/><circle cx="28" cy="46" r="2.5" fill="#8d6e63"/></g>';
  var MOSS='<path d="M0 26Q14 20 28 26T56 26T84 26" fill="none" stroke="#4caf50" stroke-width="7" stroke-linecap="round" opacity=".95"/><path d="M0 30Q14 24 28 30T56 30T84 30" fill="none" stroke="#66bb6a" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M0 34Q14 28 28 34T56 34T84 34" fill="none" stroke="#81c784" stroke-width="3" stroke-linecap="round" opacity=".65"/>';
  var MUSH='<ellipse cx="12" cy="20" rx="8" ry="5" fill="#d84315" stroke="#bf360c" stroke-width="1.5"/><rect x="11" y="20" width="2" height="8" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="1"/><circle cx="9" cy="18" r="1.2" fill="#fff"/><circle cx="15" cy="19" r="1" fill="#fff"/>';
  var FERN='<path d="M0 38Q8 28 0 18Q-8 28 0 38" fill="#388e3c" stroke="#1b5e20" stroke-width="1.2"/><path d="M0 18Q6 10 0 4Q-6 10 0 18" fill="#43a047" stroke="#1b5e20" stroke-width="1.2"/><path d="M0 4Q4 0 0 -4Q-4 0 0 4" fill="#4caf50" stroke="#1b5e20" stroke-width="1"/>';
  var FLOWER='<circle cx="0" cy="0" r="3" fill="#ffeb3b" stroke="#f57f17" stroke-width="1"/><path d="M0 -6Q2 -4 0 -2Q-2 -4 0 -6M6 0Q4 2 2 0Q4 -2 6 0M0 6Q2 4 0 2Q-2 4 0 6M-6 0Q-4 -2 -2 0Q-4 2 -6 0" fill="#f48fb1" stroke="#e91e63" stroke-width="1"/>';
  var SQUIR='<g transform="translate(0 4)"><ellipse cx="22" cy="46" rx="16" ry="10" fill="#5d4037" stroke="#3e2723" stroke-width="1.5"/><ellipse cx="34" cy="38" rx="10" ry="8" fill="#6d4c41" stroke="#3e2723" stroke-width="1.2"/><circle cx="42" cy="30" r="6" fill="#6d4c41" stroke="#3e2723" stroke-width="1.2"/><circle cx="46" cy="28" r="1.6" fill="#222"/><circle cx="47" cy="27" r="0.7" fill="#fff"/><path d="M44 32Q50 30 52 36Q46 38 44 36z" fill="#d7ccc8" stroke="#3e2723" stroke-width="1"/><ellipse cx="46" cy="52" rx="3" ry="9" fill="#5d4037" stroke="#3e2723" stroke-width="1.2" transform="rotate(-30 46 52)"/><ellipse cx="42" cy="46" rx="2" ry="6" fill="#5d4037" stroke="#3e2723" stroke-width="1"/><circle cx="24" cy="48" r="1.8" fill="#d7ccc8"/><circle cx="20" cy="44" r="1.6" fill="#d7ccc8"/></g>';
  var BIRD='<g transform="translate(0 2)"><ellipse cx="24" cy="28" rx="14" ry="8" fill="#424242" stroke="#212121" stroke-width="1.2"/><circle cx="34" cy="22" r="7" fill="#424242" stroke="#212121" stroke-width="1.2"/><circle cx="37" cy="20" r="1.4" fill="#222"/><circle cx="38" cy="19" r="0.7" fill="#fff"/><path d="M39 20l5-2" stroke="#795548" stroke-width="1.8" stroke-linecap="round"/><path d="M20 30l-6 4" stroke="#212121" stroke-width="2" stroke-linecap="round"/><path d="M28 30l-4 4" stroke="#212121" stroke-width="2" stroke-linecap="round"/></g>';
  function fireflySprite(k){
    return k.sprite(14,14,function(c){
      var g=c.createRadialGradient(0,0,0,0,0,6);g.addColorStop(0,'rgba(255,255,160,1)');g.addColorStop(.5,'rgba(255,255,120,.6)');g.addColorStop(1,'rgba(200,255,80,0)');
      c.fillStyle=g;c.beginPath();c.arc(0,0,6,0,6.283);c.fill();
      c.beginPath();c.arc(-1,-1,1.4,0,6.283);c.fillStyle='#fff';c.fill();
    });
  }
  window.CloudSeason.reg('fr',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?28:38,i;
      var fog=k.el('','<div class="zs-fog"></div><div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?100:140)+'px',true);
      k.hbWatch(function(hb){fog.style.top=(hb-14)+'px'});
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.4,22,7,9)+k.hill(1000,gh*3.0,30,9,17)),'left:0;right:0;bottom:0;height:'+gh+'px;opacity:.96');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*1.4,14,5,23)),'left:0;right:0;bottom:0;height:'+Math.round(gh*.5)+'px;opacity:.8');
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 110 150',PINE),'left:'+k.rnd(-8,22).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.25,gh*.55))+'px;width:'+(m?42:68)+'px;animation-delay:'+(-i*.8).toFixed(2)+'s');
      for(i=0;i<(m?2:4);i++)k.el('zs-brn',k.svg('0 0 110 150',OAK),'left:'+k.rnd(24,56).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.3,gh*.6))+'px;width:'+(m?40:64)+'px;animation-delay:'+(-i*.7).toFixed(2)+'s');
      for(i=0;i<(m?2:3);i++)k.el('zs-bob zs-brn',k.svg('0 0 100 100',BIRCH),'left:'+k.rnd(58,94).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.32,gh*.62))+'px;width:'+(m?34:54)+'px;animation-delay:'+(-i*.6).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#4caf50" stroke="#2d5a27" stroke-width="1.4"/><circle cx="14" cy="10" r="2.5" fill="#d84315"/><circle cx="20" cy="12" r="2" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      var sq=k.el('zs-fly',k.svg('0 0 120 110',SQUIR),'left:2%;bottom:'+Math.round(gh*.52)+'px;width:'+(m?54:86)+'px;animation-duration:'+(m?110:140)+'s;animation-delay:-25s');
      sq.innerHTML='<div>'+sq.innerHTML+'</div>';
      k.hbWatch(function(hb){sq.style.top=(hb+(m?4:10))+'px'});
      var br=k.el('zs-fly',k.svg('0 0 90 70',BIRD),'right:4%;bottom:'+Math.round(gh*.58)+'px;width:'+(m?42:68)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-40s');
      br.innerHTML='<div>'+br.innerHTML+'</div>';
      k.hbWatch(function(hb){br.style.top=(hb+(m?2:6))+'px'});
      k.el('zs-bob',k.svg('0 0 36 40',MUSH),'left:'+k.rnd(30,70).toFixed(1)+'%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?18:28)+'px;animation-delay:'+(-k.rnd(0,2)).toFixed(2)+'s');
      k.el('zs-wob',k.svg('0 0 48 60',FERN),'left:'+k.rnd(72,96).toFixed(1)+'%;bottom:'+Math.round(gh*.32)+'px;width:'+(m?24:38)+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      k.el('zs-flower',FLOWER,'left:'+k.rnd(10,40).toFixed(1)+'%;bottom:'+Math.round(gh*.42)+'px;width:16px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s');
      if(k.pc()){
        for(i=0;i<12;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.1,gh*.85))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.6,3).toFixed(1)+'s');
        k.el('zs-god','<i></i>','right:0;top:0;width:64vmax;height:64vmax',true);
        var fs=fireflySprite(k),ff=[],nf=k.n(14),f0;
        for(f0=0;f0<nf;f0++)ff.push({x:Math.random(),y:k.rnd(.15,.85),vx:k.rnd(6,18),vy:k.rnd(-4,4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),s:k.rnd(.5,1),alive:Math.random()>.5});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nf*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=ff[j];if(!o.alive)continue;
            o.x+=o.vx*dt/w;o.y+=Math.sin(t*2+o.ph)*o.vy*dt/h;
            if(o.x>1.06){o.x=-.04;o.y=k.rnd(.15,.85)}
            c.globalAlpha=.5+.5*Math.abs(Math.sin(t*3+o.p));
            k.put(c,fs,o.x*w,o.y*h,o.s,0,Math.max(.2,Math.cos(t*2+o.p)*.6+.2));
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
