const app=document.getElementById('app');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={
  d:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  f:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l5 5v13H6zM14 3v5h5"/></svg>',
  dl:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
};

function walk(path){
  let n=window.REL,tag=null;
  for(const p of path){
    n=(n.c||[]).find(x=>x.t==='d'&&x.n===p);
    if(!n)return null;
    if(n.tag)tag=n.tag;
  }
  return {n,tag};
}

function link(path){
  return '#/'+path.map(encodeURIComponent).join('/');
}

function url(f,tag){
  if(f.u)return f.u;
  const b=window.REL.base;
  return tag?b+'download/'+encodeURIComponent(tag)+'/'+encodeURIComponent(f.n):b+'latest/download/'+encodeURIComponent(f.n);
}

function render(){
  const path=location.hash.slice(1).split('/').filter(Boolean).map(decodeURIComponent);
  const r=walk(path);
  if(!r){
    app.innerHTML='<div class="warn"><b>не найдено</b>такой папки нет. <a href="#/">к списку релизов</a></div>';
    return;
  }
  const crumbs=['<a href="#/">releases</a>'].concat(path.map((p,i)=>i===path.length-1?esc(p):'<a href="'+link(path.slice(0,i+1))+'">'+esc(p)+'</a>')).join(' / ');
  const items=(r.n.c||[]).slice().sort((a,b)=>(a.t===b.t?0:a.t==='d'?-1:1)||a.n.localeCompare(b.n));
  const rows=items.map(x=>{
    if(x.t==='d'){
      return '<a class="rrow" href="'+link(path.concat(x.n))+'"><span class="nm">'+IC.d+'<span><strong>'+esc(x.n)+'</strong>'+(x.d?'<em>'+esc(x.d)+'</em>':'')+'</span></span><span class="mu">папка</span></a>';
    }
    const act=x.soon?'<span class="tag">скоро</span>':'<a class="btn s p" href="'+esc(url(x,r.tag))+'" rel="noopener">'+IC.dl+'скачать</a>';
    return '<div class="rrow"><span class="nm">'+IC.f+'<span><strong>'+esc(x.n)+'</strong>'+(x.size||x.date?'<em>'+esc([x.size,x.date].filter(Boolean).join(' · '))+'</em>':'')+'</span></span>'+act+'</div>';
  }).join('');
  app.innerHTML='<p class="crumbs">'+crumbs+'</p><h1>'+esc(path.length?path[path.length-1]:'релизы')+'</h1>'+
    (path.length?'':'<p class="mu">архивы и образы cloudos. файлы хранятся в github releases и скачиваются напрямую оттуда.</p>')+
    '<div class="rlist">'+(rows||'<p class="mu">здесь пока пусто</p>')+'</div>';
}

window.addEventListener('hashchange',render);
render();
