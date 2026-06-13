'use client'

import { HelpCircle, Bell, Settings, Shield } from 'lucide-react'
import Link from 'next/link'

type Props = {
  nome?: string | null
  isAdmin?: boolean
}

export default function Topbar({ nome, isAdmin = false }: Props) {
  const initials = nome
    ? nome.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '0 24px',
      height: '52px',
      borderBottom: '1px solid #E3E8EF',
      flexShrink: 0,
      background: '#fff',
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}>

        {isAdmin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            height: '26px',
            padding: '0 8px',
            borderRadius: '4px',
            border: '1px solid #E3E8EF',
            background: '#F7FAFC',
            fontSize: '12px',
            fontWeight: 500,
            color: '#697386',
            whiteSpace: 'nowrap',
            marginRight: '8px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', flexShrink: 0, display: 'inline-block' }} />
            Modo admin
          </div>
        )}

        <IconBtn href="/alerts" title="Alertas">
          <Bell style={{ width: '15px', height: '15px' }} />
        </IconBtn>

        <IconBtn href="/settings" title="Configurações">
          {isAdmin
            ? <Shield style={{ width: '15px', height: '15px' }} />
            : <Settings style={{ width: '15px', height: '15px' }} />
          }
        </IconBtn>

        <IconBtn href="https://docs.cxradar.io" title="Ajuda">
          <HelpCircle style={{ width: '15px', height: '15px' }} />
        </IconBtn>

      </div>

      {/* User avatar */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: isAdmin ? '#1A1F36' : '#2563EB',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginLeft: '4px',
        cursor: 'pointer',
        userSelect: 'none',
      }}>
        {initials}
      </div>

    </div>
  )
}

function IconBtn({ children, href, title }: { children: React.ReactNode; href: string; title: string }) {
  return (
    <Link
      href={href}
      title={title}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#697386',
        textDecoration: 'none',
        transition: 'background .1s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </Link>
  )
}
