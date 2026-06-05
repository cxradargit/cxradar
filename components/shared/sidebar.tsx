'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { LayoutDashboard, ClipboardList, Bell, Settings, LogOut, Database } from 'lucide-react'

const navItems = [
  { href: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/surveys',     label: 'Pesquisas',    icon: ClipboardList },
  { href: '/respondents', label: 'Banco de Dados', icon: Database },
  { href: '/alerts',      label: 'Alertas',      icon: Bell },
  { href: '/settings',    label: 'Configurações', icon: Settings },
]

type Props = {
  usuario: {
    nome: string
    email: string
    role: string
    empresa: { nome: string; slug: string } | null
  } | null
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

  return (
    <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: 'var(--cx-navy)' }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="2" fill="white" />
              <path d="M12 6a6 6 0 0 1 6 6" opacity="0.8" />
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            CXRadar
          </span>
        </Link>
      </div>

      {/* Empresa badge */}
      {usuario?.empresa && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-md" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#60A5FA' }}>
            Empresa
          </p>
          <p className="text-xs truncate mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {usuario.empresa.nome}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
                active ? '' : 'hover:bg-white/5'
              )}
              style={active
                ? { background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }
                : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-2 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {usuario && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{usuario.nome}</p>
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{usuario.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full transition-all duration-150 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
