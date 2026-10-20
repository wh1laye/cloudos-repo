(function(){
var T=function(r,e){return window.CloudI18n?window.CloudI18n.t(r,e):r};
var d=document;
var DATA=[{cpu:'amd ryzen 7 5700x',gpu:'amd rx 9060 xt',disk:'sata (sda)',boot:'uefi',res:'ok',nr:'установка по справочнику, stage 3 1.0',ne:'installed following the handbook, stage 3 1.0'}];
var RES={ok:['работает','works'],part:['работает частично','partly works'],fail:['не заработало','did not work']};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function draw(){
  d.title=T('железо: cloudos','hardware: cloudos');
  d.getElementById('h').textContent=T('железо','hardware');
  d.getElementById('lead').textContent=T('на чём cloudos уже проверен. если ты ставил систему на своём железе, расскажи о результате.','what cloudos has been tested on. if you installed the system on your own hardware, tell us how it went.');
  d.getElementById('h2').textContent=T('добавить своё железо','add your hardware');
  d.getElementById('th').innerHTML=['процессор|cpu','видеокарта|gpu','диск|disk','загрузка|boot','результат|result','заметки|notes'].map(function(x){var p=x.split('|');return '<th>'+T(p[0],p[1])+'</th>'}).join('');
  d.getElementById('tb').innerHTML=DATA.map(function(r){
    return '<tr><td>'+esc(r.cpu)+'</td><td>'+esc(r.gpu)+'</td><td>'+esc(r.disk)+'</td><td>'+esc(r.boot)+'</td><td><span class="st '+(r.res==='ok'?'ok':'wip')+'">'+T(RES[r.res][0],RES[r.res][1])+'</span></td><td>'+esc(T(r.nr,r.ne))+'</td></tr>';
  }).join('');
  var L=[['процессор','cpu'],['видеокарта','gpu'],['диск','disk'],['режим загрузки','boot mode'],['результат','result'],['заметки','notes']];
  L.forEach(function(x,i){d.getElementById('l'+(i+1)).textContent=T(x[0],x[1])});
  var rs=d.getElementById('rs');
  var cur=rs.value||'ok';
  rs.options[0].text=T('работает','works');rs.options[1].text=T('работает частично','partly works');rs.options[2].text=T('не заработало','did not work');
  rs.value=cur;
  d.getElementById('go').textContent=T('открыть на github','open on github');
}
d.getElementById('f').addEventListener('submit',function(e){
  e.preventDefault();
  var v=function(i){return d.getElementById(i).value.trim()};
  var rs=d.getElementById('rs');
  var res=rs.options[rs.selectedIndex].text;
  var body='cpu: '+v('cpu')+'\ngpu: '+v('gpu')+'\ndisk: '+v('dsk')+'\nboot mode: '+v('bm')+'\nresult: '+res+'\nnotes: '+v('nt')+'\n';
  window.open('https://github.com/wh1laye/cloudos-repo/issues/new?title='+encodeURIComponent('hardware report: '+(v('cpu')||'?'))+'&body='+encodeURIComponent(body),'_blank','noopener');
});
window.addEventListener('cloudlang',draw);
draw();
})();
