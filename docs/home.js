(function(){
var d=document,W=window;
var T={
i:[['c','# live iso, вход: cloudos / cloudos'],['p','doas cloudos-install'],['c','# auto стирает выбранный диск, manual трогает только root и boot'],['p','reboot'],['p','doas cloudos-audit'],['c','# проверка защиты установленной системы']],
p:[['p','doas cloudpkg sync'],['p','doas cloudpkg install nano'],['p','doas cloudpkg search htop'],['p','doas cloudpkg upgrade'],['c','# на btrfs перед обновлением делается снимок'],['p','doas cloudpkg rollback']],
s:[['p','sha256sum -c cloudos-live-amd64-*.iso.sha256'],['p','doas cloudos-firewall status'],['p','doas cloudos-firewall allow ssh'],['p','doas rc-update add sshd default'],['c','# sshd по умолчанию выключен, root по ssh закрыт']]
};
var D={
"# live iso, вход: cloudos / cloudos":"# live iso, login: cloudos / cloudos","# auto стирает выбранный диск, manual трогает только root и boot":"# auto wipes the chosen disk, manual touches only root and boot","# проверка защиты установленной системы":"# audit of the installed system protection","# на btrfs перед обновлением делается снимок":"# on btrfs a snapshot is made before the upgrade","# sshd по умолчанию выключен, root по ssh закрыт":"# sshd is off by default, root over ssh is closed",
"быстрый и усиленный":"fast and hardened",", который ставится одной командой":", that installs with a single command",
"загружаешься с live iso, запускаешь установщик, через несколько минут в /mnt/cloudos уже готовая система. openrc, ядро без initramfs, фаервол включён с первой загрузки.":"boot the live iso, run the installer, and in a few minutes there is a ready system in /mnt/cloudos. openrc, a kernel without initramfs, firewall on from the first boot.",
"скачать live iso":"download live iso","читать справочник":"read the handbook","копировать":"copy","скопировано":"copied",
"установка":"install","пакеты":"packages","защита":"protection","терминал":"terminal",
"версия live iso":"live iso version","размер iso":"iso size","пакетов в stage 3":"packages in stage 3","uefi и bios":"uefi and bios","лицензия":"license",
"без initramfs":"no initramfs",
"из чего состоит":"what it is made of","каждый компонент выбран за простоту и предсказуемость, а не за количество галочек.":"every component is picked for simplicity and predictability, not for a checklist count.",
"быстрая установка":"fast install","система распаковывается прямо из iso, без скачивания и компиляции. режим auto сам размечает выбранный диск, режим manual трогает только разделы root и boot.":"the system is unpacked straight from the iso, with no download and no compiling. auto mode partitions the chosen disk itself, manual mode touches only the root and boot partitions.",
"усиленная база":"hardened base","kspp-опции ядра, подпись модулей, nftables с drop, root только через doas.":"kspp kernel options, module signing, nftables with drop, root only through doas.",
"ядро без initramfs":"kernel without initramfs","драйверы дисков и файловые системы встроены, загрузка короче.":"disk drivers and filesystems are built in, boot is shorter.",
"openrc":"openrc","простая система служб без systemd, службы стартуют параллельно.":"a simple service system without systemd, services start in parallel.",
"limine":"limine","быстрый загрузчик с одним файлом конфига, для uefi и bios.":"a fast bootloader with a single config file, for uefi and bios.",
"cloudpkg":"cloudpkg","пакеты из исходников, рецепты основаны на gentoo, снимки btrfs перед обновлением.":"packages from source, recipes are based on gentoo, btrfs snapshots before upgrades.",
"secure boot и tpm2":"secure boot and tpm2","свои ключи secure boot, подписанный uki, разблокировка luks через tpm2 с запасным паролем.":"your own secure boot keys, a signed uki, luks unlock through tpm2 with a fallback password.",
"проверка защиты":"protection audit","одна команда показывает, что включено в системе: фаервол, ssh, sysctl, ядро.":"one command shows what is enabled in the system: firewall, ssh, sysctl, kernel.",
"установка в три шага":"installation in three steps","одной командой или вручную по справочнику.":"with one command or manually by the handbook.",
"live iso":"live iso","скачай, проверь сумму, запиши на флешку и загрузись. вход в live: cloudos / cloudos.":"download, check the sum, write it to a usb stick and boot. live login: cloudos / cloudos.",
"cloudos-install":"cloudos-install","диск, пароли, всё остальное само: форматирование, распаковка, limine, пользователи.":"disk, passwords, the rest is automatic: formatting, unpacking, limine, users.",
"reboot":"reboot","вход, сеть, пакеты. чистая консоль и обычный пользователь с doas.":"login, network, packages. a clean console and a regular user with doas.",
"безопасность по умолчанию":"secure by default","защита включена сразу после установки, а не спрятана в главе «потом настроишь».":"protection is on right after install, not hidden in a «configure it later» chapter.",
"фаервол с первой загрузки":"firewall from the first boot","nftables: входящие закрыты, исходящие открыты. управление через cloudos-firewall.":"nftables: incoming closed, outgoing open. managed through cloudos-firewall.",
"подписанные релизы":"signed releases","sha256 всех файлов и подпись minisign для stage 3 и iso, публичный ключ лежит на сайте.":"sha256 of all files and a minisign signature for stage 3 and the iso, the public key is on the site.",
"attestation в github actions":"attestation in github actions","происхождение сборки подтверждается в самом github, а не только словами.":"build provenance is confirmed by github itself, not just by words.",
"sshd выключен":"sshd is off","openssh стоит, но не запущен. root по ssh закрыт, включается двумя командами.":"openssh is installed but not running. root over ssh is closed, it is enabled with two commands.",
"обёртка над portage: пакеты собираются из исходников, на btrfs перед обновлением делается снимок.":"a portage wrapper: packages are built from source, on btrfs a snapshot is made before an upgrade.",
"снимки btrfs":"btrfs snapshots","upgrade сначала делает снимок корня, rollback загружается из него.":"upgrade makes a root snapshot first, rollback boots from it.",
"проверка при установке":"check on install","исходники cloudpkg проверяются подписью minisign, без неё установка отменяется.":"cloudpkg sources are checked with a minisign signature, without it the install is aborted.",
"доктор":"doctor","cloudpkg doctor проверяет настройку, cloudpkg fix чинит окружение portage.":"cloudpkg doctor checks the setup, cloudpkg fix repairs the portage environment.",
"что внутри и чего нет":"what is inside and what is missing","честный список, без маркетинга.":"an honest list, without marketing.",
"что внутри":"what is inside","чего пока нет":"what is missing for now","gcc, glibc, binutils, python":"gcc, glibc, binutils, python","openrc, udev, dhcpcd, iwd":"openrc, udev, dhcpcd, iwd","opendoas вместо sudo":"opendoas instead of sudo","curl, git, nano, wget, rsync":"curl, git, nano, wget, rsync","nftables, gnupg, man-db":"nftables, gnupg, man-db","cloudpkg для пакетов":"cloudpkg for packages","выбор рабочего стола и графики":"a choice of desktop and graphics","arm, только x86_64":"arm, only x86_64","графического установщика":"a graphical installer",
"новое":"news","последние изменения проекта.":"latest project changes.",
"частые вопросы":"faq",
"это отдельный дистрибутив или сборка чужого?":"is this a separate distribution or a rebuild of someone else's?","собственная система: база собрана по lfs с glibc, свой установщик, свой загрузочный образ и свои сборочные скрипты. рецепты пакетов в cloudpkg основаны на gentoo.":"its own system: the base is built by lfs with glibc, with its own installer, boot image and build scripts. package recipes in cloudpkg are based on gentoo.",
"на каком железе работает?":"what hardware does it run on?","только x86_64, uefi и старый bios. на странице «железо» собрано, на чём проверено.":"only x86_64, uefi and legacy bios. the «hardware» page lists what it was tested on.",
"есть ли графика?":"is there graphics?","нет, после установки только консоль. всё остальное ты добавляешь сам через cloudpkg.":"no, only a console after install. everything else you add yourself through cloudpkg.",
"как проверить, что iso не подменён?":"how do i check that the iso is genuine?","сверь sha256 и, если в релизе есть файл .minisig, подпись minisign ключом с сайта. подробности на странице «проверка файлов».":"compare the sha256 and, if the release has a .minisig file, the minisign signature with the key from the site. details are on the «file verification» page.",
"безопасно ли в live пароль cloudos?":"is the cloudos password in live safe?","пароль cloudos известен всем и нужен только для live, ssh в live закрыт. в установленной системе такого пароля нет.":"the cloudos password is public and only for live, ssh is closed in live. the installed system has no such password.",
"дальше":"next","справочник":"handbook","релизы":"releases","форум":"forum","железо":"hardware",
"установка, первые шаги и ошибки":"install, first steps and errors","live iso и контрольные суммы":"live iso and checksums","что в системе и что ставится через cloudpkg":"what is in the system and what installs through cloudpkg","вопросы и обсуждение":"questions and discussion","что в работе и что в планах":"what is in progress and what is planned","на чём проверено, добавь своё":"what it was tested on, add yours",
"проверка файлов":"file verification","sha256 и подпись прямо в браузере":"sha256 and signature right in the browser","статус сборок":"build status","состояние github actions":"github actions state","определение железа":"hardware detection","подскажет, что включить в ядре":"hints what to enable in the kernel","сравнение":"comparison","чем cloudos отличается от других":"how cloudos differs from others","песочница":"sandbox","попробуй команды в браузере":"try commands in the browser","карта размеров":"size map","из чего состоит stage 3":"what stage 3 consists of",
"поставь cloudos сегодня":"install cloudos today","скачай live iso, проверь сумму и запусти установщик. хватит флешки и десяти минут.":"download the live iso, check the sum and run the installer. a usb stick and ten minutes are enough.",
"нет новостей":"no news"
};
if(W.I18N&&W.I18N.add)W.I18N.add(D);
function lang(){return W.CloudTheme&&W.CloudTheme.getLang?W.CloudTheme.getLang():'ru'}
function tr(s){return W.I18N&&W.I18N.t?W.I18N.t(s):s}
function $(s,r){return (r||d).querySelector(s)}
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}

var tb=$('#tb'),cur='i';
function draw(k){
  cur=k;
  tb.className='tb';
  tb.textContent='';
  T[k].forEach(function(r){
    var l=el('span','l');
    if(r[0]==='p'){l.appendChild(el('span','p','$'));l.appendChild(d.createTextNode(r[1]))}
    else l.appendChild(el('span','c',tr(r[1])));
    tb.appendChild(l);
  });
  if(!W.matchMedia||!W.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var ls=tb.children;
    for(var i=0;i<ls.length;i++)ls[i].style.animationDelay=(i*0.22)+'s';
    void tb.offsetWidth;
    tb.className='tb go';
  }
}
if(tb){
  [].forEach.call(d.querySelectorAll('.tab'),function(b){
    b.addEventListener('click',function(){
      [].forEach.call(d.querySelectorAll('.tab'),function(x){x.setAttribute('aria-selected',x===b?'true':'false')});
      draw(b.getAttribute('data-k'));
    });
  });
  draw('i');
  W.addEventListener('cloudlang',function(){draw(cur)});
}

[].forEach.call(d.querySelectorAll('[data-copy]'),function(b){
  var lab=$('span',b);
  b.addEventListener('click',function(){
    var v=b.getAttribute('data-copy');
    function ok(){
      b.classList.add('ok');
      if(lab)lab.textContent=tr('скопировано');
      setTimeout(function(){b.classList.remove('ok');if(lab)lab.textContent=tr('копировать')},1600);
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(ok,function(){})}
  });
});

[].forEach.call(d.querySelectorAll('.hm .card'),function(c){
  c.addEventListener('pointermove',function(e){
    var r=c.getBoundingClientRect();
    c.style.setProperty('--sx',(e.clientX-r.left)+'px');
    c.style.setProperty('--sy',(e.clientY-r.top)+'px');
  });
});

var rv=d.querySelectorAll('.rv');
if('IntersectionObserver' in W){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  [].forEach.call(rv,function(n){io.observe(n)});
}else{
  [].forEach.call(rv,function(n){n.classList.add('in')});
}

function mb(n){return (n/1048576).toFixed(0)+(lang()==='en'?' mb':' мб')}
var a=$('#dl'),inf=$('#dlinfo');
if(W.fetch){
  fetch('https://api.github.com/repos/wh1laye/cloudos-repo/releases?per_page=10').then(function(r){return r.ok?r.json():[]}).then(function(rs){
    for(var k=0;k<rs.length;k++){
      var r=rs[k];
      if(r.draft)continue;
      var f=(r.assets||[]).filter(function(x){return /\.iso$/.test(x.name)})[0];
      if(!f)continue;
      var m=f.name.match(/(\d+(?:\.\d+)+)\.iso$/);
      if(a)a.href=f.browser_download_url;
      if(inf)inf.textContent=f.name.replace(/\.iso$/,'')+', '+mb(f.size);
      if(m){$('#kv').textContent='live iso '+m[1];$('#sv').textContent=m[1]}
      $('#ss').textContent=mb(f.size);
      return;
    }
  }).catch(function(){});
  fetch('packages/packages.json').then(function(r){return r.ok?r.json():[]}).then(function(p){
    var n=p.filter(function(x){return x.s==='stage3'}).length;
    if(n)$('#sp').textContent=String(n);
  }).catch(function(){});
  var nl=$('#nl');
  fetch('news/news.json').then(function(r){return r.ok?r.json():[]}).then(function(ns){
    var en=lang()==='en';
    ns.slice(0,3).forEach(function(n){
      var c=el('a','card rv in');
      c.href='news/';
      c.style.textDecoration='none';
      c.style.color='inherit';
      c.appendChild(el('time','',n.d));
      c.appendChild(el('h3','',en&&n.te?n.te:n.t));
      c.appendChild(el('p','',en&&n.pe?n.pe:n.p));
      nl.appendChild(c);
    });
    if(!nl.children.length)nl.appendChild(el('p','mu',tr('нет новостей')));
  }).catch(function(){});
}
})();
