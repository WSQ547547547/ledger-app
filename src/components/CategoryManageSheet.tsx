import { useEffect, useState } from 'react'
import type { TxKind } from '../types'
import { journalFieldCard, journalInk, journalMuted, journalTerracotta } from '../styles/homeJournal'
import { CATEGORY_EMOJI_PICKER } from '../utils/categoryIcons'

export interface CategorySheetTarget {
  id: string
  kind: TxKind
  name: string
  icon: string
}

interface Props {
  open: boolean
  target: CategorySheetTarget | null
  onClose: () => void
  onUpdate: (id: string, name: string, icon: string) => Promise<{ ok: true } | { ok: false; message: string }>
  onDelete: (id: string) => Promise<{ ok: true } | { ok: false; message: string }>
}

type SheetMode = 'menu' | 'edit' | 'delete'

export function CategoryManageSheet({ open, target, onClose, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<SheetMode>('menu')
  const [draftName, setDraftName] = useState('')
  const [draftIcon, setDraftIcon] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open || !target) return
    setMode('menu')
    setDraftName(target.name)
    setDraftIcon(target.icon)
    setError(null)
    setBusy(false)
  }, [open, target])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !target) return null

  const kindLabel = target.kind === 'expense' ? '支出' : '收入'

  async function handleSaveEdit() {
    setError(null)
    setBusy(true)
    const res = await onUpdate(target.id, draftName.trim(), draftIcon.trim())
    setBusy(false)
    if (res.ok) onClose()
    else setError(res.message)
  }

  async function handleConfirmDelete() {
    setError(null)
    setBusy(true)
    const res = await onDelete(target.id)
    setBusy(false)
    if (res.ok) onClose()
    else setError(res.message)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[rgb(40_35_30/0.38)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="关闭"
      />
      <div className="journal-serif relative max-h-[85dvh] overflow-y-auto rounded-t-[20px] border-t border-[rgb(60_55_50/0.12)] bg-[#ebe6dc] shadow-[0_-8px_40px_rgb(40_35_30/0.14)]">
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-[rgb(60_55_50/0.22)]" />
        </div>
        <div
          className="px-4 pt-2"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] text-[16px] font-medium ${journalMuted} touch-manipulation active:opacity-70`}
            >
              关闭
            </button>
            <h2 className={`text-[16px] font-semibold ${journalInk}`}>
              {mode === 'menu' && '分类'}
              {mode === 'edit' && '编辑分类'}
              {mode === 'delete' && '删除分类'}
            </h2>
            <span className="w-12" />
          </div>

          {error ? (
            <p className={`mb-3 rounded-lg px-3 py-2 text-[13px] font-medium ${journalTerracotta} bg-[rgb(252_238_235/0.65)] ring-1 ring-[rgb(168_93_82/0.2)]`}>
              {error}
            </p>
          ) : null}

          {mode === 'menu' ? (
            <div className="space-y-2">
              <p className={`text-[13px] ${journalMuted}`}>
                {kindLabel} · {target.name}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode('edit')
                  setDraftName(target.name)
                  setDraftIcon(target.icon)
                  setError(null)
                }}
                className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-lg border border-[rgb(60_55_50/0.12)] bg-[rgb(252_250_247/0.9)] py-3.5 text-[16px] font-semibold text-[#3a3632] shadow-sm active:bg-[rgb(240_236_228/0.95)] disabled:opacity-50"
              >
                编辑分类
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode('delete')
                  setError(null)
                }}
                className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-lg border border-[rgb(168_93_82/0.35)] bg-[rgb(252_248_246/0.9)] py-3.5 text-[16px] font-semibold text-[#a85d52] active:opacity-85 disabled:opacity-50"
              >
                删除分类
              </button>
            </div>
          ) : null}

          {mode === 'edit' ? (
            <div className="space-y-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode('menu')
                  setError(null)
                }}
                className={`text-[14px] font-medium ${journalMuted} touch-manipulation`}
              >
                ← 返回
              </button>
              <div className={`block ${journalFieldCard}`}>
                <span className={`text-[13px] font-medium ${journalMuted}`}>名称</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className={`mt-1 w-full border-0 bg-transparent text-[17px] outline-none ${journalInk}`}
                  placeholder="分类名称"
                  autoComplete="off"
                />
              </div>
              <div className={`block ${journalFieldCard}`}>
                <span className={`text-[13px] font-medium ${journalMuted}`}>图标</span>
                <div className="mt-2 flex max-h-[140px] flex-wrap gap-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] py-0.5">
                  {CATEGORY_EMOJI_PICKER.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setDraftIcon(emo)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[18px] leading-none touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-[#b8966a]/50 ${
                        draftIcon === emo
                          ? 'bg-[#b8966a] text-white shadow-sm'
                          : 'bg-[rgb(252_250_247/0.95)] ring-1 ring-[rgb(60_55_50/0.08)] active:opacity-80'
                      }`}
                      aria-label={`选择 ${emo}`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled={busy || !draftName.trim()}
                onClick={() => void handleSaveEdit()}
                className="w-full rounded-lg bg-[#b8966a] py-3.5 text-[16px] font-semibold text-white shadow-[0_6px_20px_-4px_rgb(80_55_30/0.35)] active:bg-[#a88960] disabled:opacity-45"
              >
                {busy ? '保存中…' : '保存'}
              </button>
            </div>
          ) : null}

          {mode === 'delete' ? (
            <div className="space-y-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setMode('menu')
                  setError(null)
                }}
                className={`text-[14px] font-medium ${journalMuted} touch-manipulation`}
              >
                ← 返回
              </button>
              <p className={`text-[14px] leading-relaxed ${journalMuted}`}>
                删除后，原属于「{target.name}」的账单将变为<strong className={journalInk}>未分类</strong>（数据不会删除）。
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleConfirmDelete()}
                className="w-full rounded-lg border border-[rgb(168_93_82/0.45)] bg-[rgb(252_240_236/0.85)] py-3.5 text-[16px] font-semibold text-[#a85d52] active:opacity-90 disabled:opacity-45"
              >
                {busy ? '删除中…' : '确认删除'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
