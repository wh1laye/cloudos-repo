(function(){
var a=document.getElementById('dl'),i=document.getElementById('dlinfo');
if(!a||!window.fetch)return;
function mb(n){return (n/1048576).toFixed(0)+' мб'}
fetch('https://api.github.com/repos/wh1laye/cloudos-repo/releases?per_page=10').then(function(r){return r.ok?r.json():[]}).then(function(rs){
  for(var k=0;k<rs.length;k++){
    var r=rs[k];
    if(r.draft)continue;
    var f=(r.assets||[]).filter(function(x){return /\.tar\.xz$/.test(x.name)})[0];
    if(!f)continue;
    a.href=f.browser_download_url;
    if(i)i.textContent=f.name.replace(/\.tar\.xz$/,'')+', '+mb(f.size);
    return;
  }
}).catch(function(){});
})();
