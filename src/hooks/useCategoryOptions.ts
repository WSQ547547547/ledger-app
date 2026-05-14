import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CategoryChip, TxKind } from '../types'
import { resolveCategoryIcon } from '../utils/categoryIcons'

const defaultExpense = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '充值'] as const
const defaultIncome = ['工资', '奖金', '兼职', '理财', '礼金'] as const

type DbRow = { id: string; name: string; kind: TxKind; icon: string | null }

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

export function useCategoryOptions(userId: string | null) {
  const [dbRows, setDbRows] = useState<DbRow[]>([])

  const reload = useCallback(async () => {
    if (!supabase || !userId) {
      setDbRows([])
      return
    }
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, kind, icon')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    const rows: DbRow[] = (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind as TxKind,
      icon: r.icon,
    }))
    setDbRows(rows)
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
          categoryId: row?.id ?? null,
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
      if (!supabase || !userId) return { ok: false, message: '未登录' }

      const ico = icon?.trim() || resolveCategoryIcon(n)

      const { error } = await supabase.from('categories').insert({
        user_id: userId,
        name: n,
        kind,
        sort_order: 0,
        icon: ico,
      })

      if (error) {
        if (error.code === '23505') {
          await reload()
          return { ok: true }
        }
        return { ok: false, message: error.message }
      }

      await reload()
      return { ok: true }
    },
    [userId, reload],
  )

  const updateCategory = useCallback(
    async (
      id: string,
      name: string,
      icon?: string,
    ): Promise<{ ok: true } | { ok: false; message: string }> => {
      const n = name.trim()
      if (!n) return { ok: false, message: '请输入分类名称' }
      if (!supabase || !userId) return { ok: false, message: '未登录' }

      const ico = icon?.trim() || resolveCategoryIcon(n)

      const { error } = await supabase
        .from('categories')
        .update({ name: n, icon: ico })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        if (error.code === '23505') {
          return { ok: false, message: '已存在同名同类型分类' }
        }
        return { ok: false, message: error.message }
      }

      await reload()
      return { ok: true }
    },
    [userId, reload],
  )

  const deleteCategory = useCallback(
    async (id: string): Promise<{ ok: true } | { ok: false; message: string }> => {
      if (!supabase || !userId) return { ok: false, message: '未登录' }

      const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)

      if (error) return { ok: false, message: error.message }

      await reload()
      return { ok: true }
    },
    [userId, reload],
  )

  return { optionsFor, createCategory, updateCategory, deleteCategory, reload }
}
