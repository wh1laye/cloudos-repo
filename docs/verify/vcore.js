(function(root){
'use strict';
function sqrtFrac32(p){return Math.floor((Math.sqrt(p)%1)*4294967296)>>>0}
function cbrtFrac32(p){return Math.floor((Math.cbrt(p)%1)*4294967296)>>>0}
var PR=[],n=2;
while(PR.length<64){var q=true;for(var i=0;i<PR.length;i++){if(n%PR[i]===0){q=false;break}}if(q)PR.push(n);n++}
var K256=new Uint32Array(64),H256=new Uint32Array(8);
for(var a=0;a<64;a++)K256[a]=cbrtFrac32(PR[a]);
for(var b=0;b<8;b++)H256[b]=sqrtFrac32(PR[b]);

function Sha256(){
  this.h=new Uint32Array(H256);
  this.buf=new Uint8Array(64);
  this.bl=0;
  this.len=0;
  this.w=new Uint32Array(64);
}
Sha256.prototype.block=function(d,o){
  var w=this.w,h=this.h,i,s0,s1,t1,t2,a,b,c,e,f,g,hh,dd;
  for(i=0;i<16;i++,o+=4)w[i]=((d[o]<<24)|(d[o+1]<<16)|(d[o+2]<<8)|d[o+3])>>>0;
  for(i=16;i<64;i++){
    s0=((w[i-15]>>>7)|(w[i-15]<<25))^((w[i-15]>>>18)|(w[i-15]<<14))^(w[i-15]>>>3);
    s1=((w[i-2]>>>17)|(w[i-2]<<15))^((w[i-2]>>>19)|(w[i-2]<<13))^(w[i-2]>>>10);
    w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
  }
  a=h[0];b=h[1];c=h[2];dd=h[3];e=h[4];f=h[5];g=h[6];hh=h[7];
  for(i=0;i<64;i++){
    s1=((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));
    t1=(hh+s1+((e&f)^(~e&g))+K256[i]+w[i])>>>0;
    s0=((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));
    t2=(s0+((a&b)^(a&c)^(b&c)))>>>0;
    hh=g;g=f;f=e;e=(dd+t1)>>>0;dd=c;c=b;b=a;a=(t1+t2)>>>0;
  }
  h[0]=(h[0]+a)>>>0;h[1]=(h[1]+b)>>>0;h[2]=(h[2]+c)>>>0;h[3]=(h[3]+dd)>>>0;
  h[4]=(h[4]+e)>>>0;h[5]=(h[5]+f)>>>0;h[6]=(h[6]+g)>>>0;h[7]=(h[7]+hh)>>>0;
};
Sha256.prototype.update=function(d){
  var i=0,n=d.length;
  this.len+=n;
  if(this.bl){
    while(i<n&&this.bl<64)this.buf[this.bl++]=d[i++];
    if(this.bl<64)return;
    this.block(this.buf,0);this.bl=0;
  }
  for(;i+64<=n;i+=64)this.block(d,i);
  while(i<n)this.buf[this.bl++]=d[i++];
};
Sha256.prototype.digest=function(){
  var bits=this.len*8,p=new Uint8Array((this.bl<56?64:128)-this.bl),i,hi=Math.floor(bits/4294967296),lo=bits>>>0;
  p[0]=0x80;
  var e=p.length;
  p[e-8]=hi>>>24;p[e-7]=hi>>>16;p[e-6]=hi>>>8;p[e-5]=hi;
  p[e-4]=lo>>>24;p[e-3]=lo>>>16;p[e-2]=lo>>>8;p[e-1]=lo;
  var keep=this.len;
  this.update(p);
  this.len=keep;
  var o=new Uint8Array(32);
  for(i=0;i<8;i++){o[i*4]=this.h[i]>>>24;o[i*4+1]=this.h[i]>>>16;o[i*4+2]=this.h[i]>>>8;o[i*4+3]=this.h[i]}
  return o;
};

function isqrt(v){
  if(v<2n)return v;
  var x=1n<<BigInt((v.toString(2).length>>1)+1),y;
  for(;;){y=(x+v/x)>>1n;if(y>=x)return x;x=y}
}
var IV=new Uint32Array(16);
(function(){
  for(var i=0;i<8;i++){
    var f=isqrt(BigInt(PR[i])<<128n)&0xffffffffffffffffn;
    IV[i*2]=Number(f&0xffffffffn);
    IV[i*2+1]=Number(f>>32n);
  }
})();
var SIG=[
[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
[14,10,4,8,9,15,13,6,1,12,0,2,11,7,5,3],
[11,8,12,0,5,2,15,13,10,14,3,6,7,1,9,4],
[7,9,3,1,13,12,11,14,2,6,5,10,4,0,15,8],
[9,0,5,7,2,4,10,15,14,1,11,12,6,8,3,13],
[2,12,6,10,0,11,8,3,4,13,7,5,15,14,1,9],
[12,5,1,15,14,13,4,10,0,7,6,3,9,2,8,11],
[13,11,7,14,12,1,3,9,5,0,15,4,8,6,2,10],
[6,15,14,9,11,3,0,8,12,2,13,7,1,4,10,5],
[10,2,8,4,7,6,1,5,15,11,9,14,3,12,13,0]
];

function Blake2b(){
  this.h=new Uint32Array(IV.subarray(0,16));
  this.h[0]^=0x01010040;
  this.v=new Uint32Array(32);
  this.m=new Uint32Array(32);
  this.buf=new Uint8Array(128);
  this.bl=0;
  this.t=0;
}
function add3(v,a,b,xl,xh){
  var lo=v[a]+v[b]+xl,c=lo>=8589934592?2:lo>=4294967296?1:0;
  v[a+1]=(v[a+1]+v[b+1]+xh+c)>>>0;
  v[a]=lo>>>0;
}
function rot(v,i,n){
  var lo=v[i],hi=v[i+1],t;
  if(n===32){v[i]=hi;v[i+1]=lo;return}
  if(n===63){v[i]=(lo<<1)|(hi>>>31);v[i+1]=(hi<<1)|(lo>>>31);return}
  t=32-n;
  v[i]=(lo>>>n)|(hi<<t);
  v[i+1]=(hi>>>n)|(lo<<t);
}
function G(v,m,a,b,c,d,x,y){
  a*=2;b*=2;c*=2;d*=2;
  add3(v,a,b,m[x*2],m[x*2+1]);
  v[d]^=v[a];v[d+1]^=v[a+1];rot(v,d,32);
  add3(v,c,d,0,0);
  v[b]^=v[c];v[b+1]^=v[c+1];rot(v,b,24);
  add3(v,a,b,m[y*2],m[y*2+1]);
  v[d]^=v[a];v[d+1]^=v[a+1];rot(v,d,16);
  add3(v,c,d,0,0);
  v[b]^=v[c];v[b+1]^=v[c+1];rot(v,b,63);
}
Blake2b.prototype.compress=function(last){
  var v=this.v,m=this.m,h=this.h,b=this.buf,i,r,s;
  for(i=0;i<16;i++)v[i]=h[i];
  for(i=0;i<16;i++)v[16+i]=IV[i];
  v[24]^=this.t>>>0;
  v[25]^=Math.floor(this.t/4294967296)>>>0;
  if(last){v[28]=~v[28];v[29]=~v[29]}
  for(i=0;i<32;i++){var o=i*4;m[i]=(b[o]|(b[o+1]<<8)|(b[o+2]<<16)|(b[o+3]<<24))>>>0}
  for(r=0;r<12;r++){
    s=SIG[r%10];
    G(v,m,0,4,8,12,s[0],s[1]);
    G(v,m,1,5,9,13,s[2],s[3]);
    G(v,m,2,6,10,14,s[4],s[5]);
    G(v,m,3,7,11,15,s[6],s[7]);
    G(v,m,0,5,10,15,s[8],s[9]);
    G(v,m,1,6,11,12,s[10],s[11]);
    G(v,m,2,7,8,13,s[12],s[13]);
    G(v,m,3,4,9,14,s[14],s[15]);
  }
  for(i=0;i<16;i++)h[i]^=v[i]^v[i+16];
};
Blake2b.prototype.update=function(d){
  var i=0,n=d.length;
  while(i<n){
    if(this.bl===128){this.t+=128;this.compress(false);this.bl=0}
    var k=Math.min(128-this.bl,n-i);
    this.buf.set(d.subarray(i,i+k),this.bl);
    this.bl+=k;i+=k;
  }
};
Blake2b.prototype.digest=function(){
  this.t+=this.bl;
  this.buf.fill(0,this.bl);
  this.compress(true);
  var o=new Uint8Array(64),i;
  for(i=0;i<16;i++){var x=this.h[i];o[i*4]=x;o[i*4+1]=x>>>8;o[i*4+2]=x>>>16;o[i*4+3]=x>>>24}
  return o;
};

function hex(u){var s='',i;for(i=0;i<u.length;i++)s+=(u[i]<16?'0':'')+u[i].toString(16);return s}
function b64(s){
  if(typeof atob==='function'){var r=atob(s),u=new Uint8Array(r.length),i;for(i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u}
  return new Uint8Array(Buffer.from(s,'base64'));
}
function utf8(s){return typeof TextEncoder!=='undefined'?new TextEncoder().encode(s):new Uint8Array(Buffer.from(s,'utf8'))}
function eq(a,b){if(a.length!==b.length)return false;var d=0,i;for(i=0;i<a.length;i++)d|=a[i]^b[i];return d===0}
function lines(t){return String(t).replace(/\r/g,'').split('\n')}

function parsePub(t){
  var L=lines(t).filter(function(l){return l&&l.indexOf('untrusted comment:')!==0}),u;
  if(!L.length)throw new Error('pub');
  u=b64(L[0].trim());
  if(u.length!==42||u[0]!==0x45||u[1]!==0x64)throw new Error('pub');
  return {id:u.subarray(2,10),key:u.subarray(10,42)};
}
function keyIdHex(id){var s='',i;for(i=7;i>=0;i--)s+=(id[i]<16?'0':'')+id[i].toString(16);return s.toUpperCase()}
function parseSig(t){
  var L=lines(t),i=0,u,tc,gs;
  if(L[0].indexOf('untrusted comment:')!==0)throw new Error('sig');
  u=b64((L[1]||'').trim());
  if(u.length!==74||u[0]!==0x45||(u[1]!==0x44&&u[1]!==0x64))throw new Error('sig');
  if((L[2]||'').indexOf('trusted comment: ')!==0)throw new Error('sig');
  tc=L[2].slice('trusted comment: '.length);
  gs=b64((L[3]||'').trim());
  if(gs.length!==64)throw new Error('sig');
  return {hashed:u[1]===0x44,id:u.subarray(2,10),sig:u.subarray(10,74),comment:tc,global:gs};
}
async function edVerify(key,sig,msg){
  var k=await crypto.subtle.importKey('raw',key,{name:'Ed25519'},false,['verify']);
  return crypto.subtle.verify({name:'Ed25519'},k,sig,msg);
}
async function minisignCheck(pubText,sigText,digestOrMsg){
  var p=parsePub(pubText),s=parseSig(sigText);
  if(!eq(p.id,s.id))return {ok:false,why:'id'};
  if(!await edVerify(p.key,s.sig,digestOrMsg))return {ok:false,why:'sig'};
  var tc=utf8(s.comment),g=new Uint8Array(64+tc.length);
  g.set(s.sig,0);g.set(tc,64);
  if(!await edVerify(p.key,s.global,g))return {ok:false,why:'comment'};
  return {ok:true,comment:s.comment,hashed:s.hashed};
}

root.VC={Sha256:Sha256,Blake2b:Blake2b,hex:hex,parsePub:parsePub,parseSig:parseSig,keyIdHex:keyIdHex,minisignCheck:minisignCheck,eq:eq};
if(typeof module!=='undefined'&&module.exports)module.exports=root.VC;
})(typeof window!=='undefined'?window:globalThis);
