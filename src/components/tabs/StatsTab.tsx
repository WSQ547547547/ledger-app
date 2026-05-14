import { useEffect, useMemo, useRef, useState } from 'react'
import { StatsExpenseCalendar } from '../StatsExpenseCalendar'
import { TransactionList } from '../TransactionList'
import type { Transaction } from '../../types'
import { journalGridCard, journalInk, journalLabel, journalMuted, journalPage, journalTerracotta } from '../../styles/homeJournal'
import { currentMonthKey, formatMoney, monthKeyFromDate, monthLabel, shiftMonth } from '../../utils/format'

function dayKeyFromTx(t: Transaction): string {
  return t.date.length >= 10 ? t.date.slice(0, 10) : t.date
}

interface StatsTabProps {
  items: Transaction[]
  onDelete: (id: string) => void | Promise<void>
}

export function StatsTab({ items, onDelete }: StatsTabProps) {
  const [calendarMonth, setCalendarMonth] = useState(() => currentMonthKey())
  const [detailDay, setDetailDay] = useState<string | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const rows = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const t of items) {
      const k = monthKeyFromDate(t.date)
      const cur = map.get(k) ?? { income: 0, expense: 0 }
      if (t.kind === 'income') cur.income += t.amount
      else cur.expense += t.amount
      map.set(k, cur)
    }
    return [...map.entries()]
      .map(([key, v]) => ({
        key,
        label: monthLabel(key),
        ...v,
        net: v.income - v.expense,
      }))
      .sort((a, b) => (a.key < b.key ? 1 : -1))
  }, [items])

  const dayItems = useMemo(() => {
    if (!detailDay) return []
    return items.filter((t) => dayKeyFromTx(t) === detailDay)
  }, [items, detailDay])

  useEffect(() => {
    if (!detailDay) return
    if (monthKeyFromDate(detailDay) !== calendarMonth) setDetailDay(null)
  }, [calendarMonth, detailDay])

  useEffect(() => {
    if (!detailDay) return
    const el = detailRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [detailDay])

  function handleDateSelect(iso: string) {
    setDetailDay((prev) => (prev === iso ? null : iso))
  }

  return (
    <div className={`${journalPage} space-y-4`}>
      <StatsExpenseCalendar
        items={items}
        monthKey={calendarMonth}
        onPrev={() => setCalendarMonth((k) => shiftMonth(k, -1))}
        onNext={() => setCalendarMonth((k) => shiftMonth(k, 1))}
        onDateSelect={handleDateSelect}
        selectedDay={detailDay}
      />

      {detailDay ? (
        <div ref={detailRef} className={`${journalGridCard} p-3`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className={`truncate text-[15px] font-semibold ${journalInk}`}>当日收支</p>
            <button
              type="button"
              onClick={() => setDetailDay(null)}
              className="min-h-[40px] shrink-0 touch-manipulation rounded-md border border-[rgb(60_55_50/0.1)] bg-[rgb(245_242_237/0.85)] px-3 text-[15px] font-medium text-[#3a3632] active:opacity-75"
            >
              关闭
            </button>
          </div>
          <TransactionList
            items={dayItems}
            onDelete={onDelete}
            listTitle={null}
            emptyHint="当日暂无收支记录"
            variant="embedded"
            surface="journal"
          />
        </div>
      ) : null}

      <p className={`px-1 ${journalLabel}`}>按月汇总</p>
      {rows.length === 0 ? (
        <div className={`${journalGridCard} px-4 py-10 text-center`}>
          <p className={`text-[15px] font-medium ${journalMuted}`}>暂无账单数据</p>
          <p className="mt-2 text-[13px] text-[rgb(115_108_100/0.72)]">记一笔后将按月份汇总展示</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.key} className={`${journalGridCard} px-4 py-3.5`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-[16px] font-semibold ${journalInk}`}>{r.label}</span>
                <span
                  className={`shrink-0 text-[14px] font-semibold tabular-nums ${
                    r.net >= 0 ? journalInk : journalTerracotta
                  }`}
                >
                  {r.net >= 0 ? '+' : ''}
                  {formatMoney(r.net)}
                </span>
              </div>
              <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] ${journalMuted}`}>
                <span>
                  收 <span className={`font-semibold tabular-nums ${journalInk}`}>{formatMoney(r.income)}</span>
                </span>
                <span>
                  支 <span className={`font-semibold tabular-nums ${journalTerracotta}`}>{formatMoney(r.expense)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
