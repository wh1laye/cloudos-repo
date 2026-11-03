(function(){
var d=document,h=d.documentElement,K='mor';
var DEF={ff:'',lh:0,ls:0,w:0,cs:0,ul:0,rm:0,sm:0,cw:0,se:0,fo:0,hh:0,tt:0};
var AT=['ff','lh','ls','w','cs','ul','rm','sm','cw','se','fo'];
var KEYS=['theme','tauto','grad','acc','lang','rd','fun','mor','season','seasonfx','seasonq','seasondev'];
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
function get(){
  var o={},r={},k;
  try{r=JSON.parse(ls(K))||{}}catch(e){}
  for(k in DEF){
    if(k==='ff')o[k]=/^(manrope|plex|sys)$/.test(r[k])?r[k]:'';
    else o[k]=+r[k]>=0&&+r[k]<=2?+r[k]:0;
  }
  return o;
}
var S=get();
function save(){ls(K,JSON.stringify(S))}
function en(){var l=ls('lang');if(l==='ru'||l==='en')return l==='en';return !/^(ru|uk|be|kk)/.test((navigator.language||'ru').toLowerCase())}
var TX={'вид и удобство':'look and comfort','шрифт':'font','система':'system','межстрочный':'line height','плотно':'tight','обычно':'normal','свободно':'loose','буквы':'letter spacing','плотнее':'tighter','обычные':'normal','шире':'wider','ширина текста':'text width','узкая':'narrow','обычная':'normal','широкая':'wide','размер кода':'code size','мельче':'smaller','обычный':'normal','крупнее':'larger','подчёркивать ссылки':'underline links','убрать анимации':'remove animations','отключить плавную прокрутку':'disable smooth scroll','переносить строки в коде':'wrap code lines','выделение цветом акцента':'accent text selection','крупная рамка фокуса':'large focus ring','прятать шапку при прокрутке вниз':'hide header when scrolling down','кнопка «наверх»':'back to top button','наверх':'back to top','экспорт':'export','импорт':'import','сбросить всё':'reset all','настройки скопированы':'settings copied','вставь экспортированные настройки':'paste exported settings','неверный формат':'invalid format','сбросить все настройки сайта?':'reset all site settings?'};
function t(s){return en()&&TX[s]?TX[s]:s}
var SEG=[
  ['ff','шрифт',[['','Inter'],['manrope','Manrope'],['plex','Plex'],['sys','система']]],
  ['lh','межстрочный',[[1,'плотно'],[0,'обычно'],[2,'свободно']]],
  ['ls','буквы',[[1,'плотнее'],[0,'обычные'],[2,'шире']]],
  ['w','ширина текста',[[1,'узкая'],[0,'обычная'],[2,'широкая']]],
  ['cs','размер кода',[[1,'мельче'],[0,'обычный'],[2,'крупнее']]]
];
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
  var spb=d.querySelector('.sp .spb'),s,x;
  if(!spb||spb.querySelector('.mos'))return;
  s=d.createElement('div');
  s.className='sps mos';
  x='<h4>'+t('вид и удобство')+'</h4>';
  SEG.forEach(function(r){
    x+='<p class="spm">'+t(r[1])+'</p><div class="sgm mgm">'+r[2].map(function(o){
      return '<button type="button" data-mk="'+r[0]+'" data-mv="'+o[0]+'">'+t(o[1])+'</button>';
    }).join('')+'</div>';
  });
  x+=CHK.map(function(r){
    return '<label class="spc"><input type="checkbox" data-mc="'+r[0]+'"><span>'+t(r[1])+'</span></label>';
  }).join('');
  x+='<div class="mtl"><button type="button" class="spq" data-ma="exp">'+t('экспорт')+'</button><button type="button" class="spq" data-ma="imp">'+t('импорт')+'</button><button type="button" class="spq" data-ma="rst">'+t('сбросить всё')+'</button></div>';
  s.innerHTML=x;
  spb.appendChild(s);
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
