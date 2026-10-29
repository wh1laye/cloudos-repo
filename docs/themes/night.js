(function(){
  var STAR='<circle cx="0" cy="0" r="1.6" fill="#fff"/><path d="M0 -4l1.2 1.7 4 0.6l-2.9 2.1l0.6 4l-2.9 -2.1l4 -0.6z" fill="#fff" opacity=".9"/>';
  var PLANET='<g transform="translate(0 6)"><circle cx="40" cy="44" r="34" fill="#2c3e50" stroke="#455a64" stroke-width="2.5"/><circle cx="30" cy="36" r="8" fill="#546e7a" opacity=".7"/><circle cx="52" cy="48" r="5" fill="#546e7a" opacity=".6"/><circle cx="38" cy="52" r="4" fill="#546e7a" opacity=".5"/><ellipse cx="40" cy="78" rx="34" ry="6" fill="rgba(44,62,80,.35)"/></g>';
  var MOON='<g transform="translate(0 8)"><circle cx="44" cy="44" r="30" fill="#fff" stroke="#e0e0e0" stroke-width="2"/><circle cx="34" cy="36" r="5" fill="#eee" opacity=".8"/><circle cx="52" cy="34" r="3.5" fill="#eee" opacity=".7"/><circle cx="40" cy="52" r="4" fill="#eee" opacity=".6"/><circle cx="56" cy="48" r="2.5" fill="#eee" opacity=".5"/><path d="M20 44Q26 36 32 44" fill="none" stroke="#d0d0d0" stroke-width="1.5" opacity=".7"/></g>';
  var CLOUD='<path d="M20 46H78A22 22 0 0 0 82 18 26 26 0 0 0 40 22 18 18 0 0 0 20 46z" fill="#2a2a4e" stroke="#454a70" stroke-width="3" stroke-linejoin="round"/><path d="M28 36Q42 30 56 36" fill="none" stroke="#5c5c90" stroke-width="3" stroke-linecap="round"/>';
  var OWL='<g transform="translate(0 4)"><ellipse cx="30" cy="46" rx="16" ry="12" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="30" cy="34" r="9" fill="#37474f" stroke="#263238" stroke-width="1.6"/><circle cx="25" cy="30" r="2.2" fill="#fff"/><circle cx="35" cy="30" r="2.2" fill="#fff"/><circle cx="24" cy="29" r="1" fill="#222"/><circle cx="36" cy="29" r="1" fill="#222"/><path d="M27 36l-2 4M33 36l2 4" stroke="#263238" stroke-width="2" stroke-linecap="round"/><path d="M30 38l0 5" stroke="#263238" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="20" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(-25 20 50)"/><ellipse cx="40" cy="50" rx="4" ry="10" fill="#37474f" stroke="#263238" stroke-width="1.2" transform="rotate(25 40 50)"/></g>';
  function starSprite(k){
    return k.sprite(10,10,function(c){
      c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,6.283);c.fill();
      c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.6)';c.stroke();
    });
  }
  function glowSprite(k,s){
    return k.sprite(s,s,function(c){
      var g=c.createRadialGradient(0,0,0,0,0,s/2);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(180,200,255,.4)');g.addColorStop(1,'rgba(180,200,255,0)');
      c.fillStyle=g;c.beginPath();c.arc(0,0,s/2,0,6.283);c.fill();
    });
  }
  window.CloudSeason.reg('ni',{
    init:function(k){
      var m=k.mobile(),wd=k.wide(),gh=m?34:46,i;
      var sky=k.el('','<div class="zs-aur"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div>','left:0;top:0;width:100%;height:55%',true);
      k.el('zs-moon','<div style="width:70px;height:70px;border-radius:50%;box-shadow:0 0 34px 10px rgba(255,248,180,.55)"></div>','right:6%;top:'+Math.round(gh*.18)+'px;width:'+(m?46:70)+'px;height:'+(m?46:70)+'px');
      k.el('',k.svg('0 0 100 70',MOON),'right:6.5%;top:'+Math.round(gh*.2)+'px;width:'+(m?40:62)+'px;animation:zswob 7s ease-in-out infinite');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 110 70',CLOUD),'left:'+k.rnd(-20,40).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.35,gh*.7))+'px;width:'+(m?110:170)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*25).toFixed(1)+'s;opacity:.85');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.2,24,7,9)+k.hill(1000,gh*2.8,32,9,17)),'left:0;right:0;bottom:0;height:'+gh+'px;fill:#0a0a12;stroke:#1a1a2e;stroke-width:2;opacity:.95');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#bb86fc" stroke="#9370db" stroke-width="1.2"/><circle cx="12" cy="8" r="2" fill="#fff" opacity=".8"/><circle cx="18" cy="10" r="1.5" fill="#fff" opacity=".7"/></svg>'},0,0,0,{fit:true});
      var owl=k.el('zs-fly',k.svg('0 0 90 80',OWL),'left:3%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?50:80)+'px;animation-duration:'+(m?120:150)+'s;animation-delay:-15s');
      owl.innerHTML='<div>'+owl.innerHTML+'</div>';
      k.hbWatch(function(hb){owl.style.top=(hb+(m?2:6))+'px'});
      if(k.pc()){
        for(i=0;i<10;i++)k.el('zs-shoot','','left:'+k.rnd(5,80).toFixed(1)+'%;top:'+k.rnd(4,40).toFixed(1)+'%;animation-delay:'+(-i*3.2).toFixed(1)+'s;animation-duration:'+(10+i*4).toFixed(1)+'s',true);
        for(i=0;i<12;i++)k.el('zs-glint','','left:'+k.rnd(2,98).toFixed(1)+'%;bottom:'+Math.round(k.rnd(gh*.2,gh*.85))+'px;animation-delay:'+(-k.rnd(0,3)).toFixed(2)+'s;animation-duration:'+k.rnd(2,4).toFixed(1)+'s',true);
        var ss=starSprite(k),gs=glowSprite(k,46),st=[],ns=k.n(150),s0;
        for(s0=0;s0<ns;s0++)st.push({x:Math.random(),y:Math.random(),z:k.rnd(.5,1.3),tw:k.rnd(1.4,4),p:k.rnd(0,6.28),ph:k.rnd(0,6.28),g:Math.random()<.12});
        k.canvas(function(c,dt,t,w,h){
          var cnt=Math.ceil(ns*k.q()),j,o;
          for(j=0;j<cnt;j++){
            o=st[j];
            c.globalAlpha=.25+.75*Math.abs(Math.sin(t*o.tw+o.p));
            if(o.g){
              c.save();c.translate(o.x*w,o.y*h);c.scale(o.z,o.z);
              c.drawImage(gs.c,-gs.w/2,-gs.h/2,gs.w,gs.h);c.restore();
            }else{
              k.put(c,ss,o.x*w+Math.sin(t*1.3+o.ph)*3,o.y*h,o.z,0);
            }
          }
          c.globalAlpha=1;
        },true,24);
      }
    }
  });
})();
