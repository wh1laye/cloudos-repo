(function(){
var d=document,h=d.documentElement,K='fun',SC=d.currentScript,BASE=SC&&SC.src?SC.src.replace(/fun\.js.*$/,''):'';
var DEF={trail:0,pop:0,crt:0,mono:0,bar:0,snd:0,rb:0,rad:1};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function get(){
  var o={},k;
  try{o=JSON.parse(ls(K))||{}}catch(e){}
  for(k in DEF)if(typeof o[k]!=='number')o[k]=DEF[k];
  if(!(o.rad>=0&&o.rad<=2))o.rad=1;
  return o;
}
var S=get();
function save(){ls(K,JSON.stringify(S))}
function en(){var l=ls('lang');if(l==='ru'||l==='en')return l==='en';return !/^(ru|uk|be|kk)/.test((navigator.language||'ru').toLowerCase())}
var TX={'фишки':'extras','след за курсором':'cursor trail','конфетти по клику':'click confetti','crt-экран':'crt screen','моно-шрифт везде':'mono font everywhere','полоса прокрутки сверху':'top scroll bar','звук кликов':'click sounds','радужный режим':'rainbow mode','углы':'corners','острые':'sharp','обычные':'normal','круглые':'round','сбросить фишки':'reset extras','доступ root получен':'root access granted'};
function t(s){return en()&&TX[s]?TX[s]:s}
var R='.btn,.feat,.card,.links a,.flow a,.term,pre,.sps,.sgm button,.zsg button,.spx,.ddm,.gh';
var st=d.createElement('style');
st.textContent='html[data-crt] body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9998;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px),radial-gradient(ellipse at center,transparent 58%,rgba(0,0,0,.38));animation:fcrt 5s infinite}'
+'@keyframes fcrt{0%,100%{opacity:.92}50%{opacity:1}93%{opacity:.78}}'
+'html[data-mono] body,html[data-mono] button,html[data-mono] input{font-family:var(--mono,monospace)!important}'
+'html[data-rad="0"] :is('+R+'){border-radius:0!important}'
+'html[data-rad="2"] :is('+R+'){border-radius:22px!important}'
+'html[data-rbw]{animation:frbw 14s linear infinite}'
+'@keyframes frbw{from{filter:hue-rotate(0)}to{filter:hue-rotate(360deg)}}'
+'@media(prefers-reduced-motion:reduce){html[data-rbw]{animation:none}html[data-crt] body::after{animation:none}}'
+'.fbar{position:fixed;top:0;left:0;height:3px;width:0;z-index:9997;background:var(--abg,var(--ac));pointer-events:none}'
+'.fcv{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9996}'
+'.ftoast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;padding:12px 18px;border:1px solid var(--ac);border-radius:12px;background:var(--bg);color:var(--ink);font:14px var(--mono,monospace);box-shadow:0 8px 30px rgba(0,0,0,.35)}';
d.head.appendChild(st);
var cv=null,cx=null,P=[],raf=0,col='#3563c9',ct=0,lt=0,bar=null,lm=0,ac=null;
function accent(){var n=performance.now(),v;if(n-ct>800){ct=n;v=getComputedStyle(h).getPropertyValue('--ac').trim();if(v)col=v}return col}
function fit(){if(cv){cv.width=innerWidth;cv.height=innerHeight}}
function ensure(){if(cv||!d.body)return;cv=d.createElement('canvas');cv.className='fcv';cv.setAttribute('aria-hidden','true');d.body.appendChild(cv);cx=cv.getContext('2d');fit()}
addEventListener('resize',fit);
function spawn(x,y,n,kind){
  var i,a,s,c=kind==='c';
  ensure();if(!cx)return;
  for(i=0;i<n;i++){
    a=Math.random()*6.283;s=c?80+Math.random()*260:10+Math.random()*50;
    P.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(c?120:0),l:1,d:c?.9+Math.random()*.6:1.4+Math.random()*1.1,r:c?2+Math.random()*3:1+Math.random()*2.2,c:c?'hsl('+Math.floor(Math.random()*360)+',90%,60%)':accent(),g:c?420:30});
  }
  if(P.length>400)P.splice(0,P.length-400);
  if(!raf){lt=performance.now();raf=requestAnimationFrame(step)}
}
function step(n){
  var dt=Math.min(.05,(n-lt)/1000),i,p;
  raf=0;lt=n;
  cx.clearRect(0,0,cv.width,cv.height);
  for(i=P.length-1;i>=0;i--){
    p=P[i];p.l-=dt/p.d;
    if(p.l<=0){P.splice(i,1);continue}
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    cx.globalAlpha=Math.max(0,p.l);cx.fillStyle=p.c;cx.fillRect(p.x-p.r/2,p.y-p.r/2,p.r,p.r);
  }
  cx.globalAlpha=1;
  if(P.length)raf=requestAnimationFrame(step);
}
function tick(){
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    var o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;
    o.type='square';o.frequency.value=520+Math.random()*180;
    g.gain.setValueAtTime(.03,n);g.gain.exponentialRampToValueAtTime(.0001,n+.06);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(n+.07);
  }catch(e){}
}
function prog(){
  if(!bar)return;
  var m=d.documentElement.scrollHeight-innerHeight;
  bar.style.width=(m>0?Math.min(100,scrollY/m*100):0)+'%';
}
addEventListener('scroll',prog,{passive:true});
addEventListener('pointermove',function(e){
  if(!S.trail)return;
  var n=performance.now();
  if(n-lm<24)return;
  lm=n;spawn(e.clientX,e.clientY,2,'t');
},{passive:true});
d.addEventListener('click',function(e){
  if(S.pop&&e.clientX!=null)spawn(e.clientX,e.clientY,22,'c');
  if(S.snd)tick();
});
function toast(s){
  var e=d.createElement('div');e.className='ftoast';e.textContent=s;d.body.appendChild(e);
  setTimeout(function(){e.remove()},3200);
}
var WD='cloudos',wi=0,wt=0;
function secret(){
  var first=ls('sec')!=='1';
  ls('sec','1');
  if(window.CloudTheme&&window.CloudTheme.unlock)window.CloudTheme.unlock();
  toast('root@cloudos:~# '+t('доступ root получен'));
  h.setAttribute('data-rbw','1');
  spawn(innerWidth/2,innerHeight/2,160,'c');
  setTimeout(apply,6000);
  function go(){if(window.CloudSecret)window.CloudSecret.open(first)}
  if(window.CloudSecret){go();return}
  var s=d.createElement('script');s.src=BASE+'secret.js?v=1';s.onload=go;d.head.appendChild(s);
}
d.addEventListener('keydown',function(e){
  var el=e.target,tg=el&&el.tagName,c,n;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT'||(el&&el.isContentEditable))return;
  c=(e.code||'').indexOf('Key')===0?e.code.slice(3).toLowerCase():(e.key&&e.key.length===1?e.key.toLowerCase():'');
  if(!c)return;
  n=performance.now();if(n-wt>2500)wi=0;wt=n;
  if(c===WD.charAt(wi)){wi++;if(wi===WD.length){wi=0;secret()}}else wi=c===WD.charAt(0)?1:0;
});
function apply(){
  if(S.crt)h.setAttribute('data-crt','1');else h.removeAttribute('data-crt');
  if(S.mono)h.setAttribute('data-mono','1');else h.removeAttribute('data-mono');
  if(S.rb)h.setAttribute('data-rbw','1');else h.removeAttribute('data-rbw');
  if(S.rad!==1)h.setAttribute('data-rad',String(S.rad));else h.removeAttribute('data-rad');
  if(S.bar&&d.body){
    if(!bar){bar=d.createElement('div');bar.className='fbar';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar)}
    prog();
  }else if(bar){bar.remove();bar=null}
}
var ROWS=[['trail','след за курсором'],['pop','конфетти по клику'],['crt','crt-экран'],['mono','моно-шрифт везде'],['bar','полоса прокрутки сверху'],['snd','звук кликов'],['rb','радужный режим']];
var RAD=[[0,'острые'],[1,'обычные'],[2,'круглые']];
function mark(){
  [].forEach.call(d.querySelectorAll('[data-fn]'),function(b){b.checked=!!S[b.getAttribute('data-fn')]});
  [].forEach.call(d.querySelectorAll('[data-fr]'),function(b){b.classList.toggle('on',+b.getAttribute('data-fr')===S.rad)});
}
function ui(){
  var spb=d.querySelector('.sp .spb');
  if(!spb||spb.querySelector('.fns'))return;
  var s=d.createElement('div');
  s.className='sps fns';
  s.innerHTML='<h4>'+t('фишки')+'</h4>'
    +ROWS.map(function(r){return '<label class="spc"><input type="checkbox" data-fn="'+r[0]+'"><span>'+t(r[1])+'</span></label>'}).join('')
    +'<p class="spm">'+t('углы')+'</p><div class="zsg">'+RAD.map(function(r){return '<button type="button" data-fr="'+r[0]+'">'+t(r[1])+'</button>'}).join('')+'</div>'
    +'<button type="button" class="spq" data-fr="x">'+t('сбросить фишки')+'</button>';
  spb.appendChild(s);
  mark();
}
d.addEventListener('change',function(e){
  var n=e.target,k=n&&n.getAttribute&&n.getAttribute('data-fn');
  if(!k||!(k in DEF))return;
  S[k]=n.checked?1:0;save();apply();
  if(k==='snd'&&S.snd)tick();
});
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-fr]'):null,v;
  if(!b)return;
  v=b.getAttribute('data-fr');
  if(v==='x'){S=JSON.parse(JSON.stringify(DEF))}
  else S.rad=+v;
  save();apply();mark();
});
function boot(){
  apply();
  new MutationObserver(ui).observe(d.body,{childList:true,subtree:true});
  ui();
}
if(d.body)boot();else d.addEventListener('DOMContentLoaded',boot);
})();
