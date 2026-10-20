(function(){
var d=document,h=d.documentElement;
var PL=h.getAttribute('lang')||'ru';
var D=[
['главная','home'],['справочник','handbook'],['новое','new'],['nav:новое','news'],['форум','forum'],['релизы','releases'],['поиск','search'],
['настройки','settings'],['закрыть','close'],['тема','thread'],['nav:тема','theme'],['светлая','light'],['серая','gray'],['язык','language'],['акцент','accent'],
['цвет 1','color 1'],['цвет 2','color 2'],['градиент на кнопках и деталях','gradient on buttons and details'],['кнопка','button'],['ссылка','link'],
['сбросить акцент','reset accent'],['фон сайта','site background'],['градиент фона','background gradient'],['угол','angle'],['сбросить фон','reset background'],
['по умолчанию','default'],['цвет','color'],['светлая тема','light theme'],['серая тема','gray theme'],['включить светлую тему','switch to light theme'],['включить серую тему','switch to gray theme'],
['копировать','copy'],
['минимальный linux, который ты собираешь сам','a minimal linux you build yourself'],
['cloudos это независимая система на базе lfs: glibc, openrc и ванильное ядро. после установки в ней только консоль и root, всё остальное ты добавляешь сам из исходников.','cloudos is an independent system based on lfs: glibc, openrc and a vanilla kernel. after installation it has only a console and root, everything else you add yourself from source.'],
['читать справочник','read the handbook'],['скачать stage 3','download stage 3'],['x86_64, uefi и bios, ext4 и btrfs','x86_64, uefi and bios, ext4 and btrfs'],
['из чего состоит','what it is made of'],['собрана с нуля','built from scratch'],['база lfs 12.4 с glibc. никаких готовых бинарников чужих дистрибутивов.','an lfs 12.4 base with glibc. no ready-made binaries from other distributions.'],
['простая система инициализации и служб, без systemd.','a simple init and service manager, no systemd.'],['ванильное ядро','vanilla kernel'],['ты сам настраиваешь ядро через menuconfig под своё железо.','you configure the kernel yourself with menuconfig for your own hardware.'],
['быстрый загрузчик для uefi и bios, настраивается одним файлом.','a fast bootloader for uefi and bios, configured with a single file.'],['ext4 и btrfs','ext4 and btrfs'],['на выбор, с поддержкой подтомов и снимков.','your choice, with support for subvolumes and snapshots.'],
['пакеты только из исходников, рецепты основаны на gentoo.','packages built only from source, recipes based on gentoo.'],
['установка в восемь шагов','installation in eight steps'],['установка ручная, как в gentoo, без мастеров. каждый шаг подробно описан в справочнике.','the installation is manual, like in gentoo, without wizards. every step is described in detail in the handbook.'],
['подготовка','preparation'],['live iso, сеть, время','live iso, network, time'],['диск','disk'],['разметка и файловые системы','partitioning and file systems'],['скачать и распаковать','download and unpack'],['вход в новую систему','entering the new system'],
['menuconfig и сборка','menuconfig and build'],['загрузчик','bootloader'],['initramfs, fstab, limine','initramfs, fstab, limine'],['завершение','finishing'],['пароль и службы','password and services'],['первая загрузка','first boot'],['пользователь, имя, сеть, swap','user, hostname, network, swap'],
['как это выглядит','what it looks like'],['терминал','terminal'],['что внутри','what is inside'],['чего нет','what is missing'],['ядро','kernel'],
['gcc, glibc, binutils, python','gcc, glibc, binutils, python'],['openrc, udev, dhcpcd','openrc, udev, dhcpcd'],['opendoas вместо sudo','opendoas instead of sudo'],['curl, git, nano','curl, git, nano'],['dracut, btrfs-progs, dosfstools','dracut, btrfs-progs, dosfstools'],
['графики и окружений','graphics and desktop environments'],['man-страниц, есть справочник','man pages, there is a handbook'],['ssh-сервера и фаервола','an ssh server and a firewall'],['arm, только x86_64','arm, only x86_64'],['установщика с мастерами','an installer with wizards'],
['дальше','next'],['полная установка, ошибки и шпаргалка','full installation, errors and cheat sheet'],['что готово и что в планах','what is done and what is planned'],['вопросы и обсуждение','questions and discussion'],['stage 3 и контрольные суммы','stage 3 and checksums'],
['пакеты','packages'],['что входит в stage 3 и что ставится через cloudpkg','what is in stage 3 and what is installed with cloudpkg'],['железо','hardware'],['на чём cloudos уже проверен','what cloudos has been tested on'],
['© 2026 wh1laye. лицензия mit.','© 2026 wh1laye. mit license.'],['рецепты пакетов основаны на gentoo (gpl-2).','package recipes are based on gentoo (gpl-2).'],
['что уже готово, что в работе и что планируется. сроков нет, проект делается по мере готовности.','what is already done, what is in progress and what is planned. there are no deadlines, the project is made as it gets ready.'],
['готово','done'],['в работе','in progress'],['в планах','planned'],['возможно','maybe'],
['cloudos 1.0 beta','cloudos 1.0 beta'],
['первый публичный stage 3: cloudos-stage3-1.0-x86_64.tar.xz. база lfs 12.4, openrc, ядро собирается вручную, загрузчик limine. файлы лежат на странице релизов.','the first public stage 3: cloudos-stage3-1.0-x86_64.tar.xz. lfs 12.4 base, openrc, the kernel is built by hand, limine bootloader. the files are on the releases page.'],
['расширен: переключатель uefi и bios, поиск, главы про первую загрузку, пакеты, обслуживание, ошибки и решения, шпаргалка и приложения.','extended: uefi and bios switch, search, chapters on first boot, packages, maintenance, errors and fixes, a cheat sheet and appendices.'],
['темы, ответы, комментарии, лайки и реакции, поиск, теги, личные сообщения, уведомления, профили, значки, опросы и панель управления.','threads, replies, comments, likes and reactions, search, tags, private messages, notifications, profiles, badges, polls and a management panel.'],
['страница собирает файлы из github releases: размеры, число скачиваний, кнопка скачать и команда проверки sha256.','the page collects files from github releases: sizes, download counts, a download button and the sha256 check command.'],
['оформление сайта','site design'],['тёмно-серая тема по умолчанию и светлая, градиент по желанию, настройки темы синхронизируются с аккаунтом форума.','a dark gray theme by default and a light one, an optional gradient, theme settings sync with the forum account.'],
['живой iso','live iso'],['образ для установки с git, curl, cfdisk, fdisk, gdisk, dosfstools, btrfs-progs, e2fsprogs, limine и efibootmgr.','an installation image with git, curl, cfdisk, fdisk, gdisk, dosfstools, btrfs-progs, e2fsprogs, limine and efibootmgr.'],
['пакетный менеджер: sync, install, remove, upgrade, clean. нужно решить, как использовать рецепты gentoo, и добавить подпись пакетов.','the package manager: sync, install, remove, upgrade, clean. we still need to decide how to use gentoo recipes and add package signing.'],
['вернуть вместо sysklogd, когда он соберётся через cloudpkg.','bring it back instead of sysklogd once it builds with cloudpkg.'],
['проверка установки','installation testing'],['прогнать установку с нуля на разном железе и в виртуальных машинах, исправить найденное.','run the installation from scratch on different hardware and in virtual machines and fix what is found.'],['поддержка grub рядом с limine.','grub support next to limine.'],
['следить за обновлениями','follow updates'],['новые версии и образы появляются на странице','new versions and images appear on the'],['релизов','releases page'],[', обсуждение на',', discussion on the'],['форуме','forum'],[', исходники на',', source code on'],
['страница не найдена','page not found'],
['релизы cloudos','cloudos releases'],['системные архивы cloudos','cloudos system archives'],['архивы и образы cloudos. файлы хранятся в github releases и скачиваются напрямую оттуда.','cloudos archives and images. files are stored in github releases and downloaded directly from there.'],
['· бета','· beta'],['· скачиваний:','· downloads:'],['другое','other'],['здесь пока пусто','nothing here yet'],['к списку','back to the list'],['не удалось загрузить список','could not load the list'],['остальные релизы','other releases'],
['положи архив и файл .sha256 в одну папку и выполни:','put the archive and the .sha256 file in one folder and run:'],['проверка целостности','integrity check'],['релизов пока нет','no releases yet'],['скачать','download'],['такого релиза нет.','there is no such release.'],['файлов пока нет','no files yet'],['открыть релизы на github','open releases on github'],['страница на github','page on github'],
['последний','latest'],['бета','beta'],['контрольная сумма','checksum'],['что изменилось','changes'],
['войти:','sign in:'],['анонимно','anonymous'],['не загрузился supabase.js, обнови страницу','supabase.js failed to load, refresh the page'],['введи email и пароль от 6 символов','enter an email and a password of at least 6 characters'],
['аккаунт создан, подтверди почту по ссылке из письма и потом войди','account created, confirm your email via the link in the message and then sign in'],['подтверди, что ты человек','confirm you are human'],['капча не прошла, обнови страницу','captcha failed, refresh the page'],
['выйти','sign out'],['профиль','profile'],['закладки','bookmarks'],['управление','management'],['жалобы','reports'],['разделы','boards'],['темы','threads'],['сообщения','messages'],['сообщение','message'],['участники','members'],['участник','member'],['участников','members'],['участников:','members:'],['тем','threads'],['тем:','threads:'],['сообщений','posts'],
['тем пока нет','no threads yet'],['тем не найдено','no threads found'],['разделов пока нет','no boards yet'],['сообщений пока нет','no messages yet'],['комментариев пока нет','no comments yet'],['закладок пока нет','no bookmarks yet'],['уведомлений пока нет','no notifications yet'],['диалогов пока нет','no conversations yet'],['значков пока нет','no badges yet'],['записей пока нет','no entries yet'],['жалоб пока нет','no reports yet'],['пока пусто','nothing here yet'],['никого','nobody'],['никого не найдено','nobody found'],['не найдено','not found'],['такого участника нет.','no such member.'],
['новая тема','new thread'],['создать тему','create thread'],['название','title'],['без префикса','no prefix'],['вопрос','question'],['баг','bug'],['предложение','suggestion'],['обсуждение','discussion'],['добавить опрос','add a poll'],['можно выбрать несколько','multiple choice'],['один вариант','single choice'],
['отмена','cancel'],['отправить','send'],['ответить','reply'],['комментировать','comment'],['комментарии','comments'],['цитата','quote'],['изменить','edit'],['удалить','delete'],['пожаловаться','report'],['в закладки','bookmark'],['убрать из закладок','remove bookmark'],['убрать тему из закладок','remove thread from bookmarks'],
['подписаться на тему','subscribe to thread'],['отписаться от темы','unsubscribe from thread'],['отметить решённой','mark as solved'],['снять отметку «решено»','remove the "solved" mark'],['решено','solved'],['закреплено','pinned'],['закрыто','closed'],['закрыта','closed'],['закрепить','pin'],['открепить','unpin'],['открыть','open'],['открыть тему','open thread'],
['удалить тему','delete thread'],['удалить сообщение','delete message'],['удалить комментарий?','delete this comment?'],['удалить сообщение?','delete this message?'],['удалить тему целиком?','delete the whole thread?'],['тема закрыта, отвечать нельзя.','the thread is closed, replies are disabled.'],
['предпросмотр','preview'],['предпросмотр:','preview:'],['изменить сообщение','edit message'],['сохранить','save'],['сохранено','saved'],['ошибка','error'],['загрузка','loading'],['нет доступа','no access'],['нет доступа.','no access.'],['у тебя нет права',"you don't have the permission"],
['выбери картинку','choose an image'],['это не картинка','this is not an image'],['не удалось сжать картинку','could not compress the image'],['картинка','image'],['(картинки доступны только участникам с аккаунтом, не анонимам)','(images are available only to members with an account, not anonymous)'],['[картинка]','[image]'],
['ответил в вашей теме','replied in your thread'],['прокомментировал ваше сообщение','commented on your message'],['оценил ваше сообщение','liked your message'],['написал в вашем профиле','wrote on your profile'],['упомянул вас','mentioned you'],['вам выдана роль «','you were given the role «'],['ваша роль снята','your role was removed'],['ваши права изменены','your permissions were changed'],['вы назначены администратором','you were made an administrator'],['права администратора сняты','administrator rights were removed'],['вы замучены до','you are muted until'],['ваш аккаунт заблокирован:','your account is blocked:'],['вы забанены до','you are banned until'],['мут снят','mute lifted'],['бан снят','ban lifted'],['ответил в теме, на которую вы подписаны','replied in a thread you subscribe to'],['прочитать все','mark all as read'],['удалить все уведомления?','delete all notifications?'],['очистить','clear'],['уведомления','notifications'],
['о себе','about'],['пока ничего о себе не написал.','has not written anything about themselves yet.'],['на форуме с','on the forum since'],['рейтинг ·','rating ·'],['новичок','newcomer'],['свой','regular'],['опытный','experienced'],['ветеран','veteran'],['онлайн','online'],['сейчас активны','active now'],[', гостей:',', guests:'],['это ты',"that's you"],
['изменить профиль','edit profile'],['сменить имя','change name'],['имя можно сменить через','you can change your name in'],['дн.','d.'],['новое имя (2-24 символа). менять можно раз в 7 дней','new name (2-24 characters). can be changed once every 7 days'],
['аватар (файл)','avatar (file)'],['баннер (файл)','banner (file)'],['убрать аватар','remove avatar'],['градиент ника','nickname gradient'],['включить градиент','enable gradient'],['статус (эмодзи или пара слов)','status (an emoji or a few words)'],['баннер, цвет 1','banner, color 1'],['баннер, цвет 2','banner, color 2'],['ник, цвет 1','nickname, color 1'],['ник, цвет 2','nickname, color 2'],['картинка баннера (ссылка https, необязательно)','banner image (https link, optional)'],['применить','apply'],['сбросить','reset'],['пресеты','presets'],
['для опроса нужен вопрос и от 2 до 10 вариантов','a poll needs a question and 2 to 10 options'],['· голосов:','· votes:'],['тема создана, но опрос не создался:','the thread was created but the poll was not:'],['не удалось создать тему:','could not create the thread:'],['не удалось создать сообщение:','could not create the message:'],['не удалось удалить:','could not delete:'],
['войди, чтобы писать сообщения.','sign in to write messages.'],['войди, чтобы видеть закладки.','sign in to see bookmarks.'],['войди, чтобы видеть уведомления.','sign in to see notifications.'],['чтобы написать участнику, открой его профиль и нажми «сообщения».','to write to a member, open their profile and press "messages".'],['вы:','you:'],['сообщение от','message from'],['сообщения недоступны','messages are unavailable'],['закладки недоступны','bookmarks are unavailable'],['уведомления недоступны','notifications are unavailable'],
['причина жалобы (3-300 символов)','reason for the report (3-300 characters)'],['жалоба отправлена','report sent'],['вы уже жаловались на это сообщение','you have already reported this message'],
['предложения, вопросы и обсуждение cloudos.','suggestions, questions and discussion about cloudos.'],['· изменено','· edited'],['история','history'],
['реакция','react'],['история правок','edit history'],['прошлые версии, от новых к старым','previous versions, newest first'],['правок нет','no edits'],['пусто','empty'],['по активности','by activity'],['сначала новые','newest first'],['по числу ответов','by replies'],['без ответов','no replies'],['решённые','solved'],['тем нет','no threads'],['найти','search'],
['поиск по темам, сообщениям и участникам','search threads, messages and members'],['введи минимум два символа','enter at least two characters'],['ничего не найдено','nothing found'],['ответов:','replies:'],['назад','back'],['вперёд','next'],['скопировано','copied'],['ссылка на сообщение','link to the message'],
['изменить теги','edit tags'],['добавить теги','add tags'],['теги через запятую, до 5 штук','tags separated by commas, up to 5'],['теги через запятую, до 5 (необязательно)','tags separated by commas, up to 5 (optional)'],['подписаться на раздел','subscribe to the board'],['отписаться от раздела','unsubscribe from the board'],['показать полностью','show all'],['свернуть','collapse'],
['топ участников','top members'],['по рейтингу, как в профиле','by rating, as in the profile'],['рейтинг:','rating:'],['тем с таким тегом нет','no threads with this tag'],['создал тему «','created the thread «'],['» в разделе «','» in the board «'],['участников пока нет','no members yet'],['пока ни у кого нет рейтинга','nobody has a rating yet'],['теги','tags'],
['форум не запустился','the forum did not start'],['ошибка загрузки','loading error'],['форум cloudos','cloudos forum'],['новые сообщения в теме','new messages in this thread'],['показать','show'],['игнорировать участника','ignore this member'],['убрать из игнора','stop ignoring'],['сообщение скрыто, вы игнорируете автора','message hidden, you are ignoring the author'],
['пакет','package'],['версия','version'],['категория','category'],['описание','description'],['статус','status'],['в stage 3','in stage 3'],['через cloudpkg','via cloudpkg'],['поиск по пакетам','search packages'],['все','all'],['система','system'],['сеть','network'],['инструменты','tools'],['диски','disks'],['разработка','development'],
['при заходе','on entry']
];
var E={},SUBK=[];
D.forEach(function(p){E[p[0]]=p[1];if(p[0].length>=3&&p[0].indexOf('nav:')!==0)SUBK.push(p[0])});
SUBK.sort(function(a,b){return b.length-a.length});
function rx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
var SRE=null;
try{SRE=new RegExp('(?<![а-яё])('+SUBK.map(rx).join('|')+')(?![а-яё])','g')}catch(e){SRE=null}
var CYR=/[а-яё]/i;
var SKIPT={SCRIPT:1,STYLE:1,PRE:1,CODE:1,TEXTAREA:1,NOSCRIPT:1};
var SKIPC=['txt','bio','dmm','un','relbody','hb','hist','sxh'];
var orig=new WeakMap();
function lang(){return window.CloudTheme?window.CloudTheme.getLang():'ru'}
function skip(el){
  for(;el&&el!==d.body;el=el.parentElement){
    if(SKIPT[el.tagName]||el.hasAttribute('data-nt'))return true;
    for(var i=0;i<SKIPC.length;i++)if(el.classList&&el.classList.contains(SKIPC[i]))return true;
  }
  return false;
}
function tr(t,nav){
  if(nav&&E['nav:'+t]!==undefined)return E['nav:'+t];
  if(E[t]!==undefined)return E[t];
  if(!SRE)return undefined;
  var r=t.replace(SRE,function(m){return E[m]});
  if(r===t||CYR.test(r))return undefined;
  return r;
}
function text(n,en){
  if(!en){
    if(orig.has(n)){n.nodeValue=orig.get(n);orig.delete(n)}
    return;
  }
  var o=orig.has(n)?orig.get(n):n.nodeValue;
  var t=o.replace(/\s+/g,' ').trim();
  if(!t||!CYR.test(t))return;
  var p=n.parentElement;
  if(!p||skip(p))return;
  if(p.tagName==='STRONG'&&p.parentElement&&p.parentElement.classList.contains('trow')&&n.previousSibling===null&&p.firstChild===n)return;
  var r=tr(t,!!p.closest('.hl'));
  if(r===undefined||r===t)return;
  var a=o.match(/^\s*/)[0],b=o.match(/\s*$/)[0];
  if(!orig.has(n))orig.set(n,o);
  n.nodeValue=a+r+b;
}
var AT=['placeholder','title','aria-label'];
function attrs(el,en){
  if(!el.getAttribute)return;
  AT.forEach(function(a){
    var k='o'+a.replace(/-/g,'');
    if(!en){
      if(el.dataset&&el.dataset[k]!==undefined){el.setAttribute(a,el.dataset[k]);delete el.dataset[k]}
      return;
    }
    var v=el.getAttribute(a);
    if(!v||!CYR.test(v)||skip(el))return;
    var r=tr(v.replace(/\s+/g,' ').trim(),!!el.closest('.hl'));
    if(r===undefined)return;
    if(el.dataset[k]===undefined)el.dataset[k]=v;
    el.setAttribute(a,r);
  });
}
function walk(root,en){
  if(!root)return;
  if(root.nodeType===3){text(root,en);return}
  if(root.nodeType!==1)return;
  if(SKIPT[root.tagName])return;
  attrs(root,en);
  var w=d.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null);
  var n;
  while((n=w.nextNode())){
    if(n.nodeType===3)text(n,en);
    else if(!SKIPT[n.tagName])attrs(n,en);
  }
}
var titleO=null;
function title(en){
  if(titleO===null)titleO=d.title;
  if(!en){d.title=titleO;return}
  if(!CYR.test(titleO))return;
  var parts=titleO.split(':');
  var r=parts.map(function(x){var t=x.trim();var v=tr(t,false);return v===undefined?t:v});
  d.title=r.join(': ');
}
function redirect(l){
  if(PL===l)return false;
  var alt=d.querySelector('link[rel="alternate"][data-l="'+l+'"]');
  if(!alt)return false;
  location.replace(alt.getAttribute('href')+location.hash);
  return true;
}
function apply(root){
  var en=lang()==='en';
  if(!en)return;
  walk(root||d.body,true);
}
function full(){
  var l=lang();
  h.setAttribute('lang',l);
  if(redirect(l))return;
  var en=l==='en';
  walk(d.body,en);
  title(en);
}
var mo=null;
function observe(){
  if(mo||!window.MutationObserver)return;
  mo=new MutationObserver(function(ms){
    if(lang()!=='en')return;
    ms.forEach(function(m){
      [].forEach.call(m.addedNodes,function(n){walk(n,true)});
    });
  });
  mo.observe(d.body,{childList:true,subtree:true});
}
window.CloudI18n={apply:apply,full:full,t:function(ru,en){return lang()==='en'?en:ru},lang:lang};
var l0=lang();
if(l0!==PL&&redirect(l0))return;
window.addEventListener('cloudlang',full);
function boot(){full();observe()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
})();
