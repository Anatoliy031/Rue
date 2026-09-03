import { Search, X } from 'lucide-react'
import { ACCESS_GROUPS, CATEGORY_GROUPS, TIME_LABEL, TIME_ORDER } from '../data/taxonomy'
import { BRANCHES } from '../data/guide'
import { activeFilterCount, EMPTY_FILTERS, toggle, type FilterState } from '../lib/filters'
import type { TimeBucket } from '../data/types'

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-[36px] rounded-full border px-3 py-1.5 text-left text-[13px] leading-tight transition-colors duration-150 ${
        on
          ? 'border-glacial/60 bg-glacial/15 text-snow'
          : 'border-fog/18 text-fog hover:border-fog/40 hover:text-snow'
      }`}
    >
      {children}
    </button>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-fog/10 pt-4">
      <h3 className="mb-2.5 text-[13px] font-semibold text-snow">{label}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

interface Props {
  value: FilterState
  onChange: (f: FilterState) => void
  resultCount: number
  totalCount: number
}

export default function Filters({ value: f, onChange, resultCount, totalCount }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...f, ...patch })
  const count = activeFilterCount(f)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-haze" />
        <input
          type="search"
          value={f.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Название, ветка или что там есть"
          aria-label="Поиск по местам"
          className="w-full rounded-lg border border-fog/18 bg-stone/60 py-2.5 pl-9 pr-3 text-[14px] text-snow placeholder:text-haze focus:border-glacial/50 focus:outline-none"
        />
      </div>

      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-fog tabular">
          {resultCount} из {totalCount}
        </span>
        {count > 0 && (
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS })}
            className="inline-flex items-center gap-1 text-glacial hover:underline"
          >
            <X size={13} /> сбросить {count}
          </button>
        )}
      </div>

      <Group label="Как добираться">
        {ACCESS_GROUPS.map((g) => (
          <Toggle key={g.id} on={f.access.includes(g.id)} onClick={() => set({ access: toggle(f.access, g.id) })}>
            <span className="mr-1.5" aria-hidden="true">
              {g.glyph}
            </span>
            {g.label}
          </Toggle>
        ))}
      </Group>

      <Group label="Сколько времени займёт">
        {TIME_ORDER.map((t) => (
          <Toggle key={t} on={f.time.includes(t)} onClick={() => set({ time: toggle(f.time, t as TimeBucket) })}>
            {TIME_LABEL[t]}
          </Toggle>
        ))}
      </Group>

      <Group label="Что это">
        {CATEGORY_GROUPS.map((g) => (
          <Toggle
            key={g.id}
            on={f.categories.includes(g.id)}
            onClick={() => set({ categories: toggle(f.categories, g.id) })}
          >
            {g.label}
          </Toggle>
        ))}
      </Group>

      <Group label="Участок маршрута">
        <Toggle on={f.branch === null} onClick={() => set({ branch: null })}>
          Весь маршрут
        </Toggle>
        {BRANCHES.map((b) => (
          <Toggle key={b.id} on={f.branch === b.id} onClick={() => set({ branch: f.branch === b.id ? null : b.id })}>
            {b.name}
          </Toggle>
        ))}
      </Group>

      <Group label="Дополнительно">
        <Toggle on={f.free} onClick={() => set({ free: !f.free, paid: false })}>
          Бесплатно
        </Toggle>
        <Toggle on={f.paid} onClick={() => set({ paid: !f.paid, free: false })}>
          Платно
        </Toggle>
        <Toggle on={f.family} onClick={() => set({ family: !f.family })}>
          Подходит с детьми
        </Toggle>
        <Toggle on={f.verifiedOnly} onClick={() => set({ verifiedOnly: !f.verifiedOnly })}>
          Только официально проверенные
        </Toggle>
        <Toggle on={f.showRare} onClick={() => set({ showRare: !f.showRare })}>
          Показать малоизвестные
        </Toggle>
      </Group>

      {f.showRare && (
        <p className="rounded-lg border border-ember/35 bg-ember/[0.07] px-3 py-2.5 text-[13px] leading-snug text-ember">
          В выдачу добавлены необорудованные и справочные объекты. Они есть в базе для полноты, но это не туристические
          точки: без опыта и сопровождения туда не ходят.
        </p>
      )}
    </div>
  )
}
