import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { META, POIS, SOURCES, STATS } from '../data/guide'
import { useSeo } from '../hooks'
import TopoLines from '../components/TopoLines'

export default function AboutData() {
  useSeo({
    title: 'Как собраны данные — Дорога в Гузерипль',
    description:
      'Методика: откуда взяты сведения, что означают статусы достоверности, почему часть мест намеренно осталась без координат.',
    path: '/about-data',
  })

  const noCoords = POIS.filter((p) => !p.mapPoint)
  const sources = Object.entries(SOURCES)

  return (
    <>
      <header className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
        <TopoLines className="pointer-events-none absolute inset-0 h-full w-full opacity-30" opacity={0.25} />
        <div className="relative mx-auto max-w-[1400px]">
          <h1 className="display-mid m-0 max-w-[18ch] text-[clamp(2rem,6vw,3.4rem)] leading-[1.03]">
            Что мы знаем точно, а что — нет
          </h1>
          <p className="mt-4 max-w-[62ch] text-[15.5px] leading-relaxed text-snow/85">
            Путеводитель, который выдумывает координаты, чтобы карта выглядела заполненной, опаснее, чем путеводитель с
            пропусками. Поэтому здесь пропуски видны.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] space-y-14 px-4 pb-20 sm:px-6">
        <section>
          <dl className="grid gap-px overflow-hidden rounded-xl border border-fog/12 bg-fog/12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: 'мест в базе', v: STATS.total },
              { k: 'из официальных источников', v: STATS.verified },
              { k: 'подтверждённых иначе', v: STATS.high },
              { k: 'требуют проверки', v: STATS.needsVerification },
              { k: 'с координатами на карте', v: STATS.withCoordinates },
              { k: 'без подтверждённых координат', v: STATS.withoutCoordinates },
              { k: 'участков маршрута', v: STATS.branches },
              { k: 'источников', v: STATS.sources },
            ].map((s) => (
              <div key={s.k} className="bg-basalt p-5">
                <dd className="display-mid m-0 text-[clamp(1.6rem,4vw,2.4rem)] tabular text-snow">{s.v}</dd>
                <dt className="mt-1 text-[13px] leading-snug text-fog">{s.k}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Три статуса достоверности</h2>
            <dl className="mt-5 space-y-4 text-[14.5px] leading-relaxed">
              <div>
                <dt className="font-semibold text-glacial">Официальный источник</dt>
                <dd className="m-0 mt-1 text-fog">
                  Сведения взяты напрямую с официального туристического каталога Адыгеи, сайта заповедника или другого
                  первичного источника.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-snow">Данные подтверждены</dt>
                <dd className="m-0 mt-1 text-fog">
                  Объект устойчиво идентифицируется по нескольким источникам, но логистика — подъезд, парковка, тропа —
                  может меняться.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-lichen">Геопривязка уточняется</dt>
                <dd className="m-0 mt-1 text-fog">
                  Место существует и известно, но точную точку или способ подъезда мы не подтвердили. Такой объект
                  никогда не показывается как гарантированно доступный.
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Что здесь вычислено, а не взято из источника</h2>
            <ul className="mt-5 list-none space-y-3 p-0 text-[14.5px] leading-relaxed text-fog">
              <li>
                <span className="text-snow">Ориентировочное время.</span> Выведено из способа добраться, сложности и
                длины подхода. Это подсказка для фильтра, а не хронометраж.
              </li>
              <li>
                <span className="text-snow">Где оставить машину.</span> Следствие поля «как добираться». Точное место
                парковки почти нигде не подтверждено, и мы об этом пишем прямо в карточке.
              </li>
              <li>
                <span className="text-snow">Линия маршрута на карте и в профиле.</span> Построена по населённым пунктам
                и узлам дороги. Высоты приблизительные. Это схема, а не трек.
              </li>
              <li>
                <span className="text-snow">Предупреждения.</span> Часть берётся из базы, часть выводится из сложности,
                сезона, необходимости пропуска и статуса объекта.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">
            {noCoords.length} мест без подтверждённых координат
          </h2>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-fog">
            Они есть в каталоге, в поиске и в подборках, но не выведены на карту. Поставить их «примерно в центр
            посёлка» было бы удобнее для картинки и хуже для человека, который поедет по этой точке.
          </p>
          <ul className="mt-6 grid list-none gap-x-6 gap-y-1.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {noCoords.map((p) => (
              <li key={p.id} className="text-[13.5px]">
                <Link to={`/place/${p.slug}`} className="text-fog hover:text-glacial">
                  {p.name}
                </Link>
                <span className="ml-1.5 text-haze">{p.branchName}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Источники</h2>
          <ul className="mt-5 grid list-none gap-x-8 gap-y-2.5 p-0 sm:grid-cols-2">
            {sources.map(([key, s]) => (
              <li key={key}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 text-[14px] text-fog hover:text-glacial"
                >
                  <ExternalLink size={13} className="mt-1 shrink-0" />
                  <span>
                    {s.title}
                    {s.type === 'official' && <span className="ml-1.5 text-[12px] text-glacial">официальный</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-fog/15 p-5 sm:p-6">
          <h2 className="m-0 text-[16px] font-semibold">Что устаревает быстрее всего</h2>
          <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-fog">
            Цены, часы работы, состояние грунтовых дорог и статус горных маршрутов. База собрана{' '}
            {META.generated_at.split('-').reverse().join('.')}. {META.data_policy}
          </p>
        </section>
      </div>
    </>
  )
}
