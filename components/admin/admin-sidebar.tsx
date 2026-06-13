'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Building2, ArrowLeft, LogOut, Shield, TrendingUp, ScrollText, CreditCard, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const SECTIONS = [
  {
    label: 'Operações',
    items: [
      { href: '/admin',          label: 'Visão geral', icon: LayoutDashboard },
      { href: '/admin/empresas', label: 'Empresas',    icon: Building2 },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { href: '/admin/financeiro', label: 'Assinaturas',  icon: CreditCard },
      { href: '/admin/financeiro/cupons', label: 'Cupons', icon: Tag },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { href: '/admin/metricas', label: 'Métricas', icon: TrendingUp },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
    ],
  },
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
      width: '220px',
      flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #E3E8EF',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 10px 0 16px',
        borderBottom: '1px solid #E3E8EF',
        minHeight: '52px',
        flexShrink: 0,
      }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '4px',
          background: '#1A1F36', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <Shield style={{ width: '11px', height: '11px', color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1A1F36', lineHeight: 1.3 }}>CXRadar</div>
          <div style={{ fontSize: '10px', color: '#697386', lineHeight: 1.3 }}>Painel admin</div>
        </div>
      </div>

      {/* Nav with sections */}
      <nav style={{ flex: 1, padding: '6px 0' }}>
        {SECTIONS.map(section => (
          <div key={section.label}>
            <p style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '.07em',
              textTransform: 'uppercase', color: '#A3ACB9',
              padding: '10px 16px 3px', userSelect: 'none',
            }}>
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin'
                ? pathname === '/admin'
                : pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    height: '34px', padding: '0 16px',
                    fontSize: '13px', fontWeight: active ? 600 : 500,
                    color: active ? '#2563EB' : '#697386',
                    background: active ? '#EFF6FF' : 'transparent',
                    textDecoration: 'none', transition: 'background .1s, color .1s',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' } }}
                >
                  <Icon style={{ width: '14px', height: '14px', opacity: active ? 1 : 0.65, flexShrink: 0 }} />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E3E8EF', padding: '4px 0 8px' }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            height: '32px', padding: '0 16px',
            fontSize: '12.5px', fontWeight: 500, color: '#697386',
            textDecoration: 'none', transition: 'background .1s, color .1s',
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
            display: 'flex', alignItems: 'center', gap: '8px',
            height: '28px', padding: '0 16px', width: '100%',
            fontSize: '12.5px', fontWeight: 500, color: '#697386',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'background .1s, color .1s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
        >
          <LogOut style={{ width: '13px', height: '13px', opacity: 0.65, flexShrink: 0 }} />
          Sair
        </button>
        <p style={{ padding: '2px 16px 0', fontSize: '10.5px', color: '#A3ACB9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </p>
      </div>

    </aside>
  )
}
