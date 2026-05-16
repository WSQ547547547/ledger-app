import { useCallback, useMemo, useState } from 'react'
import { AddSheet } from './components/AddSheet'
import { CategoryManageSheet, type CategorySheetTarget } from './components/CategoryManageSheet'
import { LoginPanel } from './components/LoginPanel'
import { MAIN_SCROLL_BOTTOM_PAD, MobileTabBar, type MainTab } from './components/MobileTabBar'
import { CategoriesTab } from './components/tabs/CategoriesTab'
import { HomeTab } from './components/tabs/HomeTab'
import { ProfileTab } from './components/tabs/ProfileTab'
import { StatsTab } from './components/tabs/StatsTab'
import { useCategoryOptions } from './hooks/useCategoryOptions'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { cloudbaseConfigured } from './lib/cloudbase'
import type { TxKind } from './types'
import { journalChrome } from './styles/homeJournal'
import { currentCalendarYearKey, currentMonthKey, monthKeyFromDate, monthLabel, shiftMonth, yearKeyFromDate } from './utils/format'

const SCREEN_TITLE: Record<MainTab, string> = {
  home: '极简记账',
  stats: '统计',
  categories: '分类',
  profile: '我的',
}

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut, requestSignUpCode } = useAuth()
  const uid = user?.id ?? null
  const { items, add, remove, loading: dataLoading, refresh } = useTransactions(uid)
  const categoryOpts = useCategoryOptions(uid)

  const reloadCategoryChips = useCallback(() => {
    void categoryOpts.reload()
  }, [categoryOpts.reload])

  const getChipCategories = useCallback(
    (k: TxKind) => categoryOpts.optionsFor(k),
    [categoryOpts.optionsFor],
  )

  const handleCreateCategory = useCallback(
    (name: string, k: TxKind, icon?: string) => categoryOpts.createCategory(name, k, icon),
    [categoryOpts.createCategory],
  )

  const [categorySheetTarget, setCategorySheetTarget] = useState<CategorySheetTarget | null>(null)

  const handleUpdateCategory = useCallback(
    async (id: string, name: string, icon: string) => {
      const r = await categoryOpts.updateCategory(id, name, icon)
      if (r.ok) await refresh()
      return r
    },
    [categoryOpts.updateCategory, refresh],
  )

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      const r = await categoryOpts.deleteCategory(id)
      if (r.ok) await refresh()
      return r
    },
    [categoryOpts.deleteCategory, refresh],
  )
  const [sheetOpen, setSheetOpen] = useState(false)
  const [month, setMonth] = useState(() => currentMonthKey())
  const [tab, setTab] = useState<MainTab>('home')

  const monthTotals = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of items) {
      if (monthKeyFromDate(t.date) !== month) continue
      if (t.kind === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }, [items, month])

  const monthItems = useMemo(
    () => items.filter((t) => monthKeyFromDate(t.date) === month),
    [items, month],
  )

  const yearSummary = useMemo(() => {
    const y = currentCalendarYearKey()
    let income = 0
    let expense = 0
    for (const t of items) {
      if (yearKeyFromDate(t.date) !== y) continue
      if (t.kind === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense, balance: income - expense }
  }, [items])

  if (!cloudbaseConfigured) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${journalChrome}`}>
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
          <div className="journal-grid-card max-w-sm p-6">
            <p className="text-[17px] font-semibold text-[#1f1d1b]">未配置 CloudBase</p>
            <p className="mt-2 text-[14px] leading-relaxed text-[rgb(105_98_90/0.85)]">
              请在项目根目录创建 <code className="rounded bg-[rgb(245_242_237/0.9)] px-1 ring-1 ring-[rgb(60_55_50/0.1)]">.env</code>，写入{' '}
              <code className="rounded bg-[rgb(245_242_237/0.9)] px-1 ring-1 ring-[rgb(60_55_50/0.1)]">VITE_CLOUDBASE_ENV_ID</code> 与{' '}
              <code className="rounded bg-[rgb(245_242_237/0.9)] px-1 ring-1 ring-[rgb(60_55_50/0.1)]">VITE_CLOUDBASE_CLIENT_ID</code>
              （在腾讯云开发控制台 → 环境 → 安全配置 中获取），保存后重新运行{' '}
              <code className="rounded bg-[rgb(245_242_237/0.9)] px-1 ring-1 ring-[rgb(60_55_50/0.1)]">npm.cmd run dev</code>。
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${journalChrome}`}>
        <div className="flex min-h-dvh flex-1 items-center justify-center text-[15px] font-medium text-[rgb(105_98_90/0.78)]">
          加载中…
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${journalChrome}`}>
        <LoginPanel
          onSignIn={(email, password) => signIn(email, password)}
          onSignUp={(email, password, code) => signUp(email, password, code)}
          onRequestSignUpCode={(email) => requestSignUpCode(email)}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-1 flex-col overflow-hidden ${journalChrome}`}
    >
      <header className="shrink-0 border-b border-[rgb(60_55_50/0.08)] bg-[rgb(252_250_247/0.92)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <div className="mx-auto flex h-[52px] max-w-lg items-center justify-center px-4">
          <h1 className="text-[17px] font-semibold tracking-tight text-[#1f1d1b]">{SCREEN_TITLE[tab]}</h1>
        </div>
      </header>

      <main
        id="app-main-scroll"
        className={`app-main-scroll mx-auto min-h-0 w-full max-w-lg flex-1 overflow-y-scroll ${MAIN_SCROLL_BOTTOM_PAD}`}
      >
        {tab === 'home' ? (
          <HomeTab
            dataLoading={dataLoading}
            itemsLength={items.length}
            yearSummary={yearSummary}
            monthLabel={monthLabel(month)}
            monthTotals={monthTotals}
            monthItems={monthItems}
            onMonthPrev={() => setMonth((m) => shiftMonth(m, -1))}
            onMonthNext={() => setMonth((m) => shiftMonth(m, 1))}
            onDelete={remove}
          />
        ) : null}
        {tab === 'stats' ? <StatsTab items={items} onDelete={remove} /> : null}
        {tab === 'categories' ? (
          <CategoriesTab
            expenseChips={categoryOpts.optionsFor('expense')}
            incomeChips={categoryOpts.optionsFor('income')}
            onManageCategory={(t) => setCategorySheetTarget(t)}
          />
        ) : null}
        {tab === 'profile' ? <ProfileTab email={user?.email ?? null} onSignOut={signOut} /> : null}
      </main>

      <MobileTabBar
        active={tab}
        onChange={setTab}
        onAdd={() => setSheetOpen(true)}
      />

      <AddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={async (payload) => {
          await add(payload)
        }}
        getChipCategories={getChipCategories}
        reloadCategories={reloadCategoryChips}
        createCategory={handleCreateCategory}
      />

      <CategoryManageSheet
        open={categorySheetTarget != null}
        target={categorySheetTarget}
        onClose={() => setCategorySheetTarget(null)}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  )
}
