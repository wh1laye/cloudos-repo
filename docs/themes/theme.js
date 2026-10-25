(function(){
  var d=document,h=d.documentElement,K='theme';
  var TK='uits';
  function touch(){try{localStorage.setItem(TK,String(Date.now()))}catch(e){}}
  function ts(){try{return +localStorage.getItem(TK)||0}catch(e){return 0}}
  var MQ=window.matchMedia?window.matchMedia('(prefers-color-scheme: light)'):null;
  function auto(){try{return localStorage.getItem('tauto')==='1'}catch(e){return false}}
  function get(){
    if(auto())return MQ&&MQ.matches?'light':'gray';
    try{return localStorage.getItem(K)==='light'?'light':'gray'}catch(e){return 'gray'}
  }
  function set(t){try{localStorage.removeItem('tauto')}catch(e){}h.setAttribute('data-theme',t);try{localStorage.setItem(K,t)}catch(e){}applyAcc(getAcc())}
  function setAuto(){try{localStorage.setItem('tauto','1')}catch(e){}h.setAttribute('data-theme',get());applyAcc(getAcc());var b=d.getElementById('tb');if(b)paint(b);touch();fire()}
  if(MQ&&MQ.addEventListener)MQ.addEventListener('change',function(){if(auto()){h.setAttribute('data-theme',get());applyAcc(getAcc());var b=d.getElementById('tb');if(b)paint(b)}});
  function fire(){if(window.CloudTheme&&typeof window.CloudTheme.onChange==='function')window.CloudTheme.onChange()}
  var HEX=/^#[0-9a-fA-F]{6}$/;
  function rgb(x){return [parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)]}
  function hx(a){return '#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16)}).join('')}
  function mix(a,b,t){var x=rgb(a),y=rgb(b);return hx([x[0]*(1-t)+y[0]*t,x[1]*(1-t)+y[1]*t,x[2]*(1-t)+y[2]*t])}
  function lum(x){var c=rgb(x);return .299*c[0]+.587*c[1]+.114*c[2]}

  var EN={
    'настройки':'settings','закрыть':'close','тема':'theme','светлая':'light','серая':'gray',
    'язык':'language','акцентный цвет':'accent color','кнопки и детали':'buttons and details',
    'цвет 1':'color 1','цвет 2':'color 2','градиент':'gradient','сбросить':'reset',
    'фон сайта':'site background','включить градиент фона':'enable background gradient',
    'угол':'angle','пресеты':'presets','включить светлую тему':'switch to light theme',
    'включить серую тему':'switch to gray theme','светлая тема':'light theme','серая тема':'gray theme',
    'авто':'auto','чтение':'reading','размер текста':'text size','обычный':'normal','крупнее':'larger','ещё крупнее':'largest','высокий контраст':'high contrast','только команды в справочнике':'commands only in the handbook','предпросмотр':'preview','кнопка':'button'
  };
  function lang(){
    try{var l=localStorage.getItem('lang');if(l==='ru'||l==='en')return l}catch(e){}
    var n=(navigator.language||'ru').toLowerCase();
    return /^(ru|uk|be|kk)/.test(n)?'ru':'en';
  }
  function T(s){return lang()==='en'&&EN[s]?EN[s]:s}

  var GK='grad',DEF={on:false,c1:'#dbeafe',c2:'#f4f8fd',a:160};
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
    touch();
    fire();
    return o;
  }
  function resetGrad(){
    try{localStorage.removeItem(GK)}catch(e){}
    applyGrad(getGrad());
    touch();
    fire();
  }

  var AK='acc',ADEF={on:false,c1:'#3563c9',c2:'#7a5af5',g:false};
  var AVARS=['--ac','--ac2','--abg','--soft','--onac','--dbg','--dfg','--lg1','--lg2'];
  function cleanAcc(o){
    if(o&&HEX.test(o.c1)&&HEX.test(o.c2))return {on:!!o.on,c1:o.c1,c2:o.c2,g:!!o.g};
    return null;
  }
  function getAcc(){
    try{var o=cleanAcc(JSON.parse(localStorage.getItem(AK)));if(o)return o}catch(e){}
    return {on:ADEF.on,c1:ADEF.c1,c2:ADEF.c2,g:ADEF.g};
  }
  function applyAcc(a){
    var i,s=h.style;
    if(!a.on){for(i=0;i<AVARS.length;i++)s.removeProperty(AVARS[i]);return}
    var bg=h.getAttribute('data-theme')==='light'?'#f6f8fc':'#1a1c20';
    var c2=a.g?a.c2:a.c1;
    var avg=mix(a.c1,c2,.5);
    s.setProperty('--ac',a.c1);
    s.setProperty('--ac2',c2);
    s.setProperty('--abg',a.g?'linear-gradient(135deg,'+a.c1+','+a.c2+')':a.c1);
    s.setProperty('--soft',mix(bg,a.c1,.16));
    s.setProperty('--onac',lum(avg)>165?'#11151b':'#ffffff');
    s.setProperty('--dbg',a.g?'linear-gradient(135deg,'+mix(bg,a.c1,.2)+','+mix(bg,c2,.2)+')':mix(bg,a.c1,.16));
    s.setProperty('--dfg',a.c1);
    s.setProperty('--lg1',a.c1);
    s.setProperty('--lg2',c2);
  }
  function setAcc(p){
    var o=getAcc();
    for(var k in p)o[k]=p[k];
    o.on=true;
    try{localStorage.setItem(AK,JSON.stringify(o))}catch(e){}
    applyAcc(o);touch();fire();
    return o;
  }
  function resetAcc(){
    try{localStorage.removeItem(AK)}catch(e){}
    applyAcc(getAcc());touch();fire();
  }
  function setLang(l){
    if(l!=='ru'&&l!=='en')return;
    try{localStorage.setItem('lang',l)}catch(e){}
    touch();
    afterLang();
    fire();
  }
  function afterLang(){
    var b=d.getElementById('tb');if(b)paint(b);
    var s=d.getElementById('sb');if(s)paintS(s);
    if(sp){build();refresh()}
    try{window.dispatchEvent(new Event('cloudlang'))}catch(e){var ev=d.createEvent('Event');ev.initEvent('cloudlang',false,false);window.dispatchEvent(ev)}
  }

  h.setAttribute('data-theme',get());
  applyGrad(getGrad());
  applyAcc(getAcc());

  var MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var GEAR='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
  var XI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function paint(b){
    var g=h.getAttribute('data-theme')==='gray';
    b.innerHTML=g?SUN:MOON;
    b.setAttribute('aria-label',T(g?'включить светлую тему':'включить серую тему'));
    b.title=T(g?'светлая тема':'серая тема');
  }
  function paintS(b){
    b.innerHTML=GEAR+'<span>'+T('настройки')+'</span>';
    b.setAttribute('aria-label',T('настройки'));
    b.title=T('настройки');
  }

  var sp=null;
  var APRE=[['#3563c9','#7a5af5'],['#2e9e6b','#2bb3c4'],['#e0663a','#e0a33a'],['#c93d7a','#8a4fd0'],['#2a9bd6','#3563c9'],['#7c8795','#4b5563']];
  var BPRE={
    light:[['#dbeafe','#f4f8fd',160],['#e6f4ea','#f6faf7',160],['#fde8d8','#fbf6f1',160],['#ece4fb','#f7f4fd',160]],
    gray:[['#1f2a3d','#1a1c20',160],['#1e2f27','#1a1c20',160],['#33232b','#1a1c20',160],['#2b2540','#1a1c20',160]]
  };
  function rdGet(){var o={};try{o=JSON.parse(localStorage.getItem('rd'))||{}}catch(e){}return{fs:+o.fs>=0&&+o.fs<=2?+o.fs:0,hc:o.hc?1:0,cmd:o.cmd?1:0}}
  function rdApply(o){
    if(o.fs)h.setAttribute('data-fs',String(o.fs));else h.removeAttribute('data-fs');
    if(o.hc)h.setAttribute('data-hc','1');else h.removeAttribute('data-hc');
    if(o.cmd)h.setAttribute('data-cmd','1');else h.removeAttribute('data-cmd');
  }
  function rdSet(p){
    var o=rdGet(),k;
    for(k in p)o[k]=p[k];
    o.fs=Math.max(0,Math.min(2,+o.fs||0));
    try{localStorage.setItem('rd',JSON.stringify(o))}catch(e){}
    rdApply(o);rdSync();touch();
  }
  function rdSync(){
    if(!sp)return;
    var o=rdGet();
    [].forEach.call(sp.querySelectorAll('[data-rfs]'),function(b){b.classList.toggle('on',+b.getAttribute('data-rfs')===o.fs)});
    var a=sp.querySelector('[data-rk="hc"]'),b=sp.querySelector('[data-rk="cmd"]');
    if(a)a.checked=!!o.hc;if(b)b.checked=!!o.cmd;
  }
  rdApply(rdGet());
  d.addEventListener('click',function(e){
    var n=e.target.closest?e.target.closest('[data-rfs]'):null;
    if(n)rdSet({fs:+n.getAttribute('data-rfs')});
  });
  d.addEventListener('change',function(e){
    var n=e.target;
    if(n&&n.getAttribute&&n.getAttribute('data-rk'))rdSet(function(){var o={};o[n.getAttribute('data-rk')]=n.checked?1:0;return o}());
  });
  function build(){
    var i,x='';
    x+='<div class="spb" role="dialog" aria-modal="true" aria-label="'+T('настройки')+'">';
    x+='<div class="sph"><b>'+T('настройки')+'</b><button type="button" class="spx" data-a="close" aria-label="'+T('закрыть')+'">'+XI+'</button></div>';
    x+='<div class="sps"><h4>'+T('тема')+'</h4><div class="sgm"><button type="button" data-th="light">'+T('светлая')+'</button><button type="button" data-th="gray">'+T('серая')+'</button><button type="button" data-th="auto">'+T('авто')+'</button></div></div>';
    x+='<div class="sps"><h4>'+T('язык')+'</h4><div class="sgm"><button type="button" data-lg="ru">Русский</button><button type="button" data-lg="en">English</button></div></div>';
    x+='<div class="sps"><h4>'+T('чтение')+'</h4><p class="spm">'+T('размер текста')+'</p><div class="sgm"><button type="button" data-rfs="0">'+T('обычный')+'</button><button type="button" data-rfs="1">'+T('крупнее')+'</button><button type="button" data-rfs="2">'+T('ещё крупнее')+'</button></div>';
    x+='<label class="spc"><input type="checkbox" data-rk="hc"><span>'+T('высокий контраст')+'</span></label><label class="spc"><input type="checkbox" data-rk="cmd"><span>'+T('только команды в справочнике')+'</span></label></div>';
    x+='<div class="sps"><h4>'+T('акцентный цвет')+'</h4><p class="spm">'+T('кнопки и детали')+'</p><div class="spp" data-box="apre">';
    for(i=0;i<APRE.length;i++)x+='<button type="button" class="pr" data-ap="'+i+'" style="background:linear-gradient(135deg,'+APRE[i][0]+','+APRE[i][1]+')" aria-label="'+APRE[i][0]+'"></button>';
    x+='</div><div class="spr"><label>'+T('цвет 1')+'<input type="color" data-k="c1"></label><label>'+T('цвет 2')+'<input type="color" data-k="c2"></label></div>';
    x+='<label class="spc"><input type="checkbox" data-k="ag"><span>'+T('градиент')+'</span></label>';
    x+='<div class="spv"><span class="pv1">'+T('кнопка')+'</span><span class="pv2"></span></div>';
    x+='<button type="button" class="spq" data-a="racc">'+T('сбросить')+'</button></div>';
    x+='<div class="sps"><h4>'+T('фон сайта')+'</h4><label class="spc"><input type="checkbox" data-k="bon"><span>'+T('включить градиент фона')+'</span></label>';
    x+='<div class="spr"><label>'+T('цвет 1')+'<input type="color" data-k="b1"></label><label>'+T('цвет 2')+'<input type="color" data-k="b2"></label></div>';
    x+='<label class="spa">'+T('угол')+'<input type="range" min="0" max="360" data-k="ba"><em data-k="bav"></em></label>';
    x+='<p class="spm">'+T('пресеты')+'</p><div class="spp" data-box="bpre"></div>';
    x+='<button type="button" class="spq" data-a="rbg">'+T('сбросить')+'</button></div>';
    x+='</div>';
    sp.innerHTML=x;rdSync();
  }
  function q(k){return sp.querySelector('[data-k="'+k+'"]')}
  function refresh(){
    if(!sp)return;
    var t=get(),l=lang(),a=getAcc(),g=getGrad(),i,e,box;
    [].forEach.call(sp.querySelectorAll('[data-th]'),function(b){var v=b.getAttribute('data-th');b.classList.toggle('on',v==='auto'?auto():(!auto()&&v===t))});
    [].forEach.call(sp.querySelectorAll('[data-lg]'),function(b){b.classList.toggle('on',b.getAttribute('data-lg')===l)});
    q('c1').value=a.c1;q('c2').value=a.c2;q('ag').checked=!!a.g;
    q('c2').parentNode.style.opacity=a.g?'1':'.45';
    e=sp.querySelector('.pv2');
    e.style.background=a.g?'linear-gradient(135deg,'+a.c1+','+a.c2+')':a.c1;
    e=sp.querySelector('.pv1');
    e.style.background=a.on?(a.g?'linear-gradient(135deg,'+a.c1+','+a.c2+')':a.c1):'var(--ac)';
    q('bon').checked=!!g.on;q('b1').value=g.c1;q('b2').value=g.c2;q('ba').value=g.a;q('bav').textContent=g.a+'°';
    [].forEach.call(sp.querySelectorAll('[data-ap]'),function(b){var p=APRE[+b.getAttribute('data-ap')];b.classList.toggle('on',a.on&&a.g&&p[0].toLowerCase()===a.c1.toLowerCase()&&p[1].toLowerCase()===a.c2.toLowerCase())});
    box=sp.querySelector('[data-box="bpre"]');
    var arr=BPRE[t],x='';
    for(i=0;i<arr.length;i++)x+='<button type="button" class="pr" data-bp="'+i+'" style="background:linear-gradient('+arr[i][2]+'deg,'+arr[i][0]+','+arr[i][1]+')" aria-label="'+arr[i][0]+'"></button>';
    box.innerHTML=x;
    [].forEach.call(box.querySelectorAll('[data-bp]'),function(b){var r=arr[+b.getAttribute('data-bp')];b.classList.toggle('on',g.on&&r[0].toLowerCase()===g.c1.toLowerCase()&&r[1].toLowerCase()===g.c2.toLowerCase())});
  }
  function openSettings(){
    if(!sp){
      sp=d.createElement('div');sp.className='sp';sp.hidden=true;
      d.body.appendChild(sp);
      build();
      sp.addEventListener('click',function(e){
        var n=e.target;
        if(n===sp){closeSettings();return}
        while(n&&n!==sp&&!(n.getAttribute&&(n.hasAttribute('data-a')||n.hasAttribute('data-th')||n.hasAttribute('data-lg')||n.hasAttribute('data-ap')||n.hasAttribute('data-bp'))))n=n.parentNode;
        if(!n||n===sp)return;
        if(n.hasAttribute('data-a')){
          var a=n.getAttribute('data-a');
          if(a==='close')closeSettings();
          else if(a==='racc'){resetAcc();refresh()}
          else if(a==='rbg'){resetGrad();refresh()}
          return;
        }
        if(n.hasAttribute('data-th')){var tv=n.getAttribute('data-th');if(tv==='auto')setAuto();else window.CloudTheme.set(tv);refresh();return}
        if(n.hasAttribute('data-lg')){setLang(n.getAttribute('data-lg'));return}
        if(n.hasAttribute('data-ap')){var p=APRE[+n.getAttribute('data-ap')];setAcc({c1:p[0],c2:p[1],g:true});refresh();return}
        if(n.hasAttribute('data-bp')){var r=BPRE[get()][+n.getAttribute('data-bp')];setGrad({on:true,c1:r[0],c2:r[1],a:r[2]});refresh()}
      });
      sp.addEventListener('input',function(e){
        var k=e.target.getAttribute&&e.target.getAttribute('data-k');
        if(!k)return;
        var v=e.target.value;
        if(k==='c1'||k==='c2'){var o={};o[k]=v;if(k==='c2')o.g=true;setAcc(o);refresh()}
        else if(k==='ag'){setAcc({g:e.target.checked});refresh()}
        else if(k==='bon'){setGrad({on:e.target.checked});refresh()}
        else if(k==='b1'||k==='b2'){var p={on:true};p[k==='b1'?'c1':'c2']=v;setGrad(p);refresh()}
        else if(k==='ba'){setGrad({on:true,a:+v});refresh()}
      });
    }
    refresh();
    sp.hidden=false;
    h.classList.add('sp-open');
    var gb=d.getElementById('sb');if(gb)gb.classList.add('on');
    var c=sp.querySelector('.spx');if(c)c.focus();
  }
  function closeSettings(){
    if(!sp)return;
    sp.hidden=true;
    h.classList.remove('sp-open');
    var gb=d.getElementById('sb');if(gb)gb.classList.remove('on');
  }
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&sp&&!sp.hidden)closeSettings()});

  function mount(){
    var n=d.querySelector('.hl');
    if(!n)return;
    if(!d.getElementById('sb')){
      var s=d.createElement('button');
      s.id='sb';s.type='button';s.className='gh';
      paintS(s);
      s.onclick=openSettings;
      n.appendChild(s);
    }
  }
  window.addEventListener('storage',function(e){
    if(e.key===GK){applyGrad(getGrad());if(sp&&!sp.hidden)refresh();return}
    if(e.key===AK){applyAcc(getAcc());if(sp&&!sp.hidden)refresh();return}
    if(e.key==='lang'){afterLang();return}
    if(e.key!==K)return;
    h.setAttribute('data-theme',get());
    applyAcc(getAcc());
    var b=d.getElementById('tb');if(b)paint(b);
    if(sp&&!sp.hidden)refresh();
  });
  function pack(){return {t:get(),g:getGrad(),a:getAcc(),l:lang(),ts:ts()}}
  window.CloudTheme={
    get:get,
    setAuto:setAuto,getRd:rdGet,setRd:rdSet,
    set:function(v){set(v);var b=d.getElementById('tb');if(b)paint(b);touch();fire()},
    apply:function(ui){
      if(!ui)return;
      try{localStorage.setItem(TK,String(+ui.ts||0))}catch(e){}
      if(!auto()&&(ui.t==='gray'||ui.t==='light')){set(ui.t);var b=d.getElementById('tb');if(b)paint(b)}
      if(ui.g&&HEX.test(ui.g.c1)&&HEX.test(ui.g.c2)){
        var o={on:!!ui.g.on,c1:ui.g.c1,c2:ui.g.c2,a:Math.max(0,Math.min(360,+ui.g.a||0))};
        try{localStorage.setItem(GK,JSON.stringify(o))}catch(e){}
        applyGrad(o);
      }
      var ac=cleanAcc(ui.a);
      if(ac){
        try{localStorage.setItem(AK,JSON.stringify(ac))}catch(e){}
        applyAcc(ac);
      }
      if((ui.l==='ru'||ui.l==='en')&&ui.l!==lang()){
        try{localStorage.setItem('lang',ui.l)}catch(e){}
        afterLang();
      }
      if(sp&&!sp.hidden)refresh();
    },
    onChange:null,
    ts:ts,
    pack:pack,
    getGrad:getGrad,setGrad:setGrad,resetGrad:resetGrad,
    getAcc:getAcc,setAcc:setAcc,resetAcc:resetAcc,
    getLang:lang,setLang:setLang,
    openSettings:openSettings,closeSettings:closeSettings
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
  window.CloudTheme.copy=copyText;
  function addCopy(pre){
    if(pre.dataset.cp||pre.classList.contains('code'))return;
    pre.dataset.cp='1';
    var w=d.createElement('div');
    w.className='cw';
    pre.parentNode.insertBefore(w,pre);
    w.appendChild(pre);
    var b=d.createElement('button');
    b.type='button';b.className='cpb';b.innerHTML=CP;
    b.setAttribute('aria-label',lang()==='en'?'copy':'копировать');b.title=lang()==='en'?'copy':'копировать';
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

(function(){
var d=document;
function sh(open){
  var b=d.getElementById('ob'),m=d.getElementById('om');
  if(!b||!m)return;
  m.hidden=!open;
  b.setAttribute('aria-expanded',open?'true':'false');
}
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('#ob'):null,m=d.getElementById('om');
  if(b){sh(m&&m.hidden);return}
  if(m&&!m.hidden)sh(false);
});
d.addEventListener('keydown',function(e){if(e.key==='Escape')sh(false)});
})();

(function(){
var s=document.currentScript;
if(!s||!s.src)return;
var e=document.createElement('script');
e.src=s.src.replace(/theme\.js.*$/,'')+'themes/themes.js?v=4';
document.head.appendChild(e);
})();
