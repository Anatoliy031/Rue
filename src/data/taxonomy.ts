import type { AccessMode, Difficulty, Family, Paid, Permit, Season, TimeBucket } from './types'

export const ACCESS_LABEL: Record<AccessMode, string> = {
  car: 'Прямо на машине',
  car_walk: 'Машина + короткий подход',
  car_hike: 'Машина + пеший маршрут',
  car_cable: 'Машина + канатная дорога',
  cable_walk: 'Канатная дорога + прогулка',
  cable_hike: 'Канатная дорога + пеший маршрут',
  walk: 'Пешком от парковки',
  hike: 'Пеший маршрут',
  '4x4_hike': 'Желательно 4×4, дальше пешком',
  hike_permit: 'Пеший маршрут по пропуску',
  restricted: 'Доступ ограничен',
}

export const ACCESS_SHORT: Record<AccessMode, string> = {
  car: 'машина',
  car_walk: 'машина + подход',
  car_hike: 'машина + поход',
  car_cable: 'машина + канатка',
  cable_walk: 'канатка + прогулка',
  cable_hike: 'канатка + поход',
  walk: 'пешком',
  hike: 'поход',
  '4x4_hike': '4×4 + поход',
  hike_permit: 'поход, пропуск',
  restricted: 'ограничен',
}

export const ACCESS_GLYPH: Record<AccessMode, string> = {
  car: '🚗',
  car_walk: '🚗🚶',
  car_hike: '🚗🥾',
  car_cable: '🚗🚡',
  cable_walk: '🚡🚶',
  cable_hike: '🚡🥾',
  walk: '🚶',
  hike: '🥾',
  '4x4_hike': '🚙🥾',
  hike_permit: '🎟🥾',
  restricted: '⚠️',
}

/** Группы фильтра «по доступу» из брифа. */
export const ACCESS_GROUPS: { id: string; label: string; glyph: string; modes: AccessMode[] }[] = [
  { id: 'drive', label: 'Прямо на машине', glyph: '🚗', modes: ['car'] },
  { id: 'drive_walk', label: 'Машина + короткий подход', glyph: '🚗🚶', modes: ['car_walk', 'walk'] },
  { id: 'hike', label: 'Пеший маршрут', glyph: '🥾', modes: ['hike', 'car_hike'] },
  { id: 'offroad', label: 'Желательно 4×4', glyph: '🚙', modes: ['4x4_hike'] },
  { id: 'cable', label: 'Канатная дорога', glyph: '🚡', modes: ['car_cable', 'cable_walk', 'cable_hike'] },
  { id: 'permit', label: 'Нужен пропуск', glyph: '🎟', modes: ['hike_permit'] },
  { id: 'prepared', label: 'Только для подготовленных', glyph: '⚠️', modes: ['restricted'] },
]

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Легко',
  moderate: 'Средне',
  hard: 'Сложно',
  expert: 'Эксперт',
  restricted: 'Закрытый / справочный',
}

export const DIFFICULTY_HINT: Record<Difficulty, string> = {
  easy: 'Обычная прогулка',
  moderate: 'Тропа, набор высоты, нужна нормальная обувь',
  hard: 'Продолжительный или крутой маршрут',
  expert: 'Спелеология, сложный рельеф, специальная подготовка',
  restricted: 'Не использовать для самостоятельной навигации',
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'moderate', 'hard', 'expert', 'restricted']

export const FAMILY_LABEL: Record<Family, string> = {
  yes: 'Подходит с детьми',
  with_caution: 'С детьми — осторожно',
  no: 'Не для детей',
}

export const PERMIT_LABEL: Record<Permit, string> = {
  none: 'Пропуск не нужен',
  reserve_pass: 'Нужен пропуск Кавказского заповедника',
  site_ticket: 'Входной билет на объект',
  check: 'Нужно уточнить',
  restricted_or_special: 'Особый режим доступа',
}

export const PAID_LABEL: Record<Paid, string> = {
  no: 'Бесплатно',
  yes: 'Платно',
  check: 'Нужно уточнить',
  included_or_check: 'Может входить в другой билет — уточнить',
}

export const SEASON_LABEL: Record<Season, string> = {
  all_year: 'Круглый год',
  summer_route: 'Летний маршрут',
  weather_dependent: 'Зависит от погоды',
  restricted: 'Режим ограничен',
}

export const TIME_LABEL: Record<TimeBucket, string> = {
  under30: 'До 30 минут',
  hours1_2: '1–2 часа',
  halfday: 'Полдня',
  fullday: 'Целый день',
  multiday: '2+ дня',
}

export const TIME_ORDER: TimeBucket[] = ['under30', 'hours1_2', 'halfday', 'fullday', 'multiday']

export const CATEGORY_LABEL: Record<string, string> = {
  waterfall: 'Водопад',
  waterfall_group: 'Каскад водопадов',
  waterfall_canyon: 'Водопад в каньоне',
  waterfall_history: 'Водопад с историей',
  cave: 'Пещера',
  cave_scientific: 'Пещера, научный объект',
  cave_history: 'Пещера, археология',
  grotto: 'Грот',
  canyon: 'Каньон',
  mountain: 'Гора',
  mountain_pass: 'Перевал',
  mountain_shelter: 'Приют',
  ridge: 'Хребет',
  rock: 'Скала',
  rock_viewpoint: 'Скала-смотровая',
  viewpoint: 'Смотровая',
  viewpoint_history: 'Смотровая с историей',
  viewpoint_trailhead: 'Смотровая и начало тропы',
  lake: 'Озеро',
  water: 'Водоём',
  spring: 'Источник',
  river_confluence: 'Слияние рек',
  river_valley: 'Долина реки',
  dolmen: 'Дольмен',
  dolmen_group: 'Группа дольменов',
  archaeology: 'Археология',
  archaeology_candidate: 'Археология, требует проверки',
  history: 'История',
  industrial_history: 'Промышленная история',
  nature_history: 'Природа и история',
  museum: 'Музей',
  monastery: 'Монастырь',
  architecture: 'Архитектура',
  geology: 'Геология',
  bridge: 'Мост',
  village: 'Посёлок',
  checkpoint: 'КПП',
  cableway: 'Канатная дорога',
  visitor_center: 'Визит-центр',
  wildlife_center: 'Центр животных',
  eco_trail: 'Экотропа',
  activity: 'Активность',
  camp_area: 'Стоянка',
  meadow: 'Поляна',
}

/** Крупные группы категорий для фильтра «по типу». */
export const CATEGORY_GROUPS: { id: string; label: string; categories: string[] }[] = [
  { id: 'waterfalls', label: 'Водопады', categories: ['waterfall', 'waterfall_group', 'waterfall_canyon', 'waterfall_history'] },
  { id: 'canyons', label: 'Каньоны', categories: ['canyon', 'river_valley', 'river_confluence'] },
  { id: 'caves', label: 'Пещеры', categories: ['cave', 'cave_scientific', 'cave_history', 'grotto'] },
  { id: 'dolmens', label: 'Дольмены', categories: ['dolmen', 'dolmen_group', 'archaeology', 'archaeology_candidate'] },
  { id: 'mountains', label: 'Горы', categories: ['mountain', 'mountain_pass', 'ridge', 'rock', 'mountain_shelter'] },
  { id: 'viewpoints', label: 'Смотровые', categories: ['viewpoint', 'viewpoint_history', 'viewpoint_trailhead', 'rock_viewpoint', 'meadow'] },
  { id: 'museums', label: 'Музеи', categories: ['museum', 'visitor_center', 'wildlife_center'] },
  { id: 'history', label: 'История', categories: ['history', 'industrial_history', 'nature_history', 'monastery', 'architecture', 'bridge'] },
  { id: 'lakes', label: 'Озёра', categories: ['lake', 'water'] },
  { id: 'rivers', label: 'Реки и источники', categories: ['spring', 'river_valley', 'river_confluence'] },
]

export const VERIFICATION_LABEL: Record<string, string> = {
  verified: 'Официальный источник',
  high: 'Данные подтверждены',
  needs_verification: 'Геопривязка и логистика уточняются',
}
