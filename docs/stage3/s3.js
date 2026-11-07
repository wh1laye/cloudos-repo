(function(){
var d=document,L=d.getElementById("s3l"),P=d.getElementById("s3p"),I=d.getElementById("s3i");
if(!L)return;
if(window.I18N)window.I18N.add({"состав stage 3":"stage 3 contents","карта появится после первой сборки stage 3.":"the map will appear after the first stage 3 build.","всего":"total","файлов":"files","сборка":"build","корень":"root","дата":"date"});
function t(s){return window.I18N?window.I18N.t(s):s}
function fmt(n){
  var u=["Б","КиБ","МиБ","ГиБ"],i=0;
  while(n>=1024&&i<3){n/=1024;i++}
  var r=(i?n.toFixed(n<10?2:1):String(n))+" "+u[i];
  if(window.CloudTheme&&window.CloudTheme.getLang()==="en")r=r.replace("Б","B").replace("КиB","KiB").replace("МиB","MiB").replace("ГиB","GiB");
  return r;
}
var data=null,path=[];
function node(){
  var n=data.tree;
  for(var i=0;i<path.length;i++){
    var c=(n.c||[]).filter(function(x){return x.n===path[i]})[0];
    if(!c)break;
    n=c;
  }
  return n;
}
function go(p){path=p;draw()}
function draw(){
  var n=node();
  P.textContent="";
  var all=[t("корень")].concat(path);
  all.forEach(function(name,i){
    var b=d.createElement("button");
    b.type="button";b.textContent=i?name:"/";
    b.onclick=function(){go(path.slice(0,i))};
    P.appendChild(b);
  });
  L.textContent="";
  var tot=n.s||1;
  (n.c||[]).forEach(function(c){
    var r=d.createElement(c.c&&c.c.length?"button":"div");
    r.className="s3r";
    if(c.c&&c.c.length){r.type="button";r.setAttribute("data-d","1");r.onclick=function(){go(path.concat([c.n]))}}
    var a=d.createElement("strong");a.textContent=c.n;
    var bar=d.createElement("i"),f=d.createElement("b");
    f.style.width=Math.max(1,Math.round(c.s*100/tot))+"%";
    bar.appendChild(f);
    var sz=d.createElement("span");sz.textContent=fmt(c.s)+" · "+Math.round(c.s*1000/tot)/10+"%";
    r.appendChild(a);r.appendChild(bar);r.appendChild(sz);
    L.appendChild(r);
  });
}
function start(){
  I.textContent=t("всего")+": "+fmt(data.t)+" · "+t("файлов")+": "+data.f+" · "+t("сборка")+": "+data.src+" · "+t("дата")+": "+data.d;
  draw();
}
fetch("map.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){data=j;start()}).catch(function(){I.textContent=t("карта появится после первой сборки stage 3.")});
window.addEventListener("cloudlang",function(){if(data)start()});
})();
