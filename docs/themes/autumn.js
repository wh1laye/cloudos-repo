(function(){
  var LEAF='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#d84315" stroke="#bf360c" stroke-width="1"/>';
  var LEAF2='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#ff9800" stroke="#e65100" stroke-width="1"/>';
  var LEAF3='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#ffd54f" stroke="#f57f17" stroke-width="1"/>';
  var TREE='<g transform="translate(0 12)"><ellipse cx="40" cy="42" rx="40" ry="34" fill="#5d4037" stroke="#3e2723" stroke-width="2.5"/><ellipse cx="40" cy="56" rx="32" ry="26" fill="#6d4c41" stroke="#3e2723" stroke-width="2"/><ellipse cx="40" cy="68" rx="24" ry="18" fill="#795548" stroke="#3e2723" stroke-width="1.6"/><rect x="36" y="66" width="8" height="18" fill="#4e342e"/><circle cx="24" cy="36" r="3.5" fill="#ff9800"/><circle cx="56" cy="34" r="3" fill="#ff9800"/><circle cx="48" cy="50" r="3.5" fill="#d84315"/><circle cx="32" cy="62" r="3" fill="#d84315"/><circle cx="44" cy="70" r="3" fill="#ffd54f"/><circle cx="28" cy="48" r="2.5" fill="#ffd54f"/></g>';
  var PUMPKIN='<g transform="translate(0 6)"><ellipse cx="24" cy="30" rx="18" ry="14" fill="#ff9800" stroke="#e65100" stroke-width="2"/><ellipse cx="24" cy="30" rx="10" ry="14" fill="#ffb74d" stroke="#e65100" stroke-width="1.5"/><rect x="22" y="16" width="4" height="8" fill="#4e342e"/><path d="M20 28Q24 22 28 28M24 28Q28 22 32 28" fill="none" stroke="#5d4037" stroke-width="1.5" stroke-linecap="round"/><path d="M18 32Q22 36 26 32Q22 28 18 32z" fill="#4e342e"/><circle cx="20" cy="30" r="1.5" fill="#222"/><circle cx="28" cy="28" r="1.5" fill="#222"/><circle cx="24" cy="34" r="1.5" fill="#222"/></g>';
  function leafSprite(k,c){
    return k.sprite(22,26,function(s){
      s.fillStyle=c;s.beginPath();s.ellipse(0,0,9,13,0,0,6.283);s.fill();
      s.lineWidth=1;s.strokeStyle='#bf360c';s.stroke();
      s.beginPath();s.moveTo(0,-11);s.lineTo(0,11);s.strokeStyle='rgba(0,0,0,.25)';s.stroke();
    });
  }
  window.CloudSeason.reg('au',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?28:38,i;
      var fog=k.el('','<div class="zs-fog"></div><div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?95:135)+'px',true);
      k.hbWatch(function(hb){fog.style.top=(hb-14)+'px'});
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.0,22,7,11)+k.hill(1000,gh*2.6,30,9,19)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#2d1b10;stroke:#4e342e;stroke-width:2;opacity:.97');
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 112 142',TREE),'left:'+k.rnd(-6,28).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.25,gh*.55))+'px;width:'+(m?46:74)+'px;animation-delay:'+(-i*.7).toFixed(2)+'s');
      for(i=0;i<(m?2:4);i++)k.el('zs-bob zs-brn',k.svg('0 0 72 62',PUMPKIN),'left:'+k.rnd(32,84).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.32,gh*.62))+'px;width:'+(m?28:46)+'px;animation-delay:'+(-i*.5).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#ff9800" stroke="#e65100" stroke-width="1.2"/><circle cx="12" cy="10" r="2" fill="#d84315"/><circle cx="18" cy="12" r="1.5" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      if(k.pc()){
        for(i=0;i<12;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.1,gh*.88))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.4).toFixed(1)+'s');
        var l1=leafSprite(k,'#d84315'),l2=leafSprite(k,'#ff9800'),l3=leafSprite(k,'#ffd54f'),ls=[l1,l2,l3],lv=[],nl=k.n(26),l0;
        for(l0=0;l0<nl;l0++)lv.push({x:Math.random(),y:Math.random(),vx:k.rnd(4,16),vy:k.rnd(12,32),r:k.rnd(0,6.28),rs:k.rnd(-2.5,2.5),s:k.rnd(.5,1.2),c:l0%3,ph:k.rnd(0,6.28)});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nl*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=lv[j];o.x+=o.vx*dt/w;o.y+=o.vy*dt/h;o.r+=o.rs*dt;
            if(o.y>1.08){o.y=-.08;o.x=Math.random();o.r=k.rnd(0,6.28)}
            k.put(c,ls[o.c],o.x*w+Math.sin(t*1.6+o.ph)*10,o.y*h,o.s,o.r);
          }
        },true,24);
      }
    }
  });
})();
