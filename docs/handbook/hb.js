(function(){
var d=document,h=d.documentElement,main=d.getElementById('cloud');
if(!main)return;
h.classList.add('js');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function qa(sel,root){return [].slice.call((root||d).querySelectorAll(sel))}
var modeBtns=qa('.seg2 button');
function paintMode(){
  var m=h.getAttribute('data-mode');
  modeBtns.forEach(function(b){
    var on=b.getAttribute('data-m')===m;
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function setMode(m){
  h.setAttribute('data-mode',m);
  try{localStorage.setItem('hbmode',m)}catch(e){}
  paintMode();
}
modeBtns.forEach(function(b){b.onclick=function(){setMode(b.getAttribute('data-m'))}});
paintMode();

function reveal(el){
  var w=el.closest('.m-uefi,.m-bios');
  if(w&&getComputedStyle(w).display==='none')setMode(w.classList.contains('m-bios')?'bios':'uefi');
  var p=el.closest('details');
  while(p){p.open=true;p=p.parentElement?p.parentElement.closest('details'):null}
}
function go(el){
  reveal(el);
  el.scrollIntoView({block:'center'});
  el.classList.remove('hf');
  void el.offsetWidth;
  el.classList.add('hf');
  setTimeout(function(){el.classList.remove('hf')},2100);
}
function hashTarget(){
  if(!location.hash)return;
  var el=d.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(!el)return;
  reveal(el);
  el.scrollIntoView();
}
window.addEventListener('hashchange',hashTarget);

qa('h2[id],h3[id]',main).forEach(function(x){
  var a=d.createElement('a');
  a.className='anc';a.href='#'+x.id;a.textContent='#';
  a.setAttribute('aria-label','ссылка на раздел');
  x.appendChild(a);
});

var h2s=qa('h2[id]',main);
h2s.forEach(function(x,i){
  var nav=d.createElement('div');
  nav.className='hbn';
  var pv=h2s[i-1],nx=h2s[i+1];
  function lab(e){return e.textContent.replace(/#$/,'')}
  nav.innerHTML=(pv?'<a href="#'+pv.id+'"><small>назад</small><strong>'+esc(lab(pv))+'</strong></a>':'<span></span>')+(nx?'<a class="nx" href="#'+nx.id+'"><small>дальше</small><strong>'+esc(lab(nx))+'</strong></a>':'');
  var before=nx||main.querySelector('footer');
  main.insertBefore(nav,before);
});

var tocLinks={};
qa('.toc a[href^="#"]').forEach(function(a){tocLinks[a.getAttribute('href').slice(1)]=a});
var curCh=null,busy=false;
function track(){
  busy=false;
  var id=h2s.length?h2s[0].id:null;
  for(var i=0;i<h2s.length;i++){if(h2s[i].getBoundingClientRect().top<=140)id=h2s[i].id}
  if(id===curCh)return;
  curCh=id;
  qa('.toc li.open').forEach(function(li){li.classList.remove('open')});
  var a=tocLinks[id];
  if(a&&a.parentElement)a.parentElement.classList.add('open');
}
window.addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(track)}},{passive:true});
track();
if(window.innerWidth<860){var td=d.querySelector('.toc details');if(td)td.open=false}

var idx=null;
function build(){
  idx=[];
  var s2='',s3='';
  qa('h2,h3,summary,p,li,td,pre',main).forEach(function(el){
    if(el.closest('.hbn'))return;
    var tag=el.tagName;
    var t=el.textContent.replace(/#$/,'').replace(/\s+/g,' ').trim();
    if(!t)return;
    var w=1;
    if(tag==='H2'){s2=t;s3='';w=4}
    else if(tag==='H3'){s3=t;w=3}
    else if(tag==='SUMMARY')w=3;
    var sec=tag==='H2'?'':(s2+(s3?' › '+s3:''));
    var m=el.closest('.m-uefi,.m-bios');
    idx.push({el:el,t:t,l:t.toLowerCase(),w:w,sec:sec,tag:tag,m:m?(m.classList.contains('m-bios')?'bios':'uefi'):''});
  });
}
var sx=null,inp=null,res=null,items=[],sel=0;
function mkModal(){
  sx=d.createElement('div');
  sx.className='sx';sx.hidden=true;
  sx.innerHTML='<div class="sxb" role="dialog" aria-label="поиск"><div class="sxi"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="text" placeholder="поиск по справочнику" autocomplete="off" spellcheck="false"></div><div class="sxr"></div><div class="sxf"><span>↑ ↓ выбрать</span><span>enter открыть</span><span>esc закрыть</span></div></div>';
  d.body.appendChild(sx);
  inp=sx.querySelector('input');
  res=sx.querySelector('.sxr');
  sx.addEventListener('mousedown',function(e){if(e.target===sx)close()});
  inp.addEventListener('input',function(){render(inp.value)});
  res.addEventListener('click',function(e){
    var a=e.target.closest('.sxh');
    if(a)pick(+a.getAttribute('data-i'));
  });
  res.addEventListener('mousemove',function(e){
    var a=e.target.closest('.sxh');
    if(a)mark(+a.getAttribute('data-n'));
  });
}
function mark(n){
  sel=n;
  qa('.sxh',res).forEach(function(a,i){a.classList.toggle('on',i===n)});
  var a=qa('.sxh',res)[n];
  if(a&&a.scrollIntoView)a.scrollIntoView({block:'nearest'});
}
function snip(r,toks){
  var l=r.l,p=-1;
  toks.forEach(function(x){var i=l.indexOf(x);if(i>-1&&(p<0||i<p))p=i});
  if(p<0)p=0;
  var a=Math.max(0,p-50),e=Math.min(r.t.length,p+120);
  var out=esc(r.t.slice(a,e));
  if(toks.length){
    var re=new RegExp('('+toks.map(function(x){return esc(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')','gi');
    out=out.replace(re,'<mark>$1</mark>');
  }
  return (a?'… ':'')+out+(e<r.t.length?' …':'');
}
function render(q){
  if(!idx)build();
  var toks=q.toLowerCase().split(/\s+/).filter(Boolean);
  var list=[];
  if(!toks.length){
    idx.forEach(function(r,i){if(r.tag==='H2')list.push({r:r,i:i})});
  }else{
    var all=toks.join(' ');
    idx.forEach(function(r,i){
      for(var k=0;k<toks.length;k++){if(r.l.indexOf(toks[k])<0)return}
      var s=r.w+(r.l.indexOf(all)>-1?2:0)+(r.l.indexOf(toks[0])===0?1:0);
      list.push({r:r,i:i,s:s});
    });
    list.sort(function(a,b){return b.s-a.s||a.i-b.i});
    list=list.slice(0,40);
  }
  items=list;
  if(!list.length){res.innerHTML='<div class="sxe">ничего не найдено</div>';return}
  res.innerHTML=list.map(function(x,n){
    var r=x.r;
    var head=r.tag==='H2'?'глава':r.sec;
    return '<div class="sxh" data-n="'+n+'" data-i="'+n+'"><b>'+esc(head)+(r.m?'<i>'+r.m+'</i>':'')+'</b><span>'+(toks.length?snip(r,toks):esc(r.t))+'</span></div>';
  }).join('');
  mark(0);
}
function pick(n){
  var x=items[n];
  if(!x)return;
  close();
  go(x.r.el);
  if(x.r.el.id)try{history.replaceState(null,'','#'+x.r.el.id)}catch(e){}
}
function open(){
  if(!sx)mkModal();
  sx.hidden=false;
  h.style.overflow='hidden';
  inp.value='';
  render('');
  inp.focus();
}
function close(){
  if(!sx)return;
  sx.hidden=true;
  h.style.overflow='';
}
d.addEventListener('keydown',function(e){
  var t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();return}
  if(e.key==='/'&&!typing&&!(sx&&!sx.hidden)){e.preventDefault();open();return}
  if(!sx||sx.hidden)return;
  if(e.key==='Escape'){close();return}
  if(e.key==='ArrowDown'){e.preventDefault();if(items.length)mark((sel+1)%items.length);return}
  if(e.key==='ArrowUp'){e.preventDefault();if(items.length)mark((sel-1+items.length)%items.length);return}
  if(e.key==='Enter'){e.preventDefault();pick(sel)}
});
var tsr=d.getElementById('tsr');
if(tsr)tsr.onclick=open;
var hl=d.querySelector('.hl');
if(hl){
  var b=d.createElement('button');
  b.type='button';b.className='gh';b.id='hbsr';
  b.setAttribute('aria-label','поиск по справочнику');
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>поиск</span>';
  b.onclick=open;
  hl.insertBefore(b,hl.firstChild);
}
hashTarget();
})();
