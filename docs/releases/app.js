const app=document.getElementById('app');
const R=window.REL;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={
  d:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  f:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6zM14 3v5h5"/></svg>',
  dl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
};
const GH='https://github.com/'+R.repo+'/releases';

function EN(){return window.CloudTheme&&window.CloudTheme.getLang()==='en'}
function size(b){
  const e=EN();
  if(b>=1073741824)return (b/1073741824).toFixed(2)+(e?' gb':' гб');
  if(b>=1048576)return (b/1048576).toFixed(1)+(e?' mb':' мб');
  if(b>=1024)return Math.round(b/1024)+(e?' kb':' кб');
  return b+(e?' b':' б');
}
function day(t){return new Date(t).toLocaleDateString(EN()?'en-GB':'ru')}
function inl(t){
  return t.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" rel="noopener" target="_blank">$1</a>');
}
function md(src){
  const lines=String(src||'').replace(/\r/g,'').split('\n');
  let out='',ul=false,para=[];
  const fp=()=>{if(para.length){out+='<p>'+inl(esc(para.join(' ')))+'</p>';para=[]}};
  const fu=()=>{if(ul){out+='</ul>';ul=false}};
  lines.forEach(l=>{
    let m;
    if(!l.trim()){fp();fu();return}
    if((m=l.match(/^#{1,6}\s+(.*)$/))){fp();fu();out+='<h3>'+inl(esc(m[1]))+'</h3>';return}
    if((m=l.match(/^\s*[-*]\s+(.*)$/))){fp();if(!ul){out+='<ul>';ul=true}out+='<li>'+inl(esc(m[1]))+'</li>';return}
    fu();para.push(l.trim());
  });
  fp();fu();
  return out;
}
const shaCache={};
async function shaOf(a){
  if(a.id in shaCache)return shaCache[a.id];
  let v=null;
  try{
    const r=await fetch(a.browser_download_url);
    if(r.ok){
      const t=(await r.text()).trim();
      const m=t.match(/^([0-9a-fA-F]{64})(?:\s+\*?(.+))?/);
      if(m)v={h:m[1].toLowerCase(),f:(m[2]||'').trim()};
    }
  }catch(e){}
  shaCache[a.id]=v;
  return v;
}
function link(path){return '#/'+path.map(encodeURIComponent).join('/')}

async function load(){
  const k='rel_cache_v2';
  try{
    const c=JSON.parse(sessionStorage.getItem(k)||'null');
    if(c&&Date.now()-c.t<600000)return c.d;
  }catch(e){}
  const r=await fetch('https://api.github.com/repos/'+R.repo+'/releases?per_page=50',{headers:{Accept:'application/vnd.github+json'}});
  if(!r.ok)throw new Error('github api: '+r.status);
  const d=await r.json();
  try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d}))}catch(e){}
  return d;
}

function groupOf(r){
  const s=((r.name||'')+' '+r.tag_name).toLowerCase();
  const g=R.groups.find(x=>s.includes(x.match.toLowerCase()));
  return g?g.n:'другое';
}

function fail(msg){
  app.innerHTML='<div class="warn"><b>не удалось загрузить список</b>'+esc(msg)+'. <a href="'+GH+'" rel="noopener">открыть релизы на github</a></div>';
}

async function render(){
  const path=location.hash.slice(1).split('/').filter(Boolean).map(decodeURIComponent);
  let rels;
  try{rels=await load()}catch(e){return fail(e.message)}
  rels=rels.filter(r=>!r.draft).sort((a,b)=>new Date(b.published_at)-new Date(a.published_at));
  const newest=rels[0]?rels[0].id:null;
  const tags=r=>(r.id===newest?' · <span class="tag lt">последний</span>':'')+((r.prerelease||/beta|бета/i.test((r.name||'')+' '+r.tag_name))?' · <span class="tag">бета</span>':'');
  const groups=R.groups.map(g=>({n:g.n,d:g.d})).concat([{n:'другое',d:'остальные релизы'}]).filter(g=>rels.some(r=>groupOf(r)===g.n));

  if(!path.length){
    app.innerHTML='<p class="crumbs">releases</p><h1>релизы</h1><p class="mu">архивы и образы cloudos. файлы хранятся в github releases и скачиваются напрямую оттуда.</p><div class="rlist">'+
      (groups.map(g=>'<a class="rrow" href="'+link([g.n])+'"><span class="nm">'+IC.d+'<span><strong>'+esc(g.n)+'</strong><em>'+esc(g.d)+'</em></span></span><span class="mu">'+rels.filter(r=>groupOf(r)===g.n).length+'</span></a>').join('')||'<p class="mu">релизов пока нет</p>')+'</div>';
    return;
  }

  const gname=path[0];
  const inGroup=rels.filter(r=>groupOf(r)===gname);
  if(path.length===1){
    app.innerHTML='<p class="crumbs"><a href="#/">releases</a> / '+esc(gname)+'</p><h1>'+esc(gname)+'</h1><div class="rlist">'+
      (inGroup.map(r=>'<a class="rrow" href="'+link([gname,r.tag_name])+'"><span class="nm">'+IC.d+'<span><strong>'+esc(r.name||r.tag_name)+'</strong><em>'+day(r.published_at)+tags(r)+'</em></span></span><span class="mu">'+r.assets.length+' файл.</span></a>').join('')||'<p class="mu">здесь пока пусто</p>')+'</div>';
    return;
  }

  const rel=inGroup.find(r=>r.tag_name===path[1]);
  if(!rel){app.innerHTML='<div class="warn"><b>не найдено</b>такого релиза нет. <a href="#/">к списку</a></div>';return}
  const sha=rel.assets.find(a=>/\.sha256(sum)?$/i.test(a.name));
  app.innerHTML='<p class="crumbs"><a href="#/">releases</a> / <a href="'+link([gname])+'">'+esc(gname)+'</a> / '+esc(rel.tag_name)+'</p><h1>'+esc(rel.name||rel.tag_name)+'</h1>'+
    '<p class="mu">'+day(rel.published_at)+tags(rel)+' · <a href="'+esc(rel.html_url)+'" rel="noopener">страница на github</a></p>'+
    (rel.body?'<div class="relbody">'+md(rel.body)+'</div>':'')+
    '<div class="rlist">'+(rel.assets.map(a=>'<div class="rrow"><span class="nm">'+IC.f+'<span><strong>'+esc(a.name)+'</strong><em>'+size(a.size)+' · скачиваний: '+a.download_count+'</em></span></span><a class="btn s p" href="'+esc(a.browser_download_url)+'" rel="noopener">'+IC.dl+'скачать</a></div>').join('')||'<p class="mu">файлов пока нет</p>')+'</div>'+
    (sha?'<h2>проверка целостности</h2><p class="mu">положи архив и файл .sha256 в одну папку и выполни:</p><pre class="cmd">sha256sum -c '+esc(sha.name)+'</pre><div class="shab" id="shab" hidden></div>':'');
  if(sha){
    const v=await shaOf(sha);
    const box=document.getElementById('shab');
    if(v&&box){
      box.innerHTML='<span class="mu">контрольная сумма sha256</span><code>'+esc(v.h)+'</code><button type="button" class="btn s">копировать</button>';
      box.hidden=false;
      const b=box.querySelector('button');
      b.onclick=()=>{
        const done=()=>{b.textContent=EN()?'copied':'скопировано';setTimeout(()=>{b.textContent=EN()?'copy':'копировать'},1500)};
        if(window.CloudTheme&&window.CloudTheme.copy)window.CloudTheme.copy(v.h,done);else if(navigator.clipboard)navigator.clipboard.writeText(v.h).then(done);
      };
    }
  }
}

window.addEventListener('hashchange',render);
window.addEventListener('cloudlang',render);
render();
