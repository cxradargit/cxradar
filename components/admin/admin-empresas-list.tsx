'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, ClipboardList, MessageSquare, ChevronRight } from 'lucide-react'
import AdminAddEmpresaModal from './admin-add-empresa-modal'

type Empresa = {
  id: string
  nome: string
  slug: string
  criadoEm: string
  totalUsuarios: number
  totalSurveys: number
  surveysAtivas: number
  totalRespostas: number
  saldo: number
  statusAssinatura: string
}

function StatusBadges({ saldo, statusAssinatura }: { saldo: number; statusAssinatura: string }) {
  const badges: { label: string; bg: string; color: string }[] = []
  if (saldo <= 0)
    badges.push({ label: 'Sem saldo', bg: '#FEF2F2', color: '#DC2626' })
  else if (saldo < 50)
    badges.push({ label: 'Saldo baixo', bg: '#FFFBEB', color: '#B45309' })
  if (statusAssinatura === 'SUSPENSA')
    badges.push({ label: 'Suspensa', bg: '#FFF7ED', color: '#C2410C' })
  else if (statusAssinatura === 'INATIVA')
    badges.push({ label: 'Inativa', bg: '#F8FAFC', color: '#64748B' })
  if (badges.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
      {badges.map(b => (
        <span key={b.label} style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '100px', background: b.bg, color: b.color }}>
          {b.label}
        </span>
      ))}
    </div>
  )
}

export default function AdminEmpresasList() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')

  function fetchEmpresas() {
    setLoading(true)
    setError(false)
    fetch('/api/admin/empresas')
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setEmpresas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }

  useEffect(() => { fetchEmpresas() }, [])

  const filtered = empresas.filter(e =>
    !search || e.nome.toLowerCase().includes(search.toLowerCase()) || e.slug.includes(search.toLowerCase())
  )

  const totais = {
    usuarios:      empresas.reduce((s, e) => s + e.totalUsuarios, 0),
    surveys:       empresas.reduce((s, e) => s + e.totalSurveys, 0),
    surveysAtivas: empresas.reduce((s, e) => s + e.surveysAtivas, 0),
    respostas:     empresas.reduce((s, e) => s + e.totalRespostas, 0),
  }

  return (
    <div className="p-8 max-w-5xl mx-auto cx-fade-up">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Empresas
          </h1>
          <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem' }}>
            {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AdminAddEmpresaModal onSuccess={fetchEmpresas} />
          <input
            type="search"
            placeholder="Buscar empresa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border rounded-lg outline-none bg-white"
            style={{ borderColor: '#E3E8EF', fontSize: '0.875rem' }}
            onFocus={e => (e.target.style.borderColor = '#635BFF')}
            onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
          />
        </div>
      </div>

      {/* KPI summary — computed from loaded data */}
      {!loading && !error && empresas.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Usuários',         value: totais.usuarios,      icon: Users,         color: '#635BFF' },
            { label: 'Pesquisas',        value: totais.surveys,       icon: ClipboardList, color: '#2563EB', sub: `${totais.surveysAtivas} ativas` },
            { label: 'Respostas totais', value: totais.respostas,     icon: MessageSquare, color: '#06B6D4' },
            { label: 'Empresas',         value: empresas.length,      icon: Building2,     color: '#16A34A' },
          ].map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-white border rounded p-4" style={{ borderColor: '#E3E8EF' }}>
              <div className="flex items-center justify-between mb-2">
                <p style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="cx-stat" style={{ fontSize: '1.5rem', color: 'var(--cx-navy)', lineHeight: 1 }}>{value}</p>
              {sub && <p style={{ color: '#A3ACB9', fontSize: '0.7rem', marginTop: '4px' }}>{sub}</p>}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.825rem', padding: '14px 18px', borderRadius: '5px', marginBottom: '16px' }}>
          Erro ao carregar empresas. Recarregue a página.
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white border rounded p-16 text-center" style={{ borderColor: '#E3E8EF' }}>
          <Building2 className="h-10 w-10 mx-auto mb-3" style={{ color: '#E3E8EF' }} />
          <p style={{ color: '#A3ACB9', fontSize: '0.875rem' }}>
            {search ? `Nenhum resultado para "${search}"` : 'Nenhuma empresa ainda'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border rounded overflow-hidden" style={{ borderColor: '#E3E8EF' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                {['Empresa', 'Usuários', 'Pesquisas', 'Respostas', 'Criada em', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--cx-tx3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.id}
                  onClick={() => router.push(`/admin/empresas/${e.id}`)}
                  className="cursor-pointer transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid #F8FAFC' : undefined }}
                  onMouseEnter={ev => (ev.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={ev => (ev.currentTarget.style.backgroundColor = '')}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold" style={{ color: 'var(--cx-navy)' }}>{e.nome}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A3ACB9', fontFamily: 'var(--font-geist-mono)' }}>/{e.slug}</p>
                    <StatusBadges saldo={e.saldo} statusAssinatura={e.statusAssinatura} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--cx-tx3)' }}>
                      <Users className="h-3.5 w-3.5" />
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>{e.totalUsuarios}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--cx-tx3)' }}>
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>{e.totalSurveys}</span>
                      {e.surveysAtivas > 0 && (
                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '100px', background: '#DCFCE7', color: '#16A34A', fontWeight: 500 }}>
                          {e.surveysAtivas} ativas
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--cx-tx3)' }}>
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>{e.totalRespostas}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: '#A3ACB9' }}>
                    {new Date(e.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    <ChevronRight className="h-4 w-4" style={{ color: '#C7D0DB' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
