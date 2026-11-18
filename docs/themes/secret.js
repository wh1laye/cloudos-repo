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
var RUM={"reduced motion is on, rain skipped": "включено уменьшение движения, дождь пропущен", "theme engine not loaded": "движок тем не загружен", "nice try. this incident will be reported to nobody, it is a static site.": "хорошая попытка. об инциденте никому не сообщат, это статический сайт.", "rm: read-only file system": "rm: файловая система только для чтения", "removing /usr ...": "удаляю /usr ...", "removing /etc ...": "удаляю /etc ...", "removing /home ...": "удаляю /home ...", "removing /boot ...": "удаляю /boot ...", "just kidding. nothing was harmed.": "шучу. ничего не пострадало.", "just kidding. this is a static site, nothing was harmed.": "шучу. это статический сайт, ничего не пострадало.", "scanning ports ...": "сканирую порты ...", "port 22 open": "порт 22 открыт", "port 443 open": "порт 443 открыт", "bypassing firewall [##########]": "обхожу фаервол [##########]", "injecting payload ...": "внедряю нагрузку ...", "access granted": "доступ получен", "syncing gentoo snapshot ...": "синхронизирую снимок gentoo ...", "sandbox: nothing was changed": "песочница: ничего не изменено", "calculating dependencies ...": "считаю зависимости ...", "nothing to upgrade, you run a browser tab": "обновлять нечего, у тебя вкладка браузера", "cloudpkg: nothing to clean": "cloudpkg: чистить нечего", "cloudpkg: could not load packages.json": "cloudpkg: не удалось загрузить packages.json", "cloudpkg: give a search string": "cloudpkg: укажи строку поиска", "cloudpkg: give a package": "cloudpkg: укажи пакет", "what manual page do you want?": "какую страницу руководства показать?", "ping: usage error: destination required": "ping: нужно указать адрес", "PING localhost (127.0.0.1) 56(84) bytes of data.": "PING localhost (127.0.0.1) 56(84) байт данных.", "3 packets transmitted, 3 received, 0% packet loss": "передано 3 пакета, получено 3, потерь 0%", "cloudsh 2.0. type help.": "cloudsh 2.0. введи help.", "hidden themes unlocked: matrix, amber. see settings.": "скрытые темы открыты: matrix, amber. смотри настройки.", "cloudsh 2.0, esc to close": "cloudsh 2.0, esc закрывает", "exit": "выход", "command": "команда", "cloudos shell": "оболочка cloudos", "there are 10 kinds of people: those who read man pages and those who guess.": "есть 10 типов людей: те, кто читает man, и те, кто угадывает.", "a clean build is a build you have not touched yet.": "чистая сборка — это сборка, которую ты ещё не трогал.", "rm -rf is forever, backups are for people who read this message in time.": "rm -rf навсегда, а бэкапы для тех, кто прочитал это вовремя.", "it works on my machine. ship the machine.": "у меня работает. отправляй мою машину.", "segfault is just the kernel saying no politely.": "segfault — это ядро вежливо говорит «нет».", "real admins sleep with root shells open.": "настоящие админы спят с открытым root-шеллом.", "if it compiles, ship it. if it boots, frame it.": "собралось — выпускай. загрузилось — в рамку.", "cloudpkg search|info|list|install -p works on the real package list. try: cloudpkg search nano": "cloudpkg search|info|list|install -p работает с настоящим списком пакетов. попробуй: cloudpkg search nano"},RUX=[[/^cd: (.*): no such directory$/,"cd: $1: нет такого каталога"],[/^opening (.*) \.\.\.$/,"открываю $1 ..."],[/^cat: (.*): no such file$/,"cat: $1: нет такого файла"],[/^current: (.*)$/,"сейчас: $1"],[/^available: (.*)$/,"доступно: $1"],[/^theme: (.*): unknown theme$/,"theme: $1: неизвестная тема"],[/^nothing found for (.*)$/,"по запросу «$1» ничего не найдено"],[/^cloudpkg: unknown command (.*)$/,"cloudpkg: неизвестная команда $1"],[/^cloudpkg: (.*): no such package in the sandbox list$/,"cloudpkg: $1: такого пакета нет в списке песочницы"],[/^ping: (.*): sandbox has no network$/,"ping: $1: в песочнице нет сети"],[/^no manual entry for (.*) here, see (.*)$/,"здесь нет страницы руководства для $1, смотри $2"],[/^cloudsh: (.*): command not found$/,"cloudsh: $1: команда не найдена"],[/^cd <section> opens a real page: (.*)$/,"cd <раздел> открывает настоящую страницу: $1"],[/^up (\d+) s, 1 user, load average: (.*)$/,"работает $1 с, 1 пользователь, нагрузка: $2"]];
function isEn(){return !!(window.CloudTheme&&window.CloudTheme.getLang&&window.CloudTheme.getLang()==='en')}
function tr(s){if(isEn())return s;if(RUM.hasOwnProperty(s))return RUM[s];for(var i=0;i<RUX.length;i++)if(RUX[i][0].test(s))return s.replace(RUX[i][0],RUX[i][1]);return s}
function P(s,c){var e=d.createElement('div');e.textContent=tr(s);if(c)e.style.color=c;out.appendChild(e);out.scrollTop=out.scrollHeight}
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
CMD.help=function(){W(['help clear exit whoami uname uptime date echo ls cd cat theme matrix neofetch fortune cowsay hack history sudo rm','cloudpkg pwd id hostname which man free df lsblk ps dmesg ping sl cloudos-audit','cloudpkg search|info|list|install -p works on the real package list. try: cloudpkg search nano','cd <section> opens a real page: '+SEC.join(' ')])};
CMD.clear=function(){out.textContent=''};
CMD.exit=CMD.quit=function(){close()};
CMD.whoami=function(){P('root')};
CMD.uname=function(){P('cloudos 2.1 x86_64 gnu/linux (browser edition)')};
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
  W(['      .--.       root@cloudos','   .-(    ).      -------------','  (___.__)__)      os: cloudos 2.3','                   host: '+location.hostname,'                   shell: cloudsh','                   res: '+innerWidth+'x'+innerHeight,'                   theme: '+(T?T.get():'n/a'),'                   cpu: '+(n.hardwareConcurrency||'?')+' threads','                   mem: '+m,'                   lang: '+(n.language||'?')],'#00ff66');
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
var PK=null,PKP=null,gameOff=null;
function pkgs(cb){
  if(PK){cb(PK);return}
  if(!PKP)PKP=fetch(ROOT+'packages/packages.json').then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return null});
  PKP.then(function(j){if(j)PK=j;cb(j)});
}
function pd(p){return p.d&&(p.d.en||p.d.ru)||''}
function pkrow(p){return p.n+(p.v?' '+p.v:'')+'  -  '+pd(p)+(p.s==='stage3'?'  [in system]':'  [source]')}
var CPH=['cloudpkg 1.0 (portage wrapper), browser sandbox','usage: cloudpkg command [args]','','  search string     find a package','  info package      show what would be installed','  list              installed packages','  install [-p] pkg  simulated install','  remove pkg        simulated remove','  sync upgrade clean doctor  simulated','  version','','data comes from packages/packages.json. nothing is installed, this is a static site.'];
CMD.cloudpkg=function(a){
  var c=a[0],args=a.slice(1).filter(function(x){return x.charAt(0)!=='-'}),dry=a.indexOf('-p')>0||a.indexOf('--pretend')>0;
  if(!c||c==='help'){W(CPH);return}
  if(c==='version'){P('cloudpkg 1.0');return}
  if(c==='sync'){P('syncing gentoo snapshot ...');later(function(){P('sandbox: nothing was changed','#00ff66')},700);return}
  if(c==='upgrade'){P('calculating dependencies ...');later(function(){P('nothing to upgrade, you run a browser tab','#00ff66')},700);return}
  if(c==='clean'){P('cloudpkg: nothing to clean');return}
  if(c==='doctor'){W(['portage: ok','overlay cloudos: ok','signing key /etc/cloudpkg/cloudos.pub: ok','all fine (sandbox)'],'#00ff66');return}
  if(['search','info','install','remove','list'].indexOf(c)<0){P('cloudpkg: unknown command '+c);return}
  if((c==='search'||c==='info'||c==='install'||c==='remove')&&!args.length){P('cloudpkg: '+(c==='search'?'give a search string':'give a package'));return}
  pkgs(function(j){
    if(!j){P('cloudpkg: could not load packages.json');return}
    var q=(args[0]||'').toLowerCase(),r,i;
    if(c==='list'){
      r=j.filter(function(p){return p.s==='stage3'});
      for(i=0;i<r.length;i++)P(r[i].n+(r[i].v?'-'+r[i].v:''));
      P(r.length+' packages');return;
    }
    if(c==='search'){
      r=j.filter(function(p){return (p.n+' '+pd(p)).toLowerCase().indexOf(q)>-1});
      if(!r.length){P('nothing found for '+args[0]);return}
      for(i=0;i<r.length;i++)P(pkrow(r[i]));
      P(r.length+' found');return;
    }
    r=j.filter(function(p){return p.n.toLowerCase()===q})[0];
    if(!r){P('cloudpkg: '+args[0]+': no such package in the sandbox list');return}
    if(c==='info'){
      W(['name:     '+r.n,'version:  '+(r.v||'-'),'category: '+r.c,'about:    '+pd(r),'state:    '+(r.s==='stage3'?'already in the system':'built from source via cloudpkg')]);
      return;
    }
    if(c==='remove'){
      P(r.s==='stage3'?'cloudpkg: '+r.n+' belongs to the base system, removal refused':(dry?'would remove ':'removing ')+r.n);
      if(r.s!=='stage3')later(function(){P('sandbox: nothing was changed','#00ff66')},500);
      return;
    }
    if(r.s==='stage3'){P(r.n+' is already in the system, nothing to do');return}
    var L2=['>>> calculating dependencies ... done','>>> emerge (1 of 1) '+r.n+(r.v?'-'+r.v:'')];
    if(!dry)L2=L2.concat(['>>> unpacking source','>>> compiling [##########]','>>> installing','>>> '+r.n+' merged']);
    L2.push('sandbox: nothing was installed');
    L2.forEach(function(s,k){later(function(){P(s,k===L2.length-1?'#00ff66':'')},k*420)});
  });
};
CMD.pwd=function(){P('/root')};
CMD.id=function(){P('uid=0(root) gid=0(root) groups=0(root),10(wheel)')};
CMD.hostname=function(){P('cloudos')};
CMD.which=function(a){P(a[0]&&CMD[a[0]]?'/usr/bin/'+a[0]:(a[0]||'which')+': not found')};
CMD.man=function(a){P(a[0]?'no manual entry for '+a[0]+' here, see '+ROOT+'handbook/':'what manual page do you want?')};
CMD.free=function(){
  var g=navigator.deviceMemory||4,t=g*1048576;
  W(['               total        used        free','Mem:'+('          '+t).slice(-12)+('           '+Math.round(t*.31)).slice(-12)+('           '+Math.round(t*.69)).slice(-12),'Swap:           0           0           0']);
};
CMD.df=function(){W(['filesystem      size  used avail use% mounted on','/dev/sda2       120G   14G  100G  13% /','/dev/sda1       512M   86M  426M  17% /boot','tmpfs           2.0G     0  2.0G   0% /tmp'])};
CMD.lsblk=function(){W(['NAME   SIZE TYPE MOUNTPOINT','sda    128G disk','|-sda1  512M part /boot','`-sda2  127G part /'])};
CMD.ps=function(){W(['  pid tty      time cmd','    1 ?    00:00:00 openrc-init','  142 ?    00:00:00 syslog-ng','  188 ?    00:00:00 dhcpcd','  203 ?    00:00:00 nft-watch','  311 tty1 00:00:00 cloudsh'])};
CMD.dmesg=function(){W(['[    0.000000] linux version (cloudos) x86_64','[    0.000000] command line: root=/dev/sda2 apparmor=1 security=apparmor','[    0.412211] lsm: landlock yama apparmor','[    0.791530] nft: policy drop, loaded','[    1.204118] openrc: boot runlevel reached','[    2.009877] cloudos: browser edition, no real kernel was harmed'])};
CMD.ping=function(a){
  var h=a[0]||'';
  if(!h){P('ping: usage error: destination required');return}
  if(h!=='localhost'&&h!=='127.0.0.1'){P('ping: '+h+': sandbox has no network');return}
  P('PING localhost (127.0.0.1) 56(84) bytes of data.');
  for(var i=1;i<=3;i++)(function(k){later(function(){P('64 bytes from localhost (127.0.0.1): icmp_seq='+k+' ttl=64 time=0.0'+(2+k)+' ms')},k*500)})(i);
  later(function(){P('3 packets transmitted, 3 received, 0% packet loss')},2000);
};
CMD['cloudos-audit']=function(){
  W(['== firewall','[ ok ] nftables loaded, input drop','== kernel','[ ok ] kernel.kptr_restrict = 2','[ ok ] kernel.yama.ptrace_scope = 2','[ ok ] apparmor enabled','== ssh','[ ok ] PermitRootLogin no','sample output, run doas cloudos-audit on a real system'],'#00ff66');
};
CMD.sl=function(){
  var T=['      ====        ________','  _D _|  |_______/        \\__I_I_____===__|_________|','   |(_)---  |   H\\________/ |   |        =|___ ___|','   /     |  |   H  |  |     |   |         ||_| |_||','  |      |  |   H  |__--------------------| [___] |','  | ________|___H__/__|_____/[][]~\\_______|       |','  |/ |   |-----------I_____I [][] []  D   |=======|__'],e=d.createElement('div'),i=0,w=34;
  e.style.whiteSpace='pre';e.style.color='#4fa868';out.appendChild(e);
  (function f(){
    if(!box||box.hidden)return;
    var pad=new Array(Math.max(0,w-i)).join(' '),s=T.map(function(l){var t=pad+l;return t.slice(0,Math.max(10,Math.floor(innerWidth/9)))}).join('\n');
    e.textContent=s;out.scrollTop=out.scrollHeight;
    if(++i<=w)later(f,70);
  })();
};
function snake(){
  if(box.querySelector('.csg'))return;
  var N=20,cell=Math.max(10,Math.floor(Math.min(innerWidth-28,innerHeight-190,520)/N)),W0=d.createElement('div'),cv=d.createElement('canvas'),st=d.createElement('div'),hn=d.createElement('div'),x=cv.getContext('2d'),best=0,sn,dir,nd,food,score,over,speed,paused,alive=true,tx=0,ty=0;
  try{best=+localStorage.getItem('cs_snake')||0}catch(e){}
  W0.className='csg';W0.style.cssText='position:absolute;inset:0;z-index:3;background:#020603;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;touch-action:none';
  cv.width=cv.height=N*cell;cv.style.cssText='border:1px solid #1d5c32;background:#020603;max-width:100%';
  st.style.cssText='color:#00ff66;font-size:14px';hn.style.cssText='color:#4fa868;font-size:12px;text-align:center';
  hn.textContent='arrows / wasd / swipe, p pause, q quit';
  W0.appendChild(st);W0.appendChild(cv);W0.appendChild(hn);box.appendChild(W0);
  function put(){do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(sn.some(function(s){return s.x===food.x&&s.y===food.y}))}
  function reset(){sn=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};nd=dir;score=0;over=false;paused=false;speed=130;put()}
  function paint(){
    x.fillStyle='#020603';x.fillRect(0,0,cv.width,cv.height);
    x.fillStyle='#ff5a5a';x.fillRect(food.x*cell+1,food.y*cell+1,cell-2,cell-2);
    sn.forEach(function(s,i){x.fillStyle=i?'#1fbf5a':'#00ff66';x.fillRect(s.x*cell+1,s.y*cell+1,cell-2,cell-2)});
    st.textContent='snake  score '+score+'  best '+best+(paused?'  [paused]':'')+(over?'  [game over, enter to restart]':'');
  }
  function tick(){
    if(!alive)return;
    if(!paused&&!over){
      dir=nd;
      var h={x:sn[0].x+dir.x,y:sn[0].y+dir.y},eat=h.x===food.x&&h.y===food.y,body=eat?sn:sn.slice(0,-1);
      if(h.x<0||h.y<0||h.x>=N||h.y>=N||body.some(function(s){return s.x===h.x&&s.y===h.y})){
        over=true;
        if(score>best){best=score;try{localStorage.setItem('cs_snake',String(best))}catch(e){}}
      }else{
        sn.unshift(h);
        if(eat){score++;speed=Math.max(60,speed-3);put()}else sn.pop();
      }
    }
    paint();
    later(tick,speed);
  }
  function turn(a,b){if(!(a===-dir.x&&b===-dir.y)&&!(a===0&&b===0))nd={x:a,y:b}}
  function key(e){
    var k=e.key.toLowerCase(),used=true;
    if(k==='arrowup'||k==='w'||k==='k')turn(0,-1);
    else if(k==='arrowdown'||k==='s'||k==='j')turn(0,1);
    else if(k==='arrowleft'||k==='a'||k==='h')turn(-1,0);
    else if(k==='arrowright'||k==='d'||k==='l')turn(1,0);
    else if(k==='p'||k===' ')paused=!paused;
    else if(k==='enter'){if(over)reset()}
    else if(k==='q'||k==='escape')off();
    else used=false;
    if(used||k.length===1){e.preventDefault();e.stopImmediatePropagation()}
  }
  function ts(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY}
  function te(e){
    var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;
    if(Math.abs(dx)<24&&Math.abs(dy)<24){if(over)reset();else paused=!paused;return}
    if(Math.abs(dx)>Math.abs(dy))turn(dx>0?1:-1,0);else turn(0,dy>0?1:-1);
  }
  function off(){
    if(!alive)return;
    alive=false;gameOff=null;
    d.removeEventListener('keydown',key,true);
    W0.remove();
    if(inp&&!box.hidden)inp.focus();
  }
  gameOff=off;
  d.addEventListener('keydown',key,true);
  W0.addEventListener('touchstart',ts,{passive:true});
  W0.addEventListener('touchend',te,{passive:true});
  reset();tick();
}
CMD.snake=function(){snake()};
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
  box=d.createElement('div');box.className='cst';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-label',tr('cloudos shell'));
  box.innerHTML='<div class="csh"><span>'+tr('cloudsh 2.0, esc to close')+'</span><button type="button" class="csx">'+tr('exit')+'</button></div><div class="cso" aria-live="polite"></div><div class="csl"><span class="csp">root@cloudos:~#</span><input class="csi" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="'+tr('command')+'"></div>';
  d.body.appendChild(box);
  out=box.querySelector('.cso');inp=box.querySelector('.csi');pr=box.querySelector('.csp');
  box.querySelector('.csx').onclick=close;
  box.addEventListener('click',function(e){if(e.target.tagName!=='BUTTON'&&!(window.getSelection&&String(window.getSelection())))inp.focus()});
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){var v=inp.value;inp.value='';run(v)}
    else if(e.key==='Escape'){close()}
    else if(e.key==='Tab'){e.preventDefault();var v=inp.value;if(v&&v.indexOf(' ')<0){var m=Object.keys(CMD).filter(function(k){return k!=='snake'&&k.indexOf(v.toLowerCase())===0});if(m.length===1)inp.value=m[0]+' ';else if(m.length>1)P(m.join('  '),'#4fa868')}}
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
  if(gameOff)gameOff();
  box.hidden=true;h.style.overflow='';
  while(tm.length)clearTimeout(tm.pop());
  var c=box.querySelector('.csc');if(c)c.remove();
}
window.CloudSecret={open:open,close:close,add:function(n,f){if(typeof n==='string'&&/^[a-z0-9_-]+$/.test(n)&&typeof f==='function')CMD[n]=f},print:function(s,c){if(out)P(String(s),c)}};
})();
