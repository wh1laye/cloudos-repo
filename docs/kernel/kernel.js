(function(){
var d=document;
var BASE=['DEVTMPFS','DEVTMPFS_MOUNT','TMPFS','TMPFS_POSIX_ACL','PROC_FS','SYSFS','UNIX','NET','INET','INOTIFY_USER','SIGNALFD','TIMERFD','EPOLL','FHANDLE','CGROUPS','BLK_DEV_INITRD','RD_GZIP','RD_ZSTD','MODULES','MODULE_UNLOAD','BINFMT_ELF','BINFMT_SCRIPT','VT','VT_CONSOLE','FRAMEBUFFER_CONSOLE','USB','USB_XHCI_HCD','USB_XHCI_PCI','USB_EHCI_HCD','USB_EHCI_PCI','HID_GENERIC','USB_HID','NLS_CODEPAGE_437','NLS_ISO8859_1','NLS_UTF8','FAT_FS','VFAT_FS','SCSI','BLK_DEV_SD'];
var G={
c:{amd:['CPU_FREQ','X86_AMD_PSTATE'],intel:['CPU_FREQ','X86_INTEL_PSTATE']},
b:{uefi:['EFI','EFI_STUB','EFI_PARTITION','EFIVAR_FS','FB_EFI','SYSFB_SIMPLEFB'],bios:['MSDOS_PARTITION']},
s:{sata:['ATA','SATA_AHCI'],ide:['ATA','ATA_PIIX'],nvme:['BLK_DEV_NVME'],virtio:['VIRTIO','VIRTIO_PCI','VIRTIO_BLK','SCSI_VIRTIO'],vmpv:['VMWARE_PVSCSI'],vmlsi:['FUSION','FUSION_SPI'],usb:['USB_STORAGE']},
f:{ext4:['EXT4_FS'],btrfs:['BTRFS_FS']},
n:{e1000:['E1000'],e1000e:['E1000E'],igb:['IGB'],igc:['IGC'],r8169:['R8169'],virtio:['VIRTIO','VIRTIO_PCI','VIRTIO_NET'],vmxnet3:['VMXNET3'],iwlwifi:['CFG80211','MAC80211','WLAN','IWLWIFI','IWLMVM'],rtw:['CFG80211','MAC80211','WLAN','RTW88','RTW89']},
g:{simple:['DRM','DRM_SIMPLEDRM','SYSFB_SIMPLEFB','FB_EFI','DRM_FBDEV_EMULATION'],amd:['DRM','DRM_AMDGPU','DRM_FBDEV_EMULATION'],intel:['DRM','DRM_I915','DRM_FBDEV_EMULATION'],nvidia:['DRM','DRM_NOUVEAU','DRM_FBDEV_EMULATION'],virtio:['DRM','DRM_VIRTIO_GPU','DRM_FBDEV_EMULATION'],vmware:['DRM','DRM_VMWGFX','DRM_FBDEV_EMULATION'],vbox:['DRM','DRM_VBOXVIDEO','DRM_FBDEV_EMULATION']},
v:{hw:[],vmware:['HYPERVISOR_GUEST','PARAVIRT'],qemu:['HYPERVISOR_GUEST','PARAVIRT','KVM_GUEST'],vbox:['HYPERVISOR_GUEST','PARAVIRT']},
x:{zram:['ZRAM','ZSMALLOC','SWAP']}
};
var NAME={s:{sata:'sata (ahci)',ide:'ide (старые и virtualbox)',nvme:'nvme',virtio:'virtio-диск',vmpv:'vmware pvscsi',vmlsi:'vmware lsi logic',usb:'usb-накопители'},f:{ext4:'ext4',btrfs:'btrfs'},n:{e1000:'intel e1000 (vm)',e1000e:'intel e1000e',igb:'intel igb',igc:'intel igc (2.5g)',r8169:'realtek r8169',virtio:'virtio-сеть',vmxnet3:'vmware vmxnet3',iwlwifi:'wifi intel',rtw:'wifi realtek'},x:{zram:'zram (сжатый swap в памяти)'}};
var Sx={c:'amd',b:'uefi',s:['sata'],f:['ext4'],n:['e1000e'],g:'simple',v:'hw',x:[],k:'6.18.10'};
var CP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
function tr(s){return window.I18N&&window.I18N.t?window.I18N.t(s):s}
function load(){
  var q;try{q=new URLSearchParams(location.hash.replace(/^#/,''))}catch(e){return}
  ['c','b','g','v','k'].forEach(function(k){if(q.has(k))Sx[k]=q.get(k)});
  ['s','f','n','x'].forEach(function(k){if(q.has(k))Sx[k]=q.get(k)?q.get(k).split(','):[]});
  if(!G.c[Sx.c])Sx.c='amd';
  if(!G.b[Sx.b])Sx.b='uefi';
  if(!G.g[Sx.g])Sx.g='simple';
  if(!G.v[Sx.v])Sx.v='hw';
  ['s','f','n','x'].forEach(function(k){Sx[k]=Sx[k].filter(function(v){return G[k][v]})});
  if(!/^[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(Sx.k))Sx.k='6.18.10';
}
function save(){
  var h='c='+Sx.c+'&b='+Sx.b+'&s='+Sx.s.join(',')+'&f='+Sx.f.join(',')+'&n='+Sx.n.join(',')+'&g='+Sx.g+'&v='+Sx.v+'&x='+Sx.x.join(',')+'&k='+Sx.k;
  try{history.replaceState(null,'',location.pathname+location.search+'#'+h)}catch(e){}
}
function sync(){
  [].forEach.call(d.querySelectorAll('[data-k]'),function(b){
    var k=b.getAttribute('data-k'),v=b.getAttribute('data-v'),on;
    on=Array.isArray(Sx[k])?Sx[k].indexOf(v)>=0:Sx[k]===v;
    b.classList.toggle('on',on);
  });
  d.getElementById('kv').value=Sx.k;
}
function uniq(a){var o=[],i;for(i=0;i<a.length;i++)if(o.indexOf(a[i])<0)o.push(a[i]);return o}
function opts(){
  var o=BASE.slice(),parts=[],k,v;
  o=o.concat(G.c[Sx.c],G.b[Sx.b],G.g[Sx.g],G.v[Sx.v]);
  ['s','f','n','x'].forEach(function(g){Sx[g].forEach(function(v){o=o.concat(G[g][v])})});
  return uniq(o);
}
function blk(title,text,note){
  var w=d.createElement('div'),h=d.createElement('h3'),c=d.createElement('div'),pre=d.createElement('pre'),b=d.createElement('button');
  w.className='wzb';h.textContent=title;w.appendChild(h);
  c.className='cw';pre.textContent=text;
  b.type='button';b.className='cpb';b.innerHTML=CP;b.setAttribute('aria-label','copy');
  b.onclick=function(){
    var done=function(){b.classList.add('ok');setTimeout(function(){b.classList.remove('ok')},1200)};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(done,function(){});
  };
  c.appendChild(pre);c.appendChild(b);w.appendChild(c);
  if(note){var p=d.createElement('p');p.className='mu';p.textContent=note;w.appendChild(p)}
  return w;
}
function render(){
  var out=d.getElementById('out'),o=opts(),i,s;
  out.textContent='';
  s='cd /usr/src/linux-'+Sx.k+'\nmake defconfig\nscripts/config';
  for(i=0;i<o.length;i++)s+=(i%6===0?' \\\n  ':' ')+'-e '+o[i];
  s+='\nscripts/config -d UEVENT_HELPER\nmake olddefconfig\necho KC1_OK';
  out.appendChild(blk('шаг 1. применить настройки',s,'выполняй внутри chroot, в каталоге с исходниками ядра. команда включает нужное встроенным в ядро (=y).'));
  var chk='for o in '+o.join(' ')+'; do\n  grep -q "^CONFIG_$o=[ym]" .config || echo "не включено: $o"\ndone\necho KC2_OK';
  out.appendChild(blk('шаг 2. проверить, что всё включилось',chk,'если что-то не включено, у него не хватает зависимостей: найди его в make menuconfig через / и включи нужное.'));
  out.appendChild(blk('шаг 3. посмотреть и собрать','make menuconfig\nmake -j$(nproc)\nmake modules_install','в menuconfig можно ничего не менять: просто проверь и выйди с сохранением.'));
  var det=d.createElement('details'),sm=d.createElement('summary'),ul=d.createElement('ul'),li;
  sm.textContent=tr('что включится');det.appendChild(sm);
  li=d.createElement('li');li.textContent=tr('база')+': '+BASE.join(', ');ul.appendChild(li);
  [['c','процессор'],['b','загрузка'],['g','видео'],['v','среда']].forEach(function(p){
    if(G[p[0]][Sx[p[0]]].length){li=d.createElement('li');li.textContent=tr(p[1])+' ('+Sx[p[0]]+'): '+G[p[0]][Sx[p[0]]].join(', ');ul.appendChild(li)}
  });
  ['s','f','n','x'].forEach(function(g){Sx[g].forEach(function(v){li=d.createElement('li');li.textContent=(NAME[g]?NAME[g][v]:v)+': '+G[g][v].join(', ');ul.appendChild(li)})});
  det.appendChild(ul);out.appendChild(det);
  save();
}
load();
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-k]'):null;
  if(!b)return;
  var k=b.getAttribute('data-k'),v=b.getAttribute('data-v');
  if(Array.isArray(Sx[k])){var i=Sx[k].indexOf(v);if(i>=0)Sx[k].splice(i,1);else Sx[k].push(v)}
  else Sx[k]=v;
  sync();render();
});
d.getElementById('kv').addEventListener('input',function(e){
  var v=e.target.value.trim();
  if(/^[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(v)){Sx.k=v;e.target.classList.remove('bad');render()}else e.target.classList.add('bad');
});
sync();render();
})();
