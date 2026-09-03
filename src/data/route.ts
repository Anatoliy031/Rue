/**
 * Схема маршрута для hero-профиля и линий на карте.
 *
 * ВАЖНО про достоверность:
 * — координаты здесь принадлежат населённым пунктам и узлам дороги, а не
 *   отдельным природным объектам; это схематичная линия, а не GPS-трек;
 * — высоты приблизительные и нужны только для того, чтобы показать характер
 *   набора высоты, а не для планирования;
 * — километраж по трассе округлён.
 * Для навигации используйте карточку конкретного места и кнопку
 * «Открыть в навигаторе».
 */

export interface RouteNode {
  id: string
  name: string
  /** Приблизительный километраж от Краснодара по дороге. */
  km: number
  /** Приблизительная высота над уровнем моря, м. */
  ele: number
  lat: number
  lon: number
  /** Ветки каталога, которые начинаются в этом узле. */
  branches: string[]
  note?: string
}

export const MAIN_ROUTE: RouteNode[] = [
  { id: 'krasnodar', name: 'Краснодар', km: 0, ele: 25, lat: 45.035, lon: 38.975, branches: ['main'] },
  { id: 'adygeysk', name: 'Адыгейск', km: 45, ele: 20, lat: 44.878, lon: 39.19, branches: [] },
  { id: 'belorechensk', name: 'Белореченск', km: 95, ele: 140, lat: 44.766, lon: 39.874, branches: [] },
  { id: 'maykop', name: 'Майкоп', km: 130, ele: 200, lat: 44.609, lon: 40.101, branches: ['maykop'] },
  { id: 'tulsky', name: 'Тульский', km: 145, ele: 270, lat: 44.505, lon: 40.166, branches: [] },
  {
    id: 'kamennomostsky',
    name: 'Каменномостский',
    km: 165,
    ele: 430,
    lat: 44.29,
    lon: 40.183,
    branches: ['kamenmostsky', 'rufabgo', 'aminovka', 'pobeda'],
    note: 'Главный узел поездки: отсюда уходят Руфабго, Мишоко, Аминовка и Победа.',
  },
  {
    id: 'dakhovskaya',
    name: 'Даховская',
    km: 175,
    ele: 530,
    lat: 44.222,
    lon: 40.187,
    branches: ['una_koz', 'sakhrai'],
    note: 'Развилка: направо — Лаго-Наки, прямо — Гузерипль. Эти две ветки дальше не соединяются.',
  },
  { id: 'nickel', name: 'Никель', km: 183, ele: 600, lat: 44.183, lon: 40.152, branches: ['nickel'] },
  { id: 'khamyshki', name: 'Хамышки', km: 195, ele: 650, lat: 44.099, lon: 40.096, branches: ['khamyshki'] },
  {
    id: 'guzeripl',
    name: 'Гузерипль',
    km: 208,
    ele: 670,
    lat: 43.995,
    lon: 40.132,
    branches: ['guzeripl'],
    note: 'Конец основной дороги. Дальше — только Яворова поляна и пешие маршруты заповедника.',
  },
]

export interface RouteSpur {
  id: string
  name: string
  fromNode: string
  branches: string[]
  nodes: RouteNode[]
  /** Тупиковая автомобильная ветка: дальше проезда нет. */
  deadEnd: true
  terminator: string
}

export const LAGONAKI_SPUR: RouteSpur = {
  id: 'lagonaki',
  name: 'Даховская → КПП Лагонаки',
  fromNode: 'dakhovskaya',
  branches: ['lagonaki_road'],
  deadEnd: true,
  terminator: 'Дальше только пешком по маршрутам заповедника',
  nodes: [
    { id: 'lag-0', name: 'Даховская', km: 0, ele: 530, lat: 44.222, lon: 40.187, branches: [] },
    { id: 'lag-1', name: 'Азишские пещеры', km: 30, ele: 1600, lat: 44.132, lon: 40.011, branches: ['lagonaki_road'] },
    { id: 'lag-2', name: 'КПП Лагонаки', km: 38, ele: 1650, lat: 44.081, lon: 39.977, branches: ['reserve30v'] },
  ],
}

export const YAVOROVA_SPUR: RouteSpur = {
  id: 'yavorova',
  name: 'Гузерипль → Яворова поляна',
  fromNode: 'guzeripl',
  branches: ['yavorova'],
  deadEnd: true,
  terminator: 'Дальше только пешком по маршрутам заповедника',
  nodes: [
    { id: 'yav-0', name: 'Гузерипль', km: 0, ele: 670, lat: 43.995, lon: 40.132, branches: [] },
    { id: 'yav-1', name: 'Партизанская поляна', km: 8, ele: 1400, lat: 44.026, lon: 40.077, branches: ['yavorova'] },
    { id: 'yav-2', name: 'Яворова поляна', km: 14, ele: 1450, lat: 43.977, lon: 40.062, branches: ['yavorova'] },
  ],
}

export const SPURS = [LAGONAKI_SPUR, YAVOROVA_SPUR]

export const ROUTE_DISCLAIMER =
  'Линия маршрута схематична: она построена по населённым пунктам и узлам дороги. Высоты приблизительные. Это не GPS-трек для навигации.'

export const NO_CONNECTION_NOTE =
  'Две горные автомобильные ветки не соединяются между собой. Проехать с Лаго-Наки на Яворову поляну через плато нельзя — только пешком по разрешённым маршрутам заповедника.'
