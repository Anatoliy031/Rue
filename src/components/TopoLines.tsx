import { useMemo } from 'react'

/**
 * Декоративные горизонтали. Рисуются математически: несколько «вершин»,
 * вокруг каждой — набор уровней, искажённых гармониками. Выглядит как
 * фрагмент топокарты, но не изображает реальный рельеф.
 */
function contour(cx: number, cy: number, r: number, seed: number, points = 64) {
  const pts: string[] = []
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2
    const wobble =
      1 +
      0.16 * Math.sin(t * 3 + seed) +
      0.09 * Math.sin(t * 5 - seed * 1.7) +
      0.05 * Math.sin(t * 8 + seed * 0.6)
    const x = cx + Math.cos(t) * r * wobble
    const y = cy + Math.sin(t) * r * wobble * 0.62
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

interface Props {
  className?: string
  opacity?: number
}

export default function TopoLines({ className = '', opacity = 0.28 }: Props) {
  const paths = useMemo(() => {
    const peaks = [
      { cx: 220, cy: 300, base: 26, levels: 11, seed: 1.2 },
      { cx: 640, cy: 190, base: 20, levels: 9, seed: 3.4 },
      { cx: 980, cy: 380, base: 30, levels: 13, seed: 5.1 },
      { cx: 430, cy: 520, base: 22, levels: 8, seed: 2.2 },
    ]
    const out: { d: string; w: number }[] = []
    for (const p of peaks) {
      for (let l = 0; l < p.levels; l++) {
        out.push({
          d: contour(p.cx, p.cy, p.base + l * 27, p.seed + l * 0.28),
          w: l === 0 || l % 5 === 0 ? 1.1 : 0.5,
        })
      }
    }
    return out
  }, [])

  return (
    <svg
      className={className}
      viewBox="0 0 1200 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="#78C6C1" style={{ opacity }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} strokeWidth={p.w} />
        ))}
      </g>
    </svg>
  )
}
