import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

const CANAL_CUSTO: Record<string, 'custoWhatsapp' | 'custoSMS' | 'custoEmail'> = {
  WHATSAPP: 'custoWhatsapp',
  SMS:      'custoSMS',
  EMAIL:    'custoEmail',
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

  // Verify survey belongs to this empresa (security)
  const { data: survey } = await admin
    .from('surveys')
    .select('id, empresaId')
    .eq('id', surveyId)
    .single()

  if (!survey || survey.empresaId !== empresaId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { data: empresa } = await admin
    .from('empresas')
    .select('saldo, custoWhatsapp, custoSMS, custoEmail')
    .eq('id', empresaId)
    .single()

  if (!empresa) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const custoCampo = CANAL_CUSTO[canal]
  const custoUnitario: number = empresa[custoCampo] ?? 0
  const custoTotal = custoUnitario * respondentIds.length
  const saldoAtual: number = empresa.saldo ?? 0

  if (saldoAtual < custoTotal) {
    return NextResponse.json(
      { error: 'Saldo insuficiente', saldoAtual, custoTotal },
      { status: 400 }
    )
  }

  // Validate respondents belong to this survey (security)
  const { data: respondentes } = await admin
    .from('survey_respondents')
    .select('id')
    .eq('surveyId', surveyId)
    .in('id', respondentIds)

  const validIds = (respondentes ?? []).map(r => r.id)
  if (validIds.length === 0) {
    return NextResponse.json({ error: 'Nenhum respondente válido' }, { status: 400 })
  }

  // Mark as dispatched
  const { error: updateError } = await admin
    .from('survey_respondents')
    .update({ conviteEnviadoEm: new Date().toISOString() })
    .in('id', validIds)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Debit credits atomically — avoids race condition from read-modify-write
  const custoReal = custoUnitario * validIds.length
  const { error: saldoError } = await admin.rpc('incrementar_saldo', {
    p_empresa_id: empresaId,
    p_valor: -custoReal,
  })

  if (saldoError) {
    return NextResponse.json({ error: saldoError.message }, { status: 500 })
  }

  const novoSaldo = saldoAtual - custoReal

  // Credit transaction
  await admin.from('credit_transactions').insert({
    empresaId,
    tipo:      'CONSUMO',
    canal,
    valor:     -custoReal,
    descricao: `Disparo ${canal} — ${validIds.length} respondente(s)`,
  })

  return NextResponse.json({ dispatched: validIds.length, saldoRestante: novoSaldo })
}
