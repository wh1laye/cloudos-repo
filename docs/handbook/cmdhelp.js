(function(){
var d=document,D={};
function a(n,r,e,f){var o={r:r,e:e,f:{}},i;for(i=0;i<f.length;i++)o.f[f[i][0]]=[f[i][1],f[i][2]];D[n]=o}
a('cloudpkg','пакетный менеджер cloudos (обёртка над portage)','cloudos package manager (a portage wrapper)',[
['sync','обновить дерево рецептов','update the recipe tree'],['install','установить пакет из исходников','build and install a package from source'],['remove','удалить пакет','remove a package'],['upgrade','обновить все пакеты','upgrade all packages'],['clean','удалить лишнее и очистить кеш','remove unused packages and clean caches'],['search','найти пакет','search for a package'],['info','показать, что будет установлено','show what would be installed'],['list','список установленных пакетов','list installed packages'],['doctor','проверить настройку','check the setup'],['-p','пробный запуск, ничего не меняет','dry run, changes nothing'],['-t','разрешить testing-версии (~amd64)','allow testing versions (~amd64)'],['-o','не добавлять в список установленных вручную (world)','do not add to the world list']]);
a('mount','подключить файловую систему к каталогу','attach a filesystem to a directory',[
['--rbind','смонтировать каталог вместе со всеми вложенными монтированиями','mount a directory together with everything mounted below it'],['--bind','показать каталог ещё и в другом месте','make a directory visible at a second location'],['--make-rslave','изменения хоста видны внутри, обратно не передаются','host changes are visible inside, nothing propagates back'],['-o','параметры монтирования','mount options'],['--types','тип файловой системы','filesystem type'],['-t','тип файловой системы','filesystem type'],['proc','виртуальная файловая система процессов','virtual process filesystem']]);
a('umount','отключить файловую систему','detach a filesystem',[['-R','рекурсивно, вместе со всеми вложенными','recursively, with everything mounted below']]);
a('cp','копировать файлы','copy files',[['--dereference','копировать содержимое, а не саму ссылку','copy what a link points to, not the link'],['-r','с подкаталогами','recursively'],['-a','сохранить права и ссылки','preserve permissions and links']]);
a('mv','переместить или переименовать','move or rename',[]);
a('ls','показать содержимое каталога','list a directory',[['-l','подробно, по строке на файл','long format'],['-a','включая скрытые файлы','include hidden files'],['-h','размеры в читаемом виде','human readable sizes']]);
a('cd','перейти в каталог','change directory',[]);
a('make','собрать проект по Makefile','build a project using a Makefile',[['-j','число параллельных задач','number of parallel jobs'],['menuconfig','меню настройки ядра','kernel configuration menu'],['modules_install','установить модули ядра в /lib/modules','install kernel modules to /lib/modules'],['olddefconfig','дополнить конфиг значениями по умолчанию','fill the config with defaults'],['defconfig','стандартный конфиг ядра','default kernel config'],['install','установить собранное','install what was built']]);
a('echo','вывести текст (часто с > записывает в файл)','print text (with > it writes to a file)',[]);
a('mkdir','создать каталог','create a directory',[['-p','создать и родительские, без ошибки если уже есть','create parents, no error if it exists']]);
a('curl','скачать по ссылке','download from a URL',[['-L','идти по перенаправлениям','follow redirects'],['-O','сохранить под именем из ссылки','save under the name from the URL'],['-f','ошибка при ответе 4xx и 5xx','fail on 4xx and 5xx responses'],['-o','сохранить в указанный файл','save to the given file'],['-LO','с перенаправлениями и именем из ссылки','follow redirects, keep the remote name']]);
a('ip','настройка сети','network configuration',[['addr','адреса интерфейсов','interface addresses'],['link','состояние интерфейсов','interface state'],['route','таблица маршрутов','routing table']]);
a('rc-update','включение служб openrc','manage openrc services',[['add','добавить службу в уровень загрузки','add a service to a runlevel'],['del','убрать службу','remove a service'],['show','показать, что включено','show what is enabled'],['default','основной уровень запуска','the main runlevel'],['boot','уровень ранней загрузки','the early boot runlevel']]);
a('rc-service','запуск и остановка служб openrc','start and stop openrc services',[['start','запустить','start'],['stop','остановить','stop'],['restart','перезапустить','restart']]);
a('btrfs','утилита файловой системы btrfs','btrfs filesystem tool',[['subvolume','работа с подтомами','subvolume operations'],['create','создать','create'],['filesystem','операции с файловой системой','filesystem operations'],['mkswapfile','создать файл подкачки, совместимый с btrfs','create a btrfs-compatible swap file'],['--size','размер','size']]);
a('dhcpcd','клиент dhcp, получает адрес автоматически','dhcp client, gets an address automatically',[]);
a('lsblk','показать диски и разделы','list disks and partitions',[['-f','с файловыми системами и uuid','with filesystems and uuids']]);
a('tar','работа с архивами','archive tool',[['xpf','распаковать, сохранить права, файл','extract, keep permissions, from file'],['xf','распаковать из файла','extract from a file'],['-xpf','распаковать, сохранить права','extract, keep permissions'],['--xattrs-include','сохранить расширенные атрибуты','keep extended attributes'],['--numeric-owner','владельцы числами, без имён','owners by number, not by name'],['-C','распаковать в указанный каталог','extract into the given directory'],['--one-file-system','не заходить в другие файловые системы','do not cross filesystem boundaries'],['-I','программа сжатия','compression program']]);
a('rm','удалить файлы','remove files',[['-r','с подкаталогами','recursively'],['-f','без вопросов','without asking'],['-rf','с подкаталогами и без вопросов (осторожно)','recursively and without asking (careful)']]);
a('ping','проверить связь с узлом','check connectivity',[['-c1','отправить один пакет','send a single packet']]);
a('date','показать или задать время','show or set the time',[['-s','установить время','set the time']]);
a('mkfs.fat','создать файловую систему fat','create a fat filesystem',[['-F32','вариант fat32','the fat32 variant']]);
a('mkfs.ext4','создать файловую систему ext4','create an ext4 filesystem',[['-F','не спрашивать подтверждения','do not ask for confirmation']]);
a('mkfs.btrfs','создать файловую систему btrfs','create a btrfs filesystem',[['-f','перезаписать существующую','overwrite an existing one']]);
a('findmnt','показать, что куда смонтировано','show what is mounted where',[]);
a('chroot','запустить оболочку с другим корнем','run a shell with a different root',[]);
a('source','выполнить файл в текущей оболочке','run a file in the current shell',[]);
a('exit','выйти из оболочки (из chroot)','leave the shell (the chroot)',[]);
a('localedef','собрать локаль','compile a locale',[['-i','файл описания','definition file'],['-f','кодировка','character set']]);
a('dracut','собрать initramfs','build an initramfs',[['--kver','версия ядра','kernel version'],['--force','перезаписать готовый образ','overwrite an existing image']]);
a('grep','найти строки по шаблону','find lines matching a pattern',[['-q','молча, только код возврата','quiet, only the exit code'],['-i','без учёта регистра','ignore case'],['-r','по каталогу','search a directory']]);
a('grub-install','установить загрузчик grub','install the grub bootloader',[['--target','платформа (x86_64-efi или i386-pc)','platform (x86_64-efi or i386-pc)'],['--boot-directory','где лежат файлы grub','where grub files live'],['--efi-directory','где раздел efi','where the efi partition is'],['--removable','путь EFI/BOOT, работает на любой прошивке','EFI/BOOT path, works on any firmware']]);
a('passwd','задать пароль','set a password',[]);
a('chmod','изменить права доступа','change permissions',[]);
a('chown','сменить владельца','change the owner',[]);
a('doas','выполнить команду с правами root (замена sudo)','run a command as root (a sudo replacement)',[]);
a('ln','создать ссылку','create a link',[['-s','символьная ссылка','symbolic link'],['-f','заменить, если есть','replace if it exists'],['-n','не заходить внутрь ссылки на каталог','do not follow a link to a directory'],['-sfn','символьная ссылка, заменить, не заходить внутрь','symbolic link, replace, do not follow']]);
a('swapon','включить подкачку','enable swap',[]);
a('mkswap','подготовить файл или раздел под подкачку','prepare a file or partition for swap',[]);
a('cfdisk','разметка диска в меню','menu-driven disk partitioning',[]);
a('partprobe','заново прочитать таблицу разделов','re-read the partition table',[]);
a('sha256sum','посчитать или проверить контрольную сумму','compute or check a checksum',[['-c','проверить по файлу с суммами','check against a checksum file']]);
a('export','задать переменную окружения','set an environment variable',[]);
a('zcat','прочитать сжатый файл','read a compressed file',[]);
a('limine','утилита загрузчика limine','limine bootloader tool',[['bios-install','записать загрузчик на диск (для bios)','write the bootloader to disk (for bios)']]);
a('blkid','показать uuid и типы разделов','show partition uuids and types',[]);
a('efibootmgr','записи загрузки в uefi','uefi boot entries',[]);
a('reboot','перезагрузить компьютер','reboot the computer',[]);
a('useradd','создать пользователя','create a user',[['-m','создать домашний каталог','create a home directory'],['-G','добавить в группы','add to groups'],['-s','оболочка входа','login shell']]);
a('groupadd','создать группу','create a group',[]);
a('dd','копировать данные блоками','copy data in blocks',[['if=','откуда читать','input file'],['of=','куда писать','output file'],['bs=','размер блока','block size'],['count=','сколько блоков','number of blocks'],['status=','вывод прогресса','show progress']]);
a('df','свободное место на дисках','free disk space',[['-h','в читаемом виде','human readable']]);
a('du','размер каталога','directory size',[['-sh','итоговый размер в читаемом виде','total size, human readable']]);
a('bash','запустить оболочку или скрипт','run a shell or a script',[]);
a('command','проверить, есть ли команда','check whether a command exists',[['-v','показать путь к команде','print the command path']]);
a('mountpoint','проверить, смонтирован ли каталог','check whether a directory is a mount point',[['-q','молча, только код возврата','quiet, only the exit code']]);
a('nano','текстовый редактор','text editor',[]);
a('python3','интерпретатор python','python interpreter',[['-m','запустить модуль','run a module'],['pip','менеджер пакетов python','python package manager']]);
a('tail','показать конец файла','show the end of a file',[['-n','сколько строк','number of lines'],['-f','следить за новыми строками','follow new lines']]);
a('cat','вывести файл','print a file',[]);
a('hostname','показать или задать имя компьютера','show or set the hostname',[]);
a('timeout','ограничить время выполнения','limit running time',[]);
a('git','система контроля версий','version control',[['clone','скачать репозиторий','download a repository'],['--depth','скачать только последние коммиты','download only recent commits']]);
var en=/\/en\//.test(location.pathname);
function L(p){return en?p[1]:p[0]}
function esc(s){return s.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
function explain(text){
  var out=[],lines=text.split('\n'),i,j,k,w,seg,cmd,o,toks,fl,seen;
  for(i=0;i<lines.length;i++){
    var ln=lines[i].trim();
    if(!ln||ln[0]==='#')continue;
    var segs=ln.split(/\s*(?:&&|\|\||\||;)\s*/);
    for(j=0;j<segs.length;j++){
      toks=segs[j].split(/\s+/);
      cmd=toks[0];
      if(cmd==='doas'||cmd==='sudo'){if(toks[1]){o=D[cmd];out.push([cmd,o?o.r:null,[]]);toks=toks.slice(1);cmd=toks[0]}}
      if(!D[cmd])continue;
      o=D[cmd];fl=[];seen={};
      for(k=1;k<toks.length;k++){
        w=toks[k].split('=')[0];
        var key=o.f[toks[k]]?toks[k]:(o.f[w]?w:(o.f[w+'=']?w+'=':null));
        if(!key&&/^-[A-Za-z0-9]/.test(toks[k]))key=o.f[toks[k].replace(/[0-9$()a-z]+$/,'')]?toks[k].replace(/[0-9$()a-z]+$/,''):null;
        if(!key&&/^-j/.test(toks[k])&&o.f['-j'])key='-j';
        if(key&&!seen[key]){seen[key]=1;fl.push([key,o.f[key]])}
      }
      out.push([cmd,[o.r,o.e],fl]);
    }
  }
  return out;
}
function render(text){
  var ex=explain(text),h='',i,j;
  for(i=0;i<ex.length;i++){
    h+='<div class="hl1"><code>'+esc(ex[i][0])+'</code> '+(ex[i][1]?esc(L(ex[i][1])):'')+'</div>';
    if(ex[i][2].length){h+='<ul>';for(j=0;j<ex[i][2].length;j++)h+='<li><code>'+esc(ex[i][2][j][0])+'</code> '+esc(L(ex[i][2][j][1]))+'</li>';h+='</ul>'}
  }
  return h;
}
var QI='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.8M12 17h.01"/></svg>';
function init(){
  [].forEach.call(d.querySelectorAll('#cloud .cw'),function(cw){
    var pre=cw.querySelector('pre');
    if(!pre||cw.querySelector('.hqb'))return;
    if(!explain(pre.textContent).length)return;
    var b=d.createElement('button');
    b.type='button';b.className='cpb hqb';b.innerHTML=QI;b.setAttribute('aria-label',en?'explain':'объяснить');b.title=en?'explain':'объяснить';
    var box=null;
    b.addEventListener('click',function(){
      if(box){box.remove();box=null;b.classList.remove('on');return}
      box=d.createElement('div');box.className='hlp';box.innerHTML=render(pre.textContent);
      cw.parentNode.insertBefore(box,cw.nextSibling);b.classList.add('on');
    });
    cw.appendChild(b);
  });
}
if(d.readyState==='complete')setTimeout(init,50);else window.addEventListener('load',function(){setTimeout(init,50)});
})();
