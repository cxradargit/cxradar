'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, ClipboardList, MessageSquare, Mail, CalendarDays, CheckCircle2, Circle } from 'lucide-react'

type Survey = {
  id: string
  nome: string
  tipoPrincipal: string
  status: string
  totalRespostas: number
  criadoEm: string
}

type Usuario = {
  id: string
  email: string
  nome: string | null
  criadoEm: string
}

type EmpresaData = {
  id: string
  nome: string
  slug: string
  criadoEm: string
}

type ApiResponse = {
  empresa: EmpresaData
  usuarios: Usuario[]
  surveys: Survey[]
}

const TIPO_LABELS: Record<string, string> = {
  NPS: 'NPS', CSAT: 'CSAT', CES: 'CES', PERSONALIZADO: 'Custom',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ATIVA:     { bg: '#DCFCE7', color: '#16A34A', label: 'Ativa' },
  RASCUNHO:  { bg: '#F1F5F9', color: '#64748B', label: 'Rascunho' },
  PAUSADA:   { bg: '#FEF9C3', color: '#A16207', label: 'Pausada' },
  ENCERRADA: { bg: '#FEE2E2', color: '#DC2626', label: 'Encerrada' },
}

export default function AdminEmpresaDetail({ empresaId }: { empresaId: string }) {
  const router = useRouter()
  const [detail, setDetail] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/empresas/${empresaId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
  }, [empresaId])

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4 cx-fade-up">
        <div className="h-8 w-48 bg-white rounded animate-pulse" style={{ borderColor: '#E2E8F0' }} />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse border" style={{ borderColor: '#E2E8F0' }} />)}
        </div>
      </div>
    )
  }

  if (!detail?.empresa) {
    return (
      <div className="p-8">
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Empresa não encontrada.</p>
      </div>
    )
  }

  const { empresa, usuarios, surveys } = detail
  const totalRespostas = surveys.reduce((sum, s) => sum + s.totalRespostas, 0)
  const surveysAtivas = surveys.filter(s => s.status === 'ATIVA').length

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 cx-fade-up">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/empresas')}
          className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
          style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Empresas
        </button>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          {empresa.nome}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.875rem', fontFamily: 'var(--font-geist-mono)' }}>
          /{empresa.slug} · criada em {new Date(empresa.criadoEm).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Usuários" value={usuarios.length} icon={Users} />
        <KPICard label="Pesquisas" value={surveys.length} sub={`${surveysAtivas} ativas`} icon={ClipboardList} />
        <KPICard label="Respostas totais" value={totalRespostas} icon={MessageSquare} />
      </div>

      {/* Surveys */}
      <Section title="Pesquisas">
        {surveys.length === 0 ? (
          <Empty text="Nenhuma pesquisa criada ainda" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Nome', 'Tipo', 'Status', 'Respostas', 'Criada em'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surveys.map((s, i) => {
                const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.RASCUNHO
                return (
                  <tr key={s.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{s.nome}</td>
                    <td className="px-5 py-3">
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', background: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '4px' }}>
                        {TIPO_LABELS[s.tipoPrincipal] ?? s.tipoPrincipal}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 w-fit text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color, fontWeight: 500 }}>
                        {s.status === 'ATIVA' ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px', color: '#64748B' }}>{s.totalRespostas}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: '#94A3B8' }}>{new Date(s.criadoEm).toLocaleDateString('pt-BR')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Section>

      {/* Users */}
      <Section title="Usuários">
        {usuarios.length === 0 ? (
          <Empty text="Nenhum usuário ainda" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Nome', 'E-mail', 'Criado em'].map(h => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u, i) => (
                <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--cx-navy)' }}>{u.nome ?? '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5" style={{ color: '#64748B' }}>
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#94A3B8' }}>
                      <CalendarDays className="h-3 w-3" />
                      {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  )
}

function KPICard({ label, value, icon: Icon, sub }: { label: string; value: number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border" style={{ borderColor: '#E2E8F0', borderLeft: '3px solid #2563EB' }}>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color: '#94A3B8' }} />
      </div>
      <p className="cx-stat" style={{ fontSize: '1.875rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '6px' }}>{sub}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>{title}</p>
      <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
        {children}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-12 text-center">
      <p style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>{text}</p>
    </div>
  )
}
