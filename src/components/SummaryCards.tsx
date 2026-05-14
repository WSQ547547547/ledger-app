import { formatMoney } from '../utils/format'
import { journalGridCard, journalInk, journalLabel, journalTerracotta, ledgerCard } from '../styles/homeJournal'

interface Props {
  income: number
  expense: number
  balance: number
  variant?: 'ledger' | 'journal'
}

export function SummaryCards({ income, expense, balance, variant = 'ledger' }: Props) {
  const j = variant === 'journal'
  const card = j ? `${journalGridCard} px-3 py-3.5` : `${ledgerCard} px-3 py-3`
  const label = j ? journalLabel : 'text-[11px] font-medium uppercase tracking-wide text-zinc-500'

  return (
    <section className={`grid grid-cols-3 gap-2 ${j ? 'px-1 pt-1' : 'px-4 pt-4'}`}>
      <div className={card}>
        <p className={label}>年度收入</p>
        <p className={`mt-2 truncate text-[15px] font-semibold tabular-nums ${j ? `${journalInk} tracking-tight` : 'text-emerald-600'}`}>
          {formatMoney(income)}
        </p>
      </div>
      <div className={card}>
        <p className={label}>年度支出</p>
        <p className={`mt-2 truncate text-[15px] font-semibold tabular-nums ${j ? `${journalTerracotta} tracking-tight` : 'text-rose-600'}`}>
          {formatMoney(expense)}
        </p>
      </div>
      <div className={card}>
        <p className={label}>结余</p>
        <p className={`mt-2 truncate text-[15px] font-semibold tabular-nums ${j ? `${journalInk} tracking-tight` : 'text-zinc-900'}`}>
          {formatMoney(balance)}
        </p>
      </div>
    </section>
  )
}
