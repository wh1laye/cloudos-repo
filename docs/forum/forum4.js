(function(){
'use strict';
var app=document.getElementById('app');
if(!app)return;
function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var IGK='ign';
function ign(){try{var a=JSON.parse(localStorage.getItem(IGK)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function saveIgn(a){try{localStorage.setItem(IGK,JSON.stringify(a))}catch(e){}}
function meId(){return (typeof me!=='undefined'&&me)?me.id:null}

var KW={};
('if then else elif fi for while do done case esac in function return break continue exit let const var class new import from export default async await try catch finally throw typeof instanceof static public private fn pub use mut impl struct enum match loop where as self true false null nil None True False def lambda pass with yield not and or sudo doas cd echo source set unset').split(' ').forEach(function(k){KW[k]=1});
var HRE=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\\n])*`)|(\$\{[^}\n]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[@#?!*0-9])|(\b\d+(?:\.\d+)*\b)|((?<=\s)--?[A-Za-z][\w-]*)|([A-Za-z_][A-Za-z0-9_]*)/g;
function hlText(s){
  return s.replace(HRE,function(m,c,st,v,n,fl,w,off){
    if(c!==undefined){
      if(c.charAt(0)==='#'&&off>0&&!/\s/.test(s.charAt(off-1)))return esc(m);
      return '<span class="hl-c">'+esc(m)+'</span>';
    }
    if(st!==undefined)return '<span class="hl-s">'+esc(m)+'</span>';
    if(v!==undefined)return '<span class="hl-v">'+esc(m)+'</span>';
    if(n!==undefined)return '<span class="hl-n">'+esc(m)+'</span>';
    if(fl!==undefined)return '<span class="hl-v">'+esc(m)+'</span>';
    if(w!==undefined&&KW[w])return '<span class="hl-k">'+esc(m)+'</span>';
    return esc(m);
  });
}
function hl(){
  qa('pre.code code',app).forEach(function(el){
    if(el.dataset.hl)return;
    el.dataset.hl='1';
    var t=el.textContent;
    if(t.length>20000)return;
    el.innerHTML=hlText(t);
  });
}

function hideTxt(item,aid){
  var txt=item.querySelector('.txt');
  if(!txt)return;
  var nx=txt.nextElementSibling;
  var acts=nx&&nx.classList.contains('acts')?nx:null;
  var ph=document.createElement('div');
  ph.className='igp';
  ph.innerHTML='<span>сообщение скрыто</span> <button type="button" class="lk">показать</button>';
  txt.parentNode.insertBefore(ph,txt);
  txt.hidden=true;
  if(acts)acts.hidden=true;
  ph.querySelector('button').onclick=function(){
    txt.hidden=false;
    if(acts)acts.hidden=false;
    ph.remove();
  };
}
function ignoreAll(){
  var ids=ign();
  if(!ids.length)return;
  qa('.side a[href^="#/u/"],.ch a[href^="#/u/"]',app).forEach(function(a){
    var id=(a.getAttribute('href')||'').split('/')[2];
    if(ids.indexOf(id)<0)return;
    var it=a.closest('.item');
    if(!it||it.dataset.ig)return;
    it.dataset.ig='1';
    hideTxt(it,id);
  });
}
function profBtn(){
  var m=location.hash.match(/^#\/u\/([0-9a-f-]{36})/i);
  if(!m||m[1]===meId())return;
  var dm=app.querySelector('[data-a="dm"]');
  if(!dm||app.querySelector('[data-ign]'))return;
  var b=document.createElement('button');
  b.type='button';b.className=dm.className||'btn s';
  b.setAttribute('data-ign',m[1]);
  b.textContent=ign().indexOf(m[1])>-1?'не игнорировать':'игнорировать';
  dm.parentNode.insertBefore(b,dm.nextSibling);
}
app.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-ign]');
  if(!b)return;
  var id=b.getAttribute('data-ign'),a=ign(),k=a.indexOf(id);
  if(k>-1)a.splice(k,1);else a.push(id);
  saveIgn(a);
  b.textContent=k>-1?'игнорировать':'не игнорировать';
});

var rt={id:null,ch:null,n:0,bar:null};
function tid(){var m=location.hash.match(/^#\/t\/(\d+)/);return m?+m[1]:null}
function stop(){
  if(rt.ch&&typeof sb!=='undefined'){try{sb.removeChannel(rt.ch)}catch(e){}}
  if(rt.bar){rt.bar.remove()}
  rt.id=null;rt.ch=null;rt.n=0;rt.bar=null;
}
function showBar(){
  if(!rt.bar){
    var b=document.createElement('div');
    b.className='rtb';
    b.innerHTML='<span>новые сообщения</span> <em></em><button type="button" class="btn s p">показать</button>';
    b.querySelector('button').onclick=function(){
      rt.n=0;
      if(rt.bar){rt.bar.remove();rt.bar=null}
      if(typeof route==='function')route();
    };
    document.body.appendChild(b);
    rt.bar=b;
  }
  rt.bar.querySelector('em').textContent=rt.n;
}
function start(id){
  rt.id=id;
  try{
    rt.ch=sb.channel('rt-t-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'posts',filter:'thread_id=eq.'+id},function(p){
      var a=p&&p.new?p.new.author:null;
      if(a&&a===meId())return;
      if(a&&ign().indexOf(a)>-1)return;
      rt.n++;showBar();
    }).subscribe();
  }catch(e){rt.ch=null}
}
function sync(){
  var id=tid();
  if(id===rt.id)return;
  stop();
  if(id&&typeof sb!=='undefined')start(id);
}
var awarded=false;
function award(){
  if(awarded||!meId()||typeof sb==='undefined')return;
  awarded=true;
  try{if(!sessionStorage.getItem('awm')){sessionStorage.setItem('awm','1');sb.rpc('award_me').then(function(){},function(){})}}catch(e){}
}
function rule(b){
  var id=b.getAttribute('data-br');
  var v=prompt('условие: posts, likes, threads, solved или days и число, например posts 10. пусто - убрать условие');
  if(v===null)return;
  v=v.trim();
  var k='',n=0;
  if(v){
    var m=v.match(/^(posts|likes|threads|solved|days)\s+(\d{1,6})$/);
    if(!m)return alert('нужен формат: posts 10');
    k=m[1];n=+m[2];
  }
  sb.rpc('set_badge_rule',{bid:String(id),kind:k,n:n}).then(function(r){
    if(r.error)return alert(r.error.message);
    if(typeof route==='function')route();
  });
}
app.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-br]');
  if(b)rule(b);
});
var tm=null;
function tick(){
  clearTimeout(tm);
  tm=setTimeout(function(){
    try{hl();ignoreAll();profBtn();sync();award()}catch(e){console.warn(e)}
  },60);
}
new MutationObserver(tick).observe(app,{childList:true,subtree:true});
window.addEventListener('hashchange',tick);
tick();
})();
