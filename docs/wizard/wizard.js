(function(){
var d=document,v={fs:'ext4',fw:'auto'};
function g(i){return d.getElementById(i)}
function safe(s){return /^[A-Za-z0-9_./-]*$/.test(s)}
function paint(){
  var dk=g('dk').value.trim()||'/dev/sda',hn=g('hn').value.trim(),un=g('un').value.trim(),ok=true,e=[];
  [['dk',dk],['hn',hn],['un',un]].forEach(function(x){var b=safe(x[1]);g(x[0]).classList.toggle('bad',!b);if(!b)ok=false});
  e.push('CLOUDOS_DISK='+dk);
  e.push('CLOUDOS_FS='+v.fs);
  if(v.fw!=='auto')e.push('CLOUDOS_FW='+v.fw);
  if(hn)e.push('CLOUDOS_HOST='+hn);
  if(un)e.push('CLOUDOS_USER='+un);
  g('out').textContent=ok?'doas env '+e.join(' ')+' cloudos-install':'';
  g('cp').disabled=!ok;
}
[].forEach.call(d.querySelectorAll('.wzs'),function(b){
  [].forEach.call(b.querySelectorAll('button'),function(x){
    x.onclick=function(){
      v[b.getAttribute('data-k')]=x.getAttribute('data-v');
      [].forEach.call(b.querySelectorAll('button'),function(y){y.classList.toggle('on',y===x)});
      paint();
    };
  });
});
['dk','hn','un'].forEach(function(i){g(i).addEventListener('input',paint)});
g('cp').onclick=function(){
  var t=g('out').textContent;
  if(navigator.clipboard)navigator.clipboard.writeText(t).catch(function(){});
};
paint();
})();
