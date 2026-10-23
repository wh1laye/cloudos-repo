(function(){
var d=document,DATA=null,path=[],COL=['#3563c9','#2e9e6b','#c4372c','#8a4fd0','#e0a33a','#2bb3c4','#c93d7a','#7c8795'];
function en(){return window.CloudTheme&&window.CloudTheme.getLang&&window.CloudTheme.getLang()==='en'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(n){
  var u=en()?['b','kb','mb','gb']:['б','кб','мб','гб'],i=0;
  while(n>=1024&&i<3){n/=1024;i++}
  return (i>1?n.toFixed(1):Math.round(n))+' '+u[i];
}
function node(){var n=DATA.tree,i,j,k;for(i=0;i<path.length;i++){k=null;for(j=0;j<n.c.length;j++)if(n.c[j].n===path[i]){k=n.c[j];break}n=k}return n}
function squarify(items,x,y,w,h){
  var tot=0,i,rects=[],row=[],q=items.slice();
  items.forEach(function(it){tot+=it.s});
  if(tot<=0)return rects;
  var k=w*h/tot;
  q.forEach(function(it){it.a=it.s*k});
  function sum(r){var s=0;r.forEach(function(z){s+=z.a});return s}
  function worst(r,side){
    var s=sum(r),mx=0,mn=1e18;
    r.forEach(function(z){if(z.a>mx)mx=z.a;if(z.a<mn)mn=z.a});
    return Math.max(side*side*mx/(s*s),s*s/(side*side*mn));
  }
  function flush(){
    var s=sum(row),o;
    if(w>=h){
      var rw=s/h,yy=y;
      row.forEach(function(z){var rh=z.a/rw;rects.push({it:z,x:x,y:yy,w:rw,h:rh});yy+=rh});
      x+=rw;w-=rw;
    }else{
      var rh2=s/w,xx=x;
      row.forEach(function(z){var rw2=z.a/rh2;rects.push({it:z,x:xx,y:y,w:rw2,h:rh2});xx+=rw2});
      y+=rh2;h-=rh2;
    }
    row=[];
  }
  while(q.length){
    var it=q[0],side=Math.min(w,h);
    if(!row.length||worst(row.concat([it]),side)<=worst(row,side)){row.push(it);q.shift()}
    else flush();
  }
  if(row.length)flush();
  return rects;
}
function draw(){
  var n=node(),box=d.getElementById('tm'),W=box.clientWidth||600,H=W<560?340:440,kids=(n.c||[]).filter(function(c){return c.s>0});
  box.style.height=H+'px';box.textContent='';
  var items=kids.map(function(c,i){return {c:c,s:c.s,i:i}});
  var top=path.length?path[0]:null;
  var tops=DATA.tree.c.map(function(c){return c.n});
  squarify(items,0,0,W,H).forEach(function(r){
    var c=r.it.c,e=d.createElement('div'),ci=path.length?tops.indexOf(path[0]):r.it.i;
    e.className='tc'+(c.c?' dir':'');
    e.style.cssText='left:'+r.x+'px;top:'+r.y+'px;width:'+Math.max(0,r.w-2)+'px;height:'+Math.max(0,r.h-2)+'px;--c:'+COL[(ci<0?0:ci)%COL.length];
    e.title=c.n+' · '+fmt(c.s);
    if(r.w>64&&r.h>34)e.innerHTML='<b>'+esc(c.n)+'</b><span>'+fmt(c.s)+'</span>';
    if(c.c)e.addEventListener('click',function(){path.push(c.n);draw();crumbs();list()});
    box.appendChild(e);
  });
}
function crumbs(){
  var b=d.getElementById('cr'),h='<button type="button" data-p="-1">/</button>',i;
  for(i=0;i<path.length;i++)h+='<button type="button" data-p="'+i+'">'+esc(path[i])+'</button>';
  b.innerHTML=h;
  [].forEach.call(b.querySelectorAll('button'),function(x){
    x.addEventListener('click',function(){path=path.slice(0,+x.getAttribute('data-p')+1);draw();crumbs();list()});
  });
}
function list(){
  var n=node(),t=d.getElementById('tl'),h='';
  (n.c||[]).slice(0,14).forEach(function(c){
    var p=n.s?Math.round(c.s*1000/n.s)/10:0;
    h+='<tr><td>'+esc(c.n)+'</td><td>'+fmt(c.s)+'</td><td><span class="bar"><i style="width:'+Math.max(1,p)+'%"></i></span> '+p+'%</td></tr>';
  });
  t.innerHTML=h;
}
function init(){
  d.getElementById('empty').hidden=true;d.getElementById('app').hidden=false;
  d.getElementById('meta').textContent=DATA.src+' · '+fmt(DATA.t)+' · '+DATA.f+' '+(en()?'files':'файлов')+' · '+DATA.d;
  draw();crumbs();list();
}
fetch('map.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){DATA=j;init()}).catch(function(){});
window.addEventListener('resize',function(){if(DATA)draw()});
window.addEventListener('cloudlang',function(){if(DATA){init()}});
})();
