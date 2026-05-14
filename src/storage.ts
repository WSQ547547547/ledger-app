import type { Transaction } from './types'

const KEY = 'minimal-ledger-transactions-v1'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTransaction)
  } catch {
    return []
  }
}

export function saveTransactions(list: Transaction[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function isTransaction(x: unknown): x is Transaction {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    (o.kind === 'income' || o.kind === 'expense') &&
    typeof o.amount === 'number' &&
    Number.isFinite(o.amount) &&
    typeof o.category === 'string' &&
    typeof o.note === 'string' &&
    typeof o.date === 'string'
  )
}
