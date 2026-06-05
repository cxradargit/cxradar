'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ClipboardList, Bell, Settings, LogOut, Users } from 'lucide-react'

type Props = {
  usuario: {
    nome: string
    email: string
    role: string
    empresa: { nome: string; slug: string } | null
  } | null
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/surveys',   label: 'Pesquisas',  icon: ClipboardList },
  { href: '/respondents', label: 'Respondentes', icon: Users },
  { href: '/alerts',    label: 'Alertas',     icon: Bell },
]

const S: Record<string, React.CSSProperties> = {
  aside: {
    width: '200px',
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
    padding: '0 10px 0 12px',
    borderBottom: '1px solid #E3E8EF',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background .1s',
  },
  coBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '4px',
    background: '#635BFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    flexShrink: 0,
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
    height: '30px',
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
  const router = useRouter()

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
        <div style={S.coBadge}>CX</div>
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

        <div style={S.sectionLabel}>Configurações</div>

        <NavLink href="/settings" active={pathname === '/settings' || pathname.startsWith('/settings/')}>
          <Settings style={{ width: '14px', height: '14px', opacity: pathname.startsWith('/settings') ? 1 : 0.65, flexShrink: 0 }} />
          Configurações
        </NavLink>

      </nav>

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
      {children}
    </Link>
  )
}
