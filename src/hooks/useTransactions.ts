import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchBills, fetchCategories, findOrCreateCategory, type BillDoc, type CategoryDoc } from '../lib/ledgerDb'
import type { Transaction } from '../types'
import { resolveCategoryIcon } from '../utils/categoryIcons'
import { getDb } from '../lib/cloudbase'

function mapBill(bill: BillDoc, categories: Map<string, CategoryDoc>): Transaction {
  const cat = bill.category_id ? categories.get(bill.category_id) : undefined
  const name = cat?.name ?? '未分类'
  return {
    id: bill._id,
    kind: bill.kind,
    amount: Number(bill.amount),
    category: name,
    categoryIcon: cat?.icon?.trim() || resolveCategoryIcon(name),
    note: bill.note ?? '',
    date: bill.occurred_on,
  }
}

export function useTransactions(userId: string | null) {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const [bills, categories] = await Promise.all([fetchBills(userId), fetchCategories(userId)])
      const catMap = new Map(categories.map((c) => [c._id, c]))
      setItems(bills.map((b) => mapBill(b, catMap)))
    } catch (e) {
      console.error(e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = useCallback(
    async (t: Omit<Transaction, 'id'>) => {
      const db = getDb()
      if (!db || !userId) return

      const displayName = t.category.trim() || '未分类'
      const icon = t.categoryIcon?.trim() || resolveCategoryIcon(displayName)
      const categoryId = await findOrCreateCategory(userId, displayName, t.kind, icon)
      if (!categoryId) return

      const now = new Date().toISOString()
      try {
        await db.collection('bills').add({
          user_id: userId,
          category_id: categoryId,
          kind: t.kind,
          amount: t.amount,
          note: t.note,
          occurred_on: t.date,
          created_at: now,
          updated_at: now,
        })
        await refresh()
      } catch (e) {
        console.error(e)
      }
    },
    [userId, refresh],
  )

  const remove = useCallback(
    async (id: string) => {
      const db = getDb()
      if (!db) return
      try {
        await db.collection('bills').doc(id).remove()
        await refresh()
      } catch (e) {
        console.error(e)
      }
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
