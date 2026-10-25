(function(){
var d=document,h=d.documentElement,sc=d.currentScript;
var BASE=sc?sc.src.replace(/themes\.js.*$/,''):'';
var V='4';
var FILES={ny:'newyear',hw:'halloween',su:'summer',sp:'spring'};
var NAMES=[['off','выкл'],['auto','авто'],['ny','новый год'],['hw','хэллоуин'],['su','лето'],['sp','весна']];
var FXN=[['full','полные'],['low','лёгкие'],['off','выкл']];
var DEVN=[['auto','авто'],['pc','компьютер'],['phone','телефон']];
var M={},root=null,back=null,frames=[],rsz=[],obs=[],raf=0,last=0,token=0,q=1,ema=0,jank=16,nf=0;
var MQ=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function season(){var s=ls('season');return s&&(s==='auto'||FILES[s])?s:'off'}
function fx(){var f=ls('seasonfx');if(f==='full'||f==='low'||f==='off')return f;return MQ&&MQ.matches?'off':'full'}
function autoSeason(){
  var t=new Date(),m=t.getMonth()+1,dd=t.getDate();
  if((m===12&&dd>=10)||(m===1&&dd<=14))return 'ny';
  if((m===10&&dd>=15)||(m===11&&dd<=2))return 'hw';
  if(m>=6&&m<=8)return 'su';
  if((m===3&&dd>=15)||m===4||m===5)return 'sp';
  return 'off';
}
function resolved(){var s=season();return s==='auto'?autoSeason():s}
function dev(){var v=ls('seasondev');return v==='pc'||v==='phone'?v:'auto'}
function phone(){
  var v=dev();
  if(v==='pc')return false;
  if(v==='phone')return true;
  var ua=navigator.userAgent||'',mm=window.matchMedia,coarse=!!(mm&&mm('(pointer:coarse)').matches&&!mm('(hover:hover)').matches);
  if(/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua)||coarse||(navigator.maxTouchPoints>1&&/Mac/.test(ua)))return true;
  if(innerWidth<700)return true;
  var mem=navigator.deviceMemory,cpu=navigator.hardwareConcurrency;
  return !!((mem&&mem<=2)||(cpu&&cpu<=2));
}
function rich(){return fx()==='full'&&!phone()}
function DPR(){return Math.min(rich()?2:1,window.devicePixelRatio||1)}
function loop(t){
  raf=requestAnimationFrame(loop);
  var gap=t-last;last=t;
  if(gap>250||d.hidden)return;
  var dt=Math.min(.05,gap/1000),t0=performance.now(),i;
  for(i=0;i<frames.length;i++)frames[i](dt,t/1000);
  var cost=performance.now()-t0;
  ema=ema*.92+cost*.08;jank=jank*.92+gap*.08;nf++;
  if(nf>50&&nf%40===0&&q>.2&&(ema>4.5||jank>33)){q=Math.max(.2,q*.7);ls('seasonq',String(q.toFixed(2)))}
}
function start(){if(!raf&&fx()!=='off'){last=performance.now();raf=requestAnimationFrame(loop)}}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
function destroy(){
  stop();frames=[];rsz=[];
  obs.forEach(function(o){try{o.disconnect()}catch(e){}});obs=[];
  if(root)root.textContent='';
  if(back)back.textContent='';
  [].forEach.call(d.querySelectorAll('.zsl'),function(n){n.remove()});
  h.removeAttribute('data-season');h.classList.remove('zs-still');
}
function watch(fn,el){
  if(el&&window.ResizeObserver){var o=new ResizeObserver(fn);o.observe(el);obs.push(o)}
}
function ctx(){
  var still=fx()==='off',low=fx()==='low';
  function hb(){var e=d.querySelector('.top');return e?Math.round(e.getBoundingClientRect().bottom):54}
  var c={root:root,still:still,
    q:function(){return q*(low?.45:1)},
    rnd:function(a,b){return a+Math.random()*(b-a)},
    W:function(){return innerWidth},H:function(){return innerHeight},
    mobile:function(){return innerWidth<640},
    pc:function(){return rich()},
    phone:function(){return phone()},
    n:function(b){var s=rich()?1.9:.55;if(innerWidth<640)s*=.6;return Math.max(1,Math.round(b*s))},
    tick:function(f){if(!still)frames.push(f)},
    wide:function(){return innerWidth>=900},
    hb:hb,
    svg:function(vb,inner,w){var p=vb.split(' ');return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+vb+'"'+(w?' width="'+w+'" height="'+Math.round(w*p[3]/p[2])+'"':' width="100%"')+' style="display:block;overflow:visible">'+inner+'</svg>'},
    el:function(cls,html,css,bk){var e=d.createElement('div');e.className='zso '+cls;e.innerHTML=html;if(css)e.style.cssText=css;(bk?back:root).appendChild(e);return e},
    hill:function(vw,y,amp,n,seed){
      var s=seed||3,p='M0 '+y,i;
      function r(){s=(s*9301+49297)%233280;return s/233280}
      for(i=0;i<n;i++){var x1=(i+.5)*vw/n,x2=(i+1)*vw/n,a=amp*(.45+r()*.55);p+='Q'+x1.toFixed(1)+' '+(y-a).toFixed(1)+' '+x2.toFixed(1)+' '+y}
      return p;
    },
    strip:function(hh,layers){
      var o='',i;
      for(i=0;i<layers.length;i++){var L=layers[i];o+='<path d="'+L.d+'V'+hh+'H0z" fill="'+L.fill+'"/><path d="'+L.d+'" fill="none" stroke="'+L.line+'" stroke-width="'+(L.w||3)+'" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'}
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 '+hh+'" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">'+o+'</svg>';
    },
    onResize:function(f){rsz.push(f);f()},
    hbWatch:function(f){function run(){f(hb())}rsz.push(run);run();watch(run,d.querySelector('.top'))},
    logo:function(html,ox,oy,w,o){
      var b=d.querySelector('.brand'),s=b&&b.querySelector('svg');
      if(!b||!s)return;
      var e=d.createElement('b');e.className='zsl';e.innerHTML=html;e.style.width=w+'px';b.appendChild(e);
      var iv=e.querySelector('svg'),vb=((iv&&iv.getAttribute('viewBox'))||'0 0 1 1').split(' '),ratio=vb[3]/vb[2];
      var ax=o&&o.ax!=null?o.ax:0,ay=o&&o.ay!=null?o.ay:0,rot=o&&o.rot||0;
      e.style.transformOrigin=(ax*100)+'% '+(ay*100)+'%';
      if(rot)e.style.transform='rotate('+rot+'deg)';
      function pos(){var r=s.getBoundingClientRect(),br=b.getBoundingClientRect();e.style.left=(r.left-br.left+ox*r.width-ax*w)+'px';e.style.top=(r.top-br.top+oy*r.height-ay*w*ratio)+'px'}
      pos();rsz.push(pos);watch(pos,s);watch(pos,b);setTimeout(pos,400);setTimeout(pos,1500);
    },
    sprite:function(w,hh,fn){
      var S=DPR(),cv=d.createElement('canvas');
      cv.width=Math.ceil(w*S);cv.height=Math.ceil(hh*S);
      var x=cv.getContext('2d');
      if(!x)return {c:cv,w:w,h:hh};
      x.scale(S,S);x.translate(w/2,hh/2);fn(x,w,hh);
      return {c:cv,w:w,h:hh};
    },
    put:function(cx,s,x,y,sc,rot,sx){
      var D=cx.dpr,k=sx==null?1:sx,co=Math.cos(rot||0),si=Math.sin(rot||0);
      cx.setTransform(D*co*sc*k,D*si*sc*k,-D*si*sc,D*co*sc,D*x,D*y);
      cx.drawImage(s.c,-s.w/2,-s.h/2,s.w,s.h);
    },
    canvas:function(draw,bk,fps){
      var cv=d.createElement('canvas'),cx=cv.getContext?cv.getContext('2d'):null;
      if(!cx)return null;
      cv.className='zsc';(bk?back:root).appendChild(cv);
      var w=0,hh=0,dpr=DPR(),acc=0,ff=fps||30,step=1/(rich()?Math.min(60,ff*2):phone()?Math.min(ff,24):ff);
      cx.dpr=dpr;
      function fit(){w=innerWidth;hh=innerHeight;cv.width=Math.ceil(w*dpr);cv.height=Math.ceil(hh*dpr)}
      fit();rsz.push(fit);
      function draw1(dt,t){cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,w,hh);draw(cx,dt,t,w,hh)}
      if(still)draw1(.016,0);
      else frames.push(function(dt,t){acc+=dt;if(acc<step*.97)return;var a=acc;acc=0;draw1(a,t)});
      return cv;
    }
  };
  return c;
}
function mount(id){
  var my=++token;
  function go(){
    if(my!==token||!M[id])return;
    h.setAttribute('data-season',id);
    if(fx()==='off')h.classList.add('zs-still');
    var sq=parseFloat(ls('seasonq'));
    if(sq>=.2&&sq<=1)q=sq;
    M[id].init(ctx());
    start();
  }
  if(M[id]){go();return}
  var s=d.createElement('script');
  s.src=BASE+FILES[id]+'.js?v='+V;s.onload=go;d.head.appendChild(s);
}
function apply(){
  destroy();
  var r=resolved();
  if(!root){
    root=d.createElement('div');root.className='zs';root.setAttribute('aria-hidden','true');d.body.appendChild(root);
    back=d.createElement('div');back.className='zsb';back.setAttribute('aria-hidden','true');d.body.appendChild(back);
  }
  if(r==='off')return;
  ema=0;nf=0;jank=16;
  mount(r);
}
var rt=0;
window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){rsz.forEach(function(f){f()})},120)});
function mark(){
  [].forEach.call(d.querySelectorAll('[data-zs]'),function(b){b.classList.toggle('on',b.getAttribute('data-zs')===season())});
  [].forEach.call(d.querySelectorAll('[data-zsf]'),function(b){b.classList.toggle('on',b.getAttribute('data-zsf')===fx())});
  [].forEach.call(d.querySelectorAll('[data-zsd]'),function(b){b.classList.toggle('on',b.getAttribute('data-zsd')===dev())});
}
function ui(){
  if(!d.querySelector('.sp'))return;
  var spb=d.querySelector('.sp .spb')||d.querySelector('.sp');
  if(spb.querySelector('.zss'))return;
  var first=spb.querySelector('.sps'),s=d.createElement('div');
  s.className='sps zss';
  s.innerHTML='<h4>сезонные темы</h4><div class="zsg">'+NAMES.map(function(n){return '<button type="button" data-zs="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div><p class="spm">анимации</p><div class="zsg">'+FXN.map(function(n){return '<button type="button" data-zsf="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div><p class="spm">устройство</p><div class="zsg">'+DEVN.map(function(n){return '<button type="button" data-zsd="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div><p class="zsn">компьютер — сложные эффекты, телефон — лёгкие. авто выбирает сам</p>';
  if(first&&first.nextSibling)spb.insertBefore(s,first.nextSibling);else spb.appendChild(s);
  mark();
}
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-zs],[data-zsf],[data-zsd]'):null;
  if(!b)return;
  if(b.hasAttribute('data-zs'))ls('season',b.getAttribute('data-zs'));
  else if(b.hasAttribute('data-zsd')){ls('seasondev',b.getAttribute('data-zsd'));q=1;ls('seasonq','1')}
  else{ls('seasonfx',b.getAttribute('data-zsf'));q=1;ls('seasonq','1')}
  apply();mark();
});
var T={'сезонные темы':'seasonal themes','выкл':'off','авто':'auto','новый год':'new year','хэллоуин':'halloween','лето':'summer','весна':'spring','анимации':'animations','полные':'full','лёгкие':'light','устройство':'device','компьютер':'computer','телефон':'phone','компьютер — сложные эффекты, телефон — лёгкие. авто выбирает сам':'computer — complex effects, phone — light ones. auto picks by itself'};
function dict(){if(window.I18N&&window.I18N.add)window.I18N.add(T);else{window.I18N_EXTRA=window.I18N_EXTRA||{};for(var k in T)window.I18N_EXTRA[k]=T[k]}}
dict();
var lk=d.createElement('link');lk.rel='stylesheet';lk.href=BASE+'themes.css?v='+V;d.head.appendChild(lk);
window.CloudSeason={reg:function(id,m){M[id]=m},get:season,set:function(s){ls('season',s);apply();mark()},apply:apply,stats:function(){return {q:q,cost:ema,gap:jank,frames:nf}}};
function boot(){
  new MutationObserver(function(){ui()}).observe(d.body,{childList:true,subtree:true});
  ui();apply();
}
if(d.body)boot();else d.addEventListener('DOMContentLoaded',boot);
})();
