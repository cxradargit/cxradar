export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel — selling (60%) ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] shrink-0 flex-col justify-between p-14 relative overflow-hidden"
        style={{ backgroundColor: 'var(--cx-navy)' }}
      >
        {/* Grid bg */}
        <div className="cx-grid-bg absolute inset-0 pointer-events-none" />

        {/* Radar rings — bottom right */}
        <div className="absolute bottom-0 right-0 pointer-events-none" style={{ transform: 'translate(30%, 30%)' }}>
          {[320, 440, 560, 680].map((size, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`, height: `${size}px`,
                borderRadius: '50%',
                border: `1px solid rgba(99,91,255,${0.05 + i * 0.03})`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#635BFF', boxShadow: '0 0 24px rgba(99,91,255,0.9)',
          }} />
          {/* Sweep line */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '340px', height: '1px',
            background: 'linear-gradient(90deg, rgba(99,91,255,0.6), transparent)',
            transformOrigin: '0 50%',
            transform: 'rotate(-35deg)',
          }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div style={{
            width: '32px', height: '32px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #635BFF, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="2" fill="white" />
              <path d="M12 6a6 6 0 0 1 6 6" opacity="0.8" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>CXRadar</span>
            <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.04em' }}>Preditividade para sua estratégia</span>
          </div>
        </div>

        {/* Main selling content */}
        <div className="relative z-10 space-y-10 max-w-[560px]">
          {/* Headline */}
          <div className="space-y-4">
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Seus clientes estão enviando sinais.{' '}
              <span style={{ color: '#06B6D4' }}>Você está recebendo?</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '480px' }}>
              O CXRadar transforma NPS, CSAT e CES em inteligência acionável — identificando quem está em risco de cancelar antes que seja tarde.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
            {[
              { num: '+80%', label: 'retenção após alertas' },
              { num: '30%', label: 'menos churn em 90 dias' },
              { num: '< 5min', label: 'para primeira pesquisa' },
            ].map(s => (
              <div key={s.label} style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', marginBottom: '4px' }}>{s.num}</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', lineHeight: 1.4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature checklist */}
          <div className="space-y-3">
            {[
              'Radar Score por cliente — risco em tempo real',
              'Alerta antes do cancelamento — não depois',
              'NPS, CSAT e CES em um único dashboard',
              'Primeira pesquisa rodando em menos de 5 minutos',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                  background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 12 12" width="8" height="8" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,6 5,9 10,3" />
                  </svg>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            borderLeft: '2px solid rgba(99,91,255,0.5)',
            paddingLeft: '20px',
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.6, fontStyle: 'italic' }}>
              "Identificamos 3 clientes em risco na primeira semana. Um deles teria cancelado R$ 8.000/mês."
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', marginTop: '8px' }}>— Head of CS, SaaS B2B</p>
          </div>
        </div>
      </div>

      {/* ─── Right panel — compact form (40%) ───────────────────────── */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-8 py-8 lg:py-12 overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-full max-w-[340px]">
          {children}
        </div>
      </div>
    </div>
  )
}
