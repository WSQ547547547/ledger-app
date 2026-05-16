import { useCallback, useEffect, useState } from 'react'
import { getDb } from '../lib/cloudbase'
import { fetchCategories, type CategoryDoc } from '../lib/ledgerDb'
import type { CategoryChip, TxKind } from '../types'
import { resolveCategoryIcon } from '../utils/categoryIcons'

const defaultExpense = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '充值'] as const
const defaultIncome = ['工资', '奖金', '兼职', '理财', '礼金'] as const

function mergeUnique(defaults: readonly string[], fromDb: string[]): string[] {
  const map = new Map<string, string>()
  for (const x of defaults) {
    const t = x.trim()
    if (t) map.set(t.toLowerCase(), t)
  }
  for (const x of fromDb) {
    const t = x.trim()
    if (t) map.set(t.toLowerCase(), t)
  }
  return [...map.values()]
}

function dbErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message
  }
  return '操作失败'
}

export function useCategoryOptions(userId: string | null) {
  const [dbRows, setDbRows] = useState<CategoryDoc[]>([])

  const reload = useCallback(async () => {
    if (!userId) {
      setDbRows([])
      return
    }
    try {
      setDbRows(await fetchCategories(userId))
    } catch (e) {
      console.error(e)
    }
  }, [userId])

  useEffect(() => {
    void reload()
  }, [reload])

  const optionsFor = useCallback(
    (kind: TxKind): CategoryChip[] => {
      const defaults = kind === 'income' ? defaultIncome : defaultExpense
      const namesFromDb = dbRows.filter((r) => r.kind === kind).map((r) => r.name)
      const merged = mergeUnique(defaults, namesFromDb)
      return merged.map((name) => {
        const row = dbRows.find(
          (x) => x.kind === kind && x.name.trim().toLowerCase() === name.trim().toLowerCase(),
        )
        return {
          name,
          icon: row?.icon?.trim() || resolveCategoryIcon(name),
          categoryId: row?._id ?? null,
        }
      })
    },
    [dbRows],
  )

  const createCategory = useCallback(
    async (
      name: string,
      kind: TxKind,
      icon?: string,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      const n = name.trim()
      if (!n) return { ok: false, message: '请输入分类名称' }
      const db = getDb()
      if (!db || !userId) return { ok: false, message: '未登录' }

      const ico = icon?.trim() || resolveCategoryIcon(n)
      const exists = dbRows.some((r) => r.kind === kind && r.name.trim().toLowerCase() === n.toLowerCase())
      if (exists) {
        await reload()
        return { ok: true }
      }

      try {
        await db.collection('categories').add({
          user_id: userId,
          name: n,
          kind,
          sort_order: 0,
          icon: ico,
          created_at: new Date().toISOString(),
        })
        await reload()
        return { ok: true }
      } catch (e) {
        return { ok: false, message: dbErrorMessage(e) }
      }
    },
    [userId, dbRows, reload],
  )

  const updateCategory = useCallback(
    async (
      id: string,
      name: string,
      icon?: string,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      const n = name.trim()
      if (!n) return { ok: false, message: '请输入分类名称' }
      const db = getDb()
      if (!db || !userId) return { ok: false, message: '未登录' }

      const dup = dbRows.some(
        (r) => r._id !== id && r.kind === dbRows.find((x) => x._id === id)?.kind && r.name.trim().toLowerCase() === n.toLowerCase(),
      )
      if (dup) return { ok: false, message: '已存在同名同类型分类' }

      const ico = icon?.trim() || resolveCategoryIcon(n)
      try {
        await db.collection('categories').doc(id).update({ name: n, icon: ico })
        await reload()
        return { ok: true }
      } catch (e) {
        return { ok: false, message: dbErrorMessage(e) }
      }
    },
    [userId, dbRows, reload],
  )

  const deleteCategory = useCallback(
    async (id: string): Promise<{ ok: true } | { ok: false; message: string }> => {
      const db = getDb()
      if (!db || !userId) return { ok: false, message: '未登录' }

      try {
        await db.collection('categories').doc(id).remove()
        await reload()
        return { ok: true }
      } catch (e) {
        return { ok: false, message: dbErrorMessage(e) }
      }
    },
    [userId, reload],
  )

  return { optionsFor, createCategory, updateCategory, deleteCategory, reload }
}
