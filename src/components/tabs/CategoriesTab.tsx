import { useState } from 'react'
import type { CategoryChip, TxKind } from '../../types'
import type { CategorySheetTarget } from '../CategoryManageSheet'
import { journalGridCard, journalInk, journalLabel, journalPage, journalMuted } from '../../styles/homeJournal'

function Chip({
  c,
  kind,
  onPress,
}: {
  c: CategoryChip
  kind: TxKind
  onPress: (c: CategoryChip, kind: TxKind) => void
}) {
  const inDb = Boolean(c.categoryId)
  return (
    <button
      type="button"
      onClick={() => onPress(c, kind)}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-left text-[14px] font-medium touch-manipulation transition-opacity active:opacity-85 ${
        inDb
          ? `border-[rgb(60_55_50/0.12)] bg-[rgb(252_250_247/0.65)] ${journalInk}`
          : `border-[rgb(60_55_50/0.08)] bg-[rgb(252_250_247/0.4)] ${journalMuted}`
      }`}
    >
      <span aria-hidden className="text-[16px] leading-none">
        {c.icon}
      </span>
      {c.name}
    </button>
  )
}

export function CategoriesTab({
  expenseChips,
  incomeChips,
  onManageCategory,
}: {
  expenseChips: CategoryChip[]
  incomeChips: CategoryChip[]
  onManageCategory: (target: CategorySheetTarget) => void
}) {
  const [hint, setHint] = useState<string | null>(null)

  function handleChip(c: CategoryChip, kind: TxKind) {
    if (!c.categoryId) {
      setHint('该分类尚未入库：请用底部「+」记一笔并选用此名称后，即可在此编辑名称、图标或删除分类。')
      return
    }
    setHint(null)
    onManageCategory({ id: c.categoryId, kind, name: c.name, icon: c.icon })
  }

  return (
    <div className={`${journalPage} space-y-5`}>
      {hint ? (
        <div className="rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.85)] px-3 py-2.5">
          <p className={`text-[13px] leading-relaxed ${journalMuted}`}>{hint}</p>
          <button
            type="button"
            onClick={() => setHint(null)}
            className={`mt-2 text-[12px] font-semibold ${journalInk} touch-manipulation underline decoration-[rgb(60_55_50/0.25)] underline-offset-2`}
          >
            知道了
          </button>
        </div>
      ) : null}

      <section>
        <h2 className={`mb-2 px-1 ${journalLabel}`}>支出分类</h2>
        <div className={`${journalGridCard} p-4`}>
          <div className="flex flex-wrap gap-2">
            {expenseChips.map((c) => (
              <Chip key={`e-${c.name}`} c={c} kind="expense" onPress={handleChip} />
            ))}
          </div>
        </div>
      </section>
      <section>
        <h2 className={`mb-2 px-1 ${journalLabel}`}>收入分类</h2>
        <div className={`${journalGridCard} p-4`}>
          <div className="flex flex-wrap gap-2">
            {incomeChips.map((c) => (
              <Chip key={`i-${c.name}`} c={c} kind="income" onPress={handleChip} />
            ))}
          </div>
        </div>
      </section>
      <p className={`px-1 text-center text-[12px] leading-relaxed ${journalMuted}`}>
        点击已有分类可编辑或删除；改名后关联账单会同步显示新名称。
      </p>
    </div>
  )
}
