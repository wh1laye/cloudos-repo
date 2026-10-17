const app=document.getElementById('app');
const R=window.REL;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={
  d:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  f:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6zM14 3v5h5"/></svg>',
  dl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
};
const GH='https://github.com/'+R.repo+'/releases';

function size(b){
  if(b>=1073741824)return (b/1073741824).toFixed(2)+' гб';
  if(b>=1048576)return (b/1048576).toFixed(1)+' мб';
  if(b>=1024)return Math.round(b/1024)+' кб';
  return b+' б';
}
function day(t){return new Date(t).toLocaleDateString('ru')}
function link(path){return '#/'+path.map(encodeURIComponent).join('/')}

async function load(){
  const k='rel_cache_v1';
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
  rels=rels.filter(r=>!r.draft);
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
      (inGroup.map(r=>'<a class="rrow" href="'+link([gname,r.tag_name])+'"><span class="nm">'+IC.d+'<span><strong>'+esc(r.name||r.tag_name)+'</strong><em>'+day(r.published_at)+(r.prerelease?' · бета':'')+'</em></span></span><span class="mu">'+r.assets.length+' файл.</span></a>').join('')||'<p class="mu">здесь пока пусто</p>')+'</div>';
    return;
  }

  const rel=inGroup.find(r=>r.tag_name===path[1]);
  if(!rel){app.innerHTML='<div class="warn"><b>не найдено</b>такого релиза нет. <a href="#/">к списку</a></div>';return}
  const sha=rel.assets.find(a=>/\.sha256(sum)?$/i.test(a.name));
  app.innerHTML='<p class="crumbs"><a href="#/">releases</a> / <a href="'+link([gname])+'">'+esc(gname)+'</a> / '+esc(rel.tag_name)+'</p><h1>'+esc(rel.name||rel.tag_name)+'</h1>'+
    '<p class="mu">'+day(rel.published_at)+(rel.prerelease?' · бета':'')+' · <a href="'+esc(rel.html_url)+'" rel="noopener">страница на github</a></p>'+
    (rel.body?'<p class="relbody">'+esc(rel.body)+'</p>':'')+
    '<div class="rlist">'+(rel.assets.map(a=>'<div class="rrow"><span class="nm">'+IC.f+'<span><strong>'+esc(a.name)+'</strong><em>'+size(a.size)+' · скачиваний: '+a.download_count+'</em></span></span><a class="btn s p" href="'+esc(a.browser_download_url)+'" rel="noopener">'+IC.dl+'скачать</a></div>').join('')||'<p class="mu">файлов пока нет</p>')+'</div>'+
    (sha?'<h2>проверка целостности</h2><p class="mu">положи архив и файл .sha256 в одну папку и выполни:</p><pre class="cmd">sha256sum -c '+esc(sha.name)+'</pre>':'');
}

window.addEventListener('hashchange',render);
render();
