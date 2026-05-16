import { useCallback, useEffect, useRef, useState } from 'react'
import { getAuth } from '../lib/cloudbase'

export type AuthUser = {
  id: string
  email: string | null
}

type LoginStateLike = {
  user?: {
    uid?: string
    sub?: string
    email?: string
  } | null
}

function userFromLoginState(loginState: LoginStateLike | null): AuthUser | null {
  const u = loginState?.user
  if (!u) return null
  const id = u.uid ?? u.sub
  if (!id) return null
  return { id, email: u.email ?? null }
}

function toError(e: unknown): { message: string } {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return { message: (e as { message: string }).message }
  }
  return { message: '操作失败，请稍后重试' }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(Boolean(getAuth()))
  const pendingVerificationId = useRef<string | null>(null)

  useEffect(() => {
    const auth = getAuth()
    if (!auth) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false

    auth.getLoginState().then((loginState) => {
      if (!cancelled) {
        setUser(userFromLoginState(loginState as LoginStateLike | null))
        setLoading(false)
      }
    })

    void auth.onLoginStateChanged((params: { data?: { eventType?: string }; loginState?: LoginStateLike }) => {
      const eventType = params?.data?.eventType
      if (eventType === 'sign_out' || eventType === 'credentials_error') {
        setUser(null)
        return
      }
      if (eventType === 'sign_in' && params.loginState) {
        setUser(userFromLoginState(params.loginState))
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const requestSignUpCode = useCallback(async (email: string) => {
    const auth = getAuth()
    if (!auth) return { error: new Error('CloudBase 未配置') }
    try {
      const verification = (await auth.getVerification({ email: email.trim() })) as {
        verification_id?: string
      }
      pendingVerificationId.current = verification.verification_id ?? null
      if (!pendingVerificationId.current) {
        return { error: new Error('无法发送验证码，请检查邮箱或控制台配置') }
      }
      return { error: null }
    } catch (e) {
      return { error: toError(e) }
    }
  }, [])

  return {
    user,
    loading,
    requestSignUpCode,
    async signIn(email: string, password: string) {
      const auth = getAuth()
      if (!auth) return { error: new Error('CloudBase 未配置') }
      try {
        const loginState = await auth.signIn({
          username: email.trim(),
          password,
        })
        setUser(userFromLoginState(loginState as LoginStateLike))
        return { error: null }
      } catch (e) {
        return { error: toError(e) }
      }
    },
    async signUp(email: string, password: string, verificationCode: string) {
      const auth = getAuth()
      if (!auth) return { error: new Error('CloudBase 未配置') }
      const verificationId = pendingVerificationId.current
      if (!verificationId) {
        return { error: new Error('请先获取邮箱验证码') }
      }
      try {
        const tokenRes = (await auth.verify({
          verification_id: verificationId,
          verification_code: verificationCode.trim(),
        })) as { verification_token?: string }

        const loginState = await auth.signUp({
          email: email.trim(),
          verification_code: verificationCode.trim(),
          verification_token: tokenRes.verification_token,
          password,
        })
        pendingVerificationId.current = null
        setUser(userFromLoginState(loginState as LoginStateLike))
        return { error: null }
      } catch (e) {
        return { error: toError(e) }
      }
    },
    async signOut() {
      const auth = getAuth()
      if (!auth) return { error: new Error('CloudBase 未配置') }
      try {
        await auth.signOut()
        setUser(null)
        return { error: null }
      } catch (e) {
        return { error: toError(e) }
      }
    },
  }
}
