import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.env.ROOT || process.cwd()
const SITE = (process.env.SITE_URL || 'https://cloudos-repo.pages.dev').replace(/\/+$/, '')
const EXCLUDE = new Set((process.env.EXCLUDE_BOARDS || '').split(',').map(s => s.trim()).filter(Boolean))
const MAX_POSTS = 100
const OUT = path.join(ROOT, 'docs/forum/t')
const SITEMAP = path.join(ROOT, 'docs/sitemap.xml')
const M1 = '<!-- forum:start -->'
const M2 = '<!-- forum:end -->'

const cfg = fs.readFileSync(path.join(ROOT, 'docs/forum/config.js'), 'utf8')
const API = cfg.match(/url:"([^"]+)"/)[1]
const KEY = cfg.match(/key:"([^"]+)"/)[1]
const HEAD = { apikey: KEY, Authorization: 'Bearer ' + KEY }

async function rest(p) {
  const out = []
  for (let off = 0; ; off += 1000) {
    const r = await fetch(API + '/rest/v1/' + p + (p.includes('?') ? '&' : '?') + 'limit=1000&offset=' + off, { headers: HEAD })
    if (!r.ok) throw new Error(p + ' ' + r.status + ' ' + (await r.text()).slice(0, 200))
    const d = await r.json()
    out.push(...d)
    if (d.length < 1000) break
  }
  return out
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const ymd = s => String(s).slice(0, 10)
const dmy = s => { const d = new Date(s); return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear() }
const chunks = (a, n) => { const r = []; for (let i = 0; i < a.length; i += n) r.push(a.slice(i, i + n)); return r }

function inline(t) {
  let s = esc(t)
  s = s.replace(/\[img:[^\]\s]*\]/g, '[картинка]').replace(/:s_[a-z]+:/g, '')
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  s = s.replace(/https?:\/\/[^\s<]+/g, m => {
    const tail = (m.match(/[.,;:!?)]+$/) || [''])[0]
    const u = tail ? m.slice(0, -tail.length) : m
    return '<a href="' + u + '" rel="nofollow ugc noopener">' + u + '</a>' + tail
  })
  return s
}

function body(raw) {
  const src = String(raw || '').replace(/\r\n?/g, '\n')
  const out = []
  let last = 0
  const re = /```([a-zA-Z0-9+#._-]*)\n?([\s\S]*?)```/g
  let m
  const text = x => { const v = x.trim(); if (v) out.push('<p class="t">' + inline(v) + '</p>') }
  while ((m = re.exec(src))) {
    text(src.slice(last, m.index))
    out.push('<pre><code>' + esc(m[2].replace(/\n$/, '')) + '</code></pre>')
    last = re.lastIndex
  }
  text(src.slice(last))
  return out.join('\n')
}

function plain(raw, n) {
  const s = String(raw || '').replace(/```[\s\S]*?```/g, ' ').replace(/\[img:[^\]\s]*\]/g, ' ').replace(/:s_[a-z]+:/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/[`*_>#]/g, ' ').replace(/\s+/g, ' ').trim()
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s
}

const CSS = ':root{color-scheme:light dark;--bg:#fff;--ink:#1c2b44;--mute:#6b7f99;--line:#d6e3f3;--surf:#f4f8fd;--ac:#2f6fd0}@media(prefers-color-scheme:dark){:root{--bg:#0e1626;--ink:#e4ebf7;--mute:#93a3bd;--line:#26365a;--surf:#14203a;--ac:#8fb4f0}}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,sans-serif}main{max-width:780px;margin:0 auto;padding:20px 16px 60px}a{color:var(--ac)}h1{font-size:26px;line-height:1.25;margin:10px 0}h2{font-size:19px;margin:28px 0 8px}.mu{color:var(--mute);font-size:14px}.open{display:inline-block;margin:8px 0 18px;padding:8px 16px;border-radius:10px;background:var(--ac);color:var(--bg);text-decoration:none;font-weight:600}.post{border:1px solid var(--line);border-radius:12px;background:var(--surf);padding:12px 16px;margin:0 0 12px}.post .h{display:flex;gap:10px;flex-wrap:wrap;font-size:14px;color:var(--mute);margin-bottom:4px}.post .h b{color:var(--ink)}.t{white-space:pre-wrap;margin:.5em 0;overflow-wrap:anywhere}pre{overflow-x:auto;padding:10px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--line)}code{font-family:ui-monospace,monospace;font-size:14px}.tag{display:inline-block;padding:0 9px;margin-right:6px;border:1px solid var(--line);border-radius:999px;font-size:13px;color:var(--mute)}ul{padding-left:20px}li{margin:6px 0}'

function page({ title, desc, canon, ld, inner, type }) {
  return '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n<meta name="robots" content="index,follow">\n' +
    '<link rel="canonical" href="' + esc(canon) + '">\n<meta property="og:site_name" content="cloudos">\n<meta property="og:type" content="' + type + '">\n' +
    '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:url" content="' + esc(canon) + '">\n' +
    '<meta property="og:image" content="' + SITE + '/og.png">\n<meta name="twitter:card" content="summary">\n<link rel="icon" href="' + SITE + '/icon.svg" type="image/svg+xml">\n' +
    (ld ? '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') + '</script>\n' : '') +
    '<style>' + CSS + '</style>\n</head>\n<body>\n<main>\n' + inner + '\n</main>\n</body>\n</html>\n'
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) return false
  fs.writeFileSync(file, text)
  return true
}

const boards = await rest('boards?select=id,title,descr,pos,allowed_roles&order=id')
const pub = []
for (const b of boards) {
  const closed = Array.isArray(b.allowed_roles) && b.allowed_roles.length > 0
  const ex = EXCLUDE.has(String(b.id))
  console.log('board', b.id, JSON.stringify(b.title), closed ? 'skipped: restricted' : ex ? 'skipped: excluded' : 'public')
  if (!closed && !ex) pub.push(b)
}
if (!pub.length) throw new Error('no public boards, aborting')
const bmap = new Map(pub.map(b => [b.id, b]))

const threads = await rest('threads?select=id,board_id,author,title,created_at,bumped_at,solved,tags&board_id=in.(' + pub.map(b => b.id).join(',') + ')&order=id')
const existing = fs.existsSync(OUT) ? fs.readdirSync(OUT).filter(f => /^\d+\.html$/.test(f)) : []
if (!threads.length && existing.length) throw new Error('no threads fetched but pages exist, aborting')

const posts = []
for (const c of chunks(threads.map(t => t.id), 40)) posts.push(...await rest('posts?select=id,thread_id,author,body,created_at&thread_id=in.(' + c.join(',') + ')&order=id'))
const byThread = new Map()
for (const p of posts) { if (!byThread.has(p.thread_id)) byThread.set(p.thread_id, []); byThread.get(p.thread_id).push(p) }

const ids = [...new Set([...threads.map(t => t.author), ...posts.map(p => p.author)].filter(Boolean))]
const names = new Map()
for (const c of chunks(ids, 80)) for (const u of await rest('profiles?select=id,name&id=in.(' + c.join(',') + ')&order=id')) names.set(u.id, u.name)
const who = id => names.get(id) || 'участник'

const items = []
let changed = 0
for (const t of threads) {
  const ps = byThread.get(t.id) || []
  if (!ps.length) continue
  const b = bmap.get(t.board_id)
  const canon = SITE + '/forum/t/' + t.id
  const lastAt = ps[ps.length - 1].created_at
  const shown = ps.slice(0, MAX_POSTS)
  const desc = plain(ps[0].body, 155) || t.title
  const tags = Array.isArray(t.tags) ? t.tags.filter(Boolean) : []
  const inner =
    '<p class="mu"><a href="../">форум</a> / <a href="./">все темы</a> / ' + esc(b.title) + '</p>\n' +
    '<h1>' + esc(t.title) + '</h1>\n' +
    '<p class="mu">' + (t.solved ? '<span class="tag">решено</span>' : '') + tags.map(x => '<span class="tag">' + esc(x) + '</span>').join('') + esc(who(t.author)) + ' · ' + dmy(t.created_at) + ' · сообщений: ' + ps.length + '</p>\n' +
    '<a class="open" href="../#/t/' + t.id + '">открыть в форуме →</a>\n' +
    shown.map(p => '<article class="post" id="p' + p.id + '"><div class="h"><b>' + esc(who(p.author)) + '</b><span>' + dmy(p.created_at) + '</span></div>\n' + body(p.body) + '\n</article>').join('\n') +
    (ps.length > shown.length ? '\n<p class="mu">показаны первые ' + shown.length + ' сообщений, остальные в форуме.</p>' : '') +
    '\n<a class="open" href="../#/t/' + t.id + '">открыть в форуме →</a>'
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: t.title,
    url: canon,
    datePublished: t.created_at,
    dateModified: lastAt,
    author: { '@type': 'Person', name: who(t.author) },
    text: plain(ps[0].body, 500) || t.title,
    commentCount: Math.max(0, ps.length - 1),
    isPartOf: { '@type': 'WebSite', name: 'cloudos', url: SITE + '/' }
  }
  if (write(path.join(OUT, t.id + '.html'), page({ title: t.title + ' — форум cloudos', desc, canon, ld, inner, type: 'article' }))) changed++
  items.push({ id: t.id, title: t.title, board: b, at: lastAt, n: ps.length })
}

const keep = new Set(items.map(i => i.id + '.html'))
for (const f of existing) if (!keep.has(f)) { fs.unlinkSync(path.join(OUT, f)); changed++ }

const sorted = [...items].sort((a, b) => String(b.at).localeCompare(String(a.at)) || b.id - a.id)
const listInner = '<p class="mu"><a href="../">форум</a> / темы</p>\n<h1>темы форума cloudos</h1>\n<p class="mu">публичные темы форума. чтобы ответить, открой тему в форуме.</p>\n' +
  pub.slice().sort((a, b) => a.pos - b.pos || a.id - b.id).map(b => {
    const l = sorted.filter(i => i.board.id === b.id)
    if (!l.length) return ''
    return '<h2>' + esc(b.title) + '</h2>\n' + (b.descr ? '<p class="mu">' + esc(b.descr) + '</p>\n' : '') +
      '<ul>\n' + l.map(i => '<li><a href="' + SITE + '/forum/t/' + i.id + '">' + esc(i.title) + '</a> <span class="mu">· ' + dmy(i.at) + ' · сообщений: ' + i.n + '</span></li>').join('\n') + '\n</ul>'
  }).join('\n')
if (write(path.join(OUT, 'index.html'), page({ title: 'темы форума — cloudos', desc: 'публичные темы форума cloudos: вопросы, предложения и обсуждение.', canon: SITE + '/forum/t/', inner: listInner, type: 'website' }))) changed++

const entries = [SITE + '/forum/t/'].map(u => '<url><loc>' + esc(u) + '</loc></url>')
for (const i of [...items].sort((a, b) => a.id - b.id)) entries.push('<url><loc>' + esc(SITE + '/forum/t/' + i.id) + '</loc><lastmod>' + ymd(i.at) + '</lastmod></url>')
const block = M1 + '\n' + entries.join('\n') + '\n' + M2
let sm = fs.existsSync(SITEMAP) ? fs.readFileSync(SITEMAP, 'utf8') : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n'
const a = sm.indexOf(M1), z = sm.indexOf(M2)
if (a >= 0 && z > a) sm = sm.slice(0, a) + block + sm.slice(z + M2.length)
else sm = sm.replace('</urlset>', block + '\n</urlset>')
if (write(SITEMAP, sm)) changed++

console.log('threads', items.length, 'files changed', changed)
