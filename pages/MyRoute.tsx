import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Copy, Trash2, X } from 'lucide-react'
import { buildSuggestedRoute, getPoiById } from '../data/guide'
import { CATEGORY_LABEL } from '../data/taxonomy'
import { PoiPanel, PoiRow } from '../components/PoiPanel'
import { decodeRoute, encodeRoute, useMyRoute, useSeo } from '../hooks'
import { WarningList } from '../components/ui'

export default function MyRoute() {
  const { ids, remove, clear, replace } = useMyRoute()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [imported, setImported] = useState<number | null>(null)

  useSeo({
    title: 'Мой маршрут — Дорога в Гузерипль',
    description: 'Соберите свой список мест, посмотрите сводку по времени, пропускам и предупреждениям, поделитесь ссылкой.',
    path: '/my-route',
  })

  /* Импорт маршрута из ссылки */
  const shared = params.get('r')
  useEffect(() => {
    if (!shared) return
    const incoming = decodeRoute(shared).filter((id) => !!getPoiById(id))
    if (incoming.length) {
      replace([...ids, ...incoming])
      setImported(incoming.length)
    }
    params.delete('r')
    setParams(params, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared])

  const { pois, summary } = useMemo(() => buildSuggestedRoute(ids), [ids])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    return `${window.location.origin}${base}/my-route?r=${encodeURIComponent(encodeRoute(ids))}`
  }, [ids])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  if (!ids.length) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6 sm:py-28">
        <h1 className="display-mid m-0 text-[clamp(1.9rem,5.5vw,3rem)]">Маршрут пока пустой</h1>
        <p className="mt-4 text-[15.5px] leading-relaxed text-fog">
          Открывайте места в каталоге или на карте и добавляйте их сюда. Как только наберётся несколько точек, здесь
          появится сводка: сколько времени это займёт, где нужен пропуск и не смешаны ли ветки, между которыми нет
          проезда.
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            to="/places"
            className="inline-flex min-h-[48px] items-center rounded-lg bg-snow px-5 text-[14.5px] font-semibold text-basalt hover:bg-glacial"
          >
            Открыть каталог
          </Link>
          <Link
            to="/routes"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-fog/25 px-5 text-[14.5px] text-snow hover:border-glacial/60"
          >
            Начать с готовой подборки
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="display-mid m-0 text-[clamp(1.9rem,5.5vw,3rem)]">Мой маршрут</h1>
          <button
            type="button"
            onClick={clear}
            className="inline-flex min-h-[40px] items-center gap-1.5 text-[13.5px] text-fog hover:text-ember"
          >
            <Trash2 size={14} /> Очистить
          </button>
        </div>

        {imported !== null && (
          <p className="mt-4 rounded-lg border border-glacial/35 bg-glacial/[0.08] px-4 py-3 text-[14px] text-glacial">
            Из ссылки добавлено мест: {imported}.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <ol className="m-0 list-none rounded-xl border border-fog/12 p-0">
              {pois.map((p, i) => (
                <li key={p.id} className="relative">
                  <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label={`Убрать ${p.name} из маршрута`}
                    className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-haze hover:bg-fog/10 hover:text-ember"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-5">
            <div className="glass rounded-xl p-5">
              <h2 className="m-0 text-[15px] font-semibold">Сводка</h2>
              <dl className="mt-3 space-y-2 text-[14px]">
                {[
                  { k: 'Остановок', v: String(summary.stops) },
                  { k: 'Ориентировочно', v: summary.estimate },
                  { k: 'Нужно идти пешком', v: `${summary.needWalking} из ${summary.stops}` },
                  { k: 'Нужен пропуск', v: String(summary.needPermit) },
                  { k: 'Участков маршрута', v: String(summary.branches.length) },
                  { k: 'Данные уточняются', v: String(summary.needsVerification) },
                  { k: 'Нет координат', v: String(summary.noCoordinates) },
                ].map((r) => (
                  <div key={r.k} className="flex items-baseline justify-between gap-4 border-b border-fog/10 pb-2">
                    <dt className="text-fog">{r.k}</dt>
                    <dd className="m-0 text-right text-snow">{r.v}</dd>
                  </div>
                ))}
              </dl>

              {summary.categories.length > 0 && (
                <p className="mt-3 text-[13px] leading-relaxed text-fog">
                  {summary.categories
                    .slice(0, 5)
                    .map((c) => `${CATEGORY_LABEL[c.label] ?? c.label} — ${c.count}`)
                    .join(', ')}
                </p>
              )}
            </div>

            {summary.conflicts.length > 0 && (
              <WarningList warnings={summary.conflicts.map((text) => ({ level: 'caution' as const, text }))} />
            )}

            {summary.hazards > 0 && (
              <WarningList
                warnings={[
                  {
                    level: 'danger',
                    text: `В маршруте ${summary.hazards} мест с серьёзными предупреждениями. Откройте каждое и прочитайте, что именно там опасно.`,
                  },
                ]}
              />
            )}

            <div className="glass-soft rounded-xl p-5">
              <h2 className="m-0 text-[15px] font-semibold">Поделиться</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-fog">
                Ссылка содержит только список мест. Тот, кто её откроет, добавит их к своему маршруту.
              </p>
              <button
                type="button"
                onClick={copy}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-fog/25 px-4 text-[14px] text-snow hover:border-glacial/60 hover:text-glacial"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
              </button>
            </div>

            <p className="text-[12px] leading-relaxed text-haze">
              Маршрут хранится только в этом браузере. Если очистить данные сайта, список пропадёт.
            </p>
          </aside>
        </div>
      </div>

      <PoiPanel poi={selected ? (getPoiById(selected) ?? null) : null} onClose={() => setSelected(null)} />
    </>
  )
}
