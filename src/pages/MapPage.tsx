import { Suspense, lazy, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layers, List, MapPin, SlidersHorizontal, X } from 'lucide-react'
import Filters from '../components/Filters'
import { PoiPanel, PoiRow } from '../components/PoiPanel'
import { POIS, getPoiById } from '../data/guide'
import { applyFilters, filtersToParams, paramsToFilters } from '../lib/filters'
import { useIsDesktop, useSeo } from '../hooks'

const MapCanvas = lazy(() => import('../components/MapCanvas'))

export default function MapPage() {
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<string | null>(null)
  const [panel, setPanel] = useState<'list' | 'filters' | null>(null)
  const [showRoute, setShowRoute] = useState(true)
  const [showReserve, setShowReserve] = useState(true)
  const isDesktop = useIsDesktop()

  const filters = useMemo(() => paramsToFilters(params), [params])
  const results = useMemo(() => applyFilters(POIS, filters), [filters])
  const mapped = useMemo(() => results.filter((p) => p.mapPoint), [results])
  const unmapped = results.length - mapped.length

  useSeo({
    title: 'Карта маршрута — Дорога в Гузерипль',
    description:
      'Интерактивная карта мест на маршруте Краснодар → Гузерипль с кластеризацией, линиями автомобильных веток и слоем высокогорья.',
    path: '/map',
  })

  const update = (next: typeof filters) => setParams(filtersToParams(next), { replace: true })

  const layerToggles = (
    <div className="glass-soft rounded-lg p-1.5">
      {[
        { on: showRoute, set: setShowRoute, label: 'Линии дорог' },
        { on: showReserve, set: setShowReserve, label: 'Высокогорье и заповедник' },
      ].map((t) => (
        <button
          key={t.label}
          type="button"
          aria-pressed={t.on}
          onClick={() => t.set(!t.on)}
          className={`flex min-h-[36px] w-full items-center gap-2 rounded px-2.5 text-left text-[12.5px] ${
            t.on ? 'text-glacial' : 'text-fog'
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${t.on ? 'bg-glacial' : 'border border-fog/50'}`}
            aria-hidden="true"
          />
          {t.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative h-[calc(100svh-3.5rem)] w-full">
      <Suspense
        fallback={
          <div className="grid h-full place-items-center text-[14px] text-fog">
            Загружаем карту. Список мест работает и без неё.
          </div>
        }
      >
        <MapCanvas
          pois={mapped}
          activeId={selected}
          onSelect={setSelected}
          showRoute={showRoute}
          showReserveLayer={showReserve}
          className="h-full w-full"
          fitKey={params.toString()}
        />
      </Suspense>

      {/* Панель слоёв */}
      <div className="pointer-events-none absolute right-3 top-3 z-[500] flex flex-col items-end gap-2">
        <div className="pointer-events-auto hidden sm:block">{layerToggles}</div>
      </div>

      {/* Сводка */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500] max-w-[min(340px,calc(100%-1.5rem))] lg:hidden">
        <div className="glass pointer-events-auto rounded-lg px-3.5 py-2.5">
          <p className="m-0 text-[13px] text-snow">
            <span className="tabular font-semibold">{mapped.length}</span> точек на карте
          </p>
          {unmapped > 0 && (
            <p className="m-0 mt-1 flex items-start gap-1.5 text-[12px] leading-snug text-lichen">
              <MapPin size={12} className="mt-[2px] shrink-0" />
              ещё {unmapped} подходят под фильтр, но их координаты не подтверждены — они есть в списке
            </p>
          )}
        </div>
      </div>

      {/* Кнопки на телефоне */}
      <div className="absolute inset-x-3 bottom-3 z-[500] flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setPanel('filters')}
          className="glass inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg text-[14px] text-snow"
        >
          <SlidersHorizontal size={16} /> Фильтры
        </button>
        <button
          type="button"
          onClick={() => setPanel('list')}
          className="glass inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg text-[14px] text-snow"
        >
          <List size={16} /> Список
        </button>
        <button
          type="button"
          onClick={() => setShowReserve(!showReserve)}
          aria-pressed={showReserve}
          aria-label="Слой высокогорья"
          className="glass grid h-12 w-12 place-items-center rounded-lg text-snow"
        >
          <Layers size={16} className={showReserve ? 'text-glacial' : 'text-fog'} />
        </button>
      </div>

      {/* Боковая колонка на desktop */}
      {isDesktop && (
        <div className="glass absolute bottom-4 left-3 top-4 z-[500] flex w-[330px] flex-col rounded-xl">
          <div className="border-b border-fog/12 p-4">
            <p className="mb-3 text-[13px] text-snow">
              <span className="tabular font-semibold">{mapped.length}</span> точек на карте
              {unmapped > 0 && (
                <span className="mt-1 block text-[12px] leading-snug text-lichen">
                  ещё {unmapped} подходят под фильтр, но их координаты не подтверждены — они ниже в списке
                </span>
              )}
            </p>
            <Filters value={filters} onChange={update} resultCount={results.length} totalCount={POIS.length} />
          </div>
          <ol className="m-0 thin-scroll flex-1 list-none overflow-y-auto p-0">
            {results.map((p, i) => (
              <li key={p.id}>
                <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Шторки на телефоне */}
      {panel && !isDesktop && (
        <div className="fixed inset-0 z-[600]">
          <div className="absolute inset-0 bg-basalt/80" onClick={() => setPanel(null)} aria-hidden="true" />
          <div className="glass absolute inset-x-0 bottom-0 max-h-[85vh] thin-scroll overflow-y-auto rounded-t-sheet pb-8">
            <div className="sticky top-0 nav-blur flex items-center justify-between border-b border-fog/12 px-4 py-3">
              <h2 className="m-0 text-[16px] font-semibold">{panel === 'list' ? 'Список мест' : 'Фильтры'}</h2>
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label="Закрыть"
                className="grid h-11 w-11 place-items-center rounded-full text-fog"
              >
                <X size={18} />
              </button>
            </div>
            {panel === 'filters' ? (
              <div className="px-4 pt-4">
                <Filters value={filters} onChange={update} resultCount={results.length} totalCount={POIS.length} />
                <div className="mt-4">{layerToggles}</div>
              </div>
            ) : (
              <ol className="m-0 list-none p-0">
                {results.map((p, i) => (
                  <li key={p.id}>
                    <PoiRow
                      poi={p}
                      index={i}
                      active={selected === p.id}
                      onSelect={(id) => {
                        setSelected(id)
                        setPanel(null)
                      }}
                    />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      <PoiPanel poi={selected ? (getPoiById(selected) ?? null) : null} onClose={() => setSelected(null)} />
    </div>
  )
}
