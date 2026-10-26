if(typeof supabase==='undefined'){
  document.getElementById('app').innerHTML='<div class="warn"><b>ошибка</b>не загрузился supabase.js, обнови страницу</div>';
  throw new Error('supabase missing');
}
const sb=supabase.createClient(CFG.url,CFG.key,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}});
(function(){
  var q=location.hash.replace(/^#/,'')+'&'+location.search.replace(/^\?/,''),m=q.match(/(?:^|&)error_description=([^&]+)/);
  if(m){var t;try{t=decodeURIComponent(m[1].replace(/\+/g,' '))}catch(e){t=m[1]}
    history.replaceState(null,'',location.pathname);
    setTimeout(function(){alert(tr('ошибка входа: ')+t)},400)}
})();

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
const fmt=t=>new Date(t).toLocaleString(LOC(),{dateStyle:'short',timeStyle:'short'});
const col=c=>/^#[0-9a-fA-F]{3,8}$/.test(c)?c:'#3b5fa8';
const bg=r=>'linear-gradient('+((+r.angle)||0)+'deg,'+col(r.c1)+','+col(r.c2)+')';
const safeUrl=u=>/^https:\/\/[^\s"'()<>\\]{1,500}$/.test(u||'')?u:'';
const bgB=u=>'linear-gradient('+((+u.bangle)||90)+'deg,'+col(u.b1)+','+col(u.b2)+')';
const bannerStyle=u=>{
  const l=safeUrl(u.burl);
  return 'background-image:'+(l?"url('"+l+"'),":'')+bgB(u)+';background-size:cover;background-position:center';
};
const av=p=>{const l=p&&safeUrl(p.avatar_url);return l?'<span class="av" style="background-image:url(\''+l+'\')"></span>':''};
const avStyle=u=>{const l=safeUrl(u.avatar_url);return l?"background-image:url('"+l+"');background-size:cover;background-position:center":'background-image:'+bgB(u)};
const PFX=['вопрос','баг','предложение','обсуждение'];
const pfx=t=>(t&&t.prefix?'<span class="tag px">'+esc(tr(t.prefix))+'</span>':'')+(t&&t.solved?'<span class="tag sv">'+tr('решено')+'</span>':'');
const LV=[[100,'ветеран'],[50,'опытный'],[20,'свой'],[5,'участник'],[0,'новичок']];
const lvl=n=>{const x=LV.find(q=>n>=q[0]);return x?tr(x[1]):''};
const tAuth=t=>t.author||t.user_id||t.created_by||t.author_id;
let uiT=null;
function pushUi(){
  if(!me)return;
  clearTimeout(uiT);
  uiT=setTimeout(()=>{const T=window.CloudTheme;sb.rpc('set_ui',{j:T.pack()}).then(r=>{if(r&&r.error)console.warn(r.error.message)})},700);
}
window.CloudTheme.onChange=pushUi;
const who=(p,ln)=>{
  const r=p&&p.roles;
  const hx=/^#[0-9a-fA-F]{6}$/;
  const ng=p&&p.nk_on&&hx.test(p.nk1||'')&&hx.test(p.nk2||'')?'linear-gradient('+((+p.nkangle)||90)+'deg,'+p.nk1+','+p.nk2+')':(r?bg(r):'');
  let nm='<b class="un'+(ng?' g':'')+'"'+(ng?' style="background-image:'+ng+'"':'')+'>'+esc(p?p.name:'удалён')+'</b>';
  if(ln!==false&&p&&p.id)nm='<a class="nl" href="#/u/'+esc(p.id)+'">'+nm+'</a>';
  const st=p&&p.status?'<span class="st">'+esc(p.status)+'</span>':'';
  const bd=r?'<span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span>':'';
  return av(p)+nm+st+bd;
};
let me=null,prof=null,editing=null,avx=false,nch=null,nuid=null,dmch=null,dmuid=null,dmRe=null;
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
  if(active(prof.banned_until))return tr('ваш аккаунт заблокирован: ')+till(prof.banned_until)+(prof.ban_reason?tr('. причина: ')+prof.ban_reason:'');
  if(active(prof.muted_until))return tr('вы в муте: ')+till(prof.muted_until)+(prof.mute_reason?tr('. причина: ')+prof.mute_reason:'');
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
    return {id:me.id,name:prof.name,status:prof.status||'',avatar_url:prof.avatar_url||'',nk_on:!!prof.nk_on,nk1:prof.nk1||'',nk2:prof.nk2||'',nkangle:prof.nkangle||90,roles:r?{name:r.name,c1:r.c1,c2:r.c2,angle:r.angle}:null};
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
    if(prof&&prof.ui&&(+prof.ui.ts||0)>=window.CloudTheme.ts())window.CloudTheme.apply(prof.ui);
    else pushUi();
  }
  drawBar();
  presence();
  watchNotifs();
  watchDms();
}

function drawBar(){
  if(me){
    const ctl=prof&&prof.is_admin?'#/admin':(can('delete_posts')||can('mute')||can('ban')?'#/reports':'');
    bar.innerHTML='<span>'+who(prof)+'</span><a href="#/u/'+esc(me.id)+'">профиль</a><a href="#/bookmarks">закладки</a>'+(ctl?'<a href="'+ctl+'">управление</a>':'')+(prof&&active(prof.muted_until)?'<span class="tag">мут до '+esc(till(prof.muted_until))+'</span>':'');
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
    let x=await sb.from('profiles').select('id,name,status,avatar_url,nk_on,nk1,nk2,nkangle,roles(*)').in('id',ids);
    if(x.error)x=await sb.from('profiles').select('id,name,status,avatar_url,roles(*)').in('id',ids);
    if(x.error)x=await sb.from('profiles').select('id,name,status,roles(*)').in('id',ids);
    if(x.error)x=await sb.from('profiles').select('id,name,roles(*)').in('id',ids);
    (x.data||[]).forEach(y=>m[y.id]=y);
  }
  rows.forEach(r=>r.profiles=m[r[k]]||null);
  return rows;
}

async function home(){
  const {data,error}=await sb.from('boards').select('*,threads(count)').order('pos');
  if(error)throw error;
  const fd=await feed();
  app.innerHTML='<h1>форум</h1><p class="mu">предложения, вопросы и обсуждение cloudos.</p><div class="grid">'+
    (data.map(b=>'<a class="card" href="#/b/'+b.id+'"><i class="ci"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg></i><strong>'+esc(b.title)+'</strong><span>'+esc(b.descr)+'</span><em>тем: '+b.threads[0].count+'</em></a>').join('')||'<p class="mu">разделов пока нет</p>')+'</div>'+fd+'<div id="onl" class="onlw"></div>';
  renderOnline();
}

async function board(id){
  const {data:b,error}=await sb.from('boards').select('*').eq('id',id).single();
  if(error)throw error;
  app.innerHTML='<p><a href="#/">форум</a> / '+esc(b.title)+'</p><h1>'+esc(b.title)+'</h1><p class="mu">'+esc(b.descr)+'</p>'+
    '<div class="row"><input id="q" placeholder="поиск по темам"><button class="btn p" data-a="newt">новая тема</button></div>'+
    '<form id="nf" hidden><select id="npx"><option value="">без префикса</option>'+PFX.map(x=>'<option>'+x+'</option>').join('')+'</select><input id="nt" maxlength="150" minlength="3" placeholder="заголовок" required><textarea id="nb" rows="6" maxlength="10000" placeholder="текст" required></textarea>'+tools('nb')+'<label class="chk"><input id="npl" type="checkbox"> добавить опрос</label><div id="npw" hidden><input id="npq" maxlength="200" placeholder="вопрос опроса"><textarea id="npo" rows="4" placeholder="варианты, каждый с новой строки (от 2 до 10)"></textarea><label class="chk"><input id="npm" type="checkbox"> можно выбрать несколько</label></div><button class="btn p">создать тему</button></form><div id="tl"></div>';
  const draw=async()=>{
    let r=sb.from('threads').select('*,posts(count)').eq('board_id',id).order('pinned',{ascending:false}).order('bumped_at',{ascending:false}).limit(100);
    const v=$('#q').value.trim().replace(/[%_,]/g,'');
    if(v)r=r.ilike('title','%'+v+'%');
    const {data:ts,error:e}=await r;
    if(e){$('#tl').innerHTML='<p class="mu">'+esc(e.message)+'</p>';return}
    await withProf(ts);
    $('#tl').innerHTML=ts.map(t=>'<a class="trow" href="#/t/'+t.id+'"><div><strong>'+pfx(t)+(t.pinned?'<span class="tag">'+tr('закреплено')+'</span>':'')+(t.locked?'<span class="tag">'+tr('закрыто')+'</span>':'')+esc(t.title)+'</strong>'+who(t.profiles,false)+'</div><div class="n">ответов: '+Math.max(0,t.posts[0].count-1)+'<br>'+fmt(t.bumped_at)+'</div></a>').join('')||'<p class="mu">тем пока нет</p>';
  };
  $('#q').oninput=draw;
  $('#npl').onchange=()=>{$('#npw').hidden=!$('#npl').checked};
  $('#nf').onsubmit=async e=>{
    e.preventDefault();
    const btn=$('#nf button');
    btn.disabled=true;
    try{
      if(!await need())return;
      let popts=[];
      if($('#npl').checked){
        popts=$('#npo').value.split('\n').map(x=>x.trim()).filter(Boolean);
        if($('#npq').value.trim().length<3||popts.length<2||popts.length>10)return alert(tr('для опроса нужен вопрос и от 2 до 10 вариантов'));
      }
      const t=await sb.from('threads').insert({board_id:id,title:$('#nt').value.trim(),prefix:$('#npx').value||null}).select('id').single();
      if(t.error)return alert(tr('не удалось создать тему: ')+t.error.message);
      const p=await sb.from('posts').insert({thread_id:t.data.id,body:$('#nb').value.trim()});
      if(p.error){await sb.from('threads').delete().eq('id',t.data.id);return alert(tr('не удалось создать сообщение: ')+p.error.message)}
      if($('#npl').checked){
        const pr=await sb.rpc('create_poll',{tid:t.data.id,q:$('#npq').value.trim(),opts:popts,mlt:$('#npm').checked});
        if(pr.error)alert(tr('тема создана, но опрос не создался: ')+pr.error.message);
      }
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
  const RT={};
  try{
    const aid=[...new Set(ps.map(x=>x.author).filter(Boolean))];
    const ra=await sb.rpc('user_ratings',{ids:aid});
    (ra.data||[]).forEach(x=>RT[x.id]=+x.r);
    if(!ra.error)aid.forEach(x=>{if(RT[x]===undefined)RT[x]=0});
  }catch(x){}
  const lv=u=>RT[u]!==undefined?'<span class="mu lv">'+lvl(RT[u])+'</span>':'';
  const pj=await sb.rpc('poll_info',{tid:id});
  const poll=pj.data||null;
  let sub=false;
  const bm=new Set();
  if(me){
    const s=await sb.from('subs').select('thread_id').eq('thread_id',id).eq('user_id',me.id).maybeSingle();
    sub=!!s.data;
    const b=await sb.from('bookmarks').select('kind,ref_id').eq('thread_id',id).eq('user_id',me.id);
    (b.data||[]).forEach(x=>bm.add(x.kind+x.ref_id));
  }
  let mine=new Set();
  if(me&&ps.length){
    const l=await sb.from('likes').select('post_id').eq('user_id',me.id).in('post_id',ps.map(p=>p.id));
    mine=new Set((l.data||[]).map(x=>x.post_id));
  }
  const hc={},hm=new Set();
  let hOk=false;
  if(ps.length){
    try{
      const h=await sb.from('helpful').select('post_id,user_id').in('post_id',ps.map(p=>p.id));
      if(!h.error){
        hOk=true;
        (h.data||[]).forEach(x=>{hc[x.post_id]=(hc[x.post_id]||0)+1;if(me&&x.user_id===me.id)hm.add(x.post_id)});
      }
    }catch(x){}
  }
  const hbtn=p=>hOk?'<button class="lk" data-a="hp" data-i="'+p.id+'" data-v="'+(hm.has(p.id)?1:0)+'" title="отметить как полезное"'+(hm.has(p.id)?' style="color:var(--ok)"':'')+(me&&p.author===me.id?' disabled':'')+'>полезно: <span>'+(hc[p.id]||0)+'</span></button>':'';
  const adm=prof&&prof.is_admin;
  const closed=t.locked&&!(adm||can('lock'));
  const acts=(p,c)=>{
    const own=me&&p.author===me.id;
    return '<div class="acts"><button class="lk'+(mine.has(p.id)?' on':'')+'" data-a="like" data-i="'+p.id+'" data-v="'+(mine.has(p.id)?1:0)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.7-8-10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9c0 5.9-8 10.6-8 10.6z"/></svg><span>'+p.likes[0].count+'</span></button>'+hbtn(p)+(!c&&!closed?'<button class="lk" data-a="cm" data-i="'+p.id+'">комментировать</button>':'')+(own||adm?'<button class="lk" data-a="editp" data-i="'+p.id+'">изменить</button>':'')+(own||can('delete_posts')?'<button class="lk" data-a="delp" data-i="'+p.id+'" data-o="'+(own?1:0)+'">удалить</button>':'')+(me?'<button class="lk'+(bm.has('post'+p.id)?' on':'')+'" data-a="bmp" data-i="'+p.id+'" data-v="'+(bm.has('post'+p.id)?1:0)+'">'+(bm.has('post'+p.id)?'убрать из закладок':'в закладки')+'</button>':'')+(own?'<button class="lk" data-a="ped" data-i="'+p.id+'">изменить</button>':'')+(me?'<button class="lk" data-a="qt" data-n="'+esc(p.profiles?p.profiles.name:'')+'">цитата</button>':'')+(me&&!own?'<button class="lk" data-a="rep" data-i="'+p.id+'">пожаловаться</button>':'')+'</div>';
  };
  const ctl=can('pin')||can('lock')||can('delete_threads')?'<div class="acts">'+(can('pin')?'<button class="lk" data-a="pin" data-i="'+t.id+'" data-v="'+(t.pinned?1:0)+'">'+(t.pinned?'открепить':'закрепить')+'</button>':'')+(can('lock')?'<button class="lk" data-a="lock" data-i="'+t.id+'" data-v="'+(t.locked?1:0)+'">'+(t.locked?'открыть':'закрыть')+'</button>':'')+(can('delete_threads')?'<button class="lk" data-a="delt" data-i="'+t.id+'" data-b="'+t.boards.id+'">удалить тему</button>':'')+'</div>':'';
  app.innerHTML='<p><a href="#/">форум</a> / <a href="#/b/'+t.boards.id+'">'+esc(t.boards.title)+'</a></p><h1>'+pfx(t)+(t.pinned?'<span class="tag">'+tr('закреплено')+'</span>':'')+(t.locked?'<span class="tag">'+tr('закрыто')+'</span>':'')+esc(t.title)+'</h1>'+(me?'<div class="acts"><button class="lk" data-a="sub" data-i="'+t.id+'" data-v="'+(sub?1:0)+'">'+(sub?'отписаться от темы':'подписаться на тему')+'</button><button class="lk" data-a="bmt" data-i="'+t.id+'" data-v="'+(bm.has('thread'+t.id)?1:0)+'">'+(bm.has('thread'+t.id)?'убрать тему из закладок':'в закладки')+'</button>'+(me&&(tAuth(t)===me.id||can('delete_posts'))?'<button class="lk" data-a="sol" data-i="'+t.id+'" data-v="'+(t.solved?1:0)+'">'+(t.solved?'снять отметку «решено»':'отметить решённой')+'</button>':'')+'</div>':'')+ctl+pollHtml(poll)+
    ps.filter(p=>!p.parent_id).map(p=>{
      const kids=ps.filter(c=>c.parent_id===p.id);
      return '<article class="post item"><div class="side">'+who(p.profiles)+lv(p.author)+'<span class="mu">'+fmt(p.created_at)+(p.edited_at?' · изменено':'')+'</span></div><div><div class="txt" data-raw="'+esc(p.body)+'">'+fmtBody(p.body)+'</div>'+acts(p)+kids.map(c=>'<div class="cm item"><div class="ch">'+who(c.profiles)+'<span class="mu">'+fmt(c.created_at)+(c.edited_at?' · изменено':'')+'</span></div><div class="txt" data-raw="'+esc(c.body)+'">'+fmtBody(c.body)+'</div>'+acts(c,true)+'</div>').join('')+'<div class="cwrap" data-w="'+p.id+'"></div></div></article>';
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

function resizeImg(file,w,h){
  return new Promise((ok,no)=>{
    const u=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{
      const c=document.createElement('canvas');
      c.width=w;c.height=h;
      const k=Math.max(w/im.width,h/im.height),dw=im.width*k,dh=im.height*k;
      c.getContext('2d').drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);
      URL.revokeObjectURL(u);
      c.toBlob(b=>b?ok(b):no(new Error('не удалось сжать картинку')),'image/webp',0.85);
    };
    im.onerror=()=>no(new Error('это не картинка'));
    im.src=u;
  });
}
async function upImg(file,name,w,h){
  const blob=await resizeImg(file,w,h);
  const p=me.id+'/'+name+'.webp';
  const r=await sb.storage.from('avatars').upload(p,blob,{upsert:true,contentType:'image/webp',cacheControl:'3600'});
  if(r.error)throw r.error;
  return sb.storage.from('avatars').getPublicUrl(p).data.publicUrl+'?v='+Date.now();
}
async function refreshBell(){
  const a=$('#nbell'),c=$('#nbadge');
  if(!a||!c)return;
  if(!me){a.hidden=true;return}
  a.hidden=false;
  const r=await sb.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',me.id).eq('read',false);
  const n=r.count||0;
  c.textContent=n>99?'99+':String(n);
  c.hidden=!n;
}
function watchNotifs(){
  try{
    if(!me){
      if(nch){sb.removeChannel(nch);nch=null;nuid=null}
      refreshBell();
      return;
    }
    if(nch&&nuid===me.id){refreshBell();return}
    if(nch)sb.removeChannel(nch);
    nuid=me.id;
    nch=sb.channel('n-'+me.id).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:'user_id=eq.'+me.id},()=>{
      refreshBell();
      if(location.hash==='#/notifications')notifs();
    }).subscribe();
    refreshBell();
  }catch(x){}
}
async function notifs(){
  const head='<p><a href="#/">форум</a> / уведомления</p><h1>уведомления</h1>';
  if(!me){app.innerHTML=head+'<p class="mu">войди, чтобы видеть уведомления.</p>';return}
  const r=await sb.from('notifications').select('*').eq('user_id',me.id).order('created_at',{ascending:false}).limit(100);
  if(r.error){app.innerHTML=head+'<div class="warn"><b>уведомления недоступны</b>'+esc(r.error.message)+'</div>';return}
  const rows=r.data||[];
  const ids=[...new Set(rows.map(x=>x.actor).filter(Boolean))];
  const m={};
  if(ids.length){
    let x=await sb.from('profiles').select('id,name,avatar_url,nk_on,nk1,nk2,nkangle,roles(*)').in('id',ids);
    if(x.error)x=await sb.from('profiles').select('id,name,roles(*)').in('id',ids);
    (x.data||[]).forEach(y=>m[y.id]=y);
  }
  const line=n=>{
    const d=n.data||{},p=m[n.actor],w=p?who(p,false):'<b>администрация</b>';
    const why=d.reason?' ('+tr('причина: ')+esc(d.reason)+')':'';
    switch(n.kind){
      case 'reply':return w+' ответил в вашей теме';
      case 'comment':return w+' прокомментировал ваше сообщение';
      case 'mention':return w+' упомянул вас';
      case 'sub':return w+' ответил в теме, на которую вы подписаны';
      case 'like':return w+' оценил ваше сообщение';
      case 'pcomment':return w+' написал в вашем профиле';
      case 'role':return d.role?tr('вам выдана роль «')+esc(d.role)+'»':'ваша роль снята';
      case 'admin':return d.on?'вы назначены администратором':'права администратора сняты';
      case 'perms':return 'ваши права изменены';
      case 'mute':return 'вы замучены до '+esc(d.until?till(d.until):'?')+why;
      case 'unmute':return 'мут снят';
      case 'ban':return 'вы забанены до '+esc(d.until?till(d.until):'?')+why;
      case 'unban':return 'бан снят';
    }
    return esc(n.kind);
  };
  const link=n=>n.thread_id?'#/t/'+n.thread_id:'#/u/'+me.id;
  app.innerHTML=head+(rows.length?'<div class="row"><button class="btn s" data-a="nreadall">прочитать все</button><button class="btn s" data-a="nclear">очистить</button></div>':'')+
    '<div class="nls">'+(rows.map(n=>'<a class="ni'+(n.read?'':' new')+'" href="'+link(n)+'" data-a="nopen" data-i="'+n.id+'"><div>'+line(n)+'</div><span class="mu">'+fmt(n.created_at)+'</span></a>').join('')||'<p class="mu">уведомлений пока нет</p>')+'</div>';
}

const GP={
  light:[['облако','#dbeafe','#f4f8fd',160],['рассвет','#fde7d9','#e8e4fb',135],['мята','#d6f1e6','#e3f0fb',120],['лаванда','#e9e1fb','#fdf0f6',200]],
  gray:[['сумрак','#2b3350','#1b1e26',160],['лес','#1f3a33','#202226',150],['ночь','#2a2540','#16181d',210],['уголь','#34373d','#1a1c20',135]]
};
function settings(){
  const T=window.CloudTheme,g=T.getGrad(),th=T.get();
  const grad=(c1,c2,a)=>'linear-gradient('+a+'deg,'+c1+','+c2+')';
  app.innerHTML='<p><a href="#/">форум</a> / настройки</p><h1>настройки</h1><div class="sg2">'+
    '<section class="sc"><h3>тема</h3><div class="seg">'+['light','gray'].map(v=>'<button class="sgb'+(th===v?' on':'')+'" data-a="th" data-i="'+v+'"><span class="tp tp-'+v+'"><b>Aa</b></span>'+(v==='light'?'светлая':'серая')+'</button>').join('')+'</div></section>'+
    '<section class="sc"><h3>градиент сайта</h3>'+
    '<label class="sw"><input id="gon" type="checkbox"'+(g.on?' checked':'')+'><i></i><span>включить градиент</span></label>'+
    '<div id="gpv" class="gpv" style="background:'+grad(g.c1,g.c2,g.a)+'"><div class="mk"><b>предпросмотр</b><span>так будут выглядеть фон и шапка</span></div></div>'+
    '<div class="gc"><label class="cp"><input id="gc1" type="color" value="'+g.c1+'"><span>цвет 1</span></label><label class="cp"><input id="gc2" type="color" value="'+g.c2+'"><span>цвет 2</span></label></div>'+
    '<label class="rg"><span>угол <b id="gav">'+g.a+'</b>°</span><input id="ga" type="range" min="0" max="360" value="'+g.a+'"></label>'+
    '<div class="chips">'+[0,45,90,135,180,270].map(n=>'<button class="chip" data-a="gang" data-i="'+n+'">'+n+'°</button>').join('')+'</div>'+
    '<h4>пресеты</h4><div class="pre">'+GP[th].map((q,n)=>'<button class="pr" data-a="gp" data-i="'+n+'"><i style="background:'+grad(q[1],q[2],q[3])+'"></i><span>'+q[0]+'</span></button>').join('')+'</div>'+
    '<div class="row"><button class="btn s" data-a="gr">сбросить</button></div></section></div>'+
    '<p class="mu">градиент и тема сохраняются в аккаунте и действуют на форуме, в справочнике и на релизах.</p>';
  const up=()=>{
    const o=T.setGrad({on:$('#gon').checked,c1:$('#gc1').value,c2:$('#gc2').value,a:+$('#ga').value});
    $('#gav').textContent=o.a;
    $('#gpv').style.background=grad(o.c1,o.c2,o.a);
  };
  ['gon','gc1','gc2','ga'].forEach(k=>$('#'+k).oninput=up);
}

async function bookmarks(){
  const head='<p><a href="#/">форум</a> / закладки</p><h1>закладки</h1>';
  if(!me){app.innerHTML=head+'<p class="mu">войди, чтобы видеть закладки.</p>';return}
  const r=await sb.from('bookmarks').select('*').eq('user_id',me.id).order('created_at',{ascending:false}).limit(200);
  if(r.error){app.innerHTML=head+'<div class="warn"><b>закладки недоступны</b>'+esc(r.error.message)+'</div>';return}
  const rows=r.data||[];
  const tids=[...new Set(rows.map(x=>x.thread_id))],pids=rows.filter(x=>x.kind==='post').map(x=>x.ref_id);
  const tm={},pm={};
  if(tids.length)((await sb.from('threads').select('id,title,prefix').in('id',tids)).data||[]).forEach(x=>tm[x.id]=x);
  if(pids.length)((await sb.from('posts').select('id,body').in('id',pids)).data||[]).forEach(x=>pm[x.id]=x);
  app.innerHTML=head+(rows.map(x=>{
    const t=tm[x.thread_id];
    if(!t)return '';
    const sn=x.kind==='post'&&pm[x.ref_id]?'<span class="mu">'+esc(pm[x.ref_id].body.slice(0,160))+'</span>':'';
    return '<a class="trow" href="#/t/'+x.thread_id+'"><div><strong>'+pfx(t)+esc(t.title)+'</strong>'+sn+'</div><div class="n">'+(x.kind==='post'?'сообщение':'тема')+'<br>'+fmt(x.created_at)+'</div></a>';
  }).join('')||'<p class="mu">закладок пока нет</p>');
}

async function reports(){
  const head='<p><a href="#/">форум</a> / жалобы</p><h1>жалобы</h1>'+modTabs('reports');
  if(!(can('delete_posts')||can('mute')||can('ban'))){app.innerHTML=head+'<p class="mu">нет доступа.</p>';return}
  const r=await sb.from('reports').select('*').order('status',{ascending:false}).order('created_at',{ascending:false}).limit(100);
  if(r.error){app.innerHTML=head+'<div class="warn"><b>жалобы недоступны</b>'+esc(r.error.message)+'</div>';return}
  const rows=r.data||[];
  const pids=[...new Set(rows.map(x=>x.post_id))],pm={};
  if(pids.length){
    const x=await sb.from('posts').select('id,body,author,thread_id').in('id',pids);
    const ps=x.data||[];
    await withProf(ps);
    ps.forEach(y=>pm[y.id]=y);
  }
  const rr=rows.map(x=>({author:x.reporter}));
  await withProf(rr);
  app.innerHTML=head+(rows.map((x,n)=>{
    const p=pm[x.post_id];
    return '<div class="item rpi"><div class="ch"><span class="tag">'+(x.status==='open'?'новая':'закрыта')+'</span>жалоба от '+who(rr[n].profiles)+'<span class="mu">'+fmt(x.created_at)+'</span></div><p><b>причина:</b> '+esc(x.reason)+'</p>'+
      (p?'<div class="txt"><span class="mu">сообщение от </span>'+who(p.profiles)+'<br>'+esc(p.body.slice(0,400))+'</div><div class="acts"><a href="#/t/'+x.thread_id+'">открыть тему</a>'+(x.status==='open'?'<button class="lk" data-a="rpdone" data-i="'+x.id+'">закрыть жалобу</button>':'')+(can('delete_posts')?'<button class="lk" data-a="rpdelpost" data-i="'+x.post_id+'">удалить сообщение</button>':'')+'<button class="lk" data-a="rpdel" data-i="'+x.id+'">удалить жалобу</button></div>':'<p class="mu">сообщение уже удалено.</p><div class="acts"><button class="lk" data-a="rpdel" data-i="'+x.id+'">удалить жалобу</button></div>')+'</div>';
  }).join('')||'<p class="mu">жалоб пока нет</p>');
}

const SU=((window.CFG&&window.CFG.url)||'').replace(/\/$/,'');
const IMGRE=new RegExp('\\[img:('+SU.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/storage/v1/object/public/posts/[0-9a-f-]{36}/[0-9]{10,16}\\.webp)\\]','g');
const MNRE=/(^|[\s>(])@([^\s@<>,;:!?()&]{2,24})/g;
const outside=(h,fn)=>h.split(/(<pre[\s\S]*?<\/pre>)/).map((s,n)=>n%2?s:fn(s)).join('');
function quotify(h){
  const parts=h.split(/(<br\s*\/?>|\n)/i);
  let out='',q=[];
  const flush=()=>{if(q.length){out+='<blockquote class="qt">'+q.join('<br>')+'</blockquote>';q=[]}};
  for(let n=0;n<parts.length;n+=2){
    const line=parts[n],sep=parts[n+1]||'';
    if(/^&gt; ?/.test(line))q.push(line.replace(/^&gt; ?/,''));
    else{flush();out+=line+sep}
  }
  flush();
  return out;
}
function md(h){
  h=h.replace(/\[([^\]\n<]{1,200})\]\((https?:\/\/[^\s<>"'()]{1,500})\)|(^|[\s(>])(https?:\/\/[^\s<>"']{1,500})/g,(m,t,u,p,b)=>{
    if(u)return '<a class="ext" href="'+u+'" target="_blank" rel="noopener noreferrer nofollow ugc">'+t+'</a>';
    const tr=b.match(/[.,;:!?)]+$/),tail=tr?tr[0]:'',url=tail?b.slice(0,-tail.length):b;
    return p+'<a class="ext" href="'+url+'" target="_blank" rel="noopener noreferrer nofollow ugc">'+url+'</a>'+tail;
  });
  h=h.replace(/\*\*([^*\n<][^*\n<]*?)\*\*/g,'<strong>$1</strong>');
  h=h.replace(/~~([^~\n<][^~\n<]*?)~~/g,'<s>$1</s>');
  h=h.replace(/(^|[\s(>])\*([^*\s<][^*\n<]*?)\*(?=[\s).,;:!?<]|$)/g,'$1<em>$2</em>');
  const parts=h.split(/(<br\s*\/?>|\n)/i);
  for(let n=0;n<parts.length;n+=2){
    let l=parts[n],m;
    if((m=l.match(/^(#{1,3}) (.+)$/)))parts[n]='<strong class="mh mh'+m[1].length+'">'+m[2]+'</strong>';
    else if((m=l.match(/^[-*] (.+)$/)))parts[n]='<span class="li">\u2022 '+m[1]+'</span>';
    else if((m=l.match(/^(\d{1,3})[.)] (.+)$/)))parts[n]='<span class="li">'+m[1]+'. '+m[2]+'</span>';
  }
  return parts.join('');
}
function fx(el){
  let h=el.innerHTML;
  const codes=[];
  h=h.replace(/```[a-zA-Z0-9]*(?:<br\s*\/?>|\n)?([\s\S]*?)```/g,(m,c)=>{
    codes.push('<pre class="code"><code>'+c.replace(/<br\s*\/?>/gi,'\n')+'</code></pre>');
    return '\u0000'+(codes.length-1)+'\u0000';
  });
  h=h.replace(/`([^`<\n]+)`/g,'<code class="ic">$1</code>');
  h=h.split(/(<code class="ic">[\s\S]*?<\/code>)/).map((x,n)=>n%2?x:md(x)).join('');
  h=quotify(h);
  h=h.replace(IMGRE,(m,u)=>'<a href="'+u+'" target="_blank" rel="noopener"><img class="pimg" loading="lazy" src="'+u+'" alt=""></a>');
  h=h.replace(/\u0000(\d+)\u0000/g,(m,n)=>codes[+n]);
  el.innerHTML=h;
}
async function mentions(els){
  const set=new Set();
  els.forEach(el=>outside(el.innerHTML,s=>{s.replace(MNRE,(m,p,n)=>{set.add(n.toLowerCase());return m});return s}));
  if(!set.size)return;
  const r=await sb.rpc('resolve_names',{names:[...set]});
  const mp={};
  (r.data||[]).forEach(x=>mp[x.name.toLowerCase()]=x);
  els.forEach(el=>{
    el.innerHTML=outside(el.innerHTML,s=>s.replace(MNRE,(m,p,n)=>{
      const u=mp[n.toLowerCase()];
      return u?p+'<a class="mn" href="#/u/'+u.id+'">@'+esc(u.name)+'</a>':m;
    }));
  });
}
async function feed(){
  try{
    const r=await sb.from('posts').select('id,body,author,thread_id,created_at').is('parent_id',null).order('created_at',{ascending:false}).limit(8);
    const ps=r.data||[];
    if(!ps.length)return '';
    const ids=[...new Set(ps.map(x=>x.thread_id))],tm={};
    ((await sb.from('threads').select('id,title,prefix,solved').in('id',ids)).data||[]).forEach(x=>tm[x.id]=x);
    await withProf(ps);
    return '<h2>новое</h2>'+ps.map(p=>{
      const t=tm[p.thread_id];
      if(!t)return '';
      return '<a class="trow" href="#/t/'+p.thread_id+'"><div><strong>'+pfx(t)+esc(t.title)+'</strong><span class="mu">'+esc(p.body.replace(/\[img:[^\]]*\]/g,'[картинка]').slice(0,140))+'</span></div><div class="n">'+who(p.profiles,false)+'<br>'+fmt(p.created_at)+'</div></a>';
    }).join('');
  }catch(x){return ''}
}
function decorate(){
  const list=[];
  document.querySelectorAll('#app .txt').forEach(el=>{
    if(el.dataset.fx)return;
    el.dataset.fx='1';
    fx(el);
    list.push(el);
  });
  if(list.length)mentions(list).catch(()=>{});
  document.querySelectorAll('#app form textarea').forEach(t=>{
    if(t.dataset.ib||t.id==='pbio')return;
    t.dataset.ib='1';
    const bt=document.createElement('button');
    bt.type='button';bt.className='lk';bt.dataset.a='img';bt.textContent='картинка';
    const nx=t.nextElementSibling;
    if(nx&&nx.classList.contains('tb'))nx.appendChild(bt);
    else{
      const w=document.createElement('div');
      w.className='tb';
      w.appendChild(bt);
      t.insertAdjacentElement('afterend',w);
    }
  });
}
new MutationObserver(decorate).observe(app,{childList:true,subtree:true});
function fitImg(file,max){
  return new Promise((ok,no)=>{
    const u=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{
      const k=Math.min(1,max/Math.max(im.width,im.height)),w=Math.round(im.width*k),h=Math.round(im.height*k),c=document.createElement('canvas');
      c.width=w;c.height=h;
      c.getContext('2d').drawImage(im,0,0,w,h);
      URL.revokeObjectURL(u);
      c.toBlob(b=>b?ok(b):no(new Error('не удалось сжать картинку')),'image/webp',0.85);
    };
    im.onerror=()=>no(new Error('это не картинка'));
    im.src=u;
  });
}
async function upPostImg(file){
  const blob=await fitImg(file,1280);
  const p=me.id+'/'+Date.now()+'.webp';
  const r=await sb.storage.from('posts').upload(p,blob,{contentType:'image/webp',cacheControl:'31536000'});
  if(r.error)throw new Error(r.error.message+' (картинки доступны только участникам с аккаунтом, не анонимам)');
  return sb.storage.from('posts').getPublicUrl(p).data.publicUrl;
}
async function upBadge(file){
  if(!file)throw new Error('выбери картинку');
  const blob=await resizeImg(file,128,128);
  const p='b'+Date.now()+Math.random().toString(36).slice(2,6)+'.webp';
  const r=await sb.storage.from('badges').upload(p,blob,{contentType:'image/webp'});
  if(r.error)throw r.error;
  return sb.storage.from('badges').getPublicUrl(p).data.publicUrl;
}
const pollHtml=po=>{
  if(!po)return '';
  const tot=po.options.reduce((s,o)=>s+(+o.votes),0),mine=new Set(po.mine||[]);
  return '<div class="poll"><b>'+esc(po.question)+'</b><span class="mu">'+(po.multi?'можно выбрать несколько':'один вариант')+' · голосов: '+tot+'</span>'+po.options.map(o=>{
    const pc=tot?Math.round(o.votes*100/tot):0;
    return '<button class="po'+(mine.has(o.id)?' on':'')+'" data-a="pv" data-i="'+o.id+'"><i style="width:'+pc+'%"></i><span>'+esc(o.text)+'</span><em>'+o.votes+' · '+pc+'%</em></button>';
  }).join('')+'</div>';
};
async function badgesAdmin(){
  const head='<h1>управление</h1>'+adminTabs('badges');
  if(!(prof&&prof.is_admin)){app.innerHTML=head+'<p class="mu">нет доступа.</p>';return}
  const r=await sb.from('badges').select('*').order('id');
  if(r.error){app.innerHTML=head+'<div class="warn"><b>значки недоступны</b>'+esc(r.error.message)+'</div>';return}
  app.innerHTML=head+'<form id="bgf"><input id="bgn" maxlength="40" placeholder="название" required><input id="bgd" maxlength="200" placeholder="описание (необязательно)"><label>картинка (файл)<input id="bgi" type="file" accept="image/*" required></label><select id="bgk"><option value="">выдаётся вручную</option><option value="posts">за число сообщений</option><option value="likes">за число лайков</option><option value="threads">за число тем</option><option value="solved">за число решённых тем</option><option value="days">за дни на форуме</option></select><input id="bgnn" type="number" min="1" max="100000" placeholder="сколько"><button class="btn p">создать значок</button></form><div>'+
    (r.data.map(x=>'<div class="item rpi"><span class="bd big"><img src="'+esc(safeUrl(x.img))+'" alt=""></span> <b>'+esc(x.name)+'</b> <span class="mu">'+esc(x.descr)+'</span>'+(x.auto_kind?' <span class="tag">'+esc(x.auto_kind)+' &ge; '+esc(x.auto_n)+'</span>':'')+'<div class="acts"><button class="lk" data-br="'+x.id+'">условие</button><button class="lk" data-a="bgdel" data-i="'+x.id+'">удалить значок</button></div></div>').join('')||'<p class="mu">значков пока нет</p>')+'</div>';
  $('#bgf').onsubmit=async e=>{
    e.preventDefault();
    const btn=$('#bgf button');
    btn.disabled=true;
    try{
      const url=await upBadge($('#bgi').files[0]);
      const x=await sb.from('badges').insert({name:$('#bgn').value.trim(),descr:$('#bgd').value.trim(),img:url,auto_kind:$('#bgk').value||null,auto_n:$('#bgk').value?(+$('#bgnn').value||1):null});
      if(x.error)throw x.error;
      if($('#bgk').value)await sb.rpc('award_all');
      badgesAdmin();
    }catch(z){alert(z.message||z)}
    finally{btn.disabled=false}
  };
}
async function refreshMsgs(){
  const a=$('#nmsg'),c=$('#nmsgb');
  if(!a||!c)return;
  if(!me){a.hidden=true;return}
  a.hidden=false;
  const r=await sb.from('dms').select('id',{count:'exact',head:true}).eq('recipient',me.id).eq('read',false);
  const n=r.count||0;
  c.textContent=n>99?'99+':String(n);
  c.hidden=!n;
  const bb=$('#nmb2');
  if(bb)bb.textContent=n?' ('+n+')':'';
}
function watchDms(){
  try{
    if(!me){
      if(dmch){sb.removeChannel(dmch);dmch=null;dmuid=null}
      refreshMsgs();
      return;
    }
    if(dmch&&dmuid===me.id){refreshMsgs();return}
    if(dmch)sb.removeChannel(dmch);
    dmuid=me.id;
    dmch=sb.channel('dm-'+me.id).on('postgres_changes',{event:'*',schema:'public',table:'dms',filter:'recipient=eq.'+me.id},p=>{
      refreshMsgs();
      if(p.eventType==='INSERT'&&dmRe)dmRe();
    }).subscribe();
    refreshMsgs();
  }catch(x){}
}
async function dmList(){
  const head='<h1>сообщения</h1>';
  if(!me){app.innerHTML=head+'<p class="mu">войди, чтобы писать сообщения.</p>';return}
  dmRe=dmList;
  const r=await sb.from('dms').select('*').or('sender.eq.'+me.id+',recipient.eq.'+me.id).order('created_at',{ascending:false}).limit(300);
  if(r.error){app.innerHTML=head+'<div class="warn"><b>сообщения недоступны</b>'+esc(r.error.message)+'</div>';return}
  const cv=new Map();
  (r.data||[]).forEach(x=>{
    const o=x.sender===me.id?x.recipient:x.sender;
    if(!cv.has(o))cv.set(o,{o,last:x,un:0});
    if(x.recipient===me.id&&!x.read)cv.get(o).un++;
  });
  const list=[...cv.values()],pp=list.map(x=>({author:x.o}));
  await withProf(pp);
  app.innerHTML=head+'<p class="mu">чтобы написать участнику, открой его профиль и нажми «сообщения».</p>'+
    (list.map((x,n)=>'<a class="trow" href="#/messages/'+x.o+'"><div><strong>'+who(pp[n].profiles,false)+'</strong><span class="mu">'+(x.last.sender===me.id?'вы: ':'')+esc(x.last.body.slice(0,120))+'</span></div><div class="n">'+(x.un?'<span class="tag">новых: '+x.un+'</span><br>':'')+fmt(x.last.created_at)+'</div></a>').join('')||'<p class="mu">диалогов пока нет</p>');
}
async function dmChat(uid){
  if(!me){app.innerHTML='<h1>сообщения</h1><p class="mu">войди, чтобы писать сообщения.</p>';return}
  if(uid===me.id){location.hash='#/messages';return}
  let pr=await sb.from('profiles').select('id,name,status,avatar_url,nk_on,nk1,nk2,nkangle,roles(*)').eq('id',uid).maybeSingle();
  if(pr.error)pr=await sb.from('profiles').select('id,name,roles(*)').eq('id',uid).maybeSingle();
  const u=pr.data;
  if(!u){app.innerHTML='<div class="warn"><b>не найдено</b>такого участника нет.</div>';return}
  app.innerHTML='<p><a href="#/messages">сообщения</a> / '+who(u)+'</p><div id="dmp"></div><div id="dml" class="dml"></div><form id="dmf"><textarea id="dmb" rows="3" maxlength="2000" placeholder="сообщение" required></textarea>'+tools('dmb')+'<button class="btn p">отправить</button></form>';
  const pvt=b=>b.replace(/\[img:[^\]\s]+\]/g,'['+tr('картинка')+']').replace(/:s_[a-z]+:/g,'['+tr('стикер')+']').replace(/\s+/g,' ').trim().slice(0,90);
  let pinSet=new Set(),pinOk=true;
  const draw=async keep=>{
    const l=$('#dml');
    if(!l)return;
    const r=await sb.from('dms').select('*').or('and(sender.eq.'+me.id+',recipient.eq.'+uid+'),and(sender.eq.'+uid+',recipient.eq.'+me.id+')').order('created_at').limit(300);
    const rows=r.data||[];
    const pr2=await sb.from('dm_pins').select('dm_id').eq('user_id',me.id);
    pinOk=!pr2.error;
    pinSet=new Set(pinOk?(pr2.data||[]).map(x=>x.dm_id):[]);
    const top=l.scrollTop;
    l.innerHTML=rows.map(x=>{
      const on=pinSet.has(x.id);
      return '<div class="dmm'+(x.sender===me.id?' me':'')+'" data-id="'+x.id+'"'+(on?' style="box-shadow:inset 3px 0 0 var(--ac)"':'')+'><div class="txt">'+fmtBody(x.body)+'</div><span class="mu">'+fmt(x.created_at)+'</span>'+(pinOk?' <button type="button" class="lk" data-a="dmpin" data-i="'+x.id+'" data-v="'+(on?1:0)+'">'+tr(on?'открепить':'закрепить')+'</button>':'')+'</div>';
    }).join('')||'<p class="mu">сообщений пока нет</p>';
    const bar=$('#dmp');
    if(bar)bar.innerHTML=rows.filter(x=>pinSet.has(x.id)).slice(-3).reverse().map(x=>'<div data-go="'+x.id+'" style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 10px;margin:0 0 6px;border:1px solid var(--line);border-left:3px solid var(--ac);border-radius:10px;background:var(--surf);font-size:13.5px;cursor:pointer"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>'+tr('закреплено')+':</b> <span data-noi>'+esc(pvt(x.body))+'</span></span><button type="button" class="lk" data-a="dmpin" data-i="'+x.id+'" data-v="1" title="'+tr('открепить')+'">×</button></div>').join('');
    l.scrollTop=keep===true?top:l.scrollHeight;
    if(rows.some(x=>x.recipient===me.id&&!x.read)){
      await sb.from('dms').update({read:true}).eq('recipient',me.id).eq('sender',uid).eq('read',false);
      refreshMsgs();
    }
  };
  const pc=async e=>{
    const b=e.target.closest('[data-a="dmpin"]');
    if(b){
      if(b.disabled)return;
      const id=+b.dataset.i;
      if(b.dataset.v!=='1'&&pinSet.size>=5)return alert(tr('можно закрепить не больше 5 сообщений'));
      b.disabled=true;
      const rr=b.dataset.v==='1'?await sb.from('dm_pins').delete().eq('user_id',me.id).eq('dm_id',id):await sb.from('dm_pins').insert({user_id:me.id,dm_id:id});
      if(rr.error){b.disabled=false;return alert(rr.error.message)}
      await draw(true);
      return;
    }
    const g=e.target.closest('[data-go]');
    if(g){
      const m=$('#dml .dmm[data-id="'+g.dataset.go+'"]');
      if(m)m.scrollIntoView({block:'center',behavior:'smooth'});
    }
  };
  $('#dmp').onclick=pc;
  $('#dml').onclick=pc;
  dmRe=draw;
  $('#dmf').onsubmit=async e=>{
    e.preventDefault();
    if(!await need())return;
    const body=$('#dmb').value.trim();
    if(!body)return;
    const r=await sb.from('dms').insert({recipient:uid,body});
    if(r.error)return alert(r.error.message);
    $('#dmb').value='';
    draw();
  };
  await draw();
}

function renameBtn(u){
  if(prof&&prof.is_admin)return '<button class="btn" data-a="rename">сменить имя</button>';
  const left=u.name_changed_at?Math.ceil((new Date(u.name_changed_at).getTime()+6048e5-Date.now())/864e5):0;
  if(left>0&&Date.now()-new Date(u.created_at).getTime()>=36e5)return '<span class="mu">имя можно сменить через '+left+' дн.</span>';
  return '<button class="btn" data-a="rename">сменить имя</button>';
}
function modTabs(cur){
  const a=(h,t,k)=>'<a'+(cur===k?' class="on"':'')+' href="'+h+'">'+t+'</a>';
  const any=can('delete_posts')||can('mute')||can('ban');
  return '<p class="tabs">'+(prof&&prof.is_admin?a('#/admin','управление',''):'')+(any?a('#/reports','жалобы','reports'):'')+(can('mute')?a('#/mod/mutes','муты','mute'):'')+(can('ban')?a('#/mod/bans','баны','ban'):'')+'</p>';
}
async function profile(id){
  const r=await sb.from('profiles').select('*,roles(*)').eq('id',id).maybeSingle();
  if(r.error)throw r.error;
  const u=r.data;
  if(!u){app.innerHTML='<div class="warn"><b>не найдено</b>такого участника нет.</div>';return}
  const pc=await sb.from('posts').select('id',{count:'exact',head:true}).eq('author',id);
  const rtg=await sb.rpc('user_rating',{uid:id});
  const cm=await sb.from('profile_comments').select('*').eq('profile_id',id).order('created_at',{ascending:false}).limit(100);
  let cs=[],cerr='';
  if(cm.error)cerr=cm.error.message;
  else{cs=cm.data||[];await withProf(cs)}
  avx=false;
  const own=me&&me.id===id;
  let rl=[];
  if(prof&&prof.is_admin&&!own){
    const x=await sb.from('roles').select('id,name').order('id');
    rl=x.data||[];
  }
  const edit=own?'<form id="pf" hidden><label>о себе<textarea id="pbio" rows="4" maxlength="500">'+esc(u.bio||'')+'</textarea></label><label>статус (эмодзи или пара слов)<input id="pst" maxlength="16" value="'+esc(u.status||'')+'"></label>'+tools('pst',true)+
    '<div class="adm"><label>баннер, цвет 1<input id="pb1" type="color" value="'+col(u.b1)+'"></label><label>баннер, цвет 2<input id="pb2" type="color" value="'+col(u.b2)+'"></label><label>угол <span id="pav2">'+((+u.bangle)||90)+'</span>°<input id="pan" type="range" min="0" max="360" value="'+((+u.bangle)||90)+'"></label></div>'+
    '<label class="sw"><input id="nkon" type="checkbox"'+(u.nk_on?' checked':'')+'><i></i><span>градиент ника</span></label><div class="adm"><label>ник, цвет 1<input id="nk1" type="color" value="'+col(u.nk1)+'"></label><label>ник, цвет 2<input id="nk2" type="color" value="'+col(u.nk2)+'"></label><label>угол <span id="nka2">'+((+u.nkangle)||90)+'</span>°<input id="nkan" type="range" min="0" max="360" value="'+((+u.nkangle)||90)+'"></label></div><p>предпросмотр: <span id="nkpv"></span></p>'+
    '<div class="adm"><label>аватар (файл)<input id="pavf" type="file" accept="image/*"></label><label>баннер (файл)<input id="pbf" type="file" accept="image/*"></label></div>'+(safeUrl(u.avatar_url)?'<div class="row"><button type="button" class="btn s" data-a="avx">убрать аватар</button></div>':'')+'<label>картинка баннера (ссылка https, необязательно)<input id="pbu" maxlength="500" value="'+esc(safeUrl(u.burl))+'" placeholder="https://..."></label><div class="row"><button class="btn p">сохранить</button><button type="button" class="btn" data-a="pedit">отмена</button></div></form>':'';
  const modrow=prof&&prof.is_admin&&!own?'<div class="row mod"><select data-a="setrole" data-i="'+esc(id)+'"><option value="">без роли</option>'+rl.map(x=>'<option value="'+x.id+'"'+(u.role_id===x.id?' selected':'')+'>'+esc(x.name)+'</option>').join('')+'</select><button class="btn s" data-a="adm" data-i="'+esc(id)+'" data-v="'+(u.is_admin?1:0)+'">'+(u.is_admin?'снять админа':'сделать админом')+'</button>'+(u.is_admin?'':'<button class="btn s" data-a="udel" data-i="'+esc(id)+'" data-v="'+esc(u.name)+'">удалить</button>')+'</div>':'';
  const canS=!own&&!u.is_admin&&(can('mute')||can('ban'));
  const sb1=(k,label,undo,un)=>'<button class="btn s" data-a="'+(un?'unsanc':'sanc')+'" data-k="'+k+'" data-i="'+esc(id)+'" data-v="'+esc(u.name)+'">'+(un?undo:label)+'</button>';
  const sanrow=canS?'<div class="row mod">'+(can('mute')?sb1('mute','замутить','снять мут',active(u.muted_until)):'')+(can('ban')?sb1('ban','забанить','снять бан',active(u.banned_until)):'')+'</div>':'';
  const clist=cs.map(c=>'<div class="pcm item"><div class="ch">'+who(c.profiles)+'<span class="mu">'+fmt(c.created_at)+'</span></div><div class="txt">'+fmtBody(c.body)+'</div>'+((me&&(c.author===me.id||own))||can('delete_comments')?'<div class="acts"><button class="lk" data-a="pcdel" data-i="'+c.id+'">удалить</button></div>':'')+'</div>').join('')||'<p class="mu">комментариев пока нет</p>';
  const isAdm=!!(prof&&prof.is_admin);
  let bgs=[],bgAll=[];
  const ub=await sb.from('user_badges').select('badge_id,badges(id,name,descr,img)').eq('user_id',id);
  bgs=(ub.data||[]).filter(x=>x.badges);
  if(isAdm){const ab=await sb.from('badges').select('id,name').order('id');bgAll=ab.data||[]}
  const bdgHtml=bgs.length?'<div class="bdg">'+bgs.map(x=>'<span class="bd" title="'+esc(x.badges.name+(x.badges.descr?' — '+x.badges.descr:''))+'"><img src="'+esc(safeUrl(x.badges.img))+'" alt="">'+(isAdm?'<button class="lk" data-a="btake" data-i="'+x.badge_id+'" data-u="'+esc(id)+'">×</button>':'')+'</span>').join('')+'</div>':'';
  const bgrow=isAdm&&bgAll.length?'<div class="row mod"><select id="bgsel">'+bgAll.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join('')+'</select><button class="btn s" data-a="bgive" data-i="'+esc(id)+'">выдать значок</button></div>':'';
  app.innerHTML='<p><a href="#/">форум</a> / участник</p><div class="pb"><div class="pbn" style="'+bannerStyle(u)+'"></div><div class="pbd"><div class="pav" style="'+avStyle(u)+'">'+(safeUrl(u.avatar_url)?'':esc(String(u.name||'?').slice(0,1).toUpperCase()))+'</div><div class="pn">'+who(u,false)+(u.is_admin?'<span class="tag">админ</span>':'')+(active(u.muted_until)?'<span class="tag">мут до '+esc(till(u.muted_until))+'</span>':'')+(active(u.banned_until)?'<span class="tag">бан до '+esc(till(u.banned_until))+'</span>':'')+'</div>'+
    (u.bio?'<p class="bio">'+esc(u.bio)+'</p>':'<p class="mu">пока ничего о себе не написал.</p>')+
    bdgHtml+'<div class="pst2"><span><b>'+(pc.count||0)+'</b> '+pl(pc.count||0,['сообщение','сообщения','сообщений'],['message','messages'])+'</span><span><b>'+(+rtg.data||0)+'</b> рейтинг · '+lvl(+rtg.data||0)+'</span><span>на форуме с '+new Date(u.created_at).toLocaleDateString(LOC())+'</span></div>'+
    (own?'<div class="row"><button class="btn" data-a="pedit">изменить профиль</button>'+renameBtn(u)+'<button class="btn" data-a="export">скачать мои данные</button><button class="btn" data-a="out">выйти</button></div>':(me?'<div class="row"><button class="btn" data-a="dm" data-i="'+esc(id)+'">сообщения</button></div>':''))+modrow+bgrow+sanrow+'</div></div>'+edit+
    '<h2>комментарии</h2>'+(cerr?'<div class="warn"><b>комментарии недоступны</b>'+esc(cerr)+'</div>':'<form id="pcf"><textarea id="pcb" rows="3" maxlength="1000" placeholder="написать участнику" required></textarea>'+tools('pcb')+'<button class="btn p">отправить</button></form>'+clist);
  app.dataset.u=id;
  if(own){
    const up=()=>{
      $('#pav2').textContent=$('#pan').value;
      const pn=document.querySelector('.pbn'),pa=document.querySelector('.pav');
      const o={b1:$('#pb1').value,b2:$('#pb2').value,bangle:$('#pan').value,burl:$('#pbu').value};
      pn.style.cssText=bannerStyle(o);
      if(!safeUrl(u.avatar_url)&&!$('#pavf').files[0])pa.style.backgroundImage=bgB(o);
    };
    ['pb1','pb2','pan','pbu'].forEach(k=>$('#'+k).oninput=up);
    const nkp=()=>{
      $('#nka2').textContent=$('#nkan').value;
      $('#nkpv').innerHTML=who({name:u.name,nk_on:$('#nkon').checked,nk1:$('#nk1').value,nk2:$('#nk2').value,nkangle:$('#nkan').value,roles:u.roles},false);
    };
    ['nkon','nk1','nk2','nkan'].forEach(k=>{$('#'+k).oninput=nkp;$('#'+k).onchange=nkp});
    nkp();
    const pv=(inp,sel)=>{$(inp).onchange=()=>{const f=$(inp).files[0];if(!f)return;const el=document.querySelector(sel);el.style.backgroundImage="url('"+URL.createObjectURL(f)+"')";el.style.backgroundSize='cover';el.style.backgroundPosition='center';if(sel==='.pav')el.textContent=''}};
    pv('#pavf','.pav');pv('#pbf','.pbn');
  }
}

const ATABS=[['','обзор'],['users','участники'],['roles','роли'],['threads','темы'],['boards','разделы'],['ann','объявление'],['log','журнал'],['badges','значки']];
const LOGT={mute:'выдал мут',unmute:'снял мут',ban:'выдал бан',unban:'снял бан',role:'сменил роль',admin:'изменил статус админа',perms:'изменил права',pin:'закрепил тему',unpin:'открепил тему',lock:'закрыл тему',unlock:'открыл тему',delete_thread:'удалил тему',delete_post:'удалил сообщение',delete_user:'удалил пользователя',reset_profile:'сбросил профиль',board_access:'изменил доступ к разделу'};
function adminTabs(cur){
  return '<div class="atabs">'+ATABS.map(t=>'<a'+(t[0]===cur?' class="on"':'')+' href="#/admin'+(t[0]?'/'+t[0]:'')+'">'+t[1]+'</a>').join('')+'<a href="#/reports">жалобы</a><a href="#/mod/mutes">муты</a><a href="#/mod/bans">баны</a></div>';
}
async function logHtml(rows){
  if(!rows.length)return '<p class="mu">записей пока нет</p>';
  const aa=rows.map(x=>({author:x.actor})),tt=rows.map(x=>({author:x.target}));
  await withProf(aa);
  await withProf(tt);
  return rows.map((x,n)=>{
    const d=x.details||{},bits=[];
    if(d.role)bits.push(tr('роль «')+esc(d.role)+'»');
    if(d.title)bits.push('«'+esc(d.title)+'»');
    if(d.text)bits.push(esc(d.text));
    if(d.until)bits.push('до '+esc(till(d.until)));
    if(d.reason)bits.push('причина: '+esc(d.reason));
    if(d.on!==undefined)bits.push(d.on?'назначен':'снят');
    return '<div class="item lg"><div class="ch">'+(x.actor?who(aa[n].profiles,false):'<b>система</b>')+' <span>'+esc(LOGT[x.action]||x.action)+'</span>'+(x.target?' '+who(tt[n].profiles,false):'')+'<span class="mu">'+fmt(x.created_at)+'</span></div>'+(bits.length?'<p class="mu">'+bits.join(' · ')+'</p>':'')+'</div>';
  }).join('');
}
async function admin(){
  if(!(prof&&prof.is_admin)){app.innerHTML='<div class="warn"><b>нет доступа</b>эта страница только для администратора.</div>';return}
  const tab=location.hash.split('/')[2]||'';
  const head='<h1>управление</h1>'+adminTabs(tab);
  if(tab==='users')return adminUsers(head);
  if(tab==='roles')return adminRoles(head);
  if(tab==='threads')return adminThreads(head);
  if(tab==='boards')return adminBoards(head);
  if(tab==='ann')return adminAnn(head);
  if(tab==='log')return adminLog(head);
  return adminOverview(head);
}
async function adminOverview(head){
  const cnt=(t,f)=>{const q=sb.from(t).select('id',{count:'exact',head:true});return f?f(q):q};
  const d7=new Date(Date.now()-7*864e5).toISOString(),now=new Date().toISOString();
  const [u,t,p,nu,np,rp,mt,bn,lg]=await Promise.all([
    cnt('profiles'),cnt('threads'),cnt('posts'),
    cnt('profiles',q=>q.gte('created_at',d7)),cnt('posts',q=>q.gte('created_at',d7)),
    cnt('reports',q=>q.eq('status','open')),
    cnt('profiles',q=>q.gt('muted_until',now)),cnt('profiles',q=>q.gt('banned_until',now)),
    sb.from('mod_log').select('*').order('id',{ascending:false}).limit(6)
  ]);
  const cd=(n,s,h)=>(h?'<a class="cd" href="'+h+'">':'<div class="cd">')+'<b>'+(n||0)+'</b><span>'+s+'</span>'+(h?'</a>':'</div>');
  app.innerHTML=head+'<div class="cards">'+cd(u.count,'участников')+cd(t.count,'тем')+cd(p.count,'сообщений')+cd(nu.count,'новых участников за 7 дней')+cd(np.count,'сообщений за 7 дней')+cd(rp.count,'открытых жалоб','#/reports')+cd(mt.count,'активных мутов','#/mod/mutes')+cd(bn.count,'активных банов','#/mod/bans')+'</div>'+
    '<h2>последние действия</h2>'+await logHtml(lg.data||[])+'<p><a href="#/admin/log">весь журнал</a></p>';
}
async function adminUsers(head){
  const r1=await sb.from('roles').select('*').order('id');
  const roles=r1.data||[];
  app.innerHTML=head+'<div class="row"><input id="uq" placeholder="поиск по нику"><select id="uf"><option value="">все</option><option value="adm">админы</option><option value="mute">замученные</option><option value="ban">забаненные</option></select></div><div id="ul"></div>';
  const loadUsers=async()=>{
    const q=$('#uq').value.trim().replace(/[%_,]/g,''),fl=$('#uf').value,iso=new Date().toISOString();
    const mk=f=>{
      let r=sb.from('profiles').select(f).order('created_at',{ascending:false}).limit(50);
      if(q)r=r.ilike('name','%'+q+'%');
      if(fl==='adm')r=r.eq('is_admin',true);
      if(fl==='mute')r=r.gt('muted_until',iso);
      if(fl==='ban')r=r.gt('banned_until',iso);
      return r;
    };
    let x=await mk('id,name,role_id,is_admin,perms,muted_until,banned_until');
    if(x.error)x=await mk('id,name,role_id,is_admin');
    const l=x.data||[];
    $('#ul').innerHTML=l.map(u=>{
      const self=u.id===me.id;
      return '<div class="ur"><span><a href="#/u/'+esc(u.id)+'">'+esc(u.name)+'</a> '+(u.is_admin?'<span class="tag">админ</span>':'')+(active(u.muted_until)?'<span class="tag">мут</span>':'')+(active(u.banned_until)?'<span class="tag">бан</span>':'')+((u.perms||[]).length?'<span class="tag">прав: '+u.perms.length+'</span>':'')+'</span><span class="ctl">'+
        '<select data-a="setrole" data-i="'+esc(u.id)+'"><option value="">без роли</option>'+roles.map(r=>'<option value="'+r.id+'"'+(u.role_id===r.id?' selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select>'+
        (self?'<span class="tag">это ты</span>':'<button class="lk" data-a="perms" data-i="'+esc(u.id)+'">права</button><button class="lk" data-a="adm" data-i="'+esc(u.id)+'" data-v="'+(u.is_admin?1:0)+'">'+(u.is_admin?'снять админа':'сделать админом')+'</button><button class="lk" data-a="ureset" data-i="'+esc(u.id)+'">сбросить профиль</button>'+(u.is_admin?'':'<button class="lk" data-a="udel" data-i="'+esc(u.id)+'" data-v="'+esc(u.name)+'">удалить</button>'))+
        '</span></div>'+(self?'':'<div class="pe" id="pe-'+esc(u.id)+'" hidden><div class="pms">'+permBoxes('up',u.perms)+'</div><button class="btn s p" data-a="psave" data-i="'+esc(u.id)+'">сохранить права</button></div>');
    }).join('')||'<p class="mu">никого не найдено</p>';
  };
  let tm=null;
  $('#uq').oninput=()=>{clearTimeout(tm);tm=setTimeout(loadUsers,250)};
  $('#uf').onchange=loadUsers;
  await loadUsers();
}
async function adminRoles(head){
  const r1=await sb.from('roles').select('*').order('id');
  const roles=r1.data||[];
  const er=roles.find(r=>r.id===editing)||{name:'',c1:'#3b5fa8',c2:'#9cc8f2',angle:90,perms:[]};
  app.innerHTML=head+
    '<form id="rf2"><div class="adm"><label>название<input id="rn" maxlength="24" value="'+esc(er.name)+'" required></label><label class="cp"><input id="c1" type="color" value="'+col(er.c1)+'"><span>цвет 1</span></label><label class="cp"><input id="c2" type="color" value="'+col(er.c2)+'"><span>цвет 2</span></label><label class="rg"><span>угол <b id="av">'+((+er.angle)||0)+'</b>°</span><input id="an" type="range" min="0" max="360" value="'+((+er.angle)||0)+'"></label></div>'+
    '<div class="pv"><span id="pv" class="badge"></span></div><p class="mu">права этой роли</p><div class="pms">'+permBoxes('rp',er.perms)+'</div><div class="row"><button class="btn p">'+(editing?'сохранить роль':'создать роль')+'</button>'+(editing?'<button type="button" class="btn" data-a="rcancel">отмена</button>':'')+'</div></form>'+
    roles.map(r=>'<div class="ur"><span><span class="badge" style="background-image:'+bg(r)+'">'+esc(r.name)+'</span> <span class="mu">'+((r.perms||[]).length?'прав: '+r.perms.length:'без прав')+'</span></span><span><button class="lk" data-a="redit" data-i="'+r.id+'">изменить</button><button class="lk" data-a="rdel" data-i="'+r.id+'">удалить</button></span></div>').join('');
  const pv=()=>{
    $('#av').textContent=$('#an').value;
    const p=$('#pv');
    p.textContent=$('#rn').value||'роль';
    p.style.backgroundImage='linear-gradient('+$('#an').value+'deg,'+$('#c1').value+','+$('#c2').value+')';
  };
  ['rn','c1','c2','an'].forEach(i=>$('#'+i).oninput=pv);
  pv();
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
}
async function adminThreads(head){
  app.innerHTML=head+'<div class="row"><input id="tq" placeholder="поиск по названию темы"></div><div id="tl"></div>';
  const load=async()=>{
    const q=$('#tq').value.trim().replace(/[%_,]/g,'');
    let r=sb.from('threads').select('id,title,pinned,locked,solved,board_id,boards(title)').order('bumped_at',{ascending:false}).limit(50);
    if(q)r=r.ilike('title','%'+q+'%');
    let x=await r;
    if(x.error){
      r=sb.from('threads').select('id,title,pinned,locked,board_id,boards(title)').order('bumped_at',{ascending:false}).limit(50);
      if(q)r=r.ilike('title','%'+q+'%');
      x=await r;
    }
    $('#tl').innerHTML=(x.data||[]).map(t=>'<div class="ur"><span><a href="#/t/'+t.id+'">'+esc(t.title)+'</a> <span class="mu">'+esc(t.boards?t.boards.title:'')+'</span>'+(t.pinned?' <span class="tag">'+tr('закреплено')+'</span>':'')+(t.locked?' <span class="tag">'+tr('закрыто')+'</span>':'')+(t.solved?' <span class="tag sv">решено</span>':'')+'</span><span><button class="lk" data-a="pin" data-i="'+t.id+'" data-v="'+(t.pinned?1:0)+'">'+(t.pinned?'открепить':'закрепить')+'</button><button class="lk" data-a="lock" data-i="'+t.id+'" data-v="'+(t.locked?1:0)+'">'+(t.locked?'открыть':'закрыть')+'</button><button class="lk" data-a="delt" data-i="'+t.id+'" data-b="'+t.board_id+'">удалить</button></span></div>').join('')||'<p class="mu">тем не найдено</p>';
  };
  let tm=null;
  $('#tq').oninput=()=>{clearTimeout(tm);tm=setTimeout(load,250)};
  await load();
}
async function adminBoards(head){
  const [r3,r1]=await Promise.all([sb.from('boards').select('*').order('pos'),sb.from('roles').select('id,name').order('id')]);
  const boards=r3.data||[],roles=r1.data||[];
  app.innerHTML=head+
    boards.map((b,n)=>'<div class="ur"><span>'+esc(b.title)+(b.allowed_roles&&b.allowed_roles.length?' <span class="tag">закрытый</span>':'')+'<br><span class="mu">'+esc(b.descr||'')+'</span></span><span><button class="lk" data-a="bup" data-i="'+b.id+'">выше</button><button class="lk" data-a="bdown" data-i="'+b.id+'">ниже</button><button class="lk" data-a="bren" data-i="'+b.id+'" data-v="'+esc(b.title)+'">название</button><button class="lk" data-a="bdesc" data-i="'+b.id+'" data-v="'+esc(b.descr||'')+'">описание</button><button class="lk" data-a="bacc" data-i="'+b.id+'">доступ</button><button class="lk" data-a="bdel" data-i="'+b.id+'">удалить</button></span></div>'+
      '<div class="pe" id="ba-'+b.id+'" hidden><p class="mu">раздел видят только выбранные роли и админы. если ничего не выбрано, раздел открыт для всех.</p><div class="pms">'+roles.map(r=>'<label><input type="checkbox" class="bx-'+b.id+'" value="'+r.id+'"'+((b.allowed_roles||[]).includes(r.id)?' checked':'')+'> '+esc(r.name)+'</label>').join('')+'</div><button class="btn s p" data-a="bsave" data-i="'+b.id+'">сохранить доступ</button></div>').join('')+
    '<h2>новый раздел</h2><form id="bf"><div class="row"><input id="bt" placeholder="название раздела" required><input id="bd" placeholder="описание"><button class="btn p">добавить раздел</button></div></form>';
  $('#bf').onsubmit=async e=>{
    e.preventDefault();
    const r=await sb.from('boards').insert({title:$('#bt').value.trim(),descr:$('#bd').value.trim(),pos:boards.length+1});
    if(r.error)return alert(r.error.message);
    admin();
  };
}
async function adminAnn(head){
  const r=await sb.from('site_settings').select('value').eq('key','announcement').maybeSingle();
  const v=(r.data&&r.data.value)||{on:false,text:'',kind:'info'};
  app.innerHTML=head+'<form id="anf" class="annf"><label class="sw"><input id="ano" type="checkbox"'+(v.on?' checked':'')+'><i></i><span>показывать объявление</span></label><textarea id="ant" rows="4" maxlength="500" placeholder="текст объявления"></textarea><label>вид<select id="ank"><option value="info">обычное</option><option value="warn">важное</option></select></label><div class="row"><button class="btn p">сохранить</button></div></form><p class="mu">после сохранения объявление снова покажется всем, кто его скрыл.</p>';
  $('#ant').value=v.text||'';
  $('#ank').value=v.kind||'info';
  $('#anf').onsubmit=async e=>{
    e.preventDefault();
    const x=await sb.from('site_settings').upsert({key:'announcement',value:{on:$('#ano').checked,text:$('#ant').value.trim(),kind:$('#ank').value,id:Date.now()}});
    if(x.error)return alert(x.error.message);
    loadAnn();
    alert(tr('сохранено'));
  };
}
async function adminLog(head){
  app.innerHTML=head+'<div class="row"><select id="lf"><option value="">все действия</option>'+Object.keys(LOGT).map(k=>'<option value="'+k+'">'+LOGT[k]+'</option>').join('')+'</select></div><div id="ll"></div>';
  const load=async()=>{
    let r=sb.from('mod_log').select('*').order('id',{ascending:false}).limit(100);
    if($('#lf').value)r=r.eq('action',$('#lf').value);
    const x=await r;
    $('#ll').innerHTML=x.error?'<div class="warn"><b>журнал недоступен</b>'+esc(x.error.message)+'</div>':await logHtml(x.data||[]);
  };
  $('#lf').onchange=load;
  await load();
}
async function loadAnn(){
  let el=document.getElementById('ann');
  if(!el){el=document.createElement('div');el.id='ann';app.parentNode.insertBefore(el,app)}
  try{
    const r=await sb.from('site_settings').select('value').eq('key','announcement').maybeSingle();
    const v=r.data&&r.data.value;
    let seen='';
    try{seen=localStorage.getItem('ann_x')||''}catch(x){}
    if(!v||!v.on||!v.text||seen===String(v.id)){el.innerHTML='';return}
    el.innerHTML='<div class="ann '+(v.kind==='warn'?'aw':'ai')+'"><span>'+esc(v.text).replace(/\n/g,'<br>')+'</span><button class="lk" data-a="annx" data-i="'+esc(String(v.id))+'">скрыть</button></div>';
  }catch(x){}
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
  const tabs=modTabs(k);
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
  dmRe=null;
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
    else if(k[1]==='messages'){if(k[2]&&/^[0-9a-f-]{36}$/i.test(k[2]))await dmChat(k[2]);else await dmList()}
    else if(k[1]==='bookmarks')await bookmarks();
    else if(k[1]==='reports')await reports();
    else if(k[1]==='settings'){window.CloudTheme.openSettings();location.replace('#/')}
    else if(k[1]==='notifications')await notifs();
    else if(k[1]==='admin'&&k[2]==='badges')await badgesAdmin();
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
  else if(a==='oauth'){const r=await sb.auth.signInWithOAuth({provider:i,options:{redirectTo:location.origin+location.pathname.replace(/index\.html$/,'').replace(/\/?$/,'/')}});if(r.error)alert(r.error.message)}
  else if(a==='signup'){
    const em=$('#em').value.trim(),pw=$('#pw').value;
    if(!em||pw.length<6)return alert(tr('введи email и пароль от 6 символов'));
    let t;
    try{t=await captcha()}catch(x){return alert(x.message)}
    const r=await sb.auth.signUp(t?{email:em,password:pw,options:{captchaToken:t}}:{email:em,password:pw});
    if(r.error)return alert(r.error.message);
    if(!r.data.session)return alert(tr('аккаунт создан, подтверди почту по ссылке из письма и потом войди'));
    await auth();
    route();
  }
  else if(a==='emailf'){const f=$('#ef');f.hidden=!f.hidden;if(!f.hidden)$('#em').focus()}
  else if(a==='out'){await sb.auth.signOut();await auth();route()}
  else if(a==='rename'){const n=prompt(tr('новое имя (2-24 символа). менять можно раз в 7 дней'),prof?prof.name:'');if(n){const r=await sb.rpc('set_name',{n});if(r.error)return alert(r.error.message);await auth();route()}}
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
  else if(a==='hp'){
    if(!await need())return;
    const r=v==='1'?await sb.from('helpful').delete().eq('post_id',i).eq('user_id',me.id):await sb.from('helpful').insert({post_id:+i});
    if(r.error)return alert(r.error.message);
    const sp=b.querySelector('span'),c=+sp.textContent;
    b.dataset.v=v==='1'?'0':'1';
    b.style.color=v==='1'?'':'var(--ok)';
    sp.textContent=v==='1'?Math.max(0,c-1):c+1;
  }
  else if(a==='editp'){
    const old=b.closest('.item').querySelector('.txt').dataset.raw;
    const n=prompt(tr('изменить сообщение'),old);
    if(n&&n.trim()){const r=await sb.from('posts').update({body:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);thread(+app.dataset.t)}
  }
  else if(a==='delp'){
    if(!confirm(tr('удалить сообщение?')))return;
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
    if(!confirm(tr('удалить тему целиком?')))return;
    const r=await mod('mod_delete_thread',{tid:+i},()=>sb.from('threads').delete().eq('id',i));
    if(r.error)return alert(r.error.message);
    if(location.hash==='#/admin')admin();else location.hash='#/b/'+b.dataset.b;
  }
  else if(a==='sanc'){
    const kind=b.dataset.k;
    const d=prompt(tr('срок: 10m, 1h, 1d, 7d, 30d или навсегда'),'1d');
    if(d===null)return;
    const mins=parseDur(d);
    if(mins===null)return alert(tr('неверный срок, пример: 30m, 2h, 3d, навсегда'));
    const why=prompt(tr('причина (необязательно)'),'')||'';
    const r=await sb.rpc(kind==='ban'?'mod_ban':'mod_mute',{uid:i,minutes:mins,reason:why});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='unsanc'){
    if(!confirm(tr('снять ограничение?')))return;
    const r=await sb.rpc(b.dataset.k==='ban'?'mod_unban':'mod_unmute',{uid:i});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='msel'){
    selUser={id:i,name:v};
    $('#msel').innerHTML=tr('выбран: ')+'<b>'+esc(v)+'</b>';
  }
  else if(a==='avx'){avx=true;b.hidden=true;const el=document.querySelector('.pav');if(el&&prof){el.style.backgroundImage=bgB(prof);el.style.backgroundSize='';el.textContent=String(prof.name||'?').slice(0,1).toUpperCase()}}
  else if(a==='sub'){
    if(!await need())return;
    const r=v==='1'?await sb.from('subs').delete().eq('thread_id',+i).eq('user_id',me.id):await sb.from('subs').insert({thread_id:+i});
    if(r.error)return alert(r.error.message);
    thread(+app.dataset.t);
  }
  else if(a==='bmt'||a==='bmp'){
    if(!await need())return;
    const kind=a==='bmt'?'thread':'post',tid=+app.dataset.t;
    const r=v==='1'?await sb.from('bookmarks').delete().eq('user_id',me.id).eq('kind',kind).eq('ref_id',+i):await sb.from('bookmarks').insert({kind,ref_id:+i,thread_id:tid});
    if(r.error)return alert(r.error.message);
    thread(tid);
  }
  else if(a==='rep'){
    if(!await need())return;
    const why=prompt(tr('причина жалобы (3-300 символов)'));
    if(!why||why.trim().length<3)return;
    const r=await sb.from('reports').insert({post_id:+i,thread_id:+app.dataset.t,reason:why.trim().slice(0,300)});
    if(r.error)return alert(r.error.code==='23505'?tr('вы уже жаловались на это сообщение'):r.error.message);
    alert(tr('жалоба отправлена'));
  }
  else if(a==='rpdone'){const r=await sb.from('reports').update({status:'done'}).eq('id',+i);if(r.error)return alert(r.error.message);reports()}
  else if(a==='rpdel'){const r=await sb.from('reports').delete().eq('id',+i);if(r.error)return alert(r.error.message);reports()}
  else if(a==='rpdelpost'){
    if(!confirm(tr('удалить сообщение?')))return;
    const direct=()=>sb.from('posts').delete().eq('id',+i);
    const r=await mod('mod_delete_post',{pid:+i},direct);
    if(r.error)return alert(r.error.message);
    reports();
  }
  else if(a==='dm'){location.hash='#/messages/'+i}
  else if(a==='pv'){
    if(!await need())return;
    const r=await sb.rpc('poll_vote',{oid:+i});
    if(r.error)return alert(r.error.message);
    thread(+app.dataset.t);
  }
  else if(a==='bgive'){
    const bid=+$('#bgsel').value;
    if(!bid)return;
    const r=await sb.from('user_badges').insert({user_id:i,badge_id:bid});
    if(r.error)return alert(r.error.code==='23505'?tr('этот значок уже выдан'):r.error.message);
    route();
  }
  else if(a==='btake'){
    const r=await sb.from('user_badges').delete().eq('user_id',b.dataset.u).eq('badge_id',+i);
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='bgdel'){
    if(!confirm(tr('удалить значок у всех?')))return;
    const r=await sb.from('badges').delete().eq('id',+i);
    if(r.error)return alert(r.error.message);
    badgesAdmin();
  }
  else if(a==='img'){
    if(!await need())return;
    const tbx=b.closest('.tb'),ta=tbx&&tbx.dataset.for?document.getElementById(tbx.dataset.for):(b.closest('form')||document).querySelector('textarea');
    if(!ta)return;
    const inp=document.createElement('input');
    inp.type='file';inp.accept='image/*';
    inp.onchange=async()=>{
      const f=inp.files[0];
      if(!f)return;
      b.disabled=true;
      try{
        const url=await upPostImg(f);
        ta.value+=(ta.value&&!ta.value.endsWith('\n')?'\n':'')+'[img:'+url+']\n';
      }catch(x){alert(x.message||x)}
      finally{b.disabled=false}
    };
    inp.click();
  }
  else if(a==='ped'){
    const tx=b.parentElement.previousElementSibling;
    if(!tx||!tx.classList.contains('txt'))return;
    const f=document.createElement('form');
    f.className='edf';
    f.innerHTML='<textarea rows="5" maxlength="10000" required></textarea><div class="row"><button class="btn p s">сохранить</button><button type="button" class="btn s" data-a="edx">отмена</button></div>';
    f.querySelector('textarea').value=tx.dataset.raw||'';
    tx.hidden=true;
    b.parentElement.hidden=true;
    tx.insertAdjacentElement('afterend',f);
    f.onsubmit=async e=>{
      e.preventDefault();
      const r=await sb.rpc('edit_post',{pid:+i,b:f.querySelector('textarea').value});
      if(r.error)return alert(r.error.message);
      thread(+app.dataset.t);
    };
  }
  else if(a==='edx'){thread(+app.dataset.t)}
  else if(a==='qt'){
    const tx=b.parentElement.previousElementSibling,ta=$('#rb');
    if(!tx||!ta)return;
    const raw=(tx.dataset.raw||'').split('\n').filter(l=>!/^\s*>/.test(l)&&!/^\[img:/.test(l.trim())).slice(0,8).map(l=>'> '+l).join('\n');
    ta.value+=(ta.value?'\n':'')+'> '+(b.dataset.n||'')+' писал(а):\n'+raw+'\n\n';
    ta.focus();
    ta.scrollIntoView({block:'center'});
  }
  else if(a==='sol'){
    if(!await need())return;
    const r=await sb.rpc('set_solved',{tid:+i,v:v!=='1'});
    if(r.error)return alert(r.error.message);
    thread(+app.dataset.t);
  }
  else if(a==='gang'){window.CloudTheme.setGrad({a:+i});settings()}
  else if(a==='annx'){try{localStorage.setItem('ann_x',i)}catch(x){}const el=$('#ann');if(el)el.innerHTML=''}
  else if(a==='ureset'){
    if(!confirm(tr('сбросить аватар, баннер, о себе и статус этого участника?')))return;
    const r=await sb.rpc('admin_reset_profile',{uid:i});
    if(r.error)return alert(r.error.message);
    alert(tr('профиль сброшен'));
  }
  else if(a==='bup'||a==='bdown'){
    const r=await sb.from('boards').select('id,pos').order('pos');
    const l=r.data||[],n=l.findIndex(x=>x.id==+i),m=a==='bup'?n-1:n+1;
    if(n<0||m<0||m>=l.length)return;
    [l[n],l[m]]=[l[m],l[n]];
    await Promise.all(l.map((x,k)=>sb.from('boards').update({pos:k+1}).eq('id',x.id)));
    admin();
  }
  else if(a==='bdesc'){
    const d=prompt(tr('описание раздела'),b.dataset.v||'');
    if(d===null)return;
    const r=await sb.from('boards').update({descr:d.trim()}).eq('id',+i);
    if(r.error)return alert(r.error.message);
    admin();
  }
  else if(a==='bacc'){const p=$('#ba-'+i);if(p)p.hidden=!p.hidden}
  else if(a==='bsave'){
    const rids=[...document.querySelectorAll('.bx-'+i+':checked')].map(x=>+x.value);
    const r=await sb.rpc('set_board_access',{bid:+i,rids});
    if(r.error)return alert(r.error.message);
    admin();
  }
  else if(a==='th'){window.CloudTheme.set(i);settings()}
  else if(a==='gr'){window.CloudTheme.resetGrad();settings()}
  else if(a==='gp'){const q=GP[window.CloudTheme.get()][+i];window.CloudTheme.setGrad({on:true,c1:q[1],c2:q[2],a:q[3]});settings()}
  else if(a==='nopen'){await sb.from('notifications').update({read:true}).eq('id',i);refreshBell()}
  else if(a==='nreadall'){await sb.from('notifications').update({read:true}).eq('user_id',me.id).eq('read',false);await refreshBell();notifs()}
  else if(a==='nclear'){if(confirm(tr('удалить все уведомления?'))){await sb.from('notifications').delete().eq('user_id',me.id);await refreshBell();notifs()}}
  else if(a==='pedit'){const f=$('#pf');if(f)f.hidden=!f.hidden}
  else if(a==='pcdel'){if(confirm(tr('удалить комментарий?'))){const r=await sb.from('profile_comments').delete().eq('id',i);if(r.error)return alert(r.error.message);route()}}
  else if(a==='perms'){const e2=document.getElementById('pe-'+i);if(e2)e2.hidden=!e2.hidden}
  else if(a==='psave'){
    const p=[...document.querySelectorAll('#pe-'+i+' .up:checked')].map(x=>x.value);
    const r=await sb.rpc('admin_set_perms',{uid:i,p});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='adm'){
    if(!confirm(v==='1'?tr('снять права администратора?'):tr('сделать администратором? он получит полный доступ')))return;
    const r=await sb.rpc('admin_set_admin',{uid:i,flag:v!=='1'});
    if(r.error)return alert(r.error.message);
    route();
  }
  else if(a==='redit'){editing=+i;admin()}
  else if(a==='rcancel'){editing=null;admin()}
  else if(a==='udel'){
    if(!confirm(tr('удалить ')+v+tr(' полностью из базы вместе с темами и сообщениями? это нельзя отменить')))return;
    const r=await sb.rpc('admin_delete_user',{uid:i});
    if(r.error)return alert(tr('не удалось удалить: ')+r.error.message);
    if(location.hash.startsWith('#/u/'))location.hash='#/admin';else route();
  }
  else if(a==='rdel'){if(confirm(tr('удалить роль?'))){const r=await sb.from('roles').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bren'){const n=prompt(tr('новое название'),v);if(n){const r=await sb.from('boards').update({title:n.trim()}).eq('id',i);if(r.error)return alert(r.error.message);admin()}}
  else if(a==='bdel'){if(confirm(tr('удалить раздел со всеми темами?'))){const r=await sb.from('boards').delete().eq('id',i);if(r.error)return alert(r.error.message);admin()}}
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
    if(!selUser)return alert(tr('сначала выбери участника из поиска'));
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
    const sbtn=e.target.querySelector('button.p');
    if(sbtn)sbtn.disabled=true;
    try{
      let au=(prof&&prof.avatar_url)||'',bu=safeUrl($('#pbu').value.trim());
      const fa=$('#pavf').files[0],fb=$('#pbf').files[0];
      if(avx)au='';
      if(fa)au=await upImg(fa,'avatar',256,256);
      if(fb)bu=await upImg(fb,'banner',1200,400);
      const r=await sb.rpc('update_my_profile',{p_bio:$('#pbio').value.trim(),p_status:$('#pst').value.trim(),p_b1:$('#pb1').value,p_b2:$('#pb2').value,p_bangle:+$('#pan').value,p_burl:bu,p_avatar_url:au,p_nk_on:$('#nkon').checked,p_nk1:$('#nk1').value,p_nk2:$('#nk2').value,p_nkangle:+$('#nkan').value});
      if(r.error)throw r.error;
      avx=false;
      await auth();
      route();
    }catch(x){alert(x.message||x)}
    finally{if(sbtn)sbtn.disabled=false}
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
loadAnn();
