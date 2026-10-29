(function(){
var d=document,M={m:'uefi',b:'limine'},cur=0;
function lang(){return window.CloudTheme&&window.CloudTheme.getLang?window.CloudTheme.getLang():'ru'}
function T(p){return lang()==='en'?p[1]:p[0]}
function S(){
var u=M.m==='uefi',l=M.b==='limine';
return [
{n:['прошивка','firmware'],
 w:u?['uefi читает таблицу разделов, находит раздел efi (твой /boot) и запускает с него загрузчик: сначала запись из nvram, иначе путь по умолчанию EFI/BOOT/BOOTX64.EFI.','uefi reads the partition table, finds the efi partition (your /boot) and starts the bootloader from it: first the nvram entry, otherwise the default path EFI/BOOT/BOOTX64.EFI.']:['bios читает первый сектор диска (mbr) и передаёт управление коду загрузчика, записанному туда установкой.','bios reads the first sector of the disk (mbr) and hands control to the bootloader code written there during installation.'],
 f:u?['/boot/EFI/BOOT/BOOTX64.EFI']:(l?['mbr диска','/boot/limine-bios.sys']:['mbr диска','/boot/grub/i386-pc/']),
 c:u?['ls /sys/firmware/efi','efibootmgr']:['lsblk -f','fdisk -l'],
 e:[['нет загрузочного устройства: проверь режим прошивки и что раздел /boot смонтирован при установке загрузчика','boot device not found: check the firmware mode and that /boot was mounted when the bootloader was installed','s14-7']]},
{n:['загрузчик','bootloader'],
 w:l?['limine читает свой конфиг, показывает меню и загружает в память ядро и initramfs, передавая ядру строку параметров (cmdline) с корневым разделом.','limine reads its config, shows the menu and loads the kernel and initramfs into memory, passing the kernel a parameter line (cmdline) with the root partition.']:['grub читает grub.cfg, показывает меню и загружает в память ядро и initramfs, передавая ядру строку параметров с корневым разделом.','grub reads grub.cfg, shows the menu and loads the kernel and initramfs into memory, passing the kernel a parameter line with the root partition.'],
 f:l?['/boot/limine.conf']:['/boot/grub/grub.cfg'],
 c:l?['cat /boot/limine.conf']:['cat /boot/grub/grub.cfg','ls /boot/grub'],
 e:l?[['Config file not found: limine.conf лежит не там или не на /boot','Config file not found: limine.conf is in the wrong place or not on /boot','s14-7']]:[['grub rescue или приглашение grub>: нет grub.cfg или неверный раздел','grub rescue or a grub> prompt: no grub.cfg or a wrong partition','s14-11']]},
{n:['ядро','kernel'],
 w:['ядро распаковывается, определяет оборудование и подключает initramfs как временный корень. если в ядре нет драйвера диска или файловой системы, дальше система не загрузится.','the kernel unpacks, detects the hardware and attaches the initramfs as a temporary root. if the kernel lacks the disk or filesystem driver, the system cannot go further.'],
 f:['/boot/vmlinuz-6.18.10','/boot/config-6.18.10'],c:['uname -r','dmesg | head -30'],
 e:[['VFS: Unable to mount root fs: в ядре нет драйвера диска или файловой системы (помощник по ядру)','VFS: Unable to mount root fs: the kernel lacks a disk or filesystem driver (kernel helper)','s14-7']]},
{n:['initramfs','initramfs'],
 w:['dracut собрал небольшой образ: он подгружает модули, находит корневой раздел по uuid, монтирует его и переключается на него.','dracut built a small image: it loads modules, finds the root partition by uuid, mounts it and switches to it.'],
 f:['/boot/initramfs-6.18.10.img'],c:['lsinitrd /boot/initramfs-6.18.10.img | head','dracut --force --kver 6.18.10 /boot/initramfs-6.18.10.img'],
 e:[['dracut: аварийная оболочка или Cannot find root: uuid в конфиге загрузчика не совпадает с blkid','dracut: emergency shell or Cannot find root: the uuid in the bootloader config does not match blkid','s14-7']]},
{n:['корневая система','root system'],
 w:['корень смонтирован. по /etc/fstab подключаются остальные разделы (/boot, home) и файл подкачки, из /lib/modules берутся модули ядра.','the root is mounted. /etc/fstab attaches the remaining partitions (/boot, home) and the swap file, and kernel modules come from /lib/modules.'],
 f:['/etc/fstab','/lib/modules/6.18.10'],c:['findmnt','cat /etc/fstab'],
 e:[['после загрузки не смонтирован /boot или swap: проверь строки в fstab','/boot or swap not mounted after boot: check the fstab lines','s14-8']]},
{n:['openrc','openrc'],
 w:['/sbin/init это openrc-init. он по очереди запускает уровни sysinit, boot, default и поднимает включённые службы: сеть (dhcpcd), журнал (syslog-ng), консоль.','/sbin/init is openrc-init. it starts the sysinit, boot and default runlevels in turn and brings up the enabled services: network (dhcpcd), log (syslog-ng), console.'],
 f:['/sbin/init','/etc/runlevels/','/etc/rc.conf'],c:['rc-status','rc-update show'],
 e:[['Attempted to kill init: нет /sbin/init или он не ведёт на openrc-init','Attempted to kill init: /sbin/init is missing or does not point to openrc-init','s14-7']]},
{n:['вход','login'],
 w:['служба agetty.tty1 показывает приглашение на консоли. входи как root (пароль задан установкой), потом создай пользователя и настрой doas.','the agetty.tty1 service shows the console prompt. log in as root (the password was set during installation), then create a user and set up doas.'],
 f:['/etc/init.d/agetty.tty1','/etc/doas.conf'],c:['rc-update show | grep agetty'],
 e:[['пустой экран без приглашения: служба agetty.tty1 не включена','blank screen without a prompt: the agetty.tty1 service is not enabled','s14-8']]}
];}
function esc(s){return s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function render(){
  var st=S(),i,h='',x=st[cur],en=lang()==='en';
  var nav=d.getElementById('flow');nav.textContent='';
  st.forEach(function(s,k){
    var b=d.createElement('button');b.type='button';b.className='fs'+(k===cur?' on':'')+(k<cur?' pass':'');
    b.innerHTML='<i>'+(k+1)+'</i><span>'+esc(T(s.n))+'</span>';
    b.addEventListener('click',function(){cur=k;render()});
    nav.appendChild(b);
  });
  var p=d.getElementById('panel');
  h='<h2>'+(cur+1)+'. '+esc(T(x.n))+'</h2><p>'+esc(T(x.w))+'</p>';
  h+='<h4>'+(en?'files':'файлы')+'</h4><ul class="ff">'+x.f.map(function(f){return '<li><code>'+esc(f)+'</code></li>'}).join('')+'</ul>';
  h+='<h4>'+(en?'how to check':'как проверить')+'</h4><pre>'+esc(x.c.join('\n'))+'</pre>';
  h+='<h4>'+(en?'if it breaks':'если сломалось')+'</h4><ul class="ff">'+x.e.map(function(e){return '<li>'+esc(T(e))+' <a href="'+(en?'../handbook/en/':'../handbook/')+'#'+e[2]+'">'+(en?'handbook':'справочник')+'</a></li>'}).join('')+'</ul>';
  h+='<div class="fnav"><button type="button" class="btn" id="pv"'+(cur===0?' disabled':'')+'>'+(en?'back':'назад')+'</button><button type="button" class="btn p" id="nx"'+(cur===st.length-1?' disabled':'')+'>'+(en?'next':'дальше')+'</button></div>';
  p.innerHTML=h;
  var pv=d.getElementById('pv'),nx=d.getElementById('nx');
  pv.onclick=function(){if(cur>0){cur--;render()}};
  nx.onclick=function(){if(cur<st.length-1){cur++;render()}};
  [].forEach.call(d.querySelectorAll('.bm [data-k]'),function(b){b.classList.toggle('on',M[b.getAttribute('data-k')]===b.getAttribute('data-v'))});
  try{history.replaceState(null,'',location.pathname+location.search+'#'+(cur+1)+'&m='+M.m+'&b='+M.b)}catch(e){}
}
var q;try{q=new URLSearchParams(location.hash.replace(/^#/,'').replace(/^([0-9]+)/,'s=$1'))}catch(e){q=null}
if(q){var s=parseInt(q.get('s'),10);if(s>=1&&s<=7)cur=s-1;if(q.get('m')==='bios')M.m='bios';if(q.get('b')==='grub')M.b='grub'}
d.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('.bm [data-k]'):null;
  if(b){M[b.getAttribute('data-k')]=b.getAttribute('data-v');render()}
});
d.addEventListener('keydown',function(e){
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.key==='ArrowRight'&&cur<6){cur++;render()}
  else if(e.key==='ArrowLeft'&&cur>0){cur--;render()}
});
window.addEventListener('cloudlang',render);
render();
})();
