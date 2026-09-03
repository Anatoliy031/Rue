#!/usr/bin/env node
/** Генерирует public/sitemap.xml. Запуск: npm run sitemap */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'pois.json'), 'utf8'))

// Адрес сайта. GitHub Actions подставляет его автоматически;
// локально можно задать: SITE_URL=https://имя.github.io/репозиторий npm run sitemap
const SITE = (process.env.SITE_URL || 'https://example.github.io').replace(/\/$/, '')

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

// Должно совпадать со slugify() в src/data/guide.ts
function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[«»"'’`(){}\[\]]/g, '')
    .split('')
    .map((ch) => (TRANSLIT[ch] !== undefined ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
}

const COLLECTIONS = [
  'bez-hodby', 'odin-den', 's-detmi', 'vodopady',
  'peschery', 'dolmeny', 'gory-bez-pohoda', 'bolshoy-pohod',
]

const used = new Set()
const urls = [
  { loc: '/', priority: '1.0' },
  { loc: '/places', priority: '0.9' },
  { loc: '/map', priority: '0.9' },
  { loc: '/routes', priority: '0.8' },
  { loc: '/reserve', priority: '0.8' },
  { loc: '/about-data', priority: '0.5' },
  ...COLLECTIONS.map((s) => ({ loc: `/route/${s}`, priority: '0.7' })),
]

for (const p of data.pois) {
  let slug = slugify(p.name) || p.id
  if (used.has(slug)) slug = `${slug}-${p.id}`
  used.add(slug)
  urls.push({ loc: `/place/${slug}`, priority: p.verification_status === 'verified' ? '0.7' : '0.5' })
}

const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${SITE}${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(here, '..', 'public', 'sitemap.xml'), xml, 'utf8')
writeFileSync(
  join(here, '..', 'public', 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  'utf8',
)
console.log(`sitemap.xml: ${urls.length} адресов, база ${SITE}`)
