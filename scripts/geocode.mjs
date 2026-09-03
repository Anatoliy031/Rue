#!/usr/bin/env node
/**
 * Геокодирование мест, у которых в базе нет координат.
 *
 *   npm run geocode
 *
 * Что делает:
 *  1. берёт из pois.json все POI с coordinates: null;
 *  2. спрашивает OpenStreetMap Nominatim, соблюдая лимит 1 запрос в секунду;
 *  3. отбрасывает совпадения вне Республики Адыгея и коридора от Краснодара —
 *     «Белореченский водопад» есть не только здесь;
 *  4. кладёт результат в поле geocode с пометкой exact/probable;
 *  5. пишет adygea_guzeripl_pois.geocoded.json и geocoding-report.md.
 *
 * Исходный pois.json не меняется. Чтобы точки появились на сайте, скопируйте
 * получившийся geocoded-файл поверх src/data/pois.json — но сначала прочитайте
 * отчёт: всё, что попало в раздел «неоднозначно», лучше проверить руками.
 *
 * Скрипт требует интернета. Nominatim просит указывать контакт в User-Agent —
 * впишите свой e-mail в CONTACT ниже.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const CONTACT = process.env.GEOCODE_CONTACT || 'вставьте-свой-email@example.com'
const UA = `doroga-v-guzeripl/1.0 (${CONTACT})`

const here = dirname(fileURLToPath(import.meta.url))
const SRC = join(here, '..', 'src', 'data', 'pois.json')
const OUT = join(here, '..', 'src', 'data', 'adygea_guzeripl_pois.geocoded.json')
const REPORT = join(here, '..', 'geocoding-report.md')
const CACHE = join(here, '.geocode-cache.json')

const BBOX = { minLat: 43.7, maxLat: 45.4, minLon: 38.6, maxLon: 41.0 }
const REGION_HINTS = ['адыге', 'майкоп', 'краснодар', 'adygea', 'adyge', 'maykop', 'krasnodar']

const data = JSON.parse(readFileSync(SRC, 'utf8'))
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

const branchName = (id) => data.branches.find((b) => b.id === id)?.name ?? id
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function query(text) {
  if (cache[text]) return cache[text]
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', text)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '5')
  url.searchParams.set('accept-language', 'ru')
  url.searchParams.set('viewbox', `${BBOX.minLon},${BBOX.maxLat},${BBOX.maxLon},${BBOX.minLat}`)
  url.searchParams.set('bounded', '1')

  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Nominatim ответил ${res.status}`)
  const json = await res.json()
  cache[text] = json
  writeFileSync(CACHE, JSON.stringify(cache), 'utf8')
  await sleep(1100) // лимит Nominatim: не чаще одного запроса в секунду
  return json
}

const inBox = (lat, lon) =>
  lat >= BBOX.minLat && lat <= BBOX.maxLat && lon >= BBOX.minLon && lon <= BBOX.maxLon

const looksRegional = (display) => {
  const d = String(display).toLowerCase()
  return REGION_HINTS.some((h) => d.includes(h))
}

const exact = []
const probable = []
const notFound = []
const ambiguous = []

const targets = data.pois.filter((p) => !p.coordinates)
console.log(`Геокодируем ${targets.length} мест. Это займёт примерно ${Math.ceil((targets.length * 2 * 1.2) / 60)} мин.\n`)

for (const poi of targets) {
  const attempts = [
    `${poi.name}, ${branchName(poi.branch)}, Республика Адыгея`,
    `${poi.name}, Республика Адыгея`,
    ...poi.aliases.map((a) => `${a}, Республика Адыгея`),
  ]

  let hits = []
  for (const q of attempts) {
    try {
      const res = await query(q)
      hits = res.filter((r) => inBox(Number(r.lat), Number(r.lon)) && looksRegional(r.display_name))
      if (hits.length) break
    } catch (e) {
      console.error(`  ! ${poi.id}: ${e.message}`)
    }
  }

  if (!hits.length) {
    notFound.push(poi)
    console.log(`  — ${poi.name}: не найдено`)
    continue
  }

  const distinct = new Set(hits.map((h) => `${Number(h.lat).toFixed(3)},${Number(h.lon).toFixed(3)}`))
  const best = hits[0]
  const lat = Number(best.lat)
  const lon = Number(best.lon)

  // Центр населённого пункта вместо конкретного природного объекта — не подходит.
  const isSettlementCentre = ['city', 'town', 'village', 'hamlet', 'administrative'].includes(best.type)
  const naturalPoi = !['village', 'checkpoint'].includes(poi.category)

  if (isSettlementCentre && naturalPoi) {
    ambiguous.push({ poi, best, reason: 'совпадение — центр населённого пункта, а не сам объект' })
    console.log(`  ? ${poi.name}: центр населённого пункта, пропускаем`)
    continue
  }

  if (distinct.size > 1) {
    ambiguous.push({ poi, best, reason: `${distinct.size} разных совпадений в районе` })
    console.log(`  ? ${poi.name}: несколько совпадений`)
    continue
  }

  const confidence = best.importance && Number(best.importance) > 0.35 ? 'exact' : 'probable'
  poi.geocode = {
    lat,
    lon,
    confidence,
    matched: best.display_name,
    provider: 'nominatim',
    fetched_at: new Date().toISOString().slice(0, 10),
  }
  ;(confidence === 'exact' ? exact : probable).push(poi)
  console.log(`  ${confidence === 'exact' ? '✓' : '~'} ${poi.name}`)
}

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8')

const list = (arr, fmt) => (arr.length ? arr.map(fmt).join('\n') : '_пусто_')

const report = `# Отчёт о геокодировании

Дата: ${new Date().toISOString().slice(0, 10)}
Источник: OpenStreetMap Nominatim
Обработано мест без координат: ${targets.length}

| Итог | Сколько |
|---|---|
| Найдено точно | ${exact.length} |
| Найдено вероятно | ${probable.length} |
| Неоднозначно | ${ambiguous.length} |
| Не найдено | ${notFound.length} |

## Найдено точно

${list(exact, (p) => `- **${p.name}** (${p.id}) — ${p.geocode.lat.toFixed(5)}, ${p.geocode.lon.toFixed(5)}\n  ${p.geocode.matched}`)}

## Найдено вероятно

Проверьте эти точки по карте, прежде чем публиковать.

${list(probable, (p) => `- **${p.name}** (${p.id}) — ${p.geocode.lat.toFixed(5)}, ${p.geocode.lon.toFixed(5)}\n  ${p.geocode.matched}`)}

## Неоднозначно

Совпадения найдены, но принять их автоматически нельзя.

${list(ambiguous, (a) => `- **${a.poi.name}** (${a.poi.id}) — ${a.reason}\n  ${a.best.display_name}`)}

## Не найдено

${list(notFound, (p) => `- ${p.name} (${p.id}) — ${branchName(p.branch)}`)}

---

Ничего из «неоднозначно» и «не найдено» в базу не записано. Пустые координаты
остаются пустыми: на сайте такие места показываются с пометкой
«координаты уточняются», а не ставятся на карту наугад.
`

writeFileSync(REPORT, report, 'utf8')

console.log(`\nГотово.`)
console.log(`  точно: ${exact.length}, вероятно: ${probable.length}, неоднозначно: ${ambiguous.length}, не найдено: ${notFound.length}`)
console.log(`  ${OUT}`)
console.log(`  ${REPORT}\n`)
