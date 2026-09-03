export type AccessMode =
  | 'car'
  | 'car_walk'
  | 'car_hike'
  | 'car_cable'
  | 'cable_walk'
  | 'cable_hike'
  | 'walk'
  | 'hike'
  | '4x4_hike'
  | 'hike_permit'
  | 'restricted'

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'expert' | 'restricted'
export type VerificationStatus = 'verified' | 'high' | 'needs_verification'
export type Detour = 'on_route' | 'short_detour' | 'side_trip'
export type Family = 'yes' | 'with_caution' | 'no'
export type Permit = 'none' | 'reserve_pass' | 'site_ticket' | 'check' | 'restricted_or_special'
export type Paid = 'no' | 'yes' | 'check' | 'included_or_check'
export type Season = 'all_year' | 'summer_route' | 'weather_dependent' | 'restricted'

export interface Coordinates {
  lat: number
  lon: number
}

export interface Source {
  title: string
  url: string
  type: 'official' | 'reference' | 'media' | 'community' | string
}

export interface Branch {
  id: string
  name: string
  path: string
  mode: string
}

export interface POI {
  id: string
  name: string
  aliases: string[]
  branch: string
  category: string
  access: AccessMode
  detour: Detour
  walk_distance_km: string | null
  difficulty: Difficulty
  family: Family
  permit: Permit
  paid: Paid
  season: Season
  coordinates: Coordinates | null
  description: string
  safety: string | null
  verification_status: VerificationStatus
  publish_by_default: boolean
  source_keys: string[]
  /** Заполняется скриптом geocode.mjs, а не вручную. */
  geocode?: {
    lat: number
    lon: number
    confidence: 'exact' | 'probable'
    matched: string
    provider: string
    fetched_at: string
  }
  /** Задел на будущее: фотографии добавляются позже, база это уже поддерживает. */
  images?: { src: string; credit: string; license: string }[]
}

export interface GuideMeta {
  title: string
  version: string
  generated_at: string
  language: string
  scope: string
  important_route_note: string
  reserve_status_2026: string
  reserve_ticket_snapshot: string
  data_policy: string
}

export interface GuideData {
  meta: GuideMeta
  sources: Record<string, Source>
  branches: Branch[]
  pois: POI[]
}

/** POI + вычисленные поля, которыми пользуется интерфейс. */
export interface EnrichedPOI extends POI {
  slug: string
  branchName: string
  mapPoint: Coordinates | null
  mapPointIsGeocoded: boolean
  timeBucket: TimeBucket
  warnings: Warning[]
}

export type TimeBucket = 'under30' | 'hours1_2' | 'halfday' | 'fullday' | 'multiday'

export interface Warning {
  level: 'info' | 'caution' | 'danger'
  text: string
}
