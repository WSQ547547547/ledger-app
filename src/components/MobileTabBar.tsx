export type MainTab = 'home' | 'stats' | 'categories' | 'profile'

interface MobileTabBarProps {
  active: MainTab
  onChange: (tab: MainTab) => void
  onAdd: () => void
}

const TABS: { id: MainTab; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'stats', label: '统计' },
  { id: 'categories', label: '分类' },
  { id: 'profile', label: '我的' },
]

function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-lg px-1 py-2 text-[13px] font-semibold tracking-tight transition-colors touch-manipulation active:opacity-80 ${
        selected ? 'text-[#1f1d1b]' : 'text-[rgb(105_98_90/0.72)]'
      }`}
      aria-current={selected ? 'page' : undefined}
    >
      {label}
    </button>
  )
}

export function MobileTabBar({ active, onChange, onAdd }: MobileTabBarProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-lg"
      aria-label="主导航"
    >
      <div className="border-t border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.94)] shadow-[0_-6px_28px_rgb(40_35_30/0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgb(252_250_247/0.9)]">
        <div
          className="mx-auto grid max-w-lg grid-cols-5 items-end gap-0 px-1 pt-1"
          style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
        >
          <TabButton label={TABS[0].label} selected={active === TABS[0].id} onPress={() => onChange(TABS[0].id)} />
          <TabButton label={TABS[1].label} selected={active === TABS[1].id} onPress={() => onChange(TABS[1].id)} />
          <div className="flex flex-col items-center justify-end">
            <button
              type="button"
              onClick={onAdd}
              className="relative z-10 flex h-[60px] w-[60px] shrink-0 -translate-y-2 items-center justify-center rounded-full bg-[#b8966a] text-[32px] font-light leading-none text-white shadow-[0_10px_28px_-6px_rgb(80_55_30/0.35)] touch-manipulation active:scale-95 active:bg-[#a88960]"
              aria-label="记一笔"
            >
              +
            </button>
          </div>
          <TabButton
            label={TABS[2].label}
            selected={active === TABS[2].id}
            onPress={() => onChange(TABS[2].id)}
          />
          <TabButton label={TABS[3].label} selected={active === TABS[3].id} onPress={() => onChange(TABS[3].id)} />
        </div>
      </div>
    </nav>
  )
}

/** 主内容区底部留白：导航条 + 中间凸起按钮 + 安全区 */
export const MAIN_SCROLL_BOTTOM_PAD = 'pb-[calc(7.5rem+env(safe-area-inset-bottom))]'
