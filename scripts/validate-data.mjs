#!/usr/bin/env node
/**
 * Проверка базы перед сборкой. Падает с ошибкой, если в данных
 * появилось что-то, что нельзя показывать людям.
 *
 * Запуск: npm run validate
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const DATA = join(here, '..', 'src', 'data', 'pois.json')

const data = JSON.parse(readFileSync(DATA, 'utf8'))
const errors = []
const warnings = []

const ACCESS = new Set([
  'car', 'car_walk', 'car_hike', 'car_cable', 'cable_walk', 'cable_hike',
  'walk', 'hike', '4x4_hike', 'hike_permit', 'restricted',
])
const DIFFICULTY = new Set(['easy', 'moderate', 'hard', 'expert', 'restricted'])
const STATUS = new Set(['verified', 'high', 'needs_verification'])

// Границы Республики Адыгея и прилегающего коридора от Краснодара.
const BBOX = { minLat: 43.7, maxLat: 45.4, minLon: 38.6, maxLon: 41.0 }

const ids = new Set()
const names = new Map()

for (const p of data.pois) {
  const at = `POI ${p.id}`

  if (!p.id) errors.push('POI без id')
  if (ids.has(p.id)) errors.push(`${at}: дублирующийся id`)
  ids.add(p.id)

  if (!data.branches.some((b) => b.id === p.branch)) errors.push(`${at}: неизвестная ветка "${p.branch}"`)
  if (!ACCESS.has(p.access)) errors.push(`${at}: неизвестный access "${p.access}"`)
  if (!DIFFICULTY.has(p.difficulty)) errors.push(`${at}: неизвестная сложность "${p.difficulty}"`)
  if (!STATUS.has(p.verification_status)) errors.push(`${at}: неизвестный статус "${p.verification_status}"`)

  for (const k of p.source_keys ?? []) {
    if (!data.sources[k]) errors.push(`${at}: источник "${k}" не описан в sources`)
  }
  if (!p.source_keys?.length) warnings.push(`${at}: нет ни одного источника`)

  const c = p.coordinates ?? p.geocode
  if (c) {
    const lat = c.lat
    const lon = c.lon ?? c.lng
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      errors.push(`${at}: координаты не числа`)
    } else if (lat === 0 && lon === 0) {
      errors.push(`${at}: координаты [0,0] — это не точка, а пропуск данных`)
    } else if (lat < BBOX.minLat || lat > BBOX.maxLat || lon < BBOX.minLon || lon > BBOX.maxLon) {
      errors.push(`${at}: координаты ${lat},${lon} вне района маршрута — скорее всего совпадение из другого региона`)
    }
  }

  // Невозможные сочетания
  if (p.access === 'car' && p.difficulty === 'expert') {
    errors.push(`${at}: "прямо на машине" и сложность "эксперт" одновременно`)
  }
  if (p.permit === 'reserve_pass' && p.access === 'car') {
    warnings.push(`${at}: нужен пропуск, но доступ помечен как обычный подъезд — проверьте`)
  }
  if (p.difficulty === 'expert' && p.family === 'yes') {
    errors.push(`${at}: экспертная сложность и "подходит с детьми"`)
  }
  if (p.verification_status === 'verified' && !p.coordinates && !p.geocode) {
    warnings.push(`${at}: статус verified, но координат нет`)
  }
  if (!p.description) warnings.push(`${at}: пустое описание`)

  const key = p.name.toLowerCase().trim()
  if (names.has(key)) warnings.push(`Одинаковое название: "${p.name}" (${names.get(key)} и ${p.id})`)
  else names.set(key, p.id)

  for (const a of p.aliases ?? []) {
    const ak = a.toLowerCase().trim()
    if (names.has(ak) && names.get(ak) !== p.id) {
      warnings.push(`Алиас "${a}" у ${p.id} совпадает с названием ${names.get(ak)}`)
    }
  }
}

const needs = data.pois.filter((p) => p.verification_status === 'needs_verification')
const noCoords = data.pois.filter((p) => !p.coordinates && !p.geocode)

console.log(`\nПроверка базы: ${data.pois.length} POI, ${data.branches.length} веток, ${Object.keys(data.sources).length} источников`)
console.log(`Требуют проверки: ${needs.length}`)
console.log(`Без координат: ${noCoords.length}`)

if (warnings.length) {
  console.log(`\nПредупреждения (${warnings.length}):`)
  for (const w of warnings) console.log('  · ' + w)
}

if (errors.length) {
  console.error(`\nОшибки (${errors.length}):`)
  for (const e of errors) console.error('  ✗ ' + e)
  console.error('\nСборка остановлена. Исправьте базу и запустите снова.\n')
  process.exit(1)
}

console.log('\nОшибок нет. Можно собирать.\n')
