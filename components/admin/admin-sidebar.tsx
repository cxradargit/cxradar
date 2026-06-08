'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, ArrowLeft, LogOut, Shield, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin',            label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/empresas',   label: 'Empresas',    icon: Building2 },
  { href: '/admin/analytics',  label: 'Análises',    icon: BarChart3 },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '200px',
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #E3E8EF',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>

      {/* Company / admin selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 10px 0 12px',
        borderBottom: '1px solid #E3E8EF',
        minHeight: '52px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '4px',
          background: '#1A1F36',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Shield style={{ width: '11px', height: '11px', color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A1F36', lineHeight: 1.3 }}>CXRadar</div>
          <div style={{ marginTop: '2px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: '#F0EFFF',
              color: '#635BFF',
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: '3px',
              border: '1px solid rgba(99,91,255,.2)',
            }}>
              <Shield style={{ width: '8px', height: '8px' }} />
              Plataforma Admin
            </span>
          </div>
        </div>
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#A3ACB9" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 0' }}>

        <div style={{
          fontSize: '10.5px',
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: '#A3ACB9',
          padding: '12px 12px 2px',
        }}>
          Plataforma
        </div>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '30px',
                padding: '0 12px',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                color: active ? '#635BFF' : '#697386',
                textDecoration: 'none',
                transition: 'background .1s, color .1s',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' } }}
            >
              <Icon style={{ width: '14px', height: '14px', opacity: active ? 1 : 0.65, flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}

      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E3E8EF', padding: '4px 0 12px' }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '28px',
            padding: '0 12px',
            fontSize: '12.5px',
            fontWeight: 500,
            color: '#697386',
            textDecoration: 'none',
            transition: 'background .1s, color .1s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
        >
          <ArrowLeft style={{ width: '13px', height: '13px', opacity: 0.65, flexShrink: 0 }} />
          Voltar ao app
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '28px',
            padding: '0 12px',
            width: '100%',
            fontSize: '12.5px',
            fontWeight: 500,
            color: '#697386',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'background .1s, color .1s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
        >
          <LogOut style={{ width: '13px', height: '13px', opacity: 0.65, flexShrink: 0 }} />
          Sair
        </button>
        <p style={{ padding: '4px 12px 0', fontSize: '10.5px', color: '#A3ACB9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </p>
      </div>

    </aside>
  )
}
