import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, X } from 'lucide-react'
import { useEffect } from 'react'
import type { EnrichedPOI } from '../data/types'
import { ACCESS_SHORT, CATEGORY_LABEL } from '../data/taxonomy'
import { useIsDesktop, usePrefersReducedMotion } from '../hooks'
import PoiDetails from './PoiDetails'
import { DifficultyMeter } from './ui'

/* ------------------------------------------------------------------ */
/* Строка каталога — «полевой реестр», а не карточка                   */
/* ------------------------------------------------------------------ */

export function PoiRow({
  poi,
  active,
  onSelect,
  index,
  to,
}: {
  poi: EnrichedPOI
  active?: boolean
  onSelect?: (id: string) => void
  index?: number
  /** Если задано — строка ведёт на страницу места, а не открывает панель. */
  to?: string
}) {
  const inner = (
    <>
      <span className="mt-[3px] w-7 shrink-0 text-right text-[12px] tabular text-haze">
        {index !== undefined ? index + 1 : ''}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-[15px] font-medium text-snow">{poi.name}</span>
          {!poi.publish_by_default && <span className="text-[11px] text-ember">справочный объект</span>}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-fog">
          <span>{CATEGORY_LABEL[poi.category] ?? poi.category}</span>
          <span className="text-haze">·</span>
          <span>{poi.branchName}</span>
          <span className="text-haze">·</span>
          <span>{ACCESS_SHORT[poi.access]}</span>
          {poi.permit === 'reserve_pass' && <span className="text-lichen">пропуск</span>}
          {!poi.mapPoint && (
            <span className="inline-flex items-center gap-1 text-lichen">
              <MapPin size={11} /> координаты уточняются
            </span>
          )}
        </span>
      </span>
      <span className="mt-1.5 shrink-0">
        <DifficultyMeter value={poi.difficulty} />
      </span>
    </>
  )

  const cls = 'register-row flex w-full items-start gap-3 px-3 py-3 text-left no-underline sm:px-4'
  const label = `${poi.name}. ${CATEGORY_LABEL[poi.category] ?? poi.category}`

  if (to) {
    return (
      <Link to={to} className={cls} aria-label={label} data-active={active ? 'true' : 'false'}>
        {inner}
      </Link>
    )
  }

  return (
    <button
      type="button"
      data-active={active ? 'true' : 'false'}
      onClick={() => onSelect?.(poi.id)}
      className={cls}
      aria-label={label}
    >
      {inner}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Панель: side drawer на desktop, bottom sheet на телефоне            */
/* ------------------------------------------------------------------ */

export function PoiPanel({ poi, onClose }: { poi: EnrichedPOI | null; onClose: () => void }) {
  const isDesktop = useIsDesktop()
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const variants = isDesktop
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }

  return (
    <AnimatePresence>
      {poi && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-basalt/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={poi.name}
            className="glass fixed z-50 thin-scroll overflow-y-auto
              inset-x-0 bottom-0 max-h-[88vh] rounded-t-sheet border-b-0
              lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[min(520px,42vw)] lg:rounded-t-none lg:border-r-0"
            {...variants}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="sticky top-0 z-10 nav-blur border-b border-fog/12 px-4 py-3 sm:px-6">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-fog/25 lg:hidden" />
              <div className="flex items-start justify-between gap-4">
                <h2 className="display-mid m-0 text-[22px] leading-tight sm:text-[26px]">{poi.name}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="-mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-fog hover:bg-fog/10 hover:text-snow"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <PoiDetails poi={poi} />
              <Link
                to={`/place/${poi.slug}`}
                className="mt-6 inline-block text-[13.5px] text-glacial hover:underline"
              >
                Открыть отдельной страницей
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
