(function(){
const PS=15;
const ls={
  get:k=>{try{return localStorage.getItem(k)}catch(x){return null}},
  set:(k,v)=>{try{localStorage.setItem(k,v)}catch(x){}}
};
const ss={
  get:k=>{try{return sessionStorage.getItem(k)}catch(x){return null}},
  set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(x){}},
  del:k=>{try{sessionStorage.removeItem(k)}catch(x){}}
};
const dec=s=>{try{return decodeURIComponent(s||'')}catch(x){return s||''}};
const parseTags=s=>String(s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).slice(0,5);

let base=+ls.get('f3base');
if(!base){base=Date.now();ls.set('f3base',String(base))}
let SEEN={};
try{SEEN=JSON.parse(ls.get('f3seen')||'{}')}catch(x){SEEN={}}
function saveSeen(){
  const k=Object.keys(SEEN);
  if(k.length>600)k.sort((a,b)=>SEEN[a]-SEEN[b]).slice(0,k.length-500).forEach(x=>{delete SEEN[x]});
  ls.set('f3seen',JSON.stringify(SEEN));
}
window.isUnread=t=>{
  if(!t||!t.bumped_at)return false;
  const s=SEEN[t.id];
  return new Date(t.bumped_at).getTime()>(s!==undefined?s:base);
};
window.tagsHtml=t=>{
  const g=t&&t.tags;
  if(!g||!g.length)return '';
  return '<span class="tgl">'+g.map(x=>'<span class="tg" data-t="'+esc(x)+'">#'+esc(x)+'</span>').join('')+'</span>';
};

function pager(n,p){
  const nums=[];
  for(let i=1;i<=n;i++){
    if(i===1||i===n||Math.abs(i-p)<=1)nums.push(i);
    else if(nums[nums.length-1]!=='…')nums.push('…');
  }
  const b=(i,t,on)=>'<button type="button" class="pgb'+(on?' on':'')+'" data-a="pgo" data-i="'+i+'">'+t+'</button>';
  return '<div class="pg">'+(p>1?b(p-1,'назад'):'')+nums.map(x=>x==='…'?'<span class="mu">…</span>':b(x,x,x===p)).join('')+(p<n?b(p+1,'вперёд'):'')+'</div>';
}
function setPage(id,p,sc){
  const arts=[...app.querySelectorAll('article.post')];
  if(!arts.length)return;
  const n=Math.max(1,Math.ceil(arts.length/PS));
  arts.forEach((a,k)=>{a.hidden=!(k>=(p-1)*PS&&k<p*PS)});
  app.querySelectorAll('.pg').forEach(x=>x.remove());
  if(n>1){
    const h=pager(n,p);
    arts[0].insertAdjacentHTML('beforebegin',h);
    arts[arts.length-1].insertAdjacentHTML('afterend',h);
  }
  try{history.replaceState(null,'','#/t/'+id+(p>1?'/'+p:''))}catch(x){}
  quotes();
  if(sc)(app.querySelector('h1')||app).scrollIntoView();
}
function popGol(id){
  let g=null;
  try{g=JSON.parse(ss.get('f3gol')||'null')}catch(x){}
  if(!g||g.id!==id)return false;
  ss.del('f3gol');
  return Date.now()-g.t<30000;
}

async function extra(id){
  const k=location.hash.slice(1).split('/');
  if(k[1]!=='t'||+k[2]!==id)return;
  const tr=await sb.from('threads').select('*').eq('id',id).single();
  const t=tr.data;
  if(!t||+location.hash.slice(1).split('/')[2]!==id)return;
  if(t.bumped_at){SEEN[id]=new Date(t.bumped_at).getTime();saveSeen()}
  let pend=null;
  try{pend=JSON.parse(ss.get('f3pt')||'null')}catch(x){}
  if(pend&&me&&tAuth(t)===me.id){
    ss.del('f3pt');
    if(Date.now()-pend.t<30000&&pend.title===t.title&&pend.v.length&&!(t.tags||[]).length){
      const r=await sb.rpc('set_tags',{tid:id,tg:pend.v});
      if(!r.error){
        const x=await sb.from('threads').select('tags').eq('id',id).single();
        t.tags=x.data?x.data.tags:[];
      }
    }
  }
  const h1=app.querySelector('h1');
  const tg=t.tags||[];
  const can2=!!me&&(tAuth(t)===me.id||!!(prof&&prof.is_admin));
  if(h1&&!app.querySelector('.tgs')&&(tg.length||can2)){
    const d=document.createElement('div');
    d.className='tgs';
    d.innerHTML=tg.map(x=>'<a class="tg" href="#/tag/'+encodeURIComponent(x)+'">#'+esc(x)+'</a>').join('')+(can2?'<button type="button" class="lk" data-a="tgedit" data-v="'+esc(tg.join(', '))+'">'+(tg.length?'изменить теги':'добавить теги')+'</button>':'');
    h1.insertAdjacentElement('afterend',d);
  }
  app.querySelectorAll('button[data-a="like"]').forEach(b=>{
    const a=b.parentElement;
    if(a.dataset.pl)return;
    a.dataset.pl='1';
    const l=document.createElement('button');
    l.type='button';l.className='lk';l.dataset.a='plink';l.dataset.i=b.dataset.i;l.textContent='ссылка';
    a.appendChild(l);
  });
  const arts=[...app.querySelectorAll('article.post')];
  const n=Math.max(1,Math.ceil(arts.length/PS));
  const x=k[3]||'';
  let p=1,target=null;
  if(popGol(id))p=n;
  else if(/^\d+$/.test(x))p=+x;
  else if(/^p\d+$/.test(x)){
    const b=app.querySelector('button[data-a="like"][data-i="'+x.slice(1)+'"]');
    const it=b&&b.closest('.item');
    const a=it&&it.closest('article.post');
    if(a){p=Math.floor(arts.indexOf(a)/PS)+1;target=it}
  }
  p=Math.min(Math.max(1,p),n);
  if(n>1)setPage(id,p,false);
  else quotes();
  if(target){
    target.scrollIntoView({block:'start'});
    target.classList.add('flash');
    setTimeout(()=>target.classList.remove('flash'),2600);
  }
}
const _thread=thread;
thread=async function(id){
  await _thread(id);
  try{await extra(id)}catch(x){}
};

const _board=board;
board=async function(id){
  await _board(id);
  if(location.hash!=='#/b/'+id)return;
  const row=app.querySelector('.row');
  if(!row||row.querySelector('[data-a="bsub"]'))return;
  let on=false;
  if(me){
    const r=await sb.from('board_subs').select('board_id').eq('board_id',id).eq('user_id',me.id).maybeSingle();
    on=!!r.data;
  }
  if(row.querySelector('[data-a="bsub"]'))return;
  const b=document.createElement('button');
  b.type='button';b.className='btn';b.dataset.a='bsub';b.dataset.i=id;b.dataset.v=on?'1':'0';
  b.textContent=on?'отписаться от раздела':'подписаться на раздел';
  row.appendChild(b);
};

const _notifs=notifs;
notifs=async function(){
  await _notifs();
  if(!me)return;
  const r=await sb.from('notifications').select('id,data').eq('user_id',me.id).eq('kind','newt').limit(100);
  (r.data||[]).forEach(x=>{
    const a=app.querySelector('a.ni[data-i="'+x.id+'"]');
    if(!a||!a.firstElementChild)return;
    const d=x.data||{};
    a.firstElementChild.innerHTML='<b>'+esc(d.n||'участник')+'</b> создал тему «'+esc(d.t||'')+'» в разделе «'+esc(d.b||'')+'»';
  });
};

async function topPage(){
  app.innerHTML='<p><a href="#/">форум</a> / топ участников</p><h1>топ участников</h1><p class="mu">по рейтингу, как в профиле</p><div id="tp"><p class="mu">загрузка</p></div>';
  const pr=await sb.from('profiles').select('id').limit(1000);
  const ids=(pr.data||[]).map(x=>x.id);
  if(!ids.length){$('#tp').innerHTML='<p class="mu">участников пока нет</p>';return}
  const rt=await sb.rpc('user_ratings',{ids});
  if(rt.error){$('#tp').innerHTML='<p class="mu">'+esc(rt.error.message)+'</p>';return}
  const rows=(rt.data||[]).map(x=>({author:x.id,r:+x.r})).filter(x=>x.r>0).sort((a,b)=>b.r-a.r).slice(0,30);
  if(!rows.length){$('#tp').innerHTML='<p class="mu">пока ни у кого нет рейтинга</p>';return}
  await withProf(rows);
  if(!$('#tp'))return;
  $('#tp').innerHTML=rows.map((x,i)=>'<a class="trow" href="#/u/'+esc(x.author)+'"><div><strong><span class="rk">'+(i+1)+'</span>'+who(x.profiles,false)+'</strong><span class="mu">'+esc(lvl(x.r))+'</span></div><div class="n">рейтинг: '+x.r+'</div></a>').join('');
}
async function tagPage(tag){
  app.innerHTML='<p><a href="#/">форум</a> / теги</p><h1>#'+esc(tag)+'</h1><div id="tl"><p class="mu">загрузка</p></div>';
  const r=await sb.from('threads').select('*,posts(count)').contains('tags',[tag]).order('bumped_at',{ascending:false}).limit(100);
  if(r.error){$('#tl').innerHTML='<p class="mu">'+esc(r.error.message)+'</p>';return}
  const ts=r.data||[];
  await withProf(ts);
  if(!$('#tl'))return;
  $('#tl').innerHTML=ts.map(window.rowHtml).join('')||'<p class="mu">тем с таким тегом нет</p>';
}
const _home=home;
home=async function(){
  const k=location.hash.slice(1).split('/');
  if(k[1]==='top'){await topPage();return}
  if(k[1]==='tag'){await tagPage(dec(k[2]).toLowerCase());return}
  await _home();
  homeLinks();
};

function homeLinks(){
  const h=location.hash;
  if(h&&h!=='#'&&h!=='#/')return;
  const g=$('#gsf');
  if(!g||$('#lnk'))return;
  g.insertAdjacentHTML('afterend','<p id="lnk" class="lnks"><a class="chip" href="#/top">топ участников</a></p>');
}
function tagInput(){
  const t=$('#nt');
  if(!t||$('#ntg'))return;
  t.insertAdjacentHTML('afterend','<input id="ntg" maxlength="120" placeholder="теги через запятую, до 5 (необязательно)">');
}
function quotes(){
  app.querySelectorAll('blockquote.qt:not([data-cq])').forEach(q=>{
    if(q.offsetParent===null)return;
    q.dataset.cq='1';
    if(q.scrollHeight<=160)return;
    q.classList.add('cl');
    const b=document.createElement('button');
    b.type='button';b.className='lk qx';b.dataset.a='qx';b.textContent='показать полностью';
    q.insertAdjacentElement('afterend',b);
  });
}
new MutationObserver(()=>{homeLinks();tagInput();quotes()}).observe(app,{childList:true,subtree:true});

document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.id==='rf'){
    const m=location.hash.match(/^#\/t\/(\d+)/);
    if(m)ss.set('f3gol',JSON.stringify({id:+m[1],t:Date.now()}));
  }
  if(f.id==='nf'){
    const tg=$('#ntg');
    ss.set('f3pt',JSON.stringify({v:parseTags(tg?tg.value:''),title:$('#nt')?$('#nt').value.trim():'',t:Date.now()}));
  }
},true);

document.addEventListener('click',async e=>{
  const tg=e.target.closest('.tg[data-t]');
  if(tg){
    e.preventDefault();
    e.stopPropagation();
    location.hash='#/tag/'+encodeURIComponent(tg.dataset.t);
    return;
  }
  const b=e.target.closest('[data-a]');
  if(!b)return;
  const a=b.dataset.a;
  const m=location.hash.match(/^#\/t\/(\d+)/);
  if(a==='pgo'&&m){
    setPage(+m[1],+b.dataset.i,true);
  }
  else if(a==='plink'&&m){
    const url=location.origin+location.pathname+'#/t/'+m[1]+'/p'+b.dataset.i;
    try{
      await navigator.clipboard.writeText(url);
      b.textContent='скопировано';
      setTimeout(()=>{b.textContent='ссылка'},1500);
    }catch(x){prompt('ссылка на сообщение',url)}
  }
  else if(a==='tgedit'&&m){
    const n=prompt('теги через запятую, до 5 штук',b.dataset.v||'');
    if(n===null)return;
    const r=await sb.rpc('set_tags',{tid:+m[1],tg:parseTags(n)});
    if(r.error)return alert(r.error.message);
    thread(+m[1]);
  }
  else if(a==='bsub'){
    if(!await need())return;
    const on=b.dataset.v==='1',id=+b.dataset.i;
    const r=on
      ?await sb.from('board_subs').delete().eq('board_id',id).eq('user_id',me.id)
      :await sb.from('board_subs').insert({board_id:id});
    if(r.error)return alert(r.error.message);
    b.dataset.v=on?'0':'1';
    b.textContent=on?'подписаться на раздел':'отписаться от раздела';
  }
  else if(a==='qx'){
    const q=b.previousElementSibling;
    if(!q)return;
    const c=q.classList.toggle('cl');
    b.textContent=c?'показать полностью':'свернуть';
  }
});

route();
})();
