(function(){
var d=document;
function v(id){return (d.getElementById(id).value||'').trim()}
d.getElementById('go').addEventListener('click',function(){
  var cpu=v('cpu'),gpu=v('gpu');
  if(!cpu){d.getElementById('cpu').focus();return}
  var title='железо: '+cpu+(gpu?' + '+gpu:'');
  var body='процессор: '+cpu+'\nвидеокарта: '+(gpu||'-')+'\nтип диска: '+v('dk')+'\nрежим загрузки: '+v('bm')+'\nрезультат: '+v('rs')+'\n\nкомментарий:\n'+(v('cm')||'-')+'\n';
  var u='https://github.com/wh1laye/cloudos-repo/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
  window.open(u,'_blank','noopener');
});
})();
