if(window.top!==window.self){document.documentElement.style.display='none';try{window.top.location=window.self.location}catch(e){}}
window.addEventListener('error',function(e){
  var a=document.getElementById('app');
  if(!a)return;
  var t=e.target&&(e.target.src||e.target.href);
  a.innerHTML='<div class="warn"><b>ошибка загрузки</b>'+(t?'не загрузился файл: '+t:(e.message||'неизвестная ошибка'))+'</div>';
},true);
setTimeout(function(){
  var b=document.getElementById('boot');
  if(b)b.outerHTML='<div class="warn"><b>форум не запустился</b>проверь, что в папке forum лежат app.js, forum2.js, forum3.js, config.js, supabase.js, 591.supabase.js, forum.css</div>';
},5000);
