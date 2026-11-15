(function(){
var d=document,W=window;
var SKIP='code,pre,kbd,samp,script,style,textarea,[contenteditable="true"],.cmd,.tb,.code,.txt,.bio,.dmm,.un,.relbody,.trow strong,.trow .mu,.sxr,[data-noi]';
var LETTER=/[A-Za-zА-Яа-яЁё]/;
var WORD=/^[A-Za-zА-Яа-яЁё0-9_](?:[A-Za-zА-Яа-яЁё0-9_.-]*[A-Za-zА-Яа-яЁё0-9_])?/;
var ABBR={
  'т':1,'е':1,'д':1,'п':1,'см':1,'напр':1,'др':1,'г':1,'гг':1,'рис':1,'стр':1,
  'им':1,'ул':1,'пр':1,'руб':1,'коп':1,'млн':1,'млрд':1,'тыс':1,'в':1,'вв':1,
  'н':1,'э':1,'англ':1,'рус':1,'лат':1,'гл':1,'ч':1,'мин':1,'макс':1,'ок':1,
  'проч':1,'ред':1,'изд':1,'пер':1,'ст':1,'пп':1
};
var CANON={
  'cloudos':'CloudOS','cloudpkg':'Cloudpkg','cloudos-install':'cloudos-install',
  'cloudos-firewall':'cloudos-firewall','cloudos-audit':'cloudos-audit',
  'cloudos-uki':'cloudos-uki','cloudos-tpm2':'cloudos-tpm2',
  'cloudos-secureboot':'cloudos-secureboot','cloudos-users':'cloudos-users',
  'cloudos-adduser':'cloudos-adduser','cloudos-fix':'cloudos-fix',
  'gcc':'GCC','openrc':'OpenRC','uefi':'UEFI','bios':'BIOS','iso':'ISO',
  'ssh':'SSH','sshd':'sshd','tpm2':'TPM2','uki':'UKI','luks2':'LUKS2','cis':'CIS',
  'kspp':'KSPP','linux':'Linux','limine':'Limine','apparmor':'AppArmor',
  'selinux':'SELinux','lfs':'LFS','gpt':'GPT','efi':'EFI','api':'API','json':'JSON',
  'html':'HTML','css':'CSS','tcp':'TCP','udp':'UDP','dns':'DNS','ram':'RAM',
  'cpu':'CPU','gpu':'GPU','python':'Python','git':'Git','gentoo':'Gentoo',
  'github':'GitHub','supabase':'Supabase','portage':'Portage','gnupg':'GnuPG',
  'doas':'doas','sudo':'sudo','curl':'curl','nano':'nano','wget':'wget',
  'rsync':'rsync','nftables':'nftables','ext4':'ext4','btrfs':'btrfs',
  'x86_64':'x86_64','sha256':'SHA-256','sha256sum':'sha256sum','zstd':'zstd',
  'glibc':'glibc','binutils':'binutils','udev':'udev','dhcpcd':'dhcpcd','iwd':'iwd',
  'man-db':'man-db','dosfstools':'dosfstools','syslog-ng':'syslog-ng','minisign':'minisign',
  'openssh':'OpenSSH','opendoas':'OpenDoas','mit':'MIT','gpl':'GPL','arm':'ARM',
  'sysv':'SysV','emerge':'emerge','noatime':'noatime','libc':'libc','systemd':'systemd',
  'fstab':'fstab','sysctl':'sysctl','wh1laye':'wh1laye'
};
var last=new WeakMap(), unitCache=new WeakMap(), obs=null, pending=new Set(), queued=false;

function skip(n){
  var p=n.parentNode;
  return !p||p.nodeType!==1||!!(p.closest&&p.closest(SKIP));
}
function unitOf(n){
  var e=n.parentNode;
  if(!e||e.nodeType!==1)return null;
  if(unitCache.has(e))return unitCache.get(e);
  var x=e,u=null;
  while(x&&x!==d.body){
    var s=W.getComputedStyle?W.getComputedStyle(x):null;
    if(s&&s.display&&s.display!=='inline'&&s.display.indexOf('inline')!==0){u=x;break}
    x=x.parentNode;
  }
  if(!u)u=d.body;
  unitCache.set(e,u);
  return u;
}
function abbr(s,i){
  var m=s.slice(Math.max(0,i-24),i).match(/([A-Za-zА-Яа-яЁё]+)$/);
  return !!(m&&ABBR[m[1].toLowerCase()]);
}
function endsSentence(s,i){
  var c=s.charAt(i);
  if(c!=='.'&&c!=='!'&&c!=='?'&&c!=='…')return false;
  if(c==='.'){
    var n=s.charAt(i+1);
    if(n&&n>='0'&&n<='9')return false;
    if(abbr(s,i))return false;
  }
  var j=i+1;
  while(j<s.length&&'»"\'”’)]}'.indexOf(s.charAt(j))>=0)j++;
  return j>=s.length||/\s/.test(s.charAt(j));
}
function wordAt(s,i){
  var m=s.slice(i).match(WORD);
  return m?m[0]:'';
}
function capToken(s,i){
  var w=wordAt(s,i);
  if(!w)return {text:s.charAt(i),len:1,start:false};
  if(/^(https?|www\.|\/\/|\/|#|\$|~)/i.test(w))return {text:w,len:w.length,start:false};
  if(/[_/@]/.test(w)||/^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)+$/.test(w))return {text:w,len:w.length,start:false};
  var c=CANON[w.toLowerCase()];
  if(c!==undefined)return {text:c,len:w.length,start:false};
  var h=w.indexOf('-');
  if(h>0){
    c=CANON[w.slice(0,h).toLowerCase()];
    if(c!==undefined)return {text:c+w.slice(h),len:w.length,start:false};
  }
  return {text:w.charAt(0).toUpperCase()+w.slice(1),len:w.length,start:false};
}
function fix(s,start){
  var out='',changed=false;
  for(var i=0;i<s.length;i++){
    var ch=s.charAt(i);
    if(start&&LETTER.test(ch)){
      var r=capToken(s,i);
      out+=r.text;
      if(r.text!==s.substr(i,r.len))changed=true;
      i+=r.len-1;
      start=r.start;
    }else{
      out+=ch;
      if(endsSentence(s,i))start=true;
    }
  }
  return {text:out,start:start,changed:changed};
}
function capUnit(u){
  if(!u||!u.isConnected)return;
  var w=d.createTreeWalker(u,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode()))if(!skip(n)&&unitOf(n)===u)list.push(n);
  var start=true;
  for(var i=0;i<list.length;i++){
    n=list[i];
    var r=fix(n.data,start);
    start=r.start;
    if(r.changed){
      last.set(n,r.text);
      n.data=r.text;
    }else last.set(n,n.data);
  }
}
function process(root){
  if(!root)return;
  var set=new Set();
  if(root.nodeType===3){
    if(!skip(root)){var u=unitOf(root);if(u)set.add(u)}
  }else if(root.nodeType===1&&root.isConnected){
    var w=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
    while((n=w.nextNode()))if(!skip(n)){var x=unitOf(n);if(x)set.add(x)}
  }
  set.forEach(capUnit);
}
function queue(root){
  if(root)pending.add(root);
  if(queued)return;
  queued=true;
  (W.requestAnimationFrame||W.setTimeout)(function(){
    queued=false;
    var a=[];
    pending.forEach(function(x){a.push(x)});
    pending.clear();
    a.forEach(process);
  },0);
}
function capAttrs(root){
  if(!root||root.nodeType!==1)return;
  var els=root.querySelectorAll('[title],[placeholder],[aria-label]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    if(el.closest&&el.closest(SKIP))continue;
    var atts=['title','placeholder','aria-label'];
    for(var j=0;j<atts.length;j++){
      var v=el.getAttribute(atts[j]);
      if(!v)continue;
      var r=fix(v,true);
      if(r.changed)el.setAttribute(atts[j],r.text);
    }
  }
}
function capTitle(){
  if(!d.title)return;
  var r=fix(d.title,true);
  if(r.changed)d.title=r.text;
}
function start(){
  process(d.body);
  capAttrs(d.body);
  capTitle();
  if(obs||!W.MutationObserver)return;
  obs=new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){
      var m=ms[i];
      if(m.type==='characterData'){
        if(last.get(m.target)!==m.target.data)queue(m.target.parentNode);
      }else{
        for(var j=0;j<m.addedNodes.length;j++)queue(m.addedNodes[j]);
      }
    }
  });
  obs.observe(d.body,{childList:true,subtree:true,characterData:true});
}
W.addEventListener('cloudlang',function(){W.setTimeout(function(){process(d.body);capAttrs(d.body);capTitle()},0)});
W.CloudTypo={fix:fix,run:start};
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start);else start();
})();
