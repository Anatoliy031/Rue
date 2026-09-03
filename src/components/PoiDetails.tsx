import { Link } from 'react-router-dom'
import { Check, ExternalLink, MapPin, Navigation, Plus } from 'lucide-react'
import type { EnrichedPOI } from '../data/types'
import {
  ACCESS_LABEL,
  CATEGORY_LABEL,
  DIFFICULTY_HINT,
  DIFFICULTY_LABEL,
  FAMILY_LABEL,
  PAID_LABEL,
  PERMIT_LABEL,
  SEASON_LABEL,
  TIME_LABEL,
} from '../data/taxonomy'
import { META, SOURCES } from '../data/guide'
import { useMyRoute } from '../hooks'
import { DifficultyMeter, PlaceholderArt, VerificationBadge, WarningList } from './ui'

/** Где оставить машину — следствие поля access, а не отдельный факт из источника. */
const PARKING_NOTE: Record<string, string> = {
  car: 'Подъезд к самому объекту.',
  car_walk: 'Машину оставляют у начала подхода. Точное место парковки уточняйте на месте.',
  car_hike: 'Машину оставляют у начала тропы. Точное место уточняйте на месте.',
  car_cable: 'Парковка у нижней станции канатной дороги.',
  cable_walk: 'Парковка у нижней станции канатной дороги, дальше подъём.',
  cable_hike: 'Парковка у нижней станции канатной дороги, дальше пешком.',
  walk: 'Пешком от ближайшей парковки. Точное место уточняйте на месте.',
  hike: 'Машину оставляют у начала маршрута. Точное место уточняйте на месте.',
  '4x4_hike': 'Ближняя точка проезда зависит от погоды и состояния грунтовой дороги.',
  hike_permit: 'Автомобиль остаётся на КПП заповедника.',
  restricted: 'Самостоятельный доступ не предполагается.',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,116px)_1fr] gap-x-4 gap-y-1 border-b border-fog/10 py-2.5 text-[14px] sm:grid-cols-[minmax(0,150px)_1fr]">
      <dt className="text-fog">{label}</dt>
      <dd className="m-0 text-snow">{children}</dd>
    </div>
  )
}

export default function PoiDetails({ poi, compact = false }: { poi: EnrichedPOI; compact?: boolean }) {
  const { has, toggle } = useMyRoute()
  const inRoute = has(poi.id)
  const c = poi.mapPoint

  return (
    <div className="space-y-5">
      {!compact && (
        <PlaceholderArt poi={poi} className="h-40 w-full rounded-xl border border-fog/12 sm:h-52" />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge status={poi.verification_status} />
        <span className="text-[12px] text-haze">проверено {META.generated_at.split('-').reverse().join('.')}</span>
      </div>

      <p className="m-0 text-[16px] leading-relaxed text-snow/90">{poi.description}</p>

      {poi.warnings.length > 0 && <WarningList warnings={poi.warnings} />}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => toggle(poi.id)}
          aria-pressed={inRoute}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-4 text-[14px] font-medium transition-colors duration-150 ${
            inRoute
              ? 'border-glacial/60 bg-glacial/15 text-glacial'
              : 'border-fog/25 text-snow hover:border-glacial/50 hover:text-glacial'
          }`}
        >
          {inRoute ? <Check size={16} /> : <Plus size={16} />}
          {inRoute ? 'В моём маршруте' : 'Добавить в мой маршрут'}
        </button>

        {c ? (
          <a
            href={`https://yandex.ru/maps/?pt=${c.lon},${c.lat}&z=16&l=map`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-fog/25 px-4 text-[14px] text-snow hover:border-glacial/50 hover:text-glacial"
          >
            <Navigation size={16} /> Открыть в навигаторе
          </a>
        ) : (
          <span className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-dashed border-lichen/40 px-4 text-[13px] text-lichen">
            <MapPin size={16} /> Координаты уточняются
          </span>
        )}
      </div>

      <dl className="m-0">
        <Row label="Что это">
          {CATEGORY_LABEL[poi.category] ?? poi.category}
          {poi.aliases.length > 0 && <span className="text-fog"> · также: {poi.aliases.join(', ')}</span>}
        </Row>
        <Row label="Участок">
          <Link to={`/places?branch=${poi.branch}`} className="text-glacial hover:underline">
            {poi.branchName}
          </Link>
        </Row>
        <Row label="Как добираться">{ACCESS_LABEL[poi.access]}</Row>
        <Row label="Где оставить машину">
          <span className="text-snow/85">{PARKING_NOTE[poi.access] ?? 'Нужно уточнить.'}</span>
        </Row>
        <Row label="Сколько идти">
          {poi.walk_distance_km ? (
            poi.walk_distance_km
          ) : poi.access === 'car' ? (
            'Пешком идти практически не нужно'
          ) : (
            <span className="text-lichen">Нужно уточнить</span>
          )}
        </Row>
        <Row label="Сложность">
          <span className="inline-flex flex-wrap items-center gap-2">
            <DifficultyMeter value={poi.difficulty} />
            <span>{DIFFICULTY_LABEL[poi.difficulty]}</span>
            <span className="text-fog">— {DIFFICULTY_HINT[poi.difficulty]}</span>
          </span>
        </Row>
        <Row label="Ориентировочно">{TIME_LABEL[poi.timeBucket]}</Row>
        <Row label="С детьми">{FAMILY_LABEL[poi.family]}</Row>
        <Row label="Сезон">{SEASON_LABEL[poi.season]}</Row>
        <Row label="Пропуск">
          <span className={poi.permit === 'reserve_pass' ? 'text-lichen' : undefined}>{PERMIT_LABEL[poi.permit]}</span>
        </Row>
        <Row label="Деньги">
          {PAID_LABEL[poi.paid]}
          {poi.paid === 'yes' && (
            <span className="text-fog"> — актуальную стоимость смотрите у оператора объекта, в базе цен нет</span>
          )}
        </Row>
        <Row label="Координаты">
          {c ? (
            <span className="tabular">
              {c.lat.toFixed(5)}, {c.lon.toFixed(5)}
              {poi.mapPointIsGeocoded && <span className="text-lichen"> · получены геокодированием</span>}
            </span>
          ) : (
            <span className="text-lichen">Не подтверждены. В базе намеренно оставлено пусто, чтобы не показать вам ложную точку.</span>
          )}
        </Row>
      </dl>

      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-snow">Источники</h3>
        <ul className="m-0 list-none space-y-1.5 p-0">
          {poi.source_keys.map((k) => {
            const s = SOURCES[k]
            if (!s) return null
            return (
              <li key={k}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 text-[13.5px] text-fog hover:text-glacial"
                >
                  <ExternalLink size={13} className="mt-1 shrink-0" />
                  <span>
                    {s.title}
                    {s.type === 'official' && <span className="ml-1.5 text-glacial">официальный</span>}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
