import styles from './index.module.css'

const traces = [
  { path: 'M-8 112H48L100 60H172L212 20H268', x: 268, y: 20 },
  { path: 'M-8 96H38L86 48H142L170 20H194', x: 194, y: 20 },
  { path: 'M-8 128H60L112 76H208L246 38H314', x: 314, y: 38 },
  { path: 'M-8 72H24L58 38H92', x: 92, y: 38 },
  { path: 'M-8 144H72L124 92H248L276 64H356', x: 356, y: 64 },
  { path: 'M-8 54H12L42 24H58', x: 58, y: 24 },
] as const

export function CircuitAccent({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 384 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {traces.map(({ path, x, y }, index) => (
        <g key={path} className={styles.trace}>
          <path d={path} vectorEffect="non-scaling-stroke" />
          <circle cx={x + 3.5} cy={y} r="3.5" vectorEffect="non-scaling-stroke" />
          {(index === 0 || index === 4) && (
            <path
              className={styles.signal}
              d={path}
              pathLength="100"
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: `${index * 150}ms` }}
            />
          )}
        </g>
      ))}
    </svg>
  )
}
