import { journalGridCard, journalInk, journalLabel, journalPage } from '../../styles/homeJournal'

interface ProfileTabProps {
  email: string | null
  onSignOut: () => void | Promise<void>
}

export function ProfileTab({ email, onSignOut }: ProfileTabProps) {
  return (
    <div className={`${journalPage} space-y-4`}>
      <div className={`${journalGridCard} px-4 py-5`}>
        <p className={journalLabel}>当前账号</p>
        <p className={`mt-2 break-all text-[16px] font-semibold ${journalInk}`}>{email ?? '—'}</p>
      </div>
      <button
        type="button"
        onClick={() => void onSignOut()}
        className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-lg border border-[rgb(60_55_50/0.12)] bg-[rgb(252_250_247/0.85)] py-3.5 text-[16px] font-semibold text-[#3a3632] shadow-sm active:bg-[rgb(240_236_228/0.95)]"
      >
        退出登录
      </button>
    </div>
  )
}
