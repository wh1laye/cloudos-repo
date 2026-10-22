(function(){
var d=document;
var DEF={d:'/dev/sda',m:'uefi',b:'limine',f:'ext4',p:'auto',s:'4',k:'6.18.10',z:'Europe/Moscow',h:'cloudos',u:''};
var S={},KEYS=['d','m','b','f','p','s','k','z','h','u'];
var ID={d:'dk',s:'sw',k:'kv',z:'tz',h:'hn',u:'us'};
var RX={
d:/^\/dev\/(sd[a-z]+|vd[a-z]+|nvme[0-9]+n[0-9]+|mmcblk[0-9]+)$/,
s:/^[0-9]{1,3}$/,
k:/^[0-9]+\.[0-9]+(\.[0-9]+)?$/,
z:/^[A-Za-z_]+(\/[A-Za-z_+-]+)*$/,
h:/^[a-z0-9][a-z0-9-]{0,30}$/,
u:/^([a-z_][a-z0-9_-]{0,30})?$/
};
var ER={d:'формат: /dev/sda, /dev/vda или /dev/nvme0n1',s:'число от 0 до 128',k:'формат: 6.18.10',z:'формат: Europe/Moscow',h:'маленькие буквы, цифры и дефис',u:'маленькие буквы, цифры, дефис'};
var CP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
var OK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
function tr(s){return window.I18N&&window.I18N.t?window.I18N.t(s):s}
function load(){
  var k,i,o={};
  try{
    var q=new URLSearchParams(location.hash.replace(/^#/,''));
    for(i=0;i<KEYS.length;i++)if(q.has(KEYS[i]))o[KEYS[i]]=q.get(KEYS[i]);
  }catch(e){}
  for(i=0;i<KEYS.length;i++){k=KEYS[i];S[k]=o[k]!==undefined?o[k]:DEF[k]}
  if(S.m!=='bios')S.m='uefi';
  if(S.f!=='btrfs')S.f='ext4';
  if(S.b!=='grub')S.b='limine';
  if(S.p!=='cfdisk')S.p='auto';
}
function save(){
  var q=new URLSearchParams(),i;
  for(i=0;i<KEYS.length;i++)if(S[KEYS[i]]!==DEF[KEYS[i]])q.set(KEYS[i],S[KEYS[i]]);
  var s=q.toString();
  try{history.replaceState(null,'',location.pathname+location.search+(s?'#'+s:''))}catch(e){}
}
function valid(){
  var ok=true,k,v,n;
  for(k in RX){
    v=S[k];
    n=d.getElementById('e-'+ID[k]);
    var bad=!RX[k].test(v)||(k==='s'&&+v>128);
    d.getElementById(ID[k]).classList.toggle('bad',bad);
    n.textContent=bad?tr(ER[k]):'';
    if(bad)ok=false;
  }
  return ok;
}
function parts(){
  var p=/nvme|mmcblk/.test(S.d)?'p':'';
  return [S.d+p+'1',S.d+p+'2'];
}
function setText(n,t){if(n.textContent!==t)n.textContent=t}
function blk(title,text,note){
  var w=d.createElement('div'),h,c,pre,b;
  w.className='wzb';
  h=d.createElement('h3');h.textContent=title;w.appendChild(h);
  c=d.createElement('div');c.className='cw';
  pre=d.createElement('pre');pre.textContent=text;
  b=d.createElement('button');b.type='button';b.className='cpb';b.innerHTML=CP;b.setAttribute('aria-label','copy');
  b.onclick=function(){copy(text,b)};
  c.appendChild(pre);c.appendChild(b);w.appendChild(c);
  if(note){var p=d.createElement('p');p.className='mu';p.textContent=note;w.appendChild(p)}
  return w;
}
function copy(text,btn){
  function done(){
    if(!btn)return;
    var o=btn.innerHTML;btn.innerHTML=OK;btn.classList.add('ok');
    setTimeout(function(){btn.innerHTML=o;btn.classList.remove('ok')},1400);
  }
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done,fb)}else fb();
  function fb(){
    var t=d.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';
    d.body.appendChild(t);t.select();
    try{d.execCommand('copy')}catch(e){}
    d.body.removeChild(t);done();
  }
}
function header(){
  return 'DISK='+S.d+'\nMODE='+S.m+'\nBOOT='+S.b+'\nFS='+S.f+'\nPART='+S.p+'\nSWAP='+S.s+'\nKVER='+S.k+'\nTZ='+S.z+'\nHOST='+S.h+'\nUSR='+S.u+'\n';
}
function script1(){
  var t2=d.getElementById('t2').textContent.replace(/^\n/,'').replace(/\n$/,'');
  var t1=d.getElementById('t1').textContent.replace(/^\n/,'').replace(/\n$/,'');
  t1=t1.replace('@S2@',function(){return t2});
  return "cat > /root/cloudos-s1.sh <<'OUTER'\n#!/bin/bash\n"+header()+t1+"\nOUTER\nbash /root/cloudos-s1.sh";
}
function renderI(){
  var n=d.getElementById('ti'),a,w;
  n.textContent='';
  if(!valid()){
    w=d.createElement('div');w.className='warn';
    w.innerHTML='<b>ошибка</b>';
    var p=d.createElement('span');p.textContent='проверь поля: в них есть ошибка.';w.appendChild(p);
    n.appendChild(w);return;
  }
  var s1=script1();
  n.appendChild(blk('шаг 1. запусти в живой системе',s1));
  var r=d.createElement('div');r.className='wzr';
  a=d.createElement('button');a.type='button';a.className='btn p';a.innerHTML=CP+'<span>скопировать скрипт</span>';
  a.onclick=function(){copy(s1,null);flash(a)};
  var b=d.createElement('button');b.type='button';b.className='btn';b.innerHTML=CP+'<span>скопировать ссылку с настройками</span>';
  b.onclick=function(){copy(location.href,null);flash(b)};
  r.appendChild(a);r.appendChild(b);n.appendChild(r);
  n.appendChild(blk('шаг 2. войди в chroot и запусти',"chroot /mnt/cloudos /bin/bash -c 'source /etc/profile; bash /root/s2.sh'"));
  n.appendChild(blk('шаг 3. перезагрузка','umount -R /mnt/cloudos\nreboot'));
  w=d.createElement('div');w.className='warn';
  w.innerHTML='<b>важно</b>';
  ['шаг 1 сотрёт весь диск. в конце скрипта он спросит подтверждение: нужно ввести yes.','в шаге 2 откроется menuconfig: настрой ядро под своё железо и выйди с сохранением.','скрипты можно запускать повторно: сделанные шаги пропускаются.'].forEach(function(x){
    var p=d.createElement('p');p.style.margin='0 0 4px';p.textContent=x;w.appendChild(p);
  });
  n.appendChild(w);
}
function flash(b){
  var s=b.querySelector('span'),o=s.textContent;
  s.textContent=tr('скопировано');
  setTimeout(function(){s.textContent=o},1400);
}
function done(){try{return JSON.parse(localStorage.getItem('wzdone'))||{}}catch(e){return {}}}
function renderA(){
  var n=d.getElementById('ta'),dn=done(),u=S.u||'имя';
  n.textContent='';
  var swap=S.s==='0'?(S.f==='btrfs'?'btrfs filesystem mkswapfile --size 4g /swapfile\nswapon /swapfile':'dd if=/dev/zero of=/swapfile bs=1M count=4096 status=progress\nchmod 600 /swapfile\nmkswap /swapfile\nswapon /swapfile')+'\necho "/swapfile  none  swap  defaults  0 0" >> /etc/fstab':'swapon --show';
  var items=[
    ['u','пользователь и doas','grep wheel /etc/group || groupadd wheel\nuseradd -m -G wheel -s /bin/bash '+u+'\npasswd '+u+'\necho "permit :wheel" > /etc/doas.conf\nchmod 0400 /etc/doas.conf'],
    ['h','имя компьютера и часовой пояс','cat /etc/hostname\nls -l /etc/localtime'],
    ['n','сеть','ip addr\nping -c1 github.com'],
    ['s','swap',swap],
    ['l','локаль','echo "en_US.UTF-8 UTF-8" > /etc/locale.gen\nlocaledef -i en_US -f UTF-8 en_US.UTF-8\necho "LANG=en_US.UTF-8" > /etc/locale.conf'],
    ['r','службы','rc-update show'],
    ['p','пакеты','cloudpkg sync']
  ];
  var p=d.createElement('p');p.className='mu';p.textContent='отмечай сделанное, галочки сохраняются в браузере.';n.appendChild(p);
  items.forEach(function(it){
    var c=d.createElement('div'),l=d.createElement('label'),i=d.createElement('input'),sp=d.createElement('span');
    c.className='wzc'+(dn[it[0]]?' dn':'');
    i.type='checkbox';i.checked=!!dn[it[0]];
    sp.textContent=it[1];
    i.onchange=function(){
      var o=done();if(i.checked)o[it[0]]=1;else delete o[it[0]];
      try{localStorage.setItem('wzdone',JSON.stringify(o))}catch(e){}
      c.classList.toggle('dn',i.checked);
    };
    l.appendChild(i);l.appendChild(sp);c.appendChild(l);
    var w=blk('',it[2]);w.querySelector('h3').remove();w.className='';
    c.appendChild(w.querySelector('.cw'));
    n.appendChild(c);
  });
}
function renderR(){
  var n=d.getElementById('tr'),pp=parts(),bt=S.f==='btrfs';
  n.textContent='';
  var enter=(bt?'mount -o subvol=@ '+pp[1]+' /mnt/cloudos\nmount -o subvol=@home '+pp[1]+' /mnt/cloudos/home':'mount '+pp[1]+' /mnt/cloudos')+'\nmount '+pp[0]+' /mnt/cloudos/boot\nmount --types proc /proc /mnt/cloudos/proc\nmount --rbind /sys /mnt/cloudos/sys\nmount --make-rslave /mnt/cloudos/sys\nmount --rbind /dev /mnt/cloudos/dev\nmount --make-rslave /mnt/cloudos/dev\ncp --dereference /etc/resolv.conf /mnt/cloudos/etc/\nchroot /mnt/cloudos /bin/bash\nsource /etc/profile';
  var lim=S.b==='grub'?(S.m==='uefi'?'grub-install --target=x86_64-efi --efi-directory=/mnt/cloudos/boot --boot-directory=/mnt/cloudos/boot --removable':'grub-install --target=i386-pc --boot-directory=/mnt/cloudos/boot '+S.d):S.m==='uefi'?'mkdir -p /mnt/cloudos/boot/EFI/BOOT\ncp /usr/share/limine/BOOTX64.EFI /mnt/cloudos/boot/EFI/BOOT/BOOTX64.EFI':'cp /usr/share/limine/limine-bios.sys /mnt/cloudos/boot/\nlimine bios-install '+S.d;
  n.appendChild(blk('войти в систему из живого iso',enter,'выполняй в живой системе. выход: exit, потом umount -R /mnt/cloudos.'));
  n.appendChild(blk('переустановить загрузчик',lim,'выполняй в живой системе, раздел boot уже смонтирован.'));
  n.appendChild(blk('пересобрать initramfs','dracut --force --kver '+S.k+' /boot/initramfs-'+S.k+'.img','выполняй внутри chroot.'));
  n.appendChild(blk('проверить fstab и uuid','blkid\ncat /etc/fstab\ncat '+(S.b==='grub'?'/boot/grub/grub.cfg':'/boot/limine.conf'),'uuid в fstab и в конфиге загрузчика должны совпадать с blkid.'));
  n.appendChild(blk('пересобрать ядро','cd /usr/src/linux-'+S.k+'\nmake menuconfig\nmake -j$(nproc)\nmake modules_install\ncp arch/x86/boot/bzImage /boot/vmlinuz-'+S.k+'\ncp .config /boot/config-'+S.k+'\ndracut --force --kver '+S.k+' /boot/initramfs-'+S.k+'.img','выполняй внутри chroot.'));
}
function render(){
  var pp=parts();
  setText(d.getElementById('pp'),valid()?'boot: '+pp[0]+'   root: '+pp[1]:'');
  renderI();renderA();renderR();
  save();
}
function sync(){
  var k,i;
  for(k in ID)if(d.getElementById(ID[k]).value!==S[k])d.getElementById(ID[k]).value=S[k];
  [].forEach.call(d.querySelectorAll('.wzs'),function(g){
    var key=g.getAttribute('data-k');
    [].forEach.call(g.children,function(b){b.classList.toggle('on',b.getAttribute('data-v')===S[key])});
  });
}
load();sync();render();
[].forEach.call(d.querySelectorAll('.wzl input'),function(el){
  el.addEventListener('input',function(){
    var k;for(k in ID)if(ID[k]===el.id)S[k]=el.value.trim();
    render();
  });
});
[].forEach.call(d.querySelectorAll('.wzs button'),function(b){
  b.addEventListener('click',function(){
    S[b.parentNode.getAttribute('data-k')]=b.getAttribute('data-v');
    sync();render();
  });
});
[].forEach.call(d.querySelectorAll('.wzt button'),function(b){
  b.addEventListener('click',function(){
    var t=b.getAttribute('data-t');
    [].forEach.call(d.querySelectorAll('.wzt button'),function(x){x.classList.toggle('on',x===b)});
    d.getElementById('ti').hidden=t!=='i';
    d.getElementById('ta').hidden=t!=='a';
    d.getElementById('tr').hidden=t!=='r';
  });
});
})();
