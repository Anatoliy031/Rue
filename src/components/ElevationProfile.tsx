import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LAGONAKI_SPUR, MAIN_ROUTE, YAVOROVA_SPUR } from '../data/route'
import { POIS } from '../data/guide'

const W = 1200
const H = 352
const BASE_Y = 242
const TOP_Y = 58
const MAX_ELE = 1750
const X0 = 48
const X1 = 660

/**
 * Шкала километража намеренно нелинейная: равнинный участок Краснодар — Майкоп
 * сжат, горный растянут. Иначе десять узлов последних сорока километров
 * налезают друг на друга, а именно там находится почти вся база.
 */
const SPLIT_KM = 130
const SPLIT_X = 0.34

const eleY = (m: number) => BASE_Y - (m / MAX_ELE) * (BASE_Y - TOP_Y)
const kmX = (km: number) => {
  const span = X1 - X0
  return km <= SPLIT_KM
    ? X0 + (km / SPLIT_KM) * SPLIT_X * span
    : X0 + SPLIT_X * span + ((km - SPLIT_KM) / (208 - SPLIT_KM)) * (1 - SPLIT_X) * span
}

interface SpurPoint {
  x: number
  y: number
  name: string
  ele: number
  branches: string[]
}

function spurGeometry(startX: number, startEle: number, endX: number, nodes: typeof LAGONAKI_SPUR.nodes): SpurPoint[] {
  const span = endX - startX
  const maxKm = nodes[nodes.length - 1].km || 1
  return nodes.map((n) => ({
    x: startX + (n.km / maxKm) * span,
    y: eleY(n.ele),
    name: n.name,
    ele: n.ele,
    branches: n.branches,
  }))
}

function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const mx = (a.x + b.x) / 2
    d += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`
  }
  return d
}

interface Props {
  compact?: boolean
}

export default function ElevationProfile({ compact = false }: Props) {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of POIS) m.set(p.branch, (m.get(p.branch) ?? 0) + 1)
    return m
  }, [])

  const mainPts = MAIN_ROUTE.map((n) => ({ ...n, x: kmX(n.km), y: eleY(n.ele) }))
  const mainLine = smoothPath(mainPts)
  const mainArea = `${mainLine} L${mainPts[mainPts.length - 1].x},${BASE_Y} L${mainPts[0].x},${BASE_Y} Z`

  const dakh = mainPts.find((n) => n.id === 'dakhovskaya')!
  const guz = mainPts.find((n) => n.id === 'guzeripl')!

  const lagPts = spurGeometry(dakh.x, dakh.ele, 852, LAGONAKI_SPUR.nodes)
  const yavPts = spurGeometry(guz.x, guz.ele, 1076, YAVOROVA_SPUR.nodes)

  const lagEnd = lagPts[lagPts.length - 1]
  const yavEnd = yavPts[yavPts.length - 1]

  const labelSize = compact ? 25 : 14
  const eleSize = compact ? 22 : 14
  const majorOnly = compact

  const nodeBranchCount = (branches: string[]) => branches.reduce((s, b) => s + (counts.get(b) ?? 0), 0)

  const goToBranch = (branches: string[]) => {
    if (!branches.length) return
    navigate(`/places?branch=${branches[0]}`)
  }

  return (
    <figure className="m-0 w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Высотный профиль маршрута от Краснодара до Гузерипля с двумя тупиковыми горными ветками"
      >
        <defs>
          <linearGradient id="ridgeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78C6C1" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#2E6D6C" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0E1416" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fogBand" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93A7A9" stopOpacity="0" />
            <stop offset="50%" stopColor="#93A7A9" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#93A7A9" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Горизонтали высот */}
        {[500, 1000, 1500].map((m) => (
          <g key={m}>
            <line
              x1={X0 - 22}
              x2={W - 30}
              y1={eleY(m)}
              y2={eleY(m)}
              stroke="#93A7A9"
              strokeOpacity="0.14"
              strokeDasharray="2 7"
            />
            <text
              x={X0 - 26}
              y={eleY(m) - 6}
              fill="#5F7376"
              fontSize={eleSize}
              textAnchor="start"
              className="tabular"
            >
              {m} м
            </text>
          </g>
        ))}
        <line x1={X0 - 22} x2={W - 30} y1={BASE_Y} y2={BASE_Y} stroke="#93A7A9" strokeOpacity="0.28" />

        {/* Основная дорога */}
        <path d={mainArea} fill="url(#ridgeFill)" />
        <path d={mainLine} fill="none" stroke="#EAEFEE" strokeWidth={compact ? 3.4 : 2.4} strokeLinecap="round" />

        {/* Тупиковые ветки */}
        {[
          { pts: lagPts, key: 'lag', label: LAGONAKI_SPUR.name },
          { pts: yavPts, key: 'yav', label: YAVOROVA_SPUR.name },
        ].map(({ pts, key }) => (
          <path
            key={key}
            d={smoothPath(pts)}
            fill="none"
            stroke="#78C6C1"
            strokeWidth={compact ? 3 : 2.2}
            strokeLinecap="round"
            strokeDasharray="1 0"
            opacity="0.95"
          />
        ))}

        {/* Разрыв между ветками — главный факт маршрута */}
        <line
          x1={lagEnd.x + 16}
          y1={lagEnd.y + 8}
          x2={yavEnd.x - 16}
          y2={yavEnd.y - 8}
          stroke="url(#fogBand)"
          strokeWidth="1.4"
          strokeDasharray="6 8"
        />
        <g transform={`translate(${(lagEnd.x + yavEnd.x) / 2}, ${(lagEnd.y + yavEnd.y) / 2 - 4})`}>
          <line x1="-9" y1="-9" x2="9" y2="9" stroke="#D46A4B" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="-9" x2="-9" y2="9" stroke="#D46A4B" strokeWidth="2" strokeLinecap="round" />
          <line
            x1="0"
            y1="14"
            x2="0"
            y2={compact ? 88 : 62}
            stroke="#D46A4B"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x="0"
            y={compact ? 116 : 82}
            fill="#D46A4B"
            fontSize={compact ? 24 : 15}
            textAnchor="middle"
            fontWeight="600"
          >
            автопроезда нет
          </text>
          <text x="0" y={compact ? 146 : 102} fill="#93A7A9" fontSize={compact ? 22 : 13.5} textAnchor="middle">
            только пешком по маршрутам заповедника
          </text>
        </g>

        {/* Узлы основной дороги */}
        {mainPts.map((n) => {
          const major = n.branches.length > 0 || n.id === 'krasnodar'
          if (majorOnly && !major) return null
          const total = nodeBranchCount(n.branches)
          const isActive = active === n.id
          return (
            <g
              key={n.id}
              tabIndex={n.branches.length ? 0 : -1}
              role={n.branches.length ? 'button' : undefined}
              aria-label={n.branches.length ? `${n.name}: ${total} мест в каталоге` : undefined}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              onClick={() => goToBranch(n.branches)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goToBranch(n.branches)
                }
              }}
              style={{ cursor: n.branches.length ? 'pointer' : 'default' }}
            >
              <line
                x1={n.x}
                x2={n.x}
                y1={n.y}
                y2={BASE_Y}
                stroke={isActive ? '#78C6C1' : '#93A7A9'}
                strokeOpacity={isActive ? 0.7 : 0.22}
                strokeWidth="1"
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={major ? (compact ? 7 : 5) : compact ? 5 : 3.4}
                fill={isActive ? '#78C6C1' : major ? '#EAEFEE' : '#5F7376'}
              />
              <g transform={`translate(${n.x}, ${BASE_Y + (compact ? 34 : 24)}) rotate(-42)`}>
                <text
                  fill={isActive ? '#EAEFEE' : '#93A7A9'}
                  fontSize={labelSize}
                  textAnchor="end"
                  fontWeight={major ? 600 : 400}
                >
                  {n.name}
                </text>
              </g>
              {total > 0 && (
                <text
                  x={n.x}
                  y={n.y - (compact ? 18 : 15)}
                  fill={isActive ? '#78C6C1' : '#5F7376'}
                  fontSize={compact ? 22 : 13.5}
                  textAnchor="middle"
                  className="tabular"
                >
                  {total}
                </text>
              )}
            </g>
          )
        })}

        {/* Концы веток */}
        {[
          { p: lagEnd, name: 'КПП Лагонаки', sub: '1650 м', branch: 'lagonaki_road' },
          { p: yavEnd, name: 'Яворова поляна', sub: '1450 м', branch: 'yavorova' },
        ].map(({ p, name, sub, branch }) => (
          <g
            key={name}
            tabIndex={0}
            role="button"
            aria-label={`${name}, ${sub}. Открыть места этой ветки`}
            onClick={() => navigate(`/places?branch=${branch}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/places?branch=${branch}`)
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={p.x} cy={p.y} r={compact ? 7 : 5} fill="#78C6C1" />
            <text
              x={p.x}
              y={p.y - (compact ? 34 : 24)}
              fill="#EAEFEE"
              fontSize={labelSize}
              textAnchor="middle"
              fontWeight="600"
            >
              {name}
            </text>
            <text
              x={p.x}
              y={p.y - (compact ? 10 : 8)}
              fill="#78C6C1"
              fontSize={compact ? 22 : 13.5}
              textAnchor="middle"
              className="tabular"
            >
              {sub}
            </text>
          </g>
        ))}

        {/* Промежуточные подписи веток */}
        {!compact && (
          <>
            <text x={lagPts[1].x} y={lagPts[1].y + 26} fill="#5F7376" fontSize="13" textAnchor="middle">
              Азишские пещеры
            </text>
            <text x={yavPts[1].x} y={yavPts[1].y + 26} fill="#5F7376" fontSize="13" textAnchor="middle">
              Партизанская поляна
            </text>
          </>
        )}
      </svg>
    </figure>
  )
}
