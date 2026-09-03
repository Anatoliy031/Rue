import { Link } from 'react-router-dom'
import { ArrowRight, Car, Footprints, Map as MapIcon } from 'lucide-react'
import ElevationProfile from '../components/ElevationProfile'
import TopoLines from '../components/TopoLines'
import { BRANCHES, META, POIS, STATS } from '../data/guide'
import { NO_CONNECTION_NOTE, ROUTE_DISCLAIMER } from '../data/route'
import { COLLECTIONS, collectionCount } from '../data/collections'
import { useIsDesktop, useSeo } from '../hooks'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Дорога в Гузерипль',
  description:
    'Интерактивный путеводитель по маршруту Краснодар → Гузерипль: места по дороге и рядом, доступность на машине и пешком, пропуска Кавказского заповедника.',
  inLanguage: 'ru',
}

export default function Home() {
  const isDesktop = useIsDesktop()

  useSeo({
    title: 'Дорога в Гузерипль — путеводитель Краснодар → Гузерипль',
    description: `${STATS.total} мест на маршруте Краснодар → Гузерипль: куда доехать на машине, куда идти пешком, где нужен пропуск Кавказского заповедника.`,
    path: '/',
    jsonLd,
  })

  const branchCounts = new Map<string, number>()
  for (const p of POIS) branchCounts.set(p.branch, (branchCounts.get(p.branch) ?? 0) + 1)

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                        */}
      {/* ---------------------------------------------------------- */}
      <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col overflow-hidden">
        <TopoLines className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.45]" opacity={0.3} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 60% at 15% 0%, rgba(46,109,108,0.22) 0%, rgba(14,20,22,0) 60%), linear-gradient(180deg, rgba(14,20,22,0) 40%, #0E1416 96%)',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pt-8 sm:px-6 sm:pt-12">
          <p className="m-0 max-w-[46ch] text-[14px] leading-relaxed text-fog">
            Вы едете из Краснодара в горы. Этот справочник отвечает на один вопрос: что здесь есть по дороге и рядом — и
            куда вы реально сможете попасть.
          </p>

          <h1 className="display mt-4 text-[clamp(2.2rem,7vw,5.2rem)] text-snow">
            <span className="whitespace-nowrap">
              Краснодар <span className="text-glacial">→</span>
            </span>
            <br />
            Гузерипль
          </h1>

          <dl className="mt-5 grid max-w-3xl grid-cols-3 gap-x-3 gap-y-4 sm:gap-x-6">
            {[
              { v: '~200 км', k: 'по асфальту от города до конца дороги' },
              { v: `${STATS.total}`, k: 'мест в базе, включая малоизвестные' },
              { v: `${STATS.driveUp}`, k: 'из них — прямо с парковки или коротким подходом' },
            ].map((s) => (
              <div key={s.k}>
                <dt className="sr-only">{s.k}</dt>
                <dd className="m-0">
                  <span className="display-mid block text-[clamp(1.5rem,4vw,2.2rem)] tabular text-snow">{s.v}</span>
                  <span className="mt-1 block max-w-[26ch] text-[11px] leading-snug text-fog sm:text-[12.5px]">{s.k}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            <Link
              to="/places"
              className="col-span-2 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-snow px-5 text-[14.5px] font-semibold text-basalt transition-colors duration-150 hover:bg-glacial sm:col-span-1 sm:justify-start"
            >
              Смотреть все места <ArrowRight size={16} />
            </Link>
            <Link
              to="/map"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-fog/25 px-3 text-[13.5px] text-snow hover:border-glacial/60 hover:text-glacial sm:justify-start sm:px-5 sm:text-[14.5px]"
            >
              <MapIcon size={16} /> Открыть карту
            </Link>
            <Link
              to="/places?access=drive,drive_walk"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-fog/25 px-3 text-[13.5px] text-snow hover:border-glacial/60 hover:text-glacial sm:justify-start sm:px-5 sm:text-[14.5px]"
            >
              <Car size={16} /> Только на машине
            </Link>
            <Link
              to="/places?access=hike,offroad,permit"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-fog/25 px-3 text-[13.5px] text-snow hover:border-glacial/60 hover:text-glacial sm:justify-start sm:px-5 sm:text-[14.5px]"
            >
              <Footprints size={16} /> Пешие маршруты
            </Link>
          </div>

          <div className="mt-auto pt-2">
            <div className="thin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
              <div className="min-w-[720px] sm:min-w-0">
                <ElevationProfile compact={!isDesktop} />
              </div>
            </div>
            <p className="m-0 pt-2 text-[11.5px] text-haze sm:hidden">Профиль листается вбок</p>
            <p className="m-0 pb-6 pt-3 text-[11.5px] leading-snug text-haze sm:max-w-[70ch]">{ROUTE_DISCLAIMER}</p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Развилка, которую все путают                                */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-fog/10 bg-stone/40 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="display-mid m-0 max-w-[16ch] text-[clamp(1.6rem,4.2vw,2.6rem)] leading-tight">
              В Даховской дорога делится надвое — и больше не сходится
            </h2>
            <p className="mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-snow/85">{NO_CONNECTION_NOTE}</p>
            <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed text-fog">
              Это самая частая ошибка при планировании: люди ставят в один день Азишские пещеры и Гузерипль и внезапно
              обнаруживают, что между ними двести километров объезда вместо двадцати по прямой.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Даховская → КПП Лагонаки',
                sub: 'Асфальт до 1650 м',
                body: 'Азишские пещеры, скала Утюг, обзорные площадки перевала, КПП. Отсюда стартует маршрут №30В.',
                to: '/places?branch=lagonaki_road',
              },
              {
                title: 'Гузерипль → Яворова поляна',
                sub: 'Асфальт до 1450 м',
                body: 'Партизанская поляна, озеро, Яворова поляна и КПП Узуруб. Отсюда уходят в сторону Фишта.',
                to: '/places?branch=yavorova',
              },
            ].map((b) => (
              <Link
                key={b.title}
                to={b.to}
                className="glass-soft group flex flex-col rounded-xl p-5 no-underline transition-colors duration-150 hover:border-glacial/40"
              >
                <span className="text-[15px] font-semibold text-snow">{b.title}</span>
                <span className="mt-1 text-[12.5px] text-glacial">{b.sub}</span>
                <span className="mt-3 text-[13.5px] leading-relaxed text-fog">{b.body}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-glacial">
                  Открыть ветку <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Участки маршрута                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="display-mid m-0 text-[clamp(1.6rem,4vw,2.4rem)]">Пятнадцать участков</h2>
          <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-fog">
            База разбита не по «топам», а по тому, куда физически сворачивает машина. Каждый участок — отдельный съезд с
            основной дороги.
          </p>

          <ul className="mt-8 grid list-none gap-px overflow-hidden rounded-xl border border-fog/12 bg-fog/12 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {BRANCHES.map((b) => (
              <li key={b.id} className="bg-basalt">
                <Link
                  to={`/places?branch=${b.id}`}
                  className="flex h-full flex-col gap-2 p-5 no-underline transition-colors duration-150 hover:bg-stone/70"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold text-snow">{b.name}</span>
                    <span className="tabular text-[13px] text-glacial">{branchCounts.get(b.id) ?? 0}</span>
                  </span>
                  <span className="text-[13px] leading-relaxed text-fog">{b.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Подборки                                                    */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-fog/10 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-mid m-0 text-[clamp(1.6rem,4vw,2.4rem)]">Готовые сценарии поездки</h2>
            <Link to="/routes" className="text-[14px] text-glacial hover:underline">
              Все подборки
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLLECTIONS.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                to={`/route/${c.slug}`}
                className="glass-soft flex flex-col rounded-xl p-5 no-underline transition-colors duration-150 hover:border-glacial/40"
              >
                <span className="text-[16px] font-semibold text-snow">{c.title}</span>
                <span className="mt-2 flex-1 text-[13.5px] leading-relaxed text-fog">{c.lead}</span>
                <span className="mt-4 tabular text-[12.5px] text-glacial">{collectionCount(c)} мест</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Заповедник и достоверность                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-2">
          <Link
            to="/reserve"
            className="glass flex flex-col rounded-xl p-6 no-underline transition-colors duration-150 hover:border-glacial/40 sm:p-8"
          >
            <h2 className="display-mid m-0 text-[clamp(1.4rem,3.4vw,2rem)]">Перед походом в заповедник</h2>
            <p className="mt-3 max-w-[46ch] text-[14.5px] leading-relaxed text-fog">
              {STATS.permit} мест в базе находятся на территории, куда нужен пропуск. Статус маршрутов и стоянок
              меняется из-за снега и погоды — здесь собрано, что проверить и где.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] text-glacial">
              Правила и проверка статуса <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/about-data"
            className="glass flex flex-col rounded-xl p-6 no-underline transition-colors duration-150 hover:border-glacial/40 sm:p-8"
          >
            <h2 className="display-mid m-0 text-[clamp(1.4rem,3.4vw,2rem)]">Где мы честно не знаем</h2>
            <p className="mt-3 max-w-[46ch] text-[14.5px] leading-relaxed text-fog">
              У {STATS.withoutCoordinates} из {STATS.total} мест нет подтверждённых координат, и мы не ставим их на
              карту наугад. {STATS.verified} записей опираются на официальные источники. Методика — на отдельной
              странице.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] text-glacial">
              Как собраны данные <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-[1400px] text-[12px] leading-relaxed text-haze">{META.data_policy}</p>
      </section>
    </>
  )
}
