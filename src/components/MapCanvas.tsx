import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { EnrichedPOI } from '../data/types'
import { MAIN_ROUTE, SPURS } from '../data/route'

const CATEGORY_GLYPH = (category: string): string => {
  if (category.startsWith('waterfall')) return '≈'
  if (category.startsWith('cave') || category === 'grotto') return '◗'
  if (category.startsWith('mountain') || category === 'ridge' || category.startsWith('rock')) return '▲'
  if (category.startsWith('canyon') || category.startsWith('river')) return '⌇'
  if (category.startsWith('dolmen') || category.startsWith('archaeology')) return '⌂'
  if (category.startsWith('viewpoint') || category === 'meadow') return '◉'
  if (category === 'museum' || category === 'visitor_center' || category === 'wildlife_center') return '▣'
  if (category === 'lake' || category === 'water' || category === 'spring') return '○'
  if (category === 'checkpoint') return '⊟'
  if (category === 'cableway') return '⌁'
  return '•'
}

const markerColor = (p: EnrichedPOI) => {
  if (!p.publish_by_default || p.difficulty === 'expert' || p.access === 'restricted') return '#D46A4B'
  if (p.permit === 'reserve_pass') return '#D8B15C'
  if (p.access === 'car' || p.access === 'car_walk') return '#78C6C1'
  return '#93A7A9'
}

function makeIcon(p: EnrichedPOI, active: boolean) {
  const color = markerColor(p)
  return L.divIcon({
    className: '',
    html: `<div class="poi-marker${active ? ' is-active' : ''}" style="background:${color}1f;border-color:${color}"><span style="color:${color}">${CATEGORY_GLYPH(p.category)}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [0, 0],
  })
}

interface Props {
  pois: EnrichedPOI[]
  activeId?: string | null
  onSelect?: (id: string) => void
  showRoute?: boolean
  showReserveLayer?: boolean
  className?: string
  fitKey?: string
}

export default function MapCanvas({
  pois,
  activeId = null,
  onSelect,
  showRoute = true,
  showReserveLayer = true,
  className = '',
  fitKey = '',
}: Props) {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const routeRef = useRef<L.LayerGroup | null>(null)
  const reserveRef = useRef<L.LayerGroup | null>(null)
  const markers = useRef<Map<string, L.Marker>>(new Map())

  /* создание карты */
  useEffect(() => {
    if (!holder.current || mapRef.current) return

    const map = L.map(holder.current, {
      center: [44.35, 40.1],
      zoom: 9,
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    })
    mapRef.current = map
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      className: 'map-tiles',
      attribution: '© Участники OpenStreetMap',
    }).addTo(map)

    routeRef.current = L.layerGroup().addTo(map)
    reserveRef.current = L.layerGroup().addTo(map)

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 46,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => {
        const n = c.getChildCount()
        const size = n < 10 ? 32 : n < 30 ? 40 : 48
        return L.divIcon({
          html: `<div class="cluster-marker" style="width:${size}px;height:${size}px">${n}</div>`,
          className: '',
          iconSize: [size, size],
        })
      },
    })
    clusterRef.current = cluster
    map.addLayer(cluster)

    return () => {
      map.remove()
      mapRef.current = null
      clusterRef.current = null
    }
  }, [])

  /* линии маршрута */
  useEffect(() => {
    const g = routeRef.current
    if (!g) return
    g.clearLayers()
    if (!showRoute) return

    L.polyline(
      MAIN_ROUTE.map((n) => [n.lat, n.lon] as [number, number]),
      { color: '#EAEFEE', weight: 2.4, opacity: 0.65 },
    )
      .bindTooltip('Основной автомобильный маршрут (схематично)', { sticky: true })
      .addTo(g)

    for (const spur of SPURS) {
      L.polyline(
        spur.nodes.map((n) => [n.lat, n.lon] as [number, number]),
        { color: '#78C6C1', weight: 2.2, opacity: 0.8, dashArray: '6 6' },
      )
        .bindTooltip(`${spur.name} — тупиковая ветка`, { sticky: true })
        .addTo(g)
    }
  }, [showRoute])

  /* слой высокогорья */
  useEffect(() => {
    const g = reserveRef.current
    if (!g) return
    g.clearLayers()
    if (!showReserveLayer) return
    L.circle([43.96, 39.92], {
      radius: 17000,
      color: '#D8B15C',
      weight: 1,
      opacity: 0.45,
      fillColor: '#D8B15C',
      fillOpacity: 0.05,
      dashArray: '4 6',
      interactive: false,
    }).addTo(g)
  }, [showReserveLayer])

  /* маркеры */
  useEffect(() => {
    const cluster = clusterRef.current
    const map = mapRef.current
    if (!cluster || !map) return

    cluster.clearLayers()
    markers.current.clear()

    const layers: L.Marker[] = []
    for (const p of pois) {
      if (!p.mapPoint) continue
      const m = L.marker([p.mapPoint.lat, p.mapPoint.lon], {
        icon: makeIcon(p, p.id === activeId),
        keyboard: true,
        title: p.name,
        alt: p.name,
      })
      m.bindTooltip(p.name, { direction: 'top', offset: [0, -14] })
      m.on('click', () => onSelect?.(p.id))
      markers.current.set(p.id, m)
      layers.push(m)
    }
    cluster.addLayers(layers)

    if (layers.length) {
      const bounds = L.latLngBounds(layers.map((m) => m.getLatLng()))
      map.fitBounds(bounds.pad(0.22), { animate: false, maxZoom: 12 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois, fitKey])

  /* подсветка выбранной точки */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markers.current.forEach((m, id) => {
      const p = pois.find((x) => x.id === id)
      if (p) m.setIcon(makeIcon(p, id === activeId))
    })
    if (activeId) {
      const m = markers.current.get(activeId)
      const cluster = clusterRef.current
      if (m && cluster) {
        cluster.zoomToShowLayer(m, () => {
          map.panTo(m.getLatLng(), { animate: true })
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  return <div ref={holder} className={className} role="application" aria-label="Карта мест маршрута" />
}
