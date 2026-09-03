#!/usr/bin/env node
/** Генерирует data-report.md из базы. Запуск: npm run report */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(here, '..', 'src', 'data', 'pois.json'), 'utf8'))
const pois = data.pois

const count = (fn) => {
  const m = new Map()
  for (const p of pois) {
    const k = fn(p)
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

const table = (rows, head) =>
  [`| ${head[0]} | ${head[1]} |`, '|---|---|', ...rows.map(([k, v]) => `| ${k} | ${v} |`)].join('\n')

const branchName = (id) => data.branches.find((b) => b.id === id)?.name ?? id
const noCoords = pois.filter((p) => !p.coordinates && !p.geocode)
const status = (s) => pois.filter((p) => p.verification_status === s).length

const md = `# Отчёт по базе

Сгенерирован автоматически: \`npm run report\`
Версия базы: ${data.meta.version}, собрана ${data.meta.generated_at}

## Итого

| Показатель | Значение |
|---|---|
| Всего POI | ${pois.length} |
| verified | ${status('verified')} |
| high | ${status('high')} |
| needs_verification | ${status('needs_verification')} |
| Без координат | ${noCoords.length} |
| Не публикуются по умолчанию | ${pois.filter((p) => !p.publish_by_default).length} |
| Веток | ${data.branches.length} |
| Источников | ${Object.keys(data.sources).length} |

## По веткам

${table(count((p) => branchName(p.branch)), ['Ветка', 'POI'])}

## По категориям

${table(count((p) => p.category), ['Категория', 'POI'])}

## По способу добраться

${table(count((p) => p.access), ['access', 'POI'])}

## По сложности

${table(count((p) => p.difficulty), ['difficulty', 'POI'])}

## Без координат (${noCoords.length})

${noCoords.map((p) => `- ${p.name} — ${branchName(p.branch)} (\`${p.id}\`)`).join('\n')}

## Справочные объекты (publish_by_default: false)

Есть в базе и в поиске в режиме «показать малоизвестные», но не рекламируются
как туристические точки.

${pois.filter((p) => !p.publish_by_default).map((p) => `- ${p.name} (\`${p.id}\`)`).join('\n')}
`

writeFileSync(join(here, '..', 'data-report.md'), md, 'utf8')
console.log(`data-report.md обновлён: ${pois.length} POI, без координат ${noCoords.length}`)
