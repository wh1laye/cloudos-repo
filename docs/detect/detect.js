(function(){
var d=document;
var CMD='{ lsblk -f; lspci -nn; lscpu | grep "Model name"; ls /sys/firmware/efi >/dev/null 2>&1 && echo "boot: uefi" || echo "boot: bios"; } 2>&1';
var FS=/^(ext[234]|btrfs|vfat|ntfs|swap|xfs|exfat|crypto_LUKS|iso9660|squashfs|LVM2_member|f2fs)$/;
var DISK=/^(sd[a-z]+|vd[a-z]+|xvd[a-z]+|nvme[0-9]+n[0-9]+|mmcblk[0-9]+)$/;
var PART=/^(sd[a-z]+[0-9]+|vd[a-z]+[0-9]+|xvd[a-z]+[0-9]+|nvme[0-9]+n[0-9]+p[0-9]+|mmcblk[0-9]+p[0-9]+)$/;
function tr(s){return window.I18N&&window.I18N.t?window.I18N.t(s):s}
function el(t,c,x){var e=d.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function parse(text){
  var R={cpu:'',boot:'',disks:[],gpu:[],net:[],sto:[],virt:'hw',notes:[]},lines=text.split('\n'),i,m,cur=null,low=text.toLowerCase();
  for(i=0;i<lines.length;i++){
    var ln=lines[i].replace(/\r/g,'');
    if((m=ln.match(/Model name:\s*(.+)$/)))R.cpu=m[1].trim();
    else if((m=ln.match(/^boot:\s*(uefi|bios)/)))R.boot=m[1];
    else if((m=ln.match(/^[0-9a-f]{2,4}:[0-9a-f]{2}\.[0-9a-f]\s+([^:\[]+?)(?:\s*\[[0-9a-f]{4}\])?:\s*(.+)$/i))){
      var cls=m[1].toLowerCase(),desc=m[2].replace(/\s*\[[0-9a-f]{4}:[0-9a-f]{4}\]/,'').replace(/\s*\(rev [0-9a-f]+\)/,'').trim();
      if(/vga|3d controller|display controller/.test(cls))R.gpu.push(desc);
      else if(/ethernet controller/.test(cls))R.net.push({t:'e',d:desc});
      else if(/network controller/.test(cls))R.net.push({t:'w',d:desc});
      else if(/sata|ide interface|non-volatile|scsi|serial attached|raid|mass storage/.test(cls))R.sto.push({c:cls,d:desc});
    }else{
      var s=ln.replace(/^[\s│├└─|`'\-]+/,'');
      var tk=s.split(/\s+/),nm=tk[0];
      if(DISK.test(nm)){
        cur={name:nm,size:'',parts:[]};
        var sz=tk.filter(function(x){return /^[0-9]+(\.[0-9]+)?[KMGT]$/.test(x)})[0];
        if(sz)cur.size=sz;
        R.disks.push(cur);
      }else if(cur&&PART.test(nm)){
        var fs=tk.filter(function(x){return FS.test(x)})[0]||'',sz2=tk.filter(function(x){return /^[0-9]+(\.[0-9]+)?[KMGT]$/.test(x)})[0]||'';
        cur.parts.push({name:nm,fs:fs,size:sz2});
      }
    }
  }
  if(/vmware/i.test(low))R.virt='vmware';else if(/virtualbox|innotek/.test(low))R.virt='vbox';else if(/virtio|qemu|red hat, inc\./.test(low))R.virt='qemu';
  return R;
}
function recommend(R){
  var c=/amd|ryzen|epyc|athlon/i.test(R.cpu)?'amd':(/intel|xeon|core|pentium|celeron/i.test(R.cpu)?'intel':'amd');
  var s=[],n=[],f=['ext4'],notes=[],g='simple';
  R.sto.forEach(function(x){
    var k=null,dsc=x.d.toLowerCase();
    if(/non-volatile/.test(x.c))k='nvme';
    else if(/sata/.test(x.c))k='sata';
    else if(/ide/.test(x.c))k='ide';
    else if(/virtio/.test(dsc))k='virtio';
    else if(/pvscsi|vmware/.test(dsc))k='vmpv';
    else if(/lsi|broadcom|symbios|fusion/.test(dsc))k='vmlsi';
    else if(/raid/.test(x.c))notes.push('raid-контроллер: '+x.d+'. в режиме intel rst или vmd диск может не появиться, переключи контроллер в ahci в настройках прошивки.');
    if(k&&s.indexOf(k)<0)s.push(k);
  });
  R.disks.forEach(function(x){
    var k=/^nvme/.test(x.name)?'nvme':(/^vd/.test(x.name)?'virtio':null);
    if(k&&s.indexOf(k)<0)s.push(k);
  });
  R.net.forEach(function(x){
    var k=null,t=x.d.toLowerCase();
    if(x.t==='w'){
      if(/intel/.test(t))k='iwlwifi';else if(/realtek/.test(t))k='rtw';else notes.push('wifi: '+x.d+'. помощник не знает драйвер, ищи в make menuconfig: device drivers, network device support, wireless lan.');
    }else{
      if(/virtio/.test(t))k='virtio';
      else if(/vmxnet3/.test(t))k='vmxnet3';
      else if(/82545|82540|82543|pro\/1000 mt|e1000\b/.test(t))k='e1000';
      else if(/realtek|rtl8/.test(t))k='r8169';
      else if(/i225|i226|igc/.test(t))k='igc';
      else if(/i210|i211|i350|82576|82580|igb/.test(t))k='igb';
      else if(/intel/.test(t))k='e1000e';
      else notes.push('сетевая карта: '+x.d+'. драйвер надо найти в make menuconfig.');
    }
    if(k&&n.indexOf(k)<0)n.push(k);
  });
  if(R.virt==='vmware')g='vmware';else if(R.virt==='vbox')g='vbox';else if(R.virt==='qemu')g='virtio';
  if(R.virt!=='hw'&&R.gpu.length===0)g=R.virt==='vmware'?'vmware':g;
  R.disks.forEach(function(x){x.parts.forEach(function(p){if(p.fs==='btrfs'&&f.indexOf('btrfs')<0)f.push('btrfs')})});
  return {c:c,b:R.boot||'uefi',s:s.length?s:['sata'],f:f,n:n,g:g,v:R.virt,notes:notes};
}
function row(parent,k,v){var r=el('div','dr'),a=el('span','dk',tr(k)),b=el('span','dv',v);r.appendChild(a);r.appendChild(b);parent.appendChild(r)}
function show(text){
  var out=d.getElementById('res'),R=parse(text),X=recommend(R),i;
  out.textContent='';
  if(!R.cpu&&!R.disks.length&&!R.gpu.length&&!R.net.length){out.appendChild(el('div','warn','не удалось ничего распознать: вставь вывод команды целиком'));return}
  var card=el('div','dcard');
  card.appendChild(el('h3','',tr('что нашлось')));
  if(R.cpu)row(card,'процессор',R.cpu);
  row(card,'режим загрузки',(R.boot||tr('неизвестно')).toUpperCase());
  row(card,'среда',R.virt==='hw'?tr('реальное железо'):R.virt);
  R.gpu.forEach(function(x){row(card,'видео',x)});
  R.net.forEach(function(x){row(card,x.t==='w'?'wifi':'сеть',x.d)});
  R.sto.forEach(function(x){row(card,'контроллер диска',x.d)});
  out.appendChild(card);
  if(R.disks.length){
    var dc=el('div','dcard');dc.appendChild(el('h3','',tr('диски')));
    R.disks.forEach(function(x){
      var r=el('div','dd'),h=el('div','dn'),nm=el('b','', '/dev/'+x.name),a=el('a','btn');
      h.appendChild(nm);if(x.size)h.appendChild(el('span','dm',' '+x.size));
      a.href='../wizard/#d='+encodeURIComponent('/dev/'+x.name)+(R.boot?'&m='+R.boot:'');a.textContent=tr('использовать в мастере');
      h.appendChild(a);r.appendChild(h);
      if(x.parts.length)r.appendChild(el('div','dp',x.parts.map(function(p){return p.name+(p.fs?' '+p.fs:'')+(p.size?' '+p.size:'')}).join('  ·  ')));
      dc.appendChild(r);
    });
    dc.appendChild(el('p','mu',tr('в мастере выбирай чистый диск: все данные на нём будут стёрты.')));
    out.appendChild(dc);
  }
  var kc=el('div','dcard');kc.appendChild(el('h3','',tr('для настройки ядра')));
  var h='c='+X.c+'&b='+X.b+'&s='+X.s.join(',')+'&f='+X.f.join(',')+'&n='+X.n.join(',')+'&g='+X.g+'&v='+X.v;
  var summ=[X.c,X.b,X.s.join('+'),X.n.join('+')||'-'].join(', ');
  kc.appendChild(el('p','',summ));
  var a2=el('a','btn p');a2.href='../kernel/#'+h;a2.textContent=tr('открыть в помощнике по ядру');kc.appendChild(a2);
  X.notes.forEach(function(n){kc.appendChild(el('p','mu',n))});
  if(R.virt==='hw')kc.appendChild(el('p','mu',tr('для консольной системы хватает простой графики (efifb), драйвер видеокарты нужен только для графической среды.')));
  out.appendChild(kc);
  var hc=el('div','dcard');hc.appendChild(el('h3','',tr('в таблицу железа')));
  var gpu=R.gpu[0]||'-',cpu=R.cpu||'-',dk=X.s.join('+')+(R.disks[0]?' ('+R.disks[0].name+')':'');
  var title='железо: '+cpu+(R.gpu[0]?' + '+gpu:'');
  var body='процессор: '+cpu+'\nвидеокарта: '+gpu+'\nтип диска: '+dk+'\nрежим загрузки: '+(R.boot||'-')+'\nрезультат: \n\nкомментарий:\n-\n';
  hc.appendChild(el('p','mu',tr('получилось запустить cloudos? расскажи, это поможет другим.')));
  var a3=el('a','btn');a3.target='_blank';a3.rel='noopener';a3.textContent=tr('создать запись на github');
  a3.href='https://github.com/wh1laye/cloudos-repo/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
  hc.appendChild(a3);out.appendChild(hc);
}
var CP='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
var cb=d.getElementById('cmdbtn');
d.getElementById('cmdpre').textContent=CMD;
cb.innerHTML=CP;
cb.addEventListener('click',function(){
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(CMD).then(function(){cb.classList.add('ok');setTimeout(function(){cb.classList.remove('ok')},1200)},function(){});
});
d.getElementById('go').addEventListener('click',function(){show(d.getElementById('inp').value)});
d.getElementById('inp').addEventListener('input',function(){if(this.value.length>40)show(this.value)});
window.__detect={parse:parse,recommend:recommend};
})();
