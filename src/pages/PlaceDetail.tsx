import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import PoiDetails from '../components/PoiDetails'
import { PoiRow } from '../components/PoiPanel'
import { CATEGORY_LABEL } from '../data/taxonomy'
import { POIS, getPoiBySlug } from '../data/guide'
import { useSeo } from '../hooks'
import TopoLines from '../components/TopoLines'

export default function PlaceDetail() {
  const { slug = '' } = useParams()
  const poi = getPoiBySlug(slug)

  const jsonLd = useMemo(() => {
    if (!poi) return undefined
    const base: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: poi.name,
      description: poi.description,
      alternateName: poi.aliases.length ? poi.aliases : undefined,
      isAccessibleForFree: poi.paid === 'no',
      address: { '@type': 'PostalAddress', addressRegion: 'Республика Адыгея', addressCountry: 'RU' },
    }
    if (poi.mapPoint) {
      base.geo = { '@type': 'GeoCoordinates', latitude: poi.mapPoint.lat, longitude: poi.mapPoint.lon }
    }
    return base
  }, [poi])

  useSeo({
    title: poi ? `${poi.name} — как добраться, сложность, пропуск` : 'Место не найдено',
    description: poi
      ? `${poi.description} ${poi.branchName}. ${CATEGORY_LABEL[poi.category] ?? poi.category}.`.slice(0, 250)
      : 'Такого места в базе нет.',
    path: `/place/${slug}`,
    jsonLd,
  })

  if (!poi) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center sm:px-6">
        <h1 className="display-mid m-0 text-[2rem]">Такого места в базе нет</h1>
        <p className="mt-3 text-[15px] text-fog">
          Возможно, ссылка устарела или в адресе опечатка. Попробуйте найти его в каталоге.
        </p>
        <Link to="/places" className="mt-6 inline-block text-[14.5px] text-glacial hover:underline">
          Открыть каталог
        </Link>
      </div>
    )
  }

  const nearby = POIS.filter((p) => p.branch === poi.branch && p.id !== poi.id).slice(0, 8)

  return (
    <>
      <nav aria-label="Хлебные крошки" className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
        <ol className="m-0 flex flex-wrap list-none items-center gap-1.5 p-0 text-[12.5px] text-fog">
          <li>
            <Link to="/" className="hover:text-glacial">
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/places" className="hover:text-glacial">
              Все места
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/places?branch=${poi.branch}`} className="hover:text-glacial">
              {poi.branchName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-snow">{poi.name}</li>
        </ol>
      </nav>

      <header className="relative overflow-hidden px-4 pb-8 pt-6 sm:px-6">
        <TopoLines className="pointer-events-none absolute inset-0 h-full w-full opacity-30" opacity={0.25} />
        <div className="relative mx-auto max-w-[1400px]">
          <h1 className="display-mid m-0 max-w-[18ch] text-[clamp(1.9rem,6vw,3.4rem)] leading-[1.02]">{poi.name}</h1>
          <p className="mt-3 text-[14px] text-fog">
            {CATEGORY_LABEL[poi.category] ?? poi.category} · {poi.branchName}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article>
          <PoiDetails poi={poi} />
        </article>

        <aside>
          <h2 className="m-0 text-[15px] font-semibold">Рядом, на этом же участке</h2>
          <ol className="mt-3 list-none rounded-xl border border-fog/12 p-0">
            {nearby.map((p) => (
              <li key={p.id}>
                <PoiRow poi={p} to={`/place/${p.slug}`} />
              </li>
            ))}
          </ol>
          <Link
            to={`/places?branch=${poi.branch}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] text-glacial hover:underline"
          >
            <ChevronLeft size={14} /> Весь участок «{poi.branchName}»
          </Link>
        </aside>
      </div>
    </>
  )
}
