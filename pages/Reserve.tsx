import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { META, POIS, getPoiById } from '../data/guide'
import { PoiPanel, PoiRow } from '../components/PoiPanel'
import { useSeo } from '../hooks'
import TopoLines from '../components/TopoLines'

const CHECKED = META.generated_at.split('-').reverse().join('.')

export default function Reserve() {
  const [selected, setSelected] = useState<string | null>(null)

  useSeo({
    title: 'Перед походом в Кавказский заповедник — Дорога в Гузерипль',
    description:
      'Пропуска, статус маршрутов №30В и №30Г, стоянки и правила Кавказского заповедника. Все сведения — со ссылкой на официальный источник и датой проверки.',
    path: '/reserve',
  })

  const permitPois = POIS.filter((p) => p.permit === 'reserve_pass' && p.publish_by_default)
  const v30 = permitPois.filter((p) => p.branch === 'reserve30v')
  const g30 = permitPois.filter((p) => p.branch === 'reserve30g')

  return (
    <>
      <header className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
        <TopoLines className="pointer-events-none absolute inset-0 h-full w-full opacity-30" opacity={0.25} />
        <div className="relative mx-auto max-w-[1400px]">
          <h1 className="display-mid m-0 max-w-[16ch] text-[clamp(2rem,6vw,3.4rem)] leading-[1.03]">
            Перед походом в заповедник
          </h1>
          <p className="mt-4 max-w-[60ch] text-[15.5px] leading-relaxed text-snow/85">
            Высокогорье за Лагонаки и за Яворовой поляной — территория Кавказского заповедника. Здесь всё зависит от
            двух вещей: есть ли у вас пропуск и открыт ли маршрут прямо сейчас.
          </p>
          <a
            href="https://kavkazzapoved.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-snow px-5 text-[14.5px] font-semibold text-basalt hover:bg-glacial"
          >
            Проверить официальный статус <ExternalLink size={15} />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] space-y-12 px-4 pb-20 sm:px-6">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: 'Пропуск обязателен',
              b: 'Для маршрутов №30В, №30Г и всех точек внутри заповедника нужен оформленный пропуск. Без него на КПП не пропустят.',
            },
            {
              t: 'Статус меняется',
              b: 'Маршруты и стоянки открывают и закрывают из-за снега, лавинной опасности и погоды. Дата открытия каждый год разная.',
            },
            {
              t: 'Ночёвка — только на стоянках',
              b: 'Разбивать лагерь вне разрешённых мест нельзя. Список стоянок публикует сам заповедник.',
            },
          ].map((c) => (
            <div key={c.t} className="glass-soft rounded-xl p-5">
              <h2 className="m-0 text-[15px] font-semibold text-snow">{c.t}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-fog">{c.b}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Что было известно на момент сборки базы</h2>
          <p className="mt-3 max-w-[64ch] text-[14px] leading-relaxed text-fog">
            Ниже — снимок состояния, а не постоянное правило. Всё это может измениться в любой день, поэтому рядом
            стоит дата проверки.
          </p>

          <dl className="mt-6 overflow-hidden rounded-xl border border-fog/12">
            {[
              {
                k: 'Маршрут №30, все варианты',
                v: META.reserve_status_2026,
              },
              {
                k: 'Стоимость',
                v: META.reserve_ticket_snapshot,
              },
              {
                k: 'Онлайн-выход на №30В',
                v: 'На странице маршрута онлайн-выход был ограничен датой до 1 октября. Это сезонное ограничение, а не постоянное правило.',
              },
              {
                k: 'Онлайн-выход на №30Г',
                v: 'На странице маршрута онлайн-выход был ограничен датой до 1 ноября. Так же — сезонно.',
              },
              {
                k: 'Регистрация в МЧС',
                v: 'Регистрируйте выход в соответствии с действующими официальными требованиями. В горах связь есть не везде.',
              },
            ].map((row) => (
              <div
                key={row.k}
                className="grid gap-x-6 gap-y-1 border-b border-fog/10 px-4 py-4 last:border-0 sm:grid-cols-[220px_1fr] sm:px-5"
              >
                <dt className="text-[14px] text-fog">{row.k}</dt>
                <dd className="m-0 text-[14.5px] leading-relaxed text-snow/90">
                  {row.v}
                  <span className="ml-2 whitespace-nowrap text-[12px] text-lichen">проверено {CHECKED}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Маршрут №30В — кольцо от КПП Лагонаки</h2>
          <p className="mt-2 text-[14px] text-fog">Псенодах, Фишт-Оштенский перевал, приют Фишт, Каменное Море.</p>
          <ol className="mt-4 list-none rounded-xl border border-lichen/25 p-0">
            {v30.map((p, i) => (
              <li key={p.id}>
                <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="display-mid m-0 text-[clamp(1.4rem,3.6vw,2rem)]">Маршрут №30Г — от КПП Узуруб к морю</h2>
          <p className="mt-2 text-[14px] text-fog">Гузерипльский и Армянский перевалы, Фишт, Бабук-Аул, долина Шахе.</p>
          <ol className="mt-4 list-none rounded-xl border border-lichen/25 p-0">
            {g30.map((p, i) => (
              <li key={p.id}>
                <PoiRow poi={p} index={i} active={selected === p.id} onSelect={setSelected} />
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border border-ember/35 bg-ember/[0.06] p-5 sm:p-6">
          <h2 className="m-0 text-[16px] font-semibold text-ember">Чего здесь нет намеренно</h2>
          <ul className="mt-3 list-none space-y-2 p-0 text-[14px] leading-relaxed text-snow/85">
            <li>— Мест для ночёвки вне официальных стоянок.</li>
            <li>— Способов пройти в обход КПП.</li>
            <li>— Инструкций по проникновению в необорудованные пещеры и штольни.</li>
            <li>— Актуальных цен без даты проверки: они устаревают быстрее, чем обновляется сайт.</li>
          </ul>
        </section>
      </div>

      <PoiPanel poi={selected ? (getPoiById(selected) ?? null) : null} onClose={() => setSelected(null)} />
    </>
  )
}
