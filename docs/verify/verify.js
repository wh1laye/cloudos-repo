(function(){
var d=document,REPO='wh1laye/cloudos-repo',VC=window.VC;
function $(i){return d.getElementById(i)}
function en(){return window.CloudTheme&&window.CloudTheme.getLang()==='en'}
function L(r,e){return en()?e:r}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function size(b){
  if(b>=1073741824)return (b/1073741824).toFixed(2)+L(' гб',' gb');
  if(b>=1048576)return (b/1048576).toFixed(1)+L(' мб',' mb');
  if(b>=1024)return Math.round(b/1024)+L(' кб',' kb');
  return b+L(' б',' b');
}
var rel=$('rel'),ast=$('ast'),m1=$('m1'),m2=$('m2'),drop=$('drop'),fin=$('file'),go=$('go'),stop=$('stop'),bar=$('bar'),barw=$('barw'),res=$('res'),keyinfo=$('keyinfo');
var rels=[],file=null,abort=false,busy=false,pubText='';
var SUF=/\.(sha256|minisig|sig)$/i;

function fail(msg){res.innerHTML='<div class="vsum bad">'+esc(msg)+'</div>'}
function load(){
  var k='ver_rel_v1';
  try{var c=JSON.parse(sessionStorage.getItem(k)||'null');if(c&&Date.now()-c.t<600000)return Promise.resolve(c.d)}catch(e){}
  return fetch('https://api.github.com/repos/'+REPO+'/releases?per_page=30',{headers:{Accept:'application/vnd.github+json'}}).then(function(r){
    if(!r.ok)throw new Error('github api: '+r.status);
    return r.json();
  }).then(function(j){try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:j}))}catch(e){}return j});
}
function files(r){return (r.assets||[]).filter(function(a){return !SUF.test(a.name)})}
function fillRel(){
  rel.innerHTML=rels.map(function(r,i){
    return '<option value="'+i+'">'+esc(r.name||r.tag_name)+' · '+new Date(r.published_at||r.created_at).toLocaleDateString(en()?'en-GB':'ru')+'</option>';
  }).join('');
  var pick=0,i;
  for(i=0;i<rels.length;i++){if(files(rels[i]).some(function(a){return /\.iso$/i.test(a.name)})){pick=i;break}}
  rel.value=String(pick);
  fillAst();
}
function cur(){var r=rels[+rel.value];if(!r)return null;var a=files(r)[+ast.value];return a?{r:r,a:a}:null}
function find(r,name){var i,x=r.assets||[];for(i=0;i<x.length;i++)if(x[i].name===name)return x[i];return null}
function fillAst(){
  var r=rels[+rel.value],f=r?files(r):[];
  ast.innerHTML=f.map(function(a,i){return '<option value="'+i+'">'+esc(a.name)+' · '+size(a.size)+'</option>'}).join('');
  var iso=-1,i;
  for(i=0;i<f.length;i++)if(/\.iso$/i.test(f[i].name)){iso=i;break}
  if(iso>=0)ast.value=String(iso);
  methods();
}
function setM(box,on,why){
  var lab=box.closest('label');
  box.disabled=!on;
  if(!on)box.checked=false;
  lab.classList.toggle('off',!on);
  var s=lab.querySelector('em');
  if(s)s.textContent=on?'':' ('+why+')';
}
function methods(){
  var c=cur();
  res.innerHTML='';
  if(!c){setM(m1,false,L('нет файлов','no files'));setM(m2,false,L('нет файлов','no files'));upd();return}
  var h=find(c.r,c.a.name+'.sha256'),s=find(c.r,c.a.name+'.minisig');
  setM(m1,!!h,L('в релизе нет .sha256','no .sha256 in the release'));
  setM(m2,!!s,L('в релизе нет .minisig','no .minisig in the release'));
  if(h)m1.checked=true;
  if(s)m2.checked=true;
  upd();
}
function upd(){
  var c=cur();
  go.disabled=busy||!c||!file||(!m1.checked&&!m2.checked);
  if(file&&c&&file.size!==c.a.size){
    drop.querySelector('span').innerHTML=L('выбран: ','chosen: ')+'<b>'+esc(file.name)+'</b> · '+size(file.size)+'<br>'+L('размер не совпадает с файлом релиза','size does not match the release file')+' ('+size(c.a.size)+')';
  }
}
function setFiles(list){
  var i,f,m=null;
  side={};
  for(i=0;i<list.length;i++){f=list[i];if(SUF.test(f.name))side[f.name]=f;else if(!m)m=f}
  setFile(m||file);
}
function setFile(f){
  file=f||null;
  var c=cur();
  drop.classList.toggle('on',!!file);
  drop.querySelector('span').innerHTML=file?L('выбран: ','chosen: ')+'<b>'+esc(file.name)+'</b> · '+size(file.size):L('нажми и выбери скачанный файл или перетащи его сюда','click to choose the downloaded file or drop it here');
  res.innerHTML='';
  upd();
}
var side={};
function txt(a){
  var sf=side[a.name];
  if(sf){
    if(sf.size!==a.size)return Promise.reject(new Error(L('файл '+a.name+' не совпадает по размеру с файлом в релизе','file '+a.name+' differs in size from the release file')));
    return sf.text();
  }
  function ok(r){if(!r.ok)throw new Error(String(r.status));return r.text()}
  return fetch(a.browser_download_url).then(ok).catch(function(){
    return fetch(a.url,{headers:{Accept:'application/octet-stream'}}).then(ok);
  }).catch(function(){
    throw new Error(L('браузер не смог скачать '+a.name+' с github (нет cors). скачай этот файл из релиза и перетащи сюда вместе с iso.','the browser could not download '+a.name+' from github (no cors). download it from the release and drop it here together with the iso.'));
  });
}
function progress(p){barw.style.width=Math.round(p*100)+'%'}
function readAll(f,onChunk){
  var pos=0,CH=4194304;
  if(f.stream){
    var rd=f.stream().getReader();
    return (function step(){
      return rd.read().then(function(x){
        if(abort){rd.cancel();throw new Error('abort')}
        if(x.done)return;
        onChunk(x.value);pos+=x.value.length;progress(pos/f.size);
        return step();
      });
    })();
  }
  return (function step(){
    if(abort)return Promise.reject(new Error('abort'));
    if(pos>=f.size)return Promise.resolve();
    return f.slice(pos,pos+CH).arrayBuffer().then(function(b){
      onChunk(new Uint8Array(b));pos+=b.byteLength;progress(pos/f.size);
      return step();
    });
  })();
}
function item(ok,title,body){
  return '<div class="vit"><h4><span class="bd '+(ok===true?'ok':ok===false?'bad':'wip')+'">'+(ok===true?L('ок','ok'):ok===false?L('не сошлось','mismatch'):L('пропущено','skipped'))+'</span>'+esc(title)+'</h4>'+body+'</div>';
}
function run(){
  var c=cur();
  if(!c||!file||busy)return;
  if(file.size!==c.a.size){fail(L('размер файла ('+file.size+' б) не равен размеру в релизе ('+c.a.size+' б). файл скачан не полностью или это другой файл.','file size ('+file.size+' b) differs from the release ('+c.a.size+' b). the download is incomplete or it is another file.'));return}
  busy=true;abort=false;upd();
  res.innerHTML='';bar.hidden=false;stop.hidden=false;progress(0);
  var doH=m1.checked,doS=m2.checked,expH=null,sig=null,sp=null,sh=null,bl=null,legacy=false,parts=[];
  var pre=[];
  if(doH)pre.push(txt(find(c.r,c.a.name+'.sha256')).then(function(t){
    var m=t.trim().match(/^([0-9a-fA-F]{64})(?:\s+\*?(.+))?/);
    if(!m)throw new Error(L('в .sha256 нет хеша','no hash in .sha256'));
    expH={h:m[1].toLowerCase(),f:(m[2]||'').trim()};
  }));
  if(doS)pre.push(txt(find(c.r,c.a.name+'.minisig')).then(function(t){sig=t;sp=VC.parseSig(t)}));
  Promise.all(pre).then(function(){
    if(doH)sh=new VC.Sha256();
    if(doS&&sp.hashed)bl=new VC.Blake2b();
    if(doS&&!sp.hashed){
      legacy=true;
      if(file.size>268435456)throw new Error(L('подпись старого формата (без prehash), файл больше 256 мб: в браузере не проверить, используй minisign','legacy signature (no prehash) on a file over 256 mb: cannot be checked in the browser, use minisign'));
      parts=[];
    }
    var t0=Date.now();
    return readAll(file,function(u){
      if(sh)sh.update(u);
      if(bl)bl.update(u);
      if(legacy)parts.push(new Uint8Array(u));
    }).then(function(){return Date.now()-t0});
  }).then(function(ms){
    var out='',allOk=true,hsh;
    if(doH){
      hsh=VC.hex(sh.digest());
      var ok=hsh===expH.h;
      allOk=allOk&&ok;
      out+=item(ok,'sha256',(ok?'<p>'+L('хеш файла совпал с опубликованным в релизе.','the file hash matches the one published in the release.')+'</p>':'<p>'+L('ожидался','expected')+': <code>'+esc(expH.h)+'</code></p>')+'<p>'+L('получен','got')+': <code>'+esc(hsh)+'</code></p>'+(expH.f&&expH.f!==c.a.name&&expH.f!==file.name?'<p>'+L('в .sha256 указано другое имя файла: ','.sha256 names another file: ')+esc(expH.f)+'</p>':''));
    }
    if(doS){
      var data;
      if(legacy){
        var tot=0,i,p=0;for(i=0;i<parts.length;i++)tot+=parts[i].length;
        data=new Uint8Array(tot);for(i=0;i<parts.length;i++){data.set(parts[i],p);p+=parts[i].length}
      }else data=bl.digest();
      return VC.minisignCheck(pubText,sig,data).then(function(r){
        var k=VC.keyIdHex(VC.parsePub(pubText).id);
        if(r.ok){
          out+=item(true,L('подпись minisign','minisign signature'),'<p>'+L('подпись верна, ключ','signature is valid, key')+' <code>'+esc(k)+'</code>.</p><p>'+L('комментарий в подписи','signed comment')+': <code>'+esc(r.comment)+'</code></p>');
        }else{
          allOk=false;
          var why=r.why==='id'?L('подпись сделана другим ключом, не cloudos.pub','signed by another key, not cloudos.pub'):r.why==='comment'?L('подпись файла верна, но комментарий в подписи подменён','the file signature is valid but the signed comment was altered'):L('подпись не подходит к файлу','the signature does not match the file');
          out+=item(false,L('подпись minisign','minisign signature'),'<p>'+esc(why)+'</p>');
        }
        return {out:out,allOk:allOk,ms:ms};
      });
    }
    return {out:out,allOk:allOk,ms:ms};
  }).then(function(o){
    var s=o.allOk?'<div class="vsum ok">'+L('файл настоящий: все выбранные проверки сошлись.','the file is genuine: every selected check passed.')+'</div>':'<div class="vsum bad">'+L('не доверяй этому файлу: проверка не сошлась. скачай заново из релиза и повтори.','do not trust this file: a check failed. download it again from the release and retry.')+'</div>';
    var onlyH=m1.checked&&!m2.checked;
    res.innerHTML=s+o.out+(onlyH&&o.allOk?'<p class="mu">'+L('sha256 защищает от битой загрузки, но не от подмены: хеш лежит в том же релизе. для защиты от подмены включи проверку подписи.','sha256 protects against corrupted downloads, not tampering: the hash sits in the same release. enable the signature check for that.')+'</p>':'')+'<p class="mu">'+L('время','time')+': '+(o.ms/1000).toFixed(1)+' s</p>';
  }).catch(function(e){
    if(e&&e.message==='abort')fail(L('проверка отменена','check cancelled'));
    else if(e&&/Ed25519|importKey|Algorithm|not supported|subtle/i.test(String(e.name+' '+e.message))&&!/github|\.sha256|minisig/i.test(e.message))fail(L('браузер не умеет ed25519 (нужен chrome 137+, firefox 129+ или safari 17+). проверь в терминале: minisign -V -p cloudos.pub -m файл','this browser lacks ed25519 (chrome 137+, firefox 129+ or safari 17+ needed). verify in a terminal: minisign -V -p cloudos.pub -m file'));
    else if(e&&(e.message==='sig'||e.message==='pub'))fail(L('не удалось разобрать подпись или ключ','could not parse the signature or the key'));
    else fail(String(e&&e.message||e));
  }).then(function(){
    busy=false;bar.hidden=true;stop.hidden=true;upd();
  });
}
rel.addEventListener('change',function(){fillAst()});
ast.addEventListener('change',function(){methods()});
m1.addEventListener('change',upd);m2.addEventListener('change',upd);
drop.addEventListener('click',function(){fin.click()});
drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fin.click()}});
fin.multiple=true;
fin.addEventListener('change',function(){if(fin.files&&fin.files.length)setFiles(fin.files)});
['dragenter','dragover'].forEach(function(n){drop.addEventListener(n,function(e){e.preventDefault();drop.classList.add('on')})});
drop.addEventListener('dragleave',function(){if(!file)drop.classList.remove('on')});
drop.addEventListener('drop',function(e){e.preventDefault();var f=e.dataTransfer&&e.dataTransfer.files;if(f&&f.length)setFiles(f)});
go.addEventListener('click',run);
stop.addEventListener('click',function(){abort=true});
window.addEventListener('cloudlang',function(){if(rels.length){var a=rel.value,b=ast.value;fillRel();rel.value=a;fillAst();ast.value=b;methods()}});

fetch('../cloudos.pub').then(function(r){return r.text()}).then(function(t){
  pubText=t;
  var p=VC.parsePub(t);
  keyinfo.innerHTML='<code>'+esc(VC.keyIdHex(p.id))+'</code>';
}).catch(function(){keyinfo.textContent='?'});
load().then(function(j){
  rels=j.filter(function(r){return !r.draft&&files(r).length});
  if(!rels.length){fail(L('в репозитории пока нет релизов с файлами','the repository has no releases with files yet'));return}
  fillRel();
}).catch(function(e){fail(L('не удалось загрузить список релизов: ','could not load the release list: ')+e.message)});
})();
