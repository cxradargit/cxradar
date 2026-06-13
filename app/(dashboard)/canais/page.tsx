'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Canal = {
  id: string
  nome: string
  disponivel: boolean
  detalhes: string
}

const CANAL_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  WHATSAPP: { icon: MessageSquare, color: '#22C55E', bg: '#F0FDF4' },
  SMS:      { icon: MessageSquare, color: '#3B82F6', bg: '#EFF6FF' },
  EMAIL:    { icon: Mail,          color: '#8B5CF6', bg: '#F5F3FF' },
}

export default function CanaisPage() {
  const [canais,  setCanais]  = useState<Canal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/empresa/canais')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCanais(d.canais ?? []) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 cx-fade-up">

      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Canais
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
          Canais de disparo disponíveis na sua conta.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-slate-300" size={28} />
        </div>
      ) : (
        <>
          <div className="cx-card" style={{ overflow: 'hidden' }}>
            {canais.map((canal, i) => {
              const meta = CANAL_META[canal.id] ?? CANAL_META.EMAIL
              const Icon = meta.icon
              return (
                <div
                  key={canal.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px',
                    borderTop: i > 0 ? '1px solid #F1F5F9' : undefined,
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: meta.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '16px', height: '16px', color: meta.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cx-navy)', margin: 0 }}>{canal.nome}</p>
                    <p style={{ fontSize: '11px', color: 'var(--cx-tx4)', margin: '2px 0 0' }}>{canal.detalhes}</p>
                  </div>
                  {canal.disponivel ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>
                      <CheckCircle2 style={{ width: '10px', height: '10px' }} /> Disponível
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#F1F5F9', color: 'var(--cx-tx4)', fontSize: '11px', fontWeight: 700 }}>
                      <XCircle style={{ width: '10px', height: '10px' }} /> Em breve
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <p style={{ color: 'var(--cx-tx4)', fontSize: '0.8rem' }}>
            Os canais são configurados e ativados pela equipe CXRadar. Entre em contato com o suporte para solicitar a ativação de um canal.
          </p>
        </>
      )}

    </div>
  )
}
