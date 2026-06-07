'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const next = new URLSearchParams(window.location.search).get('next') ?? '/dashboard'

    async function handleAuth() {
      // PKCE flow: code como query param
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        router.replace(error ? '/login' : next)
        return
      }

      // Implicit flow: getSession() pega a sessão do hash automaticamente
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
        return
      }

      // Aguarda o evento caso o hash ainda esteja sendo processado
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          subscription.unsubscribe()
          router.replace(next)
        }
      })

      // Fallback: se não resolver em 5s, vai para login
      setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/login')
      }, 5000)
    }

    handleAuth()
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #E3E8EF', borderTopColor: '#635BFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748B', fontSize: '14px' }}>Entrando…</p>
      </div>
    </div>
  )
}
