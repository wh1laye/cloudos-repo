(function(){
  var d=document,h=d.documentElement,K='theme';
  function get(){try{return localStorage.getItem(K)==='gray'?'gray':'light'}catch(e){return 'light'}}
  function set(t){h.setAttribute('data-theme',t);try{localStorage.setItem(K,t)}catch(e){}}
  h.setAttribute('data-theme',get());
  var GK='grad',DEF={on:false,c1:'#dbeafe',c2:'#f4f8fd',a:160},HEX=/^#[0-9a-fA-F]{6}$/;
  function getGrad(){
    try{
      var o=JSON.parse(localStorage.getItem(GK));
      if(o&&HEX.test(o.c1)&&HEX.test(o.c2))return {on:!!o.on,c1:o.c1,c2:o.c2,a:Math.max(0,Math.min(360,+o.a||0))};
    }catch(e){}
    return {on:DEF.on,c1:DEF.c1,c2:DEF.c2,a:DEF.a};
  }
  function applyGrad(g){
    if(g.on){
      h.setAttribute('data-grad','1');
      h.style.setProperty('--g1',g.c1);
      h.style.setProperty('--g2',g.c2);
      h.style.setProperty('--ga',g.a+'deg');
    }else h.removeAttribute('data-grad');
  }
  function setGrad(p){
    var o=getGrad();
    for(var k in p)o[k]=p[k];
    try{localStorage.setItem(GK,JSON.stringify(o))}catch(e){}
    applyGrad(o);
    return o;
  }
  function resetGrad(){
    try{localStorage.removeItem(GK)}catch(e){}
    applyGrad(getGrad());
  }
  applyGrad(getGrad());
  var MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  function paint(b){
    var g=h.getAttribute('data-theme')==='gray';
    b.innerHTML=g?SUN:MOON;
    b.setAttribute('aria-label',g?'включить светлую тему':'включить серую тему');
    b.title=g?'светлая тема':'серая тема';
  }
  function mount(){
    var n=d.querySelector('.hl');
    if(!n||d.getElementById('tb'))return;
    var b=d.createElement('button');
    b.id='tb';b.type='button';b.className='gh';
    paint(b);
    b.onclick=function(){set(h.getAttribute('data-theme')==='gray'?'light':'gray');paint(b)};
    n.insertBefore(b,n.firstChild);
  }
  window.addEventListener('storage',function(e){
    if(e.key===GK){applyGrad(getGrad());return}
    if(e.key!==K)return;
    h.setAttribute('data-theme',get());
    var b=d.getElementById('tb');if(b)paint(b);
  });
  window.CloudTheme={
    get:get,
    set:function(v){set(v);var b=d.getElementById('tb');if(b)paint(b)},
    getGrad:getGrad,setGrad:setGrad,resetGrad:resetGrad
  };
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',mount);else mount();
})();
