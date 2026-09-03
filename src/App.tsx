import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import { useSeo } from './hooks'

const Places = lazy(() => import('./pages/Places'))
const MapPage = lazy(() => import('./pages/MapPage'))
const PlaceDetail = lazy(() => import('./pages/PlaceDetail'))
const Reserve = lazy(() => import('./pages/Reserve'))
const MyRoute = lazy(() => import('./pages/MyRoute'))
const AboutData = lazy(() => import('./pages/AboutData'))
const RoutesIndex = lazy(() => import('./pages/Routes').then((m) => ({ default: m.RoutesIndex })))
const RouteDetail = lazy(() => import('./pages/Routes').then((m) => ({ default: m.RouteDetail })))

function Loading() {
  return <div className="grid min-h-[50vh] place-items-center text-[14px] text-fog">Загружаем…</div>
}

function NotFound() {
  useSeo({ title: 'Страницы нет — Дорога в Гузерипль', description: 'Такой страницы на сайте нет.', path: '/404' })
  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 text-center sm:px-6">
      <h1 className="display-mid m-0 text-[2rem]">Страницы нет</h1>
      <p className="mt-3 text-[15px] text-fog">Проверьте адрес или начните с каталога мест.</p>
      <a href={import.meta.env.BASE_URL} className="mt-6 inline-block text-glacial hover:underline">
        На главную
      </a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="places"
          element={
            <Suspense fallback={<Loading />}>
              <Places />
            </Suspense>
          }
        />
        <Route
          path="map"
          element={
            <Suspense fallback={<Loading />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path="place/:slug"
          element={
            <Suspense fallback={<Loading />}>
              <PlaceDetail />
            </Suspense>
          }
        />
        <Route
          path="routes"
          element={
            <Suspense fallback={<Loading />}>
              <RoutesIndex />
            </Suspense>
          }
        />
        <Route
          path="route/:slug"
          element={
            <Suspense fallback={<Loading />}>
              <RouteDetail />
            </Suspense>
          }
        />
        <Route
          path="reserve"
          element={
            <Suspense fallback={<Loading />}>
              <Reserve />
            </Suspense>
          }
        />
        <Route
          path="my-route"
          element={
            <Suspense fallback={<Loading />}>
              <MyRoute />
            </Suspense>
          }
        />
        <Route
          path="about-data"
          element={
            <Suspense fallback={<Loading />}>
              <AboutData />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
