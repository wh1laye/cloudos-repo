(function(){
const RX=['👍','👎','😂','😮','😢','🎉','🔥','🤔','👀','🙏'];
const RXD={};
const clr=new Set();
const ls={
  get:k=>{try{return localStorage.getItem(k)}catch(x){return null}},
  set:(k,v)=>{try{localStorage.setItem(k,v);return true}catch(x){return false}},
  del:k=>{try{localStorage.removeItem(k)}catch(x){}}
};
const dec=s=>{try{return decodeURIComponent(s||'')}catch(x){return s||''}};

function rxHtml(i,open){
  const l=RXD[i]||[],m={};
  l.forEach(x=>{
    const o=m[x.emoji]||(m[x.emoji]={n:0,me:false});
    o.n++;
    if(me&&x.user_id===me.id)o.me=true;
  });
  let h=RX.filter(e=>m[e]).map(e=>'<button type="button" class="rx'+(m[e].me?' on':'')+'" data-a="rx" data-i="'+i+'" data-e="'+e+'">'+e+'<span>'+m[e].n+'</span></button>').join('');
  h+='<button type="button" class="lk" data-a="rxp" data-i="'+i+'">реакция</button>';
  if(open)h+='<span class="rxp">'+RX.map(e=>'<button type="button" data-a="rx" data-i="'+i+'" data-e="'+e+'">'+e+'</button>').join('')+'</span>';
  return h;
}

async function enh(id){
  if(location.hash!=='#/t/'+id)return;
  const bs=[...app.querySelectorAll('button[data-a="like"]')];
  if(!bs.length)return;
  const ids=bs.map(b=>+b.dataset.i);
  const [r,h]=await Promise.all([
    sb.from('reactions').select('post_id,emoji,user_id').in('post_id',ids),
    sb.from('post_edits').select('post_id').in('post_id',ids)
  ]);
  if(location.hash!=='#/t/'+id)return;
  const hs=new Set((h.data||[]).map(x=>x.post_id));
  ids.forEach(i=>{RXD[i]=[]});
  (r.data||[]).forEach(x=>{(RXD[x.post_id]=RXD[x.post_id]||[]).push(x)});
  bs.forEach(b=>{
    const i=+b.dataset.i,a=b.parentElement;
    if(a.dataset.e2)return;
    a.dataset.e2='1';
    if(!r.error){
      const s=document.createElement('span');
      s.className='rxs';
      s.dataset.p=i;
      s.innerHTML=rxHtml(i);
      b.insertAdjacentElement('afterend',s);
    }
    if(hs.has(i)){
      const t=document.createElement('button');
      t.type='button';t.className='lk';t.dataset.a='hist';t.dataset.i=i;t.textContent='история правок';
      a.appendChild(t);
    }
  });
}

const _thread=thread;
thread=async function(id){
  await _thread(id);
  try{await enh(id)}catch(x){}
};

function rowHtml(t){
  const u=window.isUnread&&window.isUnread(t);
  return '<a class="trow'+(u?' unr':'')+'" href="#/t/'+t.id+'"><div><strong>'+(u?'<i class="ud"></i>':'')+pfx(t)+(t.pinned?'<span class="tag">закреплено</span>':'')+(t.locked?'<span class="tag">закрыто</span>':'')+esc(t.title)+'</strong>'+(window.tagsHtml?window.tagsHtml(t):'')+who(t.profiles,false)+'</div><div class="n">ответов: '+Math.max(0,t.posts[0].count-1)+'<br>'+fmt(t.bumped_at)+'</div></a>';
}
window.rowHtml=rowHtml;

function sortUi(id){
  const q=$('#q');
  if(!q||$('#srt'))return;
  const O=[['act','по активности'],['new','сначала новые'],['pop','по числу ответов'],['no','без ответов'],['sv','решённые']];
  const sel=document.createElement('select');
  sel.id='srt';
  sel.innerHTML=O.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('');
  const sv=ls.get('tsort');
  sel.value=O.some(o=>o[0]===sv)?sv:'act';
  q.insertAdjacentElement('afterend',sel);
  let tok=0;
  const draw=async()=>{
    const my=++tok,m=sel.value;
    let r=sb.from('threads').select('*,posts(count)').eq('board_id',id).limit(100);
    if(m==='sv')r=r.eq('solved',true);
    if(m==='act'||m==='new')r=r.order('pinned',{ascending:false});
    r=m==='new'?r.order('id',{ascending:false}):r.order('bumped_at',{ascending:false});
    const v=q.value.trim().replace(/[%_,]/g,'');
    if(v)r=r.ilike('title','%'+v+'%');
    const {data,error}=await r;
    if(my!==tok||!$('#tl'))return;
    if(error){$('#tl').innerHTML='<p class="mu">'+esc(error.message)+'</p>';return}
    let ts=data||[];
    await withProf(ts);
    if(my!==tok||!$('#tl'))return;
    const n=t=>Math.max(0,t.posts[0].count-1);
    if(m==='pop')ts.sort((a,b)=>n(b)-n(a));
    if(m==='no')ts=ts.filter(t=>n(t)===0);
    $('#tl').innerHTML=ts.map(rowHtml).join('')||'<p class="mu">тем нет</p>';
  };
  q.oninput=draw;
  sel.onchange=()=>{ls.set('tsort',sel.value);draw()};
  draw();
}

const _board=board;
board=async function(id){
  await _board(id);
  if(location.hash==='#/b/'+id)sortUi(id);
};

function sbox(q){
  return '<form id="gsf" class="row"><input id="gs" maxlength="100" placeholder="поиск по темам, сообщениям и участникам" value="'+esc(q||'')+'"><button class="btn p">найти</button></form>';
}

function hl(s,v){
  const i=s.toLowerCase().indexOf(v.toLowerCase());
  if(i<0)return esc(s.slice(0,160));
  const a=Math.max(0,i-50),e=Math.min(s.length,i+v.length+110);
  return (a?'…':'')+esc(s.slice(a,i))+'<mark>'+esc(s.slice(i,i+v.length))+'</mark>'+esc(s.slice(i+v.length,e))+(e<s.length?'…':'');
}

async function search(q){
  const v=q.trim().replace(/[%_,]/g,'');
  app.innerHTML='<p><a href="#/">форум</a> / поиск</p><h1>поиск</h1>'+sbox(q)+'<div id="sr"></div>';
  const out=$('#sr');
  if(v.length<2){out.innerHTML='<p class="mu">введи минимум два символа</p>';return}
  out.innerHTML='<p class="mu">поиск</p>';
  const L='%'+v+'%';
  const [t,p,u]=await Promise.all([
    sb.from('threads').select('id,title,prefix,solved').ilike('title',L).order('id',{ascending:false}).limit(20),
    sb.from('posts').select('id,body,author,thread_id,created_at').ilike('body',L).order('created_at',{ascending:false}).limit(30),
    sb.from('profiles').select('id,name,status,avatar_url,roles(*)').ilike('name',L).limit(20)
  ]);
  if(!$('#sr'))return;
  const ps=p.data||[];
  const tm={};
  (t.data||[]).forEach(x=>{tm[x.id]=x});
  const need2=[...new Set(ps.map(x=>x.thread_id))].filter(x=>!tm[x]);
  if(need2.length)((await sb.from('threads').select('id,title,prefix,solved').in('id',need2)).data||[]).forEach(x=>{tm[x.id]=x});
  await withProf(ps);
  const sec=(h,b,e)=>'<h2>'+h+'</h2>'+(b||'<p class="mu">'+(e||'ничего не найдено')+'</p>');
  const th=(t.data||[]).map(x=>'<a class="trow" href="#/t/'+x.id+'"><div><strong>'+pfx(x)+esc(x.title)+'</strong></div></a>').join('');
  const pm=ps.filter(x=>tm[x.thread_id]).map(x=>{
    const s=x.body.replace(/\[img:[^\]]*\]/g,'[картинка]').replace(/\s+/g,' ');
    return '<a class="trow" href="#/t/'+x.thread_id+'"><div><strong>'+pfx(tm[x.thread_id])+esc(tm[x.thread_id].title)+'</strong><span class="sn">'+hl(s,v)+'</span></div><div class="n">'+who(x.profiles,false)+'<br>'+fmt(x.created_at)+'</div></a>';
  }).join('');
  const us=(u.data||[]).map(x=>'<div>'+who(x)+'</div>').join('');
  out.innerHTML=sec('темы',th)+sec('сообщения',pm)+sec('участники',us?'<div class="srm">'+us+'</div>':'');
}

const _home=home;
home=async function(){
  const k=location.hash.slice(1).split('/');
  if(k[1]==='search'){await search(dec(k[2]));return}
  await _home();
  homeBox();
};
function homeBox(){
  const h=location.hash;
  if(h&&h!=='#'&&h!=='#/')return;
  if($('#gsf'))return;
  const p=app.querySelector('p.mu');
  if(p)p.insertAdjacentHTML('afterend',sbox(''));
}

function dkey(el){
  if(!el||!el.tagName)return '';
  const f=el.closest('form');
  if(!f)return '';
  let n='';
  if(el.id==='rb'||el.id==='nb'||el.id==='nt')n=el.id;
  else if(el.id==='dmb'||el.id==='pcb')n=el.id;
  else if(f.classList.contains('cf')&&el.tagName==='TEXTAREA')n='cf'+f.dataset.p;
  else if(f.classList.contains('edf')&&el.tagName==='TEXTAREA'){
    const ac=f.nextElementSibling,bt=ac&&ac.querySelector('[data-a="ped"]');
    if(bt)n='ed'+bt.dataset.i;
  }
  return n?'dr:'+location.hash+':'+n:'';
}
function drafts(){
  app.querySelectorAll('form textarea,form input').forEach(el=>{
    if(el.dataset.dr)return;
    const k=dkey(el);
    if(!k)return;
    el.dataset.dr='1';
    if(clr.has(k)){clr.delete(k);ls.del(k);return}
    const v=ls.get(k);
    if(el.closest('form').classList.contains('edf')){
      if(v&&v!==el.value){el.value=v;dnote(el,'черновик восстановлен')}
      return;
    }
    if(v&&!el.value){el.value=v;dnote(el,'черновик восстановлен')}
  });
}
const dtm={},del2={};
function dbase(el){
  const f=el.closest('form');
  if(f&&f.classList.contains('edf')){const tx=f.previousElementSibling;return (tx&&tx.dataset.raw)||''}
  return '';
}
function dnote(el,txt){
  const f=el.closest('form'),tb=f&&f.querySelector('.tb');
  if(!tb)return;
  let n=tb.querySelector('.dsv');
  if(!n){
    n=document.createElement('span');
    n.className='mu dsv';
    n.style.cssText='margin-left:auto;font-size:12px;transition:opacity .3s';
    tb.appendChild(n);
  }
  n.textContent=txt;
  n.style.opacity='1';
  clearTimeout(n._t);
  n._t=setTimeout(()=>{n.style.opacity='0'},1800);
}
function dsave(el,k){
  clearTimeout(dtm[k]);
  delete dtm[k];delete del2[k];
  const v=el.value;
  if(!v||v===dbase(el)){ls.del(k);return}
  if(ls.set(k,v))dnote(el,'черновик сохранён');
}
function dflush(){
  Object.keys(dtm).forEach(k=>{const el=del2[k];if(el)dsave(el,k)});
}
window.addEventListener('pagehide',dflush);
window.addEventListener('hashchange',dflush);
document.addEventListener('visibilitychange',()=>{if(document.hidden)dflush()});
function pbtn(){
  app.querySelectorAll('form textarea').forEach(t=>{
    if(t.id==='pbio'||t.id==='npo'||t.dataset.pv)return;
    const tb=t.nextElementSibling;
    if(!tb||!tb.classList.contains('tb'))return;
    t.dataset.pv='1';
    const b=document.createElement('button');
    b.type='button';b.className='lk';b.dataset.a='prev';b.textContent='предпросмотр';
    tb.appendChild(b);
  });
}
new MutationObserver(()=>{
  homeBox();
  drafts();
  pbtn();
}).observe(app,{childList:true,subtree:true});

function pv(p,ta){
  p.innerHTML=ta.value.trim()?fmtBody(ta.value):'<span class="mu">пусто</span>';
  delete p.dataset.fx;
}

document.addEventListener('input',e=>{
  const el=e.target,k=dkey(el);
  if(k){
    clr.delete(k);
    clearTimeout(dtm[k]);
    del2[k]=el;
    dtm[k]=setTimeout(()=>dsave(el,k),500);
  }
  if(el.tagName==='TEXTAREA')app.querySelectorAll('.prv').forEach(p=>{
    if(p._ta!==el)return;
    clearTimeout(p._t);
    p._t=setTimeout(()=>pv(p,el),300);
  });
});

document.addEventListener('submit',e=>{
  if(e.target.id==='gsf'){
    e.preventDefault();
    e.stopImmediatePropagation();
    const q=$('#gs').value.trim();
    if(q)location.hash='#/search/'+encodeURIComponent(q);
    return;
  }
  e.target.querySelectorAll('textarea,input').forEach(el=>{
    const k=dkey(el);
    if(!k)return;
    clearTimeout(dtm[k]);
    delete dtm[k];delete del2[k];
    clr.add(k);
    setTimeout(()=>{clr.delete(k);if(!el.isConnected||!el.value)ls.del(k)},6000);
  });
},true);

document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('[data-a="edx"]');
  if(!b)return;
  const f=b.closest('form'),ta=f&&f.querySelector('textarea'),k=dkey(ta);
  if(k){clearTimeout(dtm[k]);delete dtm[k];delete del2[k];ls.del(k)}
},true);

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-a]');
  if(!b)return;
  const a=b.dataset.a;
  if(a==='rxp'){
    const s=b.closest('.rxs');
    s.innerHTML=rxHtml(+s.dataset.p,!s.querySelector('.rxp'));
  }
  else if(a==='rx'){
    const s=b.closest('.rxs'),i=+b.dataset.i,em=b.dataset.e;
    if(!await need())return;
    const mine=(RXD[i]||[]).some(x=>x.emoji===em&&x.user_id===me.id);
    const r=mine
      ?await sb.from('reactions').delete().eq('post_id',i).eq('user_id',me.id).eq('emoji',em)
      :await sb.from('reactions').insert({post_id:i,emoji:em});
    if(r.error)return alert(r.error.message);
    RXD[i]=(RXD[i]||[]).filter(x=>!(x.emoji===em&&x.user_id===me.id));
    if(!mine)RXD[i].push({post_id:i,emoji:em,user_id:me.id});
    s.innerHTML=rxHtml(i);
  }
  else if(a==='hist'){
    const ac=b.parentElement,nx=ac.nextElementSibling;
    if(nx&&nx.classList.contains('hist')){nx.remove();return}
    const r=await sb.from('post_edits').select('body,at').eq('post_id',+b.dataset.i).order('at',{ascending:false}).limit(30);
    const d=document.createElement('div');
    d.className='hist';
    d.innerHTML=r.error
      ?'<p class="mu">'+esc(r.error.message)+'</p>'
      :'<p class="mu">прошлые версии, от новых к старым</p>'+((r.data||[]).map(x=>'<div class="hv"><span class="mu">'+fmt(x.at)+'</span><div class="hb">'+esc(x.body)+'</div></div>').join('')||'<p class="mu">правок нет</p>');
    ac.insertAdjacentElement('afterend',d);
  }
  else if(a==='prev'){
    const tb=b.closest('.tb');
    let ta=tb.previousElementSibling;
    if(!ta||ta.tagName!=='TEXTAREA')ta=(b.closest('form')||document).querySelector('textarea');
    if(!ta)return;
    let p=tb.nextElementSibling;
    if(p&&p.classList.contains('prv')){p.remove();return}
    p=document.createElement('div');
    p.className='txt prv';
    p._ta=ta;
    tb.insertAdjacentElement('afterend',p);
    pv(p,ta);
  }
});

})();
