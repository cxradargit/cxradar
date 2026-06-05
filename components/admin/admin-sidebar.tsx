'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Building2, ArrowLeft, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin',          label: 'Visão geral', icon: LayoutDashboard },
  { href: '/admin/empresas', label: 'Empresas',    icon: Building2 },
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
    <aside className="w-56 flex flex-col shrink-0" style={{ backgroundColor: 'var(--cx-navy)' }}>
      {/* Logo + badge */}
      <div className="h-14 px-4 flex items-center gap-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>CXRadar</p>
          <p style={{ color: '#06B6D4', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Super Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150', !active && 'hover:bg-white/5')}
              style={active
                ? { background: 'rgba(37,99,235,0.15)', color: '#60A5FA' }
                : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="px-2 pb-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full transition-all duration-150 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Voltar ao app
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium w-full transition-all duration-150 hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
        <p className="px-3 mt-1 text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {email}
        </p>
      </div>
    </aside>
  )
}
