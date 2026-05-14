const currencyFmt = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(n: number): string {
  return currencyFmt.format(n)
}

export function monthKeyFromDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/** ISO 日期 `YYYY-MM-DD` 等 → 年份 `YYYY` */
export function yearKeyFromDate(isoDate: string): string {
  return isoDate.slice(0, 4)
}

/** 当前自然年 `YYYY` */
export function currentCalendarYearKey(): string {
  return String(new Date().getFullYear())
}

/** 当前系统年月 `YYYY-MM` */
export function currentMonthKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function shiftMonth(key: string, delta: number): string {
  const [ys, ms] = key.split('-')
  const y = Number.parseInt(ys, 10)
  const m = Number.parseInt(ms, 10)
  const dt = new Date(y, m - 1 + delta, 1)
  const ny = dt.getFullYear()
  const nm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

/** 如 `2026年5月` */
export function monthLabel(key: string): string {
  const [ys, ms] = key.split('-')
  return `${ys}年${Number.parseInt(ms, 10)}月`
}

const amountFmt = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 不含货币符号，用于列表两侧对齐 */
export function formatAmountDigits(n: number): string {
  return amountFmt.format(n)
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 如 `2026年5月9日 周五` */
export function formatDateHeading(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${y}年${m}月${d}日 ${weekdays[dt.getDay()]}`
}
