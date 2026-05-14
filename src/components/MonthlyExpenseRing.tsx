import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { Transaction } from '../types'
import { journalGridCard, journalLabel, ledgerCard } from '../styles/homeJournal'
import { formatMoney } from '../utils/format'

const RING_COLORS_LEDGER = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#a1a1aa', '#d4d4d8'] as const
/** 参考图：陶土红系渐变 */
const RING_COLORS_JOURNAL = ['#8f4a42', '#9e564d', '#a85d52', '#b97268', '#9a9088', '#c4bbb2'] as const

const RADIAN = Math.PI / 180

const MIN_LABEL_PERCENT = 0.04

/** 环外引导图例：等线（无衬线），与卡片衬线区分 */
const LEGEND_FONT_DENGXIAN =
  "'DengXian', '等线', 'PingFang SC', 'Microsoft YaHei UI', system-ui, sans-serif"

type Slice = { name: string; value: number }

function buildExpenseSlices(items: Transaction[], maxSlices = 5): Slice[] {
  const m = new Map<string, number>()
  for (const t of items) {
    if (t.kind !== 'expense') continue
    const k = (t.category || '未分类').trim() || '未分类'
    m.set(k, (m.get(k) ?? 0) + t.amount)
  }
  const arr = [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
  if (arr.length <= maxSlices) return arr
  const top = arr.slice(0, maxSlices - 1)
  const rest = arr.slice(maxSlices - 1).reduce((s, x) => s + x.value, 0)
  return [...top, { name: '其他', value: rest }]
}

type SliceLabelProps = PieLabelRenderProps & { variant?: 'ledger' | 'journal' }

function SliceCalloutLabel(props: SliceLabelProps) {
  const { cx, cy, midAngle, outerRadius, name, percent, value, variant = 'ledger', index } = props
  const j = variant === 'journal'
  if (cx == null || cy == null || midAngle == null || outerRadius == null) return null
  if (percent != null && percent < MIN_LABEL_PERCENT) return null

  const or = Number(outerRadius)
  if (!Number.isFinite(or)) return null

  const cos = Math.cos(-RADIAN * midAngle)
  const sin = Math.sin(-RADIAN * midAngle)

  const edgeX = cx + or * cos
  const edgeY = cy + or * sin

  const lineLen = 10
  const textR = or + lineLen + 6
  const lx = cx + (or + lineLen) * cos
  const ly = cy + (or + lineLen) * sin
  const tx = cx + textR * cos
  const ty = cy + textR * sin

  const textAnchor = cos >= 0 ? 'start' : 'end'
  const nudge = cos >= 0 ? 3 : -3

  const displayName = String(name ?? '').trim() || '未分类'
  const amt = typeof value === 'number' ? value : 0

  const lineStroke = j ? 'rgb(180 170 158 / 0.55)' : '#d4d4d8'
  const nameFill = j ? 'rgb(60 54 48 / 0.92)' : '#52525b'
  const amtFill = j ? '#a85d52' : '#a1a1aa'

  const i = typeof index === 'number' ? index : 0
  /** 略晚于扇区展开，并按索引错开，引导线与文字同组渐显 */
  const calloutDelayMs = j ? 360 + i * 75 : 200 + i * 55

  return (
    <g className="pie-callout-fade" style={{ animationDelay: `${calloutDelayMs}ms` }}>
      <line
        x1={edgeX}
        y1={edgeY}
        x2={lx}
        y2={ly}
        stroke={lineStroke}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={tx + nudge}
        y={ty}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fill={nameFill}
        style={{
          fontSize: 11,
          fontWeight: 500,
          ...(j ? { fontFamily: LEGEND_FONT_DENGXIAN } : {}),
        }}
      >
        <tspan x={tx + nudge} dy="-6">
          {displayName}
        </tspan>
        <tspan
          x={tx + nudge}
          dy="13"
          fill={amtFill}
          style={{
            fontSize: 10,
            fontWeight: 400,
            ...(j ? { fontFamily: LEGEND_FONT_DENGXIAN } : {}),
          }}
        >
          {formatMoney(amt)}
        </tspan>
      </text>
    </g>
  )
}

interface Props {
  items: Transaction[]
  variant?: 'ledger' | 'journal'
}

export function MonthlyExpenseRing({ items, variant = 'ledger' }: Props) {
  const j = variant === 'journal'
  const ringColors = j ? RING_COLORS_JOURNAL : RING_COLORS_LEDGER

  const data = useMemo(() => buildExpenseSlices(items), [items])
  const total = useMemo(() => data.reduce((s, x) => s + x.value, 0), [data])

  const shell = j ? `${journalGridCard} mx-1 mt-4 px-2 pb-3 pt-3` : `${ledgerCard} mx-4 mt-4 px-2 pb-2 pt-3`
  const titleClass = j ? `mb-1.5 px-2 ${journalLabel}` : 'mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500'
  const emptyShell = j ? `${journalGridCard} mx-1 mt-4 px-4 py-9` : `${ledgerCard} mx-4 mt-4 px-4 py-8`

  const labelRenderer = useMemo(
    () => (props: PieLabelRenderProps) => <SliceCalloutLabel {...props} variant={variant} />,
    [variant],
  )

  const tipStyle = j
    ? {
        borderRadius: 8,
        border: '1px solid rgb(60 55 50 / 0.1)',
        boxShadow: '0 4px 16px rgb(40 35 30 / 0.08)',
        fontSize: 12,
        padding: '8px 10px',
        background: 'rgb(252 250 247 / 0.98)',
      }
    : {
        borderRadius: 10,
        border: '1px solid rgb(228 228 231)',
        boxShadow: '0 4px 14px rgba(24,24,27,0.06)',
        fontSize: 12,
        padding: '8px 10px',
        background: 'rgb(255 255 255 / 0.96)',
      }

  const tipLabel = j ? { color: '#1f1d1b', fontWeight: 600, marginBottom: 2 } : { color: '#18181b', fontWeight: 600, marginBottom: 2 }

  if (data.length === 0 || total <= 0) {
    return (
      <section className={emptyShell}>
        <p className={`text-center text-[13px] font-medium ${j ? 'text-[rgb(95_90_84/0.88)]' : 'text-zinc-500'}`}>本月暂无支出</p>
        <p className={`mt-1 text-center text-[12px] ${j ? 'text-[rgb(115_108_100/0.72)]' : 'text-zinc-400'}`}>添加支出后可查看构成</p>
      </section>
    )
  }

  return (
    <section className={shell}>
      <p className={titleClass}>本月支出构成</p>
      <div className="relative h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 6, bottom: 10, left: 6 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="68%"
              paddingAngle={2}
              stroke={j ? 'rgb(255 252 248 / 0.95)' : 'rgb(255 255 255 / 0.92)'}
              strokeWidth={2}
              isAnimationActive
              label={labelRenderer}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={ringColors[i % ringColors.length]} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              contentStyle={tipStyle}
              labelStyle={tipLabel}
              formatter={(value: number | undefined) => [formatMoney(value ?? 0), '']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${j ? 'text-[rgb(95_90_84/0.75)]' : 'text-zinc-500'}`}
          >
            支出合计
          </span>
          <span className={`mt-0.5 text-[15px] font-semibold tabular-nums tracking-tight ${j ? 'text-[#1f1d1b]' : 'text-zinc-900'}`}>
            {formatMoney(total)}
          </span>
        </div>
      </div>
    </section>
  )
}
