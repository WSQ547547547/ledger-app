import { useMemo, useState } from 'react'
import type { Transaction } from '../types'
import { journalNavBtn } from '../styles/homeJournal'
import { formatAmountDigits, monthKeyFromDate, monthLabel, todayIso } from '../utils/format'

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日'] as const

type CalendarHeatMode = 'expense' | 'income'

function parseMonthKey(key: string): { y: number; m: number } {
  const [ys, ms] = key.split('-')
  return { y: Number.parseInt(ys, 10), m: Number.parseInt(ms, 10) }
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate()
}

function isoDay(y: number, m: number, day: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** 支出热力：浅纸色 → 陶土红（与首页支出一致） */
const TERRA_50 = [252, 238, 235] as const
const TERRA_CORE = [168, 93, 82] as const
/** 收入热力：浅芽灰 → 墨绿（与暖底、陶土红协调） */
const MOSS_50 = [232, 241, 236] as const
const MOSS_CORE = [36, 66, 56] as const

function mixRgb(from: readonly [number, number, number], to: readonly [number, number, number], t: number): string {
  const x = Math.min(1, Math.max(0, t))
  const r = Math.round(from[0] + (to[0] - from[0]) * x)
  const g = Math.round(from[1] + (to[1] - from[1]) * x)
  const b = Math.round(from[2] + (to[2] - from[2]) * x)
  return `rgb(${r} ${g} ${b})`
}

function expenseHeatColor(amount: number, maxAmount: number): string | undefined {
  if (amount <= 0) return undefined
  if (maxAmount <= 0) return mixRgb(TERRA_50, TERRA_CORE, 0.15)
  const t = Math.min(1, amount / maxAmount)
  return mixRgb(TERRA_50, TERRA_CORE, t)
}

function incomeHeatColor(amount: number, maxAmount: number): string | undefined {
  if (amount <= 0) return undefined
  if (maxAmount <= 0) return mixRgb(MOSS_50, MOSS_CORE, 0.12)
  const t = Math.min(1, amount / maxAmount)
  return mixRgb(MOSS_50, MOSS_CORE, t)
}

interface Props {
  items: Transaction[]
  monthKey: string
  onPrev: () => void
  onNext: () => void
  onDateSelect: (isoDay: string) => void
  selectedDay: string | null
}

export function StatsExpenseCalendar({
  items,
  monthKey,
  onPrev,
  onNext,
  onDateSelect,
  selectedDay,
}: Props) {
  const [heatMode, setHeatMode] = useState<CalendarHeatMode>('expense')
  const { y, m } = parseMonthKey(monthKey)
  const dim = daysInMonth(y, m)

  const { amountByDay, maxAmount } = useMemo(() => {
    const map = new Map<string, number>()
    let max = 0
    const kind = heatMode === 'expense' ? 'expense' : 'income'
    for (const t of items) {
      if (t.kind !== kind) continue
      if (monthKeyFromDate(t.date) !== monthKey) continue
      const d = t.date.slice(0, 10)
      const next = (map.get(d) ?? 0) + t.amount
      map.set(d, next)
      if (next > max) max = next
    }
    return { amountByDay: map, maxAmount: max }
  }, [items, monthKey, heatMode])

  const { padStart, padEnd } = useMemo(() => {
    const first = new Date(y, m - 1, 1)
    const dow = first.getDay()
    const ps = (dow + 6) % 7
    const total = ps + dim
    const pe = (7 - (total % 7)) % 7
    return { padStart: ps, padEnd: pe }
  }, [y, m, dim])

  const today = todayIso()

  return (
    <section className="journal-grid-card p-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={onPrev} className={journalNavBtn} aria-label="上一月">
          ‹
        </button>
        <p className="min-w-0 flex-1 text-center text-[15px] font-semibold text-[#1f1d1b]">{monthLabel(monthKey)}</p>
        <button type="button" onClick={onNext} className={journalNavBtn} aria-label="下一月">
          ›
        </button>
      </div>

      <div className="mt-3 flex rounded-lg border border-[rgb(60_55_50/0.08)] bg-[rgb(245_242_237/0.9)] p-1 shadow-inner shadow-black/5">
        <button
          type="button"
          onClick={() => setHeatMode('expense')}
          className={`min-h-[44px] flex-1 touch-manipulation rounded-md text-[15px] font-semibold transition-colors ${
            heatMode === 'expense'
              ? 'bg-[rgb(252_250_247)] text-[#a85d52] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)]'
              : 'text-[rgb(105_98_90/0.78)] active:bg-[rgb(235_232_226/0.8)]'
          }`}
        >
          支出
        </button>
        <button
          type="button"
          onClick={() => setHeatMode('income')}
          className={`min-h-[44px] flex-1 touch-manipulation rounded-md text-[15px] font-semibold transition-colors ${
            heatMode === 'income'
              ? 'bg-[rgb(252_250_247)] text-[#244238] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)]'
              : 'text-[rgb(105_98_90/0.78)] active:bg-[rgb(235_232_226/0.8)]'
          }`}
        >
          收入
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {WEEK_LABELS.map((w) => (
          <div key={w} className="pb-1 text-[11px] font-semibold text-[rgb(105_98_90/0.65)]">
            {w}
          </div>
        ))}
        {Array.from({ length: padStart }, (_, i) => (
          <div key={`e-${i}`} className="aspect-square min-h-[2.25rem]" aria-hidden />
        ))}
        {Array.from({ length: dim }, (_, i) => {
          const day = i + 1
          const iso = isoDay(y, m, day)
          const amount = amountByDay.get(iso) ?? 0
          const heatFn = heatMode === 'expense' ? expenseHeatColor : incomeHeatColor
          const bg = heatFn(amount, maxAmount)
          const isToday = iso === today
          const t = maxAmount > 0 ? amount / maxAmount : 0
          const modeLabel = heatMode === 'expense' ? '支出' : '收入'
          const label =
            amount > 0
              ? `${monthLabel(monthKey)}${day}日，${modeLabel} ${formatAmountDigits(amount)} 元`
              : `${monthLabel(monthKey)}${day}日，无${modeLabel}`

          const selected = selectedDay === iso
          const focusRing = selected
            ? 'ring-2 ring-[#3a3632] ring-offset-2 ring-offset-[rgb(252_250_247)]'
            : isToday
              ? 'ring-2 ring-[#b8966a]/75 ring-offset-1 ring-offset-[rgb(252_250_247)]'
              : ''

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDateSelect(iso)}
              aria-label={`${label}，点击查看当日收支`}
              aria-pressed={selected}
              className={`flex aspect-square min-h-[2.25rem] flex-col items-center justify-center rounded-lg text-[13px] font-semibold tabular-nums touch-manipulation active:opacity-90 ${
                bg ? '' : 'bg-[rgb(245_242_237/0.95)] text-[#3a3632] ring-1 ring-inset ring-[rgb(60_55_50/0.08)]'
              } ${focusRing}`}
              style={
                bg
                  ? {
                      backgroundColor: bg,
                      color:
                        heatMode === 'expense'
                          ? t > 0.42
                            ? 'rgb(252 250 247)'
                            : 'rgb(55 48 44)'
                          : t > 0.42
                            ? 'rgb(252 250 247)'
                            : 'rgb(38 52 46)',
                    }
                  : undefined
              }
            >
              {day}
            </button>
          )
        })}
        {Array.from({ length: padEnd }, (_, i) => (
          <div key={`t-${i}`} className="aspect-square min-h-[2.25rem]" aria-hidden />
        ))}
      </div>
    </section>
  )
}
