(function(){
var d=document,W=window;
var src=d.currentScript&&d.currentScript.src;
function en(){try{return localStorage.getItem('lang')==='en'}catch(e){return false}}
function T(ru,e){return en()?e:ru}
if(W.I18N&&W.I18N.add){
  W.I18N.add({
    "приложение":"app",
    "установить приложение":"install the app",
    "нет сети":"offline"
  });
}
if('serviceWorker' in navigator&&src&&(location.protocol==='https:'||location.hostname==='localhost')){
  var swu=new URL('sw.js',src).href;
  W.addEventListener('load',function(){
    navigator.serviceWorker.register(swu).then(function(reg){
      navigator.serviceWorker.ready.then(function(){
        setTimeout(function(){
          var w=navigator.serviceWorker.controller||reg.active;
          if(!w)return;
          var urls=performance.getEntriesByType('resource').map(function(x){return x.name}).filter(function(u){
            return u.indexOf(location.origin)===0&&/\.(css|js|png|svg|webp|jpg|jpeg|ico|woff2?|json)(\?|$)/i.test(u);
          });
          urls.push(location.href.split('#')[0]);
          w.postMessage({type:'cache',urls:urls});
        },1500);
      });
    }).catch(function(){});
  });
}
var dp=null;
function standalone(){return (W.matchMedia&&W.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
function ios(){return /iphone|ipad|ipod/i.test(navigator.userAgent)}
function box(){return d.getElementById('pwa-i')}
function paint(){
  var b=box();
  if(!b)return;
  var btn=b.querySelector('button'),p=b.querySelector('p');
  if(standalone()){
    btn.hidden=true;
    p.textContent=T('приложение уже установлено.','the app is already installed.');
    return;
  }
  if(dp){
    btn.hidden=false;
    p.textContent=T('открывается как обычное приложение, справочник работает без сети.','opens like a normal app, the handbook works offline.');
    return;
  }
  btn.hidden=true;
  p.textContent=ios()?T('в safari: поделиться, затем «на экран домой».','in safari: share, then "add to home screen".'):T('в меню браузера выбери «установить приложение» или «добавить на главный экран».','use "install app" or "add to home screen" in the browser menu.');
}
function mount(){
  var s=d.querySelector('.spb');
  if(!s||box())return;
  var x=d.createElement('div');
  x.className='sps';
  x.id='pwa-i';
  x.innerHTML='<h4>приложение</h4><p class="spm"></p><button type="button" class="spq">установить приложение</button>';
  s.appendChild(x);
  x.querySelector('button').onclick=function(){
    if(!dp)return;
    dp.prompt();
    dp.userChoice.then(function(){dp=null;paint()},function(){dp=null;paint()});
  };
  paint();
}
W.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;paint()});
W.addEventListener('appinstalled',function(){dp=null;paint()});
W.addEventListener('cloudlang',paint);
new MutationObserver(mount).observe(d.documentElement,{childList:true,subtree:true});
mount();
var toast=null;
function show(m){
  if(!toast){
    toast=d.createElement('div');
    toast.style.cssText='position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;padding:8px 16px;border-radius:999px;background:#1a1c20;color:#e7edf7;border:1px solid #3b4a6b;font:14px system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.35)';
    d.body.appendChild(toast);
  }
  toast.textContent=m;
  toast.hidden=false;
}
W.addEventListener('offline',function(){show(T('нет сети','offline'))});
W.addEventListener('online',function(){if(toast)toast.hidden=true});
if(navigator.onLine===false&&d.body)show(T('нет сети','offline'));
})();
