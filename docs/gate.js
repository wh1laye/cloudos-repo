(function(){
  var KEY="0x4AAAAAAFZBzrWgvn-Lz9Eb";
  var HOURS=6;
  if(!KEY)return;
  try{
    var t=+localStorage.getItem('cg');
    if(t&&Date.now()-t<HOURS*36e5)return;
  }catch(e){}
  var d=document,h=d.documentElement;
  h.classList.add('gl');
  var st=d.createElement('style');
  st.textContent='.gl body>*:not(.gate){visibility:hidden}.gl{overflow:hidden}.gate{position:fixed;inset:0;z-index:9999;background:#f4f8fd;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif;color:#1c2b44}.gate div.b{background:#fff;border:1px solid #d6e3f3;border-radius:14px;padding:26px 28px;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;text-align:center}.gate svg{width:56px;height:36px}.gate p{margin:0;font-weight:600}.gate small{color:#6b7f99}html[data-theme=gray] .gate{background:#202226;color:#e4e7eb}html[data-theme=gray] .gate div.b{background:#272a2f;border-color:#3b3f46}html[data-theme=gray] .gate small{color:#9ba4af}';
  d.head.appendChild(st);
  function ok(){
    try{localStorage.setItem('cg',String(Date.now()))}catch(e){}
    h.classList.remove('gl');
    var g=d.querySelector('.gate');
    if(g)g.remove();
  }
  function build(){
    var g=d.createElement('div');
    g.className='gate';
    g.innerHTML='<div class="b"><svg viewBox="0 0 64 40" aria-hidden="true"><path d="M17 34a11 11 0 0 1-1-22 14 14 0 0 1 27-3 12 12 0 0 1 4 25z" fill="#cfe3f8" stroke="#3a5ea8" stroke-width="2.5" stroke-linejoin="round"/></svg><p>проверка перед входом</p><div id="gw"></div><small>это занимает пару секунд</small></div>';
    d.body.appendChild(g);
    var s=d.createElement('script');
    s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async=true;
    s.onload=function(){
      window.turnstile.render('#gw',{sitekey:KEY,callback:ok});
    };
    d.head.appendChild(s);
  }
  if(d.body)build();
  else d.addEventListener('DOMContentLoaded',build);
})();
