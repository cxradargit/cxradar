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
  WHATSAPP: { icon: MessageSquare, color: '#16A34A', bg: '#DCFCE7' },
  SMS:      { icon: MessageSquare, color: '#2563EB', bg: '#EFF6FF' },
  EMAIL:    { icon: Mail,          color: '#7C3AED', bg: '#F5F3FF' },
}

export default function CanaisPage() {
  const [canais, setCanais]   = useState<Canal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/empresa/canais')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCanais(d.canais ?? []) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1F36', margin: 0 }}>Canais de Disparo</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Canais disponíveis para envio de pesquisas na sua conta.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', padding: '32px 0' }}>
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {canais.map(canal => {
            const meta = CANAL_META[canal.id] ?? CANAL_META.EMAIL
            const Icon = meta.icon
            return (
              <div
                key={canal.id}
                className="cx-card"
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '18px', height: '18px', color: meta.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1F36', margin: 0 }}>{canal.nome}</p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 0' }}>{canal.detalhes}</p>
                </div>
                {canal.disponivel ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 12px', borderRadius: '100px', background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>
                    <CheckCircle2 style={{ width: '11px', height: '11px' }} /> Disponível
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 12px', borderRadius: '100px', background: '#F1F5F9', color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>
                    <XCircle style={{ width: '11px', height: '11px' }} /> Indisponível
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '24px', padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '8px' }}>
        <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
          Os canais são configurados e ativados pela equipe CXRadar. Para solicitar a ativação de um canal,
          entre em contato com o suporte.
        </p>
      </div>
    </div>
  )
}
