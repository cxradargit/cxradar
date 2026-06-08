import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

const CANAL_CUSTO: Record<string, 'custoWhatsapp' | 'custoSMS' | 'custoEmail'> = {
  WHATSAPP: 'custoWhatsapp',
  SMS:      'custoSMS',
  EMAIL:    'custoEmail',
}

const EVOLUTION_GO_URL = process.env.EVOLUTION_GO_URL ?? 'http://localhost:4000'

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return '55' + digits
}

async function sendWhatsapp(phone: string, text: string, instanceToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${EVOLUTION_GO_URL}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': instanceToken,
      },
      body: JSON.stringify({
        number:    normalizePhone(phone),
        text,
        formatJid: true,
      }),
    })
    const data = await res.json()
    return data.message === 'success'
  } catch {
    return false
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: surveyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const { canal, respondentIds, mensagem } = body as {
    canal: string
    respondentIds: string[]
    mensagem: string
  }

  if (!canal || !CANAL_CUSTO[canal]) {
    return NextResponse.json({ error: 'Canal inválido' }, { status: 400 })
  }
  if (!Array.isArray(respondentIds) || respondentIds.length === 0) {
    return NextResponse.json({ error: 'Nenhum respondente selecionado' }, { status: 400 })
  }
  if (!mensagem?.includes('{{link_pesquisa}}')) {
    return NextResponse.json({ error: '{{link_pesquisa}} é obrigatório na mensagem' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: usuario } = await admin
    .from('usuarios')
    .select('empresaId')
    .eq('id', user.id)
    .single()

  if (!usuario?.empresaId) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  const { empresaId } = usuario

  const { data: survey } = await admin
    .from('surveys')
    .select('id, empresaId, slug')
    .eq('id', surveyId)
    .single()

  if (!survey || survey.empresaId !== empresaId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { data: empresa } = await admin
    .from('empresas')
    .select('saldo, custoWhatsapp, custoSMS, custoEmail, evolutionGoInstanceToken, evolutionGoConnected')
    .eq('id', empresaId)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  if (canal === 'WHATSAPP' && !empresa.evolutionGoConnected) {
    return NextResponse.json({ error: 'WhatsApp não conectado. Configure a instância no painel admin.' }, { status: 400 })
  }
  if (canal === 'SMS') {
    return NextResponse.json({ error: 'SMS em implementação — contate o suporte para ativar este canal.' }, { status: 400 })
  }
  if (canal === 'EMAIL') {
    return NextResponse.json({ error: 'E-mail em implementação — contate o suporte para ativar este canal.' }, { status: 400 })
  }

  const custoCampo    = CANAL_CUSTO[canal]
  const custoUnitario = empresa[custoCampo] ?? 0
  const custoTotal    = custoUnitario * respondentIds.length
  const saldoAtual    = empresa.saldo ?? 0

  if (saldoAtual < custoTotal) {
    return NextResponse.json(
      { error: 'Saldo insuficiente', saldoAtual, custoTotal },
      { status: 400 }
    )
  }

  const { data: respondentes } = await admin
    .from('survey_respondents')
    .select('id, nome, telefone, token')
    .eq('surveyId', surveyId)
    .in('id', respondentIds)

  const validRespondentes = (respondentes ?? []).filter(r =>
    canal !== 'WHATSAPP' || (r.telefone && r.telefone.replace(/\D/g, '').length >= 10)
  )

  if (validRespondentes.length === 0) {
    return NextResponse.json({ error: 'Nenhum respondente com telefone válido' }, { status: 400 })
  }

  const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cxradar.com.br'
  const validIds  = validRespondentes.map(r => r.id)

  // Send messages
  const resultados = await Promise.allSettled(
    validRespondentes.map(async (r) => {
      const link    = `${baseUrl}/s/${survey.slug}?t=${r.token}`
      const texto   = mensagem
        .replace(/\{\{nome\}\}/g, r.nome ?? '')
        .replace(/\{\{link_pesquisa\}\}/g, link)

      if (canal === 'WHATSAPP') {
        const ok = await sendWhatsapp(r.telefone!, texto, empresa.evolutionGoInstanceToken!)
        return { id: r.id, ok }
      }
      // SMS/EMAIL: placeholder for future implementation
      return { id: r.id, ok: false }
    })
  )

  const enviados = resultados
    .filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{id:string;ok:boolean}>).value.ok)
    .map(r => (r as PromiseFulfilledResult<{id:string;ok:boolean}>).value.id)

  if (enviados.length === 0) {
    return NextResponse.json({ error: 'Falha ao enviar mensagens' }, { status: 500 })
  }

  // Mark as dispatched (only successful sends)
  await admin
    .from('survey_respondents')
    .update({ conviteEnviadoEm: new Date().toISOString() })
    .in('id', enviados)

  // Debit credits for actually sent messages
  const custoReal = custoUnitario * enviados.length
  await admin.rpc('incrementar_saldo', {
    p_empresa_id: empresaId,
    p_valor: -custoReal,
  })

  await admin.from('credit_transactions').insert({
    empresaId,
    tipo:      'CONSUMO',
    canal,
    valor:     -custoReal,
    descricao: `Disparo ${canal} — ${enviados.length} respondente(s)`,
  })

  const novoSaldo = saldoAtual - custoReal

  return NextResponse.json({
    dispatched:    enviados.length,
    failed:        validIds.length - enviados.length,
    saldoRestante: novoSaldo,
  })
}
