export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel (60%) ─── */}
      <div
        className="hidden lg:flex lg:w-[58%] xl:w-[60%] shrink-0 flex-col items-center justify-center p-14 relative overflow-hidden"
        style={{ backgroundColor: '#0F172A' }}
      >
        {/* Aurora mesh */}
        <style>{`
          @keyframes cx-aurora {
            0%   { transform: translate(0,0) scale(1); }
            100% { transform: translate(40px,20px) scale(1.08); }
          }
          .cx-aurora-a {
            position:absolute; top:-30%; left:-10%;
            width:700px; height:600px; pointer-events:none;
            background:
              radial-gradient(ellipse at 30% 40%, rgba(37,99,235,0.18) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 20%, rgba(6,182,212,0.12) 0%, transparent 55%);
            animation: cx-aurora 14s ease-in-out infinite alternate;
          }
          .cx-aurora-b {
            position:absolute; bottom:-10%; right:-10%;
            width:600px; height:500px; pointer-events:none;
            background:
              radial-gradient(ellipse at 60% 60%, rgba(37,99,235,0.10) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(6,182,212,0.08) 0%, transparent 50%);
            animation: cx-aurora 18s ease-in-out infinite alternate-reverse;
          }
          @media (prefers-reduced-motion: reduce) {
            .cx-aurora-a, .cx-aurora-b { animation: none; }
          }
        `}</style>
        <div className="cx-aurora-a" aria-hidden="true" />
        <div className="cx-aurora-b" aria-hidden="true" />

        {/* Radar rings — bottom right */}
        <div className="absolute bottom-0 right-0 pointer-events-none" style={{ transform: 'translate(30%, 30%)' }}>
          {[320, 440, 560, 680].map((size, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`, height: `${size}px`,
                borderRadius: '50%',
                border: `1px solid rgba(37,99,235,${0.08 + i * 0.03})`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#2563EB', boxShadow: '0 0 24px rgba(37,99,235,0.9)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '340px', height: '1px',
            background: 'linear-gradient(90deg, rgba(37,99,235,0.5), transparent)',
            transformOrigin: '0 50%',
            transform: 'rotate(-35deg)',
          }} />
        </div>

        {/* Centered content block */}
        <div className="relative z-10 flex flex-col items-center text-center gap-10 max-w-[520px] w-full">
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '2.4rem', letterSpacing: '-0.05em', lineHeight: 1 }}>CXRadar</span>
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>Preditividade como estratégia.</span>
          </div>

          {/* Headline + sub */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
              Seus clientes estão enviando sinais.<br />
              <span style={{ color: '#06B6D4' }}>Você está recebendo?</span>
            </h1>
            <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: '440px' }}>
              O CXRadar transforma NPS, CSAT e CES em inteligência acionável, identificando quem está em risco de cancelar antes que seja tarde.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Right panel — form (40%) ─── */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-8 py-8 lg:py-12 overflow-y-auto" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-full max-w-[340px]">
          {children}
        </div>
      </div>
    </div>
  )
}
