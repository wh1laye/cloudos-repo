(function(){
  var STAR='<circle cx="0" cy="0" r="1.5" fill="#fff"/><path d="M0 -3.5l1 1.4 3.5 0.5l-2.4 1.7l0.5 3.5l-2.4 -1.7l3.5 -0.5z" fill="#fff" opacity=".95"/>';
  var MOON='<g transform="translate(0 6)"><circle cx="40" cy="40" r="28" fill="#fff" stroke="#f5f5f5" stroke-width="2"/><circle cx="32" cy="34" r="5" fill="#eee" opacity=".8"/><circle cx="48" cy="32" r="3.5" fill="#eee" opacity=".7"/><circle cx="38" cy="48" r="4" fill="#eee" opacity=".6"/><circle cx="52" cy="44" r="2.5" fill="#eee" opacity=".5"/><path d="M18 40Q24 34 30 40" fill="none" stroke="#e0e0e0" stroke-width="1.5" opacity=".7"/></g>';
  var CLOUD='<path d="M16 44H82A22 22 0 0 0 86 18 26 26 0 0 0 44 22 18 18 0 0 0 16 44z" fill="#222244" stroke="#3a3a66" stroke-width="3" stroke-linejoin="round"/><path d="M24 34Q38 28 52 34" fill="none" stroke="#5c5c90" stroke-width="3" stroke-linecap="round"/>';
  var OWL='<g transform="translate(0 4)"><ellipse cx="30" cy="46" rx="16" ry="12" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="30" cy="34" r="9" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="25" cy="30" r="2.2" fill="#fff"/><circle cx="35" cy="30" r="2.2" fill="#fff"/><circle cx="24" cy="29" r="1" fill="#222"/><circle cx="36" cy="29" r="1" fill="#222"/><path d="M27 36l-2 4M33 36l2 4" stroke="#263238" stroke-width="2" stroke-linecap="round"/><path d="M30 38l0 5" stroke="#263238" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="20" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(-25 20 50)"/><ellipse cx="40" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(25 40 50)"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.7)';c.stroke();
    });
  }
  window.CloudSeason.reg('ni',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?32:44,i;
      var aur=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:55%',true);
      var moonGlow=k.el('','<div style="width:72px;height:72px;border-radius:50%;box-shadow:0 0 36px 12px rgba(255,250,200,.55)"></div>','right:5%;top:'+Math.round(gh*.16)+'px;width:'+(m?48:72)+'px;height:'+(m?48:72)+'px',true);
      k.el('',k.svg('0 0 92 92',MOON),'right:5.5%;top:'+Math.round(gh*.18)+'px;width:'+(m?40:62)+'px;height:'+(m?40:62)+'px;animation:zswob 7s ease-in-out infinite');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 116 76',CLOUD),'left:'+k.rnd(-22,38).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.35,gh*.7))+'px;width:'+(m?120:180)+'px;animation-duration:'+(m?150:210)+'s;animation-delay:'+(-i*26).toFixed(1)+'s;opacity:.88');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.0,24,7,11)+k.hill(1000,gh*2.6,32,9,19)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0a0a14;stroke:#1a1a2e;stroke-width:2;opacity:.98');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="8" r="2" fill="#fff" opacity=".85"/><circle cx="18" cy="10" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var owl=k.el('zs-fly',k.svg('0 0 94 84',OWL),'left:3%;bottom:'+Math.round(gh*.52)+'px;width:'+(m?52:84)+'px;animation-duration:'+(m?120:160)+'s;animation-delay:-18s');
      owl.innerHTML='<div>'+owl.innerHTML+'</div>';
      k.hbWatch(function(hb){owl.style.top=(hb+(m?2:8))+'px'});
      if(k.pc()){
        for(i=0;i<10;i++)k.el('zs-shoot','','left:'+k.rnd(4,82).toFixed(1)+'%;top:'+k.rnd(4,42).toFixed(1)+'%;animation-delay:'+(-i*3.4).toFixed(1)+'s;animation-duration:'+(10+i*4.2).toFixed(1)+'s',true);
        for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.88))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4.2).toFixed(1)+'s',true);
        var ss=starSprite(k),st=[],ns=k.n(170),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.4),tw:k.rnd(1.3,4.2),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.14});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(ns*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=st[j];
            c.globalAlpha=.2+.8*Math.abs(Math.sin(t*o.tw+o.p));
            if(o.g){
              c.save();c.translate(o.x*w,o.y*h);c.scale(o.z,o.z);
              c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(0,0,15*o.z,0,6.283);c.fill();c.restore();
            }else{
              k.put(c,ss,o.x*w+Math.sin(t*1.2+o.ph)*3,o.y*h,o.z,0);
            }
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
