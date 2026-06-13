'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare, Mail, Wifi, WifiOff, Loader2,
  CheckCircle2, XCircle, ExternalLink, Save, Eye, EyeOff, ChevronDown, ChevronUp,
} from 'lucide-react'

type Canal = {
  id: string
  nome: string
  ativo: boolean
  provedor: string | null
  configKeys: string[]
}

type EmpresaWhatsapp = {
  id: string
  nome: string
  slug: string
  conectado: boolean
  temInstancia: boolean
}

const CANAL_ICON: Record<string, React.ElementType> = {
  WHATSAPP: MessageSquare,
  SMS:      MessageSquare,
  EMAIL:    Mail,
}

const PROVEDOR_CAMPOS: Record<string, { key: string; label: string; placeholder: string; secret?: boolean }[]> = {
  twilio: [
    { key: 'accountSid',  label: 'Account SID',  placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { key: 'authToken',   label: 'Auth Token',    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', secret: true },
    { key: 'fromNumber',  label: 'Número de envio', placeholder: '+5511999999999' },
  ],
  sendgrid: [
    { key: 'apiKey',   label: 'API Key',      placeholder: 'SG.xxxxxxxx', secret: true },
    { key: 'fromEmail', label: 'E-mail remetente', placeholder: 'noreply@cxradar.com.br' },
    { key: 'fromName',  label: 'Nome remetente',   placeholder: 'CXRadar' },
  ],
  resend: [
    { key: 'apiKey',   label: 'API Key',      placeholder: 're_xxxxxxxx', secret: true },
    { key: 'fromEmail', label: 'E-mail remetente', placeholder: 'noreply@cxradar.com.br' },
    { key: 'fromName',  label: 'Nome remetente',   placeholder: 'CXRadar' },
  ],
}

export default function AdminCanais() {
  const router = useRouter()
  const [canais, setCanais]   = useState<Canal[]>([])
  const [empresas, setEmpresas] = useState<EmpresaWhatsapp[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, Record<string, string>>>({})
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const [canaisRes, empRes] = await Promise.all([
      fetch('/api/admin/canais'),
      fetch('/api/admin/canais/whatsapp-empresas'),
    ])
    if (canaisRes.ok) {
      const d = await canaisRes.json()
      setCanais(d.canais ?? [])
    }
    if (empRes.ok) {
      const d = await empRes.json()
      setEmpresas(d.empresas ?? [])
    }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', padding: '48px 0' }}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando canais…
      </div>
    )
  }

  const whatsapp = canais.find(c => c.id === 'WHATSAPP')
  const sms      = canais.find(c => c.id === 'SMS')
  const email    = canais.find(c => c.id === 'EMAIL')

  const conectadas   = empresas.filter(e => e.conectado).length
  const desconectadas = empresas.filter(e => !e.conectado && e.temInstancia).length
  const semInstancia = empresas.filter(e => !e.temInstancia).length

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1F36', margin: 0 }}>Canais de Disparo</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Gerencie os canais disponíveis na plataforma e o status de conexão por empresa.
        </p>
      </div>

      {/* ── WhatsApp ── */}
      <Section label="WhatsApp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#64748B' }}>
              Cada empresa usa um número dedicado gerenciado pela CXRadar via Evolution API.
              O toggle controla a disponibilidade global do canal.
            </p>
          </div>
          <Toggle
            ativo={whatsapp?.ativo ?? false}
            loading={saving === 'WHATSAPP'}
            onChange={v => toggleCanal('WHATSAPP', v)}
          />
        </div>

        {/* Resumo */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <StatChip label="Conectadas" value={conectadas} color="#16A34A" bg="#DCFCE7" />
          <StatChip label="Aguardando scan" value={desconectadas} color="#A16207" bg="#FEF9C3" />
          <StatChip label="Sem instância" value={semInstancia} color="#64748B" bg="#F1F5F9" />
        </div>

        {/* Tabela de empresas */}
        <div style={{ border: '1px solid #E3E8EF', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E3E8EF' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#697386', fontSize: '11px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Empresa</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#697386', fontSize: '11px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Status WhatsApp</th>
                <th style={{ width: '40px' }} />
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    Nenhuma empresa cadastrada.
                  </td>
                </tr>
              )}
              {empresas.map((emp, i) => (
                <tr
                  key={emp.id}
                  style={{ borderTop: i > 0 ? '1px solid #F1F5F9' : undefined }}
                >
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1A1F36' }}>
                    {emp.nome}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <WhatsappBadge conectado={emp.conectado} temInstancia={emp.temInstancia} />
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => router.push(`/admin/empresas/${emp.id}`)}
                      title="Gerenciar"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <ExternalLink style={{ width: '13px', height: '13px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── SMS ── */}
      {sms && (
        <ProviderSection
          canal={sms}
          campos={PROVEDOR_CAMPOS[sms.provedor ?? 'twilio'] ?? []}
          saving={saving}
          expanded={expanded}
          formValues={formValues}
          showSecret={showSecret}
          onToggle={v => toggleCanal('SMS', v)}
          onExpand={() => setExpanded(expanded === 'SMS' ? null : 'SMS')}
          onFieldChange={(key, val) => setFormValues(prev => ({ ...prev, SMS: { ...(prev.SMS ?? {}), [key]: val } }))}
          onToggleSecret={key => setShowSecret(prev => ({ ...prev, [key]: !prev[key] }))}
          onSave={() => saveConfig('SMS', sms.provedor ?? 'twilio')}
          description="Envios de SMS usando conta compartilhada da CXRadar. Todos os clientes enviam pelo mesmo número/remetente."
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
          onToggle={v => toggleCanal('EMAIL', v)}
          onExpand={() => setExpanded(expanded === 'EMAIL' ? null : 'EMAIL')}
          onFieldChange={(key, val) => setFormValues(prev => ({ ...prev, EMAIL: { ...(prev.EMAIL ?? {}), [key]: val } }))}
          onToggleSecret={key => setShowSecret(prev => ({ ...prev, [key]: !prev[key] }))}
          onSave={() => saveConfig('EMAIL', email.provedor ?? 'sendgrid')}
          description="Envios de e-mail usando conta compartilhada da CXRadar. Clientes recebem como remetente a CXRadar."
        />
      )}
    </div>
  )
}

/* ─────────── sub-components ─────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#A3ACB9', marginBottom: '12px' }}>
        {label}
      </p>
      <div className="cx-card p-6">{children}</div>
    </div>
  )
}

function Toggle({ ativo, loading, onChange }: { ativo: boolean; loading: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!ativo)}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 14px', borderRadius: '6px', border: 'none',
        background: ativo ? '#DCFCE7' : '#F1F5F9',
        color: ativo ? '#16A34A' : '#64748B',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '12px', fontWeight: 700, flexShrink: 0,
        transition: 'background .15s, color .15s',
      }}
    >
      {loading
        ? <Loader2 style={{ width: '12px', height: '12px' }} className="animate-spin" />
        : ativo
          ? <CheckCircle2 style={{ width: '12px', height: '12px' }} />
          : <XCircle style={{ width: '12px', height: '12px' }} />
      }
      {ativo ? 'Ativo' : 'Inativo'}
    </button>
  )
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '6px', background: bg, fontSize: '12px', fontWeight: 600, color }}>
      <span style={{ fontSize: '15px', fontFamily: 'var(--font-geist-mono)' }}>{value}</span>
      <span style={{ fontWeight: 400, color }}>{label}</span>
    </div>
  )
}

function WhatsappBadge({ conectado, temInstancia }: { conectado: boolean; temInstancia: boolean }) {
  if (conectado) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700 }}>
        <Wifi style={{ width: '10px', height: '10px' }} /> Conectado
      </span>
    )
  }
  if (temInstancia) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#FEF9C3', color: '#A16207', fontSize: '11px', fontWeight: 700 }}>
        <WifiOff style={{ width: '10px', height: '10px' }} /> Aguardando scan
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 10px', borderRadius: '100px', background: '#F1F5F9', color: '#64748B', fontSize: '11px', fontWeight: 700 }}>
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
  onToggle: (v: boolean) => void
  onExpand: () => void
  onFieldChange: (key: string, val: string) => void
  onToggleSecret: (key: string) => void
  onSave: () => void
}

function ProviderSection({
  canal, campos, saving, expanded, formValues, showSecret, description,
  onToggle, onExpand, onFieldChange, onToggleSecret, onSave,
}: ProviderSectionProps) {
  const isExpanded = expanded === canal.id
  const hasCreds   = canal.configKeys.length > 0

  return (
    <Section label={canal.nome}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>{description}</p>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            Provedor: <strong style={{ color: '#64748B' }}>{canal.provedor ?? '—'}</strong>
            {hasCreds && <> · <span style={{ color: '#16A34A' }}>Credenciais configuradas</span></>}
            {!hasCreds && <> · <span style={{ color: '#F59E0B' }}>Sem credenciais</span></>}
          </span>
        </div>
        <Toggle
          ativo={canal.ativo}
          loading={saving === canal.id}
          onChange={onToggle}
        />
      </div>

      <button
        onClick={onExpand}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 600, color: '#2563EB',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        {isExpanded ? <ChevronUp style={{ width: '13px', height: '13px' }} /> : <ChevronDown style={{ width: '13px', height: '13px' }} />}
        {isExpanded ? 'Ocultar configuração' : 'Configurar credenciais'}
      </button>

      {isExpanded && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {campos.map(campo => {
            const secretKey = `${canal.id}_${campo.key}`
            const visible   = showSecret[secretKey]
            return (
              <div key={campo.key}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#697386', marginBottom: '4px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
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
                      borderRadius: '6px', background: 'white', color: '#1A1F36',
                      outline: 'none', fontFamily: campo.secret ? 'var(--font-geist-mono)' : undefined,
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                  />
                  {campo.secret && (
                    <button
                      onClick={() => onToggleSecret(secretKey)}
                      style={{ background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', color: '#64748B' }}
                    >
                      {visible ? <EyeOff style={{ width: '13px', height: '13px' }} /> : <Eye style={{ width: '13px', height: '13px' }} />}
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
                padding: '8px 18px', background: '#2563EB', color: 'white',
                border: 'none', borderRadius: '6px', cursor: saving === canal.id + '_config' ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 600, opacity: saving === canal.id + '_config' ? 0.7 : 1,
              }}
            >
              {saving === canal.id + '_config'
                ? <Loader2 style={{ width: '13px', height: '13px' }} className="animate-spin" />
                : <Save style={{ width: '13px', height: '13px' }} />
              }
              Salvar credenciais
            </button>
          </div>
        </div>
      )}
    </Section>
  )
}
