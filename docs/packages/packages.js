(function(){
var d=document,rows=d.getElementById('rows'),q=d.getElementById('q'),c=d.getElementById('c'),cnt=d.getElementById('cnt');
var CAT={system:['система','system'],toolchain:['инструменты сборки','toolchain'],init:['инициализация','init'],network:['сеть','network'],tools:['утилиты','tools'],lib:['библиотеки','libraries'],fs:['файловые системы','filesystems'],boot:['загрузка','boot']};
var ST={stage3:['в stage 3','in stage 3'],cloudpkg:['через cloudpkg','via cloudpkg']};
var data=[];
function en(){return window.CloudTheme&&window.CloudTheme.getLang()==='en'?1:0}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function fillCats(){
  var cur=c.value,first='<option value="">'+(en()?'all categories':'все категории')+'</option>';
  c.innerHTML=first+Object.keys(CAT).map(function(k){return '<option value="'+k+'">'+CAT[k][en()]+'</option>'}).join('');
  c.value=cur;
}
function draw(){
  var t=q.value.trim().toLowerCase(),k=c.value,e=en();
  var list=data.filter(function(p){
    if(k&&p.c!==k)return false;
    if(!t)return true;
    return (p.n+' '+p.d.ru+' '+p.d.en).toLowerCase().indexOf(t)>-1;
  });
  cnt.textContent=(e?'found: ':'найдено: ')+list.length;
  rows.innerHTML=list.length?list.map(function(p){
    return '<tr><td><code>'+esc(p.n)+'</code></td><td>'+(p.v?esc(p.v):'-')+'</td><td>'+esc(CAT[p.c]?CAT[p.c][e]:p.c)+'</td><td>'+esc(p.d[e?'en':'ru'])+'</td><td><span class="st '+(p.s==='stage3'?'ok':'wip')+'">'+ST[p.s][e]+'</span></td></tr>';
  }).join(''):'<tr><td colspan="5" class="mu">'+(e?'nothing found':'ничего не найдено')+'</td></tr>';
}
fetch('packages.json').then(function(r){return r.json()}).then(function(j){data=j;fillCats();draw()}).catch(function(){cnt.textContent='packages.json'});
q.addEventListener('input',draw);
c.addEventListener('change',draw);
window.addEventListener('cloudlang',function(){fillCats();draw()});
})();
