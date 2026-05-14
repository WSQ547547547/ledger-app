/** 手账风：方格纸卡片 + 衬线 + 暖色底（样式类名字符串，全应用共用） */

/** 整壳：暖底 + 衬线（挂在 App 根或独立全屏页） */
export const journalChrome = 'home-art journal-serif'

/** 主滚动区内页：边距与最小高度（暖底由父级 journalChrome 提供） */
export const journalPage = 'relative min-h-full w-full px-3 pb-8 pt-3 sm:px-4'

/** 方格纸卡片（具体样式见 index.css `.journal-grid-card`） */
export const journalGridCard = 'journal-grid-card'

/** 表单/字段块：方格纸 + 内边距 */
export const journalFieldCard = `${journalGridCard} px-4 py-3`

/** 日期条（整行） */
export const journalDateStrip = 'journal-grid-card flex items-center justify-between gap-3 px-3 py-3.5'

export const journalLabel =
  'text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgb(95_90_84/0.72)]'

export const journalInk = 'text-[#1f1d1b]'

export const journalTerracotta = 'text-[#a85d52]'

export const journalMuted = 'text-[rgb(105_98_90/0.78)]'

export const journalNavBtn =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-md border border-[rgb(60_55_50/0.08)] bg-[rgb(245_242_237/0.9)] text-[15px] font-semibold text-[#3a3632] shadow-sm active:opacity-75'

export const ledgerCard =
  'rounded-2xl border border-zinc-200/60 bg-white/80 shadow-sm shadow-zinc-900/5 backdrop-blur-sm'
