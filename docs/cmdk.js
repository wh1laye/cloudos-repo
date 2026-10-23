(function(){
if(/\/handbook\//.test(location.pathname)&&false)return;
var d=document,sc=d.currentScript,root=sc?sc.src.replace(/cmdk\.js.*$/,''):'';
if(window.I18N&&window.I18N.add)window.I18N.add({"действие": "action", "помощник по ядру": "kernel helper", "определение железа": "hardware detection", "схема загрузки": "boot flow", "состав stage 3": "stage 3 contents", "тема: светлая": "theme: light", "тема: серая": "theme: gray", "тема: авто": "theme: auto", "язык: english": "language: english", "язык: русский": "language: russian", "текст крупнее": "larger text", "текст мельче": "smaller text", "высокий контраст: переключить": "high contrast: toggle", "только команды в справочнике: переключить": "commands only in the handbook: toggle", "открыть настройки": "open settings", "скопировать ссылку на страницу": "copy page link"});
var P=[["", "главная"], ["handbook/", "справочник"], ["wizard/", "мастер установки"], ["kernel/", "помощник по ядру"], ["detect/", "определение железа"], ["boot/", "схема загрузки"], ["stage3/", "состав stage 3"], ["compare/", "сравнение"], ["news/", "новое"], ["forum/", "форум"], ["releases/", "релизы"], ["packages/", "пакеты"], ["hardware/", "железо"]];
var C=[["about", "1. о cloudos"], ["prep", "2. подготовка"], ["disk", "3. диск и файловые системы"], ["stage", "4. stage 3"], ["chroot", "5. вход в chroot"], ["conf", "6. настройка сборки"], ["kernel", "7. ядро"], ["boot", "8. загрузчик"], ["final", "9. завершение"], ["first", "10. первая загрузка"], ["cpkg", "11. пакеты и cloudpkg"], ["maint", "12. обслуживание"], ["next", "13. что дальше"], ["errors", "14. ошибки и решения"], ["cheat", "15. шпаргалка"], ["faq", "16. вопросы и ответы"], ["appa", "приложение а. имена дисков"], ["appb", "приложение б. btrfs с подтомами"], ["appc", "приложение в. словарь"]];
var el=null,inp=null,ls=null,sel=0,cur=[];
function lg(){return window.CloudTheme?window.CloudTheme.getLang():'ru'}
function tr(s){return window.I18N&&window.I18N.t?window.I18N.t(s):s}
function CT(){return window.CloudTheme||{}}
function acts(){
  var T=CT(),r=T.getRd?T.getRd():{fs:0,hc:0,cmd:0};
  return [
    {t:'тема: светлая',f:function(){T.set('light')}},
    {t:'тема: серая',f:function(){T.set('gray')}},
    {t:'тема: авто',f:function(){T.setAuto()}},
    {t:'язык: english',f:function(){T.setLang('en')}},
    {t:'язык: русский',f:function(){T.setLang('ru')}},
    {t:'текст крупнее',f:function(){T.setRd({fs:Math.min(2,r.fs+1)})}},
    {t:'текст мельче',f:function(){T.setRd({fs:Math.max(0,r.fs-1)})}},
    {t:'высокий контраст: переключить',f:function(){T.setRd({hc:r.hc?0:1})}},
    {t:'только команды в справочнике: переключить',f:function(){T.setRd({cmd:r.cmd?0:1})}},
    {t:'открыть настройки',f:function(){T.openSettings()}},
    {t:'скопировать ссылку на страницу',f:function(){T.copy(location.href)}}
  ];
}
function all(){
  var en=lg()==='en',hb=root+(en?'handbook/en/':'handbook/'),r=[],i,a;
  for(i=0;i<P.length;i++)r.push({t:P[i][1],u:root+P[i][0]});
  for(i=0;i<C.length;i++)r.push({t:C[i][1],u:hb+'#'+C[i][0],s:'справочник'});
  a=acts();
  for(i=0;i<a.length;i++)r.push({t:a[i].t,f:a[i].f,s:'действие'});
  return r;
}
function build(){
  var st=d.createElement('style');
  st.textContent='.ck{position:fixed;inset:0;z-index:90;display:flex;justify-content:center;align-items:flex-start;padding:12vh 16px 0;background:rgba(0,0,0,.4)}.ck[hidden]{display:none}.ckb{width:100%;max-width:520px;border:1px solid var(--line);border-radius:14px;background:var(--surf);color:var(--ink);overflow:hidden}.ckb input{width:100%;padding:14px 16px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:16px;outline:0}.ckl{max-height:50vh;overflow-y:auto;padding:6px}.cki{display:flex;justify-content:space-between;gap:12px;padding:9px 12px;border-radius:9px;color:var(--ink);text-decoration:none;font-size:15px;cursor:pointer}.cki span{color:var(--mute);font-size:13px}.cki.on{background:var(--soft);color:var(--ac)}.cke{padding:14px 16px;color:var(--mute);font-size:14px}';
  d.head.appendChild(st);
  el=d.createElement('div');el.className='ck';el.hidden=true;
  el.innerHTML='<div class="ckb" role="dialog" aria-modal="true"><input type="text" autocomplete="off" spellcheck="false" aria-label="search"><div class="ckl"></div></div>';
  d.body.appendChild(el);
  inp=el.querySelector('input');ls=el.querySelector('.ckl');
  el.addEventListener('mousedown',function(e){if(e.target===el)close()});
  inp.addEventListener('input',function(){sel=0;draw()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'){sel=Math.min(cur.length-1,sel+1);mark();e.preventDefault()}
    else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);mark();e.preventDefault()}
    else if(e.key==='Enter'&&cur[sel])run(cur[sel]);
  });
}
function run(x){
  if(x.f){close();x.f();return}
  location.href=x.u;
}
function mark(){
  var n=ls.children,i;
  for(i=0;i<n.length;i++)n[i].classList.toggle('on',i===sel);
  if(n[sel]&&n[sel].scrollIntoView)n[sel].scrollIntoView({block:'nearest'});
}
function draw(){
  var q=inp.value.trim().toLowerCase(),a=all(),i,x,t;
  cur=[];ls.textContent='';
  for(i=0;i<a.length;i++){
    t=tr(a[i].t);
    if(!q||t.toLowerCase().indexOf(q)>=0||a[i].t.toLowerCase().indexOf(q)>=0)cur.push({t:t,u:a[i].u,f:a[i].f,s:a[i].s?tr(a[i].s):''});
  }
  if(!cur.length){x=d.createElement('div');x.className='cke';x.textContent=tr('ничего не найдено');ls.appendChild(x);return}
  cur.forEach(function(c,k){
    var x=d.createElement('a');x.className='cki';
    if(c.u)x.href=c.u;
    x.appendChild(d.createTextNode(c.t));
    if(c.s){var s=d.createElement('span');s.textContent=c.s;x.appendChild(s)}
    x.addEventListener('click',function(e){if(c.f){e.preventDefault();run(c)}});
    ls.appendChild(x);
  });
  mark();
}
function open(){
  if(!el)build();
  el.hidden=false;inp.value='';sel=0;draw();inp.focus();
}
function close(){if(el)el.hidden=true}
d.addEventListener('keydown',function(e){
  var t=e.target&&e.target.tagName;
  if((e.ctrlKey||e.metaKey)&&(e.key==='k'||e.key==='K')){
    if(location.pathname.indexOf('/forum/')>=0&&t==='TEXTAREA')return;
    if(/\/handbook\//.test(location.pathname)&&window.__hbsearch)return;
    e.preventDefault();
    if(el&&!el.hidden)close();else open();
  }else if(e.key==='?'&&t!=='INPUT'&&t!=='TEXTAREA'&&!e.ctrlKey&&!e.metaKey&&!(e.target&&e.target.isContentEditable)){
    if(!el||el.hidden){e.preventDefault();open()}
  }else if(e.key==='Escape'&&el&&!el.hidden)close();
});
})();
