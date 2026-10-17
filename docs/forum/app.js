const sb=supabase.createClient(CFG.url,CFG.key);
const app=document.getElementById('app'),bar=document.getElementById('bar');
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>new Date(t).toLocaleString('ru',{dateStyle:'short',timeStyle:'short'});
const bg=r=>'linear-gradient('+(+r.angle)+'deg,'+esc(r.c1)+','+esc(r.c2)+')';
const who=p=>{
  const r=p&&p.roles;
  const nm='<b class="un'+(r?' g':'')+'"'+(r?' style="background-image:'+bg(r)+'"':'')+'>'+esc(p?p.name:'удалён')+'</b>';
  const bd=r?'<span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span>':'';
  return nm+bd;
};
let me=null,prof=null,editing=null;

async function auth(){
  const {data}=await sb.auth.getSession();
  me=data.session?data.session.user:null;
  prof=null;
  if(me){
    const r=await sb.from('profiles').select('*,roles(*)').eq('id',me.id).maybeSingle();
    prof=r.data;
  }
  drawBar();
}

function drawBar(){
  if(me){
    bar.innerHTML='<span>'+who(prof)+'</span><button class="lk" data-a="rename">сменить имя</button>'+(prof&&prof.is_admin?'<a href="#/admin">управление</a>':'')+'<button class="lk" data-a="out">выйти</button>';
  }else{
    bar.innerHTML='<span class="mu">войти:</span><button class="btn s" data-a="anon">анонимно</button><button class="btn s" data-a="oauth" data-i="github">github</button><button class="btn s" data-a="emailf">email</button><form id="ef" hidden><input id="em" type="email" placeholder="email" autocomplete="username" required><input id="pw" type="password" placeholder="пароль" autocomplete="current-password" required><button class="btn s p">войти</button></form>';
  }
}

async function need(){
  if(me)return true;
  const r=await sb.auth.signInAnonymously();
  if(r.error){alert(r.error.message);return false}
  await auth();
  return true;
}

async function withProf(rows){
  if(!rows.length)return rows;
  const k=['author','user_id','created_by','author_id'].find(x=>x in rows[0]);
  const ids=[...new Set(rows.map(r=>r[k]).filter(Boolean))];
  const m={};
  if(ids.length){
    const {data}=await sb.from('profiles').select('id,name,roles(*)').in('id',ids);
    (data||[]).forEach(x=>m[x.id]=x);
  }
  rows.forEach(r=>r.profiles=m[r[k]]||null);
  return rows;
}

async function home(){
  const {data,error}=await sb.from('boards').select('*,threads(count)').order('pos');
  if(error)throw error;
  app.innerHTML='<h1>форум</h1><p class="mu">предложения, вопросы и обсуждение cloudos.</p><div class="grid">'+
    (data.map(b=>'<a class="card" href="#/b/'+b.id+'"><strong>'+esc(b.title)+'</strong><span>'+esc(b.descr)+'</span><em>тем: '+b.threads[0].count+'</em></a>').join('')||'<p class="mu">разделов пока нет</p>')+'</div>';
}

async function board(id){
  const {data:b,error}=await sb.from('boards').select('*').eq('id',id).single();
  if(error)throw error;
  app.innerHTML='<p><a href="#/">форум</a> / '+esc(b.title)+'</p><h1>'+esc(b.title)+'</h1><p class="mu">'+esc(b.descr)+'</p>'+
    '<div class="row"><input id="q" placeholder="поиск по темам"><button class="btn p" data-a="newt">новая тема</button></div>'+
    '<form id="nf" hidden><input id="nt" maxlength="150" minlength="3" placeholder="заголовок" required><textarea id="nb" rows="6" maxlength="10000" placeholder="текст" required></textarea><button class="btn p">создать тему</button></form><div id="tl"></div>';
  const draw=async()=>{
    let r=sb.from('threads').select('*,posts(count)').eq('board_id',id).order('pinned',{ascending:false}).order('bumped_at',{ascending:false}).limit(100);
    const v=$('#q').value.trim().replace(/[%_,]/g,'');
    if(v)r=r.ilike('title','%'+v+'%');
    const {data:ts,error:e}=await r;
    if(e){$('#tl').innerHTML='<p class="mu">'+esc(e.message)+'</p>';return}
    await withProf(ts);
    $('#tl').innerHTML=ts.map(t=>'<a class="trow" href="#/t/'+t.id+'"><div><strong>'+(t.pinned?'<span class="tag">закреплено</span>':'')+(t.locked?'<span class="tag">закрыто</span>':'')+esc(t.title)+'</strong>'+who(t.profiles)+'</div><div class="n">ответов: '+Math.max(0,t.posts[0].count-1)+'<br>'+fmt(t.bumped_at)+'</div></a>').join('')||'<p class="mu">тем пока нет</p>';
  };
  $('#q').oninput=draw;
  $('#nf').onsubmit=async e=>{
    e.preventDefault();
    const btn=$('#nf button');
    btn.disabled=true;
    try{
      if(!await need())return;
      const t=await sb.from('threads').insert({board_id:id,title:$('#nt').value.trim()}).select('id').single();
      if(t.error)return alert('не удалось создать тему: '+t.error.message);
      const p=await sb.from('posts').insert({thread_id:t.data.id,body:$('#nb').value.trim()});
      if(p.error){await sb.from('threads').delete().eq('id',t.data.id);return alert('не удалось создать сообщение: '+p.error.message)}
      location.hash='#/t/'+t.data.id;
    }catch(x){alert(x.message||x)}
    finally{btn.disabled=false}
  };
  await draw();
}

async function thread(id){
  const {data:t,error}=await sb.from('threads').select('*,boards(id,title)').eq('id',id).single();
  if(error)throw error;
  const {data:ps,error:e2}=await sb.from('posts').select('*,likes(count)').eq('thread_id',id).order('created_at');
  if(e2)throw e2;
  await withProf(ps);
  let mine=new Set();
  if(me&&ps.length){
    const l=await sb.from('likes').select('post_id').eq('user_id',me.id).in('post_id',ps.map(p=>p.id));
    mine=new Set((l.data||[]).map(x=>x.post_id));
  }
  const adm=prof&&prof.is_admin;
  const closed=t.locked&&!adm;
  const acts=(p,c)=>{
    const own=me&&p.author===me.id;
    return '<div class="acts"><button class="lk'+(mine.has(p.id)?' on':'')+'" data-a="like" data-i="'+p.id+'" data-v="'+(mine.has(p.id)?1:0)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6z"/></svg><span>'+p.likes[0].count+'</span></button>'+(!c&&!closed?'<button class="lk" data-a="cm" data-i="'+p.id+'">комментировать</button>':'')+(own||adm?'<button class="lk" data-a="editp" data-i="'+p.id+'">изменить</button><button class="lk" data-a="delp" data-i="'+p.id+'">удалить</button>':'')+'</div>';
  };
  const ctl=adm?'<div class="acts"><button class="lk" data-a="pin" data-i="'+t.id+'" data-v="'+(t.pinned?1:0)+'">'+(t.pinned?'открепить':'закрепить')+'</button><button class="lk" data-a="lock" data-i="'+t.id+'" data-v="'+(t.locked?1:0)+'">'+(t.locked?'открыть':'закрыть')+'</button><button class="lk" data-a="delt" data-i="'+t.id+'" data-b="'+t.boards.id+'">удалить тему</button></div>':'';
  app.innerHTML='<p><a href="#/">форум</a> / <a href="#/b/'+t.boards.id+'">'+esc(t.boards.title)+'</a></p><h1>'+(t.pinned?'<span class="tag">закреплено</span>':'')+(t.locked?'<span class="tag">закрыто</span>':'')+esc(t.title)+'</h1>'+ctl+
    ps.filter(p=>!p.parent_id).map(p=>{
      const kids=ps.filter(c=>c.parent_id===p.id);
      return '<article class="post item"><div class="side">'+who(p.profiles)+'<span class="mu">'+fmt(p.created_at)+'</span></div><div><div class="txt">'+esc(p.body)+'</div>'+acts(p)+kids.map(c=>'<div class="cm item"><div class="ch">'+who(c.profiles)+'<span class="mu">'+fmt(c.created_at)+'</span></div><div class="txt">'+esc(c.body)+'</div>'+acts(c,true)+'</div>').join('')+'<div class="cwrap" data-w="'+p.id+'"></div></div></article>';
    }).join('')+
    (t.locked&&!adm?'<p class="mu">тема закрыта, отвечать нельзя.</p>':'<form id="rf"><textarea id="rb" rows="5" maxlength="10000" placeholder="ответ" required></textarea><button class="btn p">ответить</button></form>');
  const rf=$('#rf');
  if(rf)rf.onsubmit=async e=>{
    e.preventDefault();
    if(!await need())return;
    const r=await sb.from('posts').insert({thread_id:id,body:$('#rb').value.trim()});
    if(r.error)return alert(r.error.message);
    thread(id);
  };
  app.dataset.t=id;
}

async function admin(){
  if(!(prof&&prof.is_admin)){app.innerHTML='<div class="warn"><b>нет доступа</b>эта страница только для администратора.</div>';return}
  const cnt=t=>sb.from(t).select('id',{count:'exact',head:true});
  const [r1,r2,r3,r4,c1,c2,c3]=await Promise.all([
    sb.from('roles').select('*').order('id'),
    sb.from('profiles').select('id,name,role_id,is_admin').order('created_at',{ascending:false}).limit(100),
    sb.from('boards').select('*').order('pos'),
    sb.from('threads').select('id,title,pinned,locked,board_id,boards(title)').order('bumped_at',{ascending:false}).limit(50),
    cnt('profiles'),cnt('threads'),cnt('posts')
  ]);
  const roles=r1.data||[],users=r2.data||[],boards=r3.data||[],threads=r4.data||[];
  const er=roles.find(r=>r.id===editing)||{name:'',c1:'#3b5fa8',c2:'#9cc8f2',angle:90};
  app.innerHTML='<h1>управление</h1><div class="stat"><div><b>'+(c1.count||0)+'</b><span>участников</span></div><div><b>'+(c2.count||0)+'</b><span>тем</span></div><div><b>'+(c3.count||0)+'</b><span>сообщений</span></div></div><h2>роли</h2>'+
    '<form id="rf2"><div class="adm"><label>название<input id="rn" maxlength="24" value="'+esc(er.name)+'" required></label><label>цвет 1<input id="c1" type="color" value="'+esc(er.c1)+'"></label><label>цвет 2<input id="c2" type="color" value="'+esc(er.c2)+'"></label><label>угол <span id="av">'+er.angle+'</span>°<input id="an" type="range" min="0" max="360" value="'+er.angle+'"></label></div>'+
    '<div class="pv"><span id="pv" class="badge"></span></div><div class="row"><button class="btn p">'+(editing?'сохранить роль':'создать роль')+'</button>'+(editing?'<button type="button" class="btn" data-a="rcancel">отмена</button>':'')+'</div></form>'+
    roles.map(r=>'<div class="ur"><span><span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span></span><span><button class="lk" data-a="redit" data-i="'+r.id+'">изменить</button><button class="lk" data-a="rdel" data-i="'+r.id+'">удалить</button></span></div>').join('')+
    '<h2>участники</h2>'+
    users.map(u=>'<div class="ur"><span>'+esc(u.name)+'</span><select data-a="setrole" data-i="'+u.id+'"><option value="">без роли</option>'+roles.map(r=>'<option value="'+r.id+'"'+(u.role_id===r.id?' selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select></div>').join('')+
    '<h2>удаление пользователей</h2><div class="row"><input id="uq" placeholder="поиск по нику"></div><div id="ul"></div>'+
    '<h2>темы</h2>'+
    (threads.map(t=>'<div class="ur"><span><a href="#/t/'+t.id+'">'+esc(t.title)+'</a> <span class="mu">'+esc(t.boards?t.boards.title:'')+'</span>'+(t.pinned?' <span class="tag">закреплено</span>':'')+(t.locked?' <span class="tag">закрыто</span>':'')+'</span><span><button class="lk" data-a="pin" data-i="'+t.id+'" data-v="'+(t.pinned?1:0)+'">'+(t.pinned?'открепить':'закрепить')+'</button><button class="lk" data-a="lock" data-i="'+t.id+'" data-v="'+(t.locked?1:0)+'">'+(t.locked?'открыть':'закрыть')+'</button><button class="lk" data-a="delt" data-i="'+t.id+'" data-b="'+t.board_id+'">удалить</button></span></div>').join('')||'<p class="mu">тем пока нет</p>')+
    '<h2>разделы</h2>'+
    boards.map(b=>'<div class="ur"><span>'+esc(b.title)+'</span><span><button class="lk" data-a="bren" data-i="'+b.id+'" data-v="'+esc(b.title)+'">переименовать</button><button class="lk" data-a="bdel" data-i="'+b.id+'">удалить</button></span></div>').join('')+
    '<form id="bf"><div class="row"><input id="bt" placeholder="название раздела" required><input id="bd" placeholder="описание"><button class="btn p">добавить раздел</button></div></form>';
  const pv=()=>{
    $('#av').textContent=$('#an').value;
    const p=$('#pv');
    p.textContent=$('#rn').value||'роль';
    p.style.backgroundImage='linear-gradient('+$('#an').value+'deg,'+$('#c1').value+','+$('#c2').value+')';
  };
  ['rn','c1','c2','an'].forEach(i=>$('#'+i).oninput=pv);
  pv();
  const du=()=>{
    const q=$('#uq').value.trim().toLowerCase();
    const l=users.filter(u=>u.id!==me.id&&!u.is_admin&&String(u.name||'').toLowerCase().includes(q)).slice(0,30);
    $('#ul').innerHTML=l.map(u=>'<div class="ur"><span>'+esc(u.name)+' <span class="mu">'+esc(String(u.id).slice(0,8))+'</span></span><button class="lk" data-a="udel" data-i="'+u.id+'" data-v="'+esc(u.name)+'">удалить навсегда</button></div>').join('')||'<p class="mu">никого не найдено</p>';
  };
  $('#uq').oninput=du;
  du();
  $('#rf2').onsubmit=async e=>{
    e.preventDefault();
    const v={name:$('#rn').value.trim(),c1:$('#c1').value,c2:$('#c2').value,angle:+$('#an').value};
    const r=editing?await sb.from('roles').update(v).eq('id',editing):await sb.from('roles').insert(v);
    if(r.error)return alert(r.error.message);
    editing=null;
    admin();
  };
  $('#bf').onsubmit=async e=>{
    e.preventDefault();
    const r=await sb.from('boards').insert({title:$('#bt').value.trim(),descr:$('#bd').value.trim(),pos:boards.length+1});
    if(r.error)return alert(r.error.message);
    admin();
  };
}

async function route(){
  const k=location.hash.slice(1).split('/');
  app.innerHTML='<p class="mu">загрузка</p>';
  try{
    if(k[1]==='b')await board(+k[2]);
    else if(k[1]==='t')await thread(+k[2]);
    else if(k[1]==='admin')await admin();
    else await home();
  }catch(e){
    app.innerHTML='<div class="warn"><b>ошибка</b>'+esc(e.message)+'</div>';
  }
}

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-a]');
  if(!b||b.tagName==='SELECT')return;
  const a=b.dataset.a,i=b.dataset.i,v=b.dataset.v;
  if(a==='anon'){const r=await sb.auth.signInAnonymously();if(r.error)return alert(r.error.message);await auth();route()}
  else if(a==='oauth'){const r=await sb.auth.signInWithOAuth({provider:i,options:{redirectTo:location.href.split('#')[0]}});if(r.error)alert(r.error.message)}
  else if(a==='emailf'){const f=$('#ef');f.hidden=!f.hidden;if(!f.hidden)$('#em').focus()}
  else if(a==='out'){await sb.auth.signOut();await auth();route()}
  else if(a==='rename'){const n=prompt('новое имя (2-24 символа)',prof?prof.name:'');if(n){const r=await sb.rpc('set_name',{n});if(r.error)return alert(r.error.message);await auth();route()}}
  else if(a==='cm'){
    const w=b.closest('article').querySelector('.cwrap');
    if(w.firstChild){w.innerHTML='';return}
    w.innerHTML='<form class="cf" data-p="'+i+'"><textarea rows="3" maxlength="5000" placeholder="комментарий" required></textarea><button class="btn s p">отправить</button></form>';
    w.querySelector('textarea').focus();
  }
  else if(a==='newt'){const f=$('#nf');f.hidden=!f.hidden}
  else if(a==='like'){
    if(!await need())return;
    const r=v==='1'?await sb.from('likes').delete().eq('post_id',i).eq('user_id',me.id):await sb.from('likes').insert({post_id:+i});
    if(r.error)return alert(r.error.message);
    const sp=b.querySelector('span'),c=+sp.textContent;
    b.dataset.v=v==='1'?'0':'1';
    b.classList.toggle('on',v!=='1');
    sp.textContent=v==='1'?Math.max(0,c-1):c+1;
  }
  else if(a==='editp'){
    const old=b.closest('.item').querySelector('.txt').textContent;
    const n=prompt('изменить сообщение',old);
    if(n&&n.trim()){const r=await sb.from('posts').update({body:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);thread(+app.dataset.t)}
  }
  else if(a==='delp'){if(confirm('удалить сообщение?')){const r=await sb.from('posts').delete().eq('id',i);if(r.error)return alert(r.error.message);thread(+app.dataset.t)}}
  else if(a==='pin'||a==='lock'){const r=await sb.from('threads').update(a==='pin'?{pinned:v!=='1'}:{locked:v!=='1'}).eq('id',i);if(r.error)return alert(r.error.message);if(location.hash==='#/admin')admin();else thread(+i)}
  else if(a==='delt'){if(confirm('удалить тему целиком?')){const r=await sb.from('threads').delete().eq('id',i);if(r.error)return alert(r.error.message);if(location.hash==='#/admin')admin();else location.hash='#/b/'+b.dataset.b}}
  else if(a==='redit'){editing=+i;admin()}
  else if(a==='rcancel'){editing=null;admin()}
  else if(a==='udel'){
    if(!confirm('удалить '+v+' полностью из базы вместе с темами и сообщениями? это нельзя отменить'))return;
    const r=await sb.rpc('admin_delete_user',{uid:i});
    if(r.error)return alert('не удалось удалить: '+r.error.message);
    admin();
  }
  else if(a==='rdel'){if(confirm('удалить роль?')){const r=await sb.from('roles').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bren'){const n=prompt('новое название',v);if(n){const r=await sb.from('boards').update({title:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bdel'){if(confirm('удалить раздел со всеми темами?')){const r=await sb.from('boards').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
});

document.addEventListener('change',async e=>{
  const s=e.target;
  if(s.dataset&&s.dataset.a==='setrole'){
    const r=await sb.rpc('set_role',{u:s.dataset.i,r:s.value?+s.value:null});
    if(r.error)alert(r.error.message);
  }
});

document.addEventListener('submit',async e=>{
  if(e.target.classList.contains('cf')){
    e.preventDefault();
    const f=e.target,btn=f.querySelector('button');
    btn.disabled=true;
    try{
      if(!await need())return;
      const r=await sb.from('posts').insert({thread_id:+app.dataset.t,parent_id:+f.dataset.p,body:f.querySelector('textarea').value.trim()});
      if(r.error)return alert(r.error.message);
      thread(+app.dataset.t);
    }catch(x){alert(x.message||x)}
    finally{btn.disabled=false}
    return;
  }
  if(e.target.id!=='ef')return;
  e.preventDefault();
  const r=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});
  if(r.error)return alert(r.error.message);
  await auth();
  route();
});

window.addEventListener('hashchange',route);
auth().then(route);
