import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import Filters from '../components/Filters'
import { PoiPanel, PoiRow } from '../components/PoiPanel'
import { POIS, getPoiById } from '../data/guide'
import { applyFilters, activeFilterCount, filtersToParams, paramsToFilters } from '../lib/filters'
import { useSeo } from '../hooks'

export default function Places() {
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filters = useMemo(() => paramsToFilters(params), [params])
  const results = useMemo(() => applyFilters(POIS, filters), [filters])

  useSeo({
    title: 'Все места на маршруте — Дорога в Гузерипль',
    description:
      'Каталог из 134 мест от Краснодара до Гузерипля с фильтрами по способу добраться, времени, типу объекта и участку маршрута.',
    path: '/places',
  })

  const update = (next: typeof filters) => setParams(filtersToParams(next), { replace: true })
  const activeCount = activeFilterCount(filters)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="display-mid m-0 text-[clamp(1.8rem,5vw,3rem)]">Все места</h1>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-fog">
          Фильтры комбинируются. Начните с того, как вы готовы добираться — это отсекает большую часть базы быстрее, чем
          выбор по типу объекта.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] thin-scroll overflow-y-auto pr-2">
            <Filters value={filters} onChange={update} resultCount={results.length} totalCount={POIS.length} />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-fog/25 px-4 text-[14px] text-snow"
            >
              <SlidersHorizontal size={16} />
              Фильтры
              {activeCount > 0 && <span className="tabular text-glacial">{activeCount}</span>}
            </button>
            <span className="tabular text-[13px] text-fog">{results.length}</span>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-fog/25 px-6 py-14 text-center">
              <p className="m-0 text-[15px] text-snow">Под эти условия ничего не подходит.</p>
              <p className="mt-2 text-[13.5px] text-fog">
                Снимите один-два фильтра — чаще всего мешает сочетание «прямо на машине» с типом объекта, до которого
                нужно идти.
              </p>
            </div>
          ) : (
            <ol className="m-0 list-none rounded-xl border border-fog/12 p-0">
              {results.map((p, i) => (
                <li key={p.id}>
                  <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-basalt/80" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <div className="glass absolute inset-x-0 bottom-0 max-h-[85vh] thin-scroll overflow-y-auto rounded-t-sheet px-4 pb-8 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-[17px] font-semibold">Фильтры</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Закрыть фильтры"
                className="grid h-11 w-11 place-items-center rounded-full text-fog hover:text-snow"
              >
                <X size={18} />
              </button>
            </div>
            <Filters value={filters} onChange={update} resultCount={results.length} totalCount={POIS.length} />
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-6 min-h-[48px] w-full rounded-lg bg-snow text-[15px] font-semibold text-basalt"
            >
              Показать {results.length}
            </button>
          </div>
        </div>
      )}

      <PoiPanel poi={selected ? (getPoiById(selected) ?? null) : null} onClose={() => setSelected(null)} />
    </div>
  )
}
