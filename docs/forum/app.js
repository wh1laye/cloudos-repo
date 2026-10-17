if(typeof supabase==='undefined'){
  document.getElementById('app').innerHTML='<div class="warn"><b>ошибка</b>не загрузился supabase.js, обнови страницу</div>';
  throw new Error('supabase missing');
}
const sb=supabase.createClient(CFG.url,CFG.key);

function captcha(){
  if(!CFG.ts)return Promise.resolve(undefined);
  return new Promise((res,rej)=>{
    const o=document.createElement('div');
    o.className='capb';
    o.innerHTML='<div class="capc"><p>подтверди, что ты человек</p><div id="capw"></div><button class="btn s" type="button">отмена</button></div>';
    document.body.appendChild(o);
    let id;
    const done=(f,v)=>{
      try{window.turnstile.remove(id)}catch(x){}
      o.remove();
      f(v);
    };
    o.querySelector('button').onclick=()=>done(rej,new Error('отменено'));
    const start=()=>{
      id=window.turnstile.render('#capw',{
        sitekey:CFG.ts,
        callback:t=>done(res,t),
        'error-callback':()=>done(rej,new Error('капча не прошла, обнови страницу'))
      });
    };
    if(window.turnstile)start();
    else{const w=setInterval(()=>{if(window.turnstile){clearInterval(w);start()}},100)}
  });
}

async function anonIn(){
  let t;
  try{t=await captcha()}catch(x){return {error:x}}
  return sb.auth.signInAnonymously(t?{options:{captchaToken:t}}:undefined);
}

async function passIn(email,password){
  let t;
  try{t=await captcha()}catch(x){return {error:x}}
  return sb.auth.signInWithPassword(t?{email,password,options:{captchaToken:t}}:{email,password});
}
const app=document.getElementById('app'),bar=document.getElementById('bar');
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>new Date(t).toLocaleString('ru',{dateStyle:'short',timeStyle:'short'});
const col=c=>/^#[0-9a-fA-F]{3,8}$/.test(c)?c:'#3b5fa8';
const bg=r=>'linear-gradient('+((+r.angle)||0)+'deg,'+col(r.c1)+','+col(r.c2)+')';
const safeUrl=u=>/^https:\/\/[^\s"'()<>\\]{1,500}$/.test(u||'')?u:'';
const bgB=u=>'linear-gradient('+((+u.bangle)||90)+'deg,'+col(u.b1)+','+col(u.b2)+')';
const bannerStyle=u=>{
  const l=safeUrl(u.burl);
  return 'background-image:'+(l?"url('"+l+"'),":'')+bgB(u)+';background-size:cover;background-position:center';
};
const who=(p,ln)=>{
  const r=p&&p.roles;
  let nm='<b class="un'+(r?' g':'')+'"'+(r?' style="background-image:'+bg(r)+'"':'')+'>'+esc(p?p.name:'удалён')+'</b>';
  if(ln!==false&&p&&p.id)nm='<a class="nl" href="#/u/'+esc(p.id)+'">'+nm+'</a>';
  const st=p&&p.status?'<span class="st">'+esc(p.status)+'</span>':'';
  const bd=r?'<span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span>':'';
  return nm+st+bd;
};
let me=null,prof=null,editing=null;
const can=k=>!!(prof&&(prof.is_admin||(prof.perms||[]).includes(k)||((prof.roles&&prof.roles.perms)||[]).includes(k)));
const PERMS=[['pin','закреплять темы'],['lock','закрывать и открывать темы'],['delete_threads','удалять темы'],['delete_posts','удалять чужие сообщения'],['delete_comments','удалять комментарии в профилях'],['assign_roles','выдавать роли без прав'],['mute','мутить участников'],['ban','банить участников']];
const permBoxes=(cls,sel)=>PERMS.map(x=>'<label class="pm"><input type="checkbox" class="'+cls+'" value="'+x[0]+'"'+((sel||[]).includes(x[0])?' checked':'')+'>'+x[1]+'</label>').join('');
const active=t=>!!t&&new Date(t)>new Date();
const till=t=>new Date(t).getFullYear()>=9999?'навсегда':fmt(t);
const parseDur=s=>{
  s=String(s).trim().toLowerCase();
  if(/^(навсегда|perm|forever)$/.test(s))return -1;
  const m=s.match(/^(\d{1,4})\s*([mhdмчд])$/);
  if(!m)return null;
  return +m[1]*({m:1,'м':1,h:60,'ч':60,d:1440,'д':1440}[m[2]]);
};
const restricted=()=>{
  if(!prof)return '';
  if(active(prof.banned_until))return 'ваш аккаунт заблокирован: '+till(prof.banned_until)+(prof.ban_reason?'. причина: '+prof.ban_reason:'');
  if(active(prof.muted_until))return 'вы в муте: '+till(prof.muted_until)+(prof.mute_reason?'. причина: '+prof.mute_reason:'');
  return '';
};
const missing=m=>/function|schema cache|does not exist/i.test(m||'');
async function mod(name,args,fb){
  const r=await sb.rpc(name,args);
  if(r.error&&missing(r.error.message)&&fb)return fb();
  return r;
}

let ch=null,pk=null,online={};
function meta(){
  if(me&&prof){
    const r=prof.roles;
    return {id:me.id,name:prof.name,status:prof.status||'',roles:r?{name:r.name,c1:r.c1,c2:r.c2,angle:r.angle}:null};
  }
  return {guest:1};
}
function renderOnline(){
  const el=$('#onl');
  if(!el)return;
  const list=Object.values(online).flat();
  const seen=new Set(),us=[];
  let g=0;
  list.forEach(m=>{if(m.id){if(!seen.has(m.id)){seen.add(m.id);us.push(m)}}else g++});
  el.innerHTML='<h2>онлайн</h2><p class="mu">участников: '+us.length+(g?', гостей: '+g:'')+'</p><div class="onl">'+us.map(u=>'<a class="oc" href="#/u/'+esc(u.id)+'">'+who(u,false)+'</a>').join('')+'</div>';
}
function presence(){
  try{
    const key=me?me.id:(pk&&pk[0]==='g'?pk:'g'+Math.random().toString(36).slice(2,10));
    if(ch&&pk===key){ch.track(meta());return}
    if(ch)sb.removeChannel(ch);
    pk=key;
    online={};
    const c=sb.channel('cloudos-online',{config:{presence:{key}}});
    ch=c;
    c.on('presence',{event:'sync'},()=>{online=c.presenceState();renderOnline()});
    c.subscribe(st=>{if(st==='SUBSCRIBED')c.track(meta())});
  }catch(x){}
}

async function auth(){
  const wait=new Promise(r=>setTimeout(()=>r({data:{session:null}}),4000));
  const {data}=await Promise.race([sb.auth.getSession().catch(()=>({data:{session:null}})),wait]);
  me=data.session?data.session.user:null;
  prof=null;
  if(me){
    const r=await sb.from('profiles').select('*,roles(*)').eq('id',me.id).maybeSingle();
    prof=r.data;
  }
  drawBar();
  presence();
}

function drawBar(){
  if(me){
    bar.innerHTML='<span>'+who(prof)+'</span><a href="#/u/'+esc(me.id)+'">профиль</a><button class="lk" data-a="rename">сменить имя</button>'+(prof&&prof.is_admin?'<a href="#/admin">управление</a>':'')+(can('mute')||can('ban')?'<a href="#/mod/'+(can('mute')?'mutes':'bans')+'">модерация</a>':'')+(prof&&active(prof.muted_until)?'<span class="tag">мут до '+esc(till(prof.muted_until))+'</span>':'')+'<button class="lk" data-a="out">выйти</button>';
  }else{
    bar.innerHTML='<span class="mu">войти:</span><button class="btn s" data-a="anon">анонимно</button><button class="btn s" data-a="oauth" data-i="github">github</button><button class="btn s" data-a="emailf">email</button><form id="ef" hidden><input id="em" type="email" placeholder="email" autocomplete="username" required><input id="pw" type="password" placeholder="пароль" autocomplete="current-password" required><button class="btn s p">войти</button><button class="btn s" type="button" data-a="signup">регистрация</button></form>';
  }
}

async function need(){
  if(!me){
    const r=await anonIn();
    if(r.error){alert(r.error.message);return false}
    await auth();
  }else if(prof){
    const x=await sb.from('profiles').select('muted_until,mute_reason,banned_until,ban_reason').eq('id',me.id).maybeSingle();
    if(x.data)Object.assign(prof,x.data);
  }
  const w=restricted();
  if(w){alert(w);return false}
  return true;
}

async function withProf(rows){
  if(!rows.length)return rows;
  const k=['author','user_id','created_by','author_id'].find(x=>x in rows[0]);
  const ids=[...new Set(rows.map(r=>r[k]).filter(Boolean))];
  const m={};
  if(ids.length){
    let x=await sb.from('profiles').select('id,name,status,roles(*)').in('id',ids);
    if(x.error)x=await sb.from('profiles').select('id,name,roles(*)').in('id',ids);
    (x.data||[]).forEach(y=>m[y.id]=y);
  }
  rows.forEach(r=>r.profiles=m[r[k]]||null);
  return rows;
}

async function home(){
  const {data,error}=await sb.from('boards').select('*,threads(count)').order('pos');
  if(error)throw error;
  app.innerHTML='<h1>форум</h1><p class="mu">предложения, вопросы и обсуждение cloudos.</p><div class="grid">'+
    (data.map(b=>'<a class="card" href="#/b/'+b.id+'"><strong>'+esc(b.title)+'</strong><span>'+esc(b.descr)+'</span><em>тем: '+b.threads[0].count+'</em></a>').join('')||'<p class="mu">разделов пока нет</p>')+'</div><div id="onl" class="onlw"></div>';
  renderOnline();
}

async function board(id){
  const {data:b,error}=await sb.from('boards').select('*').eq('id',id).single();
  if(error)throw error;
  app.innerHTML='<p><a href="#/">форум</a> / '+esc(b.title)+'</p><h1>'+esc(b.title)+'</h1><p class="mu">'+esc(b.descr)+'</p>'+
    '<div class="row"><input id="q" placeholder="поиск по темам"><button class="btn p" data-a="newt">новая тема</button></div>'+
    '<form id="nf" hidden><input id="nt" maxlength="150" minlength="3" placeholder="заголовок" required><textarea id="nb" rows="6" maxlength="10000" placeholder="текст" required></textarea>'+tools('nb')+'<button class="btn p">создать тему</button></form><div id="tl"></div>';
  const draw=async()=>{
    let r=sb.from('threads').select('*,posts(count)').eq('board_id',id).order('pinned',{ascending:false}).order('bumped_at',{ascending:false}).limit(100);
    const v=$('#q').value.trim().replace(/[%_,]/g,'');
    if(v)r=r.ilike('title','%'+v+'%');
    const {data:ts,error:e}=await r;
    if(e){$('#tl').innerHTML='<p class="mu">'+esc(e.message)+'</p>';return}
    await withProf(ts);
    $('#tl').innerHTML=ts.map(t=>'<a class="trow" href="#/t/'+t.id+'"><div><strong>'+(t.pinned?'<span class="tag">закреплено</span>':'')+(t.locked?'<span class="tag">закрыто</span>':'')+esc(t.title)+'</strong>'+who(t.profiles,false)+'</div><div class="n">ответов: '+Math.max(0,t.posts[0].count-1)+'<br>'+fmt(t.bumped_at)+'</div></a>').join('')||'<p class="mu">тем пока нет</p>';
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
  const closed=t.locked&&!(adm||can('lock'));
  const acts=(p,c)=>{
    const own=me&&p.author===me.id;
    return '<div class="acts"><button class="lk'+(mine.has(p.id)?' on':'')+'" data-a="like" data-i="'+p.id+'" data-v="'+(mine.has(p.id)?1:0)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6z"/></svg><span>'+p.likes[0].count+'</span></button>'+(!c&&!closed?'<button class="lk" data-a="cm" data-i="'+p.id+'">комментировать</button>':'')+(own||adm?'<button class="lk" data-a="editp" data-i="'+p.id+'">изменить</button>':'')+(own||can('delete_posts')?'<button class="lk" data-a="delp" data-i="'+p.id+'" data-o="'+(own?1:0)+'">удалить</button>':'')+'</div>';
  };
  const ctl=can('pin')||can('lock')||can('delete_threads')?'<div class="acts">'+(can('pin')?'<button class="lk" data-a="pin" data-i="'+t.id+'" data-v="'+(t.pinned?1:0)+'">'+(t.pinned?'открепить':'закрепить')+'</button>':'')+(can('lock')?'<button class="lk" data-a="lock" data-i="'+t.id+'" data-v="'+(t.locked?1:0)+'">'+(t.locked?'открыть':'закрыть')+'</button>':'')+(can('delete_threads')?'<button class="lk" data-a="delt" data-i="'+t.id+'" data-b="'+t.boards.id+'">удалить тему</button>':'')+'</div>':'';
  app.innerHTML='<p><a href="#/">форум</a> / <a href="#/b/'+t.boards.id+'">'+esc(t.boards.title)+'</a></p><h1>'+(t.pinned?'<span class="tag">закреплено</span>':'')+(t.locked?'<span class="tag">закрыто</span>':'')+esc(t.title)+'</h1>'+ctl+
    ps.filter(p=>!p.parent_id).map(p=>{
      const kids=ps.filter(c=>c.parent_id===p.id);
      return '<article class="post item"><div class="side">'+who(p.profiles)+'<span class="mu">'+fmt(p.created_at)+'</span></div><div><div class="txt" data-raw="'+esc(p.body)+'">'+fmtBody(p.body)+'</div>'+acts(p)+kids.map(c=>'<div class="cm item"><div class="ch">'+who(c.profiles)+'<span class="mu">'+fmt(c.created_at)+'</span></div><div class="txt" data-raw="'+esc(c.body)+'">'+fmtBody(c.body)+'</div>'+acts(c,true)+'</div>').join('')+'<div class="cwrap" data-w="'+p.id+'"></div></div></article>';
    }).join('')+
    (closed?'<p class="mu">тема закрыта, отвечать нельзя.</p>':'<form id="rf"><textarea id="rb" rows="5" maxlength="10000" placeholder="ответ" required></textarea>'+tools('rb')+'<button class="btn p">ответить</button></form>');
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

async function profile(id){
  const r=await sb.from('profiles').select('*,roles(*)').eq('id',id).maybeSingle();
  if(r.error)throw r.error;
  const u=r.data;
  if(!u){app.innerHTML='<div class="warn"><b>не найдено</b>такого участника нет.</div>';return}
  const pc=await sb.from('posts').select('id',{count:'exact',head:true}).eq('author',id);
  const cm=await sb.from('profile_comments').select('*').eq('profile_id',id).order('created_at',{ascending:false}).limit(100);
  let cs=[],cerr='';
  if(cm.error)cerr=cm.error.message;
  else{cs=cm.data||[];await withProf(cs)}
  const own=me&&me.id===id;
  let rl=[];
  if(prof&&prof.is_admin&&!own){
    const x=await sb.from('roles').select('id,name').order('id');
    rl=x.data||[];
  }
  const edit=own?'<form id="pf" hidden><label>о себе<textarea id="pbio" rows="4" maxlength="500">'+esc(u.bio||'')+'</textarea></label><label>статус (эмодзи или пара слов)<input id="pst" maxlength="16" value="'+esc(u.status||'')+'"></label>'+tools('pst',true)+
    '<div class="adm"><label>баннер, цвет 1<input id="pb1" type="color" value="'+col(u.b1)+'"></label><label>баннер, цвет 2<input id="pb2" type="color" value="'+col(u.b2)+'"></label><label>угол <span id="pav2">'+((+u.bangle)||90)+'</span>°<input id="pan" type="range" min="0" max="360" value="'+((+u.bangle)||90)+'"></label></div>'+
    '<label>картинка баннера (ссылка https, необязательно)<input id="pbu" maxlength="500" value="'+esc(safeUrl(u.burl))+'" placeholder="https://..."></label><div class="row"><button class="btn p">сохранить</button><button type="button" class="btn" data-a="pedit">отмена</button></div></form>':'';
  const modrow=prof&&prof.is_admin&&!own?'<div class="row mod"><select data-a="setrole" data-i="'+esc(id)+'"><option value="">без роли</option>'+rl.map(x=>'<option value="'+x.id+'"'+(u.role_id===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select><button class="btn s" data-a="adm" data-i="'+esc(id)+'" data-v="'+(u.is_admin?1:0)+'">'+(u.is_admin?'снять админа':'сделать админом')+'</button>'+(u.is_admin?'':'<button class="btn s" data-a="udel" data-i="'+esc(id)+'" data-v="'+esc(u.name)+'">удалить</button>')+'</div>':'';
  const canS=!own&&!u.is_admin&&(can('mute')||can('ban'));
  const sb1=(k,label,undo,un)=>'<button class="btn s" data-a="'+(un?'unsanc':'sanc')+'" data-k="'+k+'" data-i="'+esc(id)+'" data-v="'+esc(u.name)+'">'+(un?undo:label)+'</button>';
  const sanrow=canS?'<div class="row mod">'+(can('mute')?sb1('mute','замутить','снять мут',active(u.muted_until)):'')+(can('ban')?sb1('ban','забанить','снять бан',active(u.banned_until)):'')+'</div>':'';
  const clist=cs.map(c=>'<div class="pcm item"><div class="ch">'+who(c.profiles)+'<span class="mu">'+fmt(c.created_at)+'</span></div><div class="txt">'+fmtBody(c.body)+'</div>'+((me&&(c.author===me.id||own))||can('delete_comments')?'<div class="acts"><button class="lk" data-a="pcdel" data-i="'+c.id+'">удалить</button></div>':'')+'</div>').join('')||'<p class="mu">комментариев пока нет</p>';
  app.innerHTML='<p><a href="#/">форум</a> / участник</p><div class="pb"><div class="pbn" style="'+bannerStyle(u)+'"></div><div class="pbd"><div class="pav" style="background-image:'+bgB(u)+'">'+esc(String(u.name||'?').slice(0,1).toUpperCase())+'</div><div class="pn">'+who(u,false)+(u.is_admin?'<span class="tag">админ</span>':'')+(active(u.muted_until)?'<span class="tag">мут до '+esc(till(u.muted_until))+'</span>':'')+(active(u.banned_until)?'<span class="tag">бан до '+esc(till(u.banned_until))+'</span>':'')+'</div>'+
    (u.bio?'<p class="bio">'+esc(u.bio)+'</p>':'<p class="mu">пока ничего о себе не написал.</p>')+
    '<div class="pst2"><span><b>'+(pc.count||0)+'</b> сообщений</span><span>на форуме с '+new Date(u.created_at).toLocaleDateString('ru')+'</span></div>'+
    (own?'<div class="row"><button class="btn" data-a="pedit">изменить профиль</button></div>':'')+modrow+sanrow+'</div></div>'+edit+
    '<h2>комментарии</h2>'+(cerr?'<div class="warn"><b>комментарии недоступны</b>'+esc(cerr)+'</div>':'<form id="pcf"><textarea id="pcb" rows="3" maxlength="1000" placeholder="написать участнику" required></textarea>'+tools('pcb')+'<button class="btn p">отправить</button></form>'+clist);
  app.dataset.u=id;
  if(own){
    const up=()=>{
      $('#pav2').textContent=$('#pan').value;
      const pn=document.querySelector('.pbn'),pa=document.querySelector('.pav');
      const o={b1:$('#pb1').value,b2:$('#pb2').value,bangle:$('#pan').value,burl:$('#pbu').value};
      pn.style.cssText=bannerStyle(o);
      pa.style.backgroundImage=bgB(o);
    };
    ['pb1','pb2','pan','pbu'].forEach(k=>$('#'+k).oninput=up);
  }
}

async function admin(){
  if(!(prof&&prof.is_admin)){app.innerHTML='<div class="warn"><b>нет доступа</b>эта страница только для администратора.</div>';return}
  const cnt=t=>sb.from(t).select('id',{count:'exact',head:true});
  const [r1,r3,r4,c1,c2,c3]=await Promise.all([
    sb.from('roles').select('*').order('id'),
    sb.from('boards').select('*').order('pos'),
    sb.from('threads').select('id,title,pinned,locked,board_id,boards(title)').order('bumped_at',{ascending:false}).limit(50),
    cnt('profiles'),cnt('threads'),cnt('posts')
  ]);
  const roles=r1.data||[],boards=r3.data||[],threads=r4.data||[];
  const er=roles.find(r=>r.id===editing)||{name:'',c1:'#3b5fa8',c2:'#9cc8f2',angle:90,perms:[]};
  app.innerHTML='<h1>управление</h1><p class="mu"><a href="#/mod/mutes">панель мутов</a> · <a href="#/mod/bans">панель банов</a></p><div class="stat"><div><b>'+(c1.count||0)+'</b><span>участников</span></div><div><b>'+(c2.count||0)+'</b><span>тем</span></div><div><b>'+(c3.count||0)+'</b><span>сообщений</span></div></div>'+
    '<h2>участники</h2><div class="row"><input id="uq" placeholder="поиск по нику"></div><div id="ul"></div>'+
    '<h2>роли</h2>'+
    '<form id="rf2"><div class="adm"><label>название<input id="rn" maxlength="24" value="'+esc(er.name)+'" required></label><label>цвет 1<input id="c1" type="color" value="'+col(er.c1)+'"></label><label>цвет 2<input id="c2" type="color" value="'+col(er.c2)+'"></label><label>угол <span id="av">'+((+er.angle)||0)+'</span>°<input id="an" type="range" min="0" max="360" value="'+((+er.angle)||0)+'"></label></div>'+
    '<div class="pv"><span id="pv" class="badge"></span></div><p class="mu">права этой роли</p><div class="pms">'+permBoxes('rp',er.perms)+'</div><div class="row"><button class="btn p">'+(editing?'сохранить роль':'создать роль')+'</button>'+(editing?'<button type="button" class="btn" data-a="rcancel">отмена</button>':'')+'</div></form>'+
    roles.map(r=>'<div class="ur"><span><span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span> <span class="mu">'+((r.perms||[]).length?'прав: '+r.perms.length:'без прав')+'</span></span><span><button class="lk" data-a="redit" data-i="'+r.id+'">изменить</button><button class="lk" data-a="rdel" data-i="'+r.id+'">удалить</button></span></div>').join('')+
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
  const loadUsers=async()=>{
    const q=$('#uq').value.trim().replace(/[%_,]/g,'');
    const mk=f=>{let r=sb.from('profiles').select(f).order('created_at',{ascending:false}).limit(50);if(q)r=r.ilike('name','%'+q+'%');return r};
    let x=await mk('id,name,role_id,is_admin,perms');
    if(x.error)x=await mk('id,name,role_id,is_admin');
    const l=x.data||[];
    $('#ul').innerHTML=l.map(u=>{
      const self=u.id===me.id;
      return '<div class="ur"><span><a href="#/u/'+esc(u.id)+'">'+esc(u.name)+'</a> '+(u.is_admin?'<span class="tag">админ</span>':'')+((u.perms||[]).length?'<span class="tag">прав: '+u.perms.length+'</span>':'')+'</span><span class="ctl">'+
        '<select data-a="setrole" data-i="'+esc(u.id)+'"><option value="">без роли</option>'+roles.map(r=>'<option value="'+r.id+'"'+(u.role_id===r.id?' selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select>'+
        (self?'<span class="tag">это ты</span>':'<button class="lk" data-a="perms" data-i="'+esc(u.id)+'">права</button><button class="lk" data-a="adm" data-i="'+esc(u.id)+'" data-v="'+(u.is_admin?1:0)+'">'+(u.is_admin?'снять админа':'сделать админом')+'</button>'+(u.is_admin?'':'<button class="lk" data-a="udel" data-i="'+esc(u.id)+'" data-v="'+esc(u.name)+'">удалить</button>'))+
        '</span></div>'+(self?'':'<div class="pe" id="pe-'+esc(u.id)+'" hidden><div class="pms">'+permBoxes('up',u.perms)+'</div><button class="btn s p" data-a="psave" data-i="'+esc(u.id)+'">сохранить права</button></div>');
    }).join('')||'<p class="mu">никого не найдено</p>';
  };
  let tm=null;
  $('#uq').oninput=()=>{clearTimeout(tm);tm=setTimeout(loadUsers,250)};
  await loadUsers();
  $('#rf2').onsubmit=async e=>{
    e.preventDefault();
    const v={name:$('#rn').value.trim(),c1:$('#c1').value,c2:$('#c2').value,angle:+$('#an').value};
    const r=editing?await sb.from('roles').update(v).eq('id',editing):await sb.from('roles').insert(v).select('id').single();
    if(r.error)return alert(r.error.message);
    const rid=editing||r.data.id;
    const p=[...document.querySelectorAll('.rp:checked')].map(x=>x.value);
    const pr=await sb.rpc('set_role_perms',{rid,p});
    if(pr.error&&!(missing(pr.error.message)&&!p.length))return alert(pr.error.message);
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

let selUser=null;

async function modPanel(kind){
  if(!(can('mute')||can('ban'))){app.innerHTML='<div class="warn"><b>нет доступа</b>нужно право мутить или банить.</div>';return}
  const k=kind==='bans'?'ban':'mute';
  if(!can(k)){app.innerHTML='<div class="warn"><b>нет доступа</b>у тебя нет права '+(k==='ban'?'банить':'мутить')+'.</div>';return}
  const f=k==='ban'?'banned_until':'muted_until',rf=k==='ban'?'ban_reason':'mute_reason';
  const [a,l]=await Promise.all([
    sb.from('profiles').select('id,name,'+f+','+rf).gt(f,new Date().toISOString()).order(f,{ascending:true}).limit(100),
    sb.from('sanction_log').select('*').in('kind',k==='ban'?['ban','unban']:['mute','unmute']).order('created_at',{ascending:false}).limit(40)
  ]);
  if(a.error||l.error){app.innerHTML='<div class="warn"><b>панель недоступна</b>'+esc((a.error||l.error).message)+'. запусти forum_v3.sql в supabase.</div>';return}
  const act=a.data||[],log=l.data||[];
  const ids=[...new Set(log.flatMap(r=>[r.actor,r.target]).filter(Boolean))];
  const nm={};
  if(ids.length){const x=await sb.from('profiles').select('id,name').in('id',ids);(x.data||[]).forEach(y=>nm[y.id]=y.name)}
  const lnk=id=>'<a href="#/u/'+esc(id)+'">'+esc(nm[id]||'удалён')+'</a>';
  const kinds={mute:'мут',unmute:'снят мут',ban:'бан',unban:'снят бан'};
  const tabs='<p class="tabs">'+(can('mute')?'<a class="'+(k==='mute'?'on':'')+'" href="#/mod/mutes">муты</a>':'')+(can('ban')?'<a class="'+(k==='ban'?'on':'')+'" href="#/mod/bans">баны</a>':'')+'</p>';
  app.innerHTML='<h1>'+(k==='ban'?'панель банов':'панель мутов')+'</h1>'+tabs+
    '<h2>'+(k==='ban'?'забанить':'замутить')+'</h2><div class="row"><input id="msq" placeholder="найти участника по нику"></div><div id="msr"></div>'+
    '<form id="msf" data-k="'+k+'"><div id="msel" class="mu">никто не выбран</div><div class="row"><select id="mdur"><option value="10">10 минут</option><option value="60">1 час</option><option value="1440" selected>1 день</option><option value="10080">7 дней</option><option value="43200">30 дней</option><option value="-1">навсегда</option></select><input id="mrs" maxlength="200" placeholder="причина"><button class="btn p">применить</button></div></form>'+
    '<h2>сейчас активны</h2>'+
    (act.map(u=>'<div class="ur"><span><a href="#/u/'+esc(u.id)+'">'+esc(u.name)+'</a> <span class="tag">до '+till(u[f])+'</span> <span class="mu">'+esc(u[rf]||'')+'</span></span><button class="lk" data-a="unsanc" data-k="'+k+'" data-i="'+esc(u.id)+'">снять</button></div>').join('')||'<p class="mu">никого</p>')+
    '<h2>история</h2>'+
    (log.map(r=>'<div class="ur"><span>'+lnk(r.target)+' <span class="tag">'+kinds[r.kind]+'</span> '+(r.until&&(r.kind==='mute'||r.kind==='ban')?'<span class="mu">до '+till(r.until)+'</span> ':'')+'<span class="mu">'+esc(r.reason||'')+'</span></span><span class="mu">'+lnk(r.actor)+', '+fmt(r.created_at)+'</span></div>').join('')||'<p class="mu">пока пусто</p>');
  let tm=null;
  $('#msq').oninput=()=>{
    clearTimeout(tm);
    tm=setTimeout(async()=>{
      const q=$('#msq').value.trim().replace(/[%_,]/g,'');
      if(!q){$('#msr').innerHTML='';return}
      const x=await sb.from('profiles').select('id,name,is_admin').ilike('name','%'+q+'%').limit(8);
      $('#msr').innerHTML=(x.data||[]).filter(u=>!u.is_admin&&u.id!==me.id).map(u=>'<div class="ur"><span>'+esc(u.name)+'</span><button class="lk" data-a="msel" data-i="'+esc(u.id)+'" data-v="'+esc(u.name)+'">выбрать</button></div>').join('')||'<p class="mu">никого не найдено</p>';
    },250);
  };
}

async function route(){
  const k=location.hash.slice(1).split('/');
  app.innerHTML='<p class="mu">загрузка</p>';
  selUser=null;
  if(prof&&active(prof.banned_until)){
    app.innerHTML='<div class="warn"><b>аккаунт заблокирован</b>'+esc(restricted())+'</div><div class="row"><button class="btn" data-a="out">выйти</button></div>';
    return;
  }
  try{
    if(k[1]==='b')await board(+k[2]);
    else if(k[1]==='t')await thread(+k[2]);
    else if(k[1]==='u')await profile(k[2]);
    else if(k[1]==='mod')await modPanel(k[2]);
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
  if(a==='anon'){const r=await anonIn();if(r.error)return alert(r.error.message);await auth();route()}
  else if(a==='oauth'){const r=await sb.auth.signInWithOAuth({provider:i,options:{redirectTo:location.href.split('#')[0]}});if(r.error)alert(r.error.message)}
  else if(a==='signup'){
    const em=$('#em').value.trim(),pw=$('#pw').value;
    if(!em||pw.length<6)return alert('введи email и пароль от 6 символов');
    let t;
    try{t=await captcha()}catch(x){return alert(x.message)}
    const r=await sb.auth.signUp(t?{email:em,password:pw,options:{captchaToken:t}}:{email:em,password:pw});
    if(r.error)return alert(r.error.message);
    if(!r.data.session)return alert('аккаунт создан, подтверди почту по ссылке из письма и потом войди');
    await auth();
    route();
  }
  else if(a==='emailf'){const f=$('#ef');f.hidden=!f.hidden;if(!f.hidden)$('#em').focus()}
  else if(a==='out'){await sb.auth.signOut();await auth();route()}
  else if(a==='rename'){const n=prompt('новое имя (2-24 символа)',prof?prof.name:'');if(n){const r=await sb.rpc('set_name',{n});if(r.error)return alert(r.error.message);await auth();route()}}
  else if(a==='cm'){
    const w=b.closest('article').querySelector('.cwrap');
    if(w.firstChild){w.innerHTML='';return}
    w.innerHTML='<form class="cf" data-p="'+i+'"><textarea rows="3" maxlength="5000" placeholder="комментарий" required></textarea>'+tools('')+'<button class="btn s p">отправить</button></form>';
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
    const old=b.closest('.item').querySelector('.txt').dataset.raw;
    const n=prompt('изменить сообщение',old);
    if(n&&n.trim()){const r=await sb.from('posts').update({body:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);thread(+app.dataset.t)}
  }
  else if(a==='delp'){
    if(!confirm('удалить сообщение?'))return;
    const direct=()=>sb.from('posts').delete().eq('id',i);
    const r=b.dataset.o==='1'?await direct():await mod('mod_delete_post',{pid:+i},direct);
    if(r.error)return alert(r.error.message);
    thread(+app.dataset.t);
  }
  else if(a==='pin'||a==='lock'){
    const fld=a==='pin'?'pinned':'locked';
    const r=await mod('mod_thread',{tid:+i,fld,val:v!=='1'},()=>sb.from('threads').update({[fld]:v!=='1'}).eq('id',i));
    if(r.error)return alert(r.error.message);
    if(location.hash==='#/admin')admin();else thread(+i);
  }
  else if(a==='delt'){
    if(!confirm('удалить тему целиком?'))return;
    const r=await mod('mod_delete_thread',{tid:+i},()=>sb.from('threads').delete().eq('id',i));
    if(r.error)return alert(r.error.message);
    if(location.hash==='#/admin')admin();else location.hash='#/b/'+b.dataset.b;
  }
  else if(a==='sanc'){
    const kind=b.dataset.k;
    const d=prompt('срок: 10m, 1h, 1d, 7d, 30d или навсегда','1d');
    if(d===null)return;
    const mins=parseDur(d);
    if(mins===null)return alert('неверный срок, пример: 30m, 2h, 3d, навсегда');
    const why=prompt('причина (необязательно)','')||'';
    const r=await sb.rpc(kind==='ban'?'mod_ban':'mod_mute',{uid:i,minutes:mins,reason:why});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='unsanc'){
    if(!confirm('снять ограничение?'))return;
    const r=await sb.rpc(b.dataset.k==='ban'?'mod_unban':'mod_unmute',{uid:i});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='msel'){
    selUser={id:i,name:v};
    $('#msel').innerHTML='выбран: <b>'+esc(v)+'</b>';
  }
  else if(a==='pedit'){const f=$('#pf');if(f)f.hidden=!f.hidden}
  else if(a==='pcdel'){if(confirm('удалить комментарий?')){const r=await sb.from('profile_comments').delete().eq('id',i);if(r.error)return alert(r.error.message);route()}}
  else if(a==='perms'){const e2=document.getElementById('pe-'+i);if(e2)e2.hidden=!e2.hidden}
  else if(a==='psave'){
    const p=[...document.querySelectorAll('#pe-'+i+' .up:checked')].map(x=>x.value);
    const r=await sb.rpc('admin_set_perms',{uid:i,p});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='adm'){
    if(!confirm(v==='1'?'снять права администратора?':'сделать администратором? он получит полный доступ'))return;
    const r=await sb.rpc('admin_set_admin',{uid:i,flag:v!=='1'});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='redit'){editing=+i;admin()}
  else if(a==='rcancel'){editing=null;admin()}
  else if(a==='udel'){
    if(!confirm('удалить '+v+' полностью из базы вместе с темами и сообщениями? это нельзя отменить'))return;
    const r=await sb.rpc('admin_delete_user',{uid:i});
    if(r.error)return alert('не удалось удалить: '+r.error.message);
    if(location.hash.startsWith('#/u/'))location.hash='#/admin';else route();
  }
  else if(a==='rdel'){if(confirm('удалить роль?')){const r=await sb.from('roles').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bren'){const n=prompt('новое название',v);if(n){const r=await sb.from('boards').update({title:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bdel'){if(confirm('удалить раздел со всеми темами?')){const r=await sb.from('boards').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
});

document.addEventListener('change',async e=>{
  const s=e.target;
  if(s.dataset&&s.dataset.a==='setrole'){
    const rid=s.value?+s.value:null;
    const r=await mod('assign_role',{uid:s.dataset.i,rid},()=>sb.rpc('set_role',{u:s.dataset.i,r:rid}));
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
  if(e.target.id==='msf'){
    e.preventDefault();
    if(!selUser)return alert('сначала выбери участника из поиска');
    const kind=e.target.dataset.k;
    const r=await sb.rpc(kind==='ban'?'mod_ban':'mod_mute',{uid:selUser.id,minutes:+$('#mdur').value,reason:$('#mrs').value.trim()});
    if(r.error)return alert(r.error.message);
    route();
    return;
  }
  if(e.target.id==='pcf'){
    e.preventDefault();
    const btn=e.target.querySelector('button.p');
    btn.disabled=true;
    try{
      if(!await need())return;
      const r=await sb.from('profile_comments').insert({profile_id:app.dataset.u,body:$('#pcb').value.trim()});
      if(r.error)return alert(r.error.message);
      route();
    }catch(x){alert(x.message||x)}
    finally{btn.disabled=false}
    return;
  }
  if(e.target.id==='pf'){
    e.preventDefault();
    const r=await sb.rpc('update_my_profile',{p_bio:$('#pbio').value.trim(),p_status:$('#pst').value.trim(),p_b1:$('#pb1').value,p_b2:$('#pb2').value,p_bangle:+$('#pan').value,p_burl:safeUrl($('#pbu').value.trim())});
    if(r.error)return alert(r.error.message);
    await auth();
    route();
    return;
  }
  if(e.target.id!=='ef')return;
  e.preventDefault();
  const r=await passIn($('#em').value.trim(),$('#pw').value);
  if(r.error)return alert(r.error.message);
  await auth();
  route();
});

window.addEventListener('hashchange',route);
route();
auth().catch(()=>{}).then(()=>{drawBar();if(me)route()});
