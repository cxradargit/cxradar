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
        <div className="relative z-10">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', lineHeight: 1 }}>CXRadar</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Preditividade como estratégia.</span>
          </div>
        </div>

        {/* Main selling content */}
        <div className="relative z-10 max-w-[520px]">
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '24px' }}>
            Seus clientes estão enviando sinais.{' '}
            <span style={{ color: '#06B6D4' }}>Você está recebendo?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '460px' }}>
            O CXRadar transforma NPS, CSAT e CES em inteligência acionável, identificando quem está em risco de cancelar antes que seja tarde.
          </p>
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
