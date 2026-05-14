import { MonthlyExpenseRing } from '../MonthlyExpenseRing'
import { MonthlyStats } from '../MonthlyStats'
import { SummaryCards } from '../SummaryCards'
import { TransactionList } from '../TransactionList'
import { journalMuted, journalPage } from '../../styles/homeJournal'
import type { Transaction } from '../../types'

export interface HomeTabProps {
  dataLoading: boolean
  itemsLength: number
  yearSummary: { income: number; expense: number; balance: number }
  monthLabel: string
  monthTotals: { income: number; expense: number }
  monthItems: Transaction[]
  onMonthPrev: () => void
  onMonthNext: () => void
  onDelete: (id: string) => void | Promise<void>
}

export function HomeTab({
  dataLoading,
  itemsLength,
  yearSummary,
  monthLabel,
  monthTotals,
  monthItems,
  onMonthPrev,
  onMonthNext,
  onDelete,
}: HomeTabProps) {
  return (
    <div className={journalPage}>
      {dataLoading && itemsLength === 0 ? (
        <p className={`px-2 pt-3 text-center text-[13px] font-medium ${journalMuted}`}>同步数据中…</p>
      ) : null}

      <SummaryCards variant="journal" income={yearSummary.income} expense={yearSummary.expense} balance={yearSummary.balance} />

      <MonthlyStats
        variant="journal"
        label={monthLabel}
        income={monthTotals.income}
        expense={monthTotals.expense}
        onPrev={onMonthPrev}
        onNext={onMonthNext}
      />

      <MonthlyExpenseRing variant="journal" items={monthItems} />

      <TransactionList surface="journal" items={monthItems} onDelete={onDelete} />
    </div>
  )
}
