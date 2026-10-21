(function(){
var d=document,h=d.documentElement;
var D={
"главная":"home","справочник":"handbook","новое":"news","форум":"forum","релизы":"releases","пакеты":"packages","железо":"hardware","поиск":"search","сообщения":"messages","уведомления":"notifications","поиск по справочнику":"search the handbook","мои значения":"my values","настройки":"settings",
"© 2026 wh1laye. лицензия mit.":"© 2026 wh1laye. mit license.","лицензия mit":"mit license","рецепты пакетов основаны на gentoo (gpl-2).":"package recipes are based on gentoo (gpl-2).",
"что уже готово, что в работе и что планируется. сроков нет, проект делается по мере готовности.":"what is done, what is in progress and what is planned. there are no deadlines, the project is made as it gets ready.",
"готово":"done","в работе":"in progress","в планах":"planned","возможно":"maybe",
"cloudos 1.0 beta":"cloudos 1.0 beta","первый публичный stage 3: cloudos-stage3-1.0-x86_64.tar.xz. база lfs 12.4, openrc, ядро собирается вручную, загрузчик limine. файлы лежат на странице релизов.":"the first public stage 3: cloudos-stage3-1.0-x86_64.tar.xz. lfs 12.4 base, openrc, kernel built by hand, limine bootloader. the files are on the releases page.",
"расширен: переключатель uefi и bios, поиск, главы про первую загрузку, пакеты, обслуживание, ошибки и решения, шпаргалка и приложения.":"expanded: uefi and bios switch, search, chapters on the first boot, packages, maintenance, errors and fixes, a cheat sheet and appendices.",
"темы, ответы, комментарии, лайки и реакции, поиск, теги, личные сообщения, уведомления, профили, значки, опросы и панель управления.":"threads, replies, comments, likes and reactions, search, tags, private messages, notifications, profiles, badges, polls and a control panel.",
"страница собирает файлы из github releases: размеры, число скачиваний, кнопка скачать и команда проверки sha256.":"the page collects files from github releases: sizes, download counts, a download button and the sha256 check command.",
"оформление сайта":"site design","тёмно-серая тема по умолчанию и светлая, градиент по желанию, настройки темы синхронизируются с аккаунтом форума.":"dark gray theme by default and a light one, optional gradient, theme settings sync with the forum account.",
"живой iso":"live iso","образ для установки с git, curl, cfdisk, fdisk, gdisk, dosfstools, btrfs-progs, e2fsprogs, limine и efibootmgr.":"an install image with git, curl, cfdisk, fdisk, gdisk, dosfstools, btrfs-progs, e2fsprogs, limine and efibootmgr.",
"пакетный менеджер: sync, install, remove, upgrade, clean. нужно решить, как использовать рецепты gentoo, и добавить подпись пакетов.":"the package manager: sync, install, remove, upgrade, clean. it still needs a decision on how to use gentoo recipes and package signing.",
"вернуть вместо sysklogd, когда он соберётся через cloudpkg.":"bring it back instead of sysklogd once it builds through cloudpkg.",
"проверка установки":"install testing","прогнать установку с нуля на разном железе и в виртуальных машинах, исправить найденное.":"run the install from scratch on different hardware and in virtual machines, fix what is found.","поддержка grub рядом с limine.":"grub support next to limine.",
"следить за обновлениями":"follow updates","новые версии и образы появляются на странице":"new versions and images appear on the","обсуждение на":"discussion on the","исходники на":"sources on",
"релизы":"releases","архивы и образы cloudos. файлы хранятся в github releases и скачиваются напрямую оттуда.":"cloudos archives and images. files are stored in github releases and downloaded directly from there.",
"системные архивы cloudos":"cloudos system archives","другое":"other","остальные релизы":"other releases","релизов пока нет":"no releases yet","здесь пока пусто":"nothing here yet","файлов пока нет":"no files yet","файл.":"file(s)","скачиваний:":"downloads:","скачать":"download",
"не удалось загрузить список":"could not load the list","открыть релизы на github":"open releases on github","не найдено":"not found","такого релиза нет.":"there is no such release.","к списку":"to the list","страница на github":"page on github",
"проверка целостности":"integrity check","положи архив и файл .sha256 в одну папку и выполни:":"put the archive and the .sha256 file in one folder and run:","последний":"latest","бета":"beta","контрольная сумма sha256":"sha256 checksum","копировать":"copy","скопировано":"copied","гб":"gb","мб":"mb","кб":"kb","б":"b",
"пакеты cloudos":"cloudos packages","что входит в stage 3 и что ставится через cloudpkg. список ведётся вручную, потом будет подтягиваться из рецептов cloudpkg.":"what is in stage 3 and what is installed through cloudpkg. the list is kept by hand and will later be pulled from cloudpkg recipes.",
"поиск по пакетам":"search packages","все категории":"all categories","пакет":"package","версия":"version","категория":"category","описание":"description","источник":"source","в stage 3":"in stage 3","через cloudpkg":"via cloudpkg","найдено:":"found:","ничего не найдено":"nothing found","версии указаны для cloudos 1.0 beta.":"versions are for cloudos 1.0 beta.",
"железо cloudos":"cloudos hardware","на чём cloudos уже проверен и форма, чтобы добавить своё.":"what cloudos has been tested on, and a form to add your own.","проверено":"tested","процессор":"cpu","видеокарта":"gpu","диск":"disk","режим загрузки":"boot mode","результат":"result","работает":"works","работает частично":"works partly","не работает":"does not work","добавить своё железо":"add your hardware","тип диска":"disk type","виртуальная машина":"virtual machine","комментарий":"comment","открыть на github":"open on github","откроется страница нового issue на github с заполненным текстом. нужен аккаунт github.":"a new github issue page will open with the text filled in. a github account is required.","список ведётся вручную, добавляй своё через форму ниже.":"the list is kept by hand, add yours with the form below.",
"прогресс":"progress","пройдено":"completed","отметить как пройденную":"mark as done","пройдена":"done","ссылка на раздел":"link to section","назад":"back","дальше":"next","вперёд":"forward","глава":"chapter","↑ ↓ выбрать":"↑ ↓ select","enter открыть":"enter to open","esc закрыть":"esc to close",
"значения подставляются во все команды справочника. пустое поле оставляет значение по умолчанию.":"the values are put into all handbook commands. an empty field keeps the default.","диск":"disk","имя диска":"disk name","uuid корня":"root uuid","uuid /boot":"/boot uuid","uuid esp":"esp uuid","версия ядра":"kernel version","часовой пояс":"time zone","применить":"apply","сбросить":"reset","закрыть":"close",
"диагностика ошибки":"error diagnosis","вставь текст ошибки, страница найдёт подходящую запись.":"paste the error text and the page will find the matching entry.","вставь текст ошибки":"paste the error text","похожие записи":"similar entries","открыть":"open","ничего похожего не нашлось. посмотри главу 14 целиком или спроси на форуме.":"nothing similar found. read chapter 14 in full or ask on the forum.",
"ошибка":"error","не загрузился supabase.js, обнови страницу":"supabase.js did not load, refresh the page","подтверди, что ты человек":"confirm you are human","отмена":"cancel","отменено":"cancelled","капча не прошла, обнови страницу":"captcha failed, refresh the page",
"вопрос":"question","баг":"bug","предложение":"suggestion","обсуждение":"discussion","решено":"solved","ветеран":"veteran","опытный":"experienced","свой":"regular","участник":"member","новичок":"newcomer","удалён":"deleted","навсегда":"forever",
"ваш аккаунт заблокирован:":"your account is blocked:","вы в муте:":"you are muted:","онлайн":"online","участников:":"members:","гостей:":"guests:","профиль":"profile","закладки":"bookmarks","управление":"management","мут до":"muted until","войти:":"sign in:","анонимно":"anonymously","войти":"sign in","регистрация":"sign up",
"предложения, вопросы и обсуждение cloudos.":"suggestions, questions and discussion of cloudos.","тем:":"threads:","разделов пока нет":"no boards yet","новая тема":"new thread","без префикса":"no prefix","добавить опрос":"add a poll","можно выбрать несколько":"multiple choice allowed","создать тему":"create thread","закреплено":"pinned","закрыто":"closed","ответов:":"replies:","тем пока нет":"no threads yet",
"для опроса нужен вопрос и от 2 до 10 вариантов":"a poll needs a question and 2 to 10 options","не удалось создать тему:":"could not create the thread:","не удалось создать сообщение:":"could not create the message:","тема создана, но опрос не создался:":"thread created, but the poll was not:",
"комментировать":"comment","изменить":"edit","удалить":"delete","убрать из закладок":"remove bookmark","в закладки":"bookmark","цитата":"quote","пожаловаться":"report","открепить":"unpin","закрепить":"pin","закрыть":"close","удалить тему":"delete thread","отписаться от темы":"unsubscribe from thread","подписаться на тему":"subscribe to thread","убрать тему из закладок":"remove thread bookmark","снять отметку «решено»":"unmark as solved","отметить решённой":"mark as solved","· изменено":"· edited","тема закрыта, отвечать нельзя.":"the thread is closed, replies are disabled.","ответить":"reply","ответ":"reply",
"не удалось сжать картинку":"could not compress the image","это не картинка":"this is not an image","войди, чтобы видеть уведомления.":"sign in to see notifications.","уведомления недоступны":"notifications unavailable","администрация":"administration","(причина:":"(reason:","ответил в вашей теме":"replied in your thread","прокомментировал ваше сообщение":"commented on your message","упомянул вас":"mentioned you","ответил в теме, на которую вы подписаны":"replied in a thread you follow","оценил ваше сообщение":"liked your message","написал в вашем профиле":"wrote on your profile","вам выдана роль «":"you were given the role «","ваша роль снята":"your role was removed","вы назначены администратором":"you were made an administrator","права администратора сняты":"administrator rights were removed","ваши права изменены":"your permissions were changed","вы замучены до":"you are muted until","мут снят":"mute lifted","вы забанены до":"you are banned until","бан снят":"ban lifted","прочитать все":"mark all read","очистить":"clear","уведомлений пока нет":"no notifications yet",
"облако":"cloud","рассвет":"dawn","мята":"mint","лаванда":"lavender","сумрак":"dusk","лес":"forest","ночь":"night","уголь":"coal","тема":"theme","светлая":"light","серая":"gray",
"войди, чтобы видеть закладки.":"sign in to see bookmarks.","закладки недоступны":"bookmarks unavailable","сообщение":"message","закладок пока нет":"no bookmarks yet","[картинка]":"[image]","картинка":"image","(картинки доступны только участникам с аккаунтом, не анонимам)":"(images are for members with an account, not anonymous users)","выбери картинку":"choose an image","один вариант":"single choice","· голосов:":"· votes:",
"войди, чтобы писать сообщения.":"sign in to write messages.","сообщения недоступны":"messages unavailable","чтобы написать участнику, открой его профиль и нажми «сообщения».":"to write to a member, open their profile and press «messages».","вы:":"you:","новых:":"new:","диалогов пока нет":"no conversations yet","такого участника нет.":"there is no such member.","отправить":"send","сообщений пока нет":"no messages yet",
"сменить имя":"change name","имя можно сменить через":"you can change the name in","дн.":"d.","о себе":"about me","статус (эмодзи или пара слов)":"status (emoji or a few words)","градиент ника":"name gradient","предпросмотр:":"preview:","аватар (файл)":"avatar (file)","баннер (файл)":"banner (file)","убрать аватар":"remove avatar","сохранить":"save","без роли":"no role","комментариев пока нет":"no comments yet","выдать значок":"give a badge","админ":"admin","бан до":"banned until","пока ничего о себе не написал.":"has not written anything about themselves yet.","сообщений":"messages","рейтинг ·":"rating ·","на форуме с":"on the forum since","изменить профиль":"edit profile","выйти":"sign out","комментарии":"comments","комментарии недоступны":"comments unavailable","участники":"members","темы":"threads","разделы":"boards",
"загрузка":"loading","запуск":"starting","аккаунт заблокирован":"account blocked","введи email и пароль от 6 символов":"enter an email and a password of 6+ characters","аккаунт создан, подтверди почту по ссылке из письма и потом войди":"account created, confirm your email via the link and then sign in","новое имя (2-24 символа). менять можно раз в 7 дней":"new name (2-24 characters). it can be changed once every 7 days","изменить сообщение":"edit message","удалить сообщение?":"delete the message?","удалить тему целиком?":"delete the whole thread?","причина жалобы (3-300 символов)":"report reason (3-300 characters)","вы уже жаловались на это сообщение":"you already reported this message","жалоба отправлена":"report sent","этот значок уже выдан":"this badge is already given","удалить комментарий?":"delete the comment?","удалить все уведомления?":"delete all notifications?",
"реакция":"reaction","история правок":"edit history","по активности":"by activity","сначала новые":"newest first","по числу ответов":"by replies","без ответов":"unanswered","решённые":"solved","тем нет":"no threads","поиск по темам, сообщениям и участникам":"search threads, messages and members","найти":"find","введи минимум два символа":"enter at least two characters","пусто":"empty","прошлые версии, от новых к старым":"previous versions, newest first","правок нет":"no edits","изменить теги":"edit tags","добавить теги":"add tags","ссылка":"link","отписаться от раздела":"unsubscribe from board","подписаться на раздел":"subscribe to board","топ участников":"top members","по рейтингу, как в профиле":"by rating, as in the profile","участников пока нет":"no members yet","пока ни у кого нет рейтинга":"nobody has a rating yet","рейтинг:":"rating:","тем с таким тегом нет":"no threads with this tag","показать полностью":"show more","ссылка на сообщение":"link to the message","теги через запятую, до 5 штук":"tags separated by commas, up to 5","свернуть":"collapse","эмодзи":"emoji","стикеры":"stickers","показать":"show","сообщение скрыто":"message hidden",
"настройки сайта":"site settings","шестерёнка в шапке: тема, язык, акцентный цвет с градиентом и градиент фона.":"the gear in the header: theme, language, accent color with gradient and background gradient.","справочник: удобства":"handbook: conveniences","прогресс по главам, подстановка своих значений в команды и диагностика ошибок.":"chapter progress, putting your own values into commands and error diagnosis.","пакеты и железо":"packages and hardware","список пакетов stage 3 и cloudpkg и таблица проверенного железа с формой для своих результатов.":"the list of stage 3 and cloudpkg packages and a table of tested hardware with a form for your results.","английская версия справочника":"english handbook","полный перевод справочника на английский.":"a full english translation of the handbook.","релизов":"releases","форуме":"the forum","список":"list of","пакетов":"packages","и проверенное":"and tested","смотри на отдельных страницах.":"see the separate pages.","выдаётся вручную":"given manually","условие":"condition","за число сообщений":"for a number of messages","за число лайков":"for a number of likes","за число тем":"for a number of threads","за число решённых тем":"for a number of solved threads","за дни на форуме":"for days on the forum","сколько":"how many",
"минимальный linux, который ты собираешь сам":"a minimal linux that you build yourself","cloudos это независимая система на базе lfs: glibc, openrc и ванильное ядро. после установки в ней только консоль и root, всё остальное ты добавляешь сам из исходников.":"cloudos is an independent system based on lfs: glibc, openrc and a vanilla kernel. after installation it has only a console and root, everything else you add yourself from source.","читать справочник":"read the handbook","скачать stage 3":"download stage 3","x86_64, uefi и bios, ext4 и btrfs":"x86_64, uefi and bios, ext4 and btrfs","из чего состоит":"what it is made of","собрана с нуля":"built from scratch","база lfs 12.4 с glibc. никаких готовых бинарников чужих дистрибутивов.":"lfs 12.4 base with glibc. no prebuilt binaries from other distributions.","простая система инициализации и служб, без systemd.":"a simple init and service system, without systemd.","ванильное ядро":"vanilla kernel","ты сам настраиваешь ядро через menuconfig под своё железо.":"you configure the kernel yourself through menuconfig for your hardware.","быстрый загрузчик для uefi и bios, настраивается одним файлом.":"a fast bootloader for uefi and bios, configured with a single file.","на выбор, с поддержкой подтомов и снимков.":"your choice, with subvolume and snapshot support.","пакеты только из исходников, рецепты основаны на gentoo.":"packages only from source, recipes are based on gentoo.","установка в восемь шагов":"installation in eight steps","установка ручная, как в gentoo, без мастеров. каждый шаг подробно описан в справочнике.":"installation is manual, like in gentoo, without wizards. each step is described in detail in the handbook.","подготовка":"preparation","live iso, сеть, время":"live iso, network, time","разметка и файловые системы":"partitioning and filesystems","скачать и распаковать":"download and unpack","chroot":"chroot","вход в новую систему":"entering the new system","menuconfig и сборка":"menuconfig and build","ядро":"kernel","загрузчик":"bootloader","initramfs, fstab, limine":"initramfs, fstab, limine","завершение":"finishing","пароль и службы":"password and services","первая загрузка":"first boot","пользователь, имя, сеть, swap":"user, name, network, swap","как это выглядит":"what it looks like","терминал":"terminal","что внутри":"what is inside","чего нет":"what is missing","opendoas вместо sudo":"opendoas instead of sudo","графики и окружений":"graphics and desktop environments","man-страниц, есть справочник":"man pages, there is a handbook","ssh-сервера и фаервола":"an ssh server and a firewall","arm, только x86_64":"arm, only x86_64","установщика с мастерами":"an installer with wizards","полная установка, ошибки и шпаргалка":"full install, errors and a cheat sheet","что готово и что в планах":"what is done and what is planned","вопросы и обсуждение":"questions and discussion","stage 3 и контрольные суммы":"stage 3 and checksums","что входит в stage 3 и cloudpkg":"what is in stage 3 and cloudpkg","на чём проверено, добавь своё":"what it was tested on, add yours",
"новые сообщения":"new messages","игнорировать":"ignore","не игнорировать":"stop ignoring","игнорируется":"ignored","подсветка":"highlight"
};
if(window.I18N_EXTRA)for(var k in window.I18N_EXTRA)D[k]=window.I18N_EXTRA[k];
var RE=null;
function rebuild(){
  var ks=Object.keys(D).filter(function(x){return x.length>1}).sort(function(a,b){return b.length-a.length});
  RE=ks.length?new RegExp('(?<![а-яёa-z0-9])('+ks.map(function(x){return x.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&')}).join('|')+')(?![а-яё])','g'):null;
}
rebuild();
var CY=/[а-яё]/i;
var SKIP='script,style,pre,code,textarea,.txt,.bio,.dmm,.un,.relbody,.trow strong,.sxr,[data-noi]';
var translated=false,obs=null,title0=null;
function lang(){return window.CloudTheme?window.CloudTheme.getLang():'ru'}
function conv(s){
  if(!CY.test(s))return null;
  var m=s.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2].replace(/\s+/g,' ');
  if(!core)return null;
  var r=D[core];
  if(r===undefined){
    r=RE?core.replace(RE,function(x){var v=D[x];return v===undefined?x:v}):core;
    if(CY.test(r))return null;
  }
  return m[1]+r+m[3];
}
function txt(n){
  var p=n.parentNode;
  if(!p||p.nodeType!==1)return;
  var c=p.closest&&p.closest(SKIP);
  if(c)return;
  var r=conv(n.data);
  if(r!==null&&r!==n.data){n.data=r;translated=true}
}
var ATT=['placeholder','title','aria-label'];
function attrs(el){
  if(el.closest&&el.closest('.un'))return;
  for(var i=0;i<ATT.length;i++){
    var v=el.getAttribute&&el.getAttribute(ATT[i]);
    if(v){var r=conv(v);if(r!==null&&r!==v){el.setAttribute(ATT[i],r);translated=true}}
  }
}
function run(root){
  if(!root)return;
  if(root.nodeType===3){txt(root);return}
  if(root.nodeType!==1)return;
  var t=root.tagName;
  if(t==='SCRIPT'||t==='STYLE')return;
  attrs(root);
  [].forEach.call(root.querySelectorAll('[placeholder],[title],[aria-label]'),attrs);
  var w=d.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while((n=w.nextNode()))list.push(n);
  list.forEach(txt);
}
function startObs(){
  if(obs||!window.MutationObserver)return;
  obs=new MutationObserver(function(ms){
    ms.forEach(function(m){[].forEach.call(m.addedNodes,run)});
  });
  obs.observe(d.body,{childList:true,subtree:true});
}
function pageLang(){return h.getAttribute('lang')==='en'?'en':'ru'}
function alt(l){var a=d.querySelector('link[rel="alternate"][data-l="'+l+'"]');return a?a.getAttribute('href'):null}
function apply(){
  var want=lang(),a=alt(want);
  if(a&&pageLang()!==want){location.replace(a+location.hash);return}
  if(want==='en'){
    if(title0===null)title0=d.title;
    var tt=conv(title0);if(tt)d.title=tt;
    run(d.body);
    startObs();
  }else if(want==='ru'&&translated){
    location.reload();
  }
}
window.I18N={add:function(o){for(var k in o)D[k]=o[k];rebuild();if(lang()==='en'&&pageLang()==='ru')run(d.body)},t:function(s){var r=conv(s);return lang()==='en'&&r!==null?r:s}};
window.addEventListener('cloudlang',apply);
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',apply);else apply();
})();
