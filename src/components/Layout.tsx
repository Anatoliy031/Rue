import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bookmark, Compass, Map, Mountain, List } from 'lucide-react'
import { useEffect } from 'react'
import { useMyRoute } from '../hooks'
import { META, STATS } from '../data/guide'

const NAV = [
  { to: '/places', label: 'Места', icon: List },
  { to: '/map', label: 'Карта', icon: Map },
  { to: '/routes', label: 'Подборки', icon: Compass },
  { to: '/reserve', label: 'Заповедник', icon: Mountain },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/map') window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  const { ids } = useMyRoute()
  const { pathname } = useLocation()
  const isMap = pathname === '/map'

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-stone focus:px-4 focus:py-2 focus:text-snow"
      >
        К содержимому
      </a>

      <header className="nav-blur sticky top-0 z-30 border-b border-fog/10">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="group flex items-baseline gap-2 no-underline">
            <span className="display-mid text-[15px] text-snow">Дорога в&nbsp;Гузерипль</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Основная навигация">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-[13.5px] transition-colors duration-150 ${
                    isActive ? 'text-glacial' : 'text-fog hover:text-snow'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/my-route"
              className={({ isActive }) =>
                `ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[13.5px] transition-colors duration-150 ${
                  isActive ? 'border-glacial/60 text-glacial' : 'border-fog/20 text-fog hover:text-snow'
                }`
              }
            >
              <Bookmark size={14} />
              Мой маршрут
              {ids.length > 0 && <span className="tabular text-glacial">{ids.length}</span>}
            </NavLink>
          </nav>

          <Link
            to="/my-route"
            className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-fog md:hidden"
            aria-label={`Мой маршрут, ${ids.length} мест`}
          >
            <Bookmark size={15} />
            <span className="tabular">{ids.length}</span>
          </Link>
        </div>
      </header>

      <main id="content" className={`flex-1 ${isMap ? '' : 'pb-24 md:pb-0'}`}>
        <Outlet />
      </main>

      {!isMap && (
        <footer className="border-t border-fog/10 px-4 py-10 sm:px-6">
          <div className="mx-auto grid max-w-[1400px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="display-mid m-0 text-[17px]">Дорога в Гузерипль</p>
              <p className="mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-fog">
                {STATS.total} мест от Краснодара до гор. Что можно посмотреть с парковки, куда идти пешком и где нужен
                пропуск.
              </p>
            </div>
            <div>
              <p className="m-0 mb-2 text-[13px] font-semibold">Разделы</p>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[13.5px]">
                {[...NAV, { to: '/my-route', label: 'Мой маршрут' }, { to: '/about-data', label: 'Как собраны данные' }].map(
                  (n) => (
                    <li key={n.to}>
                      <Link to={n.to} className="text-fog hover:text-glacial">
                        {n.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <p className="m-0 mb-2 text-[13px] font-semibold">Перед выездом</p>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[13.5px] text-fog">
                <li>
                  <a
                    href="https://kavkazzapoved.ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-glacial"
                  >
                    Статус маршрутов заповедника
                  </a>
                </li>
                <li>Регистрация похода в МЧС</li>
                <li>Прогноз в горах, а не в Майкопе</li>
              </ul>
            </div>
            <div>
              <p className="m-0 mb-2 text-[13px] font-semibold">Данные</p>
              <p className="m-0 text-[13.5px] leading-relaxed text-fog">
                База обновлена {META.generated_at.split('-').reverse().join('.')}. Цены, часы работы, состояние дорог и
                статус горных маршрутов меняются — проверяйте перед поездкой.
              </p>
            </div>
          </div>
        </footer>
      )}

      <nav
        className="nav-blur fixed inset-x-0 bottom-0 z-30 border-t border-fog/12 md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Навигация"
      >
        <div className="grid grid-cols-5">
          {[...NAV, { to: '/my-route', label: 'Маршрут', icon: Bookmark }].map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10.5px] ${
                  isActive ? 'text-glacial' : 'text-fog'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
