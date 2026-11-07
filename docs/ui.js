(function(){
var d=document,W=window;
if(W.I18N&&W.I18N.add)W.I18N.add({"наверх":"back to top"});
function tr(s){return W.I18N&&W.I18N.t?W.I18N.t(s):s}
var b=d.createElement('button');
b.type='button';
b.className='ut';
b.setAttribute('aria-label',tr('наверх'));
b.title=tr('наверх');
b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
b.addEventListener('click',function(){
  var calm=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  W.scrollTo({top:0,behavior:calm?'auto':'smooth'});
});
d.body.appendChild(b);
var t=0;
function upd(){
  t=0;
  b.classList.toggle('on',(W.scrollY||d.documentElement.scrollTop)>700);
}
W.addEventListener('scroll',function(){if(!t)t=W.requestAnimationFrame(upd)},{passive:true});
upd();
})();
