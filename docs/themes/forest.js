(function(){
  var SUN='<circle cx="80" cy="70" r="34" fill="#ffe066" stroke="#ffb300" stroke-width="3"/><circle cx="80" cy="70" r="22" fill="#fff8e1" opacity=".8"/>';
  var CLOUD='<ellipse cx="42" cy="40" rx="30" ry="18" fill="#fff" opacity=".92"/><ellipse cx="72" cy="34" rx="26" ry="16" fill="#fff" opacity=".88"/><ellipse cx="14" cy="38" rx="22" ry="14" fill="#fff" opacity=".92"/>';
  var PINE='<g transform="translate(0 6)"><path d="M50 124L20 62L80 62z" fill="#1b3a17" stroke="#0d2a10" stroke-width="2.5"/><path d="M50 96L12 42L88 42z" fill="#2d5a27" stroke="#0d2a10" stroke-width="2"/><path d="M50 72L26 18L74 18z" fill="#3a7d33" stroke="#0d2a10" stroke-width="1.8"/><rect x="47" y="122" width="6" height="14" fill="#4e342e"/><ellipse cx="50" cy="138" rx="9" ry="3" fill="#3a2a1e" opacity=".7"/></g>';
  var BIRCH='<g transform="translate(0 8)"><ellipse cx="30" cy="40" rx="28" ry="26" fill="#6b8f3e" stroke="#3a5a1e" stroke-width="2"/><ellipse cx="30" cy="56" rx="22" ry="20" fill="#7ca04e" stroke="#3a5a1e" stroke-width="1.6"/><rect x="28" y="54" width="4" height="38" fill="#eceff1"/><path d="M28 54h4M28 60h4M28 66h4M28 72h4M28 78h4M28 84h4" stroke="#5d4037" stroke-width="1.4"/><circle cx="22" cy="32" r="2.5" fill="#8d6e63"/><circle cx="38" cy="36" r="2.5" fill="#8d6e63"/><circle cx="30" cy="48" r="2.5" fill="#8d6e63"/></g>';
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
      var m=k.mobile(),wd=k.wide(),gh=m?32:42,i;
      k.el('',k.svg('0 0 1000 150','<rect width="1000" height="110" fill="#b3d9e8"/><circle cx="820" cy="70" r="38" fill="#ffe066" opacity=".95"/><circle cx="832" cy="60" r="10" fill="#fff" opacity=".6"/>'),'left:0;right:0;top:0;height:150px');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 100 70',CLOUD),'left:'+k.rnd(-20,70).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.4,gh*.7))+'px;width:'+(m?90:130)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*24).toFixed(1)+'s;opacity:.9');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.0,26,8,11)+k.hill(1000,gh*2.6,34,10,21)),'left:0;right:0;bottom:0;height:'+gh+'px;opacity:.98');
      k.el('',k.strip(gh,[{d:k.hill(1000,gh*1.4,14,5,23),fill:'#4caf50',line:'#2d5a27'},{d:k.hill(1000,gh*1.1,10,4,31),fill:'#66bb6a',line:'#2d5a27'}]),'left:0;right:0;bottom:0;height:'+gh+'px');
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 110 140',PINE),'left:'+k.rnd(-8,24).toFixed(1)+'%;bottom:'+Math.round(gh*.3)+'px;width:'+(m?44:72)+'px;animation-delay:'+(-i*.8).toFixed(2)+'s');
      for(i=0;i<(m?2:3);i++)k.el('zs-bob zs-brn',k.svg('0 0 90 90',BIRCH),'left:'+k.rnd(30,86).toFixed(1)+'%;bottom:'+Math.round(gh*.36)+'px;width:'+(m?34:56)+'px;animation-delay:'+(-i*.6).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#4caf50" stroke="#2d5a27" stroke-width="1.4"/><circle cx="14" cy="10" r="2.5" fill="#d84315"/><circle cx="20" cy="12" r="2" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      var sq=k.el('zs-fly',k.svg('0 0 120 110',SQUIR),'left:2%;bottom:'+Math.round(gh*.4)+'px;width:'+(m?56:90)+'px;animation-duration:'+(m?110:140)+'s;animation-delay:-28s');
      sq.innerHTML='<div>'+sq.innerHTML+'</div>';
      k.hbWatch(function(hb){sq.style.top=(hb+(m?4:12))+'px'});
      var br=k.el('zs-fly',k.svg('0 0 90 70',BIRD),'right:4%;bottom:'+Math.round(gh*.48)+'px;width:'+(m?46:74)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-42s');
      br.innerHTML='<div>'+br.innerHTML+'</div>';
      k.hbWatch(function(hb){br.style.top=(hb+(m?2:8))+'px'});
      if(k.pc()){
        for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.15,gh*.9))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.6,3.2).toFixed(1)+'s');
        k.el('zs-god','<i></i>','right:0;top:0;width:64vmax;height:64vmax',true);
        var fs=fireflySprite(k),ff=[],nf=k.n(16),f0;
        for(f0=0;f0<nf;f0++)ff.push({x:Math.random(),y:k.rnd(.15,.85),vx:k.rnd(6,20),vy:k.rnd(-5,5),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),s:k.rnd(.5,1.1),alive:Math.random()>.5});
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
