(function(){
function rg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
var COL=['#e8590c','#f08c00','#c92a2a','#d9480f','#e67700','#a61e4d','#f2b134'];
function leaf(c,col){
  c.fillStyle=col;c.beginPath();c.moveTo(0,-8);
  c.bezierCurveTo(7,-6,8,3,0,9);c.bezierCurveTo(-8,3,-7,-6,0,-8);c.fill();
  c.strokeStyle='rgba(60,20,0,.45)';c.lineWidth=.9;c.beginPath();c.moveTo(0,-8);c.lineTo(0,11);c.stroke();
}
function trees(gh,seed,col,sc){
  var r=rg(seed),o='',x=-20,h,w,cx;
  while(x<1030){
    h=gh*sc*(.55+r()*.45);w=h*.7;cx=x+w/2;
    o+='<rect x="'+(cx-3)+'" y="'+(gh-h*.4)+'" width="6" height="'+(h*.4)+'" fill="#2a1608"/>';
    o+='<circle cx="'+cx+'" cy="'+(gh-h*.62)+'" r="'+(w*.42)+'" fill="'+col[Math.floor(r()*col.length)]+'"/>';
    o+='<circle cx="'+(cx-w*.22)+'" cy="'+(gh-h*.45)+'" r="'+(w*.28)+'" fill="'+col[Math.floor(r()*col.length)]+'"/>';
    o+='<circle cx="'+(cx+w*.24)+'" cy="'+(gh-h*.45)+'" r="'+(w*.28)+'" fill="'+col[Math.floor(r()*col.length)]+'"/>';
    x+=w*(.7+r()*.5);
  }
  return o;
}
function layer(gh,seed,col,sc,op){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 '+gh+'" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style="display:block"><g opacity="'+op+'">'+trees(gh,seed,col,sc)+'</g></svg>';
}
window.CloudSeason.reg('au',{
  init:function(k){
    var m=k.mobile(),gh=m?90:150,i;
    k.el('',layer(gh,5,['#7a2e0a','#6b2a08','#8a3a10'],1,.85),'left:0;right:0;bottom:0;height:'+gh+'px',true);
    k.el('',layer(gh,13,['#a3430f','#b5520f','#8f3a0c'],.72,.95),'left:0;right:0;bottom:0;height:'+Math.round(gh*.72)+'px',true);
    k.el('',k.svg('0 0 100 100','<circle cx="50" cy="50" r="30" fill="#ffb347" opacity=".55"/><circle cx="50" cy="50" r="42" fill="#ffb347" opacity=".18"/>'),'right:8%;top:'+(m?60:70)+'px;width:'+(m?80:130)+'px;height:'+(m?80:130)+'px',true);
    var L=[],n=k.n(24),j,o;
    for(j=0;j<n;j++)L.push({x:Math.random(),y:Math.random(),v:k.rnd(22,55),sw:k.rnd(.5,1.4),p:k.rnd(0,6.28),rot:k.rnd(0,6.28),rv:k.rnd(-2,2),z:k.rnd(.8,1.7),c:COL[j%COL.length],f:k.rnd(2,4)});
    k.canvas(function(c,dt,t,w,h){
      var cnt=Math.ceil(n*k.q()),x,y;
      for(j=0;j<cnt;j++){
        o=L[j];
        o.y+=o.v*dt/h;o.rot+=o.rv*dt;
        if(o.y>1.06){o.y=-.06;o.x=Math.random()}
        x=(o.x+Math.sin(t*o.sw+o.p)*.045)*w;y=o.y*h;
        c.save();c.translate(x,y);c.rotate(o.rot+Math.sin(t*o.sw+o.p)*.6);
        c.scale(o.z,o.z*(.55+.45*Math.abs(Math.cos(t*o.f+o.p))));
        leaf(c,o.c);c.restore();
      }
    },false,30,true);
  }
});
})();
