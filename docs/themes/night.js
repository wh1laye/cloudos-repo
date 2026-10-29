(function(){
  var SKY='<rect width="1000" height="220" fill="#0a0a1a"/><circle cx="780" cy="70" r="44" fill="#e6e6fa" opacity=".95"/><circle cx="792" cy="62" r="12" fill="#fff" opacity=".7"/>';
  var STAR='<circle cx="0" cy="0" r="1.4" fill="#fff"/><path d="M0 -3l0.9 1.3 3.2 0.4l-2.2 1.6l0.4 3l-2.2 -1.6l3.2 -0.4z" fill="#fff" opacity=".96"/>';
  var CLOUD='<g transform="translate(0 4)"><ellipse cx="40" cy="40" rx="32" ry="20" fill="#1a1a2e" stroke="#2a2a4e" stroke-width="2"/><ellipse cx="72" cy="34" rx="26" ry="18" fill="#1a1a2e" stroke="#2a2a4e" stroke-width="2"/><ellipse cx="12" cy="36" rx="20" ry="14" fill="#1a1a2e" stroke="#2a2a4e" stroke-width="2"/></g>';
  var MOON='<g transform="translate(0 6)"><circle cx="38" cy="38" r="30" fill="#e6e6fa" stroke="#cfd8dc" stroke-width="2"/><circle cx="30" cy="32" r="5" fill="#f5f5f5" opacity=".8"/><circle cx="46" cy="30" r="3.5" fill="#f5f5f5" opacity=".7"/><circle cx="36" cy="46" r="4" fill="#f5f5f5" opacity=".6"/><circle cx="50" cy="42" r="2.5" fill="#f5f5f5" opacity=".5"/><path d="M16 38Q22 32 28 38" fill="none" stroke="#d0d0d0" stroke-width="1.5" opacity=".7"/></g>';
  var OWL='<g transform="translate(0 4)"><ellipse cx="30" cy="46" rx="16" ry="12" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="30" cy="34" r="9" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="25" cy="30" r="2.2" fill="#fff"/><circle cx="35" cy="30" r="2.2" fill="#fff"/><circle cx="24" cy="29" r="1" fill="#222"/><circle cx="36" cy="29" r="1" fill="#222"/><path d="M27 36l-2 4M33 36l2 4" stroke="#263238" stroke-width="2" stroke-linecap="round"/><path d="M30 38l0 5" stroke="#263238" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="20" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(-25 20 50)"/><ellipse cx="40" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(25 40 50)"/></g>';
  var GROUND='<g transform="translate(0 0)"><path d="M0 20Q100 10 200 20T400 20T600 20T800 20T1000 20V44H0z" fill="#0d0d14" stroke="#1a1a2e" stroke-width="2"/><path d="M0 24Q100 14 200 24T400 24T600 24T800 24T1000 24V44H0z" fill="#0a0a12" stroke="#141420" stroke-width="1.5" opacity=".8"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.7)';c.stroke();
    });
  }
  window.CloudSeason.reg('ni',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?34:46,i;
      var back=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:60%',true);
      k.el('',k.svg('0 0 1000 220',SKY),'left:0;right:0;top:0;height:220px;opacity:1');
      var moonGlow=k.el('','<div style="width:76px;height:76px;border-radius:50%;box-shadow:0 0 40px 16px rgba(230,230,250,.6)"></div>','right:5%;top:'+Math.round(gh*.14)+'px;width:'+(m?50:76)+'px;height:'+(m?50:76)+'px',true);
      k.el('',k.svg('0 0 90 90',MOON),'right:5.5%;top:'+Math.round(gh*.16)+'px;width:'+(m?42:66)+'px;height:'+(m?42:66)+'px;animation:zswob 8s ease-in-out infinite');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 120 70',CLOUD),'left:'+k.rnd(-20,50).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.4,gh*.7))+'px;width:'+(m?120:160)+'px;animation-duration:'+(m?160:220)+'s;animation-delay:'+(-i*28).toFixed(1)+'s;opacity:.85');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.2,26,8,13)+k.hill(1000,gh*2.8,34,10,23)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0a0a14;stroke:#1a1a2e;stroke-width:2;opacity:.98');
      k.el('',k.svg('0 0 1000 40',GROUND),'left:0;right:0;bottom:0;height:40px;opacity:.95');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="8" r="2" fill="#fff" opacity=".85"/><circle cx="18" cy="10" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var owl=k.el('zs-fly',k.svg('0 0 94 84',OWL),'left:3%;bottom:'+Math.round(gh*.48)+'px;width:'+(m?54:88)+'px;animation-duration:'+(m?120:160)+'s;animation-delay:-20s');
      owl.innerHTML='<div>'+owl.innerHTML+'</div>';
      k.hbWatch(function(hb){owl.style.top=(hb+(m?2:10))+'px'});
      if(k.pc()){
        for(i=0;i<10;i++)k.el('zs-shoot','','left:'+k.rnd(4,82).toFixed(1)+'%;top:'+k.rnd(4,44).toFixed(1)+'%;animation-delay:'+(-i*3.6).toFixed(1)+'s;animation-duration:'+(10+i*4.4).toFixed(1)+'s',true);
        for(i=0;i<14;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.9))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4.4).toFixed(1)+'s',true);
        var ss=starSprite(k),st=[],ns=k.n(200),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.5),tw:k.rnd(1.2,4.4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.15});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(ns*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=st[j];
            c.globalAlpha=.18+.82*Math.abs(Math.sin(t*o.tw+o.p));
            if(o.g){
              c.save();c.translate(o.x*w,o.y*h);c.scale(o.z,o.z);
              c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(0,0,16*o.z,0,6.283);c.fill();c.restore();
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
