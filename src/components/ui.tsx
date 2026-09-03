import { AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Difficulty, EnrichedPOI, VerificationStatus, Warning } from '../data/types'
import { ACCESS_SHORT, DIFFICULTY_HINT, DIFFICULTY_LABEL, VERIFICATION_LABEL } from '../data/taxonomy'

/* ------------------------------------------------------------------ */

export function Chip({
  children,
  tone = 'neutral',
  title,
}: {
  children: ReactNode
  tone?: 'neutral' | 'glacial' | 'lichen' | 'ember'
  title?: string
}) {
  const tones = {
    neutral: 'border-fog/20 text-fog',
    glacial: 'border-glacial/35 text-glacial',
    lichen: 'border-lichen/40 text-lichen',
    ember: 'border-ember/45 text-ember',
  }
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] leading-none ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */

const DIFF_STEPS: Record<Difficulty, number> = {
  easy: 1,
  moderate: 2,
  hard: 3,
  expert: 4,
  restricted: 4,
}

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: 'bg-glacial',
  moderate: 'bg-glacial',
  hard: 'bg-lichen',
  expert: 'bg-ember',
  restricted: 'bg-ember',
}

export function DifficultyMeter({ value, showLabel = false }: { value: Difficulty; showLabel?: boolean }) {
  const steps = DIFF_STEPS[value]
  return (
    <span
      className="inline-flex items-center gap-2"
      title={`${DIFFICULTY_LABEL[value]} — ${DIFFICULTY_HINT[value]}`}
    >
      <span className="inline-flex gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`block h-[3px] w-[9px] rounded-full ${i < steps ? DIFF_COLOR[value] : 'bg-fog/20'}`}
          />
        ))}
      </span>
      <span className="sr-only">{DIFFICULTY_LABEL[value]}</span>
      {showLabel && <span className="text-[12px] text-fog">{DIFFICULTY_LABEL[value]}</span>}
    </span>
  )
}

/* ------------------------------------------------------------------ */

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === 'verified') return <Chip tone="glacial">Официальный источник</Chip>
  if (status === 'high') return <Chip tone="neutral">Данные подтверждены</Chip>
  return <Chip tone="lichen">{VERIFICATION_LABEL.needs_verification}</Chip>
}

export function AccessChip({ poi }: { poi: EnrichedPOI }) {
  const tone = poi.access === 'restricted' ? 'ember' : poi.access === 'hike_permit' ? 'lichen' : 'neutral'
  return <Chip tone={tone}>{ACCESS_SHORT[poi.access]}</Chip>
}

/* ------------------------------------------------------------------ */

const WARN_STYLE = {
  info: { icon: Info, cls: 'border-fog/20 bg-fog/5 text-fog' },
  caution: { icon: AlertTriangle, cls: 'border-lichen/30 bg-lichen/[0.07] text-lichen' },
  danger: { icon: ShieldAlert, cls: 'border-ember/40 bg-ember/[0.08] text-ember' },
} as const

export function WarningList({ warnings, compact = false }: { warnings: Warning[]; compact?: boolean }) {
  if (!warnings.length) return null
  const order = { danger: 0, caution: 1, info: 2 }
  const sorted = [...warnings].sort((a, b) => order[a.level] - order[b.level])
  const shown = compact ? sorted.filter((w) => w.level !== 'info') : sorted
  if (!shown.length) return null

  return (
    <ul className="space-y-2 list-none p-0 m-0">
      {shown.map((w, i) => {
        const { icon: Icon, cls } = WARN_STYLE[w.level]
        return (
          <li key={i} className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-[13.5px] leading-snug ${cls}`}>
            <Icon size={15} className="mt-[3px] shrink-0" aria-hidden="true" />
            <span>{w.text}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Топографический плейсхолдер вместо выдуманной фотографии            */
/* ------------------------------------------------------------------ */

const CATEGORY_MARK: Record<string, string> = {
  waterfall: 'M12 3v9M8 12c0 4 8 4 8 0M6 20c2-2 4-2 6 0s4 2 6 0',
  cave: 'M4 20V13a8 8 0 0 1 16 0v7M9 20v-4a3 3 0 0 1 6 0v4',
  mountain: 'M2 20l7-13 4 7 3-4 6 10z',
  canyon: 'M4 3v9l4 8M20 3v9l-4 8',
  dolmen: 'M4 9h16M6 9v11M18 9v11M4 9l8-5 8 5',
  viewpoint: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z M12 12h.01',
  museum: 'M3 10h18L12 4zM5 10v9M19 10v9M9 10v9M15 10v9M3 21h18',
  lake: 'M3 14c3-2 5 2 8 0s5-2 9 0M3 18c3-2 5 2 8 0s5-2 9 0',
  history: 'M12 3v18M5 7h14M7 7v6a5 5 0 0 0 10 0V7',
  default: 'M3 17l5-8 4 5 3-4 6 7z',
}

function markFor(category: string) {
  if (category.startsWith('waterfall')) return CATEGORY_MARK.waterfall
  if (category.startsWith('cave') || category === 'grotto') return CATEGORY_MARK.cave
  if (category.startsWith('mountain') || category === 'ridge' || category.startsWith('rock')) return CATEGORY_MARK.mountain
  if (category.startsWith('canyon') || category.startsWith('river')) return CATEGORY_MARK.canyon
  if (category.startsWith('dolmen') || category.startsWith('archaeology')) return CATEGORY_MARK.dolmen
  if (category.startsWith('viewpoint') || category === 'meadow') return CATEGORY_MARK.viewpoint
  if (category === 'museum' || category === 'visitor_center' || category === 'architecture' || category === 'monastery')
    return CATEGORY_MARK.museum
  if (category === 'lake' || category === 'water' || category === 'spring') return CATEGORY_MARK.lake
  if (category.endsWith('history')) return CATEGORY_MARK.history
  return CATEGORY_MARK.default
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Вместо фотографии, которой у нас нет и которую нельзя выдумать, —
 * детерминированный «фрагмент топокарты», уникальный для каждого места.
 */
export function PlaceholderArt({ poi, className = '' }: { poi: EnrichedPOI; className?: string }) {
  const seed = hash(poi.id)
  const rings = 5 + (seed % 5)
  const cx = 40 + (seed % 120)
  const cy = 30 + ((seed >> 3) % 70)

  return (
    <div className={`relative overflow-hidden bg-stone ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 130" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#78C6C1" strokeOpacity="0.22">
          {Array.from({ length: rings }).map((_, i) => {
            const r = 14 + i * 15
            const k = ((seed >> (i + 1)) % 10) / 40 + 0.9
            return <ellipse key={i} cx={cx} cy={cy} rx={r * k} ry={r * 0.66} />
          })}
        </g>
        <g
          transform={`translate(${100 - 14}, ${65 - 14}) scale(1.2)`}
          fill="none"
          stroke="#EAEFEE"
          strokeOpacity="0.5"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={markFor(poi.category)} />
        </g>
      </svg>
    </div>
  )
}
