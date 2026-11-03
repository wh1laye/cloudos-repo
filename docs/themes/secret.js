(function(){
if(window.CloudSecret)return;
var d=document,h=d.documentElement,SC=d.currentScript;
var ROOT=SC&&SC.src?SC.src.replace(/themes\/secret\.js.*$/,''):'';
var box=null,out=null,inp=null,pr=null,hist=[],hi=0,t0=Date.now(),tm=[];
var SEC=['boot','handbook','packages','hardware','releases','forum','detect','compare','news'];
var FORT=[
  'there are 10 kinds of people: those who read man pages and those who guess.',
  'a clean build is a build you have not touched yet.',
  'rm -rf is forever, backups are for people who read this message in time.',
  'it works on my machine. ship the machine.',
  'segfault is just the kernel saying no politely.',
  'real admins sleep with root shells open.',
  'if it compiles, ship it. if it boots, frame it.'
];
var CSS='.cst{position:fixed;inset:0;z-index:10000;background:rgba(2,6,3,.95);color:#b6ffc8;font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;display:flex;flex-direction:column;padding:14px;padding-top:max(14px,env(safe-area-inset-top));padding-bottom:max(14px,env(safe-area-inset-bottom))}'
+'.cst[hidden]{display:none}'
+'.csh{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;color:#4fa868;font-size:12px;margin-bottom:8px}'
+'.csx{background:none;border:1px solid #1d5c32;color:#b6ffc8;border-radius:8px;padding:4px 10px;font:inherit;cursor:pointer}'
+'.cso{position:relative;z-index:1;flex:1;overflow:auto;white-space:pre-wrap;word-break:break-word;-webkit-overflow-scrolling:touch}'
+'.csl{position:relative;z-index:1;display:flex;gap:8px;align-items:center;padding-top:8px}'
+'.csp{color:#00ff66;white-space:nowrap}'
+'.csi{flex:1;min-width:0;background:none;border:0;outline:0;color:inherit;font:inherit;font-size:16px;caret-color:#00ff66}'
+'.csc{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.5}';
var st=d.createElement('style');st.textContent=CSS;d.head.appendChild(st);
var CMD={};
function P(s,c){var e=d.createElement('div');e.textContent=s;if(c)e.style.color=c;out.appendChild(e);out.scrollTop=out.scrollHeight}
function W(a,c){for(var i=0;i<a.length;i++)P(a[i],c)}
function later(f,ms){tm.push(setTimeout(f,ms))}
function th(){return window.CloudTheme?window.CloudTheme:null}
function rain(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){P('reduced motion is on, rain skipped');return}
  var cv=d.createElement('canvas'),x=cv.getContext('2d'),w=cv.width=innerWidth,hh=cv.height=innerHeight,fs=16,n=Math.ceil(w/fs),y=[],i,ch='01アイウエオカキクケコサシスセソ',end=Date.now()+7000;
  cv.className='csc';box.insertBefore(cv,box.firstChild);
  for(i=0;i<n;i++)y[i]=Math.random()*-40;
  (function f(){
    if(!box||box.hidden||Date.now()>end){cv.remove();return}
    x.fillStyle='rgba(2,6,3,.14)';x.fillRect(0,0,w,hh);x.fillStyle='#00ff66';x.font=fs+'px monospace';
    for(i=0;i<n;i++){
      x.fillText(ch.charAt(Math.floor(Math.random()*ch.length)),i*fs,y[i]*fs);
      if(y[i]*fs>hh&&Math.random()>.975)y[i]=0;
      y[i]++;
    }
    later(f,55);
  })();
}
CMD.help=function(){W(['help clear exit whoami uname uptime date echo ls cd cat theme matrix neofetch fortune cowsay hack history sudo rm','cd <section> opens a real page: '+SEC.join(' ')])};
CMD.clear=function(){out.textContent=''};
CMD.exit=CMD.quit=function(){close()};
CMD.whoami=function(){P('root')};
CMD.uname=function(){P('cloudos 2.0 x86_64 gnu/linux (browser edition)')};
CMD.uptime=function(){P('up '+Math.round((Date.now()-t0)/1000)+' s, 1 user, load average: 0.00, 0.00, 0.00')};
CMD.date=function(){P(new Date().toString())};
CMD.echo=function(a){P(a.join(' '))};
CMD.history=function(){for(var i=0;i<hist.length;i++)P((i+1)+'  '+hist[i])};
CMD.ls=function(){P(SEC.join('/  ')+'/  motd  os-release')};
CMD.cd=function(a){
  var s=(a[0]||'').replace(/\/+$/,'');
  if(SEC.indexOf(s)<0){P('cd: '+(a[0]||'')+': no such directory');return}
  P('opening '+s+' ...');later(function(){location.href=ROOT+s+'/'},400);
};
CMD.cat=function(a){
  if(a[0]==='motd')W(['welcome to cloudos.','you found the hidden shell. hidden themes are now unlocked: matrix, amber.','type theme to switch.']);
  else if(a[0]==='os-release')W(['NAME="cloudos"','ID=cloudos','ID_LIKE=gentoo','HOME_URL="https://wh1laye.github.io/cloudos-repo/"']);
  else P('cat: '+(a[0]||'')+': no such file');
};
CMD.theme=function(a){
  var T=th();
  if(!T){P('theme engine not loaded');return}
  var all=['light','gray','night','nord','dracula','sepia','matrix','amber'];
  if(!a[0]){P('current: '+T.get());P('available: '+all.join(' '));return}
  if(all.indexOf(a[0])<0){P('theme: '+a[0]+': unknown theme');return}
  T.set(a[0]);
  P(T.get()===a[0]?'theme set to '+a[0]:'theme refused');
};
CMD.matrix=function(){rain()};
CMD.neofetch=function(){
  var T=th(),n=navigator,m=n.deviceMemory?n.deviceMemory+' gb+':'n/a';
  W(['      .--.       root@cloudos','   .-(    ).      -------------','  (___.__)__)      os: cloudos 2.0','                   host: '+location.hostname,'                   shell: cloudsh','                   res: '+innerWidth+'x'+innerHeight,'                   theme: '+(T?T.get():'n/a'),'                   cpu: '+(n.hardwareConcurrency||'?')+' threads','                   mem: '+m,'                   lang: '+(n.language||'?')],'#00ff66');
};
CMD.fortune=function(){P(FORT[Math.floor(Math.random()*FORT.length)])};
CMD.cowsay=function(a){
  var s=a.join(' ')||'moo',b=new Array(s.length+3).join('-');
  W([' '+b,'< '+s+' >',' '+b,'        \\   ^__^','         \\  (oo)\\_______','            (__)\\       )\\/\\','                ||----w |','                ||     ||']);
};
CMD.hack=function(){
  var L=['scanning ports ...','port 22 open','port 443 open','bypassing firewall [##########]','injecting payload ...','access granted','just kidding. this is a static site, nothing was harmed.'],i;
  for(i=0;i<L.length;i++)(function(k){later(function(){P(L[k],k===5?'#00ff66':'')},k*450)})(i);
};
CMD.sudo=function(){P('nice try. this incident will be reported to nobody, it is a static site.')};
CMD.rm=function(a){
  if(a.join(' ').indexOf('-rf')<0||a.join(' ').indexOf('/')<0){P('rm: read-only file system');return}
  var L=['removing /usr ...','removing /etc ...','removing /home ...','removing /boot ...','just kidding. nothing was harmed.'],i;
  for(i=0;i<L.length;i++)(function(k){later(function(){P(L[k],k===4?'#00ff66':'#ff5a5a')},k*400)})(i);
};
function run(line){
  var s=line.trim(),a,c;
  P(pr.textContent+' '+line,'#4fa868');
  if(!s)return;
  if(hist[hist.length-1]!==s)hist.push(s);
  if(hist.length>50)hist.shift();
  hi=hist.length;
  a=s.split(/\s+/);c=a.shift().toLowerCase();
  if(Object.prototype.hasOwnProperty.call(CMD,c)){try{CMD[c](a)}catch(e){P(c+': error')}}
  else P('cloudsh: '+c+': command not found');
}
function build(){
  box=d.createElement('div');box.className='cst';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label','cloudos shell');
  box.innerHTML='<div class="csh"><span>cloudsh 2.0, esc to close</span><button type="button" class="csx">exit</button></div><div class="cso" aria-live="polite"></div><div class="csl"><span class="csp">root@cloudos:~#</span><input class="csi" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="command"></div>';
  d.body.appendChild(box);
  out=box.querySelector('.cso');inp=box.querySelector('.csi');pr=box.querySelector('.csp');
  box.querySelector('.csx').onclick=close;
  box.addEventListener('click',function(e){if(e.target.tagName!=='BUTTON'&&!(window.getSelection&&String(window.getSelection())))inp.focus()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){var v=inp.value;inp.value='';run(v)}
    else if(e.key==='Escape'){close()}
    else if(e.key==='ArrowUp'){e.preventDefault();if(hi>0)hi--;inp.value=hist[hi]||''}
    else if(e.key==='ArrowDown'){e.preventDefault();if(hi<hist.length)hi++;inp.value=hist[hi]||''}
    else if(e.ctrlKey&&(e.key==='l'||e.key==='L')){e.preventDefault();CMD.clear()}
  });
}
function open(first){
  if(!d.body)return;
  if(!box)build();
  if(!box.hidden)return;
  box.hidden=false;h.style.overflow='hidden';
  out.textContent='';
  P('cloudsh 2.0. type help.','#00ff66');
  if(first)P('hidden themes unlocked: matrix, amber. see settings.','#00ff66');
  inp.focus();
}
function close(){
  if(!box)return;
  box.hidden=true;h.style.overflow='';
  while(tm.length)clearTimeout(tm.pop());
  var c=box.querySelector('.csc');if(c)c.remove();
}
window.CloudSecret={open:open,close:close,add:function(n,f){if(typeof n==='string'&&/^[a-z0-9_-]+$/.test(n)&&typeof f==='function')CMD[n]=f},print:function(s,c){if(out)P(String(s),c)}};
})();
