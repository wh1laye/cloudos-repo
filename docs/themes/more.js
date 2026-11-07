(function(){
var d=document,h=d.documentElement,K='mor';
var DEF={ff:'',lh:0,ls:0,w:0,cs:0,ul:0,rm:0,sm:0,cw:0,se:0,fo:0,hh:0,tt:0,rs:0,bl:0,sd:0,lf:0,gh:0,hu:0,sc:0,ln:0,dt:0,gl:0,fd:0,rg:0,zb:0,gb:0,ab:0,nz:0,ng:0,gc:0,cu:0,sl:0,im:0,cp:0,bt:0,kb:0,cd:0,fs:0,sp:0,ib:0,rn:0,sg:0,hb:0,vg:0,gd:0,cb:0,fl:0,mk:0,jt:0,lk:0,ar:0,sk:0,cl:0,mg:0,tf:0,lp:0,fz:0,dn:0};
var AT=['ff','lh','ls','w','cs','ul','rm','sm','cw','se','fo','rs','bl','sd','lf','gh','hu','sc','ln','dt','gl','fd','rg','zb','gb','ab','nz','ng','gc','cu','sl','im','cp','bt','kb','cd','fs','sp','ib','rn','sg','hb','vg','gd','cb','fl','mk','jt','lk','ar','sk','cl','mg','tf','lp','fz','dn'];
var KEYS=['theme','tauto','grad','acc','lang','rd','fun','mor','gls','glass','season','seasonfx','seasonq','seasondev'];
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
function get(){
  var o={},r={},k;
  try{r=JSON.parse(ls(K))||{}}catch(e){}
  for(k in DEF){
    if(k==='ff')o[k]=/^(manrope|plex|sys)$/.test(r[k])?r[k]:'';
    else o[k]=+r[k]>=0&&+r[k]<=(k==='rs'?4:2)&&+r[k]%1===0?+r[k]:0;
  }
  return o;
}
var S=get();
function save(){ls(K,JSON.stringify(S))}
function en(){var l=ls('lang');if(l==='ru'||l==='en')return l==='en';return !/^(ru|uk|be|kk)/.test((navigator.language||'ru').toLowerCase())}
var TX={'плотность':'density','компактно':'compact','поведение':'behavior','вид и удобство':'look and comfort','шрифт':'font','система':'system','межстрочный':'line height','плотно':'tight','обычно':'normal','свободно':'loose','буквы':'letter spacing','плотнее':'tighter','обычные':'normal','шире':'wider','ширина текста':'text width','узкая':'narrow','обычная':'normal','широкая':'wide','размер кода':'code size','мельче':'smaller','обычный':'normal','крупнее':'larger','подчёркивать ссылки':'underline links','убрать анимации':'remove animations','отключить плавную прокрутку':'disable smooth scroll','переносить строки в коде':'wrap code lines','выделение цветом акцента':'accent text selection','крупная рамка фокуса':'large focus ring','прятать шапку при прокрутке вниз':'hide header when scrolling down','кнопка «наверх»':'back to top button','наверх':'back to top','экспорт':'export','импорт':'import','сбросить всё':'reset all','настройки скопированы':'settings copied','вставь экспортированные настройки':'paste exported settings','неверный формат':'invalid format','сбросить все настройки сайта?':'reset all site settings?','скругление углов':'corner radius','ровные':'sharp','малое':'small','обычное':'default','большое':'large','макс':'max','кнопка':'button',"акцентная линия под шапкой":"accent line under header","виньетка по краям":"edge vignette","диагональная штриховка фона":"diagonal background hatch","цветная полоска у карточек":"colored card top bar","буквица в первом абзаце":"drop cap","выделение жирного маркером":"highlighter on bold text","текст по ширине":"justified text","заливка ссылок при наведении":"link hover fill","стрелка у внешних ссылок":"arrow on external links","нажатие кнопок с отскоком":"button press bounce","цветной инлайн-код":"colored inline code","увеличение картинок при наведении":"zoom images on hover","свечение полей ввода":"input focus glow","пульс главной кнопки":"primary button pulse","шапка и фон":"header and background","карточки":"cards","текст":"text","ссылки и кнопки":"links and buttons","страница и мелочи":"page and details","размер текста":"text size","цветной градиент страницы":"colored page gradient","аврора на фоне":"aurora background","плёночное зерно":"film grain","неоновые рамки карточек":"neon card borders","стеклянные карточки":"glass cards","цветной курсор":"colored cursor","подсветка строки таблицы":"table row highlight","рамка и тень у картинок":"framed images","градиентные кнопки":"gradient buttons","кнопки-пилюли":"pill buttons","клавиши как на клавиатуре":"keyboard-style keys","акцентная полоса у кода":"accent bar on code","плавающая шапка":"floating header","заголовки капсом":"uppercase headings","акцентные маркеры списков":"accent list markers","радужная линия под шапкой":"rainbow line under header","свечение заголовка":"heading glow",'метка':'tag',"оформление":"decoration","стеклянная шапка":"glass header","тени у карточек":"card shadows","подъём карточек при наведении":"lift cards on hover","градиент в заголовке":"gradient heading","акцентная линия под разделами":"accent line under sections","тонкие цветные полосы прокрутки":"thin accent scrollbars","анимированное подчёркивание ссылок":"animated link underline","точечная сетка на фоне":"dotted background grid","свечение кнопок":"button glow","плавное появление страницы":"smooth page fade-in","акцентная полоса у цитат":"accent bar on quotes","зебра в таблицах":"table zebra stripes"};
function t(s){return en()&&TX[s]?TX[s]:s}
var SEG=[
  ['ff','шрифт',[['','Inter'],['manrope','Manrope'],['plex','Plex'],['sys','система']]],
  ['lh','межстрочный',[[1,'плотно'],[0,'обычно'],[2,'свободно']]],
  ['ls','буквы',[[1,'плотнее'],[0,'обычные'],[2,'шире']]],
  ['w','ширина текста',[[1,'узкая'],[0,'обычная'],[2,'широкая']]],
  ['cs','размер кода',[[1,'мельче'],[0,'обычный'],[2,'крупнее']]],
  ['fz','размер текста',[[1,'мельче'],[0,'обычный'],[2,'крупнее']]]
];
var DNS=[[1,'компактно'],[0,'обычно'],[2,'свободно']];
var RAD=[[1,'ровные',0],[2,'малое',.5],[0,'обычное',1],[3,'большое',1.6],[4,'макс',2.4]];
var CHK=[
  ['ul','подчёркивать ссылки'],
  ['rm','убрать анимации'],
  ['sm','отключить плавную прокрутку'],
  ['cw','переносить строки в коде'],
  ['se','выделение цветом акцента'],
  ['fo','крупная рамка фокуса'],
  ['hh','прятать шапку при прокрутке вниз'],
  ['tt','кнопка «наверх»']
];
var DEC=[['hb','акцентная линия под шапкой'],['vg','виньетка по краям'],['gd','диагональная штриховка фона'],['cb','цветная полоска у карточек'],['fl','буквица в первом абзаце'],['mk','выделение жирного маркером'],['jt','текст по ширине'],['lk','заливка ссылок при наведении'],['ar','стрелка у внешних ссылок'],['sk','нажатие кнопок с отскоком'],['cl','цветной инлайн-код'],['mg','увеличение картинок при наведении'],['tf','свечение полей ввода'],['lp','пульс главной кнопки'],['gb','цветной градиент страницы'],['ab','аврора на фоне'],['nz','плёночное зерно'],['ng','неоновые рамки карточек'],['gc','стеклянные карточки'],['cu','цветной курсор'],['sl','подсветка строки таблицы'],['im','рамка и тень у картинок'],['cp','градиентные кнопки'],['bt','кнопки-пилюли'],['kb','клавиши как на клавиатуре'],['cd','акцентная полоса у кода'],['fs','плавающая шапка'],['sp','заголовки капсом'],['ib','акцентные маркеры списков'],['rn','радужная линия под шапкой'],['sg','свечение заголовка'],['bl','стеклянная шапка'],['sd','тени у карточек'],['lf','подъём карточек при наведении'],['gh','градиент в заголовке'],['hu','акцентная линия под разделами'],['sc','тонкие цветные полосы прокрутки'],['ln','анимированное подчёркивание ссылок'],['dt','точечная сетка на фоне'],['gl','свечение кнопок'],['fd','плавное появление страницы'],['rg','акцентная полоса у цитат'],['zb','зебра в таблицах']];
var DG=[["шапка и фон", ["bl", "fs", "hb", "rn", "gb", "ab", "dt", "gd", "nz", "vg"]], ["карточки", ["sd", "lf", "ng", "gc", "cb"]], ["текст", ["gh", "sg", "hu", "sp", "fl", "mk", "jt", "rg", "ib", "cl", "kb", "cd"]], ["ссылки и кнопки", ["ln", "lk", "ar", "gl", "cp", "bt", "sk", "lp"]], ["страница и мелочи", ["sc", "cu", "fd", "sl", "zb", "im", "mg", "tf"]]];
var DL={};DEC.forEach(function(r){DL[r[0]]=r[1]});
var top=null,tb=null,ly=0;
function onScroll(){
  var y=window.pageYOffset||0;
  if(S.hh){
    top=top||d.querySelector('.top');
    if(top){
      if(y>140&&y>ly+4&&!h.classList.contains('sp-open'))top.classList.add('mh');
      else if(y<ly-4||y<=140)top.classList.remove('mh');
    }
  }
  ly=y;
  if(tb)tb.classList.toggle('on',y>600);
}
window.addEventListener('scroll',onScroll,{passive:true});
function totop(){
  if(S.tt){
    if(!tb&&d.body){
      tb=d.createElement('button');
      tb.type='button';tb.className='mtt';
      tb.setAttribute('aria-label',t('наверх'));tb.title=t('наверх');
      tb.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
      tb.onclick=function(){window.scrollTo({top:0,behavior:(S.sm||S.rm)?'auto':'smooth'})};
      d.body.appendChild(tb);
    }
    onScroll();
  }else if(tb){tb.remove();tb=null}
}
function apply(){
  AT.forEach(function(k){
    var a='data-m'+k;
    if(S[k])h.setAttribute(a,String(S[k]));else h.removeAttribute(a);
  });
  if(!S.hh){top=top||d.querySelector('.top');if(top)top.classList.remove('mh')}
  totop();
}
function toast(s){
  var e=d.createElement('div');
  e.className='mtoast';e.textContent=s;
  d.body.appendChild(e);
  setTimeout(function(){e.remove()},2600);
}
function exp(){
  var o={},i,v,s;
  for(i=0;i<KEYS.length;i++){v=ls(KEYS[i]);if(typeof v==='string')o[KEYS[i]]=v}
  s=JSON.stringify(o);
  if(window.CloudTheme&&window.CloudTheme.copy)window.CloudTheme.copy(s,function(){toast(t('настройки скопированы'))});
}
function imp(){
  var r=window.prompt(t('вставь экспортированные настройки'),''),o,i,n=0;
  if(!r)return;
  try{o=JSON.parse(r)}catch(e){toast(t('неверный формат'));return}
  if(!o||typeof o!=='object'||Array.isArray(o)){toast(t('неверный формат'));return}
  for(i=0;i<KEYS.length;i++){
    if(typeof o[KEYS[i]]==='string'&&o[KEYS[i]].length<=4000){ls(KEYS[i],o[KEYS[i]]);n++}
  }
  if(!n){toast(t('неверный формат'));return}
  ls('uits',String(Date.now()));
  location.reload();
}
function rst(){
  if(!window.confirm(t('сбросить все настройки сайта?')))return;
  KEYS.forEach(function(k){ls(k,null)});
  ls('uits',String(Date.now()));
  location.reload();
}
function mark(){
  [].forEach.call(d.querySelectorAll('[data-mk]'),function(b){
    b.classList.toggle('on',String(S[b.getAttribute('data-mk')])===b.getAttribute('data-mv'));
  });
  [].forEach.call(d.querySelectorAll('[data-mc]'),function(b){b.checked=!!S[b.getAttribute('data-mc')]});
}
function ui(){
  var spb=d.querySelector('.sp .spb'),s,u,c,x;
  if(!spb||spb.querySelector('.mos'))return;
  s=d.createElement('div');
  s.className='sps mos';
  s.setAttribute('data-t','look');
  x='<h4>'+t('вид и удобство')+'</h4><p class="spm">'+t('скругление углов')+'</p><div class="mrg">'+RAD.map(function(o){
    return '<button type="button" class="mrb" data-mk="rs" data-mv="'+o[0]+'" aria-label="'+t(o[1])+'"><i style="--q:'+o[2]+'"></i><span>'+t(o[1])+'</span></button>';
  }).join('')+'</div><div class="mrv"><span class="b1">'+t('кнопка')+'</span><span class="b2">'+t('кнопка')+'</span><span class="b3">'+t('метка')+'</span></div>';
  x+='<p class="spm">'+t('плотность')+'</p><div class="sgm mgm">'+DNS.map(function(o){
    return '<button type="button" data-mk="dn" data-mv="'+o[0]+'">'+t(o[1])+'</button>';
  }).join('')+'</div>';
  s.innerHTML=x;
  spb.appendChild(s);
  u=d.createElement('div');
  u.className='sps mot';
  u.setAttribute('data-t','text');
  x='<h4>'+t('текст')+'</h4>';
  SEG.forEach(function(r){
    x+='<p class="spm">'+t(r[1])+'</p><div class="sgm mgm">'+r[2].map(function(o){
      return '<button type="button" data-mk="'+r[0]+'" data-mv="'+o[0]+'">'+t(o[1])+'</button>';
    }).join('')+'</div>';
  });
  x+='<p class="spm">'+t('поведение')+'</p>'+CHK.map(function(r){
    return '<label class="spc"><input type="checkbox" data-mc="'+r[0]+'"><span>'+t(r[1])+'</span></label>';
  }).join('');
  u.innerHTML=x;
  spb.appendChild(u);
  c=d.createElement('div');
  c.className='sps moc';
  c.setAttribute('data-t','more');
  x='<h4>'+t('оформление')+'</h4>'+DG.map(function(g){
    return '<details class="mdg"><summary>'+t(g[0])+'</summary>'+g[1].map(function(k){
      return '<label class="spc"><input type="checkbox" data-mc="'+k+'"><span>'+t(DL[k])+'</span></label>';
    }).join('')+'</details>';
  }).join('');
  x+='<div class="mtl"><button type="button" class="spq" data-ma="exp">'+t('экспорт')+'</button><button type="button" class="spq" data-ma="imp">'+t('импорт')+'</button><button type="button" class="spq" data-ma="rst">'+t('сбросить всё')+'</button></div>';
  c.innerHTML=x;
  spb.appendChild(c);
  mark();
}
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-mk],[data-ma]'):null,k,a;
  if(!b)return;
  k=b.getAttribute('data-mk');
  if(k&&(k in DEF)){
    S[k]=k==='ff'?b.getAttribute('data-mv'):+b.getAttribute('data-mv');
    save();apply();mark();
    return;
  }
  a=b.getAttribute('data-ma');
  if(a==='exp')exp();
  else if(a==='imp')imp();
  else if(a==='rst')rst();
});
d.addEventListener('change',function(e){
  var n=e.target,k=n&&n.getAttribute&&n.getAttribute('data-mc');
  if(!k||!(k in DEF))return;
  S[k]=n.checked?1:0;
  save();apply();
});
window.addEventListener('storage',function(e){
  if(e.key===K){S=get();apply();mark()}
});
function boot(){
  apply();
  new MutationObserver(ui).observe(d.body,{childList:true,subtree:true});
  ui();
}
if(d.body)boot();else d.addEventListener('DOMContentLoaded',boot);
})();
