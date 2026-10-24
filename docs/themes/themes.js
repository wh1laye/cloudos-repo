(function(){
var d=document,h=d.documentElement,sc=d.currentScript;
var BASE=sc?sc.src.replace(/themes\.js.*$/,''):'';
var FILES={ny:'newyear',hw:'halloween',su:'summer',sp:'spring'};
var NAMES=[['off','выкл'],['auto','авто'],['ny','новый год'],['hw','хэллоуин'],['su','лето'],['sp','весна']];
var FXN=[['full','полные'],['low','лёгкие'],['off','выкл']];
var M={},cur=null,root=null,back=null,frames=[],rsz=[],logos=[],raf=0,last=0,token=0;
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
function loop(t){
  raf=requestAnimationFrame(loop);
  var dt=Math.min(.05,(t-last)/1000||0),i;
  last=t;
  for(i=0;i<frames.length;i++)frames[i](dt,t/1000);
}
function start(){if(!raf&&fx()!=='off'){last=performance.now();raf=requestAnimationFrame(loop)}}
function stop(){if(raf)cancelAnimationFrame(raf);raf=0}
function destroy(){
  stop();frames=[];rsz=[];
  if(root)root.textContent='';
  if(back)back.textContent='';
  logos=[];
  h.removeAttribute('data-season');h.classList.remove('zs-still');
  cur=null;
}
function ctx(){
  var still=fx()==='off',sc=fx()==='low'?.4:1;
  function hb(){var e=d.querySelector('.top');return e?Math.round(e.getBoundingClientRect().bottom):54}
  var c={root:root,still:still,scale:sc,
    rnd:function(a,b){return a+Math.random()*(b-a)},
    W:function(){return innerWidth},H:function(){return innerHeight},
    mobile:function(){return innerWidth<640},
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
    strip:function(h,layers){
      var o='',i;
      for(i=0;i<layers.length;i++){var L=layers[i];o+='<path d="'+L.d+'V'+h+'H0z" fill="'+L.fill+'"/><path d="'+L.d+'" fill="none" stroke="'+L.line+'" stroke-width="'+(L.w||3)+'" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'}
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 '+h+'" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible">'+o+'</svg>';
    },
    onResize:function(f){rsz.push(f);f()},
    logo:function(html,ox,oy,w){
      var e=d.createElement('div');e.className='zso zsl';e.innerHTML=html;e.style.width=w+'px';root.appendChild(e);
      function pos(){
        var s=d.querySelector('.brand svg');if(!s){e.style.display='none';return}
        var r=s.getBoundingClientRect();e.style.display='';e.style.left=(r.left+ox*r.width)+'px';e.style.top=(r.top+oy*r.height)+'px';
      }
      rsz.push(pos);pos();
    },
    canvas:function(draw,bk){
      var cv=d.createElement('canvas'),cx=cv.getContext?cv.getContext('2d'):null;
      if(!cx)return null;
      cv.className='zsc';(bk?back:root).appendChild(cv);
      var w=0,hh=0;
      function fit(){
        var dpr=Math.min(2,window.devicePixelRatio||1);
        w=innerWidth;hh=innerHeight;cv.width=w*dpr;cv.height=hh*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
      }
      fit();rsz.push(fit);
      var f=function(dt,t){cx.clearRect(0,0,w,hh);draw(cx,dt,t,w,hh)};
      if(still)f(0,0);else frames.push(f);
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
    cur=id;
    M[id].init(ctx());
    start();
  }
  if(M[id]){go();return}
  var s=d.createElement('script');
  s.src=BASE+FILES[id]+'.js?v=2';s.onload=go;d.head.appendChild(s);
}
function apply(){
  destroy();
  var r=resolved();
  if(!root){root=d.createElement('div');root.className='zs';root.setAttribute('aria-hidden','true');d.body.appendChild(root);back=d.createElement('div');back.className='zsb';back.setAttribute('aria-hidden','true');d.body.appendChild(back)}
  if(r==='off')return;
  mount(r);
}
var rt=0;
window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){rsz.forEach(function(f){f()})},150)});
function mark(){
  [].forEach.call(d.querySelectorAll('[data-zs]'),function(b){b.classList.toggle('on',b.getAttribute('data-zs')===season())});
  [].forEach.call(d.querySelectorAll('[data-zsf]'),function(b){b.classList.toggle('on',b.getAttribute('data-zsf')===fx())});
}
function ui(){
  if(!d.querySelector('.sp'))return;
  var spb=d.querySelector('.sp .spb')||d.querySelector('.sp');
  if(spb.querySelector('.zss'))return;
  var first=spb.querySelector('.sps'),s=d.createElement('div');
  s.className='sps zss';
  s.innerHTML='<h4>сезонные темы</h4><div class="zsg">'+NAMES.map(function(n){return '<button type="button" data-zs="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div><p class="spm">анимации</p><div class="zsg">'+FXN.map(function(n){return '<button type="button" data-zsf="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div>';
  if(first&&first.nextSibling)spb.insertBefore(s,first.nextSibling);else spb.appendChild(s);
  mark();
}
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-zs],[data-zsf]'):null;
  if(!b)return;
  if(b.hasAttribute('data-zs'))ls('season',b.getAttribute('data-zs'));
  else ls('seasonfx',b.getAttribute('data-zsf'));
  apply();mark();
});
var T={'сезонные темы':'seasonal themes','выкл':'off','авто':'auto','новый год':'new year','хэллоуин':'halloween','лето':'summer','весна':'spring','анимации':'animations','полные':'full','лёгкие':'light'};
function dict(){if(window.I18N&&window.I18N.add)window.I18N.add(T);else{window.I18N_EXTRA=window.I18N_EXTRA||{};for(var k in T)window.I18N_EXTRA[k]=T[k]}}
dict();
var lk=d.createElement('link');lk.rel='stylesheet';lk.href=BASE+'themes.css?v=2';d.head.appendChild(lk);
window.CloudSeason={reg:function(id,m){M[id]=m},get:season,set:function(s){ls('season',s);apply();mark()},apply:apply};
function boot(){
  new MutationObserver(function(){ui()}).observe(d.body,{childList:true,subtree:true});
  ui();apply();
}
if(d.body)boot();else d.addEventListener('DOMContentLoaded',boot);
})();
