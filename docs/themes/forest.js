(function(){
  var SKY='<rect width="1000" height="220" fill="#8fb3d4"/><circle cx="780" cy="60" r="42" fill="#ffe066" opacity=".95"/><circle cx="795" cy="52" r="10" fill="#fff" opacity=".6"/>';
  var CLOUD='<g transform="translate(0 6)"><ellipse cx="40" cy="42" rx="34" ry="22" fill="#fff" opacity=".9"/><ellipse cx="70" cy="36" rx="28" ry="20" fill="#fff" opacity=".85"/><ellipse cx="14" cy="38" rx="22" ry="16" fill="#fff" opacity=".9"/></g>';
  var TREE='<g transform="translate(0 14)"><path d="M48 126L14 62L82 62z" fill="#1b3a17" stroke="#0d2a10" stroke-width="2.5"/><path d="M48 98L8 42L88 42z" fill="#2d5a27" stroke="#0d2a10" stroke-width="2"/><path d="M48 74L24 18L72 18z" fill="#3a7d33" stroke="#0d2a10" stroke-width="1.8"/><rect x="45" y="124" width="6" height="14" fill="#4e342e"/><ellipse cx="48" cy="140" rx="9" ry="3" fill="#3a2a1e" opacity=".7"/></g>';
  var BUSH='<g transform="translate(0 8)"><ellipse cx="40" cy="38" rx="30" ry="22" fill="#3a7d33" stroke="#1b3a10" stroke-width="2"/><ellipse cx="40" cy="50" rx="24" ry="18" fill="#4caf50" stroke="#1b3a10" stroke-width="1.6"/><rect x="37" y="48" width="6" height="12" fill="#4e342e"/></g>';
  var GRASS='<g><path d="M0 0L6 18L4 0L10 18L8 0L14 18L12 0L18 18L16 0L22 18L20 0L26 18L24 0L30 18L28 0L34 18L32 0L38 18L36 0L42 18L40 0L46 18L44 0L50 18L48 0L54 18L52 0L58 18L56 0L62 18L60 0L66 18L64 0L70 18L68 0L74 18L72 0L78 18L76 0L82 18L80 0L86 18L84 0L90 18L88 0L94 18L92 0L98 18L96 0L1000 18L1000 0z" fill="#4caf50" stroke="#2d5a27" stroke-width="1.5"/><path d="M2 0L8 18L6 0L12 18L10 0L16 18L14 0L20 18L18 0L24 18L22 0L28 18L26 0L32 18L30 0L36 18L34 0L40 18L38 0L44 18L42 0L48 18L46 0L52 18L50 0L56 18L54 0L60 18L58 0L64 18L62 0L68 18L66 0L72 18L70 0L76 18L74 0L80 18L78 0L84 18L82 0L88 18L86 0L92 18L90 0L96 18L94 0L100 18L98 0L104 18L102 0L108 18L106 0L112 18L110 0L116 18L114 0L120 18L118 0L124 18L122 0L128 18L126 0L132 18L130 0L136 18L134 0L140 18L138 0L144 18L142 0L148 18L146 0L150 18L148 0L154 18L152 0L158 18L156 0L162 18L160 0L166 18L164 0L170 18L168 0L174 18L172 0L178 18L176 0L182 18L180 0L186 18L184 0L190 18L188 0L194 18L192 0L198 18L196 0L200 18L198 0L204 18L202 0L208 18L206 0L212 18L210 0L216 18L214 0L220 18L218 0L224 18L222 0L228 18L226 0L232 18L230 0L236 18L234 0L240 18L238 0L244 18L242 0L248 18L246 0L252 18L250 0L256 18L254 0L260 18L258 0L264 18L262 0L268 18L266 0L272 18L270 0L276 18L274 0L280 18L278 0L284 18L282 0L288 18L286 0L292 18L290 0L296 18L294 0L300 18L298 0L304 18L302 0L308 18L306 0L312 18L310 0L316 18L314 0L320 18L318 0L324 18L322 0L328 18L326 0L332 18L330 0L336 18L334 0L340 18L338 0L344 18L342 0L348 18L346 0L352 18L350 0L356 18L354 0L360 18L358 0L364 18L362 0L368 18L366 0L372 18L370 0L376 18L374 0L380 18L378 0L384 18L382 0L388 18L386 0L392 18L390 0L396 18L394 0L400 18L398 0L404 18L402 0L408 18L406 0L412 18L410 0L416 18L414 0L420 18L418 0L424 18L422 0L428 18L426 0L432 18L430 0L436 18L434 0L440 18L438 0L444 18L442 0L448 18L446 0L452 18L450 0L456 18L454 0L460 18L458 0L464 18L462 0L468 18L466 0L472 18L470 0L476 18L474 0L480 18L478 0L484 18L482 0L488 18L486 0L492 18L490 0L496 18L494 0L500 18L498 0L504 18L502 0L508 18L506 0L512 18L510 0L516 18L514 0L520 18L518 0L524 18L522 0L528 18L526 0L532 18L530 0L536 18L534 0L540 18L538 0L544 18L542 0L548 18L546 0L552 18L550 0L556 18L554 0L560 18L558 0L564 18L562 0L568 18L566 0L572 18L570 0L576 18L574 0L580 18L578 0L584 18L582 0L588 18L586 0L592 18L590 0L596 18L594 0L600 18L598 0L604 18L602 0L608 18L606 0L612 18L610 0L616 18L614 0L620 18L618 0L624 18L622 0L628 18L626 0L632 18L630 0L636 18L634 0L640 18L638 0L644 18L642 0L648 18L646 0L652 18L650 0L656 18L654 0L660 18L658 0L664 18L662 0L670 18L668 0L676 18L674 0L680 18L678 0L684 18L682 0L688 18L686 0L692 18L690 0L696 18L694 0L700 18L698 0L704 18L702 0L708 18L706 0L712 18L710 0L716 18L714 0L720 18L718 0L724 18L722 0L728 18L726 0L732 18L730 0L736 18L734 0L740 18L738 0L744 18L742 0L748 18L746 0L752 18L750 0L756 18L754 0L760 18L758 0L764 18L762 0L768 18L766 0L772 18L770 0L776 18L774 0L780 18L778 0L784 18L782 0L788 18L786 0L792 18L790 0L796 18L794 0L800 18L798 0L804 18L802 0L808 18L806 0L812 18L810 0L816 18L814 0L820 18L818 0L824 18L822 0L828 18L826 0L832 18L830 0L836 18L834 0L840 18L838 0L844 18L842 0L848 18L846 0L852 18L850 0L856 18L854 0L860 18L858 0L864 18L862 0L868 18L866 0L872 18L870 0L876 18L874 0L880 18L878 0L884 18L882 0L888 18L886 0L892 18L890 0L896 18L894 0L900 18L898 0L904 18L902 0L908 18L906 0L912 18L910 0L916 18L914 0L920 18L918 0L924 18L922 0L928 18L926 0L932 18L930 0L936 18L934 0L940 18L938 0L944 18L942 0L948 18L946 0L952 18L950 0L956 18L954 0L960 18L958 0L964 18L962 0L968 18L966 0L972 18L970 0L976 18L974 0L980 18L978 0L984 18L982 0L988 18L986 0L992 18L990 0L996 18L994 0L1000 18L1000 0z" fill="#66bb6a" stroke="#2d5a27" stroke-width="1.2" opacity=".9"/></g>';
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
      var m=k.mobile(),wd=k.wide(),gh=m?32:44,i;
      var back=k.el('','<div class="zs-fog"></div><div class="zs-fog2"></div>','left:0;right:0;bottom:0;height:'+(m?110:150)+'px',true);
      k.hbWatch(function(hb){back.style.top=(hb-16)+'px'});
      k.el('',k.svg('0 0 1000 220',SKY),'left:0;right:0;top:0;height:220px;opacity:1');
      for(i=0;i<(m?2:4);i++)k.el('zs-cloud',k.svg('0 0 120 76',CLOUD),'left:'+k.rnd(-20,60).toFixed(1)+'%;top:'+Math.round(k.rnd(gh*.35,gh*.65))+'px;width:'+(m?110:150)+'px;animation-duration:'+(m?150:200)+'s;animation-delay:'+(-i*24).toFixed(1)+'s;opacity:.9');
      k.el('',k.svg('0 0 1000 '+gh,k.hill(1000,gh*2.0,26,8,11)+k.hill(1000,gh*2.6,34,10,21)),'left:0;right:0;bottom:0;height:'+gh+'px;opacity:.98');
      k.el('',k.svg('0 0 1000 28',GRASS),'left:0;right:0;bottom:0;height:28px');
      for(i=0;i<(m?3:6);i++)k.el('zs-brn',k.svg('0 0 110 140',TREE),'left:'+k.rnd(-8,24).toFixed(1)+'%;bottom:'+Math.round(gh*.3)+'px;width:'+(m?44:72)+'px;animation-delay:'+(-i*.8).toFixed(2)+'s');
      for(i=0;i<(m?2:4);i++)k.el('zs-bob zs-brn',k.svg('0 0 90 90',BUSH),'left:'+k.rnd(30,90).toFixed(1)+'%;bottom:'+Math.round(gh*.38)+'px;width:'+(m?34:56)+'px;animation-delay:'+(-i*.6).toFixed(2)+'s');
      k.logo(function(cd){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40" style="display:block;overflow:visible"><path d="'+cd+'" fill="#4caf50" stroke="#2d5a27" stroke-width="1.4"/><circle cx="14" cy="10" r="2.5" fill="#d84315"/><circle cx="20" cy="12" r="2" fill="#d84315"/></svg>'},0,0,0,{fit:true});
      var sq=k.el('zs-fly',k.svg('0 0 120 110',SQUIR),'left:2%;bottom:'+Math.round(gh*.42)+'px;width:'+(m?56:90)+'px;animation-duration:'+(m?110:140)+'s;animation-delay:-28s');
      sq.innerHTML='<div>'+sq.innerHTML+'</div>';
      k.hbWatch(function(hb){sq.style.top=(hb+(m?4:12))+'px'});
      var br=k.el('zs-fly',k.svg('0 0 90 70',BIRD),'right:4%;bottom:'+Math.round(gh*.5)+'px;width:'+(m?46:74)+'px;animation-duration:'+(m?100:130)+'s;animation-delay:-42s');
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
