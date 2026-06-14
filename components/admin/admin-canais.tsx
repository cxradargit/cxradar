'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wifi, WifiOff, Loader2, CheckCircle2, XCircle,
  ExternalLink, Save, Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react'

type Canal = {
  id: string
  nome: string
  ativo: boolean
  provedor: string | null
  configKeys: string[]
  batchSize: number
  delayMs: number
  limiteDiario: number
}

type EmpresaWhatsapp = {
  id: string
  nome: string
  slug: string
  conectado: boolean
  temInstancia: boolean
}

const PROVEDOR_CAMPOS: Record<string, { key: string; label: string; placeholder: string; secret?: boolean }[]> = {
  twilio: [
    { key: 'accountSid',  label: 'Account SID',     placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { key: 'authToken',   label: 'Auth Token',       placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', secret: true },
    { key: 'fromNumber',  label: 'Número de envio',  placeholder: '+5511999999999' },
  ],
  sendgrid: [
    { key: 'apiKey',    label: 'API Key',            placeholder: 'SG.xxxxxxxx', secret: true },
    { key: 'fromEmail', label: 'E-mail remetente',   placeholder: 'noreply@cxradar.com.br' },
    { key: 'fromName',  label: 'Nome remetente',     placeholder: 'CXRadar' },
  ],
  resend: [
    { key: 'apiKey',    label: 'API Key',            placeholder: 're_xxxxxxxx', secret: true },
    { key: 'fromEmail', label: 'E-mail remetente',   placeholder: 'noreply@cxradar.com.br' },
    { key: 'fromName',  label: 'Nome remetente',     placeholder: 'CXRadar' },
  ],
}

export default function AdminCanais() {
  const router  = useRouter()
  const [canais,   setCanais]   = useState<Canal[]>([])
  const [empresas, setEmpresas] = useState<EmpresaWhatsapp[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [formValues,  setFormValues]  = useState<Record<string, Record<string, string>>>({})
  const [showSecret,  setShowSecret]  = useState<Record<string, boolean>>({})
  const [limites, setLimites] = useState<Record<string, { batchSize: string; delayMs: string; limiteDiario: string }>>({})
  const [savingLimites,  setSavingLimites]  = useState<string | null>(null)
  const [limitesErro,    setLimitesErro]    = useState<string | null>(null)
  const [limitesSalvo,   setLimitesSalvo]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [cRes, eRes] = await Promise.all([
      fetch('/api/admin/canais'),
      fetch('/api/admin/canais/whatsapp-empresas'),
    ])
    if (cRes.ok) {
      const data: Canal[] = (await cRes.json()).canais ?? []
      setCanais(data)
      const init: Record<string, { batchSize: string; delayMs: string; limiteDiario: string }> = {}
      data.forEach(c => {
        init[c.id] = {
          batchSize:    String(c.batchSize ?? 20),
          delayMs:      String(c.delayMs ?? 3000),
          limiteDiario: String(c.limiteDiario ?? 500),
        }
      })
      setLimites(init)
    }
    if (eRes.ok) setEmpresas((await eRes.json()).empresas ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleCanal(id: string, ativo: boolean) {
    setSaving(id)
    await fetch('/api/admin/canais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo }),
    })
    setCanais(prev => prev.map(c => c.id === id ? { ...c, ativo } : c))
    setSaving(null)
  }

  async function saveLimites(id: string) {
    setSavingLimites(id)
    setLimitesErro(null)
    setLimitesSalvo(null)
    const l = limites[id]
    const res = await fetch('/api/admin/canais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        batchSize:    parseInt(l.batchSize, 10),
        delayMs:      parseInt(l.delayMs, 10),
        limiteDiario: parseInt(l.limiteDiario, 10),
      }),
    })
    setSavingLimites(null)
    if (res.ok) { setLimitesSalvo(id); setTimeout(() => setLimitesSalvo(null), 2000) }
    else { const j = await res.json().catch(() => ({})); setLimitesErro(j.error ?? 'Erro ao salvar limites') }
  }

  async function saveConfig(id: string, provedor: string) {
    setSaving(id + '_config')
    await fetch('/api/admin/canais', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, provedor, config: formValues[id] ?? {} }),
    })
    setSaving(null)
    setExpanded(null)
    load()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2" style={{ color: '#94A3B8', fontSize: '13px' }}>
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando canais…
        </div>
      </div>
    )
  }

  const whatsapp = canais.find(c => c.id === 'WHATSAPP')
  const sms      = canais.find(c => c.id === 'SMS')
  const email    = canais.find(c => c.id === 'EMAIL')

  const conectadas    = empresas.filter(e => e.conectado).length
  const aguardando    = empresas.filter(e => !e.conectado && e.temInstancia).length
  const semInstancia  = empresas.filter(e => !e.temInstancia).length

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 cx-fade-up">

      <div>
        <h1 style={{ color: 'var(--cx-navy)', fontWeight: 700, fontSize: '1.375rem', letterSpacing: '-0.02em', margin: 0 }}>
          Canais de Disparo
        </h1>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.875rem', marginTop: '4px' }}>
          Gerencie os canais disponíveis na plataforma e o status de conexão por empresa.
        </p>
      </div>

      {/* ── WhatsApp ── */}
      <div>
        <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          WhatsApp
        </p>
        <div className="cx-card">

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', color: 'var(--cx-tx3)' }}>
              Cada empresa usa um número dedicado gerenciado pela CXRadar via Evolution API.
            </p>
            <Toggle
              ativo={whatsapp?.ativo ?? false}
              loading={saving === 'WHATSAPP'}
              onChange={v => toggleCanal('WHATSAPP', v)}
            />
          </div>

          {/* Chips de resumo */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '10px' }}>
            <StatChip label="Conectadas"      value={conectadas}   color="#16A34A" bg="#DCFCE7" />
            <StatChip label="Aguardando scan" value={aguardando}   color="#A16207" bg="#FEF9C3" />
            <StatChip label="Sem instância"   value={semInstancia} color="#64748B" bg="#F1F5F9" />
          </div>

          {/* Tabela */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#FAFBFC' }}>
                <th style={{ textAlign: 'left', padding: '9px 20px', fontWeight: 600, color: 'var(--cx-tx4)', fontSize: '11px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Empresa</th>
                <th style={{ textAlign: 'left', padding: '9px 20px', fontWeight: 600, color: 'var(--cx-tx4)', fontSize: '11px', letterSpacing: '.05em', textTransform: 'uppercase' }}>WhatsApp</th>
                <th style={{ width: '44px' }} />
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--cx-tx4)', fontSize: '13px' }}>
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              )}
              {empresas.map((emp, i) => (
                <tr key={emp.id} style={{ borderTop: i === 0 ? '1px solid #F1F5F9' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '11px 20px', fontWeight: 500, color: 'var(--cx-tx2)' }}>{emp.nome}</td>
                  <td style={{ padding: '11px 20px' }}>
                    <WhatsappBadge conectado={emp.conectado} temInstancia={emp.temInstancia} />
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => router.push(`/admin/empresas/${emp.id}`)}
                      title="Gerenciar empresa"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cx-tx4)', padding: '4px', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#2563EB'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--cx-tx4)'}
                    >
                      <ExternalLink style={{ width: '13px', height: '13px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Limites de disparo */}
          {whatsapp && limites['WHATSAPP'] && (
            <LimitesSection
              canalId="WHATSAPP"
              valores={limites['WHATSAPP']}
              saving={savingLimites === 'WHATSAPP'}
              saved={limitesSalvo === 'WHATSAPP'}
              erro={limitesErro}
              onChange={(field, val) => setLimites(prev => ({ ...prev, WHATSAPP: { ...prev.WHATSAPP, [field]: val } }))}
              onSave={() => saveLimites('WHATSAPP')}
            />
          )}
        </div>
      </div>

      {/* ── SMS ── */}
      {sms && (
        <ProviderSection
          canal={sms}
          campos={PROVEDOR_CAMPOS[sms.provedor ?? 'twilio'] ?? []}
          saving={saving}
          expanded={expanded}
          formValues={formValues}
          showSecret={showSecret}
          description="Envios usando conta compartilhada da CXRadar. Todos os clientes enviam pelo mesmo número remetente."
          limites={limites['SMS']}
          savingLimites={savingLimites === 'SMS'}
          limitesSalvo={limitesSalvo === 'SMS'}
          limitesErro={limitesErro}
          onToggle={v => toggleCanal('SMS', v)}
          onExpand={() => setExpanded(expanded === 'SMS' ? null : 'SMS')}
          onFieldChange={(key, val) => setFormValues(prev => ({ ...prev, SMS: { ...(prev.SMS ?? {}), [key]: val } }))}
          onToggleSecret={key => setShowSecret(prev => ({ ...prev, [key]: !prev[key] }))}
          onSave={() => saveConfig('SMS', sms.provedor ?? 'twilio')}
          onLimiteChange={(field, val) => setLimites(prev => ({ ...prev, SMS: { ...prev.SMS, [field]: val } }))}
          onSaveLimites={() => saveLimites('SMS')}
        />
      )}

      {/* ── Email ── */}
      {email && (
        <ProviderSection
          canal={email}
          campos={PROVEDOR_CAMPOS[email.provedor ?? 'sendgrid'] ?? []}
          saving={saving}
          expanded={expanded}
          formValues={formValues}
          showSecret={showSecret}
          description="Envios usando conta compartilhada da CXRadar. Clientes recebem com remetente CXRadar."
          limites={limites['EMAIL']}
          savingLimites={savingLimites === 'EMAIL'}
          limitesSalvo={limitesSalvo === 'EMAIL'}
          limitesErro={limitesErro}
          onToggle={v => toggleCanal('EMAIL', v)}
          onExpand={() => setExpanded(expanded === 'EMAIL' ? null : 'EMAIL')}
          onFieldChange={(key, val) => setFormValues(prev => ({ ...prev, EMAIL: { ...(prev.EMAIL ?? {}), [key]: val } }))}
          onToggleSecret={key => setShowSecret(prev => ({ ...prev, [key]: !prev[key] }))}
          onSave={() => saveConfig('EMAIL', email.provedor ?? 'sendgrid')}
          onLimiteChange={(field, val) => setLimites(prev => ({ ...prev, EMAIL: { ...prev.EMAIL, [field]: val } }))}
          onSaveLimites={() => saveLimites('EMAIL')}
        />
      )}

    </div>
  )
}

/* ─── sub-components ─── */

function Toggle({ ativo, loading, onChange }: { ativo: boolean; loading: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!ativo)}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '5px', border: 'none',
        background: ativo ? '#DCFCE7' : '#F1F5F9',
        color: ativo ? '#16A34A' : 'var(--cx-tx3)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '12px', fontWeight: 700, flexShrink: 0,
        transition: 'background .15s',
      }}
    >
      {loading
        ? <Loader2 style={{ width: '11px', height: '11px' }} className="animate-spin" />
        : ativo
          ? <CheckCircle2 style={{ width: '11px', height: '11px' }} />
          : <XCircle style={{ width: '11px', height: '11px' }} />
      }
      {ativo ? 'Ativo' : 'Inativo'}
    </button>
  )
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '100px', background: bg, fontSize: '11px', fontWeight: 600, color }}>
      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '12px' }}>{value}</span>
      {label}
    </span>
  )
}

function WhatsappBadge({ conectado, temInstancia }: { conectado: boolean; temInstancia: boolean }) {
  if (conectado) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>
      <Wifi style={{ width: '10px', height: '10px' }} /> Conectado
    </span>
  )
  if (temInstancia) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#FEF9C3', color: '#A16207', fontSize: '11px', fontWeight: 700 }}>
      <WifiOff style={{ width: '10px', height: '10px' }} /> Aguardando scan
    </span>
  )
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#F1F5F9', color: 'var(--cx-tx3)', fontSize: '11px', fontWeight: 700 }}>
      <XCircle style={{ width: '10px', height: '10px' }} /> Sem instância
    </span>
  )
}

type ProviderSectionProps = {
  canal: Canal
  campos: { key: string; label: string; placeholder: string; secret?: boolean }[]
  saving: string | null
  expanded: string | null
  formValues: Record<string, Record<string, string>>
  showSecret: Record<string, boolean>
  description: string
  limites?: LimitValues
  savingLimites?: boolean
  limitesSalvo?: boolean
  limitesErro?: string | null
  onToggle: (v: boolean) => void
  onExpand: () => void
  onFieldChange: (key: string, val: string) => void
  onToggleSecret: (key: string) => void
  onSave: () => void
  onLimiteChange?: (field: keyof LimitValues, val: string) => void
  onSaveLimites?: () => void
}

function ProviderSection({
  canal, campos, saving, expanded, formValues, showSecret, description,
  limites, savingLimites, limitesSalvo, limitesErro,
  onToggle, onExpand, onFieldChange, onToggleSecret, onSave,
  onLimiteChange, onSaveLimites,
}: ProviderSectionProps) {
  const isExpanded = expanded === canal.id
  const hasCreds   = canal.configKeys.length > 0

  return (
    <div>
      <p style={{ color: 'var(--cx-tx3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        {canal.nome}
      </p>
      <div className="cx-card">

        {/* Header row */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--cx-tx3)', marginBottom: '5px' }}>{description}</p>
            <p style={{ fontSize: '11px', color: 'var(--cx-tx4)' }}>
              Provedor: <strong style={{ color: 'var(--cx-tx3)' }}>{canal.provedor ?? '—'}</strong>
              {hasCreds
                ? <> · <span style={{ color: '#16A34A' }}>Credenciais configuradas</span></>
                : <> · <span style={{ color: '#F59E0B' }}>Sem credenciais</span></>
              }
            </p>
          </div>
          <Toggle
            ativo={canal.ativo}
            loading={saving === canal.id}
            onChange={onToggle}
          />
        </div>

        {/* Limites de disparo */}
        {limites && onLimiteChange && onSaveLimites && (
          <LimitesSection
            canalId={canal.id}
            valores={limites}
            saving={savingLimites ?? false}
            saved={limitesSalvo}
            erro={limitesErro}
            onChange={onLimiteChange}
            onSave={onSaveLimites}
          />
        )}

        {/* Config toggle */}
        <div style={{ padding: '12px 20px' }}>
          <button
            onClick={onExpand}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', fontWeight: 600, color: '#2563EB',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            {isExpanded
              ? <ChevronUp style={{ width: '12px', height: '12px' }} />
              : <ChevronDown style={{ width: '12px', height: '12px' }} />
            }
            {isExpanded ? 'Ocultar configuração' : 'Configurar credenciais'}
          </button>

          {isExpanded && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {campos.map(campo => {
                const secretKey = `${canal.id}_${campo.key}`
                const visible   = showSecret[secretKey]
                return (
                  <div key={campo.key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cx-tx3)', marginBottom: '5px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                      {campo.label}
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type={campo.secret && !visible ? 'password' : 'text'}
                        placeholder={campo.placeholder}
                        value={formValues[canal.id]?.[campo.key] ?? ''}
                        onChange={e => onFieldChange(campo.key, e.target.value)}
                        style={{
                          flex: 1, height: '36px', padding: '0 10px',
                          fontSize: '13px', border: '1px solid #E3E8EF',
                          borderRadius: '5px', background: 'white', color: 'var(--cx-navy)',
                          outline: 'none',
                          fontFamily: campo.secret ? 'var(--font-geist-mono)' : undefined,
                        }}
                        onFocus={e => (e.target.style.borderColor = '#2563EB')}
                        onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                      />
                      {campo.secret && (
                        <button
                          onClick={() => onToggleSecret(secretKey)}
                          style={{ background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '5px', padding: '0 10px', cursor: 'pointer', color: 'var(--cx-tx3)' }}
                        >
                          {visible
                            ? <EyeOff style={{ width: '13px', height: '13px' }} />
                            : <Eye    style={{ width: '13px', height: '13px' }} />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div>
                <button
                  onClick={onSave}
                  disabled={saving === canal.id + '_config'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', background: '#2563EB', color: 'white',
                    border: 'none', borderRadius: '5px',
                    cursor: saving === canal.id + '_config' ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 600,
                    opacity: saving === canal.id + '_config' ? 0.7 : 1,
                  }}
                >
                  {saving === canal.id + '_config'
                    ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" />
                    : <Save    style={{ width: '13px', height: '13px' }} />
                  }
                  Salvar credenciais
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

type LimitValues = { batchSize: string; delayMs: string; limiteDiario: string }

function LimitesSection({
  canalId, valores, saving, saved, erro, onChange, onSave,
}: {
  canalId: string
  valores: LimitValues
  saving: boolean
  saved?: boolean
  erro?: string | null
  onChange: (field: keyof LimitValues, val: string) => void
  onSave: () => void
}) {
  const fields: { key: keyof LimitValues; label: string; hint: string; suffix: string }[] = [
    { key: 'batchSize',    label: 'Batch size',        hint: 'Envios simultâneos por lote',             suffix: 'contatos'    },
    { key: 'delayMs',      label: 'Delay entre lotes', hint: 'Pausa entre lotes',                       suffix: 'ms'          },
    { key: 'limiteDiario', label: 'Limite diário',     hint: 'Máximo de disparos por dia por empresa',  suffix: 'disparos/dia' },
  ]

  return (
    <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--cx-tx4)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Limites de disparo — {canalId}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--cx-tx3)', marginBottom: '4px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {f.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                min={1}
                value={valores[f.key]}
                onChange={e => onChange(f.key, e.target.value)}
                style={{ width: '80px', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '5px', outline: 'none', fontFamily: 'var(--font-geist-mono)' }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
              />
              <span style={{ fontSize: '11px', color: 'var(--cx-tx4)' }}>{f.suffix}</span>
            </div>
            <p style={{ fontSize: '10px', color: 'var(--cx-tx4)', marginTop: '3px' }}>{f.hint}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '5px',
          cursor: saving ? 'not-allowed' : 'pointer',
          fontSize: '12px', fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving
          ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
          : <Save    style={{ width: '12px', height: '12px' }} />
        }
        {saved ? 'Salvo!' : 'Salvar limites'}
      </button>
      {erro && <p style={{ color: '#EF4444', fontSize: '11px', marginTop: '6px' }}>{erro}</p>}
    </div>
  )
}
