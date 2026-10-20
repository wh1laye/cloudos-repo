(function(){
var T=function(r,e){return window.CloudI18n?window.CloudI18n.t(r,e):r};
var d=document,data=[],cat='all';
var CATS=[['all','все','all'],['system','система','system'],['net','сеть','network'],['tools','инструменты','tools'],['disk','диски','disks'],['dev','разработка','development'],['boot','загрузка','boot']];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function catName(k){for(var i=0;i<CATS.length;i++)if(CATS[i][0]===k)return T(CATS[i][1],CATS[i][2]);return k}
function draw(){
  var en=T(0,1)===1;
  d.title=T('пакеты: cloudos','packages: cloudos');
  d.getElementById('h').textContent=T('пакеты','packages');
  d.getElementById('lead').textContent=T('что входит в stage 3 и что ставится через cloudpkg. список ведётся вручную и позже будет подтягиваться из рецептов cloudpkg.','what is in stage 3 and what is installed with cloudpkg. the list is kept by hand and will later be pulled from cloudpkg recipes.');
  var q=d.getElementById('q');
  q.placeholder=T('поиск по пакетам','search packages');
  d.getElementById('cats').innerHTML=CATS.map(function(c){return '<button type="button" class="chip'+(cat===c[0]?' on':'')+'" data-c="'+c[0]+'">'+T(c[1],c[2])+'</button>'}).join('');
  d.getElementById('th').innerHTML=['пакет|package','версия|version','категория|category','описание|description','статус|status'].map(function(x){var p=x.split('|');return '<th>'+T(p[0],p[1])+'</th>'}).join('');
  var s=q.value.trim().toLowerCase();
  var rows=data.filter(function(p){
    if(cat!=='all'&&p.c!==cat)return false;
    if(!s)return true;
    return (p.n+' '+p.d+' '+p.e).toLowerCase().indexOf(s)>-1;
  });
  d.getElementById('tb').innerHTML=rows.map(function(p){
    return '<tr><td><code>'+esc(p.n)+'</code></td><td>'+esc(p.v||'-')+'</td><td>'+esc(catName(p.c))+'</td><td>'+esc(en?p.e:p.d)+'</td><td><span class="st '+(p.s==='stage3'?'ok':'wip')+'">'+T(p.s==='stage3'?'в stage 3':'через cloudpkg',p.s==='stage3'?'in stage 3':'via cloudpkg')+'</span></td></tr>';
  }).join('')||'<tr><td colspan="5" class="mu">'+T('ничего не найдено','nothing found')+'</td></tr>';
  d.getElementById('cnt').textContent=T('пакетов: ','packages: ')+rows.length;
}
d.getElementById('q').addEventListener('input',draw);
d.getElementById('cats').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;cat=b.getAttribute('data-c');draw()});
window.addEventListener('cloudlang',draw);
fetch('packages.json').then(function(r){return r.json()}).then(function(j){data=j;draw()}).catch(function(){d.getElementById('tb').innerHTML='<tr><td colspan="5" class="mu">'+T('не удалось загрузить список','could not load the list')+'</td></tr>'});
})();
