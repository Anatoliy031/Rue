import { POIS } from './guide'
import type { EnrichedPOI } from './types'

export interface Collection {
  slug: string
  title: string
  lead: string
  /** Что важно понять до выезда — показывается над списком. */
  caveat?: string
  /** Разделы внутри подборки: подборка не всегда плоский список. */
  sections: {
    title: string
    note?: string
    tone?: 'normal' | 'caution' | 'danger'
    select: (p: EnrichedPOI) => boolean
  }[]
}

const RUFABGO_EQUIPPED = new Set(['rufabgo-01', 'rufabgo-02', 'rufabgo-03', 'rufabgo-04', 'rufabgo-05'])

export const isRufabgoEquipped = (p: EnrichedPOI) => RUFABGO_EQUIPPED.has(p.id)
export const isRufabgoUpper = (p: EnrichedPOI) => p.branch === 'rufabgo' && p.category === 'waterfall' && !RUFABGO_EQUIPPED.has(p.id)

const oneDayBest = new Set([
  'khadzhok-gorge',
  'rufabgo-04',
  'big-azish',
  'azish-pass-road',
  'devils-finger',
  'granite-canyon',
  'cossack-stone',
])

export const COLLECTIONS: Collection[] = [
  {
    slug: 'bez-hodby',
    title: 'Еду и почти не хочу ходить',
    lead: 'Места, до которых можно доехать и посмотреть, не уходя далеко от машины. Подойдёт, если в поездке есть люди, которым тяжело идти.',
    sections: [
      {
        title: 'Прямо с парковки',
        select: (p) => p.access === 'car' && p.publish_by_default,
      },
      {
        title: 'Короткий подход от машины',
        note: 'Обычно это несколько сотен метров по оборудованной дорожке.',
        select: (p) => (p.access === 'car_walk' || p.access === 'walk') && p.difficulty === 'easy' && p.publish_by_default,
      },
    ],
  },
  {
    slug: 'odin-den',
    title: 'Один день: самое эффектное',
    lead: 'Семь точек без больших крюков в сторону. Дорога от Краснодара и обратно — это уже около пяти часов, поэтому больше в один день реально не поместится.',
    caveat:
      'Азишские пещеры и Чёртов палец — это Лагонакская ветка. Гузерипль в этот день не поместится: туда отдельная поездка.',
    sections: [{ title: 'Маршрут дня', select: (p) => oneDayBest.has(p.id) }],
  },
  {
    slug: 's-detmi',
    title: 'С детьми',
    lead: 'Объекты, которые в базе отмечены как подходящие для детей и не имеют предупреждений об опасности.',
    caveat: 'Даже на оборудованных тропах у воды бывает скользко. Мокрые камни у водопадов — главная причина травм в этих местах.',
    sections: [
      {
        title: 'Спокойно и без набора высоты',
        select: (p) =>
          p.family === 'yes' &&
          p.difficulty === 'easy' &&
          p.publish_by_default &&
          !p.warnings.some((w) => w.level === 'danger'),
      },
      {
        title: 'Можно с детьми постарше',
        note: 'Тропа, набор высоты, нужна нормальная обувь.',
        tone: 'caution',
        select: (p) =>
          p.family === 'yes' &&
          p.difficulty === 'moderate' &&
          p.publish_by_default &&
          !p.warnings.some((w) => w.level === 'danger'),
      },
    ],
  },
  {
    slug: 'vodopady',
    title: 'Люблю водопады',
    lead: 'В базе 23 отдельных водопада и ещё несколько каскадов. Они очень разные по сложности, поэтому разделены по тому, куда реально можно дойти.',
    caveat:
      'Руфабго — это 16 водопадов, а не один. Оборудованная экскурсионная часть заканчивается на «Девичьей косе»; всё, что выше, — необорудованный участок.',
    sections: [
      {
        title: 'Оборудованная часть Руфабго',
        note: 'Три Братца → Шум → Каскадный → Сердце Руфабго → Девичья коса.',
        select: (p) => isRufabgoEquipped(p),
      },
      {
        title: 'Верхние водопады Руфабго — необорудованная часть',
        note: 'Тропа не подготовлена, участки крутые и мокрые. Не семейная прогулка.',
        tone: 'danger',
        select: (p) => isRufabgoUpper(p),
      },
      {
        title: 'Мишоко и Кутанка',
        select: (p) => p.id === 'mishoko-waterfalls' || p.id === 'kutanka-waterfalls' || p.id === 'filimonov-waterfall',
      },
      {
        title: 'Сахрайские водопады',
        note: 'Подъезд зависит от погоды, названия каскадов в разных источниках отличаются.',
        tone: 'caution',
        select: (p) => p.branch === 'sakhrai' && p.category.startsWith('waterfall'),
      },
      {
        title: 'По дороге',
        select: (p) => ['belorechensk-waterfall', 'molchepa-waterfall'].includes(p.id),
      },
    ],
  },
  {
    slug: 'peschery',
    title: 'Пещеры',
    lead: 'На маршруте есть и оборудованные экскурсионные пещеры, и необорудованные полости, куда без спелеоподготовки заходить нельзя.',
    sections: [
      {
        title: 'Экскурсионные, с освещением и дорожками',
        select: (p) => ['big-azish', 'nezhnaya-cave', 'monastery-caves', 'sunny-grotto', 'wishes-grotto'].includes(p.id),
      },
      {
        title: 'Требуют подготовки',
        note: 'Необорудованные полости. Нужны снаряжение, свет, опыт и сопровождение.',
        tone: 'danger',
        select: (p) =>
          (p.category.startsWith('cave') || p.category === 'grotto') &&
          !['big-azish', 'nezhnaya-cave', 'monastery-caves', 'sunny-grotto', 'wishes-grotto'].includes(p.id),
      },
    ],
  },
  {
    slug: 'dolmeny',
    title: 'Дольмены',
    lead: 'Логичная цепочка с севера на юг: Хаджох → Дегуакская поляна → Хамышки → Гузерипль → Усть-Сахрай.',
    sections: [
      {
        title: 'Дольмены и археология',
        select: (p) => ['dolmen', 'dolmen_group', 'archaeology', 'archaeology_candidate'].includes(p.category),
      },
    ],
  },
  {
    slug: 'gory-bez-pohoda',
    title: 'Горы без многодневного похода',
    lead: 'Высота и виды, до которых можно добраться за день и вернуться ночевать в дом, а не в палатку.',
    sections: [
      {
        title: 'Уна-Коз и канатная дорога',
        select: (p) => p.branch === 'una_koz' && p.difficulty !== 'hard' && p.difficulty !== 'expert',
      },
      {
        title: 'Обзорные точки Лаго-Наки',
        select: (p) => p.branch === 'lagonaki_road' && (p.category === 'viewpoint' || p.category === 'checkpoint'),
      },
      {
        title: 'Партизанская и Яворова поляны',
        note: 'Это уже другая автомобильная ветка: с Лаго-Наки сюда через плато не проехать.',
        tone: 'caution',
        select: (p) => p.branch === 'yavorova',
      },
    ],
  },
  {
    slug: 'bolshoy-pohod',
    title: 'Большой поход',
    lead: 'Официальные высокогорные маршруты №30В и №30Г Кавказского заповедника. Только по пропуску и только по разрешённой нитке.',
    caveat:
      'Статус маршрутов и стоянок меняется из-за снега и погоды. Перед выездом проверяйте официальный источник и регистрируйте поход согласно требованиям МЧС.',
    sections: [
      {
        title: 'Маршрут №30В — от КПП Лагонаки',
        select: (p) => p.branch === 'reserve30v' && p.publish_by_default,
      },
      {
        title: 'Маршрут №30Г — через Фишт к морю',
        select: (p) => p.branch === 'reserve30g' && p.publish_by_default,
      },
    ],
  },
]

export function collectionSections(c: Collection) {
  return c.sections
    .map((s) => ({ ...s, pois: POIS.filter(s.select) }))
    .filter((s) => s.pois.length > 0)
}

export function collectionCount(c: Collection) {
  const ids = new Set<string>()
  for (const s of c.sections) for (const p of POIS.filter(s.select)) ids.add(p.id)
  return ids.size
}

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug)
