import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Transaction } from '../types'
import { resolveCategoryIcon } from '../utils/categoryIcons'

type BillRow = {
  id: string
  kind: 'income' | 'expense'
  amount: number
  note: string
  occurred_on: string
  categories: { name: string; icon: string | null } | null
}

function mapRow(row: BillRow): Transaction {
  const name = row.categories?.name ?? '未分类'
  return {
    id: row.id,
    kind: row.kind,
    amount: Number(row.amount),
    category: name,
    categoryIcon: row.categories?.icon?.trim() || resolveCategoryIcon(name),
    note: row.note ?? '',
    date: row.occurred_on,
  }
}

export function useTransactions(userId: string | null) {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!supabase || !userId) {
      setItems([])
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('bills')
      .select('id, kind, amount, note, occurred_on, categories ( name, icon )')
      .eq('user_id', userId)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      console.error(error)
      setItems([])
      return
    }

    setItems(((data ?? []) as BillRow[]).map(mapRow))
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (t: Omit<Transaction, 'id'>) => {
      if (!supabase || !userId) return
      const displayName = t.category.trim() || '未分类'
      const icon = t.categoryIcon?.trim() || resolveCategoryIcon(displayName)

      const { data: catRow, error: catErr } = await supabase
        .from('categories')
        .upsert(
          { user_id: userId, name: displayName, kind: t.kind, icon },
          { onConflict: 'user_id,name,kind' },
        )
        .select('id')
        .single()

      if (catErr || !catRow) {
        console.error(catErr)
        return
      }

      const { error: billErr } = await supabase.from('bills').insert({
        user_id: userId,
        category_id: catRow.id,
        kind: t.kind,
        amount: t.amount,
        note: t.note,
        occurred_on: t.date,
      })

      if (billErr) {
        console.error(billErr)
        return
      }

      await refresh()
    },
    [userId, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      if (!supabase) return
      const { error } = await supabase.from('bills').delete().eq('id', id)
      if (error) console.error(error)
      else await refresh()
    },
    [refresh],
  )

  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const x of items) {
      if (x.kind === 'income') income += x.amount
      else expense += x.amount
    }
    return { income, expense, balance: income - expense }
  }, [items])

  return { items, add, remove, totals, loading, refresh }
}
