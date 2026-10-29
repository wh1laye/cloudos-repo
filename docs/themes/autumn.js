(function(){
  var SUN='<circle cx="80" cy="70" r="34" fill="#ffe066" stroke="#ffb300" stroke-width="3"/><circle cx="80" cy="70" r="22" fill="#ffeaa7" opacity=".8"/>';
  var CLOUD='<ellipse cx="42" cy="40" rx="30" ry="18" fill="#ffe082" opacity=".9"/><ellipse cx="72" cy="36" rx="28" ry="20" fill="#ffe082" opacity=".85"/><ellipse cx="14" cy="38" rx="22" ry="16" fill="#ffe082" opacity=".9"/>';
  var TREE='<g transform="translate(0 14)"><path d="M48 144L14 62L82 62z" fill="#5d4037" stroke="#3e2723" stroke-width="2.5"/><path d="M48 116L8 42L88 42z" fill="#6d4c41" stroke="#3e2723" stroke-width="2"/><path d="M48 92L24 18L72 18z" fill="#795548" stroke="#3e2723" stroke-width="1.8"/><rect x="45" y="142" width="6" height="16" fill="#4e342e"/><ellipse cx="48" cy="160" rx="9" ry="3" fill="#3e2723" opacity=".7"/><circle cx="30" cy="36" r="3.5" fill="#d84315"/><circle cx="66" cy="34" r="3" fill="#ff9800"/><circle cx="54" cy="50" r="3.5" fill="#ffd54f"/><circle cx="42" cy="62" r="3" fill="#d84315"/><circle cx="58" cy="68" r="3" fill="#ff9800"/><circle cx="36" cy="48" r="2.5" fill="#ffd54f"/></g>';
  var BUSH='<g transform="translate(0 8)"><ellipse cx="40" cy="38" rx="30" ry="22" fill="#8d6e63" stroke="#5d4037" stroke-width="2"/><ellipse cx="40" cy="50" rx="24" ry="18" fill="#a1887f" stroke="#5d4037" stroke-width="1.6"/><rect x="37" y="48" width="6" height="12" fill="#4e342e"/><circle cx="28" cy="30" r="2.5" fill="#d84315"/><circle cx="52" cy="32" r="2" fill="#ff9800"/><circle cx="40" cy="44" r="2.5" fill="#ffd54f"/></g>';
  var PUMPKIN='<g transform="translate(0 6)"><ellipse cx="24" cy="30" rx="18" ry="14" fill="#ff9800" stroke="#e65100" stroke-width="2"/><ellipse cx="24" cy="30" rx="10" ry="14" fill="#ffb74d" stroke="#e65100" stroke-width="1.5"/><rect x="22" y="16" width="4" height="8" fill="#4e342e"/><path d="M20 28Q24 22 28 28M24 28Q28 22 32 28" fill="none" stroke="#5d4037" stroke-width="1.5" stroke-linecap="round"/><path d="M18 32Q22 36 26 32Q22 28 18 32z" fill="#4e342e"/><circle cx="20" cy="30" r="1.5" fill="#222"/><circle cx="28" cy="28" r="1.5" fill="#222"/><circle cx="24" cy="34" r="1.5" fill="#222"/></g>';
  var ACORN='<g transform="translate(0 0)"><circle cx="12" cy="14" r="3" fill="#4e342e"/><path d="M9 14Q12 10 15 14" fill="#5d4037" stroke="#3e2723" stroke-width="1" stroke-linejoin="round"/><rect x="10" y="12" width="4" height="4" fill="#8d6e63" opacity=".6"/></g>';
  var LEAF='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#d84315" stroke="#bf360c" stroke-width="1"/>';
  var LEAF2='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#ff9800" stroke="#e65100" stroke-width="1"/>';
  var LEAF3='<path d="M0 -13Q6.5 0 0 13Q-6.5 0 0 -13z" fill="#ffd54f" stroke="#f57f17" stroke-width="1"/>';
  function leafSprite(k,c){
    return k.sprite(22,26,function(s){
      s.fillStyle=c;s.beginPath();s.ellipse(0,0,9,13,0,0,6.283);s.fill();
      s.lineWidth=1;s.strokeStyle='#bf360c';s.stroke();
      s.beginPath();s.moveTo(0,-11);s.lineTo(0,11);s.strokeStyle='rgba(0,0,0,.25)';s.stroke();
    });
  }
  window.CloudSeason.reg('au',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?30:40,i;
      // осень: дерево, куст, тыквы, шишки, желуди, листья. всё стоит на земле, неба над интерфейсом нет.
      // небо убрано — не закрывает интерфейс
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 100 70',CLOUD),'left:'+k.rnd(-20,60).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.45,gh*.75))+'px;width:'+(m?90:130)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*24).toFixed(1)+'s;opacity:.92');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.0,24,8,11)+k.hill(1000,gh*2.6,32,10,21)),'left:0;right:0;bottom:0;height:'+gh+'px;opacity:.98');
      k.el('',k.strip(gh,[{d:k.hill(1000,gh*1.4,16,6,19),fill:'#8d6e63',line:'#5d4037'},{d:k.hill(1000,gh*1.1,12,5,27),fill:'#a1887f',line:'#5d4037'}]),'left:0;right:0;bottom:0;height:'+gh+'px');
      // дерево стоит на земле
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 112 162',TREE),'left:'+k.rnd(-6,28).toFixed(1)+'%;bottom:0;width:'+(m?48:80)+'px;animation-delay:'+(-i*.7).toFixed(2)+'s');
      // кусты стоят на земле
      for(i=0;i<(m?2:3);i++)k.el('zs-bob zs-brn',k.svg('0 0 72 62',BUSH),'left:'+k.rnd(32,84).toFixed(1)+'%;bottom:0;width:'+(m?32:52)+'px;animation-delay:'+(-i*.5).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#ff9800" stroke="#e65100" stroke-width="1.2"/><circle cx="12" cy="10" r="2" fill="#d84315"/><circle cx="18" cy="12" r="1.5" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      // тыквы стоят на земле
      for(i=0;i<(m?2:4);i++)k.el('zs-bob',k.svg('0 0 72 62',PUMPKIN),'left:'+k.rnd(30,86).toFixed(1)+'%;bottom:'+Math.round(gh*.05)+'px;width:'+(m?30:48)+'px;animation-delay:'+(-i*.4).toFixed(2)+'s');
      // шишки и желуди на земле
      for(i=0;i<(m?4:8);i++)k.el('',k.svg('0 0 24 24',ACORN),'left:'+k.rnd(10,90).toFixed(1)+'%;bottom:'+Math.round(gh*.05)+'px;width:'+(m?14:20)+'px;animation-delay:'+(-i*.3).toFixed(2)+'s');
      if(k.pc()){
        for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.1,gh*.9))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(1.8,3.4).toFixed(1)+'s');
        var l1=leafSprite(k,'#d84315'),l2=leafSprite(k,'#ff9800'),l3=leafSprite(k,'#ffd54f'),ls=[l1,l2,l3],lv=[],nl=k.n(32),l0;
        for(l0=0;l0<nl;l0++)lv.push({x:Math.random(),y:Math.random(),vx:k.rnd(4,18),vy:k.rnd(14,36),r:k.rnd(0,6.28),rs:k.rnd(-3,3),s:k.rnd(.5,1.25),c:l0%3,ph:k.rnd(0,6.28)});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(nl*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=lv[j];o.x+=o.vx*dt/w;o.y+=o.vy*dt/h;o.r+=o.rs*dt;
            if(o.y>1.08){o.y=-.08;o.x=Math.random();o.r=k.rnd(0,6.28)}
            k.put(c,ls[o.c],o.x*w+Math.sin(t*1.7+o.ph)*12,o.y*h,o.s,o.r);
          }
        },true,24);
      }
    }
  });
})();
