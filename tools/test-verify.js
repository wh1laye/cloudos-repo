'use strict';
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');
const VC = require(path.join(__dirname, '..', 'docs', 'verify', 'vcore.js'));

let bad = 0;
function chk(n, c) { if (!c) { bad++; console.log('!! ' + n); } else console.log('ok ' + n); }

function run(Cls, data, step) {
  const h = new Cls();
  for (let i = 0; i < data.length; i += step) h.update(data.subarray(i, Math.min(i + step, data.length)));
  return Buffer.from(h.digest()).toString('hex');
}

for (const n of [0, 1, 3, 55, 56, 63, 64, 65, 111, 112, 127, 128, 129, 255, 256, 1000, 70000, 5000000]) {
  const d = crypto.randomBytes(n);
  const s = [1, 7, 64, 100, 4096, 1 << 20];
  const e256 = crypto.createHash('sha256').update(d).digest('hex');
  const e2b = crypto.createHash('blake2b512').update(d).digest('hex');
  chk('sha256 ' + n, s.every(k => run(VC.Sha256, d, k) === e256));
  chk('blake2b ' + n, s.every(k => run(VC.Blake2b, d, k) === e2b));
}

function mk(hashed, data, comment, kp, id) {
  const msg = hashed ? crypto.createHash('blake2b512').update(data).digest() : data;
  const sig = crypto.sign(null, msg, kp.privateKey);
  const tc = Buffer.from(comment);
  const gs = crypto.sign(null, Buffer.concat([sig, tc]), kp.privateKey);
  const raw = kp.publicKey.export({ format: 'der', type: 'spki' }).subarray(12);
  const pub = 'untrusted comment: minisign public key ' + Buffer.from(id).reverse().toString('hex').toUpperCase() + '\n' +
    Buffer.concat([Buffer.from('Ed'), id, raw]).toString('base64') + '\n';
  const sg = 'untrusted comment: signature from minisign secret key\n' +
    Buffer.concat([Buffer.from(hashed ? 'ED' : 'Ed'), id, sig]).toString('base64') + '\n' +
    'trusted comment: ' + comment + '\n' + gs.toString('base64') + '\n';
  return { pub, sg };
}

async function main() {
  const data = crypto.randomBytes(300000);
  const kp = crypto.generateKeyPairSync('ed25519');
  const id = crypto.randomBytes(8);
  const dg = () => { const h = new VC.Blake2b(); h.update(data); return h.digest(); };
  const a = mk(true, data, 'timestamp:1 file:x', kp, id);
  let r = await VC.minisignCheck(a.pub, a.sg, dg());
  chk('minisign synthetic ok', r.ok === true && r.comment === 'timestamp:1 file:x' && r.hashed === true);
  const bad1 = Buffer.from(data); bad1[5] ^= 1;
  const h2 = new VC.Blake2b(); h2.update(bad1);
  r = await VC.minisignCheck(a.pub, a.sg, h2.digest());
  chk('minisign tampered file rejected', r.ok === false && r.why === 'sig');
  const sgBad = a.sg.replace('file:x', 'file:y');
  r = await VC.minisignCheck(a.pub, sgBad, dg());
  chk('minisign tampered comment rejected', r.ok === false && r.why === 'comment');
  const kp2 = crypto.generateKeyPairSync('ed25519');
  const b = mk(true, data, 'c', kp2, id);
  r = await VC.minisignCheck(b.pub, a.sg, dg());
  chk('minisign wrong key rejected', r.ok === false);
  const c = mk(true, data, 'c', kp, crypto.randomBytes(8));
  r = await VC.minisignCheck(c.pub, a.sg, dg());
  chk('minisign wrong key id rejected', r.ok === false && r.why === 'id');
  const l = mk(false, data, 'legacy', kp, id);
  r = await VC.minisignCheck(l.pub, l.sg, new Uint8Array(data));
  chk('minisign legacy ok', r.ok === true && r.hashed === false);
  chk('keyid hex', VC.keyIdHex(id) === Buffer.from(id).reverse().toString('hex').toUpperCase());

  const pubFile = path.join(__dirname, '..', 'docs', 'cloudos.pub');
  const p = VC.parsePub(fs.readFileSync(pubFile, 'utf8'));
  chk('cloudos.pub parses', VC.keyIdHex(p.id) === '7E06AFABFFDE4A2C');

  let have = true;
  try { cp.execSync('command -v minisign', { stdio: 'ignore', shell: '/bin/sh' }); } catch (e) { have = false; }
  if (have) {
    const t = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-'));
    try {
      cp.execSync(`printf '\\n' | minisign -G -f -W -p "${t}/k.pub" -s "${t}/k.key" >/dev/null`, { shell: '/bin/bash' });
      fs.writeFileSync(t + '/f.bin', data);
      cp.execSync(`minisign -S -s "${t}/k.key" -m "${t}/f.bin" -x "${t}/f.bin.minisig" </dev/null >/dev/null`, { shell: '/bin/bash' });
      r = await VC.minisignCheck(fs.readFileSync(t + '/k.pub', 'utf8'), fs.readFileSync(t + '/f.bin.minisig', 'utf8'), dg());
      chk('minisign real ok', r.ok === true);
      r = await VC.minisignCheck(fs.readFileSync(t + '/k.pub', 'utf8'), fs.readFileSync(t + '/f.bin.minisig', 'utf8'), new Uint8Array(data));
      chk('minisign real prehash required', r.ok === false || r.hashed === false);
    } finally { fs.rmSync(t, { recursive: true, force: true }); }
  } else console.log('-- minisign не найден, реальный тест пропущен');

  if (bad) { console.log(bad + ' ошибок'); process.exit(1); }
}
main().catch(e => { console.error(e); process.exit(1); });
