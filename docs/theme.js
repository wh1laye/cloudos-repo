(function(){
  var d=document,h=d.documentElement,K='theme';
  function get(){try{return localStorage.getItem(K)==='gray'?'gray':'light'}catch(e){return 'light'}}
  function set(t){h.setAttribute('data-theme',t);try{localStorage.setItem(K,t)}catch(e){}}
  h.setAttribute('data-theme',get());
  function fire(){if(window.CloudTheme&&typeof window.CloudTheme.onChange==='function')window.CloudTheme.onChange()}
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
    fire();
    return o;
  }
  function resetGrad(){
    try{localStorage.removeItem(GK)}catch(e){}
    applyGrad(getGrad());
    fire();
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
    b.onclick=function(){set(h.getAttribute('data-theme')==='gray'?'light':'gray');paint(b);fire()};
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
    set:function(v){set(v);var b=d.getElementById('tb');if(b)paint(b);fire()},
    apply:function(ui){
      if(!ui)return;
      if(ui.t==='gray'||ui.t==='light'){set(ui.t);var b=d.getElementById('tb');if(b)paint(b)}
      if(ui.g&&HEX.test(ui.g.c1)&&HEX.test(ui.g.c2)){
        var o={on:!!ui.g.on,c1:ui.g.c1,c2:ui.g.c2,a:Math.max(0,Math.min(360,+ui.g.a||0))};
        try{localStorage.setItem(GK,JSON.stringify(o))}catch(e){}
        applyGrad(o);
      }
    },
    onChange:null,
    getGrad:getGrad,setGrad:setGrad,resetGrad:resetGrad
  };

  var CP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  var CK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function copyText(s,done){
    function fb(){
      var a=d.createElement('textarea');
      a.value=s;a.style.position='fixed';a.style.opacity='0';
      d.body.appendChild(a);a.select();
      try{d.execCommand('copy');done()}catch(e){}
      a.remove();
    }
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(s).then(done,fb);
    else fb();
  }
  function addCopy(pre){
    if(pre.dataset.cp||pre.classList.contains('code'))return;
    pre.dataset.cp='1';
    var w=d.createElement('div');
    w.className='cw';
    pre.parentNode.insertBefore(w,pre);
    w.appendChild(pre);
    var b=d.createElement('button');
    b.type='button';b.className='cpb';b.innerHTML=CP;
    b.setAttribute('aria-label','копировать');b.title='копировать';
    b.onclick=function(){
      var s=pre.innerText.replace(/\n$/,'');
      copyText(s,function(){
        b.classList.add('ok');b.innerHTML=CK;
        setTimeout(function(){b.classList.remove('ok');b.innerHTML=CP},1500);
      });
    };
    w.appendChild(b);
  }
  function scanCopy(){
    var m=d.querySelector('main');
    if(!m)return;
    [].slice.call(m.querySelectorAll('pre')).forEach(addCopy);
  }
  function spy(){
    var toc=d.querySelector('.toc');
    if(!toc)return;
    var links={};
    [].slice.call(toc.querySelectorAll('a[href^="#"]')).forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
    var heads=[].slice.call(d.querySelectorAll('main h2[id],main h3[id]')).filter(function(x){return links[x.id]});
    if(!heads.length)return;
    var cur=null,busy=false;
    function mark(){
      busy=false;
      var id=heads[0].id;
      for(var i=0;i<heads.length;i++){if(heads[i].getBoundingClientRect().top<=110)id=heads[i].id}
      if(id===cur)return;
      cur=id;
      for(var k in links)links[k].classList.toggle('on',k===id);
    }
    window.addEventListener('scroll',function(){if(!busy){busy=true;requestAnimationFrame(mark)}},{passive:true});
    mark();
  }
  function boot(){
    mount();
    scanCopy();
    spy();
    var m=d.querySelector('main');
    if(m&&window.MutationObserver)new MutationObserver(scanCopy).observe(m,{childList:true,subtree:true});
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
})();
