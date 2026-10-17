const EMO=['😀','😁','😂','🤣','😊','😍','😘','😎','🤔','😴','😅','😭','😡','🥳','🤯','🙃','👍','👎','👏','🙏','💪','👀','🤝','🫡','🔥','✨','⭐','💯','❤️','💙','💔','🎉','✅','❌','⚠️','❓','❗','💡','🔧','🛠️','🐛','🚀','📦','💾','🖥️','⌨️','🐧','☁️','🌐','🔒','🔑','📎','📌','📝','📅','⏳','☕','🍕','🎮','🎧','🌙','☀️','🌈','🐱'];

const STK={
  cloud:'<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(2 12)"><path d="M17 34a11 11 0 0 1-1-22 14 14 0 0 1 27-3 12 12 0 0 1 4 25z" fill="#cfe3f8" stroke="#3a5ea8" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="22" r="2.6" fill="#1c2b44"/><circle cx="36" cy="22" r="2.6" fill="#1c2b44"/><path d="M26 27q4 4 8 0" fill="none" stroke="#1c2b44" stroke-width="2.4" stroke-linecap="round"/></g></svg>',
  heart:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 55S7 40 7 23a13 13 0 0 1 25-5 13 13 0 0 1 25 5c0 17-25 32-25 32z" fill="#ec5a68" stroke="#b5303f" stroke-width="3" stroke-linejoin="round"/><path d="M16 22a7 7 0 0 1 7-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>',
  star:'<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,6 39,24 58,25 43,37 48,57 32,46 16,57 21,37 6,25 25,24" fill="#ffd24a" stroke="#c9951a" stroke-width="3" stroke-linejoin="round"/></svg>',
  check:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#3cb878" stroke="#23895a" stroke-width="3"/><path d="M19 33l9 9 17-19" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fire:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M33 5c1 11 15 17 15 33a16 16 0 0 1-32 0c0-9 5-13 8-19 2 5 4 6 6 7 1-7 1-14 3-21z" fill="#ff8a3d" stroke="#d4561a" stroke-width="3" stroke-linejoin="round"/><path d="M32 58a9 9 0 0 1-9-9c0-7 6-9 9-16 3 7 9 9 9 16a9 9 0 0 1-9 9z" fill="#ffd24a"/></svg>',
  bug:'<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#1c2b44" stroke-width="3" stroke-linecap="round" fill="none"><path d="M26 12l-5-6M38 12l5-6M19 30H7M45 30h12M20 42l-9 6M44 42l9 6M21 22l-8-5M43 22l8-5"/></g><ellipse cx="32" cy="38" rx="14" ry="18" fill="#3a5ea8" stroke="#1c2b44" stroke-width="3"/><circle cx="32" cy="17" r="9" fill="#3a5ea8" stroke="#1c2b44" stroke-width="3"/><path d="M32 22v32" stroke="#cfe3f8" stroke-width="3"/><circle cx="28.5" cy="16" r="2" fill="#fff"/><circle cx="35.5" cy="16" r="2" fill="#fff"/></svg>',
  terminal:'<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="11" width="54" height="42" rx="7" fill="#1c2b44" stroke="#3a5ea8" stroke-width="3"/><path d="M16 25l10 8-10 8" fill="none" stroke="#9cc8f2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 42h16" stroke="#9cc8f2" stroke-width="4" stroke-linecap="round"/></svg>',
  penguin:'<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="24" cy="59" rx="8" ry="3.5" fill="#ffb347"/><ellipse cx="40" cy="59" rx="8" ry="3.5" fill="#ffb347"/><ellipse cx="32" cy="34" rx="19" ry="25" fill="#1c2b44"/><ellipse cx="32" cy="39" rx="12" ry="17" fill="#fff"/><circle cx="26" cy="22" r="4" fill="#fff"/><circle cx="38" cy="22" r="4" fill="#fff"/><circle cx="26.5" cy="22.5" r="1.8" fill="#1c2b44"/><circle cx="37.5" cy="22.5" r="1.8" fill="#1c2b44"/><path d="M27 28h10l-5 6z" fill="#ffb347"/></svg>',
  rocket:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M23 42l-10 10 12-2zM41 42l10 10-12-2z" fill="#ec5a68" stroke="#b5303f" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 5c11 9 13 22 11 37H21C19 27 21 14 32 5z" fill="#cfe3f8" stroke="#3a5ea8" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="25" r="5.5" fill="#3a5ea8"/><path d="M27 46h10l-5 13z" fill="#ffb347" stroke="#d4561a" stroke-width="2" stroke-linejoin="round"/></svg>',
  cool:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="#ffd24a" stroke="#c9951a" stroke-width="3"/><rect x="11" y="24" width="18" height="12" rx="4" fill="#1c2b44"/><rect x="35" y="24" width="18" height="12" rx="4" fill="#1c2b44"/><path d="M29 28h6" stroke="#1c2b44" stroke-width="3"/><path d="M21 44q11 9 22 0" fill="none" stroke="#1c2b44" stroke-width="3" stroke-linecap="round"/></svg>'
};

function fmtBody(s){
  return esc(s).replace(/:s_([a-z]+):/g,(m,n)=>STK[n]?'<span class="stk">'+STK[n]+'</span>':m);
}

function tools(target,only){
  return '<div class="tb"'+(target?' data-for="'+target+'"':'')+'><button type="button" class="lk" data-pk="emo">эмодзи</button>'+(only?'':'<button type="button" class="lk" data-pk="stk">стикеры</button>')+'</div>';
}

function ins(el,t){
  const s=el.selectionStart==null?el.value.length:el.selectionStart;
  const e=el.selectionEnd==null?s:el.selectionEnd;
  el.value=el.value.slice(0,s)+t+el.value.slice(e);
  el.focus();
  try{el.selectionStart=el.selectionEnd=s+t.length}catch(x){}
}

document.addEventListener('click',e=>{
  const old=document.querySelector('.pop');
  const it=e.target.closest('[data-ins]');
  if(it){
    const tb=it.closest('.tb');
    const f=tb.closest('form');
    const el=tb.dataset.for?document.getElementById(tb.dataset.for):f.querySelector('textarea');
    if(el)ins(el,it.dataset.ins);
    return;
  }
  const pk=e.target.closest('[data-pk]');
  if(pk){
    const kind=pk.dataset.pk;
    const same=old&&old.dataset.k===kind&&old.parentNode===pk.parentNode;
    if(old)old.remove();
    if(same)return;
    const pop=document.createElement('div');
    pop.className='pop'+(kind==='stk'?' ps':'');
    pop.dataset.k=kind;
    pop.innerHTML=kind==='emo'
      ?EMO.map(x=>'<button type="button" data-ins="'+x+'">'+x+'</button>').join('')
      :Object.keys(STK).map(n=>'<button type="button" data-ins=" :s_'+n+': ">'+STK[n]+'</button>').join('');
    pk.parentNode.appendChild(pop);
    return;
  }
  if(old&&!e.target.closest('.pop'))old.remove();
});
