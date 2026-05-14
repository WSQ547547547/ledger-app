import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      setLoading(false)
      return
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!cancelled) {
        setSession(s)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return {
    session,
    user: session?.user ?? null,
    loading,
    async signIn(email: string, password: string) {
      if (!supabase) return { error: new Error('Supabase 未配置') }
      return supabase.auth.signInWithPassword({ email, password })
    },
    async signUp(email: string, password: string) {
      if (!supabase) return { error: new Error('Supabase 未配置') }
      return supabase.auth.signUp({ email, password })
    },
    async signOut() {
      if (!supabase) return { error: new Error('Supabase 未配置') }
      return supabase.auth.signOut()
    },
  }
}
