import { ImageResponse } from 'next/og'

export const alt = 'CXRadar — Identifique clientes em risco antes que cancelem'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type FontEntry = { name: string; data: ArrayBuffer; style: 'normal'; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 }

export default async function Image() {
  const fonts: FontEntry[] = []

  try {
    const [boldCss, regularCss] = await Promise.all([
      fetch('https://fonts.googleapis.com/css2?family=Inter:wght@700', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
      }).then(r => r.text()),
      fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
      }).then(r => r.text()),
    ])

    const urlBold = boldCss.match(/src: url\((.+?)\)/)?.[1]
    const urlRegular = regularCss.match(/src: url\((.+?)\)/)?.[1]

    if (urlBold && urlRegular) {
      const [dataBold, dataRegular] = await Promise.all([
        fetch(urlBold).then(r => r.arrayBuffer()),
        fetch(urlRegular).then(r => r.arrayBuffer()),
      ])
      fonts.push({ name: 'Inter', data: dataBold, style: 'normal', weight: 700 })
      fonts.push({ name: 'Inter', data: dataRegular, style: 'normal', weight: 400 })
    }
  } catch {
    // Falls back to default Satori font if network unavailable at build time
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0F172A',
          fontFamily: fonts.length ? 'Inter' : 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            display: 'flex',
          }}
        />

        {/* Blue glow top-center */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Radar rings — bottom right decoration */}
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '500px',
            height: '500px',
          }}
        >
          {[320, 420, 520].map((size, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `1px solid rgba(37,99,235,${0.08 + i * 0.04})`,
                display: 'flex',
              }}
            />
          ))}
          {/* Center dot */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#2563EB',
              boxShadow: '0 0 24px rgba(37,99,235,0.9)',
              display: 'flex',
            }}
          />
          {/* Sweep line */}
          <div
            style={{
              position: 'absolute',
              width: '260px',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(37,99,235,0.7), transparent)',
              transform: 'rotate(-40deg)',
              transformOrigin: '0 50%',
              display: 'flex',
            }}
          />
        </div>

        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '44px 64px 0',
            gap: '14px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* Radar icon simplified */}
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                }}
              />
            </div>
          </div>
          <span
            style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.03em',
            }}
          >
            CXRadar
          </span>

          {/* URL pill — right side */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>
                cxradar.com
              </span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 64px',
            position: 'relative',
            zIndex: 1,
            maxWidth: '780px',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '2px',
                background: '#06B6D4',
                borderRadius: '100px',
                display: 'flex',
              }}
            />
            <span
              style={{
                color: '#06B6D4',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Customer Experience Intelligence
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              color: 'white',
              fontSize: '58px',
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              marginBottom: '28px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            Identifique clientes em risco{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              antes que cancelem.
            </span>
          </div>

          {/* Sub */}
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '20px',
              lineHeight: 1.5,
              marginBottom: '40px',
              display: 'flex',
            }}
          >
            Transforme NPS, CSAT e CES em inteligência acionável.
          </div>

          {/* Metric badges */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {['NPS', 'CSAT', 'CES', 'Churn Prediction'].map((label) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '8px 18px',
                  background: 'rgba(37,99,235,0.12)',
                  border: '1px solid rgba(37,99,235,0.3)',
                  borderRadius: '6px',
                  color: '#60A5FA',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 64px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.2)',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
            Preditividade para sua estratégia
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['+80% retenção', '30% menos churn', '&lt; 5min setup'].map((stat) => (
              <span
                key={stat}
                style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}
              >
                {stat}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fonts.length ? { fonts } : {}),
    }
  )
}
