'use client'

import { useState } from 'react'
import { Pencil, Save, X, ChevronDown, PlusCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type EmpresaConfig = {
  id: string
  nome: string
  status?: string
  plano?: string
  limiteUsuarios?: number
  limitePesquisas?: number
  limiteRespostasMes?: number
  dataRenovacao?: string | null
  notasInternas?: string | null
  onboardingStatus?: string
  responsavelComercial?: string | null
  saldo?: number
  custoWhatsapp?: number
  custoSMS?: number
  custoEmail?: number
  statusAssinatura?: string
  whatsappProvider?: string | null
}

type Props = {
  empresa: EmpresaConfig
  onSaved: (updated: EmpresaConfig) => void
}

const STATUS_OPTIONS = ['ATIVA', 'TRIAL', 'SUSPENSA', 'CANCELADA']
const PLANO_OPTIONS = ['FREE', 'PRO', 'ENTERPRISE']
const ONBOARDING_OPTIONS = ['LEAD', 'DEMO', 'CONTRATO', 'ONBOARDING', 'ATIVO', 'CHURN']

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ATIVA:     { bg: '#DCFCE7', color: '#16A34A' },
  TRIAL:     { bg: '#FEF9C3', color: '#A16207' },
  SUSPENSA:  { bg: '#FEE2E2', color: '#DC2626' },
  CANCELADA: { bg: '#F1F5F9', color: 'var(--cx-tx3)' },
}
const PLANO_STYLE: Record<string, { bg: string; color: string }> = {
  FREE:       { bg: '#F1F5F9', color: 'var(--cx-tx3)' },
  PRO:        { bg: '#F0EFFF', color: '#635BFF' },
  ENTERPRISE: { bg: '#1A1F36', color: '#fff' },
}

const labelStyle: React.CSSProperties = {
  color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em',
}

export default function AdminEmpresaConfig({ empresa, onSaved }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [creditModal, setCreditModal] = useState(false)
  const [creditValor, setCreditValor] = useState('')
  const [creditDesc, setCreditDesc] = useState('')
  const [creditSaving, setCreditSaving] = useState(false)
  const [creditError, setCreditError] = useState('')
  const [saldoAtual, setSaldoAtual] = useState(empresa.saldo ?? 0)

  async function handleAjustarCredito() {
    const valor = parseFloat(creditValor.replace(',', '.'))
    if (!valor || valor === 0) { setCreditError('Informe um valor diferente de zero'); return }
    if (!creditDesc.trim()) { setCreditError('Descrição obrigatória'); return }
    setCreditSaving(true); setCreditError('')
    const res = await fetch(`/api/admin/empresas/${empresa.id}/ajustar-credito`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor, descricao: creditDesc }),
    })
    const data = await res.json()
    if (!res.ok) { setCreditError(data.error ?? 'Erro ao ajustar crédito'); setCreditSaving(false); return }
    setSaldoAtual(prev => prev + valor)
    setCreditModal(false); setCreditValor(''); setCreditDesc(''); setCreditSaving(false)
  }
  const [form, setForm] = useState({
    nome: empresa.nome,
    status: empresa.status ?? 'ATIVA',
    plano: empresa.plano ?? 'FREE',
    limiteUsuarios: empresa.limiteUsuarios ?? 5,
    limitePesquisas: empresa.limitePesquisas ?? 10,
    limiteRespostasMes: empresa.limiteRespostasMes ?? 500,
    dataRenovacao: empresa.dataRenovacao ? empresa.dataRenovacao.slice(0, 10) : '',
    notasInternas: empresa.notasInternas ?? '',
    onboardingStatus: empresa.onboardingStatus ?? 'LEAD',
    responsavelComercial: empresa.responsavelComercial ?? '',
    custoWhatsapp: empresa.custoWhatsapp ?? 0,
    custoSMS: empresa.custoSMS ?? 0,
    custoEmail: empresa.custoEmail ?? 0,
    whatsappProvider: empresa.whatsappProvider ?? '',
  })

  function handleCancel() {
    setEditing(false)
    setError('')
    setForm({
      nome: empresa.nome,
      status: empresa.status ?? 'ATIVA',
      plano: empresa.plano ?? 'FREE',
      limiteUsuarios: empresa.limiteUsuarios ?? 5,
      limitePesquisas: empresa.limitePesquisas ?? 10,
      limiteRespostasMes: empresa.limiteRespostasMes ?? 500,
      dataRenovacao: empresa.dataRenovacao ? empresa.dataRenovacao.slice(0, 10) : '',
      notasInternas: empresa.notasInternas ?? '',
      onboardingStatus: empresa.onboardingStatus ?? 'LEAD',
      responsavelComercial: empresa.responsavelComercial ?? '',
      custoWhatsapp: empresa.custoWhatsapp ?? 0,
      custoSMS: empresa.custoSMS ?? 0,
      custoEmail: empresa.custoEmail ?? 0,
      whatsappProvider: empresa.whatsappProvider ?? '',
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/admin/empresas/${empresa.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        dataRenovacao: form.dataRenovacao || null,
        notasInternas: form.notasInternas || null,
        responsavelComercial: form.responsavelComercial || null,
        whatsappProvider: form.whatsappProvider || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erro ao salvar.')
      setSaving(false)
      return
    }
    setSaving(false)
    setEditing(false)
    onSaved(data)
  }

  const statusStyle = STATUS_STYLE[form.status] ?? STATUS_STYLE.ATIVA
  const planoStyle = PLANO_STYLE[form.plano] ?? PLANO_STYLE.FREE

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Configurações
        </p>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors"
            style={{ color: '#697386', borderColor: '#E3E8EF', background: 'white', cursor: 'pointer', borderRadius: '5px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F7FAFC' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
          >
            <Pencil className="h-3 w-3" /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border transition-colors"
              style={{ color: '#697386', borderColor: '#E3E8EF', background: 'white', cursor: 'pointer', borderRadius: '5px' }}
            >
              <X className="h-3 w-3" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border-0 transition-colors"
              style={{ color: 'white', background: saving ? '#A3ACB9' : '#635BFF', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '5px' }}
            >
              <Save className="h-3 w-3" /> {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      <div className="cx-card p-6">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', padding: '10px 14px', borderRadius: '5px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {!editing ? (
          /* Read-only view */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Nome" value={empresa.nome} />
            <div>
              <p style={labelStyle}>Status</p>
              <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                {form.status}
              </span>
            </div>
            <div>
              <p style={labelStyle}>Plano</p>
              <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: planoStyle.bg, color: planoStyle.color }}>
                {form.plano}
              </span>
            </div>
            <InfoField label="Limite de usuários" value={String(empresa.limiteUsuarios ?? 5)} />
            <InfoField label="Limite de pesquisas" value={String(empresa.limitePesquisas ?? 10)} />
            <InfoField label="Limite respostas/mês" value={String(empresa.limiteRespostasMes ?? 500)} />
            <InfoField label="Renovação" value={empresa.dataRenovacao ? new Date(empresa.dataRenovacao).toLocaleDateString('pt-BR') : '—'} />
            <InfoField label="Onboarding" value={empresa.onboardingStatus ?? 'LEAD'} />
            <InfoField label="Responsável comercial" value={empresa.responsavelComercial || '—'} />
            {empresa.notasInternas && (
              <div className="col-span-full">
                <p style={labelStyle}>Notas internas</p>
                <p style={{ marginTop: '6px', fontSize: '13px', color: '#3C4257', lineHeight: 1.5, background: '#FEF9C3', padding: '8px 12px', borderRadius: '5px' }}>
                  {empresa.notasInternas}
                </p>
              </div>
            )}

            {/* Billing */}
            <div className="col-span-full" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={labelStyle}>Billing / Créditos</p>
                <button
                  onClick={() => { setCreditModal(true); setCreditError('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#635BFF', background: '#F0EFFF', border: '1px solid rgba(99,91,255,.2)', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}
                >
                  <PlusCircle style={{ width: '13px', height: '13px' }} />
                  Ajustar crédito
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p style={labelStyle}>Saldo atual</p>
                  <p style={{ marginTop: '6px', fontSize: '13px', fontWeight: 700, color: saldoAtual <= 0 ? '#DC2626' : '#16A34A', fontFamily: 'var(--font-geist-mono)' }}>
                    {saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <p style={labelStyle}>Status assinatura</p>
                  <p style={{ marginTop: '6px', fontSize: '12px', fontWeight: 600, color: empresa.statusAssinatura === 'ATIVA' ? '#16A34A' : empresa.statusAssinatura === 'SUSPENSA' ? '#D97706' : '#DC2626' }}>
                    {empresa.statusAssinatura ?? 'INATIVA'}
                  </p>
                </div>
                <InfoField label="Custo WhatsApp/msg" value={`R$ ${(empresa.custoWhatsapp ?? 0).toFixed(4)}`} />
                <InfoField label="Custo SMS/msg" value={`R$ ${(empresa.custoSMS ?? 0).toFixed(4)}`} />
                <InfoField label="Custo E-mail/msg" value={`R$ ${(empresa.custoEmail ?? 0).toFixed(4)}`} />
              </div>
            </div>

            {/* Modal ajuste de crédito */}
            {creditModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                onClick={e => { if (e.target === e.currentTarget) setCreditModal(false) }}>
                <div style={{ background: 'white', borderRadius: '8px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1A1F36' }}>Ajustar crédito</h3>
                    <button onClick={() => setCreditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X style={{ width: '18px', height: '18px' }} /></button>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ ...labelStyle, marginBottom: '6px' }}>Valor (positivo = crédito, negativo = débito)</p>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '13px' }}>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={creditValor}
                        onChange={e => setCreditValor(e.target.value)}
                        placeholder="ex: 250 ou -50"
                        style={{ width: '100%', height: '40px', paddingLeft: '36px', paddingRight: '12px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '14px', outline: 'none', fontFamily: 'var(--font-geist-mono)' }}
                        onFocus={e => (e.target.style.borderColor = '#635BFF')}
                        onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ ...labelStyle, marginBottom: '6px' }}>Descrição <span style={{ color: '#DC2626' }}>*</span></p>
                    <input
                      type="text"
                      value={creditDesc}
                      onChange={e => setCreditDesc(e.target.value)}
                      placeholder="ex: Créditos de boas-vindas"
                      style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E3E8EF', borderRadius: '5px', fontSize: '13px', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = '#635BFF')}
                      onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                    />
                  </div>

                  {creditError && <p style={{ color: '#DC2626', fontSize: '12px', marginBottom: '12px' }}>{creditError}</p>}

                  <button
                    onClick={handleAjustarCredito}
                    disabled={creditSaving}
                    style={{ width: '100%', height: '40px', background: creditSaving ? '#A3ACB9' : '#635BFF', color: 'white', border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: 600, cursor: creditSaving ? 'not-allowed' : 'pointer' }}
                  >
                    {creditSaving ? 'Salvando…' : 'Confirmar ajuste'}
                  </button>
                </div>
              </div>
            )}

            <div className="col-span-full" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
              <p style={{ ...labelStyle, marginBottom: '8px' }}>Disparo</p>
              <InfoField
                label="Provedor WhatsApp"
                value={empresa.whatsappProvider === 'ZAPI' ? 'Z-API' : empresa.whatsappProvider === 'EVOLUTION' ? 'Evolution API' : 'Não configurado'}
              />
            </div>
          </div>
        ) : (
          /* Edit form */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="col-span-full lg:col-span-1">
              <Label style={labelStyle}>Nome da empresa</Label>
              <Input
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="h-9 bg-white text-sm mt-1.5"
              />
            </div>

            <SelectField label="Status" value={form.status} options={STATUS_OPTIONS} onChange={v => setForm(f => ({ ...f, status: v }))} />
            <SelectField label="Plano" value={form.plano} options={PLANO_OPTIONS} onChange={v => setForm(f => ({ ...f, plano: v }))} />

            <div>
              <Label style={labelStyle}>Limite de usuários</Label>
              <Input type="number" value={form.limiteUsuarios} onChange={e => setForm(f => ({ ...f, limiteUsuarios: parseInt(e.target.value) || 0 }))} className="h-9 bg-white text-sm mt-1.5" />
            </div>
            <div>
              <Label style={labelStyle}>Limite de pesquisas</Label>
              <Input type="number" value={form.limitePesquisas} onChange={e => setForm(f => ({ ...f, limitePesquisas: parseInt(e.target.value) || 0 }))} className="h-9 bg-white text-sm mt-1.5" />
            </div>
            <div>
              <Label style={labelStyle}>Limite respostas/mês</Label>
              <Input type="number" value={form.limiteRespostasMes} onChange={e => setForm(f => ({ ...f, limiteRespostasMes: parseInt(e.target.value) || 0 }))} className="h-9 bg-white text-sm mt-1.5" />
            </div>

            <div>
              <Label style={labelStyle}>Data de renovação</Label>
              <Input type="date" value={form.dataRenovacao} onChange={e => setForm(f => ({ ...f, dataRenovacao: e.target.value }))} className="h-9 bg-white text-sm mt-1.5" />
            </div>
            <SelectField label="Status de onboarding" value={form.onboardingStatus} options={ONBOARDING_OPTIONS} onChange={v => setForm(f => ({ ...f, onboardingStatus: v }))} />
            <div>
              <Label style={labelStyle}>Responsável comercial</Label>
              <Input value={form.responsavelComercial} onChange={e => setForm(f => ({ ...f, responsavelComercial: e.target.value }))} placeholder="Nome ou e-mail" className="h-9 bg-white text-sm mt-1.5" />
            </div>

            <div className="col-span-full">
              <Label style={labelStyle}>Notas internas</Label>
              <textarea
                value={form.notasInternas}
                onChange={e => setForm(f => ({ ...f, notasInternas: e.target.value }))}
                placeholder="Observações internas sobre esta empresa…"
                rows={3}
                style={{ width: '100%', marginTop: '6px', padding: '8px 12px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '5px', resize: 'vertical', outline: 'none', background: 'white', color: '#3C4257', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = '#635BFF')}
                onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
              />
            </div>

            {/* Billing costs */}
            <div className="col-span-full" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Custo por disparo (R$)</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label style={labelStyle}>WhatsApp / msg</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.custoWhatsapp}
                    onChange={e => setForm(f => ({ ...f, custoWhatsapp: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-white text-sm mt-1.5 font-mono"
                  />
                </div>
                <div>
                  <Label style={labelStyle}>SMS / msg</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.custoSMS}
                    onChange={e => setForm(f => ({ ...f, custoSMS: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-white text-sm mt-1.5 font-mono"
                  />
                </div>
                <div>
                  <Label style={labelStyle}>E-mail / msg</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.custoEmail}
                    onChange={e => setForm(f => ({ ...f, custoEmail: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-white text-sm mt-1.5 font-mono"
                  />
                </div>
              </div>
              <p style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>Saldo e status de assinatura são gerenciados automaticamente via Stripe.</p>
            </div>

            {/* WhatsApp provider */}
            <div className="col-span-full" style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Disparo — Provedor WhatsApp</p>
              <div style={{ maxWidth: '280px' }}>
                <SelectField
                  label="Provedor"
                  value={form.whatsappProvider}
                  options={['', 'EVOLUTION_GO', 'ZAPI', 'EVOLUTION']}
                  labels={['Não configurado', 'Evolution Go (ativo)', 'Z-API (legado)', 'Evolution API (legado)']}
                  onChange={v => setForm(f => ({ ...f, whatsappProvider: v }))}
                />
              </div>
              {form.whatsappProvider === 'EVOLUTION_GO' && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '5px', fontSize: '12px', color: '#15803D' }}>
                  Evolution Go — Conecte o número na seção WhatsApp abaixo (QR code ou código de pareamento).
                </div>
              )}
              {form.whatsappProvider === 'ZAPI' && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '5px', fontSize: '12px', color: '#92400E' }}>
                  Z-API — Credenciais configuradas na fase de produção (Instance ID, Token).
                </div>
              )}
              {form.whatsappProvider === 'EVOLUTION' && (
                <div style={{ marginTop: '12px', padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '5px', fontSize: '12px', color: '#92400E' }}>
                  Evolution API — URL do servidor e API Key configurados na fase de produção.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={labelStyle}>{label}</p>
      <p style={{ marginTop: '6px', fontSize: '13px', color: '#3C4257' }}>{value}</p>
    </div>
  )
}

function SelectField({ label, value, options, labels, onChange }: { label: string; value: string; options: string[]; labels?: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <Label style={labelStyle}>{label}</Label>
      <div style={{ position: 'relative', marginTop: '6px' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', height: '36px', paddingLeft: '12px', paddingRight: '32px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '5px', background: 'white', color: '#3C4257', outline: 'none', appearance: 'none', cursor: 'pointer' }}
          onFocus={e => (e.target.style.borderColor = '#635BFF')}
          onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
        >
          {options.map((o, i) => <option key={o} value={o}>{labels?.[i] ?? o}</option>)}
        </select>
        <ChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#94A3B8', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}
