(function(){
function rg(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function pines(gh,seed,c1,c2,sc){
  var r=rg(seed),o='',x=-30,h,w,cx;
  while(x<1040){
    h=gh*sc*(.6+r()*.4);w=h*.5;cx=x+w/2;
    o+='<rect x="'+(cx-3)+'" y="'+(gh-h*.12)+'" width="6" height="'+(h*.12)+'" fill="'+c2+'"/>';
    o+='<path d="M'+cx+' '+(gh-h)+'L'+(cx+w*.28)+' '+(gh-h*.58)+'H'+(cx-w*.28)+'zM'+cx+' '+(gh-h*.78)+'L'+(cx+w*.38)+' '+(gh-h*.3)+'H'+(cx-w*.38)+'zM'+cx+' '+(gh-h*.5)+'L'+(cx+w*.5)+' '+(gh-h*.1)+'H'+(cx-w*.5)+'z" fill="'+c1+'"/>';
    x+=w*(.55+r()*.5);
  }
  return o;
}
function layer(gh,seed,c1,c2,sc,op){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 '+gh+'" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style="display:block"><g opacity="'+op+'">'+pines(gh,seed,c1,c2,sc)+'</g></svg>';
}
window.CloudSeason.reg('fo',{
  init:function(k){
    var m=k.mobile(),gh=m?90:150,i;
    k.el('',layer(gh,7,'#0e2a1a','#0a1d12',1,.9),'left:0;right:0;bottom:0;height:'+gh+'px',true);
    k.el('',layer(gh,19,'#0a2014','#07160d',.78,.98),'left:0;right:0;bottom:0;height:'+Math.round(gh*.78)+'px',true);
    k.el('',layer(gh,31,'#06140c','#040e08',.55,1),'left:0;right:0;bottom:0;height:'+Math.round(gh*.55)+'px',true);
    var fl=[],nf=k.n(26),lv=[],nl=k.n(10),j;
    for(j=0;j<nf;j++)fl.push({x:Math.random(),y:.45+Math.random()*.5,p:k.rnd(0,6.28),s:k.rnd(.15,.5),r:k.rnd(1.6,3.2),a:k.rnd(.5,1.6)});
    for(j=0;j<nl;j++)lv.push({x:Math.random(),y:Math.random(),v:k.rnd(14,30),p:k.rnd(0,6.28),rot:k.rnd(0,6.28),rv:k.rnd(-1.4,1.4),z:k.rnd(.7,1.2),c:['#3f9e5a','#2f8048','#7fc06a'][j%3]});
    k.canvas(function(c,dt,t,w,h){
      var n=Math.ceil(nf*k.q()),o,g,x,y,al;
      for(j=0;j<n;j++){
        o=fl[j];
        x=(o.x+Math.sin(t*o.s+o.p)*.03)*w;y=(o.y+Math.cos(t*o.s*1.3+o.p)*.025)*h;
        al=.25+.75*Math.abs(Math.sin(t*o.a+o.p));
        g=c.createRadialGradient(x,y,0,x,y,o.r*5);
        g.addColorStop(0,'rgba(200,255,140,'+al+')');g.addColorStop(.35,'rgba(150,230,100,'+(al*.35)+')');g.addColorStop(1,'rgba(150,230,100,0)');
        c.fillStyle=g;c.beginPath();c.arc(x,y,o.r*5,0,6.283);c.fill();
      }
      n=Math.ceil(nl*k.q());
      for(j=0;j<n;j++){
        o=lv[j];
        o.y+=o.v*dt/h;o.rot+=o.rv*dt;
        if(o.y>1.05){o.y=-.05;o.x=Math.random()}
        x=(o.x+Math.sin(t*.6+o.p)*.03)*w;y=o.y*h;
        c.save();c.translate(x,y);c.rotate(o.rot);c.scale(o.z,o.z*(.5+.5*Math.abs(Math.sin(t+o.p))));
        c.fillStyle=o.c;c.globalAlpha=.8;c.beginPath();c.ellipse(0,0,6,3.2,0,0,6.283);c.fill();
        c.restore();
      }
      c.globalAlpha=1;
    },true,30,true);
  }
});
})();
