export type TxKind = 'income' | 'expense'

export interface CategoryChip {
  name: string
  icon: string
  /** 对应 `categories` 表主键；无则表示仅为内置推荐名，尚未入库，不可编辑删除 */
  categoryId?: string | null
}

export interface Transaction {
  id: string
  kind: TxKind
  amount: number
  category: string
  /** 展示用图标（emoji），由数据库或名称推断 */
  categoryIcon?: string
  note: string
  date: string
}
