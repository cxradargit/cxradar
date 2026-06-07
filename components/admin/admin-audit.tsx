'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'

type AuditLog = {
  id: string
  acao: string
  entidadeTipo: string
  entidadeId: string
  realizadoPor: string
  metadata: Record<string, unknown> | null
  criadoEm: string
}

const ACAO_LABEL: Record<string, string> = {
  EMPRESA_EDITADA: 'Empresa editada',
  USUARIO_CRIADO: 'Usuário criado',
  USUARIO_EDITADO: 'Usuário editado',
  USUARIO_REMOVIDO: 'Usuário removido',
  RESET_SENHA_GERADO: 'Reset de senha',
  IMPERSONACAO: 'Impersonação',
}

const ACAO_COLOR: Record<string, { bg: string; color: string }> = {
  EMPRESA_EDITADA:   { bg: '#EFF6FF', color: '#2563EB' },
  USUARIO_CRIADO:    { bg: '#F0FDF4', color: '#16A34A' },
  USUARIO_EDITADO:   { bg: '#FEF9C3', color: '#A16207' },
  USUARIO_REMOVIDO:  { bg: '#FEF2F2', color: '#DC2626' },
  RESET_SENHA_GERADO:{ bg: '#F5F3FF', color: '#7C3AED' },
  IMPERSONACAO:      { bg: '#FFF7ED', color: '#C2410C' },
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filterTipo, setFilterTipo] = useState('')

  const limit = 50

  const fetchLogs = useCallback(() => {
    setLoading(true)
    setError(false)
    const params = new URLSearchParams({ page: String(page) })
    if (filterTipo) params.set('tipo', filterTipo)
    fetch(`/api/admin/audit-logs?${params}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setLogs(d.logs ?? []); setTotal(d.total ?? 0); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [page, filterTipo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8 max-w-5xl mx-auto cx-fade-up">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Log de auditoria
          </h1>
          <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
            {total} registro{total !== 1 ? 's' : ''} no total.
          </p>
        </div>
        <select
          value={filterTipo}
          onChange={e => { setFilterTipo(e.target.value); setPage(0) }}
          className="px-3 py-2 text-sm border rounded-lg bg-white outline-none"
          style={{ borderColor: '#E3E8EF', fontSize: '0.875rem' }}
        >
          <option value="">Todos os tipos</option>
          <option value="empresa">Empresa</option>
          <option value="usuario">Usuário</option>
        </select>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '14px 18px', borderRadius: '5px', marginBottom: '16px' }}>
          Erro ao carregar logs. Recarregue a página.
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div className="cx-card p-16 text-center">
          <ScrollText className="h-10 w-10 mx-auto mb-3" style={{ color: '#E3E8EF' }} />
          <p style={{ color: '#A3ACB9', fontSize: '0.875rem' }}>Nenhum log de auditoria ainda.</p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <>
          <div className="cx-card overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                  {['Ação', 'Entidade', 'Realizado por', 'Detalhes', 'Data'].map(h => (
                    <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const style = ACAO_COLOR[log.acao] ?? { bg: '#F8FAFC', color: '#64748B' }
                  return (
                    <tr key={log.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                      <td className="px-5 py-3">
                        <span style={{ background: style.bg, color: style.color, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>
                          {ACAO_LABEL[log.acao] ?? log.acao}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'var(--font-geist-mono)' }}>
                          {log.entidadeTipo}
                        </span>
                      </td>
                      <td className="px-5 py-3" style={{ fontSize: '12px', color: '#3C4257' }}>
                        {log.realizadoPor}
                      </td>
                      <td className="px-5 py-3">
                        {log.metadata && (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-geist-mono)' }}>
                            {JSON.stringify(log.metadata).slice(0, 60)}
                            {JSON.stringify(log.metadata).length > 60 ? '…' : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {new Date(log.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Página {page + 1} de {totalPages} ({total} registros)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded transition-colors"
                  style={{ borderColor: '#E3E8EF', color: page === 0 ? '#CBD5E1' : '#697386', cursor: page === 0 ? 'not-allowed' : 'pointer', background: 'white' }}
                >
                  <ChevronLeft className="h-3 w-3" /> Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded transition-colors"
                  style={{ borderColor: '#E3E8EF', color: page >= totalPages - 1 ? '#CBD5E1' : '#697386', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', background: 'white' }}
                >
                  Próxima <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
