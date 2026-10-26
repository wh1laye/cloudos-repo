(function(){
var W=window,d=document;
function cur(){try{return W.CloudTheme?W.CloudTheme.getLang():'ru'}catch(e){return 'ru'}}
W.tr=function(s){try{return W.I18N?W.I18N.t(s):s}catch(e){return s}};
W.LOC=function(){return cur()==='en'?'en-GB':'ru'};
W.nf=function(n){try{return Number(n).toLocaleString(W.LOC())}catch(e){return String(n)}};
W.pl=function(n,r,e){
  n=Math.abs(+n)||0;
  if(cur()==='en')return n===1?e[0]:e[1];
  var a=n%100,b=n%10;
  return (a>10&&a<20)?r[2]:b===1?r[0]:(b>1&&b<5)?r[1]:r[2];
};
var X={
"ошибка входа:":"sign-in error:",
". причина:":". reason:",
", гостей:":", guests:",
"пароль":"password",
"поиск по темам":"search threads",
"заголовок":"title",
"текст":"text",
"вопрос опроса":"poll question",
"варианты, каждый с новой строки (от 2 до 10)":"options, one per line (2 to 10)",
"/ уведомления":"/ notifications",
"/ настройки":"/ settings",
"градиент сайта":"site gradient",
"предпросмотр":"preview",
"пресеты":"presets",
"градиент и тема сохраняются в аккаунте и действуют на форуме, в справочнике и на релизах.":"the gradient and theme are saved to your account and apply on the forum, in the handbook and on releases.",
"/ закладки":"/ bookmarks",
"/ жалобы":"/ reports",
"жалоба от":"report from",
"открыть тему":"open thread",
"описание (необязательно)":"description (optional)",
"/ участник":"/ member",
"написать участнику":"write to the member",
"роль «":"role «",
"до":"until",
"поиск по нику":"search by name",
"поиск по названию темы":"search by thread title",
"название раздела":"board name",
"текст объявления":"announcement text",
"у тебя нет права":"you do not have the permission",
". запусти forum_v3.sql в supabase.":". run forum_v3.sql in supabase.",
"найти участника по нику":"find a member by name",
"причина":"reason",
"история":"history",
"/ поиск":"/ search",
"черновик восстановлен":"draft restored",
"черновик сохранён":"draft saved",
"создал тему «":"created the thread «",
"» в разделе «":"» in the board «",
"/ топ участников":"/ top members",
"/ теги":"/ tags",
"закрепить":"pin",
"популярное за неделю":"popular this week",
"сообщений за неделю:":"posts this week:",
"скачать мои данные":"download my data",
"собираю данные":"collecting data",
"полезно":"helpful",
"отметить как полезное":"mark as helpful",
"открепить":"unpin",
"картинка":"image",
"стикер":"sticker",
"можно закрепить не больше 5 сообщений":"you can pin up to 5 messages",
"теги через запятую, до 5 (необязательно)":"tags separated by commas, up to 5 (optional)",
"проверь, что в папке forum лежат app.js, forum2.js, forum3.js, config.js, supabase.js, 591.supabase.js, forum.css":"check that the forum folder contains app.js, forum2.js, forum3.js, config.js, supabase.js, 591.supabase.js, forum.css"
};
if(W.I18N)W.I18N.add(X);
var NAMES={
"предложения, вопросы и обсуждение cloudos.":"suggestions, questions and discussion of cloudos."
};
if(W.I18N)W.I18N.add(NAMES);
})();
