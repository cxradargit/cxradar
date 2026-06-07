'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Implicit flow: tokens chegam no hash (#access_token=...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        const params = new URLSearchParams(window.location.search)
        router.replace(params.get('next') ?? '/dashboard')
      }
    })

    // PKCE flow: code chega como query param (?code=...)
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        const params = new URLSearchParams(window.location.search)
        router.replace(error ? '/login' : (params.get('next') ?? '/dashboard'))
      })
    }

    return () => subscription.unsubscribe()
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
