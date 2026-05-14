import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { CategoryChip, TxKind } from '../types'
import { journalFieldCard, journalInk, journalMuted, journalTerracotta } from '../styles/homeJournal'
import { CATEGORY_EMOJI_PICKER, resolveCategoryIcon } from '../utils/categoryIcons'
import { todayIso } from '../utils/format'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (payload: {
    kind: TxKind
    amount: number
    category: string
    categoryIcon?: string
    note: string
    date: string
  }) => void | Promise<void>
  getChipCategories: (kind: TxKind) => CategoryChip[]
  reloadCategories: () => void | Promise<void>
  createCategory: (
    name: string,
    kind: TxKind,
    icon?: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>
}

export function AddSheet({
  open,
  onClose,
  onSave,
  getChipCategories,
  reloadCategories,
  createCategory,
}: Props) {
  const [kind, setKind] = useState<TxKind>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [chosenBillIcon, setChosenBillIcon] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>('✨')
  const [categoryHint, setCategoryHint] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayIso())

  const reloadCategoriesRef = useRef(reloadCategories)
  reloadCategoriesRef.current = reloadCategories

  useEffect(() => {
    if (!open) return
    setKind('expense')
    setAmount('')
    setCategory('')
    setChosenBillIcon(null)
    setNewCategoryName('')
    setNewCategoryIcon('✨')
    setCategoryHint(null)
    setNote('')
    setDate(todayIso())
    void reloadCategoriesRef.current()
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const chips = getChipCategories(kind)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const n = Number.parseFloat(amount)
    if (!Number.isFinite(n) || n <= 0) return
    const name = category.trim() || '未分类'
    const icon = chosenBillIcon ?? resolveCategoryIcon(name)
    await Promise.resolve(
      onSave({
        kind,
        amount: n,
        category: category.trim(),
        categoryIcon: icon,
        note: note.trim(),
        date,
      }),
    )
    onClose()
  }

  async function handleAddCustomCategory() {
    setCategoryHint(null)
    const res = await createCategory(newCategoryName, kind, newCategoryIcon)
    if (res.ok) {
      const name = newCategoryName.trim()
      setCategory(name)
      setChosenBillIcon(newCategoryIcon.trim() || resolveCategoryIcon(name))
      setNewCategoryName('')
      setNewCategoryIcon('✨')
      setCategoryHint('已添加并选中该分类')
    } else {
      setCategoryHint(res.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[rgb(40_35_30/0.38)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="journal-serif relative max-h-[90dvh] overflow-y-auto rounded-t-[20px] border-t border-[rgb(60_55_50/0.12)] bg-[#ebe6dc] shadow-[0_-8px_40px_rgb(40_35_30/0.14)]">
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-[rgb(60_55_50/0.22)]" />
        </div>
        <div
          className="px-4 pt-2"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className={`text-[17px] font-medium ${journalMuted} active:opacity-70`}
            >
              取消
            </button>
            <h2 className={`text-[17px] font-semibold ${journalInk}`}>记一笔</h2>
            <span className="w-12" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(245_242_237/0.95)] p-1 shadow-inner shadow-black/5">
              <button
                type="button"
                onClick={() => {
                  setKind('expense')
                  setCategoryHint(null)
                }}
                className={`flex-1 rounded-md py-2.5 text-[15px] font-semibold transition-colors ${
                  kind === 'expense'
                    ? 'bg-[rgb(252_250_247)] text-[#a85d52] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)]'
                    : `text-[rgb(105_98_90/0.78)] active:bg-[rgb(235_232_226/0.85)]`
                }`}
              >
                支出
              </button>
              <button
                type="button"
                onClick={() => {
                  setKind('income')
                  setCategoryHint(null)
                }}
                className={`flex-1 rounded-md py-2.5 text-[15px] font-semibold transition-colors ${
                  kind === 'income'
                    ? 'bg-[rgb(252_250_247)] text-[#1f1d1b] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)]'
                    : `text-[rgb(105_98_90/0.78)] active:bg-[rgb(235_232_226/0.85)]`
                }`}
              >
                收入
              </button>
            </div>

            <label className={`block ${journalFieldCard}`}>
              <span className={`text-[13px] font-medium ${journalMuted}`}>金额</span>
              <input
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`mt-1 w-full border-0 bg-transparent text-[28px] font-semibold tabular-nums outline-none placeholder:text-[rgb(115_108_100/0.45)] ${journalInk}`}
              />
            </label>

            <div className={`block ${journalFieldCard}`}>
              <span className={`text-[13px] font-medium ${journalMuted}`}>分类</span>
              <input
                type="text"
                placeholder="例如：餐饮，或从下方选择 / 新建"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setChosenBillIcon(null)
                }}
                className={`mt-1 w-full border-0 bg-transparent text-[17px] outline-none placeholder:text-[rgb(115_108_100/0.45)] ${journalInk}`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setCategory(c.name)
                      setChosenBillIcon(c.icon)
                      setCategoryHint(null)
                    }}
                    className={`rounded-full px-3 py-1 text-[13px] font-medium active:opacity-80 ${
                      category.trim() === c.name
                        ? 'bg-[#b8966a] text-white shadow-sm shadow-[rgb(80_55_30/0.2)]'
                        : 'bg-[rgb(252_250_247/0.85)] text-[#3a3632] ring-1 ring-[rgb(60_55_50/0.1)]'
                    }`}
                  >
                    <span className="mr-1" aria-hidden>
                      {c.icon}
                    </span>
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(245_242_237/0.75)] p-3">
                <p className={`text-[12px] font-medium ${journalMuted}`}>自定义分类</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value)
                      setCategoryHint(null)
                    }}
                    placeholder="输入新标签名称"
                    className={`min-w-0 flex-1 rounded-md border border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.95)] px-3 py-2 text-[15px] outline-none placeholder:text-[rgb(115_108_100/0.45)] ${journalInk}`}
                  />
                  <button
                    type="button"
                    onClick={() => void handleAddCustomCategory()}
                    className="shrink-0 rounded-md bg-[#3a3632] px-3 py-2 text-[14px] font-semibold text-[rgb(252_250_247)] shadow-sm active:opacity-90"
                  >
                    添加
                  </button>
                </div>
                <p className={`mt-2 text-[11px] font-medium ${journalMuted}`}>图标</p>
                <div className="mt-1.5 flex max-h-[132px] flex-wrap gap-0.5 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-0.5 py-0.5">
                  {CATEGORY_EMOJI_PICKER.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setNewCategoryIcon(emo)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 p-0.5 text-[12px] leading-none ring-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#b8966a]/50 ${
                        newCategoryIcon === emo
                          ? 'bg-[#b8966a] text-white shadow-sm'
                          : 'bg-[rgb(252_250_247/0.95)] text-[#1f1d1b] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)] active:opacity-80'
                      }`}
                      aria-label={`选择图标 ${emo}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
                {categoryHint ? (
                  <p
                    className={`mt-2 text-[12px] ${
                      categoryHint.startsWith('已添加') ? journalInk : journalTerracotta
                    }`}
                  >
                    {categoryHint}
                  </p>
                ) : null}
              </div>
            </div>

            <label className={`block ${journalFieldCard}`}>
              <span className={`text-[13px] font-medium ${journalMuted}`}>备注</span>
              <input
                type="text"
                placeholder="可选"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`mt-1 w-full border-0 bg-transparent text-[17px] outline-none placeholder:text-[rgb(115_108_100/0.45)] ${journalInk}`}
              />
            </label>

            <label className={`block ${journalFieldCard}`}>
              <span className={`text-[13px] font-medium ${journalMuted}`}>日期</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-1 w-full border-0 bg-transparent text-[17px] outline-none ${journalInk}`}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#b8966a] py-3.5 text-[17px] font-semibold text-white shadow-[0_6px_20px_-4px_rgb(80_55_30/0.35)] active:bg-[#a88960]"
            >
              保存
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
