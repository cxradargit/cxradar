'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ClipboardList, Bell, Settings, LogOut, Users, Wallet, CreditCard, AlertTriangle, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  usuario: {
    nome: string
    email: string
    role: string
    empresa: { nome: string; slug: string } | null
  } | null
}

type SaldoInfo = { saldo: number } | null

function useSaldo() {
  const [saldo, setSaldo] = useState<SaldoInfo>(null)
  useEffect(() => {
    fetch('/api/empresa/creditos')
      .then(r => r.ok ? r.json() : null)
      .then(d => d ? setSaldo({ saldo: d.saldo }) : null)
      .catch(() => null)
  }, [])
  return saldo
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/surveys',   label: 'Pesquisas',  icon: ClipboardList },
  { href: '/respondents', label: 'Respondentes', icon: Users },
  { href: '/alerts',    label: 'Alertas',     icon: Bell },
]

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: '220px',
    flexShrink: 0,
    background: '#fff',
    borderRight: '1px solid #E3E8EF',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  co: {
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 10px 0 16px',
    borderBottom: '1px solid #E3E8EF',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background .1s',
  },
  coName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#1A1F36',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  coSub: {
    fontSize: '11px',
    color: '#697386',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  sectionLabel: {
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '.06em',
    textTransform: 'uppercase' as const,
    color: '#A3ACB9',
    padding: '12px 12px 2px',
    userSelect: 'none' as const,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '34px',
    padding: '0 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#697386',
    cursor: 'pointer',
    transition: 'background .1s, color .1s',
    textDecoration: 'none',
  },
  sep: {
    height: '1px',
    background: '#E3E8EF',
    margin: '6px 0',
  },
}

export default function Sidebar({ usuario }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const saldoInfo = useSaldo()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const alertsActive = pathname === '/alerts' || pathname.startsWith('/alerts/')

  return (
    <aside style={S.aside}>

      {/* Company selector */}
      <div style={S.co}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.coName}>{usuario?.empresa?.nome ?? 'CXRadar'}</div>
          <div style={S.coSub}>CXRadar</div>
        </div>
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#A3ACB9" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 0' }}>

        {/* Top-level items */}
        {NAV_ITEMS.slice(0, 1).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <NavLink key={href} href={href} active={active}>
              <Icon style={{ width: '14px', height: '14px', opacity: active ? 1 : 0.65, flexShrink: 0 }} />
              {label}
            </NavLink>
          )
        })}

        <div style={S.sectionLabel}>Pesquisas</div>

        {NAV_ITEMS.slice(1, 4).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const isAlerts = href === '/alerts'
          return (
            <NavLink key={href} href={href} active={active}>
              <Icon style={{ width: '14px', height: '14px', opacity: active ? 1 : 0.65, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {isAlerts && alertsActive === false && (
                /* badge shown only when not on alerts page — the topbar handles the count */
                null
              )}
            </NavLink>
          )
        })}

        <div style={S.sectionLabel}>Conta</div>

        <NavLink href="/canais" active={pathname.startsWith('/canais')}>
          <Radio style={{ width: '14px', height: '14px', opacity: pathname.startsWith('/canais') ? 1 : 0.65, flexShrink: 0 }} />
          Canais
        </NavLink>

        <NavLink href="/creditos" active={pathname.startsWith('/creditos')}>
          <Wallet style={{ width: '14px', height: '14px', opacity: pathname.startsWith('/creditos') ? 1 : 0.65, flexShrink: 0 }} />
          Créditos
        </NavLink>

        <NavLink href="/assinatura" active={pathname.startsWith('/assinatura')}>
          <CreditCard style={{ width: '14px', height: '14px', opacity: pathname.startsWith('/assinatura') ? 1 : 0.65, flexShrink: 0 }} />
          Assinatura
        </NavLink>

        <NavLink href="/settings" active={pathname === '/settings' || pathname.startsWith('/settings/')}>
          <Settings style={{ width: '14px', height: '14px', opacity: pathname.startsWith('/settings') ? 1 : 0.65, flexShrink: 0 }} />
          Configurações
        </NavLink>

      </nav>

      {/* Widget de saldo */}
      {saldoInfo !== null && (
        <Link href="/creditos" style={{ textDecoration: 'none', display: 'block', margin: '0 8px 8px', borderRadius: '8px', padding: '10px 12px', background: saldoInfo.saldo <= 0 ? '#FEF2F2' : saldoInfo.saldo < 50 ? '#FFFBEB' : '#F8FAFC', border: `1px solid ${saldoInfo.saldo <= 0 ? '#FECACA' : saldoInfo.saldo < 50 ? '#FCD34D' : '#E3E8EF'}`, transition: 'opacity 0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            {saldoInfo.saldo <= 0 || saldoInfo.saldo < 50
              ? <AlertTriangle size={11} color={saldoInfo.saldo <= 0 ? '#EF4444' : '#F59E0B'} />
              : <Wallet size={11} color="#64748B" />
            }
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: saldoInfo.saldo <= 0 ? '#DC2626' : saldoInfo.saldo < 50 ? '#92400E' : '#64748B' }}>
              {saldoInfo.saldo <= 0 ? 'Sem saldo' : saldoInfo.saldo < 50 ? 'Saldo baixo' : 'Saldo'}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-geist-mono)', fontWeight: 700, fontSize: '13px', color: saldoInfo.saldo <= 0 ? '#DC2626' : saldoInfo.saldo < 50 ? '#92400E' : '#1A1F36' }}>
            {fmt(saldoInfo.saldo)}
          </p>
        </Link>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E3E8EF', padding: '4px 0 12px' }}>
        <button
          onClick={handleLogout}
          style={{
            ...S.navItem,
            width: '100%',
            height: '28px',
            background: 'none',
            border: 'none',
            fontSize: '12.5px',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' }}
        >
          <LogOut style={{ width: '13px', height: '13px', opacity: 0.65, flexShrink: 0 }} />
          Sair
        </button>
      </div>

    </aside>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '34px',
        padding: '0 12px',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        color: active ? '#2563EB' : '#697386',
        textDecoration: 'none',
        transition: 'background .1s, color .1s',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F7FAFC'; (e.currentTarget as HTMLElement).style.color = '#3C4257' } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#697386' } }}
    >
      {children}
    </Link>
  )
}
