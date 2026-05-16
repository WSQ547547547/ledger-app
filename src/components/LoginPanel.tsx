import { useState, type FormEvent } from 'react'
import { journalGridCard, journalInk, journalLabel, journalMuted, journalTerracotta } from '../styles/homeJournal'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>
  onSignUp: (email: string, password: string, verificationCode: string) => Promise<{ error: { message: string } | null }>
  onRequestSignUpCode: (email: string) => Promise<{ error: { message: string } | null }>
}

export function LoginPanel({ onSignIn, onSignUp, onRequestSignUpCode }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [codeBusy, setCodeBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleRequestCode() {
    setMessage(null)
    const em = email.trim()
    if (!em) {
      setMessage('请先填写邮箱')
      return
    }
    setCodeBusy(true)
    const { error } = await onRequestSignUpCode(em)
    setCodeBusy(false)
    if (error) setMessage(error.message)
    else setMessage('验证码已发送，请查收邮件（含垃圾箱）')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const em = email.trim()
    if (!em || password.length < 6) {
      setMessage('请输入邮箱，且密码至少 6 位')
      return
    }
    if (mode === 'signup' && verificationCode.trim().length < 4) {
      setMessage('请输入邮箱验证码')
      return
    }
    setBusy(true)
    const { error } =
      mode === 'signin'
        ? await onSignIn(em, password)
        : await onSignUp(em, password, verificationCode.trim())
    setBusy(false)
    if (error) setMessage(error.message)
    else if (mode === 'signup') setMessage('注册成功，已自动登录')
  }

  return (
    <div className="journal-serif relative flex min-h-0 w-full flex-1 flex-col items-center justify-center overflow-y-auto bg-[#ebe6dc] px-4 py-10 antialiased sm:px-6 sm:py-14 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div
        className={`relative w-full max-w-[400px] overflow-hidden p-7 sm:p-8 ${journalGridCard}`}
        aria-labelledby="login-title"
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(60_55_50/0.12)] to-transparent"
          aria-hidden
        />

        <header className="text-center">
          <h1 id="login-title" className={`text-[22px] font-semibold tracking-[-0.02em] ${journalInk}`}>
            极简记账
          </h1>
          <p className={`mx-auto mt-2 max-w-[28ch] text-[14px] leading-relaxed ${journalMuted}`}>
            使用邮箱登录，数据同步至腾讯云开发
          </p>
        </header>

        <div
          className="mt-8 flex rounded-full border border-[rgb(60_55_50/0.1)] bg-[rgb(245_242_237/0.85)] p-1"
          role="tablist"
          aria-label="登录或注册"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            onClick={() => {
              setMode('signin')
              setMessage(null)
            }}
            className={
              mode === 'signin'
                ? 'flex-1 rounded-full bg-[rgb(252_250_247)] py-2.5 text-[15px] font-semibold tracking-tight text-[#1f1d1b] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)] transition-all duration-200 ease-out'
                : 'flex-1 rounded-full py-2.5 text-[15px] font-semibold tracking-tight text-[rgb(105_98_90/0.78)] transition-all duration-200 ease-out active:scale-[0.99]'
            }
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => {
              setMode('signup')
              setMessage(null)
            }}
            className={
              mode === 'signup'
                ? 'flex-1 rounded-full bg-[rgb(252_250_247)] py-2.5 text-[15px] font-semibold tracking-tight text-[#1f1d1b] shadow-sm ring-1 ring-[rgb(60_55_50/0.08)] transition-all duration-200 ease-out'
                : 'flex-1 rounded-full py-2.5 text-[15px] font-semibold tracking-tight text-[rgb(105_98_90/0.78)] transition-all duration-200 ease-out active:scale-[0.99]'
            }
          >
            注册
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className={`mb-2 block ${journalLabel}`} htmlFor="login-email">
              邮箱
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-12 w-full rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.95)] px-4 text-[16px] leading-none outline-none ring-0 transition-[box-shadow,background-color,border-color] duration-200 ease-out placeholder:text-[rgb(115_108_100/0.45)] focus:border-[#b8966a]/55 focus:bg-[rgb(255_254_252)] focus:shadow-[0_0_0_3px_rgb(184_150_106/0.22)] ${journalInk}`}
              placeholder="you@example.com"
            />
          </div>
          {mode === 'signup' ? (
            <div>
              <label className={`mb-2 block ${journalLabel}`} htmlFor="login-code">
                邮箱验证码
              </label>
              <div className="flex gap-2">
                <input
                  id="login-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className={`h-12 min-w-0 flex-1 rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.95)] px-4 text-[16px] leading-none outline-none ring-0 transition-[box-shadow,background-color,border-color] duration-200 ease-out placeholder:text-[rgb(115_108_100/0.45)] focus:border-[#b8966a]/55 focus:bg-[rgb(255_254_252)] focus:shadow-[0_0_0_3px_rgb(184_150_106/0.22)] ${journalInk}`}
                  placeholder="6 位验证码"
                />
                <button
                  type="button"
                  disabled={codeBusy}
                  onClick={() => void handleRequestCode()}
                  className="h-12 shrink-0 rounded-lg border border-[rgb(60_55_50/0.12)] bg-[rgb(252_250_247/0.95)] px-3 text-[14px] font-semibold text-[#3a3632] active:bg-[rgb(240_236_228/0.95)] disabled:opacity-50"
                >
                  {codeBusy ? '发送中…' : '获取验证码'}
                </button>
              </div>
            </div>
          ) : null}
          <div>
            <label className={`mb-2 block ${journalLabel}`} htmlFor="login-password">
              密码
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`h-12 w-full rounded-lg border border-[rgb(60_55_50/0.1)] bg-[rgb(252_250_247/0.95)] px-4 text-[16px] leading-none outline-none ring-0 transition-[box-shadow,background-color,border-color] duration-200 ease-out placeholder:text-[rgb(115_108_100/0.45)] focus:border-[#b8966a]/55 focus:bg-[rgb(255_254_252)] focus:shadow-[0_0_0_3px_rgb(184_150_106/0.22)] ${journalInk}`}
              placeholder="至少 6 位"
            />
          </div>

          {message ? (
            <p
              role="alert"
              className={`rounded-lg px-3 py-2.5 text-[13px] font-medium leading-snug ring-1 ${
                message.includes('验证') || message.includes('查收') || message.includes('成功')
                  ? `${journalInk} bg-[rgb(245_242_237/0.9)] ring-[rgb(60_55_50/0.08)]`
                  : `${journalTerracotta} bg-[rgb(252_238_235/0.65)] ring-[rgb(168_93_82/0.2)]`
              }`}
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-[#b8966a] text-[16px] font-semibold text-white shadow-[0_6px_22px_-4px_rgb(80_55_30/0.35)] transition-[transform,box-shadow,filter,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none"
          >
            <span className="relative z-10">{busy ? '请稍候…' : mode === 'signin' ? '登录' : '注册'}</span>
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden
            >
              <span className="absolute inset-0 bg-gradient-to-t from-white/12 to-transparent" />
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
