import { formatMoney } from '../utils/format'
import {
  journalDateStrip,
  journalGridCard,
  journalInk,
  journalLabel,
  journalMuted,
  journalNavBtn,
  journalTerracotta,
  ledgerCard,
} from '../styles/homeJournal'

interface Props {
  label: string
  income: number
  expense: number
  onPrev: () => void
  onNext: () => void
  variant?: 'ledger' | 'journal'
}

export function MonthlyStats({
  label,
  income,
  expense,
  onPrev,
  onNext,
  variant = 'ledger',
}: Props) {
  const balance = income - expense
  const j = variant === 'journal'

  if (!j) {
    const shell = `${ledgerCard} p-4`
    return (
      <section className={`mx-4 mt-4 ${shell}`}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onPrev}
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-zinc-200/70 text-[17px] font-semibold text-slate-700 active:opacity-70"
            aria-label="上一月"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[13px] font-semibold text-zinc-900">{label}</p>
            <p className="mt-0.5 text-[11px] text-zinc-500">月度统计</p>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-zinc-200/70 text-[17px] font-semibold text-slate-700 active:opacity-70"
            aria-label="下一月"
          >
            ›
          </button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-zinc-200/70 pt-5">
          <div>
            <p className="text-[11px] text-zinc-500">本月收入</p>
            <p className="mt-1 text-[15px] font-semibold tabular-nums text-emerald-600">{formatMoney(income)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">本月支出</p>
            <p className="mt-1 text-[15px] font-semibold tabular-nums text-rose-600">{formatMoney(expense)}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">本月结余</p>
            <p className="mt-1 text-[15px] font-semibold tabular-nums text-zinc-900">{formatMoney(balance)}</p>
          </div>
        </div>
      </section>
    )
  }

  const mini = `${journalGridCard} px-3 py-3.5 text-center`

  return (
    <>
      <section className={`mx-1 mt-4 ${journalDateStrip}`}>
        <button type="button" onClick={onPrev} className={journalNavBtn} aria-label="上一月">
          ‹
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className={`text-[16px] font-semibold tracking-tight ${journalInk}`}>{label}</p>
          <p className={`mt-0.5 text-[11px] ${journalMuted}`}>月度统计</p>
        </div>
        <button type="button" onClick={onNext} className={journalNavBtn} aria-label="下一月">
          ›
        </button>
      </section>

      <section className="mx-1 mt-3 grid grid-cols-3 gap-2">
        <div className={mini}>
          <p className={journalLabel}>本月收入</p>
          <p className={`mt-2 text-[15px] font-semibold tabular-nums ${journalInk}`}>{formatMoney(income)}</p>
        </div>
        <div className={mini}>
          <p className={journalLabel}>本月支出</p>
          <p className={`mt-2 text-[15px] font-semibold tabular-nums ${journalTerracotta}`}>{formatMoney(expense)}</p>
        </div>
        <div className={mini}>
          <p className={journalLabel}>本月结余</p>
          <p className={`mt-2 text-[15px] font-semibold tabular-nums ${journalInk}`}>{formatMoney(balance)}</p>
        </div>
      </section>
    </>
  )
}
