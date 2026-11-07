const fs = require('fs')
const path = require('path')

const root = path.join(path.dirname(__dirname), 'docs')
const pages = []
const walk = d => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) pages.push(p)
  }
}
walk(root)

let bad = 0
const fail = (f, m) => {
  bad++
  console.error('ошибка: ' + path.relative(root, f) + ': ' + m)
}

for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8')
  const head = s.indexOf('<head>')
  const first = s.search(/<(link|script|meta|title)\b/)
  if (head >= 0 && first >= 0 && first < head) fail(f, 'теги до <head>')
  const ids = new Map()
  for (const m of s.matchAll(/\sid="([^"]+)"/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1)
  for (const [k, n] of ids) if (n > 1) fail(f, 'повторяется id ' + k)
  for (const m of s.matchAll(/\s(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1]
    if (/^(https?:|mailto:|data:|javascript:|\/\/)/.test(u) || /['+]/.test(u)) continue
    let t = path.resolve(path.dirname(f), u)
    if (u.endsWith('/') || (fs.existsSync(t) && fs.statSync(t).isDirectory())) t = path.join(t, 'index.html')
    if (!t.startsWith(root)) continue
    if (!fs.existsSync(t)) fail(f, 'нет файла ' + u)
  }
}

const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'innerhtml-baseline.json'), 'utf8'))
const forum = path.join(root, 'forum')
for (const n of Object.keys(base)) {
  const c = (fs.readFileSync(path.join(forum, n), 'utf8').match(/innerHTML/g) || []).length
  if (c > base[n]) fail(path.join(forum, n), 'innerHTML: ' + c + ', в базе ' + base[n] + '; новый innerHTML проверь на esc() и подними число в tools/innerhtml-baseline.json')
}

if (bad) process.exit(1)
console.log('ok: проверено страниц ' + pages.length)
