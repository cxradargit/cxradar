'use client'

import Link from 'next/link'
import React from 'react'

/* ── Icon types ─────────────────────────────────────────────── */
type SvgProps = { size?: number; color?: string }

/* ── Ícones SVG minimalistas ────────────────────────────────── */
function IcClipboard({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}
function IcMessages({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}
function IcTicket({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
    </svg>
  )
}
function IcRefresh({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )
}
function IcBarChart({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}
function IcAlertTriangle({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
function IcTrendingUp({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
function IcBell({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function IcEdit({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
function IcLayout({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}
function IcTarget({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IcFile({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}
function IcBuilding({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  )
}
function IcWifi({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" fill={color} stroke="none" />
    </svg>
  )
}
function IcCode({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
function IcPlus({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
function IcGrid({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function IcSettings({ size = 20, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
function IcX({ size = 12, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
function IcCheck({ size = 12, color = 'currentColor' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

/* ── Dados ──────────────────────────────────────────────────── */
type IconFn = (props: SvgProps) => React.JSX.Element

const problemaItems: { icon: IconFn; label: string }[] = [
  { icon: IcClipboard, label: 'Pesquisas esquecidas na caixa de entrada' },
  { icon: IcMessages,  label: 'Comentários dispersos em múltiplos canais' },
  { icon: IcTicket,    label: 'Tickets de atendimento sem análise' },
  { icon: IcRefresh,   label: 'Reclamações recorrentes sem padrão identificado' },
  { icon: IcBarChart,  label: 'Dados que ninguém teve tempo de analisar' },
]


const recursosItems: { icon: IconFn; title: string; desc: string }[] = [
  { icon: IcEdit,     title: 'Pesquisas Inteligentes', desc: 'Crie pesquisas CSAT, NPS e CES em minutos. Formulários conversacionais que geram mais respostas.' },
  { icon: IcLayout,   title: 'Dashboard Executivo',    desc: 'Visualize indicadores estratégicos em tempo real. KPIs, tendências e alertas em um único painel.' },
  { icon: IcBell,     title: 'Alertas Automáticos',    desc: 'Receba notificações sempre que um cliente demonstrar insatisfação. Aja antes que o churn aconteça.' },
  { icon: IcTarget,   title: 'Radar de Problemas',     desc: 'Descubra padrões antes que se tornem crises. Identifique os problemas mais recorrentes da sua operação.' },
  { icon: IcFile,     title: 'Relatórios',             desc: 'Exporte e compartilhe resultados em segundos. Relatórios executivos prontos para apresentação.' },
]

const paraQuemItems: { icon: IconFn; label: string; desc: string }[] = [
  { icon: IcWifi,     label: 'Provedores de Internet', desc: 'Reduza cancelamentos e aumente retenção com alertas antes do churn.' },
  { icon: IcCode,     label: 'SaaS',                   desc: 'Monitore a saúde da sua base. Identifique contas em risco antes da renovação.' },
  { icon: IcPlus,     label: 'Clínicas',               desc: 'Acompanhe a experiência dos pacientes e fidelize quem veio.' },
  { icon: IcGrid,     label: 'Franquias',              desc: 'Padronize a qualidade da experiência em todas as unidades.' },
  { icon: IcSettings, label: 'Empresas de Serviços',   desc: 'Transforme feedback em melhoria contínua da operação.' },
]

/* ── Hero typewriter ────────────────────────────────────────── */
const HERO_PHRASES = [
  { line1: 'Seu cliente vai cancelar.',                line2: 'Você ainda não sabe.' },
  { line1: 'Você vendeu para o cliente errado.',       line2: 'A pesquisa teria te avisado.' },
  { line1: 'O que seu cliente quer comprar?',       line2: 'Você nunca perguntou.' },
  { line1: 'Seu NPS caiu 12 pontos esse mês.',         line2: 'E ninguém percebeu ainda.' },
  { line1: 'Clientes satisfeitos compram mais.',       line2: 'Quais são os seus?' },
]

type TwPhase = 'typing1' | 'pause1' | 'typing2' | 'hold' | 'deleting2' | 'pause3' | 'deleting1'

function HeroTypewriter() {
  const [idx,   setIdx]   = React.useState(0)
  const [l1,    setL1]    = React.useState(HERO_PHRASES[0].line1)
  const [l2,    setL2]    = React.useState(HERO_PHRASES[0].line2)
  const [phase, setPhase] = React.useState<TwPhase>('typing1')
  const [char,  setChar]  = React.useState(0)

  React.useEffect(() => {
    const p = HERO_PHRASES[idx]
    let t: ReturnType<typeof setTimeout>
    switch (phase) {
      case 'typing1':
        if (char < p.line1.length) {
          t = setTimeout(() => { setL1(p.line1.slice(0, char + 1)); setChar(c => c + 1) }, 45)
        } else { setPhase('pause1'); setChar(0) }
        break
      case 'pause1':
        t = setTimeout(() => setPhase('typing2'), 300)
        break
      case 'typing2':
        if (char < p.line2.length) {
          t = setTimeout(() => { setL2(p.line2.slice(0, char + 1)); setChar(c => c + 1) }, 45)
        } else { setPhase('hold'); setChar(0) }
        break
      case 'hold':
        t = setTimeout(() => setPhase('deleting2'), 2400)
        break
      case 'deleting2':
        if (l2.length > 0) { t = setTimeout(() => setL2(s => s.slice(0, -1)), 28) }
        else { setPhase('pause3') }
        break
      case 'pause3':
        t = setTimeout(() => setPhase('deleting1'), 100)
        break
      case 'deleting1':
        if (l1.length > 0) { t = setTimeout(() => setL1(s => s.slice(0, -1)), 28) }
        else { setIdx(i => (i + 1) % HERO_PHRASES.length); setPhase('typing1'); setChar(0) }
        break
    }
    return () => clearTimeout(t)
  }, [phase, char, l1, l2, idx])

  const cur1 = (['typing1', 'pause1', 'pause3', 'deleting1'] as TwPhase[]).includes(phase)
  const cur2 = (['typing2', 'hold', 'deleting2'] as TwPhase[]).includes(phase)

  return (
    <h1
      className="cx-hero-h1"
      aria-label="Plataforma de Customer Experience — identifique clientes em risco de cancelamento"
      style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 auto 24px' }}
    >
      <span className="cx-hero-line" style={{ display: 'block' }}>
        {l1}{cur1 && <span className="cx-cursor">|</span>}
      </span>
      <span className="cx-hero-line" style={{ display: 'block', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        {l2}{cur2 && <span className="cx-cursor" style={{ WebkitTextFillColor: '#06B6D4' }}>|</span>}
      </span>
    </h1>
  )
}

/* ── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', overflowX: 'hidden' }}>

      {/* ─── NAVBAR ──────────────────────────────────────────────────── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', background: 'rgba(15,23,42,0.85)' }}>
        <nav style={{ maxWidth: '1140px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogoIcon />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>CXRadar</span>
              <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.04em', lineHeight: 1 }}>Preditividade para sua estratégia</span>
            </div>
          </div>
          <div className="cx-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            {[['#como-funciona', 'Plataforma'], ['#recursos', 'Recursos'], ['#para-quem', 'Para quem'], ['#planos', 'Planos']].map(([href, label]) => (
              <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'white')}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', padding: '7px 14px', borderRadius: '6px' }}>
              Entrar
            </Link>
            <Link href="/cadastro" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', color: 'white', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', padding: '8px 18px', borderRadius: '7px', letterSpacing: '-0.01em', boxShadow: '0 2px 12px rgba(37,99,235,0.35)' }}>
              Criar Conta
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="cx-hero-section" style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '140px 2rem 0' }}>
        <div className="cx-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', bottom: '-120px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
          {[0, 0.8, 1.6, 2.4].map((delay, i) => (
            <div key={i} style={{ position: 'absolute', width: `${240 + i * 100}px`, height: `${240 + i * 100}px`, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.2)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: `cx-radar-ring ${3 + i * 0.4}s ease-out ${delay}s infinite` }} />
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '14px', height: '14px', borderRadius: '50%', background: '#2563EB', boxShadow: '0 0 24px rgba(37,99,235,0.9), 0 0 48px rgba(37,99,235,0.4)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '1000px' }}>
          <HeroTypewriter />

          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.125rem', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 48px' }}>
            Uma pesquisa enviada na hora certa pode salvar um contrato de R$ 5.000 por mês. O CXRadar mostra qual cliente precisa dessa pesquisa agora.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', color: 'white', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', padding: '14px 30px', borderRadius: '8px', letterSpacing: '-0.01em', boxShadow: '0 4px 24px rgba(37,99,235,0.4)' }}>
              Crie sua Conta →
            </Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="cx-stats-strip" style={{ display: 'flex', maxWidth: '1140px', margin: '0 auto' }}>
            {[
              { value: 'NPS', label: 'Net Promoter Score' },
              { value: 'CSAT', label: 'Customer Satisfaction' },
              { value: 'CES', label: 'Customer Effort Score' },
              { value: '10+', label: 'tipos de pergunta' },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, padding: '22px 0', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.03em', fontFamily: 'var(--font-geist-mono)' }}>{item.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '3px' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── O PROBLEMA ─────────────────────────────────────────────── */}
      <section style={{ background: '#0B1221', padding: '100px 2rem' }}>
        <div className="cx-grid-2col" style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <Label color="#EF4444">O Problema</Label>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px 0 24px' }}>
              A maioria das empresas descobre os problemas{' '}
              <span style={{ color: '#EF4444' }}>tarde demais</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7 }}>
              Não é falta de dados. É falta do dado certo, na hora certa, para quem precisa agir.
            </p>

            <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px' }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                O resultado
              </p>
              {[
                'Cliente cancela contrato de R$ 8.400/ano sem aviso',
                'Time de vendas fecha uma conta que cancela em 45 dias',
                'Produto lançado sem demanda validada — retrabalhado 3 meses depois',
                'Reunião de diretoria sem saber qual % da base está em risco',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(239,68,68,0.1)' : 'none' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcX size={8} color="#EF4444" />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', marginBottom: '20px' }}>
              Os sinais estavam escondidos em:
            </p>
            {problemaItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={17} color="rgba(255,255,255,0.45)" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.4 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3 MOMENTOS ─────────────────────────────────────────────── */}
      <section style={{ background: '#060D1A', padding: '100px 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ color: '#06B6D4', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '16px', height: '2px', background: '#06B6D4', borderRadius: '100px', display: 'inline-block' }} />
              Quando usar
            </p>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px auto 16px', maxWidth: '640px' }}>
              3 momentos onde uma pesquisa muda tudo
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              Esses problemas acontecem toda semana em empresas que não coletam feedback no momento certo.
            </p>
          </div>

          <div className="cx-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Card 1 — Má Venda */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px 32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IcTicket size={20} color="#60A5FA" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Má venda</p>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '16px' }}>
                Você fechou um contrato que nunca deveria ter fechado
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Dois meses depois, o cliente reclama que o produto "não era o que esperava". Com uma pesquisa de onboarding na semana 1, você teria descoberto o desalinhamento antes de virar problema.
              </p>
            </div>

            {/* Card 2 — Lançamento */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px 32px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IcTrendingUp size={20} color="#06B6D4" />
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Lançamento de produto</p>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '16px' }}>
                Seu time passou 3 meses desenvolvendo uma funcionalidade
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Taxa de adoção: 4%. Uma pesquisa com a base ativa antes do lançamento teria mostrado que 80% dos clientes não entendiam o valor. Retrabalho evitável.
              </p>
            </div>

            {/* Card 3 — Churn (destaque) */}
            <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '100px', padding: '3px 10px' }}>
                <span style={{ color: '#F87171', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Principal</span>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <IcAlertTriangle size={20} color="#F87171" />
              </div>
              <p style={{ color: 'rgba(239,68,68,0.7)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Churn silencioso</p>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '16px' }}>
                Seu cliente decidiu cancelar. Só não te avisou ainda.
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                O sinal estava lá — nota CSAT caindo há 6 semanas, duas respostas abertas negativas. Com alertas automáticos, você teria agido antes. Ainda dava tempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ──────────────────────────────────────────── */}
      <section id="como-funciona" style={{ background: '#F8FAFC', padding: '100px 2rem' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <Label color="#2563EB" center>Como Funciona</Label>
            <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px auto 0', maxWidth: '560px' }}>
              Três etapas para transformar experiência em resultado
            </h2>
          </div>

          <div className="cx-grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: '#E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
            {[
              { num: '01', title: 'Coleta', color: '#2563EB', desc: 'Capture feedbacks de múltiplos canais em uma plataforma unificada.', items: ['Pesquisas CSAT, NPS e CES', 'Links públicos e QR Codes', 'WhatsApp e E-mail', 'Formulários conversacionais'] },
              { num: '02', title: 'Análise', color: '#06B6D4', desc: 'A plataforma organiza os dados automaticamente e apresenta o que importa.', items: ['Evolução da satisfação', 'Clientes em risco', 'Tendências e padrões', 'Feedbacks críticos priorizados'] },
              { num: '03', title: 'Ação',   color: '#22C55E', desc: 'Insights claros para que sua equipe aja no momento certo.', items: ['Alertas automáticos', 'Radar de risco em tempo real', 'Receita em risco mapeada', 'Recomendações executivas'] },
            ].map((step, i) => (
              <div key={i} style={{ background: 'white', padding: '48px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.75rem', fontWeight: 700, color: step.color, letterSpacing: '0.1em', background: `${step.color}10`, padding: '4px 10px', borderRadius: '100px', border: `1px solid ${step.color}25` }}>
                    {step.num}
                  </span>
                  <h3 style={{ color: '#0F172A', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>{step.title}</h3>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '28px' }}>{step.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {step.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: step.color, flexShrink: 0 }} />
                      <span style={{ color: '#475569', fontSize: '0.875rem' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RECURSOS ───────────────────────────────────────────────── */}
      <section id="recursos" style={{ background: 'white', padding: '100px 2rem' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div className="cx-recursos-outer" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '80px', alignItems: 'start' }}>
            <div className="cx-recursos-sticky" style={{ position: 'sticky', top: '80px' }}>
              <Label color="#2563EB">Recursos</Label>
              <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: 'clamp(1.7rem, 2.5vw, 2.2rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px 0 20px' }}>
                Tudo que você precisa para monitorar a experiência
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.7 }}>
                Desde a coleta até o insight executivo, o CXRadar cobre toda a jornada de Customer Experience.
              </p>
            </div>
            <div className="cx-recursos-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#F1F5F9', borderRadius: '12px', overflow: 'hidden' }}>
              {recursosItems.map((item, i) => (
                <div key={i} style={{ background: 'white', padding: '32px 28px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <item.icon size={20} color="#2563EB" />
                  </div>
                  <h3 style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.975rem', letterSpacing: '-0.02em', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARA QUEM É ────────────────────────────────────────────── */}
      <section id="para-quem" style={{ background: '#F8FAFC', padding: '100px 2rem' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Label color="#2563EB" center>Para quem é</Label>
            <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px auto 0', maxWidth: '560px' }}>
              Para toda empresa que quer parar de perder clientes
            </h2>
          </div>

          <div className="cx-grid-5col" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {paraQuemItems.map((item, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px 22px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.08)' }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', border: '1px solid #DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <item.icon size={22} color="#2563EB" />
                </div>
                <h3 style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1.3 }}>{item.label}</h3>
                <p style={{ color: '#64748B', fontSize: '0.82rem', lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANTES / DEPOIS ─────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '100px 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Label color="#2563EB" center>Transformação</Label>
            <h2 style={{ color: '#0F172A', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px auto 0' }}>
              Antes e depois do CXRadar
            </h2>
          </div>

          <div className="cx-antes-depois" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#E2E8F0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: '#FEF2F2', padding: '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEE2E2', border: '2px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcX size={11} color="#EF4444" />
                </div>
                <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>Sem CXRadar</p>
              </div>
              {['Pesquisas isoladas por ferramenta', 'Dados dispersos sem análise', 'Venda fechada para cliente fora do perfil ideal', 'Lançamento de produto sem validação da base', 'Problemas descobertos tarde', 'Decisões por percepção e intuição'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 0', borderBottom: i < 5 ? '1px solid rgba(239,68,68,0.1)' : 'none' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <IcX size={8} color="#EF4444" />
                  </div>
                  <span style={{ color: '#7F1D1D', fontSize: '0.9rem', opacity: 0.7 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#F0FDF4', padding: '40px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DCFCE7', border: '2px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IcCheck size={12} color="#22C55E" />
                </div>
                <p style={{ color: '#16A34A', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>Com CXRadar</p>
              </div>
              {['Monitoramento contínuo e unificado', 'Insights executivos gerados automaticamente', 'Pesquisa de onboarding identifica desalinhamentos na semana 1', 'Validação com clientes ativos antes de qualquer lançamento', 'Alertas antes dos problemas escalarem', 'Decisões baseadas em dados reais'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 0', borderBottom: i < 5 ? '1px solid rgba(34,197,94,0.1)' : 'none' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                    <IcCheck size={9} color="#16A34A" />
                  </div>
                  <span style={{ color: '#14532D', fontSize: '0.9rem', opacity: 0.75 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLANOS ──────────────────────────────────────────────────── */}
      <section id="planos" style={{ background: '#060D1A', padding: '100px 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <Label color="#06B6D4" center>Nossos Produtos</Label>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px auto 16px', maxWidth: '640px' }}>
              Uma plataforma,<br />dois modelos de operação
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              Você opera com autonomia — ou conta com nossa equipe para operar junto. Sem mensalidade fixa publicada: cada proposta é calibrada para o seu volume.
            </p>
          </div>

          <div className="cx-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>

            {/* ── Autosserviço ── */}
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', padding: '40px 36px', display: 'flex', flexDirection: 'column' }}>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '100px', padding: '4px 12px', marginBottom: '20px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
                  <span style={{ color: '#60A5FA', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Autosserviço</span>
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>
                  CXRadar Autosserviço
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Sua equipe no controle total da experiência do cliente.
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    'Pesquisas e usuários ilimitados',
                    'Dashboards e relatórios em tempo real',
                    'Análise de Sentimento por IA',
                    'Suporte de até 4h/mês',
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(37,99,235,0.14)', border: '1px solid rgba(37,99,235,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcCheck size={9} color="#60A5FA" />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.875rem', lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IcPlus size={11} color="rgba(255,255,255,0.2)" />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Canais: WhatsApp · SMS · E-mail — custo por uso</span>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <Link href="/cadastro"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 24px', background: 'rgba(37,99,235,0.14)', border: '1px solid rgba(37,99,235,0.32)', borderRadius: '10px', color: '#60A5FA', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', letterSpacing: '-0.01em', transition: 'all 0.15s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(37,99,235,0.24)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)' }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = 'rgba(37,99,235,0.14)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.32)' }}
                >
                  Consulte →
                </Link>
              </div>
            </div>

            {/* ── Consult (destaque) ── */}
            <div style={{ position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(37,99,235,0.38)', borderRadius: '20px', padding: '40px 36px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 80px rgba(37,99,235,0.08), 0 0 0 1px rgba(6,182,212,0.06) inset' }}>

              <div style={{ position: 'absolute', top: '-13px', right: '28px', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', borderRadius: '100px', padding: '4px 16px', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
                <span style={{ color: 'white', fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Recomendado</span>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.22)', borderRadius: '100px', padding: '4px 12px', marginBottom: '20px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06B6D4', display: 'inline-block' }} />
                  <span style={{ color: '#06B6D4', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Consult</span>
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px' }}>
                  CXRadar Consult
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Nossa equipe como extensão da sua operação — da estratégia ao resultado.
                </p>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px', marginBottom: '20px' }}>
                  <IcCheck size={11} color="#06B6D4" />
                  <span style={{ color: 'rgba(6,182,212,0.85)', fontSize: '0.82rem', fontWeight: 500 }}>
                    Tudo do Autosserviço, mais:
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    'Gestão de disparos e segmentação',
                    'Criação e execução de campanhas',
                    'Relatório executivo + reunião mensal',
                    'Suporte de até 8h/mês',
                  ].map((item, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(6,182,212,0.13)', border: '1px solid rgba(6,182,212,0.27)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IcCheck size={9} color="#06B6D4" />
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.875rem', lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IcPlus size={11} color="rgba(6,182,212,0.4)" />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>Canais: WhatsApp · SMS · E-mail — <span style={{ color: 'rgba(6,182,212,0.6)', fontWeight: 600 }}>tarifa reduzida</span></span>
                </div>
              </div>

              <div style={{ marginTop: '32px' }}>
                <Link href="/cadastro"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 24px', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 4px 28px rgba(37,99,235,0.32)' }}
                >
                  Consulte →
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom note */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem', marginTop: '36px' }}>
            Sem mensalidade fixa pública. Cada proposta é personalizada para o seu volume e operação.
          </p>

        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────────────────── */}
      <section style={{ background: '#0F172A', padding: '120px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="cx-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ color: '#06B6D4', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Pronto para começar?
          </p>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '20px' }}>
            Seus clientes já estão<br />enviando sinais.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '12px', fontStyle: 'italic' }}>
            A pergunta é: você está conseguindo enxergá-los?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', marginBottom: '44px' }}>
            Não espere o próximo cancelamento para agir.
          </p>
          <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', color: 'white', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', padding: '16px 40px', borderRadius: '10px', letterSpacing: '-0.02em', boxShadow: '0 8px 40px rgba(37,99,235,0.4)' }}>
            Começar Agora →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ background: '#060D1A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 2rem 40px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div className="cx-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '60px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <LogoIcon />
                <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.03em' }}>CXRadar</span>
              </div>
              <p style={{ color: 'white', fontSize: '0.85rem', lineHeight: 1.65, maxWidth: '220px' }}>
                O radar que identifica clientes em risco antes que eles cancelem.
              </p>
            </div>
            {[
              { title: 'Plataforma', items: [['#como-funciona', 'Recursos'], ['#recursos', 'Funcionalidades'], ['#para-quem', 'Para quem é']] },
              { title: 'Empresa',    items: [['#', 'Sobre'], ['#planos', 'Planos'], ['#', 'Contato']] },
              { title: 'Acesso',     items: [['/login', 'Entrar'], ['/cadastro', 'Criar conta'], ['/cadastro', 'Solicitar Demo']] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ color: 'white', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  {col.title}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.items.map(([href, label]) => (
                    <a key={label} href={href} style={{ color: 'white', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = 'white')}
                    >{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="cx-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'white', fontSize: '0.8rem' }}>
              © {new Date().getFullYear()} CXRadar. Todos os direitos reservados.
            </p>
            <p style={{ color: 'white', fontSize: '0.75rem', fontStyle: 'italic' }}>
              Preditividade para sua estratégia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
function LogoIcon() {
  return (
    <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, #2563EB, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="2" fill="white" />
        <path d="M12 6a6 6 0 0 1 6 6" opacity="0.8" />
        <path d="M12 2a10 10 0 0 1 10 10" opacity="0.5" />
      </svg>
    </div>
  )
}

function Label({ children, color, center }: { children: React.ReactNode; color: string; center?: boolean }) {
  return (
    <p style={{ color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: center ? 'center' : 'left', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: center ? 'center' : 'flex-start' }}>
      <span style={{ width: '16px', height: '2px', background: color, borderRadius: '100px', display: 'inline-block', flexShrink: 0 }} />
      {children}
    </p>
  )
}
