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

var DONE=[];
try{DONE=JSON.parse(localStorage.getItem('hbdone')||'[]')}catch(e){}
if(!Array.isArray(DONE))DONE=[];
function saveDone(){try{localStorage.setItem('hbdone',JSON.stringify(DONE))}catch(e){}}
var chs=h2s.slice(0,13);
var ftr=main.querySelector('footer');
var dbtn={},progBox=null;
function paintDone(){
  var n=0;
  chs.forEach(function(c){
    var on=DONE.indexOf(c.id)>-1;
    if(on)n++;
    var b=dbtn[c.id];
    if(b){b.classList.toggle('on',on);b.textContent=on?'пройдена':'отметить как пройденную';b.setAttribute('aria-pressed',on?'true':'false')}
    var a=tocLinks[c.id];
    if(a&&a.parentElement)a.parentElement.classList.toggle('done',on);
  });
  if(progBox){
    progBox.querySelector('em').textContent=n+' / '+chs.length;
    progBox.querySelector('b').style.width=(chs.length?Math.round(n*100/chs.length):0)+'%';
  }
}
chs.forEach(function(c,i){
  var nxt=h2s[i+1]||ftr;
  var nav=nxt?nxt.previousElementSibling:null;
  var box=d.createElement('div');
  box.className='hbd2';
  var b=d.createElement('button');
  b.type='button';b.className='btn s';
  b.onclick=function(){
    var k=DONE.indexOf(c.id);
    if(k>-1)DONE.splice(k,1);else DONE.push(c.id);
    saveDone();paintDone();
  };
  box.appendChild(b);
  dbtn[c.id]=b;
  main.insertBefore(box,nav&&nav.classList.contains('hbn')?nav:nxt);
});
var tocOl=d.querySelector('.toc ol,.toc ul');
if(tocOl&&chs.length){
  progBox=d.createElement('div');
  progBox.className='hbp';
  progBox.innerHTML='<span>пройдено</span><em></em><i><b></b></i>';
  tocOl.parentNode.insertBefore(progBox,tocOl);
}
paintDone();
window.addEventListener('storage',function(e){
  if(e.key==='hbdone'){try{DONE=JSON.parse(e.newValue||'[]')}catch(x){DONE=[]}paintDone()}
});

var VK='hbv2',V={boot:'',root:'',swap:'',kver:'',tz:''};
try{var vv=JSON.parse(localStorage.getItem(VK)||'{}');for(var vk in V)if(typeof vv[vk]==='string')V[vk]=vv[vk]}catch(e){}
function partInfo(x){
  x=(x||'').trim().replace(/^\/dev\//,'');
  if(!x)return null;
  var m=x.match(/^((?:nvme\d+n\d+|mmcblk\d+|loop\d+))p(\d+)$/i)||x.match(/^([a-z]+)(\d+)$/i);
  if(!m)return null;
  return {dev:'/dev/'+x,disk:m[1],n:m[2]};
}
var VRE={kver:/^[0-9][0-9a-z._-]{0,20}$/i,tz:/^[A-Za-z][A-Za-z0-9_+\/-]{1,40}$/};
function okv(k){var x=(V[k]||'').trim();return x&&VRE[k]&&VRE[k].test(x)?x:''}
var targets=qa('pre,:not(pre)>code',main);
targets.forEach(function(el){el.dataset.o=el.innerHTML});
var SUBRE=/\/dev\/ \([^)]*\)|\/dev\/sda([12])(?!\w)|\/dev\/sda(?!\w)|--part 1(?!\d)|UUID=ROOT_UUID|UUID=(?:ESP|BOOT)_UUID|\b6\.18\.10\b|Europe\/Moscow|\/swapfile  none  swap/g;
function mk(parts){
  var f=d.createDocumentFragment();
  parts.forEach(function(p){
    if(typeof p==='string'){if(p)f.appendChild(d.createTextNode(p))}
    else{var sp=d.createElement('span');sp.className='sv';sp.textContent=p.v;f.appendChild(sp)}
  });
  return f;
}
function subText(s){
  var B=partInfo(V.boot),R=partInfo(V.root),S=partInfo(V.swap),disk=(B||R||S||{}).disk;
  if(S){
    if(/^dd if=\/dev\/zero of=\/swapfile/.test(s)||/^btrfs filesystem mkswapfile/.test(s))return mk([{v:'mkswap '+S.dev+'\nswapon '+S.dev}]);
  }
  var parts=[],last=0,m,hit=false;
  SUBRE.lastIndex=0;
  while((m=SUBRE.exec(s))){
    var v=null,t=m[0];
    if(t.indexOf('/dev/ (')===0){if(disk)v='/dev/'+disk}
    else if(t.indexOf('/dev/sda')===0){
      if(m[1]==='1'){if(B)v=B.dev}
      else if(m[1]==='2'){if(R)v=R.dev}
      else if(disk)v='/dev/'+disk;
    }
    else if(t.indexOf('--part')===0){if(B)v='--part '+B.n}
    else if(t==='UUID=ROOT_UUID'){if(R)v=R.dev}
    else if(t.indexOf('UUID=')===0){if(B)v=B.dev}
    else if(t==='6.18.10')v=okv('kver')||null;
    else if(t==='Europe/Moscow')v=okv('tz')||null;
    else if(t.indexOf('/swapfile')===0){if(S)v=S.dev+'  none  swap'}
    if(v===null)continue;
    parts.push(s.slice(last,m.index));
    parts.push({v:v});
    last=m.index+t.length;hit=true;
  }
  if(!hit)return null;
  parts.push(s.slice(last));
  return mk(parts);
}
function anyVal(){return !!(partInfo(V.boot)||partInfo(V.root)||partInfo(V.swap)||okv('kver')||okv('tz'))}
function applyVals(){
  var any=anyVal();
  targets.forEach(function(el){
    el.innerHTML=el.dataset.o;
    if(!any)return;
    var w=d.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=w.nextNode()))list.push(n);
    list.forEach(function(t){
      var f=subText(t.data);
      if(f)t.parentNode.replaceChild(f,t);
    });
  });
  var vb=d.getElementById('hbvl');
  if(vb)vb.classList.toggle('on',any);
}
var vm=null;
var VF=[['boot','раздел boot','sda1'],['root','раздел root','sda2'],['swap','раздел swap (пусто, если без swap)','sda3'],['kver','версия ядра','6.18.10'],['tz','часовой пояс','Europe/Moscow']];
function vErr(){
  var bad=[];
  qa('input[data-k]',vm).forEach(function(i){
    var k=i.getAttribute('data-k'),x=i.value.trim(),ok=true;
    if(x){
      if(k==='boot'||k==='root'||k==='swap')ok=!!partInfo(x);
      else ok=VRE[k].test(x);
    }
    i.classList.toggle('bad',!ok);
    if(!ok)bad.push(k);
  });
  return bad;
}
function vOpen(){
  if(!vm){
    vm=d.createElement('div');
    vm.className='sx';vm.hidden=true;
    vm.innerHTML='<div class="sxb vmb" role="dialog" aria-label="мои значения"><div class="sxi vmh"><b>мои значения</b></div><div class="vmc"><p class="mu">введи имена разделов, как в lsblk (например sda1, sda2 или nvme0n1p1). диск определится сам. они подставятся во все команды справочника, пустое поле оставляет значение по умолчанию.</p>'+VF.map(function(f){return '<label>'+f[1]+'<input type="text" data-k="'+f[0]+'" placeholder="'+f[2]+'" autocomplete="off" autocapitalize="off" spellcheck="false"></label>'}).join('')+'<p class="mu">в fstab и limine вместо uuid ставится имя раздела. для одного диска это работает так же.</p><div class="vmr"><button type="button" class="btn p" data-a="ok">применить</button><button type="button" class="btn" data-a="rs">сбросить</button><button type="button" class="btn" data-a="cl">закрыть</button></div></div></div>';
    d.body.appendChild(vm);
    vm.addEventListener('mousedown',function(e){if(e.target===vm)vClose()});
    vm.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('[data-a]');
      if(!a)return;
      var k=a.getAttribute('data-a');
      if(k==='cl')vClose();
      else if(k==='rs'){V={boot:'',root:'',swap:'',kver:'',tz:''};vSave();vFill();vErr();applyVals()}
      else if(k==='ok'){
        if(vErr().length)return;
        qa('input[data-k]',vm).forEach(function(i){V[i.getAttribute('data-k')]=i.value.trim()});
        vSave();applyVals();vClose();
      }
    });
    vm.addEventListener('input',vErr);
    vm.addEventListener('keydown',function(e){if(e.key==='Escape')vClose();if(e.key==='Enter'){var b=vm.querySelector('[data-a="ok"]');if(b)b.click()}});
  }
  vFill();vErr();
  vm.hidden=false;h.style.overflow='hidden';
  var f=vm.querySelector('input');if(f)f.focus();
}
function vFill(){qa('input[data-k]',vm).forEach(function(i){i.value=V[i.getAttribute('data-k')]||''})}
function vSave(){try{localStorage.setItem(VK,JSON.stringify(V))}catch(e){}}
function vClose(){if(vm){vm.hidden=true;h.style.overflow=''}}
if(hl){
  var vb=d.createElement('button');
  vb.type='button';vb.className='gh';vb.id='hbvl';
  vb.setAttribute('aria-label','мои значения');
  vb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg><span>мои значения</span>';
  vb.onclick=vOpen;
  hl.insertBefore(vb,hl.firstChild);
}
applyVals();

var errs=qa('details.err',main);
if(errs.length){
  var STOP={'the':1,'and':1,'for':1,'not':1,'with':1,'that':1,'this':1,'error':1,'failed':1};
  var toks=function(s){
    var o={};
    s.toLowerCase().split(/[^a-zа-яё0-9._\/-]+/).forEach(function(w){
      w=w.replace(/^[._\/-]+|[._\/-]+$/g,'');
      if(w.length>=3&&!STOP[w])o[w]=1;
    });
    return o;
  };
  var docs=errs.map(function(e){return {el:e,t:toks(e.textContent)}});
  var df={};
  docs.forEach(function(x){for(var w in x.t)df[w]=(df[w]||0)+1});
  var idf=function(w){return Math.log(1+docs.length/(1+(df[w]||0)))};
  var dg=d.createElement('div');
  dg.className='hbdg';
  dg.innerHTML='<b>диагностика ошибки</b><p class="mu">вставь текст ошибки, страница найдёт подходящую запись.</p><textarea rows="4" placeholder="вставь текст ошибки" spellcheck="false"></textarea><div class="hbdr"></div>';
  var anchor=errs[0];
  while(anchor.previousElementSibling&&!/^H[23]$/.test(anchor.tagName))anchor=anchor.previousElementSibling;
  anchor.parentNode.insertBefore(dg,anchor);
  var ta=dg.querySelector('textarea'),out=dg.querySelector('.hbdr'),tm=null;
  var diag=function(){
    var q=toks(ta.value),keys=Object.keys(q);
    if(!keys.length){out.innerHTML='';return}
    var sc=docs.map(function(x,i){
      var s=0;
      keys.forEach(function(w){
        if(x.t[w])s+=idf(w);
        else{for(var t in x.t){if(t.length>=5&&w.length>=5&&(t.indexOf(w)>-1||w.indexOf(t)>-1)){s+=idf(t)*.5;break}}}
      });
      return {i:i,s:s};
    }).filter(function(x){return x.s>0}).sort(function(a,b){return b.s-a.s}).slice(0,3);
    if(!sc.length){out.innerHTML='<p class="mu">ничего похожего не нашлось. посмотри главу 14 целиком или спроси на <a href="../forum/">форуме</a>.</p>';return}
    out.innerHTML='<p class="mu">похожие записи</p>'+sc.map(function(x){
      var sm=docs[x.i].el.querySelector('summary');
      return '<button type="button" class="hbdh" data-i="'+x.i+'"><strong>'+esc((sm?sm.textContent:'').replace(/\s+/g,' ').trim())+'</strong><span>открыть</span></button>';
    }).join('');
  };
  ta.addEventListener('input',function(){clearTimeout(tm);tm=setTimeout(diag,200)});
  out.addEventListener('click',function(e){
    var b=e.target.closest('.hbdh');
    if(!b)return;
    var el=docs[+b.getAttribute('data-i')].el;
    el.open=true;
    go(el);
  });
}
hashTarget();
})();
