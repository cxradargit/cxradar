'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Wifi, WifiOff, QrCode, Smartphone, Copy, Check, RefreshCw, Loader2, X, AlertTriangle } from 'lucide-react'

type WhatsappStatus =
  | 'loading'
  | 'NAO_CONFIGURADO'
  | 'AGUARDANDO'
  | 'CONECTADO'
  | 'ERRO'

type StatusData = {
  status: WhatsappStatus
  jid?: string
  qrcode?: string | null
  instanceId?: string
  error?: string
}

type ConnectMode = 'idle' | 'qr' | 'pair'

export default function AdminEmpresaWhatsapp({ empresaId }: { empresaId: string }) {
  const [statusData, setStatusData]   = useState<StatusData>({ status: 'loading' })
  const [connectMode, setConnectMode] = useState<ConnectMode>('idle')
  const [phoneInput, setPhoneInput]   = useState('')
  const [pairCode, setPairCode]       = useState<string | null>(null)
  const [copied, setCopied]           = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError]     = useState('')
  const [qrRefreshing, setQrRefreshing]   = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async (quiet = false) => {
    if (!quiet) setStatusData(prev => ({ ...prev, status: prev.status === 'loading' ? 'loading' : prev.status }))
    try {
      const res  = await fetch(`/api/admin/empresas/${empresaId}/whatsapp`)
      const data = await res.json()
      setStatusData(data)

      // Para o polling quando conecta
      if (data.status === 'CONECTADO' && pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
        setConnectMode('idle')
      }

      // Atualiza QR se ainda aguardando
      if (data.status === 'AGUARDANDO' && data.qrcode) {
        setQrRefreshing(false)
      }
    } catch {
      setStatusData({ status: 'ERRO', error: 'Evolution Go inacessível' })
    }
  }, [empresaId])

  // Poll a cada 5s enquanto aguardando conexão
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (connectMode === 'qr' || connectMode === 'pair') {
      pollRef.current = setInterval(() => fetchStatus(true), 5000)
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [connectMode, fetchStatus])

  async function handleConnectQR() {
    setActionLoading(true)
    setActionError('')
    setConnectMode('qr')
    try {
      const res  = await fetch(`/api/admin/empresas/${empresaId}/whatsapp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error ?? 'Erro ao conectar'); setConnectMode('idle'); return }
      setStatusData(prev => ({ ...prev, status: 'AGUARDANDO', qrcode: data.qrcode }))
    } catch {
      setActionError('Erro ao contactar o servidor')
      setConnectMode('idle')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConnectPair() {
    const digits = phoneInput.replace(/\D/g, '')
    if (digits.length < 10) { setActionError('Informe o número completo com DDD (ex: 5544988264275)'); return }
    setActionLoading(true)
    setActionError('')
    try {
      const res  = await fetch(`/api/admin/empresas/${empresaId}/whatsapp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: digits.startsWith('55') ? digits : '55' + digits }) })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error ?? 'Erro ao gerar código'); return }
      setPairCode(data.pairingCode)
      setConnectMode('pair')
      fetchStatus(true)
    } catch {
      setActionError('Erro ao contactar o servidor')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDisconnect() {
    setActionLoading(true)
    setActionError('')
    try {
      await fetch(`/api/admin/empresas/${empresaId}/whatsapp`, { method: 'DELETE' })
      setConnectMode('idle')
      setPairCode(null)
      setPhoneInput('')
      await fetchStatus()
    } catch {
      setActionError('Erro ao desconectar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRefreshQR() {
    setQrRefreshing(true)
    await fetchStatus(true)
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  function resetConnect() {
    setConnectMode('idle')
    setPairCode(null)
    setPhoneInput('')
    setActionError('')
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const { status, jid, qrcode } = statusData

  // Format JID → phone number display
  const phoneDisplay = jid ? jid.replace('@s.whatsapp.net', '').replace(/(\d{2})(\d{2})(\d{5})(\d{4}).*/, '+$1 ($2) $3-$4') : null

  return (
    <div>
      <p style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        WhatsApp
      </p>
      <div className="cx-card p-6">

        {/* Status bar */}
        <div className="flex items-center justify-between mb-5">
          <StatusBadge status={status} />
          {status === 'CONECTADO' && phoneDisplay && (
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '13px', color: '#64748B' }}>
              {phoneDisplay}
            </span>
          )}
        </div>

        {/* LOADING */}
        {status === 'loading' && (
          <div className="flex items-center gap-2" style={{ color: '#94A3B8', fontSize: '13px' }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Verificando conexão…
          </div>
        )}

        {/* ERRO */}
        {status === 'ERRO' && (
          <div className="flex items-center gap-2" style={{ color: '#DC2626', fontSize: '13px', background: '#FEF2F2', border: '1px solid #FECACA', padding: '10px 14px', borderRadius: '6px' }}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {statusData.error ?? 'Evolution Go inacessível. Verifique se o serviço está rodando.'}
          </div>
        )}

        {/* NÃO CONFIGURADO — escolha do método */}
        {status === 'NAO_CONFIGURADO' && connectMode === 'idle' && (
          <div className="space-y-3">
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Nenhum número WhatsApp conectado. Escolha como conectar o chip deste cliente:
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConnectQR}
                disabled={actionLoading}
                className="flex items-center gap-2 flex-1 justify-center"
                style={{ padding: '10px 16px', background: 'white', border: '1.5px solid #E3E8EF', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: '#3C4257', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#635BFF'; (e.currentTarget as HTMLElement).style.color = '#635BFF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                QR Code
              </button>
              <button
                onClick={() => { setConnectMode('pair'); setActionError('') }}
                disabled={actionLoading}
                className="flex items-center gap-2 flex-1 justify-center"
                style={{ padding: '10px 16px', background: 'white', border: '1.5px solid #E3E8EF', borderRadius: '8px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, color: '#3C4257', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#635BFF'; (e.currentTarget as HTMLElement).style.color = '#635BFF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E3E8EF'; (e.currentTarget as HTMLElement).style.color = '#3C4257' }}
              >
                <Smartphone className="h-4 w-4" />
                Código de Pareamento
              </button>
            </div>
          </div>
        )}

        {/* QR CODE flow */}
        {(status === 'NAO_CONFIGURADO' || status === 'AGUARDANDO') && connectMode === 'qr' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Abra o WhatsApp no chip → <strong>Configurações → Aparelhos conectados → Conectar aparelho</strong> e escaneie o QR abaixo.
              </p>
              <button onClick={resetConnect} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-8 items-start">
              {/* QR image */}
              <div style={{ flexShrink: 0, width: '200px', height: '200px', border: '1px solid #E3E8EF', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {qrRefreshing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#635BFF' }} />
                  </div>
                )}
                {qrcode ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
                    alt="QR Code WhatsApp"
                    width={192}
                    height={192}
                    style={{ borderRadius: '4px' }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#94A3B8' }} />
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>Gerando QR…</p>
                  </div>
                )}
              </div>

              {/* Instructions + refresh */}
              <div className="space-y-3" style={{ flex: 1 }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6' }}>
                    <strong>1.</strong> Abra o WhatsApp no celular do chip<br />
                    <strong>2.</strong> Vá em <strong>Configurações → Aparelhos conectados</strong><br />
                    <strong>3.</strong> Toque em <strong>Conectar aparelho</strong><br />
                    <strong>4.</strong> Escaneie o QR Code ao lado
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefreshQR}
                    disabled={qrRefreshing}
                    className="flex items-center gap-1.5"
                    style={{ padding: '7px 14px', background: 'white', border: '1px solid #E3E8EF', borderRadius: '6px', cursor: qrRefreshing ? 'not-allowed' : 'pointer', fontSize: '12px', color: '#64748B', fontWeight: 500 }}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${qrRefreshing ? 'animate-spin' : ''}`} />
                    Renovar QR
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Renovando automaticamente a cada 5 segundos. O QR expira em ~60s.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAIRING CODE flow — step 1: phone input */}
        {connectMode === 'pair' && !pairCode && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Informe o número do chip para gerar o código de pareamento:
              </p>
              <button onClick={resetConnect} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-3 items-start">
              <div>
                <input
                  type="tel"
                  placeholder="5544988264275"
                  value={phoneInput}
                  onChange={e => { setPhoneInput(e.target.value); setActionError('') }}
                  style={{ width: '200px', height: '38px', padding: '0 12px', fontSize: '13px', border: '1px solid #E3E8EF', borderRadius: '6px', background: 'white', color: '#3C4257', outline: 'none', fontFamily: 'var(--font-geist-mono)' }}
                  onFocus={e => (e.target.style.borderColor = '#635BFF')}
                  onBlur={e => (e.target.style.borderColor = '#E3E8EF')}
                  onKeyDown={e => { if (e.key === 'Enter') handleConnectPair() }}
                />
                <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  Com código do país: 55 + DDD + número
                </p>
              </div>
              <button
                onClick={handleConnectPair}
                disabled={actionLoading}
                className="flex items-center gap-2"
                style={{ padding: '9px 18px', background: '#635BFF', color: 'white', border: 'none', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, opacity: actionLoading ? 0.7 : 1, flexShrink: 0 }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                Gerar Código
              </button>
            </div>
          </div>
        )}

        {/* PAIRING CODE flow — step 2: show code */}
        {connectMode === 'pair' && pairCode && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: '13px', color: '#64748B' }}>
                Digite este código no WhatsApp do chip:
              </p>
              <button onClick={resetConnect} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {/* Pairing code display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', border: '1.5px solid #E3E8EF', borderRadius: '8px', padding: '12px 20px' }}>
                <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '1.75rem', fontWeight: 700, color: '#1E293B', letterSpacing: '0.15em' }}>
                  {pairCode.length === 8 ? `${pairCode.slice(0, 4)}-${pairCode.slice(4)}` : pairCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(pairCode)}
                className="flex items-center gap-1.5"
                style={{ padding: '8px 14px', background: copied ? '#DCFCE7' : 'white', border: `1px solid ${copied ? '#BBF7D0' : '#E3E8EF'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: copied ? '#15803D' : '#64748B', transition: 'all .2s' }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E3E8EF', borderRadius: '6px', padding: '12px 14px' }}>
              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.6' }}>
                <strong>1.</strong> Abra o WhatsApp no celular do chip<br />
                <strong>2.</strong> Vá em <strong>Configurações → Aparelhos conectados</strong><br />
                <strong>3.</strong> Toque em <strong>Conectar com número de telefone</strong><br />
                <strong>4.</strong> Digite o código acima
              </p>
            </div>

            <div className="flex items-center gap-2 mt-3" style={{ color: '#94A3B8', fontSize: '11px' }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Aguardando o chip escanear o código…
            </div>
          </div>
        )}

        {/* CONECTADO */}
        {status === 'CONECTADO' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0FDF4', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wifi className="h-5 w-5" style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>WhatsApp conectado e pronto para enviar</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-geist-mono)', marginTop: '2px' }}>
                  {jid?.replace('@s.whatsapp.net', '')}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="flex items-center gap-2"
              style={{ padding: '8px 14px', background: 'white', border: '1px solid #FECACA', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: '#DC2626', transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white' }}
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WifiOff className="h-3.5 w-3.5" />}
              Desconectar
            </button>
          </div>
        )}

        {/* AGUARDANDO (polling ativo, sem QR ainda) */}
        {status === 'AGUARDANDO' && connectMode === 'idle' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ color: '#94A3B8', fontSize: '13px' }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Aguardando conexão… (instância criada mas não escaneada)
              <button onClick={handleConnectQR} style={{ marginLeft: '8px', fontSize: '12px', color: '#635BFF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mostrar QR
              </button>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="flex items-center gap-1.5"
              style={{ padding: '6px 12px', background: 'white', border: '1px solid #FECACA', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600, color: '#DC2626' }}
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WifiOff className="h-3.5 w-3.5" />}
              Cancelar
            </button>
          </div>
        )}

        {/* Error message */}
        {actionError && (
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> {actionError}
          </p>
        )}

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: WhatsappStatus }) {
  const map: Record<WhatsappStatus, { label: string; bg: string; color: string; dot: string }> = {
    loading:         { label: 'Verificando…',     bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
    NAO_CONFIGURADO: { label: 'Não configurado',  bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
    AGUARDANDO:      { label: 'Aguardando scan',  bg: '#FEF9C3', color: '#A16207', dot: '#F59E0B' },
    CONECTADO:       { label: 'Conectado',         bg: '#DCFCE7', color: '#16A34A', dot: '#22C55E' },
    ERRO:            { label: 'Erro de conexão',  bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444' },
  }
  const s = map[status]
  return (
    <span className="flex items-center gap-1.5" style={{ padding: '3px 10px', borderRadius: '100px', background: s.bg, fontSize: '11px', fontWeight: 600, color: s.color }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0, ...(status === 'AGUARDANDO' || status === 'loading' ? { animation: 'pulse 2s infinite' } : {}) }} />
      {s.label}
    </span>
  )
}
