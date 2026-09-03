import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { COLLECTIONS, collectionCount, collectionSections, getCollection } from '../data/collections'
import { BRANCHES, POIS, getPoiById } from '../data/guide'
import { PoiPanel, PoiRow } from '../components/PoiPanel'
import { useSeo } from '../hooks'
import TopoLines from '../components/TopoLines'

export function RoutesIndex() {
  useSeo({
    title: 'Подборки и участки маршрута — Дорога в Гузерипль',
    description:
      'Готовые сценарии поездки: без ходьбы, один день, с детьми, водопады, пещеры, дольмены, горы без похода и официальные маршруты заповедника.',
    path: '/routes',
  })

  const counts = new Map<string, number>()
  for (const p of POIS) counts.set(p.branch, (counts.get(p.branch) ?? 0) + 1)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="display-mid m-0 max-w-[20ch] text-[clamp(1.9rem,5.5vw,3.2rem)] leading-tight">
        Восемь способов проехать одну и ту же дорогу
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15.5px] leading-relaxed text-fog">
        Подборки собраны из той же базы, что и каталог, — просто отобраны по тому, ради чего вы едете. Внутри каждой
        сложность разделена, чтобы «водопады» не оказались одним списком из прогулки и скалолазания.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            to={`/route/${c.slug}`}
            className="glass-soft flex flex-col rounded-xl p-6 no-underline transition-colors duration-150 hover:border-glacial/40"
          >
            <span className="display-mid text-[19px] leading-tight text-snow">{c.title}</span>
            <span className="mt-3 flex-1 text-[14px] leading-relaxed text-fog">{c.lead}</span>
            <span className="mt-5 inline-flex items-center gap-2 text-[13px] text-glacial">
              <span className="tabular">{collectionCount(c)} мест</span>
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="display-mid mt-16 text-[clamp(1.4rem,3.6vw,2.2rem)]">Участки маршрута</h2>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-fog">
        Если удобнее думать географически, а не по интересам — вот те же места, разложенные по съездам с дороги.
      </p>
      <ul className="mt-6 grid list-none gap-px overflow-hidden rounded-xl border border-fog/12 bg-fog/12 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {BRANCHES.map((b) => (
          <li key={b.id} className="bg-basalt">
            <Link
              to={`/places?branch=${b.id}`}
              className="flex h-full flex-col gap-2 p-5 no-underline hover:bg-stone/70"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-snow">{b.name}</span>
                <span className="tabular text-[13px] text-glacial">{counts.get(b.id) ?? 0}</span>
              </span>
              <span className="text-[13px] leading-relaxed text-fog">{b.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TONE_CLS = {
  normal: 'border-fog/12',
  caution: 'border-lichen/30',
  danger: 'border-ember/35',
} as const

export function RouteDetail() {
  const { slug = '' } = useParams()
  const collection = getCollection(slug)
  const [selected, setSelected] = useState<string | null>(null)

  useSeo({
    title: collection ? `${collection.title} — Дорога в Гузерипль` : 'Подборка не найдена',
    description: collection?.lead ?? 'Такой подборки нет.',
    path: `/route/${slug}`,
  })

  if (!collection) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center sm:px-6">
        <h1 className="display-mid m-0 text-[2rem]">Такой подборки нет</h1>
        <Link to="/routes" className="mt-5 inline-block text-glacial hover:underline">
          Ко всем подборкам
        </Link>
      </div>
    )
  }

  const sections = collectionSections(collection)

  return (
    <>
      <header className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
        <TopoLines className="pointer-events-none absolute inset-0 h-full w-full opacity-30" opacity={0.25} />
        <div className="relative mx-auto max-w-[1400px]">
          <Link to="/routes" className="text-[13px] text-fog hover:text-glacial">
            Подборки
          </Link>
          <h1 className="display-mid m-0 mt-3 max-w-[18ch] text-[clamp(2rem,6vw,3.4rem)] leading-[1.03]">
            {collection.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[15.5px] leading-relaxed text-snow/85">{collection.lead}</p>
          {collection.caveat && (
            <p className="mt-4 max-w-[62ch] rounded-lg border border-lichen/30 bg-lichen/[0.07] px-4 py-3 text-[14px] leading-relaxed text-lichen">
              {collection.caveat}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] space-y-10 px-4 pb-20 sm:px-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="m-0 text-[17px] font-semibold text-snow">{s.title}</h2>
            {s.note && (
              <p
                className={`mt-1.5 max-w-[64ch] text-[13.5px] leading-relaxed ${
                  s.tone === 'danger' ? 'text-ember' : s.tone === 'caution' ? 'text-lichen' : 'text-fog'
                }`}
              >
                {s.note}
              </p>
            )}
            <ol className={`mt-4 list-none rounded-xl border p-0 ${TONE_CLS[s.tone ?? 'normal']}`}>
              {s.pois.map((p, i) => (
                <li key={p.id}>
                  <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <PoiPanel poi={selected ? (getPoiById(selected) ?? null) : null} onClose={() => setSelected(null)} />
    </>
  )
}
