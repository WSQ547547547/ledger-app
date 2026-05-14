/** 内置分类名 → emoji（未命中时用 resolveCategoryIcon 的兜底） */
const DEFAULT_ICON_BY_NAME: Record<string, string> = {
  餐饮: '🍜',
  交通: '🚌',
  购物: '🛒',
  居住: '🏠',
  娱乐: '🎮',
  医疗: '💊',
  充值: '💳',
  工资: '💰',
  奖金: '🎁',
  兼职: '💼',
  理财: '📈',
  礼金: '🧧',
}

/** 新建分类时可点的常用 emoji */
export const CATEGORY_EMOJI_PICKER: readonly string[] = [
  '🍜',
  '💊',
  '💳',
  '🚌',
  '🛒',
  '🏠',
  '🎮',
  '💰',
  '🎁',
  '💼',
  '📈',
  '🧧',
  '☕',
  '🍔',
  '✈️',
  '⛽',
  '📱',
  '🎬',
  '🏥',
  '🧾',
  '✨',
] as const

export function resolveCategoryIcon(name: string): string {
  const k = name.trim()
  if (!k) return '✨'
  const hit = DEFAULT_ICON_BY_NAME[k] ?? DEFAULT_ICON_BY_NAME[k.toLowerCase()]
  if (hit) return hit
  return '✨'
}
