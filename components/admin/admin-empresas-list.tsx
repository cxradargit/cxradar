'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, ClipboardList, MessageSquare, ChevronRight } from 'lucide-react'

type Empresa = {
  id: string
  nome: string
  slug: string
  criadoEm: string
  totalUsuarios: number
  totalSurveys: number
  surveysAtivas: number
  totalRespostas: number
}

export default function AdminEmpresasList() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/empresas')
      .then(r => r.json())
      .then(d => { setEmpresas(d); setLoading(false) })
  }, [])

  const filtered = empresas.filter(e =>
    !search || e.nome.toLowerCase().includes(search.toLowerCase()) || e.slug.includes(search.toLowerCase())
  )

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

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded animate-pulse border" style={{ borderColor: '#E3E8EF' }} />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
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
