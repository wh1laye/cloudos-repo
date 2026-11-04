(function(){
var d=document,REPO='wh1laye/cloudos-repo',API='https://api.github.com/repos/'+REPO+'/';
var WF=[['iso.yml','сборка iso','iso build'],['iso-test.yml','тест iso','iso test'],['stage3.yml','сборка stage 3','stage 3 build'],['cloudpkg-release.yml','релиз cloudpkg','cloudpkg release']];
function $(i){return d.getElementById(i)}
function en(){return window.CloudTheme&&window.CloudTheme.getLang()==='en'}
function L(r,e){return en()?e:r}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ago(t){
  var s=Math.max(0,(Date.now()-new Date(t).getTime())/1000),n;
  if(s<3600){n=Math.max(1,Math.round(s/60));return en()?n+' min ago':n+' мин назад'}
  if(s<86400){n=Math.round(s/3600);return en()?n+' h ago':n+' ч назад'}
  n=Math.round(s/86400);return en()?n+' d ago':n+' дн назад';
}
function days(t){return (Date.now()-new Date(t).getTime())/86400000}
function date(t){return new Date(t).toLocaleDateString(en()?'en-GB':'ru')}
function get(u){
  var k='st_'+u,c=null;
  try{c=JSON.parse(sessionStorage.getItem(k)||'null')}catch(e){}
  if(c&&Date.now()-c.t<300000)return Promise.resolve(c.d);
  return fetch(API+u,{headers:{Accept:'application/vnd.github+json'}}).then(function(r){
    if(!r.ok){var e=new Error('github api: '+r.status);e.code=r.status;throw e}
    return r.json();
  }).then(function(j){try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:j}))}catch(e){}return j});
}
function state(r){
  if(!r)return ['mu',L('не запускалась','never ran')];
  if(r.status!=='completed')return ['wip',r.status==='queued'?L('в очереди','queued'):L('идёт','running')];
  if(r.conclusion==='success')return ['ok',L('успешно','passed')];
  if(r.conclusion==='cancelled')return ['mu',L('отменена','cancelled')];
  if(r.conclusion==='skipped')return ['mu',L('пропущена','skipped')];
  return ['bad',L('упала','failed')];
}
function runCell(r){
  if(!r)return '-';
  return '<a href="'+esc(r.html_url)+'" rel="noopener">'+esc(date(r.created_at))+'</a> <span class="mu">('+ago(r.created_at)+')</span>';
}
var data=null;
function draw(){
  if(!data)return;
  var rows='',i;
  for(i=0;i<WF.length;i++){
    var w=data.wf[i],runs=w&&w.workflow_runs?w.workflow_runs.filter(function(r){return r.event!=='pull_request'}):[],last=runs[0],ok=null,j;
    for(j=0;j<runs.length;j++)if(runs[j].conclusion==='success'){ok=runs[j];break}
    var s=state(last);
    rows+='<tr><td><code>'+esc(WF[i][0])+'</code><br><span class="mu">'+esc(en()?WF[i][2]:WF[i][1])+'</span></td><td><span class="bd '+s[0]+'">'+esc(s[1])+'</span></td><td>'+runCell(last)+'</td><td>'+(ok?runCell(ok):L('нет среди последних','none among the latest'))+'</td></tr>';
  }
  $('wf').innerHTML=rows;
  var c=data.commit&&data.commit[0],rl=data.rel&&data.rel.filter(function(r){return !r.draft})[0],iso=null,k;
  var isoRuns=data.wf[0]&&data.wf[0].workflow_runs?data.wf[0].workflow_runs:[];
  for(k=0;k<isoRuns.length;k++)if(isoRuns[k].conclusion==='success'){iso=isoRuns[k];break}
  var cd=c?days(c.commit.committer.date):null,live,cls;
  if(cd===null){live=L('нет данных','no data');cls='mu'}
  else if(cd<=30){live=L('проект живой','the project is active');cls='ok'}
  else if(cd<=120){live=L('активность редкая','activity is slow');cls='wip'}
  else{live=L('давно без изменений','no changes for a long time');cls='bad'}
  $('sum').innerHTML=
   '<div class="sc"><span>'+L('проект','PROJECT')+'</span><b>'+esc(live)+'</b><small><span class="bd '+cls+'">'+(cd===null?'?':Math.round(cd)+L(' дн без коммитов',' d since last commit'))+'</span></small></div>'+
   '<div class="sc"><span>'+L('последний коммит','LAST COMMIT')+'</span><b>'+(c?esc(date(c.commit.committer.date)):'-')+'</b><small>'+(c?'<a href="'+esc(c.html_url)+'" rel="noopener">'+esc((c.commit.message||'').split('\n')[0].slice(0,70))+'</a>':'')+'</small></div>'+
   '<div class="sc"><span>'+L('последний релиз','LAST RELEASE')+'</span><b>'+(rl?esc(rl.name||rl.tag_name):'-')+'</b><small>'+(rl?'<a href="'+esc(rl.html_url)+'" rel="noopener">'+esc(date(rl.published_at||rl.created_at))+'</a> ('+ago(rl.published_at||rl.created_at)+')':'')+'</small></div>'+
   '<div class="sc"><span>'+L('последняя успешная сборка iso','LAST PASSING ISO BUILD')+'</span><b>'+(iso?esc(date(iso.created_at)):L('нет данных','no data'))+'</b><small>'+(iso?'<a href="'+esc(iso.html_url)+'" rel="noopener">'+ago(iso.created_at)+'</a>':'')+'</small></div>';
  $('upd').textContent=L('данные github, кеш 5 минут. обновлено: ','github data, cached for 5 minutes. updated: ')+new Date().toLocaleTimeString(en()?'en-GB':'ru');
}
function lim(e){
  $('sum').innerHTML='<div class="vsum bad" style="grid-column:1/-1">'+(e&&e.code===403?L('лимит запросов github для этого адреса исчерпан, попробуй позже.','the github rate limit for this address is exhausted, try again later.'):L('не удалось получить данные: ','could not load data: ')+esc(e&&e.message))+' <a href="https://github.com/'+REPO+'/actions" rel="noopener">'+L('открыть actions на github','open actions on github')+'</a></div>';
}
var jobs=[];
WF.forEach(function(w){jobs.push(get('actions/workflows/'+w[0]+'/runs?per_page=10&exclude_pull_requests=true').catch(function(e){if(e.code===404)return {workflow_runs:[]};throw e}))});
Promise.all([Promise.all(jobs),get('commits?per_page=1').catch(function(){return null}),get('releases?per_page=10').catch(function(){return null})]).then(function(a){
  data={wf:a[0],commit:a[1],rel:a[2]};
  draw();
}).catch(lim);
window.addEventListener('cloudlang',draw);
})();
