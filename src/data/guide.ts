import raw from './pois.json'
import type {
  AccessMode,
  Branch,
  EnrichedPOI,
  GuideData,
  POI,
  Source,
  TimeBucket,
  Warning,
} from './types'
import { ACCESS_GROUPS, CATEGORY_GROUPS } from './taxonomy'

const data = raw as unknown as GuideData

/* ------------------------------------------------------------------ */
/* Транслитерация имени в человекочитаемый slug                        */
/* ------------------------------------------------------------------ */

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(input: string): string {
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

/* ------------------------------------------------------------------ */
/* Производные поля                                                    */
/* ------------------------------------------------------------------ */

/**
 * Ориентировочное время на объект. Это ВЫЧИСЛЯЕМОЕ поле, а не данные из
 * источника: оно выведено из доступа, сложности и длины подхода и служит
 * только для фильтра. Методика описана на странице «Как собраны данные».
 */
function timeBucket(p: POI): TimeBucket {
  if (p.access === 'hike_permit') return 'multiday'
  if (p.branch === 'reserve30v' || p.branch === 'reserve30g') return 'multiday'
  if (p.difficulty === 'expert') return 'fullday'
  if (p.access === 'car' && p.detour === 'on_route') return 'under30'
  if (p.access === '4x4_hike') return 'fullday'
  if (p.difficulty === 'hard') return 'fullday'
  if (p.access === 'hike' || p.access === 'car_hike') return 'halfday'
  if (p.difficulty === 'moderate') return 'halfday'
  if (p.detour === 'side_trip') return 'halfday'
  if (p.access === 'car') return 'under30'
  return 'hours1_2'
}

const HIGH_MOUNTAIN_BRANCHES = new Set(['reserve30v', 'reserve30g'])

export function getPoiWarnings(p: POI): Warning[] {
  const w: Warning[] = []

  if (p.id === 'nickel-mines') {
    w.push({
      level: 'danger',
      text:
        'Штольни: риск обвалов, затопления, потери ориентации и возможного повышенного радиационного фона. ' +
        'Внутрь не заходить. Осматривать только снаружи, с безопасного расстояния.',
    })
  } else if (p.safety) {
    w.push({ level: p.difficulty === 'expert' ? 'danger' : 'caution', text: p.safety })
  }

  if (p.difficulty === 'expert' && p.id !== 'nickel-mines') {
    w.push({
      level: 'danger',
      text: 'Требуется специальная подготовка и снаряжение. Не самостоятельный маршрут выходного дня.',
    })
  }

  if (p.difficulty === 'restricted' || p.access === 'restricted') {
    w.push({
      level: 'danger',
      text: 'Справочный объект. Не использовать эту карточку для самостоятельной навигации.',
    })
  }

  if (p.permit === 'reserve_pass') {
    w.push({
      level: 'caution',
      text: 'Нужен пропуск Кавказского заповедника. Статус маршрута и стоимость проверять на kavkazzapoved.ru перед выездом.',
    })
  }

  if (p.permit === 'check' || p.paid === 'check' || p.paid === 'included_or_check') {
    w.push({ level: 'info', text: 'Условия входа и стоимость нужно уточнить на месте или у оператора объекта.' })
  }

  if (p.branch === 'sakhrai') {
    w.push({
      level: 'caution',
      text: 'Подъезд к Сахрайским водопадам зависит от погоды. После дождей обычная легковая машина может не пройти.',
    })
  }

  if (p.season === 'summer_route') {
    w.push({ level: 'caution', text: 'Летний маршрут. Снег в горах держится дольше, чем ожидают в долине.' })
  }

  if (HIGH_MOUNTAIN_BRANCHES.has(p.branch)) {
    w.push({
      level: 'caution',
      text: 'Высокогорье. Погода меняется за час. Регистрируйте поход согласно официальным требованиям МЧС и ночуйте только на разрешённых стоянках.',
    })
  }

  if (p.verification_status === 'needs_verification') {
    w.push({
      level: 'info',
      text: 'Точная геопривязка или логистика подъезда не подтверждена. Перепроверьте перед поездкой.',
    })
  }

  if (!p.publish_by_default) {
    w.push({
      level: 'danger',
      text: 'Необорудованный или справочный объект. Показан для полноты базы, а не как туристическая точка. Без опыта и сопровождения не посещать.',
    })
  }

  if (p.coordinates === null) {
    w.push({ level: 'info', text: 'Координаты уточняются — точка пока не выведена на карту.' })
  }

  return w
}

/* ------------------------------------------------------------------ */
/* Сборка                                                              */
/* ------------------------------------------------------------------ */

const branchById = new Map<string, Branch>(data.branches.map((b) => [b.id, b]))

const usedSlugs = new Set<string>()

export const POIS: EnrichedPOI[] = data.pois.map((p) => {
  let slug = slugify(p.name)
  if (!slug) slug = p.id
  if (usedSlugs.has(slug)) slug = `${slug}-${p.id}`
  usedSlugs.add(slug)

  const geo = p.coordinates ?? (p.geocode ? { lat: p.geocode.lat, lon: p.geocode.lon } : null)

  return {
    ...p,
    slug,
    branchName: branchById.get(p.branch)?.name ?? p.branch,
    mapPoint: geo,
    mapPointIsGeocoded: !p.coordinates && !!p.geocode,
    timeBucket: timeBucket(p),
    warnings: getPoiWarnings(p),
  }
})

export const BRANCHES = data.branches
export const SOURCES: Record<string, Source> = data.sources
export const META = data.meta

const bySlug = new Map(POIS.map((p) => [p.slug, p]))
const byId = new Map(POIS.map((p) => [p.id, p]))

export const getPoiBySlug = (slug: string) => bySlug.get(slug)
export const getPoiById = (id: string) => byId.get(id)
export const getBranch = (id: string) => branchById.get(id)

/* ------------------------------------------------------------------ */
/* Утилиты выборки                                                     */
/* ------------------------------------------------------------------ */

export const getPoisByBranch = (branchId: string) => POIS.filter((p) => p.branch === branchId)

export const getPoisByAccess = (modes: AccessMode[]) => POIS.filter((p) => modes.includes(p.access))

export const getVerifiedPois = () => POIS.filter((p) => p.verification_status === 'verified')

/** Только точки, которые реально можно поставить на карту. */
export const getMapPois = (list: EnrichedPOI[] = POIS) => list.filter((p) => p.mapPoint !== null)

export function searchPois(query: string, list: EnrichedPOI[] = POIS): EnrichedPOI[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  const words = q.split(/\s+/)
  return list.filter((p) => {
    const hay = [p.name, ...p.aliases, p.branchName, p.description, p.category].join(' ').toLowerCase()
    return words.every((w) => hay.includes(w))
  })
}

export function accessGroupOf(mode: AccessMode): string | undefined {
  return ACCESS_GROUPS.find((g) => g.modes.includes(mode))?.id
}

export function categoryGroupsOf(category: string): string[] {
  return CATEGORY_GROUPS.filter((g) => g.categories.includes(category)).map((g) => g.id)
}

/* ------------------------------------------------------------------ */
/* Конструктор маршрута                                                */
/* ------------------------------------------------------------------ */

/** Порядок веток вдоль дороги от Краснодара к горам. */
export const BRANCH_ORDER: string[] = [
  'main',
  'maykop',
  'kamenmostsky',
  'rufabgo',
  'aminovka',
  'pobeda',
  'una_koz',
  'sakhrai',
  'lagonaki_road',
  'nickel',
  'khamyshki',
  'guzeripl',
  'yavorova',
  'reserve30v',
  'reserve30g',
]

export const LAGONAKI_CAR_BRANCH = 'lagonaki_road'
export const YAVOROVA_CAR_BRANCH = 'yavorova'

export interface RouteSummary {
  stops: number
  branches: string[]
  categories: { label: string; count: number }[]
  needWalking: number
  needPermit: number
  needsVerification: number
  noCoordinates: number
  estimate: string
  conflicts: string[]
  hazards: number
}

const TIME_HOURS: Record<TimeBucket, number> = {
  under30: 0.5,
  hours1_2: 1.5,
  halfday: 4,
  fullday: 8,
  multiday: 24,
}

export function buildSuggestedRoute(ids: string[]): { pois: EnrichedPOI[]; summary: RouteSummary } {
  const pois = ids
    .map((id) => byId.get(id))
    .filter((p): p is EnrichedPOI => !!p)
    .sort((a, b) => BRANCH_ORDER.indexOf(a.branch) - BRANCH_ORDER.indexOf(b.branch))

  const branches = Array.from(new Set(pois.map((p) => p.branch)))
  const conflicts: string[] = []

  const hasLagonaki = pois.some((p) => p.branch === LAGONAKI_CAR_BRANCH)
  const hasYavorova = pois.some((p) => p.branch === YAVOROVA_CAR_BRANCH)
  if (hasLagonaki && hasYavorova) {
    conflicts.push(
      'В маршруте есть точки и на Лагонакской, и на Яворовой автомобильных ветках. ' +
        'Между ними нет сквозного автомобильного проезда через плато: возвращаться нужно через Даховскую, ' +
        'это примерно 2 часа дороги в один конец.',
    )
  }

  const hasReserve = pois.some((p) => p.branch === 'reserve30v' || p.branch === 'reserve30g')
  const hasCarOnly = pois.some((p) => p.access === 'car')
  if (hasReserve && hasCarOnly) {
    conflicts.push(
      'В маршруте смешаны придорожные остановки и многодневный высокогорный поход. ' +
        'Планируйте их как разные дни, а не как одну поездку.',
    )
  }

  if (pois.some((p) => p.branch === 'reserve30v') && pois.some((p) => p.branch === 'reserve30g')) {
    conflicts.push(
      'Маршруты №30В и №30Г начинаются на разных КПП. Совмещать их в одном выходе можно только по официальной схеме заповедника.',
    )
  }

  const hours = pois.reduce((sum, p) => sum + TIME_HOURS[p.timeBucket], 0)
  const estimate =
    hours >= 24
      ? 'многодневный маршрут'
      : hours >= 9
        ? `${Math.round(hours)} ч — не помещается в один день`
        : hours >= 1
          ? `около ${Math.round(hours)} ч без учёта дороги`
          : 'меньше часа без учёта дороги'

  const catCount = new Map<string, number>()
  for (const p of pois) catCount.set(p.category, (catCount.get(p.category) ?? 0) + 1)

  return {
    pois,
    summary: {
      stops: pois.length,
      branches,
      categories: Array.from(catCount.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count),
      needWalking: pois.filter((p) => p.access !== 'car').length,
      needPermit: pois.filter((p) => p.permit === 'reserve_pass').length,
      needsVerification: pois.filter((p) => p.verification_status === 'needs_verification').length,
      noCoordinates: pois.filter((p) => p.mapPoint === null).length,
      hazards: pois.filter((p) => p.warnings.some((w) => w.level === 'danger')).length,
      estimate,
      conflicts,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Статистика для страниц                                              */
/* ------------------------------------------------------------------ */

export const STATS = {
  total: POIS.length,
  verified: POIS.filter((p) => p.verification_status === 'verified').length,
  high: POIS.filter((p) => p.verification_status === 'high').length,
  needsVerification: POIS.filter((p) => p.verification_status === 'needs_verification').length,
  withCoordinates: POIS.filter((p) => p.mapPoint !== null).length,
  withoutCoordinates: POIS.filter((p) => p.mapPoint === null).length,
  driveUp: POIS.filter((p) => p.access === 'car' || p.access === 'car_walk').length,
  permit: POIS.filter((p) => p.permit === 'reserve_pass').length,
  branches: BRANCHES.length,
  sources: Object.keys(SOURCES).length,
}
