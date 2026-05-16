import type { TxKind } from '../types'
import { resolveCategoryIcon } from '../utils/categoryIcons'
import { getDb } from './cloudbase'

export type CategoryDoc = {
  _id: string
  user_id: string
  name: string
  kind: TxKind
  icon: string | null
  sort_order: number
  created_at?: string
}

export type BillDoc = {
  _id: string
  user_id: string
  category_id: string | null
  kind: TxKind
  amount: number
  note: string
  occurred_on: string
  created_at?: string
  updated_at?: string
}

function nowIso() {
  return new Date().toISOString()
}

/** 按 user_id + name + kind 查找或新建分类，返回文档 _id */
export async function findOrCreateCategory(
  userId: string,
  name: string,
  kind: TxKind,
  icon?: string,
): Promise<string | null> {
  const db = getDb()
  if (!db) return null

  const displayName = name.trim() || '未分类'
  const ico = icon?.trim() || resolveCategoryIcon(displayName)

  const { data: existing } = await db
    .collection('categories')
    .where({ user_id: userId, name: displayName, kind })
    .limit(1)
    .get()

  const hit = (existing ?? [])[0] as CategoryDoc | undefined
  if (hit?._id) return hit._id

  const res = await db.collection('categories').add({
    user_id: userId,
    name: displayName,
    kind,
    icon: ico,
    sort_order: 0,
    created_at: nowIso(),
  })

  return (res as { id?: string }).id ?? null
}

export async function fetchCategories(userId: string): Promise<CategoryDoc[]> {
  const db = getDb()
  if (!db) return []

  const { data } = await db.collection('categories').where({ user_id: userId }).limit(1000).get()

  return ((data ?? []) as CategoryDoc[]).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

export async function fetchBills(userId: string): Promise<BillDoc[]> {
  const db = getDb()
  if (!db) return []

  const { data } = await db
    .collection('bills')
    .where({ user_id: userId })
    .orderBy('occurred_on', 'desc')
    .limit(1000)
    .get()

  const rows = (data ?? []) as BillDoc[]
  return rows.sort((a, b) => {
    const d = b.occurred_on.localeCompare(a.occurred_on)
    if (d !== 0) return d
    return (b.created_at ?? '').localeCompare(a.created_at ?? '')
  })
}
