import type { EnrichedPOI, TimeBucket } from '../data/types'
import { ACCESS_GROUPS, CATEGORY_GROUPS } from '../data/taxonomy'
import { searchPois } from '../data/guide'

export interface FilterState {
  query: string
  branch: string | null
  access: string[]
  time: TimeBucket[]
  categories: string[]
  free: boolean
  paid: boolean
  family: boolean
  verifiedOnly: boolean
  showRare: boolean
}

export const EMPTY_FILTERS: FilterState = {
  query: '',
  branch: null,
  access: [],
  time: [],
  categories: [],
  free: false,
  paid: false,
  family: false,
  verifiedOnly: false,
  showRare: false,
}

const accessModes = (ids: string[]) =>
  new Set(ACCESS_GROUPS.filter((g) => ids.includes(g.id)).flatMap((g) => g.modes))

const categoryValues = (ids: string[]) =>
  new Set(CATEGORY_GROUPS.filter((g) => ids.includes(g.id)).flatMap((g) => g.categories))

export function applyFilters(list: EnrichedPOI[], f: FilterState): EnrichedPOI[] {
  const modes = accessModes(f.access)
  const cats = categoryValues(f.categories)

  let out = list.filter((p) => {
    if (!f.showRare && !p.publish_by_default) return false
    if (f.branch && p.branch !== f.branch) return false
    if (f.access.length && !modes.has(p.access)) return false
    if (f.time.length && !f.time.includes(p.timeBucket)) return false
    if (f.categories.length && !cats.has(p.category)) return false
    if (f.free && p.paid !== 'no') return false
    if (f.paid && p.paid !== 'yes') return false
    if (f.family && p.family !== 'yes') return false
    if (f.verifiedOnly && p.verification_status !== 'verified') return false
    return true
  })

  if (f.query) out = searchPois(f.query, out)
  return out
}

export function activeFilterCount(f: FilterState): number {
  return (
    (f.branch ? 1 : 0) +
    f.access.length +
    f.time.length +
    f.categories.length +
    (f.free ? 1 : 0) +
    (f.paid ? 1 : 0) +
    (f.family ? 1 : 0) +
    (f.verifiedOnly ? 1 : 0) +
    (f.showRare ? 1 : 0)
  )
}

export function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]
}

/* --- сериализация в URL ------------------------------------------- */

export function filtersToParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams()
  if (f.query) p.set('q', f.query)
  if (f.branch) p.set('branch', f.branch)
  if (f.access.length) p.set('access', f.access.join(','))
  if (f.time.length) p.set('time', f.time.join(','))
  if (f.categories.length) p.set('type', f.categories.join(','))
  if (f.free) p.set('free', '1')
  if (f.paid) p.set('paid', '1')
  if (f.family) p.set('family', '1')
  if (f.verifiedOnly) p.set('verified', '1')
  if (f.showRare) p.set('rare', '1')
  return p
}

export function paramsToFilters(p: URLSearchParams): FilterState {
  const list = (k: string) => (p.get(k) ? p.get(k)!.split(',').filter(Boolean) : [])
  return {
    query: p.get('q') ?? '',
    branch: p.get('branch'),
    access: list('access'),
    time: list('time') as TimeBucket[],
    categories: list('type'),
    free: p.get('free') === '1',
    paid: p.get('paid') === '1',
    family: p.get('family') === '1',
    verifiedOnly: p.get('verified') === '1',
    showRare: p.get('rare') === '1',
  }
}
