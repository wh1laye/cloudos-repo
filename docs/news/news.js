(function(){
var d=document,box=d.getElementById("nwn"),pl=d.getElementById("nwp");
if(!box)return;
var NEW=3,OLD=7,items=null;
if(window.I18N)window.I18N.add({"новые":"new","старые":"older","в работе и планы":"in progress and plans","сегодня":"today","вчера":"yesterday"});
function en(){return window.CloudTheme&&window.CloudTheme.getLang()==="en"}
function age(s){
  var p=s.split("-"),t=new Date(+p[0],+p[1]-1,+p[2]).getTime(),n=new Date();
  var z=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime();
  return Math.round((z-t)/864e5);
}
function lbl(a){
  if(a<=0)return en()?"today":"сегодня";
  if(a===1)return en()?"yesterday":"вчера";
  return en()?a+" d ago":a+" дн. назад";
}
function sec(title,list,old){
  var h=d.createElement("h2");h.textContent=title;box.appendChild(h);
  var ul=d.createElement("ul");ul.className="nl";
  list.forEach(function(x){
    var li=d.createElement("li");if(old)li.className="o";
    var b=d.createElement("span");b.className="nd";b.textContent=lbl(x.a);
    var w=d.createElement("div"),t=d.createElement("h3"),p=d.createElement("p");
    t.textContent=en()&&x.te?x.te:x.t;
    p.textContent=en()&&x.pe?x.pe:x.p;
    w.appendChild(t);w.appendChild(p);
    li.appendChild(b);li.appendChild(w);ul.appendChild(li);
  });
  box.appendChild(ul);
}
function draw(){
  box.textContent="";
  var a=items.map(function(x){var y=Object.assign({},x);y.a=age(x.d);return y})
    .filter(function(x){return x.a<OLD&&x.a>=0}).sort(function(x,y){return x.a-y.a});
  var n=a.filter(function(x){return x.a<NEW}),o=a.filter(function(x){return x.a>=NEW});
  if(n.length)sec(en()?"new":"новые",n,false);
  if(o.length)sec(en()?"older":"старые",o,true);
  if(pl){pl.hidden=!a.length;pl.textContent=en()?"in progress and plans":"в работе и планы"}
}
fetch("news.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){items=j;draw()}).catch(function(){});
window.addEventListener("cloudlang",function(){if(items)draw()});
})();
