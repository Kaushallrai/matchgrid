'use client'

const STATS = ['Attack', 'Defense', 'Stamina', 'Passing', 'GK', 'Overall'] as const

// Convert polar coords to cartesian — center 100,100 radius 80
function point(angle: number, value: number, max = 5) {
  const r = (value / max) * 78
  const rad = (angle * Math.PI) / 180
  return {
    x: 100 + r * Math.sin(rad),
    y: 100 - r * Math.cos(rad),
  }
}

function toPath(points: { x: number; y: number }[]) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'
}

export default function HexStatChart({ player }: { player: any }) {
  const overall = (player.attack + player.defense + player.stamina + player.passing) / 4

  const values = [
    player.attack,
    player.defense,
    player.stamina,
    player.passing,
    player.gk_ability,
    overall,
  ]

  const angles = STATS.map((_, i) => i * 60) // 6 axes, 60° apart

  // Web grid lines at 1,2,3,4,5
  const gridLevels = [1, 2, 3, 4, 5]

  // Stat polygon points
  const statPoints = values.map((v, i) => point(angles[i], v))

  // Label positions (pushed further out)
  const labelPoints = angles.map((a) => point(a, 5.85))

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Grid hexagons */}
      {gridLevels.map((level) => {
        const pts = angles.map((a) => point(a, level))
        return (
          <path
            key={level}
            d={toPath(pts)}
            fill="none"
            stroke="hsl(0 0% 20%)"
            strokeWidth={level === 5 ? 0.8 : 0.5}
          />
        )
      })}

      {/* Axis lines */}
      {angles.map((angle, i) => {
        const outer = point(angle, 5)
        return (
          <line
            key={i}
            x1={100} y1={100}
            x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)}
            stroke="hsl(0 0% 20%)"
            strokeWidth={0.5}
          />
        )
      })}

      {/* Filled stat polygon */}
      <path
        d={toPath(statPoints)}
        fill="hsl(142 71% 45% / 0.2)"
        stroke="hsl(142 71% 45%)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Dots on each vertex */}
      {statPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y}
          r={2.5}
          fill="hsl(142 71% 45%)"
        />
      ))}

      {/* Stat labels */}
      {STATS.map((label, i) => {
        const lp = labelPoints[i]
        const anchor =
          lp.x < 95 ? 'end' : lp.x > 105 ? 'start' : 'middle'
        return (
          <g key={label}>
            <text
              x={lp.x} y={lp.y}
              textAnchor={anchor}
              dominantBaseline="central"
              fontSize={8}
              fill="hsl(0 0% 53%)"
              fontFamily="inherit"
            >
              {label}
            </text>
            <text
              x={lp.x}
              y={lp.y + 9}
              textAnchor={anchor}
              dominantBaseline="central"
              fontSize={8.5}
              fontWeight={600}
              fill="hsl(0 0% 90%)"
              fontFamily="inherit"
            >
              {i === 5 ? overall.toFixed(1) : values[i]}
            </text>
          </g>
        )
      })}

      {/* Center dot */}
      <circle cx={100} cy={100} r={2} fill="hsl(0 0% 30%)" />
    </svg>
  )
}