import type { Transaction } from '../types'
import { formatAmountDigits, formatDateHeading } from '../utils/format'
import {
  journalGridCard,
  journalInk,
  journalLabel,
  journalMuted,
  journalTerracotta,
  ledgerCard,
} from '../styles/homeJournal'

interface Props {
  items: Transaction[]
  onDelete: (id: string) => void | Promise<void>
  listTitle?: string | null
  emptyHint?: string
  variant?: 'page' | 'embedded'
  surface?: 'ledger' | 'journal'
}

export function TransactionList({
  items,
  onDelete,
  listTitle = '明细',
  emptyHint = '点击底部中间的「+」记一笔',
  variant = 'page',
  surface = 'ledger',
}: Props) {
  const shell = variant === 'embedded'
  const j = surface === 'journal'
  const card = j ? `${journalGridCard} px-4 py-10` : ledgerCard
  const rowBorder = j ? 'border-[rgb(60_55_50/0.07)]' : 'border-zinc-200/70'
  const dateMuted = j ? `text-[12px] font-medium ${journalMuted}` : 'text-[12px] font-medium text-zinc-500'
  const titleClass = j ? `${journalLabel} mb-3 px-1` : 'mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-500'

  if (items.length === 0) {
    return (
      <div
        className={`text-center ${shell ? 'mt-2' : j ? 'mx-1 mt-5' : 'mx-4 mt-6'} ${card}`}
      >
        <p className={`text-[15px] font-medium ${j ? journalMuted : 'text-zinc-500'}`}>暂无记录</p>
        <p className={`mt-1 text-[13px] ${j ? 'text-[rgb(115_108_100/0.72)]' : 'text-zinc-400'}`}>{emptyHint}</p>
      </div>
    )
  }

  const groups = groupByDate(items)

  return (
    <section className={shell ? 'mt-2 px-1 pb-2' : j ? 'mx-1 mt-5 px-1 pb-4' : 'mt-4 px-4 pb-3'}>
      {listTitle != null ? <h2 className={titleClass}>{listTitle}</h2> : null}
      <div className={`flex flex-col ${j ? 'gap-5' : 'gap-4'}`}>
        {groups.map(({ date, rows }) => (
          <div key={date}>
            <p className={`mb-2 px-1 ${dateMuted}`}>{formatDateHeading(date)}</p>
            <ul
              className={`overflow-hidden ${j ? `${journalGridCard}` : `rounded-2xl border ${rowBorder} bg-white/80 shadow-sm shadow-zinc-900/5`} backdrop-blur-sm`}
            >
              {rows.map((t, i) => (
                <li
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i > 0 ? `border-t ${rowBorder}` : ''
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                      j ? 'rounded-md' : 'rounded-full'
                    } ${
                      t.categoryIcon
                        ? j
                          ? 'bg-[rgb(245_242_237/0.95)] text-[#1f1d1b]'
                          : 'bg-zinc-100 text-zinc-900'
                        : t.kind === 'income'
                          ? j
                            ? 'bg-[rgb(237_234_229/0.95)] text-[13px] font-semibold text-[#1f1d1b]'
                            : 'bg-emerald-50 text-[13px] font-semibold text-emerald-700'
                          : j
                            ? 'bg-[rgb(252_238_235/0.65)] text-[13px] font-semibold text-[#a85d52]'
                            : 'bg-rose-50 text-[13px] font-semibold text-rose-700'
                    }`}
                  >
                    {t.categoryIcon ? (
                      <span className="text-[19px] leading-none" aria-hidden>
                        {t.categoryIcon}
                      </span>
                    ) : t.kind === 'income' ? (
                      '收'
                    ) : (
                      '支'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-[15px] font-semibold ${j ? journalInk : 'font-medium text-zinc-900'}`}>
                      {t.category || '未分类'}
                    </p>
                    {t.note ? (
                      <p className={`truncate text-[13px] ${j ? journalMuted : 'text-zinc-500'}`}>{t.note}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`text-[16px] font-semibold tabular-nums ${
                        t.kind === 'income' ? (j ? journalInk : 'text-emerald-600') : j ? journalTerracotta : 'text-zinc-900'
                      }`}
                    >
                      {t.kind === 'income' ? '+' : '−'}
                      {formatAmountDigits(t.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onDelete(t.id)}
                      className={`rounded-md px-2 py-1.5 text-[12px] font-medium touch-manipulation ${
                        j ? 'text-[#a85d52] opacity-45 active:opacity-70' : 'text-rose-600 active:bg-rose-50'
                      }`}
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function groupByDate(items: Transaction[]): { date: string; rows: Transaction[] }[] {
  const map = new Map<string, Transaction[]>()
  for (const t of items) {
    const list = map.get(t.date)
    if (list) list.push(t)
    else map.set(t.date, [t])
  }
  const dates = [...map.keys()].sort((a, b) => (a < b ? 1 : -1))
  return dates.map((date) => ({ date, rows: map.get(date)! }))
}
